// Environment variable validation for build-time checks
export function validateEnvironmentVariables() {
  const requiredVars = [
    'SUPABASE_URL',
    'SUPABASE_ANON_KEY', 
    'SUPABASE_SERVICE_ROLE_KEY'
  ];

  const missing = requiredVars.filter(varName => !process.env[varName]);
  
  if (missing.length > 0) {
    console.warn(`⚠️  Missing environment variables: ${missing.join(', ')}`);
    console.warn('These are required for production deployment but not for build time.');
    return false;
  }
  
  return true;
}

// Only validate during build if we're in a build context
if (process.env.NODE_ENV === 'production' && process.env.VERCEL) {
  validateEnvironmentVariables();
}
