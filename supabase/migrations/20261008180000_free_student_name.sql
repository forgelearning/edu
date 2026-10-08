-- Independent students were always named "Student": the guest start and the
-- email sign-in both create the row with that name, and nothing could change
-- it. This lets the student set their own name.
--
-- The free token is the credential, as it is for the student's history and
-- quota. When the row belongs to an email account, every free row on that
-- account is renamed together, so the name follows the student between
-- devices. Class rows are left alone: their name is what the teacher sees on
-- the register and is set when the student joins.

create or replace function public.forge_student_name(p_name text)
returns text language sql immutable set search_path = public, pg_temp
as $$
  select nullif(left(btrim(regexp_replace(
    regexp_replace(coalesce(p_name, ''), '[^[:alpha:] ''-]', '', 'g'),
    '\s+', ' ', 'g')), 40), '');
$$;
revoke all on function public.forge_student_name(text) from public, anon, authenticated;

create or replace function public.set_free_student_name(p_student_id text, p_free_token text, p_name text)
returns json language plpgsql volatile security definer set search_path = public, pg_temp
as $$
declare
  v_name text := public.forge_student_name(p_name);
  v_row public.students%rowtype;
begin
  if v_name is null then return json_build_object('result', 'invalid'); end if;
  if length(btrim(coalesce(p_free_token, ''))) < 16 then return json_build_object('result', 'not_found'); end if;
  select * into v_row from public.students s
  where s.id::text = p_student_id and s.class_id is null and s.free_token = p_free_token;
  if not found then return json_build_object('result', 'not_found'); end if;
  update public.students s set name = v_name
  where s.class_id is null and s.free_token is not null
    and (s.id = v_row.id or (v_row.auth_user_id is not null and s.auth_user_id = v_row.auth_user_id));
  return json_build_object('result', 'saved', 'name', v_name);
end;
$$;
revoke all on function public.set_free_student_name(text, text, text) from public;
grant execute on function public.set_free_student_name(text, text, text) to anon, authenticated;
