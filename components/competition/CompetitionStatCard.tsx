import React from "react";
import { Icons } from "../ui/Icons";
import { CompetitionStatistics } from "@/types";

interface StatProps {
  stats: CompetitionStatistics;
}

export function CompetitionStatCard({ stats }: StatProps) {
  const cards = [
    {
      title: "Tổng số lớp",
      value: stats.totalClasses,
      subtitle: "THCS Na Sầm",
      badge: "Khối 6–9",
      icon: Icons.School,
      color: "blue",
      bgGradient: "from-blue-500/10 to-sky-500/5",
      textColor: "text-blue-600",
      borderColor: "border-blue-100",
    },
    {
      title: "Tổng học sinh",
      value: stats.totalStudents,
      subtitle: "Sĩ số chính thức",
      badge: "Đầy đủ 100%",
      icon: Icons.Users,
      color: "indigo",
      bgGradient: "from-indigo-500/10 to-blue-500/5",
      textColor: "text-indigo-600",
      borderColor: "border-indigo-100",
    },
    {
      title: "Điểm cộng",
      value: `+${stats.totalPositivePoints}`,
      subtitle: "Thành tích & Khen thưởng",
      badge: "Tăng 12%",
      icon: Icons.TrendingUp,
      color: "emerald",
      bgGradient: "from-emerald-500/10 to-teal-500/5",
      textColor: "text-emerald-600",
      borderColor: "border-emerald-100",
    },
    {
      title: "Điểm trừ",
      value: `-${stats.totalNegativePoints}`,
      subtitle: "Nhắc nhở & Kỷ luật",
      badge: "Giảm 5%",
      icon: Icons.TrendingDown,
      color: "rose",
      bgGradient: "from-rose-500/10 to-orange-500/5",
      textColor: "text-rose-600",
      borderColor: "border-rose-100",
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4 mb-4 sm:mb-6">
      {cards.map((card, idx) => {
        const Icon = card.icon;
        return (
          <div
            key={idx}
            className={`bg-white rounded-xl sm:rounded-2xl border ${card.borderColor} p-3.5 sm:p-5 shadow-2xs hover:shadow-md transition-all duration-200 relative overflow-hidden group`}
          >
            {/* Soft accent background glow */}
            <div
              className={`absolute top-0 right-0 w-24 sm:w-28 h-24 sm:h-28 bg-gradient-to-bl ${card.bgGradient} rounded-bl-full pointer-events-none transition-transform group-hover:scale-110`}
            />

            <div className="flex items-center justify-between mb-2 sm:mb-3 relative z-10">
              <span className="text-[11px] sm:text-xs font-semibold text-slate-500 truncate">
                {card.title}
              </span>
              <span
                className={`text-[9px] sm:text-[10px] font-bold px-1.5 sm:px-2 py-0.5 rounded-full ${
                  card.color === "emerald"
                    ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                    : card.color === "rose"
                    ? "bg-rose-50 text-rose-700 border border-rose-200"
                    : "bg-slate-100 text-slate-600"
                }`}
              >
                {card.badge}
              </span>
            </div>

            <div className="flex items-baseline justify-between relative z-10">
              <div>
                <div
                  className={`text-xl sm:text-2xl md:text-3xl font-extrabold tracking-tight ${
                    card.color === "emerald"
                      ? "text-emerald-600"
                      : card.color === "rose"
                      ? "text-rose-600"
                      : "text-slate-800"
                  }`}
                >
                  {card.value}
                </div>
                <div className="text-[10px] sm:text-[11px] text-slate-400 mt-0.5 sm:mt-1 font-medium truncate">
                  {card.subtitle}
                </div>
              </div>

              <div
                className={`w-8 h-8 sm:w-11 sm:h-11 rounded-lg sm:rounded-xl bg-slate-50 flex items-center justify-center ${card.textColor} group-hover:scale-105 transition-transform shrink-0`}
              >
                <Icon className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
