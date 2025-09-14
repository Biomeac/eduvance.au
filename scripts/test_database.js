import { supabase } from '@/lib/supabaseClient';
// Load environment variables from .env file
require('dotenv').config();

// Use 'require' for dependencies
const { createClient } = require('@supabase/supabase-js');
const readline = require('readline'); // For interactive CLI input

// --- Supabase Client Initialization ---



const supabase = supabase;

// --- Readline Interface for CLI Input ---
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// --- Helper Functions to Query Tables ---

/**
 * Fetches and displays all subjects.
 */
async function listSubjects() {
  console.log('\n--- Listing Subjects ---');
  const { data, error } = await supabase
    .from('subjects')
    .select('id, name, code')
    .order('name', { ascending: true });

  if (error) {
    console.error('Error fetching subjects:', error.message);
  } else if (data.length === 0) {
    console.log('No subjects found.');
  } \n  Name: ${subject.name}\n  Code: ${subject.code || 'N/A'}`);
    });
    console.log(`Total subjects: ${data.length}`);
  }
}

/**
 * Fetches and displays all exam sessions.
 */
async function listExamSessions() {
  console.log('\n--- Listing Exam Sessions ---');
  const { data, error } = await supabase
    .from('exam_sessions')
    .select('id, session, year')
    .order('year', { ascending: false })
    .order('session', { ascending: true }); // Order by month (alphabetically for Jan, June, Oct)

  if (error) {
    console.error('Error fetching exam sessions:', error.message);
  } else if (data.length === 0) {
    console.log('No exam sessions found.');
  } \n  Session: ${session.session} ${session.year}`);
    });
    console.log(`Total exam sessions: ${data.length}`);
  }
}

/**
 * Fetches and displays papers based on subject name, session, and year, showing full URLs.
 * Allows partial matching for subject name and session.
 */
