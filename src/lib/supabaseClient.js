// src/lib/supabaseClient.js
// Minimal Supabase client for authentication only
// This file only contains the anon key for auth UI components

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Supabase URL or Anon Key are not defined in environment variables.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
