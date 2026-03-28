import type { Metadata } from "next"
import { spaceGrotesk, ibmPlexMono } from "./fonts"
import "./globals.css"

export const metadata: Metadata = {
  title: "Orbitra - Open Source, Self-Hosted Web Analytics",
  description:
    "Privacy-friendly alternative to Google Analytics with real-time 3D globe visualization. Self-hosted, lightweight 2KB script, no cookies, GDPR compliant.",
  keywords: [
    "web analytics",
    "self-hosted",
    "open source",
    "privacy",
    "GDPR",
    "google analytics alternative",
  ],
  authors: [{ name: "Orbitra" }],
  openGraph: {
    title: "Orbitra - Open Source, Self-Hosted Web Analytics",
    description:
      "Privacy-friendly alternative to Google Analytics with real-time 3D globe visualization.",
    url: "https://orbitra.sh",
    siteName: "Orbitra",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Orbitra - Open Source, Self-Hosted Web Analytics",
    description:
      "Privacy-friendly alternative to Google Analytics with real-time 3D globe visualization.",
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="en"
      className={`${spaceGrotesk.variable} ${ibmPlexMono.variable}`}
    >
      <body className="min-h-screen font-sans antialiased">{children}</body>
    </html>
  )
}
