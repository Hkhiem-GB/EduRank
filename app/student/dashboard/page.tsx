"use client";

import React from "react";
import { useApp } from "@/lib/AppContext";
import { PageHeader } from "@/components/layout/PageHeader";
import { CompetitionFilterBar } from "@/components/competition/CompetitionFilterBar";
import { ClassRanking } from "@/components/competition/ClassRanking";
import { StudentRanking } from "@/components/competition/StudentRanking";
import { Icons } from "@/components/ui/Icons";
import { ScoreBadge } from "@/components/ui/Badge";
import Link from "next/link";
import { Button } from "@/components/ui/Button";

export default function StudentDashboardPage() {
  const {
    students,
    classes,
    studentRecords,
    criteria,
    classRankings,
    studentRankings,
    currentUser,
    teachers,
  } = useApp();

  // Find student by current account or fallback
  const student = students.find((s) => s.studentCode === currentUser.accountCode) || students[0];
  const myClass = student ? classes.find((c) => c._id === student.classId) : classes[0];
  const myRanking = student ? studentRankings.find((r) => r.studentId === student._id) : undefined;
  const classRank = myClass ? classRankings.find((r) => r.classId === myClass._id) : undefined;
  const currentTeacher = teachers.find((t) => t._id === myClass?.homeroomTeacherId);
  const teacherName = currentTeacher?.fullName || "Chưa phân công";

  // Records of this student
  const myRecords = student ? studentRecords.filter((r) => r.studentId === student._id) : [];

  const baseScore = 100;
  const pos = myRanking?.positivePoints ?? 0;
  const neg = myRanking?.negativePoints ?? 0;
  const totalScore = myRanking?.score ?? (baseScore + pos - neg);
  const myRank = myRanking?.rank ? `#${myRanking.rank}` : "—";

  return (
    <div className="space-y-6">
      {/* Page Header (No scoring button for student) */}
      <PageHeader
        greeting={`Xin chào, ${student?.fullName || currentUser.fullName} 👋`}
        title="Bảng Theo Dõi Thi Đua Học Sinh"
        description={`Học sinh Lớp ${myClass?.className || ""} · Trường THCS Na Sầm · Năm học 2026–2027`}
        badge={
          <span className="text-xs font-bold text-blue-700 bg-blue-50 border border-blue-200 px-3 py-1 rounded-full">
            Lớp {myClass?.className || ""} ({myClass?.studentCount || 0} HS) · Tuần 6
          </span>
        }
        actions={
          <Link href="/student/profile" className="w-full sm:w-auto">
            <Button
              variant="outline"
              size="md"
              className="w-full sm:w-auto"
              icon={<Icons.UserCheck className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-blue-600" />}
            >
              Hồ sơ rèn luyện cá nhân
            </Button>
          </Link>
        }
      />

      {/* Filter Bar */}
      <CompetitionFilterBar />

      {/* Personal Highlights Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Điểm thi đua Card */}
        <div className="bg-gradient-to-br from-blue-700 via-blue-600 to-sky-600 rounded-2xl p-6 text-white shadow-md relative overflow-hidden flex flex-col justify-between">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-bl-full pointer-events-none" />
          <div>
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-bold text-blue-100 uppercase tracking-wider">
                Điểm Thi Đua Cá Nhân
              </span>
              <span className="text-xs font-bold bg-white/20 px-2.5 py-0.5 rounded-full">
                Tuần 6
              </span>
            </div>
            <div className="text-4xl sm:text-5xl font-black tracking-tight">
              {totalScore}
            </div>
            <p className="text-blue-100 text-xs mt-1">
              Điểm gốc: {baseScore} · Cộng: +{pos} · Trừ: -{neg}
            </p>
          </div>

          <div className="mt-6 pt-4 border-t border-white/20 flex items-center justify-between">
            <span className="text-xs font-medium text-blue-100">
              Xếp hạng toàn trường
            </span>
            <span className="text-xs sm:text-sm font-extrabold bg-amber-400 text-amber-950 px-2.5 py-1 rounded-xl shadow-xs">
              {myRank}
            </span>
          </div>
        </div>

        {/* Lớp của tôi Quick Card */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-2xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Tập thể Lớp học
              </span>
              <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">
                Khối {myClass?.grade}
              </span>
            </div>
            <h3 className="text-2xl font-extrabold text-slate-800">
              Lớp {myClass?.className}
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Sĩ số: <strong>{myClass?.studentCount || 0}</strong> học sinh · GVCN:{" "}
              <strong>{teacherName}</strong>
            </p>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
            <span className="text-xs text-slate-500">Xếp hạng lớp toàn trường</span>
            <span className="text-xs sm:text-sm font-bold text-blue-700">
              #{classRank?.rank ?? "—"} · {classRank?.score ?? 100} điểm
            </span>
          </div>
        </div>

        {/* Gợi ý rèn luyện / Nhắc nhở */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-2xs flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Icons.ShieldCheck className="w-5 h-5 text-emerald-600" />
              <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Mục tiêu tuần tới
              </span>
            </div>
            <h4 className="text-sm font-bold text-slate-800 mb-2">
              Khắc phục nề nếp trang phục
            </h4>
            <p className="text-xs text-slate-500 leading-relaxed">
              Bạn có 1 lần bị nhắc nhở về tác phong đồng phục. Duy trì giờ học tốt
              và phát biểu bài để vươn lên Top 1 của lớp nhé!
            </p>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
            <span className="text-slate-400">Danh hiệu dự kiến:</span>
            <span className="font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded">
              Học sinh Tiên Tiến
            </span>
          </div>
        </div>
      </div>

      {/* Main Grid: Class Rankings & Exemplary Students + Student History */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <ClassRanking
            rankings={classRankings}
            title="🏆 Bảng Xếp Hạng Thi Đua 14 Lớp Toàn Trường"
            showDetails={true}
          />
        </div>

        <div className="space-y-6">
          <StudentRanking
            rankings={studentRankings}
            title="⭐ Top Học Sinh Tiêu Biểu"
            limit={5}
          />

          {/* Lịch sử ghi nhận của tôi */}
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs overflow-hidden">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Icons.History className="w-5 h-5 text-blue-600" />
                <h4 className="font-bold text-slate-800 text-sm">Ghi Nhận Gần Đây Của Bạn</h4>
              </div>
              <span className="text-xs text-slate-400">{myRecords.length} lượt</span>
            </div>

            <div className="divide-y divide-slate-100">
              {myRecords.length === 0 ? (
                <div className="p-6 text-center text-slate-400 text-xs">
                  Chưa có ghi nhận thi đua nào trong tuần này.
                </div>
              ) : (
                myRecords.slice(0, 4).map((r) => {
                  const crit = criteria.find((c) => c._id === r.criteriaId);
                  return (
                    <div
                      key={r._id}
                      className="p-3.5 flex items-center justify-between gap-3 hover:bg-slate-50 transition-colors"
                    >
                      <div className="flex items-start gap-2.5">
                        <div
                          className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${
                            r.points > 0
                              ? "bg-emerald-50 text-emerald-600"
                              : "bg-rose-50 text-rose-600"
                          }`}
                        >
                          {r.points > 0 ? (
                            <Icons.Plus className="w-3.5 h-3.5" />
                          ) : (
                            <Icons.Minus className="w-3.5 h-3.5" />
                          )}
                        </div>
                        <div>
                          <div className="text-xs font-bold text-slate-800">
                            {crit?.name || "Tiêu chí"}
                          </div>
                          {r.note && (
                            <div className="text-[11px] text-slate-400 italic">
                              "{r.note}"
                            </div>
                          )}
                        </div>
                      </div>
                      <ScoreBadge points={r.points} />
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
