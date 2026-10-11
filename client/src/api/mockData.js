// =====================================================================
// QueueLess – Isolated Mock Data Store
// Provides realistic college services, active queue sessions & tokens.
// =====================================================================

export const mockUsers = {
  student: {
    id: 'usr-student-001',
    full_name: 'Alex Johnson',
    email: 'alex.student@college.edu',
    student_id: 'CS-2024-042',
    role: 'student'
  },
  staff: {
    id: 'usr-staff-001',
    full_name: 'Robert Miller',
    email: 'r.miller@college.edu',
    role: 'staff',
    assignedServiceId: 'srv-canteen'
  },
  admin: {
    id: 'usr-admin-001',
    full_name: 'Dr. Sarah Williams',
    email: 'admin.queueless@college.edu',
    role: 'admin'
  }
};

export const initialServices = [
  {
    id: 'srv-canteen',
    slug: 'canteen',
    name: 'Canteen – Hot Meals & Refreshments',
    description: 'Fresh lunch plates, meals, beverages, snacks, and daily specials.',
    department: 'Dining & Food Services',
    is_active: true,
    avg_service_time_mins: 4,
    token_prefix: 'CAN',
    waiting_count: 5,
    current_token: 18,
    serving_token: 17,
    status: 'active'
  },
  {
    id: 'srv-library',
    slug: 'library',
    name: 'Central Library – Book Issue & Clearance',
    description: 'Book lending, return processing, digital catalog assistance, and library clearance stamps.',
    department: 'Academic Resources',
    is_active: true,
    avg_service_time_mins: 3,
    token_prefix: 'LIB',
    waiting_count: 3,
    current_token: 42,
    serving_token: 41,
    status: 'active'
  },
  {
    id: 'srv-hall-ticket',
    slug: 'hall-ticket',
    name: 'Hall Ticket & Examination Office',
    description: 'Semester admit cards, exam venue verification, fee clearance verification, and duplicate admit requests.',
    department: 'Examination Division',
    is_active: true,
    avg_service_time_mins: 5,
    token_prefix: 'EXM',
    waiting_count: 8,
    current_token: 34,
    serving_token: 33,
    status: 'active'
  },
  {
    id: 'srv-admin-office',
    slug: 'admin-office',
    name: 'Administrative Office – Admissions & Clearance',
    description: 'Tuition receipt validation, document verification, transfer certificates, and general administrative requests.',
    department: 'Administration',
    is_active: true,
    avg_service_time_mins: 6,
    token_prefix: 'ADM',
    waiting_count: 4,
    current_token: 12,
    serving_token: 11,
    status: 'active'
  },
  {
    id: 'srv-photocopy',
    slug: 'photocopy',
    name: 'Photocopy & Document Printing Centre',
    description: 'High-speed project printing, Xerox, spiral binding, and assignment submissions.',
    department: 'Academic Utility',
    is_active: true,
    avg_service_time_mins: 3,
    token_prefix: 'PRT',
    waiting_count: 6,
    current_token: 29,
    serving_token: 28,
    status: 'active'
  }
];

export const initialTokens = [
  {
    id: 'tkn-101',
    user_id: 'usr-student-001',
    user_name: 'Alex Johnson',
    service_id: 'srv-canteen',
    service_name: 'Canteen – Hot Meals & Refreshments',
    token_number: 21,
    display_number: 'CAN-021',
    status: 'waiting',
    created_at: new Date(Date.now() - 12 * 60 * 1000).toISOString(),
    called_at: null,
    completed_at: null
  },
  {
    id: 'tkn-102',
    user_id: 'usr-student-002',
    user_name: 'Emily Davis',
    service_id: 'srv-canteen',
    service_name: 'Canteen – Hot Meals & Refreshments',
    token_number: 17,
    display_number: 'CAN-017',
    status: 'serving',
    created_at: new Date(Date.now() - 25 * 60 * 1000).toISOString(),
    called_at: new Date(Date.now() - 4 * 60 * 1000).toISOString(),
    completed_at: null
  },
  {
    id: 'tkn-103',
    user_id: 'usr-student-003',
    user_name: 'David Lee',
    service_id: 'srv-canteen',
    service_name: 'Canteen – Hot Meals & Refreshments',
    token_number: 18,
    display_number: 'CAN-018',
    status: 'waiting',
    created_at: new Date(Date.now() - 20 * 60 * 1000).toISOString(),
    called_at: null,
    completed_at: null
  },
  {
    id: 'tkn-104',
    user_id: 'usr-student-004',
    user_name: 'Sarah Connor',
    service_id: 'srv-canteen',
    service_name: 'Canteen – Hot Meals & Refreshments',
    token_number: 19,
    display_number: 'CAN-019',
    status: 'waiting',
    created_at: new Date(Date.now() - 18 * 60 * 1000).toISOString(),
    called_at: null,
    completed_at: null
  },
  {
    id: 'tkn-105',
    user_id: 'usr-student-005',
    user_name: 'Rohan Sharma',
    service_id: 'srv-canteen',
    service_name: 'Canteen – Hot Meals & Refreshments',
    token_number: 20,
    display_number: 'CAN-020',
    status: 'waiting',
    created_at: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
    called_at: null,
    completed_at: null
  }
];

export const initialHistory = [
  {
    id: 'hist-001',
    token_number: 16,
    display_number: 'CAN-016',
    service_name: 'Canteen – Hot Meals & Refreshments',
    status: 'completed',
    date: 'Today, 12:45 PM',
    wait_time_mins: 8,
    service_time_mins: 4
  },
  {
    id: 'hist-002',
    token_number: 28,
    display_number: 'PRT-028',
    service_name: 'Photocopy & Document Printing Centre',
    status: 'completed',
    date: 'Today, 11:30 AM',
    wait_time_mins: 6,
    service_time_mins: 3
  },
  {
    id: 'hist-003',
    token_number: 10,
    display_number: 'ADM-010',
    service_name: 'Administrative Office – Admissions & Clearance',
    status: 'cancelled',
    date: 'Today, 10:15 AM',
    wait_time_mins: 2,
    service_time_mins: null,
    reason: 'Cancelled by student'
  },
  {
    id: 'hist-004',
    token_number: 40,
    display_number: 'LIB-040',
    service_name: 'Central Library – Book Issue & Clearance',
    status: 'skipped',
    date: 'Yesterday, 3:20 PM',
    wait_time_mins: 12,
    service_time_mins: null,
    reason: 'Student not present when called'
  }
];
