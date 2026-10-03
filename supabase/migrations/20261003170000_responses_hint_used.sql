-- Record when a Practice answer was given after a hint.
--
-- Practice offers "Rule out one option" before answering. `is_correct` keeps
-- meaning what the student actually chose; `hint_used` says they had help.
-- Anything that credits an answer (accuracy, XP) treats a hinted correct
-- answer as not credited, and a hinted correct first attempt earns 5 XP
-- instead of 10. A hinted wrong answer is still a wrong answer, so
-- misconception evidence is unchanged.
--
-- Coupled to the client: it sends p_hint_used only when a hint was used, so
-- unhinted answers keep working before and after this migration, but hinted
-- ones need it applied first.

alter table public.responses
  add column if not exists hint_used boolean not null default false;

-- ---------------------------------------------------------------------------
-- Class-code students
-- ---------------------------------------------------------------------------
create or replace function public.record_student_response_with_code(
  p_student_id text,
  p_class_code text,
  p_student_code text,
  p_question_id text,
  p_bank text,
  p_subject text,
  p_selected_option text,
  p_is_correct boolean,
  p_misconception_tag text,
  p_spec_point text,
  p_reforge_attempted boolean,
  p_reforge_correct boolean,
  p_assignment_id uuid,
  p_hint_used boolean
)
returns jsonb
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_class_id uuid;
  v_response_id uuid;
  v_code text := upper(regexp_replace(btrim(coalesce(p_student_code, '')), '[^A-Z0-9]', '', 'g'));
begin
  select c.id into v_class_id from public.classes c
  where upper(c.code)=upper(btrim(coalesce(p_class_code,''))) limit 1;
  if v_class_id is null or length(v_code)<8 then
    return jsonb_build_object('allowed',false,'reason','invalid_session');
  end if;
  if not exists (
    select 1 from public.students s join public.student_access_codes ac on ac.student_id=s.id
    where s.id::text=btrim(coalesce(p_student_id,'')) and s.class_id=v_class_id
      and ac.class_id=v_class_id and ac.active
      and ac.code_hash=encode(extensions.digest(convert_to(v_code,'UTF8'),'sha256'::text),'hex')
  ) then
    return jsonb_build_object('allowed',false,'reason','invalid_session');
  end if;
  if p_assignment_id is not null and not exists (
    select 1 from public.assignments a
    where a.id=p_assignment_id and a.class_id=v_class_id
  ) then
    return jsonb_build_object('allowed',false,'reason','invalid_assignment');
  end if;
  insert into public.responses(student_id,class_id,question_id,bank,subject,selected_option,is_correct,misconception_tag,spec_point,reforge_attempted,reforge_correct,assignment_id,hint_used)
  values(p_student_id::uuid,v_class_id,p_question_id,p_bank,p_subject,p_selected_option,p_is_correct,p_misconception_tag,p_spec_point,coalesce(p_reforge_attempted,false),p_reforge_correct,p_assignment_id,coalesce(p_hint_used,false))
  returning id into v_response_id;
  return jsonb_build_object('allowed',true,'id',v_response_id);
end;
$$;

-- The 13-argument form becomes a wrapper so there is one insert path.
create or replace function public.record_student_response_with_code(
  p_student_id text,
  p_class_code text,
  p_student_code text,
  p_question_id text,
  p_bank text,
  p_subject text,
  p_selected_option text,
  p_is_correct boolean,
  p_misconception_tag text,
  p_spec_point text,
  p_reforge_attempted boolean,
  p_reforge_correct boolean,
  p_assignment_id uuid
)
returns jsonb
language sql
security definer
set search_path = public, pg_temp
as $$
  select public.record_student_response_with_code(
    p_student_id,p_class_code,p_student_code,p_question_id,p_bank,p_subject,
    p_selected_option,p_is_correct,p_misconception_tag,p_spec_point,
    p_reforge_attempted,p_reforge_correct,p_assignment_id,false
  );
$$;

revoke all on function public.record_student_response_with_code(text,text,text,text,text,text,text,boolean,text,text,boolean,boolean,uuid,boolean) from public;
grant execute on function public.record_student_response_with_code(text,text,text,text,text,text,text,boolean,text,text,boolean,boolean,uuid,boolean) to anon, authenticated;
revoke all on function public.record_student_response_with_code(text,text,text,text,text,text,text,boolean,text,text,boolean,boolean,uuid) from public;
grant execute on function public.record_student_response_with_code(text,text,text,text,text,text,text,boolean,text,text,boolean,boolean,uuid) to anon, authenticated;

