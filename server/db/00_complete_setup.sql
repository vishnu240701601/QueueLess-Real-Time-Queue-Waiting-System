-- =====================================================================
-- QueueLess - Consolidated Complete Database Setup (00_complete_setup.sql)
-- Copy and paste this ENTIRE script into the Supabase SQL Editor
-- to execute the full schema, functions, RLS, Realtime, and seeds in one go.
-- =====================================================================

-- ---------------------------------------------------------------------
-- 1. EXTENSIONS & ENUMS
-- ---------------------------------------------------------------------
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

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

CREATE OR REPLACE FUNCTION public.trigger_set_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ---------------------------------------------------------------------
-- 2. TABLES
-- ---------------------------------------------------------------------

-- Profiles (extends Supabase auth.users)
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

-- Services (counters/service points)
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

-- Staff Services (assignments)
CREATE TABLE IF NOT EXISTS public.staff_services (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    staff_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    service_id UUID NOT NULL REFERENCES public.services(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_staff_service UNIQUE(staff_id, service_id)
);

-- Queue Sessions (daily service sessions)
CREATE TABLE IF NOT EXISTS public.queue_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    service_id UUID NOT NULL REFERENCES public.services(id) ON DELETE CASCADE,
    session_date DATE NOT NULL DEFAULT CURRENT_DATE,
    status session_status NOT NULL DEFAULT 'active',
    next_token_number INTEGER NOT NULL DEFAULT 1,
    current_token_id UUID,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_service_session_date UNIQUE(service_id, session_date)
);

DROP TRIGGER IF EXISTS set_queue_sessions_timestamp ON public.queue_sessions;
CREATE TRIGGER set_queue_sessions_timestamp
BEFORE UPDATE ON public.queue_sessions
FOR EACH ROW EXECUTE FUNCTION public.trigger_set_timestamp();

-- Tokens
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
    CONSTRAINT uq_session_token_number UNIQUE(queue_session_id, token_number)
);

DROP TRIGGER IF EXISTS set_tokens_timestamp ON public.tokens;
CREATE TRIGGER set_tokens_timestamp
BEFORE UPDATE ON public.tokens
FOR EACH ROW EXECUTE FUNCTION public.trigger_set_timestamp();

-- Link queue_sessions.current_token_id to tokens(id)
DO $$ BEGIN
    ALTER TABLE public.queue_sessions
    ADD CONSTRAINT fk_queue_sessions_current_token
    FOREIGN KEY (current_token_id) REFERENCES public.tokens(id) ON DELETE SET NULL;
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Notifications
CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    token_id UUID REFERENCES public.tokens(id) ON DELETE CASCADE,
    message TEXT NOT NULL,
    is_read BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Service History
CREATE TABLE IF NOT EXISTS public.service_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    token_id UUID NOT NULL REFERENCES public.tokens(id) ON DELETE CASCADE,
    service_id UUID NOT NULL REFERENCES public.services(id) ON DELETE CASCADE,
    staff_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    wait_duration_seconds INTEGER,
    service_duration_seconds INTEGER,
    action TEXT NOT NULL,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ---------------------------------------------------------------------
