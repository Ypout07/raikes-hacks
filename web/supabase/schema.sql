-- =============================================
-- Raikes Hacks Database Schema
-- Run this in Supabase SQL Editor
-- =============================================

-- 1. PROFILES (extends Supabase auth)
create table profiles (
  id uuid references auth.users on delete cascade primary key,
  email text not null,
  display_name text,
  role text not null default 'participant' check (role in ('participant', 'provider')),
  company text,
  created_at timestamptz default now()
);

-- Auto-create profile on signup
create or replace function handle_new_user()
returns trigger as $$
begin
  insert into profiles (id, email, display_name)
  values (new.id, new.email, split_part(new.email, '@', 1));
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();

-- 2. CHALLENGES
create table challenges (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  company text not null,
  description text not null,
  request text default '',
  posted_at timestamptz default now(),
  deadline timestamptz not null,
  status text not null default 'unattempted' check (status in ('submitted', 'ongoing', 'unattempted', 'expired')),
  -- provider-specific fields
  metrics text[] default '{}',
  repo_url text,
  created_by uuid references profiles(id)
);

-- 3. SUBMISSIONS
create table submissions (
  id uuid default gen_random_uuid() primary key,
  challenge_id uuid references challenges(id) on delete cascade not null,
  user_id uuid references profiles(id) on delete cascade not null,
  repo_url text,
  notes text,
  score numeric,
  status text not null default 'pending' check (status in ('pending', 'evaluating', 'completed', 'failed')),
  submitted_at timestamptz default now()
);

-- 4. LEADERBOARD VIEW (auto-calculated)
create view leaderboard as
  select
    p.id as user_id,
    p.display_name,
    p.email,
    count(s.id) as total_submissions,
    count(s.id) filter (where s.status = 'completed') as completed,
    coalesce(sum(s.score), 0) as total_score
  from profiles p
  left join submissions s on s.user_id = p.id
  where p.role = 'participant'
  group by p.id, p.display_name, p.email
  order by total_score desc;

-- =============================================
-- ROW LEVEL SECURITY POLICIES
-- =============================================

-- Profiles
alter table profiles enable row level security;

create policy "Anyone can view profiles"
  on profiles for select using (true);

create policy "Users can update own profile"
  on profiles for update using (auth.uid() = id);

-- Challenges
alter table challenges enable row level security;

create policy "Anyone can view challenges"
  on challenges for select using (true);

create policy "Providers can create challenges"
  on challenges for insert with check (
    exists (select 1 from profiles where id = auth.uid() and role = 'provider')
  );

create policy "Providers can update own challenges"
  on challenges for update using (created_by = auth.uid());

-- Submissions
alter table submissions enable row level security;

create policy "Users can view own submissions"
  on submissions for select using (auth.uid() = user_id);

create policy "Providers can view submissions to their challenges"
  on submissions for select using (
    exists (select 1 from challenges where id = challenge_id and created_by = auth.uid())
  );

create policy "Participants can submit"
  on submissions for insert with check (auth.uid() = user_id);

-- =============================================
-- INDEXES
-- =============================================

create index idx_challenges_company on challenges(company);
create index idx_challenges_status on challenges(status);
create index idx_challenges_deadline on challenges(deadline);
create index idx_submissions_challenge on submissions(challenge_id);
create index idx_submissions_user on submissions(user_id);
