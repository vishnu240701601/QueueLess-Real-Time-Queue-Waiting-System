-- =====================================================================
-- QueueLess - Row Level Security Policies (03_rls_policies.sql)
-- Target: PostgreSQL 14+ / Supabase Cloud
-- Tables: profiles, services, staff_services, queue_sessions,
--         tokens, notifications, service_history
-- =====================================================================

-- 1. ENABLE ROW LEVEL SECURITY
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.staff_services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.queue_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.service_history ENABLE ROW LEVEL SECURITY;

-- 2. POLICIES FOR profiles
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

-- 3. POLICIES FOR services
DROP POLICY IF EXISTS "services_public_read" ON public.services;
CREATE POLICY "services_public_read" ON public.services
    FOR SELECT
    USING (true);

DROP POLICY IF EXISTS "services_admin_insert" ON public.services;
CREATE POLICY "services_admin_insert" ON public.services
    FOR INSERT
    WITH CHECK (
        (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin'
    );

DROP POLICY IF EXISTS "services_admin_update" ON public.services;
CREATE POLICY "services_admin_update" ON public.services
    FOR UPDATE
    USING (
        (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin'
    );

DROP POLICY IF EXISTS "services_admin_delete" ON public.services;
CREATE POLICY "services_admin_delete" ON public.services
    FOR DELETE
    USING (
        (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin'
    );

-- 4. POLICIES FOR staff_services
DROP POLICY IF EXISTS "staff_services_read" ON public.staff_services;
CREATE POLICY "staff_services_read" ON public.staff_services
    FOR SELECT
    USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "staff_services_admin_manage" ON public.staff_services;
CREATE POLICY "staff_services_admin_manage" ON public.staff_services
    FOR ALL
    USING (
        (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin'
    );

-- 5. POLICIES FOR queue_sessions
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

-- 6. POLICIES FOR tokens
DROP POLICY IF EXISTS "tokens_select_policy" ON public.tokens;
CREATE POLICY "tokens_select_policy" ON public.tokens
    FOR SELECT
    USING (
        -- User owns the token
        auth.uid() = user_id
        -- Admin has visibility
        OR (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin'
        -- Staff assigned to service
        OR EXISTS (
            SELECT 1 FROM public.staff_services
            WHERE service_id = public.tokens.service_id
              AND staff_id = auth.uid()
        )
        -- Public queue view for today's active tokens (without exposing private profile data)
        OR (status IN ('waiting', 'called', 'serving'))
    );

DROP POLICY IF EXISTS "tokens_update_policy" ON public.tokens;
CREATE POLICY "tokens_update_policy" ON public.tokens
    FOR UPDATE
    USING (
        -- Admin has permission
        (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin'
        -- Staff assigned to service
        OR EXISTS (
            SELECT 1 FROM public.staff_services
            WHERE service_id = public.tokens.service_id
              AND staff_id = auth.uid()
        )
        -- Student can update for cancellation
        OR (auth.uid() = user_id AND status IN ('waiting', 'called'))
    );

-- 7. POLICIES FOR notifications
DROP POLICY IF EXISTS "notifications_select_policy" ON public.notifications;
CREATE POLICY "notifications_select_policy" ON public.notifications
    FOR SELECT
    USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "notifications_update_policy" ON public.notifications;
CREATE POLICY "notifications_update_policy" ON public.notifications
    FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- 8. POLICIES FOR service_history
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

-- 9. SUPABASE REALTIME REPLICATION CONFIGURATION
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