-- 3. INDEXES & CONSTRAINTS
-- ---------------------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_tokens_session_status ON public.tokens(queue_session_id, status, token_number);
CREATE INDEX IF NOT EXISTS idx_tokens_user_history ON public.tokens(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_user_unread ON public.notifications(user_id, is_read, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_service_history_service_date ON public.service_history(service_id, created_at);

-- Partial Unique Index: Single active token per user per service
CREATE UNIQUE INDEX IF NOT EXISTS idx_single_active_token_per_service
ON public.tokens (user_id, service_id)
WHERE status IN ('waiting', 'called', 'serving');

-- ---------------------------------------------------------------------
-- 4. SECURITY TRIGGERS (ROLE PRIVILEGE PROTECTION)
-- ---------------------------------------------------------------------
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
    'student'
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

CREATE OR REPLACE FUNCTION public.protect_user_role()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  IF NEW.role <> OLD.role THEN
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

-- ---------------------------------------------------------------------
-- 5. ATOMIC RPC FUNCTIONS
-- ---------------------------------------------------------------------

-- A. rpc_generate_token
CREATE OR REPLACE FUNCTION public.rpc_generate_token(
    p_service_id UUID,
    p_user_id UUID
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_session RECORD;
    v_service RECORD;
    v_today DATE := CURRENT_DATE;
    v_token_number INTEGER;
    v_token_id UUID;
    v_people_ahead INTEGER := 0;
    v_est_wait_mins INTEGER := 0;
    v_active_exists BOOLEAN;
BEGIN
    SELECT EXISTS (
        SELECT 1 FROM public.tokens
        WHERE user_id = p_user_id
          AND service_id = p_service_id
          AND status IN ('waiting', 'called', 'serving')
    ) INTO v_active_exists;

    IF v_active_exists THEN
        RAISE EXCEPTION 'ACTIVE_TOKEN_EXISTS: You already hold an active token for this service.';
    END IF;

    SELECT id, name, is_active, avg_service_time_mins
    INTO v_service
    FROM public.services
    WHERE id = p_service_id;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'SERVICE_NOT_FOUND: Service does not exist.';
    END IF;

    IF NOT v_service.is_active THEN
        RAISE EXCEPTION 'SERVICE_INACTIVE: This service is currently deactivated.';
    END IF;

    INSERT INTO public.queue_sessions (service_id, session_date, status, next_token_number)
    VALUES (p_service_id, v_today, 'active', 1)
    ON CONFLICT (service_id, session_date) DO NOTHING;

    SELECT id, status, next_token_number
    INTO v_session
    FROM public.queue_sessions
    WHERE service_id = p_service_id AND session_date = v_today
    FOR UPDATE;

    IF v_session.status <> 'active' THEN
        RAISE EXCEPTION 'SESSION_NOT_ACTIVE: Queue session is % and cannot accept tokens.', v_session.status;
    END IF;

    v_token_number := v_session.next_token_number;

    UPDATE public.queue_sessions
    SET next_token_number = v_session.next_token_number + 1,
        updated_at = NOW()
    WHERE id = v_session.id;

    INSERT INTO public.tokens (
        user_id, service_id, queue_session_id, token_number, status, created_at
    ) VALUES (
        p_user_id, p_service_id, v_session.id, v_token_number, 'waiting', NOW()
    ) RETURNING id INTO v_token_id;

    SELECT COUNT(*) INTO v_people_ahead
    FROM public.tokens
    WHERE queue_session_id = v_session.id
      AND status = 'waiting'
      AND token_number < v_token_number;

    IF EXISTS (
        SELECT 1 FROM public.tokens
        WHERE queue_session_id = v_session.id
          AND status IN ('called', 'serving')
    ) THEN
        v_people_ahead := v_people_ahead + 1;
    END IF;

    v_est_wait_mins := v_people_ahead * v_service.avg_service_time_mins;

    INSERT INTO public.notifications (user_id, token_id, message)
    VALUES (
        p_user_id, v_token_id,
        format('You joined the queue for %s. Your token is #%s.', v_service.name, v_token_number)
    );

    RETURN jsonb_build_object(
        'success', true,
        'token_id', v_token_id,
        'token_number', v_token_number,
        'service_id', p_service_id,
        'service_name', v_service.name,
        'queue_session_id', v_session.id,
        'people_ahead', v_people_ahead,
        'estimated_wait_mins', v_est_wait_mins,
        'status', 'waiting'
    );
END;
$$;

-- B. rpc_call_next_token
CREATE OR REPLACE FUNCTION public.rpc_call_next_token(
    p_service_id UUID,
    p_staff_id UUID
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_session RECORD;
    v_active_serving RECORD;
    v_prev_called RECORD;
    v_next_token RECORD;
    v_service_name TEXT;
    v_auto_skipped_num INTEGER := NULL;
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM public.staff_services WHERE service_id = p_service_id AND staff_id = p_staff_id
    ) AND NOT EXISTS (
        SELECT 1 FROM public.profiles WHERE id = p_staff_id AND role = 'admin'
    ) THEN
        RAISE EXCEPTION 'FORBIDDEN: You are not assigned to manage this service.';
    END IF;

    SELECT id, status INTO v_session
    FROM public.queue_sessions
    WHERE service_id = p_service_id AND session_date = CURRENT_DATE
    FOR UPDATE;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'NO_SESSION: No queue session found for today.';
    END IF;

    SELECT id, token_number INTO v_active_serving
    FROM public.tokens
    WHERE queue_session_id = v_session.id AND status = 'serving';

    IF FOUND THEN
        RAISE EXCEPTION 'SERVICE_IN_PROGRESS: Token #% is currently being served. Complete it before calling next.', v_active_serving.token_number;
    END IF;

    FOR v_prev_called IN
        SELECT id, token_number, user_id, created_at, called_at
        FROM public.tokens
        WHERE queue_session_id = v_session.id AND status = 'called'
        FOR UPDATE
    LOOP
        UPDATE public.tokens
        SET status = 'skipped', completed_at = NOW(), updated_at = NOW()
        WHERE id = v_prev_called.id;

        v_auto_skipped_num := v_prev_called.token_number;

        INSERT INTO public.service_history (
            token_id, service_id, staff_id, user_id,
            wait_duration_seconds, action, notes
        ) VALUES (
            v_prev_called.id, p_service_id, p_staff_id, v_prev_called.user_id,
            EXTRACT(EPOCH FROM (NOW() - v_prev_called.created_at))::INTEGER,
            'skipped', 'Auto-skipped upon calling next token'
        );

        INSERT INTO public.notifications (user_id, token_id, message)
        VALUES (
            v_prev_called.user_id, v_prev_called.id,
            format('Your token #%s was skipped because you did not arrive when called.', v_prev_called.token_number)
        );
    END LOOP;

    SELECT id, token_number, user_id, created_at
    INTO v_next_token
    FROM public.tokens
    WHERE queue_session_id = v_session.id AND status = 'waiting'
    ORDER BY token_number ASC
    LIMIT 1
    FOR UPDATE SKIP LOCKED;

    IF NOT FOUND THEN
        UPDATE public.queue_sessions SET current_token_id = NULL, updated_at = NOW() WHERE id = v_session.id;
        RETURN jsonb_build_object(
            'success', false,
            'message', 'NO_WAITING_TOKENS: Queue is currently empty.',
            'skipped_token', v_auto_skipped_num
        );
    END IF;

    UPDATE public.tokens
    SET status = 'called', called_at = NOW(), updated_at = NOW()
    WHERE id = v_next_token.id;

    UPDATE public.queue_sessions
    SET current_token_id = v_next_token.id, updated_at = NOW()
    WHERE id = v_session.id;

    SELECT name INTO v_service_name FROM public.services WHERE id = p_service_id;

    INSERT INTO public.notifications (user_id, token_id, message)
    VALUES (
        v_next_token.user_id, v_next_token.id,
        format('Token #%s has been called for %s! Please proceed to the counter immediately.', v_next_token.token_number, v_service_name)
    );

    RETURN jsonb_build_object(
        'success', true,
        'token_id', v_next_token.id,
        'token_number', v_next_token.token_number,
        'status', 'called',
        'skipped_token', v_auto_skipped_num
    );
END;
$$;

-- C. rpc_update_token_status
CREATE OR REPLACE FUNCTION public.rpc_update_token_status(
    p_token_id UUID,
    p_new_status token_status,
    p_staff_id UUID,
    p_notes TEXT DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_token RECORD;
    v_wait_secs INTEGER := NULL;
    v_service_secs INTEGER := NULL;
BEGIN
    SELECT id, service_id, queue_session_id, user_id, token_number, status, created_at, called_at
    INTO v_token
    FROM public.tokens
    WHERE id = p_token_id
    FOR UPDATE;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'TOKEN_NOT_FOUND: Token does not exist.';
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM public.staff_services WHERE service_id = v_token.service_id AND staff_id = p_staff_id
    ) AND NOT EXISTS (
        SELECT 1 FROM public.profiles WHERE id = p_staff_id AND role = 'admin'
    ) THEN
        RAISE EXCEPTION 'FORBIDDEN: You are not authorized to update tokens for this service.';
    END IF;

    IF p_new_status = 'serving' THEN
        IF v_token.status <> 'called' THEN
            RAISE EXCEPTION 'INVALID_TRANSITION: Token #% must be "called" before starting service (currently %).', v_token.token_number, v_token.status;
        END IF;

        UPDATE public.tokens
        SET status = 'serving', updated_at = NOW()
        WHERE id = p_token_id;

        INSERT INTO public.notifications (user_id, token_id, message)
        VALUES (v_token.user_id, p_token_id, format('Your token #%s is now being served.', v_token.token_number));

    ELSIF p_new_status = 'completed' THEN
        IF v_token.status <> 'serving' THEN
            RAISE EXCEPTION 'INVALID_TRANSITION: Token #% must be "serving" before completion (currently %).', v_token.token_number, v_token.status;
        END IF;

        v_wait_secs := EXTRACT(EPOCH FROM (COALESCE(v_token.called_at, NOW()) - v_token.created_at))::INTEGER;
        v_service_secs := EXTRACT(EPOCH FROM (NOW() - COALESCE(v_token.called_at, NOW())))::INTEGER;

        UPDATE public.tokens
        SET status = 'completed', completed_at = NOW(), updated_at = NOW()
        WHERE id = p_token_id;

        UPDATE public.queue_sessions
        SET current_token_id = NULL, updated_at = NOW()
        WHERE id = v_token.queue_session_id AND current_token_id = p_token_id;

        INSERT INTO public.service_history (
            token_id, service_id, staff_id, user_id,
            wait_duration_seconds, service_duration_seconds,
            action, notes
        ) VALUES (
            p_token_id, v_token.service_id, p_staff_id, v_token.user_id,
            v_wait_secs, v_service_secs,
            'completed', p_notes
        );

        INSERT INTO public.notifications (user_id, token_id, message)
        VALUES (v_token.user_id, p_token_id, format('Your service for token #%s has been successfully completed. Thank you!', v_token.token_number));

    ELSIF p_new_status = 'skipped' THEN
        IF v_token.status <> 'called' THEN
            RAISE EXCEPTION 'INVALID_TRANSITION: Only "called" tokens can be marked as skipped.';
        END IF;

        UPDATE public.tokens
        SET status = 'skipped', completed_at = NOW(), updated_at = NOW()
        WHERE id = p_token_id;

        UPDATE public.queue_sessions
        SET current_token_id = NULL, updated_at = NOW()
        WHERE id = v_token.queue_session_id AND current_token_id = p_token_id;

        INSERT INTO public.service_history (
            token_id, service_id, staff_id, user_id,
            wait_duration_seconds, action, notes
        ) VALUES (
            p_token_id, v_token.service_id, p_staff_id, v_token.user_id,
            EXTRACT(EPOCH FROM (NOW() - v_token.created_at))::INTEGER,
            'skipped', COALESCE(p_notes, 'Staff marked skipped')
        );

    ELSE
        RAISE EXCEPTION 'UNSUPPORTED_STATUS: Status % cannot be set via this operation.', p_new_status;
    END IF;

    RETURN jsonb_build_object(
        'success', true,
        'token_id', p_token_id,
        'status', p_new_status,
        'wait_duration_seconds', v_wait_secs,
        'service_duration_seconds', v_service_secs
    );
END;
$$;

-- D. rpc_cancel_token
CREATE OR REPLACE FUNCTION public.rpc_cancel_token(
    p_token_id UUID,
    p_user_id UUID,
    p_reason TEXT DEFAULT 'Cancelled by user'
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_token RECORD;
    v_is_admin BOOLEAN := false;
BEGIN
    SELECT (role = 'admin') INTO v_is_admin
    FROM public.profiles WHERE id = p_user_id;

    SELECT id, service_id, queue_session_id, user_id, token_number, status, created_at
    INTO v_token
    FROM public.tokens
    WHERE id = p_token_id
    FOR UPDATE;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'TOKEN_NOT_FOUND: Token does not exist.';
    END IF;

    IF v_token.user_id <> p_user_id AND NOT COALESCE(v_is_admin, false) THEN
        RAISE EXCEPTION 'FORBIDDEN: You do not own this token.';
    END IF;

    IF v_token.status NOT IN ('waiting', 'called') THEN
        RAISE EXCEPTION 'CANNOT_CANCEL: Token #% is already % and cannot be cancelled.', v_token.token_number, v_token.status;
    END IF;

    UPDATE public.tokens
    SET status = 'cancelled', completed_at = NOW(), updated_at = NOW()
    WHERE id = p_token_id;

    UPDATE public.queue_sessions
    SET current_token_id = NULL, updated_at = NOW()
    WHERE id = v_token.queue_session_id AND current_token_id = p_token_id;

    INSERT INTO public.service_history (
        token_id, service_id, staff_id, user_id,
        wait_duration_seconds, action, notes
    ) VALUES (
        p_token_id, v_token.service_id, NULL, v_token.user_id,
        EXTRACT(EPOCH FROM (NOW() - v_token.created_at))::INTEGER,
        'cancelled', p_reason
    );

    INSERT INTO public.notifications (user_id, token_id, message)
    VALUES (v_token.user_id, p_token_id, format('Token #%s was cancelled (%s).', v_token.token_number, p_reason));

    RETURN jsonb_build_object(
        'success', true,
        'token_id', p_token_id,
        'status', 'cancelled'
    );
END;
$$;

-- E. rpc_get_queue_summary
CREATE OR REPLACE FUNCTION public.rpc_get_queue_summary(
    p_service_id UUID
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_service RECORD;
    v_session RECORD;
    v_waiting_count INTEGER := 0;
    v_current_called_number INTEGER := NULL;
    v_current_serving_number INTEGER := NULL;
    v_est_wait_mins INTEGER := 0;
BEGIN
    SELECT id, name, is_active, avg_service_time_mins
    INTO v_service
    FROM public.services
    WHERE id = p_service_id;

    IF NOT FOUND THEN
        RETURN jsonb_build_object('success', false, 'error', 'SERVICE_NOT_FOUND');
    END IF;

    SELECT id, status, next_token_number, current_token_id
    INTO v_session
    FROM public.queue_sessions
    WHERE service_id = p_service_id AND session_date = CURRENT_DATE;

    IF FOUND THEN
        SELECT COUNT(*) INTO v_waiting_count
        FROM public.tokens
        WHERE queue_session_id = v_session.id AND status = 'waiting';

        SELECT token_number INTO v_current_called_number
        FROM public.tokens
        WHERE queue_session_id = v_session.id AND status = 'called'
        ORDER BY called_at DESC LIMIT 1;

        SELECT token_number INTO v_current_serving_number
        FROM public.tokens
        WHERE queue_session_id = v_session.id AND status = 'serving'
        LIMIT 1;

        v_est_wait_mins := (v_waiting_count + CASE WHEN v_current_called_number IS NOT NULL OR v_current_serving_number IS NOT NULL THEN 1 ELSE 0 END) * v_service.avg_service_time_mins;
    END IF;

    RETURN jsonb_build_object(
        'service_id', p_service_id,
        'service_name', v_service.name,
        'is_active', v_service.is_active,
        'session_status', COALESCE(v_session.status::TEXT, 'no_session'),
        'next_token_number', COALESCE(v_session.next_token_number, 1),
        'waiting_count', v_waiting_count,
        'current_called', v_current_called_number,
        'current_serving', v_current_serving_number,
        'estimated_wait_mins', v_est_wait_mins
    );
END;
$$;

-- ---------------------------------------------------------------------
-- 6. ROW LEVEL SECURITY (RLS) POLICIES
-- ---------------------------------------------------------------------
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.staff_services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.queue_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.service_history ENABLE ROW LEVEL SECURITY;

-- Profiles
DROP POLICY IF EXISTS "profiles_select_policy" ON public.profiles;
CREATE POLICY "profiles_select_policy" ON public.profiles
    FOR SELECT
    USING (
        auth.uid() = id
        OR (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin'
        OR (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'staff'
    );

DROP POLICY IF EXISTS "profiles_update_policy" ON public.profiles;
CREATE POLICY "profiles_update_policy" ON public.profiles
    FOR UPDATE
    USING (
        auth.uid() = id
        OR (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin'
    )
    WITH CHECK (
        auth.uid() = id
        OR (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin'
    );

-- Services
DROP POLICY IF EXISTS "services_public_read" ON public.services;
CREATE POLICY "services_public_read" ON public.services
    FOR SELECT
    USING (true);

DROP POLICY IF EXISTS "services_admin_insert" ON public.services;
CREATE POLICY "services_admin_insert" ON public.services
    FOR INSERT
    WITH CHECK ((SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin');

DROP POLICY IF EXISTS "services_admin_update" ON public.services;
CREATE POLICY "services_admin_update" ON public.services
    FOR UPDATE
    USING ((SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin');

DROP POLICY IF EXISTS "services_admin_delete" ON public.services;
CREATE POLICY "services_admin_delete" ON public.services
    FOR DELETE
    USING ((SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin');

-- Staff Services
DROP POLICY IF EXISTS "staff_services_read" ON public.staff_services;
CREATE POLICY "staff_services_read" ON public.staff_services
    FOR SELECT
    USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "staff_services_admin_manage" ON public.staff_services;
CREATE POLICY "staff_services_admin_manage" ON public.staff_services
    FOR ALL
    USING ((SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin');

-- Queue Sessions
DROP POLICY IF EXISTS "queue_sessions_public_read" ON public.queue_sessions;
CREATE POLICY "queue_sessions_public_read" ON public.queue_sessions
    FOR SELECT
    USING (true);

DROP POLICY IF EXISTS "queue_sessions_manage" ON public.queue_sessions;
CREATE POLICY "queue_sessions_manage" ON public.queue_sessions
    FOR ALL
    USING (
        (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin'
        OR EXISTS (
            SELECT 1 FROM public.staff_services
            WHERE service_id = public.queue_sessions.service_id
              AND staff_id = auth.uid()
        )
    );

-- Tokens
DROP POLICY IF EXISTS "tokens_select_policy" ON public.tokens;
CREATE POLICY "tokens_select_policy" ON public.tokens
    FOR SELECT
    USING (
        auth.uid() = user_id
        OR (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin'
        OR EXISTS (
            SELECT 1 FROM public.staff_services
            WHERE service_id = public.tokens.service_id
              AND staff_id = auth.uid()
        )
        OR (status IN ('waiting', 'called', 'serving'))
    );

DROP POLICY IF EXISTS "tokens_update_policy" ON public.tokens;
CREATE POLICY "tokens_update_policy" ON public.tokens
    FOR UPDATE
    USING (
        (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin'
        OR EXISTS (
            SELECT 1 FROM public.staff_services
            WHERE service_id = public.tokens.service_id
              AND staff_id = auth.uid()
        )
        OR (auth.uid() = user_id AND status IN ('waiting', 'called'))
    );

-- Notifications
DROP POLICY IF EXISTS "notifications_select_policy" ON public.notifications;
CREATE POLICY "notifications_select_policy" ON public.notifications
    FOR SELECT
    USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "notifications_update_policy" ON public.notifications;
CREATE POLICY "notifications_update_policy" ON public.notifications
    FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Service History
DROP POLICY IF EXISTS "service_history_select_policy" ON public.service_history;
CREATE POLICY "service_history_select_policy" ON public.service_history
    FOR SELECT
    USING (
        auth.uid() = user_id
        OR (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin'
        OR EXISTS (
            SELECT 1 FROM public.staff_services
            WHERE service_id = public.service_history.service_id
              AND staff_id = auth.uid()
        )
    );

-- ---------------------------------------------------------------------
-- 7. SUPABASE REALTIME CONFIGURATION
-- ---------------------------------------------------------------------
ALTER TABLE public.queue_sessions REPLICA IDENTITY FULL;
ALTER TABLE public.tokens REPLICA IDENTITY FULL;
ALTER TABLE public.notifications REPLICA IDENTITY FULL;

DO $$ BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.queue_sessions;
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.tokens;
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- ---------------------------------------------------------------------
-- 8. INITIAL SEED DATA
-- ---------------------------------------------------------------------
INSERT INTO public.services (name, description, is_active, avg_service_time_mins)
VALUES
('Canteen - Hot Meals & Thali', 'Lunch and dinner meal token distribution and pickup counter.', true, 4),
('Canteen - Snacks & Beverages', 'Tea, coffee, packaged snacks, and quick breakfast bites.', true, 3),
('Photocopy & Document Printing', 'Black & white and color printouts, xerox, and project binding.', true, 2),
('Accounts Office - Fee & Clearance', 'Tuition fee payments, dues clearance, and payment receipts.', true, 6),
('Student Welfare - ID Card & Verification', 'Student identity cards, bus pass approvals, and certificate verification.', true, 5)
ON CONFLICT DO NOTHING;

INSERT INTO public.queue_sessions (service_id, session_date, status, next_token_number)
SELECT id, CURRENT_DATE, 'active', 1
FROM public.services
WHERE is_active = true
ON CONFLICT (service_id, session_date) DO NOTHING;
