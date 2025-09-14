// src/middleware.js
// Next.js middleware for security and authentication

import { NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/utils/supabase/server';
import { SECURITY_HEADERS, CORS_CONFIG } from '@/lib/env';

// Rate limiting store (in production, use Redis)
const rateLimitStore = new Map();

// Rate limiting configuration
const RATE_LIMITS = {
  '/api/staff-users': { requests: 5, window: 60000 }, // 5 requests per minute
  '/api/watermark': { requests: 10, window: 60000 },   // 10 requests per minute
  '/api/members': { requests: 30, window: 60000 },     // 30 requests per minute
  '/dashboard': { requests: 20, window: 60000 },       // 20 requests per minute
  '/staffAccess': { requests: 10, window: 60000 },     // 10 requests per minute
};

// Protected routes that require authentication
const PROTECTED_ROUTES = [
  '/dashboard',
  '/staffAccess',
  '/api/staff-users',
  '/api/watermark'
];

// Admin-only routes
const ADMIN_ROUTES = [
  '/dashboard/admin',
  '/api/staff-users'
];

// Staff-only routes
const STAFF_ROUTES = [
  '/dashboard/staff',
  '/api/watermark'
];

// Get client IP address
function getClientIP(request) {
  const forwarded = request.headers.get('x-forwarded-for');
  const realIP = request.headers.get('x-real-ip');
  
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }
  
  if (realIP) {
    return realIP;
  }
  
  return 'unknown';
}

// Rate limiting check
function checkRateLimit(ip, path) {
  const limit = RATE_LIMITS[path] || RATE_LIMITS['/dashboard'];
  if (!limit) return true;

  const key = `${ip}:${path}`;
  const now = Date.now();
  const windowStart = now - limit.window;

  if (!rateLimitStore.has(key)) {
    rateLimitStore.set(key, []);
  }

  const requests = rateLimitStore.get(key);
  
  // Remove old requests outside the window
  const validRequests = requests.filter(timestamp => timestamp > windowStart);
  rateLimitStore.set(key, validRequests);

  if (validRequests.length >= limit.requests) {
    return false;
  }

  validRequests.push(now);
  return true;
}

// Check if user is authenticated
async function isAuthenticated(request) {
  try {
    const supabase = createServerSupabaseClient();
    const { data: { user }, error } = await supabase.auth.getUser();
    return { user, error };
  } catch (error) {
    return { user: null, error };
  }
}

// Check if user is staff
async function isStaff(request) {
  const { user, error } = await isAuthenticated(request);
  
  if (error || !user) {
    return { isStaff: false, role: null, error: 'Not authenticated' };
  }

  try {
    const supabase = createServerSupabaseClient();
    const { data: staffData, error: staffError } = await supabase
      .from('staff_users')
      .select('role')
      .eq('id', user.id)
      .single();

    if (staffError || !staffData) {
      return { isStaff: false, role: null, error: 'Not a staff member' };
    }

    return { isStaff: true, role: staffData.role, error: null };
  } catch (error) {
    return { isStaff: false, role: null, error: 'Staff check failed' };
  }
}

// Check if user is admin
async function isAdmin(request) {
  const { isStaff, role, error } = await isStaff(request);
  
  if (!isStaff) {
    return { isAdmin: false, error };
  }

  return { isAdmin: role === 'admin', error: null };
}

// Add security headers
function addSecurityHeaders(response) {
  Object.entries(SECURITY_HEADERS).forEach(([key, value]) => {
    response.headers.set(key, value);
  });
  return response;
}

// CORS handling
function handleCORS(request) {
  const origin = request.headers.get('origin');
  const isAllowedOrigin = CORS_CONFIG.origin.includes(origin);
  
  if (request.method === 'OPTIONS') {
    const response = new NextResponse(null, { status: 200 });
    
    if (isAllowedOrigin) {
      response.headers.set('Access-Control-Allow-Origin', origin);
    }
    response.headers.set('Access-Control-Allow-Methods', CORS_CONFIG.methods.join(', '));
    response.headers.set('Access-Control-Allow-Headers', CORS_CONFIG.allowedHeaders.join(', '));
    response.headers.set('Access-Control-Allow-Credentials', 'true');
    
    return addSecurityHeaders(response);
  }
  
  return null;
}

// Main middleware function
export async function middleware(request) {
  const { pathname } = request.nextUrl;
  const clientIP = getClientIP(request);
  
  // Handle CORS preflight requests
  const corsResponse = handleCORS(request);
  if (corsResponse) {
    return corsResponse;
  }
  
  // Rate limiting check
  const rateLimitPath = Object.keys(RATE_LIMITS).find(route => 
    pathname.startsWith(route)
  );
  
  if (rateLimitPath && !checkRateLimit(clientIP, rateLimitPath)) {
    return new NextResponse(
      JSON.stringify({ 
        error: 'Rate limit exceeded', 
        message: 'Too many requests, please try again later.',
        retryAfter: 60
      }),
      { 
        status: 429, 
        headers: { 
          'Content-Type': 'application/json',
          'Retry-After': '60'
        } 
      }
    );
  }
  
  // Check if route is protected
  const isProtectedRoute = PROTECTED_ROUTES.some(route => 
    pathname.startsWith(route)
  );
  
  if (isProtectedRoute) {
    // Check authentication
    const { user, error: authError } = await isAuthenticated(request);
    
    if (!user || authError) {
      return NextResponse.redirect(new URL('/staffAccess', request.url));
    }
    
    // Check admin routes
    const isAdminRoute = ADMIN_ROUTES.some(route => 
      pathname.startsWith(route)
    );
    
    if (isAdminRoute) {
      const { isAdmin, error: adminError } = await isAdmin(request);
      
      if (!isAdmin || adminError) {
        return NextResponse.redirect(new URL('/dashboard/staff', request.url));
      }
    }
    
    // Check staff routes
    const isStaffRoute = STAFF_ROUTES.some(route => 
      pathname.startsWith(route)
    );
    
    if (isStaffRoute) {
      const { isStaff, error: staffError } = await isStaff(request);
      
      if (!isStaff || staffError) {
        return NextResponse.redirect(new URL('/staffAccess', request.url));
      }
    }
  }
  
  // Continue with the request
  const response = NextResponse.next();
  
  // Add security headers to all responses
  return addSecurityHeaders(response);
}

// Configure which paths the middleware should run on
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|public/).*)',
  ],
};
