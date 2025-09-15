#!/usr/bin/env node
// scripts/security-test.js
// Security testing script for the Eduvance website

const https = require('https');
const http = require('http');
const { URL } = require('url');

// Configuration
const BASE_URL = process.env.TEST_URL || 'http://localhost:3000';
const TEST_TIMEOUT = 10000;

// Test results
const results = {
  passed: 0,
  failed: 0,
  warnings: 0,
  tests: []
};

// Utility function to make HTTP requests
function makeRequest(url, options = {}) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    const isHttps = urlObj.protocol === 'https:';
    const client = isHttps ? https : http;
    
    const requestOptions = {
      hostname: urlObj.hostname,
      port: urlObj.port || (isHttps ? 443 : 80),
      path: urlObj.pathname + urlObj.search,
      method: options.method || 'GET',
      headers: {
        'User-Agent': 'Security-Test/1.0',
        ...options.headers
      },
      timeout: TEST_TIMEOUT
    };

    const req = client.request(requestOptions, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          body: data
        });
      });
    });

    req.on('error', reject);
    req.on('timeout', () => reject(new Error('Request timeout')));
    
    if (options.body) {
      req.write(options.body);
    }
    
    req.end();
  });
}

// Test function wrapper
async function runTest(name, testFn) {
  try {
    console.log(`Running test: ${name}`);
    await testFn();
    results.passed++;
    results.tests.push({ name, status: 'PASSED' });
    console.log(`✅ ${name} - PASSED\n`);
  } catch (error) {
    results.failed++;
    results.tests.push({ name, status: 'FAILED', error: error.message });
    console.log(`❌ ${name} - FAILED: ${error.message}\n`);
  }
}

// Security tests
async function testSecurityHeaders() {
  const response = await makeRequest(BASE_URL);
  
  const requiredHeaders = [
    'x-content-type-options',
    'x-frame-options',
    'x-xss-protection',
    'referrer-policy',
    'permissions-policy'
  ];
  
  const missingHeaders = requiredHeaders.filter(header => 
    !response.headers[header]
  );
  
  if (missingHeaders.length > 0) {
    throw new Error(`Missing security headers: ${missingHeaders.join(', ')}`);
  }
  
  // Check specific header values
  if (response.headers['x-frame-options'] !== 'DENY') {
    throw new Error('X-Frame-Options should be DENY');
  }
  
  if (response.headers['x-content-type-options'] !== 'nosniff') {
    throw new Error('X-Content-Type-Options should be nosniff');
  }
}

async function testHTTPSRedirect() {
  if (BASE_URL.startsWith('https://')) {
    console.log('Skipping HTTPS redirect test (already HTTPS)');
    return;
  }
  
  try {
    const httpsUrl = BASE_URL.replace('http://', 'https://');
    await makeRequest(httpsUrl);
    console.log('HTTPS endpoint is accessible');
  } catch (error) {
    results.warnings++;
    console.log(`⚠️  HTTPS not available: ${error.message}`);
  }
}

async function testRateLimiting() {
  const testEndpoint = `${BASE_URL}/api/members`;
  const requests = [];
  
  // Make multiple rapid requests
  for (let i = 0; i < 10; i++) {
    requests.push(makeRequest(testEndpoint));
  }
  
  const responses = await Promise.allSettled(requests);
  const rateLimited = responses.some(result => 
    result.status === 'fulfilled' && result.value.statusCode === 429
  );
  
  if (!rateLimited) {
    throw new Error('Rate limiting not working - no 429 responses received');
  }
}

async function testSQLInjection() {
  const testPayloads = [
    "'; DROP TABLE users; --",
    "' OR '1'='1",
    "'; INSERT INTO users VALUES ('hacker', 'password'); --"
  ];
  
  for (const payload of testPayloads) {
    try {
      const response = await makeRequest(`${BASE_URL}/api/staff-users`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          username: payload,
          email: 'test@example.com',
          password: 'password123',
          role: 'staff'
        })
      });
      
      // Should return 400 or 403, not 500
      if (response.statusCode === 500) {
        throw new Error(`SQL injection vulnerability detected with payload: ${payload}`);
      }
    } catch (error) {
      if (error.message.includes('SQL injection')) {
        throw error;
      }
      // Expected to fail due to authentication
    }
  }
}

