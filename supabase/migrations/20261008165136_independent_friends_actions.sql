-- Friends for independent students: switch on (13+ and a name), switch off
-- (deletes every friendship), new code, send, respond, remove.
-- Rules and tables: 20261008162807_independent_friends.sql. All refuse while
-- app_flags.independent_friends is false.

-- ── Switch on / off ──────────────────────────────────────────────────────
create or replace function public.set_independent_friends(p_enabled boolean, p_over_13 boolean default false, p_name text default null)
returns json language plpgsql volatile security definer set search_path = public, pg_temp
as $$
declare
  v_me uuid := public.forge_independent_friend_caller();
  v_name text := public.forge_friend_name(p_name);
begin
  if v_me is null then return json_build_object('result', 'unavailable'); end if;
  if not coalesce(p_enabled, false) then
    -- Deleting the profile deletes every friendship and request with it.
    delete from public.independent_friend_profiles p where p.user_id = v_me;
    return json_build_object('result', 'disabled');
  end if;
  if not coalesce(p_over_13, false) then return json_build_object('result', 'age_required'); end if;
  if v_name is null then return json_build_object('result', 'name_required'); end if;
  insert into public.independent_friend_profiles (user_id, friend_code, display_name, age_confirmed_at)
  values (v_me, public.forge_new_friend_code(), v_name, now())
  on conflict (user_id) do update set display_name = excluded.display_name;
  return json_build_object('result', 'enabled');
end;
$$;

create or replace function public.new_independent_friend_code()
returns json language plpgsql volatile security definer set search_path = public, pg_temp
as $$
declare v_me uuid := public.forge_independent_friend_caller();
begin
  if v_me is null then return json_build_object('result', 'unavailable'); end if;
  update public.independent_friend_profiles p set friend_code = public.forge_new_friend_code() where p.user_id = v_me;
  if not found then return json_build_object('result', 'not_enabled'); end if;
  return json_build_object('result', 'new_code');
end;
$$;

-- ── Requests ─────────────────────────────────────────────────────────────
create or replace function public.send_independent_friend_request(p_code text)
returns json language plpgsql volatile security definer set search_path = public, pg_temp
as $$
declare
  c_max_failures constant integer := 10;
  c_max_pending constant integer := 5;
  v_me uuid := public.forge_independent_friend_caller();
  v_profile public.independent_friend_profiles%rowtype;
  v_code text := upper(regexp_replace(coalesce(p_code, ''), '[^A-Za-z0-9]', '', 'g'));
  v_target uuid;
  v_link public.independent_friendships%rowtype;
begin
  if v_me is null then return json_build_object('result', 'unavailable'); end if;
  select * into v_profile from public.independent_friend_profiles p where p.user_id = v_me for update;
  if not found then return json_build_object('result', 'not_enabled'); end if;

  -- A rolling hour of failed attempts.
  if v_profile.failed_window_start is null or v_profile.failed_window_start < now() - interval '1 hour' then
    update public.independent_friend_profiles set failed_attempts = 0, failed_window_start = null where user_id = v_me;
    v_profile.failed_attempts := 0;
  end if;
  if v_profile.failed_attempts >= c_max_failures then return json_build_object('result', 'too_many_attempts'); end if;

  select p.user_id into v_target from public.independent_friend_profiles p where p.friend_code = v_code;
  if v_target is not null then
    select * into v_link from public.independent_friendships f
    where least(f.requester_id, f.addressee_id) = least(v_me, v_target)
      and greatest(f.requester_id, f.addressee_id) = greatest(v_me, v_target);
  end if;
  -- The student who declined may change their mind and ask instead.
  if v_link.id is not null and v_link.status = 'declined' and v_link.addressee_id = v_me then
    update public.independent_friendships
    set requester_id = v_me, addressee_id = v_target, status = 'pending', created_at = now(), responded_at = null
    where id = v_link.id;
    return json_build_object('result', 'requested');
  end if;
  -- To the student who was declined, an unknown code and their declined
  -- request look the same, and both count towards the limit.
  if v_target is null or (v_link.id is not null and v_link.status = 'declined') then
    update public.independent_friend_profiles
    set failed_attempts = failed_attempts + 1, failed_window_start = coalesce(failed_window_start, now())
    where user_id = v_me;
    return json_build_object('result', 'code_not_recognised');
  end if;
  if v_target = v_me then return json_build_object('result', 'own_code'); end if;
  if v_link.id is not null then
    if v_link.status = 'accepted' then return json_build_object('result', 'already_friends'); end if;
    if v_link.requester_id = v_me then return json_build_object('result', 'already_requested'); end if;
    return json_build_object('result', 'request_waiting_for_you');
  end if;
  if (select count(*) from public.independent_friendships f where f.requester_id = v_me and f.status = 'pending') >= c_max_pending then
    return json_build_object('result', 'too_many_pending');
  end if;
  insert into public.independent_friendships (requester_id, addressee_id) values (v_me, v_target);
  return json_build_object('result', 'requested');
end;
$$;

create or replace function public.respond_independent_friend_request(p_friendship_id uuid, p_accept boolean)
returns json language plpgsql volatile security definer set search_path = public, pg_temp
as $$
declare v_me uuid := public.forge_independent_friend_caller();
begin
  if v_me is null then return json_build_object('result', 'unavailable'); end if;
  -- Declined requests are kept, hidden, so the same student cannot keep asking.
  update public.independent_friendships f
  set status = case when coalesce(p_accept, false) then 'accepted' else 'declined' end, responded_at = now()
  where f.id = p_friendship_id and f.addressee_id = v_me and f.status = 'pending';
  if not found then return json_build_object('result', 'not_found'); end if;
  return json_build_object('result', case when coalesce(p_accept, false) then 'accepted' else 'declined' end);
end;
$$;

-- Unfriend, or cancel a request you sent.
create or replace function public.remove_independent_friend(p_friendship_id uuid)
returns json language plpgsql volatile security definer set search_path = public, pg_temp
as $$
declare v_me uuid := public.forge_independent_friend_caller();
begin
  if v_me is null then return json_build_object('result', 'unavailable'); end if;
  delete from public.independent_friendships f
  where f.id = p_friendship_id
    and ((f.status = 'accepted' and v_me in (f.requester_id, f.addressee_id))
      or (f.status = 'pending' and f.requester_id = v_me));
  if not found then return json_build_object('result', 'not_found'); end if;
  return json_build_object('result', 'removed');
end;
$$;

-- Signed-in accounts only.
revoke all on function public.set_independent_friends(boolean, boolean, text) from public, anon;
revoke all on function public.new_independent_friend_code() from public, anon;
revoke all on function public.send_independent_friend_request(text) from public, anon;
revoke all on function public.respond_independent_friend_request(uuid, boolean) from public, anon;
revoke all on function public.remove_independent_friend(uuid) from public, anon;
grant execute on function public.set_independent_friends(boolean, boolean, text) to authenticated;
grant execute on function public.new_independent_friend_code() to authenticated;
grant execute on function public.send_independent_friend_request(text) to authenticated;
grant execute on function public.respond_independent_friend_request(uuid, boolean) to authenticated;
grant execute on function public.remove_independent_friend(uuid) to authenticated;
