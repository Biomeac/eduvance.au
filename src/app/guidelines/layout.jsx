export const viewport = {
  themeColor: "#4e8cff",
}

export const metadata = {
  title: `Community Guidelines`,
  description:
    `Learn what behavior is expected, what’s prohibited, and how we handle violations. By participating in our platform, you agree to uphold these standards and contribute to a positive, supportive community experience.`,
  icons: {
    icon: "/CircularLogo.png",
    shortcut: "/CircularLogo.png",
    apple: "/CircularLogo.png",
  },
  openGraph: {
    title: `Community Guidelines`,
    description:
      `Learn what behavior is expected, what’s prohibited, and how we handle violations. By participating in our platform, you agree to uphold these standards and contribute to a positive, supportive community experience.`,
    url: `https://eduvance-org.vercel.app/guidelines`,
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
    title: `Community Guidelines`,
    description:
      `Learn what behavior is expected, what’s prohibited, and how we handle violations. By participating in our platform, you agree to uphold these standards and contribute to a positive, supportive community experience.`,
    images: ["https://eduvance-org.vercel.app/tempbg.png"],
  },
};

import {Home} from '@/components/homenav'
export default function RootLayout({ children }) {
  return (<>{children}</>)
}