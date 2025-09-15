// components/client/SupabaseAuthContext.jsx
"use client"

import { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient"; // This will now be the createBrowserClient

const SupabaseAuthContext = createContext({
  session: null,
  user: null,
  loading: true,
  // You might want to add sign-in/sign-out functions here too for client-side forms
  // For example:
  // signIn: async () => {},
  // signOut: async () => {},
});

export default function SupabaseAuthProvider({ children }) {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    // Initial session check
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (mounted) {
        setSession(session);
        setLoading(false);
      }
    }).catch(error => {
      console.error("Error fetching initial Supabase session:", error);
      if (mounted) setLoading(false);
    });

    // Listen for auth state changes (login, logout, token refresh)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (mounted) {
        setSession(session);
        // setLoading(false); // No need to set loading here, it's already false after initial load
      }
    });

    // Cleanup subscription on component unmount
    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  // You can also expose auth methods here if you want to use them directly from context
  const signIn = async (credentials) => {
    setLoading(true); // Indicate loading when auth action starts
    const { data, error } = await supabase.auth.signInWithPassword(credentials);
    setLoading(false);
    if (error) throw error;
    return data;
  };

  const signOut = async () => {
    setLoading(true);
    const { error } = await supabase.auth.signOut();
    setLoading(false);
    if (error) throw error;
  };

  const signUp = async (credentials) => {
    setLoading(true);
    const { data, error } = await supabase.auth.signUp(credentials);
    setLoading(false);
    if (error) throw error;
    return data;
  };


  return (
    <SupabaseAuthContext.Provider value={{ session, user: session?.user ?? null, loading, signIn, signOut, signUp }}>
      {children}
    </SupabaseAuthContext.Provider>
  );
}

export function useSupabaseAuth() {
  const context = useContext(SupabaseAuthContext);
  if (context === undefined) {
    throw new Error('useSupabaseAuth must be used within a SupabaseAuthProvider');
  }
  return context;
}