"use client";
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Pencil } from 'lucide-react';

import { supabase } from '@/lib/supabaseClient';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export default function UploadResource() {
  const [supabaseClient, setSupabaseClient] = useState(null);
  const [staffUser, setStaffUser] = useState(null);
  const [isAuthReady, setIsAuthReady] = useState(false);
  const [subjects, setSubjects] = useState([]);
  const [loadingSubjects, setLoadingSubjects] = useState(true);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState(null);
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);
  const [title, setTitle] = useState('');
  const [unitChapter, setUnitChapter] = useState('');
  const [link, setLink] = useState('');
  const [description, setDescription] = useState('');
  const [resourceType, setResourceType] = useState('note');
  const [selectedSubjectId, setSelectedSubjectId] = useState('');
  const [staffUsername, setStaffUsername] = useState('');
  const [activeTab, setActiveTab] = useState('upload'); // Default to 'upload' for general resources
  const [pendingResources, setPendingResources] = useState([]);
  const [rejectionReasons, setRejectionReasons] = useState({});
  const [watermarkLoading, setWatermarkLoading] = useState({});
  const [submitLoading, setSubmitLoading] = useState(false);

  const SUBMISSION_TIMEOUT = 10000; // 10 seconds

  // General state for all editable fields for a resource
  const [editedResourceData, setEditedResourceData] = useState({});
  // Use a more generic ID to indicate which resource is being edited
  const [editingResourceId, setEditingResourceId] = useState(null);

  // Add state for watermarked files
  const [watermarkedFiles, setWatermarkedFiles] = useState({});

  // NEW: State variables for Past Papers
  const [selectedExamSessionId, setSelectedExamSessionId] = useState(''); // Stores the UUID of the selected session
  const [unitCode, setUnitCode] = useState(''); // e.g., '01', '02', 'P1', 'P2', 'WMA11' -> now from dropdown
  const [questionPaperLink, setQuestionPaperLink] = useState('');
  const [markSchemeLink, setMarkSchemeLink] = useState('');
  const [examinerReportLink, setExaminerReportLink] = useState('');
  const [examSessions, setExamSessions] = useState([]); // To store fetched exam sessions
  const [loadingExamSessions, setLoadingExamSessions] = useState(true);

  const resourceCategories = [
    { value: 'note', label: 'Note' },
    { value: 'topic_question', label: 'Topic Questions' },
    { value: 'solved_papers', label: 'Solved Past Paper Questions' },
    { value: 'commonly_asked_questions', label: 'Commonly Asked Questions' },
    { value: 'essay_questions', label: 'Essay Questions' },
  ];

  useEffect(() => {
    if (window.supabase && !supabaseClient) {
      const client = window.supabase.createClient(supabaseUrl, supabaseKey);
      setSupabaseClient(client);
    }
  }, []);

  useEffect(() => {
    if (!supabaseClient) return;
    setIsAuthReady(false);
    const { data: subscription } = supabaseClient.auth.onAuthStateChange((_e, session) => {
      setStaffUser(session?.user || null);
      setIsAuthReady(true);
      if (session?.user) {
        supabaseClient
          .from('staff_users')
          .select('username')
          .eq('id', session.user.id)
          .single()
          .then(({ data: staffData }) => {
            setStaffUsername(staffData?.username || '');
          });
        fetchPendingResources();
      }
    });
    supabaseClient.auth.getSession().then(({ data }) => {
      setStaffUser(data?.session?.user || null);
      setIsAuthReady(true);
      if (data?.session?.user) {
        supabaseClient
          .from('staff_users')
          .select('username')
          .eq('id', data.session.user.id)
          .single()
          .then(({ data: staffData }) => {
            setStaffUsername(staffData?.username || '');
          });
        fetchPendingResources();
      }
    });
    return () => subscription?.unsubscribe?.();
  }, [supabaseClient]);

  useEffect(() => {
    if (!supabaseClient) return;
    setLoadingSubjects(true);
    supabaseClient.from('subjects')
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
          if (sortedSubjects?.[0]?.id) setSelectedSubjectId(sortedSubjects[0].id);
        }
        setLoadingSubjects(false);
      });
  }, [supabaseClient]);

  // NEW: Fetch Exam Sessions
  useEffect(() => {
    if (!supabaseClient) return;

    const fetchExamSessions = async () => {
      setLoadingExamSessions(true);
      const { data, error } = await supabaseClient
        .from('exam_sessions')
        .select('id, session, year') // CORRECTED: Select 'session' and 'year'
        .order('year', { ascending: false }) // Order by year descending
        .order('session', { ascending: false }); // Then by session descending (e.g., Oct/Nov before May/June)

      if (error) {
        console.error('Error fetching exam sessions:', error.message);
        setMessage(`Failed to load exam sessions: ${error.message}`);
        setMessageType('error');
      } else {
        setExamSessions(data || []);
      }
      setLoadingExamSessions(false);
    };

    fetchExamSessions();
  }, [supabaseClient]);

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!supabaseClient) return;
    setLoginLoading(true);
    setMessage("");
    setMessageType(null);
    const { data, error } = await supabaseClient.auth.signInWithPassword({
      email: loginEmail,
      password: loginPassword,
    });
    if (error) {
      setMessage(`Login failed: ${error.message}`);
      setMessageType('error');
    } else {
      setStaffUser(data.user);
      setMessage('Logged in successfully!');
      setMessageType('success');
      supabaseClient
        .from('staff_users')
        .select('username')
        .eq('id', data.user.id)
        .single()
        .then(({ data: staffData }) => {
            setStaffUsername(staffData?.username || '');
        });
      fetchPendingResources();
    }
    setLoginLoading(false);
  };

  const handleLogout = async () => {
    if (!supabaseClient) return;
    await supabaseClient.auth.signOut();
    setStaffUser(null);
    setMessage('Logged out.');
    setMessageType('success');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitLoading(true);
    console.log('handleSubmit called');

    // Start a timeout timer
    const timeoutId = setTimeout(() => {
        setMessage("Submission timed out. Please check your connection and try again.");
        setMessageType('error');
        setSubmitLoading(false);
        console.warn('Submission timed out.');
    }, SUBMISSION_TIMEOUT);

    if (!supabaseClient) {
        clearTimeout(timeoutId); // Clear the timeout if we return early
        setMessage('Error: Supabase client not initialized. Please refresh the page or check your connection.');
        setMessageType('error');
        console.error('Supabase client is null in handleSubmit');
        setSubmitLoading(false);
        return;
    }
    if (!title || !link || !selectedSubjectId || !resourceType) {
        clearTimeout(timeoutId); // Clear the timeout if we return early
        setMessage("Fill all required fields");
        setMessageType('error');
        setSubmitLoading(false);
        return;
    }
    if (!supabaseClient || !staffUser) {
        clearTimeout(timeoutId); // Clear the timeout if we return early
        setMessage("Not ready to submit");
        setMessageType('error');
        setSubmitLoading(false);
        return;
    }
    const unitValue = unitChapter.trim() === '' ? 'General' : unitChapter.trim();
    const { data, error } = await supabaseClient
      .from('resources')
      .insert({
        title,
        link,
        description,
        resource_type: resourceType,
        subject_id: selectedSubjectId,
        unit_chapter_name: unitValue,
        contributor_email: staffUsername,
        approved: "Pending"
      })
      .select();

    clearTimeout(timeoutId); // Clear the timeout on completion

    console.log('Insert data:', data, 'Insert error:', error);
    if (error) {
      setMessage(`Submission failed: ${error.message}`);
      setMessageType('error');
      console.error('Resource submission error:', error);
      setSubmitLoading(false);
    } else if (!data || data.length === 0) {
      setMessage('Submission did not return a new resource. Please check your database constraints.');
      setMessageType('error');
      setSubmitLoading(false);
      console.warn('No data returned from insert:', data);
    } else {
      setMessage("✅ Resource added successfully");
      setMessageType('success');
      setTitle(''); setLink(''); setDescription(''); setUnitChapter('');
      setTimeout(() => {
        setMessage("");
        setMessageType(null);
      }, 3000);
      setSubmitLoading(false);
    }
  };

  // NEW: handlePaperSubmit for past papers
  const handlePaperSubmit = async (e) => {
    e.preventDefault();
    setSubmitLoading(true);
    setMessage("");
    setMessageType(null);

    // Start a timeout timer
    const timeoutId = setTimeout(() => {
        setMessage("Past paper submission timed out. Please check your connection and try again.");
        setMessageType('error');
        setSubmitLoading(false);
        console.warn('Past paper submission timed out.');
    }, SUBMISSION_TIMEOUT);

    if (!supabaseClient) {
      clearTimeout(timeoutId); // Clear the timeout if we return early
      setMessage('Error: Supabase client not initialized.');
      setMessageType('error');
      setSubmitLoading(false);
      return;
    }
    if (!staffUser) {
      clearTimeout(timeoutId); // Clear the timeout if we return early
      setMessage("You must be logged in to upload papers.");
      setMessageType('error');
      setSubmitLoading(false);
      return;
    }
    if (!selectedSubjectId || !selectedExamSessionId || !unitCode) {
      clearTimeout(timeoutId); // Clear the timeout if we return early
      setMessage("Subject, Exam Session, and Unit Code are required.");
      setMessageType('error');
      setSubmitLoading(false);
      return;
    }

    const { data, error } = await supabaseClient
      .from('papers')
      .insert({
        subject_id: selectedSubjectId,
        exam_session_id: selectedExamSessionId,
        unit_code: unitCode.trim(),
        question_paper_link: questionPaperLink.trim() || null,
        mark_scheme_link: markSchemeLink.trim() || null,
        examiner_report_link: examinerReportLink.trim() || null,
      })
      .select();

    clearTimeout(timeoutId); // Clear the timeout on completion

    if (error) {
      if (error.code === '23505') {
        setMessage(`A paper for this subject, exam session, and unit code already exists.`);
      } else {
        setMessage(`Past paper submission failed: ${error.message}`);
      }
      setMessageType('error');
      console.error('Past paper submission error:', error);
    } else if (!data || data.length === 0) {
      setMessage('Past paper submission did not return a new record.');
      setMessageType('error');
      console.warn('No data returned from paper insert:', data);
    } else {
      setMessage("✅ Past paper added successfully");
      setMessageType('success');
      setSelectedExamSessionId('');
      setUnitCode('');
      setQuestionPaperLink('');
      setMarkSchemeLink('');
      setExaminerReportLink('');
      setTimeout(() => {
        setMessage("");
        setMessageType(null);
      }, 3000);
    }
    setSubmitLoading(false);
};


  // Fetch pending community resource requests
  const fetchPendingResources = async () => {
    if (!supabaseClient) return;
    const { data, error } = await supabaseClient
      .from('community_resource_requests')
      .select('*')
      .eq('approved', "Unapproved")
      .is('rejected', null); // This line fetches resources where rejected is NULL
    if (!error) setPendingResources(data);
  };

  // Approve a community resource request
  const approveResource = async (id) => {
    if (!supabaseClient) return;
    // Get the request
    const { data, error } = await supabaseClient
      .from('community_resource_requests')
      .update({ approved: "Pending", approved_at: new Date().toISOString(), approved_by: staffUsername })
      .eq('id', id)
      .select()
      .single();
    if (!error && data) {
      // Insert into resources table
      await supabaseClient.from('resources').insert({
        title: data.title,
        link: data.link,
        description: data.description,
        resource_type: data.resource_type,
        subject_id: data.subject_id,
        unit_chapter_name: data.unit_chapter_name,
        contributor_email: data.contributor_name || data.contributor_email || 'Community',
        approved: "Pending"
      });
      // Remove from pending list
      setPendingResources((prev) => prev.filter((res) => res.id !== id));
      setMessage('Resource approved and moved to pending resources!');
      setMessageType('success');
    } else {
      setMessage('Failed to approve resource: ' + error.message);
      setMessageType('error');
    }
  };

  // Reject a community resource request
  const rejectResource = async (id, retryCount = 0) => {
    if (!supabaseClient || !rejectionReasons[id]) {
      setMessage('Please provide a rejection reason.');
      setMessageType('error');
      return;
    }

    const maxRetries = 2;
    const rejectionReason = rejectionReasons[id];

    // Store the original resource state for potential rollback
    const originalResource = pendingResources.find(res => res.id === id);

    // Optimistically update the local state first
    setPendingResources((prev) =>
      prev.map((res) =>
        res.id === id
          ? { ...res, approved: "Unapproved", rejected: true, rejection_reason: rejectionReason }
          : res
      )
    );

    try {
      const { error } = await supabaseClient
        .from('community_resource_requests')
        .update({ 
          rejection_reason: rejectionReason, 
          approved: "Unapproved",
          rejected: true // Set the 'rejected' field to TRUE
        })
        .eq('id', id);

      if (!error) {
        // Success - remove from pending list and clean up rejection reason
        setTimeout(() => {
          setPendingResources((prev) => prev.filter((res) => res.id !== id));
        }, 1000);
        
        setMessage('Resource rejected!');
        setMessageType('success');
        
        // Clean up rejection reason
        setRejectionReasons(prev => {
          const newState = { ...prev };
          delete newState[id];
          return newState;
        });
      } else {
        throw new Error(error.message);
      }
    } catch (error) {
      console.error(`Reject attempt ${retryCount + 1} failed:`, error);
      
      // Revert the optimistic update
      if (originalResource) {
        setPendingResources((prev) =>
          prev.map((res) =>
            res.id === id
              ? originalResource
              : res
          )
        );
      }

      // Retry logic
      if (retryCount < maxRetries) {
        setMessage(`Reject failed, retrying... (${retryCount + 1}/${maxRetries + 1})`);
        setMessageType('error');
        
        // Wait a bit before retrying
        setTimeout(() => {
          rejectResource(id, retryCount + 1);
        }, 1000);
      } else {
        // All retries failed - offer manual solutions
        const shouldReload = window.confirm(
          `Failed to reject community resource after ${maxRetries + 1} attempts. This might be due to a network issue or database problem.\n\nWould you like to reload the page to refresh the data? (Recommended)`
        );
        
        if (shouldReload) {
          window.location.reload();
        } else {
          // Alternative: Force refresh the resource list
          setMessage(`Failed to reject resource: ${error.message}. Refreshing resource list...`);
          setMessageType('error');
          
          // Force refresh the pending resources if that function exists
          setTimeout(() => {
            if (typeof fetchPendingResources === 'function') {
              fetchPendingResources();
            } else if (typeof fetchLatestResources === 'function') {
              fetchLatestResources();
            }
            
            // Clear the failed rejection reason to allow retry
            setRejectionReasons(prev => {
              const newState = { ...prev };
              delete newState[id];
              return newState;
            });
            
            setMessage('Resource list refreshed. Please try rejecting again.');
            setMessageType('success');
          }, 1000);
        }
      }
    }
  };

  const handleWatermark = async (resource) => {
    setWatermarkLoading((prev) => ({ ...prev, [resource.id]: true }));
    try {
      const res = await fetch('/api/watermark', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: resource.link }),
      });
      
      if (!res.ok) {
        const err = await res.json();
        setMessage(`Watermark failed: ${err.error || res.statusText}`);
        setMessageType('error');
        return;
      }
      
      const contentDisposition = res.headers.get('Content-Disposition') || '';
      let fileNames = [];
      if (contentDisposition.includes('zip')) {
        // Folder: try to get file list from zip (not possible client-side), so just show generic message
        fileNames = ['All PDFs in folder'];
      } else {
        // Single file: extract filename
        const match = contentDisposition.match(/filename="([^"]+)"/);
        if (match) fileNames = [match[1]];
      }
      
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = fileNames[0] || 'watermarked.pdf';
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
      
      // Update database to set is_watermarked to true after successful watermark
      try {
        const { error: updateError } = await supabase
          .from('community_resource_requests')
          .update({ is_watermarked: true })
          .eq('id', resource.id);
        
        if (updateError) {
          console.error('Error updating watermark status:', updateError);
          // Don't fail the whole operation, just log the error
          setMessage('Watermarked PDF downloaded! (Note: Status update failed)');
        } else {
          setMessage('Watermarked PDF downloaded!');
        }
      } catch (dbError) {
        console.error('Database update error:', dbError);
        setMessage('Watermarked PDF downloaded! (Note: Status update failed)');
      }
      
      setMessageType('success');
      setWatermarkedFiles(prev => ({ ...prev, [resource.id]: fileNames }));
      
    } catch (err) {
      setMessage('Watermark error: ' + err.message);
      setMessageType('error');
    } finally {
      setWatermarkLoading((prev) => ({ ...prev, [resource.id]: false }));
    }
  };

  // Handler to save all edited fields
  const handleSaveResourceChanges = async (id) => {
    if (!supabaseClient) return;
    const currentEditedData = editedResourceData[id];

    // Basic validation for required fields
    if (!currentEditedData || !currentEditedData.title || !currentEditedData.link || !currentEditedData.subject_id || !currentEditedData.resource_type) {
      setMessage('All required fields (Title, Link, Subject, Resource Type) must be filled for saving changes.');
      setMessageType('error');
      return;
    }

    // Prepare data to send to Supabase
    const updateData = {
      title: currentEditedData.title,
      link: currentEditedData.link,
      description: currentEditedData.description,
      resource_type: currentEditedData.resource_type,
      subject_id: currentEditedData.subject_id,
      unit_chapter_name: currentEditedData.unit_chapter_name || 'General', // Default to General if empty
    };

    const { error } = await supabaseClient
      .from('community_resource_requests')
      .update(updateData)
      .eq('id', id);

    if (!error) {
      setPendingResources(prev =>
        prev.map(res => res.id === id ? { ...res, ...updateData } : res)
      );
      setEditingResourceId(null); // Exit edit mode
      setEditedResourceData(prev => { // Clear edited data for this resource
        const newState = { ...prev };
        delete newState[id];
        return newState;
      });
      setMessage('Resource details updated!');
      setMessageType('success');
    } else {
      setMessage('Failed to update resource: ' + error.message);
      setMessageType('error');
    }
  };

  // Handler to initialize edit mode for a resource
  const handleEditResource = (resource) => {
    setEditingResourceId(resource.id);
    // Initialize edited data with current resource values
    setEditedResourceData(prev => ({
      ...prev,
      [resource.id]: {
        title: resource.title,
        link: resource.link,
        description: resource.description,
        resource_type: resource.resource_type,
        subject_id: resource.subject_id,
        unit_chapter_name: resource.unit_chapter_name,
      }
    }));
  };

  // Handler to cancel edit mode
  const handleCancelEdit = () => {
    setEditingResourceId(null);
    setEditedResourceData({}); // Clear all temporary edited data
  };

  // Find the selected subject to get its units
  const currentSelectedSubject = subjects.find(s => s.id === selectedSubjectId);
  const unitsForSelectedSubject = currentSelectedSubject?.units || [];


  return (
    <div className={`pt-20 ${!staffUser ? "h-screen":"min-h-screen h-fit "} bg-blue-100 p-6 flex justify-center items-center`} style={{ fontFamily: 'Poppins, sans-serif' }}>
      <div className="h-fit bg-white rounded-xl shadow-lg w-full max-w-3xl mx-auto p-4 sm:p-6">
        {!staffUser ? (
          <form onSubmit={handleLogin} className="space-y-4">
            <h2 className="text-2xl font-bold mb-2 text-blue-700 flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#1447e6"><path d="M185-80q-17 0-29.5-12.5T143-122v-105q0-90 56-159t144-88q-40 28-62 70.5T259-312v190q0 11 3 22t10 20h-87Zm147 0q-17 0-29.5-12.5T290-122v-190q0-70 49.5-119T459-480h189q70 0 119 49t49 119v64q0 70-49 119T648-80H332Zm148-484q-66 0-112-46t-46-112q0-66 46-112t112-46q66 0 112 46t46 112q0 66-46 112t-112 46Z"/></svg>
              Staff Login
            </h2>
            <input type="email" value={loginEmail} onChange={(e) => setLoginEmail(e.target.value)} placeholder="Staff Email" className="w-full border p-2 rounded-md focus:ring-2 focus:ring-blue-300 focus:border-blue-500 transition" required />
            <input type="password" value={loginPassword} onChange={(e) => setLoginPassword(e.target.value)} placeholder="Password" className="w-full border p-2 rounded-md focus:ring-2 focus:ring-blue-300 focus:border-blue-500 transition" required />
            <button type="submit" className="cursor-pointer w-full bg-blue-600 hover:bg-blue-700 transition text-white py-2 rounded-lg flex items-center justify-center gap-2">{loginLoading ? <svg className="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" /></svg> : <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>} {loginLoading ? 'Logging in...' : 'Login'}</button>
          </form>
        ) : (
          <>
            <div className="border-b mb-4 sm:text-base text-xs grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 sm:px-1 w-full">
              <button onClick={() => setActiveTab('upload')} className={`cursor-pointer py-2 px-4 flex items-center gap-1 rounded-t-lg ${activeTab === 'upload' ? 'border-b-2 border-blue-600 font-semibold text-blue-700 bg-blue-50' : 'text-gray-500 hover:text-blue-600'}`}><svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M7 10l5 5m0 0l5-5m-5 5V4" /></svg>Upload Resources</button>
              {/* NEW TAB BUTTON */}
              <button onClick={() => setActiveTab('uploadPaper')} className={`cursor-pointer py-2 px-4 flex items-center gap-1 rounded-t-lg ${activeTab === 'uploadPaper' ? 'border-b-2 border-blue-600 font-semibold text-blue-700 bg-blue-50' : 'text-gray-500 hover:text-blue-600'}`}><svg xmlns="http://www.w3.org/2000/svg" height="20px" viewBox="0 -960 960 960" width="20px" fill="currentColor"><path d="M744-192H312q-29 0-50.5-21.5T240-264v-576q0-29 21.5-50.5T312-912h312l192 192v456q0 29-21.5 50.5T744-192ZM576-672v-168H312v576h432v-408H576ZM168-48q-29 0-50.5-21.5T96-120v-552h72v552h456v72H168Zm144-792v195-195 576-576Z"/></svg>Upload Papers</button>
              <button onClick={() => setActiveTab('approve')} className={`cursor-pointer py-2 px-4 flex items-center gap-1 rounded-t-lg ${activeTab === 'approve' ? 'border-b-2 border-blue-600 font-semibold text-blue-700 bg-blue-50' : 'text-gray-500 hover:text-blue-600'}`}><svg xmlns="http://www.w3.org/2000/svg" height="20px" viewBox="0 -960 960 960" width="20px" fill="currentColor"><path d="M263.72-96Q234-96 213-117.15T192-168v-384q0-29.7 21.15-50.85Q234.3-624 264-624h24v-96q0-79.68 56.23-135.84 56.22-56.16 136-56.16Q560-912 616-855.84q56 56.16 56 135.84v96h24q29.7 0 50.85 21.15Q768-581.7 768-552v384q0 29.7-21.16 50.85Q725.68-96 695.96-96H263.72Zm.28-72h432v-384H264v384Zm216.21-120Q510-288 531-309.21t21-51Q552-390 530.79-411t-51-21Q450-432 429-410.79t-21 51Q408-330 429.21-309t51 21ZM360-624h240v-96q0-50-35-85t-85-35q-50 0-85 35t-35 85v96Zm-96 456v-384 384Z"/></svg>Approve</button>
            </div>
            {message && (
              <div className={`mb-4 p-3 rounded text-sm flex items-center gap-2 justify-center ${messageType === 'success' ? 'bg-green-100 text-green-800 border border-green-300 animate-fade-in' : 'bg-red-100 text-red-800 border border-red-300 animate-fade-in'}`}>
                {messageType === 'success' ? (
                  <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                ) : (
                  <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                )}
                <span>{message}</span>
              </div>
            )}

            {/* Existing Upload Resources Tab Content */}
            {activeTab === 'upload' && (
              <>
                <form onSubmit={handleSubmit} className="space-y-4 bg-blue-50 p-4 rounded-2xl border border-blue-100">
                  <h3 className="text-xl font-bold mb-2 text-blue-700">Upload New Resource</h3>
                  <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Title *" className="w-full border p-2 rounded-md focus:ring-2 focus:ring-blue-300 focus:border-blue-500 transition" required />
                  {/* Unit/Chapter dropdown or input */}
                  {(() => {
                    const selectedSubject = subjects.find(sub => sub.id === selectedSubjectId);
                    const units = selectedSubject?.units || [];
                    if (Array.isArray(units) && units.length > 0) {
                      return (
                        <select value={unitChapter} onChange={e => setUnitChapter(e.target.value)} className="cursor-pointer w-full border p-2 rounded-md focus:ring-2 focus:ring-blue-300 focus:border-blue-500 transition">
                          <option value="">Select Unit/Chapter (optional)</option>
                          {units.map((unit, idx) => (
                            <option key={unit.code || unit.name || idx} value={unit.unit || unit.name}>{unit.unit ? `${unit.unit} - ${unit.name}` : unit.name}</option>
                          ))}
                          <option value="General">General</option>
                        </select>
                      );
                    } else {
                      return (
                        <input type="text" value={unitChapter} onChange={(e) => setUnitChapter(e.target.value)} placeholder="Unit/Chapter Name (Optional)" className="w-full border p-2 rounded-md focus:ring-2 focus:ring-blue-300 focus:border-blue-500 transition" />
                      );
                    }
                  })()}
                  <input type="url" value={link} onChange={(e) => setLink(e.target.value)} placeholder="Resource Link (URL) *" className="w-full border p-2 rounded-md focus:ring-2 focus:ring-blue-300 focus:border-blue-500 transition" required />
                  <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Description (Optional)" className="min-h-[100px] w-full border p-2 rounded-md focus:ring-2 focus:ring-blue-300 focus:border-blue-500 transition" rows="3"></textarea>
                  <select value={resourceType} onChange={(e) => setResourceType(e.target.value)} className="cursor-pointer w-full border p-2 rounded-md focus:ring-2 focus:ring-blue-300 focus:border-blue-500 transition" required>
                    {resourceCategories.map((cat) => <option key={cat.value} value={cat.value}>{cat.label}</option>)}
                  </select>
                  <select value={selectedSubjectId} onChange={(e) => setSelectedSubjectId(e.target.value)} className="cursor-pointer w-full border p-2 rounded-md focus:ring-2 focus:ring-blue-300 focus:border-blue-500 transition" required>
                    <option value="">Select Subject *</option> {/* Added a default option */}
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
                  </select>
                  <button type="submit" className="cursor-pointer w-full bg-blue-600 hover:bg-blue-700 transition text-white py-2 rounded-lg flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed" disabled={submitLoading}>
                    {submitLoading ? (
                      <svg className="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" /></svg>
                    ) : (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M7 10l5 5m0 0l5-5m-5 5V4" /></svg>
                    )}
                    {submitLoading ? 'Submitting...' : 'Submit Resource'}
                  </button>
                </form>
              </>
            )}

            {/* NEW: Upload Past Papers Tab Content */}
            {activeTab === 'uploadPaper' && (
              <>
                <form onSubmit={handlePaperSubmit} className="space-y-4 bg-blue-50 p-4 rounded-2xl border border-blue-100">
                  <h3 className="text-xl font-bold mb-2 text-blue-700">Upload New Past Paper</h3>

                  {/* Subject Selection */}
                  <select value={selectedSubjectId} onChange={(e) => setSelectedSubjectId(e.target.value)} className="cursor-pointer w-full border p-2 rounded-md focus:ring-2 focus:ring-blue-300 focus:border-blue-500 transition" required>
                    <option value="">Select Subject *</option>
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
                  </select>

                  {/* Exam Session Selection */}
                  <select
                    value={selectedExamSessionId}
                    onChange={(e) => setSelectedExamSessionId(e.target.value)}
                    className="cursor-pointer w-full border p-2 rounded-md focus:ring-2 focus:ring-blue-300 focus:border-blue-500 transition"
                    required
                    disabled={loadingExamSessions}
                  >
                    <option value="">Select Exam Session *</option>
                    {loadingExamSessions ? (
                      <option>Loading sessions...</option>
                    ) : (
                      examSessions.map((session) => (
                        <option key={session.id} value={session.id}>
                          {session.session} {session.year} {/* Display session and year */}
                        </option>
                      ))
                    )}
                  </select>

                  {/* Unit Code Dropdown (NEWLY ADDED / MODIFIED) */}
                  <select
                    value={unitCode}
                    onChange={(e) => setUnitCode(e.target.value)}
                    className="cursor-pointer w-full border p-2 rounded-md focus:ring-2 focus:ring-blue-300 focus:border-blue-500 transition"
                    required
                    disabled={!selectedSubjectId || unitsForSelectedSubject.length === 0} // Disable if no subject selected or no units
                  >
                    <option value="">Select Unit Code *</option>
                    {unitsForSelectedSubject.map((unit, idx) => (
                      <option key={unit.code || idx} value={unit.code}>
                        {unit.code} - {unit.name} ({unit.unit})
                      </option>
                    ))}
                    {/* Optionally add a "General" or free-form if applicable for past papers */}
                    {/* <option value="General">General</option> */}
                  </select>


                  <input type="url" value={questionPaperLink} onChange={(e) => setQuestionPaperLink(e.target.value)} placeholder="Question Paper Link (URL)" className="w-full border p-2 rounded-md focus:ring-2 focus:ring-blue-300 focus:border-blue-500 transition" />
                  <input type="url" value={markSchemeLink} onChange={(e) => setMarkSchemeLink(e.target.value)} placeholder="Mark Scheme Link (URL)" className="w-full border p-2 rounded-md focus:ring-2 focus:ring-blue-300 focus:border-blue-500 transition" />
                  <input type="url" value={examinerReportLink} onChange={(e) => setExaminerReportLink(e.target.value)} placeholder="Examiner Report Link (URL)" className="w-full border p-2 rounded-md focus:ring-2 focus:ring-blue-300 focus:border-blue-500 transition" />

                  <button type="submit" className="cursor-pointer w-full bg-blue-600 hover:bg-blue-700 transition text-white py-2 rounded-lg flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed" disabled={submitLoading}>
                    {submitLoading ? (
                      <svg className="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" /></svg>
                    ) : (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M7 10l5 5m0 0l5-5m-5 5V4" /></svg>
                    )}
                    {submitLoading ? 'Submitting...' : 'Add Past Paper'}
                  </button>
                </form>
              </>
            )}

            {/* Existing Approve Tab Content */}
            {activeTab === 'approve' && (
              <>
                <div className="divide-y divide-blue-100">
                  {pendingResources.length === 0 && <div className="text-gray-500 text-sm py-4">No pending submissions 🎉</div>}
                  {pendingResources.map((res) => (
                    <div key={res.id} className="bg-gray-100 p-4 rounded mb-3 flex flex-col flex-shrink min-w-0 w-full ">
                      <div>
                        {/* Title Field */}
                        {editingResourceId === res.id ? (
                          <input
                            type="text"
                            value={editedResourceData[res.id]?.title ?? res.title}
                            onChange={e => setEditedResourceData(prev => ({
                              ...prev,
                              [res.id]: { ...prev[res.id], title: e.target.value }
                            }))}
                            className="w-full border px-2 py-1 rounded-md text-sm mb-1 focus:ring-2 focus:ring-blue-200 focus:border-blue-400 transition"
                            placeholder="Title"
                          />
                        ) : (
                          <p className="font-bold break-words text-blue-800">{res.title}</p>
                        )}

                        {/* Description Field */}
                        {editingResourceId === res.id ? (
                          <textarea
                            value={editedResourceData[res.id]?.description ?? res.description}
                            onChange={e => setEditedResourceData(prev => ({
                              ...prev,
                              [res.id]: { ...prev[res.id], description: e.target.value }
                            }))}
                            className="min-h-[100px] w-full border px-2 py-1 rounded-md text-sm mb-1 focus:ring-2 focus:ring-blue-200 focus:border-blue-400 transition"
                            placeholder="Description (Optional)"
                            rows="2"
                          />
                        ) : (
                          <p className="text-sm text-gray-600 break-words mb-1">{res.description}</p>
                        )}

                        {/* Link Field */}
                        <div className="flex items-center gap-2 mb-1">
                          {editingResourceId === res.id ? (
                            <>
                              <input
                                type="url"
                                value={editedResourceData[res.id]?.link ?? res.link}
                                onChange={e => setEditedResourceData(prev => ({ ...prev, [res.id]: { ...prev[res.id], link: e.target.value } }))}
                                className="border px-2 py-1 rounded-md text-sm flex-1 min-w-0 focus:ring-2 focus:ring-blue-200 focus:border-blue-400 transition"
                                placeholder="Resource Link (URL)"
                                autoFocus
                              />
                            </>
                          ) : (
                            <a
                              href={res.link}
                              className="text-blue-500 underline text-xs px-2 w-fit py-1 rounded hover:bg-blue-100 transition sm:whitespace-nowrap break-all flex-1"
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              {res.link}
                            </a>
                          )}
                        </div>

                        {/* Unit/Chapter & Resource Type Fields */}
                        <div className='flex justify-start gap-2 text-xs mb-2 mt-2 flex-wrap'>
                          {editingResourceId === res.id ? (
                            <>
                              {/* Unit/Chapter Selector */}
                              {(() => {
                                const selectedSubject = subjects.find(sub => sub.id === (editedResourceData[res.id]?.subject_id ?? res.subject_id));
                                const units = selectedSubject?.units || [];
                                if (Array.isArray(units) && units.length > 0) {
                                  return (
                                    <select
                                      value={editedResourceData[res.id]?.unit_chapter_name ?? res.unit_chapter_name}
                                      onChange={e => setEditedResourceData(prev => ({ ...prev, [res.id]: { ...prev[res.id], unit_chapter_name: e.target.value } }))}
                                      className="min-w-[150px] cursor-pointer border px-2 py-1 rounded-md text-sm focus:ring-2 focus:ring-blue-200 focus:border-blue-400 transition"
                                    >
                                      <option value="">Select Unit/Chapter (optional)</option>
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
                                      value={editedResourceData[res.id]?.unit_chapter_name ?? res.unit_chapter_name}
                                      onChange={e => setEditedResourceData(prev => ({ ...prev, [res.id]: { ...prev[res.id], unit_chapter_name: e.target.value } }))}
                                      className="border px-2 py-1 rounded-md text-sm focus:ring-2 focus:ring-blue-200 focus:border-blue-400 transition"
                                      placeholder="Unit/Chapter Name (Optional)"
                                    />
                                  );
                                }
                              })()}

                              {/* Resource Type Selector */}
                              <select
                                value={editedResourceData[res.id]?.resource_type ?? res.resource_type}
                                onChange={e => setEditedResourceData(prev => ({ ...prev, [res.id]: { ...prev[res.id], resource_type: e.target.value } }))}
                                className="min-w-[150px] cursor-pointer border px-2 py-1 rounded-md text-sm focus:ring-2 focus:ring-blue-200 focus:border-blue-400 transition"
                              >
                                {resourceCategories.map((cat) => (
                                  <option key={cat.value} value={cat.value}>{cat.label}</option>
                                ))}
                              </select>
                            </>
                          ) : (
                            <>
                              <div className="cursor-pointer w-fit px-4 py-0.5 text-green-400 ring ring-green-400 rounded-md hover:bg-green-400 hover:text-white transition-colors">{res.unit_chapter_name || 'General'}</div>
                              <div className="cursor-pointer w-fit px-4 py-0.5 text-orange-400 uppercase ring ring-orange-400 rounded-md hover:bg-orange-400 hover:text-white transition-colors">{res.resource_type}</div>
                            </>
                          )}
                        </div>

                        {/* Subject Selector (always present but editable in edit mode) */}
                        <div className="flex justify-start gap-2 text-xs mb-2 mt-2 flex-wrap">
                          <span className="font-semibold text-gray-700">Subject:</span>
                          {editingResourceId === res.id ? (
                            <select
                              value={editedResourceData[res.id]?.subject_id ?? res.subject_id}
                              onChange={e => setEditedResourceData(prev => ({ ...prev, [res.id]: { ...prev[res.id], subject_id: e.target.value } }))}
                              className="min-w-[150px] cursor-pointer border px-2 py-1 rounded-md text-sm focus:ring-2 focus:ring-blue-200 focus:border-blue-400 transition"
                            >
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
                            </select>
                          ) : (
                            <span className="text-gray-600">
                              {subjects.find(s => s.id === res.subject_id)?.name || 'N/A'}
                            </span>
                          )}
                        </div>

                        <div className="text-xs text-gray-700 mt-1">
                          <span className="font-semibold">Contributor:</span> {res.contributor_name || 'Anonymous'} ({res.contributor_email || 'N/A'})
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex mt-2 flex-wrap flex-col sm:flex-row gap-2">
                        {editingResourceId === res.id ? (
                          <>
                            <button
                              onClick={() => handleSaveResourceChanges(res.id)}
                              className="cursor-pointer bg-blue-500 hover:bg-blue-700 text-white px-3 py-1 rounded-md flex items-center gap-1 transition disabled:opacity-50 disabled:cursor-not-allowed"
                              // The button is enabled if editedResourceData for this ID exists AND
                              // required fields are not empty. This means any change to required fields
                              // or presence of data will enable it.
                              disabled={
                                !editedResourceData[res.id] ||
                                !editedResourceData[res.id].title ||
                                !editedResourceData[res.id].link ||
                                !editedResourceData[res.id].subject_id ||
                                !editedResourceData[res.id].resource_type
                              }
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                              Save
                            </button>
                            <button
                              onClick={handleCancelEdit}
                              className="cursor-pointer bg-gray-300 hover:bg-gray-400 text-gray-700 px-3 py-1 rounded-md flex items-center gap-1 transition"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                              Cancel
                            </button>
                          </>
                        ) : (
                          <>
                            <button onClick={() => approveResource(res.id)} className="cursor-pointer bg-green-500 hover:bg-green-600 transition text-white px-3 py-1 rounded-md flex items-center gap-1"><svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>Approve</button>
                            <button
                              onClick={() => handleEditResource(res)} // Set the resource to be edited
                              className="p-2 cursor-pointer text-blue-500 hover:text-blue-700 focus:outline-none bg-blue-100 rounded-md max-sm:flex max-sm:items-start max-sm:gap-2"
                              title="Edit Resource Details"
                            >
                              <Pencil className='w-5 h-5'/>
                              <p className='max-sm:inline-block hidden'>Edit Resource Details</p>
                            </button>
                            <button onClick={() => handleWatermark(res)} disabled={watermarkLoading[res.id]} className={`cursor-pointer bg-blue-500 hover:bg-blue-600 transition text-white px-3 py-1 rounded-md flex items-center gap-1 ${watermarkLoading[res.id] ? 'opacity-50 cursor-not-allowed' : ''}`}>
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg>
                              {watermarkLoading[res.id] ? 'Watermarking...' : 'Watermark'}
                            </button>
                          </>
                        )}
                        {/* Show watermarked file(s) below the button */}
                        {watermarkedFiles[res.id] && (
                          <div className="text-green-600 text-xs mt-2 w-full">
                            {Array.isArray(watermarkedFiles[res.id]) && watermarkedFiles[res.id].length > 0
                              ? watermarkedFiles[res.id].map((name, idx) => (
                                  <div key={idx}>✅ Watermarked {name}</div>
                                ))
                              : <div>✅ Watermarked {watermarkedFiles[res.id]}</div>}
                          </div>
                        )}
                        <input
                          type="text"
                          placeholder="Rejection reason"
                          value={rejectionReasons[res.id] || ''}
                          onChange={(e) => setRejectionReasons(prev => ({ ...prev, [res.id]: e.target.value }))}
                          className="border px-2 py-1 rounded-md text-sm focus:ring-2 focus:ring-red-200 focus:border-red-400 transition flex-grow min-w-[150px]"
                        />
                        <button onClick={() => rejectResource(res.id)} className="cursor-pointer bg-red-500 hover:bg-red-600 transition text-white px-3 py-1 rounded-md flex items-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed" disabled={!rejectionReasons[res.id]}><svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>Reject</button>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </>
        )}
      </div>
      {/* Add fade-in animation */}
      <style jsx global>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
          animation: fade-in 0.4s ease;
        }
      `}</style>
    </div>
  );
}