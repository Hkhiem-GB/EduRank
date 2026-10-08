"use client";

import React, { useState } from "react";
import { PageHeader } from "@/components/layout/PageHeader";
import { StudentTable } from "@/components/competition/StudentTable";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Icons } from "@/components/ui/Icons";
import { CompetitionRecordForm } from "@/components/competition/CompetitionRecordForm";
import { AddStudentModal } from "@/components/competition/AddStudentModal";

import { useApp } from "@/lib/AppContext";

export default function AdminStudentsPage() {
  const { students, classes, activeRole, refreshData, showToast } = useApp();
  const [selectedStudentForScore, setSelectedStudentForScore] = useState<{
    studentId: string;
    classId: string;
  } | null>(null);

  const [isAddStudentOpen, setIsAddStudentOpen] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const canAddStudent = activeRole === "SUPER_ADMIN" || activeRole === "ADMIN";

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await refreshData();
      showToast("Đã làm mới danh sách học sinh!", "info");
    } catch {
      showToast("Không thể làm mới dữ liệu.", "error");
    } finally {
      setIsRefreshing(false);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        greeting="Cơ sở dữ liệu học sinh"
        title="Quản Lý Học Sinh & Hồ Sơ Thi Đua"
        description={`Tra cứu hồ sơ, theo dõi điểm rèn luyện và ghi nhận điểm thi đua cho ${students.length} học sinh THCS Na Sầm`}
        badge={
          <span className="text-xs font-bold text-blue-700 bg-blue-50 border border-blue-200 px-3 py-1 rounded-full">
            {students.length} Học sinh · {classes.length} Lớp
          </span>
        }
        actions={
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleRefresh}
              disabled={isRefreshing}
              title="Làm mới dữ liệu"
              className="inline-flex items-center justify-center gap-1.5 px-3 py-2 text-xs sm:text-sm font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200/90 rounded-xl transition-all cursor-pointer shadow-2xs disabled:opacity-50"
            >
              <Icons.RefreshCw
                className={`w-3.5 h-3.5 text-slate-600 ${isRefreshing ? "animate-spin text-blue-600" : ""}`}
              />
              <span className="hidden sm:inline">Làm mới</span>
            </button>
            {canAddStudent && (
              <Button
                variant="primary"
                size="md"
                icon={<Icons.Plus className="w-4 h-4" />}
                onClick={() => setIsAddStudentOpen(true)}
              >
                Thêm học sinh mới
              </Button>
            )}
          </div>
        }
      />

      {/* Main Student Table */}
      <StudentTable
        onScoreStudent={(studentId, classId) =>
          setSelectedStudentForScore({ studentId, classId })
        }
        onAddStudent={canAddStudent ? () => setIsAddStudentOpen(true) : undefined}
      />

      {/* Modal: Thêm học sinh mới */}
      <AddStudentModal
        isOpen={isAddStudentOpen}
        onClose={() => setIsAddStudentOpen(false)}
      />

      {/* Scoring Modal for specific student */}
      <Modal
        isOpen={Boolean(selectedStudentForScore)}
        onClose={() => setSelectedStudentForScore(null)}
        title="📝 Ghi Nhận Thi Đua Cá Nhân Học Sinh"
        description="Áp dụng điểm thưởng hoặc nhắc nhở cho học sinh"
      >
        {selectedStudentForScore && (
          <CompetitionRecordForm
            defaultTarget="STUDENT"
            defaultClassId={selectedStudentForScore.classId}
            defaultStudentId={selectedStudentForScore.studentId}
            onSuccess={() => setSelectedStudentForScore(null)}
          />
        )}
      </Modal>
    </div>
  );
}
