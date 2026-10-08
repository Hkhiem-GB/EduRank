"use client";

import React, { useState, useMemo, useEffect } from "react";
import { useApp } from "@/lib/AppContext";
import { PageHeader } from "@/components/layout/PageHeader";
import { Icons } from "@/components/ui/Icons";
import { Badge, ScoreBadge, RankBadge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { CustomSelect, CustomSelectOption } from "@/components/ui/CustomSelect";
import { CompetitionRecordForm } from "@/components/competition/CompetitionRecordForm";
import { IStudent } from "@/types";

export default function TeacherMyClassPage() {
  const {
    classes,
    students,
    studentRankings,
    classRankings,
    classRecords: allClassRecords,
    studentRecords: allStudentRecords,
    criteria,
    addStudent,
    updateStudent,
    deactivateStudent,
    reorderStudents,
  } = useApp();

  // Homeroom class is 8A2
  const myClass = classes.find((c) => c.classCode === "8A2") || classes[0];
  const classRank = myClass ? classRankings.find((r) => r.classId === myClass._id) : undefined;

  const [activeTab, setActiveTab] = useState<"overview" | "students" | "history">("overview");

  // Search & Filters in tabs
  const [studentSearch, setStudentSearch] = useState("");
  const [studentSortOrder, setStudentSortOrder] = useState<string>("DEFAULT");
  const [historySearch, setHistorySearch] = useState("");
  const [historyTypeFilter, setHistoryTypeFilter] = useState<"ALL" | "PLUS" | "MINUS">("ALL");

  // Reorder mode state
  const [isReordering, setIsReordering] = useState(false);
  const [reorderList, setReorderList] = useState<IStudent[]>([]);

  // Modals
  const [isAddStudentOpen, setIsAddStudentOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<IStudent | null>(null);
  const [deactivatingStudent, setDeactivatingStudent] = useState<IStudent | null>(null);
  const [scoringStudentId, setScoringStudentId] = useState<string | null>(null);
  const [isClassScoringOpen, setIsClassScoringOpen] = useState(false);

  // Student Account Creation Form state
  const [studentFormData, setStudentFormData] = useState({
    fullName: "",
    gender: "FEMALE" as "MALE" | "FEMALE",
    dateOfBirth: "2012-05-15",
    password: "••••••••",
  });
  const [showPassword, setShowPassword] = useState(false);

  // Students in this class
  const classStudents = useMemo(() => {
    return students.filter((s) => s.classId === myClass._id);
  }, [students, myClass]);

  // Keep reorderList in sync when classStudents change and not in reorder mode
  useEffect(() => {
    if (!isReordering) {
      setReorderList(classStudents);
    }
  }, [classStudents, isReordering]);

  // Vietnamese Name extractor for proper alphabetical sorting
  const getLastName = (fullName: string) => {
    const parts = fullName.trim().split(/\s+/);
    return parts[parts.length - 1]?.toLowerCase() || "";
  };

  // Sorted and Filtered Students
  const displayedStudents = useMemo(() => {
    if (isReordering) {
      return reorderList;
    }

    let list = [...classStudents];

    // Apply Sorting
    switch (studentSortOrder) {
      case "NAME_ASC":
        list.sort((a, b) => {
          const lastA = getLastName(a.fullName);
          const lastB = getLastName(b.fullName);
          return lastA.localeCompare(lastB, "vi");
        });
        break;
      case "NAME_DESC":
        list.sort((a, b) => {
          const lastA = getLastName(a.fullName);
          const lastB = getLastName(b.fullName);
          return lastB.localeCompare(lastA, "vi");
        });
        break;
      case "SCORE_DESC":
        list.sort((a, b) => {
          const scoreA = studentRankings.find((r) => r.studentId === a._id)?.score || 100;
          const scoreB = studentRankings.find((r) => r.studentId === b._id)?.score || 100;
          return scoreB - scoreA;
        });
        break;
      case "SCORE_ASC":
        list.sort((a, b) => {
          const scoreA = studentRankings.find((r) => r.studentId === a._id)?.score || 100;
          const scoreB = studentRankings.find((r) => r.studentId === b._id)?.score || 100;
          return scoreA - scoreB;
        });
        break;
      case "DEFAULT":
      default:
        // Use default class roster order
        break;
    }

    // Apply Search
    if (studentSearch.trim()) {
      list = list.filter(
        (s) =>
          s.fullName.toLowerCase().includes(studentSearch.toLowerCase()) ||
          s.studentCode.toLowerCase().includes(studentSearch.toLowerCase())
      );
    }

    return list;
  }, [classStudents, isReordering, reorderList, studentSortOrder, studentSearch, studentRankings]);

  // Reorder handlers
  const handleStartReorder = () => {
    setStudentSortOrder("DEFAULT");
    setStudentSearch("");
    setReorderList([...classStudents]);
    setIsReordering(true);
  };

  const handleMoveStudent = (index: number, direction: "up" | "down") => {
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= reorderList.length) return;
    const nextList = [...reorderList];
    const temp = nextList[index];
    nextList[index] = nextList[targetIndex];
    nextList[targetIndex] = temp;
    setReorderList(nextList);
  };

  const handleSaveReorder = () => {
    reorderStudents(myClass._id, reorderList.map((s) => s._id));
    setIsReordering(false);
  };

  const handleCancelReorder = () => {
    setReorderList([...classStudents]);
    setIsReordering(false);
  };

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

  // Class records
  const classRecords = useMemo<UnifiedRecord[]>(() => {
    const studentIds = new Set(classStudents.map((s) => s._id));
    const list: UnifiedRecord[] = [];

    allClassRecords
      .filter((r) => r.classId === myClass._id)
      .forEach((r) => {
        const crit = criteria.find((c) => c._id === r.criteriaId);
        list.push({
          _id: r._id,
          targetType: "CLASS",
          targetId: r.classId,
          criteriaId: r.criteriaId,
          criteriaName: crit?.name || "Tiêu chí lớp",
          points: r.points,
          note: r.note,
          createdBy: r.createdBy,
          createdAt: String(r.createdAt),
          status: r.status,
        });
      });

    allStudentRecords
      .filter((r) => studentIds.has(r.studentId))
      .forEach((r) => {
        const crit = criteria.find((c) => c._id === r.criteriaId);
        list.push({
          _id: r._id,
          targetType: "STUDENT",
          targetId: r.studentId,
          criteriaId: r.criteriaId,
          criteriaName: crit?.name || "Tiêu chí học sinh",
          points: r.points,
          note: r.note,
          createdBy: r.createdBy,
          createdAt: String(r.createdAt),
          status: r.status,
        });
      });

    return list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [allClassRecords, allStudentRecords, criteria, myClass, classStudents]);

  const filteredHistory = useMemo(() => {
    return classRecords.filter((r) => {
      const matchSearch =
        r.criteriaName.toLowerCase().includes(historySearch.toLowerCase()) ||
        (r.note && r.note.toLowerCase().includes(historySearch.toLowerCase()));
      const matchType =
        historyTypeFilter === "ALL"
          ? true
          : historyTypeFilter === "PLUS"
          ? r.points > 0
          : r.points < 0;
      return matchSearch && matchType;
    });
  }, [classRecords, historySearch, historyTypeFilter]);

  // Violations & Bonuses stats
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

  const resetStudentForm = () => {
    setStudentFormData({
      fullName: "",
      gender: "FEMALE",
      dateOfBirth: "2012-05-15",
      password: "••••••••",
    });
    setShowPassword(false);
  };

  const handleOpenAddStudent = () => {
    resetStudentForm();
    setIsAddStudentOpen(true);
  };

  const handleOpenEditStudent = (st: IStudent) => {
    setEditingStudent(st);
    setStudentFormData({
      fullName: st.fullName,
      gender: (st.gender as "MALE" | "FEMALE") || "FEMALE",
      dateOfBirth: st.dateOfBirth ? String(st.dateOfBirth).split("T")[0] : "2012-05-15",
      password: "",
    });
    setShowPassword(false);
  };

  const handleSaveAddStudent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!studentFormData.fullName.trim()) return;

    addStudent({
      fullName: studentFormData.fullName.trim(),
      gender: studentFormData.gender,
      dateOfBirth: studentFormData.dateOfBirth,
      classId: myClass._id,
      parentName: "Phụ huynh " + studentFormData.fullName.trim(),
    });

    setIsAddStudentOpen(false);
    resetStudentForm();
  };

  const handleSaveEditStudent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingStudent) return;

    updateStudent({
      ...editingStudent,
      fullName: studentFormData.fullName.trim(),
      gender: studentFormData.gender,
      dateOfBirth: studentFormData.dateOfBirth,
    });

    setEditingStudent(null);
    resetStudentForm();
  };

  const handleConfirmDeactivateStudent = () => {
    if (deactivatingStudent) {
      deactivateStudent(deactivatingStudent._id);
      setDeactivatingStudent(null);
    }
  };

  const studentSortOptions: CustomSelectOption[] = [
    { value: "DEFAULT", label: "Mặc định (Theo sổ điểm)" },
    { value: "NAME_ASC", label: "Tên học sinh (A → Z)" },
    { value: "NAME_DESC", label: "Tên học sinh (Z → A)" },
    { value: "SCORE_DESC", label: "Điểm thi đua (Cao → Thấp)" },
    { value: "SCORE_ASC", label: "Điểm thi đua (Thấp → Cao)" },
  ];

  const genderOptions: CustomSelectOption[] = [
    { value: "FEMALE", label: "Nữ" },
    { value: "MALE", label: "Nam" },
  ];

  if (!myClass) {
    return (
      <div className="py-12 text-center text-slate-500">
        <p className="text-sm">Đang tải thông tin lớp học...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <PageHeader
        greeting="Quản lý lớp chủ nhiệm"
        title={`Lớp ${myClass.className} — THCS Na Sầm`}
        description={`Sĩ số ${classStudents.length} học sinh · Khối ${myClass.grade} · Niên khóa 2026–2027`}
        badge={
          <div className="flex items-center gap-2">
            <RankBadge rank={classRank?.rank || 2} />
            <span className="text-xs font-bold text-blue-700 bg-blue-50 border border-blue-200 px-3 py-1 rounded-full">
              {classRank?.score || 175} Điểm thi đua tuần
            </span>
          </div>
        }
        actions={
          <div className="flex items-center gap-2">
            {/* DUY NHẤT 1 NÚT THÊM HỌC SINH TẠI ĐÂY */}
            <Button
              variant="outline"
              size="md"
              icon={<Icons.Plus className="w-4 h-4 text-blue-600" />}
              onClick={handleOpenAddStudent}
            >
              Thêm học sinh
            </Button>
            <Button
              variant="primary"
              size="md"
              icon={<Icons.Plus className="w-4 h-4" />}
              onClick={() => setIsClassScoringOpen(true)}
            >
              Ghi điểm cho lớp
            </Button>
          </div>
        }
      />

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2 overflow-x-auto no-scrollbar">
        <button
          onClick={() => {
            setActiveTab("overview");
            if (isReordering) handleCancelReorder();
          }}
          className={`px-3 sm:px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-2 ${
            activeTab === "overview"
              ? "bg-blue-600 text-white shadow-sm shadow-blue-500/20"
              : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
          }`}
        >
          <Icons.LayoutDashboard className="w-4 h-4 shrink-0" />
          <span>Tổng quan tuần</span>
        </button>

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
          onClick={() => {
            setActiveTab("history");
            if (isReordering) handleCancelReorder();
          }}
          className={`px-3 sm:px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-2 ${
            activeTab === "history"
              ? "bg-blue-600 text-white shadow-sm shadow-blue-500/20"
              : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
          }`}
        >
          <Icons.History className="w-4 h-4 shrink-0" />
          <span>Nhật ký thi đua ({classRecords.length})</span>
        </button>
      </div>

      {/* Tab 1: Overview */}
      {activeTab === "overview" && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4">
            <div className="bg-white rounded-xl sm:rounded-2xl border border-slate-200/80 p-3.5 sm:p-5 shadow-2xs">
              <span className="text-[11px] sm:text-xs font-semibold text-slate-500">Xếp hạng tuần</span>
              <div className="text-2xl sm:text-3xl font-black text-slate-800 mt-1 sm:mt-2 flex items-center gap-1.5 sm:gap-2 flex-wrap">
                #{classRank?.rank ?? "—"}
                {classRank?.rank && classRank.rank <= 3 && (
                  <span className="text-[10px] sm:text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                    Top 3 trường
                  </span>
                )}
              </div>
            </div>

            <div className="bg-white rounded-xl sm:rounded-2xl border border-slate-200/80 p-3.5 sm:p-5 shadow-2xs">
              <span className="text-[11px] sm:text-xs font-semibold text-slate-500">Tổng điểm thi đua</span>
              <div className="text-2xl sm:text-3xl font-black text-blue-700 mt-1 sm:mt-2">
                {classRank?.score ?? 100}
              </div>
              <p className="text-[10px] sm:text-[11px] text-slate-400 mt-0.5 sm:mt-1">Xuất phát điểm 100</p>
            </div>

            <div className="bg-white rounded-xl sm:rounded-2xl border border-slate-200/80 p-3.5 sm:p-5 shadow-2xs">
              <span className="text-[11px] sm:text-xs font-semibold text-slate-500">Điểm khen thưởng (+)</span>
              <div className="text-2xl sm:text-3xl font-black text-emerald-600 mt-1 sm:mt-2">
                +{classRank?.positivePoints ?? 0}
              </div>
            </div>

            <div className="bg-white rounded-xl sm:rounded-2xl border border-slate-200/80 p-3.5 sm:p-5 shadow-2xs">
              <span className="text-[11px] sm:text-xs font-semibold text-slate-500">Điểm trừ vi phạm (-)</span>
              <div className="text-2xl sm:text-3xl font-black text-rose-600 mt-1 sm:mt-2">
                -{classRank?.negativePoints ?? 0}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {/* Violations */}
            <div className="bg-white rounded-2xl border border-rose-100 p-5 shadow-2xs">
              <div className="flex items-center gap-2 mb-3">
                <Icons.AlertTriangle className="w-5 h-5 text-rose-600" />
                <h4 className="font-bold text-slate-800 text-sm">Vi Phạm Cần Lưu Ý Trong Tuần</h4>
              </div>
              {topViolations.length === 0 ? (
                <div className="text-xs text-slate-400 py-6 text-center">
                  Không có vi phạm nề nếp nào trong tuần này.
                </div>
              ) : (
                <div className="space-y-2">
                  {topViolations.slice(0, 5).map((v, i) => (
                    <div key={i} className="flex items-center justify-between p-2.5 bg-rose-50/50 rounded-xl text-xs">
                      <span className="font-semibold text-slate-700">{v.name}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-slate-400 font-medium">{v.count} lượt</span>
                        <ScoreBadge points={v.totalPoints} />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Commendations */}
            <div className="bg-white rounded-2xl border border-emerald-100 p-5 shadow-2xs">
              <div className="flex items-center gap-2 mb-3">
                <Icons.TrendingUp className="w-5 h-5 text-emerald-600" />
                <h4 className="font-bold text-slate-800 text-sm">Khen Thưởng & Thành Tích Nổi Bật</h4>
              </div>
              {topBonuses.length === 0 ? (
                <div className="text-xs text-slate-400 py-6 text-center">
                  Chưa có khen thưởng phong trào nào tuần này.
                </div>
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

      {/* Tab 2: Students List */}
      {activeTab === "students" && (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs overflow-hidden">
          {/* Reordering Banner if active */}
          {isReordering && (
            <div className="p-4 bg-blue-50 border-b border-blue-200 flex flex-col sm:flex-row items-center justify-between gap-3 animate-in fade-in duration-200">
              <div className="flex items-center gap-2.5 text-xs sm:text-sm text-blue-900 font-medium">
                <Icons.Info className="w-5 h-5 text-blue-600 shrink-0" />
                <span>
                  Đang ở chế độ chỉnh sửa thứ tự danh sách theo sổ điểm lớp. Bấm nút <strong>Lên / Xuống</strong> để sắp xếp vị trí khớp sổ điểm giấy.
                </span>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleCancelReorder}
                >
                  Hủy
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  icon={<Icons.Check className="w-4 h-4" />}
                  onClick={handleSaveReorder}
                >
                  Lưu thứ tự
                </Button>
              </div>
            </div>
          )}

          {/* Filter Bar with Sort Dropdown and Reorder Button */}
          {!isReordering && (
            <div className="p-4 border-b border-slate-100 flex flex-col md:flex-row items-center justify-between gap-3">
              <div className="relative w-full md:max-w-md">
                <Icons.Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={studentSearch}
                  onChange={(e) => setStudentSearch(e.target.value)}
                  placeholder="Tìm theo họ tên hoặc mã học sinh..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 pl-10 pr-4 text-xs sm:text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex items-center gap-2.5 flex-wrap w-full md:w-auto justify-end">
                {/* Custom Dropdown: Sorting */}
                <CustomSelect
                  value={studentSortOrder}
                  onChange={(val) => setStudentSortOrder(val)}
                  options={studentSortOptions}
                  size="sm"
                  className="min-w-[210px]"
                />

                {/* Chỉnh sửa thứ tự danh sách */}
                <Button
                  variant="outline"
                  size="sm"
                  icon={<Icons.ArrowUpDown className="w-4 h-4 text-blue-600" />}
                  onClick={handleStartReorder}
                  title="Sắp xếp lại thứ tự học sinh theo sổ điểm giấy"
                >
                  Chỉnh sửa thứ tự
                </Button>
              </div>
            </div>
          )}

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-[11px] sm:text-xs md:text-sm">
              <thead>
                <tr className="bg-slate-50/70 border-b border-slate-200/80 text-[10px] sm:text-[11px] md:text-xs font-bold text-slate-500 uppercase tracking-wider select-none">
                  <th className="py-2 sm:py-3 px-1.5 sm:px-3 md:px-4 w-10 sm:w-12 text-center">STT</th>
                  {isReordering && (
                    <th className="py-2 sm:py-3 px-2 sm:px-3 text-center whitespace-nowrap">Di chuyển</th>
                  )}
                  <th className="py-2 sm:py-3 px-2 sm:px-3 md:px-4 whitespace-nowrap hidden sm:table-cell">Mã HS</th>
                  <th className="py-2 sm:py-3 px-2 sm:px-3 md:px-4 whitespace-nowrap">Họ và tên</th>
                  <th className="py-2 sm:py-3 px-2 sm:px-3 md:px-4 hidden md:table-cell whitespace-nowrap">Ngày sinh</th>
                  <th className="py-2 sm:py-3 px-2 sm:px-3 md:px-4 hidden lg:table-cell whitespace-nowrap">Giới tính</th>
                  <th className="py-2 sm:py-3 px-1.5 sm:px-3 md:px-4 text-center whitespace-nowrap">Điểm thi đua</th>
                  <th className="py-2 sm:py-3 px-2 sm:px-3 md:px-4 text-center whitespace-nowrap hidden sm:table-cell">Trạng thái</th>
                  <th className="py-2 sm:py-3 px-2 sm:px-3 md:px-4 text-right whitespace-nowrap">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {displayedStudents.length === 0 ? (
                  <tr>
                    <td colSpan={isReordering ? 9 : 8} className="py-12 text-center text-slate-400">
                      Không tìm thấy học sinh nào trong lớp phù hợp.
                    </td>
                  </tr>
                ) : (
                  displayedStudents.map((st, idx) => {
                    const stRanking = studentRankings.find((r) => r.studentId === st._id);
                    const score = stRanking?.score || 100;

                    return (
                      <tr key={st._id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-1.5 sm:py-2.5 px-1.5 sm:px-3 md:px-4 text-center text-[11px] sm:text-xs text-slate-400 font-medium">
                          {idx + 1}
                        </td>

                        {/* Reorder Buttons Column */}
                        {isReordering && (
                          <td className="py-1.5 sm:py-2.5 px-2 sm:px-3 text-center">
                            <div className="flex items-center justify-center gap-1">
                              <button
                                type="button"
                                disabled={idx === 0}
                                onClick={() => handleMoveStudent(idx, "up")}
                                className="p-1 rounded bg-slate-100 hover:bg-blue-100 text-slate-600 hover:text-blue-700 disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer"
                                title="Di chuyển lên trên"
                              >
                                <Icons.ArrowUp className="w-3.5 h-3.5" />
                              </button>
                              <button
                                type="button"
                                disabled={idx === displayedStudents.length - 1}
                                onClick={() => handleMoveStudent(idx, "down")}
                                className="p-1 rounded bg-slate-100 hover:bg-blue-100 text-slate-600 hover:text-blue-700 disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer"
                                title="Di chuyển xuống dưới"
                              >
                                <Icons.ArrowDown className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        )}

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
                          {st.gender === "MALE" ? "Nam" : "Nữ"}
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
                          <div className="flex items-center justify-end gap-1">
                            <button
                              onClick={() => setScoringStudentId(st._id)}
                              className="p-1 sm:p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                              title="Ghi nhận điểm thi đua"
                            >
                              <Icons.Plus className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                            </button>
                            <button
                              onClick={() => handleOpenEditStudent(st)}
                              className="p-1 sm:p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                              title="Chỉnh sửa thông tin"
                            >
                              <Icons.Edit className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                            </button>
                            <button
                              onClick={() => setDeactivatingStudent(st)}
                              className={`p-1 sm:p-1.5 rounded-lg transition-colors cursor-pointer ${
                                st.status === "ACTIVE"
                                  ? "text-slate-400 hover:text-amber-600 hover:bg-amber-50"
                                  : "text-emerald-600 hover:bg-emerald-50"
                              }`}
                              title={st.status === "ACTIVE" ? "Khóa tài khoản" : "Mở lại tài khoản"}
                            >
                              <Icons.Lock className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 3: History */}
      {activeTab === "history" && (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs overflow-hidden">
          <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="relative w-full sm:max-w-md">
              <Icons.Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={historySearch}
                onChange={(e) => setHistorySearch(e.target.value)}
                placeholder="Tìm theo tiêu chí hoặc ghi chú..."
                className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 pl-10 pr-4 text-xs sm:text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setHistoryTypeFilter("ALL")}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  historyTypeFilter === "ALL"
                    ? "bg-blue-600 text-white"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                Tất cả ({classRecords.length})
              </button>
              <button
                onClick={() => setHistoryTypeFilter("PLUS")}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  historyTypeFilter === "PLUS"
                    ? "bg-emerald-600 text-white"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                Cộng (+)
              </button>
              <button
                onClick={() => setHistoryTypeFilter("MINUS")}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  historyTypeFilter === "MINUS"
                    ? "bg-rose-600 text-white"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                Trừ (-)
              </button>
            </div>
          </div>

          <div className="divide-y divide-slate-100">
            {filteredHistory.length === 0 ? (
              <div className="py-12 text-center text-slate-400 text-xs sm:text-sm">
                Không tìm thấy bản ghi thi đua nào phù hợp.
              </div>
            ) : (
              filteredHistory.map((r) => {
                const isClass = r.targetType === "CLASS";
                const student = !isClass ? students.find((s) => s._id === r.targetId) : null;

                return (
                  <div key={r._id} className="p-4 hover:bg-slate-50/60 transition-colors flex items-center justify-between gap-4">
                    <div className="flex items-start gap-3">
                      <div
                        className={`mt-0.5 w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                          r.points > 0 ? "bg-emerald-50 text-emerald-600" : "bg-rose-50 text-rose-600"
                        }`}
                      >
                        {r.points > 0 ? <Icons.Plus className="w-4 h-4" /> : <Icons.Minus className="w-4 h-4" />}
                      </div>

                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-800 text-xs sm:text-sm">{r.criteriaName}</span>
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                              isClass ? "bg-blue-50 text-blue-700" : "bg-purple-50 text-purple-700"
                            }`}
                          >
                            {isClass ? "Lớp học" : `HS: ${student?.fullName || ""}`}
                          </span>
                        </div>

                        {r.note && <p className="text-xs text-slate-500 mt-0.5 italic">"{r.note}"</p>}

                        <div className="flex items-center gap-2 mt-1 text-[11px] text-slate-400">
                          <span>Người ghi: {r.createdBy}</span>
                          <span>•</span>
                          <span>
                            {new Date(r.createdAt).toLocaleDateString("vi-VN", {
                              hour: "2-digit",
                              minute: "2-digit",
                              day: "2-digit",
                              month: "2-digit",
                            })}
                          </span>
                        </div>
                      </div>
                    </div>

                    <ScoreBadge points={r.points} />
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* Add Student Modal (Tạo tài khoản đăng nhập học sinh) */}
      <Modal
        isOpen={isAddStudentOpen}
        onClose={() => setIsAddStudentOpen(false)}
        title="👤 Tạo Tài Khoản Học Sinh Mới"
        description={`Khởi tạo tài khoản truy cập và hồ sơ rèn luyện cho học sinh Lớp ${myClass.className}`}
      >
        <form onSubmit={handleSaveAddStudent} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Họ và tên học sinh <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={studentFormData.fullName}
              onChange={(e) => setStudentFormData({ ...studentFormData, fullName: e.target.value })}
              placeholder="VD: Hoàng Minh Nhật"
              className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Ngày sinh <span className="text-rose-500">*</span>
              </label>
              <input
                type="date"
                required
                value={studentFormData.dateOfBirth}
                onChange={(e) => setStudentFormData({ ...studentFormData, dateOfBirth: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Giới tính</label>
              <CustomSelect
                value={studentFormData.gender}
                onChange={(val) => setStudentFormData({ ...studentFormData, gender: val as "MALE" | "FEMALE" })}
                options={genderOptions}
                className="w-full"
              />
            </div>
          </div>

          {/* Mật khẩu khởi tạo đăng nhập có nút ẩn / hiện */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Mật khẩu khởi tạo đăng nhập <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                required
                value={studentFormData.password}
                onChange={(e) => setStudentFormData({ ...studentFormData, password: e.target.value })}
                placeholder="Nhập mật khẩu (mặc định: 123456)"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 pl-3 pr-10 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                {showPassword ? "Ẩn" : "Hiện"}
              </button>
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              Học sinh dùng Mã học sinh (được sinh tự động) và mật khẩu này để đăng nhập.
            </p>
          </div>

          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
            <Button variant="outline" type="button" onClick={() => setIsAddStudentOpen(false)}>
              Hủy
            </Button>
            <Button variant="primary" type="submit" icon={<Icons.Plus className="w-4 h-4" />}>
              Tạo tài khoản học sinh
            </Button>
          </div>
        </form>
      </Modal>

      {/* Edit Student Modal */}
      <Modal
        isOpen={Boolean(editingStudent)}
        onClose={() => setEditingStudent(null)}
        title={`✏️ Chỉnh Sửa Học Sinh: ${editingStudent?.fullName}`}
        description="Cập nhật thông tin cá nhân của học sinh"
      >
        <form onSubmit={handleSaveEditStudent} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Họ và tên học sinh <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={studentFormData.fullName}
              onChange={(e) => setStudentFormData({ ...studentFormData, fullName: e.target.value })}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Ngày sinh</label>
              <input
                type="date"
                required
                value={studentFormData.dateOfBirth}
                onChange={(e) => setStudentFormData({ ...studentFormData, dateOfBirth: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Giới tính</label>
              <CustomSelect
                value={studentFormData.gender}
                onChange={(val) => setStudentFormData({ ...studentFormData, gender: val as "MALE" | "FEMALE" })}
                options={genderOptions}
                className="w-full"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
            <Button variant="outline" type="button" onClick={() => setEditingStudent(null)}>
              Hủy
            </Button>
            <Button variant="primary" type="submit" icon={<Icons.Check className="w-4 h-4" />}>
              Cập nhật
            </Button>
          </div>
        </form>
      </Modal>

      {/* Deactivate Student Confirmation Modal */}
      <Modal
        isOpen={Boolean(deactivatingStudent)}
        onClose={() => setDeactivatingStudent(null)}
        title={
          deactivatingStudent?.status === "ACTIVE"
            ? "🔒 Xác nhận chuyển / tạm khóa học sinh"
            : "🔓 Xác nhận kích hoạt lại học sinh"
        }
        description={`Cập nhật trạng thái theo học của học sinh: ${deactivatingStudent?.fullName}`}
      >
        <div className="space-y-4">
          <p className="text-sm text-slate-600">
            Học sinh: <strong className="text-slate-900">{deactivatingStudent?.fullName}</strong> (Mã: {deactivatingStudent?.studentCode}).
            {deactivatingStudent?.status === "ACTIVE"
              ? " Trạng thái sẽ chuyển sang 'Đã chuyển' (tạm ngưng). Lịch sử thi đua và điểm số của học sinh vẫn được bảo lưu đầy đủ."
              : " Học sinh sẽ được kích hoạt lại và tiếp tục tham gia thi đua bình thường."}
          </p>

          <div className="flex items-center justify-end gap-2.5 pt-2">
            <Button variant="outline" size="md" onClick={() => setDeactivatingStudent(null)}>
              Hủy
            </Button>
            <Button
              variant={deactivatingStudent?.status === "ACTIVE" ? "danger" : "primary"}
              size="md"
              onClick={handleConfirmDeactivateStudent}
            >
              {deactivatingStudent?.status === "ACTIVE" ? "Xác nhận khóa" : "Kích hoạt lại"}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Scoring Modal for Student */}
      <Modal
        isOpen={Boolean(scoringStudentId)}
        onClose={() => setScoringStudentId(null)}
        title="📝 Ghi Nhận Thi Đua Học Sinh"
        description="Ghi nhận điểm cộng / trừ nề nếp cho học sinh đã chọn"
      >
        {scoringStudentId && (
          <CompetitionRecordForm
            defaultTarget="STUDENT"
            defaultClassId={myClass._id}
            defaultStudentId={scoringStudentId}
            onSuccess={() => setScoringStudentId(null)}
          />
        )}
      </Modal>

      {/* Scoring Modal for Class */}
      <Modal
        isOpen={isClassScoringOpen}
        onClose={() => setIsClassScoringOpen(false)}
        title="📝 Ghi Nhận Thi Đua Tập Thể Lớp"
        description={`Ghi nhận điểm thi đua cho Lớp ${myClass.className}`}
      >
        <CompetitionRecordForm
          defaultTarget="CLASS"
          defaultClassId={myClass._id}
          onSuccess={() => setIsClassScoringOpen(false)}
        />
      </Modal>
    </div>
  );
}
