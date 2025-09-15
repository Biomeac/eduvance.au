"use client";
import { Home } from '@/components/homenav';
import SmallFoot from '@/components/smallFoot.jsx';
import { useEffect } from "react";
import {Cross} from 'lucide-react'
function Guideline({ title, content }) {
  useEffect(() => {
    const header = document.querySelector(`[data-title="${title}header"]`);
    const to_hide = document.querySelector(`[data-title="${title}"]`);

    const handleClick = () => {
      to_hide?.classList.toggle("hidden");
    };

    header?.addEventListener("click", handleClick);

    return () => {
      header?.removeEventListener("click", handleClick);
    };
  }, [title]);

  return (
    <div className="bg-white rounded-lg shadow-md mb-8 border border-gray-200 overflow-hidden">
      <div
        data-title={`${title}header`}
        className="bg-[#2871F9] cursor-pointer text-white tracking-tight p-4 text-left font-bold text-xl sm:text-2xl"
        style={{ fontFamily: "Poppins, sans-serif" }}
      >
        {title}
      </div>
      <div className="p-6 pt-4" data-title={title}>
        {content}
      </div>
    </div>
  );
}

export default function Guidelines() {
  const discord = "https://discord.gg/eduvance-community-983670206889099264";

  return (
    <>
      <Home showExtra dontShowload/>
      <main className="min-h-screen bg-white flex flex-col items-center justify-start py-10 m-10">
        <div className="w-full max-w-5xl px-4">
          <div className='mb-8'>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-[#000000] text-left tracking-[-0.035em]" style={{ fontFamily: "Poppins, sans-serif" }}>
              <span className="bg-[#1A69FA] px-2 py-1 -rotate-1 inline-block"><span className="text-[#FFFFFF]">Privacy</span></span> Policy 
            </h1>
            <p className='my-2'>Last Updated August 7th 2025</p>
            <p>Eduvance.au is a student-led, non-commercial platform supporting IGCSE and IAL learners. This Privacy Policy outlines what information we collect and how we use it. By using Eduvance.au, you agree to these policies.</p>
          </div>
          <Guideline title="1. What We Collect" content={<div>We collect minimal user data, which consists of:
              <ul className="list-disc ml-10 space-y-2 text-left">
                <li>Email address (for registration and communication)</li> 
                <li>IP address</li>
                <li>Additional technical metadata for authentication and spam prevention</li>
                <li>We do not collect names, payment details, or sensitive personal data.</li>
              </ul>
            </div>}/> 
          <Guideline title="2. Why we collect it" content={<div>The data is used to:
              <ul className="list-disc ml-10 space-y-2 text-left">
                <li>Register and manage accounts</li> 
                <li>Authenticate users and detect spam or abuse</li>
                <li>Maintain platform security and functionality</li>
              </ul>
            </div>}/> 
          <Guideline title="3. Who operates Eduvance.au?" content={<p>Eduvance.au is a student-run project operated by an individual based in Australia, with support from a global team of contributors. The domain is registered in Australia, and the platform is managed in accordance with Australian privacy principles.</p>}/> 
          <Guideline title="4. Data Sharing and Analytics" content={<p>We may use third-party services (such as Google/Vercel analytics or spam filters) to improve and secure the platform. These services may collect anonymized technical data. We do not sell or trade your personal data.</p>}/> 
          <Guideline title="5. Content Submissions" content={<div>By submitting content (e.g. notes, answers, study guides):
            <ul className="list-disc ml-10 space-y-2 text-left">
                <li>You grant Eduvance.au the right to publish, watermark, and share your content on the platform</li> 
                <li>Submitted content cannot be removed, except as required by law</li>
                <li>If you are the original copyright owner of any content posted without your permission, contact us — we will remove it or credit you appropriately</li>
            </ul>
          </div>}/> 
          <Guideline title="6. Cookies and Tracking" content={<p>Eduvance.au may use cookies or tracking technologies in the future to support performance and moderation.</p>}/> 
          <Guideline title="7. Updates to the policies" content={<p>This policy may be updated over time. The most recent version will always be available here, with the date noted above.</p>}/>           
        </div>
      </main>
      <SmallFoot />
    </>
  );
}
