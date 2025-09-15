"use client";
import { useState, useEffect, use } from 'react';
import Link from 'next/link';
import { apiClient } from '@/lib/secure-api-client';
export default function Subject() {
  const [selected, setSelected] = useState('IGCSE');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [IALsubjects, setIALSubjects] = useState([]);
  const [IGCSEsubjects, setIGCSESubjects] = useState([]);
  useEffect(() => {
    supabase
      .from('subjects')
      .select('name')
      .eq('syllabus_type', "IAL")
      .order('name', { ascending: true })
      .then(({ data, error }) => {
        if (!error) {
          setIALSubjects([...new Set(data.map(item => item.name))]);
        }
      });
  }, []);
  useEffect(() => {
    supabase
      .from('subjects')
      .select('name')
      .eq('syllabus_type', "IGCSE")
      .order('name', { ascending: true })
      .then(({ data, error }) => {
        if (!error) {
          setIGCSESubjects([...new Set(data.map(item => item.name))]);
        }
      });
  }, []);
  
  useEffect(() => {
    const target = document.querySelector('.sidebarWheel');
    if (!target) return;

    const observer = new MutationObserver((mutationsList) => {
      for (const mutation of mutationsList) {
        if (
          mutation.type === 'attributes' &&
          mutation.attributeName === 'data-sidebar'
        ) {
          const value = target.getAttribute('data-sidebar');
          if(value === "open"){
            setSidebarOpen(true)
          }
          else{
            setSidebarOpen(false)
          }
        }
      }
    });

    observer.observe(target, { attributes: true, attributeFilter: ['data-sidebar'] });

    return () => observer.disconnect();
  }, []);

  return (
    <>
      {/* Main Content */}
      <div className={`transition-all duration-300 ${sidebarOpen ? 'sm:ml-70' : 'ml-0'}`}>
        <main className="flex flex-col w-full pb-5 relative">
          <div className={`flex flex-col items-center w-full pt-12 md:pt-9 relative transition-all duration-300 px-4 sm:px-6 md:px-8 lg:px-16 xl:px-24}`}>
            <h3 className="self-start font-semibold text-xl md:text-2xl text-[#0C58E4] tracking-[-1px] mb-4" style={{ fontFamily: 'Poppins, sans-serif' }}>
              Choose Your Exam Qualification
            </h3>
            {/* Selection Bar - Responsive width */}
            <div className="flex rounded-[15px] bg-[#F2F6FF] border-[#0C58E4] border-2 p-1 w-full h-[65px] justify-between mb-10">
              <button
                onClick={() => setSelected('IAL')}
                className={`cursor-pointer w-1/2 py-2 text-center rounded-[10px] transition-all ease-in-out duration-500 text-sm md:text-base lg:text-xl ${selected === 'IAL' ? 'bg-[#D0E0FF] shadow-md font-semibold tracking-[-0.75px]' : ''}`}
                style={{ fontFamily: 'Poppins, sans-serif' }}
              >
                IALs
              </button>
              <button
                onClick={() => setSelected('IGCSE')}
                className={`cursor-pointer w-1/2 py-2 text-center rounded-[10px] transition-all ease-in-out duration-500 text-sm md:text-base lg:text-xl ${selected === 'IGCSE' ? 'bg-[#D0E0FF] shadow-md font-semibold tracking-[-0.75px]' : 'bg transparent'}`}
                style={{ fontFamily: 'Poppins, sans-serif' }}
              >
                IGCSEs
              </button>
            </div>
            {/* Conditional content */}
            <div className="w-full transition-all duration-500 ease-in-out">
              {selected === "IAL" ? (
                <>
                  <h1 className="text-4xl font-semibold leading-[40px] tracking-tighter mb-2" style={{ fontFamily: 'Poppins, sans-serif' }}>
                    <span className="bg-[#0C58E4] text-white py-[1.5] px-1 -rotate-1 inline-block">IAL</span> Community Notes
                  </h1>
                  {/* Links like in Resources page */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 w-full">
                    {IALsubjects.map((subject) => (
                      <a key={subject.name} href={`/subjects/${subject.toLowerCase()}/IAL/communityNotes`}>
                        <div className={`${sidebarOpen ? "px-2" : "px-6"} cursor-pointer flex items-center justify-between w-full py-4 bg-[#BAD1FD] rounded-[12px] group hover:bg-[#A8C6FF] transition-all duration-200 border-[#153064] border-1`}>
                          <p
                            className="text-xl font-[550] text-[#153064]"
                            style={{ fontFamily: "Poppins, sans-serif" }}
                          >
                            {subject}
                          </p>
                          <img
                            src="/BArrowR.svg"
                            alt="Arrow Right"
                            className={`${sidebarOpen ? "opacity-0 w-0":"opacity-100 w-6"} h-auto group-hover:translate-x-1 transition-all duration-100`}
                          />
                        </div>
                      </a>
                    ))}
                  </div>
                </>
              ) : (
                <>
                  <h1 className="text-4xl font-semibold leading-[40px] tracking-tighter mb-2" style={{ fontFamily: 'Poppins, sans-serif' }}>
                    <span className="bg-[#0C58E4] text-white py-[1.5] px-1 -rotate-1 inline-block">IGCSE</span> Community Notes
                  </h1>
                  {/* Links like in Resources page */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 w-full">
                    {IGCSEsubjects.map((subject) => (
                      <a key={subject.name} href={`/subjects/${subject.toLowerCase()}/IGCSE/communityNotes`}>
                        <div className={`${sidebarOpen ? "px-2" : "px-6"} cursor-pointer flex items-center justify-between w-full py-4 bg-[#BAD1FD] rounded-[12px] group hover:bg-[#A8C6FF] transition-all duration-200 border-[#153064] border-1`}>
                          <p
                            className="text-xl font-[550] text-[#153064]"
                            style={{ fontFamily: "Poppins, sans-serif" }}
                          >
                            {subject}
                          </p>
                          <img
                            src="/BArrowR.svg"
                            alt="Arrow Right"
                            className={`${sidebarOpen ? "opacity-0 w-0":"opacity-100 w-6"} h-auto group-hover:translate-x-1 transition-all duration-100`}
                          />
                        </div>
                      </a>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>
        </main>
      </div>
    </>
  );
}