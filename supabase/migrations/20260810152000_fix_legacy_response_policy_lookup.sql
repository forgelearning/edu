-- Keep the legacy INSERT compatibility policy from requiring anon SELECT on
-- the private student_access_codes table.

create or replace function public.class_uses_student_codes(p_class_id uuid)
returns boolean
language sql
security definer
set search_path = public, pg_temp
as $$
  select exists (
    select 1 from public.student_access_codes ac
    where ac.class_id = p_class_id and ac.active
  );
$$;

revoke all on function public.class_uses_student_codes(uuid) from public;
grant execute on function public.class_uses_student_codes(uuid) to anon, authenticated;

drop policy if exists "Legacy anonymous students can log responses" on public.responses;
create policy "Legacy anonymous students can log responses"
  on public.responses
  for insert
  to anon
  with check (class_id is not null and not public.class_uses_student_codes(class_id));
