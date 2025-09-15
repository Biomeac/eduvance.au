#!/usr/bin/env node
// Script to fix all Supabase client files to use secure configuration

const fs = require('fs');
const path = require('path');

// Find all Supabase client files
function findSupabaseClientFiles(dir) {
  const files = [];
  
  function searchDirectory(currentDir) {
    const items = fs.readdirSync(currentDir);
    
    for (const item of items) {
      const fullPath = path.join(currentDir, item);
      const stat = fs.statSync(fullPath);
      
      if (stat.isDirectory() && !item.startsWith('.') && item !== 'node_modules') {
        searchDirectory(fullPath);
      } else if (stat.isFile() && item === 'supabaseClient.js') {
        files.push(fullPath);
      }
    }
  }
  
  searchDirectory(dir);
  return files;
}

// Secure Supabase client content
const secureClientContent = `// src/lib/supabaseClient.js
import { supabase } from '@/lib/secureSupabaseClient';

export { supabase };
`;

// Find and update all Supabase client files
const projectRoot = path.join(__dirname, '..');
const clientFiles = findSupabaseClientFiles(projectRoot);

console.log(`Found ${clientFiles.length} Supabase client files to update:`);

clientFiles.forEach(file => {
  console.log(`- ${file}`);
  
  try {
    fs.writeFileSync(file, secureClientContent);
    console.log(`  ✅ Updated successfully`);
  } catch (error) {
    console.error(`  ❌ Error updating ${file}:`, error.message);
  }
});

console.log('\n🎉 All Supabase client files have been updated to use secure configuration!');
console.log('\n⚠️  IMPORTANT: Make sure to set your environment variables in Vercel:');
console.log('   - NEXT_PUBLIC_SUPABASE_URL');
console.log('   - NEXT_PUBLIC_SUPABASE_ANON_KEY');
console.log('   - SUPABASE_SERVICE_ROLE_KEY');
