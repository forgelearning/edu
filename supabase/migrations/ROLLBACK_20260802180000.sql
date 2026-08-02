-- Rollback for the 20260802 1800xx security migrations.
--
-- Run this only to restore the previous behaviour in an emergency. It puts
-- back the unscoped, anon-callable school overview and the API-role grants on
-- teacher_invite_codes — that is, it reintroduces the exposures those
-- migrations closed. Prefer fixing forward.

-- 1. Restore the original unscoped get_school_overview().
create or replace function public.get_school_overview()
returns jsonb
language sql
security definer
set search_path to 'public'
as $function$
  select jsonb_build_object(
    'classes', (
      select coalesce(jsonb_agg(jsonb_build_object(
        'id', id, 'name', name, 'code', code, 'subject', subject, 'created_at', created_at
      )), '[]'::jsonb)
      from public.classes
    ),
    'students', (
      select coalesce(jsonb_agg(jsonb_build_object(
        'id', id,
        'class_id', class_id,
        'name', (
          select upper(string_agg(left(w, 1), '.'))
          from unnest(string_to_array(trim(coalesce(students.name, '')), ' ')) as w
          where length(w) > 0
        ) || '.'
      )), '[]'::jsonb)
      from public.students
    ),
    'responses', (
      select coalesce(jsonb_agg(jsonb_build_object(
        'student_id', student_id, 'class_id', class_id, 'subject', subject,
        'is_correct', is_correct, 'misconception_tag', misconception_tag,
        'reforge_attempted', reforge_attempted, 'reforge_correct', reforge_correct,
        'created_at', created_at
      )), '[]'::jsonb)
      from public.responses
    )
  );
$function$;

grant execute on function public.get_school_overview() to anon;
grant execute on function public.get_school_overview() to authenticated;

-- 2. Restore EXECUTE on rls_auto_enable().
grant execute on function public.rls_auto_enable() to anon;
grant execute on function public.rls_auto_enable() to authenticated;

-- 3. Restore table grants on teacher_invite_codes.
--    Note: RLS on that table has no policies, so these grants were inert
--    unless RLS was also disabled.
grant select, insert, update, delete, truncate, references, trigger
  on table public.teacher_invite_codes to anon;
grant select, insert, update, delete, truncate, references, trigger
  on table public.teacher_invite_codes to authenticated;