-- ---------------------------------------------------------------------------
-- Free students
-- ---------------------------------------------------------------------------
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
  used_count integer;
  inserted_id uuid;
begin
  if p_student_id is null or p_free_token is null or length(btrim(p_free_token)) = 0 then
    return jsonb_build_object('allowed', false, 'reason', 'invalid_session');
  end if;
  if p_assignment_id is not null then
    return jsonb_build_object('allowed', false, 'reason', 'invalid_assignment');
  end if;
  if not exists (select 1 from public.students s where s.id::text=p_student_id and s.free_token=p_free_token and s.class_id is null) then
    return jsonb_build_object('allowed', false, 'reason', 'invalid_session');
  end if;
  select count(*) into used_count from public.responses r
  where r.student_id::text=p_student_id and r.class_id is null
    and coalesce(r.reforge_attempted,false)=false and r.created_at >= date_trunc('day',now());
  if used_count >= 10 and not coalesce(p_reforge_attempted,false) then
    return jsonb_build_object('allowed',false,'reason','daily_limit','used',used_count);
  end if;
  insert into public.responses(student_id,class_id,question_id,bank,subject,selected_option,is_correct,misconception_tag,reforge_attempted,reforge_correct,assignment_id,hint_used)
  values(p_student_id::uuid,null,p_question_id,p_bank,p_subject,p_selected_option,p_is_correct,p_misconception_tag,coalesce(p_reforge_attempted,false),p_reforge_correct,null,coalesce(p_hint_used,false))
  returning id into inserted_id;
  return jsonb_build_object('allowed',true,'id',inserted_id,'used',used_count+1);
end;
$function$;

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
  p_assignment_id uuid
)
returns jsonb
language sql
security definer
set search_path to 'public', 'pg_temp'
as $$
  select public.record_free_response(
    p_student_id,p_free_token,p_question_id,p_bank,p_subject,p_selected_option,
    p_is_correct,p_misconception_tag,p_reforge_attempted,p_reforge_correct,p_assignment_id,false
  );
$$;

revoke all on function public.record_free_response(text,text,text,text,text,text,boolean,text,boolean,boolean,uuid,boolean) from public;
grant execute on function public.record_free_response(text,text,text,text,text,text,boolean,text,boolean,boolean,uuid,boolean) to anon, authenticated;
revoke all on function public.record_free_response(text,text,text,text,text,text,boolean,text,boolean,boolean,uuid) from public;
grant execute on function public.record_free_response(text,text,text,text,text,text,boolean,text,boolean,boolean,uuid) to anon, authenticated;

-- ---------------------------------------------------------------------------
-- XP and accuracy: a hinted correct first attempt earns 5 XP and is not
-- counted as correct. Bodies are otherwise unchanged from production.
-- ---------------------------------------------------------------------------
create or replace function public.get_class_weekly_league(p_student_id text, p_class_code text, p_student_code text DEFAULT NULL::text, p_name text DEFAULT NULL::text)
 RETURNS json
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
 SET search_path TO 'public', 'pg_temp'
AS $function$
declare
  v_class public.classes%rowtype;
  v_student public.students%rowtype;
  v_code text := upper(regexp_replace(btrim(coalesce(p_student_code, '')), '[^A-Z0-9]', '', 'g'));
  v_name text := left(btrim(coalesce(p_name, '')), 80);
  v_has_codes boolean;
  v_week_start timestamptz := date_trunc('week', now() at time zone 'Europe/London') at time zone 'Europe/London';
  v_result json;
