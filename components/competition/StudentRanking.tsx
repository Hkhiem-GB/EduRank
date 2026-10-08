import React from "react";
import { StudentRankingItem } from "@/types";
import { Icons } from "../ui/Icons";
import { RankBadge, ScoreBadge } from "../ui/Badge";

interface StudentRankingProps {
  rankings: StudentRankingItem[];
  title?: string;
  limit?: number;
}

export function StudentRanking({
  rankings,
  title = "⭐ Gương Sáng Học Đường — Top Học Sinh",
  limit = 5,
}: StudentRankingProps) {
  const displayItems = rankings.slice(0, limit);

  return (
    <div className="bg-white rounded-xl sm:rounded-2xl border border-slate-200/80 shadow-2xs overflow-hidden">
      {/* Header */}
      <div className="px-3.5 sm:px-5 py-3 sm:py-4 border-b border-slate-100 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Icons.Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-amber-500" />
          <h3 className="text-xs sm:text-base font-bold text-slate-800">{title}</h3>
        </div>
        <span className="text-xs font-semibold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-full hidden sm:inline-flex">
          Cá nhân tiêu biểu
        </span>
      </div>

      {/* List */}
      <div className="divide-y divide-slate-100">
        {displayItems.map((item) => {
          return (
            <div
              key={item.studentId}
              className="p-2.5 sm:p-3.5 md:p-4 flex items-center justify-between gap-2 sm:gap-3 hover:bg-slate-50/70 transition-colors"
            >
              {/* Left Side: Fixed Rank + Avatar + Name */}
              <div className="flex items-center gap-2 sm:gap-2.5 md:gap-3 flex-1 min-w-0 pr-1 sm:pr-2">
                {/* Fixed-width Rank Container to align avatars */}
                <div className="w-8 sm:w-9 md:w-10 shrink-0 flex items-center justify-center">
                  <RankBadge rank={item.rank} />
                </div>

                {/* Avatar */}
                <div className="w-7 h-7 sm:w-8 sm:h-8 md:w-9 md:h-9 rounded-full bg-blue-100 text-blue-700 font-bold flex items-center justify-center text-[11px] sm:text-xs md:text-sm shrink-0">
                  {item.fullName.split(" ").slice(-1)[0][0]}
                </div>

                {/* Info */}
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1 sm:gap-1.5 flex-wrap">
                    <span className="text-xs sm:text-sm md:text-base font-bold text-slate-800 truncate max-w-[120px] xs:max-w-[150px] sm:max-w-none">
                      {item.fullName}
                    </span>
                    <span className="text-[9px] sm:text-[10px] md:text-[11px] font-bold text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded shrink-0">
                      Lớp {item.className}
                    </span>
                  </div>
                  <div className="text-[10px] sm:text-xs text-slate-400 mt-0.5 truncate">
                    Mã: {item.studentCode}
                  </div>
                </div>
              </div>

              {/* Right Side: Fixed-width Score Column (Thẳng hàng tuyệt đối, không thụt thò) */}
              <div className="w-20 sm:w-24 md:w-28 shrink-0 text-right flex flex-col items-end justify-center">
                <div className="text-xs sm:text-sm md:text-base font-extrabold text-blue-700 whitespace-nowrap">
                  {item.score}{" "}
                  <span className="text-[10px] sm:text-xs text-slate-400 font-normal">
                    điểm
                  </span>
                </div>
                <div className="inline-grid grid-cols-[1fr_1fr] items-center gap-1 w-[72px] sm:w-[84px] md:w-[94px] mt-0.5 sm:mt-1">
                  <div className="flex justify-end">
                    <ScoreBadge points={item.positivePoints} showPlus={true} />
                  </div>
                  <div className="flex justify-start">
                    <ScoreBadge
                      points={-Math.abs(item.negativePoints)}
                      showPlus={false}
                    />
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
