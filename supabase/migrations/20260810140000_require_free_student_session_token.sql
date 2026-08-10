-- A free-student row is an anonymous session boundary. Never create rows
-- without the token that gates their later history and quota access.

create or replace function public.create_free_student(p_name text,p_free_token text)
returns setof json language plpgsql security definer set search_path=public,pg_temp
as $$
declare v_id uuid; v_token text:=btrim(coalesce(p_free_token,''));
begin
  if length(v_token)<8 then return; end if;
  select id into v_id from public.students where free_token=v_token limit 1;
  if v_id is null then
    insert into public.students(name,class_id,free_token)
    values(left(btrim(coalesce(p_name,'')),80),null,v_token) returning id into v_id;
  end if;
  return query select to_json(row) from (select v_id::text as student_id) row;
end;
$$;
