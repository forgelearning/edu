-- Code generation is a teacher-only operation. Student verification/read
-- functions are intentionally public HTTP endpoints because students do not
-- have email accounts; the code itself is their credential.
revoke execute on function public.generate_student_access_codes(uuid, integer) from public, anon;
grant execute on function public.generate_student_access_codes(uuid, integer) to authenticated;
