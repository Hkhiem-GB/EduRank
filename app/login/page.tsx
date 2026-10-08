"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useApp } from "@/lib/AppContext";

// ==================== ICONS ====================
// Biểu tượng ngôi trường vẽ nét theo đúng bản phác thảo của người dùng
function SchoolHouseLogo({ className = "w-16 h-16" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Cột cờ và lá cờ trên đỉnh mái */}
      <path
        d="M32 4V14M32 6L40 9.5L32 13"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Mái tam giác trường học */}
      <path
        d="M10 28L32 12L54 28"
        stroke="currentColor"
        strokeWidth="3.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Tường nhà chính */}
      <path
        d="M17 28V52H47V28"
        stroke="currentColor"
        strokeWidth="2.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Gian phụ 2 bên (cánh trái & cánh phải như bản vẽ phác thảo) */}
      <path
        d="M8 38V52H17M47 52H56V38"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Cửa chính ra vào */}
      <path
        d="M27 52V39H37V52"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Ô cửa sổ tròn trên gác mái */}
      <circle
        cx="32"
        cy="25"
        r="3.5"
        fill="currentColor"
        fillOpacity="0.18"
        stroke="currentColor"
        strokeWidth="2"
      />
      {/* Đường chân móng đất */}
      <path
        d="M4 52H60"
        stroke="currentColor"
        strokeWidth="3.2"
        strokeLinecap="round"
      />
    </svg>
  );
}

function EyeIcon({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

function EyeOffIcon({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24" />
      <path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68" />
      <path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61" />
      <line x1="2" y1="22" y2="22" />
    </svg>
  );
}

function BookOpenIcon({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
      <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
    </svg>
  );
}

function UserIcon({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  );
}

function ArrowLeftIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <line x1="19" y1="12" x2="5" y2="12" />
      <polyline points="12 19 5 12 12 5" />
    </svg>
  );
}
import { AnimatedBackground } from "@/components/ui/AnimatedBackground";

