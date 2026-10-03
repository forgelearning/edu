-- Student-authored cards are private. Signed-in students use auth_user_id;
-- code and free students present their existing session credentials.
create table if not exists public.student_revision_cards (
  student_id uuid not null references public.students(id) on delete cascade,
  id text not null check (length(id) between 3 and 80),
  front text not null check (length(btrim(front)) between 1 and 500),
  back text not null check (length(btrim(back)) between 1 and 2000),
  bank text not null check (length(bank) between 1 and 120),
  source text check (source is null or length(source) <= 180),
  review jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (student_id, id)
);

create index if not exists student_revision_cards_student_updated_idx
  on public.student_revision_cards (student_id, updated_at desc);

alter table public.student_revision_cards enable row level security;
revoke all on public.student_revision_cards from anon, authenticated;

create or replace function public.manage_student_revision_card(
  p_student_id text,
  p_class_code text,
  p_student_code text,
  p_action text,
  p_card jsonb default null,
  p_review jsonb default null,
  p_free_token text default null
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_student_id uuid;
  v_card_id text;
  v_code text := regexp_replace(upper(btrim(coalesce(p_student_code,''))), '[^A-Z0-9]', '', 'g');
  v_review jsonb;
  v_result jsonb;
begin
  select s.id into v_student_id
  from public.students s
  where s.id::text = btrim(coalesce(p_student_id,''))
    and (
      (auth.uid() is not null and s.auth_user_id = auth.uid())
      or (s.class_id is null and length(btrim(coalesce(p_free_token,''))) >= 16 and s.free_token = p_free_token)
      or (
        length(v_code) >= 4 and exists (
          select 1 from public.classes c
          join public.student_access_codes ac on ac.class_id = c.id
          where c.id = s.class_id
            and upper(c.code) = upper(btrim(coalesce(p_class_code,'')))
            and ac.student_id = s.id and ac.active
            and ac.code_hash = encode(extensions.digest(convert_to(v_code, 'UTF8'), 'sha256'::text), 'hex')
        )
      )
    )
  limit 1;
  if v_student_id is null then raise exception 'invalid_student_session'; end if;

  if p_action = 'list' then
    select coalesce(jsonb_agg(jsonb_build_object(
      'id', c.id, 'front', c.front, 'back', c.back, 'bank', c.bank,
      'source', c.source, 'review', c.review, 'updatedAt', c.updated_at
    ) order by c.updated_at desc), '[]'::jsonb)
    into v_result
    from public.student_revision_cards c where c.student_id = v_student_id;
    return v_result;
  end if;

  v_card_id := btrim(coalesce(p_card->>'id',''));
  if length(v_card_id) < 3 or length(v_card_id) > 80 then raise exception 'invalid_card_id'; end if;

  if p_action = 'delete' then
    delete from public.student_revision_cards
    where student_id = v_student_id and id = v_card_id;
    return jsonb_build_object('ok', true);
  end if;

  if coalesce(p_action,'') <> 'save'
     or length(btrim(coalesce(p_card->>'front',''))) not between 1 and 500
     or length(btrim(coalesce(p_card->>'back',''))) not between 1 and 2000
     or length(btrim(coalesce(p_card->>'bank',''))) not between 1 and 120
     or length(coalesce(p_card->>'source','')) > 180 then
    raise exception 'invalid_revision_card';
  end if;

  if p_review is not null then
    if coalesce(p_review->>'lastRating','') not in ('again','nearly','got-it')
       or (p_review->>'dueAt') is null
       or length(p_review::text) > 1000 then raise exception 'invalid_revision_review'; end if;
    v_review := jsonb_build_object(
      'lastRating', p_review->>'lastRating',
      'dueAt', p_review->>'dueAt',
      'secureReviews', greatest(0,least(100,(coalesce(p_review->>'secureReviews','0'))::integer)),
      'updatedAt', p_review->>'updatedAt'
    );
  end if;

  insert into public.student_revision_cards(student_id,id,front,back,bank,source,review)
  values (v_student_id,v_card_id,btrim(p_card->>'front'),btrim(p_card->>'back'),
          btrim(p_card->>'bank'),nullif(btrim(p_card->>'source'),''),v_review)
  on conflict (student_id,id) do update
    set front = excluded.front, back = excluded.back, bank = excluded.bank,
        source = excluded.source,
        review = coalesce(excluded.review, student_revision_cards.review),
        updated_at = now();
  return jsonb_build_object('ok', true);
end;
$$;

revoke all on function public.manage_student_revision_card(text,text,text,text,jsonb,jsonb,text) from public;
grant execute on function public.manage_student_revision_card(text,text,text,text,jsonb,jsonb,text) to anon, authenticated;
