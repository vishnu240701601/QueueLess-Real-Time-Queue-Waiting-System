-- =====================================================================
-- QueueLess - Atomic Database Functions & RPCs (02_rpc_functions.sql)
-- Target: PostgreSQL 14+ / Supabase Cloud
-- Functions: rpc_generate_token, rpc_call_next_token,
--            rpc_update_token_status, rpc_cancel_token, rpc_get_queue_summary
-- =====================================================================

-- 1. ATOMIC TOKEN GENERATION (rpc_generate_token)
-- Enforces:
-- - User has at most ONE active token per service
-- - Daily queue session is active
-- - Row lock on queue_sessions guarantees ZERO duplicate token numbers
-- - Inserts initial notification
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
    -- 1. Check if user already holds an active token for this service
    SELECT EXISTS (
        SELECT 1 FROM public.tokens
        WHERE user_id = p_user_id
          AND service_id = p_service_id
          AND status IN ('waiting', 'called', 'serving')
    ) INTO v_active_exists;

    IF v_active_exists THEN
        RAISE EXCEPTION 'ACTIVE_TOKEN_EXISTS: You already hold an active token for this service.';
    END IF;

    -- 2. Verify service is active
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

    -- 3. Ensure a queue session exists for today
    INSERT INTO public.queue_sessions (service_id, session_date, status, next_token_number)
    VALUES (p_service_id, v_today, 'active', 1)
    ON CONFLICT (service_id, session_date) DO NOTHING;

    -- 4. Lock the queue_session row for atomic token sequence allocation
    SELECT id, status, next_token_number
    INTO v_session
    FROM public.queue_sessions
    WHERE service_id = p_service_id AND session_date = v_today
    FOR UPDATE;

    IF v_session.status <> 'active' THEN
        RAISE EXCEPTION 'SESSION_NOT_ACTIVE: Queue session is % and cannot accept tokens.', v_session.status;
    END IF;

    -- 5. Allocate next token number and advance sequence
    v_token_number := v_session.next_token_number;

    UPDATE public.queue_sessions
    SET next_token_number = v_session.next_token_number + 1,
        updated_at = NOW()
    WHERE id = v_session.id;

    -- 6. Insert new token record
    INSERT INTO public.tokens (
        user_id,
        service_id,
        queue_session_id,
        token_number,
        status,
        created_at
    ) VALUES (
        p_user_id,
        p_service_id,
        v_session.id,
        v_token_number,
        'waiting',
        NOW()
    ) RETURNING id INTO v_token_id;

    -- 7. Calculate accurate people ahead in line
    SELECT COUNT(*) INTO v_people_ahead
    FROM public.tokens
    WHERE queue_session_id = v_session.id
      AND status = 'waiting'
      AND token_number < v_token_number;

    -- If there is a person currently called or serving, add 1 to the wait queue
    IF EXISTS (
        SELECT 1 FROM public.tokens
        WHERE queue_session_id = v_session.id
          AND status IN ('called', 'serving')
    ) THEN
        v_people_ahead := v_people_ahead + 1;
    END IF;

    v_est_wait_mins := v_people_ahead * v_service.avg_service_time_mins;

    -- 8. Create welcoming notification
    INSERT INTO public.notifications (user_id, token_id, message)
    VALUES (
        p_user_id,
        v_token_id,
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

-- 2. ATOMIC STAFF CALL NEXT TOKEN (rpc_call_next_token)
-- Enforces:
-- - Staff authorization for service
-- - No calling if someone is already in 'serving' status
-- - Auto-skips previous unattended 'called' tokens
-- - Uses FOR UPDATE SKIP LOCKED
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
    -- 1. Verify staff assignment or admin privilege
    IF NOT EXISTS (
        SELECT 1 FROM public.staff_services WHERE service_id = p_service_id AND staff_id = p_staff_id
    ) AND NOT EXISTS (
        SELECT 1 FROM public.profiles WHERE id = p_staff_id AND role = 'admin'
    ) THEN
        RAISE EXCEPTION 'FORBIDDEN: You are not assigned to manage this service.';
    END IF;

    -- 2. Retrieve today's session
    SELECT id, status INTO v_session
    FROM public.queue_sessions
    WHERE service_id = p_service_id AND session_date = CURRENT_DATE
    FOR UPDATE;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'NO_SESSION: No queue session found for today.';
    END IF;

    -- 3. Verify no customer is currently being served
    SELECT id, token_number INTO v_active_serving
    FROM public.tokens
    WHERE queue_session_id = v_session.id AND status = 'serving';

    IF FOUND THEN
        RAISE EXCEPTION 'SERVICE_IN_PROGRESS: Token #% is currently being served. Complete it before calling next.', v_active_serving.token_number;
    END IF;

    -- 4. Auto-resolve any previous 'called' token left unattended -> mark 'skipped'
    FOR v_prev_called IN
        SELECT id, token_number, user_id, created_at, called_at
        FROM public.tokens
        WHERE queue_session_id = v_session.id AND status = 'called'
        FOR UPDATE
    LOOP
        UPDATE public.tokens
        SET status = 'skipped',
            completed_at = NOW(),
            updated_at = NOW()
        WHERE id = v_prev_called.id;

        v_auto_skipped_num := v_prev_called.token_number;

        -- Record in service history
        INSERT INTO public.service_history (
            token_id, service_id, staff_id, user_id,
            wait_duration_seconds, action, notes
        ) VALUES (
            v_prev_called.id, p_service_id, p_staff_id, v_prev_called.user_id,
            EXTRACT(EPOCH FROM (NOW() - v_prev_called.created_at))::INTEGER,
            'skipped', 'Auto-skipped upon calling next token'
        );

        -- Notify skipped student
        INSERT INTO public.notifications (user_id, token_id, message)
        VALUES (
            v_prev_called.user_id,
            v_prev_called.id,
            format('Your token #%s was skipped because you did not arrive when called.', v_prev_called.token_number)
        );
    END LOOP;

    -- 5. Lock and retrieve next waiting token in FIFO order
    SELECT id, token_number, user_id, created_at
    INTO v_next_token
    FROM public.tokens
    WHERE queue_session_id = v_session.id AND status = 'waiting'
    ORDER BY token_number ASC
    LIMIT 1
    FOR UPDATE SKIP LOCKED;

    IF NOT FOUND THEN
        -- Clear current token on session
        UPDATE public.queue_sessions SET current_token_id = NULL, updated_at = NOW() WHERE id = v_session.id;
        RETURN jsonb_build_object(
            'success', false,
            'message', 'NO_WAITING_TOKENS: Queue is currently empty.',
            'skipped_token', v_auto_skipped_num
        );
    END IF;

    -- 6. Transition token to 'called'
    UPDATE public.tokens
    SET status = 'called',
        called_at = NOW(),
        updated_at = NOW()
    WHERE id = v_next_token.id;

    -- Update session's current token
    UPDATE public.queue_sessions
    SET current_token_id = v_next_token.id,
        updated_at = NOW()
    WHERE id = v_session.id;

    -- Fetch service name
    SELECT name INTO v_service_name FROM public.services WHERE id = p_service_id;

    -- 7. Notify student that their turn has arrived
    INSERT INTO public.notifications (user_id, token_id, message)
    VALUES (
        v_next_token.user_id,
        v_next_token.id,
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

-- 3. ATOMIC TOKEN STATUS UPDATE (rpc_update_token_status)
-- Enforces:
-- - Valid state transitions (called -> serving -> completed, called -> skipped)
-- - Computes accurate duration metrics for service_history
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

    -- Authorize staff
    IF NOT EXISTS (
        SELECT 1 FROM public.staff_services WHERE service_id = v_token.service_id AND staff_id = p_staff_id
    ) AND NOT EXISTS (
        SELECT 1 FROM public.profiles WHERE id = p_staff_id AND role = 'admin'
    ) THEN
        RAISE EXCEPTION 'FORBIDDEN: You are not authorized to update tokens for this service.';
    END IF;

    -- Enforce state transitions
    IF p_new_status = 'serving' THEN
        IF v_token.status <> 'called' THEN
            RAISE EXCEPTION 'INVALID_TRANSITION: Token #% must be "called" before starting service (currently %).', v_token.token_number, v_token.status;
        END IF;

        UPDATE public.tokens
        SET status = 'serving',
            updated_at = NOW()
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
        SET status = 'completed',
            completed_at = NOW(),
            updated_at = NOW()
        WHERE id = p_token_id;

        -- Clear current token on session if it matches
        UPDATE public.queue_sessions
        SET current_token_id = NULL, updated_at = NOW()
        WHERE id = v_token.queue_session_id AND current_token_id = p_token_id;

        -- Audit log in service_history
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
        SET status = 'skipped',
            completed_at = NOW(),
            updated_at = NOW()
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

-- 4. ATOMIC TOKEN CANCELLATION (rpc_cancel_token)
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
    SET status = 'cancelled',
        completed_at = NOW(),
        updated_at = NOW()
    WHERE id = p_token_id;

    -- Clear current token on session if it was this one
    UPDATE public.queue_sessions
    SET current_token_id = NULL, updated_at = NOW()
    WHERE id = v_token.queue_session_id AND current_token_id = p_token_id;

    -- Record in history
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

-- 5. LIVE QUEUE SUMMARY (rpc_get_queue_summary)
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

    -- Look up today's session
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
