#!/usr/bin/env node
// Final security fix - remove ALL remaining createClient calls with environment variables

const fs = require('fs');
const path = require('path');

// Find all JSX files that still have createClient calls
function findFilesWithCreateClient(dir) {
  const files = [];
  
  function searchDirectory(currentDir) {
    const items = fs.readdirSync(currentDir);
    
    for (const item of items) {
      const fullPath = path.join(currentDir, item);
      const stat = fs.statSync(fullPath);
      
      if (stat.isDirectory() && !item.startsWith('.') && item !== 'node_modules' && item !== 'api') {
        searchDirectory(fullPath);
      } else if (stat.isFile() && item.endsWith('.jsx') && !item.includes('api/')) {
        const content = fs.readFileSync(fullPath, 'utf8');
        if (content.includes('createClient(') && content.includes('process.env.NEXT_PUBLIC_SUPABASE')) {
          files.push(fullPath);
        }
      }
    }
  }
  
  searchDirectory(dir);
  return files;
}

// Clean up createClient calls
function cleanCreateClientCalls(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Remove createClient import if present
    content = content.replace(/import { createClient } from '@supabase\/supabase-js';?\n?/g, '');
    
    // Remove createClient calls with environment variables
    content = content.replace(/const supabase = createClient\(\s*process\.env\.NEXT_PUBLIC_SUPABASE_URL,\s*process\.env\.NEXT_PUBLIC_SUPABASE_ANON_KEY\s*\);?\n?/g, '');
    
    // Remove any remaining createClient calls
    content = content.replace(/const supabase = createClient\([^)]*\);?\n?/g, '');
    
    // Ensure the secure import is at the top
    if (!content.includes("import { supabase } from '@/lib/supabaseClient'")) {
      // Find the first import statement
      const importMatch = content.match(/^import.*$/m);
      if (importMatch) {
        content = content.replace(importMatch[0], `${importMatch[0]}\nimport { supabase } from '@/lib/supabaseClient';`);
      } else {
        content = `import { supabase } from '@/lib/supabaseClient';\n${content}`;
      }
    }
    
    // Clean up any duplicate imports
    const lines = content.split('\n');
    const uniqueLines = [];
    const seenImports = new Set();
    
    for (const line of lines) {
      if (line.trim().startsWith('import')) {
        if (!seenImports.has(line.trim())) {
          uniqueLines.push(line);
          seenImports.add(line.trim());
        }
      } else {
        uniqueLines.push(line);
      }
    }
    
    content = uniqueLines.join('\n');
    
    fs.writeFileSync(filePath, content);
    return true;
  } catch (error) {
    console.error(`Error processing ${filePath}:`, error.message);
    return false;
  }
}

// Main execution
const projectRoot = path.join(__dirname, '..');
const filesToFix = findFilesWithCreateClient(projectRoot);

console.log(`Found ${filesToFix.length} files with createClient calls that need fixing:`);

let fixedCount = 0;
filesToFix.forEach(file => {
  const relativePath = path.relative(projectRoot, file);
  
  if (cleanCreateClientCalls(file)) {
    console.log(`✅ Fixed: ${relativePath}`);
    fixedCount++;
  } else {
    console.log(`❌ Failed: ${relativePath}`);
  }
});

console.log(`\n🎉 Final security fix complete! Fixed ${fixedCount} files.`);
console.log('\n⚠️  IMPORTANT: Make sure to set your environment variables in Vercel!');
