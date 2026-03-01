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
  start_date timestamptz not null default now(),
  deadline timestamptz not null,
  submission_count integer not null default 0,
  status text not null default 'unattempted' check (status in ('submitted', 'ongoing', 'unattempted', 'expired')),
  -- provider-specific fields
  metrics text[] default '{}',
  repo_url text,
  created_by uuid references profiles(id)
);

-- 3. SUBMISSIONS
create table submissions (
  id uuid default gen_random_uuid() primary key,
  created_at timestamptz default now(),
  problem_id text not null,
  docker_image_tag text not null,
  status text not null default 'pending' check (status in ('pending', 'processing', 'completed', 'failed')),
  passed_tests boolean default false,
  execution_time_seconds double precision default 0.0,
  tokens_used integer default 0
);

-- 4. LEADERBOARD VIEW (auto-calculated from submissions)
create view leaderboard as
  select
    s.problem_id,
    s.docker_image_tag,
    count(s.id) as total_submissions,
    count(s.id) filter (where s.passed_tests = true) as passed,
    coalesce(avg(s.execution_time_seconds) filter (where s.status = 'completed'), 0) as avg_execution_time,
    coalesce(avg(s.tokens_used) filter (where s.status = 'completed'), 0) as avg_tokens_used
  from submissions s
  where s.status = 'completed'
  group by s.problem_id, s.docker_image_tag
  order by passed desc, avg_execution_time asc;

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

create policy "Anyone can view submissions"
  on submissions for select using (true);

create policy "Anyone can insert submissions"
  on submissions for insert with check (true);

create policy "Service can update submissions"
  on submissions for update using (true);

-- =============================================
-- INDEXES
-- =============================================

create index idx_challenges_company on challenges(company);
create index idx_challenges_status on challenges(status);
create index idx_challenges_deadline on challenges(deadline);
create index idx_submissions_problem on submissions(problem_id);
create index idx_submissions_status on submissions(status);
create index idx_submissions_created on submissions(created_at);
