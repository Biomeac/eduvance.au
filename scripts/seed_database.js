import { supabase } from '@/lib/supabaseClient';
// Use 'require' for dependencies
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');
const readline = require('readline');
require('dotenv').config(); // Load environment variables from .env file

// --- Supabase Client Initialization ---
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY; // Using service_role key for seeding

if (!supabaseUrl || !supabaseServiceRoleKey) {
  console.error('⚠️ Error: NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set in environment variables.');
  process.exit(1);
}

// Initialize Supabase client with the service_role key.
// This client bypasses RLS policies, allowing inserts even if RLS is enabled.
const supabase = createClient(supabaseUrl, supabaseServiceRoleKey, {
  auth: {
    persistSession: false // No need to persist session for a one-off script
  }
});

// --- Configuration ---
const DATA_IMPORT_DIR = './data-import'; // Root directory for your JSON files
const BATCH_SIZE = 500; // Number of records to insert in one go for 'papers' table

// Create readline interface for user input
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Helper function to prompt user for input
function askQuestion(question) {
  return new Promise((resolve) => {
    rl.question(question, resolve);
  });
}

// Helper function to get existing subjects from database
async function getExistingSubjects() {
  console.log('🔍 Fetching existing subjects from database...');
  const { data: existingSubjects, error } = await supabase
    .from('subjects')
    .select('id, name, code, syllabus_type');
  
  if (error) {
    console.error('❌ Error fetching existing subjects:', error.message);
    throw error;
  }
  
  console.log(`✅ Found ${existingSubjects.length} existing subjects in database.`);
  return existingSubjects;
}

// Helper function to scan for available subjects in data directory
function scanAvailableSubjects() {
  console.log(`\n🔍 Scanning directory: ${DATA_IMPORT_DIR}`);
  const availableSubjects = new Map(); // Map: 'subject_unique_key' -> { name, syllabus_type, directory_path, json_files_count }

  const syllabusTypeDirs = fs.readdirSync(DATA_IMPORT_DIR, { withFileTypes: true })
                             .filter(dirent => dirent.isDirectory())
                             .map(dirent => dirent.name);

  if (syllabusTypeDirs.length === 0) {
      console.warn(`\n⚠️ No syllabus type directories found in '${DATA_IMPORT_DIR}'. Make sure your data is structured like 'data-import/IAL/Physics (2018)/'.`);
      return availableSubjects;
  }

  for (const syllabusType of syllabusTypeDirs) {
      const syllabusTypePath = path.join(DATA_IMPORT_DIR, syllabusType);
      console.log(`  📂 Scanning: ${syllabusType}`);

      const subjectDirs = fs.readdirSync(syllabusTypePath, { withFileTypes: true })
                            .filter(dirent => dirent.isDirectory())
                            .map(dirent => dirent.name);

      if (subjectDirs.length === 0) {
          console.warn(`    ⚠️ No subject directories found in '${syllabusTypePath}'. Skipping.`);
          continue;
      }

      for (const subjectDir of subjectDirs) {
        // Extract subject name by removing year in parentheses at the end
        const subjectNameMatch = subjectDir.match(/^(.+?)\s*\(\d{4}\)$/);
        const subjectName = subjectNameMatch ? subjectNameMatch[1].trim() : subjectDir;
        
        console.log(`    🔍 Debug: Folder "${subjectDir}" → Extracted name: "${subjectName}"`);
        
        const subjectUniqueKey = `${subjectName}-${syllabusType}`;
        const subjectDirPath = path.join(syllabusTypePath, subjectDir);
        
        // Check if directory has JSON files
        const jsonFiles = fs.readdirSync(subjectDirPath).filter(file => file.endsWith('.json'));
        
        if (jsonFiles.length > 0) {
          availableSubjects.set(subjectUniqueKey, {
            name: subjectName,
            syllabus_type: syllabusType,
            directory_path: subjectDirPath,
            json_files_count: jsonFiles.length
          });
          console.log(`    📚 Found: ${subjectName} (${syllabusType}) - ${jsonFiles.length} JSON files`);
        }
      }
  }

  return availableSubjects;
}

