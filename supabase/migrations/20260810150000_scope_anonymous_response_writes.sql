-- Anonymous class responses must be credential-checked. Legacy classes keep
-- their existing compatibility path until they are migrated to student codes;
-- coded classes use the RPC below and cannot write directly to the table.

drop policy if exists "Anyone can log a response" on public.responses;

create policy "Legacy anonymous students can log responses"
  on public.responses
  for insert
  to anon
  with check (
    class_id is not null
    and not exists (
      select 1 from public.student_access_codes ac
      where ac.class_id = responses.class_id and ac.active
    )
  );

create or replace function public.record_student_response_with_code(
  p_student_id text,
  p_class_code text,
  p_student_code text,
  p_question_id text,
  p_bank text,
  p_subject text,
  p_selected_option text,
  p_is_correct boolean,
  p_misconception_tag text default null,
  p_spec_point text default null,
  p_reforge_attempted boolean default false,
  p_reforge_correct boolean default null
)
returns jsonb
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_class_id uuid;
  v_response_id uuid;
  v_code text := upper(regexp_replace(btrim(coalesce(p_student_code, '')), '[^A-Z0-9]', '', 'g'));
begin
  select c.id into v_class_id from public.classes c
  where upper(c.code)=upper(btrim(coalesce(p_class_code,''))) limit 1;
  if v_class_id is null or length(v_code)<8 then
    return jsonb_build_object('allowed',false,'reason','invalid_session');
  end if;
  if not exists (
    select 1 from public.students s join public.student_access_codes ac on ac.student_id=s.id
    where s.id::text=btrim(coalesce(p_student_id,'')) and s.class_id=v_class_id
      and ac.class_id=v_class_id and ac.active
      and ac.code_hash=encode(extensions.digest(convert_to(v_code,'UTF8'),'sha256'::text),'hex')
  ) then
    return jsonb_build_object('allowed',false,'reason','invalid_session');
  end if;
  insert into public.responses(student_id,class_id,question_id,bank,subject,selected_option,is_correct,misconception_tag,spec_point,reforge_attempted,reforge_correct)
  values(p_student_id::uuid,v_class_id,p_question_id,p_bank,p_subject,p_selected_option,p_is_correct,p_misconception_tag,p_spec_point,coalesce(p_reforge_attempted,false),p_reforge_correct)
  returning id into v_response_id;
  return jsonb_build_object('allowed',true,'id',v_response_id);
end;
$$;

revoke all on function public.record_student_response_with_code(text,text,text,text,text,text,text,boolean,text,text,boolean,boolean) from public;
grant execute on function public.record_student_response_with_code(text,text,text,text,text,text,text,boolean,text,text,boolean,boolean) to anon, authenticated;
