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

export default function exam() {
  const discord = "https://discord.gg/eduvance-community-983670206889099264";

  return (
    <>
      <Home showExtra dontShowload/>
      <main className="min-h-screen bg-white flex flex-col items-center justify-start py-10 m-10">
        <div className="w-full max-w-5xl px-4">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-[#000000] mb-8 text-left tracking-[-0.035em]" style={{ fontFamily: "Poppins, sans-serif" }}>
            About Edexcel <span className="bg-[#1A69FA] px-2 py-1 -rotate-1 inline-block"><span className="text-[#FFFFFF]">Exam Structure</span></span>
          </h1>

          <Guideline title="Pearson Edexcel International GCSE (9-1)" content={
            <>
              <p>
                This qualification is available in both linear and modular formats. <br/> <br/> In the <strong>linear</strong> route, students take all exams at the end of the course, assessing the full syllabus in one go. <br/> In the <strong>modular</strong> route (available for a few subjects), the content is divided into units, and students can take exams at different stages allowing more flexibility and the option to retake specific units. <br/> <br/> Regardless, both routes lead to the same internationally recognized qualification and are designed to prepare learners aged 14–16 for A Levels, IALs, or further study.
              </p>
              <hr className='my-4'></hr>
              <p className='mb-2'>Examinations take place throughout the year divided into two series: </p>
              <ul className="list-disc ml-6 space-y-2 text-left">
                <li>May June</li>
                <li>October November</li>
              </ul>
            </>}/>
          <Guideline title="Pearson Edexcel International Advanced Level" content={<>
            <p>This qualification follows a <strong>modular</strong> structure, where each subject is divided into units that can be taken across multiple exam sessions. This flexible approach allows students to spread out their assessments, focus on fewer topics at a time, and retake individual units to improve their overall grade. The modular route is ideal for international learners seeking a balanced, customizable path to university or further study.</p>
            <hr className='my-4'></hr>
            <p className='mb-2'>Examinations take place throughout the year divided into two series (varies for some units) : </p>
            <ul className="list-disc ml-6 space-y-2 text-left">
              <li>January February</li>
              <li>May June</li>
              <li>October November</li>
            </ul></>}/>
        </div>
      </main>
      <SmallFoot />
    </>
  );
}
