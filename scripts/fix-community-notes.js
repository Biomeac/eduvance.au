#!/usr/bin/env node
// Fix all community notes files that got corrupted by the security fix scripts

const fs = require('fs');
const path = require('path');

// Template for community notes files
const communityNotesTemplate = `"use client";

import { supabase } from '@/lib/supabaseClient';
import Link from "next/link";
import { useState, useEffect } from "react";
import { useReloadOnStuckLoading } from '@/utils/reloadOnStuckLoading';

// Remove: import { useRouter } from 'next/router';
import SmallFoot from '@/components/smallFoot.jsx';

// At the top, define variables for subjectName, syllabusType, and examCode
const subjectName = '{SUBJECT_NAME}';
const subjectSlug = subjectName.toLowerCase().replace(/\\s+/g, '-');
const examCode = '{EXAM_CODE}';
const syllabusType = '{SYLLABUS_TYPE}';

export default function CommunityNotes() {
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [retryCount, setRetryCount] = useState(0);
  const maxRetries = 3;

  // Use the reload utility
  useReloadOnStuckLoading(loading, 10000); // 10 second timeout

  const fetchNotes = async (retryCount = 0) => {
    try {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('community_notes')
        .select('*')
        .eq('subject', subjectName)
        .eq('syllabus_type', syllabusType)
        .order('created_at', { ascending: false });

      if (fetchError) {
        throw fetchError;
      }

      setNotes(data || []);
      setRetryCount(0); // Reset retry count on success
    } catch (err) {
      console.error('Error fetching notes:', err);
      setError(err.message);
      
      if (retryCount < maxRetries) {
        console.log(\`Retrying... attempt \${retryCount + 1}\`);
        setTimeout(() => {
          fetchNotes(retryCount + 1);
        }, 1000);
      } else {
        setRetryCount(retryCount);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotes();
  }, []);

  const handleRetry = () => {
    fetchNotes(0);
  };

  const handleReload = () => {
    window.location.reload();
  };

  if (loading && retryCount === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading community notes...</p>
        </div>
      </div>
    );
  }

  if (error && retryCount >= maxRetries) {
    const shouldReload = window.confirm(
      \`Failed to load community notes after \${maxRetries} attempts. This might be due to a network issue or database problem.\\n\\nWould you like to reload the page to refresh the data? (Recommended)\`
    );
    
    if (shouldReload) {
      handleReload();
    }
    
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Unable to Load Notes</h2>
          <p className="text-gray-600 mb-6">
            We're having trouble loading the community notes. This might be due to a network issue or database problem.
          </p>
          <div className="space-y-3">
            <button
              onClick={handleRetry}
              className="w-full bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Try Again
            </button>
            <button
              onClick={handleReload}
              className="w-full bg-gray-600 text-white px-6 py-3 rounded-lg hover:bg-gray-700 transition-colors"
            >
              Reload Page
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">
            {subjectName} Community Notes
          </h1>
          <p className="text-gray-600 text-lg">
            {syllabusType} • {examCode}
          </p>
        </div>

        {notes.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-400 text-6xl mb-4">📝</div>
            <h3 className="text-xl font-semibold text-gray-700 mb-2">No Notes Yet</h3>
            <p className="text-gray-500 mb-6">
              Be the first to share your notes for {subjectName} {syllabusType}!
            </p>
            <Link
              href="/contributor"
              className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Contribute Notes
            </Link>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {notes.map((note) => (
              <div key={note.id} className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
                <h3 className="text-xl font-semibold text-gray-800 mb-3">
                  {note.title || 'Untitled Note'}
                </h3>
                <p className="text-gray-600 mb-4 line-clamp-3">
                  {note.description || 'No description available.'}
                </p>
                <div className="flex items-center justify-between text-sm text-gray-500">
                  <span>By {note.author || 'Anonymous'}</span>
                  <span>{new Date(note.created_at).toLocaleDateString()}</span>
                </div>
                {note.file_url && (
                  <div className="mt-4">
                    <a
                      href={note.file_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-800 underline"
                    >
                      View File
                    </a>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        <div className="mt-12 text-center">
          <Link
            href="/contributor"
            className="inline-block bg-green-600 text-white px-8 py-3 rounded-lg hover:bg-green-700 transition-colors"
          >
            Share Your Notes
          </Link>
        </div>
      </div>
      
      <SmallFoot />
    </div>
  );
}`;

// Subject configurations
const subjects = [
  { name: 'Accounting', ialCode: 'WAC1/XAC11/YAC11', igcseCode: '4AC1' },
  { name: 'Biology', ialCode: 'WBI1/XBI11/YBI11', igcseCode: '4BI1' },
  { name: 'Business', ialCode: 'WBS1/XBS11/YBS11', igcseCode: '4BS1' },
  { name: 'Chemistry', ialCode: 'WCH1/XCH11/YCH11', igcseCode: '4CH1' },
  { name: 'Computer Science', ialCode: '4CP0', igcseCode: '4CP0' },
  { name: 'Economics', ialCode: 'WEC1/XEC11/YEC11', igcseCode: '4EC1' },
  { name: 'English Language', ialCode: 'WEN0/XEN01/YEN01', igcseCode: '4EB1' },
  { name: 'English Literature', ialCode: 'WET0/XET01/YET01', igcseCode: '4ET1' },
  { name: 'Further Mathematics', ialCode: 'XFM01/YFM01', igcseCode: '4PM1' },
  { name: 'Information Technology', ialCode: 'WIT1/XIT11/YIT11', igcseCode: '4IT1' },
  { name: 'Mathematics', ialCode: 'XMA01/YMA01', igcseCode: '4MB1' },
  { name: 'Physics', ialCode: 'WPH1/XPH11/YPH11', igcseCode: '4PH1' },
  { name: 'Psychology', ialCode: 'WPS0/XPS01/YPS01', igcseCode: '' }
];

// Fix all community notes files
function fixCommunityNotesFiles() {
  let fixedCount = 0;
  
  subjects.forEach(subject => {
    // Fix IAL files
    if (subject.ialCode) {
      const ialPath = path.join(__dirname, '..', 'src', 'app', 'subjects', subject.name.toLowerCase().replace(/\s+/g, '-'), 'IAL', 'communityNotes', 'page.jsx');
      if (fs.existsSync(ialPath)) {
        const content = communityNotesTemplate
          .replace('{SUBJECT_NAME}', subject.name)
          .replace('{EXAM_CODE}', subject.ialCode)
          .replace('{SYLLABUS_TYPE}', 'IAL');
        
        fs.writeFileSync(ialPath, content);
        console.log(`✅ Fixed IAL: ${subject.name}`);
        fixedCount++;
      }
    }
    
    // Fix IGCSE files
    if (subject.igcseCode) {
      const igcsePath = path.join(__dirname, '..', 'src', 'app', 'subjects', subject.name.toLowerCase().replace(/\s+/g, '-'), 'IGCSE', 'communityNotes', 'page.jsx');
      if (fs.existsSync(igcsePath)) {
        const content = communityNotesTemplate
          .replace('{SUBJECT_NAME}', subject.name)
          .replace('{EXAM_CODE}', subject.igcseCode)
          .replace('{SYLLABUS_TYPE}', 'IGCSE');
        
        fs.writeFileSync(igcsePath, content);
        console.log(`✅ Fixed IGCSE: ${subject.name}`);
        fixedCount++;
      }
    }
  });
  
  return fixedCount;
}

// Main execution
console.log('Fixing all community notes files...');
const fixedCount = fixCommunityNotesFiles();
console.log(`\n🎉 Fixed ${fixedCount} community notes files!`);