# SEC TRANSPORT

College bus tracking dashboard with role-based login and attendance (Admin, Driver, Student, Faculty), built with Next.js and Supabase.

## Project bundle

The complete project source bundle will be added here as `sec-transport-role-login-attendance.zip`. Download the ZIP from the repository, extract it, then follow its `README.md` for local setup and Supabase configuration.

## Stack
- Next.js / React / TypeScript
- Supabase Auth + PostgreSQL + Row Level Security
- Leaflet / OpenStreetMap for the transport map

## Important
- Never commit `.env.local` or Supabase service-role keys.
- The dashboard fleet data is still demo/mock data; authentication and attendance are Supabase-backed.
