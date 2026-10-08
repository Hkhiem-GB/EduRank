"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useApp } from "@/lib/AppContext";
import { Icons } from "../ui/Icons";
import { ROLE_NAVIGATION } from "@/config/navigation";
import { Modal } from "../ui/Modal";
import { Button } from "../ui/Button";

interface SidebarProps {
  isMobileOpen?: boolean;
  onCloseMobile?: () => void;
}

export function Sidebar({ isMobileOpen = false, onCloseMobile }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { activeRole, classes, statistics } = useApp();
  const [collapsed, setCollapsed] = useState(false);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);

  const navGroups = ROLE_NAVIGATION[activeRole] || [];

  // Helper to resolve icon by name
  const renderIcon = (name: string, className = "w-4 h-4") => {
    switch (name) {
      case "LayoutDashboard":
        return <Icons.LayoutDashboard className={className} />;
      case "Trophy":
        return <Icons.Trophy className={className} />;
      case "School":
        return <Icons.School className={className} />;
      case "Users":
        return <Icons.Users className={className} />;
      case "UserCheck":
        return <Icons.UserCheck className={className} />;
      case "ShieldCheck":
        return <Icons.ShieldCheck className={className} />;
      case "History":
        return <Icons.History className={className} />;
      case "User":
        return <Icons.User className={className} />;
      case "BookOpen":
        return <Icons.BookOpen className={className} />;
      default:
        return <Icons.Award className={className} />;
    }
  };

  const handleConfirmLogout = () => {
    setIsLogoutModalOpen(false);
    if (onCloseMobile) onCloseMobile();
    router.push("/login");
  };

  const sidebarContent = (
    <div
      className="flex flex-col h-full bg-white border-r border-slate-200/80 shadow-2xs select-none overflow-hidden"
      onWheel={(e) => {
        // Chuyển toàn bộ thao tác cuộn chuột sang phần main, sidebar cố định tuyệt đối không cuộn
        const mainEl = document.querySelector("main");
        if (mainEl) {
          mainEl.scrollTop += e.deltaY;
        }
      }}
    >
      {/* Top Sidebar info */}
      <div className="p-3 sm:p-4 border-b border-slate-100 flex items-center justify-between shrink-0">
        {!collapsed && (
          <div>
            <span className="text-xs font-bold text-slate-800 uppercase tracking-wider block">
              Menu điều hướng
            </span>
            <span className="text-[11px] text-blue-600 font-bold">
              Khu vực {activeRole}
            </span>
          </div>
        )}
        {/* Mobile close button */}
        <button
          onClick={onCloseMobile}
          className="md:hidden p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors ml-auto cursor-pointer"
          title="Đóng menu"
        >
          <Icons.X className="w-5 h-5" />
        </button>
        {/* Desktop collapse button */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="hidden md:flex p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors ml-auto cursor-pointer"
          title={collapsed ? "Mở rộng menu" : "Thu gọn menu"}
        >
          {collapsed ? (
            <Icons.ChevronRight className="w-4 h-4" />
          ) : (
            <Icons.ChevronLeft className="w-4 h-4" />
          )}
        </button>
      </div>

      {/* Navigation Links - Hoàn toàn không cuộn, cố định vị trí */}
      <div className="flex-1 overflow-hidden px-2.5 sm:px-3 py-2 sm:py-3 space-y-3 sm:space-y-4">
        {navGroups.map((group, gIdx) => (
          <div key={gIdx} className="space-y-0.5 sm:space-y-1">
            {!collapsed && (
              <h5 className="px-2.5 sm:px-3 text-[10px] sm:text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1 sm:mb-1.5">
                {group.title}
              </h5>
            )}
            {group.items.map((item) => {
              const isActive =
                pathname === item.href ||
                (item.href !== "/" && pathname.startsWith(item.href));

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={onCloseMobile}
                  className={`flex items-center gap-2.5 sm:gap-3 px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-xl text-xs font-medium transition-all duration-200 cursor-pointer ${
                    isActive
                      ? "bg-blue-600 text-white font-bold shadow-sm shadow-blue-500/20 translate-x-0.5"
                      : "text-slate-600 hover:text-slate-900 hover:bg-slate-100/90 hover:translate-x-0.5"
                  } ${collapsed ? "justify-center px-2" : ""}`}
                  title={collapsed ? item.label : undefined}
                >
                  <span className="shrink-0">
                    {renderIcon(
                      item.iconName,
                      `w-4 h-4 ${isActive ? "text-white" : "text-slate-500"}`
                    )}
                  </span>
                  {!collapsed && <span className="truncate">{item.label}</span>}
                </Link>
              );
            })}
          </div>
        ))}
      </div>

      {/* Fixed Logout Button & Bottom School Badge */}
      <div className="p-2.5 sm:p-3 border-t border-slate-100 bg-slate-50/50 space-y-2 shrink-0">
        {/* Nút Đăng xuất đặt TRÊN trường học */}
        <button
          onClick={() => setIsLogoutModalOpen(true)}
          className={`w-full flex items-center gap-2.5 px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-xl text-xs font-bold text-rose-600 hover:text-rose-700 hover:bg-rose-50 transition-all cursor-pointer border border-transparent hover:border-rose-200 active:scale-98 ${
            collapsed ? "justify-center px-2" : ""
          }`}
          title="Đăng xuất khỏi hệ thống"
        >
          <Icons.LogOut className="w-4 h-4 shrink-0 text-rose-500" />
          {!collapsed && <span>Đăng xuất</span>}
        </button>

        {!collapsed && (
          <div className="p-2 sm:p-2.5 bg-white rounded-xl border border-slate-200/60 shadow-2xs">
            <div className="flex items-center gap-2 text-blue-700 font-bold text-xs">
              <Icons.School className="w-4 h-4 text-blue-600" />
              <span>THCS Na Sầm</span>
            </div>
            <div className="mt-1 text-[10px] bg-blue-50 text-blue-700 px-2 py-0.5 rounded-md font-semibold text-center">
              {classes.length} Lớp · {statistics.totalStudents} Học sinh
            </div>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar (Slim ~220px or 64px collapsed, cố định hoàn toàn theo chiều cao viewport) */}
      <aside
        className={`hidden md:block shrink-0 transition-all duration-200 h-full z-30 ${
          collapsed ? "w-16" : "w-[220px]"
        }`}
      >
        {sidebarContent}
      </aside>

      {/* Mobile Sidebar Overlay Drawer (Flushed between Header bottom and MobileNav top) */}
      {isMobileOpen && (
        <div className="fixed top-14 sm:top-16 bottom-14 inset-x-0 z-40 md:hidden flex">
          {/* Dimmed backdrop covering the exact view between header and bottom nav */}
          <div
            className="fixed top-14 sm:top-16 bottom-14 inset-x-0 bg-slate-900/40 backdrop-blur-xs transition-opacity"
            onClick={onCloseMobile}
          />
          {/* Drawer container: exact height, flush top to header, flush bottom to bottom nav */}
          <div className="relative w-64 max-w-[85vw] bg-white h-full shadow-2xl z-50 flex flex-col border-r border-slate-200/80">
            {sidebarContent}
          </div>
        </div>
      )}

      {/* Custom Confirmation Dialog for Logout (Section 4) */}
      <Modal
        isOpen={isLogoutModalOpen}
        onClose={() => setIsLogoutModalOpen(false)}
        title="Đăng xuất"
        maxWidth="sm"
      >
        <div className="space-y-4">
          <div className="flex items-center gap-3 p-3 bg-rose-50 rounded-xl border border-rose-100 text-rose-800">
            <Icons.LogOut className="w-6 h-6 text-rose-600 shrink-0" />
            <p className="text-sm font-medium">
              Bạn có chắc chắn muốn đăng xuất khỏi hệ thống?
            </p>
          </div>

          <div className="flex items-center justify-end gap-2.5 pt-2">
            <Button
              variant="outline"
              size="md"
              onClick={() => setIsLogoutModalOpen(false)}
            >
              Hủy
            </Button>
            <Button
              variant="danger"
              size="md"
              onClick={handleConfirmLogout}
              icon={<Icons.LogOut className="w-4 h-4" />}
            >
              Đăng xuất
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
}
