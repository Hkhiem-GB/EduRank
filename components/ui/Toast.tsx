"use client";

import React, { useEffect } from "react";
import { Icons } from "./Icons";

export type ToastType = "success" | "error" | "info" | "warning";

export interface ToastItem {
  id: string;
  message: string;
  type?: ToastType;
  duration?: number;
}

interface ToastContainerProps {
  toasts: ToastItem[];
  onDismiss: (id: string) => void;
}

export function ToastContainer({ toasts, onDismiss }: ToastContainerProps) {
  if (toasts.length === 0) return null;

  return (
    <div
      aria-live="polite"
      className="fixed top-20 right-4 sm:right-6 z-50 flex flex-col gap-2.5 max-w-md w-full pointer-events-none"
    >
      {toasts.map((toast) => (
        <ToastCard key={toast.id} toast={toast} onDismiss={onDismiss} />
      ))}
    </div>
  );
}

function ToastCard({
  toast,
  onDismiss,
}: {
  toast: ToastItem;
  onDismiss: (id: string) => void;
}) {
  const { id, message, type = "info", duration = 4000 } = toast;

  useEffect(() => {
    if (duration <= 0) return;
    const timer = setTimeout(() => {
      onDismiss(id);
    }, duration);
    return () => clearTimeout(timer);
  }, [id, duration, onDismiss]);

  const styleConfig = {
    success: {
      bg: "bg-emerald-600 text-white shadow-emerald-500/20",
      icon: <Icons.Check className="w-5 h-5 text-white shrink-0" />,
      title: "Thành công",
    },
    error: {
      bg: "bg-rose-600 text-white shadow-rose-500/20",
      icon: <Icons.AlertTriangle className="w-5 h-5 text-white shrink-0" />,
      title: "Lỗi",
    },
    warning: {
      bg: "bg-amber-600 text-white shadow-amber-500/20",
      icon: <Icons.AlertTriangle className="w-5 h-5 text-white shrink-0" />,
      title: "Cảnh báo",
    },
    info: {
      bg: "bg-blue-600 text-white shadow-blue-500/20",
      icon: <Icons.Info className="w-5 h-5 text-white shrink-0" />,
      title: "Thông báo",
    },
  }[type];

  return (
    <div
      className={`pointer-events-auto rounded-2xl p-4 shadow-xl border border-white/20 backdrop-blur-md transition-all duration-300 animate-in slide-in-from-top-4 fade-in-50 flex items-start gap-3.5 ${styleConfig.bg}`}
      role="alert"
    >
      <div className="mt-0.5 rounded-full bg-white/20 p-1 flex items-center justify-center">
        {styleConfig.icon}
      </div>

      <div className="flex-1 min-w-0 pr-1">
        <p className="text-xs font-black uppercase tracking-wider opacity-90 mb-0.5">
          {styleConfig.title}
        </p>
        <p className="text-xs sm:text-sm font-semibold leading-relaxed break-words text-white">
          {message}
        </p>
      </div>

      <button
        onClick={() => onDismiss(id)}
        className="p-1 text-white/80 hover:text-white rounded-lg hover:bg-white/20 transition-colors shrink-0 cursor-pointer"
        aria-label="Đóng thông báo"
      >
        <Icons.X className="w-4 h-4" />
      </button>
    </div>
  );
}
