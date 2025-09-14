export const viewport = {
  themeColor: "#4e8cff",
}

export const metadata = {
  title: `Privacy Policy`,
  description:
    `Learn how we collect, use, and protect your personal information. Our Privacy Policy outlines your data rights, the security measures we take, and how we ensure transparency. Review this policy to understand how your privacy is handled when using our services or interacting with our platform.`,
  icons: {
    icon: "/CircularLogo.png",
    shortcut: "/CircularLogo.png",
    apple: "/CircularLogo.png",
  },
  openGraph: {
    title: `Privacy Policy`,
    description:
      `Learn how we collect, use, and protect your personal information. Our Privacy Policy outlines your data rights, the security measures we take, and how we ensure transparency. Review this policy to understand how your privacy is handled when using our services or interacting with our platform.`,
    url: `https://eduvance-org.vercel.app/privacy`,
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
    title: `Privacy Policy`,
    description:
      `Learn how we collect, use, and protect your personal information. Our Privacy Policy outlines your data rights, the security measures we take, and how we ensure transparency. Review this policy to understand how your privacy is handled when using our services or interacting with our platform.`,
    images: ["https://eduvance-org.vercel.app/tempbg.png"],
  },
};

import {Home} from '@/components/homenav'
export default function RootLayout({ children }) {
  return (<>{children}</>)
}