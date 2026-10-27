import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Gatherly — AI Celebration & Event Planner",
  description:
    "Intelligent planning assistant for weddings, birthdays, community festivals, and celebrations. Complete with reconciled budgets, dynamic timelines, vendor management, and personalized ideas.",
  keywords: [
    "event planner",
    "wedding planner",
    "birthday planner",
    "budget reconciliation",
    "vendor checklist",
    "event timeline",
    "AI planning assistant",
  ],
  authors: [{ name: "Gatherly Team" }],
  openGraph: {
    title: "Gatherly — AI Celebration & Event Planner",
    description:
      "Design unforgettable celebrations with GenAI-powered budgets, timelines, checklists, and personalized ideas.",
    type: "website",
  },
};

export const viewport: Viewport = {
  themeColor: "#090d16",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full dark">
      <body
        className={`${geistSans.variable} ${geistMono.variable} min-h-screen bg-[#090d16] text-slate-100 antialiased selection:bg-violet-500 selection:text-white`}
      >
        <div className="relative min-h-screen flex flex-col">{children}</div>
      </body>
    </html>
  );
}
