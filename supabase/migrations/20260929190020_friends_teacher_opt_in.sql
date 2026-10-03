-- A teacher must choose to enable class friends. The first migration created
-- this column ON by default; existing and future classes now start OFF.
-- There are no friendship rows at rollout, and no student records change.
begin;

alter table public.classes alter column friends_enabled set default false;
update public.classes set friends_enabled = false where friends_enabled;
comment on column public.classes.friends_enabled is
  'Teacher opt-in for same-class friends; students share progress only after a request is accepted.';

-- Sending a request must never implicitly accept an incoming request. The
-- unchecked implementation does that when the target asked first, bypassing
-- the explicit Accept choice and its just-in-time sharing explanation.
create or replace function public.send_friend_request(
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
  if exists (
    select 1 from public.student_friendships f
    where f.class_id = v_me.class_id and f.status = 'pending'
      and f.addressee_id = v_me.id
      and f.requester_id::text = btrim(coalesce(p_target_student_id, ''))
  ) then
    return 'request_waiting_for_you';
  end if;
  return public.send_friend_request_unchecked(p_student_id, p_class_code, p_student_code, p_name, p_target_student_id);
end;
$function$;

commit;
