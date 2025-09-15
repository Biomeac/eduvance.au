// components/AutoScrollTestimonials.js
import React from 'react';
import Image from 'next/image';
import { FaDiscord } from 'react-icons/fa';

const testimonials = [
  {
    content: "I joined Eduvance last year solely for the purpose of getting notes, however it truly is more than just an educational server. i think i've met some of the nicest people to ever exist, and i really am grateful for all of my friends there. the community in Eduvance is amazing, even the staff team; most of them are really kind and easy to get along with.",
    author: "vern 🌱",
    avatar: "/vern.webp",
    role: "Eduvance Member"
  },
  {
    content: "The entire Eduvance community helped me out significantly throughout my studies. The people here are great and extremely helpful for anything you might need. I had several doubts about high school, universities, and career pathways and all of them have been cleared up by simply asking the great people over here. I had no idea how important a good environment was for my studies before I joined Eduvance. I am beyond grateful for the experience that I have had and I'm looking forward to the future",
    author: "Booni",
    avatar: "/booni.webp",
    role: "Eduvance Member"
  },
  {
    content: "Eduvance has completely changed the way I study. Being part of such a supportive community pushed me to stay consistent, and I’ve seen both myself and others make incredible academic comebacks. The late-night VCs, study sessions that turn into hours of jokes, and even the random fun in general chat make it all feel less like studying with strangers and more like being part of a family.",
    author: "Cryssi",
    avatar: "/cryssi.webp",
    role: "Eduvance Member"
  },
  {
    content: "Eduvance is SPECTACULAR for Edexcel IAL students :3 The server is REALLY active, and people share notes all the time. They even have subject-specific helpers to give quick support for doubts. It’s one of the best places to find help and study materials for Edexcel IAL subjects 🙂",
    author: "Croizzants⋆˚࿔",
    avatar: "/croizzants.webp",
    role: "Eduvance Member"
  },
  {
    content: "Don’t wanna state the obvious, but eduvance is one of the best communities out there. Literally filled with the nicest, sweetest people you’ll ever get to interact with 🙂 and some of the most helpful individuals and resources out there. The staff, bios, and APs all work together seamlessly to make sure everyone is safe, happy, and having a great time, making this server stand out.",
    author: "Maroon",
    avatar: "/maroon.webp",
    role: "Eduvance Member"
  },
  {
    content: "Eduvance has been like a second-home to me since its early days. It has been my go-to place for useful resources including past papers and thanks to those, I have been able to achieve great results and give back as a community contributor! Definitely one of the warmest places for sharing, connecting and suffering school in this hellish journey of IGCSEs and IALs!",
    author: "Aeth_en 🎗️",
    avatar: "/aethen.webp",
    role: "Community Contributor"
  },
  {
    content: "I joined Eduvance back in November 2024, and it has helped me soo much in my IGCSE and a levels, a server full of lovely people and helpful staff, would definitely recommend Edexcel students to join and benefit immensely",
    author: "ThePearsonPrince",
    avatar: "/pearsonprince.webp",
    role: "Eduvance Member"
  },
  {
    content: "Eduvance really saved my IGCSEs as I relied heavily on the community notes. The notes are of very high quality and well written. The staff team also helped me a lot by giving instant replies whenever I had queries or made a report. The helpers are talented and always quick to respond. I would love to contribute to Eduvance in more ways in the future.",
    author: "Ryan",
    avatar: "/ryan.webp",
    role: "Community Contributor"
  },
  {
    content: "With all honesty , Eduvance has genuinely helped me a lot especially when I gave my exams , the amount of help I got from people was unbelievable and the resources available made it easier for me to do really well , it’s genuinely amazing and the people are always supportive and welling to help in a matter of seconds , will forever be grateful for this community and I’m just trying my best to repay this amazing treatment that I’ve gotten over the years !",
    author: "! S",
    avatar: "/7elc.webp",
    role: "Community Contributor"
  },
  {
    content: "I joined Eduvance back in November 2024, and it has helped me soo much in my IGCSE and a levels, a server full of lovely people and helpful staff, would definitely recommend Edexcel students to join and benefit immensely",
    author: "Abosmady :3",
    avatar: "/abosmady.webp",
    role: "Eduvance Member"
  },
  {
    content: "Being a long-time member of Eduvance, I can confidently say it's been an incredibly supportive place for my academic journey. They've provided me with the essential resources I needed to succeed. The sense of community is strong, and being surrounded by like-minded individuals truly makes me feel at home. It's an environment where I've received the most support for my studies and felt a true sense of belonging.",
    author: "Elk",
    avatar: "/elk.webp",
    role: "Eduvance Member"
  },
  {
    content: "I’ve been on the Eduvance Discord since my IGCSE days, and it’s been a huge help. I didn’t go to school, so this server was my main source for clearing doubts and understanding some tricky past paper questions. I’ve met some amazing people here who really motivated me to aim higher. Now I’m in A2 and I still get help, and contributing here and there has made me think deeper about concepts. Honestly, it’s an awesome community to learn and grow with!",
    author: "Draxo",
    avatar: "/draxo.webp",
    role: "Community Contributor"
  },
  {
    content: "The thing about Eduvance is that it is an extremely useful asset to all students using it for there IGCSE or IAL exams. I really love Eduvance due to there extremely supportive discord server and their incredibly friendly staff team and also there huge collection of A* guaranteed notes. I really would like to wish the very best for the future of Eduvance.",
    author: "TOM",
    avatar: "/tom.webp",
    role: "Community Moderator"
  }
];

