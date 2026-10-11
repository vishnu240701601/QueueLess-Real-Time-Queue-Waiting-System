// =====================================================================
// QueueLess – Authentication Middleware
// Verifies Supabase Auth JWT and retrieves authoritative database profile
// =====================================================================

const { supabase } = require('../config/supabase');

async function authenticate(req, res, next) {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        error: 'UNAUTHORIZED',
        message: 'Missing or malformed Authorization header. Expected format: Bearer <access_token>'
      });
    }

    const token = authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({
        success: false,
        error: 'UNAUTHORIZED',
        message: 'Bearer token string is empty.'
      });
    }

    // Verify token with Supabase Auth
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return res.status(401).json({
        success: false,
        error: 'INVALID_TOKEN',
        message: authError ? authError.message : 'Invalid or expired session token.'
      });
    }

    // Query authoritative user profile from database (NEVER trust role from frontend)
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('id, full_name, role')
      .eq('id', user.id)
      .single();

    if (profileError || !profile) {
      // Fallback: If profile row was not yet created by trigger, create it safely as 'student'
      const defaultProfile = {
        id: user.id,
        full_name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'Student',
        role: 'student'
      };

      await supabase.from('profiles').upsert(defaultProfile).catch(() => {});
      req.user = {
        id: user.id,
        email: user.email,
        ...defaultProfile
      };
    } else {
      req.user = {
        id: user.id,
        email: user.email,
        full_name: profile.full_name,
        role: profile.role
      };
    }

    next();
  } catch (err) {
    console.error('[Auth Middleware Error]:', err.message);
    return res.status(500).json({
      success: false,
      error: 'AUTH_VERIFICATION_FAILED',
      message: 'Failed to verify authentication credentials.'
    });
  }
}

// Optional authentication middleware for endpoints accessible publicly or with extra info when authenticated
async function optionalAuthenticate(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    req.user = null;
    return next();
  }
  return authenticate(req, res, next);
}

module.exports = {
  authenticate,
  optionalAuthenticate
};
