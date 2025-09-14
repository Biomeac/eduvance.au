// lib/supabaseClient.js
import { createBrowserClient } from '@supabase/ssr';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Supabase URL or Anon Key are not defined in environment variables.');
  // Consider throwing an error or handling this more robustly in production
  // throw new Error('Supabase environment variables are missing.');
}

// This client is for client-side code ("use client" components).
// It automatically handles session storage in browser cookies.
export const supabase = createBrowserClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    // These are often the defaults with createBrowserClient, but good to be explicit
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  }
});