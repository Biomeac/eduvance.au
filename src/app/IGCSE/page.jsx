"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
// REMOVED: import { createClient } from '@supabase/supabase-js'; // Removed this line
import { supabase } from '@/lib/supabaseClient'; // Use the shared browser client
import SmallFoot from '@/components/smallFoot.jsx';
import { LoaderCircle } from "lucide-react";

// --- Utility Function: toKebabCase ---
// Place this function either here at the top, or in a shared utility file (e.g., utils/string.js)
const toKebabCase = (str) => {
  if (typeof str !== 'string') {
    console.warn('toKebabCase received non-string input:', str);
    return ''; // Return empty string or handle error as appropriate
  }
  return str
    .toLowerCase()
    .replace(/\s+/g, '-')   // Replace spaces with hyphens
    .replace(/[^\w-]+/g, '') // Remove all non-word chars except hyphens
    .replace(/--+/g, '-')   // Replace multiple hyphens with a single one
    .trim();                // Trim leading/trailing whitespace
};

// This component now simply receives subjects and renders buttons.
// The fetching logic is moved to the parent (IGCSEResources).
const SubjectButtons = ({ subjects }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 w-full">
      {subjects.map((name, index) => {
        const slug = toKebabCase(name); // Ensure slug is kebab-cased
        return (
          <Link key={index} href={`/subjects/${slug}?choice=option2`}>
            <div className="cursor-pointer flex items-center justify-between px-4 w-full py-4 bg-[#BAD1FD] rounded-[12px] group hover:bg-[#A8C6FF] transition-all duration-200 border-[#153064] border-1">
              <p
                className="text-xl font-[550] text-[#153064]"
                style={{ fontFamily: "Poppins, sans-serif" }}
              >
                {name}
              </p>
              <img
                src="/BArrowR.svg"
                alt="Arrow Right"
                className="w-6 h-auto group-hover:translate-x-1 transition-transform duration-200"
              />
            </div>
          </Link>
        );
      })}
    </div>
  );
};

export default function IGCSEResources() {
  const [subjects, setSubjects] = useState([]); // Moved here from SubjectButtons
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true); // Controls loading for the main subject list

  // Fetch subjects for IGCSE qualification
  useEffect(() => {
    async function fetchSubjectsData() {
      setLoading(true); // Start loading
      const { data, error: fetchError } = await supabase
        .from('subjects')
        .select('name')
        .order('name', { ascending: true })
        .eq('syllabus_type', 'IGCSE'); // Filter by IGCSE syllabus type

      if (fetchError) {
        console.error("Error fetching IGCSE subjects:", fetchError.message);
        setError(fetchError);
      } else if (data) {
        setSubjects(data.map(subj => subj.name));
      }
      setLoading(false); // End loading regardless of success/failure
    }
    fetchSubjectsData();
  }, []); // Empty dependency array means this runs once on mount

  if (error) {
    return (
      <main className="min-h-screen bg-white flex items-center justify-center">
        <p className="text-xl text-red-600">Error loading IGCSE subjects: {error.message}</p>
      </main>
    );
  }


  return (
    <div className='flex flex-col justify-between h-screen'>
      <main className="bg-white flex flex-col items-center justify-start py-10 m-10">
        <div className="w-full max-w-5xl px-4">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-[#000000] mb-8 text-left tracking-[-0.035em]" style={{ fontFamily: "Poppins, sans-serif" }}>
            Explore Edexcel <span className="bg-[#1A69FA] px-2 py-1 -rotate-1 inline-block"><span className="text-[#FFFFFF]">IGCSE</span></span> Subjects
          </h1>

          <div className="inline-flex items-center justify-center px-4 py-2 mb-8 rounded-md" style={{ border: "1.5px solid #DBDBDB", fontFamily: "Poppins, sans-serif" }}>
            <span className="text-md font-medium text-black tracking-[-0px]">
              <span className="font-[501]">Qualification:</span> IGCSE
            </span>
          </div>

          <h3 className="text-sm sm:text-md lg:text-lg font-[500] leading-6 text-[#707070] mb-8 text-left max-w-4xl tracking-[-0.020em]" style={{ fontFamily: "Poppins, sans-serif" }}>
            Access a wide range of Edexcel IGCSE resources—all in one place. Whether you're brushing up on concepts or aiming to master exam strategies, these materials are designed to support your revision and boost your performance
          </h3>

          {/* This component will now receive and display the IGCSE subject buttons */}
          {subjects.length > 0 ? (
            <SubjectButtons subjects={subjects} />
          ) : (
            <LoaderCircle className="animate-spin stroke-[#1A69FA]"/>
          )}

        </div>
      </main>
      <SmallFoot />
    </div>
  );
}