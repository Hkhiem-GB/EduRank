"use client";

import React, { useState } from "react";
import { useApp } from "@/lib/AppContext";
import { PageHeader } from "@/components/layout/PageHeader";
import { CompetitionFilterBar } from "@/components/competition/CompetitionFilterBar";
import { CompetitionStatCard } from "@/components/competition/CompetitionStatCard";
import { ClassRanking } from "@/components/competition/ClassRanking";
import { StudentRanking } from "@/components/competition/StudentRanking";
import { RecentActivityFeed } from "@/components/competition/RecentActivityFeed";
import { Button } from "@/components/ui/Button";
import { Icons } from "@/components/ui/Icons";
import { Modal } from "@/components/ui/Modal";
import { CompetitionRecordForm } from "@/components/competition/CompetitionRecordForm";
import Link from "next/link";

export default function HomePage() {
  const {
    activeRole,
    currentUser,
    statistics,
    classRankings,
    studentRankings,
    recentActivities,
  } = useApp();

  const [isScoringModalOpen, setIsScoringModalOpen] = useState(false);

  return (
    <div>
      {/* Page Header (Section 18) */}
      <PageHeader
        greeting={`Xin chào, ${currentUser.fullName} 👋`}
        title="Tổng Quan Thi Đua Toàn Trường"
        description="Theo dõi nề nếp, kỷ luật, thành tích học tập và phong trào thi đua trường THCS Na Sầm"
        badge={
          <span className="text-xs font-bold text-blue-700 bg-blue-50 border border-blue-200/70 px-2.5 py-1 rounded-full">
            Tuần 5 · 2026–2027
          </span>
        }
        actions={
          <div className="grid grid-cols-2 sm:flex sm:items-center gap-1.5 sm:gap-2 w-full md:w-auto">
            <Link href="/ranking" className="w-full sm:w-auto">
              <Button
                variant="outline"
                size="md"
                className="w-full sm:w-auto"
                icon={<Icons.Trophy className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-500" />}
              >
                Bảng xếp hạng
              </Button>
            </Link>

            {activeRole !== "STUDENT" && (
              <Button
                variant="primary"
                size="md"
                className="w-full sm:w-auto"
                icon={<Icons.Plus className="w-3.5 h-3.5 sm:w-4 sm:h-4" />}
                onClick={() => setIsScoringModalOpen(true)}
              >
                Ghi nhận thi đua
              </Button>
            )}
          </div>
        }
      />

      {/* Role Navigation banner if in Student or Teacher mode */}
      {activeRole === "STUDENT" && (
        <div className="mb-6 p-4 bg-gradient-to-r from-blue-600 to-sky-600 rounded-2xl text-white shadow-md flex items-center justify-between flex-wrap gap-3">
          <div>
            <h4 className="font-bold text-base">
              Bạn đang ở chế độ xem Học sinh (Nguyễn Văn An - Lớp 6A1)
            </h4>
            <p className="text-blue-100 text-xs mt-0.5">
              Xem điểm thi đua cá nhân, hạng lớp và lịch sử rèn luyện của bạn.
            </p>
          </div>
          <Link href="/student/dashboard">
            <Button
              variant="outline"
              size="sm"
              className="bg-white text-blue-700 border-white hover:bg-blue-50 font-bold"
            >
              Vào Dashboard Học sinh →
            </Button>
          </Link>
        </div>
      )}

      {activeRole === "TEACHER" && (
        <div className="mb-6 p-4 bg-gradient-to-r from-indigo-700 to-blue-600 rounded-2xl text-white shadow-md flex items-center justify-between flex-wrap gap-3">
          <div>
            <h4 className="font-bold text-base">
              Khu vực Giáo viên (Cô Trần Thị Mai - GVCN 8A2)
            </h4>
            <p className="text-indigo-100 text-xs mt-0.5">
              Theo dõi nề nếp lớp chủ nhiệm 8A2 và nhập điểm thi đua các lớp bộ môn.
            </p>
          </div>
          <Link href="/teacher/dashboard">
            <Button
              variant="outline"
              size="sm"
              className="bg-white text-blue-700 border-white hover:bg-blue-50 font-bold"
            >
              Vào Dashboard Giáo viên →
            </Button>
          </Link>
        </div>
      )}

      {/* 1. Filter Bar (Section 19) */}
      <CompetitionFilterBar />

      {/* 2. 4 Dashboard Statistics Cards (Section 20) */}
      <CompetitionStatCard stats={statistics} />

      {/* 3. Main Content: Rankings & Live Activity Feed (Section 18 & 44) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Class Leaderboard (2 Columns) */}
        <div className="lg:col-span-2 space-y-6">
          <ClassRanking
            rankings={classRankings}
            title="🏆 Bảng Xếp Hạng Thi Đua Lớp (14 Lớp THCS Na Sầm)"
            limit={8}
            showDetails={true}
          />

          <div className="flex justify-end">
            <Link
              href="/ranking"
              className="text-xs font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1.5 transition-colors"
            >
              <span>Xem đầy đủ bảng xếp hạng 14 lớp</span>
              <Icons.ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* Right Sidebar: Exemplary Students & Recent Live Activity */}
        <div className="space-y-6">
          {/* Top Exemplary Students */}
          <StudentRanking
            rankings={studentRankings}
            title="⭐ Top Học Sinh Tiêu Biểu"
            limit={4}
          />

          {/* Recent Live Feed */}
          <RecentActivityFeed
            activities={recentActivities}
            title="Dòng Hoạt Động Thi Đua"
            limit={5}
          />
        </div>
      </div>

      {/* Modal for Recording Score */}
      <Modal
        isOpen={isScoringModalOpen}
        onClose={() => setIsScoringModalOpen(false)}
        title="📝 Ghi Nhận Điểm Thi Đua Nhanh"
        description="Ghi nhận điểm cộng / trừ nề nếp cho Lớp học hoặc Học sinh trường THCS Na Sầm"
      >
        <CompetitionRecordForm
          onSuccess={() => setIsScoringModalOpen(false)}
        />
      </Modal>
    </div>
  );
}
