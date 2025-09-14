"use client";
import React, { useState, useEffect, useRef } from 'react';
import { Pencil, LoaderCircle } from 'lucide-react';
// Removed 'motion' import as we're replacing the custom message display
// import { motion } from 'framer-motion'; 

import { supabase } from '@/lib/supabaseClient';

// Import the usePopup hook from your utility file
import { usePopup } from '@/components/ui/PopupNotification';


export default function AdminDashboard() {
  const [supabaseClient, setSupabaseClient] = useState(null);
  useEffect(() => {
    if (window.supabase && !supabaseClient) {
      const client = window.supabase.supabase;
      setSupabaseClient(client);
    }
  }, []);
  const showPopup = usePopup(); // Initialize the showPopup function
  const [staffUser, setStaffUser] = useState(null);
  const [isAuthReady, setIsAuthReady] = useState(false);
  const [subjects, setSubjects] = useState([]);
  const [loadingSubjects, setLoadingSubjects] = useState(true);
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
  const [latestResources, setLatestResources] = useState([]);
  const [unapprovedResources, setUnapprovedResources] = useState([]);
  const [activeTab, setActiveTab] = useState('upload');
  const [newSubjectName, setNewSubjectName] = useState('');
  const [newSubjectCode, setNewSubjectCode] = useState('');
  const [newSubjectType, setNewSubjectType] = useState(''); // Corrected initialization
  // For adding units to a new subject
  const [newUnitName, setNewUnitName] = useState('');
  const [newUnitCode, setNewUnitCode] = useState('');
  const [newUnitNumber, setNewUnitNumber] = useState('');
  const [newUnits, setNewUnits] = useState([]);
  const [editResource, setEditResource] = useState(null);
  const [editForm, setEditForm] = useState({}); // Corrected initialization
  const [editLoading, setEditLoading] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [leaderboard, setLeaderboard] = useState([]);
  const [loadingLeaderboard, setLoadingLeaderboard] = useState(false);

  // Moderation View State
  const [modType, setModType] = useState('community'); // 'resource' or 'community'
  const [modSubject, setModSubject] = useState('');
  const [modQualification, setModQualification] = useState('');
  const [modResults, setModResults] = useState([]);
  const [modLoading, setModLoading] = useState(false);
  const [modStaffUser, setModStaffUser] = useState('');
  const [modKeyword, setModKeyword] = useState('');

  // Moderation edit modal state
  const [modEditItem, setModEditItem] = useState(null);
  const [modEditForm, setModEditForm] = useState({});
  const [modEditLoading, setModEditLoading] = useState(false);

  // NEW: State variables for Past Papers
  const [selectedExamSessionId, setSelectedExamSessionId] = useState(''); // Stores the UUID of the selected session
  const [unitCode, setUnitCode] = useState(''); // e.g., 'WAC11' from dropdown or text input
  const [questionPaperLink, setQuestionPaperLink] = useState('');
  const [markSchemeLink, setMarkSchemeLink] = useState('');
  const [examinerReportLink, setExaminerReportLink] = useState('');
  const [examSessions, setExamSessions] = useState([]); // To store fetched exam sessions
  const [loadingExamSessions, setLoadingExamSessions] = useState(true);
  const [pastPaperSubmitLoading, setPastPaperSubmitLoading] = useState(false);

  const [staffUsers, setStaffUsers] = useState([]); // All staff users
  const [loadingStaffUsers, setLoadingStaffUsers] = useState(true);
  const [newUserData, setNewUserData] = useState({ username: '', email: '', password: '', role: 'moderator' });
  const [selectedUserIdForUpdate, setSelectedUserIdForUpdate] = useState('');
  const [selectedUserNewRole, setSelectedUserNewRole] = useState('moderator');
  const [selectedUserIdForRemove, setSelectedUserIdForRemove] = useState('');
  const [userActionLoading, setUserActionLoading] = useState(false);

  // Under review section states
  const [pendingResources, setPendingResources] = useState([]);
  const [rejectionReasons, setRejectionReasons] = useState({});
  const [editedResourceData, setEditedResourceData] = useState({});
  const [editingResourceId, setEditingResourceId] = useState(null);
  // Under_review's Pagination
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [pageLoading, setPageLoading] = useState(false);
  const findTotalPending = async () => {    
    // if (!supabaseClient) return;
    const { data: allData, error:countError } = await supabase
      .from('community_resource_requests')
      .select('*')
      .eq('approved', "Unapproved")
    if(!countError) return allData.length;
    else return null;
  }
  // Fetch pending community resource requests
  const fetchPendingResources = async () => {   
    setPageLoading(true) 
    let upper = page * 10
    let lower = upper - 9       
    if(lower <= 0){
      lower = 1
    }
    if(upper >= total && total !== 0){
      upper = total
      lower = ((page-1)*10)+9
    }
    // if (!supabaseClient) return;
    const { data, error } = await supabase
      .from('community_resource_requests')
      .select('*')
      .eq('approved', "Unapproved")
      .range(lower-1,upper-1)
    if (!error) setPendingResources(data);
    setPageLoading(false);
  };
  const PendingTotalFetched = useRef(false)
  const loadPending = async () => {
    if(PendingTotalFetched.current === false){
      const Total = await findTotalPending(); 
      setTotal(Total);   
      PendingTotalFetched.current = true                
    }     
    await fetchPendingResources();     
  };
  useEffect(() => {
    loadPending()
  }, [page]);
  
  // Approve a community resource request
  const approveResource_Under = async (id) => {
    if (!supabaseClient) return;
    const { data, error } = await supabaseClient
      .from('community_resource_requests')
      .select('*')
      .eq('id', id)
      .single();
    if (!error && data) {
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
      // Corrected fix: Delete the resource from the community_resource_requests table
      const { error: deleteError } = await supabaseClient
        .from('community_resource_requests')
        .delete()
        .eq('id', id);

      if (!deleteError) {
        setPendingResources((prev) => prev.filter((res) => res.id !== id));
        setMessage('Resource approved and moved to pending resources!');
        setMessageType('success');
      } 
    } 
  };

  // Reject a community resource request
  const rejectResource_Under = async (id, retryCount = 0) => {
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
          ? { ...res, approved: "Unapproved", rejection_reason: rejectionReason }
          : res
      )
    );
  
    try {
      const { error } = await supabaseClient
        .from('community_resource_requests')
        .update({ 
          rejection_reason: rejectionReason, 
          approved: "Unapproved" 
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
          rejectResource_Under(id, retryCount + 1);
        }, 1000);
      } else {
        
        if (shouldReload) {
          window.location.reload();
        }
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

  // Watermarking States
  const [watermarkLoading, setWatermarkLoading] = useState({});
  const [watermarkedFiles, setWatermarkedFiles] = useState({});

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


  // Helper function to get approval status display
  const getApprovalStatus = (approved) => {
    switch (approved) {
      case 'Approved':
        return { text: 'Approved', color: 'text-green-600', bgColor: 'bg-green-100' };
      case 'Pending':
        return { text: 'Pending', color: 'text-yellow-600', bgColor: 'bg-yellow-100' };
      case 'Unapproved':
        return { text: 'Unapproved', color: 'text-red-600', bgColor: 'bg-red-100' };
      case null:
      case undefined:
        return { text: 'Not Set', color: 'text-gray-600', bgColor: 'bg-gray-100' };
      default:
        return { text: approved?.toString() || 'Unknown', color: 'text-gray-600', bgColor: 'bg-gray-100' };
    }
  };

  // Delete moderation item
  const handleModDelete = async (item) => {
    if (!supabaseClient) return;
    if (!window.confirm('Are you sure you want to delete this item?')) return;
    const table = modType === 'resource' ? 'resources' : 'community_resource_requests';
    const { error } = await supabaseClient.from(table).delete().eq('id', item.id);
    if (!error) {
        setModResults((prev) => prev.filter((r) => r.id !== item.id));
        showPopup({ type: 'rejectSuccess', subText: 'Item deleted.' }); // Using rejectSuccess for a delete type
    }
    }
  };

  // Open edit modal for moderation
  const handleModEdit = (item) => {
    setModEditItem(item);
    setModEditForm({ ...item });
  };

  // Save moderation edit
  const saveModEdit = async () => {
    if (!supabaseClient || !modEditItem) return;
    setModEditLoading(true);
    const table = modType === 'resource' ? 'resources' : 'community_resource_requests';
    const idField = 'id';
    // Only send editable fields
    const editableFields = { ...modEditForm };
    delete editableFields.id;
    if (modType === 'resource') {
      delete editableFields.submitted_at;
      delete editableFields.updated_at;
    } 
    const { error } = await supabaseClient.from(table).update(editableFields).eq(idField, modEditItem.id);
    setModEditLoading(false);
    if (error) {
      showPopup({ type: 'fetchError', subText: `Failed to update: ${error.message}` });
    }
      setModEditItem(null);
      setModEditForm({});
      // Refresh moderation results
      // (re-run the moderation query)
      setModLoading(true);
      let query;
      if (modType === 'resource') {
        query = supabaseClient.from('resources').select('*');
      } 
      if (modSubject) {
        const subjectIds = subjects.filter(s => s.name === modSubject).map(s => s.id);
        if (subjectIds.length > 0) query = query.in('subject_id', subjectIds);
        else query = query.eq('subject_id', '');
      }
      if (modQualification) {
        const filteredSubjects = subjects.filter(s => s.syllabus_type === modQualification);
        const subjectIds = filteredSubjects.map(s => s.id);
        if (subjectIds.length > 0) query = query.in('subject_id', subjectIds);
        else query = query.eq('subject_id', '');
      }
      query.order('submitted_at', { ascending: false }).then(({ data }) => {
        setModResults(data || []);
        setModLoading(false);
      });
    }
  };

  // Edit form change handler
  const handleModEditFormChange = (e) => {
    const { name, value } = e.target;
    setModEditForm((prev) => ({ ...prev, [name]: value }));
  };

  const resourceCategories = [
    { value: 'note', label: 'Note' },
    { value: 'topic_question', label: 'Topic Question' },
    { value: 'marking_scheme', label: 'Marking Scheme' },
    { value: 'extra_resource', label: 'Extra Resource' },
    { value: 'essay_questions', label: 'Essay Questions' },
  ];

  
  useEffect(() => {
    if (!supabaseClient) return;
    setIsAuthReady(false);
    const { data: subscription } = supabaseClient.auth.onAuthStateChange((_e, session) => {
      setStaffUser(session?.user || null);
      setIsAuthReady(true);
      if (session?.user) {
        supabaseClient.from('staff_users').select('username').eq('id', session.user.id).single().then(({ data: staffData }) => {
          setStaffUsername(staffData?.username || '');
        });
        fetchLatestResources();
        // fetchUnapprovedResources();
        fetchExamSessions(); // Fetch exam sessions when authenticated
        fetchStaffUsers(); // NEW: Fetch staff users when authenticated
        // findTotalPending();
        // fetchPendingResources(); // ADDED: Fetch pending community resources
      } 
    });
    supabaseClient.auth.getSession().then(({ data }) => {
      setStaffUser(data?.session?.user || null);
      setIsAuthReady(true);
      if (data?.session?.user) {
        supabaseClient.from('staff_users').select('username').eq('id', data.session.user.id).single().then(({ data: staffData }) => {
          setStaffUsername(staffData?.username || '');
        });
        fetchLatestResources();
        // fetchUnapprovedResources();
        fetchExamSessions(); // Fetch exam sessions when authenticated
        fetchStaffUsers(); // NEW: Fetch staff users when authenticated
      } 
    });
    return () => subscription?.unsubscribe?.();
  }, [supabaseClient]);

  useEffect(() => {
    if (!supabaseClient) return;
    setLoadingSubjects(true);
    supabaseClient.from('subjects').select('id, name, code, syllabus_type, units').order('name', { ascending: true }).then(({ data, error }) => {
      if (error) {
        showPopup({ type: 'fetchError', subText: `Subjects fetch failed: ${error.message}` });
      } 
      setLoadingSubjects(false);
    });
  }, [supabaseClient]);

  // NEW: Fetch exam sessions
  const fetchExamSessions = async () => {
    if (!supabaseClient) return;
    setLoadingExamSessions(true);
    const { data, error } = await supabaseClient
      .from('exam_sessions')
      .select('id, session, year') // CORRECTED: Select 'session' and 'year'
      .order('year', { ascending: false }) // Order by year descending
      .order('session', { ascending: false }); // Then by session descending (e.g., Oct/Nov before May/June)
    if (error) {
      console.error("Failed to fetch exam sessions:", error.message);
      showPopup({ type: 'fetchError', subText: `Failed to fetch exam sessions: ${error.message}` });
    } 
    }
    setLoadingExamSessions(false);
  };

  const fetchLatestResources = async () => {
    if (!supabaseClient) return;
    const { data, error } = await supabaseClient.from('community_resource_requests').select('*').order('submitted_at', { ascending: false }).limit(5);
    if (error) {
      // Not showing a popup for background fetches, only for user-initiated actions
      console.error("Failed to fetch latest resources:", error.message);
    } 
  };

  const [Unapprovedpage, setUnapprovedPage] = useState(1);
  const [Unapprovedtotal, setUnapprovedTotal] = useState(0);
  const [UnapprovedpageLoading, setUnapprovedPageLoading] = useState(false);
  const findTotalUnapproved = async () => {    
    // if (!supabaseClient) return;
    const { data: allData, error:countError } = await supabase
      .from('community_resource_requests')
      .select('*')
      .eq('approved', "Pending")
    if(!countError) return allData.length;
    else return null;
  }

  // Fetch unapproved community resource requests
  const fetchUnapprovedResources = async () => {
    setUnapprovedPageLoading(true) 
    let upper = Unapprovedpage * 10
    let lower = upper - 9       
    if(lower <= 0){
      lower = 1
    }
    if(upper >= Unapprovedtotal && Unapprovedtotal !== 0){
      upper = Unapprovedtotal
      lower = ((Unapprovedpage-1)*10)+9
    }
    // if (!supabaseClient) return;
    const { data, error } = await supabase
      .from('community_resource_requests')
      .select('*')
      .eq('approved', "Pending")
      .range(lower-1,upper-1)
    if (error) {
        console.error("Failed to fetch unapproved resources:", error.message);
        return null;
    } 
  };
  const UnapprovedTotalFetched = useRef(false)
  const loadUnapproved = async () => {
    if(UnapprovedTotalFetched.current === false){
      const Total = await findTotalUnapproved(); 
      setUnapprovedTotal(Total);   
      UnapprovedTotalFetched.current = true                
    }     
    await fetchUnapprovedResources();     
  };
  useEffect(() => {
    loadUnapproved()
  }, [Unapprovedpage]);

  // Alternative version if you want to fetch multiple approval statuses
  const fetchUnapprovedResourcesMultiStatus = async () => {
      if (!supabaseClient) return;
      
      // Fetch resources that are either 'Unapproved' or 'Pending' (if both exist in your enum)
      const { data, error } = await supabaseClient
          .from('community_resource_requests')
          .select('*')
          .in('approved', ['Pending']);
      
      if (error) {
          console.error("Failed to fetch unapproved resources:", error.message);
          return null;
      } 
  };

  // If you want to fetch with additional filtering (e.g., only non-rejected items)
  const fetchUnapprovedResourcesFiltered = async () => {
      if (!supabaseClient) return;
      
      const { data, error } = await supabaseClient
          .from('community_resource_requests')
          .select(`
              *,
              subjects(name)
          `)
          .eq('approved', 'Pending')
          .is('rejected', false) // Only get non-rejected items
          .order('submitted_at', { ascending: false }); // Most recent first
      
      if (error) {
          console.error("Failed to fetch unapproved resources:", error.message);
          return null;
      } 
  };

  // NEW: Fetch all staff users
  const fetchStaffUsers = async () => {
    if (!supabaseClient) return;
    setLoadingStaffUsers(true);
    const { data, error } = await supabaseClient.from('staff_users').select('id, username, email, role, created_at').order('created_at', { ascending: false });
    if (error) {
      showPopup({ type: 'fetchError', subText: `Failed to fetch staff users: ${error.message}` });
    } 
    setLoadingStaffUsers(false);
  };

  const approveResource = async (id) => {
    if (!supabaseClient) return;
    const currentTime = new Date().toISOString();

    // Optimistically update the local state first
    setUnapprovedResources((prev) =>
      prev.map((res) =>
        res.id === id
          ? { ...res, approved: "Approved"}
          : res
      )
    );

    const { error } = await supabaseClient.from('community_resource_requests').update({
      approved: "Approved",
    }).eq('id', id);

    if (!error) {
      // Remove from unapproved list after successful update
      setTimeout(() => {
        setUnapprovedResources((prev) => prev.filter((res) => res.id !== id));
      }, 1000); // Show the approved status for 1 second before removing
      fetchLatestResources();
      showPopup({ type: 'approveSuccess' });
    } 
            : res
        )
      );
      showPopup({ type: 'fetchError', subText: `Failed to approve resource: ${error.message}` });
    }
  };

  const rejectResource = async (id, retryCount = 0) => {
    if (!supabaseClient) {
      console.error('Supabase client not initialized');
      showPopup({ 
        type: 'fetchError', 
        subText: 'Database connection not available' 
      });
      return;
    }
    
    const maxRetries = 2;
  
    // Store the original resource state for potential rollback
    const originalResource = unapprovedResources.find(res => res.id === id);
    
    if (!originalResource) {
      console.error(`Resource with id ${id} not found in local state`);
      showPopup({ 
        type: 'fetchError', 
        subText: 'Resource not found' 
      });
      return;
    }
  
    // Optimistically update the local state first
    setUnapprovedResources((prev) =>
      prev.map((res) =>
        res.id === id
          ? { ...res, approved: "Unapproved" }
          : res
      )
    );
  
    try {
      const { data, error } = await supabaseClient
        .from('community_resource_requests')
        .update({
          approved: "Unapproved"
        })
        .eq('id', id)
        .select(); // Add select() to get the updated data back
  
      if (error) {
        throw new Error(`Supabase error: ${error.message} (Code: ${error.code})`);
      }
  
      // Verify the update was successful
      if (!data || data.length === 0) {
        throw new Error('No rows were updated - resource may not exist');
      }
  
      console.log('Resource rejected successfully:', data[0]);
      
      // Success - remove from pending list after showing rejected status
      setTimeout(() => {
        setUnapprovedResources((prev) => prev.filter((res) => res.id !== id));
      }, 1000);
      
      // Refresh data and show success message
      await fetchLatestResources();
      showPopup({ type: 'rejectSuccess' });
      
    } catch (error) {
      console.error(`Reject attempt ${retryCount + 1} failed:`, error);
      
      // Revert the optimistic update
      setUnapprovedResources((prev) =>
        prev.map((res) =>
          res.id === id ? originalResource : res
        )
      );
  
      // Retry logic
      if (retryCount < maxRetries) {
        showPopup({ 
          type: 'fetchError', 
          subText: `Reject failed, retrying... (${retryCount + 1}/${maxRetries + 1})` 
        });
        
        // Exponential backoff for retries
        const delay = Math.pow(2, retryCount) * 1000; // 1s, 2s, 4s...
        
        setTimeout(() => {
          rejectResource(id, retryCount + 1);
        }, delay);
      } 
    }
  };
  
  // Separate function to handle final failure scenarios
  const handleFinalFailure = (error) => {
    const errorMessage = error?.message || 'Unknown error';
    
    console.error('All retry attempts failed:', errorMessage);
    
    // Check if it's a network error
    if (errorMessage.includes('fetch') || errorMessage.includes('network') || errorMessage.includes('Failed to fetch')) {
      const shouldReload = window.confirm(
        `Network error: Unable to reject resource after multiple attempts.\n\nThis is likely due to a connection issue. Would you like to reload the page?`
      );
      
      if (shouldReload) {
        window.location.reload();
      }
      return;
    }
    
    // Check if it's a permission/auth error
    if (errorMessage.includes('permission') || errorMessage.includes('auth') || errorMessage.includes('unauthorized')) {
      showPopup({ 
        type: 'fetchError', 
        subText: 'Authentication error. Please refresh the page and try again.' 
      });
      return;
    }
    
    // Generic database error
    const shouldReload = window.confirm(
      `Failed to reject resource: ${errorMessage}\n\nWould you like to reload the page to refresh the data?`
    );
    
    if (shouldReload) {
      window.location.reload();
    }
      
      setTimeout(async () => {
        try {
          await fetchLatestResources();
          if (typeof fetchUnapprovedResources === 'function') {
            await fetchUnapprovedResources();
          }
        } catch (refreshError) {
          console.error('Failed to refresh resources:', refreshError);
          showPopup({ 
            type: 'fetchError', 
            subText: 'Failed to refresh data. Please reload the page.' 
          });
        }
      }, 1000);
    }
  };

  const deleteResource = async (id) => {
    if (!supabaseClient) return;
    const { error } = await supabaseClient.from('resources').delete().eq('id', id);
    if (!error) {
      setUnapprovedResources((prev) => prev.filter((res) => res.id !== id));
      fetchLatestResources();
      showPopup({ type: 'rejectSuccess', subText: 'Resource deleted.' }); // Using rejectSuccess for a delete type
    }
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!supabaseClient) return;
    setLoginLoading(true);
    const { data, error } = await supabaseClient.auth.signInWithPassword({ email: loginEmail, password: loginPassword });
    if (!error) {
      setStaffUser(null);
      const {data: staffData, error: staffError} = await supabase
      .from("staff_users")
      .select("id")
      if (!staffData.some(staff => staff.id === data.user.id)) {
        showPopup({ type: 'fetchError', subText: `Login failed: Access Denied.` });
      }
      }
    }
    }
    setLoginLoading(false);
  };

  const handleLogout = async () => {
    if (!supabaseClient) return;
    const { error } = await supabaseClient.auth.signOut();
    if (!error) {
      setStaffUser(null);
      showPopup({ type: 'logoutSuccess' });
    }
    }
  };

  const [submitLoading, setSubmitLoading] = useState(false);
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitLoading(true);
    if (!supabaseClient) {
      showPopup({ type: 'fetchError', subText: 'Supabase client not initialized. Please refresh the page or check your connection.' });
      setSubmitLoading(false);
      return;
    }
    if (!title || !link || !selectedSubjectId || !resourceType) {
      showPopup({ type: 'validationError', subText: 'Please fill all required fields.' });
      setSubmitLoading(false);
      return;
    }
    // Ensure link starts with http:// or https://
    let safeLink = link.trim();
    if (!/^https?:\/\//i.test(safeLink)) {
      // If it doesn't start with www., add it
      if (!/^www\./i.test(safeLink)) {
        safeLink = 'www.' + safeLink;
      }
      safeLink = 'https://' + safeLink;
    }
    const unitValue = unitChapter.trim() === '' ? 'General' : unitChapter.trim();
    const { data, error } = await supabaseClient.from('resources').insert({
      title,
      link: safeLink,
      description,
      resource_type: resourceType,
      subject_id: selectedSubjectId,
      unit_chapter_name: unitValue,
      contributor_email: staffUsername,
      approved: "Approved" // Automatically set to Approved
    }).select();
    if (error) {
      showPopup({ type: 'fetchError', subText: `Submission failed: ${error.message}` });
      setSubmitLoading(false);
    } else if (!data || data.length === 0) {
      showPopup({ type: 'fetchError', subText: 'Submission did not return a new resource. Please check your database constraints.' });
      setSubmitLoading(false);
    }
      setTitle('');
      setLink('');
      setDescription('');
      fetchUnapprovedResources();
      fetchLatestResources();
      setSubmitLoading(false);
    }
  };

  // NEW: Handle Past Paper Submission
  const handlePaperSubmit = async (e) => {
    e.preventDefault();
    setPastPaperSubmitLoading(true);

    if (!supabaseClient) {
      showPopup({ type: 'fetchError', subText: 'Supabase client not initialized. Please refresh the page or check your connection.' });
      setPastPaperSubmitLoading(false);
      return;
    }

    if (!selectedSubjectId || !selectedExamSessionId || !unitCode || !questionPaperLink) {
      showPopup({ type: 'validationError', subText: 'Subject, Exam Session, Unit Code, and Question Paper Link are required.' });
      setPastPaperSubmitLoading(false);
      return;
    }

    // Basic URL validation
    const validateLink = (link) => {
        if (!link) return null; // Optional links can be empty
        let safeLink = link.trim();
        if (!/^https?:\/\//i.test(safeLink)) {
            if (!/^www\./i.test(safeLink)) {
                safeLink = 'www.' + safeLink;
            }
            safeLink = 'https://' + safeLink;
        }
        return safeLink;
    };

    const safeQPLink = validateLink(questionPaperLink);
    const safeMSLink = validateLink(markSchemeLink);
    const safeERLink = validateLink(examinerReportLink);

    if (!safeQPLink) {
        showPopup({ type: 'validationError', subText: 'Question Paper Link is required and must be a valid URL.' });
        setPastPaperSubmitLoading(false);
        return;
    }

    const { data, error } = await supabaseClient.from('papers').insert({ // Changed from 'past_papers' to 'papers' based on schema
      subject_id: selectedSubjectId,
      exam_session_id: selectedExamSessionId,
      unit_code: unitCode,
      question_paper_link: safeQPLink,
      mark_scheme_link: safeMSLink,
      examiner_report_link: safeERLink,
      contributor_email: staffUsername,
      // You might want an 'approved' field for past papers as well, defaulting to 'Approved'
      // approved: "Approved"
    }).select();

    if (error) {
      showPopup({ type: 'fetchError', subText: `Past Paper submission failed: ${error.message}` });
      setPastPaperSubmitLoading(false);
    } else if (!data || data.length === 0) {
      showPopup({ type: 'fetchError', subText: 'Past Paper submission did not return a new record. Please check your database constraints.' });
      setPastPaperSubmitLoading(false);
    }
      // Clear form fields
      setSelectedExamSessionId('');
      setUnitCode('');
      setQuestionPaperLink('');
      setMarkSchemeLink('');
      setExaminerReportLink('');
      // Optionally re-fetch past papers if you have a display for them
      setPastPaperSubmitLoading(false);
    }
  };

  const handleAddSubject = async (e) => {
    e.preventDefault();
    if (!newSubjectName || !newSubjectCode || !newSubjectType) {
      showPopup({ type: 'validationError', subText: 'All fields are required for adding a subject.' });
      return;
    }
    const { error } = await supabaseClient.from('subjects').insert({
      name: newSubjectName,
      code: newSubjectCode,
      syllabus_type: newSubjectType,
      units: newUnits
    });
    if (error) {
      showPopup({ type: 'fetchError', subText: `Failed to add subject: ${error.message}` });
    } // Using approveSuccess for adding a subject
      setNewSubjectName('');
      setNewSubjectCode('');
      setNewSubjectType('');
      setNewUnits([]);
      setNewUnitName('');
      setNewUnitCode('');
      setNewUnitNumber('');
      const { data } = await supabaseClient.from('subjects').select('*');
      setSubjects(data || []);
    }
  };

  // Add a unit to the newUnits array
  const handleAddUnit = (e) => {
    e.preventDefault();
    if (!newUnitName || !newUnitCode || !newUnitNumber) {
      showPopup({ type: 'validationError', subText: 'All unit fields are required.' });
      return;
    }
    setNewUnits((prev) => [
      ...prev,
      { name: newUnitName, code: newUnitCode, unit: newUnitNumber }
    ]);
    setNewUnitName('');
    setNewUnitCode('');
    setNewUnitNumber('');
    // No popup here as it's an in-form action
  };

  // Remove a unit from the newUnits array
  const handleRemoveUnit = (idx) => {
    setNewUnits((prev) => prev.filter((_, i) => i !== idx));
  };

  const openEditResource = (resource) => {
    setEditResource(resource);
    setEditForm({
      title: resource.title || '',
      description: resource.description || '',
      link: resource.link || '',
      unit_chapter_name: resource.unit_chapter_name || '',
      resource_type: resource.resource_type || resource.resourceType || '',
      subject_id: resource.subject_id || '',
      approved: resource.approved || 'Pending', // Add approved status to edit form
    });
    setShowEditModal(true);
  };

  const closeEditResource = () => {
    setEditResource(null);
    setEditForm({});
    setShowEditModal(false);
  };

  const handleEditFormChange = (e) => {
    const { name, value } = e.target;
    setEditForm((prev) => ({ ...prev, [name]: value }));
  };

  const saveEditResource = async () => {
    if (!supabaseClient || !editResource) return;
    setEditLoading(true);
    const { error } = await supabaseClient.from('resources').update({
      title: editForm.title,
      description: editForm.description,
      link: editForm.link,
      unit_chapter_name: editForm.unit_chapter_name,
      resource_type: editForm.resource_type,
      subject_id: editForm.subject_id,
      approved: editForm.approved, // Include approved status in update
    }).eq('id', editResource.id);
    setEditLoading(false);
    if (error) {
      showPopup({ type: 'fetchError', subText: `Failed to update resource: ${error.message}` });
    }
      closeEditResource();
      fetchUnapprovedResources();
      fetchLatestResources();
    }
  };

  const deleteApprovedResource = async (id) => {
    if (!supabaseClient) return;
    const { error } = await supabaseClient.from('resources').delete().eq('id', id);
    if (!error) {
      showPopup({ type: 'rejectSuccess', subText: 'Resource deleted.' }); // Using rejectSuccess for a delete type
      fetchLatestResources();
    }
    }
  };

  // Fetch leaderboard data
  const fetchLeaderboard = async () => {
    if (!supabaseClient) return;
    setLoadingLeaderboard(true);
    
    try {
      // Get all staff users
      const { data: staffUsers, error: staffError } = await supabaseClient
        .from('staff_users')
        .select('id, username, email');
      if (staffError) {
        showPopup({ type: 'fetchError', subText: 'Failed to fetch staff users for leaderboard: ' + staffError.message });
        setLoadingLeaderboard(false);
        return;
      }

      // Get all resources
      const { data: resources, error: resError } = await supabaseClient
        .from('resources')
        .select('contributor_email, approved');
      if (resError) {
        showPopup({ type: 'fetchError', subText: 'Failed to fetch resources for leaderboard: ' + resError.message });
        setLoadingLeaderboard(false);
        return;
      }

      // Get all community resource requests
      const { data: communityRequests, error: commError } = await supabaseClient
        .from('community_resource_requests')
        .select('contributor_email, approved');
      if (commError) {
        showPopup({ type: 'fetchError', subText: 'Failed to fetch community requests for leaderboard: ' + commError.message });
        setLoadingLeaderboard(false);
        return;
      }

      // Count uploads and approvals per user
      const stats = staffUsers.map(user => {
        // Count regular resource uploads
        const resourceUploads = resources.filter(r => r.contributor_email === user.username);
        const resourceApproved = resourceUploads.filter(r => r.approved === "Approved").length;
        
        // Count community resource requests (match by email)
        const communityUploads = communityRequests.filter(r => r.contributor_email === user.email);
        const communityApproved = communityUploads.filter(r => r.approved === "Approved").length;
        
        return {
          username: user.username,
          email: user.email,
          uploads: resourceUploads.length + communityUploads.length,
          approved: resourceApproved + communityApproved,
          resourceUploads: resourceUploads.length,
          communityUploads: communityUploads.length,
          resourceApproved,
          communityApproved
        };
      });

      // Sort by approved desc, then uploads desc
      stats.sort((a, b) => b.uploads - a.uploads || b.approved - a.approved);
      setLeaderboard(stats);
      setLoadingLeaderboard(false);
    } catch (error) {
      showPopup({ type: 'fetchError', subText: 'Failed to fetch leaderboard data: ' + error.message });
      setLoadingLeaderboard(false);
    }
  };

  // Fetch leaderboard when tab is selected
  useEffect(() => {
    if (activeTab === 'leaderboard') fetchLeaderboard();
    // eslint-disable-next-line
  }, [activeTab, supabaseClient]);

  // Fetch moderation data when filters change or tab is selected
  useEffect(() => {
    if (activeTab !== 'moderation') return;
    if (!supabaseClient) return;
    setModLoading(true);
    let query;
    if (modType === 'resource') {
      query = supabaseClient.from('resources').select('*');
    } 
    // Filter by subject
    if (modSubject) {
      // Find all subject IDs with this name
      const subjectIds = subjects.filter(s => s.name === modSubject).map(s => s.id);
      if (subjectIds.length > 0) query = query.in('subject_id', subjectIds);
      else query = query.eq('subject_id', ''); // No results
    }
    // Filter by qualification
    if (modQualification) {
      const filteredSubjects = subjects.filter(s => s.syllabus_type === modQualification);
      const subjectIds = filteredSubjects.map(s => s.id);
      if (subjectIds.length > 0) query = query.in('subject_id', subjectIds);
      else query = query.eq('subject_id', ''); // No results
    }
    query.order(modType === 'resource' ? 'submitted_at' : 'submitted_at', { ascending: false }).then(({ data, error }) => {
      setModResults(data || []);
      setModLoading(false);
      if (error) {
        showPopup({ type: 'fetchError', subText: `Failed to fetch moderation data: ${error.message}` });
      }
    });
  }, [modType, modSubject, modQualification, activeTab, supabaseClient, subjects]);

  // Find the selected subject to get its units for the past paper unit code dropdown
  const currentSelectedSubject = subjects.find(s => s.id === selectedSubjectId);
  const unitsForSelectedSubject = currentSelectedSubject?.units || [];

  // NEW: User Management Functions
  const handleNewUserChange = (e) => {
    const { name, value } = e.target;
    setNewUserData(prev => ({ ...prev, [name]: value }));
  };

  const handleAddStaffUser = async (e) => {
    e.preventDefault();
    setUserActionLoading(true);
  
    const { username, email, password, role } = newUserData;
  
    if (!username || !email || !password || !role) {
      showPopup({ type: 'validationError', subText: 'All fields are required to add a user.' });
      setUserActionLoading(false);
      return;
    }
  
    try {
      // Make a fetch request to your new backend API route
      // For Next.js App Router at src/app/api/staff-users/route.js, the path is simply /api/staff-users
      const response = await fetch('/api/staff-users', { // <-- **THIS LINE IS CHANGED**
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, email, password, role }), // Send plain password to backend
      });
  
      const result = await response.json(); // Parse the JSON response from your API
  
      if (response.ok) { // Check if the HTTP status is 2xx (success)
        showPopup({ type: 'approveSuccess', subText: result.message || 'User added successfully!' });
        setNewUserData({ username: '', email: '', password: '', role: 'moderator' }); // Reset form
        fetchStaffUsers(); // Refresh the user list in the UI
      }
      }
    } catch (error) {
      // Handle network errors or other unexpected issues
      console.error('Error adding staff user:', error);
      showPopup({ type: 'fetchError', subText: `An unexpected error occurred: ${error.message}` });
    } finally {
      setUserActionLoading(false); // Always stop loading, regardless of success or failure
    }
  };
  

  const handleUpdateStaffUserRole = async (e) => {
    e.preventDefault();
    setUserActionLoading(true);
    if (!supabaseClient) {
      showPopup({ type: 'fetchError', subText: 'Supabase client not initialized.' });
      setUserActionLoading(false);
      return;
    }
    if (!selectedUserIdForUpdate || !selectedUserNewRole) {
      showPopup({ type: 'validationError', subText: 'Please select a user and a new role.' });
      setUserActionLoading(false);
      return;
    }

    const { error } = await supabaseClient.from('staff_users').update({
      role: selectedUserNewRole
    }).eq('id', selectedUserIdForUpdate);

    if (error) {
      showPopup({ type: 'fetchError', subText: `Failed to update user role: ${error.message}` });
    }
      setSelectedUserIdForUpdate('');
      setSelectedUserNewRole('moderator');
      fetchStaffUsers(); // Refresh the user list
    }
    setUserActionLoading(false);
  };

  const handleRemoveStaffUser = async (e) => {
    e.preventDefault();
    setUserActionLoading(true);
    if (!supabaseClient) {
      showPopup({ type: 'fetchError', subText: 'Supabase client not initialized.' });
      setUserActionLoading(false);
      return;
    }
    if (!selectedUserIdForRemove) {
      showPopup({ type: 'validationError', subText: 'Please select a user to remove.' });
      setUserActionLoading(false);
      return;
    }

    // Confirm deletion
    if (!window.confirm('Are you sure you want to permanently remove this user? This action cannot be undone.')) {
      setUserActionLoading(false);
      return;
    }

    const { error } = await supabaseClient.from('staff_users').delete().eq('id', selectedUserIdForRemove);

    if (error) {
      showPopup({ type: 'fetchError', subText: `Failed to remove user: ${error.message}` });
    }
      setSelectedUserIdForRemove('');
      fetchStaffUsers(); // Refresh the user list
    }
    setUserActionLoading(false);
  };

  // Fetch moderation data when filters change or tab is selected
  useEffect(() => {
    if (activeTab !== 'moderation') return;
    if (!supabaseClient) return;
    setModLoading(true);

    let query;
    if (modType === 'resource') {
      query = supabaseClient.from('resources').select('*');
    } 

    if (modStaffUser) {
      const selectedStaffUser = staffUsers.find(user => user.username === modStaffUser);
      if (selectedStaffUser) {
        query = query.eq('contributor_email', selectedStaffUser.email);
      }
    }

    if (modSubject) {
      const subjectIds = subjects.filter(s => s.name === modSubject).map(s => s.id);
      if (subjectIds.length > 0) query = query.in('subject_id', subjectIds);
      else query = query.eq('subject_id', '');
    }

    if (modQualification) {
      const filteredSubjects = subjects.filter(s => s.syllabus_type === modQualification);
      const subjectIds = filteredSubjects.map(s => s.id);
      if (subjectIds.length > 0) query = query.in('subject_id', subjectIds);
      else query = query.eq('subject_id', '');
    }

    query.order('submitted_at', { ascending: false }).then(({ data, error }) => {
      setModResults(data || []);
      setModLoading(false);
      if (error) {
        showPopup({ type: 'fetchError', subText: `Failed to fetch moderation data: ${error.message}` });
      }
    });

    if (modKeyword) {
      const regexSearch = `(?<![a-zA-Z0-9])${modKeyword}(?![a-zA-Z0-9])`;
      query = query.or(`title.ilike.%${modKeyword}%,description.ilike.%${modKeyword}%`);
    }

    query.order('submitted_at', { ascending: false }).then(({ data, error }) => {
      setModResults(data || []);
      setModLoading(false);
      if (error) {
        showPopup({ type: 'fetchError', subText: `Failed to fetch moderation data: ${error.message}` });
      }
    });
  }, [modType, modSubject, modQualification, modStaffUser, modKeyword, activeTab, supabaseClient, subjects, staffUsers]);

  return (
    <div className={`pt-20 ${staffUser === null ? "h-screen":"min-h-screen h-fit "} bg-blue-100 p-6 flex justify-center items-center`} style={{ fontFamily: 'Poppins, sans-serif' }}>
      <div className="h-fit bg-white rounded-xl shadow-lg w-full max-w-5xl mx-auto p-4 sm:p-6">
        {staffUser === null ? (
          <form onSubmit={handleLogin} className="space-y-4">
            <h2 className="text-2xl font-bold mb-2 text-blue-700 flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#1447e6"><path d="M185-80q-17 0-29.5-12.5T143-122v-105q0-90 56-159t144-88q-40 28-62 70.5T259-312v190q0 11 3 22t10 20h-87Zm147 0q-17 0-29.5-12.5T290-122v-190q0-70 49.5-119T459-480h189q70 0 119 49t49 119v64q0 70-49 119T648-80H332Zm148-484q-66 0-112-46t-46-112q0-66 46-112t112-46q66 0 112 46t46 112q0 66-46 112t-112 46Z"/></svg>
              Admin Login
            </h2>
            <input type="email" value={loginEmail} onChange={(e) => setLoginEmail(e.target.value)} placeholder="Staff Email" className="w-full border p-2 rounded-md focus:ring-2 focus:ring-blue-300 focus:border-blue-500 transition" required />
            <input type="password" value={loginPassword} onChange={(e) => setLoginPassword(e.target.value)} placeholder="Password" className="w-full border p-2 rounded-md focus:ring-2 focus:ring-blue-300 focus:border-blue-500 transition" required />
            <button type="submit" className="cursor-pointer w-full bg-blue-600 hover:bg-blue-700 transition text-white py-2 rounded-lg flex items-center justify-center gap-2">{loginLoading ? <svg className="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" /></svg> : <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>} {loginLoading ? 'Logging in...' : 'Login'}</button>
          </form>
        ) : (
          <>
            <div className="border-b mb-4 sm:text-base text-xs grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 sm:px-1 w-full">
                <button onClick={() => setActiveTab('upload')} className={`cursor-pointer py-2 px-4 flex items-center gap-1 rounded-t-lg ${activeTab === 'upload' ? 'border-b-2 border-blue-600 font-semibold text-blue-700 bg-blue-50' : 'text-gray-500 hover:text-blue-600'}`}><svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M7 10l5 5m0 0l5-5m-5 5V4" /></svg>Upload</button>
                <button onClick={() => setActiveTab('past_papers')} className={`cursor-pointer py-2 px-4 flex items-center gap-1 rounded-t-lg ${activeTab === 'past_papers' ? 'border-b-2 border-blue-600 font-semibold text-blue-700 bg-blue-50' : 'text-gray-500 hover:text-blue-600'}`}>
                    <svg xmlns="http://www.w3.org/2000/svg" height="20px" viewBox="0 -960 960 960" width="20px" fill="currentColor"><path d="M288-168v-432q0-30.08 21-51.04T360-672h432q29.7 0 50.85 21.15Q864-629.7 864-600v312L672-96H360q-29.7 0-50.85-21.15Q288-138.3 288-168ZM98-703q-5-29 12.5-54t46.5-30l425-76q29-5 53.5 12.5T665-804l11 60h-73l-9-48-425 76 47 263v228q-16-7-27.5-21.08Q177-260.16 174-278L98-703Zm262 103v432h264v-168h168v-264H360Zm216 216Z"/></svg>
                    Past Papers
                </button>
                <button onClick={() => setActiveTab('approve')} className={`cursor-pointer py-2 px-4 flex items-center gap-1 rounded-t-lg ${activeTab === 'approve' ? 'border-b-2 border-blue-600 font-semibold text-blue-700 bg-blue-50' : 'text-gray-500 hover:text-blue-600'}`}><svg xmlns="http://www.w3.org/2000/svg" height="20px" viewBox="0 -960 960 960" width="20px" fill="currentColor"><path d="M263.72-96Q234-96 213-117.15T192-168v-384q0-29.7 21.15-50.85Q234.3-624 264-624h24v-96q0-79.68 56.23-135.84 56.22-56.16 136-56.16Q560-912 616-855.84q56 56.16 56 135.84v96h24q29.7 0 50.85 21.15Q768-581.7 768-552v384q0 29.7-21.16 50.85Q725.68-96 695.96-96H263.72Zm.28-72h432v-384H264v384Zm216.21-120Q510-288 531-309.21t21-51Q552-390 530.79-411t-51-21Q450-432 429-410.79t-21 51Q408-330 429.21-309t51 21ZM360-624h240v-96q0-50-35-85t-85-35q-50 0-85 35t-35 85v96Zm-96 456v-384 384Z"/></svg>Approve</button>
                <button onClick={() => setActiveTab('under_review')} className={`cursor-pointer py-2 px-4 flex items-center justify-start gap-1 rounded-t-lg ${activeTab === 'under_review' ? 'border-b-2 border-blue-600 font-semibold text-blue-700 bg-blue-50' : 'text-gray-500 hover:text-blue-600'}`}>
                  <svg xmlns="http://www.w3.org/2000/svg" height="20px" viewBox="0 -960 960 960" width="20px" fill="currentColor">
                    <path d="M360-600v-72h336v72H360Zm0 120v-72h336v72H360Zm144 312H216h288Zm0 72H240q-40 0-68-28t-28-68v-144h96v-528h576v361q-20 1-38 7t-34 19v-315H312v456h289l-72 72H216v72q0 10.2 6.9 17.1 6.9 6.9 17.1 6.9h264v72Zm72 0v-113l210-209q7.26-7.41 16.13-10.71Q811-432 819.76-432q9.55 0 18.31 3.5Q846.83-425 854-418l44 45q6.59 7.26 10.29 16.13Q912-348 912-339.24t-3.29 17.92q-3.3 9.15-10.71 16.32L689-96H576Zm288-243-45-45 45 45ZM624-144h45l115-115-22-23-22-22-116 115v45Zm138-138-22-22 44 45-22-23Z"/>
                  </svg>
                  Under Review
                </button>
                <button onClick={() => setActiveTab('subjects')} className={`cursor-pointer py-2 px-4 flex items-center gap-1 rounded-t-lg ${activeTab === 'subjects' ? 'border-b-2 border-blue-600 font-semibold text-blue-700 bg-blue-50' : 'text-gray-500 hover:text-blue-600'}`}><svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg>Add Subject</button>
                <button onClick={() => setActiveTab('leaderboard')} className={`cursor-pointer py-2 px-4 flex items-center gap-1 rounded-t-lg ${activeTab === 'leaderboard' ? 'border-b-2 border-blue-600 font-semibold text-blue-700 bg-blue-50' : 'text-gray-500 hover:text-blue-600'}`}><svg xmlns="http://www.w3.org/2000/svg" height="20px" viewBox="0 -960 960 960" width="20px" fill="currentColor"><path d="m290-96-50-50 264-264 144 144 213-214 51 51-264 264-144-144L290-96Zm-122-48q-30 0-51-21.15T96-216v-528q0-29 21.5-50.5T168-816h528q29 0 50.5 21.5T768-744v160H168v440Zm0-512h528v-88H168v88Zm0 0v-88 88Z"/></svg>Leaderboard</button>
                <button onClick={() => setActiveTab('moderation')} className={`cursor-pointer py-2 px-4 flex items-center gap-1 rounded-t-lg ${activeTab === 'moderation' ? 'border-b-2 border-blue-600 font-semibold text-blue-700 bg-blue-50' : 'text-gray-500 hover:text-blue-600'}`}><svg xmlns="http://www.w3.org/2000/svg" height="20px" viewBox="0 -960 960 960" width="20px" fill="currentColor"><path d="m376-336 104-79 104 79-40-128 104-82H521.07L480-672l-41.07 126H312l104 82-40 128ZM480-96q-135-33-223.5-152.84Q168-368.69 168-515v-229l312-120 312 120v229q0 146.31-88.5 266.16Q615-129 480-96Zm0-75q104-32.25 172-129t68-215v-180l-240-92-240 92v180q0 118.25 68 215t172 129Zm0-308Z"/></svg>Moderation View</button>
                {/* NEW: User Management Tab Button */}
                <button onClick={() => setActiveTab('users')} className={`cursor-pointer py-2 px-4 flex items-center gap-1 rounded-t-lg ${activeTab === 'users' ? 'border-b-2 border-blue-600 font-semibold text-blue-700 bg-blue-50' : 'text-gray-500 hover:text-blue-600'}`}>
                    <svg xmlns="http://www.w3.org/2000/svg" height="20px" viewBox="0 -960 960 960" width="20px" fill="currentColor"><path d="M480-480q-60 0-102-42t-42-102q0-60 42-102t102-42q60 0 102 42t42 102q0 60-42 102t-102 42ZM192-192v-96q0-23 12.5-43.5T239-366q55-32 116.29-49 61.29-17 124.5-17t124.71 17Q666-398 721-366q22 13 34.5 34t12.5 44v96H192Zm72-72h432v-24q0-5.18-3.03-9.41-3.02-4.24-7.97-6.59-46-28-98-42t-107-14q-55 0-107 14t-98 42q-5 4-8 7.72-3 3.73-3 8.28v24Zm216.21-288Q510-552 531-573.21t21-51Q552-654 530.79-675t-51-21Q450-696 429-674.79t-21 51Q408-594 429.21-573t51 21Zm-.21-72Zm0 360Z"/></svg>
                    User Management
                </button>
            </div>
            {/* Removed the old message display div */}
            {activeTab === 'upload' && (
              <>
                <form onSubmit={handleSubmit} className="space-y-4 bg-blue-50 p-4 rounded-2xl border border-blue-100">
                  <div className="space-y-2">
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
                      }  onChange={(e) => setUnitChapter(e.target.value)} placeholder="Unit/Chapter (optional)" className="w-full border p-2 rounded-md focus:ring-2 focus:ring-blue-300 focus:border-blue-500 transition" />
                        );
                      }
                    })()}
                    <span className="text-xs text-gray-500">Paste any URL format (www.abc.com, abc.com, https://www.abc.com, etc.):</span>
                    <input type="text" value={link} onChange={(e) => setLink(e.target.value)} placeholder="Link *" className="w-full border p-2 rounded-md focus:ring-2 focus:ring-blue-300 focus:border-blue-500 transition" required />
                    <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Description (optional)" className="min-h-[100px] w-full border p-2 rounded-md focus:ring-2 focus:ring-blue-300 focus:border-blue-500 transition"></textarea>
                  </div>
                  <div className="flex flex-col md:flex-row gap-2">
                    <select value={resourceType} onChange={(e) => setResourceType(e.target.value)} className="cursor-pointer w-full border p-2 rounded-md focus:ring-2 focus:ring-blue-300 focus:border-blue-500 transition">
                      {resourceCategories.map((cat) => (
                        <option key={cat.value} value={cat.value}>{cat.label}</option>
                      ))}
                    </select>
                    <select value={selectedSubjectId} onChange={(e) => setSelectedSubjectId(e.target.value)} className="cursor-pointer w-full border p-2 rounded-md focus:ring-2 focus:ring-blue-300 focus:border-blue-500 transition">
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
                  </div>
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

            {/* NEW: Past Papers Tab Content */}
            {activeTab === 'past_papers' && (
              <>
                <form onSubmit={handlePaperSubmit} className="space-y-4 bg-blue-50 p-4 rounded-2xl border border-blue-100">
                  <h3 className="text-xl font-semibold text-blue-700 mb-4">Upload Past Paper</h3>
                  <div className="flex flex-col md:flex-row gap-2">
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
                    <select value={selectedExamSessionId} onChange={(e) => setSelectedExamSessionId(e.target.value)} className="cursor-pointer w-full border p-2 rounded-md focus:ring-2 focus:ring-blue-300 focus:border-blue-500 transition" required disabled={loadingExamSessions}>
                      <option value="">{loadingExamSessions ? 'Loading Exam Sessions...' : 'Select Exam Session *'}</option>
                      {examSessions.map((session) => (
                        <option key={session.id} value={session.id}>
                          {session.session} {session.year} {/* CORRECTED: Display session and year */}
                        </option>
                      ))}
                    </select>
                  </div>
                  {/* Unit Code input - can be a dropdown if subjects have units, otherwise a text input */}
                  {(() => {
                    const selectedSubject = subjects.find(sub => sub.id === selectedSubjectId);
                    const units = selectedSubject?.units || [];
                    if (Array.isArray(units) && units.length > 0) {
                      return (
                        <select value={unitCode} onChange={e => setUnitCode(e.target.value)} className="cursor-pointer w-full border p-2 rounded-md focus:ring-2 focus:ring-blue-300 focus:border-blue-500 transition" required>
                          <option value="">Select Unit Code *</option>
                          {units.map((unit, idx) => (
                            <option key={unit.code || unit.name || idx} value={unit.code}>{unit.unit ? `${unit.unit} - ${unit.name} (${unit.code})` : `${unit.name} (${unit.code})`}</option>
                          ))}
                          {/* Option for subjects without specific units, if applicable for past papers */}
                          {/* <option value="General">General</option> */}
                        </select>
                      );
                    }  onChange={(e) => setUnitCode(e.target.value)} placeholder="Unit Code (e.g., WAC11) *" className="w-full border p-2 rounded-md focus:ring-2 focus:ring-blue-300 focus:border-blue-500 transition" required />
                      );
                    }
                  })()}

                  <span className="text-xs text-gray-500">Paste any URL format (www.abc.com, abc.com, https://www.abc.com, etc.):</span>
                  <input type="text" value={questionPaperLink} onChange={(e) => setQuestionPaperLink(e.target.value)} placeholder="Question Paper Link *" className="w-full border p-2 rounded-md focus:ring-2 focus:ring-blue-300 focus:border-blue-500 transition" required />
                  <input type="text" value={markSchemeLink} onChange={(e) => setMarkSchemeLink(e.target.value)} placeholder="Mark Scheme Link (optional)" className="w-full border p-2 rounded-md focus:ring-2 focus:ring-blue-300 focus:border-blue-500 transition" />
                  <input type="text" value={examinerReportLink} onChange={(e) => setExaminerReportLink(e.target.value)} placeholder="Examiner Report Link (optional)" className="w-full border p-2 rounded-md focus:ring-2 focus:ring-blue-300 focus:border-blue-500 transition" />
                  <button type="submit" className="cursor-pointer w-full bg-blue-600 hover:bg-blue-700 transition text-white py-2 rounded-lg flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed" disabled={pastPaperSubmitLoading}>
                    {pastPaperSubmitLoading ? (
                      <svg className="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" /></svg>
                    ) : (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M7 10l5 5m0 0l5-5m-5 5V4" /></svg>
                    )}
                    {pastPaperSubmitLoading ? 'Submitting...' : 'Upload Past Paper'}
                  </button>
                </form>
              </>
            )}

            {activeTab === 'approve' && (
              <>
                <div className="w-full flex flex-col items-center divide-y divide-blue-100">
                  {unapprovedResources.length === 0 && <div className="text-gray-500 text-sm py-4">No pending resources 🎉</div>}
                  {UnapprovedpageLoading === true ?  <LoaderCircle className="animate-spin stroke-[#1A69FA]"/> : unapprovedResources.map((res) => {
                    const subject = subjects.find(sub => sub.id === res.subject_id);
                    const approvalStatus = getApprovalStatus(res.approved);
                    return (
                      <div key={res.id} className="w-full bg-gray-50 p-4 rounded-lg mb-3 flex flex-col gap-2">
                        <div className="w-full">
                          <p className="font-bold text-blue-800 text-lg mb-1">{res.title}</p>
                          <p className="text-sm text-gray-600 mb-1">{res.description}</p>
                          <a href={res.link} className="text-blue-500 underline text-sm break-all" target="_blank" rel="noopener noreferrer">{res.link}</a>
                          <div className="mt-2 mb-2 grid grid-cols-1 md:grid-cols-2 gap-2 text-xs text-gray-700">
                            <div><span className="font-semibold">Added by:</span> {res.contributor_email || 'Unknown'}</div>
                            <div><span className="font-semibold">Subject:</span> {subject ? `${subject.name} (${subject.code}) - ${subject.syllabus_type}` : 'Unknown'}</div>
                            <div><span className="font-semibold">Suggested on:</span> {res.submitted_at ? new Date(res.submitted_at).toLocaleString() : 'Unknown'}</div>
                            <div><span className="font-semibold">Status:</span> <span className={`font-semibold px-2 py-1 rounded text-xs ${approvalStatus.bgColor} ${approvalStatus.color}`}>{approvalStatus.text}</span></div>
                          </div>
                          <div className='flex justify-start gap-2 text-xs mb-2'>
                            <div className="cursor-pointer w-fit px-4 py-0.5 text-green-400 ring ring-green-400 rounded-md hover:bg-green-400 hover:text-white transition-colors">{res.unit_chapter_name}</div>
                            <div className="cursor-pointer w-fit px-4 py-0.5 text-orange-400 uppercase ring ring-orange-400 rounded-md hover:bg-orange-400 hover:text-white transition-colors">{res.resource_type}</div>
                          </div>
                        </div>
                        
                        {/* Action Buttons */}
                        <div className="flex flex-wrap gap-2">
                          <button onClick={() => approveResource(res.id)} className="cursor-pointer bg-green-500 hover:bg-green-600 transition text-white px-3 py-1 rounded-md flex items-center gap-1">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                            </svg>
                            Approve
                          </button>
                          <button onClick={() => rejectResource(res.id)} className="cursor-pointer bg-orange-500 hover:bg-orange-600 transition text-white px-3 py-1 rounded-md flex items-center gap-1">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                            Reject
                          </button>
                          <button onClick={() => openEditResource(res)} className="cursor-pointer bg-yellow-400 hover:bg-yellow-500 transition text-white px-3 py-1 rounded-md flex items-center gap-1">
                            <svg xmlns="http://www.w3.org/2000/svg" height="20px" viewBox="0 -960 960 960" width="20px" fill="#FFFFFF">
                              <path d="M192-396v-72h288v72H192Zm0-150v-72h432v72H192Zm0-150v-72h432v72H192Zm336 504v-113l210-209q7.26-7.41 16.13-10.71Q763-528 771.76-528q9.55 0 18.31 3.5Q798.83-521 806-514l44 45q6.59 7.26 10.29 16.13Q864-444 864-435.24t-3.29 17.92q-3.3 9.15-10.71 16.32L641-192H528Zm288-243-45-45 45 45ZM576-240h45l115-115-22-23-22-22-116 115v45Zm138-138-22-22 44 45-22-23Z"/>
                            </svg>
                            Edit
                          </button>
                          
                          {/* Watermark Button */}
                          <button 
                            onClick={() => handleWatermark(res)} 
                            disabled={watermarkLoading[res.id]} 
                            className={`cursor-pointer bg-blue-500 hover:bg-blue-600 transition text-white px-3 py-1 rounded-md flex items-center gap-1 ${watermarkLoading[res.id] ? 'opacity-50 cursor-not-allowed' : ''}`}
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                            </svg>
                            {watermarkLoading[res.id] ? 'Watermarking...' : 'Watermark'}
                          </button>
                          
                          <button onClick={() => deleteResource(res.id)} className="cursor-pointer bg-red-500 hover:bg-red-600 transition text-white px-3 py-1 rounded-md flex items-center gap-1">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                            Delete
                          </button>
                        </div>

                        {/* Watermark Success Indicator */}
                        {watermarkedFiles[res.id] && (
                          <div className="text-green-600 text-xs mt-2 w-full">
                            {Array.isArray(watermarkedFiles[res.id]) && watermarkedFiles[res.id].length > 0
                              ? watermarkedFiles[res.id].map((name, idx) => (
                                  <div key={idx}>✅ Watermarked {name}</div>
                                ))
                              : <div>✅ Watermarked {watermarkedFiles[res.id]}</div>}
                          </div>
                        )}
                      </div>
                    );
                  })}
                  <div className="w-full inline-flex justify-between items-center gap-2 mt-2">
                    <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" onClick={() => {setUnapprovedPage(prev => prev-1)}} className={`cursor-pointer fill-[#0C58E4] ${Unapprovedpage <= 1 ? "hidden": "inline-block"}`} viewBox="0 0 256 256"><path d="M128,24A104,104,0,1,0,232,128,104.11,104.11,0,0,0,128,24Zm0,192a88,88,0,1,1,88-88A88.1,88.1,0,0,1,128,216Zm48-88a8,8,0,0,1-8,8H107.31l18.35,18.34a8,8,0,0,1-11.32,11.32l-32-32a8,8,0,0,1,0-11.32l32-32a8,8,0,0,1,11.32,11.32L107.31,120H168A8,8,0,0,1,176,128Z"></path></svg>
                    <p className="text-[#0C58E4] text-md">Page: {Unapprovedpage}{Math.floor(Unapprovedtotal/10) === 0 ? "":`/${Math.floor(Unapprovedtotal/10)}`}</p>
                    <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" onClick={() => {setUnapprovedPage(prev => prev+1)}} className={`cursor-pointer fill-[#0C58E4] ${Unapprovedpage === Math.floor(Unapprovedtotal/10) || Math.floor(Unapprovedtotal/10) === 0 ? "hidden": "inline-block"}`} viewBox="0 0 256 256"><path d="M128,24A104,104,0,1,0,232,128,104.11,104.11,0,0,0,128,24Zm0,192a88,88,0,1,1,88-88A88.1,88.1,0,0,1,128,216Zm45.66-93.66a8,8,0,0,1,0,11.32l-32,32a8,8,0,0,1-11.32-11.32L148.69,136H88a8,8,0,0,1,0-16h60.69l-18.35-18.34a8,8,0,0,1,11.32-11.32Z"></path></svg>
                  </div>
                </div>
              </>
            )}
            {activeTab === 'subjects' && (
              <>
                <form onSubmit={handleAddSubject} className="space-y-4 bg-blue-50 p-4 rounded-2xl border border-blue-100">
                  <input type="text" value={newSubjectName} onChange={(e) => setNewSubjectName(e.target.value)} placeholder="Subject Name *" className="w-full border p-2 rounded-md focus:ring-2 focus:ring-blue-300 focus:border-blue-500 transition" required />
                  <input type="text" value={newSubjectCode} onChange={(e) => setNewSubjectCode(e.target.value)} placeholder="Subject Code *" className="w-full border p-2 rounded-md focus:ring-2 focus:ring-blue-300 focus:border-blue-500 transition" required />
                  <input type="text" value={newSubjectType} onChange={(e) => setNewSubjectType(e.target.value)} placeholder="Syllabus Type *" className="w-full border p-2 rounded-md focus:ring-2 focus:ring-blue-300 focus:border-blue-500 transition" required />
                  <span className="text-xs text-gray-500">e.g. IAL, IGCSE, etc.</span>
                  {/* Add Units Section */}
                  <div className="bg-white border border-blue-200 rounded-lg p-2 mt-2">
                    <h4 className="font-semibold text-blue-700 mb-2 text-base">Add Units for Subject</h4>
                    <div className="flex flex-col sm:flex-row gap-3 mb-2 items-center">
                      <input type="text" value={newUnitNumber} onChange={e => setNewUnitNumber(e.target.value)} placeholder="Unit No (Unit 1)" className="text-sm text-gray-500 border p-2 rounded w-full sm:w-1/5" />
                      <input type="text" value={newUnitName} onChange={e => setNewUnitName(e.target.value)} placeholder="Unit Name" className="text-sm text-gray-500 border p-2 rounded w-full sm:w-2/5" />
                      <input type="text" value={newUnitCode} onChange={e => setNewUnitCode(e.target.value)} placeholder="Code (WPH11)" className="text-sm text-gray-500 border p-2 rounded w-full sm:w-1/5" />
                      <button type="button" onClick={handleAddUnit} className="cursor-pointer bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded text-sm whitespace-nowrap w-full sm:w-fit">Add</button>
                    </div>
                    {newUnits.length > 0 && (
                      <ul className="list-disc pl-5 mt-2 space-y-1">
                        {newUnits.map((unit, idx) => (
                          <li key={idx} className="flex items-center gap-2 text-sm mb-1">
                            <span className="font-semibold">{unit.unit}</span>: {unit.name} <span className="text-gray-400">({unit.code})</span>
                            <button type="button" onClick={() => handleRemoveUnit(idx)} className="cursor-pointer ml-2 text-red-500 hover:text-red-700 text-xs">Remove</button>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                  <button type="submit" className="cursor-pointer w-full bg-green-600 hover:bg-green-700 transition text-white py-2 rounded-lg flex items-center justify-center gap-2"><svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg>Add Subject</button>
                </form>
              </>
            )}
            {activeTab === 'leaderboard' && (
              <>
                {loadingLeaderboard ? (
                  <div className="text-gray-500 text-sm py-4"><LoaderCircle className="animate-spin stroke-[#1A69FA]"/></div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="min-w-full bg-white border border-blue-200 rounded-lg">
                      <thead>
                        <tr className="bg-blue-50">
                          <th className="px-4 py-2 text-left text-blue-700 font-semibold">#</th>
                          <th className="px-4 py-2 text-left text-blue-700 font-semibold">Username</th>
                          <th className="px-4 py-2 text-left text-blue-700 font-semibold">Email</th>
                          <th className="px-4 py-2 text-left text-blue-700 font-semibold">Resources Uploaded</th>
                          <th className="px-4 py-2 text-left text-blue-700 font-semibold">Resources Approved</th>
                        </tr>
                      </thead>
                      <tbody>
                        {leaderboard.map((user, idx) => (
                          <tr key={user.username} className={idx === 0 ? 'bg-yellow-100 font-bold' : ''}>
                            <td className="px-4 py-2">{idx + 1}</td>
                            <td className="px-4 py-2">{user.username}</td>
                            <td className="px-4 py-2">{user.email}</td>
                            <td className="px-4 py-2">{user.uploads}</td>
                            <td className="px-4 py-2">{user.approved}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </>
            )}
            {activeTab === 'moderation' && (
              <>
                <div className="mb-4 flex flex-wrap gap-3 items-center">
                  <select value={modType} onChange={e => setModType(e.target.value)} className="cursor-pointer border p-2 rounded-md">
                    <option value="community">Community Notes</option>
                    <option value="resource">Eduvance Resource</option>
                  </select>
                  <select value={modSubject} onChange={e => setModSubject(e.target.value)} className="cursor-pointer border p-2 rounded-md">
                    <option value="">All Subjects</option>
                    {[...new Set(subjects.map(sub => sub.name))].map(name => (
                      <option key={name} value={name}>{name}</option>
                    ))}
                  </select>
                  <select value={modQualification} onChange={e => setModQualification(e.target.value)} className="cursor-pointer border p-2 rounded-md">
                    <option value="">All Qualifications</option>
                    {[...new Set(subjects.map(s => s.syllabus_type))].map(q => (
                      <option key={q} value={q}>{q}</option>
                    ))}
                  </select>
                  <div className="flex flex-col flex-grow">
                    <select
                      value={modStaffUser}
                      onChange={(e) => setModStaffUser(e.target.value)}
                      className="cursor-pointer border p-2 rounded-md"
                    >
                      <option value="">All Staff</option>
                      {staffUsers.map((user) => (
                        <option key={user.id} value={user.username}>{user.username}</option>
                      ))}
                    </select>
                  </div>
                  <div className="flex flex-col flex-grow">
                    <label className="text-sm font-semibold text-gray-700">Keyword Search</label>
                    <input
                      type="text"
                      value={modKeyword}
                      onChange={(e) => setModKeyword(e.target.value)}
                      placeholder="e.g. 'linear algebra' or 'trigonometry'"
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50 transition"
                    />
                  </div>
                </div>
                {modLoading ? (
                  <div className="text-gray-500 text-sm py-4"><LoaderCircle className="animate-spin stroke-[#1A69FA]"/></div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {modResults.length === 0 && <div className="text-gray-500 text-sm col-span-full">No results found.</div>}
                    {modResults.map((item) => {
                      const subject = subjects.find(sub => sub.id === item.subject_id);
                      const approvalStatus = getApprovalStatus(item.approved);
                      return (
                        <div key={item.id} className="bg-blue-50 border border-blue-200 rounded-lg pb-10 p-4 shadow-sm flex flex-col gap-2 relative">
                          <div className="font-bold text-blue-800 text-lg mb-1">{item.title}</div>
                          <div className="text-sm text-gray-600 mb-1">{item.description}</div>
                          <a href={item.link} className="text-blue-500 underline text-sm break-all" target="_blank" rel="noopener noreferrer">{item.link}</a>
                          <div className="grid grid-cols-2 gap-2 text-xs text-gray-700 mt-2">
                            <div><span className="font-semibold">Subject:</span> {subject ? `${subject.name} (${subject.code}) - ${subject.syllabus_type}` : 'Unknown'}</div>
                            <div><span className="font-semibold">Unit/Chapter:</span> {item.unit_chapter_name || 'General'}</div>
                            <div><span className="font-semibold">Type:</span> {item.resource_type}</div>
                            {modType === 'resource' ? (
                              <>
                                <div><span className="font-semibold">Uploaded by:</span> {item.contributor_email || 'Unknown'}</div>
                                <div><span className="font-semibold">Created at:</span> {item.submitted_at ? new Date(item.submitted_at).toLocaleString() : 'Unknown'}</div>
                                <div><span className="font-semibold">Status:</span> <span className={`font-semibold px-2 py-1 rounded text-xs ${approvalStatus.bgColor} ${approvalStatus.color}`}>{approvalStatus.text}</span></div>
                              </>
                            ) : (
                              <>
                                <div><span className="font-semibold">Contributor:</span> {item.contributor_name} ({item.contributor_email})</div>
                                <div><span className="font-semibold">Submitted at:</span> {item.submitted_at ? new Date(item.submitted_at).toLocaleString() : 'Unknown'}</div>
                                <div><span className="font-semibold">Likes:</span> {item.like_count || 0} &nbsp; <span className="font-semibold">Dislikes:</span> {item.dislike_count || 0}</div>
                                <div><span className="font-semibold">Approved:</span> {item.is_approved ? 'Yes' : 'No'}</div>
                                {item.rejection_reason && <div><span className="font-semibold">Rejection Reason:</span> {item.rejection_reason}</div>}
                              </>
                            )}
                          </div>
                          <div className="flex gap-2 m-2 absolute bottom-0 right-0">
                            <button onClick={() => handleModEdit(item)} className="cursor-pointer bg-yellow-400 hover:bg-yellow-500 text-white px-3 py-1 rounded text-xs">Edit</button>
                            <button onClick={() => handleModDelete(item)} className="cursor-pointer bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-xs">Delete</button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </>
            )}
            {/* Unit/Chapter dropdown or input for edit modal */}
            {showEditModal && (
              <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-xs animate-fade-in bg-black/10">
                <div className="bg-white rounded-2xl p-6 w-full max-w-lg relative shadow-2xl">
                  <button onClick={closeEditResource} className="cursor-pointer absolute top-2 right-2 text-gray-400 hover:text-red-500 text-xl">&times;</button>
                  <h3 className="text-lg font-semibold mb-4 text-blue-700">Edit Resource</h3>
                  <div className="space-y-3">
                    <input name="title" value={editForm.title} onChange={handleEditFormChange} placeholder="Title" className="w-full border p-2 rounded-md focus:ring-2 focus:ring-blue-300 focus:border-blue-500 transition" />
                    {/* Unit/Chapter dropdown or input for edit modal */}
                    {(() => {
                      const selectedSubject = subjects.find(sub => sub.id === editForm.subject_id);
                      const units = selectedSubject?.units || [];
                      if (Array.isArray(units) && units.length > 0) {
                        return (
                          <select name="unit_chapter_name" value={editForm.unit_chapter_name} onChange={handleEditFormChange} className="cursor-pointer w-full border p-2 rounded-md focus:ring-2 focus:ring-blue-300 focus:border-blue-500 transition">
                            <option value="">Select Unit/Chapter (optional)</option>
                            {units.map((unit, idx) => (
                              <option key={unit.code || unit.name || idx} value={unit.unit || unit.name}>{unit.unit ? `${unit.unit} - ${unit.name}` : unit.name}</option>
                            ))}
                            <option value="General">General</option>
                          </select>
                        );
                      }  onChange={handleEditFormChange} placeholder="Unit/Chapter (optional)" className="w-full border p-2 rounded-md focus:ring-2 focus:ring-blue-300 focus:border-blue-500 transition" />
                        );
                      }
                    })()}
                    <input name="link" value={editForm.link} onChange={handleEditFormChange} placeholder="Link" className="w-full border p-2 rounded-md focus:ring-2 focus:ring-blue-300 focus:border-blue-500 transition" />
                    <textarea name="description" value={editForm.description} onChange={handleEditFormChange} placeholder="Description (optional)" className="min-h-[100px] w-full border p-2 rounded-md focus:ring-2 focus:ring-blue-300 focus:border-blue-500 transition"></textarea>
                    <select name="resource_type" value={editForm.resource_type} onChange={handleEditFormChange} className="cursor-pointer w-full p-2 rounded-md focus:ring-2 focus:ring-blue-300 focus:border-blue-500 transition">
                      {resourceCategories.map((cat) => (
                        <option key={cat.value} value={cat.value}>{cat.label}</option>
                      ))}
                    </select>
                    <select name="subject_id" value={editForm.subject_id} onChange={handleEditFormChange} className="cursor-pointer w-full p-2 rounded-md focus:ring-2 focus:ring-blue-300 focus:border-blue-500 transition">
                      {subjects.map((sub) => (
                        <option key={sub.id} value={sub.id}>{sub.name} ({sub.code}) - {sub.syllabus_type}</option>
                      ))}
                    </select>
                    <select name="approved" value={editForm.approved} onChange={handleEditFormChange} className="cursor-pointer w-full p-2 rounded-md focus:ring-2 focus:ring-blue-300 focus:border-blue-500 transition">
                      <option value="Approved">Approved</option>
                      <option value="Pending">Pending</option>
                      <option value="Unapproved">Unapproved</option>
                    </select>
                      <button onClick={saveEditResource} disabled={editLoading} className="cursor-pointer w-full bg-blue-600 hover:bg-blue-700 transition text-white py-2 rounded-lg flex items-center justify-center gap-2 mt-2">{editLoading ? 'Saving...' : 'Save Changes'}</button>
                  </div>
                </div>
              </div>
            )}
            {/* Moderation Edit Modal */}
            {modEditItem && (
              <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-xs animate-fade-in bg-black/10">
                <div className="bg-white rounded-2xl m-10 p-6 w-full h-[90vh] overflow-y-scroll overscroll-none overflow-x-hidden max-w-lg relative shadow-2xl">
                  <button onClick={() => setModEditItem(null)} className="cursor-pointer absolute top-2 right-2 text-gray-400 hover:text-red-500 text-xl">&times;</button>
                  <h3 className="text-lg font-semibold mb-4 text-blue-700">Edit {modType === 'resource' ? 'Resource' : 'Community Note'}</h3>
                  <div className="space-y-3">
                    <h4 className="text-blue-600 font-semibold text-base mb-2 mt-2">Main Info</h4>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                    <input name="title" value={modEditForm.title || ''} onChange={handleModEditFormChange} placeholder="Title" className="w-full border p-2 rounded-md focus:ring-2 focus:ring-blue-300 focus:border-blue-500 transition" />
                    <label className="block text-sm font-medium text-gray-700 mb-1 mt-2">Description</label>
                    <input name="description" value={modEditForm.description || ''} onChange={handleModEditFormChange} placeholder="Description" className="w-full border p-2 rounded-md focus:ring-2 focus:ring-blue-300 focus:border-blue-500 transition" />
                    <label className="block text-sm font-medium text-gray-700 mb-1 mt-2">Link</label>
                    <input name="link" value={modEditForm.link || ''} onChange={handleModEditFormChange} placeholder="Link" className="w-full border p-2 rounded-md focus:ring-2 focus:ring-blue-300 focus:border-blue-500 transition" />
                    <label className="block text-sm font-medium text-gray-700 mb-1 mt-2">Unit/Chapter</label>
                    <input name="unit_chapter_name" value={modEditForm.unit_chapter_name || ''} onChange={handleModEditFormChange} placeholder="Unit/Chapter" className="w-full border p-2 rounded-md focus:ring-2 focus:ring-blue-300 focus:border-blue-500 transition" />
                    <label className="block text-sm font-medium text-gray-700 mb-1 mt-2">Type</label>
                    <input name="resource_type" value={modEditForm.resource_type || ''} onChange={handleModEditFormChange} placeholder="Type" className="w-full border p-2 rounded-md focus:ring-2 focus:ring-blue-300 focus:border-blue-500 transition" />
                    {modType === 'resource' && (
                      <>
                        <label className="block text-sm font-medium text-gray-700 mb-1 mt-2">Approval Status</label>
                        <select name="approved" value={modEditForm.approved || 'Pending'} onChange={handleModEditFormChange} className="cursor-pointer w-full border p-2 rounded-md focus:ring-2 focus:ring-blue-300 focus:border-blue-500 transition">
                          <option value="Approved">Approved</option>
                          <option value="Pending">Pending</option>
                          <option value="Unapproved">Unapproved</option>
                        </select>
                      </>
                    )}
                    {modType === 'community' && (
                      <>
                        <h4 className="text-blue-600 font-semibold text-base mb-2 mt-4">Contributor Info</h4>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Contributor Name</label>
                        <input name="contributor_name" value={modEditForm.contributor_name || ''} onChange={handleModEditFormChange} placeholder="Contributor Name" className="w-full border p-2 rounded-md focus:ring-2 focus:ring-blue-300 focus:border-blue-500 transition" />
                        <label className="block text-sm font-medium text-gray-700 mb-1 mt-2">Contributor Email</label>
                        <input name="contributor_email" value={modEditForm.contributor_email || ''} onChange={handleModEditFormChange} placeholder="Contributor Email" className="w-full border p-2 rounded-md focus:ring-2 focus:ring-blue-300 focus:border-blue-500 transition" />
                        <label className="block text-sm font-medium text-gray-700 mb-1 mt-2">Rejection Reason</label>
                        <input name="rejection_reason" value={modEditForm.rejection_reason || ''} onChange={handleModEditFormChange} placeholder="Rejection Reason" className="w-full border p-2 rounded-md focus:ring-2 focus:ring-blue-300 focus:border-blue-500 transition" />
                      </>
                    )}
                    <button onClick={saveModEdit} disabled={modEditLoading} className="cursor-pointer w-full bg-blue-600 hover:bg-blue-700 transition text-white py-2 rounded-lg flex items-center justify-center gap-2 mt-2">{modEditLoading ? 'Saving...' : 'Save Changes'}</button>
                  </div>
                </div>
              </div>
            )}
            {activeTab === 'under_review' && (
              <>
                <div className="flex flex-col items-center divide-y divide-blue-100">
                  {pendingResources.length === 0 && <div className="text-gray-500 text-sm py-4">No pending reviews 🎉</div>}
                  {pageLoading === true ? <LoaderCircle className="animate-spin stroke-[#1A69FA]"/>: pendingResources.map((res) => (
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
                                } 
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
                            <button onClick={() => approveResource_Under(res.id)} className="cursor-pointer bg-green-500 hover:bg-green-600 transition text-white px-3 py-1 rounded-md flex items-center gap-1"><svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>Approve</button>
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
                        <button onClick={() => rejectResource_Under(res.id)} className="cursor-pointer bg-red-500 hover:bg-red-600 transition text-white px-3 py-1 rounded-md flex items-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed" disabled={!rejectionReasons[res.id]}><svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>Reject</button>
                      </div>
                    </div>
                  ))}
                  <div className="w-full inline-flex justify-between items-center gap-2 mt-2">
                    <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" onClick={() => {setPage(prev => prev-1)}} className={`cursor-pointer fill-[#0C58E4] ${page <= 1 ? "hidden": "inline-block"}`} viewBox="0 0 256 256"><path d="M128,24A104,104,0,1,0,232,128,104.11,104.11,0,0,0,128,24Zm0,192a88,88,0,1,1,88-88A88.1,88.1,0,0,1,128,216Zm48-88a8,8,0,0,1-8,8H107.31l18.35,18.34a8,8,0,0,1-11.32,11.32l-32-32a8,8,0,0,1,0-11.32l32-32a8,8,0,0,1,11.32,11.32L107.31,120H168A8,8,0,0,1,176,128Z"></path></svg>
                    <p className="text-[#0C58E4] text-md">Page: {page}{Math.floor(total/10) === 0 ? "" : `/${Math.floor(total/10)}`}</p>
                    <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" onClick={() => {setPage(prev => prev+1)}} className={`cursor-pointer fill-[#0C58E4] ${page === Math.floor(total/10) ||  Math.floor(total/10) === 0 ? "hidden": "inline-block"}`} viewBox="0 0 256 256"><path d="M128,24A104,104,0,1,0,232,128,104.11,104.11,0,0,0,128,24Zm0,192a88,88,0,1,1,88-88A88.1,88.1,0,0,1,128,216Zm45.66-93.66a8,8,0,0,1,0,11.32l-32,32a8,8,0,0,1-11.32-11.32L148.69,136H88a8,8,0,0,1,0-16h60.69l-18.35-18.34a8,8,0,0,1,11.32-11.32Z"></path></svg>
                  </div>
                </div>
              </>
            )}

            {/* NEW: User Management Tab Content */}
            {activeTab === 'users' && (
              <>
                <div className="space-y-6">
                  {/* Add New User Section */}
                  <div className="bg-blue-50 p-4 rounded-2xl border border-blue-100">
                    <h3 className="text-xl font-semibold text-blue-700 mb-4">Add New Staff User</h3>
                    <form onSubmit={handleAddStaffUser} className="space-y-3">
                      <div>
                        <label htmlFor="newUserUsername" className="block text-sm font-medium text-gray-700">Username</label>
                        <input
                          type="text"
                          id="newUserUsername"
                          name="username"
                          value={newUserData.username}
                          onChange={handleNewUserChange}
                          className="w-full border p-2 rounded-md focus:ring-2 focus:ring-blue-300 focus:border-blue-500 transition"
                          required
                        />
                      </div>
                      <div>
                        <label htmlFor="newUserEmail" className="block text-sm font-medium text-gray-700">Email</label>
                        <input
                          type="email"
                          id="newUserEmail"
                          name="email"
                          value={newUserData.email}
                          onChange={handleNewUserChange}
                          className="w-full border p-2 rounded-md focus:ring-2 focus:ring-blue-300 focus:border-blue-500 transition"
                          required
                        />
                      </div>
                      <div>
                        <label htmlFor="newUserPassword" className="block text-sm font-medium text-gray-700">Password</label>
                        <input
                          type="password"
                          id="newUserPassword"
                          name="password"
                          value={newUserData.password}
                          onChange={handleNewUserChange}
                          className="w-full border p-2 rounded-md focus:ring-2 focus:ring-blue-300 focus:border-blue-500 transition"
                          required
                        />
                      </div>
                      <div>
                        <label htmlFor="newUserRole" className="block text-sm font-medium text-gray-700">Role</label>
                        <select
                          id="newUserRole"
                          name="role"
                          value={newUserData.role}
                          onChange={handleNewUserChange}
                          className="cursor-pointer w-full border p-2 rounded-md focus:ring-2 focus:ring-blue-300 focus:border-blue-500 transition"
                        >
                          <option value="moderator">Moderator</option>
                          <option value="admin">Admin</option>
                          <option value="editor">Editor</option>
                          <option value="viewer">Viewer</option>
                        </select>
                      </div>
                      <button type="submit" className="cursor-pointer w-full bg-blue-600 hover:bg-blue-700 transition text-white py-2 rounded-lg flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed" disabled={userActionLoading}>
                        {userActionLoading ? (
                          <svg className="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" /></svg>
                        ) : (
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg>
                        )}
                        {userActionLoading ? 'Adding User...' : 'Add User'}
                      </button>
                    </form>
                  </div>

                  {/* Update User Role Section */}
                  <div className="bg-blue-50 p-4 rounded-2xl border border-blue-100">
                    <h3 className="text-xl font-semibold text-blue-700 mb-4">Update Staff User Role</h3>
                    <form onSubmit={handleUpdateStaffUserRole} className="space-y-3">
                      <div>
                        <label htmlFor="updateUserSelect" className="block text-sm font-medium text-gray-700">Select User</label>
                        <select
                          id="updateUserSelect"
                          value={selectedUserIdForUpdate}
                          onChange={(e) => setSelectedUserIdForUpdate(e.target.value)}
                          className="cursor-pointer w-full border p-2 rounded-md focus:ring-2 focus:ring-blue-300 focus:border-blue-500 transition"
                          required
                        >
                          <option value="">Select a user</option>
                          {staffUsers.map(user => (
                            <option key={user.id} value={user.id}>{user.username} ({user.email})</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label htmlFor="updateUserRole" className="block text-sm font-medium text-gray-700">New Role</label>
                        <select
                          id="updateUserRole"
                          value={selectedUserNewRole}
                          onChange={(e) => setSelectedUserNewRole(e.target.value)}
                          className="cursor-pointer w-full border p-2 rounded-md focus:ring-2 focus:ring-blue-300 focus:border-blue-500 transition"
                        >
                          <option value="moderator">Moderator</option>
                          <option value="admin">Admin</option>
                          <option value="editor">Editor</option>
                          <option value="viewer">Viewer</option>
                        </select>
                      </div>
                      <button type="submit" className="cursor-pointer w-full bg-green-600 hover:bg-green-700 transition text-white py-2 rounded-lg flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed" disabled={userActionLoading}>
                        {userActionLoading ? (
                          <svg className="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" /></svg>
                        ) : (
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                        )}
                        {userActionLoading ? 'Updating Role...' : 'Update Role'}
                      </button>
                    </form>
                  </div>

                  {/* Remove User Section */}
                  <div className="bg-blue-50 p-4 rounded-2xl border border-blue-100">
                    <h3 className="text-xl font-semibold text-blue-700 mb-4">Remove Staff User</h3>
                    <form onSubmit={handleRemoveStaffUser} className="space-y-3">
                      <div>
                        <label htmlFor="removeUserSelect" className="block text-sm font-medium text-gray-700">Select User</label>
                        <select
                          id="removeUserSelect"
                          value={selectedUserIdForRemove}
                          onChange={(e) => setSelectedUserIdForRemove(e.target.value)}
                          className="cursor-pointer w-full border p-2 rounded-md focus:ring-2 focus:ring-blue-300 focus:border-blue-500 transition"
                          required
                        >
                          <option value="">Select a user</option>
                          {staffUsers.map(user => (
                            <option key={user.id} value={user.id}>{user.username} ({user.email})</option>
                          ))}
                        </select>
                      </div>
                      <button type="submit" className="cursor-pointer w-full bg-red-600 hover:bg-red-700 transition text-white py-2 rounded-lg flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed" disabled={userActionLoading}>
                        {userActionLoading ? (
                          <svg className="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" /></svg>
                        ) : (
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                        )}
                        {userActionLoading ? 'Removing User...' : 'Remove User'}
                      </button>
                    </form>
                  </div>

                  {/* Current Staff Users List */}
                  <div className="bg-blue-50 p-4 rounded-2xl border border-blue-100">
                    <h3 className="text-xl font-semibold text-blue-700 mb-4">Current Staff Users</h3>
                    {loadingStaffUsers ? (
                      <div className="text-gray-500 text-sm py-4"><LoaderCircle className="animate-spin stroke-[#1A69FA]"/></div>
                    ) : (
                      <div className="overflow-x-auto">
                        <table className="min-w-full bg-white border border-blue-200 rounded-lg">
                          <thead>
                            <tr className="bg-blue-50">
                              <th className="px-4 py-2 text-left text-blue-700 font-semibold">Username</th>
                              <th className="px-4 py-2 text-left text-blue-700 font-semibold">Email</th>
                              <th className="px-4 py-2 text-left text-blue-700 font-semibold">Role</th>
                              <th className="px-4 py-2 text-left text-blue-700 font-semibold">Created At</th>
                            </tr>
                          </thead>
                          <tbody>
                            {staffUsers.length === 0 ? (
                              <tr>
                                <td colSpan="4" className="px-4 py-2 text-center text-gray-500">No staff users found.</td>
                              </tr>
                            ) : (
                              staffUsers.map(user => (
                                <tr key={user.id} className="border-t border-blue-100">
                                  <td className="px-4 py-2">{user.username}</td>
                                  <td className="px-4 py-2">{user.email}</td>
                                  <td className="px-4 py-2 capitalize">{user.role}</td>
                                  <td className="px-4 py-2">{new Date(user.created_at).toLocaleDateString()}</td>
                                </tr>
                              ))
                            )}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                </div>
              </>
            )}
            {latestResources.length > 0 && (
              <div className="mt-8">
                <h2 className="text-xl font-semibold text-blue-700 mb-2 flex items-center gap-2"><svg xmlns="http://www.w3.org/2000/svg" height="20px" viewBox="0 -960 960 960" width="20px" fill="currentColor"><path d="M263.72-96Q234-96 213-117.15T192-168v-384q0-29.7 21.15-50.85Q234.3-624 264-624h24v-96q0-79.68 56.23-135.84 56.22-56.16 136-56.16Q560-912 616-855.84q56 56.16 56 135.84v96h24q29.7 0 50.85 21.15Q768-581.7 768-552v384q0 29.7-21.16 50.85Q725.68-96 695.96-96H263.72Zm.28-72h432v-384H264v384Zm216.21-120Q510-288 531-309.21t21-51Q552-390 530.79-411t-51-21Q450-432 429-410.79t-21 51Q408-330 429.21-309t51 21ZM360-624h240v-96q0-50-35-85t-85-35q-50 0-85 35t-35 85v96Zm-96 456v-384 384Z"/></svg>Latest Resources</h2>
                <div className="divide-y divide-blue-100">
                  {latestResources.map((res) => {
                    const subject = subjects.find(sub => sub.id === res.subject_id);
                    const approvalStatus = getApprovalStatus(res.approved);
                    return (
                      <div key={res.id} className="bg-gray-50 p-4 rounded-lg mb-3 flex flex-col md:flex-row md:items-center md:justify-between gap-2">
                        <div className="w-full">
                          <p className="font-bold text-blue-800 text-lg mb-1">{res.title}</p>
                          <p className="text-sm text-gray-600 mb-1">{res.description}</p>
                          <a href={res.link} className="text-blue-500 underline text-sm break-all" target="_blank" rel="noopener noreferrer">{res.link}</a>
                          <div className="mt-2 mb-2 grid grid-cols-1 md:grid-cols-2 gap-2 text-xs text-gray-700">
                            <div><span className="font-semibold">Added by:</span> {res.contributor_email || 'Unknown'}</div>
                            <div><span className="font-semibold">Subject:</span> {subject ? `${subject.name} (${subject.code}) - ${subject.syllabus_type}` : 'Unknown'}</div>
                            <div><span className="font-semibold">Suggested on:</span> {res.submitted_at ? new Date(res.submitted_at).toLocaleString() : 'Unknown'}</div>
                            <div><span className="font-semibold">Status:</span> <span className={`font-semibold px-2 py-1 rounded text-xs ${approvalStatus.bgColor} ${approvalStatus.color}`}>{approvalStatus.text}</span></div>
                            <div><span className="font-semibold">Last updated:</span> {res.updated_at ? new Date(res.updated_at).toLocaleString() : 'Unknown'}</div>
                          </div>
                          <div className='flex justify-start gap-2 text-xs'>
                            <div className="cursor-pointer w-fit px-4 py-0.5 text-green-400 ring ring-green-400 rounded-md hover:bg-green-400 hover:text-white transition-colors">{res.unit_chapter_name}</div>
                            <div className="cursor-pointer w-fit px-4 py-0.5 text-orange-400 uppercase ring ring-orange-400 rounded-md hover:bg-orange-400 hover:text-white transition-colors">{res.resource_type}</div>
                          </div>
                        </div>
                        <div className="flex space-x-2 sm:mt-2 md:mt-0">
                          <button onClick={() => openEditResource(res)} className="cursor-pointer bg-yellow-400 hover:bg-yellow-500 transition text-white px-3 py-1 rounded-md flex items-center gap-1"><svg xmlns="http://www.w3.org/2000/svg" height="20px" viewBox="0 -960 960 960" width="20px" fill="#FFFFFF"><path d="M192-396v-72h288v72H192Zm0-150v-72h432v72H192Zm0-150v-72h432v72H192Zm336 504v-113l210-209q7.26-7.41 16.13-10.71Q763-528 771.76-528q9.55 0 18.31 3.5Q798.83-521 806-514l44 45q6.59 7.26 10.29 16.13Q864-444 864-435.24t-3.29 17.92q-3.3 9.15-10.71 16.32L641-192H528Zm288-243-45-45 45 45ZM576-240h45l115-115-22-23-22-22-116 115v45Zm138-138-22-22 44 45-22-23Z"/></svg>Edit</button>
                          <button onClick={() => deleteApprovedResource(res.id)} className="cursor-pointer bg-red-500 hover:bg-red-600 transition text-white px-3 py-1 rounded-md flex items-center gap-1"><svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>Delete</button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
