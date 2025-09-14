"use client";
import { useState, useEffect, use } from 'react';
import Link from 'next/link';
import {Home} from '@/components/homenav'
export default function Subject() {
  const [selected, setSelected] = useState('option1');
  const [sidebarOpen, setSidebarOpen] = useState(false);

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
      <Home dontShowload showExtra/>
      {/* Main Content */}
      <div className={`transition-all duration-300 ${sidebarOpen ? 'sm:ml-70' : 'ml-0'}`}>
        {/* Custom Banner Header */}
        <div
          className="w-full h-[250px] relative flex items-center bg-cover bg-right lg:bg-center bg-no-repeat transition-all duration-300"
          style={{ backgroundImage: "url('/Banner.svg')" }}
        >
          <h1 className="text-white font-grand-local text-xl md:text-7xl ml-17 tracking-[-1px]">
            Eduvance Study Tools
          </h1>
        </div>
        <main className="flex flex-col w-full pb-5 relative">
          <div className={`flex flex-col items-center w-full pt-12 md:pt-9 relative transition-all duration-300 px-4 sm:px-6 md:px-8 lg:px-16 xl:px-24}`}>
            <h3 className="self-start font-semibold text-xl md:text-2xl text-[#0C58E4] tracking-[-1px] mb-4" style={{ fontFamily: 'Poppins, sans-serif' }}>
              Choose Your Exam Qualification
            </h3>
            {/* Selection Bar - Responsive width */}
            <div className="flex rounded-[15px] bg-[#F2F6FF] border-[#0C58E4] border-2 p-1 w-full h-[65px] justify-between mb-10">
              <button
                onClick={() => setSelected('option1')}
                className={`cursor-pointer w-1/2 py-2 text-center rounded-[10px] transition-all ease-in-out duration-500 text-sm md:text-base lg:text-xl ${selected === 'option1' ? 'bg-[#D0E0FF] shadow-md font-semibold tracking-[-0.75px]' : ''}`}
                style={{ fontFamily: 'Poppins, sans-serif' }}
              >
                IALs
              </button>
              <button
                onClick={() => setSelected('option2')}
                className={`cursor-pointer w-1/2 py-2 text-center rounded-[10px] transition-all ease-in-out duration-500 text-sm md:text-base lg:text-xl ${selected === 'option2' ? 'bg-[#D0E0FF] shadow-md font-semibold tracking-[-0.75px]' : 'bg transparent'}`}
                style={{ fontFamily: 'Poppins, sans-serif' }}
              >
                IGCSEs
              </button>
            </div>
            {/* Conditional content */}
            <div className="w-full transition-all duration-500 ease-in-out">
              {selected === "option1" ? (
                <>
                  <h3 className="font-semibold text-xl md:text-2xl text-[#0C58E4] tracking-[-1px] mb-6" style={{ fontFamily: 'Poppins, sans-serif' }}>
                    IAL Tools
                  </h3>
                  {/* Resource Cards - CSS Grid for single-line layout (IAL) and 2x2 layout for mobile */}
                  <div className="text-base grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-8 sm:px-1 w-full">
                    <Link
                      href={`/communityNotes/IAL`}
                      className="transition-all duration-300 h-40 rounded-xl font-[550] tracking-[-0.5px] border-[1.5px] border-[#B0B0B0] flex items-end justify-start pl-4 pb-4 text-gray-400 bg-gray-200 cursor-pointer hover:text-gray-500 hover:bg-gray-300 bg-blend-multiply"
                      style={{ backgroundImage: "url('/Notes Background.svg')", backgroundSize: 'cover', backgroundPosition: 'center', opacity: 0.7 }}
                    >
                      Eduvance Notes
                    </Link>
                    <Link
                      href={`/resources`}
                      className="transition-all duration-300 h-40 rounded-xl font-[550] tracking-[-0.5px] border-[1.5px] border-[#0C58E4] flex items-end justify-start pl-4 pb-4 text-black hover:text-[#0C58E4] hover:bg-[#CEE0FF] bg-blend-multiply cursor-pointer"
                      style={{ backgroundImage: "url('/PPQ Background.svg')", backgroundSize: 'cover', backgroundPosition: 'center' }}
                    >
                      Community Resources
                    </Link>
                    <Link
                      href={`/pastPapers/IAL`}
                      className="transition-all duration-300 h-40 rounded-xl font-[550] tracking-[-0.5px] border-[1.5px] border-[#0C58E4] flex items-end justify-start pl-4 pb-4 text-black hover:text-[#0C58E4] hover:bg-[#CEE0FF] bg-blend-multiply cursor-pointer"
                      style={{ backgroundImage: "url('/Papers Background.svg')", backgroundSize: 'cover', backgroundPosition: 'center' }}
                    >
                      Past Papers
                    </Link>
                    <a
                      href="../../contributor/"
                      className="transition-all duration-300 h-40 rounded-xl font-[550] tracking-[-0.5px] border-[1.5px] border-[#0C58E4] flex items-end justify-start pl-4 pb-4 text-black hover:text-[#0C58E4] hover:bg-[#CEE0FF] bg-blend-multiply cursor-pointer"
                      style={{ backgroundImage: "url('/Share Notes Background.svg')", backgroundSize: 'cover', backgroundPosition: 'center' }}
                    >
                      Share Your Notes
                    </a>
                  </div>
                </>
              ) : (
                <>
                  <h3 className="font-semibold text-xl md:text-2xl text-[#0C58E4] tracking-[-1px] mb-6" style={{ fontFamily: 'Poppins, sans-serif' }}>
                    IGCSE Tools
                  </h3>
                  {/* Resource Cards - CSS Grid for single-line layout (IGCSE) and 2x2 layout for mobile */}
                  <div className="text-base grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-8 sm:px-1 w-full">
                  <Link
                      href={`/communityNotes/IGCSE`}
                      className="transition-all duration-300 h-40 rounded-xl font-[550] tracking-[-0.5px] border-[1.5px] border-[#B0B0B0] flex items-end justify-start pl-4 pb-4 text-gray-400 bg-gray-200 cursor-pointer hover:text-gray-500 hover:bg-gray-300 bg-blend-multiply"
                      style={{ backgroundImage: "url('/Notes Background.svg')", backgroundSize: 'cover', backgroundPosition: 'center', opacity: 0.7 }}
                    >
                      Eduvance Notes
                    </Link>
                    <Link
                      href={`/resources`}
                      className="transition-all duration-300 h-40 rounded-xl font-[550] tracking-[-0.5px] border-[1.5px] border-[#0C58E4] flex items-end justify-start pl-4 pb-4 text-black hover:text-[#0C58E4] hover:bg-[#CEE0FF] bg-blend-multiply cursor-pointer"
                      style={{ backgroundImage: "url('/PPQ Background.svg')", backgroundSize: 'cover', backgroundPosition: 'center' }}
                    >
                      Community Resources
                    </Link>
                    <Link
                      href={`/pastPapers/IGCSE`}
                      className="transition-all duration-300 h-40 rounded-xl font-[550] tracking-[-0.5px] border-[1.5px] border-[#0C58E4] flex items-end justify-start pl-4 pb-4 text-black hover:text-[#0C58E4] hover:bg-[#CEE0FF] bg-blend-multiply cursor-pointer"
                      style={{ backgroundImage: "url('/Papers Background.svg')", backgroundSize: 'cover', backgroundPosition: 'center' }}
                    >
                      Past Papers
                    </Link>
                    <a
                      href="../../contributor/"
                      className="transition-all duration-300 h-40 rounded-xl font-[550] tracking-[-0.5px] border-[1.5px] border-[#0C58E4] flex items-end justify-start pl-4 pb-4 text-black hover:text-[#0C58E4] hover:bg-[#CEE0FF] bg-blend-multiply cursor-pointer"
                      style={{ backgroundImage: "url('/Share Notes Background.svg')", backgroundSize: 'cover', backgroundPosition: 'center' }}
                    >
                      Share Your Notes
                    </a>
                  </div>
                </>
              )}

                {/* Always-visible slim buttons below the cards */}
              <div className="flex flex-wrap justify-between gap-4 w-full">
                <a
                  href="https://discord.gg/eduvance-community-983670206889099264"
                  className="w-full h-14 rounded-xl bg-[#F2F6FF] font-[550] tracking-[-0.5px] border-[1.5px] border-[#0C58E4] flex items-center justify-start pl-4 text-black hover:text-[#0C58E4] hover:bg-[#BAD1FD] bg-blend-multiply transition-all duration-300"
                >
                  <img src="/ServerIcon.svg" alt="Contribute" className="w-5 h-4 mr-4" />
                  Join Our Discord Server
                </a>
              </div>
            </div>
          </div>
        </main>
      </div>
    </>
  );
}