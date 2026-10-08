import React from "react";
import { ClassRankingItem } from "@/types";
import { Icons } from "../ui/Icons";
import { RankBadge, ScoreBadge } from "../ui/Badge";
import Link from "next/link";

interface ClassRankingProps {
  rankings: ClassRankingItem[];
  title?: string;
  limit?: number;
  showDetails?: boolean;
}

export function ClassRanking({
  rankings,
  title = "🏆 Bảng Xếp Hạng Thi Đua Lớp",
  limit,
  showDetails = true,
}: ClassRankingProps) {
  const displayItems = limit ? rankings.slice(0, limit) : rankings;

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs overflow-hidden">
      {/* Header */}
      <div className="px-3 sm:px-5 py-2.5 sm:py-3.5 border-b border-slate-100 flex items-center justify-between">
        <div className="flex items-center gap-1.5 sm:gap-2">
          <Icons.Trophy className="w-4 h-4 sm:w-5 sm:h-5 text-amber-500" />
          <h3 className="text-xs sm:text-sm md:text-base font-bold text-slate-800">{title}</h3>
        </div>
        <span className="text-[11px] sm:text-xs font-semibold text-blue-600 bg-blue-50 px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-full hidden sm:inline-flex">
          {rankings.length} Lớp tham gia
        </span>
      </div>

      {/* Leaderboard Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-[11px] sm:text-xs md:text-sm">
          <thead>
            <tr className="bg-slate-50/70 border-b border-slate-100 text-[10px] sm:text-[11px] md:text-xs font-bold text-slate-500 uppercase tracking-wider">
              <th className="py-2 sm:py-2.5 px-1.5 sm:px-3 w-10 sm:w-14 text-center">Hạng</th>
              <th className="py-2 sm:py-2.5 px-2 sm:px-4">Lớp</th>
              {showDetails && (
                <th className="py-2 sm:py-2.5 px-2 sm:px-4 hidden sm:table-cell">GVCN</th>
              )}
              {showDetails && (
                <th className="py-2 sm:py-2.5 px-2 sm:px-4 hidden md:table-cell text-center">
                  Sĩ số
                </th>
              )}
              <th className="py-2 sm:py-2.5 px-1.5 sm:px-3 text-center">Điểm thi đua</th>
              <th className="py-2 sm:py-2.5 px-1.5 sm:px-3 text-center">Cộng / Trừ</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {displayItems.map((item) => {
              const isTop1 = item.rank === 1;
              const isTop2 = item.rank === 2;
              const isTop3 = item.rank === 3;

              return (
                <tr
                  key={item.classId}
                  className={`transition-colors hover:bg-slate-50/80 ${
                    isTop1
                      ? "bg-amber-50/30"
                      : isTop2
                      ? "bg-slate-50/40"
                      : isTop3
                      ? "bg-amber-50/20"
                      : ""
                  }`}
                >
                  {/* Rank Column */}
                  <td className="py-1.5 sm:py-2.5 px-1 sm:px-2 text-center whitespace-nowrap">
                    <div className="flex items-center justify-center">
                      <RankBadge rank={item.rank} />
                    </div>
                  </td>

                  {/* Class Name */}
                  <td className="py-1.5 sm:py-2.5 px-2 sm:px-4 whitespace-nowrap">
                    <Link
                      href={`/classes/${item.classId}`}
                      className="inline-flex items-center gap-1 sm:gap-2 group hover:text-blue-600 transition-colors"
                    >
                      <span className="font-bold text-slate-900 group-hover:text-blue-600 text-xs sm:text-sm md:text-base">
                        Lớp {item.className}
                      </span>
                      <span className="text-[9px] sm:text-[10px] md:text-[11px] font-semibold text-slate-500 bg-slate-100 group-hover:bg-blue-50 group-hover:text-blue-700 px-1 sm:px-1.5 py-0.5 rounded transition-colors">
                        K{item.grade}
                      </span>
                    </Link>
                  </td>

                  {/* Homeroom Teacher */}
                  {showDetails && (
                    <td className="py-1.5 sm:py-2.5 px-2 sm:px-4 whitespace-nowrap text-[11px] sm:text-xs md:text-sm text-slate-600 hidden sm:table-cell">
                      {item.homeroomTeacherName || "Chưa phân công"}
                    </td>
                  )}

                  {/* Student Count */}
                  {showDetails && (
                    <td className="py-1.5 sm:py-2.5 px-2 sm:px-4 whitespace-nowrap text-center text-[11px] sm:text-xs md:text-sm font-medium text-slate-600 hidden md:table-cell">
                      {item.studentCount} HS
                    </td>
                  )}

                  {/* Final Score */}
                  <td className="py-1.5 sm:py-2.5 px-1.5 sm:px-3 whitespace-nowrap text-center">
                    <span
                      className={`text-xs sm:text-sm md:text-base font-extrabold ${
                        isTop1
                          ? "text-blue-700 font-black"
                          : "text-slate-800"
                      }`}
                    >
                      {item.score}
                    </span>
                    <span className="text-[10px] sm:text-[11px] text-slate-400 font-normal ml-0.5 hidden xs:inline">
                      điểm
                    </span>
                  </td>

                  {/* Plus / Minus Points with Invisible Centerline Divider */}
                  <td className="py-1.5 sm:py-2.5 px-1 sm:px-3 whitespace-nowrap text-center">
                    <div className="inline-grid grid-cols-[1fr_1fr] items-center gap-1 sm:gap-1.5 w-[76px] sm:w-[94px] md:w-[108px] mx-auto">
                      {/* Nửa bên trái: Điểm cộng, căn sát mép giữa bên phải */}
                      <div className="flex justify-end">
                        <ScoreBadge points={item.positivePoints} showPlus={true} />
                      </div>

                      {/* Vách ngăn ảo ở giữa không hiển thị viền, giữ trục thẳng hàng từ trên xuống */}

                      {/* Nửa bên phải: Điểm trừ, căn sát mép giữa bên trái */}
                      <div className="flex justify-start">
                        <ScoreBadge
                          points={-Math.abs(item.negativePoints)}
                          showPlus={false}
                        />
                      </div>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
