-- Students can report a problem with a question: a key that looks wrong,
-- two right answers, unclear wording or a typo. Audits keep finding answers
-- quietly rewritten into wrong ones (CLAUDE.md, "Answer text is rewritten
-- after the literals"); students meet them first.
--
-- One report per student per question: reporting again replaces the earlier
-- one and reopens it. Every kind of student can report, with the credential
-- their other calls already use: the owner account, a class session (class
-- code and student code, or the name for a legacy class without codes) or
-- a free session's token. At most 20 a day per student.
--
-- The optional note is free text from a student, so it is short (500
-- characters), never shown to other students, and deleted with the student.
-- Reports are read by the Forge team in the database for now; nothing in the
-- browser can read them.

create table if not exists public.question_reports (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.students(id) on delete cascade,
  question_id text not null check (length(question_id) between 2 and 120 and question_id ~ '^[A-Za-z0-9._-]+$'),
  bank text check (bank is null or (length(bank) between 2 and 80 and bank ~ '^[A-Za-z0-9._-]+$')),
  reason text not null check (reason in ('wrong_answer', 'two_answers', 'unclear', 'typo', 'other')),
  note text check (note is null or length(note) <= 500),
  selected_option text check (selected_option is null or selected_option ~ '^[A-H]$'),
  status text not null default 'open' check (status in ('open', 'fixed', 'dismissed')),
  created_at timestamptz not null default now(),
  unique (student_id, question_id)
);
create index if not exists question_reports_open_idx on public.question_reports (status, question_id);
alter table public.question_reports enable row level security;
revoke all on public.question_reports from public, anon, authenticated;

create or replace function public.report_question(
  p_student_id text, p_class_code text, p_student_code text, p_name text, p_free_token text,
  p_question_id text, p_bank text, p_reason text, p_note text, p_selected_option text
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_student public.students%rowtype;
  v_verified public.students%rowtype;
  v_note text := nullif(left(btrim(coalesce(p_note, '')), 500), '');
  v_question text := btrim(coalesce(p_question_id, ''));
  v_bank text := nullif(btrim(coalesce(p_bank, '')), '');
  v_option text := nullif(upper(btrim(coalesce(p_selected_option, ''))), '');
  v_today date := (now() at time zone 'Europe/London')::date;
begin
  select s.* into v_student from public.students s
  where s.id::text = btrim(coalesce(p_student_id, '')) limit 1;
  if v_student.id is null then raise exception 'invalid_student_session'; end if;

  if auth.uid() is not null and v_student.auth_user_id = auth.uid() then
    null; -- the owner account
  elsif v_student.class_id is not null then
    v_verified := public.forge_verify_class_student(p_student_id, p_class_code, p_student_code, p_name);
    if v_verified.id is distinct from v_student.id then raise exception 'invalid_student_session'; end if;
  elsif length(btrim(coalesce(p_free_token, ''))) < 16 or v_student.free_token is distinct from p_free_token then
    raise exception 'invalid_student_session';
  end if;

  if length(v_question) not between 2 and 120 or v_question !~ '^[A-Za-z0-9._-]+$'
     or (v_bank is not null and (length(v_bank) not between 2 and 80 or v_bank !~ '^[A-Za-z0-9._-]+$'))
     or p_reason is null or p_reason not in ('wrong_answer', 'two_answers', 'unclear', 'typo', 'other')
     or (v_option is not null and v_option !~ '^[A-H]$') then
    raise exception 'invalid_question_report';
  end if;

  if not exists (select 1 from public.question_reports r where r.student_id = v_student.id and r.question_id = v_question)
     and (select count(*) from public.question_reports r
          where r.student_id = v_student.id and (r.created_at at time zone 'Europe/London')::date = v_today) >= 20 then
    raise exception 'question_report_daily_limit';
  end if;

  insert into public.question_reports (student_id, question_id, bank, reason, note, selected_option)
  values (v_student.id, v_question, v_bank, p_reason, v_note, v_option)
  on conflict (student_id, question_id) do update
    set bank = excluded.bank, reason = excluded.reason, note = excluded.note,
        selected_option = excluded.selected_option, status = 'open', created_at = now();
  return jsonb_build_object('saved', true);
end;
$$;
revoke all on function public.report_question(text, text, text, text, text, text, text, text, text, text) from public, anon, authenticated;
grant execute on function public.report_question(text, text, text, text, text, text, text, text, text, text) to anon, authenticated;
