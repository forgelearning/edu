-- One-time rewrite: reduce every stored student name to a first name.
--
-- IRREVERSIBLE. The full names are not copied anywhere, by design: the point
-- is that nobody, including the database owner, can read them afterwards.
-- They survive only in Supabase's own automatic backups until those expire.
--
-- Same rule as the trigger in 20261120170000: first name only, plus the
-- initial of the last word where two students in one class share a first
-- name. Apply after 20261120170000.

with cleaned as (
  select s.id, s.class_id, public.forge_student_name(s.name) as clean
  from public.students s
),
parts as (
  select id, class_id, clean,
         left(split_part(clean, ' ', 1), 30) as first_name,
         case when clean like '% %'
              then upper(left(regexp_replace(clean, '^.* ', ''), 1)) end as initial
  from cleaned
  where clean is not null
),
ranked as (
  select p.*,
         case when class_id is null then 1
              else count(*) over (partition by class_id, lower(first_name)) end as same_first
  from parts p
)
update public.students s
set name = case when r.same_first > 1 and r.initial is not null
                then r.first_name || ' ' || r.initial
                else r.first_name end
from ranked r
where s.id = r.id
  and s.name is distinct from
      case when r.same_first > 1 and r.initial is not null
           then r.first_name || ' ' || r.initial
           else r.first_name end;

update public.students
set display_name = public.forge_first_name(display_name)
where display_name is not null and display_name like '% %';

update public.subscribers
set name = public.forge_first_name(name)
where name is not null and name like '% %';
