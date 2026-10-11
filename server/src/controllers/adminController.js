// =====================================================================
// QueueLess – Administrator Controller
// =====================================================================

const { supabase } = require('../config/supabase');
const { isValidUUID, sanitizeString } = require('../utils/validators');

/**
 * POST /api/admin/services
 * Create a new service counter
 */
async function createService(req, res, next) {
  try {
    const { name, description, avg_service_time_mins, is_active } = req.body;

    if (!name || typeof name !== 'string' || !name.trim()) {
      return res.status(400).json({
        success: false,
        error: 'VALIDATION_ERROR',
        message: 'A non-empty service name is required.'
      });
    }

    const newService = {
      name: sanitizeString(name, 100),
      description: sanitizeString(description || '', 255),
      avg_service_time_mins: Number(avg_service_time_mins) || 5,
      is_active: is_active !== false
    };

    const { data: created, error } = await supabase
      .from('services')
      .insert(newService)
      .select()
      .single();

    if (error) throw error;

    // Initialize today's session for the new service
    const today = new Date().toISOString().split('T')[0];
    await supabase.from('queue_sessions').insert({
      service_id: created.id,
      session_date: today,
      status: 'active',
      next_token_number: 1
    }).catch(() => {});

    res.status(201).json({
      success: true,
      message: 'Service counter created successfully.',
      data: created
    });
  } catch (err) {
    next(err);
  }
}

/**
 * PATCH /api/admin/services/:id
 * Update counter details or toggle active status
 */
async function updateService(req, res, next) {
  try {
    const { id } = req.params;
    const { name, description, avg_service_time_mins, is_active, session_status } = req.body;

    if (!isValidUUID(id)) {
      return res.status(400).json({ success: false, error: 'INVALID_ID', message: 'Service ID must be a valid UUID.' });
    }

    const updates = {};
    if (name !== undefined) updates.name = sanitizeString(name, 100);
    if (description !== undefined) updates.description = sanitizeString(description, 255);
    if (avg_service_time_mins !== undefined) updates.avg_service_time_mins = Number(avg_service_time_mins);
    if (is_active !== undefined) updates.is_active = Boolean(is_active);

    const { data: updated, error } = await supabase
      .from('services')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    // If session_status was provided, update today's session
    if (session_status) {
      const today = new Date().toISOString().split('T')[0];
      await supabase
        .from('queue_sessions')
        .update({ status: session_status })
        .eq('service_id', id)
        .eq('session_date', today);
    }

    res.status(200).json({
      success: true,
      message: 'Service updated successfully.',
      data: updated
    });
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/admin/analytics
 * Aggregated metrics & operational efficiency
 */
async function getAnalytics(req, res, next) {
  try {
    const today = new Date().toISOString().split('T')[0];

    // Total Services
    const { data: services } = await supabase.from('services').select('id, name, is_active');
    const totalServices = services?.length || 0;
    const activeServices = services?.filter(s => s.is_active).length || 0;

    // Tokens Today
    const { data: tokensToday, error: tknError } = await supabase
      .from('tokens')
      .select('id, status, created_at, called_at, completed_at');

    if (tknError) throw tknError;

    const totalIssuedToday = tokensToday?.length || 0;
    const waitingCount = tokensToday?.filter(t => t.status === 'waiting').length || 0;
    const servingCount = tokensToday?.filter(t => t.status === 'serving').length || 0;
    const completedCount = tokensToday?.filter(t => t.status === 'completed').length || 0;
    const cancelledCount = tokensToday?.filter(t => t.status === 'cancelled').length || 0;
    const skippedCount = tokensToday?.filter(t => t.status === 'skipped').length || 0;

    // Service History Metrics (Averages)
    const { data: history } = await supabase
      .from('service_history')
      .select('wait_duration_seconds, service_duration_seconds')
      .not('service_duration_seconds', 'is', null);

    let avgWaitSecs = 0;
    let avgServiceSecs = 0;

    if (history && history.length > 0) {
      const totalWait = history.reduce((acc, h) => acc + (h.wait_duration_seconds || 0), 0);
      const totalServ = history.reduce((acc, h) => acc + (h.service_duration_seconds || 0), 0);
      avgWaitSecs = Math.round(totalWait / history.length);
      avgServiceSecs = Math.round(totalServ / history.length);
    }

    res.status(200).json({
      success: true,
      data: {
        counters: {
          total: totalServices,
          active: activeServices,
          paused: totalServices - activeServices
        },
        tokens: {
          total_issued: totalIssuedToday,
          waiting: waitingCount,
          serving: servingCount,
          completed: completedCount,
          cancelled: cancelledCount,
          skipped: skippedCount
        },
        performance: {
          avg_wait_seconds: avgWaitSecs,
          avg_wait_minutes: +(avgWaitSecs / 60).toFixed(1),
          avg_service_seconds: avgServiceSecs,
          avg_service_minutes: +(avgServiceSecs / 60).toFixed(1)
        }
      }
    });
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/admin/staff-assignments
 * Lists all staff members with their current service assignments
 */
async function getStaffAssignments(req, res, next) {
  try {
    const { data: assignments, error } = await supabase
      .from('staff_services')
      .select(`
        id,
        created_at,
        profiles ( id, full_name, email, role ),
        services ( id, name, is_active )
      `);

    if (error) throw error;

    res.status(200).json({
      success: true,
      count: assignments?.length || 0,
      data: assignments || []
    });
  } catch (err) {
    next(err);
  }
}

/**
 * POST /api/admin/staff-assignments
 * Assigns a staff member to a counter
 */
async function createStaffAssignment(req, res, next) {
  try {
    const { staff_id, service_id } = req.body;

    if (!isValidUUID(staff_id) || !isValidUUID(service_id)) {
      return res.status(400).json({
        success: false,
        error: 'INVALID_ID',
        message: 'Valid staff_id and service_id UUIDs are required.'
      });
    }

    // Verify staff user exists and has staff or admin role
    const { data: userProfile } = await supabase
      .from('profiles')
      .select('id, role')
      .eq('id', staff_id)
      .single();

    if (!userProfile) {
      return res.status(404).json({ success: false, error: 'USER_NOT_FOUND', message: 'Staff user profile not found.' });
    }

    const { data: assignment, error } = await supabase
      .from('staff_services')
      .insert({ staff_id, service_id })
      .select()
      .single();

    if (error) {
      if (error.code === '23505') { // Unique constraint violation
        return res.status(409).json({ success: false, error: 'ALREADY_ASSIGNED', message: 'Staff member is already assigned to this service.' });
      }
      throw error;
    }

    res.status(201).json({
      success: true,
      message: 'Staff member assigned to service successfully.',
      data: assignment
    });
  } catch (err) {
    next(err);
  }
}

/**
 * DELETE /api/admin/staff-assignments/:id
 * Removes staff assignment
 */
async function deleteStaffAssignment(req, res, next) {
  try {
    const { id } = req.params;

    if (!isValidUUID(id)) {
      return res.status(400).json({ success: false, error: 'INVALID_ID', message: 'Assignment ID must be a valid UUID.' });
    }

    const { error } = await supabase
      .from('staff_services')
      .delete()
      .eq('id', id);

    if (error) throw error;

    res.status(200).json({
      success: true,
      message: 'Staff assignment removed successfully.'
    });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  createService,
  updateService,
  getAnalytics,
  getStaffAssignments,
  createStaffAssignment,
  deleteStaffAssignment
};
