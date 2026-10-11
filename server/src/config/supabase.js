// =====================================================================
// QueueLess – Server-side Supabase Client Configuration
// Uses the trusted SERVICE_ROLE_KEY to execute RPCs & query PostgreSQL
// =====================================================================

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceRoleKey) {
  console.warn(
    '[Supabase Config Warning] SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY is missing in environment variables. ' +
    'Database operations will fail until valid Supabase credentials are provided in your environment settings.'
  );
}

// Serverless-optimized Supabase client
const supabase = createClient(supabaseUrl || 'https://placeholder.supabase.co', supabaseServiceRoleKey || 'placeholder-key', {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

module.exports = {
  supabase
};
