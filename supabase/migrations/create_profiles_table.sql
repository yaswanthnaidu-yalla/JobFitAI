-- Create a profiles table for user profile data
create table if not exists profiles (
  id uuid primary key references auth.users on delete cascade,
  full_name text,
  title text,
  company text,
  updated_at timestamptz default now()
);

-- Enable RLS
alter table profiles enable row level security;

-- Users can read and write their own profile
create policy "Users can read own profile"
  on profiles for select
  using (auth.uid() = id);

create policy "Users can insert own profile"
  on profiles for insert
  with check (auth.uid() = id);

create policy "Users can update own profile"
  on profiles for update
  using (auth.uid() = id);
