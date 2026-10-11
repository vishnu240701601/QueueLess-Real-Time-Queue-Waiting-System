// =====================================================================
// QueueLess – Token Controller
// =====================================================================

const { supabase } = require('../config/supabase');
const { isValidUUID, sanitizeString } = require('../utils/validators');

/**
 * POST /api/tokens
 * Atomic token generation using database RPC
 */
async function createToken(req, res, next) {
  try {
    const { service_id } = req.body;

    if (!service_id || !isValidUUID(service_id)) {
      return res.status(400).json({
        success: false,
        error: 'INVALID_SERVICE_ID',
        message: 'A valid service_id UUID is required in the request body.'
      });
    }

    // Call atomic stored procedure (prevents race conditions and duplicate numbering)
    const { data: result, error: rpcError } = await supabase.rpc('rpc_generate_token', {
      p_service_id: service_id,
      p_user_id: req.user.id
    });

    if (rpcError) {
      const msg = rpcError.message || '';

      if (msg.includes('ACTIVE_TOKEN_EXISTS')) {
        return res.status(409).json({
          success: false,
          error: 'ACTIVE_TOKEN_EXISTS',
          message: 'You already hold an active token for this service counter.'
        });
      }

      if (msg.includes('SERVICE_INACTIVE') || msg.includes('SESSION_NOT_ACTIVE')) {
        return res.status(400).json({
          success: false,
          error: 'SERVICE_UNAVAILABLE',
          message: msg
        });
      }

      if (msg.includes('SERVICE_NOT_FOUND')) {
        return res.status(404).json({
          success: false,
          error: 'SERVICE_NOT_FOUND',
          message: 'The requested service counter was not found.'
        });
      }

      throw rpcError;
    }

    res.status(201).json({
      success: true,
      message: 'Token issued successfully.',
      data: result
    });
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/tokens/mine
 * Retrieves current user's token history and active ticket
 */
async function getMyTokens(req, res, next) {
  try {
    const { data: tokens, error } = await supabase
      .from('tokens')
      .select(`
        id,
        token_number,
        status,
        created_at,
        called_at,
        completed_at,
        services (
          id,
          name,
          avg_service_time_mins
        )
      `)
      .eq('user_id', req.user.id)
      .order('created_at', { ascending: false });

    if (error) throw error;

    // For any active token, enrich with people ahead calculation
    const enriched = await Promise.all((tokens || []).map(async (t) => {
      if (['waiting', 'called', 'serving'].includes(t.status)) {
        const { count: aheadCount } = await supabase
          .from('tokens')
          .select('id', { count: 'exact', head: true })
          .eq('service_id', t.services?.id)
          .eq('status', 'waiting')
          .lt('token_number', t.token_number);

        const peopleAhead = aheadCount || 0;
        const estWait = peopleAhead * (t.services?.avg_service_time_mins || 5);

        return {
          ...t,
          people_ahead: peopleAhead,
          estimated_wait_mins: estWait
        };
      }
      return t;
    }));

    res.status(200).json({
      success: true,
      count: enriched.length,
      data: enriched
    });
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/tokens/:id
 * Retrieves specific token details with authorization check
 */
async function getTokenById(req, res, next) {
  try {
    const { id } = req.params;

    if (!isValidUUID(id)) {
      return res.status(400).json({ success: false, error: 'INVALID_ID', message: 'Token ID must be a valid UUID.' });
    }

    const { data: token, error } = await supabase
      .from('tokens')
      .select(`
        *,
        services ( id, name, description, avg_service_time_mins ),
        profiles ( id, full_name )
      `)
      .eq('id', id)
      .single();

    if (error || !token) {
      return res.status(404).json({ success: false, error: 'TOKEN_NOT_FOUND', message: 'Token not found.' });
    }

    // Access control: User must own token, or be Admin, or Staff assigned to service
    const isOwner = token.user_id === req.user.id;
    const isAdmin = req.user.role === 'admin';

    if (!isOwner && !isAdmin) {
      if (req.user.role === 'staff') {
        const { data: assigned } = await supabase
          .from('staff_services')
          .select('id')
          .eq('staff_id', req.user.id)
          .eq('service_id', token.service_id)
          .maybeSingle();

        if (!assigned) {
          return res.status(403).json({ success: false, error: 'FORBIDDEN', message: 'You do not have access to this token.' });
        }
      } else {
        return res.status(403).json({ success: false, error: 'FORBIDDEN', message: 'You do not have access to this token.' });
      }
    }

    res.status(200).json({
      success: true,
      data: token
    });
  } catch (err) {
    next(err);
  }
}

/**
 * POST /api/tokens/:id/cancel
 * Student or admin token cancellation
 */
async function cancelToken(req, res, next) {
  try {
    const { id } = req.params;
    const reason = sanitizeString(req.body.reason || 'Cancelled by user', 200);

    if (!isValidUUID(id)) {
      return res.status(400).json({ success: false, error: 'INVALID_ID', message: 'Token ID must be a valid UUID.' });
    }

    const { data: result, error: rpcError } = await supabase.rpc('rpc_cancel_token', {
      p_token_id: id,
      p_user_id: req.user.id,
      p_reason: reason
    });

    if (rpcError) {
      const msg = rpcError.message || '';
      if (msg.includes('FORBIDDEN')) {
        return res.status(403).json({ success: false, error: 'FORBIDDEN', message: msg });
      }
      if (msg.includes('CANNOT_CANCEL')) {
        return res.status(400).json({ success: false, error: 'CANNOT_CANCEL', message: msg });
      }
      if (msg.includes('TOKEN_NOT_FOUND')) {
        return res.status(404).json({ success: false, error: 'TOKEN_NOT_FOUND', message: msg });
      }
      throw rpcError;
    }

    res.status(200).json({
      success: true,
      message: 'Token has been cancelled successfully.',
      data: result
    });
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/tokens/:id/position
 * Calculates real-time position and estimated wait time
 */
async function getTokenPosition(req, res, next) {
  try {
    const { id } = req.params;

    if (!isValidUUID(id)) {
      return res.status(400).json({ success: false, error: 'INVALID_ID', message: 'Token ID must be a valid UUID.' });
    }

    const { data: token, error: tokenError } = await supabase
      .from('tokens')
      .select('id, user_id, service_id, queue_session_id, token_number, status, services(avg_service_time_mins)')
      .eq('id', id)
      .single();

    if (tokenError || !token) {
      return res.status(404).json({ success: false, error: 'TOKEN_NOT_FOUND', message: 'Token not found.' });
    }

    if (!['waiting', 'called', 'serving'].includes(token.status)) {
      return res.status(200).json({
        success: true,
        data: {
          token_id: token.id,
          token_number: token.token_number,
          status: token.status,
          people_ahead: 0,
          estimated_wait_mins: 0,
          is_active: false
        }
      });
    }

    // Count people ahead in the same session
    const { count: aheadCount } = await supabase
      .from('tokens')
      .select('id', { count: 'exact', head: true })
      .eq('queue_session_id', token.queue_session_id)
      .eq('status', 'waiting')
      .lt('token_number', token.token_number);

    let totalAhead = aheadCount || 0;

    // Check if another token is currently being called or served
    const { data: activeOther } = await supabase
      .from('tokens')
      .select('id')
      .eq('queue_session_id', token.queue_session_id)
      .in('status', ['called', 'serving'])
      .neq('id', token.id)
      .limit(1);

    if (activeOther && activeOther.length > 0) {
      totalAhead += 1;
    }

    const avgMins = token.services?.avg_service_time_mins || 5;
    const estWait = totalAhead * avgMins;

    res.status(200).json({
      success: true,
      data: {
        token_id: token.id,
        token_number: token.token_number,
        status: token.status,
        people_ahead: totalAhead,
        estimated_wait_mins: estWait,
        is_active: true
      }
    });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  createToken,
  getMyTokens,
  getTokenById,
  cancelToken,
  getTokenPosition
};
