-- =====================================================================
-- QueueLess - Initial Seed Data (04_seed.sql)
-- Target: PostgreSQL 14+ / Supabase Cloud
-- =====================================================================

-- 1. SEED DEFAULT SERVICES
INSERT INTO public.services (
    name,
    description,
    is_active,
    avg_service_time_mins
) VALUES
(
    'Canteen - Hot Meals & Thali',
    'Lunch and dinner meal token distribution and pickup counter.',
    true,
    4
),
(
    'Canteen - Snacks & Beverages',
    'Tea, coffee, packaged snacks, and quick breakfast bites.',
    true,
    3
),
(
    'Photocopy & Document Printing',
    'Black & white and color printouts, xerox, and project binding.',
    true,
    2
),
(
    'Accounts Office - Fee & Clearance',
    'Tuition fee payments, dues clearance, and payment receipts.',
    true,
    6
),
(
    'Student Welfare - ID Card & Verification',
    'Student identity cards, bus pass approvals, and certificate verification.',
    true,
    5
);

-- 2. CREATE TODAY'S QUEUE SESSIONS FOR ALL ACTIVE SERVICES
INSERT INTO public.queue_sessions (
    service_id,
    session_date,
    status,
    next_token_number
)
SELECT id, CURRENT_DATE, 'active', 1
FROM public.services
WHERE is_active = true
ON CONFLICT (service_id, session_date) DO NOTHING;

-- 3. INSTRUCTIONS TO ASSIGN STAFF & ELEVATE ADMINS:
-- Once users register via Supabase Auth:
--
-- A. Elevate an administrator:
-- UPDATE public.profiles
-- SET role = 'admin'
-- WHERE id = '<AUTH_USER_UUID>';
--
-- B. Assign staff to a service:
-- UPDATE public.profiles
-- SET role = 'staff'
-- WHERE id = '<STAFF_USER_UUID>';
--
-- INSERT INTO public.staff_services (staff_id, service_id)
-- VALUES (
--     '<STAFF_USER_UUID>',
--     (SELECT id FROM public.services WHERE name LIKE 'Canteen - Hot Meals%' LIMIT 1)
-- ) ON CONFLICT (staff_id, service_id) DO NOTHING;
