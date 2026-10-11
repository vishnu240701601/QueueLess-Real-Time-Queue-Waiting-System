// =====================================================================
// QueueLess – Authentication Service
// Encapsulates Supabase Auth calls with fallback mock state for UI testing
// =====================================================================

import { mockUsers } from './mockData';

// Storage key for preview session role
const PREVIEW_ROLE_KEY = 'queueless_preview_role';

export const authService = {
  /**
   * Get current authenticated user
   * TODO: Replace with:
   * const { data: { user } } = await supabase.auth.getUser();
   */
  async getCurrentUser() {
    const savedRole = localStorage.getItem(PREVIEW_ROLE_KEY) || 'student';
    return mockUsers[savedRole] || mockUsers.student;
  },

  /**
   * Sign in with email and password
   * TODO: Replace with:
   * const { data, error } = await supabase.auth.signInWithPassword({ email, password });
   */
  async login(email, password) {
    await new Promise(r => setTimeout(r, 400)); // simulate network latency
    
    // Auto-detect role by email for demo testing
    let role = 'student';
    if (email.includes('staff')) role = 'staff';
    if (email.includes('admin')) role = 'admin';

    localStorage.setItem(PREVIEW_ROLE_KEY, role);
    return mockUsers[role];
  },

  /**
   * Register a new student
   * TODO: Replace with:
   * const { data, error } = await supabase.auth.signUp({ email, password, options: { data: { full_name, student_id } } });
   */
  async register({ full_name, email, password, student_id }) {
    await new Promise(r => setTimeout(r, 450));
    
    const newUser = {
      id: `usr-${Date.now()}`,
      full_name,
      email,
      student_id,
      role: 'student'
    };

    localStorage.setItem(PREVIEW_ROLE_KEY, 'student');
    return newUser;
  },

  /**
   * Switch active preview role (helper for pair programming & testing)
   */
  setPreviewRole(role) {
    if (mockUsers[role]) {
      localStorage.setItem(PREVIEW_ROLE_KEY, role);
      return mockUsers[role];
    }
    return mockUsers.student;
  },

  /**
   * Sign out
   * TODO: Replace with:
   * await supabase.auth.signOut();
   */
  async logout() {
    localStorage.removeItem(PREVIEW_ROLE_KEY);
  }
};
