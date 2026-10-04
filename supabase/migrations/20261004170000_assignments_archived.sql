-- Archiving assignments.
--
-- The teacher dashboard has archived and restored assignments by setting
-- `archived`, but the column never existed, so every archive was rejected and
-- the teacher saw "Check your connection". This adds it.
--
-- An archived assignment is one the teacher has finished with, so students no
-- longer see it (or its badge, or an "overdue" label). Class-code students get
-- their list from get_student_assignments, which now skips archived rows;
-- signed-in students read the table directly and the client filters them out.
-- The teacher still sees them under "Archived assignments" and can restore.

alter table public.assignments
  add column if not exists archived boolean not null default false;

-- Body unchanged from production apart from "and not a.archived".
create or replace function public.get_student_assignments(p_student_id text, p_class_code text, p_student_code text DEFAULT NULL::text, p_name text DEFAULT NULL::text)
 RETURNS SETOF json
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public', 'pg_temp'
AS $function$
declare
  v_class_id uuid;
  v_student public.students%rowtype;
  v_code text := upper(regexp_replace(btrim(coalesce(p_student_code, '')), '[^A-Z0-9]', '', 'g'));
  v_name text := left(btrim(coalesce(p_name, '')), 80);
  v_has_codes boolean;
begin
  select c.id into v_class_id from public.classes c
  where upper(c.code) = upper(btrim(coalesce(p_class_code, ''))) limit 1;
  if v_class_id is null then return; end if;
  select s.* into v_student from public.students s
  where s.id::text = btrim(coalesce(p_student_id, '')) and s.class_id = v_class_id limit 1;
  if not found then return; end if;
  select exists (select 1 from public.student_access_codes ac where ac.class_id=v_class_id and ac.active) into v_has_codes;
  if auth.uid() is not null and v_student.auth_user_id = auth.uid() then
    null;
  elsif length(v_code) >= 8 and exists (
    select 1 from public.student_access_codes ac
    where ac.class_id=v_class_id and ac.student_id=v_student.id and ac.active
      and ac.code_hash=encode(extensions.digest(convert_to(v_code,'UTF8'),'sha256'::text),'hex')
  ) then
    null;
  elsif not v_has_codes and length(v_name)>0 and lower(v_student.name)=lower(v_name) then
    null;
  else return;
  end if;
  return query select to_json(a) from public.assignments a where a.class_id=v_class_id and not a.archived order by a.due_date asc,a.created_at asc;
end;
$function$;
