-- ============================================
-- TABLE: users (managed by Supabase Auth)
-- Supabase creates auth.users automatically.
-- We create a public profile table that syncs.
-- ============================================

CREATE TABLE public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT,
    location TEXT,
    linkedin_url TEXT,
    portfolio_url TEXT,
    master_profile JSONB,          -- Parsed resume as structured JSON
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- TABLE: resumes
-- Stores metadata about uploaded resume files
-- ============================================

CREATE TABLE public.resumes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    file_name TEXT NOT NULL,
    file_path TEXT NOT NULL,         -- Supabase Storage path
    file_size INTEGER,
    parsed_json JSONB,              -- AI-extracted structured data
    is_primary BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_resumes_user_id ON public.resumes(user_id);

-- ============================================
-- TABLE: portal_credentials
-- Encrypted credentials for job portals
-- ============================================

CREATE TABLE public.portal_credentials (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    portal_name TEXT NOT NULL,       -- 'indeed', 'glassdoor', 'wellfound'
    encrypted_email TEXT NOT NULL,   -- AES-256 encrypted
    iv_email TEXT NOT NULL,          -- IV for email encryption
    encrypted_password TEXT NOT NULL,-- AES-256 encrypted
    iv_password TEXT NOT NULL,       -- IV for password encryption
    is_verified BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, portal_name)
);

-- ============================================
-- TABLE: job_applications
-- Core table tracking every application
-- ============================================

CREATE TYPE application_status AS ENUM (
    'queued',
    'in_progress',
    'captcha_paused',
    'submitted',
    'failed',
    'skipped'
);

CREATE TABLE public.job_applications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    job_url TEXT NOT NULL,
    portal_name TEXT NOT NULL,
    job_title TEXT,
    company_name TEXT,
    status application_status DEFAULT 'queued',
    error_message TEXT,
    screenshot_path TEXT,            -- Screenshot of submitted form
    applied_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_applications_user_id ON public.job_applications(user_id);
CREATE INDEX idx_applications_status ON public.job_applications(status);

-- ============================================
-- TABLE: application_logs
-- Detailed step-by-step logs for debugging
-- ============================================

CREATE TABLE public.application_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    application_id UUID NOT NULL REFERENCES public.job_applications(id) ON DELETE CASCADE,
    step TEXT NOT NULL,              -- 'login', 'navigate', 'fill_form', 'submit'
    message TEXT NOT NULL,
    level TEXT DEFAULT 'info',       -- 'info', 'warn', 'error'
    metadata JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_logs_application_id ON public.application_logs(application_id);

-- ============================================
-- Row Level Security (RLS) — CRITICAL
-- Users can only see their own data
-- ============================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.resumes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.portal_credentials ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.job_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.application_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile"
    ON public.profiles FOR ALL
    USING (auth.uid() = id);

CREATE POLICY "Users can manage own resumes"
    ON public.resumes FOR ALL
    USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own credentials"
    ON public.portal_credentials FOR ALL
    USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own applications"
    ON public.job_applications FOR ALL
    USING (auth.uid() = user_id);

CREATE POLICY "Users can view own logs"
    ON public.application_logs FOR ALL
    USING (
        application_id IN (
            SELECT id FROM public.job_applications
            WHERE user_id = auth.uid()
        )
    );

-- ============================================
-- Profile Sync Trigger
-- Automatically create a profile entry when a new user signs up
-- ============================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, email)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
    NEW.email
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger should only run after a new user is created in auth.users
CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();