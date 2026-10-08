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

export default function AdminDashboardPage() {
  const {
    statistics,
    classRankings,
    studentRankings,
    recentActivities,
  } = useApp();

  const [isScoringModalOpen, setIsScoringModalOpen] = useState(false);

  return (
    <div className="space-y-6">
      {/* Page Header (Section 8.1 & 8.3) */}
      <PageHeader
        greeting="Kính chào Ban Thi Đua & Quản Trị 👋"
        title="Bảng Điều Khiển Tổng Quan"
        description="Tổng quan hệ thống thi đua, nề nếp kỷ luật và xếp hạng 14 lớp học với 496 học sinh"
        actions={
          <Button
            variant="primary"
            size="md"
            className="w-full sm:w-auto"
            icon={<Icons.Plus className="w-3.5 h-3.5 sm:w-4 sm:h-4" />}
            onClick={() => setIsScoringModalOpen(true)}
          >
            Ghi nhận điểm thi đua
          </Button>
        }
      />

      {/* 1. Filter Bar (Section 19) */}
      <CompetitionFilterBar />

      {/* 2. 4 Competition Statistics Cards (Section 20) */}
      <CompetitionStatCard stats={statistics} />

      {/* 3. Main Dashboard Grid (Section 18 & 44) */}
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
        title="📝 Ghi Nhận Điểm Thi Đua Ban Thi Đua"
        description="Áp dụng điểm thi đua nề nếp, học tập cho tập thể Lớp hoặc cá nhân Học sinh"
      >
        <CompetitionRecordForm
          onSuccess={() => setIsScoringModalOpen(false)}
        />
      </Modal>
    </div>
  );
}
