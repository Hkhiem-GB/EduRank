"use client";

import React from "react";
import { CompetitionRecordSummary } from "@/types";
import { Icons } from "../ui/Icons";
import { ScoreBadge } from "../ui/Badge";
import { useApp } from "@/lib/AppContext";

interface ActivityFeedProps {
  activities: CompetitionRecordSummary[];
  title?: string;
  limit?: number;
}

export function RecentActivityFeed({
  activities,
  title = "Hoạt Động Ghi Nhận Gần Đây",
  limit = 8,
}: ActivityFeedProps) {
  const { activeRole, cancelRecord } = useApp();
  const displayList = activities.slice(0, limit);

  return (
    <div className="bg-white rounded-xl sm:rounded-2xl border border-slate-200/80 shadow-2xs overflow-hidden">
      {/* Header */}
      <div className="px-3.5 sm:px-5 py-3 sm:py-4 border-b border-slate-100 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Icons.Clock className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
          <h3 className="text-xs sm:text-base font-bold text-slate-800">{title}</h3>
        </div>
        <span className="inline-flex items-center text-[10px] sm:text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200/60 px-2 sm:px-2.5 py-0.5 rounded-full">
          <span className="relative flex h-1.5 w-1.5 sm:h-2 sm:w-2 mr-1 sm:mr-1.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-1.5 w-1.5 sm:h-2 sm:w-2 bg-emerald-500"></span>
          </span>
          Trực tiếp
        </span>
      </div>

      {/* Feed List */}
      <div className="divide-y divide-slate-100">
        {displayList.length === 0 ? (
          <div className="p-8 text-center text-slate-400 text-sm">
            Chưa có ghi nhận thi đua nào trong tuần này.
          </div>
        ) : (
          displayList.map((item) => {
            const isCancelled = item.status === "CANCELLED";

            return (
              <div
                key={item._id}
                className={`p-4 flex items-start justify-between gap-3 transition-colors hover:bg-slate-50/70 ${
                  isCancelled ? "opacity-50 line-through bg-slate-50/50" : ""
                }`}
              >
                <div className="flex items-start gap-3">
                  <div
                    className={`mt-0.5 w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                      item.points > 0
                        ? "bg-emerald-50 text-emerald-600"
                        : "bg-rose-50 text-rose-600"
                    }`}
                  >
                    {item.points > 0 ? (
                      <Icons.Plus className="w-4 h-4" />
                    ) : (
                      <Icons.Minus className="w-4 h-4" />
                    )}
                  </div>

                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-bold text-slate-800 text-xs sm:text-sm">
                        {item.targetName}
                      </span>
                      <span className="text-[11px] text-slate-400">·</span>
                      <span className="text-xs font-medium text-slate-600">
                        {item.criteriaName}
                      </span>
                    </div>

                    {item.note && (
                      <p className="text-xs text-slate-500 mt-0.5 italic">
                        &#34;{item.note}&#34;
                      </p>
                    )}
                    <div className="flex items-center gap-2 mt-1 text-[11px] text-slate-400">
                      <span>Người ghi: {item.createdBy}</span>

                      {isCancelled && (
                        <span className="text-rose-600 font-bold ml-1">
                          (Đã hủy)
                        </span>
                      )}
                    </div>
                    <div className="items-center gap-2 mt-1 text-[11px] text-slate-400">
                        <span>
                          {new Date(item.createdAt).toLocaleDateString("vi-VN", {
                            hour: "2-digit",
                            minute: "2-digit",
                            day: "2-digit",
                            month: "2-digit",
                          })}
                        </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <ScoreBadge points={item.points} />
                  {(activeRole === "ADMIN" || activeRole === "SUPER_ADMIN") &&
                    !isCancelled && (
                      <button
                        onClick={() => cancelRecord(item._id, item.targetType)}
                        className="text-[11px] text-rose-500 hover:text-rose-700 hover:bg-rose-50 px-1.5 py-0.5 rounded transition-colors"
                        title="Hủy ghi nhận này"
                      >
                        Hủy
                      </button>
                    )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
