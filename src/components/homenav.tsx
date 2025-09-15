"use client";
import Image from 'next/image';
import Link from "next/link";
import { useState, useRef, useEffect } from 'react';
import { ChevronRight } from 'lucide-react';
import { apiClient } from '@/lib/secure-api-client';
import { Auth } from '@supabase/auth-ui-react';
import { ThemeSupa } from '@supabase/auth-ui-shared';
import BlueSolo from '@/assets/png/BlueSolo.png'
import SmallLogo from '@/assets/png/SmallLogo.png'
import { useReloadOnStuckLoading } from '@/utils/reloadOnStuckLoading';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { useSupabaseAuth } from '@/components/client/SupabaseAuthContext';
import { usePopup } from '@/components/ui/PopupNotification';

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

// Dropdown component
const NavDropdown = ({ labelMain, labelSmall, items }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        aria-label='access-dropdown'
        onClick={() => setIsOpen(!isOpen)}
        className="cursor-pointer text-[#555555] text-sm sm:text-base lg:text-lg font-semibold hover:text-black transition tracking-[-1px] flex items-center gap-1"
      >
        <p className='max-[1055px]:hidden min-[1055px]:block'>{labelMain}</p>
        <p className='max-[665px]:hidden min-[1055px]:hidden max-[1055px]:block'>{labelSmall}</p>
        <svg
          className={`max-[665px]:hidden w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute z-50 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5">
          <div className="py-1" role="menu" aria-orientation="vertical">
            {items.map((item, index) => (
              <Link
                key={index}
                href={item.href}
                className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                role="menuitem"
                onClick={() => setIsOpen(false)}
              >
                {item.label}
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

function Home(props) {
  const showPopup = usePopup();
  const [subjects, setSubjects] = useState([]);
  const [NonUniqueSubjects, setNQSubjects] = useState([]);
  const [loadingSubjects, setLoadingSubjects] = useState(true); // New state for loading
  const subjectsDivRef = useRef(null); // Ref for the subjects div

  useReloadOnStuckLoading(loadingSubjects);

  const fetchSubjects = async () => {
    setLoadingSubjects(true); // Set loading to true at the start of fetch
    console.debug('Attempting to fetch subjects from Supabase...');
    try {
      const { data, error } = await supabase
        .from('subjects')
        .select('name, syllabus_type')
        .order('name', { ascending: true });

      if (error) {
        console.error('Error fetching subjects:', error.message);
        setLoadingSubjects(false); // Set loading to false on error
        return;
      }

      if (data) {
        console.debug('Successfully fetched subjects:', data);
        setNQSubjects(data);
        const subject_list = [...new Set(data.map(item => item.name))];
        setSubjects(subject_list.sort());
        console.debug('Processed unique subjects:', subject_list.sort());
      } else {
        console.warn('No data received when fetching subjects.');
      }
      setLoadingSubjects(false); // Set loading to false after successful fetch
    } catch (err) {
      console.error('An unexpected error occurred during subject fetch:', err);
      setLoadingSubjects(false); // Set loading to false on unexpected error
    }
  };

  useEffect(() => {
    fetchSubjects(); // Initial fetch
  }, []);

  // Check if subjects are rendered and re-fetch if not
  useEffect(() => {
    const checkAndRefetchSubjects = () => {
      console.debug('Checking if subjects are rendered in the sidebar...');
      if (subjectsDivRef.current) {
        const subjectLinks = subjectsDivRef.current.querySelectorAll('a');
        if (subjectLinks.length === 0 && subjects.length === 0 && !loadingSubjects) { // Add loadingSubjects check
          console.warn('No subject links found in the sidebar. Re-fetching subjects...');
          fetchSubjects();
        } else if (subjectLinks.length > 0) {
          console.debug(`${subjectLinks.length} subject links found in the sidebar.`);
        }
      } else {
        console.debug('Subjects div reference not available yet.');
      }
    };

    const timer = setTimeout(checkAndRefetchSubjects, 1000); // Check after a short delay to allow rendering
    return () => clearTimeout(timer);
  }, [subjects, loadingSubjects]); // Rerun when subjects or loading state changes

  let extra = null;

  if (props.showExtra) {
    extra = (<div className="mt-8 px-4">
      <h3 className="text-lg font-semibold tracking-[-1px] text-[#0C58E4] mb-4 px-2" style={{ fontFamily: 'Poppins, sans-serif' }}>
        Eduvance Services
      </h3>
      <div className="space-y-1">
        {[
          { name: 'Study Tools', href: '/studyTools' },
          { name: 'Edexcel FAQs', href: '/faq' },
          { name: 'Edexcel Exam Structure', href: '/about/edexcel/examStructure' },
          { name: 'Edexcel Grading System', href: '/about/edexcel/grading' },
        ].map((tool) => (
          <Link
            key={tool.name}
            href={tool.href}
            className="block px-4 py-2 text-[#000000] tracking-[-0.5px] cursor-pointer hover:bg-[#BAD1FD] rounded transition-colors duration-200"
            style={{ fontFamily: 'Poppins, sans-serif' }}
          >
            {tool.name}
          </Link>
        ))}
      </div>
    </div>)
  }
  const { session } = useSupabaseAuth();
  const [selected, setSelected] = useState('option1'); // This state doesn't seem to be used.
  const [hoveredSidebarItem, setHoveredSidebarItem] = useState(null);
  const [isHeaderHovered, setIsHeaderHovered] = useState(false); // This state doesn't seem to be used.
  const [isSidebarHovered, setIsSidebarHovered] = useState(false); // This state doesn't seem to be used.
  const [sidebarOpen, setSidebarOpen] = useState(false);
  // const [showLoginPopup, setShowLoginPopup] = useState(false);
  // const [showLogoutPopup, setShowLogoutPopup] = useState(false);
  const prevSessionRef = useRef(null);
  const loginPopupShownRef = useRef(false); // This ref is declared but not used.
  const hasMountedRef = useRef(false);

  useEffect(() => {
    console.debug('Session effect triggered. Current session:', session);
    // On first mount, just set prevSessionRef and mark as mounted
    if (!hasMountedRef.current) {
      prevSessionRef.current = session;
      hasMountedRef.current = true;
      console.debug('Component mounted. Initial session:', session);
      return;
    }
    // Only show login popup if previous session was null and new session is not null, and popup hasn't been shown yet in sessionStorage
    if (!prevSessionRef.current && session && !sessionStorage.getItem('loginPopupShown')) {
      console.info('Login detected! Showing login success popup.');
      showPopup({ type: 'loginSuccess', subText: 'Welcome to the community!' });
      sessionStorage.setItem('loginPopupShown', 'true');
    }
    // Reset the flag if the user logs out
    if (!session && prevSessionRef.current) { // Added prevSessionRef.current check to ensure it was previously logged in
      console.info('Logout detected. Clearing login popup flag.');
      sessionStorage.removeItem('loginPopupShown');
    }
    prevSessionRef.current = session;
  }, [session]);

  // Handle login popup auto-hide
  // useEffect(() => {
  //   if (showLoginPopup) {
  //     console.debug('Login popup visible. Setting auto-hide timer.');
  //     const timer = setTimeout(() => {
  //       setShowLoginPopup(false);
  //       console.debug('Login popup auto-hidden.');
  //     }, 1500);
  //     return () => clearTimeout(timer);
  //   }
  // }, [showLoginPopup]);
  // Handle logout popup auto-hide
  // useEffect(() => {
  //   if (showLogoutPopup) {
  //     console.debug('Logout popup visible. Setting auto-hide timer.');
  //     const timer = setTimeout(() => {
  //       setShowLogoutPopup(false);
  //       console.debug('Logout popup auto-hidden.');
  //     }, 1500);
  //     return () => clearTimeout(timer);
  //   }
  // }, [showLogoutPopup]);

  const handleLogout = async () => {
    console.debug('Attempting to log out...');
    await apiClient.logout();
    if (error) {
      console.error('Logout failed:', error.message);
      return;
    }
    console.info('Successfully logged out!');
    showPopup({ type: 'logoutSuccess', subText: 'Hoping you are back soon!' });
    sessionStorage.removeItem('loginPopupShown');
  };
  const[bar, setBar] = useState(null)
  useEffect(() => {
    if(!props.dontShowload){
      setBar(<div className='bg-[#5cabff] h-[65px] opacity-100 transition-all duration-200 animate-loadExtend'/>)
      const timeout = setTimeout(() => {
        setBar(<div className='bg-[#5cabff] h-[0px] transition-all duration-200 opacity-0'/>);
      }, 2000);

      return () => clearTimeout(timeout);
    }
  }, [props.load])
  return (
    <main className="bg-white relative overflow-x-hidden"> 
      {bar}     
      <nav className="w-full h-[60px] flex justify-between items-center px-4 md:px-6 py-4 z-50 fixed top-0 left-0 bg-white bg-opacity-95">
        {/* 👈 Left Side: Sidebar Button + Logo in one group */}
        <div className="flex items-center gap-2">
          <button
            aria-label='sidebar-adjustment'
            className="cursor-pointer flex items-center justify-center w-10 h-10 rounded-full hover:bg-[#BAD1FD] transition-colors duration-200"
            onClick={() => {
              setSidebarOpen(true);
              console.debug('Sidebar opened.');
            }}
          >
            <svg className="w-6 h-6 text-[#0C58E4]" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <Link href="/">
            <Image src={SmallLogo} alt="Eduvance" width={35} height={35} />
          </Link>
          <Link href="/">
            <span className="font-grand-local text-xl sm:text-2xl text-black">Eduvance</span>
          </Link>
        </div>

        {/* Center Links - Hidden on sm */}
        <div className="hidden sm:flex flex-wrap gap-3 sm:gap-4 md:gap-5 justify-center items-center">
          <NavDropdown
            labelMain="IGCSE Edexcel Subjects"
            labelSmall="IGCSE"
            items={NonUniqueSubjects
              .filter((subject) => subject.syllabus_type === "IGCSE")
              .map((subject) => ({
                label: subject.name,
                // Apply toKebabCase here for dropdown items
                href: `/subjects/${toKebabCase(subject.name)}?choice=option2`,
              }))
            } />
          <NavDropdown
            labelMain="IAL Edexcel Subjects"
            labelSmall="IAL"
            items={NonUniqueSubjects
              .filter((subject) => subject.syllabus_type === "IAL")
              .map((subject) => ({
                label: subject.name,
                // Apply toKebabCase here for dropdown items
                href: `/subjects/${toKebabCase(subject.name)}?choice=option1`,
              }))
            } />            
          <NavDropdown
            labelMain="More"
            labelSmall="More"
            items={[
              { label: "Contact Us", href: "/about/eduvance/#contact" },
              { label: "FAQ", href: "/faq" },
              { label: "Community Guidelines", href: "/guidelines" },
              { label: "Privacy Policy", href: "/privacy" },
              { label: "Terms of Service", href: "/terms" },
            ]}
          />
          <NavDropdown
            labelMain="About"
            labelSmall="About"
            items={[
              { label: "About Eduvance", href: "/about/eduvance" },
              { label: "Edexcel Exam Structure", href: "/about/edexcel/examStructure" },
              { label: "Edexcel Grading System", href: "/about/edexcel/grading" },
            ]}
          />
        </div>

        {/* Auth Section */}
        <div className="flex items-center gap-3">
          {!session ? (
            <>
              <Dialog>
                <DialogTrigger asChild>
                  <button
                    className="text-[#0C58E4] cursor-pointer tracking-[-0.5px] font-semibold px-3 py-1 rounded transition hover:underline"
                    style={{ fontFamily: 'Poppins, sans-serif' }}
                    onClick={() => console.debug('Login button clicked.')}
                  >
                    Log In
                  </button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-md pl-8 pr-8 pt-6 pb-4 max-h-[95vh]">
                  <DialogHeader>
                    <DialogTitle className="text-2xl font-bold text-[#0C58E4]" style={{ fontFamily: 'Poppins, sans-serif' }}>
                      Welcome to Eduvance
                    </DialogTitle>
                    <DialogDescription className="text-gray-600" style={{ fontFamily: 'Poppins, sans-serif' }}>
                      Sign in to access all corresponding resources
                    </DialogDescription>
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
                  </DialogHeader>
                </DialogContent>
              </Dialog>
              <Dialog>
                <DialogTrigger asChild>
                  <button
                    style={{ fontFamily: 'Poppins, sans-serif' }}
                    className="bg-[#1871F2] cursor-pointer text-white border-2 border-white px-4 py-1 rounded-[10px] hover:bg-blue-700 transition text-sm sm:text-base poppins-semibold shadow-lg"
                    onClick={() => console.debug('Join Now button clicked.')}
                  >
                    Join Now
                  </button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-md pl-8 pr-8 pt-6 pb-4 max-h-[95vh]">
                  <DialogHeader>
                    <DialogTitle className="text-2xl font-bold text-[#0C58E4]" style={{ fontFamily: 'Poppins, sans-serif' }}>
                      Welcome to Eduvance
                    </DialogTitle>
                    <DialogDescription className="text-gray-600" style={{ fontFamily: 'Poppins, sans-serif' }}>
                      Sign up now to access all corresponding resources
                    </DialogDescription>
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
                  </DialogHeader>
                </DialogContent>
              </Dialog>
            </>
          ) : (
            <>

              {session.user?.user_metadata?.avatar_url ? <img className='border-[#1871F2] p-0.5 border-2 rounded-full w-10 h-10' src={session.user?.user_metadata?.avatar_url} alt="User Avatar" /> : <span className="text-[#0C58E4] tracking-[-0.5px] font-semibold px-3 py-1 rounded hidden lg:block">{session.user?.email}</span>}

              <button
                className="text-[#0C58E4] cursor-pointer tracking-[-0.5px] font-semibold px-3 py-1 rounded transition hover:underline"
                onClick={handleLogout}
                style={{ fontFamily: 'Poppins, sans-serif' }}
              >
                Log Out
              </button>
            </>
          )}
        </div>
      </nav>
      {/* Both below handled by new hook */}    
      {/* Login Success Popup */}
      {/* {showLoginPopup && (
        <div className="fixed top-6 left-1/2 transform -translate-x-1/2 z-50">
          <div className="bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg animate-slide-in-fade-out">
            Successfully logged in!
          </div>
          <style jsx>{`
            .animate-slide-in-fade-out {
              animation: slideInFadeOut 2.5s forwards;
            }
            @keyframes slideInFadeOut {
              0% { opacity: 0; transform: translateY(-20px); }
              10% { opacity: 1; transform: translateY(0); }
              90% { opacity: 1; transform: translateY(0); }
              100% { opacity: 0; transform: translateY(-20px); }
            }
          `}</style>
        </div>
      )} */}
      {/* Logout Success Popup */}
      {/* {showLogoutPopup && (
        <div className="fixed top-6 left-1/2 transform -translate-x-1/2 z-50">
          <div className="bg-red-600 text-white px-6 py-3 rounded-lg shadow-lg animate-slide-in-fade-out">
            Successfully logged out!
          </div>
          <style jsx>{`
            .animate-slide-in-fade-out {
              animation: slideInFadeOut 2.5s forwards;
            }
            @keyframes slideInFadeOut {
              0% { opacity: 0; transform: translateY(-20px); }
              10% { opacity: 1; transform: translateY(0); }
              90% { opacity: 1; transform: translateY(0); }
              100% { opacity: 0; transform: translateY(-20px); }
            }
          `}</style>
        </div>
      )} */}

      {/* Custom Sidebar - Slide-in from left */}
      {/* Scroll Ability */}
      <div data-sidebar={sidebarOpen ? 'open' : 'closed'} className={`sidebarWheel overflow-y-scroll overscroll-none fixed top-0 left-0 h-full bg-white z-50 flex flex-col shadow-lg transform ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} transition-transform duration-300 ease-in-out`} style={{ width: '300px', minWidth: '300px' }}>
        <div className="flex justify-between items-center p-4">
          {/* Logo/Image */}
          <Link href="/">
            <Image
              src={BlueSolo}
              alt="Eduvance Logo"
              className="w-11 h-11 object-contain"
            />
          </Link>
          {/* Close Button */}
          <button onClick={() => {
            setSidebarOpen(false);
            console.debug('Sidebar closed.');
          }} className="cursor-pointer w-8 h-8 flex items-center justify-center rounded-full hover:bg-[#BAD1FD]">
            <svg className="w-6 h-6 text-[#153064]" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        {/* Choose your exam board header */}
        <h2 className="text-lg font-semibold tracking-[-1px] text-[#0C58E4] mb-6 px-6" style={{ fontFamily: 'Poppins, sans-serif' }}>
          Choose your exam qualification
        </h2>
        {/* Sidebar Navigation */}
        <div className="flex flex-col px-4 space-y-2">
          <div
            className={`relative px-4 py-3 rounded-lg cursor-pointer transition-all duration-200 ${
              hoveredSidebarItem === 'igcse' ? 'bg-[#BAD1FD]' : ''
            }`}
            onMouseEnter={() => setHoveredSidebarItem('igcse')}
            onMouseLeave={() => setHoveredSidebarItem(null)}
            onClick={() => {
              setSidebarOpen(false);
              window.location.href = '/IGCSE';
              console.debug('IGCSE sidebar item clicked. Navigating to /IGCSE.');
            }}
          >
            <div className="flex items-center justify-between">
              <span className="text-[#000000] tracking-[-0.5px] font-medium" style={{ fontFamily: 'Poppins, sans-serif' }}>
                IGCSE
              </span>
              {hoveredSidebarItem === 'igcse' && (
                <ChevronRight size={16} className="text-[#000000]" />
              )}
            </div>
          </div>
          <div
            className={`relative px-4 py-3 rounded-lg cursor-pointer transition-all duration-200 ${
              hoveredSidebarItem === 'as' ? 'bg-[#BAD1FD]' : ''
            }`}
            onMouseEnter={() => setHoveredSidebarItem('as')}
            onMouseLeave={() => setHoveredSidebarItem(null)}
            onClick={() => {
              setSidebarOpen(false);
              window.location.href = '/IAL';
              console.debug('IAL sidebar item clicked. Navigating to /IAL.');
            }}
          >
            <div className="flex items-center justify-between">
              <span className="text-[#000000] tracking-[-0.5px] font-medium" style={{ fontFamily: 'Poppins, sans-serif' }}>
                IAL
              </span>
              {hoveredSidebarItem === 'as' && (
                <ChevronRight size={16} className="text-[#000000]" />
              )}
            </div>
          </div>
        </div>
        {/* Subjects Section */}
        <div className="mt-8 px-4">
          <h3 className="text-lg font-semibold tracking-[-1px] text-[#0C58E4] mb-4 px-2" style={{ fontFamily: 'Poppins, sans-serif' }}>
            Subjects
          </h3>
          <div className="space-y-1" ref={subjectsDivRef}>
            {loadingSubjects ? (
              <p className="px-4 py-2 text-gray-500">Loading subjects...</p>
            ) : subjects.length > 0 ? (
              subjects.map((subject) => (
                <Link
                  key={subject}
                  href={`/subjects/${toKebabCase(subject)}`}
                  className="block px-4 py-2 text-[#000000] tracking-[-0.5px] cursor-pointer hover:bg-[#BAD1FD] rounded transition-colors duration-200"
                  style={{ fontFamily: 'Poppins, sans-serif' }}
                  onClick={() => {
                    setSidebarOpen(false);
                    console.debug(`Subject link clicked: ${subject}`);
                  }}
                >
                  {subject}
                </Link>
              ))
            ) : (
              <p className="px-4 py-2 text-gray-500">No subjects available.</p>
            )}
          </div>
        </div>
        {extra}
      </div>      
    </main>
  );
};
export { Home }