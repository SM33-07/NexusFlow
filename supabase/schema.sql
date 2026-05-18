-- Nexus deploy-ready Supabase schema.
-- Run this once in the Supabase SQL Editor, then run supabase/seed.sql.

create extension if not exists "pgcrypto";

do $$ begin
  create type public.user_role as enum ('employee', 'manager', 'admin');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.goal_status as enum ('draft', 'submitted', 'approved', 'returned', 'completed', 'at_risk', 'on_track', 'not_started');
exception when duplicate_object then null; end $$;

alter type public.goal_status add value if not exists 'not_started';

create table if not exists public.profiles (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  email text unique not null,
  password_hash text not null,
  session_version int not null default 1,
  role public.user_role not null default 'employee',
  job_title text not null default 'Employee',
  department text not null default 'Business',
  manager_id uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.profiles add column if not exists password_hash text;
alter table public.profiles add column if not exists session_version int not null default 1;
alter table public.profiles add column if not exists updated_at timestamptz not null default now();

create table if not exists public.goals (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.profiles(id) on delete cascade,
  parent_goal_id uuid references public.goals(id) on delete set null,
  shared_goal_id uuid,
  primary_owner_id uuid references public.profiles(id) on delete set null,
  title text not null,
  description text not null default '',
  category text not null default 'Product Innovation',
  uom_type text not null check (uom_type in ('Min (Higher is better)', 'Max (Lower is better)', 'Timeline', 'Zero-based')),
  target_value text not null,
  baseline_value numeric,
  weightage int not null check (weightage >= 0 and weightage <= 100),
  status public.goal_status not null default 'draft',
  progress int not null default 0 check (progress >= 0 and progress <= 100),
  position_x numeric not null default 250,
  position_y numeric not null default 250,
  is_hub boolean not null default false,
  is_shared boolean not null default false,
  locked boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.goals add column if not exists shared_goal_id uuid;
alter table public.goals add column if not exists primary_owner_id uuid references public.profiles(id) on delete set null;
alter table public.goals add column if not exists description text not null default '';
alter table public.goals add column if not exists is_shared boolean not null default false;

create table if not exists public.quarterly_updates (
  id uuid primary key default gen_random_uuid(),
  goal_id uuid not null references public.goals(id) on delete cascade,
  quarter text not null,
  actual_value text not null,
  achievement_status text not null default 'On Track' check (achievement_status in ('Not Started', 'On Track', 'Completed')),
  computed_score int not null check (computed_score >= 0 and computed_score <= 100),
  comment text,
  created_at timestamptz not null default now()
);

alter table public.quarterly_updates add column if not exists achievement_status text not null default 'On Track';

create table if not exists public.check_ins (
  id uuid primary key default gen_random_uuid(),
  employee_id uuid not null references public.profiles(id) on delete cascade,
  manager_id uuid not null references public.profiles(id) on delete cascade,
  comment text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.audit_logs (
  id uuid primary key default gen_random_uuid(),
  actor_id uuid references public.profiles(id) on delete set null,
  action text not null,
  entity_type text not null,
  entity_id uuid,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.notification_logs (
  id uuid primary key default gen_random_uuid(),
  recipient_id uuid references public.profiles(id) on delete set null,
  channel text not null check (channel in ('email', 'teams')),
  event_type text not null,
  title text not null,
  message text not null,
  deep_link text not null default '/',
  status text not null default 'queued' check (status in ('queued', 'sent', 'failed')),
  created_at timestamptz not null default now()
);

create table if not exists public.escalation_rules (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  trigger_type text not null check (trigger_type in ('goal_submission_overdue', 'manager_approval_overdue', 'checkin_overdue')),
  threshold_days int not null default 3,
  first_notify_role public.user_role not null default 'employee',
  second_notify_role public.user_role not null default 'manager',
  final_notify_role public.user_role not null default 'admin',
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.escalation_logs (
  id uuid primary key default gen_random_uuid(),
  rule_id uuid references public.escalation_rules(id) on delete set null,
  employee_id uuid references public.profiles(id) on delete set null,
  manager_id uuid references public.profiles(id) on delete set null,
  level int not null default 1,
  message text not null,
  status text not null default 'open' check (status in ('open', 'resolved')),
  created_at timestamptz not null default now()
);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists set_profiles_updated_at on public.profiles;
create trigger set_profiles_updated_at
before update on public.profiles
for each row execute function public.set_updated_at();

drop trigger if exists set_goals_updated_at on public.goals;
create trigger set_goals_updated_at
before update on public.goals
for each row execute function public.set_updated_at();

create index if not exists profiles_email_idx on public.profiles (lower(email));
create index if not exists profiles_manager_id_idx on public.profiles (manager_id);
create index if not exists goals_owner_id_idx on public.goals (owner_id);
create index if not exists goals_parent_goal_id_idx on public.goals (parent_goal_id);
create index if not exists quarterly_updates_goal_id_idx on public.quarterly_updates (goal_id);
create index if not exists check_ins_employee_id_idx on public.check_ins (employee_id);
create index if not exists escalation_logs_status_idx on public.escalation_logs (status);

alter table public.profiles enable row level security;
alter table public.goals enable row level security;
alter table public.quarterly_updates enable row level security;
alter table public.check_ins enable row level security;
alter table public.audit_logs enable row level security;
alter table public.notification_logs enable row level security;
alter table public.escalation_rules enable row level security;
alter table public.escalation_logs enable row level security;

drop policy if exists "profiles no direct client access" on public.profiles;
drop policy if exists "goals no direct client access" on public.goals;
drop policy if exists "updates no direct client access" on public.quarterly_updates;
drop policy if exists "checkins no direct client access" on public.check_ins;
drop policy if exists "audit no direct client access" on public.audit_logs;
drop policy if exists "notifications no direct client access" on public.notification_logs;
drop policy if exists "rules no direct client access" on public.escalation_rules;
drop policy if exists "escalations no direct client access" on public.escalation_logs;

create policy "profiles no direct client access" on public.profiles for all using (false) with check (false);
create policy "goals no direct client access" on public.goals for all using (false) with check (false);
create policy "updates no direct client access" on public.quarterly_updates for all using (false) with check (false);
create policy "checkins no direct client access" on public.check_ins for all using (false) with check (false);
create policy "audit no direct client access" on public.audit_logs for all using (false) with check (false);
create policy "notifications no direct client access" on public.notification_logs for all using (false) with check (false);
create policy "rules no direct client access" on public.escalation_rules for all using (false) with check (false);
create policy "escalations no direct client access" on public.escalation_logs for all using (false) with check (false);

-- The Next.js backend uses SUPABASE_SERVICE_ROLE_KEY server-side.
-- Do not expose SUPABASE_SERVICE_ROLE_KEY to the browser.
