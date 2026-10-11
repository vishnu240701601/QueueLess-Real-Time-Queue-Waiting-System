// =====================================================================
// QueueLess – Role & Assignment Authorization Middleware
// Enforces role-based permissions and staff counter assignment checks
// =====================================================================

const { supabase } = require('../config/supabase');
const { isValidUUID } = require('../utils/validators');

function requireRole(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'UNAUTHORIZED',
        message: 'Authentication required to access this endpoint.'
      });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        error: 'FORBIDDEN',
        message: `Access denied. Requires one of the following roles: [${allowedRoles.join(', ')}]. Current role: '${req.user.role}'`
      });
    }

    next();
  };
}

// Enforces that staff can ONLY manage services they are actively assigned to
function requireStaffForService(getServiceIdFn) {
  return async (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ success: false, error: 'UNAUTHORIZED', message: 'Authentication required.' });
    }

    // Administrators always have campus-wide access
    if (req.user.role === 'admin') {
      return next();
    }

    if (req.user.role !== 'staff') {
      return res.status(403).json({
        success: false,
        error: 'FORBIDDEN',
        message: 'Staff or administrator role required.'
      });
    }

    const serviceId = typeof getServiceIdFn === 'function' ? getServiceIdFn(req) : req.params.id || req.body.service_id;

    if (!serviceId || !isValidUUID(serviceId)) {
      return res.status(400).json({
        success: false,
        error: 'INVALID_SERVICE_ID',
        message: 'A valid service UUID is required to verify staff assignment.'
      });
    }

    // Check staff_services table
    const { data: assignment, error } = await supabase
      .from('staff_services')
      .select('id')
      .eq('staff_id', req.user.id)
      .eq('service_id', serviceId)
      .maybeSingle();

    if (error || !assignment) {
      return res.status(403).json({
        success: false,
        error: 'STAFF_NOT_ASSIGNED',
        message: 'You are not assigned to manage this service counter.'
      });
    }

    next();
  };
}

module.exports = {
  requireRole,
  requireStaffForService
};