begin
  select c.* into v_class from public.classes c
  where upper(c.code) = upper(btrim(coalesce(p_class_code, ''))) limit 1;
  if not found then return null; end if;

  select s.* into v_student from public.students s
  where s.id::text = btrim(coalesce(p_student_id, '')) and s.class_id = v_class.id limit 1;
  if not found then return null; end if;

  -- Same identity ladder as get_student_assignments: signed-in owner, a valid
  -- private student code, or (only in a class that has no codes) the name.
  select exists (select 1 from public.student_access_codes ac where ac.class_id = v_class.id and ac.active) into v_has_codes;
  if auth.uid() is not null and v_student.auth_user_id = auth.uid() then
    null;
  elsif length(v_code) >= 8 and exists (
    select 1 from public.student_access_codes ac
    where ac.class_id = v_class.id and ac.student_id = v_student.id and ac.active
      and ac.code_hash = encode(extensions.digest(convert_to(v_code, 'UTF8'), 'sha256'::text), 'hex')
  ) then
    null;
  elsif not v_has_codes and length(v_name) > 0 and lower(v_student.name) = lower(v_name) then
    null;
  else
    return null;
  end if;

  if not v_class.league_enabled then
    return json_build_object('enabled', false);
  end if;

  with weekly as (
    select s.id,
           coalesce(nullif(btrim(s.display_name), ''), nullif(btrim(s.name), ''), 'Student') as full_name,
           coalesce(sum(case
             when r.question_id like '%-ANVIL' then case when r.is_correct then 30 else 0 end
             when r.question_id like '%-CRU' and r.is_correct then 30
             when r.reforge_attempted and r.reforge_correct then 20
             when r.is_correct and not coalesce(r.reforge_attempted, false) then case when r.hint_used then 5 else 10 end
             else 0 end), 0)::int as xp
    from public.students s
    left join public.responses r on r.student_id = s.id and r.created_at >= v_week_start
    where s.class_id = v_class.id
    group by s.id, s.display_name, s.name
  ),
  ranked as (
    select id, xp,
           -- "Jess Best" -> "Jess B."; a single word is left as it is.
           case when array_length(parts, 1) > 1
                then parts[1] || ' ' || upper(left(parts[array_length(parts, 1)], 1)) || '.'
                else parts[1] end as short_name,
           rank() over (order by xp desc) as position,
           row_number() over (order by xp desc, full_name) as seq
    from (select *, regexp_split_to_array(btrim(full_name), '\s+') as parts from weekly) w
    where xp > 0
  ),
  me as (select position, seq, xp from ranked where id = v_student.id)
  select json_build_object(
    'enabled', true,
    'week_start', v_week_start,
    'ranked', (select count(*) from ranked),
    'you', (select json_build_object('position', me.position, 'xp', me.xp) from me),
    'rows', coalesce((
      select json_agg(json_build_object('seq', r.seq, 'position', r.position, 'name', r.short_name, 'xp', r.xp, 'is_you', r.id = v_student.id) order by r.seq)
      from ranked r
      where r.seq <= 3
         or exists (select 1 from me where abs(r.seq - me.seq) <= 2)
    ), '[]'::json)
  ) into v_result;

  return v_result;
end;
$function$;

create or replace function public.get_class_friends_unchecked(p_student_id text, p_class_code text, p_student_code text DEFAULT NULL::text, p_name text DEFAULT NULL::text)
 RETURNS json
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
 SET search_path TO 'public', 'pg_temp'
AS $function$
declare
  v_me public.students;
  v_enabled boolean;
  v_week_start timestamptz := date_trunc('week', now() at time zone 'Europe/London') at time zone 'Europe/London';
  v_today date := (now() at time zone 'Europe/London')::date;
