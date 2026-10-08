"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useApp } from "@/lib/AppContext";
import { Icons } from "../ui/Icons";

export function MobileNavigation() {
  const pathname = usePathname();
  const { activeRole } = useApp();

  const getNavItems = () => {
    if (activeRole === "STUDENT") {
      return [
        { label: "Tổng quan", href: "/student/dashboard", icon: Icons.LayoutDashboard },
        { label: "Lớp học", href: "/student/class", icon: Icons.Users },
        { label: "Xếp hạng", href: "/ranking", icon: Icons.Trophy },
        { label: "Tôi", href: "/profile", icon: Icons.User },
      ];
    }
    if (activeRole === "TEACHER") {
      return [
        { label: "Tổng quan", href: "/teacher/dashboard", icon: Icons.LayoutDashboard },
        { label: "Lớp của tôi", href: "/teacher/my-class", icon: Icons.School },
        { label: "Cơ sở", href: "/teacher/classes", icon: Icons.Users },
        { label: "Xếp hạng", href: "/ranking", icon: Icons.Trophy },
        { label: "Tôi", href: "/profile", icon: Icons.User },
      ];
    }
    return [
      { label: "Tổng quan", href: "/admin/dashboard", icon: Icons.LayoutDashboard },
      { label: "Cơ sở", href: "/admin/classes", icon: Icons.School },
      { label: "Học sinh", href: "/admin/students", icon: Icons.Users },
      { label: "Giáo viên", href: "/admin/teachers", icon: Icons.UserCheck },
      { label: "Tôi", href: "/profile", icon: Icons.User },
    ];
  };

  const navItems = getNavItems();

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200/80 px-2 shadow-lg flex items-center justify-around h-14">
      {navItems.map((item) => {
        const isActive = pathname === item.href;
        const Icon = item.icon;
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`flex flex-col items-center justify-center py-1 px-2 rounded-xl text-[10px] font-medium transition-colors cursor-pointer ${
              isActive
                ? "text-blue-600 font-bold"
                : "text-slate-500 hover:text-slate-800"
            }`}
          >
            <Icon className={`w-5 h-5 mb-0.5 ${isActive ? "text-blue-600" : "text-slate-400"}`} />
            <span>{item.label}</span>
          </Link>
        );
      })}
    </div>
  );
}
