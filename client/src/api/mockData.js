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
    assignedServiceId: 'srv-001'
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
    id: 'srv-001',
    name: 'Canteen – Hot Meals & Thali',
    description: 'Fresh lunch & dinner meal plates, thalis, and daily specials.',
    department: 'Dining & Canteen',
    is_active: true,
    avg_service_time_mins: 4,
    token_prefix: 'C',
    waiting_count: 5,
    current_token: 18,
    serving_token: 17,
    status: 'active'
  },
  {
    id: 'srv-002',
    name: 'Canteen – Snacks & Beverages',
    description: 'Quick tea, coffee, cold drinks, sandwiches, and packaged snacks.',
    department: 'Dining & Canteen',
    is_active: true,
    avg_service_time_mins: 2,
    token_prefix: 'S',
    waiting_count: 2,
    current_token: 42,
    serving_token: 41,
    status: 'active'
  },
  {
    id: 'srv-003',
    name: 'Central Photocopy & Document Print',
    description: 'Assignment printouts, spiral binding, color printing, and Xerox.',
    department: 'Academic Utility',
    is_active: true,
    avg_service_time_mins: 3,
    token_prefix: 'P',
    waiting_count: 7,
    current_token: 29,
    serving_token: 28,
    status: 'active'
  },
  {
    id: 'srv-004',
    name: 'Accounts Office – Fee & Clearance',
    description: 'Semester tuition fees, exam dues, receipt collection, and refunds.',
    department: 'Administration',
    is_active: true,
    avg_service_time_mins: 6,
    token_prefix: 'A',
    waiting_count: 4,
    current_token: 12,
    serving_token: 11,
    status: 'active'
  },
  {
    id: 'srv-005',
    name: 'Student Affairs – ID Card & Bus Pass',
    description: 'Smart campus ID card replacements, concession stamps, and approvals.',
    department: 'Student Affairs',
    is_active: false,
    avg_service_time_mins: 5,
    token_prefix: 'V',
    waiting_count: 0,
    current_token: null,
    serving_token: null,
    status: 'paused'
  }
];

export const initialTokens = [
  {
    id: 'tkn-101',
    user_id: 'usr-student-001',
    user_name: 'Alex Johnson',
    service_id: 'srv-001',
    service_name: 'Canteen – Hot Meals & Thali',
    token_number: 22,
    display_number: 'C-022',
    status: 'waiting',
    created_at: new Date(Date.now() - 1000 * 60 * 12).toISOString(),
    called_at: null,
    completed_at: null
  },
  {
    id: 'tkn-102',
    user_id: 'usr-student-002',
    user_name: 'Samantha Lee',
    service_id: 'srv-001',
    token_number: 17,
    display_number: 'C-017',
    status: 'serving',
    created_at: new Date(Date.now() - 1000 * 60 * 25).toISOString(),
    called_at: new Date(Date.now() - 1000 * 60 * 4).toISOString(),
    completed_at: null
  },
  {
    id: 'tkn-103',
    user_id: 'usr-student-003',
    user_name: 'David Chen',
    service_id: 'srv-001',
    token_number: 18,
    display_number: 'C-018',
    status: 'called',
    created_at: new Date(Date.now() - 1000 * 60 * 20).toISOString(),
    called_at: new Date(Date.now() - 1000 * 60 * 1).toISOString(),
    completed_at: null
  },
  {
    id: 'tkn-104',
    user_id: 'usr-student-004',
    user_name: 'Priya Sharma',
    service_id: 'srv-001',
    token_number: 19,
    display_number: 'C-019',
    status: 'waiting',
    created_at: new Date(Date.now() - 1000 * 60 * 18).toISOString(),
    called_at: null,
    completed_at: null
  },
  {
    id: 'tkn-105',
    user_id: 'usr-student-005',
    user_name: 'Michael Brown',
    service_id: 'srv-001',
    token_number: 20,
    display_number: 'C-020',
    status: 'waiting',
    created_at: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
    called_at: null,
    completed_at: null
  },
  {
    id: 'tkn-106',
    user_id: 'usr-student-006',
    user_name: 'Elena Rostova',
    service_id: 'srv-001',
    token_number: 21,
    display_number: 'C-021',
    status: 'waiting',
    created_at: new Date(Date.now() - 1000 * 60 * 14).toISOString(),
    called_at: null,
    completed_at: null
  }
];

export const initialHistory = [
  {
    id: 'hist-001',
    token_number: 15,
    display_number: 'C-015',
    service_name: 'Canteen – Hot Meals & Thali',
    status: 'completed',
    date: 'Today, 11:42 AM',
    wait_time_mins: 8,
    service_time_mins: 4
  },
  {
    id: 'hist-002',
    token_number: 38,
    display_number: 'S-038',
    service_name: 'Canteen – Snacks & Beverages',
    status: 'completed',
    date: 'Yesterday, 04:15 PM',
    wait_time_mins: 3,
    service_time_mins: 2
  },
  {
    id: 'hist-003',
    token_number: 14,
    display_number: 'P-014',
    service_name: 'Central Photocopy & Document Print',
    status: 'cancelled',
    date: 'Oct 09, 2026',
    wait_time_mins: 5,
    service_time_mins: null,
    reason: 'Cancelled by student'
  }
];
