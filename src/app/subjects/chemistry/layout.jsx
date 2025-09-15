const subjectName = 'Chemistry';
const refName = subjectName;

export const viewport = {
  themeColor: "#4e8cff",
}

export const metadata = {
  title: subjectName,
  description:
    `Explore all-in-one study tools for ${refName} — from curated revision guides and official past papers to peer-shared notes. Perfect for reviewing concepts, preparing for exams, or finding simplified explanations, everything you need is right here to boost your learning and help you stay ahead!`,
  icons: {
    icon: "/BlueSolo.svg",
    shortcut: "/BlueSolo.svg",
    apple: "/BlueSolo.svg",
  },
  openGraph: {
    title: subjectName,
    description:
      `Explore all-in-one study tools for ${refName} — from curated revision guides and official past papers to peer-shared notes. Perfect for reviewing concepts, preparing for exams, or finding simplified explanations, everything you need is right here to boost your learning and help you stay ahead!`,
    url: `https://eduvance-org.vercel.app/subjects/${refName}`,
    type: "website",
    images: [
      {
        url: "https://eduvance-org.vercel.app/tempbg.png",
        width: 1200,
        height: 630,
        alt: "Eduvance Image",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: subjectName,
    description:
      `Explore all-in-one study tools for ${refName} — from curated revision guides and official past papers to peer-shared notes. Perfect for reviewing concepts, preparing for exams, or finding simplified explanations, everything you need is right here to boost your learning and help you stay ahead!`,
    images: ["https://eduvance-org.vercel.app/tempbg.png"],
  },
};

export default function RootLayout({ children }) {
  return (<>{children}</>)
}