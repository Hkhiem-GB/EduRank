"use client";

import React, { useState } from "react";
import { useApp } from "@/lib/AppContext";
import { PageHeader } from "@/components/layout/PageHeader";
import { Icons } from "@/components/ui/Icons";
import { RankBadge, ScoreBadge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { CompetitionRecordForm } from "@/components/competition/CompetitionRecordForm";
import { CustomSelect } from "@/components/ui/CustomSelect";
import Link from "next/link";

export default function AdminClassesPage() {
  const { classes, classRankings, teachers, addClass } = useApp();
  const [selectedGrade, setSelectedGrade] = useState<number | "ALL">("ALL");
  const [scoringClassId, setScoringClassId] = useState<string | null>(null);
  const [isAddClassModalOpen, setIsAddClassModalOpen] = useState(false);

  // Add Class Form State
  const [newClassData, setNewClassData] = useState({
    className: "",
    grade: 6,
    room: "",
    studentCount: 35,
    homeroomTeacherId: "",
  });

  const filteredClasses =
    selectedGrade === "ALL"
      ? classes
      : classes.filter((c) => c.grade === selectedGrade);

  // Dynamic statistics per grade
  const gradeCounts = {
    6: {
      classes: classes.filter((c) => c.grade === 6).length,
      students: classes.filter((c) => c.grade === 6).reduce((acc, c) => acc + (c.studentCount || 0), 0),
    },
    7: {
      classes: classes.filter((c) => c.grade === 7).length,
      students: classes.filter((c) => c.grade === 7).reduce((acc, c) => acc + (c.studentCount || 0), 0),
    },
    8: {
      classes: classes.filter((c) => c.grade === 8).length,
      students: classes.filter((c) => c.grade === 8).reduce((acc, c) => acc + (c.studentCount || 0), 0),
    },
    9: {
      classes: classes.filter((c) => c.grade === 9).length,
      students: classes.filter((c) => c.grade === 9).reduce((acc, c) => acc + (c.studentCount || 0), 0),
    },
  };

  const totalStudents = classes.reduce((acc, c) => acc + (c.studentCount || 0), 0);

  const handleCreateClass = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newClassData.className.trim()) return;

    addClass({
      className: newClassData.className.trim(),
      grade: Number(newClassData.grade),
      room: newClassData.room.trim() || undefined,
      studentCount: Number(newClassData.studentCount) || 35,
      homeroomTeacherId: newClassData.homeroomTeacherId || undefined,
    });

    setIsAddClassModalOpen(false);
    setNewClassData({
      className: "",
      grade: 6,
      room: "",
      studentCount: 35,
      homeroomTeacherId: "",
    });
  };

  return (
    <div className="space-y-6">
      <PageHeader
        greeting="Quản lý cơ cấu trường học"
        title={`Danh Sách ${classes.length} Lớp Học — THCS Na Sầm`}
        description={`Hệ thống quản lý cơ cấu ${classes.length} lớp học với tổng số ${totalStudents} học sinh. Hỗ trợ mở rộng thêm lớp mới khi quy mô học sinh tăng lên.`}
        badge={
          <span className="text-xs font-bold text-blue-700 bg-blue-50 border border-blue-200 px-3 py-1 rounded-full">
            {classes.length} Lớp · {totalStudents} Học sinh
          </span>
        }
        actions={
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="md"
              icon={<Icons.Plus className="w-4 h-4 text-blue-600" />}
              onClick={() => setIsAddClassModalOpen(true)}
            >
              Thêm lớp học
            </Button>
            <Button
              variant="primary"
              size="md"
              icon={<Icons.Plus className="w-4 h-4" />}
              onClick={() => setScoringClassId(classes[0]?._id || null)}
            >
              Ghi điểm thi đua
            </Button>
          </div>
        }
      />

      {/* Grade Quick Filter Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 no-scrollbar">
        <button
          onClick={() => setSelectedGrade("ALL")}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
            selectedGrade === "ALL"
              ? "bg-blue-600 text-white shadow-sm shadow-blue-500/20"
              : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
          }`}
        >
          Tất cả ({classes.length} Lớp · {totalStudents} HS)
        </button>
        {[6, 7, 8, 9].map((g) => (
          <button
            key={g}
            onClick={() => setSelectedGrade(g as number)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
              selectedGrade === g
                ? "bg-blue-600 text-white shadow-sm shadow-blue-500/20"
                : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
            }`}
          >
            Khối {g} ({gradeCounts[g as keyof typeof gradeCounts].classes} Lớp ·{" "}
            {gradeCounts[g as keyof typeof gradeCounts].students} HS)
          </button>
        ))}
      </div>

      {/* Classes Grid: Responsive Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
        {filteredClasses.map((cls) => {
          const rankInfo = classRankings.find((r) => r.classId === cls._id);
          const teacher = teachers.find((t) => {
            const teacherIdStr = String(t._id);
            const clsHomeroomIdStr =
              typeof cls.homeroomTeacherId === "object" && cls.homeroomTeacherId !== null
                ? String((cls.homeroomTeacherId as any)._id)
                : cls.homeroomTeacherId
                ? String(cls.homeroomTeacherId)
                : "";
            const teacherAssignedIdStr =
              typeof t.assignedClassId === "object" && t.assignedClassId !== null
                ? String((t.assignedClassId as any)._id)
                : t.assignedClassId
                ? String(t.assignedClassId)
                : "";

            return (
              (clsHomeroomIdStr && teacherIdStr === clsHomeroomIdStr) ||
              (teacherAssignedIdStr && teacherAssignedIdStr === String(cls._id))
            );
          });

          return (
            <div
              key={cls._id}
              className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-2xs hover:shadow-md transition-all duration-200 flex flex-col justify-between group"
            >
              <div>
                {/* Header row */}
                <div className="flex items-center justify-between mb-3">
                  <Link href={`/classes/${cls._id}`}>
                    <h3 className="text-lg font-extrabold text-slate-900 hover:text-blue-600 transition-colors cursor-pointer">
                      {cls.className}
                    </h3>
                  </Link>
                  <div className="text-right">
                    <RankBadge rank={rankInfo?.rank || 99} />
                  </div>
                </div>

                <div className="mb-4">
                  <p className="text-xs text-slate-500 mt-0.5">
                    Khối {cls.grade} · Trường THCS Na Sầm
                  </p>
                </div>

                {/* Information details */}
                <div className="space-y-2 text-xs bg-slate-50/70 p-3 rounded-xl border border-slate-100">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Sĩ số:</span>
                    <strong className="text-slate-800 font-bold">
                      {cls.studentCount} Học sinh
                    </strong>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">GVCN:</span>
                    <span className="text-slate-700 font-semibold truncate max-w-[140px]">
                      {teacher ? teacher.fullName : "Chưa phân công"}
                    </span>
                  </div>

                  <div className="flex items-center justify-between pt-1 border-t border-slate-200/60">
                    <span className="text-slate-500">Điểm thi đua:</span>
                    <strong className="text-blue-700 font-black text-sm">
                      {rankInfo?.score || 100} điểm
                    </strong>
                  </div>
                </div>

                {/* Score breakdown (+ / -) */}
                <div className="flex items-center justify-between mt-3 text-[11px]">
                  <span className="text-slate-400">Cộng / Trừ tuần:</span>
                  <div className="inline-grid grid-cols-[1fr_1fr] items-center gap-1 w-[72px] sm:w-[84px]">
                    <div className="flex justify-end">
                      <ScoreBadge points={rankInfo?.positivePoints || 0} showPlus={true} />
                    </div>
                    <div className="flex justify-start">
                      <ScoreBadge
                        points={-Math.abs(rankInfo?.negativePoints || 0)}
                        showPlus={false}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Action buttons */}
              <div className="mt-5 pt-3 border-t border-slate-100 flex items-center gap-2">
                <Link href={`/classes/${cls._id}`} className="flex-1">
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full justify-center group-hover:bg-blue-50 group-hover:text-blue-700 group-hover:border-blue-200"
                  >
                    Xem chi tiết
                  </Button>
                </Link>
                <Button
                  variant="secondary"
                  size="sm"
                  className="px-3"
                  icon={<Icons.Plus className="w-3.5 h-3.5" />}
                  onClick={() => setScoringClassId(cls._id)}
                  title="Ghi nhận điểm thi đua"
                >
                  Ghi điểm
                </Button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal Add Class */}
      <Modal
        isOpen={isAddClassModalOpen}
        onClose={() => setIsAddClassModalOpen(false)}
        title="🏫 Thêm Lớp Học Mới"
        description="Khởi tạo lớp học mới để mở rộng cơ sở quy mô trường THCS Na Sầm"
      >
        <form onSubmit={handleCreateClass} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Tên lớp học <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={newClassData.className}
              onChange={(e) => setNewClassData({ ...newClassData, className: e.target.value })}
              placeholder="VD: 6A4, 7A5, 8A4"
              className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Khối lớp</label>
              <CustomSelect
                value={newClassData.grade}
                onChange={(val) => setNewClassData({ ...newClassData, grade: Number(val) })}
                options={[
                  { value: 6, label: "Khối 6" },
                  { value: 7, label: "Khối 7" },
                  { value: 8, label: "Khối 8" },
                  { value: 9, label: "Khối 9" },
                ]}
                className="w-full"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Sĩ số ban đầu</label>
              <input
                type="number"
                min="1"
                max="60"
                value={newClassData.studentCount}
                onChange={(e) => setNewClassData({ ...newClassData, studentCount: Number(e.target.value) })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Phòng học</label>
            <input
              type="text"
              value={newClassData.room}
              onChange={(e) => setNewClassData({ ...newClassData, room: e.target.value })}
              placeholder="VD: Phòng 104 - Dãy A"
              className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Giáo viên chủ nhiệm</label>
            <CustomSelect
              value={newClassData.homeroomTeacherId}
              onChange={(val) => setNewClassData({ ...newClassData, homeroomTeacherId: val })}
              options={[
                { value: "", label: "Chưa phân công GVCN" },
                ...teachers.map((t) => ({
                  value: t._id,
                  label: `${t.fullName} (${t.teacherCode})`,
                })),
              ]}
              className="w-full"
            />
          </div>

          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
            <Button
              type="button"
              variant="outline"
              size="md"
              onClick={() => setIsAddClassModalOpen(false)}
            >
              Hủy
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="md"
              icon={<Icons.Plus className="w-4 h-4" />}
            >
              Tạo lớp học
            </Button>
          </div>
        </form>
      </Modal>

      {/* Modal scoring */}
      <Modal
        isOpen={Boolean(scoringClassId)}
        onClose={() => setScoringClassId(null)}
        title="📝 Ghi Nhận Thi Đua Lớp"
        description="Áp dụng điểm nề nếp hoặc giờ học cho lớp học đã chọn"
      >
        {scoringClassId && (
          <CompetitionRecordForm
            defaultTarget="CLASS"
            defaultClassId={scoringClassId}
            onSuccess={() => setScoringClassId(null)}
          />
        )}
      </Modal>
    </div>
  );
}
