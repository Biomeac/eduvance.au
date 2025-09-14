export const viewport = {
  themeColor: "#4e8cff",
}

export const metadata = {
  title: `Community Notes`,
  description:
    `Discover clear, concise notes and study guides, created by students and teachers who get what works. Ideal for exam preparation or topic review, these resources are made to support your learning every step of the way!`,
  icons: {
    icon: "/BlueSolo.svg",
    shortcut: "/BlueSolo.svg",
    apple: "/BlueSolo.svg",
  },
  openGraph: {
    title: `Community Notes`,
    description:
      `Discover clear, concise notes and study guides, created by students and teachers who get what works. Ideal for exam preparation or topic review, these resources are made to support your learning every step of the way!`,
    url: `https://eduvance-org.vercel.app/communityNotes`,
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
    title: `Community Notes`,
    description:
      `Discover clear, concise notes and study guides, created by students and teachers who get what works. Ideal for exam preparation or topic review, these resources are made to support your learning every step of the way!`,
    images: ["https://eduvance-org.vercel.app/tempbg.png"],
  },
};

import {Home} from '@/components/homenav'
export default function RootLayout({ children }) {
  return (<><Home showExtra/> {children}</>)
}