begin
  v_me := public.forge_verify_class_student(p_student_id, p_class_code, p_student_code, p_name);
  if v_me.id is null then return null; end if;

  select c.friends_enabled into v_enabled from public.classes c where c.id = v_me.class_id;
  if not coalesce(v_enabled, false) then
    return json_build_object('enabled', false);
  end if;

  return (
    with links as (
      select f.*,
             case when f.requester_id = v_me.id then f.addressee_id else f.requester_id end as other_id
      from public.student_friendships f
      where f.class_id = v_me.class_id and v_me.id in (f.requester_id, f.addressee_id)
    ),
    classmates as (
      select s.id, coalesce(nullif(btrim(s.display_name), ''), nullif(btrim(s.name), ''), 'Student') as name
      from public.students s
      where s.class_id = v_me.class_id and s.id <> v_me.id
    ),
    friend_stats as (
      select l.other_id as id,
             coalesce(sum(case
               when r.created_at < v_week_start then 0
               when r.question_id like '%-ANVIL' then case when r.is_correct then 30 else 0 end
               when r.question_id like '%-CRU' and r.is_correct then 30
               when r.reforge_attempted and r.reforge_correct then 20
               when r.is_correct and not coalesce(r.reforge_attempted, false) then case when r.hint_used then 5 else 10 end
               else 0 end), 0)::int as xp_week,
             coalesce(sum(case
               when r.question_id like '%-ANVIL' then case when r.is_correct then 30 else 0 end
               when r.question_id like '%-CRU' and r.is_correct then 30
               when r.reforge_attempted and r.reforge_correct then 20
               when r.is_correct and not coalesce(r.reforge_attempted, false) then case when r.hint_used then 5 else 10 end
               else 0 end), 0)::int as xp_total,
             count(r.id) filter (where not coalesce(r.reforge_attempted, false))::int as answered,
             count(r.id) filter (where not coalesce(r.reforge_attempted, false) and r.is_correct and not r.hint_used)::int as correct
      from links l
      left join public.responses r on r.student_id = l.other_id
      where l.status = 'accepted'
      group by l.other_id
    ),
    friend_days as (
      select distinct l.other_id as id, (r.created_at at time zone 'Europe/London')::date as d
      from links l join public.responses r on r.student_id = l.other_id
      where l.status = 'accepted'
    ),
    runs as (
      select id, d, d - (row_number() over (partition by id order by d))::int as grp from friend_days
    ),
    streaks as (
      select id, count(*)::int as streak
      from (
        select id, grp, max(d) over (partition by id, grp) as run_end, max(d) over (partition by id) as last_day
        from runs
      ) x
      where run_end = last_day and last_day >= v_today - 1
      group by id
    )
    select json_build_object(
      'enabled', true,
      'friends', coalesce((
        select json_agg(json_build_object(
          'student_id', c.id, 'name', c.name,
          'xp_week', coalesce(fs.xp_week, 0), 'xp_total', coalesce(fs.xp_total, 0),
          'answered', coalesce(fs.answered, 0),
          'accuracy', case when coalesce(fs.answered, 0) > 0 then round(fs.correct * 100.0 / fs.answered) end,
          'streak', coalesce(st.streak, 0)
        ) order by coalesce(fs.xp_week, 0) desc, c.name)
        from links l join classmates c on c.id = l.other_id
        left join friend_stats fs on fs.id = c.id
        left join streaks st on st.id = c.id
        where l.status = 'accepted'), '[]'::json),
      'incoming', coalesce((
        select json_agg(json_build_object('student_id', c.id, 'name', c.name) order by l.created_at)
        from links l join classmates c on c.id = l.other_id
        where l.status = 'pending' and l.addressee_id = v_me.id), '[]'::json),
      'outgoing', coalesce((
        select json_agg(json_build_object('student_id', c.id, 'name', c.name) order by c.name)
        from links l join classmates c on c.id = l.other_id
        where l.status = 'pending' and l.requester_id = v_me.id), '[]'::json),
      'classmates', coalesce((
        select json_agg(json_build_object('student_id', c.id, 'name', c.name) order by c.name)
        from classmates c
        where not exists (select 1 from links l where l.other_id = c.id)), '[]'::json)
    )
  );
end;
$function$;

-- School Overview computes accuracy client-side, so it needs the flag.
create or replace function public.get_school_overview()
 RETURNS jsonb
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public', 'auth'
AS $function$
  with caller_school as (
    select school_key, school_name
    from public.teacher_profiles
    where user_id = auth.uid()
  ), scoped_classes as (
    select c.* from public.classes c
    where coalesce(c.school_key, lower(regexp_replace(btrim(c.school), '\s+', ' ', 'g')))
          in (select school_key from caller_school)
  ), scoped_students as (
    select s.* from public.students s where s.class_id in (select id from scoped_classes)
  ), scoped_responses as (
    select r.* from public.responses r where r.class_id in (select id from scoped_classes)
  )
  select case
    when auth.uid() is null then jsonb_build_object('authorized', false, 'reason', 'not_signed_in')
    when not exists (select 1 from caller_school) then jsonb_build_object('authorized', false, 'reason', 'no_school')
    else jsonb_build_object(
      'authorized', true,
      'schools', (select coalesce(jsonb_agg(distinct school_key), '[]'::jsonb) from caller_school),
      'school_name', (select school_name from caller_school limit 1),
      'classes', (select coalesce(jsonb_agg(jsonb_build_object('id', id, 'name', name, 'code', code, 'subject', subject, 'teacher_name', teacher_name, 'created_at', created_at)), '[]'::jsonb) from scoped_classes),
      'students', (select coalesce(jsonb_agg(jsonb_build_object('id', id, 'class_id', class_id, 'extra_time', extra_time, 'name', (select upper(string_agg(left(w, 1), '.')) from unnest(string_to_array(trim(coalesce(scoped_students.name, '')), ' ')) as w where length(w) > 0) || '.')), '[]'::jsonb) from scoped_students),
      'responses', (select coalesce(jsonb_agg(jsonb_build_object('student_id', student_id, 'class_id', class_id, 'subject', subject, 'is_correct', is_correct, 'hint_used', hint_used, 'misconception_tag', misconception_tag, 'reforge_attempted', reforge_attempted, 'reforge_correct', reforge_correct, 'created_at', created_at)), '[]'::jsonb) from scoped_responses)
    )
  end;
$function$;
