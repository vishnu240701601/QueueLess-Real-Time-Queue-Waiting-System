// =====================================================================
// QueueLess – Centralized API Client
// Encapsulates network communication with backend serverless REST API
// =====================================================================

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

/**
 * Perform authenticated HTTP request to backend
 * TODO: Integrate Supabase JWT session token into Authorization header:
 * const session = await supabase.auth.getSession();
 * headers['Authorization'] = `Bearer ${session.data.session.access_token}`;
 */
export async function apiRequest(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`;
  
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers
  };

  // TODO: Attach Supabase JWT once Auth is wired:
  // const token = getLocalAccessToken();
  // if (token) headers['Authorization'] = `Bearer ${token}`;

  try {
    const response = await fetch(url, {
      ...options,
      headers
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `API request failed with status ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    // In preview mode before backend deployment, log warning
    console.warn(`[API Client] Call to ${endpoint} intercepted:`, error.message);
    throw error;
  }
}

export default {
  API_BASE_URL,
  apiRequest
};
