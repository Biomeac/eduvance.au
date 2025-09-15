export default function robots() {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/staffAccess/','/dashboard/admin/', '/dashboard/staff/', '/api/']
    }
  }
}