// ==================== MAIN LOGIN PAGE ====================
export default function LoginPage() {
  const router = useRouter();
  const { switchRole, loginUser } = useApp();

  // Screen State: null = Screen 1 (Chọn vai trò), "TEACHER" | "STUDENT" | "ADMIN" = Screen 2 (Điền thông tin)
  const [selectedRole, setSelectedRole] = useState<"TEACHER" | "STUDENT" | "ADMIN" | null>(null);

  // Form States
  const [fullName, setFullName] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberPassword, setRememberPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Custom Toast Notification State
  const [toast, setToast] = useState<{
    message: string;
    type: "success" | "error" | "info";
  } | null>(null);

  const showNotification = (
    message: string,
    type: "success" | "error" | "info" = "success"
  ) => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 3500);
  };

  // Chọn vai trò ở Screen 1
  const handleSelectRole = (role: "TEACHER" | "STUDENT" | "ADMIN") => {
    setSelectedRole(role);
    // Điền trước thông tin mẫu thuận tiện
    if (role === "TEACHER") {
      setFullName("GV002");
      setPassword("123456");
    } else if (role === "STUDENT") {
      setFullName("HS001");
      setPassword("123456");
    } else {
      setFullName("ADMIN");
      setPassword("123456");
    }
  };

  // Quay lại Screen 1
  const handleBackToScreen1 = () => {
    setSelectedRole(null);
    setIsLoading(false);
  };

  // Submit Form ở Screen 2
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // 1. Validation kiểm tra trống
    if (!fullName.trim() && !password.trim()) {
      showNotification("Vui lòng nhập họ tên hoặc mã tài khoản và mật khẩu!", "error");
      return;
    }
    if (!fullName.trim()) {
      showNotification("Vui lòng nhập họ tên hoặc mã tài khoản!", "error");
      return;
    }
    if (!password.trim()) {
      showNotification("Vui lòng nhập mật khẩu!", "error");
      return;
    }

    // 2. Đăng nhập thực tế qua API Backend
    setIsLoading(true);
    try {
      const ok = await loginUser(fullName.trim(), password, selectedRole || undefined);
      if (ok) {
        showNotification(
          `Đăng nhập thành công! Chào mừng ${fullName} đến với EduRank.`,
          "success"
        );
      } else {
        showNotification("Tài khoản hoặc mật khẩu không chính xác!", "error");
      }
    } catch (err: any) {
      showNotification(err.message || "Lỗi kết nối khi đăng nhập.", "error");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[100dvh] h-full sm:min-h-screen flex flex-col justify-between bg-slate-50/50 text-slate-800 font-sans selection:bg-blue-100 selection:text-blue-900 relative overflow-x-hidden">
      {/* ================= BACKGROUND ĐỘNG LẶP ĐI LẶP LẠI (CHO CẢ 2 TRẠNG THÁI) ================= */}
      <AnimatedBackground />

      {/* ================= TOAST NOTIFICATION (MÀU XANH / ĐỎ) ================= */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -25, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            transition={{ duration: 0.25 }}
            className={`fixed top-4 sm:top-6 right-3 sm:right-6 z-50 flex items-center gap-2.5 sm:gap-3 px-3.5 sm:px-4 py-2.5 sm:py-3 rounded-2xl shadow-xl border text-xs sm:text-sm font-semibold backdrop-blur-md ${
              toast.type === "success"
                ? "bg-emerald-50/95 border-emerald-300 text-emerald-800 shadow-emerald-500/10"
                : toast.type === "error"
                ? "bg-rose-50/95 border-rose-300 text-rose-800 shadow-rose-500/10"
                : "bg-blue-50/95 border-blue-300 text-blue-800 shadow-blue-500/10"
            }`}
          >
            {toast.type === "success" && (
              <span className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-emerald-500 text-white flex items-center justify-center shrink-0 text-xs">
                ✓
              </span>
            )}
            {toast.type === "error" && (
              <span className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-rose-500 text-white flex items-center justify-center shrink-0 text-xs">
                ✕
              </span>
            )}
            {toast.type === "info" && (
              <span className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-blue-500 text-white flex items-center justify-center shrink-0 text-xs">
                i
              </span>
            )}
            <span>{toast.message}</span>
            <button
              onClick={() => setToast(null)}
              className="ml-2 text-slate-400 hover:text-slate-600 cursor-pointer p-0.5"
            >
              ✕
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ================= 1. VIỀN XANH DƯƠNG MÉP TRÊN (TOP BLUE BORDER) ================= */}
      <header className="w-full h-8 sm:h-10 md:h-14 bg-gradient-to-r from-blue-700 via-blue-600 to-sky-500 shrink-0 shadow-sm relative z-20 overflow-hidden">
        <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:16px_16px]" />
        <div className="max-w-7xl mx-auto h-full flex items-center justify-between px-3.5 sm:px-8 text-white/90 text-xs font-semibold">
          <span className="tracking-wide text-sm sm:text-base md:text-xl font-bold">
            EDURANK
          </span>
          <span className="text-[10px] sm:text-xs text-blue-100/90 ml-auto">
          </span>
        </div>
      </header>

      {/* ================= 2. KHU VỰC CHÍNH Ở GIỮA (HIỂN THỊ NỀN ĐỘNG & CARD GLASSMORPHISM) ================= */}
      <main className="flex-1 flex items-center justify-center p-2.5 sm:p-4 md:p-6 w-full max-w-5xl mx-auto my-auto relative z-10">
        <AnimatePresence mode="wait">
          {/* ============================================================ */}
          {/* TRẠNG THÁI 1: MÀN HÌNH CHỌN VAI TRÒ (SCREEN 1)               */}
          {/* ============================================================ */}
          {!selectedRole ? (
            <motion.div
              key="screen-1"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="flex flex-col items-center justify-center text-center w-full max-w-sm sm:max-w-md mx-auto py-5 px-4 sm:py-7 sm:px-8 md:py-8 md:px-8 rounded-2xl sm:rounded-3xl bg-white/90 backdrop-blur-md border border-white/80 shadow-xl shadow-blue-900/5 relative z-10"
            >
              {/* Logo trường học (layoutId để morphing sang Screen 2) */}
              <motion.div
                layoutId="school-logo-morph"
                transition={{ type: "spring", stiffness: 320, damping: 28 }}
                className="w-16 h-16 sm:w-20 sm:h-20 md:w-28 md:h-28 rounded-2xl sm:rounded-3xl bg-blue-50/90 border-2 border-blue-200 shadow-md shadow-blue-500/10 flex items-center justify-center text-blue-600 mb-3 sm:mb-4 md:mb-5"
              >
                <SchoolHouseLogo className="w-9 h-9 sm:w-12 sm:h-12 md:w-16 md:h-16" />
              </motion.div>

              {/* Dòng chữ tiêu đề: "Trường THCS NA SẦM" (layoutId để morphing) */}
              <motion.div
                layoutId="school-title-morph"
                transition={{ type: "spring", stiffness: 320, damping: 28 }}
                className="text-center"
              >
                <h1 className="text-xl sm:text-2xl md:text-3xl font-black text-blue-900 tracking-tight uppercase">
                  Trường THCS NA SẦM
                </h1>
              </motion.div>

              {/* Dòng chữ phụ: "Đăng nhập" */}
              <motion.p
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.25, delay: 0.1 }}
                className="text-sm sm:text-base md:text-lg font-bold text-slate-600 mt-1 sm:mt-2 md:mt-2.5 mb-4 sm:mb-6 md:mb-8"
              >
                Đăng nhập
              </motion.p>

              {/* Hai nút bấm nằm ngang nhau: "Giáo viên" và "Học sinh" */}
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                transition={{ duration: 0.3, delay: 0.15 }}
                className="flex flex-row items-center justify-center gap-3 sm:gap-5 w-full"
              >
                {/* Nút Giáo viên */}
                <motion.button
                  whileHover={{
                    y: -4,
                    scale: 1.02,
                    boxShadow: "0 12px 24px -6px rgba(37, 99, 235, 0.25)",
                  }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleSelectRole("TEACHER")}
                  className="flex-1 py-2.5 sm:py-3.5 md:py-4 px-3 sm:px-6 rounded-xl sm:rounded-2xl bg-white border-2 border-blue-600 text-blue-700 font-bold text-xs sm:text-sm md:text-base shadow-sm hover:bg-blue-600 hover:text-white transition-colors duration-200 cursor-pointer flex items-center justify-center gap-1.5 sm:gap-2 group"
                >
                  <BookOpenIcon className="w-4 h-4 sm:w-5 sm:h-5 shrink-0 group-hover:scale-110 transition-transform" />
                  <span>Giáo viên</span>
                </motion.button>

                {/* Nút Học sinh */}
                <motion.button
                  whileHover={{
                    y: -4,
                    scale: 1.02,
                    boxShadow: "0 12px 24px -6px rgba(37, 99, 235, 0.25)",
                  }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleSelectRole("STUDENT")}
                  className="flex-1 py-2.5 sm:py-3.5 md:py-4 px-3 sm:px-6 rounded-xl sm:rounded-2xl bg-white border-2 border-blue-600 text-blue-700 font-bold text-xs sm:text-sm md:text-base shadow-sm hover:bg-blue-600 hover:text-white transition-colors duration-200 cursor-pointer flex items-center justify-center gap-1.5 sm:gap-2 group"
                >
                  <UserIcon className="w-4 h-4 sm:w-5 sm:h-5 shrink-0 group-hover:scale-110 transition-transform" />
                  <span>Học sinh</span>
                </motion.button>
              </motion.div>

              {/* Lối tắt quản trị viên */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="mt-4 sm:mt-6 md:mt-8 pt-3 sm:pt-4 border-t border-slate-100 w-full"
              >
                <button
                  onClick={() => handleSelectRole("ADMIN")}
                  className="text-[11px] sm:text-xs text-slate-400 hover:text-blue-600 font-medium transition-colors cursor-pointer"
                >
                  Đăng nhập dành cho Ban Quản Trị / BGH trường →
                </button>
              </motion.div>
            </motion.div>
          ) : (
            /* ============================================================ */
            /* TRẠNG THÁI 2: MÀN HÌNH ĐIỀN THÔNG TIN (SCREEN 2 - SPLIT)     */
            /* ============================================================ */
            <motion.div
              key="screen-2"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="w-full max-w-sm sm:max-w-md md:max-w-4xl"
            >
              <div className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200/90 shadow-2xl shadow-blue-900/5 overflow-hidden grid grid-cols-1 md:grid-cols-2 md:min-h-[460px]">
                {/* ---------------- CỘT BÊN TRÁI ---------------- */}
                <div className="bg-gradient-to-br from-blue-50/90 via-sky-50/50 to-blue-100/60 p-3 sm:p-5 md:p-10 flex flex-col md:justify-between border-b md:border-b-0 md:border-r border-slate-200/80 relative">
                  {/* Hàng điều hướng trên cùng: Nút quay lại & Badge vai trò */}
                  <div className="flex items-center justify-between w-full mb-1.5 sm:mb-2 md:mb-4">
                    <button
                      onClick={handleBackToScreen1}
                      className="inline-flex items-center gap-1 sm:gap-1.5 text-[11px] sm:text-xs font-bold text-blue-600 hover:text-blue-800 transition-colors cursor-pointer group"
                    >
                      <ArrowLeftIcon className="w-3.5 h-3.5 group-hover:-translate-x-1 transition-transform" />
                      <span>Chọn lại vai trò</span>
                    </button>

                    {/* Badge hiển thị vai trò trên Mobile (trên desktop hiển thị ở cột bên phải) */}
                    <span className="md:hidden text-[10px] sm:text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-blue-100/90 text-blue-700 border border-blue-200 shrink-0">
                      {selectedRole === "TEACHER"
                        ? "Giáo viên"
                        : selectedRole === "STUDENT"
                        ? "Học sinh"
                        : "Ban Quản Trị"}
                    </span>
                  </div>

                  {/* Khu vực nhận diện thương hiệu trường học:
                      - Trên Mobile: Hàng ngang (flex-row) siêu gọn gàng, logo vừa vặn bên cạnh tên trường.
                      - Trên Desktop: Cột dọc (flex-col) to đẹp, trang trọng ở giữa. */}
                  <div className="flex flex-row md:flex-col items-center md:justify-center text-left md:text-center gap-2.5 sm:gap-3.5 md:gap-0 my-0.5 md:my-auto md:py-4">
                    {/* Morphing Logo */}
                    <motion.div
                      layoutId="school-logo-morph"
                      transition={{ type: "spring", stiffness: 320, damping: 28 }}
                      className="w-10 h-10 sm:w-12 sm:h-12 md:w-24 md:h-24 rounded-xl sm:rounded-2xl md:rounded-3xl bg-white border border-blue-200 md:border-2 shadow-sm md:shadow-md shadow-blue-500/10 flex items-center justify-center text-blue-600 shrink-0 md:mb-5"
                    >
                      <SchoolHouseLogo className="w-6 h-6 sm:w-7 sm:h-7 md:w-14 md:h-14" />
                    </motion.div>

                    {/* Morphing Title */}
                    <motion.div
                      layoutId="school-title-morph"
                      transition={{ type: "spring", stiffness: 320, damping: 28 }}
                      className="text-left md:text-center"
                    >
                      <span className="text-[9px] sm:text-[10px] md:text-[11px] font-bold uppercase tracking-wider text-blue-600 block leading-tight md:mb-1">
                        Welcome to
                      </span>
                      <h2 className="text-sm sm:text-base md:text-2xl font-black text-blue-950 tracking-tight leading-tight">
                        TRƯỜNG THCS NA SẦM
                      </h2>
                    </motion.div>

                    {/* Mô tả phụ: ẩn trên mobile để tiết kiệm chiều cao */}
                    <p className="hidden md:block text-xs sm:text-sm text-slate-500 mt-2 font-medium max-w-xs">
                      Hệ thống quản lý nề nếp và thi đua học đường
                    </p>
                  </div>

                  {/* Niên khóa: ẩn trên mobile */}
                  <div className="hidden md:block text-center text-[11px] text-slate-400 pt-3 border-t border-blue-200/50">
                    Năm học 2026–2027
                  </div>
                </div>

                {/* ---------------- CỘT BÊN PHẢI (FORM ĐĂNG NHẬP) ---------------- */}
                <motion.div
                  initial={{ opacity: 0, x: 25 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 25 }}
                  transition={{ duration: 0.35, ease: "easeOut" }}
                  className="p-3.5 sm:p-5 md:p-10 flex flex-col justify-center bg-white"
                >
                  {/* Tiêu đề & Vai trò đã chọn */}
                  <div className="mb-2 sm:mb-3 md:mb-6">
                    <div className="flex items-center justify-between gap-2">
                      <h3 className="text-base sm:text-lg md:text-2xl font-black text-slate-900 tracking-tight">
                        Đăng nhập
                      </h3>
                      <span className="hidden md:inline-flex text-xs font-bold px-3 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-200 shrink-0">
                        {selectedRole === "TEACHER"
                          ? "Giáo viên"
                          : selectedRole === "STUDENT"
                          ? "Học sinh"
                          : "Ban Quản Trị"}
                      </span>
                    </div>
                    <p className="text-[11px] sm:text-xs text-slate-500 mt-0.5">
                      Nhập thông tin tài khoản để truy cập hệ thống
                    </p>
                  </div>

                  {/* Form điền thông tin */}
                  <form onSubmit={handleLoginSubmit} className="space-y-2 sm:space-y-2.5 md:space-y-4">
                    {/* Input 1: Họ tên */}
                    <div>
                      <label className="block text-[11px] sm:text-xs font-bold text-slate-700 mb-1">
                        Họ tên
                      </label>
                      <input
                        type="text"
                        placeholder={
                          selectedRole === "TEACHER"
                            ? "VD: Trần Thị Mai"
                            : selectedRole === "STUDENT"
                            ? "VD: Nguyễn Văn An"
                            : "VD: Đặng Quốc Bảo"
                        }
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        className="w-full px-3 py-2 sm:py-2.5 md:py-3 rounded-lg sm:rounded-xl border border-slate-300 text-slate-800 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all placeholder:text-slate-400 bg-slate-50/30 focus:bg-white"
                      />
                    </div>

                    {/* Input 2: Mật khẩu */}
                    <div>
                      <label className="block text-[11px] sm:text-xs font-bold text-slate-700 mb-1">
                        Mật khẩu
                      </label>
                      <div className="relative">
                        <input
                          type={showPassword ? "text" : "password"}
                          placeholder="Nhập mật khẩu..."
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          className="w-full px-3 py-2 sm:py-2.5 md:py-3 pr-10 rounded-lg sm:rounded-xl border border-slate-300 text-slate-800 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all placeholder:text-slate-400 font-sans bg-slate-50/30 focus:bg-white"
                        />
                        {/* Eye icon button để ẩn/hiện mật khẩu */}
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-blue-600 p-1 cursor-pointer transition-colors"
                          title={showPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
                        >
                          {showPassword ? (
                            <EyeOffIcon className="w-4 h-4 sm:w-5 sm:h-5" />
                          ) : (
                            <EyeIcon className="w-4 h-4 sm:w-5 sm:h-5" />
                          )}
                        </button>
                      </div>
                    </div>

                    {/* Checkbox: Nhớ mật khẩu & Quên mật khẩu */}
                    <div className="flex items-center justify-between pt-0.5">
                      <label className="flex items-center gap-1.5 sm:gap-2 cursor-pointer select-none">
                        <input
                          type="checkbox"
                          checked={rememberPassword}
                          onChange={(e) => setRememberPassword(e.target.checked)}
                          className="w-3.5 h-3.5 sm:w-4 sm:h-4 rounded text-blue-600 border-slate-300 focus:ring-blue-500 cursor-pointer"
                        />
                        <span className="text-[11px] sm:text-xs text-slate-600 font-medium">
                          Nhớ mật khẩu
                        </span>
                      </label>
                      <button
                        type="button"
                        onClick={() =>
                          showNotification(
                            "Vui lòng liên hệ Văn phòng nhà trường để cấp lại mật khẩu.",
                            "info"
                          )
                        }
                        className="text-[11px] sm:text-xs text-blue-600 hover:underline font-semibold cursor-pointer"
                      >
                        Quên mật khẩu?
                      </button>
                    </div>

                    {/* Nút Đăng nhập to và nổi bật */}
                    <motion.button
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.99 }}
                      type="submit"
                      disabled={isLoading}
                      className="w-full py-2.5 sm:py-3 md:py-3.5 px-4 rounded-lg sm:rounded-xl bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-bold text-xs sm:text-sm md:text-base shadow-md shadow-blue-500/25 transition-all flex items-center justify-center gap-2 cursor-pointer mt-1 md:mt-2 disabled:opacity-75 disabled:cursor-not-allowed"
                    >
                      {isLoading ? (
                        <>
                          <svg
                            className="animate-spin w-4 h-4 sm:w-5 sm:h-5 text-white"
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                          >
                            <circle
                              className="opacity-25"
                              cx="12"
                              cy="12"
                              r="10"
                              stroke="currentColor"
                              strokeWidth="4"
                            />
                            <path
                              className="opacity-75"
                              fill="currentColor"
                              d="M4 12a8 8 0 018-8v8H4z"
                            />
                          </svg>
                          <span>Đang đăng nhập...</span>
                        </>
                      ) : (
                        <span>Xác nhận / Đăng nhập</span>
                      )}
                    </motion.button>
                  </form>
                </motion.div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* ================= 3. VIỀN XANH DƯƠNG MÉP DƯỚI (BOTTOM BLUE BORDER) ================= */}
      <footer className="w-full h-8 sm:h-10 md:h-14 bg-gradient-to-r from-blue-700 via-blue-600 to-sky-500 shrink-0 shadow-inner relative z-20 overflow-hidden flex items-center justify-center px-3">
        <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:16px_16px]" />
        <p className="text-[10px] sm:text-xs text-blue-100 font-medium tracking-tight sm:tracking-wide z-10 text-center truncate max-w-full">
          <span className="hidden sm:inline">Trường THCS Na Sầm · </span>Khu 8, Thị trấn Na Sầm, Huyện Văn Lãng, Tỉnh Lạng Sơn
        </p>
      </footer>
    </div>
  );
}
