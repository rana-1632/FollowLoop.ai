import type { Metadata } from "next";
import { Plus_Jakarta_Sans, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-jakarta",
  display: "swap",
  weight: ["400", "500", "600", "700", "800"],
});

const mono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
  weight: ["400", "500"],
});

const siteUrl = "https://followloop.ai";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "FollowLoop.ai — AI Follow-Up & CRM Automation That Never Forgets",
    template: "%s · FollowLoop.ai",
  },
  description:
    "FollowLoop.ai turns raw notes into multi-step follow-up sequences, tracks every reply, and keeps your pipeline moving automatically. The AI-powered CRM copilot built for revenue teams.",
  keywords: [
    "AI follow-up automation",
    "CRM automation software",
    "sales follow-up AI",
    "email sequence generator",
    "AI sales copilot",
    "lead follow-up tool",
    "FollowLoop",
  ],
  authors: [{ name: "FollowLoop.ai" }],
  creator: "FollowLoop.ai",
  publisher: "FollowLoop.ai",
  category: "Business Software",
  formatDetection: { email: false, address: false, telephone: false },
  alternates: { canonical: siteUrl },
  openGraph: {
    type: "website",
    url: siteUrl,
    siteName: "FollowLoop.ai",
    title: "FollowLoop.ai — AI Follow-Up & CRM Automation That Never Forgets",
    description:
      "Turn raw notes into AI-generated follow-up sequences. Track replies, automate outreach, and never let a lead go cold again.",
    locale: "en_US",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "FollowLoop.ai — AI-powered follow-up and CRM automation",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "FollowLoop.ai — AI Follow-Up & CRM Automation That Never Forgets",
    description:
      "Turn raw notes into AI-generated follow-up sequences. Track replies, automate outreach, and never let a lead go cold again.",
    images: ["/og-image.png"],
    creator: "@followloopai",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
    apple: "/favicon.svg",
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "FollowLoop.ai",
  applicationCategory: "BusinessApplication",
  operatingSystem: "Web",
  description:
    "FollowLoop.ai is an AI-powered follow-up and CRM automation platform that generates multi-step email sequences, tracks replies, and keeps pipelines moving automatically.",
  offers: {
    "@type": "AggregateOffer",
    lowPrice: "29",
    highPrice: "89",
    priceCurrency: "USD",
  },
  aggregateRating: {
    "@type": "AggregateRating",
    ratingValue: "4.9",
    ratingCount: "312",
  },
};

import { Providers } from "./providers";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${jakarta.variable} ${mono.variable}`}>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="min-h-screen bg-canvas font-sans text-ink">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}

