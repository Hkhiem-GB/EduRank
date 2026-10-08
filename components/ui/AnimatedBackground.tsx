"use client";

import React from "react";
import { motion } from "framer-motion";

export function AnimatedBackground() {
  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
      {/* 1. Lưới tọa độ học đường nhẹ nhàng mờ ảo */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#3b82f612_1px,transparent_1px),linear-gradient(to_bottom,#3b82f612_1px,transparent_1px)] bg-[size:36px_36px] opacity-75 [mask-image:radial-gradient(ellipse_80%_70%_at_50%_50%,#000_65%,transparent_100%)]" />

      {/* 2. Các khối cầu Gradient chuyển động đa hướng liên tục (Floating Aurora Blobs) */}
      <motion.div
        animate={{
          x: [0, 80, -60, 0],
          y: [0, -60, 50, 0],
          scale: [1, 1.15, 0.92, 1],
        }}
        transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
        className="absolute -top-32 -left-20 w-[500px] h-[500px] rounded-full bg-gradient-to-br from-blue-300/30 via-sky-200/25 to-blue-100/15 blur-3xl"
      />

      <motion.div
        animate={{
          x: [0, -90, 50, 0],
          y: [0, 70, -45, 0],
          scale: [1, 0.9, 1.14, 1],
        }}
        transition={{ duration: 22, repeat: Infinity, ease: "easeInOut" }}
        className="absolute -bottom-32 -right-20 w-[540px] h-[540px] rounded-full bg-gradient-to-tl from-indigo-300/25 via-sky-200/30 to-blue-200/15 blur-3xl"
      />

      <motion.div
        animate={{
          x: [0, 60, -70, 0],
          y: [0, 50, -55, 0],
          scale: [1, 1.2, 0.88, 1],
        }}
        transition={{ duration: 16, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[420px] h-[420px] rounded-full bg-gradient-to-r from-blue-100/35 via-sky-100/35 to-indigo-100/25 blur-3xl"
      />

      {/* 3. Các biểu tượng học đường & thi đua bay bổng lặp đi lặp lại */}
      {/* Mũ cử nhân */}
      <motion.div
        animate={{ y: [-15, 15, -15], rotate: [-8, 8, -8], opacity: [0.25, 0.55, 0.25] }}
        transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-[18%] left-[8%] text-blue-500/35 hidden sm:block"
      >
        <svg className="w-10 h-10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
          <path d="M6 12v5c3 3 9 3 12 0v-5" />
        </svg>
      </motion.div>

      {/* Cuốn sách mở */}
      <motion.div
        animate={{ y: [16, -16, 16], rotate: [8, -8, 8], opacity: [0.25, 0.55, 0.25] }}
        transition={{ duration: 8.5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
        className="absolute top-[22%] right-[9%] text-sky-500/35 hidden sm:block"
      >
        <svg className="w-9 h-9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
          <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
        </svg>
      </motion.div>

      {/* Cúp vinh danh / Thi đua */}
      <motion.div
        animate={{ y: [-14, 14, -14], rotate: [-6, 6, -6], opacity: [0.25, 0.55, 0.25] }}
        transition={{ duration: 9, repeat: Infinity, ease: "easeInOut", delay: 1.5 }}
        className="absolute bottom-[24%] left-[9%] text-amber-500/30 hidden sm:block"
      >
        <svg className="w-9 h-9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" />
          <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" />
          <path d="M4 22h16" />
          <path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22" />
          <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22" />
          <path d="M18 2H6v7a6 6 0 0 0 12 0V2Z" />
        </svg>
      </motion.div>

      {/* Cây bút */}
      <motion.div
        animate={{ y: [14, -14, 14], rotate: [10, -10, 10], opacity: [0.25, 0.55, 0.25] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut", delay: 2 }}
        className="absolute bottom-[26%] right-[8%] text-indigo-500/35 hidden sm:block"
      >
        <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
        </svg>
      </motion.div>

      {/* Ngôi sao lấp lánh bên trái */}
      <motion.div
        animate={{ scale: [0.8, 1.25, 0.8], opacity: [0.2, 0.6, 0.2] }}
        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 0.8 }}
        className="absolute top-[48%] left-[4%] text-blue-400/35"
      >
        <svg className="w-5 h-5 sm:w-6 sm:h-6" viewBox="0 0 24 24" fill="currentColor">
          <path d="m12 2 2.4 7.2h7.6l-6.1 4.5 2.3 7.3L12 16.5l-6.2 4.5 2.3-7.3-6.1-4.5h7.6z" />
        </svg>
      </motion.div>

      {/* Ngôi sao lấp lánh bên phải */}
      <motion.div
        animate={{ scale: [1.25, 0.8, 1.25], opacity: [0.2, 0.6, 0.2] }}
        transition={{ duration: 5.5, repeat: Infinity, ease: "easeInOut", delay: 1.2 }}
        className="absolute top-[42%] right-[4%] text-sky-400/35"
      >
        <svg className="w-4 h-4 sm:w-5 sm:h-5" viewBox="0 0 24 24" fill="currentColor">
          <path d="m12 2 2.4 7.2h7.6l-6.1 4.5 2.3 7.3L12 16.5l-6.2 4.5 2.3-7.3-6.1-4.5h7.6z" />
        </svg>
      </motion.div>

      {/* Chấm tròn hoa văn trang trí */}
      <motion.div
        animate={{ y: [-12, 12, -12], opacity: [0.2, 0.5, 0.2] }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-[75%] left-[20%] w-2.5 h-2.5 rounded-full bg-blue-400/25"
      />
      <motion.div
        animate={{ y: [12, -12, 12], opacity: [0.2, 0.5, 0.2] }}
        transition={{ duration: 7, repeat: Infinity, ease: "easeInOut", delay: 1.5 }}
        className="absolute top-[14%] right-[22%] w-3 h-3 rounded-full bg-sky-400/25"
      />
    </div>
  );
}
