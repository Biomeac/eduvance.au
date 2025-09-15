export const viewport = {
  themeColor: "#4e8cff",
}

export const metadata = {
  title: "Contribute",
  description:
    "Whether a student, or teacher, your notes, guides, slides, question banks, or original content can help others succeed. By contributing, you are not just uploading files — but making education more accessible, collaborative, and powerful!",
  icons: {
    icon: "/BlueSolo.svg",
    shortcut: "/BlueSolo.svg",
    apple: "/BlueSolo.svg",
  },
  openGraph: {
    title: "Contribute",
    description:
      "Whether a student, or teacher, your notes, guides, slides, question banks, or original content can help others succeed. By contributing, you are not just uploading files — but making education more accessible, collaborative, and powerful!",
    url: `https://eduvance-org.vercel.app/contributor`,
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
    title: "Contribute",
    description:
      "Whether a student, or teacher, your notes, guides, slides, question banks, or original content can help others succeed. By contributing, you are not just uploading files — but making education more accessible, collaborative, and powerful!",
    images: ["https://eduvance-org.vercel.app/tempbg.png"],
  },
};

export default function RootLayout({ children }) {
  return (<>{children}</>)
}
