import { supabase } from '@/lib/supabaseClient';
"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { useReloadOnStuckLoading } from '@/utils/reloadOnStuckLoading';

// Remove: import { useRouter } from 'next/router';
import SmallFoot from '@/components/smallFoot.jsx';

// At the top, define variables for subjectName, syllabusType, and examCode
const subjectName = 'Computer Science';
const subjectSlug = subjectName.toLowerCase().replace(/\s+/g, '-');
const examCode = '4CP0';

// Add SubjectButtons component that fetches subjects dynamically
const SubjectButtons = () => {
  const [subjects, setSubjects] = useState([]);

  useEffect(() => {
    async function fetchSubjects() {
      const { data, error } = await supabase
        .from('subjects')
        .select('name')
        .order('name', { ascending: true })
        .eq('syllabus_type', 'IAL');
      if (!error && data) {
        setSubjects(data.map(subj => subj.name));
      }
    }
    fetchSubjects();
  }, []);

  return (
    <div className="flex flex-wrap gap-2 mb-6">
      {subjects.map((name, index) => {
        const slug = name.toLowerCase().replace(/\s+/g, '-');
        return (
          <Link key={index} href={`/subjects/${slug}/IAL/communityNotes`}>
            <button className="px-4 py-2 cursor-pointer bg-blue-600 text-white rounded-lg hover:bg-blue-500 transition">
              {name}
            </button>
          </Link>
        );
      })}
    </div>
  );
};

