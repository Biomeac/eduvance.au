// src/lib/secureSupabaseClient.js
// Centralized, secure Supabase client configuration

import { createClient } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabaseClient';

// Environment variable validation
function validateEnvironment() {
    
  

  // Validate URL format
  if (!supabaseUrl.startsWith('https://') || !supabaseUrl.includes('.supabase.co')) {
    throw new Error('Invalid Supabase URL format. Must be a valid Supabase project URL.');
  }

  // Validate key format (JWT should start with eyJ)
  if (!supabaseAnonKey.startsWith('eyJ')) {
    throw new Error('Invalid Supabase Anon Key format. Must be a valid JWT token.');
  }

  return { supabaseUrl, supabaseAnonKey };
}

// Create secure Supabase client
function createSecureSupabaseClient() {
  try {
    const { supabaseUrl, supabaseAnonKey } = validateEnvironment();
    
    return createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true
      }
    });
  } catch (error) {
    console.error('Failed to initialize Supabase client:', error.message);
    return null;
  }
}

// Export the secure client
export const supabase = createSecureSupabaseClient();

// Export the validation function for use in other files
export { validateEnvironment };
