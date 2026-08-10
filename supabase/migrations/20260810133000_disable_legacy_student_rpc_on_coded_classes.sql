-- Legacy name + class-code RPCs predate per-student credentials. They remain
-- available for genuinely legacy classes, but must fail closed once a class
-- has issued private student codes.

create or replace function public.get_student_by_name_and_code(p_code text, p_name text)
returns setof json language sql security definer set search_path=public,pg_temp
as $$
  select to_json(row) from (
    select s.id::text as student_id,s.class_id::text as class_id,c.subject as subject,
           c.name as class_name,s.extra_time as extra_time
    from public.students s join public.classes c on c.id=s.class_id
    where c.code=p_code and s.name=p_name
      and not exists (select 1 from public.student_access_codes ac where ac.class_id=c.id and ac.active)
    limit 1
  ) row;
$$;

create or replace function public.get_student_own_responses(p_student_id text,p_code text,p_name text)
returns setof json language sql security definer set search_path=public,pg_temp
as $$
  select to_json(r) from public.responses r
  where r.student_id::text=p_student_id
    and exists (
      select 1 from public.students s join public.classes c on c.id=s.class_id
      where s.id::text=p_student_id and s.name=p_name and c.code=p_code
        and not exists (select 1 from public.student_access_codes ac where ac.class_id=c.id and ac.active)
    )
  order by r.created_at desc;
$$;

create or replace function public.get_linked_classes(p_student_id uuid,p_code text,p_name text)
returns setof json language sql security definer set search_path=public,pg_temp
as $$
  with anchor as (
    select coalesce(s.link_group,s.id) as grp from public.students s join public.classes c on c.id=s.class_id
    where s.id=p_student_id and s.name=p_name and c.code=p_code
      and not exists (select 1 from public.student_access_codes ac where ac.class_id=c.id and ac.active)
    limit 1
  )
  select to_json(row) from (
    select s.id::text as student_id,s.class_id::text as class_id,c.name as class_name,c.subject as subject,s.extra_time as extra_time
    from public.students s join public.classes c on c.id=s.class_id cross join anchor a
    where coalesce(s.link_group,s.id)=a.grp order by s.created_at asc
  ) row;
$$;

create or replace function public.get_linked_responses(p_student_id uuid,p_code text,p_name text)
returns setof json language sql security definer set search_path=public,pg_temp
as $$
  with anchor as (
    select coalesce(s.link_group,s.id) as grp from public.students s join public.classes c on c.id=s.class_id
    where s.id=p_student_id and s.name=p_name and c.code=p_code
      and not exists (select 1 from public.student_access_codes ac where ac.class_id=c.id and ac.active)
    limit 1
  ), mine as (
    select s.id,s.class_id,c.subject from public.students s join public.classes c on c.id=s.class_id cross join anchor a
    where coalesce(s.link_group,s.id)=a.grp
  )
  select to_json(row) from (
    select r.*,m.id::text as link_student_id,m.class_id::text as link_class_id,m.subject as link_subject
    from public.responses r join mine m on m.id=r.student_id order by r.created_at asc
  ) row;
$$;

create or replace function public.link_student_rows(p_name text,p_student_id uuid,p_code text,p_other_student_id uuid,p_other_code text)
returns uuid language plpgsql security definer set search_path=public,pg_temp
as $$
declare a_grp uuid; b_grp uuid;
begin
  select coalesce(s.link_group,s.id) into a_grp from public.students s join public.classes c on c.id=s.class_id
  where s.id=p_student_id and s.name=p_name and c.code=p_code
    and not exists (select 1 from public.student_access_codes ac where ac.class_id=c.id and ac.active);
  select coalesce(s.link_group,s.id) into b_grp from public.students s join public.classes c on c.id=s.class_id
  where s.id=p_other_student_id and s.name=p_name and c.code=p_other_code
    and not exists (select 1 from public.student_access_codes ac where ac.class_id=c.id and ac.active);
  if a_grp is null or b_grp is null then raise exception 'link denied'; end if;
  update public.students set link_group=a_grp where coalesce(link_group,id) in (a_grp,b_grp);
  return a_grp;
end;
$$;
