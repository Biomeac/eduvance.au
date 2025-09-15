// components/client/SupabaseAuthContext.jsx
"use client"

import { createContext, useContext, useEffect, useState } from "react";
import { apiClient } from "@/lib/secure-api-client";

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
    // Check authentication status using API client
    const isAuth = apiClient.isAuthenticated();
    const username = apiClient.getUsername();
    
    if (isAuth && username) {
      setSession({ user: { email: username } });
    } else {
      setSession(null);
    }
    setLoading(false);
  }, []);

  // Auth methods using API client
  const signIn = async (credentials) => {
    setLoading(true);
    try {
      const data = await apiClient.login(credentials.email, credentials.password);
      setSession({ user: { email: data.user.email } });
      return data;
    } catch (error) {
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    setLoading(true);
    try {
      await apiClient.logout();
      setSession(null);
    } catch (error) {
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (credentials) => {
    // Note: Sign up functionality would need to be implemented in the API
    throw new Error('Sign up not implemented in API client');
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