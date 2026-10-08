"use client";

import React, { useState } from "react";
import { useApp } from "@/lib/AppContext";
import { PageHeader } from "@/components/layout/PageHeader";
import { CompetitionFilterBar } from "@/components/competition/CompetitionFilterBar";
import { CompetitionStatCard } from "@/components/competition/CompetitionStatCard";
import { ClassRanking } from "@/components/competition/ClassRanking";
import { StudentRanking } from "@/components/competition/StudentRanking";
import { RecentActivityFeed } from "@/components/competition/RecentActivityFeed";
import { Icons } from "@/components/ui/Icons";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { CompetitionRecordForm } from "@/components/competition/CompetitionRecordForm";
import Link from "next/link";

export default function TeacherDashboardPage() {
  const {
    classes,
    classRankings,
    studentRankings,
    recentActivities,
    statistics,
    currentUser,
    teachers,
  } = useApp();

  const [isScoringModalOpen, setIsScoringModalOpen] = useState(false);

  // Link homeroom class to logged-in teacher
  const currentTeacher = teachers.find((t) => t.teacherCode === currentUser?.accountCode);
  const homeroomClass = classes.find((c) => {
    if (currentTeacher?.assignedClassId) {
      return String(c._id) === String(currentTeacher.assignedClassId);
    }
    return c.homeroomTeacherId && String(c.homeroomTeacherId) === String(currentTeacher?._id);
  }) || classes[0];
  const homeroomRank = homeroomClass ? classRankings.find((r) => r.classId === homeroomClass._id) : undefined;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <PageHeader
        greeting={`Kính chào Thầy/Cô ${currentUser?.fullName || ""} 👋`}
        title="Bảng Điều Khiển Giáo Viên"
        description="Theo dõi nề nếp thi đua toàn trường và quản lý chuyên sâu lớp chủ nhiệm tại THCS Na Sầm"
        badge={
          <span className="text-xs font-bold text-blue-700 bg-blue-50 border border-blue-200 px-3 py-1 rounded-full">
            GVCN Lớp ${homeroomClass?.className || ""} · Năm học 2026–2027
          </span>
        }
        actions={
          <div className="grid grid-cols-2 sm:flex sm:items-center gap-1.5 sm:gap-2 w-full md:w-auto">
            <Link href="/teacher/my-class" className="w-full sm:w-auto">
              <Button
                variant="outline"
                size="md"
                className="w-full sm:w-auto"
                icon={<Icons.School className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-blue-600" />}
              >
                <span className="hidden sm:inline">Lớp học của tôi</span>
                <span className="sm:hidden">Lớp của tôi</span> ({homeroomClass?.className || ""})
              </Button>
            </Link>
            <Button
              variant="primary"
              size="md"
              className="w-full sm:w-auto"
              icon={<Icons.Plus className="w-3.5 h-3.5 sm:w-4 sm:h-4" />}
              onClick={() => setIsScoringModalOpen(true)}
            >
              <span className="hidden sm:inline">Ghi nhận điểm thi đua</span>
              <span className="sm:hidden">Ghi nhận thi đua</span>
            </Button>
          </div>
        }
      />

      {/* Homeroom Highlight Banner */}
      <div className="bg-gradient-to-r from-blue-700 via-indigo-700 to-sky-600 rounded-xl sm:rounded-2xl p-4 sm:p-6 text-white shadow-md flex flex-col md:flex-row md:items-center justify-between gap-3 sm:gap-4 relative overflow-hidden">
        <div className="relative z-10">
          <div className="flex items-center gap-1.5 sm:gap-2 mb-1.5 sm:mb-2 flex-wrap">
            <span className="text-[10px] sm:text-[11px] font-bold bg-white/20 text-white px-2 sm:px-2.5 py-0.5 rounded-full uppercase tracking-wider">
              Lớp Chủ Nhiệm Trọng Tâm
            </span>
            <span className="text-[11px] sm:text-xs font-black bg-amber-400 text-amber-950 px-2 sm:px-2.5 py-0.5 rounded-full">
              #{homeroomRank?.rank ?? "—"} Toàn Trường
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl md:text-3xl font-black">
            Lớp {homeroomClass?.className || ""} — Khối {homeroomClass?.grade || ""}
          </h2>
          <p className="text-blue-100 text-[11px] sm:text-sm mt-0.5 sm:mt-1">
            Sĩ số: {homeroomClass?.studentCount || 0} HS · Điểm tuần này:{" "}
            <strong className="text-white text-sm sm:text-base font-bold">{homeroomRank?.score ?? 100} điểm</strong>
          </p>
        </div>

        <div className="relative z-10 flex items-center gap-2 sm:gap-3">
          <Link href="/teacher/my-class" className="w-full sm:w-auto">
            <button className="w-full sm:w-auto bg-white text-blue-700 hover:bg-blue-50 font-bold text-xs sm:text-sm px-3.5 py-2 sm:px-4 sm:py-2.5 rounded-lg sm:rounded-xl shadow-xs transition-colors cursor-pointer">
              Vào quản lý lớp →
            </button>
          </Link>
        </div>
      </div>

      {/* 1. Filter Bar */}
      <CompetitionFilterBar />

      {/* 2. 4 Competition Statistics Cards */}
      <CompetitionStatCard stats={statistics} />

      {/* 3. Main Dashboard Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Class Leaderboard (Left 2 cols) */}
        <div className="lg:col-span-2 space-y-6">
          <ClassRanking
            rankings={classRankings}
            title="Bảng Xếp Hạng Thi Đua Lớp Toàn Trường"
            showDetails={true}
          />
        </div>

        {/* Right Sidebar: Exemplary Students & Activity Stream */}
        <div className="space-y-6">
          <StudentRanking
            rankings={studentRankings}
            title="Top Học Sinh Tiêu Biểu"
            limit={5}
          />

          <RecentActivityFeed
            activities={recentActivities}
            title="Lịch Sử Ghi Nhận Trực Tiếp"
            limit={6}
          />
        </div>
      </div>

      {/* Scoring Modal */}
      <Modal
        isOpen={isScoringModalOpen}
        onClose={() => setIsScoringModalOpen(false)}
        title="📝 Ghi Nhận Điểm Thi Đua"
        description="Ghi nhận điểm nền nếp hoặc học tập cho tập thể lớp hoặc cá nhân học sinh"
      >
        <CompetitionRecordForm
          onSuccess={() => setIsScoringModalOpen(false)}
        />
      </Modal>
    </div>
  );
}
