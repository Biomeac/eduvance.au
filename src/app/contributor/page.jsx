// This page allows anyone to add resources to the Supabase DB (no login required)
"use client";
import React, { useState, useEffect } from 'react';
import { Home } from '@/components/homenav';
import { supabase } from '@/lib/supabaseClient';
import { Auth } from '@supabase/auth-ui-react'; // Import Auth UI
import { ThemeSupa } from '@supabase/auth-ui-shared'; // Import ThemeSupa

export default function ContributorUploadResource() {
  const [subjects, setSubjects] = useState([]);
  const [loadingSubjects, setLoadingSubjects] = useState(true);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState(null);

  const [title, setTitle] = useState('');
  const [unitChapter, setUnitChapter] = useState('');
  const [link, setLink] = useState('');
  const [description, setDescription] = useState('');
  const [resourceType, setResourceType] = useState('note');
  const [selectedSubjectId, setSelectedSubjectId] = useState('');

  // State for user session and loading
  const [session, setSession] = useState(null); // Changed to session to directly check login status
  const [loadingUserSession, setLoadingUserSession] = useState(true); // Renamed for clarity

  const resourceCategories = [
    { value: 'note', label: 'Note' },
    { value: 'topic_question', label: 'Topic Questions' },
    { value: 'solved_papers', label: 'Solved Past Paper Questions' },
    { value: 'commonly_asked_questions', label: 'Commonly Asked Questions' },
    { value: 'essay_questions', label: 'Essay Questions' },
    { value: 'assorted_papers', label: 'Assorted Papers' },
    { value: 'youtube_videos', label: 'Youtube Videos'},
    { value: 'general_as', label: 'General (Purely AS)' },
    { value: 'general_a2', label: 'General (Purely A2)' },
  ];

  // Fetch current user session
  useEffect(() => {
    async function getSession() {
      setLoadingUserSession(true);
      const { data: { session } } = await supabase.auth.getSession();
      setSession(session);
      setLoadingUserSession(false);
    }
    getSession();

    // Listen for auth state changes
    const { data: authListener } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
      }
    );

    return () => {
      authListener?.subscription.unsubscribe();
    };
  }, []);

  // Fetch subjects
  useEffect(() => {
    setLoadingSubjects(true);
    supabase
      .from('subjects')
      .select('id, name, code, syllabus_type, units')
      .order('name', { ascending: true })
      .then(({ data, error }) => {
        if (error) {
          setMessage(`Subjects fetch failed: ${error.message}`);
          setMessageType('error');
        } else {
          // Sort units for each subject
          const sortedSubjects = (data || []).map(sub => {
            let units = sub.units || [];
            units.sort((a, b) => {
              const getUnitNum = (u) => {
                const match = (u.unit || '').match(/Unit\s*(\d+)/i);
                return match ? parseInt(match[1], 10) : Number.MAX_SAFE_INTEGER;
              };
              const numA = getUnitNum(a);
              const numB = getUnitNum(b);
              if (numA !== numB) return numA - numB;
              return (a.name || '').localeCompare(b.name || '');
            });
            return { ...sub, units };
          });
          setSubjects(sortedSubjects);
          // Set initial selected subject if subjects are available and not already set
          if (sortedSubjects.length > 0 && !selectedSubjectId) {
            setSelectedSubjectId(sortedSubjects[0].id);
          }
        }
        setLoadingSubjects(false);
      });
  }, [selectedSubjectId]); // Added selectedSubjectId as dependency to prevent re-selecting first subject

  // Resource upload handler
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Enforce login check here
    if (!session || !session.user) {
      setMessage("You must be logged in to submit a resource.");
      setMessageType('error');
      return;
    }

    if (!title || !link || !selectedSubjectId || !resourceType) {
      setMessage("Fill all required fields");
      setMessageType('error');
      return;
    }
  
    // Get contributor details from the session user
    const currentUser = session.user; // Use session.user directly
    const contributorName = currentUser?.user_metadata?.full_name || currentUser?.email;
    const contributorEmail = currentUser?.email;

    const unitValue = unitChapter.trim() === '' ? 'General' : unitChapter.trim();
  
    const { error } = await supabase
      .from('community_resource_requests')
      .insert({
        contributor_name: contributorName,
        contributor_email: contributorEmail,
        title,
        link,
        description,
        resource_type: resourceType,
        subject_id: selectedSubjectId,
        unit_chapter_name: unitValue,
        approved: "Unapproved",
        submitted_at: new Date().toISOString(), // Add submitted_at timestamp
      });
  
    if (error) {
      setMessage(`Submission failed: ${error.message}`);
      setMessageType('error');
    } else {
      setMessage("✅ Resource request submitted for review");
      setMessageType('success');
      setTitle(''); setLink(''); setDescription('');
    }
  };

  // // Show loading state if subjects or user session are still loading
  // if (loadingSubjects || loadingUserSession) {
  //   return (
  //     <div className="pt-20 pr-10 pl-10 pb-10 min-h-screen bg-blue-100 flex items-center justify-center" style={{ fontFamily: 'Poppins, sans-serif' }}>
  //       <p className="text-xl text-gray-600">Loading...</p>
  //     </div>
  //   );
  // }

  // If not logged in, show the Auth UI
  if (!session) {
    return (
      <>
        <Home showExtra dontShowload/>
        <div className="pt-20 pr-10 pl-10 pb-10 min-h-screen bg-blue-100 flex flex-col items-center justify-center" style={{ fontFamily: 'Poppins, sans-serif' }}>
          <div className="bg-white rounded-xl shadow-lg max-w-md w-full p-8 tracking-[-0.025em] text-center">
            <h2 className="text-2xl font-semibold text-gray-800 mb-6">You must be logged in to contribute.</h2>
            {/* <Auth
              supabaseClient={supabase}
              appearance={{ theme: ThemeSupa }}
              providers={['google']}
              redirectTo={typeof window !== 'undefined' ? window.location.href : undefined}
            /> */}
            <Auth
              supabaseClient={supabase}
              appearance={{
                theme: ThemeSupa,
                variables: {
                  default: {
                    colors: {
                      brand: '#0C58E4',
                      brandAccent: '#0846b8',
                    }
                  }
                }
              }}
              providers={['google', 'discord']}
              redirectTo={typeof window !== 'undefined' ? window.location.href : undefined}
            />
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Home showExtra dontShowload/>
      <div className="pt-20 pr-10 pl-10 pb-10 min-h-screen bg-blue-100 flex items-center justify-center" style={{ fontFamily: 'Poppins, sans-serif' }}>
        <div className="bg-white rounded-xl shadow-lg max-w-md w-full p-9 tracking-[-0.025em]">
          <h2 className="text-xl font-semibold text-gray-800 text-center">Contribute with new resource</h2>

          {/* Display current user info */}
          {session.user && (
            <div className="mb-3 p-2 bg-blue-50 border border-blue-200 text-blue-800 rounded-md text-sm">
              Logged in as: <strong>{session.user.user_metadata?.full_name || session.user.email}</strong>
            </div>
          )}

          {message && (
            <div className={`p-3 rounded-md text-sm ${
              messageType === 'success' ? 'bg-green-50 border border-green-200 text-green-800' :
              'bg-red-50 border border-red-200 text-red-800'
            }`}>
              {message}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700">Title *</label>
              <input
                type="text"
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                placeholder="e.g., Physics Chapter 1 Notes"
                required
              />
            </div>
            <div>
              <label htmlFor="subject" className="block text-sm font-medium text-gray-700">Subject *</label>
              <select
                id="subject"
                value={selectedSubjectId}
                onChange={(e) => setSelectedSubjectId(e.target.value)}
                className="cursor-pointer mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                required
                disabled={loadingSubjects || subjects.length === 0}
              >
                {loadingSubjects ? (
                  <option>Loading subjects...</option>
                ) : (
                  <>
                    <optgroup label="IAL">
                      {subjects
                        .filter((subject) => subject.syllabus_type === "IAL")
                        .map((subject) => (
                          <option key={subject.id} value={subject.id}>
                            {subject.name} ({subject.code}) - {subject.syllabus_type}
                          </option>
                        ))}
                    </optgroup>

                    <optgroup label="IGCSE">
                      {subjects
                        .filter((subject) => subject.syllabus_type === "IGCSE")
                        .map((subject) => (
                          <option key={subject.id} value={subject.id}>
                            {subject.name} ({subject.code}) - {subject.syllabus_type}
                          </option>
                        ))}
                    </optgroup>
                  </>
                )}
              </select>
            </div>
            <div>
              <label htmlFor="unitChapter" className="block text-sm font-medium text-gray-700">
                Unit/Chapter Name
              </label>
              {(() => {
                const selectedSubject = subjects.find(sub => sub.id === selectedSubjectId);
                const units = selectedSubject?.units || [];
                if (Array.isArray(units) && units.length > 0) {
                  return (
                    <select value={unitChapter} onChange={e => setUnitChapter(e.target.value)} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm">
                      <option value="">Select Unit/Chapter</option>
                      {units.map((unit, idx) => (
                        <option key={unit.code || unit.name || idx} value={unit.unit || unit.name}>{unit.unit ? `${unit.unit} - ${unit.name}` : unit.name}</option>
                      ))}
                      <option value="General">General</option>
                    </select>
                  );
                } else {
                  return (
                    <input
                      type="text"
                      id="unitChapter"
                      value={unitChapter}
                      onChange={(e) => setUnitChapter(e.target.value)}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      placeholder="e.g., Unit 1: Kinematics"
                    />
                  );
                }
              })()}
              <p className="text-xs text-gray-500 mt-1">Leave blank if it applies to the whole subject (will be marked as "General")</p>
            </div>
            <div>
              <label htmlFor="resourceType" className="block text-sm font-medium text-gray-700">Resource Type *</label>
              <select
                id="resourceType"
                value={resourceType}
                onChange={(e) => setResourceType(e.target.value)}
                className="cursor-pointer mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                required
              >
                {resourceCategories.map((category) => (
                  <option key={category.value} value={category.value}>
                    {category.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="link" className="block text-sm font-medium text-gray-700">Resource Link (URL) *</label>
              <input
                type="url"
                id="link"
                value={link}
                onChange={(e) => setLink(e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                placeholder="e.g., https://docs.google.com/..."
                required
              />
            </div>
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700">Description (Optional)</label>
              <textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows="3"
                className="min-h-[100px] mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm resize-y"
                placeholder="A brief summary of the resource content."
              ></textarea>
            </div>
            <button
              type="submit"
              className="cursor-pointer w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition"
              disabled={loadingSubjects || subjects.length === 0 || loadingUserSession}
            >
              Submit Resource
            </button>
          </form>
        </div>
      </div>
    </>
  );
}