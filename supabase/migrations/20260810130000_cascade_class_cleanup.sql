-- A class is the ownership boundary for its assignments, students, codes,
-- and responses. Deleting a class must not require unsafe manual child-row
-- deletion or leave orphaned student work behind.

alter table public.assignments
  drop constraint if exists assignments_class_id_fkey,
  add constraint assignments_class_id_fkey
    foreign key (class_id) references public.classes(id) on delete cascade;

alter table public.responses
  drop constraint if exists responses_class_id_fkey,
  add constraint responses_class_id_fkey
    foreign key (class_id) references public.classes(id) on delete cascade;

alter table public.responses
  drop constraint if exists responses_student_id_fkey,
  add constraint responses_student_id_fkey
    foreign key (student_id) references public.students(id) on delete cascade;

alter table public.students
  drop constraint if exists students_class_id_fkey,
  add constraint students_class_id_fkey
    foreign key (class_id) references public.classes(id) on delete cascade;
