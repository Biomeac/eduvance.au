export const viewport = {
  themeColor: "#4e8cff",
}

export const metadata = {
  title: `Terms of Service`,
  description:
    `Read our Terms of Service to understand the rules, responsibilities, and guidelines for using our website or app. This agreement outlines your rights, limitations, and acceptable use of our services. By accessing our platform, you agree to these terms that help ensure a safe and fair experience for everyone.`,
  icons: {
    icon: "/CircularLogo.png",
    shortcut: "/CircularLogo.png",
    apple: "/CircularLogo.png",
  },
  openGraph: {
    title: `Terms of Service`,
    description:
      `Read our Terms of Service to understand the rules, responsibilities, and guidelines for using our website or app. This agreement outlines your rights, limitations, and acceptable use of our services. By accessing our platform, you agree to these terms that help ensure a safe and fair experience for everyone.`,
    url: `https://eduvance-org.vercel.app/terms`,
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
    title: `Terms of Service`,
    description:
      `Read our Terms of Service to understand the rules, responsibilities, and guidelines for using our website or app. This agreement outlines your rights, limitations, and acceptable use of our services. By accessing our platform, you agree to these terms that help ensure a safe and fair experience for everyone.`,
    images: ["https://eduvance-org.vercel.app/tempbg.png"],
  },
};

import {Home} from '@/components/homenav'
export default function RootLayout({ children }) {
  return (<>{children}</>)
}