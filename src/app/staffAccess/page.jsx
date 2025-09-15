"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@supabase/supabase-js';
import { User, LogIn, Loader2 } from 'lucide-react';

// --- Supabase Configuration ---
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'YOUR_SUPABASE_PROJECT_URL';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'YOUR_SUPABASE_ANON_KEY';

let supabase = null;
try {
    if (supabaseUrl && supabaseAnonKey && supabaseUrl.startsWith('http')) {
        supabase = createClient(supabaseUrl, supabaseAnonKey);
    } else {
        console.error("Supabase URL or Anon Key is invalid. Please ensure NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY are set correctly.");
    }
} catch (e) {
    console.error("Error initializing Supabase client:", e.message);
}


/**
 * Staff Authentication Page Component.
 * This component provides a form for staff sign-in using Supabase's built-in authentication.
 * It handles redirection upon successful login and displays messages.
 */
export default function StaffAuthPage() {
  const router = useRouter(); 

  const [session, setSession] = useState(null); 
  const [email, setEmail] = useState('');       
  const [password, setPassword] = useState(''); 
  const [message, setMessage] = useState('');   
  const [loading, setLoading] = useState(false); 

  // --- UPDATED: Supabase Auth State Listener and Redirection ---
  useEffect(() => {
    const authHandler = async () => {
      // Check if user is authenticated via API client
      const isAuth = apiClient.isAuthenticated();
      
      if (!isAuth) {
        setMessage("Please log in to access staff area.");
        router.replace('/');
        return;
      }

      setSession({ user: { email: apiClient.getUsername() } });
      setLoading(false);

        // If authorized, redirect based on their role.
        if (staffData.role === 'admin') {
          router.replace('/dashboard/admin');
        } else {
          router.replace('/dashboard/staff');
        }
      }

      // Set up a listener for real-time authentication state changes.
      const { data: authListener } = supabase.auth.onAuthStateChange(
        async (_event, newSession) => {
          setSession(newSession);
          if (newSession) {
            setLoading(true);
            const { data: staffData, error: staffError } = await supabase
              .from('staff_users')
              .select('role')
              .eq('id', newSession.user.id)
              .single();
            setLoading(false);

            // Security check in the listener: If the user is not staff, sign them out.
            if (staffError || !staffData) {
              console.error("User is not in staff_users table or an error occurred:", staffError);
              setMessage("Access denied. You are not a registered staff member.");
              // IMPORTANT: Sign out the unauthorized user.
              await supabase.auth.signOut();
              router.replace('/');
              return;
            }

            // If authorized, redirect based on their role.
            if (staffData.role === 'admin') {
              router.replace('/dashboard/admin');
            } else {
              router.replace('/dashboard/staff');
            }
          }
        }
      );

      // Cleanup function
      return () => {
        if (authListener && authListener.subscription) {
            authListener.subscription.unsubscribe();
        }
      };
    };

    authHandler();
  }, [router]);

  /**
   * Handles the staff sign-in process.
   */
  const handleSignIn = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    if (!supabase) {
        setMessage("Supabase client not initialized.");
        setLoading(false);
        return;
    }

    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });

      if (error) {
          throw error;
      }

      if (data.user) {
        // Fetch role and check if the user is in the staff_users table
        const { data: staffData, error: staffError } = await supabase
          .from('staff_users')
          .select('role')
          .eq('id', data.user.id)
          .single();
        
        // Security check after a successful sign-in attempt
        if (staffError || !staffData) {
          console.error("User is not in staff_users table or an error occurred:", staffError);
          // Sign the user out since they are not authorized staff
          await supabase.auth.signOut();
          setMessage('Access denied. Your account is not a registered staff member.');
          setLoading(false);
          return;
        }

        if (staffData.role === 'admin') {
          setMessage('Sign-in successful! Redirecting to admin dashboard...');
          router.replace('/dashboard/admin');
        } else {
          setMessage('Sign-in successful! Redirecting to staff dashboard...');
          router.replace('/dashboard/staff');
        }
        setEmail('');
        setPassword('');
      } else {
         setMessage('Sign-in failed. Please check your credentials or confirm your email.');
      }
    } catch (error) {
      setMessage(`Sign-in error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center p-4 font-[Inter]">
      <div className="bg-white p-8 rounded-xl shadow-2xl w-full max-w-md border border-blue-200">
        <h1 className="text-3xl font-bold text-center text-blue-600 mb-6 tracking-[-1px]" style={{ fontFamily: 'Poppins, sans-serif' }}>
          Staff Authentication
        </h1>

        {session ? (
          <div className="text-center">
            <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center justify-center" style={{ fontFamily: 'Poppins, sans-serif' }}>
              {User && <User className="mr-2 text-blue-500" size={24} />} Welcome, {session.user.email}!
            </h2>
            <p className="text-gray-600 mb-6" style={{ fontFamily: 'Poppins, sans-serif' }}>
              You are already logged in. Redirecting to your dashboard...
            </p>
            {message && !message.includes('error') && !message.includes('failed') && (
              <p className="mt-4 text-sm text-green-600 bg-green-50 p-3 rounded-lg border border-green-200" style={{ fontFamily: 'Poppins, sans-serif' }}>{message}</p>
            )}
            {message && (message.includes('error') || message.includes('failed')) && (
              <p className="mt-4 text-sm text-red-600 bg-red-50 p-3 rounded-lg border border-red-200" style={{ fontFamily: 'Poppins, sans-serif' }}>{message}</p>
            )}
          </div>
        ) : (
          <>
            <form onSubmit={handleSignIn} className="space-y-4 mb-6">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700" style={{ fontFamily: 'Poppins, sans-serif' }}>
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="staff@example.com"
                  required
                  style={{ fontFamily: 'Poppins, sans-serif' }}
                />
              </div>
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700" style={{ fontFamily: 'Poppins, sans-serif' }}>
                  Password
                </label>
                <input
                  type="password"
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="Enter your password"
                  required
                  style={{ fontFamily: 'Poppins, sans-serif' }}
                />
              </div>
              <button
                type="submit"
                className="cursor-pointer w-full flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-lg shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200"
                style={{ fontFamily: 'Poppins, sans-serif' }}
                disabled={loading}
              >
                {loading ? (
                  <Loader2 className="animate-spin mr-2" size={20} />
                ) : (
                  LogIn && <LogIn className="mr-2" size={20} /> 
                )}
                Sign In
              </button>
            </form>

            {message && !message.includes('error') && !message.includes('failed') && (
              <p className="mt-4 text-sm text-green-600 bg-green-50 p-3 rounded-lg border border-green-200" style={{ fontFamily: 'Poppins, sans-serif' }}>{message}</p>
            )}
            {message && (message.includes('error') || message.includes('failed')) && (
              <p className="mt-4 text-sm text-red-600 bg-red-50 p-3 rounded-lg border border-red-200" style={{ fontFamily: 'Poppins, sans-serif' }}>{message}</p>
            )}
          </>
        )}
      </div>
    </div>
  );
}