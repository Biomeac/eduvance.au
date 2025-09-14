"use client";
import { Home } from '@/components/homenav';
import SmallFoot from '@/components/smallFoot.jsx';
import { useEffect } from "react";
import {CalendarClock, SquareArrowOutUpRight, Calculator} from 'lucide-react'
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
        className="bg-[#2871F9] cursor-pointer text-white tracking-tight p-4 text-left font-bold  text-xl sm:text-2xl"
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

export default function FAQ() {
  const discord = "https://discord.gg/eduvance-community-983670206889099264";

  return (
    <>
      <Home showExtra dontShowload/>
      <main className="min-h-screen bg-white flex flex-col items-center justify-start py-10 m-10">
        <div className="w-full max-w-5xl px-4">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-[#000000] mb-8 text-left tracking-[-0.035em]" style={{ fontFamily: "Poppins, sans-serif" }}>
            <span className="bg-[#1A69FA] px-2 py-1 -rotate-1 inline-block"><span className="text-[#FFFFFF]">Frequently</span></span> Asked Questions
          </h1>

          <Guideline
            title="When are the exams?"
            content={
              <>
                <p>
                  The following are the timetables released by Edexcel for upcoming sessions
                </p>
                <hr className='my-4'></hr>
                <div className='flex items-start justify-start gap-2 mb-2'><a href='https://qualifications.pearson.com/content/dam/pdf/Support/Examination-timetables-for-Edexcel-International-GCSE/november-2025-int-gcse-final.pdf'><CalendarClock className='w-6 h-6 stroke-[#1a69fa] inline'/></a><p>IGCSE October November 2025 Exams</p></div>
                <div className='flex items-start justify-start gap-2'><a href='https://qualifications.pearson.com/content/dam/pdf/Support/Examination-timetables-for-International-Advanced-Levels/ial-october2025-final.pdf'><CalendarClock className='w-6 h-6 stroke-[#1a69fa] inline'/></a><p>IAL October November 2025 Exams</p></div>
              </>
            }
          />
          <Guideline title="What are the Requirements to get an A* In International A level Mathematics (YMA01)?" content={<><p className='mb-2'>There are 2 Requirements to achieve an A* in A Level Mathematics:</p> <ol className="list-decimal ml-6 space-y-2 text-left"><li>You need an Overall 480+/600 UMS for both AS and A2 combined.</li><li>Obtain at least 180+/200 UMS in P3 & P4 combined.</li></ol></>}/> 
          <Guideline title="What are the Requirements to get an A* In International A level Sciences?" content={<><p className='mb-2'>There are 2 Requirements to achieve an A* in A Level Sciences (Physics/Biology/Chemistry):</p> <ol className="list-decimal ml-6 space-y-2 text-left"><li>You need an Overall 480+/600 UMS for both AS and A2 combined.</li><li>You need to obtain 270+/300 UMS in A2 level (U4+U5+U6).</li></ol></>}/> 
          <Guideline title="When do Grade Boundaries release for a particular session?" content={<p>It is released 1 or 2 hours before the online results release time.</p>}/> 
          <Guideline title="What is the difference between UMS and Raw Marks?" content={<p>Raw Marks are your actual real marks in an exams. So if the exam out of 75 and you got 51/75 then 51/75 is your raw marks. UMS stands for Uniform Mark Scale and It’s the mark examiners use by multiplying your “raw mark” which is your exam paper mark by a factor that is different every session. Therefore examiners use it to determine your grade for a specific unit.</p>}/> 
          <Guideline title="What does UCI that appears on my Statement of Entry mean?" content={<p>It stands for Unique candidate identifier (UCI). <br/> This is a 13-character code and is used mainly to link a candidate's unit results across series (and across different centres) for all their entries so they can be certificated. It's given for all candidates since there's modular system. When you register for an Edexcel exam, it will be given automatically in the Statement of Entry and later in the Statement of Results and Certificates.</p>}/> 
          <Guideline title="What Time do online Results Release for both IAL & IGCSE?" content={<p>It releases at 9:00 am UK Standard Time (GMT+1)</p>}/> 
          <Guideline title="What is the difference between a Remark and a Recheck?" content={<p>In Recheck: they will check that all of the marks on your exam papers have been correctly counted, to make sure there have been no mistakes when calculating your final grade. At this stage, your exam papers will not be re-marked. <br/> <br/> In Remark: they will arrange for an examiner to re-mark your entire exam for you.</p>}/> 
          <Guideline title="What does Cash-in mean?" content={<p>"Cash in" is a request to the examiners to combine the results from your modular A level exams taken at various times and calculate an overall grade. This is normally requested when entries are made for the final set of exams that complete the A level so that an overall result is provided on results day.<br/><br/>Lets say you did maths pure 1 and statistics 1 in Jan, you’ll get a statement of results but not the certificate. Then you did pure 2 in June and applied for cashed-in, you’ll get another statement of results of all the components you did together (jan + june) then the certificate later. Statement of results is always given whether you cash-in or not. When you apply for cash-in, you will then get a certificate of the subject you cashed-in for. <br/><br/>XMA01 MATHEMATICS is the AS maths cash-in code, when you sit for p1, p2 and s1/m1/d1, you can then apply for a cash-in for that code and get a certificate for it. <br/><br/>YMA01 MATHEMATICS is the International AL (AS+A2) cash-in code, When you apply for cash-in for that code, they combine all your International AL Components that includes p1, p2, p3, p4 and s1/m1/s2/m2 and give you a certificate for it.</p>}/> 
          <Guideline title="Can I use a Graphical Calculator like the FX-CG50 While Doing Edexcel Exams?" content={<><p>Yes you can use a graphical calculator in International GCSE and International A level Exams.</p><div className='flex items-start justify-start gap-2 mt-2'><a href='https://info.casio.co.uk/hubfs/Calculator-FAQs%202203.pdf#page=3'><Calculator className='w-6 h-6 stroke-[#1a69fa] inline'/></a><p>Read in detail here</p></div></>}/> 
          <Guideline title="How do I make a ResultsPlus Account or How do I access my Results online?" content={<><p>You have to talk to the person who is in control of Edexcel exams being conducted at your school/centre and they should send you a verification code (its unique for each candidate) and from there you add an email and a password.</p><div className='flex items-start justify-start gap-2 my-2'><a href='https://www.resultsplusdirect.co.uk/students/login.html#emailactivate'><SquareArrowOutUpRight className='w-6 h-6 stroke-[#1a69fa] inline'/></a><p>Here you enter the verification code</p></div><div className='flex items-start justify-start gap-2'><a href='https://qualifications.pearson.com/en/support/Services/resultsplus-direct/faqs-for-students.html'><SquareArrowOutUpRight className='w-6 h-6 stroke-[#1a69fa] inline'/></a><p>Read more here</p></div></>}/> 
        </div>
      </main>
      <SmallFoot />
    </>
  );
}
