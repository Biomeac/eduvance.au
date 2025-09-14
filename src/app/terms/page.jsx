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
              <span className="bg-[#1A69FA] px-2 py-1 -rotate-1 inline-block"><span className="text-[#FFFFFF]">Terms</span></span> of Service 
            </h1>
            <p className='my-2'>Last Updated August 7th 2025</p>
            <p>By using Eduvance.au, you agree with these terms.</p>
          </div>
          <Guideline title="1. Basic Rules" content={
            <ul className="list-disc ml-10 space-y-2 text-left">
              <li>Don’t break the law.</li> 
              <li>Don’t spam or abuse the platform.</li>
              <li>Don’t upload anything you don’t have the right to share.</li>
              <li>We may suspend access to users who violate these terms.</li>
            </ul>
          }/> 
          <Guideline title="2. Accounts" content={<ul className="list-disc ml-10 space-y-2 text-left">
              <li>You must provide a valid email to register.</li> 
              <li>You’re responsible for activity on your account.</li>
            </ul>}/> 
          <Guideline title="3. Content" content={<div>You retain ownership of anything you submit. <br/> By submitting content, you give us a non-exclusive, royalty-free license to:
            <ul className="list-disc ml-10 space-y-2 text-left">
              <li>Display it publicly</li> 
              <li>Watermark it</li>
              <li>Share it within the platform</li>
              <li>You can reuse your content elsewhere. Removal requests will be handled case by case</li>
            </ul>
          </div>
          }/> 
          <Guideline title="4. Copyright" content={<p>If you are the original creator of content posted without permission, contact us.</p>}/> 
          <Guideline title="5. No Guarantees" content={<p>This site is provided “as-is.” We make no guarantees about uptime, accuracy, or availability. Use at your own risk.</p>}/> 
        </div>
      </main>
      <SmallFoot />
    </>
  );
}
