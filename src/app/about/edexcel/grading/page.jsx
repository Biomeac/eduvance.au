"use client";
import { Home } from '@/components/homenav';
import SmallFoot from '@/components/smallFoot.jsx';
import { useEffect } from "react";
import {RefreshCw, FileStack} from 'lucide-react'
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

export default function Grading() {
  const discord = "https://discord.gg/eduvance-community-983670206889099264";

  return (
    <>
      <Home showExtra dontShowload/>
      <main className="min-h-screen bg-white flex flex-col items-center justify-start py-10 m-10">
        <div className="w-full max-w-5xl px-4">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-[#000000] mb-8 text-left tracking-[-0.035em]" style={{ fontFamily: "Poppins, sans-serif" }}>
            Edexcel <span className="bg-[#1A69FA] px-2 py-1 -rotate-1 inline-block"><span className="text-[#FFFFFF]">Grading</span></span>
          </h1>

          <Guideline
            title="Grade Boundaries"
            content={
              <>
                <p>
                  The boundaries are set after exam papers of a session are marked to ensure fairness, taking into account the difficulty of the paper. For example, if a paper was unusually hard, the boundary for an A might be lower than usual. Grade boundaries vary each exam session.
                </p>
                <hr className='my-4'></hr>
                <div className='flex items-start justify-start gap-2'><a href='https://qualifications.pearson.com/en/support/support-topics/results-certification/grade-boundaries.html'><FileStack className='w-6 h-6 stroke-[#1a69fa] inline'/></a><p>Checkout every session's grade boundaries released by Edexcel</p></div>
              </>
            }
          />
          <Guideline title="Pearson Edexcel International GCSE (9-1)" content={
            <>
              <p className='mb-2'>
                The 9–1 grading system is used in GCSEs and International GCSEs to provide more detailed differentiation between student performance. It replaces the old A*–F scale, with 9 being the highest grade and 1 the lowest (with U for ungraded).
              </p>
              <ul className="list-disc ml-6 space-y-2 text-left">
                <li>More differentiation at the top: Grades 7, 8, and 9 replace A and A*, allowing universities and employers to better distinguish between high-achieving students.</li>
                <li>Clearer benchmarks: Grade 4 is a standard pass (similar to a C), and Grade 5 is a strong pass—helpful for setting clear entry criteria for courses or jobs.</li>
              </ul>
            </>}/>
          <Guideline title="Pearson Edexcel International Advanced Level" content={<>
            <p>This qualification follows a <strong>modular</strong> structure, where each subject is divided into units that can be taken across multiple exam sessions. This flexible approach allows students to spread out their assessments, focus on fewer topics at a time, and retake individual units to improve their overall grade. The modular route is ideal for international learners seeking a balanced, customizable path to university or further study.</p>
            <ol className="list-decimal p-4 text-left">
              <li>Raw Marks</li>
                When you take an exam, you earn raw marks—these are the actual marks you score based on correct answers in each exam paper or unit.

              <li>UMS (Uniform Mark Scale)</li>
                Because different exam papers may vary in difficulty, Pearson Edexcel uses the Uniform Mark Scale (UMS) to standardize marks across different exam sessions or units. The raw marks you achieve are converted into UMS marks to ensure fairness and consistency.

              <li>Conversion Process</li>

                Each exam unit has a maximum raw mark and a corresponding maximum UMS mark.

                Raw marks are converted to UMS marks using grade boundaries determined after the exam is marked.

                This conversion adjusts for exam difficulty, so a harder paper doesn’t unfairly lower grades.

                Your final grade is calculated by adding up the UMS marks from all units and comparing the total against grade boundaries.
            </ol>
            <div className='flex items-start justify-start gap-2'><a href='https://qualifications.pearson.com/en/support/support-topics/results-certification/understanding-marks-and-grades/converting-marks-points-and-grades.html'><RefreshCw className='w-6 h-6 stroke-[#1a69fa] inline'/></a><p>Edexcel's Raw to UMS Mark Converter</p></div>
            </>}/>
        </div>
      </main>
      <SmallFoot />
    </>
  );
}