// Helper function to match available data with existing subjects
function matchSubjectsWithData(existingSubjects, availableSubjects) {
  const matchedSubjects = [];
  
  console.log('\n🔗 Matching existing subjects with available data...');
  
  for (const dbSubject of existingSubjects) {
    const subjectKey = `${dbSubject.name}-${dbSubject.syllabus_type}`;
    
    if (availableSubjects.has(subjectKey)) {
      const dataInfo = availableSubjects.get(subjectKey);
      matchedSubjects.push({
        id: dbSubject.id,
        name: dbSubject.name,
        code: dbSubject.code,
        syllabus_type: dbSubject.syllabus_type,
        directory_path: dataInfo.directory_path,
        json_files_count: dataInfo.json_files_count,
        unique_key: subjectKey
      });
      console.log(`  ✅ ${dbSubject.name} (${dbSubject.syllabus_type}) - ${dataInfo.json_files_count} files available`);
    }
  }
  
  return matchedSubjects;
}

// Helper function to let user select a subject to process
async function selectSubjectToProcess(matchedSubjects) {
  if (matchedSubjects.length === 0) {
    console.log('\n❌ No matching subjects found between your database and data directory.');
    console.log('Make sure your data directory structure matches the subjects in your database.');
    return null;
  }

  console.log('\n📋 Available subjects to add papers for:');
  
  matchedSubjects.forEach((subject, index) => {
    console.log(`${index + 1}. ${subject.name} (${subject.syllabus_type}) - ${subject.json_files_count} files`);
  });

  console.log('\n🤔 Which subject would you like to add papers for?');
  console.log('Options:');
  console.log('  - Enter a number (e.g., 1, 2, 3)');
  console.log('  - Enter "exit" to cancel');

  const response = await askQuestion('\nYour choice: ');
  
  if (response.toLowerCase() === 'exit') {
    console.log('🚫 Operation cancelled by user.');
    return null;
  }

  const selectedIndex = parseInt(response.trim()) - 1;
  
  if (isNaN(selectedIndex) || selectedIndex < 0 || selectedIndex >= matchedSubjects.length) {
    console.log('⚠️ Invalid selection. Operation cancelled.');
    return null;
  }

  const selectedSubject = matchedSubjects[selectedIndex];
  console.log(`✅ Selected: ${selectedSubject.name} (${selectedSubject.syllabus_type})`);
  
  return selectedSubject;
}

