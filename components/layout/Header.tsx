"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useApp } from "@/lib/AppContext";
import { Icons } from "../ui/Icons";
import { UserRole } from "@/types";
import { SCHOOL_NAME } from "@/lib/constants";

interface HeaderProps {
  onToggleSidebar?: () => void;
}

export function Header({ onToggleSidebar }: HeaderProps) {
  const { activeRole, switchRole, currentUser } = useApp();
  const [showRoleMenu, setShowRoleMenu] = useState(false);
  const [showNotificationMenu, setShowNotificationMenu] = useState(false);

  const rolesList: { role: UserRole; label: string; desc: string }[] = [
    {
      role: "SUPER_ADMIN",
      label: "Super Admin",
      desc: "Quản trị cấp cao & Phân quyền",
    },
    {
      role: "ADMIN",
      label: "Admin",
      desc: "Ban Thi đua & Quản lý toàn trường",
    },
    {
      role: "TEACHER",
      label: "Giáo viên",
      desc: "GVCN & Giảng dạy bộ môn",
    },
    {
      role: "STUDENT",
      label: "Học sinh",
      desc: "Tra cứu điểm thi đua cá nhân & lớp",
    },
  ];

  return (
    <header className="sticky top-0 z-40 w-full shrink-0 bg-gradient-to-r from-blue-700 via-blue-600 to-sky-600 text-white shadow-md border-b border-blue-500/30">

      <div className="px-2.5 sm:px-6 lg:px-8 h-14 sm:h-16 flex items-center justify-between gap-1.5 sm:gap-4">
        {/* Left: Mobile hamburger + Brand & School Badge */}
        <div className="flex items-center gap-1.5 sm:gap-3 min-w-0">
          <button
            onClick={onToggleSidebar}
            className="md:hidden p-1.5 sm:p-2 text-white/90 hover:text-white rounded-lg sm:rounded-xl hover:bg-white/10 transition-colors cursor-pointer shrink-0"
            aria-label="Toggle Menu"
          >
            <Icons.Menu className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>

          <Link href="/" className="flex items-center gap-2 sm:gap-2.5 group shrink-0">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-white text-blue-600 flex items-center justify-center shadow-md group-hover:scale-105 transition-transform shrink-0">
              <Icons.Trophy className="w-4 h-4 sm:w-5 sm:h-5 text-amber-500" />
            </div>
            <div>
              <div className="flex items-center gap-1.5 sm:gap-2">
                <span className="text-base sm:text-xl font-black text-white tracking-tight">
                  EduRank
                </span>
                <span className="hidden sm:inline-flex text-[11px] font-bold tracking-wide text-blue-900 bg-blue-100 px-2 py-0.5 rounded-full shadow-2xs">
                  THCS
                </span>
              </div>
              <p className="text-[11px] text-blue-100 font-medium hidden md:block">
                {SCHOOL_NAME}
              </p>
            </div>
          </Link>
        </div>

        {/* Right Action Controls */}
        <div className="flex items-center gap-1 sm:gap-3 shrink-0">
          {/* Notifications Bell */}
          <div className="relative" suppressHydrationWarning>
            <button
              onClick={() => setShowNotificationMenu(!showNotificationMenu)}
              className="p-1.5 sm:p-2 text-white/90 hover:text-white rounded-lg sm:rounded-xl hover:bg-white/10 transition-colors relative cursor-pointer"
              aria-label="Thông báo"
              suppressHydrationWarning
            >
              <Icons.Bell className="w-4 h-4 sm:w-5 sm:h-5" />
              <span className="absolute top-1 right-1 sm:top-1.5 sm:right-1.5 w-2 h-2 rounded-full bg-rose-400 ring-2 ring-blue-700" />
            </button>

            {showNotificationMenu && (
              <div className="absolute right-0 mt-2 w-72 sm:w-80 bg-white text-slate-800 rounded-2xl shadow-2xl border border-slate-100 p-3 z-50 animate-in fade-in duration-150">
                <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                  <h4 className="text-xs font-bold text-slate-800">
                    Thông báo thi đua mới
                  </h4>
                  <span className="text-[10px] bg-blue-50 text-blue-600 font-semibold px-2 py-0.5 rounded-full">
                    3 mới
                  </span>
                </div>
                <div className="divide-y divide-slate-100 py-1 text-xs">
                  <div className="py-2">
                    <p className="font-semibold text-slate-800">
                      🏆 Cập nhật xếp hạng Tuần 6
                    </p>
                    <p className="text-slate-500 text-[11px] mt-0.5">
                      Lớp 9A1 đang dẫn đầu bảng thi đua 14 lớp toàn trường (+185 điểm).
                    </p>
                    <span className="text-[10px] text-slate-400">10 phút trước</span>
                  </div>
                  <div className="py-2">
                    <p className="font-semibold text-slate-800">
                      ⭐ Gương người tốt việc tốt
                    </p>
                    <p className="text-slate-500 text-[11px] mt-0.5">
                      Học sinh Trần Mai Phương (6A1) vừa được cộng +10 điểm.
                    </p>
                    <span className="text-[10px] text-slate-400">1 giờ trước</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Divider */}
          <div className="h-5 sm:h-6 w-px bg-white/20 hidden sm:block" />

          {/* User Profile Clickable Trigger (Section 5) */}
          <Link
            href="/profile"
            className="flex items-center gap-1.5 sm:gap-2.5 p-0.5 sm:p-1 rounded-lg sm:rounded-xl hover:bg-white/10 transition-all cursor-pointer group shrink-0"
            title="Xem hồ sơ cá nhân (Tôi)"
            suppressHydrationWarning
          >
            <div className="w-7 h-7 sm:w-9 sm:h-9 rounded-lg sm:rounded-xl bg-white text-blue-700 font-extrabold flex items-center justify-center text-xs sm:text-sm shadow-xs group-hover:scale-105 group-hover:ring-2 group-hover:ring-white/40 transition-all shrink-0 overflow-hidden" suppressHydrationWarning>
              {currentUser.avatarUrl ? (
                <img
                  src={currentUser.avatarUrl}
                  alt={currentUser.fullName}
                  className="w-full h-full object-cover"
                />
              ) : (
                currentUser.fullName ? currentUser.fullName.split(" ").slice(-1)[0][0] : "A"
              )}
            </div>
            <div className="hidden lg:block text-left" suppressHydrationWarning>
              <div className="text-xs font-bold text-white group-hover:text-blue-100 transition-colors flex items-center gap-1">
                <span>{currentUser.fullName}</span>
                <Icons.ChevronRight className="w-3 h-3 opacity-60 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all" />
              </div>
              <div className="text-[10px] font-semibold text-blue-100/90 flex items-center gap-1">
                {currentUser.roles?.join(" · ")}
              </div>
            </div>
          </Link>
        </div>
      </div>
    </header>
  );
}
