export const viewport = {
  themeColor: "#4e8cff",
}

export const metadata = {
  title: `Past Papers`,
  description:
    `Browse a complete repository of past papers, sorted by year and session. Perfect for timed practice or marking scheme review — your go-to resource for efficient, up-to-date exam preparation!`,
  icons: {
    icon: "/CircularLogo.png",
    shortcut: "/CircularLogo.png",
    apple: "/CircularLogo.png",
  },
  openGraph: {
    title: `Past Papers`,
    description:
      `Browse a complete repository of past papers, sorted by year and session. Perfect for timed practice or marking scheme review — your go-to resource for efficient, up-to-date exam preparation!`,
    url: `https://eduvance-org.vercel.app/pastPapers`,
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
    title: `Past Papers`,
    description:
      `Browse a complete repository of past papers, sorted by year and session. Perfect for timed practice or marking scheme review — your go-to resource for efficient, up-to-date exam preparation!`,
    images: ["https://eduvance-org.vercel.app/tempbg.png"],
  },
};

import {Home} from '@/components/homenav'
export default function RootLayout({ children }) {
  return (<><Home showExtra/> {children}</>)
}