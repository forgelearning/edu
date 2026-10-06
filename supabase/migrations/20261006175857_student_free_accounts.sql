-- A free student may save an existing guest row to a verified email account.
-- Possession of the guest token is required for the first claim. A signed-in
-- owner can then recover the token on another device without knowing it.
create or replace function public.claim_free_student(p_student_id text, p_free_token text)
returns jsonb language plpgsql security definer set search_path = public, pg_temp
as $$
declare v_id uuid;
begin
  if auth.uid() is null then return jsonb_build_object('linked', false); end if;
  if length(btrim(coalesce(p_free_token, ''))) < 16 then return jsonb_build_object('linked', false); end if;
  update public.students s set auth_user_id = auth.uid()
  where s.id::text = p_student_id and s.class_id is null
    and s.free_token = p_free_token
    and (s.auth_user_id is null or s.auth_user_id = auth.uid())
  returning s.id into v_id;
  return jsonb_build_object('linked', v_id is not null);
end;
$$;
revoke all on function public.claim_free_student(text, text) from public, anon;
grant execute on function public.claim_free_student(text, text) to authenticated;

create or replace function public.get_my_free_student()
returns setof json language plpgsql security definer set search_path = public, pg_temp
as $$
declare v_row public.students%rowtype;
begin
  if auth.uid() is null then return; end if;
  select * into v_row from public.students s
  where s.auth_user_id = auth.uid() and s.class_id is null and s.free_token is not null
  order by (select count(*) from public.responses r where r.student_id = s.id) desc, s.id
  limit 1;
  if not found then
    insert into public.students(name, class_id, free_token, auth_user_id)
    values('Student', null, encode(extensions.gen_random_bytes(24), 'hex'), auth.uid())
    returning * into v_row;
  end if;
  return query select to_json(row) from (
    select v_row.id::text as student_id, v_row.name as student_name,
           v_row.free_token as free_token
  ) row;
end;
$$;
revoke all on function public.get_my_free_student() from public, anon;
grant execute on function public.get_my_free_student() to authenticated;

-- Account-owned free rows and their answers are readable across devices.
create policy "Free account reads its own student rows"
  on public.students for select to authenticated
  using (class_id is null and auth_user_id = (select auth.uid()));
create policy "Free account reads its own responses"
  on public.responses for select to authenticated
  using (exists (
    select 1 from public.students s
    where s.id = student_id and s.class_id is null
      and s.auth_user_id = (select auth.uid())
  ));

-- Free practice has ten-question sets but no timed pause. The UK-day cap
-- remains authoritative and is shared across all free rows on an account.
create or replace function public.record_free_response(
  p_student_id text,
  p_free_token text,
  p_question_id text,
  p_bank text,
  p_subject text,
  p_selected_option text,
  p_is_correct boolean,
  p_misconception_tag text,
  p_reforge_attempted boolean,
  p_reforge_correct boolean,
  p_assignment_id uuid,
  p_hint_used boolean
)
returns jsonb
language plpgsql
security definer
set search_path to 'public', 'pg_temp'
as $function$
declare
  c_daily_cap constant integer := 40;
  v_reforge boolean := coalesce(p_reforge_attempted, false);
  v_local_day timestamp := date_trunc('day', now() at time zone 'Europe/London');
  v_day_start timestamptz := v_local_day at time zone 'Europe/London';
  v_next_midnight timestamptz := (v_local_day + interval '1 day') at time zone 'Europe/London';
  v_owner uuid;
  day_count integer := 0;
  inserted_id uuid;
begin
  if p_student_id is null or p_free_token is null or length(btrim(p_free_token)) = 0 then
    return jsonb_build_object('allowed', false, 'reason', 'invalid_session');
  end if;
  if p_assignment_id is not null then
    return jsonb_build_object('allowed', false, 'reason', 'invalid_assignment');
  end if;

  select s.auth_user_id into v_owner
  from public.students s
  where s.id::text = p_student_id and s.free_token = p_free_token and s.class_id is null
  for update;
  if not found then
    return jsonb_build_object('allowed', false, 'reason', 'invalid_session');
  end if;

  if not v_reforge then
    if v_owner is not null then
      perform pg_advisory_xact_lock(hashtextextended(v_owner::text, 0));
    end if;
    select count(*) into day_count from public.responses r
    join public.students s on s.id = r.student_id
    where s.class_id is null
      and ((v_owner is not null and s.auth_user_id = v_owner)
           or (v_owner is null and s.id::text = p_student_id))
      and coalesce(r.reforge_attempted, false) = false
      and r.created_at >= v_day_start;

    if day_count >= c_daily_cap then
      update public.students set free_cooldown_until = v_next_midnight where id::text = p_student_id;
      return jsonb_build_object('allowed', false, 'reason', 'daily_cap',
        'retry_at', v_next_midnight, 'today', day_count,
        'daily_limit', c_daily_cap, 'daily_cap', true);
    end if;
  end if;

  insert into public.responses(student_id,class_id,question_id,bank,subject,selected_option,is_correct,misconception_tag,reforge_attempted,reforge_correct,assignment_id,hint_used)
  values(p_student_id::uuid,null,p_question_id,p_bank,p_subject,p_selected_option,p_is_correct,p_misconception_tag,v_reforge,p_reforge_correct,null,coalesce(p_hint_used,false))
  returning id into inserted_id;

  if not v_reforge then
    day_count := day_count + 1;
    if day_count >= c_daily_cap then
      update public.students set free_cooldown_until = v_next_midnight where id::text = p_student_id;
      return jsonb_build_object('allowed', true, 'id', inserted_id,
        'today', day_count, 'daily_limit', c_daily_cap,
        'cooldown_until', v_next_midnight, 'daily_cap', true);
    end if;
  end if;

  return jsonb_build_object('allowed', true, 'id', inserted_id,
    'today', day_count, 'daily_limit', c_daily_cap);
end;
$function$;

revoke all on function public.record_free_response(text,text,text,text,text,text,boolean,text,boolean,boolean,uuid,boolean) from public;
grant execute on function public.record_free_response(text,text,text,text,text,text,boolean,text,boolean,boolean,uuid,boolean) to anon, authenticated;
