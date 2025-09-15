// Environment variable validation and security
// src/lib/env.js
// Environment variable validation and security

// Required environment variables
const REQUIRED_ENV_VARS = {
  NEXT_PUBLIC_SUPABASE_URL: {
    required: true,
    pattern: /^https:\/\/[a-zA-Z0-9-]+\.supabase\.co$/,
    message: 'Must be a valid Supabase URL'
  },
  NEXT_PUBLIC_SUPABASE_ANON_KEY: {
    required: true,
    minLength: 100,
    message: 'Must be a valid Supabase anon key'
  },
  SUPABASE_SERVICE_ROLE_KEY: {
    required: true,
    minLength: 100,
    message: 'Must be a valid Supabase service role key'
  }
};

// Optional environment variables with validation
const OPTIONAL_ENV_VARS = {
  BOT_TOKEN: {
    pattern: /^[A-Za-z0-9._-]+$/,
    message: 'Must be a valid Discord bot token'
  },
  GUILD_ID: {
    pattern: /^\d{17,19}$/,
    message: 'Must be a valid Discord guild ID'
  },
  GOOGLE_DRIVE_API_KEY: {
    pattern: /^[A-Za-z0-9_-]+$/,
    message: 'Must be a valid Google API key'
  }
};

// Validate environment variables
export function validateEnvironment() {
  const errors = [];
  const warnings = [];
  
  // Check required variables
  for (const [varName, rules] of Object.entries(REQUIRED_ENV_VARS)) {
    const value = process.env[varName];
    
    if (!value) {
      errors.push(`Missing required environment variable: ${varName}`);
      continue;
    }
    
    if (rules.pattern && !rules.pattern.test(value)) {
      errors.push(`Invalid ${varName}: ${rules.message}`);
    }
    
    if (rules.minLength && value.length < rules.minLength) {
      errors.push(`Invalid ${varName}: ${rules.message}`);
    }
  }
  
  // Check optional variables
  for (const [varName, rules] of Object.entries(OPTIONAL_ENV_VARS)) {
    const value = process.env[varName];
    
    if (value) {
      if (rules.pattern && !rules.pattern.test(value)) {
        warnings.push(`Invalid ${varName}: ${rules.message}`);
      }
      
      if (rules.minLength && value.length < rules.minLength) {
        warnings.push(`Invalid ${varName}: ${rules.message}`);
      }
    }
  }
  
  return { errors, warnings };
}

// Get validated environment variables
export function getValidatedEnv() {
  const { errors, warnings } = validateEnvironment();
  
  if (errors.length > 0) {
    throw new Error(`Environment validation failed:\n${errors.join('\n')}`);
  }
  
  if (warnings.length > 0) {
    console.warn('Environment warnings:', warnings);
  }
  
  return {
    supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL,
    supabaseAnonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    supabaseServiceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY,
    botToken: process.env.BOT_TOKEN,
    guildId: process.env.GUILD_ID,
    googleDriveApiKey: process.env.GOOGLE_DRIVE_API_KEY
  };
}

// Security headers configuration
export const SECURITY_HEADERS = {
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'X-XSS-Protection': '1; mode=block',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
  'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
  'Content-Security-Policy': [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: https:",
    "font-src 'self' data:",
    "connect-src 'self' https://*.supabase.co https://discord.com https://www.googleapis.com",
    "frame-ancestors 'none'"
  ].join('; ')
};

// CORS configuration
export const CORS_CONFIG = {
  origin: process.env.NODE_ENV === 'production' 
    ? ['https://eduvance.au', 'https://www.eduvance.au']
    : ['http://localhost:3000', 'http://127.0.0.1:3000'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  credentials: true
};

// Rate limiting configuration
export const RATE_LIMIT_CONFIG = {
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false
};

// Database connection security
export const DATABASE_SECURITY = {
  // Connection timeout
  connectionTimeout: 10000,
  // Query timeout
  queryTimeout: 30000,
  // Max connections
  maxConnections: 20,
  // SSL configuration
  ssl: {
    rejectUnauthorized: true
  }
};

// Session security configuration
export const SESSION_CONFIG = {
  // Session timeout (24 hours)
  maxAge: 24 * 60 * 60 * 1000,
  // Secure cookies in production
  secure: process.env.NODE_ENV === 'production',
  // HttpOnly cookies
  httpOnly: true,
  // SameSite policy
  sameSite: 'strict'
};

// Logging configuration
export const LOGGING_CONFIG = {
  level: process.env.NODE_ENV === 'production' ? 'warn' : 'debug',
  // Don't log sensitive data
  redact: ['password', 'token', 'key', 'secret'],
  // Log security events
  securityEvents: true
};

// File upload security
export const FILE_UPLOAD_SECURITY = {
  // Maximum file size (10MB)
  maxFileSize: 10 * 1024 * 1024,
  // Allowed file types
  allowedTypes: [
    'application/pdf',
    'image/jpeg',
    'image/png',
    'image/gif',
    'text/plain'
  ],
  // Allowed file extensions
  allowedExtensions: ['.pdf', '.jpg', '.jpeg', '.png', '.gif', '.txt'],
  // Scan files for malware (if available)
  scanForMalware: false,
  // Quarantine suspicious files
  quarantineSuspicious: true
};

// API security configuration
export const API_SECURITY = {
  // API version
  version: 'v1',
  // API prefix
  prefix: '/api',
  // Request timeout
  timeout: 30000,
  // Maximum request size
  maxRequestSize: '10mb',
  // Enable request logging
  enableLogging: true,
  // Enable metrics
  enableMetrics: true
};

// Export all configurations
export default {
  validateEnvironment,
  getValidatedEnv,
  SECURITY_HEADERS,
  CORS_CONFIG,
  RATE_LIMIT_CONFIG,
  DATABASE_SECURITY,
  SESSION_CONFIG,
  LOGGING_CONFIG,
  FILE_UPLOAD_SECURITY,
  API_SECURITY
};
