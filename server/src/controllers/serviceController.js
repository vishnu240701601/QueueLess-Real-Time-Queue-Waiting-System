// =====================================================================
// QueueLess – Service Controller
// =====================================================================

const { supabase } = require('../config/supabase');
const { isValidUUID } = require('../utils/validators');

/**
 * GET /api/services
 * Returns list of active service counters with live queue metrics
 */
async function getServices(req, res, next) {
  try {
    const today = new Date().toISOString().split('T')[0];

    // Fetch services
    const { data: services, error: srvError } = await supabase
      .from('services')
      .select('id, name, description, is_active, avg_service_time_mins, created_at')
      .order('name', { ascending: true });

    if (srvError) throw srvError;

    // Fetch today's queue sessions
    const { data: sessions, error: sesError } = await supabase
      .from('queue_sessions')
      .select('id, service_id, status, next_token_number, current_token_id')
      .eq('session_date', today);

    if (sesError) throw sesError;

    const sessionMap = new Map();
    (sessions || []).forEach(s => sessionMap.set(s.service_id, s));

    // For each service, count waiting tokens today
    const { data: waitingTokens, error: waitError } = await supabase
      .from('tokens')
      .select('service_id, status')
      .in('status', ['waiting', 'called', 'serving']);

    if (waitError) throw waitError;

    const waitingCountMap = new Map();
    (waitingTokens || []).forEach(t => {
      if (t.status === 'waiting') {
        waitingCountMap.set(t.service_id, (waitingCountMap.get(t.service_id) || 0) + 1);
      }
    });

    const enrichedServices = (services || []).map(service => {
      const session = sessionMap.get(service.id);
      const waitingCount = waitingCountMap.get(service.id) || 0;
      const estWaitMins = waitingCount * (service.avg_service_time_mins || 5);

      return {
        ...service,
        session_status: session ? session.status : 'no_session',
        next_token_number: session ? session.next_token_number : 1,
        current_token_id: session ? session.current_token_id : null,
        waiting_count: waitingCount,
        estimated_wait_mins: estWaitMins
      };
    });

    res.status(200).json({
      success: true,
      count: enrichedServices.length,
      data: enrichedServices
    });
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/services/:id
 * Returns single service with live queue summary
 */
async function getServiceById(req, res, next) {
  try {
    const { id } = req.params;

    if (!isValidUUID(id)) {
      return res.status(400).json({
        success: false,
        error: 'INVALID_ID',
        message: 'The requested service ID must be a valid UUID.'
      });
    }

    const { data: service, error: srvError } = await supabase
      .from('services')
      .select('*')
      .eq('id', id)
      .single();

    if (srvError || !service) {
      return res.status(404).json({
        success: false,
        error: 'SERVICE_NOT_FOUND',
        message: 'No service counter found with the specified ID.'
      });
    }

    // Call atomic queue summary function
    const { data: summary, error: rpcError } = await supabase
      .rpc('rpc_get_queue_summary', { p_service_id: id });

    res.status(200).json({
      success: true,
      data: {
        ...service,
        queue_summary: summary || null
      }
    });
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/services/:id/queue
 * Returns active waiting tokens for a given service
 */
async function getServiceQueue(req, res, next) {
  try {
    const { id } = req.params;

    if (!isValidUUID(id)) {
      return res.status(400).json({
        success: false,
        error: 'INVALID_ID',
        message: 'The requested service ID must be a valid UUID.'
      });
    }

    // Determine if caller has staff/admin elevated permissions
    const isElevated = req.user && ['staff', 'admin'].includes(req.user.role);

    let query = supabase
      .from('tokens')
      .select(`
        id,
        token_number,
        status,
        created_at,
        called_at,
        user_id,
        profiles ( full_name )
      `)
      .eq('service_id', id)
      .in('status', ['waiting', 'called', 'serving'])
      .order('token_number', { ascending: true });

    const { data: tokens, error } = await query;

    if (error) throw error;

    // Sanitize user identity if caller is public / general student
    const sanitizedQueue = (tokens || []).map((t, idx) => ({
      id: t.id,
      position: idx + 1,
      token_number: t.token_number,
      status: t.status,
      created_at: t.created_at,
      called_at: t.called_at,
      user_name: isElevated ? t.profiles?.full_name || 'Visitor' : 'Customer'
    }));

    res.status(200).json({
      success: true,
      service_id: id,
      count: sanitizedQueue.length,
      data: sanitizedQueue
    });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getServices,
  getServiceById,
  getServiceQueue
};
