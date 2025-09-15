// lib/supabaseClient.js
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Supabase URL or Anon Key are not defined in environment variables.');
  // You might want to throw an error or handle this more gracefully in a real app
  // For development, it's fine to just log
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);