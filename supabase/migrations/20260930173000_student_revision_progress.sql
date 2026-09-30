-- Private, cross-device revision schedules and assignment completion.
-- All access goes through a credential-checked RPC; the table is not exposed.
create table if not exists public.student_revision_progress (
  student_id uuid primary key references public.students(id) on delete cascade,
  reviews jsonb not null default '{}'::jsonb check (jsonb_typeof(reviews) = 'object'),
  assignments jsonb not null default '{}'::jsonb check (jsonb_typeof(assignments) = 'object'),
  updated_at timestamptz not null default now()
);

alter table public.student_revision_progress enable row level security;
revoke all on public.student_revision_progress from public, anon, authenticated;

-- Coded students already sent review events for teacher reporting. Seed their
-- latest schedule so a new device can see earlier reviews before the original
-- device returns. Older events cannot overwrite a later device review.
insert into public.student_revision_progress (student_id, reviews)
select student_id, jsonb_object_agg(card_key, jsonb_build_object(
  'lastRating', rating,
  'dueAt', due_at,
  'secureReviews', case when rating = 'got-it' then 1 else 0 end,
  'updatedAt', reviewed_at
))
from (
  select distinct on (student_id, card_key)
    student_id, card_key, rating, due_at, reviewed_at
  from public.revision_reviews
  where length(card_key) between 1 and 180
  order by student_id, card_key, reviewed_at desc
) latest
group by student_id
on conflict (student_id) do nothing;

create or replace function public.sync_student_revision_progress(
  p_student_id text,
  p_class_code text,
  p_student_code text,
  p_reviews jsonb default '{}'::jsonb,
  p_assignments jsonb default '{}'::jsonb,
  p_free_token text default null
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_student_id uuid;
  v_class_id uuid;
  v_code text := regexp_replace(upper(btrim(coalesce(p_student_code,''))), '[^A-Z0-9]', '', 'g');
  v_reviews jsonb;
  v_assignments jsonb;
  v_key text;
  v_value jsonb;
  v_time timestamptz;
  v_answered jsonb;
  v_existing jsonb;
begin
  select s.id, s.class_id into v_student_id, v_class_id
  from public.students s
  where s.id::text = btrim(coalesce(p_student_id,''))
    and (
      (auth.uid() is not null and s.auth_user_id = auth.uid())
      or (s.class_id is null and length(btrim(coalesce(p_free_token,''))) >= 16 and s.free_token = p_free_token)
      or (length(v_code) >= 4 and exists (
        select 1 from public.classes c
        join public.student_access_codes ac on ac.class_id = c.id
        where c.id = s.class_id
          and upper(c.code) = upper(btrim(coalesce(p_class_code,'')))
          and ac.student_id = s.id and ac.active
          and ac.code_hash = encode(extensions.digest(convert_to(v_code,'UTF8'),'sha256'::text),'hex')
      ))
    )
  limit 1;
  if v_student_id is null then raise exception 'invalid_student_session'; end if;

  if jsonb_typeof(p_reviews) is distinct from 'object'
     or jsonb_typeof(p_assignments) is distinct from 'object'
     or length(p_reviews::text) > 100000
     or length(p_assignments::text) > 100000
     or (select count(*) from jsonb_object_keys(p_reviews)) > 100
     or (select count(*) from jsonb_object_keys(p_assignments)) > 50 then
    raise exception 'invalid_revision_progress';
  end if;

  insert into public.student_revision_progress(student_id)
  values (v_student_id) on conflict (student_id) do nothing;
  select reviews, assignments into v_reviews, v_assignments
  from public.student_revision_progress where student_id = v_student_id for update;

  for v_key, v_value in select key, value from jsonb_each(p_reviews) loop
    if length(v_key) not between 3 and 180 or v_key like 'personal|%'
       or jsonb_typeof(v_value) is distinct from 'object'
       or coalesce(v_value->>'lastRating','') not in ('again','nearly','got-it')
       or coalesce(v_value->>'secureReviews','') !~ '^[0-9]{1,3}$' then
      raise exception 'invalid_revision_review';
    end if;
    v_time := (v_value->>'updatedAt')::timestamptz;
    if v_time is null or v_time > now() + interval '1 day'
       or v_time < '2000-01-01'::timestamptz
       or (v_value->>'dueAt')::timestamptz is null then
      raise exception 'invalid_revision_review_date';
    end if;
    if v_reviews->v_key is null
       or v_time > (v_reviews->v_key->>'updatedAt')::timestamptz then
      v_reviews := jsonb_set(v_reviews, array[v_key], jsonb_build_object(
        'lastRating', v_value->>'lastRating',
        'dueAt', (v_value->>'dueAt')::timestamptz,
        'secureReviews', least(100, (v_value->>'secureReviews')::integer),
        'updatedAt', v_time
      ));
    end if;
  end loop;

  for v_key, v_value in select key, value from jsonb_each(p_assignments) loop
    if jsonb_typeof(v_value) is distinct from 'object'
       or jsonb_typeof(v_value->'answered') is distinct from 'array'
       or jsonb_typeof(v_value->'complete') is distinct from 'boolean'
       or jsonb_array_length(v_value->'answered') > 1000 then
      raise exception 'invalid_revision_assignment_progress';
    end if;
    perform 1 from public.assignments a
    where a.id = v_key::uuid and a.class_id = v_class_id;
    if not found then raise exception 'invalid_revision_assignment'; end if;
    if exists (select 1 from jsonb_array_elements_text(v_value->'answered') a
               where length(a.value) not between 3 and 180) then
      raise exception 'invalid_revision_answered_card';
    end if;
    v_existing := coalesce(v_assignments->v_key, '{}'::jsonb);
    select coalesce(jsonb_agg(a.value order by a.value), '[]'::jsonb)
      into v_answered
    from (
      select value from jsonb_array_elements_text(coalesce(v_existing->'answered','[]'::jsonb))
      union
      select value from jsonb_array_elements_text(v_value->'answered')
    ) a;
    v_assignments := jsonb_set(v_assignments, array[v_key], jsonb_build_object(
      'answered', v_answered,
      'complete', coalesce((v_existing->>'complete')::boolean,false) or (v_value->>'complete')::boolean,
      'updatedAt', now()
    ));
  end loop;

  update public.student_revision_progress
  set reviews = v_reviews, assignments = v_assignments, updated_at = now()
  where student_id = v_student_id;
  return jsonb_build_object('reviews',v_reviews,'assignments',v_assignments);
end;
$$;

revoke all on function public.sync_student_revision_progress(text,text,text,jsonb,jsonb,text) from public, anon, authenticated;
grant execute on function public.sync_student_revision_progress(text,text,text,jsonb,jsonb,text) to anon, authenticated;
