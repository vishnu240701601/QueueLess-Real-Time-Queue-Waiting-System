// =====================================================================
// QueueLess – Administrator Service
// Handles system metrics, service management, and staff assignments.
// =====================================================================

import { initialServices } from './mockData';

export const adminService = {
  /**
   * Fetch live dashboard metrics
   * TODO: Replace with:
   * return await apiRequest('/admin/metrics');
   */
  async getMetrics() {
    await new Promise(r => setTimeout(r, 200));
    return {
      totalCounters: 5,
      activeCounters: 4,
      totalWaitingToday: 18,
      totalServedToday: 142,
      avgWaitTimeMins: 4.5,
      systemUptimePercent: 99.8
    };
  },

  /**
   * Fetch staff assignments
   * TODO: Replace with:
   * return await apiRequest('/admin/staff');
   */
  async getStaffList() {
    await new Promise(r => setTimeout(r, 150));
    return [
      { id: 'stf-1', name: 'Robert Miller', email: 'r.miller@college.edu', serviceName: 'Canteen – Hot Meals & Thali', status: 'Online' },
      { id: 'stf-2', name: 'Ananya Gupta', email: 'a.gupta@college.edu', serviceName: 'Central Photocopy & Document Print', status: 'Online' },
      { id: 'stf-3', name: 'James Wilson', email: 'j.wilson@college.edu', serviceName: 'Accounts Office – Fee & Clearance', status: 'Away' },
      { id: 'stf-4', name: 'Meera Nair', email: 'm.nair@college.edu', serviceName: 'Canteen – Snacks & Beverages', status: 'Online' }
    ];
  },

  /**
   * Toggle service active status
   * TODO: Replace with:
   * return await apiRequest(`/counters/${serviceId}/status`, { method: 'PATCH', body: JSON.stringify({ is_active: status }) });
   */
  async toggleServiceStatus(serviceId, isActive) {
    await new Promise(r => setTimeout(r, 200));
    const service = initialServices.find(s => s.id === serviceId);
    if (service) {
      service.is_active = isActive;
      service.status = isActive ? 'active' : 'paused';
    }
    return service;
  }
};
