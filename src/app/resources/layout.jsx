export const viewport = {
  themeColor: "#4e8cff",
}

export const metadata = {
  title: "Resources",
  description:
    "Browse a diverse library of shared resources — including notes, study guides, slides, and question banks — contributed by both students and teachers. These materials are here to support your learning and foster a more open, collaborative approach to education!",
  icons: {
    icon: "/CircularLogo.png",
    shortcut: "/CircularLogo.png",
    apple: "/CircularLogo.png",
  },
  openGraph: {
    title: "Resources",
    description:
      "Browse a diverse library of shared resources — including notes, study guides, slides, and question banks — contributed by both students and teachers. These materials are here to support your learning and foster a more open, collaborative approach to education!",
    url: `https://eduvance-org.vercel.app/resources`,
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
    title: "Resources",
    description:
      "Browse a diverse library of shared resources — including notes, study guides, slides, and question banks — contributed by both students and teachers. These materials are here to support your learning and foster a more open, collaborative approach to education!",
    images: ["https://eduvance-org.vercel.app/tempbg.png"],
  },
};

export default function RootLayout({ children }) {
  return (<>{children}</>)
}
