// =====================================================================
// QueueLess – Staff Operations Controller
// =====================================================================

const { supabase } = require('../config/supabase');
const { isValidUUID, sanitizeString } = require('../utils/validators');

/**
 * Helper to verify staff has assignment to a given service
 */
async function verifyStaffAssignment(staffId, serviceId, role) {
  if (role === 'admin') return true;
  const { data, error } = await supabase
    .from('staff_services')
    .select('id')
    .eq('staff_id', staffId)
    .eq('service_id', serviceId)
    .maybeSingle();

  return !error && !!data;
}

/**
 * POST /api/staff/tokens/:id/call
 * Calls a specific token to the counter
 */
async function callToken(req, res, next) {
  try {
    const { id } = req.params;

    if (!isValidUUID(id)) {
      return res.status(400).json({ success: false, error: 'INVALID_ID', message: 'Token ID must be a valid UUID.' });
    }

    const { data: token, error: tokenError } = await supabase
      .from('tokens')
      .select('id, service_id, token_number, status, queue_session_id')
      .eq('id', id)
      .single();

    if (tokenError || !token) {
      return res.status(404).json({ success: false, error: 'TOKEN_NOT_FOUND', message: 'Token not found.' });
    }

    const isAuthorized = await verifyStaffAssignment(req.user.id, token.service_id, req.user.role);
    if (!isAuthorized) {
      return res.status(403).json({
        success: false,
        error: 'FORBIDDEN',
        message: 'You are not assigned to manage this service counter.'
      });
    }

    if (token.status !== 'waiting') {
      return res.status(400).json({
        success: false,
        error: 'INVALID_STATUS',
        message: `Token #${token.token_number} is already in '${token.status}' state and cannot be called.`
      });
    }

    // Auto-skip previous unattended called token on the same session
    await supabase
      .from('tokens')
      .update({ status: 'skipped', completed_at: new Date().toISOString() })
      .eq('queue_session_id', token.queue_session_id)
      .eq('status', 'called');

    // Transition this token to 'called'
    const { data: updated, error: updateError } = await supabase
      .from('tokens')
      .update({
        status: 'called',
        called_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (updateError) throw updateError;

    // Update session current_token_id
    await supabase
      .from('queue_sessions')
      .update({ current_token_id: id })
      .eq('id', token.queue_session_id);

    res.status(200).json({
      success: true,
      message: `Token #${token.token_number} has been called.`,
      data: updated
    });
  } catch (err) {
    next(err);
  }
}

/**
 * POST /api/staff/services/:serviceId/call-next
 * Atomically calls the next waiting token in the line
 */
async function callNextInQueue(req, res, next) {
  try {
    const { serviceId } = req.params;

    if (!isValidUUID(serviceId)) {
      return res.status(400).json({ success: false, error: 'INVALID_SERVICE_ID', message: 'Service ID must be a valid UUID.' });
    }

    const isAuthorized = await verifyStaffAssignment(req.user.id, serviceId, req.user.role);
    if (!isAuthorized) {
      return res.status(403).json({
        success: false,
        error: 'FORBIDDEN',
        message: 'You are not assigned to manage this service counter.'
      });
    }

    // Call atomic stored function
    const { data: result, error: rpcError } = await supabase.rpc('rpc_call_next_token', {
      p_service_id: serviceId,
      p_staff_id: req.user.id
    });

    if (rpcError) {
      const msg = rpcError.message || '';
      if (msg.includes('SERVICE_IN_PROGRESS')) {
        return res.status(409).json({ success: false, error: 'SERVICE_IN_PROGRESS', message: msg });
      }
      throw rpcError;
    }

    if (!result.success) {
      return res.status(200).json({
        success: false,
        message: result.message || 'Queue is currently empty.'
      });
    }

    res.status(200).json({
      success: true,
      message: `Token #${result.token_number} called to counter.`,
      data: result
    });
  } catch (err) {
    next(err);
  }
}

/**
 * POST /api/staff/tokens/:id/start
 * Transitions called token to 'serving'
 */
async function startService(req, res, next) {
  try {
    const { id } = req.params;

    if (!isValidUUID(id)) {
      return res.status(400).json({ success: false, error: 'INVALID_ID', message: 'Token ID must be a valid UUID.' });
    }

    const { data: result, error: rpcError } = await supabase.rpc('rpc_update_token_status', {
      p_token_id: id,
      p_new_status: 'serving',
      p_staff_id: req.user.id,
      p_notes: null
    });

    if (rpcError) {
      const msg = rpcError.message || '';
      if (msg.includes('FORBIDDEN')) return res.status(403).json({ success: false, error: 'FORBIDDEN', message: msg });
      if (msg.includes('INVALID_TRANSITION')) return res.status(400).json({ success: false, error: 'INVALID_TRANSITION', message: msg });
      throw rpcError;
    }

    res.status(200).json({
      success: true,
      message: 'Service marked as in progress.',
      data: result
    });
  } catch (err) {
    next(err);
  }
}

/**
 * POST /api/staff/tokens/:id/complete
 * Completes service and logs duration
 */
async function completeService(req, res, next) {
  try {
    const { id } = req.params;
    const notes = sanitizeString(req.body.notes || '', 500);

    if (!isValidUUID(id)) {
      return res.status(400).json({ success: false, error: 'INVALID_ID', message: 'Token ID must be a valid UUID.' });
    }

    const { data: result, error: rpcError } = await supabase.rpc('rpc_update_token_status', {
      p_token_id: id,
      p_new_status: 'completed',
      p_staff_id: req.user.id,
      p_notes: notes
    });

    if (rpcError) {
      const msg = rpcError.message || '';
      if (msg.includes('FORBIDDEN')) return res.status(403).json({ success: false, error: 'FORBIDDEN', message: msg });
      if (msg.includes('INVALID_TRANSITION')) return res.status(400).json({ success: false, error: 'INVALID_TRANSITION', message: msg });
      throw rpcError;
    }

    res.status(200).json({
      success: true,
      message: 'Service completed successfully.',
      data: result
    });
  } catch (err) {
    next(err);
  }
}

/**
 * POST /api/staff/tokens/:id/skip
 * Marks unattended token as skipped
 */
async function skipToken(req, res, next) {
  try {
    const { id } = req.params;
    const notes = sanitizeString(req.body.notes || 'Staff marked customer skipped', 500);

    if (!isValidUUID(id)) {
      return res.status(400).json({ success: false, error: 'INVALID_ID', message: 'Token ID must be a valid UUID.' });
    }

    const { data: result, error: rpcError } = await supabase.rpc('rpc_update_token_status', {
      p_token_id: id,
      p_new_status: 'skipped',
      p_staff_id: req.user.id,
      p_notes: notes
    });

    if (rpcError) {
      const msg = rpcError.message || '';
      if (msg.includes('FORBIDDEN')) return res.status(403).json({ success: false, error: 'FORBIDDEN', message: msg });
      if (msg.includes('INVALID_TRANSITION')) return res.status(400).json({ success: false, error: 'INVALID_TRANSITION', message: msg });
      throw rpcError;
    }

    res.status(200).json({
      success: true,
      message: 'Token marked as skipped.',
      data: result
    });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  callToken,
  callNextInQueue,
  startService,
  completeService,
  skipToken
};
