"use client";

import React, { useState } from "react";
import { usePathname } from "next/navigation";
import { Header } from "./Header";
import { Sidebar } from "./Sidebar";
import { MobileNavigation } from "./MobileNavigation";

import { useApp } from "@/lib/AppContext";
import { AnimatedBackground } from "../ui/AnimatedBackground";
import { ToastContainer } from "../ui/Toast";

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [isSidebarMobileOpen, setIsSidebarMobileOpen] = useState(false);
  const { toasts, removeToast } = useApp();
  const mainRef = React.useRef<HTMLElement>(null);

  // Khóa cứng thanh cuộn của window / document, đảm bảo chỉ có khu vực main được cuộn
  React.useEffect(() => {
    const lockScroll = () => {
      if (window.scrollY !== 0 || window.scrollX !== 0) {
        window.scrollTo(0, 0);
      }
    };
    window.addEventListener("scroll", lockScroll, { passive: true });
    window.scrollTo(0, 0);
    return () => window.removeEventListener("scroll", lockScroll);
  }, [pathname]);

  // Tự động cuộn phần main lên đầu trang khi chuyển trang
  React.useEffect(() => {
    if (mainRef.current) {
      mainRef.current.scrollTop = 0;
    }
  }, [pathname]);

  // Trang đăng nhập (/login) là trang riêng biệt độc lập: KHÔNG hiển thị Header, Sidebar hay Mobile Navigation
  if (pathname === "/login") {
    return (
      <div className="fixed inset-0 overflow-y-auto bg-white">
        <ToastContainer toasts={toasts} onDismiss={removeToast} />
        {children}
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-slate-50 text-slate-800 flex flex-col font-sans antialiased selection:bg-blue-100 selection:text-blue-900 overflow-hidden">
      {/* Toast Notification Container in Top-Right */}
      <ToastContainer toasts={toasts} onDismiss={removeToast} />
      
      {/* Dynamic Animated Background Layer đồng bộ giống trang Login */}
      <AnimatedBackground />

      {/* 1. Header cố định trên cùng */}
      <Header
        onToggleSidebar={() => setIsSidebarMobileOpen((prev) => !prev)}
      />

      {/* 2. Main Layout: Sidebar cố định bên trái + Khu vực Main cuộn độc lập */}
      <div className="flex-1 flex min-h-0 w-full relative overflow-hidden">
        {/* Compact Sidebar (Cố định vị trí trên laptop, PC, pad - không bị cuộn theo nội dung) */}
        <Sidebar
          isMobileOpen={isSidebarMobileOpen}
          onCloseMobile={() => setIsSidebarMobileOpen(false)}
        />

        {/* Dynamic Main Content Container: Chỉ cuộn chuột tại khu vực này */}
        <main
          ref={mainRef}
          className="flex-1 min-w-0 h-full overflow-y-auto pb-20 md:pb-12 focus:outline-none"
        >
          {/* Responsive margin as defined in Sections 3, 24, 42 */}
          <div className="px-2 sm:px-6 lg:px-8 py-4 sm:py-6 max-w-7xl mx-auto w-full">
            {children}
          </div>
        </main>
      </div>

      {/* 3. Mobile Bottom Navigation */}
      <MobileNavigation />
    </div>
  );
}