const AutoScrollTestimonials = () => {
  const totalWidth = testimonials.length * (360 + 32) //mx-4 = 16+16=32px <- This is why 32 and 320 was chosen by Specter, thus the 320
  return (
    <div className="relative w-full overflow-hidden py-8 sm:py-12">
      <style jsx>{`@keyframes scroll-testimonials {
        from { 
          transform: translateX(0); 
        }
        to { 
          transform: translateX(-${totalWidth}px); 
        }
      }`}
    </style>
      {/* Container with a background color that the blur will match */}
      <div className="dark:bg-gray-800 rounded-lg sm:p-6">
        
        {/* Container for the scrolling testimonials */}
        <div className="group relative select-none overflow-hidden pt-5 w-full">
          <div className="flex items-start animate-scroll-testimonials group-hover:[animation-play-state:paused]">
            {testimonials.concat(testimonials).map((testimonial, index) => (
              <div
                key={index}
                className="flex-shrink-0 w-80 min-w-[360px] mx-4 p-6 bg-gray-100 dark:bg-gray-700 border-solid border border-gray-200 rounded-lg transition-transform transform hover:-translate-y-2.5 duration-300"
              >
                <div className="flex items-start mb-2">
                  <Image
                    src={testimonial.avatar}
                    alt={testimonial.author}
                    width={50}
                    height={50}
                    className="rounded-full object-cover"
                  />
                  <div className="ml-4">
                    <p className="font-semibold text-lg">{testimonial.author}</p>
                    <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                      <FaDiscord className="mr-1" />
                      {testimonial.role}
                    </div>
                  </div>
                </div>
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed break-words text-md">
                  "{testimonial.content}"
                </p>
              </div>
            ))}
          </div>

          {/* Left-side blur overlay that matches the background color */}
          <div
            className="hidden sm:block absolute top-0 left-0 h-full w-24 z-10 bg-gradient-to-r from-white dark:from-gray-800 via-transparent to-transparent"
          ></div>
          
          {/* Right-side blur overlay that matches the background color */}
          <div
            className="hidden sm:block absolute top-0 right-0 h-full w-24 z-10 bg-gradient-to-l from-white dark:from-gray-800 via-transparent to-transparent"
          ></div>
        </div>
      </div>
    </div>
  );
};

export default AutoScrollTestimonials;