async function testXSSProtection() {
  const xssPayload = '<script>alert("xss")</script>';
  
  try {
    const response = await makeRequest(`${BASE_URL}/api/watermark`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        url: `https://drive.google.com/d/${xssPayload}`
      })
    });
    
    // Check if XSS payload is reflected in response
    if (response.body.includes(xssPayload)) {
      throw new Error('XSS vulnerability detected - payload reflected in response');
    }
  } catch (error) {
    if (error.message.includes('XSS')) {
      throw error;
    }
    // Expected to fail due to authentication
  }
}

async function testAuthenticationRequired() {
  const protectedEndpoints = [
    '/dashboard/admin',
    '/dashboard/staff',
    '/api/staff-users',
    '/api/watermark'
  ];
  
  for (const endpoint of protectedEndpoints) {
    const response = await makeRequest(`${BASE_URL}${endpoint}`);
    
    // Should redirect to login or return 401/403
    if (response.statusCode === 200) {
      throw new Error(`Protected endpoint ${endpoint} is accessible without authentication`);
    }
  }
}

async function testInputValidation() {
  const invalidInputs = [
    { username: '', email: 'invalid-email', password: '123', role: 'invalid' },
    { username: 'a', email: 'test@example.com', password: 'password123', role: 'staff' },
    { username: 'test', email: 'test@example.com', password: '123', role: 'staff' }
  ];
  
  for (const input of invalidInputs) {
    try {
      const response = await makeRequest(`${BASE_URL}/api/staff-users`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(input)
      });
      
      // Should return 400 for invalid input
      if (response.statusCode === 200) {
        throw new Error(`Input validation failed for: ${JSON.stringify(input)}`);
      }
    } catch (error) {
      if (error.message.includes('Input validation')) {
        throw error;
      }
      // Expected to fail due to authentication
    }
  }
}

async function testFileUploadSecurity() {
  // Test file upload with malicious content
  const maliciousFile = {
    name: 'malicious.php',
    type: 'application/x-php',
    content: '<?php system($_GET["cmd"]); ?>'
  };
  
  try {
    const response = await makeRequest(`${BASE_URL}/api/watermark`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        url: 'https://drive.google.com/d/test',
        file: maliciousFile
      })
    });
    
    // Should reject malicious file types
    if (response.statusCode === 200) {
      throw new Error('Malicious file upload accepted');
    }
  } catch (error) {
    if (error.message.includes('Malicious file')) {
      throw error;
    }
    // Expected to fail due to authentication
  }
}

// Main test runner
async function runSecurityTests() {
  console.log('🔒 Starting Security Tests for Eduvance Website\n');
  console.log(`Testing against: ${BASE_URL}\n`);
  
  await runTest('Security Headers', testSecurityHeaders);
  await runTest('HTTPS Redirect', testHTTPSRedirect);
  await runTest('Rate Limiting', testRateLimiting);
  await runTest('SQL Injection Protection', testSQLInjection);
  await runTest('XSS Protection', testXSSProtection);
  await runTest('Authentication Required', testAuthenticationRequired);
  await runTest('Input Validation', testInputValidation);
  await runTest('File Upload Security', testFileUploadSecurity);
  
  // Print results
  console.log('📊 Security Test Results:');
  console.log(`✅ Passed: ${results.passed}`);
  console.log(`❌ Failed: ${results.failed}`);
  console.log(`⚠️  Warnings: ${results.warnings}`);
  console.log(`📈 Total: ${results.passed + results.failed + results.warnings}\n`);
  
  if (results.failed > 0) {
    console.log('❌ Failed Tests:');
    results.tests
      .filter(test => test.status === 'FAILED')
      .forEach(test => console.log(`  - ${test.name}: ${test.error}`));
  }
  
  if (results.warnings > 0) {
    console.log('\n⚠️  Warnings:');
    console.log('  - Consider enabling HTTPS in production');
  }
  
  // Exit with error code if tests failed
  if (results.failed > 0) {
    process.exit(1);
  }
  
  console.log('🎉 All security tests passed!');
}

// Run tests if this script is executed directly
if (require.main === module) {
  runSecurityTests().catch(error => {
    console.error('Test runner error:', error);
    process.exit(1);
  });
}

module.exports = {
  runSecurityTests,
  makeRequest,
  runTest
};
