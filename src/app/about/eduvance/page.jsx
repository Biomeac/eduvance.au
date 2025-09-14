"use client";
import { Home } from '@/components/homenav';
import SmallFoot from '@/components/smallFoot.jsx';
import { useEffect } from "react";
import {Shield, FilePen, BookCheck, Bot, Globe} from 'lucide-react'
import Link from 'next/link';
function Guideline({ id, title, content }) {
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
    <div id={id ? id : ""} className="bg-white rounded-lg shadow-md mb-8 border border-gray-200 overflow-hidden">
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

export default function Eduvance() {
  const discord = "https://discord.gg/eduvance-community-983670206889099264";

  return (
    <>
      <Home showExtra dontShowload/>
      <main className="min-h-screen bg-white flex flex-col items-center justify-start py-10 m-10">
        <div className="w-full max-w-5xl px-4">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-[#000000] mb-8 text-left tracking-[-0.035em]" style={{ fontFamily: "Poppins, sans-serif" }}>
            About <span className="bg-[#1A69FA] px-2 py-1 -rotate-1 inline-block"><span className="text-[#FFFFFF]">Eduvance</span></span>
          </h1>

          <Guideline title="Who are we?" content={<p>Previously AP-Edexcel, Eduvance.au is a platform where students studying IGCSEs and IALs can connect, collaborate, and share resources. As the largest Edexcel-centric community on Discord, Eduvance.au is committed to helping students advance in their education through community support and shared academic tools.</p>}/>
          <Guideline
            title="Community Positions"
            content={
              <>
                <p>
                  We're thrilled to invite passionate and dedicated members of our community to apply for community roles on our rapidly growing community! As we continue to expand, we're introducing several key roles to ensure our environment remains supportive, high-quality, and welcoming for everyone. Whether you're interested in shaping resources, maintaining standards, building tools, or leading the community — there's a place for you on the team!
                </p>
                <hr className='my-4'></hr>
                <div className='flex items-start justify-center gap-2'><a href='https://forms.gle/yvXQ89v8pQmytBhc6'><Shield className='w-6 h-6 fill-[#1a69fa] stroke-0 inline'/></a><p>To all community members who are passionate about maintaining a safe and inclusive environment, our Discord server is growing rapidly, and with growth comes the need for dedicated, unbiased moderators to foster a wholesome community. <span className='line-through'>Click on the icon to fill out the moderator application!</span> <span className='text-red-600'>We are not accepting moderators at the moment!</span> </p></div>
                <hr className='my-4'></hr>
                <div className='flex items-start justify-center gap-2'><a href='https://forms.gle/F67mUf3TtdD62o4A7'><FilePen className='w-6 h-6 stroke-[#fcbb4a] inline'/></a><p>As a Resource Creator, you will be responsible for developing custom Eduvance notes and materials. You'll work closely with the staff team, contributing to the advancement and future success of Eduvance resources!</p></div>
                <hr className='my-4'></hr>
                <div className='flex items-start justify-center gap-2'><a href='https://forms.gle/F67mUf3TtdD62o4A7'><BookCheck className='w-6 h-6 stroke-[#464737] inline'/></a><p>Resource Auditors play a vital role in maintaining the quality of the community’s resources. You’ll ensure that all notes, including those from Resource Creators, meet high standards of accuracy and usefulness.</p></div>
                <hr className='my-4'></hr>
                <div className='flex items-start justify-center gap-2'><a href='https://forms.gle/F67mUf3TtdD62o4A7'><Bot className='w-6 h-6 stroke-[#04c59e] inline'/></a><p>Bot Developers will design, build, and maintain custom bots to enhance the functionality and efficiency of the server, improving user experience and automating essential tasks.</p></div>
                <hr className='my-4'></hr>
                <div className='flex items-start justify-center gap-2'><a href='https://forms.gle/F67mUf3TtdD62o4A7'><Globe className='w-6 h-6 stroke-[#76da3c] inline'/></a><p>Website Developers will create, manage, and update the website to ensure it remains user-friendly, functional, and aligned with the needs of the Eduvance community. You’ll work on improving the online presence and accessibility of resources.</p></div>
              </>
            }
          />
          <Guideline title="Server Boost Perks" content={
            <ul className="list-disc ml-6 space-y-2 text-left">
              <li>You will be given a <span className='text-[#ba34b5]'>Server Booster role</span> which is placed high on the members list.</li> 
              <li>You can choose a <span className='text-[#ba34b5]'>Custom Role</span>, this includes editing its Name/Color/Badge picture.</li>
              <li>You can add <span className='text-[#ba34b5]'>any Emoji</span> of your own choice to the Server.</li>
              <li>You can add <span className='text-[#ba34b5]'>any Sticker</span> of your own choice to the Server.</li>
              <li>The aforementioned must follow <Link href="/guidelines" className='underline'>server rules</Link> (i.e. not be NSFW, etc)</li>
            </ul>}/> 
          <Guideline title="Contact Us" id="contact" content={
            <div className='flex gap-2'>
              <a href="https://discord.com/invite/eduvance-community-983670206889099264"><img src="https://skillicons.dev/icons?i=discord"/></a>
              <a href="https://www.instagram.com/eduvance.au/"><img src="https://skillicons.dev/icons?i=instagram"/></a>
              <a href="https://www.linkedin.com/company/eduvance-au"><img src="https://skillicons.dev/icons?i=linkedin"/></a>
            </div>}/> 
        </div>
      </main>
      <SmallFoot />
    </>
  );
}
