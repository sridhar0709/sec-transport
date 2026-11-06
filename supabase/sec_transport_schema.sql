-- SEC TRANSPORT: initial schema for role-based login + bus attendance.
-- Run in Supabase Dashboard > SQL Editor as project owner.

create extension if not exists pgcrypto;
create schema if not exists private;
revoke all on schema private from public;
grant usage on schema private to authenticated;

create table if not exists public.routes (
  id uuid primary key default gen_random_uuid(),
  route_code text not null unique,
  name text not null,
  driver_id uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now()
);

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  login_id text not null unique,
  full_name text not null,
  role text not null check (role in ('admin', 'driver', 'student', 'faculty')),
  department text,
  route_id uuid references public.routes(id) on delete set null,
  created_at timestamptz not null default now()
);

create table if not exists public.attendance (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.profiles(id) on delete cascade,
  route_id uuid not null references public.routes(id) on delete restrict,
  attendance_date date not null,
  trip_type text not null check (trip_type in ('morning', 'evening')),
  status text not null check (status in ('present', 'absent')),
  marked_by uuid not null references auth.users(id) on delete restrict,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (student_id, attendance_date, trip_type)
);

create index if not exists profiles_role_route_idx on public.profiles(role, route_id);
create index if not exists attendance_date_trip_idx on public.attendance(attendance_date, trip_type);
create index if not exists attendance_student_idx on public.attendance(student_id, attendance_date desc);

-- Small, narrowly scoped helpers. They accept no user-supplied identity and only
-- read the signed-in user's own profile. Keep them in the non-exposed private schema.
create or replace function private.current_role()
returns text
language sql
stable
security definer
set search_path = ''
as $$
  select p.role
  from public.profiles p
  where p.id = (select auth.uid())
  limit 1;
$$;

create or replace function private.current_route_id()
returns uuid
language sql
stable
security definer
set search_path = ''
as $$
  select p.route_id
  from public.profiles p
  where p.id = (select auth.uid())
  limit 1;
$$;

revoke all on function private.current_role() from public;
revoke all on function private.current_route_id() from public;
grant execute on function private.current_role() to authenticated;
grant execute on function private.current_route_id() to authenticated;

alter table public.routes enable row level security;
alter table public.profiles enable row level security;
alter table public.attendance enable row level security;

-- Profiles: a user can see themselves; faculty/admin can see student rosters;
-- drivers can see students on their assigned route. No client-side profile writes.
drop policy if exists "profiles_select_scope" on public.profiles;
create policy "profiles_select_scope" on public.profiles
for select to authenticated
using (
  id = (select auth.uid())
  or private.current_role() in ('admin', 'faculty')
  or (private.current_role() = 'driver' and route_id = private.current_route_id())
);

-- Routes visible to admin/faculty, assigned driver, and students assigned to route.
drop policy if exists "routes_select_scope" on public.routes;
create policy "routes_select_scope" on public.routes
for select to authenticated
using (
  private.current_role() in ('admin', 'faculty')
  or driver_id = (select auth.uid())
  or id = private.current_route_id()
);

-- Attendance visibility: admins/faculty see college transport records;
-- students see only their own; drivers see their route only.
drop policy if exists "attendance_select_scope" on public.attendance;
create policy "attendance_select_scope" on public.attendance
for select to authenticated
using (
  private.current_role() in ('admin', 'faculty')
  or student_id = (select auth.uid())
  or (private.current_role() = 'driver' and route_id = private.current_route_id())
);

-- Only faculty/admin, or a driver assigned to this exact route, may create attendance.
drop policy if exists "attendance_insert_markers" on public.attendance;
create policy "attendance_insert_markers" on public.attendance
for insert to authenticated
with check (
  marked_by = (select auth.uid())
  and (
    private.current_role() in ('admin', 'faculty')
    or (private.current_role() = 'driver' and route_id = private.current_route_id())
  )
  and exists (
    select 1 from public.profiles student_profile
    where student_profile.id = attendance.student_id
      and student_profile.role = 'student'
      and student_profile.route_id = attendance.route_id
  )
);

-- UPDATE needs both USING and WITH CHECK. This prevents changing marker/route/student.
drop policy if exists "attendance_update_markers" on public.attendance;
create policy "attendance_update_markers" on public.attendance
for update to authenticated
using (
  private.current_role() in ('admin', 'faculty')
  or (private.current_role() = 'driver' and route_id = private.current_route_id())
)
with check (
  marked_by = (select auth.uid())
  and (
    private.current_role() in ('admin', 'faculty')
    or (private.current_role() = 'driver' and route_id = private.current_route_id())
  )
  and exists (
    select 1 from public.profiles student_profile
    where student_profile.id = attendance.student_id
      and student_profile.role = 'student'
      and student_profile.route_id = attendance.route_id
  )
);

-- Only admins may delete attendance rows.
drop policy if exists "attendance_delete_admin" on public.attendance;
create policy "attendance_delete_admin" on public.attendance
for delete to authenticated
using (private.current_role() = 'admin');

-- Explicit Data API grants; RLS still controls every row.
grant select on public.profiles to authenticated;
grant select on public.routes to authenticated;
grant select, insert, update, delete on public.attendance to authenticated;

-- NOTE: Create Supabase Auth users first, then insert their matching profile rows.
-- Never allow public self-registration to choose their own role.
