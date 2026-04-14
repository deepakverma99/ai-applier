# AI Applier Project Initialization Plan

This plan covers the initial setup of the AI Applier application, including the frontend (Next.js), backend (Express.js), and database schema (Supabase/PostgreSQL).

## User Review Required

> [!IMPORTANT]
> **Supabase Credentials**: You will need to provide your Supabase Project URL and Service Role Key (for the server) and Anon Key (for the client) in the `.env` files once established.
> **Database Schema**: I will provide the SQL to run in your Supabase SQL Editor.

## Proposed Changes

### Project Structure
The project will be organized into two main directories:
- `client/`: Next.js application for user interface and profile management.
- `server/`: Express.js application for API gateway and background worker logic.

---

### [NEW] client/ (Next.js Frontend)
- Initialize Next.js using `create-next-app` with TypeScript, ESLint, and Tailwind CSS.
- Dependencies: `@supabase/supabase-js`, `lucide-react`, `axios`.

### [NEW] server/ (Express Backend)
- Initialize a Node.js project with TypeScript.
- Dependencies: `express`, `@supabase/supabase-js`, `dotenv`, `cors`, `bullmq`, `ioredis`.
- Structure:
  - `src/index.ts`: Entry point.
  - `src/config/`: Configuration files.
  - `src/services/`: Supabase and other service logic.

### [NEW] Database Schema (Supabase/PostgreSQL)
I will provide the following SQL to be run in the Supabase SQL Editor. This schema follows the requirements for User profiles, Resume tracking, and Job Application status.

```sql
-- Create a table for public profiles
create table profiles (
  id uuid references auth.users on delete cascade not null primary key,
  updated_at timestamp with time zone,
  full_name text,
  email text unique
);

-- Set up Row Level Security (RLS) for profiles
alter table profiles enable row level security;
create policy "Public profiles are viewable by everyone." on profiles for select using (true);
create policy "Users can insert their own profile." on profiles for insert with check (auth.uid() = id);
create policy "Users can update own profile." on profiles for update using (auth.uid() = id);

-- Create a table for resumes
create table resumes (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references profiles(id) on delete cascade not null,
  raw_resume_url text,
  structured_data jsonb,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- RLS for resumes
alter table resumes enable row level security;
create policy "Users can manage their own resumes." on resumes for all using (auth.uid() = user_id);

-- Create a table for job applications
create table applications (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references profiles(id) on delete cascade not null,
  portal_name text not null,
  job_title text not null,
  job_url text not null,
  status text check (status in ('pending', 'applied', 'failed', 'in_progress')) default 'pending',
  logs jsonb,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- RLS for applications
alter table applications enable row level security;
create policy "Users can manage their own applications." on applications for all using (auth.uid() = user_id);

-- Create a table for portal credentials (encrypted)
create table portal_credentials (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references profiles(id) on delete cascade not null,
  portal_name text not null,
  encrypted_creds text not null,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now(),
  unique(user_id, portal_name)
);

-- RLS for portal_credentials
alter table portal_credentials enable row level security;
create policy "Users can manage their own credentials." on portal_credentials for all using (auth.uid() = user_id);
```

## Open Questions
- Do you have a Supabase project already created, or should I just provide the SQL for you to run?
- For encryption of credentials, should I use a simple AES-256 implementation in the Express server, or do you have a preference?

## Verification Plan

### Automated Tests
- N/A for initialization.

### Manual Verification
1. Verify `client` starts and connects to Supabase (anon).
2. Verify `server` starts and connects to Supabase (service role).
3. Run the provided SQL in Supabase SQL editor to confirm tables are created.
