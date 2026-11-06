# SEC TRANSPORT: role login + attendance

This is an update to the SEC TRANSPORT Next.js demo. It adds institutional ID/password login, four account roles, role-gated pages, and Supabase-backed attendance marking.

## Roles

- **Admin**: `/portal/admin` (the existing TransportApp dashboard, currently still demo data)
- **Driver**: marks attendance for students assigned to their route
- **Faculty**: marks attendance for route-assigned students across the college
- **Student**: can view only their own attendance history

The login screen does not let users choose a role. The role comes from the protected `profiles` database row.

## 1. Install packages

From the project root in VS Code terminal:

```powershell
npm install
```

If you get missing Supabase modules, run:

```powershell
npm install @supabase/ssr @supabase/supabase-js
```

## 2. Add environment variables

Copy `.env.example` to `.env.local` in the project root. In Supabase Dashboard, open **Project Settings → API** and copy the Project URL and publishable key (or legacy anon key).

```env
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT_REF.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=YOUR_PUBLISHABLE_OR_ANON_KEY
NEXT_PUBLIC_SEC_LOGIN_DOMAIN=sec-transport-login.com
```

Restart `npm run dev` after editing `.env.local`.

## 3. Create database tables and RLS

1. Open Supabase Dashboard → **SQL Editor**.
2. Open `supabase/sec_transport_schema.sql` from this project and run the entire SQL script.
3. Confirm the tables `profiles`, `routes`, and `attendance` exist.

The script enables RLS and sets access policies. Do not remove those policies or expose the service-role key in browser code.

## 4. Important Auth configuration

These logins use an internal email-style identifier because Supabase Auth's password method accepts email or phone. A person types their SEC ID, and the app maps it to:

`lowercase-login-id@sec-transport-login.com`

That domain is an **internal username namespace**, not a real mailbox. Keep it consistent between `.env.local` and the accounts you create.

In Supabase Dashboard → Authentication → Settings:

- **Disable public sign-ups / new user registration.** Only the institution admin should provision accounts.
- Do not rely on a user-selected role or `user_metadata` for permissions.
- When creating each user in Authentication → Users, use **Auto Confirm User** if shown. Do not send confirmation emails to the internal placeholder address.

If your Supabase Auth settings require email confirmation and the Dashboard does not allow auto-confirming an account, configure the institution's real email-based login instead. Do not use placeholder inboxes for password recovery.

## 5. Provision accounts (admin-only)

Create each Auth user in **Authentication → Users → Add user**. Example login IDs and corresponding Auth emails:

| Role | Login ID | Auth email to create |
|---|---|---|
| Admin | `admin001` | `admin001@sec-transport-login.com` |
| Driver | `drv001` | `drv001@sec-transport-login.com` |
| Faculty | `fac001` | `fac001@sec-transport-login.com` |
| Student | `stu24018` | `stu24018@sec-transport-login.com` |

Set a temporary password securely and deliver it privately. Require users to change it after first login in a future enhancement. Never reuse one password for all accounts.

After creating an Auth user, copy that user's UUID from Authentication → Users. Then add the profile from SQL Editor. Example (replace the UUID):

```sql
insert into public.profiles (id, login_id, full_name, role, department)
values ('AUTH_USER_UUID', 'admin001', 'Transport Administrator', 'admin', null);
```

### Add a route and driver

Create the driver Auth account first, then insert a route using the driver's Auth UUID:

```sql
insert into public.routes (route_code, name, driver_id)
values ('R-01', 'Salem Central', 'DRIVER_AUTH_USER_UUID')
returning id;
```

Copy the returned route UUID and insert the driver's profile:

```sql
insert into public.profiles (id, login_id, full_name, role, route_id)
values ('DRIVER_AUTH_USER_UUID', 'drv001', 'Driver Name', 'driver', 'ROUTE_UUID');
```

Assign a student to the route by inserting their profile with the same route UUID:

```sql
insert into public.profiles (id, login_id, full_name, role, department, route_id)
values ('STUDENT_AUTH_USER_UUID', 'stu24018', 'Student Name', 'student', 'AI&DS · II Year', 'ROUTE_UUID');
```

Create faculty profiles with `role = 'faculty'` and no route assignment unless you decide to scope faculty to a route later.

## 6. Run locally

```powershell
npm run dev
```

Open `http://localhost:3000`. It redirects to `/login`. After sign-in, the role is read from `profiles` and the user is sent to `/portal`.

## File map

```text
.env.example
middleware.ts
supabase/sec_transport_schema.sql
src/lib/supabase/client.ts
src/lib/supabase/server.ts
src/components/LogoutButton.tsx
src/app/page.tsx                         # redirects to login or portal
src/app/login/page.tsx                    # ID + password login
src/app/portal/page.tsx                   # role-aware workspace
src/app/portal/admin/page.tsx              # Admin-only existing dashboard
src/app/portal/attendance/page.tsx          # Driver/Faculty/Admin gate
src/app/portal/attendance/AttendanceClient.tsx
src/app/portal/student-attendance/page.tsx  # Student-only attendance history
src/app/globals.css                        # role login and portal styles
```

## Attendance behavior

- Driver: can read/mark attendance only for students assigned to the driver's route.
- Faculty: can read/mark attendance for route-assigned students.
- Admin: can manage/review attendance.
- Student: can read only their own attendance.
- Each student can have one attendance record per date and trip (`morning` or `evening`). Marking present/absent again updates that row.

## Important limitations / next steps

- The old Admin `TransportApp` dashboard still uses mock fleet/student values. Login and attendance use Supabase; dashboard cards/tables need separate query integration.
- No public account registration, parent portal, GPS tracking, SMS, or password-reset workflow is included yet.
- Before production, configure institution email/password policy, MFA for Admin, backups, audit logs, and review the SQL/RLS policies with your institution.