export default function IALResources() {
  const [units, setUnits] = useState([]);
  const [expandedUnits, setExpandedUnits] = useState({});
  const [unitResources, setUnitResources] = useState({});
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useReloadOnStuckLoading(loading);

  const toggleUnit = (unit) => {
    setExpandedUnits(prev => ({
      ...prev,
      [unit]: !prev[unit]
    }));
  };

  // Fetch units from subject table
  useEffect(() => {
    const fetchUnits = async () => {
      const { data: subjectData, error: subjectError } = await supabase
        .from('subjects')
        .select('units')
        .eq('name', subjectName)
        .eq('syllabus_type', 'IAL')
        .single();
      if (subjectError || !subjectData) {
        setError(subjectError || new Error(`Subject not found:`, subjectName));;
        return;
      }
      let fetchedUnits = subjectData.units || [];
      // Sort by unit number if possible, fallback to name
      fetchedUnits.sort((a, b) => {
        const getUnitNum = (u) => {
          const match = (u.unit || '').match(/Unit\s*(\d+)/i);
          return match ? parseInt(match[1], 10) : Number.MAX_SAFE_INTEGER;
        };
        const numA = getUnitNum(a);
        const numB = getUnitNum(b);
        if (numA !== numB) return numA - numB;
        return (a.name || '').localeCompare(b.name || '');
      });
      setUnits(fetchedUnits);
      setExpandedUnits(fetchedUnits.reduce((acc, unit) => {
        acc[unit.unit] = false;
        return acc;
      }, {}));
    };
    fetchUnits();
  }, []);

  // Updated fetchResources function with better error handling and debugging
  useEffect(() => {
    setLoading(true);
    const fetchResources = async () => {
      try {
        const { data: subjectData, error: subjectError } = await supabase
          .from('subjects')
          .select('id')
          .eq('name', subjectName)
          .eq('syllabus_type', 'IAL')
          .single();

        if (subjectError || !subjectData) {
          console.error('Subject fetch error:', subjectError);
          setError(subjectError || new Error(`Subject not found:`, subjectName));;
          setLoading(false);
          return;
        }

        const subjectId = subjectData.id;
        console.log('Fetching resources for subject ID:', subjectId);

        const { data: resources, error: resourcesError } = await supabase
          .from('community_resource_requests')
          .select('*')
          .eq('subject_id', subjectId)
          .eq('approved', 'Approved') // This ensures only approved resources are fetched
          .order('unit_chapter_name', { ascending: true }) // Order by unit first
          .order('resource_type', { ascending: true })     // Then by resource type
          .order('title', { ascending: true });            // Finally by title

        if (resourcesError) {
          console.error('Resources fetch error:', resourcesError);
          setError(resourcesError);
          setLoading(false);
          return;
        }

        console.log('Fetched approved resources:', resources?.length || 0);

        const groupedResources = {};

        resources?.forEach((resource) => {
          // Use unit_chapter_name if available, otherwise fallback to 'General'
          const unit = resource.unit_chapter_name || 'General';

          if (!groupedResources[unit]) {
            groupedResources[unit] = [];
          }

          // Find existing group for this resource type or create new one
          let group = groupedResources[unit].find((grp) => grp.heading === resource.resource_type);
          if (!group) {
            group = { heading: resource.resource_type, links: [] };
            groupedResources[unit].push(group);
          }

          group.links.push({
            name: resource.title,
            url: resource.link,
            description: resource.description,
            contributor: resource.contributor_name || resource.uploaded_by_username, // Use contributor_name from table
            last: resource.updated_at || resource.submitted_at, // Fallback to submitted_at if updated_at is null
            approvedAt: resource.approved_at // Include approval date for reference
          });
        });

        console.log('Grouped resources:', groupedResources);
        setUnitResources(groupedResources);
        setLoading(false);
      } catch (error) {
        console.error('Unexpected error:', error);
        setError(error);
        setLoading(false);
      }
    };
    fetchResources();
  }, []);

  if (error) {
    return (
      <main className="min-h-screen bg-white flex items-center justify-center">
        <p className="text-xl text-red-600">Error loading resources: {error.message}</p>
      </main>
    );
  }
  const[tag, setTag] = useState(null)
  function handleTag(event){
    event.stopPropagation(); 
    event.preventDefault(); 
    if(tag === null){
      setTag(event.currentTarget.innerHTML) 
    }
    else{
      setTag(null)
    }
  }

  useEffect(() => {
    if (Object.keys(unitResources).length > 0) {
      setExpandedUnits(prev => {
        const newExpandedUnits = { ...prev };
        
        // Only expand units that have resources
        Object.keys(unitResources).forEach(unitName => {
          if (unitResources[unitName] && unitResources[unitName].length > 0) {
            newExpandedUnits[unitName] = true;
          }
        });
        
        return newExpandedUnits;
      });
    }
  }, [unitResources]); // This runs after unitResources is populated
  
  return (
    <>
      <main className="min-h-screen bg-white flex flex-col items-center justify-start py-10 m-10">
        <div className="w-full max-w-5xl px-4">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-[#000000] mb-8 text-left tracking-[-0.035em]" style={{ fontFamily: "Poppins, sans-serif" }}>
            IAL <span className="bg-[#1A69FA] px-2 py-1 -rotate-1 inline-block"><span className="text-[#FFFFFF]">Computer Science</span></span> Community Notes
          </h1>

          <div className="inline-flex items-center justify-center px-4 py-2 mb-8 rounded-md" style={{ border: "1.5px solid #DBDBDB", fontFamily: "Poppins, sans-serif" }}>
            <span className="text-md font-medium text-black tracking-tight">
              <span className="font-[501]">Exam code:</span> 4CP0
            </span>
          </div>

          <h3 className="text-sm sm:text-md lg:text-lg font-[500] leading-6 text-[#707070] mb-8 text-left max-w-4xl tracking-[-0.015em]" style={{ fontFamily: "Poppins, sans-serif" }}>
            Access a wide range of Edexcel IAL Computer Science resources—all in one place. Whether you're brushing up on concepts or aiming to master exam strategies, these materials are designed to support your revision and boost your performance
          </h3>

          <div className="w-full mb-8">
            <h2 className="text-xl font-[550] tracking-tight text-[#000000] mb-4 text-left">
              Other Community Notes
            </h2>
            <SubjectButtons />
          </div>

          {/* General Resources */}
          {unitResources["General"] && (
            <div className="bg-white rounded-lg shadow-md mb-8 border border-gray-200 overflow-hidden">
              <div className="bg-gray-200 text-black tracking-tight p-4 text-left font-bold text-xl sm:text-2xl"
                  style={{ fontFamily: "Poppins, sans-serif" }}>  
                General Resources
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
                {unitResources["General"].map((resourceGroup, groupIndex) => (
                  resourceGroup.links.map((link, linkIndex) => (
                    <Link key={groupIndex + '-' + linkIndex} href={link.url} style={{ fontFamily: 'Poppins, sans-serif' }} className={`${tag === null ? "block" : tag === resourceGroup.heading ? "block":"hidden"}`}>
                      <div className="cursor-pointer flex flex-col p-5 border h-fit border-gray-200 rounded-2xl shadow-md bg-white hover:shadow-xl transition-shadow duration-200 group sm:min-h-[120px] sm:min-w-[300px]" style={{ position: 'relative' }}>
                        {/* <span className="text-sm font-semibold text-[#1A69FA] mb-1 tracking-tight uppercase" style={{ fontFamily: 'Poppins, sans-serif', letterSpacing: '0.04em' }}>{resourceGroup.heading}</span> */}
                        
                          <div className="inline-flex justify-between">
                            {link.name && (<p className="text-xl font-bold text-[#153064]">{link.name}</p>)}
                            <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                              <svg width="22" height="22" fill="none" stroke="#1A69FA" strokeWidth="2" viewBox="0 0 24 24"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                            </div>
                          </div>
                          {link.description && (
                            <p className="text-sm text-gray-600 mt-2 border-l-4 mb-2 border-blue-600 pl-2">{link.description}</p>
                          )}
                          <div className="flex flex-col justify-end items-end">
                            {resourceGroup.heading && (<div className={`cursor-pointer mt-1 text-xs font-semibold tracking-tight uppercase w-fit px-2 py-0.5 ring ring-green-400 rounded-md transition-colors ${tag === null ? "sm:hover:bg-green-400 sm:hover:text-white text-green-400" : tag === resourceGroup.heading ? "bg-green-400 text-white sm:hover:text-green-400 sm:hover:bg-white":"sm:hover:bg-green-400 sm:hover:text-white text-green-400"}`} onClick={handleTag}>{resourceGroup.heading}</div>)}
                            {link.last && (<p className="text-xs text-gray-600 mt-1 text-right">{link.contributor ? "Shared On ": "Shared On "}{new Date(link.last).toLocaleString(undefined, {year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit'})}</p>)}
                          </div>
                        
                      </div>
                    </Link>))
                ))}
              </div>
            </div>
          )}

          {/* Unit-Based Resources */}
          {units.map((unitData) => (
            <div key={unitData.unit} className="bg-white rounded-lg shadow-md mb-8 border border-gray-200 overflow-hidden">
              {/* Session Card styling, added overflow-hidden */}
              <div className="bg-[#2871F9] cursor-pointer text-white tracking-tight p-4 text-left font-bold text-xl sm:text-2xl"
                  style={{ fontFamily: "Poppins, sans-serif" }}
                  onClick={() => toggleUnit(unitData.unit)}>
                {unitData.name}
              </div>
              {expandedUnits[unitData.unit] && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 p-6">
                  {(unitResources[unitData.unit] || []).map((resourceGroup, groupIndex) => (
                    resourceGroup.links.map((link, linkIndex) => (
                      <Link key={groupIndex + '-' + linkIndex} href={link.url} style={{ fontFamily: 'Poppins, sans-serif' }} className={`${tag === null ? "block" : tag === resourceGroup.heading ? "block":"hidden"}`}>
                      <div className="cursor-pointer flex flex-col p-5 border h-fit border-gray-200 rounded-2xl shadow-md bg-white hover:shadow-xl transition-shadow duration-200 group sm:min-h-[120px] sm:min-w-[300px]" style={{ position: 'relative' }}>
                        {/* <span className="text-sm font-semibold text-[#1A69FA] mb-1 tracking-tight uppercase" style={{ fontFamily: 'Poppins, sans-serif', letterSpacing: '0.04em' }}>{resourceGroup.heading}</span> */}
                        
                          <div className="inline-flex justify-between">
                            {link.name && (<p className="text-xl font-bold text-[#153064]">{link.name}</p>)}
                            <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                              <svg width="22" height="22" fill="none" stroke="#1A69FA" strokeWidth="2" viewBox="0 0 24 24"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                            </div>
                          </div>
                          {link.description && (
                            <p className="text-sm text-gray-600 mt-2 border-l-4 mb-2 border-blue-600 pl-2">{link.description}</p>
                          )}
                          <div className="flex flex-col justify-end items-end">
                            {resourceGroup.heading && (<div className={`cursor-pointer mt-1 text-xs font-semibold tracking-tight uppercase w-fit px-2 py-0.5 ring ring-green-400 rounded-md transition-colors ${tag === null ? "sm:hover:bg-green-400 sm:hover:text-white text-green-400" : tag === resourceGroup.heading ? "bg-green-400 text-white sm:hover:text-green-400 sm:hover:bg-white":"sm:hover:bg-green-400 sm:hover:text-white text-green-400"}`} onClick={handleTag}>{resourceGroup.heading}</div>)}
                            {link.last && (<p className="text-xs text-gray-600 mt-1 text-right">{link.contributor ? "Shared On ": "Shared On "}{new Date(link.last).toLocaleString(undefined, {year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit'})}</p>)}
                          </div>
                        
                      </div>
                    </Link>))
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </main>
      <SmallFoot />
    </>
  );
}