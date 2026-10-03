-- The original friend RPCs accepted a name as proof of identity in classes
-- without private student codes. That is sufficient for legacy practice, but
-- it cannot establish consent to share progress with a friend: a classmate
-- who knows the name can accept a request as that student. Keep those RPCs
-- private and expose guarded wrappers only after every student has an active
-- individual code. No class setting or friendship row is changed here.

begin;

alter function public.get_class_friends(text, text, text, text)
  rename to get_class_friends_unchecked;
alter function public.send_friend_request(text, text, text, text, text)
  rename to send_friend_request_unchecked;
alter function public.respond_friend_request(text, text, text, text, text, boolean)
  rename to respond_friend_request_unchecked;

-- ALTER FUNCTION preserves the old EXECUTE grants. Remove them before the
-- guarded names are exposed, including the implicit PUBLIC grant.
revoke all on function public.get_class_friends_unchecked(text, text, text, text)
  from public, anon, authenticated;
revoke all on function public.send_friend_request_unchecked(text, text, text, text, text)
  from public, anon, authenticated;
revoke all on function public.respond_friend_request_unchecked(text, text, text, text, text, boolean)
  from public, anon, authenticated;

create function public.forge_class_friends_ready(p_class_id uuid)
returns boolean
language sql
stable
security definer
set search_path to 'public', 'pg_temp'
as $function$
  select not exists (
    select 1 from public.students s
    where s.class_id = p_class_id
      and not exists (
        select 1 from public.student_access_codes ac
        where ac.class_id = p_class_id and ac.student_id = s.id and ac.active
      )
  );
$function$;
revoke all on function public.forge_class_friends_ready(uuid)
  from public, anon, authenticated;

create function public.get_class_friends(
  p_student_id text,
  p_class_code text,
  p_student_code text default null,
  p_name text default null
)
returns json
language plpgsql
stable
security definer
set search_path to 'public', 'pg_temp'
as $function$
declare
  v_me public.students;
begin
  v_me := public.forge_verify_class_student(p_student_id, p_class_code, p_student_code, p_name);
  if v_me.id is null then return null; end if;
  if not exists (select 1 from public.classes c where c.id = v_me.class_id and c.friends_enabled) then
    return json_build_object('enabled', false);
  end if;
  if not public.forge_class_friends_ready(v_me.class_id) then
    return json_build_object('enabled', false, 'reason', 'codes_required');
  end if;
  return public.get_class_friends_unchecked(p_student_id, p_class_code, p_student_code, p_name);
end;
$function$;

create function public.send_friend_request(
  p_student_id text,
  p_class_code text,
  p_student_code text,
  p_name text,
  p_target_student_id text
)
returns text
language plpgsql
security definer
set search_path to 'public', 'pg_temp'
as $function$
declare
  v_me public.students;
begin
  v_me := public.forge_verify_class_student(p_student_id, p_class_code, p_student_code, p_name);
  if v_me.id is null then return 'not_allowed'; end if;
  if not exists (select 1 from public.classes c where c.id = v_me.class_id and c.friends_enabled) then
    return 'disabled';
  end if;
  if not public.forge_class_friends_ready(v_me.class_id) then return 'codes_required'; end if;
  return public.send_friend_request_unchecked(p_student_id, p_class_code, p_student_code, p_name, p_target_student_id);
end;
$function$;

create function public.respond_friend_request(
  p_student_id text,
  p_class_code text,
  p_student_code text,
  p_name text,
  p_other_student_id text,
  p_accept boolean
)
returns text
language plpgsql
security definer
set search_path to 'public', 'pg_temp'
as $function$
declare
  v_me public.students;
begin
  v_me := public.forge_verify_class_student(p_student_id, p_class_code, p_student_code, p_name);
  if v_me.id is null then return 'not_allowed'; end if;
  if not exists (select 1 from public.classes c where c.id = v_me.class_id and c.friends_enabled) then
    return 'disabled';
  end if;
  if not public.forge_class_friends_ready(v_me.class_id) then return 'codes_required'; end if;
  return public.respond_friend_request_unchecked(p_student_id, p_class_code, p_student_code, p_name, p_other_student_id, p_accept);
end;
$function$;

revoke all on function public.get_class_friends(text, text, text, text) from public;
revoke all on function public.send_friend_request(text, text, text, text, text) from public;
revoke all on function public.respond_friend_request(text, text, text, text, text, boolean) from public;
grant execute on function public.get_class_friends(text, text, text, text) to anon, authenticated;
grant execute on function public.send_friend_request(text, text, text, text, text) to anon, authenticated;
grant execute on function public.respond_friend_request(text, text, text, text, text, boolean) to anon, authenticated;

commit;