async function seedDatabase() {
  console.log('🚀 Starting database seeding process...');

  try {
    // Step 1: Get existing subjects from database
    const existingSubjects = await getExistingSubjects();
    
    if (existingSubjects.length === 0) {
      console.log('❌ No subjects found in database. Please add subjects first.');
      rl.close();
      return;
    }
    
    // Step 2: Scan available subjects in data directory
    const availableSubjects = scanAvailableSubjects();
    
    if (availableSubjects.size === 0) {
      console.log('❌ No subjects found in data directory. Please check your data structure.');
      rl.close();
      return;
    }

    // Step 3: Match existing subjects with available data
    const matchedSubjects = matchSubjectsWithData(existingSubjects, availableSubjects);
    
    // Step 4: Let user select which subject to process
    const selectedSubject = await selectSubjectToProcess(matchedSubjects);
    
    if (!selectedSubject) {
      console.log('👋 No subject selected for processing. Goodbye!');
      rl.close();
      return;
    }

    // Close readline interface now that we're done with user input
    rl.close();

    console.log(`\n🎯 Processing papers for: ${selectedSubject.name} (${selectedSubject.syllabus_type})`);

    // --- Data Storage for Processing ---
    const examSessionsMap = new Map(); // Map: 'session-year' -> { session, year }
    const papersToInsert = new Map();  // Map: 'exam_session_key-unit_code' -> { ...paper_data }
    const finalExamSessionsMap = new Map(); // Map: 'session-year' -> actual_db_id

    // Step 5: Process JSON files for the selected subject
    const jsonFiles = fs.readdirSync(selectedSubject.directory_path).filter(file => file.endsWith('.json'));
    
    console.log(`📄 Processing ${jsonFiles.length} JSON files...`);
    
    for (const file of jsonFiles) {
      const filePath = path.join(selectedSubject.directory_path, file);
      console.log(`  📄 Processing file: ${file}`);

      let fileContent;
      try {
          fileContent = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
          if (!Array.isArray(fileContent)) {
              console.warn(`    ⚠️ File '${file}' is not a JSON array. Skipping.`);
              continue;
          }
          if (fileContent.length === 0) {
              console.warn(`    ⚠️ File '${file}' is an empty JSON array. Skipping.`);
              continue;
          }
      } catch (parseError) {
          console.error(`    ❌ Error parsing JSON file '${file}': ${parseError.message}. Skipping.`);
          continue;
      }

      const filenameWithoutExt = file.replace('.json', '');
      console.log(`    📝 Processing filename: '${filenameWithoutExt}'`);

      let session = '';
      let year = 0;

      const sessionYearMatch = filenameWithoutExt.match(/^([A-Za-z]+)(?:[/\-]([A-Za-z]+))?[-/](\d{4})$/);

      if (sessionYearMatch) {
          const part1 = sessionYearMatch[1];
          const part2 = sessionYearMatch[2];

          year = parseInt(sessionYearMatch[3]);

          if (part2) {
              session = `${part1}/${part2}`;
          } 

          // Normalize session names
          if (session.toLowerCase().includes('jan')) session = 'January';
          else if (session.toLowerCase().includes('june') || session.toLowerCase().includes('may')) session = 'May/June';
          else if (session.toLowerCase().includes('oct') || session.toLowerCase().includes('nov')) session = 'Oct/Nov';

          console.log(`    📅 Extracted Session: '${session}', Year: ${year}`);

      } '. Expected 'Month-Year.json' or 'Month-Month-Year.json'. Skipping.`);
          continue;
      }

      if (!session || isNaN(year)) {
          console.warn(`    ⚠️ Could not extract valid session or year from filename: '${file}'. Session: '${session}', Year: ${year}. Skipping.`);
          continue;
      }

      const examSessionKey = `${session}-${year}`;
      if (!examSessionsMap.has(examSessionKey)) {
        examSessionsMap.set(examSessionKey, { session, year });
        console.log(`    ✨ Found new exam session: ${session} ${year}`);
      }

      // Process individual papers in the file
      for (const item of fileContent) {
        const { Name, Link } = item;
        if (!Name || !Link) {
            console.warn(`      ⚠️ Skipping entry due to missing 'Name' or 'Link': ${JSON.stringify(item)}`);
            continue;
        }

        let materialType = null;
        const lowerCaseName = Name.toLowerCase();

        // Skip "Unused" entries
        if (lowerCaseName.includes('unused')) {
            console.log(`      🗑️ Skipping 'Unused' entry: '${Name}'`);
            continue;
        }

        if (lowerCaseName.includes('question paper') || lowerCaseName.includes('qp')) materialType = 'question_paper_link';
        else if (lowerCaseName.includes('mark scheme') || lowerCaseName.includes('ms')) materialType = 'mark_scheme_link';
        else if (lowerCaseName.includes('examiner report') || lowerCaseName.includes('er')) materialType = 'examiner_report_link';
        else if (lowerCaseName.includes('provisional mark scheme')) materialType = 'mark_scheme_link';
        '. Skipping entry.`);
          continue;
        }

        let unitCode = null;

        // Unit code extraction based on syllabus type
        if (selectedSubject.syllabus_type === 'IAL') {
            const ialUnitCodeMatch = Name.match(/\((W[A-Z0-9]+)(?:\/[0-9]+)?\)/);
            if (ialUnitCodeMatch && ialUnitCodeMatch[1]) {
                unitCode = ialUnitCodeMatch[1];
            }
        } else if (selectedSubject.syllabus_type === 'IGCSE') {
            const igcseUnitCodeMatch = lowerCaseName.match(/paper\s*(\b(?:1p|1pr|2p|2pr|pr|1c|1cr|2c|2cr|1b|1br|2b|2br|1|1r|2|2r|01|02)\b)/);
            if (igcseUnitCodeMatch && igcseUnitCodeMatch[1]) {
                unitCode = igcseUnitCodeMatch[1].toUpperCase();
                // Special handling for 'PR' to consistently map to '2PR' for IGCSE
                if (unitCode === 'PR') {
                    unitCode = '2PR';
                }
            }
        }

        if (!unitCode) {
          console.warn(`      ⚠️ Could not find a recognized unit code in name: '${Name}'. Skipping entry.`);
          continue;
        }

        const paperKey = `${examSessionKey}-${unitCode}`;

        if (!papersToInsert.has(paperKey)) {
          papersToInsert.set(paperKey, {
            exam_session_key: examSessionKey,
            unit_code: unitCode,
            question_paper_link: null,
            mark_scheme_link: null,
            examiner_report_link: null,
          });
        }

        const paperEntry = papersToInsert.get(paperKey);
        if (paperEntry[materialType] && paperEntry[materialType] !== Link) {
            console.warn(`      ⚠️ Duplicate link type found for ${unitCode} - ${materialType}. Overwriting old link.`);
        }
        paperEntry[materialType] = Link;
        papersToInsert.set(paperKey, paperEntry);
      }
    }

    console.log('\n--- Processing Summary ---');
    console.log(`✅ Finished processing files for: ${selectedSubject.name} (${selectedSubject.syllabus_type})`);
    console.log(`📅 Exam sessions found: ${examSessionsMap.size}`);
    console.log(`📝 Paper units to insert: ${papersToInsert.size}`);

    if (papersToInsert.size === 0) {
      console.log('📭 No papers found to insert. Process completed.');
      return;
    }

    // Step 6: Insert/Update data in Supabase
    
    // Insert/Update Exam Sessions
    console.log('\n⏳ Inserting/updating exam sessions...');
    const examSessionsToUpsert = Array.from(examSessionsMap.values());
    const { data: upsertedExamSessions, error: examsError } = await supabase
        .from('exam_sessions')
        .upsert(examSessionsToUpsert, { onConflict: 'session,year' })
        .select('id, session, year');

    if (examsError) {
        console.error('  ❌ Error inserting exam sessions:', examsError.message);
        throw examsError;
    }

    upsertedExamSessions.forEach(session => {
        finalExamSessionsMap.set(`${session.session}-${session.year}`, session.id);
    });
    console.log('  ✅ Exam sessions processed successfully.');

    // Prepare Papers for Insertion using actual DB IDs
    console.log(`\n⏳ Preparing ${papersToInsert.size} papers for insertion...`);
    const finalPapersToInsert = [];
    for (const [paperKey, paperData] of papersToInsert.entries()) {
        const actualExamSessionId = finalExamSessionsMap.get(paperData.exam_session_key);

        if (!actualExamSessionId) {
            console.warn(`    ⚠️ Could not find actual exam session ID for key ${paperData.exam_session_key}. Skipping paper ${paperData.unit_code}.`);
            continue;
        }

        finalPapersToInsert.push({
            subject_id: selectedSubject.id, // Use the selected subject's ID
            exam_session_id: actualExamSessionId,
            unit_code: paperData.unit_code,
            question_paper_link: paperData.question_paper_link,
            mark_scheme_link: paperData.mark_scheme_link,
            examiner_report_link: paperData.examiner_report_link,
        });
    }
    console.log(`  📝 Prepared ${finalPapersToInsert.length} papers for insertion.`);

    // Insert Papers in batches
    console.log(`\n⏳ Inserting ${finalPapersToInsert.length} papers in batches of ${BATCH_SIZE}...`);
    let totalInserted = 0;
    let totalSkipped = 0;

    for (let i = 0; i < finalPapersToInsert.length; i += BATCH_SIZE) {
      const batch = finalPapersToInsert.slice(i, i + BATCH_SIZE);
      console.log(`  📦 Processing batch ${Math.floor(i / BATCH_SIZE) + 1}/${Math.ceil(finalPapersToInsert.length / BATCH_SIZE)} (${batch.length} records)...`);
      
      const { data: insertedPapers, error: papersError } = await supabase
        .from('papers')
        .upsert(batch, { onConflict: 'subject_id,exam_session_id,unit_code' })
        .select('unit_code');
      
      if (papersError) {
          console.error(`    ❌ Error inserting papers batch ${Math.floor(i / BATCH_SIZE) + 1}:`, papersError.message);
          throw papersError;
      }
      
      if (insertedPapers) {
        totalInserted += insertedPapers.length;
        console.log(`    ✅ Batch completed: ${insertedPapers.length} papers processed`);
      }
    }

    console.log('  ✅ Papers insertion complete.');

    console.log('\n🎉 Database seeding finished successfully!');
    console.log(`📊 Final summary for ${selectedSubject.name} (${selectedSubject.syllabus_type}):`);
    console.log(`  - Exam sessions processed: ${examSessionsMap.size}`);
    console.log(`  - Papers processed: ${finalPapersToInsert.length}`);
    console.log(`  - Files processed: ${jsonFiles.length}`);

  } catch (error) {
    console.error('\n❌ An unhandled error occurred during seeding:', error.message);
    if (error.details) console.error('Details:', error.details);
    if (error.hint) console.error('Hint:', error.hint);
    process.exit(1);
  } finally {
    // Ensure readline interface is closed
    if (!rl.closed) {
      rl.close();
    }
  }
}

seedDatabase();