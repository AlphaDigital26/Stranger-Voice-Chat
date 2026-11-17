-- ============================================================
-- PitchLine: same-tag matchmaking
-- Run once in Supabase → SQL Editor (safe to re-run).
--
-- Everyone gets an invisible anonymous Supabase session (no login screens);
-- auth.uid() is that device's ID. Browsers never touch these tables directly:
-- row-level security is on, and all access goes through the functions below.
-- ============================================================

-- People waiting for a match on a tag. One row per device at most.
create table if not exists public.match_queue (
  user_id    uuid primary key references auth.users (id) on delete cascade,
  tag        text not null,
  country    text,          -- optional preference; null = any
  language   text,          -- optional preference; null = any
  joined_at  timestamptz not null default now(),
  last_seen  timestamptz not null default now()  -- refreshed by poll_match(); stale rows are ignored
);
create index if not exists match_queue_tag_idx on public.match_queue (tag, joined_at);

-- A call between two matched devices. Its id is also the LiveKit room name.
create table if not exists public.call_sessions (
  id          uuid primary key default gen_random_uuid(),
  tag         text not null,
  user_a      uuid not null references auth.users (id) on delete cascade,
  user_b      uuid not null references auth.users (id) on delete cascade,
  created_at  timestamptz not null default now(),
  ended_at    timestamptz
);
create index if not exists call_sessions_user_a_idx on public.call_sessions (user_a, created_at desc);
create index if not exists call_sessions_user_b_idx on public.call_sessions (user_b, created_at desc);

alter table public.match_queue  enable row level security;
alter table public.call_sessions enable row level security;

-- Participants may read their own calls (used by the LiveKit token route).
drop policy if exists "participants can read their calls" on public.call_sessions;
create policy "participants can read their calls" on public.call_sessions
  for select using (auth.uid() = user_a or auth.uid() = user_b);

-- ------------------------------------------------------------
-- join_queue: try to match now; otherwise wait in the queue.
-- Returns the call id when matched straight away, or null when queued.
-- ------------------------------------------------------------
create or replace function public.join_queue(p_tag text, p_country text default null, p_language text default null)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  me      uuid := auth.uid();
  partner uuid;
  call_id uuid;
begin
  if me is null then
    raise exception 'No session';
  end if;
  if p_tag is null or p_tag !~ '^[a-z0-9-]{1,60}$' then
    raise exception 'Invalid tag';
  end if;

  -- Starting over: leave any old queue entry and close any call still open
  delete from match_queue where user_id = me;
  update call_sessions set ended_at = now()
   where ended_at is null and (user_a = me or user_b = me);

  -- Oldest compatible person waiting on the SAME tag. SKIP LOCKED stops two
  -- people who join at the same moment from grabbing the same partner.
  select q.user_id into partner
    from match_queue q
   where q.tag = p_tag
     and q.user_id <> me
     and q.last_seen > now() - interval '12 seconds'
     and (p_country  is null or q.country  is null or q.country  = p_country)
     and (p_language is null or q.language is null or q.language = p_language)
   order by q.joined_at
   for update skip locked
   limit 1;

  if partner is not null then
    delete from match_queue where user_id = partner;
    insert into call_sessions (tag, user_a, user_b) values (p_tag, partner, me)
    returning id into call_id;
    return call_id;
  end if;

  insert into match_queue (user_id, tag, country, language) values (me, p_tag, p_country, p_language);
  return null;
end;
$$;

-- ------------------------------------------------------------
-- poll_match: called every couple of seconds while waiting.
-- Returns the call id once someone has matched with you; keeps you in the queue otherwise.
-- ------------------------------------------------------------
create or replace function public.poll_match()
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  me      uuid := auth.uid();
  call_id uuid;
begin
  if me is null then
    raise exception 'No session';
  end if;

  select id into call_id
    from call_sessions
   where ended_at is null and (user_a = me or user_b = me)
   order by created_at desc
   limit 1;
  if call_id is not null then
    return call_id;
  end if;

  update match_queue set last_seen = now() where user_id = me;
  return null;
end;
$$;

-- leave_queue: stop waiting (cancel, timeout, or leaving the page)
create or replace function public.leave_queue()
returns void
language sql
security definer
set search_path = public
as $$
  delete from match_queue where user_id = auth.uid();
$$;

-- end_call: hang up / skip / report
create or replace function public.end_call(p_call uuid)
returns void
language sql
security definer
set search_path = public
as $$
  update call_sessions set ended_at = coalesce(ended_at, now())
   where id = p_call and (user_a = auth.uid() or user_b = auth.uid());
$$;

-- tag_counts: how many people are waiting on each tag right now (for the picker)
create or replace function public.tag_counts()
returns table (tag text, waiting integer)
language sql
stable
security definer
set search_path = public
as $$
  select q.tag, count(*)::integer
    from match_queue q
   where q.last_seen > now() - interval '12 seconds'
   group by q.tag;
$$;

revoke all on function public.join_queue(text, text, text) from public;
revoke all on function public.poll_match()                 from public;
revoke all on function public.leave_queue()                from public;
revoke all on function public.end_call(uuid)               from public;
revoke all on function public.tag_counts()                 from public;
grant execute on function public.join_queue(text, text, text) to authenticated;
grant execute on function public.poll_match()                 to authenticated;
grant execute on function public.leave_queue()                to authenticated;
grant execute on function public.end_call(uuid)               to authenticated;
grant execute on function public.tag_counts()                 to anon, authenticated;
