// =====================================================================
// QueueLess – Queue & Token Service
// Handles service listings, token creation, live tracking, and staff actions.
// =====================================================================

import { initialServices, initialTokens, initialHistory } from './mockData';

// In-memory mock state for interactive browser preview
let services = [...initialServices];
let tokens = [...initialTokens];
let history = [...initialHistory];

// Event listeners for mock realtime updates
const listeners = new Set();
const notifyListeners = () => listeners.forEach(fn => fn());

export const queueService = {
  /**
   * Subscribe to live queue changes
   * TODO: In Phase 5, replace this with Supabase Realtime WebSocket subscription:
   * supabase.channel('realtime-queue').on('postgres_changes', { event: '*', table: 'tokens' }, payload => { ... }).subscribe();
   */
  subscribe(callback) {
    listeners.add(callback);
    return () => listeners.delete(callback);
  },

  /**
   * Fetch all active service counters
   * TODO: Replace with:
   * return await apiRequest('/counters');
   */
  async getServices() {
    await new Promise(r => setTimeout(r, 200));
    return [...services];
  },

  /**
   * Fetch a single service by ID
   */
  async getServiceById(id) {
    return services.find(s => s.id === id) || null;
  },

  /**
   * Get active token for the student
   * TODO: Replace with:
   * return await apiRequest('/tokens/active');
   */
  async getStudentActiveToken(userId = 'usr-student-001') {
    await new Promise(r => setTimeout(r, 150));
    const token = tokens.find(t => t.user_id === userId && ['waiting', 'called', 'serving'].includes(t.status));
    if (!token) return null;

    const service = services.find(s => s.id === token.service_id);
    const peopleAhead = tokens.filter(t => t.service_id === token.service_id && t.status === 'waiting' && t.token_number < token.token_number).length;
    const isSomeoneServing = tokens.some(t => t.service_id === token.service_id && ['called', 'serving'].includes(t.status));
    const totalAhead = peopleAhead + (isSomeoneServing ? 1 : 0);
    const estWaitMins = totalAhead * (service?.avg_service_time_mins || 4);

    return {
      ...token,
      peopleAhead,
      totalAhead,
      estWaitMins,
      serviceName: service?.name || 'Service Counter',
      department: service?.department || 'General'
    };
  },

  /**
   * Join a queue & generate a new token
   * TODO: Replace with:
   * return await apiRequest('/tokens/join', { method: 'POST', body: JSON.stringify({ service_id: serviceId }) });
   */
  async joinQueue(serviceId, user) {
    await new Promise(r => setTimeout(r, 300));
    const service = services.find(s => s.id === serviceId);
    if (!service) throw new Error('Service not found.');
    if (!service.is_active) throw new Error('This counter is currently inactive.');

    // Check if user already holds active token for this service
    const existing = tokens.find(t => t.service_id === serviceId && t.user_id === user.id && ['waiting', 'called', 'serving'].includes(t.status));
    if (existing) throw new Error('You already hold an active token for this counter.');

    service.waiting_count += 1;
    const nextNum = (service.current_token || 0) + service.waiting_count;
    const displayNum = `${service.token_prefix}-${String(nextNum).padStart(3, '0')}`;

    const newToken = {
      id: `tkn-${Date.now()}`,
      user_id: user.id,
      user_name: user.full_name,
      service_id: serviceId,
      service_name: service.name,
      token_number: nextNum,
      display_number: displayNum,
      status: 'waiting',
      created_at: new Date().toISOString(),
      called_at: null,
      completed_at: null
    };

    tokens.push(newToken);
    notifyListeners();
    return newToken;
  },

  /**
   * Cancel an active token
   * TODO: Replace with:
   * return await apiRequest(`/tokens/${tokenId}/cancel`, { method: 'PATCH', body: JSON.stringify({ reason }) });
   */
  async cancelToken(tokenId, reason = 'Cancelled by student') {
    await new Promise(r => setTimeout(r, 200));
    const token = tokens.find(t => t.id === tokenId);
    if (!token) throw new Error('Token not found.');

    token.status = 'cancelled';
    token.completed_at = new Date().toISOString();

    const service = services.find(s => s.id === token.service_id);
    if (service && service.waiting_count > 0) service.waiting_count -= 1;

    history.unshift({
      id: `hist-${Date.now()}`,
      token_number: token.token_number,
      display_number: token.display_number,
      service_name: service?.name || 'Service Counter',
      status: 'cancelled',
      date: 'Just now',
      wait_time_mins: 2,
      service_time_mins: null,
      reason
    });

    notifyListeners();
    return token;
  },

  /**
   * Staff: Get waiting queue for a service
   * TODO: Replace with:
   * return await apiRequest(`/staff/queue/${serviceId}`);
   */
  async getStaffQueue(serviceId) {
    await new Promise(r => setTimeout(r, 150));
    return tokens.filter(t => t.service_id === serviceId && ['waiting', 'called', 'serving'].includes(t.status))
      .sort((a, b) => a.token_number - b.token_number);
  },

  /**
   * Staff: Call Next Token
   * TODO: Replace with:
   * return await apiRequest('/staff/call-next', { method: 'POST', body: JSON.stringify({ service_id: serviceId }) });
   */
  async callNextToken(serviceId) {
    await new Promise(r => setTimeout(r, 300));
    const service = services.find(s => s.id === serviceId);
    if (!service) throw new Error('Service not found.');

    // Auto-skip previous unattended 'called' token
    const prevCalled = tokens.find(t => t.service_id === serviceId && t.status === 'called');
    if (prevCalled) {
      prevCalled.status = 'skipped';
      prevCalled.completed_at = new Date().toISOString();
      if (service.waiting_count > 0) service.waiting_count -= 1;
    }

    // Find earliest waiting token
    const nextToken = tokens.find(t => t.service_id === serviceId && t.status === 'waiting');
    if (!nextToken) throw new Error('No waiting tokens in the queue.');

    nextToken.status = 'called';
    nextToken.called_at = new Date().toISOString();
    service.current_token = nextToken.token_number;
    if (service.waiting_count > 0) service.waiting_count -= 1;

    notifyListeners();
    return nextToken;
  },

  /**
   * Staff: Start Service on called token
   * TODO: Replace with:
   * return await apiRequest('/staff/start-service', { method: 'POST', body: JSON.stringify({ token_id: tokenId }) });
   */
  async startService(tokenId) {
    await new Promise(r => setTimeout(r, 200));
    const token = tokens.find(t => t.id === tokenId);
    if (!token) throw new Error('Token not found.');

    token.status = 'serving';
    const service = services.find(s => s.id === token.service_id);
    if (service) service.serving_token = token.token_number;

    notifyListeners();
    return token;
  },

  /**
   * Staff: Complete Service on serving token
   * TODO: Replace with:
   * return await apiRequest('/staff/complete-service', { method: 'POST', body: JSON.stringify({ token_id: tokenId, notes }) });
   */
  async completeService(tokenId, notes = '') {
    await new Promise(r => setTimeout(r, 250));
    const token = tokens.find(t => t.id === tokenId);
    if (!token) throw new Error('Token not found.');

    token.status = 'completed';
    token.completed_at = new Date().toISOString();
    token.notes = notes;

    const service = services.find(s => s.id === token.service_id);
    if (service) service.serving_token = null;

    history.unshift({
      id: `hist-${Date.now()}`,
      token_number: token.token_number,
      display_number: token.display_number,
      service_name: service?.name || 'Service Counter',
      status: 'completed',
      date: 'Just now',
      wait_time_mins: 7,
      service_time_mins: 4
    });

    notifyListeners();
    return token;
  },

  /**
   * Staff: Skip Token
   * TODO: Replace with:
   * return await apiRequest('/staff/skip-token', { method: 'POST', body: JSON.stringify({ token_id: tokenId }) });
   */
  async skipToken(tokenId) {
    await new Promise(r => setTimeout(r, 200));
    const token = tokens.find(t => t.id === tokenId);
    if (!token) throw new Error('Token not found.');

    token.status = 'skipped';
    token.completed_at = new Date().toISOString();

    const service = services.find(s => s.id === token.service_id);
    if (service && service.serving_token === token.token_number) {
      service.serving_token = null;
    }

    notifyListeners();
    return token;
  },

  /**
   * Student / System: Get past token history
   * TODO: Replace with:
   * return await apiRequest('/tokens/history');
   */
  async getHistory() {
    await new Promise(r => setTimeout(r, 150));
    return [...history];
  }
};
