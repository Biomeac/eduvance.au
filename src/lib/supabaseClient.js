// src/lib/supabaseClient.js
// This file is safe for client-side use - no direct environment variable access

import { createClient } from '@supabase/supabase-js';

// These will be replaced at build time by Next.js with actual values
// but they won't be hardcoded in the source
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Validate that we have the required environment variables
if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing required Supabase environment variables. Please check your .env.local file.');
}

// Validate URL format
if (!supabaseUrl.startsWith('https://') || !supabaseUrl.includes('.supabase.co')) {
  throw new Error('Invalid Supabase URL format. Must be a valid Supabase project URL.');
}

// Validate key format (JWT should start with eyJ)
if (!supabaseAnonKey.startsWith('eyJ')) {
  throw new Error('Invalid Supabase Anon Key format. Must be a valid JWT token.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true
  }
});