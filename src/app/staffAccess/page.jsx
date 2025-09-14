"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@supabase/supabase-js';
import { User, LogIn, Loader2 } from 'lucide-react';

// --- Supabase Configuration ---
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

let supabase = null;

// Validate environment variables
if (!supabaseUrl || !supabaseAnonKey) {
    console.error("Missing Supabase environment variables. Please ensure NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY are set correctly.");
} else if (!supabaseUrl.startsWith('https://') || !supabaseUrl.includes('.supabase.co')) {
    console.error("Invalid Supabase URL format. Must be a valid Supabase project URL.");
} else if (!supabaseAnonKey.startsWith('eyJ')) {
    console.error("Invalid Supabase Anon Key format. Must be a valid JWT token.");
} else {
    try {
        supabase = createClient(supabaseUrl, supabaseAnonKey);
    } catch (e) {
        console.error("Error initializing Supabase client:", e.message);
    }
}

// ... existing code ...