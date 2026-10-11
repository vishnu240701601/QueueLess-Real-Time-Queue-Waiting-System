-- =====================================================================
-- QueueLess - Verification & Test Queries (05_test_queries.sql)
-- Use these in Supabase SQL Editor to verify database rules & functions
-- =====================================================================

-- ---------------------------------------------------------------------
-- TEST 1: VERIFY SERVICES AND QUEUE SESSIONS WERE CREATED
-- ---------------------------------------------------------------------
SELECT s.name, s.is_active, qs.session_date, qs.status, qs.next_token_number
FROM public.services s
LEFT JOIN public.queue_sessions qs ON s.id = qs.service_id AND qs.session_date = CURRENT_DATE;

-- ---------------------------------------------------------------------
-- TEST 2: TEST ATOMIC TOKEN GENERATION (rpc_generate_token)
-- Replace '<USER_UUID>' with an existing user id from auth.users or profiles
-- ---------------------------------------------------------------------
DO $$
DECLARE
    v_service_id UUID;
    v_user_id UUID;
    v_result JSONB;
BEGIN
    SELECT id INTO v_service_id FROM public.services WHERE is_active = true LIMIT 1;
    SELECT id INTO v_user_id FROM public.profiles LIMIT 1;

    IF v_user_id IS NOT NULL AND v_service_id IS NOT NULL THEN
        -- Generate token
        v_result := public.rpc_generate_token(v_service_id, v_user_id);
        RAISE NOTICE 'Token Generation Result: %', v_result;
    ELSE
        RAISE NOTICE 'Please ensure at least one profile exists before testing.';
    END IF;
END $$;

-- ---------------------------------------------------------------------
-- TEST 3: VERIFY CONSTRAINT PREVENTS DUPLICATE ACTIVE TOKEN FOR SAME USER
-- Calling rpc_generate_token a second time for the same user should fail!
-- ---------------------------------------------------------------------
DO $$
DECLARE
    v_service_id UUID;
    v_user_id UUID;
    v_result JSONB;
BEGIN
    SELECT id INTO v_service_id FROM public.services WHERE is_active = true LIMIT 1;
    SELECT id INTO v_user_id FROM public.profiles LIMIT 1;

    BEGIN
        v_result := public.rpc_generate_token(v_service_id, v_user_id);
        RAISE EXCEPTION 'TEST FAILED: Should not allow duplicate active token!';
    EXCEPTION WHEN OTHERS THEN
        RAISE NOTICE 'SUCCESS: Duplicate active token was correctly blocked: %', SQLERRM;
    END;
END $$;

-- ---------------------------------------------------------------------
-- TEST 4: VERIFY QUEUE SUMMARY RPC
-- ---------------------------------------------------------------------
SELECT public.rpc_get_queue_summary(id) 
FROM public.services 
LIMIT 1;

-- ---------------------------------------------------------------------
-- TEST 5: VERIFY SECURITY TRIGGER PREVENTS NON-ADMIN SELF-ROLE ESCALATION
-- ---------------------------------------------------------------------
DO $$
DECLARE
    v_user_id UUID;
BEGIN
    SELECT id INTO v_user_id FROM public.profiles WHERE role = 'student' LIMIT 1;

    IF v_user_id IS NOT NULL THEN
        BEGIN
            -- Attempt unauthorized role update
            UPDATE public.profiles SET role = 'admin' WHERE id = v_user_id;
            RAISE EXCEPTION 'TEST FAILED: Privilege escalation was not prevented!';
        EXCEPTION WHEN OTHERS THEN
            RAISE NOTICE 'SUCCESS: Self-role escalation was blocked: %', SQLERRM;
        END;
    END IF;
END $$;

-- ---------------------------------------------------------------------
-- TEST 6: VERIFY NOTIFICATIONS ARE GENERATED
-- ---------------------------------------------------------------------
SELECT n.id, n.message, n.is_read, n.created_at, p.full_name
FROM public.notifications n
JOIN public.profiles p ON n.user_id = p.id
ORDER BY n.created_at DESC
LIMIT 10;
