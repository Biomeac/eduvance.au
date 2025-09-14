import { supabase } from '@/lib/supabaseClient';
"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@supabase/supabase-js';
import { User, LogIn, Loader2 } from 'lucide-react';

// --- Supabase Configuration ---


// Validate environment variables
   

// ... existing code ...