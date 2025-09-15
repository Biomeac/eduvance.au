#!/usr/bin/env node
// Complete security fix - remove ALL direct environment variable usage from client-side files

const fs = require('fs');
const path = require('path');

// Find all JSX files that might have environment variable usage
function findClientFiles(dir) {
  const files = [];
  
  function searchDirectory(currentDir) {
    const items = fs.readdirSync(currentDir);
    
    for (const item of items) {
      const fullPath = path.join(currentDir, item);
      const stat = fs.statSync(fullPath);
      
      if (stat.isDirectory() && !item.startsWith('.') && item !== 'node_modules' && item !== 'api') {
        searchDirectory(fullPath);
      } else if (stat.isFile() && (item.endsWith('.jsx') || item.endsWith('.js')) && !item.includes('api/')) {
        files.push(fullPath);
      }
    }
  }
  
  searchDirectory(dir);
  return files;
}

// Clean up environment variable usage
function cleanFile(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Skip if it's already using the secure client
    if (content.includes("import { supabase } from '@/lib/supabaseClient'")) {
      return false;
    }
    
    // Skip API routes (server-side only)
    if (filePath.includes('/api/')) {
      return false;
    }
    
    // Skip if no environment variable usage
    if (!content.includes('process.env.NEXT_PUBLIC_SUPABASE')) {
      return false;
    }
    
    let modified = false;
    
    // Remove direct environment variable declarations
    const envVarPatterns = [
      /const supabaseUrl = process\.env\.NEXT_PUBLIC_SUPABASE_URL;?\n?/g,
      /const supabaseAnonKey = process\.env\.NEXT_PUBLIC_SUPABASE_ANON_KEY;?\n?/g,
      /const supabaseKey = process\.env\.NEXT_PUBLIC_SUPABASE_ANON_KEY;?\n?/g,
      /let supabase = null;?\n?/g,
      /let supabase;?\n?/g
    ];
    
    envVarPatterns.forEach(pattern => {
      if (pattern.test(content)) {
        content = content.replace(pattern, '');
        modified = true;
      }
    });
    
    // Remove validation blocks
    const validationPatterns = [
      /if \(!supabaseUrl \|\| !supabaseAnonKey\) \{[^}]*\}/g,
      /if \(!supabaseUrl \|\| !supabaseKey\) \{[^}]*\}/g,
      /else if \(!supabaseUrl\.startsWith\('https:\/\/'\) \|\| !supabaseUrl\.includes\('\.supabase\.co'\)\) \{[^}]*\}/g,
      /else if \(!supabaseAnonKey\.startsWith\('eyJ'\)\) \{[^}]*\}/g,
      /else if \(!supabaseKey\.startsWith\('eyJ'\)\) \{[^}]*\}/g,
      /else \{[^}]*\}/g,
      /try \{[^}]*\} catch \([^)]*\) \{[^}]*\}/g
    ];
    
    validationPatterns.forEach(pattern => {
      if (pattern.test(content)) {
        content = content.replace(pattern, '');
        modified = true;
      }
    });
    
    // Remove console.error statements
    content = content.replace(/console\.error\("[^"]*"\);?\n?/g, '');
    
    // Replace createClient calls with supabase
    content = content.replace(/createClient\(supabaseUrl, supabaseAnonKey\)/g, 'supabase');
    content = content.replace(/createClient\(supabaseUrl, supabaseKey\)/g, 'supabase');
    content = content.replace(/createClient\(process\.env\.NEXT_PUBLIC_SUPABASE_URL, process\.env\.NEXT_PUBLIC_SUPABASE_ANON_KEY\)/g, 'supabase');
    
    // Add secure import if not present
    if (!content.includes("import { supabase } from '@/lib/supabaseClient'")) {
      // Find the first import statement
      const importMatch = content.match(/^import.*$/m);
      if (importMatch) {
        content = content.replace(importMatch[0], `${importMatch[0]}\nimport { supabase } from '@/lib/supabaseClient';`);
      } else {
        content = `import { supabase } from '@/lib/supabaseClient';\n${content}`;
      }
      modified = true;
    }
    
    if (modified) {
      fs.writeFileSync(filePath, content);
      return true;
    }
    
    return false;
  } catch (error) {
    console.error(`Error processing ${filePath}:`, error.message);
    return false;
  }
}

// Main execution
const projectRoot = path.join(__dirname, '..');
const clientFiles = findClientFiles(projectRoot);

console.log(`Scanning ${clientFiles.length} client-side files for environment variable usage...`);

let fixedCount = 0;
clientFiles.forEach(file => {
  const relativePath = path.relative(projectRoot, file);
  
  if (cleanFile(file)) {
    console.log(`✅ Fixed: ${relativePath}`);
    fixedCount++;
  }
});

console.log(`\n🎉 Security fix complete! Fixed ${fixedCount} files.`);
console.log('\n⚠️  IMPORTANT: Make sure to set your environment variables in Vercel!');
console.log('   - NEXT_PUBLIC_SUPABASE_URL');
console.log('   - NEXT_PUBLIC_SUPABASE_ANON_KEY');
console.log('   - SUPABASE_SERVICE_ROLE_KEY');
