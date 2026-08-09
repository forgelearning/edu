-- Pin the search path for the maintenance function so object resolution cannot
-- be changed by a caller or by a future role-level search_path setting.

create or replace function public.backfill_response_class_ids()
returns void
language plpgsql
set search_path = public, pg_temp
as $function$
begin
  update public.responses r
  set class_id = c.id
  from public.students s
  join public.classes c on c.subject = r.subject
  where r.student_id = s.id
    and r.class_id is null
    and s.auth_user_id is not null
    and c.id in (
      select class_id
      from public.students
      where auth_user_id = s.auth_user_id
        and class_id is not null
    );
end;
$function$;
