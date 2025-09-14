// import dotenv from 'dotenv';
// dotenv.config();

import { createClient } from '@supabase/supabase-js';
// Pasted from staffAccess
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'YOUR_SUPABASE_PROJECT_URL';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'YOUR_SUPABASE_ANON_KEY';

let supabase = null;
try {
    if (supabaseUrl && supabaseAnonKey && supabaseUrl.startsWith('http')) {
        supabase = createClient(supabaseUrl, supabaseAnonKey);
    } else {
        console.error("Supabase URL or Anon Key is invalid. Please ensure NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY are set correctly in your environment variables.");
    }
} catch (e) {    
    console.error("Error initializing Supabase client:", e.message);
}

// export default function sitemap() {
//     let subject_list = [];
//     supabase
//     .from('subjects')
//     .select('name')
//     .order('name', { ascending: true })
//     .then(({ data, error }) => {
//         if (!error) {
//             subject_list = [...new Set(data.map(item => item.name))];
//         }
//     })
//     .finally(console.log(subject_list))
// }
function toKebabCase(str) {
  return str.toLowerCase().replace(/\s+/g, '-');
}
async function data() {
  let subject_list = [];
  try {
    const { data, error } = await supabase
      .from('subjects')
      .select('name, syllabus_type')
      .order('name', { ascending: true });

    if (error) {
      console.error("Error fetching subjects:", error);
      return;
    }

    subject_list = data;
    const base_url = "https://eduvance.au"
    const date = new Date(2025, 7, 2);
    let urls = []
    urls.push({url:`${base_url}/`, lastModified: date.toISOString().split('T')[0], changeFrequency: 'monthly', priority: 1});
    urls.push({url:`${base_url}/resources`, lastModified: date.toISOString().split('T')[0], changeFrequency: 'monthly', priority: 1});
    urls.push({url:`${base_url}/contributor`, lastModified: date.toISOString().split('T')[0], changeFrequency: 'monthly', priority: 0.9});
    urls.push({url:`${base_url}/studyTools`, lastModified: date.toISOString().split('T')[0], changeFrequency: 'monthly', priority: 0.9});
    // urls.push({url:`${base_url}/communityNotes/IAL`, lastModified: date.toISOString().split('T')[0], changeFrequency: 'monthly', priority: 0.9});
    // urls.push({url:`${base_url}/communityNotes/IGCSE`, lastModified: date.toISOString().split('T')[0], changeFrequency: 'monthly', priority: 0.9});
    urls.push({url:`${base_url}/pastPapers/IAL`, lastModified: date.toISOString().split('T')[0], changeFrequency: 'monthly', priority: 0.9});
    urls.push({url:`${base_url}/pastPapers/IGCSE`, lastModified: date.toISOString().split('T')[0], changeFrequency: 'monthly', priority: 0.9});
    urls.push({url:`${base_url}/terms`, lastModified: date.toISOString().split('T')[0], changeFrequency: 'monthly', priority: 0.9});
    urls.push({url:`${base_url}/privacy`, lastModified: date.toISOString().split('T')[0], changeFrequency: 'monthly', priority: 0.9});
    urls.push({url:`${base_url}/guidelines`, lastModified: date.toISOString().split('T')[0], changeFrequency: 'monthly', priority: 0.9});
    urls.push({url:`${base_url}/faq`, lastModified: date.toISOString().split('T')[0], changeFrequency: 'monthly', priority: 0.8});
    urls.push({url:`${base_url}/about/eduvance`, lastModified: date.toISOString().split('T')[0], changeFrequency: 'monthly', priority: 0.8});
    urls.push({url:`${base_url}/about/edexcel/examStructure`, lastModified: date.toISOString().split('T')[0], changeFrequency: 'monthly', priority: 0.8});
    urls.push({url:`${base_url}/about/edexcel/grading`, lastModified: date.toISOString().split('T')[0], changeFrequency: 'monthly', priority: 0.8});
    for (let subject of subject_list) {
        const one_timer = {url:`${base_url}/subjects/${toKebabCase(subject.name)}`, lastModified: date.toISOString().split('T')[0], changeFrequency: 'monthly', priority: 0.9}
        if (!urls.some(entry => entry.url === one_timer.url)){
            urls.push(one_timer)
        }
      
        if(subject.syllabus_type === "IAL"){
            urls.push({url:`${base_url}/subjects/${toKebabCase(subject.name)}/IAL/communityNotes`, lastModified: date.toISOString().split('T')[0], changeFrequency: 'weekly', priority: 0.8});
            urls.push({url:`${base_url}/subjects/${toKebabCase(subject.name)}/IAL/resources`, lastModified: date.toISOString().split('T')[0], changeFrequency: 'weekly', priority: 0.8});
            urls.push({url:`${base_url}/subjects/${toKebabCase(subject.name)}/IAL/pastpapers`, lastModified: date.toISOString().split('T')[0], changeFrequency: 'weekly', priority: 0.8});
        }
        else if(subject.syllabus_type === "IGCSE"){
            urls.push({url:`${base_url}/subjects/${toKebabCase(subject.name)}/IGCSE/communityNotes`, lastModified: date.toISOString().split('T')[0], changeFrequency: 'weekly', priority: 0.8});
            urls.push({url:`${base_url}/subjects/${toKebabCase(subject.name)}/IGCSE/resources`, lastModified: date.toISOString().split('T')[0], changeFrequency: 'weekly', priority: 0.8});
            urls.push({url:`${base_url}/subjects/${toKebabCase(subject.name)}/IGCSE/pastpapers`, lastModified: date.toISOString().split('T')[0], changeFrequency: 'weekly', priority: 0.8});
        }
    }
    return urls

  } catch (e) {
    console.error("Unexpected error:", e);
  }
}


export async function GET() {
  const urls = await data();

  return new Response(
    `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls
  .map(
    (url) => `<url>
  <loc>${url.url}</loc>
  <lastmod>${url.lastModified}</lastmod>
  <changefreq>${url.changeFrequency}</changefreq>
  <priority>${url.priority}</priority>
</url>`
  )
  .join("\n")}
</urlset>`,
    {
      headers: {
        "Content-Type": "application/xml",
      },
    }
  );
}
