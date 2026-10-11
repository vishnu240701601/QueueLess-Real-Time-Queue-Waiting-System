-- =====================================================================
-- QueueLess - Database Schema Definition (01_schema.sql)
-- Target: PostgreSQL 14+ / Supabase Cloud
-- Tables: profiles, services, staff_services, queue_sessions,
--         tokens, notifications, service_history
-- =====================================================================

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2. ENUM TYPES
DO $$ BEGIN
    CREATE TYPE user_role AS ENUM ('student', 'staff', 'admin');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE session_status AS ENUM ('active', 'paused', 'closed');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE token_status AS ENUM ('waiting', 'called', 'serving', 'completed', 'cancelled', 'skipped');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 3. COMMON TRIGGER FUNCTION: AUTO-UPDATE updated_at
CREATE OR REPLACE FUNCTION public.trigger_set_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 4. TABLE: profiles (Referencing auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT NOT NULL,
    role user_role NOT NULL DEFAULT 'student',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

DROP TRIGGER IF EXISTS set_profiles_timestamp ON public.profiles;
CREATE TRIGGER set_profiles_timestamp
BEFORE UPDATE ON public.profiles
FOR EACH ROW EXECUTE FUNCTION public.trigger_set_timestamp();

-- 5. TABLE: services (Counters/Service points e.g. Canteen, Photocopy, Accounts)
CREATE TABLE IF NOT EXISTS public.services (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT,
    is_active BOOLEAN NOT NULL DEFAULT true,
    avg_service_time_mins INTEGER NOT NULL DEFAULT 5,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

DROP TRIGGER IF EXISTS set_services_timestamp ON public.services;
CREATE TRIGGER set_services_timestamp
BEFORE UPDATE ON public.services
FOR EACH ROW EXECUTE FUNCTION public.trigger_set_timestamp();

-- 6. TABLE: staff_services (Staff assignments to services)
CREATE TABLE IF NOT EXISTS public.staff_services (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    staff_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    service_id UUID NOT NULL REFERENCES public.services(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_staff_service UNIQUE(staff_id, service_id)
);

-- 7. TABLE: queue_sessions (Daily sessions per service)
CREATE TABLE IF NOT EXISTS public.queue_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    service_id UUID NOT NULL REFERENCES public.services(id) ON DELETE CASCADE,
    session_date DATE NOT NULL DEFAULT CURRENT_DATE,
    status session_status NOT NULL DEFAULT 'active',
    next_token_number INTEGER NOT NULL DEFAULT 1,
    current_token_id UUID,                      -- Forward reference to tokens(id)
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_service_session_date UNIQUE(service_id, session_date)
);

DROP TRIGGER IF EXISTS set_queue_sessions_timestamp ON public.queue_sessions;
CREATE TRIGGER set_queue_sessions_timestamp
BEFORE UPDATE ON public.queue_sessions
FOR EACH ROW EXECUTE FUNCTION public.trigger_set_timestamp();

-- 8. TABLE: tokens (Individual queue entries)
CREATE TABLE IF NOT EXISTS public.tokens (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    service_id UUID NOT NULL REFERENCES public.services(id) ON DELETE RESTRICT,
    queue_session_id UUID NOT NULL REFERENCES public.queue_sessions(id) ON DELETE CASCADE,
    token_number INTEGER NOT NULL,
    status token_status NOT NULL DEFAULT 'waiting',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    called_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    -- Prevent duplicate token numbers within the same queue session
    CONSTRAINT uq_session_token_number UNIQUE(queue_session_id, token_number)
);

DROP TRIGGER IF EXISTS set_tokens_timestamp ON public.tokens;
CREATE TRIGGER set_tokens_timestamp
BEFORE UPDATE ON public.tokens
FOR EACH ROW EXECUTE FUNCTION public.trigger_set_timestamp();

-- 9. ADD FOREIGN KEY FROM queue_sessions.current_token_id TO tokens(id)
DO $$ BEGIN
    ALTER TABLE public.queue_sessions
    ADD CONSTRAINT fk_queue_sessions_current_token
    FOREIGN KEY (current_token_id) REFERENCES public.tokens(id) ON DELETE SET NULL;
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 10. TABLE: notifications (In-app notifications for students/staff)
CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    token_id UUID REFERENCES public.tokens(id) ON DELETE CASCADE,
    message TEXT NOT NULL,
    is_read BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 11. TABLE: service_history (Audit log & performance metrics)
CREATE TABLE IF NOT EXISTS public.service_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    token_id UUID NOT NULL REFERENCES public.tokens(id) ON DELETE CASCADE,
    service_id UUID NOT NULL REFERENCES public.services(id) ON DELETE CASCADE,
    staff_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    wait_duration_seconds INTEGER,
    service_duration_seconds INTEGER,
    action TEXT NOT NULL,                      -- 'completed', 'cancelled', 'skipped'
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 12. HIGH-PERFORMANCE INDEXES
CREATE INDEX IF NOT EXISTS idx_tokens_session_status ON public.tokens(queue_session_id, status, token_number);
CREATE INDEX IF NOT EXISTS idx_tokens_user_history ON public.tokens(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_user_unread ON public.notifications(user_id, is_read, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_service_history_service_date ON public.service_history(service_id, created_at);

-- PARTIAL UNIQUE INDEX: Restrict user to at most ONE active token per service
CREATE UNIQUE INDEX IF NOT EXISTS idx_single_active_token_per_service
ON public.tokens (user_id, service_id)
WHERE status IN ('waiting', 'called', 'serving');

-- 13. SECURITY TRIGGER: PREVENT PRIVILEGE ESCALATION
-- Ensures new users ALWAYS default to 'student' and cannot grant themselves 'admin' or 'staff'
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, role)
  VALUES (
    new.id,
    COALESCE(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
    'student' -- Always force 'student' role on signup
  )
  ON CONFLICT (id) DO UPDATE
  SET full_name = EXCLUDED.full_name;
  RETURN new;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Trigger preventing non-admins from changing roles in profiles table
CREATE OR REPLACE FUNCTION public.protect_user_role()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  IF NEW.role <> OLD.role THEN
    -- Only existing admins can modify roles
    IF NOT EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role = 'admin'
    ) THEN
      RAISE EXCEPTION 'FORBIDDEN: Only administrators can modify user roles.';
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS check_profile_role_change ON public.profiles;
CREATE TRIGGER check_profile_role_change
BEFORE UPDATE ON public.profiles
FOR EACH ROW EXECUTE FUNCTION public.protect_user_role();
