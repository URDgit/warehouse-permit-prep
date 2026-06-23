-- =====================================================================
--  Warehouse Permit Prep — Supabase schema
-- =====================================================================
--  Run this ONCE in your Supabase project: SQL Editor → New query → paste →
--  Run. It is idempotent (safe to run again).
--
--  Each signed-in user gets their own rows. Row-Level Security (RLS) makes it
--  impossible for one account to read or write another account's data — the
--  database enforces it, not the app.
--
--  Every table stores its payload as JSON (`data`) matching what the app
--  already keeps locally, so moving a feature to the cloud is a simple
--  read-blob / write-blob.
-- =====================================================================

-- Firm letterhead / engineer-of-record profile (one row per user).
create table if not exists public.firm_profiles (
  user_id uuid primary key references auth.users (id) on delete cascade,
  data jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

-- Saved intake projects (the whole list as a JSON array, one row per user).
create table if not exists public.projects (
  user_id uuid primary key references auth.users (id) on delete cascade,
  data jsonb not null default '[]'::jsonb,
  updated_at timestamptz not null default now()
);

-- Plan-check correction logs (one row per user).
create table if not exists public.corrections (
  user_id uuid primary key references auth.users (id) on delete cascade,
  data jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

-- Reusable libraries: anchor products, commodity presets (one row per user).
create table if not exists public.libraries (
  user_id uuid primary key references auth.users (id) on delete cascade,
  data jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

-- Engineer-verified code-value overrides (one row per user).
create table if not exists public.overrides (
  user_id uuid primary key references auth.users (id) on delete cascade,
  data jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

-- Turn on Row-Level Security for every table.
alter table public.firm_profiles enable row level security;
alter table public.projects      enable row level security;
alter table public.corrections   enable row level security;
alter table public.libraries     enable row level security;
alter table public.overrides     enable row level security;

-- One policy set per table: a user may only touch rows where user_id = them.
do $$
declare
  t text;
begin
  foreach t in array array['firm_profiles', 'projects', 'corrections', 'libraries', 'overrides']
  loop
    execute format('drop policy if exists own_select on public.%I;', t);
    execute format('create policy own_select on public.%I for select using (auth.uid() = user_id);', t);

    execute format('drop policy if exists own_insert on public.%I;', t);
    execute format('create policy own_insert on public.%I for insert with check (auth.uid() = user_id);', t);

    execute format('drop policy if exists own_update on public.%I;', t);
    execute format('create policy own_update on public.%I for update using (auth.uid() = user_id) with check (auth.uid() = user_id);', t);

    execute format('drop policy if exists own_delete on public.%I;', t);
    execute format('create policy own_delete on public.%I for delete using (auth.uid() = user_id);', t);
  end loop;
end $$;
