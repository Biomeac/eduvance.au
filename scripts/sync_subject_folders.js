require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.error('Supabase URL or Anon Key are not defined in environment variables.');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const SUBJECTS_DIR = path.join(__dirname, '../src/app/subjects');
const TEMPLATE_DIR = path.join(__dirname, '../src/app/subjects/template');

// Helper: kebab-case
function toKebabCase(str) {
  return str.toLowerCase().replace(/\s+/g, '-');
}

// Helper: sanitize subject name for function name (remove non-alphanumeric, capitalize each word, ensure valid identifier)
function toComponentName(str) {
  // Remove all non-alphanumeric characters and split into words
  const words = str.replace(/[^a-zA-Z0-9 ]/g, ' ').split(' ').filter(Boolean);
  // Capitalize each word and join
  let compName = words.map(w => w.charAt(0).toUpperCase() + w.slice(1)).join('');
  // If the first character is a digit, prefix with 'Subject'
  if (/^[0-9]/.test(compName)) {
    compName = 'Subject' + compName;
  }
  return compName;
}

// Helper: Recursively copy template folder and replace variables
function copyTemplateFolder(srcDir, destDir, replacements) {
  if (!fs.existsSync(destDir)) fs.mkdirSync(destDir, { recursive: true });
  const entries = fs.readdirSync(srcDir, { withFileTypes: true });
  for (const entry of entries) {
    const srcPath = path.join(srcDir, entry.name);
    const destPath = path.join(destDir, entry.name);
    if (entry.isDirectory()) {
      copyTemplateFolder(srcPath, destPath, replacements);
    } else if (entry.isFile()) {
      let content = fs.readFileSync(srcPath, 'utf8');
      // Replace all subject names and resource links with {subjectName} in all template files
      for (const [key, value] of Object.entries(replacements)) {
        const regex = new RegExp(key, 'g');
        content = content.replace(regex, value);
      }
      // Also replace any /subjects/SomeSubject/ with /subjects/{subjectName}/
      // content = content.replace(/\/subjects\/[a-zA-Z0-9\-]+\//g, '/subjects/{subjectName}/');
      // Also replace any direct subject name usage (e.g., Physics, PHYSICS) with {subjectName}
      // content = content.replace(/Physics/g, '{subjectName}');
      // content = content.replace(/PHYSICS/g, '{subjectName}');
      fs.writeFileSync(destPath, content, 'utf8');
    }
  }
}

async function main() {
  // 1. Fetch all subjects from Supabase (now also fetch code)
  const { data: subjects, error } = await supabase
    .from('subjects')
    .select('name, syllabus_type, code');
  if (error) {
    console.error('Error fetching subjects:', error.message);
    process.exit(1);
  }

  // 2. List all subject folders in subjects
  const existingFolders = fs.readdirSync(SUBJECTS_DIR)
    .filter(f => fs.statSync(path.join(SUBJECTS_DIR, f)).isDirectory());

  // 3. Build subject map: { kebabName: { name, syllabus_types: Set, codes: {type: code} } }
  const subjectMap = {};
  for (const subj of subjects) {
    const kebab = toKebabCase(subj.name);
    if (!subjectMap[kebab]) subjectMap[kebab] = { name: subj.name, syllabus_types: new Set(), codes: {} };
    if (subj.syllabus_type) subjectMap[kebab].syllabus_types.add(subj.syllabus_type);
    if (subj.syllabus_type && subj.code) subjectMap[kebab].codes[subj.syllabus_type] = subj.code;
  }

  // 4. Find missing subjects
  const missingSubjects = Object.keys(subjectMap).filter(kebab => !existingFolders.includes(kebab));

  if (missingSubjects.length === 0) {
    console.log('No missing subject folders. All subjects are present.');
    return;
  }

  // 5. Create missing folders/files using the template
  for (const kebab of missingSubjects) {
    const subj = subjectMap[kebab];
    const subjDir = path.join(SUBJECTS_DIR, kebab);
    fs.mkdirSync(subjDir, { recursive: true });
    // Main page.jsx (copy from template/page.jsx)
    copyTemplateFolder(
      path.join(TEMPLATE_DIR),
      subjDir,
      {
        '\\$\\{subjectName\\}': toKebabCase(subj.name),
        '\\{subjectName\\}': subj.name,
        '\\{subjectCode\\}': subj.codes['IAL'] || subj.codes['IGCSE'] || '', // fallback to any code
        '\\{syllabusType\\}': '', // Not used in main page.jsx
        '\\{examCode\\}': subj.codes['IAL'] || subj.codes['IGCSE'] || '',
      }
    );
    for (const type of subj.syllabus_types) {
      const typeDir = path.join(subjDir, type);
      fs.mkdirSync(typeDir, { recursive: true });
      // Copy template subfolders for this syllabus type
      copyTemplateFolder(
        path.join(TEMPLATE_DIR, type),
        typeDir,
        {
          '\\$\\{subjectName\\}': toKebabCase(subj.name),
          '\\{subjectName\\}': subj.name,
          '\\{subjectCode\\}': subj.codes[type] || '',
          '\\{syllabusType\\}': type,
          '\\{examCode\\}': subj.codes[type] || '',
        }
      );
    }
  }

  console.log('\nSummary:');
  console.log(`Checked ${Object.keys(subjectMap).length} subjects. Created ${missingSubjects.length} new subject folders.`);
}

main(); 