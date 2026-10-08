"use client";

import React, { useState, useMemo, Suspense } from "react";
import { useParams, useRouter } from "next/navigation";
import { useApp } from "@/lib/AppContext";
import { PageHeader } from "@/components/layout/PageHeader";
import { Icons } from "@/components/ui/Icons";
import { Badge, ScoreBadge, RankBadge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { CustomSelect, CustomSelectOption } from "@/components/ui/CustomSelect";
import { CompetitionRecordForm } from "@/components/competition/CompetitionRecordForm";
import { AddStudentModal } from "@/components/competition/AddStudentModal";

function ClassDetailContent() {
  const params = useParams();
  const router = useRouter();
  const classId = params?.classId as string;

  const {
    classes,
    teachers,
    students,
    classRankings,
    studentRankings,
    classRecords: allClassRecords,
    studentRecords: allStudentRecords,
    criteria,
    activeRole,
    updateHomeroomTeacher,
    cancelRecord,
    refreshData,
    showToast,
  } = useApp();

  const [activeTab, setActiveTab] = useState<"students" | "history" | "stats">("students");
  const [isChangeTeacherModalOpen, setIsChangeTeacherModalOpen] = useState(false);
  const [selectedTeacherId, setSelectedTeacherId] = useState("");
  const [changeSuccessMessage, setChangeSuccessMessage] = useState("");
  const [isAddStudentOpen, setIsAddStudentOpen] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const canAddStudent = activeRole === "SUPER_ADMIN" || activeRole === "ADMIN";

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await refreshData();
      showToast("Đã làm mới dữ liệu lớp học thành công!", "info");
    } catch {
      showToast("Không thể làm mới dữ liệu.", "error");
    } finally {
      setIsRefreshing(false);
    }
  };

  const [scoringTarget, setScoringTarget] = useState<{
    type: "CLASS" | "STUDENT";
    id: string;
  } | null>(null);

  // Find class
  const currentClass = classes.find((c) => String(c._id) === classId);
  const formattedClassName = currentClass
    ? currentClass.className.startsWith("Lớp ")
      ? currentClass.className
      : `Lớp ${currentClass.className}`
    : "";
  const currentTeacher = teachers.find((t) => {
    const teacherIdStr = String(t._id);
    const clsHomeroomIdStr =
      typeof currentClass?.homeroomTeacherId === "object" && currentClass?.homeroomTeacherId !== null
        ? String((currentClass.homeroomTeacherId as any)._id)
        : currentClass?.homeroomTeacherId
        ? String(currentClass.homeroomTeacherId)
        : "";
    const teacherAssignedIdStr =
      typeof t.assignedClassId === "object" && t.assignedClassId !== null
        ? String((t.assignedClassId as any)._id)
        : t.assignedClassId
        ? String(t.assignedClassId)
        : "";

    return (
      (clsHomeroomIdStr && teacherIdStr === clsHomeroomIdStr) ||
      (teacherAssignedIdStr && currentClass && teacherAssignedIdStr === String(currentClass._id))
    );
  });
  const rankInfo = classRankings.find((r) => r.classId === classId);

  // Class students
  const classStudents = useMemo(() => {
    return students.filter((s) => s.classId === classId);
  }, [students, classId]);

  interface UnifiedRecord {
    _id: string;
    targetType: "CLASS" | "STUDENT";
    targetId: string;
    criteriaId: string;
    criteriaName: string;
    points: number;
    note?: string;
    createdBy: string;
    createdAt: string;
    status: string;
  }

  // Class records (both class-level and student-level within this class)
  const classRecords = useMemo<UnifiedRecord[]>(() => {
    const studentIds = new Set(classStudents.map((s) => String(s._id)));
    const list: UnifiedRecord[] = [];

    allClassRecords
      .filter((r) => String(r.classId) === String(classId))
      .forEach((r) => {
        const crit = criteria.find((c) => String(c._id) === String(r.criteriaId));
        list.push({
          _id: r._id,
          targetType: "CLASS",
          targetId: String(r.classId),
          criteriaId: String(r.criteriaId),
          criteriaName: crit?.name || "Tiêu chí lớp",
          points: r.points,
          note: r.note,
          createdBy: r.createdBy,
          createdAt: String(r.createdAt),
          status: r.status,
        });
      });

    allStudentRecords
      .filter((r) => String(r.classId) === String(classId) || studentIds.has(String(r.studentId)))
      .forEach((r) => {
        const crit = criteria.find((c) => String(c._id) === String(r.criteriaId));
        list.push({
          _id: r._id,
          targetType: "STUDENT",
          targetId: String(r.studentId),
          criteriaId: String(r.criteriaId),
          criteriaName: crit?.name || "Tiêu chí học sinh",
          points: r.points,
          note: r.note,
          createdBy: r.createdBy,
          createdAt: String(r.createdAt),
          status: r.status,
        });
      });

    return list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [allClassRecords, allStudentRecords, criteria, classId, classStudents]);

  // Statistics by criteria
  const criteriaStats = useMemo(() => {
    const map = new Map<string, { name: string; count: number; totalPoints: number; isBonus: boolean }>();
    classRecords
      .filter((r) => r.status === "ACTIVE")
      .forEach((r) => {
        const existing = map.get(r.criteriaId) || {
          name: r.criteriaName,
          count: 0,
          totalPoints: 0,
          isBonus: r.points > 0,
        };
        existing.count += 1;
        existing.totalPoints += r.points;
        map.set(r.criteriaId, existing);
      });
    return Array.from(map.values()).sort((a, b) => b.count - a.count);
  }, [classRecords]);

  const topViolations = criteriaStats.filter((c) => !c.isBonus);
  const topBonuses = criteriaStats.filter((c) => c.isBonus);

  // Real-time Class Competition Stats computed directly from all active records of this class
  const classStats = useMemo(() => {
    let positive = 0;
    let negative = 0;
    classRecords.forEach((r) => {
      if (r.status === "ACTIVE") {
        if (r.points > 0) positive += r.points;
        else negative += Math.abs(r.points);
      }
    });
    return {
      positive,
      negative,
      currentScore: 100 + positive - negative,
    };
  }, [classRecords]);

  if (!currentClass) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
        <Icons.AlertCircle className="w-12 h-12 text-amber-500 mx-auto mb-3" />
        <h2 className="text-xl font-bold text-slate-800">Không tìm thấy thông tin lớp học</h2>
        <p className="text-sm text-slate-500 mt-1">Mã lớp không hợp lệ hoặc đã bị thay đổi.</p>
        <Button variant="primary" className="mt-4" onClick={() => router.back()}>
          Quay lại
        </Button>
      </div>
    );
  }

  const canChangeTeacher = activeRole === "SUPER_ADMIN" || activeRole === "ADMIN";

  const handleChangeTeacher = () => {
    if (!selectedTeacherId) return;
    updateHomeroomTeacher(currentClass._id, selectedTeacherId);
    setIsChangeTeacherModalOpen(false);
    const newTeacher = teachers.find((t) => t._id === selectedTeacherId);
    setChangeSuccessMessage(`Đã cập nhật GVCN mới: ${newTeacher?.fullName || "Thành công"}`);
    setTimeout(() => setChangeSuccessMessage(""), 4000);
  };

  const realStudentCount = classStudents.length;
  const currentRank = rankInfo?.rank ?? "—";

  return (
    <div className="space-y-6">
      {/* Back button */}
      <div>
        <button
          onClick={() => router.back()}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-blue-600 transition-colors"
        >
          <Icons.ChevronRight className="w-4 h-4 rotate-180" />
          <span>Quay lại danh sách</span>
        </button>
      </div>

      {/* Success notification */}
      {changeSuccessMessage && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-sm font-semibold flex items-center justify-between animate-fade-in">
          <div className="flex items-center gap-2">
            <Icons.Check className="w-5 h-5 text-emerald-600" />
            <span>{changeSuccessMessage}</span>
          </div>
          <button
            onClick={() => setChangeSuccessMessage("")}
            className="text-emerald-600 hover:text-emerald-800 text-xs font-bold"
          >
            Đóng
          </button>
        </div>
      )}

      {/* Page Header */}
      <PageHeader
        greeting={`Chi tiết tập thể lớp · Khối ${currentClass.grade}`}
        title={`${formattedClassName} — THCS Na Sầm`}
        description={`Sĩ số ${realStudentCount} học sinh · GVCN: ${currentTeacher ? currentTeacher.fullName : "Chưa phân công"} · Niên khóa 2026–2027`}
        badge={
          <div className="flex items-center gap-2">
            <RankBadge rank={rankInfo?.rank || 99} />
            <span className="text-xs font-bold text-blue-700 bg-blue-50 border border-blue-200 px-3 py-1 rounded-full">
              {classStats.currentScore} Điểm thi đua
            </span>
          </div>
        }
        actions={
          <div className="flex items-center gap-2">
            {canChangeTeacher && (
              <Button
                variant="outline"
                size="md"
                icon={<Icons.UserCheck className="w-4 h-4 text-blue-600" />}
                onClick={() => {
                  setSelectedTeacherId(currentClass.homeroomTeacherId || "");
                  setIsChangeTeacherModalOpen(true);
                }}
              >
                Đổi giáo viên chủ nhiệm
              </Button>
            )}
            {canAddStudent && (
              <Button
                variant="outline"
                size="md"
                icon={<Icons.UserPlus className="w-4 h-4 text-blue-600" />}
                onClick={() => setIsAddStudentOpen(true)}
              >
                Thêm học sinh
              </Button>
            )}
            <Button
              variant="primary"
              size="md"
              icon={<Icons.Plus className="w-4 h-4" />}
              onClick={() => setScoringTarget({ type: "CLASS", id: currentClass._id })}
            >
              Ghi điểm cho lớp
            </Button>
          </div>
        }
      />

      {/* Stat summary cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4">
        <div className="bg-white rounded-xl sm:rounded-2xl border border-slate-200/80 p-3 sm:p-4 shadow-2xs">
          <div className="text-[11px] sm:text-xs font-semibold text-slate-500">Sĩ số lớp</div>
          <div className="text-xl sm:text-2xl font-black text-slate-800 mt-1">{realStudentCount} HS</div>
          <div className="text-[10px] sm:text-[11px] text-slate-400 mt-0.5">100% tài khoản hoạt động</div>
        </div>
        <div className="bg-white rounded-xl sm:rounded-2xl border border-slate-200/80 p-3 sm:p-4 shadow-2xs">
          <div className="text-[11px] sm:text-xs font-semibold text-slate-500">Điểm thi đua hiện tại</div>
          <div className="text-xl sm:text-2xl font-black text-blue-700 mt-1">{classStats.currentScore}</div>
          <div className="text-[10px] sm:text-[11px] text-slate-400 mt-0.5">Xếp hạng #{currentRank} toàn trường</div>
        </div>
        <div className="bg-white rounded-xl sm:rounded-2xl border border-slate-200/80 p-3 sm:p-4 shadow-2xs">
          <div className="text-[11px] sm:text-xs font-semibold text-slate-500">Điểm thưởng tuần</div>
          <div className="text-xl sm:text-2xl font-black text-emerald-600 mt-1">+{classStats.positive}</div>
          <div className="text-[10px] sm:text-[11px] text-slate-400 mt-0.5">Thành tích & Khen thưởng</div>
        </div>
        <div className="bg-white rounded-xl sm:rounded-2xl border border-slate-200/80 p-3 sm:p-4 shadow-2xs">
          <div className="text-[11px] sm:text-xs font-semibold text-slate-500">Điểm trừ tuần</div>
          <div className="text-xl sm:text-2xl font-black text-rose-600 mt-1">-{classStats.negative}</div>
          <div className="text-[10px] sm:text-[11px] text-slate-400 mt-0.5">Nhắc nhở nề nếp</div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2 overflow-x-auto no-scrollbar">
        <button
          onClick={() => setActiveTab("students")}
          className={`px-3 sm:px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-2 ${
            activeTab === "students"
              ? "bg-blue-600 text-white shadow-sm shadow-blue-500/20"
              : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
          }`}
        >
          <Icons.Users className="w-4 h-4 shrink-0" />
          <span>Danh sách học sinh ({classStudents.length})</span>
        </button>

        <button
          onClick={() => setActiveTab("history")}
          className={`px-3 sm:px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-2 ${
            activeTab === "history"
              ? "bg-blue-600 text-white shadow-sm shadow-blue-500/20"
              : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
          }`}
        >
          <Icons.Clock className="w-4 h-4 shrink-0" />
          <span>Lịch sử thi đua ({classRecords.length})</span>
        </button>

        <button
          onClick={() => setActiveTab("stats")}
          className={`px-3 sm:px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-2 ${
            activeTab === "stats"
              ? "bg-blue-600 text-white shadow-sm shadow-blue-500/20"
              : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
          }`}
        >
          <Icons.Award className="w-4 h-4 shrink-0" />
          <span>Thống kê tiêu chí ({criteriaStats.length})</span>
        </button>
      </div>

      {/* Tab 1: Students */}
      {activeTab === "students" && (
        <div className="bg-white rounded-xl sm:rounded-2xl border border-slate-200/80 shadow-2xs overflow-hidden">
          <div className="p-3 sm:p-4 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h3 className="font-bold text-slate-800 text-xs sm:text-sm">
                Danh Sách Học Sinh {formattedClassName}
              </h3>
              <span className="text-xs text-slate-500 font-medium hidden sm:inline">
                Tổng số: <strong className="text-blue-700">{classStudents.length}</strong> học sinh
              </span>
            </div>
            <button
              type="button"
              onClick={handleRefresh}
              disabled={isRefreshing}
              title="Làm mới danh sách học sinh"
              className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200/90 rounded-xl transition-all cursor-pointer shadow-2xs disabled:opacity-50"
            >
              <Icons.RefreshCw
                className={`w-3.5 h-3.5 text-slate-600 ${isRefreshing ? "animate-spin text-blue-600" : ""}`}
              />
              <span className="hidden sm:inline">Làm mới</span>
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-[11px] sm:text-xs md:text-sm">
              <thead>
                <tr className="bg-slate-50/70 border-b border-slate-200/80 text-[10px] sm:text-[11px] md:text-xs font-bold text-slate-500 uppercase tracking-wider select-none">
                  <th className="py-2 sm:py-3 px-1.5 sm:px-3 md:px-4 w-10 sm:w-12 text-center">STT</th>
                  <th className="py-2 sm:py-3 px-2 sm:px-3 md:px-4 hidden sm:table-cell">Mã HS</th>
                  <th className="py-2 sm:py-3 px-2 sm:px-3 md:px-4">Họ và tên</th>
                  <th className="py-2 sm:py-3 px-2 sm:px-3 md:px-4 hidden md:table-cell">Ngày sinh</th>
                  <th className="py-2 sm:py-3 px-2 sm:px-3 md:px-4 hidden lg:table-cell">Giới tính</th>
                  <th className="py-2 sm:py-3 px-1.5 sm:px-3 md:px-4 text-center">Điểm cá nhân</th>
                  <th className="py-2 sm:py-3 px-2 sm:px-3 md:px-4 text-center hidden sm:table-cell">Trạng thái</th>
                  <th className="py-2 sm:py-3 px-2 sm:px-3 md:px-4 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {classStudents.map((st, idx) => {
                  const stRanking = studentRankings.find((r) => r.studentId === st._id);
                  const score = stRanking?.score || 100;

                  return (
                    <tr key={st._id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-1.5 sm:py-2.5 px-1.5 sm:px-3 md:px-4 text-center text-[11px] sm:text-xs text-slate-400 font-medium">
                        {idx + 1}
                      </td>
                      <td className="py-1.5 sm:py-2.5 px-2 sm:px-3 md:px-4 font-mono text-xs font-semibold text-slate-600 hidden sm:table-cell">
                        {st.studentCode}
                      </td>
                      <td className="py-1.5 sm:py-2.5 px-2 sm:px-3 md:px-4">
                        <div className="font-bold text-slate-800 text-xs sm:text-sm md:text-base">
                          {st.fullName}
                        </div>
                        <div className="text-[10px] text-slate-400 font-mono sm:hidden">
                          {st.studentCode}
                        </div>
                      </td>
                      <td className="py-1.5 sm:py-2.5 px-2 sm:px-3 md:px-4 text-xs text-slate-500 hidden md:table-cell">
                        {new Date(st.dateOfBirth).toLocaleDateString("vi-VN")}
                      </td>
                      <td className="py-1.5 sm:py-2.5 px-2 sm:px-3 md:px-4 text-xs text-slate-600 hidden lg:table-cell">
                        {st.gender === "MALE" ? "Nam" : st.gender === "FEMALE" ? "Nữ" : "Khác"}
                      </td>
                      <td className="py-1.5 sm:py-2.5 px-1 sm:px-3 whitespace-nowrap text-center">
                        <div className="font-extrabold text-blue-700 text-xs sm:text-sm md:text-base">
                          {score}
                        </div>
                        <div className="inline-grid grid-cols-[1fr_1fr] items-center gap-1 sm:gap-1.5 w-[76px] sm:w-[94px] md:w-[108px] mx-auto mt-0.5">
                          <div className="flex justify-end">
                            <ScoreBadge points={stRanking?.positivePoints || 0} showPlus={true} />
                          </div>
                          <div className="flex justify-start">
                            <ScoreBadge
                              points={-Math.abs(stRanking?.negativePoints || 0)}
                              showPlus={false}
                            />
                          </div>
                        </div>
                      </td>
                      <td className="py-1.5 sm:py-2.5 px-2 sm:px-3 md:px-4 text-center hidden sm:table-cell">
                        <Badge variant={st.status === "ACTIVE" ? "success" : "neutral"} size="sm">
                          {st.status === "ACTIVE" ? "Đang học" : "Đã chuyển"}
                        </Badge>
                      </td>
                      <td className="py-1.5 sm:py-2.5 px-2 sm:px-3 md:px-4 text-right">
                        <Button
                          variant="secondary"
                          size="sm"
                          className="px-2 py-1 text-xs"
                          icon={<Icons.Plus className="w-3.5 h-3.5" />}
                          onClick={() => setScoringTarget({ type: "STUDENT", id: st._id })}
                        >
                          <span className="hidden xs:inline">Chấm điểm</span>
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 2: Class History */}
      {activeTab === "history" && (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs overflow-hidden">
          <div className="p-4 border-b border-slate-100 flex items-center justify-between">
            <h3 className="font-bold text-slate-800 text-sm">
              Lịch Sử Ghi Nhận Thi Đua ({classRecords.length} lượt)
            </h3>
          </div>

          <div className="divide-y divide-slate-100">
            {classRecords.length === 0 ? (
              <div className="p-8 text-center text-slate-400 text-sm">
                Chưa có dữ liệu ghi nhận thi đua nào cho lớp này.
              </div>
            ) : (
              classRecords.map((rec) => {
                const isCancelled = rec.status === "CANCELLED";
                const targetStudent = students.find((s) => s._id === rec.targetId);

                return (
                  <div
                    key={rec._id}
                    className={`p-4 flex items-start justify-between gap-3 hover:bg-slate-50/70 transition-colors ${
                      isCancelled ? "opacity-50 line-through bg-slate-50/50" : ""
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div
                        className={`mt-0.5 w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                          rec.points > 0 ? "bg-emerald-50 text-emerald-600" : "bg-rose-50 text-rose-600"
                        }`}
                      >
                        {rec.points > 0 ? <Icons.Plus className="w-4 h-4" /> : <Icons.Minus className="w-4 h-4" />}
                      </div>

                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-bold text-slate-800 text-sm">
                            {rec.targetType === "CLASS" ? `Tập thể Lớp ${currentClass.className}` : targetStudent?.fullName || "Học sinh"}
                          </span>
                          <span className="text-xs text-slate-400">·</span>
                          <span className="text-xs font-semibold text-slate-600">{rec.criteriaName}</span>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-600">
                            {rec.targetType === "CLASS" ? "Điểm lớp" : "Điểm học sinh"}
                          </span>
                        </div>

                        {rec.note && <p className="text-xs text-slate-500 mt-1 italic">"{rec.note}"</p>}

                        <div className="flex items-center gap-2 mt-1 text-[11px] text-slate-400">
                          <span>Người ghi: {rec.createdBy}</span>
                          <span>•</span>
                          <span>
                            {new Date(rec.createdAt).toLocaleDateString("vi-VN", {
                              hour: "2-digit",
                              minute: "2-digit",
                              day: "2-digit",
                              month: "2-digit",
                            })}
                          </span>
                          {isCancelled && <span className="text-rose-600 font-bold ml-1">(Đã hủy)</span>}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <ScoreBadge points={rec.points} />
                      {(activeRole === "ADMIN" || activeRole === "SUPER_ADMIN") && !isCancelled && (
                        <button
                          onClick={() => cancelRecord(rec._id, rec.targetType)}
                          className="text-[11px] text-rose-500 hover:text-rose-700 hover:bg-rose-50 px-2 py-1 rounded transition-colors"
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
      )}

      {/* Tab 3: Criteria stats */}
      {activeTab === "stats" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Top violations */}
            <div className="bg-white rounded-2xl border border-rose-100 p-5 shadow-2xs">
              <div className="flex items-center gap-2 mb-3">
                <Icons.TrendingDown className="w-5 h-5 text-rose-600" />
                <h4 className="font-bold text-slate-800 text-sm">Nội Dung Vi Phạm Nhiều Nhất</h4>
              </div>
              {topViolations.length === 0 ? (
                <div className="text-xs text-slate-400 py-4">Chưa có vi phạm nào trong tuần này.</div>
              ) : (
                <div className="space-y-2">
                  {topViolations.slice(0, 5).map((v, i) => (
                    <div key={i} className="flex items-center justify-between p-2.5 bg-rose-50/50 rounded-xl text-xs">
                      <span className="font-semibold text-slate-700">{v.name}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-slate-400 font-medium">{v.count} lượt</span>
                        <ScoreBadge points={v.totalPoints} showPlus={false} />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Top bonuses */}
            <div className="bg-white rounded-2xl border border-emerald-100 p-5 shadow-2xs">
              <div className="flex items-center gap-2 mb-3">
                <Icons.TrendingUp className="w-5 h-5 text-emerald-600" />
                <h4 className="font-bold text-slate-800 text-sm">Thành Tích Khen Thưởng Nhiều Nhất</h4>
              </div>
              {topBonuses.length === 0 ? (
                <div className="text-xs text-slate-400 py-4">Chưa có khen thưởng nào trong tuần này.</div>
              ) : (
                <div className="space-y-2">
                  {topBonuses.slice(0, 5).map((b, i) => (
                    <div key={i} className="flex items-center justify-between p-2.5 bg-emerald-50/50 rounded-xl text-xs">
                      <span className="font-semibold text-slate-700">{b.name}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-slate-400 font-medium">{b.count} lượt</span>
                        <ScoreBadge points={b.totalPoints} />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Modal: Change Homeroom Teacher */}
      <Modal
        isOpen={isChangeTeacherModalOpen}
        onClose={() => setIsChangeTeacherModalOpen(false)}
        title={`👨‍🏫 Đổi Giáo Viên Chủ Nhiệm Lớp ${currentClass.className}`}
        description="Chọn giáo viên chủ nhiệm mới cho lớp học. Hệ thống sẽ ghi nhận lịch sử vào nhật ký hệ thống."
      >
        <div className="space-y-4">
          <div>
            <CustomSelect
              label="Chọn Giáo Viên Chủ Nhiệm Mới:"
              value={selectedTeacherId}
              onChange={(val) => setSelectedTeacherId(val)}
              options={[
                { value: "", label: "-- Chọn giáo viên --" },
                ...teachers.map((t) => {
                  const teacherIdStr = String(t._id);
                  const assignedCls = classes.find((c) => {
                    const cHomeroomIdStr =
                      typeof c.homeroomTeacherId === "object" && c.homeroomTeacherId !== null
                        ? String((c.homeroomTeacherId as any)._id)
                        : c.homeroomTeacherId
                        ? String(c.homeroomTeacherId)
                        : "";
                    const tAssignedIdStr =
                      typeof t.assignedClassId === "object" && t.assignedClassId !== null
                        ? String((t.assignedClassId as any)._id)
                        : t.assignedClassId
                        ? String(t.assignedClassId)
                        : "";
                    return (
                      (cHomeroomIdStr && cHomeroomIdStr === teacherIdStr) ||
                      (tAssignedIdStr && tAssignedIdStr === String(c._id))
                    );
                  });
                  const isCurrent = currentTeacher?._id === t._id;
                  return {
                    value: t._id,
                    label: `${t.fullName} · ${t.department || "Giáo viên"}${assignedCls ? ` (Đang CN: ${assignedCls.className})` : " (Chưa có lớp)"}${isCurrent ? " ★ Hiện tại" : ""}`,
                  };
                }),
              ]}
              className="w-full"
            />
          </div>

          <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-800 flex items-start gap-2">
            <Icons.AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <span>
              Lưu ý: Nếu giáo viên này đang chủ nhiệm lớp khác, thao tác này sẽ chuyển giao quyền chủ nhiệm lớp {currentClass.className} và lưu nhật ký thay đổi.
            </span>
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
            <Button variant="outline" onClick={() => setIsChangeTeacherModalOpen(false)}>
              Hủy bỏ
            </Button>
            <Button
              variant="primary"
              disabled={!selectedTeacherId || selectedTeacherId === currentTeacher?._id}
              onClick={handleChangeTeacher}
            >
              Xác nhận thay đổi
            </Button>
          </div>
        </div>
      </Modal>

      {/* Modal: Scoring */}
      <Modal
        isOpen={Boolean(scoringTarget)}
        onClose={() => setScoringTarget(null)}
        title={
          scoringTarget?.type === "CLASS"
            ? `📝 Ghi Nhận Thi Đua Lớp ${currentClass.className}`
            : "📝 Chấm Điểm Thi Đua Học Sinh"
        }
        description="Ghi nhận điểm cộng / trừ nề nếp và học tập theo quy chuẩn thi đua THCS Na Sầm"
      >
        {scoringTarget && (
          <CompetitionRecordForm
            defaultTarget={scoringTarget.type}
            defaultClassId={currentClass._id}
            defaultStudentId={scoringTarget.type === "STUDENT" ? scoringTarget.id : undefined}
            onSuccess={() => setScoringTarget(null)}
          />
        )}
      </Modal>

      {/* Modal: Thêm học sinh vào lớp */}
      <AddStudentModal
        isOpen={isAddStudentOpen}
        onClose={() => setIsAddStudentOpen(false)}
        defaultClassId={classId}
      />
    </div>
  );
}

export default function ClassDetailPage() {
  return (
    <Suspense
      fallback={
        <div className="bg-white rounded-2xl border border-slate-200/80 p-12 text-center text-slate-400 font-medium">
          Đang tải chi tiết lớp học...
        </div>
      }
    >
      <ClassDetailContent />
    </Suspense>
  );
}