async function listPapersByCriteria() {
  console.log('\n--- Listing Papers by Criteria (with URLs) ---');

  rl.question('Enter Subject Name (e.g., "Physics", leave empty for all): ', async (subjectInput) => {
    rl.question('Enter Session (e.g., "January", "June", "Oct/Nov", leave empty for all): ', async (sessionInput) => {
      rl.question('Enter Year (e.g., "2020", leave empty for all): ', async (yearInput) => {

        let query = supabase.from('papers').select(`
          id,
          unit_code,
          question_paper_link,
          mark_scheme_link,
          examiner_report_link,
          subjects ( name, code ),
          exam_sessions ( session, year )
        `).limit(20); // Limit to 20 for brevity, remove for all if needed

        if (subjectInput) {
          // Find subject ID(s)
          const { data: subjectData, error: subjectError } = await supabase
            .from('subjects')
            .select('id, name')
            .ilike('name', `%${subjectInput}%`); // Case-insensitive partial match

          if (subjectError || !subjectData || subjectData.length === 0) {
            console.error(`Could not find subject matching "${subjectInput}". Error: ${subjectError?.message || 'No subject found.'}`);
            rl.close();
            return;
          }
          
          // If multiple subjects found, use the first one (or you could prompt user to choose)
          if (subjectData.length > 1) {
            console.log(`Found ${subjectData.length} subjects matching "${subjectInput}":`);
            subjectData.forEach((s, index) => console.log(`  ${index + 1}. ${s.name} (ID: ${s.id})`));
            console.log(`Using the first match: ${subjectData[0].name}`);
          }
          
          const subjectIds = subjectData.map(s => s.id);
          query = query.in('subject_id', subjectIds);
        }

        if (sessionInput || yearInput) {
          // Find exam session ID(s)
          let examSessionQuery = supabase.from('exam_sessions').select('id, session, year');
          if (sessionInput) {
            examSessionQuery = examSessionQuery.ilike('session', `%${sessionInput}%`); // Case-insensitive partial match
          }
          if (yearInput) {
            const parsedYear = parseInt(yearInput);
            if (!isNaN(parsedYear)) {
              examSessionQuery = examSessionQuery.eq('year', parsedYear);
            } 
          }

          const { data: examSessionData, error: examSessionError } = await examSessionQuery;

          if (examSessionError || !examSessionData || examSessionData.length === 0) {
            console.error(`Could not find exam session matching criteria. Error: ${examSessionError?.message || 'No exam sessions found.'}`);
            
            // Show helpful suggestions
            console.log('\n--- Available Exam Sessions ---');
            const { data: allSessions, error: allSessionsError } = await supabase
              .from('exam_sessions')
              .select('session, year')
              .order('year', { ascending: false })
              .order('session', { ascending: true });
            
            if (!allSessionsError && allSessions) {
              console.log('Available sessions:');
              allSessions.forEach(s => console.log(`  - ${s.session} ${s.year}`));
              
              // Show specific suggestions based on input
              if (sessionInput && !yearInput) {
                const matchingSessions = allSessions.filter(s => 
                  s.session.toLowerCase().includes(sessionInput.toLowerCase())
                );
                if (matchingSessions.length > 0) {
                  console.log(`\nSuggested sessions matching "${sessionInput}":`);
                  matchingSessions.forEach(s => console.log(`  - ${s.session} ${s.year}`));
                }
              }
              
              if (yearInput && !sessionInput) {
                const matchingYears = allSessions.filter(s => s.year == parseInt(yearInput));
                if (matchingYears.length > 0) {
                  console.log(`\nSuggested sessions for year ${yearInput}:`);
                  matchingYears.forEach(s => console.log(`  - ${s.session} ${s.year}`));
                }
              }
              
              // Handle case where both session and year are specified
              if (sessionInput && yearInput) {
                const parsedYear = parseInt(yearInput);
                
                // Find sessions matching the session name (ignoring year)
                const sessionMatches = allSessions.filter(s => 
                  s.session.toLowerCase().includes(sessionInput.toLowerCase())
                );
                
                // Find sessions matching the year (ignoring session)
                const yearMatches = allSessions.filter(s => s.year == parsedYear);
                
                if (sessionMatches.length > 0) {
                  console.log(`\nSuggested sessions matching "${sessionInput}" (different years):`);
                  sessionMatches.forEach(s => console.log(`  - ${s.session} ${s.year}`));
                }
                
                if (yearMatches.length > 0) {
                  console.log(`\nSuggested sessions for year ${yearInput} (different sessions):`);
                  yearMatches.forEach(s => console.log(`  - ${s.session} ${s.year}`));
                }
                
                // If no exact session match, suggest closest alternatives
                if (sessionMatches.length === 0) {
                  console.log(`\nNote: No sessions found containing "${sessionInput}". Available session types are:`);
                  const uniqueSessions = [...new Set(allSessions.map(s => s.session))];
                  uniqueSessions.forEach(session => console.log(`  - ${session}`));
                }
              }
            }
            
            rl.close();
            return;
          }

          if (examSessionData.length > 1) {
            console.log(`Found ${examSessionData.length} exam sessions matching criteria:`);
            examSessionData.forEach((s, index) => console.log(`  ${index + 1}. ${s.session} ${s.year}`));
            console.log('Using all matching sessions.');
          }

          const examSessionIds = examSessionData.map(s => s.id);
          query = query.in('exam_session_id', examSessionIds);
        }

        query = query.order('unit_code', { ascending: true }); // Order papers by unit

        const { data: papers, error: papersError } = await query;

        if (papersError) {
          console.error('Error fetching papers:', papersError.message);
        } else if (papers.length === 0) {
          console.log('No papers found matching your criteria.');
        } `);
            console.log(`  Subject: ${paper.subjects?.name || 'N/A'} (Unit: ${paper.unit_code})`);
            console.log(`  Session: ${paper.exam_sessions?.session || 'N/A'} ${paper.exam_sessions?.year || 'N/A'}`);
            // --- MODIFIED LINES TO SHOW FULL URLS ---
            console.log(`  Question Paper URL: ${paper.question_paper_link || 'N/A'}`);
            console.log(`  Mark Scheme URL:    ${paper.mark_scheme_link || 'N/A'}`);
            console.log(`  Examiner Report URL: ${paper.examiner_report_link || 'N/A'}`);
            // -----------------------------------------
          });
          console.log(`\nTotal papers found: ${papers.length}`);
          if (papers.length >= 20) {
            console.log('(Note: Results are limited to 20. Modify script to fetch more.)');
          }
        }
        rl.close(); // Close readline after completing query
      });
    });
  });
}

// --- Main Menu / Execution Logic ---
async function main() {
  console.log('--- Supabase DB Test CLI ---');
  console.log('1. List all Subjects');
  console.log('2. List all Exam Sessions');
  console.log('3. Find Papers by Subject/Session/Year (Interactive)');
  console.log('4. Exit');

  rl.question('Choose an option: ', async (answer) => {
    switch (answer.trim()) {
      case '1':
        await listSubjects();
        rl.close(); // Close after showing results
        break;
      case '2':
        await listExamSessions();
        rl.close(); // Close after showing results
        break;
      case '3':
        await listPapersByCriteria(); // This function will close rl internally
        break;
      case '4':
        console.log('Exiting...');
        rl.close();
        break;
      default:
        console.log('Invalid option. Please try again.');
        rl.close(); // Close on invalid input
        break;
    }
  });
}

main();