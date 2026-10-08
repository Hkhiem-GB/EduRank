"use client";

import React from "react";
import { useApp } from "@/lib/AppContext";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Icons } from "@/components/ui/Icons";
import { ScoreBadge, RankBadge } from "@/components/ui/Badge";
import Link from "next/link";
import { Button } from "@/components/ui/Button";

export default function StudentClassPage() {
  const { classes, classRecords, students, criteria, classRankings, teachers } = useApp();

  const currentClass = classes.find((c) => c.classCode === "6A1") || classes[0];
  const rankingInfo = currentClass ? classRankings.find((r) => r.classId === currentClass._id) : undefined;
  const classStudents = currentClass ? students.filter((s) => s.classId === currentClass._id) : [];
  const records = currentClass ? classRecords.filter((r) => r.classId === currentClass._id) : [];

  if (!currentClass) {
    return (
      <div className="py-12 text-center text-slate-500">
        <p className="text-sm">Đang tải thông tin lớp học...</p>
      </div>
    );
  }

  const currentTeacher = teachers.find((t) => t._id === currentClass.homeroomTeacherId);
  const teacherName = currentTeacher?.fullName || "Chưa phân công";
  const realCount = classStudents.length;

  return (
    <div className="space-y-6">
      <PageHeader
        greeting="Tập thể lớp của tôi"
        title={`Thi Đua Lớp ${currentClass.className}`}
        description={`Khối ${currentClass.grade} · Trường THCS Na Sầm · Giáo viên chủ nhiệm: ${teacherName}`}
        badge={
          <span className="text-xs font-bold text-blue-700 bg-blue-50 border border-blue-200 px-3 py-1 rounded-full">
            Sĩ số: {realCount} Học sinh
          </span>
        }
        actions={
          <Link href="/ranking">
            <Button
              variant="outline"
              size="md"
              icon={<Icons.Trophy className="w-4 h-4 text-amber-500" />}
            >
              Xem Xếp Hạng 14 Lớp
            </Button>
          </Link>
        }
      />

      {/* Class Statistics Overview */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4">
        <div className="bg-white rounded-xl sm:rounded-2xl border border-slate-200/80 p-3.5 sm:p-5 shadow-2xs">
          <span className="text-[11px] sm:text-xs font-semibold text-slate-500">
            Thứ hạng toàn trường
          </span>
          <div className="mt-1 sm:mt-2 flex items-center gap-1.5 sm:gap-2">
            <RankBadge rank={rankingInfo?.rank ?? 0} />
          </div>
          <span className="text-[10px] sm:text-[11px] text-slate-400 mt-1 sm:mt-2 block">
            Trong 14 lớp toàn trường
          </span>
        </div>

        <div className="bg-white rounded-xl sm:rounded-2xl border border-slate-200/80 p-3.5 sm:p-5 shadow-2xs">
          <span className="text-[11px] sm:text-xs font-semibold text-slate-500">
            Tổng điểm thi đua
          </span>
          <div className="text-xl sm:text-2xl font-black text-blue-700 mt-1">
            {rankingInfo?.score ?? 100} điểm
          </div>
          <span className="text-[10px] sm:text-[11px] text-slate-400 mt-0.5 sm:mt-1 block">
            Điểm gốc: 100 điểm
          </span>
        </div>

        <div className="bg-white rounded-xl sm:rounded-2xl border border-slate-200/80 p-3.5 sm:p-5 shadow-2xs">
          <span className="text-[11px] sm:text-xs font-semibold text-slate-500">Điểm cộng</span>
          <div className="text-xl sm:text-2xl font-black text-emerald-600 mt-1">
            +{rankingInfo?.positivePoints ?? 0}
          </div>
          <span className="text-[10px] sm:text-[11px] text-slate-400 mt-0.5 sm:mt-1 block">
            Thành tích & Khen thưởng
          </span>
        </div>

        <div className="bg-white rounded-xl sm:rounded-2xl border border-slate-200/80 p-3.5 sm:p-5 shadow-2xs">
          <span className="text-[11px] sm:text-xs font-semibold text-slate-500">Điểm trừ</span>
          <div className="text-xl sm:text-2xl font-black text-rose-600 mt-1">
            -{rankingInfo?.negativePoints ?? 0}
          </div>
          <span className="text-[10px] sm:text-[11px] text-slate-400 mt-0.5 sm:mt-1 block">
            Nhắc nhở nề nếp
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Class Records */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Icons.History className="w-5 h-5 text-blue-600" />
              <CardTitle>Lịch Sử Thi Đua Tập Thể Lớp {currentClass.className}</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-slate-100">
              {records.length === 0 ? (
                <div className="p-6 text-center text-slate-400 text-xs">
                  Chưa có ghi nhận điểm tập thể nào.
                </div>
              ) : (
                records.map((r) => {
                  const crit = criteria.find((c) => c._id === r.criteriaId);
                  return (
                    <div
                      key={r._id}
                      className="p-4 flex items-center justify-between gap-3"
                    >
                      <div>
                        <h5 className="text-sm font-bold text-slate-800">
                          {crit?.name}
                        </h5>
                        {r.note && (
                          <p className="text-xs text-slate-500 mt-0.5 italic">
                            "{r.note}"
                          </p>
                        )}
                        <span className="text-[11px] text-slate-400 mt-1 block">
                          Ghi bởi: {r.createdBy} ·{" "}
                          {new Date(r.createdAt).toLocaleDateString("vi-VN")}
                        </span>
                      </div>
                      <ScoreBadge points={r.points} />
                    </div>
                  );
                })
              )}
            </div>
          </CardContent>
        </Card>

        {/* Class Members */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Icons.Users className="w-5 h-5 text-blue-600" />
              <CardTitle>Thành Viên Lớp ({classStudents.length} Học Sinh Mẫu)</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-slate-100">
              {classStudents.map((st, idx) => (
                <div
                  key={st._id}
                  className="p-3.5 px-4 flex items-center justify-between hover:bg-slate-50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-semibold text-slate-400 w-5">
                      #{idx + 1}
                    </span>
                    <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 font-bold flex items-center justify-center text-xs">
                      {st.fullName.split(" ").slice(-1)[0][0]}
                    </div>
                    <div>
                      <div className="text-xs sm:text-sm font-bold text-slate-800">
                        {st.fullName}
                      </div>
                      <div className="text-[11px] text-slate-400">
                        {st.studentCode} · {st.gender === "MALE" ? "Nam" : "Nữ"}
                      </div>
                    </div>
                  </div>

                  <span className="text-xs font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded">
                    Đang học
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
