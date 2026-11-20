-- Close name-only sign-in in classes made before private student codes.
--
-- In a class with no active student code, anyone who knew the class code and
-- a student's name could sign in as that student and read their answers
-- (join_class_as_student, get_student_by_name_and_code, get_linked_responses
-- and the name rung of the identity ladder in the league, friends and
-- assignment functions). Every one of those paths, and the anonymous
-- response-insert policy, is already refused once a class has an active code
-- (class_uses_student_codes).
--
-- So rather than rewrite each function, give every such class one active
-- "lock" code. Its hash is random bytes, not the hash of any code, so it can
-- never be claimed. Students in these classes sign in with a private code
-- from then on: the teacher uses Class tools > Migrate existing students,
-- which issues a code to each existing student and keeps their history.

insert into public.student_access_codes (class_id, code_hash, active)
select c.id, 'lock-' || encode(extensions.gen_random_bytes(32), 'hex'), true
from public.classes c
where not exists (
  select 1 from public.student_access_codes ac
  where ac.class_id = c.id and ac.active
);
