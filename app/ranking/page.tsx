"use client";

import React, { useState } from "react";
import { useApp } from "@/lib/AppContext";
import { PageHeader } from "@/components/layout/PageHeader";
import { CompetitionFilterBar } from "@/components/competition/CompetitionFilterBar";
import { ClassRanking } from "@/components/competition/ClassRanking";
import { Icons } from "@/components/ui/Icons";
import { ScoreBadge, RankBadge } from "@/components/ui/Badge";

export default function RankingPage() {
  const { classRankings, studentRankings } = useApp();
  const [rankingType, setRankingType] = useState<"CLASS" | "STUDENT">("CLASS");

  // Top 3 Podium for Classes
  const top1Class = classRankings[0];
  const top2Class = classRankings[1];
  const top3Class = classRankings[2];

  // Top 3 Podium for Students
  const top1Student = studentRankings[0];
  const top2Student = studentRankings[1];
  const top3Student = studentRankings[2];

  return (
    <div className="space-y-6">
      {/* Page Header (Section 34) */}
      <PageHeader
        greeting="Vinh danh thi đua học đường"
        title="Bảng Xếp Hạng Toàn Trường THCS Na Sầm"
        description="Kết quả xếp hạng thi đua nề nếp và học tập được cập nhật liên tục theo Tuần học"
        badge={
          <span className="text-xs font-bold text-amber-700 bg-amber-50 border border-amber-200 px-3 py-1 rounded-full">
            🏆 Tuần 5 · 2026–2027
          </span>
        }
      />

      {/* Filter Bar */}
      <CompetitionFilterBar />

      {/* Switcher Tab: Xếp hạng Lớp vs Xếp hạng Học sinh */}
      <div className="flex items-center justify-center">
        <div className="bg-slate-100 p-1.5 rounded-2xl flex items-center gap-1 max-w-md w-full">
          <button
            onClick={() => setRankingType("CLASS")}
            className={`flex-1 py-2.5 px-4 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
              rankingType === "CLASS"
                ? "bg-white text-blue-700 shadow-xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <Icons.Trophy className="w-4 h-4 text-amber-500" />
            <span>Thi Đua 14 Lớp Học</span>
          </button>
          <button
            onClick={() => setRankingType("STUDENT")}
            className={`flex-1 py-2.5 px-4 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
              rankingType === "STUDENT"
                ? "bg-white text-blue-700 shadow-xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <Icons.Sparkles className="w-4 h-4 text-amber-500" />
            <span>Học Sinh Gương Mẫu</span>
          </button>
        </div>
      </div>

      {/* Podium Vinh Danh Top 3 (Bục vinh danh sang trọng) */}
      <div className="bg-gradient-to-b from-blue-900/5 via-sky-50 to-white rounded-3xl p-6 sm:p-8 border border-blue-100 shadow-2xs">
        <div className="text-center mb-8">
          <span className="text-xs font-extrabold text-blue-600 uppercase tracking-widest bg-blue-50 px-3 py-1 rounded-full border border-blue-200/50">
            Bục Vinh Danh Tuần 5
          </span>
          <h3 className="text-xl sm:text-2xl font-black text-slate-800 mt-2">
            {rankingType === "CLASS"
              ? "3 Lớp Học Dẫn Đầu Toàn Trường"
              : "3 Học Sinh Có Điểm Thi Đua Cao Nhất"}
          </h3>
        </div>

        {rankingType === "CLASS" ? (
          <div className="grid grid-cols-3 gap-3 sm:gap-6 items-end max-w-2xl mx-auto pt-6">
            {/* Top 2 (Bạc) */}
            <div className="flex flex-col items-center">
              <div className="w-18 sm:w-24 h-18 sm:h-24 rounded-2xl bg-gradient-to-tr from-slate-300 to-slate-100 border-2 border-slate-300 flex items-center justify-center text-xl sm:text-3xl shadow-sm">
                🥈
              </div>
              <h4 className="font-extrabold text-slate-800 text-xs sm:text-base mt-2 text-center">
                Lớp {top2Class?.className}
              </h4>
              <p className="text-[11px] font-bold text-blue-600">
                {top2Class?.score} điểm
              </p>
            </div>

            {/* Top 1 (Vàng - Bục cao nhất) */}
            <div className="flex flex-col items-center -mt-6">
              <div className="relative">
                <div className="w-18 sm:w-24 h-18 sm:h-24 rounded-2xl bg-gradient-to-tr from-amber-400 to-yellow-200 border-2 border-amber-400 flex items-center justify-center text-2xl sm:text-4xl shadow-md">
                  🥇
                </div>
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-amber-500 text-amber-950 text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider">
                  Cờ Nhất
                </div>
              </div>
              <h4 className="font-black text-slate-900 text-sm sm:text-lg mt-3 text-center">
                Lớp {top1Class?.className}
              </h4>
              <p className="text-xs sm:text-sm font-extrabold text-amber-700">
                {top1Class?.score} điểm
              </p>
            </div>

            {/* Top 3 (Đồng) */}
            <div className="flex flex-col items-center">
              <div className="w-18 sm:w-24 h-18 sm:h-24 rounded-2xl bg-gradient-to-tr from-amber-700/60 to-amber-600/30 border-2 border-amber-600/40 flex items-center justify-center text-xl sm:text-3xl shadow-sm">
                🥉
              </div>
              <h4 className="font-extrabold text-slate-800 text-xs sm:text-base mt-2 text-center">
                Lớp {top3Class?.className}
              </h4>
              <p className="text-[11px] font-bold text-blue-600">
                {top3Class?.score} điểm
              </p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-3 sm:gap-6 items-end max-w-2xl mx-auto pt-6">
            {/* Top 2 Student */}
            <div className="flex flex-col items-center">
              <div className="w-14 sm:w-20 h-14 sm:h-20 rounded-full bg-slate-100 border-2 border-slate-300 flex items-center justify-center text-xl sm:text-3xl">
                🥈
              </div>
              <h4 className="font-extrabold text-slate-800 text-xs sm:text-base mt-2 text-center truncate max-w-[100px] sm:max-w-[140px]">
                {top2Student?.fullName}
              </h4>
              <p className="text-[11px] text-slate-500">
                Lớp {top2Student?.className}
              </p>
              <div className="w-full h-24 sm:h-32 bg-slate-200/80 rounded-t-2xl mt-3 flex items-center justify-center font-black text-slate-500 text-lg sm:text-2xl">
                2
              </div>
            </div>

            {/* Top 1 Student */}
            <div className="flex flex-col items-center -mt-6">
              <div className="w-18 sm:w-24 h-18 sm:h-24 rounded-full bg-amber-100 border-2 border-amber-400 flex items-center justify-center text-2xl sm:text-4xl shadow-md">
                🥇
              </div>
              <h4 className="font-black text-slate-900 text-sm sm:text-lg mt-3 text-center truncate max-w-[120px] sm:max-w-[160px]">
                {top1Student?.fullName}
              </h4>
              <p className="text-xs font-bold text-amber-700">
                Lớp {top1Student?.className} · {top1Student?.score} điểm
              </p>
              <div className="w-full h-32 sm:h-44 bg-gradient-to-t from-amber-200 to-amber-100 rounded-t-2xl mt-3 flex items-center justify-center font-black text-amber-700 text-2xl sm:text-4xl shadow-xs">
                1
              </div>
            </div>

            {/* Top 3 Student */}
            <div className="flex flex-col items-center">
              <div className="w-14 sm:w-20 h-14 sm:h-20 rounded-full bg-amber-50 border-2 border-amber-600/30 flex items-center justify-center text-xl sm:text-3xl">
                🥉
              </div>
              <h4 className="font-extrabold text-slate-800 text-xs sm:text-base mt-2 text-center truncate max-w-[100px] sm:max-w-[140px]">
                {top3Student?.fullName}
              </h4>
              <p className="text-[11px] text-slate-500">
                Lớp {top3Student?.className}
              </p>
              <div className="w-full h-16 sm:h-24 bg-amber-100/70 rounded-t-2xl mt-3 flex items-center justify-center font-black text-amber-900/60 text-lg sm:text-2xl">
                3
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Main Ranking Table */}
      {rankingType === "CLASS" ? (
        <ClassRanking
          rankings={classRankings}
          title="Bảng Điểm Thi Đua Toàn Diện (14 Lớp THCS Na Sầm)"
          showDetails={true}
        />
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs overflow-hidden">
          <div className="px-3 sm:px-5 py-3 sm:py-4 border-b border-slate-100 flex items-center justify-between">
            <h3 className="text-sm sm:text-base font-bold text-slate-800">
              Bảng Xếp Hạng Học Sinh Tiêu Biểu
            </h3>
            <span className="text-xs text-slate-500 hidden sm:inline">
              {studentRankings.length} Học sinh
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-[11px] sm:text-xs md:text-sm">
              <thead>
                <tr className="bg-slate-50/70 border-b border-slate-100 text-[10px] sm:text-[11px] md:text-xs font-bold text-slate-500 uppercase tracking-wider">
                  <th className="py-2 sm:py-2.5 px-1.5 sm:px-3 w-10 sm:w-14 text-center">Hạng</th>
                  <th className="py-2 sm:py-2.5 px-2 sm:px-4 hidden sm:table-cell">Mã HS</th>
                  <th className="py-2 sm:py-2.5 px-2 sm:px-4">Họ và tên</th>
                  <th className="py-2 sm:py-2.5 px-1.5 sm:px-3 text-center">Lớp</th>
                  <th className="py-2 sm:py-2.5 px-1.5 sm:px-3 text-center">Điểm rèn luyện</th>
                  <th className="py-2 sm:py-2.5 px-1.5 sm:px-3 text-center">Cộng / Trừ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {studentRankings.map((st) => (
                  <tr
                    key={st.studentId}
                    className="hover:bg-slate-50 transition-colors"
                  >
                    <td className="py-1.5 sm:py-2.5 px-1 sm:px-2 text-center whitespace-nowrap">
                      <div className="flex items-center justify-center">
                        <RankBadge rank={st.rank} />
                      </div>
                    </td>
                    <td className="py-1.5 sm:py-2.5 px-2 sm:px-4 font-mono text-[11px] sm:text-xs text-slate-500 hidden sm:table-cell">
                      {st.studentCode}
                    </td>
                    <td className="py-1.5 sm:py-2.5 px-2 sm:px-4 whitespace-nowrap">
                      <div className="font-bold text-slate-800 text-xs sm:text-sm md:text-base">
                        {st.fullName}
                      </div>
                      <div className="text-[10px] text-slate-400 font-mono sm:hidden">
                        {st.studentCode}
                      </div>
                    </td>
                    <td className="py-1.5 sm:py-2.5 px-1.5 sm:px-3 text-center whitespace-nowrap">
                      <span className="text-[9px] sm:text-[10px] md:text-[11px] font-bold text-blue-700 bg-blue-50 px-1.5 sm:px-2 py-0.5 rounded">
                        Lớp {st.className}
                      </span>
                    </td>
                    <td className="py-1.5 sm:py-2.5 px-1.5 sm:px-3 text-center font-extrabold text-blue-700 text-xs sm:text-sm md:text-base whitespace-nowrap">
                      {st.score}{" "}
                      <span className="text-[10px] sm:text-[11px] font-normal text-slate-400 hidden xs:inline">
                        điểm
                      </span>
                    </td>
                    <td className="py-1.5 sm:py-2.5 px-1 sm:px-3 whitespace-nowrap text-center">
                      <div className="inline-grid grid-cols-[1fr_1fr] items-center gap-1 sm:gap-1.5 w-[76px] sm:w-[94px] md:w-[108px] mx-auto">
                        {/* Nửa bên trái: Điểm cộng, căn sát mép giữa */}
                        <div className="flex justify-end">
                          <ScoreBadge points={st.positivePoints} showPlus={true} />
                        </div>

                        {/* Nửa bên phải: Điểm trừ, căn sát mép giữa */}
                        <div className="flex justify-start">
                          <ScoreBadge
                            points={-Math.abs(st.negativePoints)}
                            showPlus={false}
                          />
                        </div>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
