// Server-side Supabase client for backend operations
import { createClient } from '@supabase/supabase-js';

// Function to get Supabase admin client (lazy initialization)
export const getSupabaseAdmin = () => {
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error('Missing Supabase environment variables: SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set');
  }

  return createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    }
  });
};

// Client for user-specific operations (with RLS)
export const createServerClient = (accessToken) => {
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Missing Supabase environment variables: SUPABASE_URL and SUPABASE_ANON_KEY must be set');
  }

  return createClient(supabaseUrl, supabaseAnonKey, {
    global: {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    },
  });
};

// Safe initialization for build time - only create client if env vars exist
let supabaseAdminInstance = null;

try {
  if (process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY) {
    supabaseAdminInstance = getSupabaseAdmin();
  }
} catch (error) {
  // Silently fail during build time if env vars are missing
  console.warn('Supabase admin client not initialized due to missing environment variables');
}

// Legacy export for backward compatibility
export const supabaseAdmin = supabaseAdminInstance;
