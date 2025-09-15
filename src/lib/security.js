// src/lib/security.js
import { createServerSupabaseClient } from '@/utils/supabase/server';
import { NextResponse } from 'next/server';

// Rate limiting store (in production, use Redis or database)
const rateLimitStore = new Map();

// Rate limiting configuration
const RATE_LIMITS = {
  '/api/staff-users': { requests: 5, window: 60000 }, // 5 requests per minute
  '/api/watermark': { requests: 10, window: 60000 },   // 10 requests per minute
  '/api/members': { requests: 30, window: 60000 },     // 30 requests per minute
};

// Input validation schemas
export const VALIDATION_SCHEMAS = {
  staffUser: {
    username: { type: 'string', minLength: 3, maxLength: 50, pattern: /^[a-zA-Z0-9_-]+$/ },
    email: { type: 'string', pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/ },
    password: { type: 'string', minLength: 8, maxLength: 128 },
    role: { type: 'string', enum: ['admin', 'moderator', 'staff'] }
  },
  watermark: {
    url: { type: 'string', pattern: /^https:\/\/drive\.google\.com\/.+/ }
  }
};

// Rate limiting middleware
export function checkRateLimit(ip, endpoint) {
  const limit = RATE_LIMITS[endpoint];
  if (!limit) return true;

  const key = `${ip}:${endpoint}`;
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

// Input validation function
export function validateInput(data, schema) {
  const errors = [];

  for (const [field, rules] of Object.entries(schema)) {
    const value = data[field];

    if (rules.required && (value === undefined || value === null || value === '')) {
      errors.push(`${field} is required`);
      continue;
    }

    if (value !== undefined && value !== null) {
      if (rules.type && typeof value !== rules.type) {
        errors.push(`${field} must be a ${rules.type}`);
        continue;
      }

      if (rules.minLength && value.length < rules.minLength) {
        errors.push(`${field} must be at least ${rules.minLength} characters`);
        continue;
      }

      if (rules.maxLength && value.length > rules.maxLength) {
        errors.push(`${field} must be no more than ${rules.maxLength} characters`);
        continue;
      }

      if (rules.pattern && !rules.pattern.test(value)) {
        errors.push(`${field} format is invalid`);
        continue;
      }

      if (rules.enum && !rules.enum.includes(value)) {
        errors.push(`${field} must be one of: ${rules.enum.join(', ')}`);
        continue;
      }
    }
  }

  return errors;
}

// Authentication middleware
export async function authenticateRequest(request) {
  try {
    const supabase = createServerSupabaseClient();
    const { data: { user }, error } = await supabase.auth.getUser();

    if (error || !user) {
      return { user: null, error: 'Unauthorized' };
    }

    return { user, error: null };
  } catch (error) {
    return { user: null, error: 'Authentication failed' };
  }
}

// Authorization middleware
export async function authorizeStaff(request, requiredRole = 'staff') {
  const { user, error } = await authenticateRequest(request);
  
  if (error || !user) {
    return { authorized: false, error: 'Authentication required' };
  }

  try {
    const supabase = createServerSupabaseClient();
    const { data: staffData, error: staffError } = await supabase
      .from('staff_users')
      .select('role')
      .eq('id', user.id)
      .single();

    if (staffError || !staffData) {
      return { authorized: false, error: 'Staff access required' };
    }

    // Role hierarchy: admin > moderator > staff
    const roleHierarchy = { admin: 3, moderator: 2, staff: 1 };
    const userLevel = roleHierarchy[staffData.role] || 0;
    const requiredLevel = roleHierarchy[requiredRole] || 1;

    if (userLevel < requiredLevel) {
      return { authorized: false, error: 'Insufficient permissions' };
    }

    return { authorized: true, user, role: staffData.role };
  } catch (error) {
    return { authorized: false, error: 'Authorization failed' };
  }
}

// Security headers middleware
export function addSecurityHeaders(response) {
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-XSS-Protection', '1; mode=block');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  
  return response;
}

// Sanitize input data
export function sanitizeInput(data) {
  if (typeof data === 'string') {
    return data
      .replace(/[<>]/g, '') // Remove potential HTML tags
      .trim();
  }
  
  if (typeof data === 'object' && data !== null) {
    const sanitized = {};
    for (const [key, value] of Object.entries(data)) {
      sanitized[key] = sanitizeInput(value);
    }
    return sanitized;
  }
  
  return data;
}

// Get client IP address
export function getClientIP(request) {
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

// Security error response
export function createSecurityError(message, status = 401) {
  return NextResponse.json(
    { error: message, timestamp: new Date().toISOString() },
    { status, headers: { 'Content-Type': 'application/json' } }
  );
}
