#!/usr/bin/env node
// Fix "use client" directive placement in ALL JSX files

const fs = require('fs');
const path = require('path');

// Find all JSX files
function findJSXFiles(dir) {
  const files = [];
  
  function searchDirectory(currentDir) {
    const items = fs.readdirSync(currentDir);
    
    for (const item of items) {
      const fullPath = path.join(currentDir, item);
      const stat = fs.statSync(fullPath);
      
      if (stat.isDirectory() && !item.startsWith('.') && item !== 'node_modules') {
        searchDirectory(fullPath);
      } else if (stat.isFile() && item.endsWith('.jsx')) {
        files.push(fullPath);
      }
    }
  }
  
  searchDirectory(dir);
  return files;
}

// Fix "use client" directive placement
function fixUseClientDirective(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    const originalContent = content;
    
    // Check if file has "use client" directive
    if (!content.includes('"use client"')) {
      return false;
    }
    
    // Split into lines
    const lines = content.split('\n');
    
    // Check if "use client" is already at the top
    if (lines[0].trim() === '"use client"') {
      return false; // Already correct
    }
    
    // Find and remove "use client" from wherever it is
    const useClientIndex = lines.findIndex(line => line.trim() === '"use client"');
    if (useClientIndex === -1) {
      return false;
    }
    
    // Remove the "use client" line
    lines.splice(useClientIndex, 1);
    
    // Add "use client" at the very beginning
    lines.unshift('"use client"');
    
    // Join back together
    content = lines.join('\n');
    
    // Only write if content changed
    if (content !== originalContent) {
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
const jsxFiles = findJSXFiles(projectRoot);

console.log(`Found ${jsxFiles.length} JSX files to check for "use client" directive...`);

let fixedCount = 0;
jsxFiles.forEach(file => {
  const relativePath = path.relative(projectRoot, file);
  
  if (fixUseClientDirective(file)) {
    console.log(`✅ Fixed: ${relativePath}`);
    fixedCount++;
  }
});

console.log(`\n🎉 Fixed ${fixedCount} files with "use client" directive placement!`);
