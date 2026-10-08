import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AppProvider } from "@/lib/AppContext";
import { AppShell } from "@/components/layout/AppShell";

const geistSans = Geist({
  variable: "--font-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "EduRank — Hệ Thống Quản Lý Thi Đua Học Sinh",
  description:
    "Hệ thống quản lý, theo dõi và xếp hạng thi đua học sinh Trường THCS Na Sầm.",
};

import React, { Suspense } from "react";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="vi" className={`h-full h-[100dvh] overflow-hidden ${geistSans.variable} ${geistMono.variable}`} suppressHydrationWarning>
      <body className="h-full h-[100dvh] overflow-hidden bg-slate-50 font-sans text-slate-800 antialiased" suppressHydrationWarning>
        <AppProvider>
          <Suspense fallback={null}>
            <AppShell>{children}</AppShell>
          </Suspense>
        </AppProvider>
      </body>
    </html>
  );
}
