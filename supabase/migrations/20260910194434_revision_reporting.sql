-- Shared revision evidence. Students write through the credential-checked RPC;
-- teachers can only read rows belonging to classes they own.
create table if not exists public.revision_reviews (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.students(id) on delete cascade,
  class_id uuid not null references public.classes(id) on delete cascade,
  assignment_id uuid references public.assignments(id) on delete set null,
  card_key text not null,
  bank text not null,
  rating text not null check (rating in ('again', 'nearly', 'got-it')),
  due_at timestamptz not null,
  reviewed_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

create index if not exists revision_reviews_class_reviewed_idx
  on public.revision_reviews (class_id, reviewed_at desc);
create index if not exists revision_reviews_student_card_idx
  on public.revision_reviews (student_id, card_key, reviewed_at desc);

alter table public.revision_reviews enable row level security;
revoke all on table public.revision_reviews from anon, authenticated;

drop policy if exists "Teachers can read revision reviews for their classes" on public.revision_reviews;
create policy "Teachers can read revision reviews for their classes"
  on public.revision_reviews for select
  to authenticated
  using (exists (
    select 1 from public.classes c
    where c.id = revision_reviews.class_id
      and c.teacher_user_id = (select auth.uid())
  ));

create or replace function public.record_revision_review_with_code(
  p_student_id text,
  p_class_code text,
  p_student_code text,
  p_card_key text,
  p_bank text,
  p_rating text,
  p_due_at timestamptz,
  p_assignment_id uuid default null
)
returns json
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_class_id uuid;
  v_student_id uuid;
  v_code text := upper(regexp_replace(btrim(coalesce(p_student_code, '')), '[^A-Z0-9]', '', 'g'));
  v_assignment_class uuid;
  v_id uuid;
begin
  if p_rating not in ('again', 'nearly', 'got-it') then
    raise exception 'invalid_revision_rating';
  end if;
  if length(btrim(coalesce(p_card_key, ''))) < 3 or length(btrim(coalesce(p_bank, ''))) < 1 then
    raise exception 'invalid_revision_card';
  end if;

  select c.id into v_class_id
  from public.classes c
  where upper(c.code) = upper(btrim(coalesce(p_class_code, '')))
  limit 1;
  if v_class_id is null then raise exception 'invalid_class'; end if;

  select s.id into v_student_id
  from public.students s
  join public.student_access_codes ac on ac.student_id = s.id
  where s.id::text = btrim(coalesce(p_student_id, ''))
    and s.class_id = v_class_id
    and ac.class_id = v_class_id
    and ac.active
    and ac.code_hash = encode(extensions.digest(convert_to(v_code, 'UTF8'), 'sha256'::text), 'hex')
  limit 1;
  if v_student_id is null then raise exception 'invalid_student_session'; end if;

  if p_assignment_id is not null then
    select a.class_id into v_assignment_class from public.assignments a where a.id = p_assignment_id;
    if v_assignment_class is distinct from v_class_id then raise exception 'invalid_assignment'; end if;
  end if;

  insert into public.revision_reviews(student_id, class_id, assignment_id, card_key, bank, rating, due_at)
  values (v_student_id, v_class_id, p_assignment_id, left(btrim(p_card_key), 180), left(btrim(p_bank), 120), p_rating, p_due_at)
  returning id into v_id;
  return json_build_object('allowed', true, 'id', v_id);
end;
$$;

revoke all on function public.record_revision_review_with_code(text, text, text, text, text, text, timestamptz, uuid) from public;
grant execute on function public.record_revision_review_with_code(text, text, text, text, text, text, timestamptz, uuid) to anon, authenticated;
