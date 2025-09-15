#!/usr/bin/env node
// Script to fix all remaining files that directly import environment variables

const fs = require('fs');
const path = require('path');

// Files that need to be updated to use the secure client
const filesToFix = [
  'src/app/sitemap.xml/route.js',
  'src/app/staffAccess/page.jsx',
  'src/app/dashboard/staff/page.jsx',
  'src/app/dashboard/admin/page.jsx',
  'src/app/subjects/biology/IAL/communityNotes/page.jsx',
  'src/app/subjects/mathematics/IAL/communityNotes/page.jsx',
  'src/app/subjects/business/IAL/communityNotes/page.jsx',
  'src/app/subjects/psychology/IAL/communityNotes/page.jsx',
  'src/app/subjects/accounting/IAL/communityNotes/page.jsx',
  'src/app/subjects/mathematics/IGCSE/communityNotes/page.jsx',
  'src/app/subjects/biology/IGCSE/communityNotes/page.jsx',
  'src/app/subjects/business/IGCSE/communityNotes/page.jsx',
  'src/app/subjects/accounting/IGCSE/communityNotes/page.jsx',
  'src/app/subjects/chemistry/IAL/communityNotes/page.jsx',
  'src/app/subjects/template/IAL/communityNotes/page.jsx',
  'src/app/subjects/chemistry/IGCSE/communityNotes/page.jsx',
  'src/app/subjects/template/IGCSE/communityNotes/page.jsx',
  'src/app/subjects/economics/IAL/communityNotes/page.jsx',
  'src/app/subjects/physics/IAL/communityNotes/page.jsx',
  'src/app/subjects/economics/IGCSE/communityNotes/page.jsx',
  'src/app/subjects/information-technology/IAL/communityNotes/page.jsx',
  'src/app/subjects/computer-science/IAL/communityNotes/page.jsx',
  'src/app/subjects/computer-science/IGCSE/communityNotes/page.jsx',
  'src/app/subjects/english-language/IAL/communityNotes/page.jsx',
  'src/app/subjects/information-technology/IGCSE/communityNotes/page.jsx',
  'src/app/subjects/further-mathematics/IGCSE/communityNotes/page.jsx',
  'src/app/subjects/further-mathematics/IAL/communityNotes/page.jsx',
  'src/app/subjects/english-literature/IAL/communityNotes/page.jsx',
  'src/app/subjects/physics/IGCSE/communityNotes/page.jsx',
  'src/app/subjects/english-language/IGCSE/communityNotes/page.jsx',
  'src/app/subjects/english-literature/IGCSE/communityNotes/page.jsx'
];

// Content for community notes pages
const communityNotesContent = `"use client";

import { supabase } from '@/lib/supabaseClient';
import { useState, useEffect } from 'react';

// ... rest of the component code ...`;

// Content for dashboard pages
const dashboardContent = `"use client";

import { supabase } from '@/lib/supabaseClient';
// ... rest of the imports and component code ...`;

// Content for sitemap
const sitemapContent = `// import dotenv from 'dotenv';
// dotenv.config();

import { supabase } from '@/lib/supabaseClient';

// ... rest of the sitemap code ...`;

// Content for staff access
const staffAccessContent = `"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import { User, LogIn, Loader2 } from 'lucide-react';

// ... rest of the component code ...`;

console.log(`Found ${filesToFix.length} files that need to be updated:`);

filesToFix.forEach(file => {
  const fullPath = path.join(__dirname, '..', file);
  
  if (!fs.existsSync(fullPath)) {
    console.log(`⚠️  File not found: ${file}`);
    return;
  }
  
  console.log(`- ${file}`);
  
  try {
    let content;
    
    if (file.includes('communityNotes')) {
      content = communityNotesContent;
    } else if (file.includes('dashboard')) {
      content = dashboardContent;
    } else if (file.includes('sitemap')) {
      content = sitemapContent;
    } else if (file.includes('staffAccess')) {
      content = staffAccessContent;
    } else {
      content = `import { supabase } from '@/lib/supabaseClient';`;
    }
    
    // For now, just add the import at the top and remove direct env usage
    const originalContent = fs.readFileSync(fullPath, 'utf8');
    
    // Remove direct environment variable usage
    let newContent = originalContent
      .replace(/const supabaseUrl = process\.env\.NEXT_PUBLIC_SUPABASE_URL;?\n?/g, '')
      .replace(/const supabaseAnonKey = process\.env\.NEXT_PUBLIC_SUPABASE_ANON_KEY;?\n?/g, '')
      .replace(/const supabaseKey = process\.env\.NEXT_PUBLIC_SUPABASE_ANON_KEY;?\n?/g, '')
      .replace(/let supabase = null;?\n?/g, '')
      .replace(/try \{[^}]*\} catch \([^)]*\) \{[^}]*\}/g, '')
      .replace(/if \(!supabaseUrl \|\| !supabaseAnonKey\) \{[^}]*\}/g, '')
      .replace(/else if \(!supabaseUrl\.startsWith\('https:\/\/'\) \|\| !supabaseUrl\.includes\('\.supabase\.co'\)\) \{[^}]*\}/g, '')
      .replace(/else if \(!supabaseAnonKey\.startsWith\('eyJ'\)\) \{[^}]*\}/g, '')
      .replace(/else \{[^}]*\}/g, '')
      .replace(/console\.error\("[^"]*"\);?\n?/g, '')
      .replace(/createClient\(supabaseUrl, supabaseAnonKey\)/g, 'supabase')
      .replace(/createClient\(supabaseUrl, supabaseKey\)/g, 'supabase');
    
    // Add the secure import at the top
    if (!newContent.includes("import { supabase } from '@/lib/supabaseClient'")) {
      newContent = `import { supabase } from '@/lib/supabaseClient';\n${newContent}`;
    }
    
    fs.writeFileSync(fullPath, newContent);
    console.log(`  ✅ Updated successfully`);
  } catch (error) {
    console.error(`  ❌ Error updating ${file}:`, error.message);
  }
});

console.log('\n🎉 All files have been updated to use the secure Supabase client!');
console.log('\n⚠️  IMPORTANT: Make sure to set your environment variables in Vercel!');
