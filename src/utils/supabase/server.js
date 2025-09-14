// utils/supabase/server.js
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers'; // Essential for App Router to access request cookies

export function createServerSupabaseClient() {
  const cookieStore = cookies(); // Get the cookie store from the Next.js request headers

  // Get environment variables directly (this is server-side only)
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  // Validate environment variables
  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Missing required Supabase environment variables. Please check your environment configuration.');
  }

  // Validate URL format
  if (!supabaseUrl.startsWith('https://') || !supabaseUrl.includes('.supabase.co')) {
    throw new Error('Invalid Supabase URL format. Must be a valid Supabase project URL.');
  }

  // Validate key format (JWT should start with eyJ)
  if (!supabaseAnonKey.startsWith('eyJ')) {
    throw new Error('Invalid Supabase Anon Key format. Must be a valid JWT token.');
  }

  return createServerClient(
    supabaseUrl,
    supabaseAnonKey,
    {
      cookies: {
        get: (name) => cookieStore.get(name)?.value, // How the client reads a cookie
        set: (name, value, options) => {
          try {
            // How the client sets a cookie (e.g., after a token refresh)
            // This method can only be called in a Server Component or Route Handler
            // that is part of a Next.js request/response cycle.
            cookieStore.set({ name, value, ...options });
          } catch (error) {
            console.warn('Could not set cookie from server client:', error);
            // This error typically happens if you try to set a cookie outside of a
            // server-side request context (e.g., in a standalone utility function
            // not directly invoked by a request).
          }
        },
        remove: (name, options) => {
          try {
            // How the client removes a cookie
            cookieStore.set({ name, value: '', ...options });
          } catch (error) {
            console.warn('Could not remove cookie from server client:', error);
          }
        },
      },
      auth: {
        // You generally don't need to specify persistSession etc. for server client,
        // as its state is per-request, derived from cookies.
        // The cookie handling is managed by the `cookies` object above.
      }
    }
  );
}