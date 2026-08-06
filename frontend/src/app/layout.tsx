import type { Metadata } from "next";
import { Inter, Manrope, Noto_Sans_Devanagari } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

const manrope = Manrope({
  subsets: ["latin"],
  variable: "--font-manrope",
});

const notoSansDevanagari = Noto_Sans_Devanagari({
  subsets: ["devanagari"],
  variable: "--font-devanagari",
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "JanMitra AI — Your AI-Powered Government Scheme Assistant",
  description:
    "Discover government welfare schemes you may be eligible for. Powered by AI and verified using official government documents. Available in multiple Indian languages.",
  keywords: [
    "government schemes",
    "welfare",
    "India",
    "JanMitra",
    "AI assistant",
    "eligibility",
    "benefits",
  ],
  authors: [{ name: "JanMitra AI" }],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap"
          rel="stylesheet"
        />
      </head>
      <body
        className={`${inter.variable} ${manrope.variable} ${notoSansDevanagari.variable} bg-background text-on-background min-h-screen flex flex-col font-body-md antialiased selection:bg-primary-container selection:text-on-primary-container`}
      >
        {/* Tricolor bar at top of every page */}
        <div className="tricolor-bar" aria-hidden="true" />
        {children}
      </body>
    </html>
  );
}
