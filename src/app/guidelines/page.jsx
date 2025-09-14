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
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-[#000000] mb-8 text-left tracking-[-0.035em]" style={{ fontFamily: "Poppins, sans-serif" }}>
            <span className="bg-[#1A69FA] px-2 py-1 -rotate-1 inline-block"><span className="text-[#FFFFFF]">Community</span></span> Guidelines
          </h1>

          <Guideline
            title="Notice"
            content={
              <>
                <p>
                  By joining/staying in our <a href={discord} className="text-[#1A69FA] underline">Discord Server</a> or using our <a href="https://eduvance.au" className="text-[#1A69FA] underline">website</a>, you hereby acknowledge and adhere to the <a href="https://discord.com/terms" className="text-[#1A69FA] underline">Discord Terms of Service</a>, <a href="https://discord.com/guidelines" className="text-[#1A69FA] underline">Discord Community Guidelines</a>, as well as our own. Non-compliance may result in either a ban or a temporary suspension.
                </p>
                <hr className='my-4'></hr>
                <a href='https://discord.gg/r9xcHANsSg' className='inline-flex items-center justify-center gap-2'><Cross className='fill-[#1a69fa] stroke-0 inline'/><p>Join the Appeal Server in order to appeal a ban or a punishment</p></a>
              </>
            }
          />
          <Guideline
            title="1. Hate Speech"
            content={
              <p>
                Threats are prohibited. These include death threats, sexism, hate speech, or racism. It also includes no doxing or swatting.
              </p>
            }
          />
          <Guideline
            title="2. Language Policy"
            content={
              <p>
                English-only rule applies (GIFs and images included). Communicate in English to promote a cohesive and inclusive atmosphere, exceptions: language specific channels and greetings (For example: Assalamualaikum).
              </p>
            }
          />
          <Guideline title="3. Sensitive Topics Restriction" content={<p>Avoid discussing sensitive topics, including but not limited to politics, terrorism, religion, and controversial social issues. This rule applies whether fellow members agree with your discussion or not.</p>}/> 
          <Guideline title="4. No Spamming" content={<p>Spamming of any kind, including repeated messages, emojis, images, is not allowed. Please keep conversations meaningful and on-topic.</p>}/> 
          <Guideline title="5. Piracy Prohibition" content={<p>Strictly refrain from requesting or distributing pirated/copyrighted/unreleased material (E-books, movies, pirated notes (eg: SME), exam materials or links to websites that provide the aforementioned).</p>}/> 
          <Guideline title="6. No Scams or Crypto Scams" content={<p>Promoting any scams or crypto scams is prohibited and will result in an instant ban.</p>}/> 
          <Guideline title="7. No Exam Paper Selling" content={<p>Any attempt to promote selling exam papers will result in an instant ban.</p>}/> 
          <Guideline title="8. NSFW Content Prohibition" content={<p>NSFW gifs, images, emojis, discussions, and jokes are not allowed. Keep the content safe for all members.</p>}/> 
          <Guideline title="9. No Cheating" content={<p>Any attempts to seek leaks, answers, or obtain papers before their official release are strictly forbidden. Both parties, the sender and the requester, will be dealt with accordingly.</p>}/> 
          <Guideline title="10. No ALT Accounts Policy" content={<p>Prohibited activities include creating alternative accounts for raiding, bypassing timeouts, or trolling. One account per user, please.</p>}/> 
          <Guideline title="11. Unauthorized Mentioning of Staff or Ghost Pinging" content={<p>Mentioning the server owner, server administrators, moderators and/or other members without a valid reason is prohibited.</p>}/> 
          <Guideline title="12. No Advertising" content={<p>Do not advertise anything, including other Discord servers, paper distribution websites or external services (this includes tuition, money-making/side-hustles, etc.)</p>}/> 
          <Guideline title="13. Moderator Actions Respect" content={<p>Refrain from publicly criticizing, starting debates, or commenting on a moderator's actions. If you have concerns, address them through the appropriate channels. (<a href="https://discord.com/channels/983670206889099264/1125566462212460604" className='bg-[#414575] text-[#8b9ef0] p-0.5 rounded'>#❓┃ask-the-mods</a>) </p>}/> 
          <Guideline title="14. DM Mods Exclusively Through Open Tickets" content={<p>Do not direct message or spam moderators; instead, create a ticket in⁠ <a href="https://discord.com/channels/983670206889099264/1125566462212460604" className='bg-[#414575] text-[#8b9ef0] p-0.5 rounded'>#❓┃ask-the-mods</a>, and we will resolve the issue. </p>}/> 
          <Guideline title="15. Do not encourage or promote rule-breaking" content={<p>If you see someone breaking server rules, report them to the staff team.</p>}/> 
        </div>
      </main>
      <SmallFoot />
    </>
  );
}
