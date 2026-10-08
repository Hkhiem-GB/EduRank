"use client";

import React, { useState, useMemo } from "react";
import { useApp } from "@/lib/AppContext";
import { PageHeader } from "@/components/layout/PageHeader";
import { Icons } from "@/components/ui/Icons";
import { Badge, ScoreBadge, RankBadge } from "@/components/ui/Badge";

export default function StudentProfilePage() {
  const {
    students,
    classes,
    studentRankings,
    classRankings,
    studentRecords,
    criteria,
    teachers,
  } = useApp();

  const [activeTab, setActiveTab] = useState<"class" | "personal">("class");

  // Current student is sample HS001 (Nguyễn Văn An - 6A1)
  const currentStudent = students.find((s) => s.studentCode === "HS001") || students[0];
  const myClass = currentStudent ? classes.find((c) => String(c._id) === String(currentStudent.classId)) : classes[0];
  const myTeacher = myClass
    ? teachers.find((t) => {
        const teacherIdStr = String(t._id);
        const clsHomeroomIdStr =
          typeof myClass.homeroomTeacherId === "object" && myClass.homeroomTeacherId !== null
            ? String((myClass.homeroomTeacherId as any)._id)
            : myClass.homeroomTeacherId
            ? String(myClass.homeroomTeacherId)
            : "";
        const tAssignedIdStr =
          typeof t.assignedClassId === "object" && t.assignedClassId !== null
            ? String((t.assignedClassId as any)._id)
            : t.assignedClassId
            ? String(t.assignedClassId)
            : "";
        return (
          (clsHomeroomIdStr && clsHomeroomIdStr === teacherIdStr) ||
          (tAssignedIdStr && tAssignedIdStr === String(myClass._id))
        );
      })
    : undefined;
  const classRank = myClass ? classRankings.find((r) => r.classId === myClass._id) : undefined;

  // Student's records
  const myRecords = useMemo(() => {
    return studentRecords
      .filter((r) => r.studentId === currentStudent?._id)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [studentRecords, currentStudent]);

  const studentRankInfo = studentRankings.find((r) => r.studentId === currentStudent?._id);
  const myScore = studentRankInfo?.score || 100;

  // Classmates in the same class
  const classmates = useMemo(() => {
    return myClass ? students.filter((s) => s.classId === myClass._id) : [];
  }, [students, myClass]);

  if (!myClass) {
    return (
      <div className="py-12 text-center text-slate-500">
        <p className="text-sm">Đang tải thông tin lớp học...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        greeting="Tập thể & Cá nhân học tập"
        title={`Danh Sách Lớp ${myClass.className} — THCS Na Sầm`}
        description={`Sĩ số ${classmates.length} bạn học · GVCN: ${myTeacher ? myTeacher.fullName : "Đang cập nhật"} · Niên khóa 2026–2027`}
        badge={
          <span className="text-xs font-bold text-blue-700 bg-blue-50 border border-blue-200 px-3 py-1 rounded-full">
            Lớp {myClass.className} · Hạng #{classRank?.rank || 4} toàn trường
          </span>
        }
      />

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
        <button
          onClick={() => setActiveTab("class")}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
            activeTab === "class"
              ? "bg-blue-600 text-white shadow-sm shadow-blue-500/20"
              : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
          }`}
        >
          <Icons.Users className="w-4 h-4" />
          <span>Danh sách lớp ({myClass.className})</span>
        </button>

        <button
          onClick={() => setActiveTab("personal")}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
            activeTab === "personal"
              ? "bg-blue-600 text-white shadow-sm shadow-blue-500/20"
              : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
          }`}
        >
          <Icons.UserCheck className="w-4 h-4" />
          <span>Hồ sơ rèn luyện của tôi</span>
        </button>
      </div>

      {/* Tab 1: Personal Overview */}
      {activeTab === "personal" && (
        <div className="space-y-6">
          {/* Student Profile Card & Score Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {/* Left info card */}
            <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-2xs">
              <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
                <div className="w-12 h-12 rounded-xl bg-blue-600 text-white font-extrabold text-lg flex items-center justify-center">
                  {currentStudent.fullName.split(" ").slice(-1)[0][0]}
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-slate-900">{currentStudent.fullName}</h3>
                  <p className="text-xs text-slate-400 font-mono">{currentStudent.studentCode}</p>
                </div>
              </div>

              <div className="space-y-2.5 pt-4 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Lớp học:</span>
                  <strong className="text-blue-700 font-bold">Lớp {myClass.className}</strong>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Khối:</span>
                  <span className="text-slate-700 font-medium">Khối {myClass.grade}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Ngày sinh:</span>
                  <span className="text-slate-700 font-medium">
                    {new Date(currentStudent.dateOfBirth).toLocaleDateString("vi-VN")}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Giới tính:</span>
                  <span className="text-slate-700 font-medium">
                    {currentStudent.gender === "MALE" ? "Nam" : "Nữ"}
                  </span>
                </div>
                <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                  <span className="text-slate-500">Trạng thái:</span>
                  <Badge variant="success" size="sm">Đang học</Badge>
                </div>
              </div>
            </div>

            {/* Middle score card */}
            <div className="bg-gradient-to-br from-blue-700 via-blue-600 to-sky-600 rounded-2xl p-6 text-white shadow-md flex flex-col justify-between relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-bl-full pointer-events-none" />
              <div>
                <span className="text-xs font-bold text-blue-100 uppercase tracking-wider">
                  Điểm Thi Đua Tuần
                </span>
                <div className="text-4xl font-black mt-2">{myScore}</div>
                <p className="text-xs text-blue-100 mt-1">
                  Điểm xuất phát: 100 điểm · Tuần 5
                </p>
              </div>

              <div className="mt-6 pt-4 border-t border-white/20 flex items-center justify-between text-xs">
                <span>Cộng tuần: <strong>+{studentRankInfo?.positivePoints || 0}</strong></span>
                <span>Trừ tuần: <strong>-{studentRankInfo?.negativePoints || 0}</strong></span>
              </div>
            </div>

            {/* Right recommendation card */}
            <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-2xs flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Icons.TrendingUp className="w-5 h-5 text-emerald-600" />
                  <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Đánh giá rèn luyện
                  </span>
                </div>
                <h4 className="text-sm font-bold text-slate-800">Ý thức học tập tốt</h4>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                  Tích cực chuẩn bị bài và tham gia giờ học tốt. Cần chú ý nề nếp trang phục và khăn quàng để đạt danh hiệu Xuất sắc tuần tới.
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

          {/* Student Records History */}
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs overflow-hidden">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Icons.History className="w-5 h-5 text-blue-600" />
                <h3 className="font-bold text-slate-800 text-sm">Lịch Sử Ghi Nhận Thi Đua Cá Nhân</h3>
              </div>
              <span className="text-xs text-slate-500">
                Tổng cộng: <strong>{myRecords.length}</strong> lần ghi nhận
              </span>
            </div>

            <div className="divide-y divide-slate-100">
              {myRecords.length === 0 ? (
                <div className="p-8 text-center text-slate-400 text-sm">
                  Chưa có lượt ghi nhận thi đua nào cho học sinh này trong tuần.
                </div>
              ) : (
                myRecords.map((r) => {
                  const crit = criteria.find((c) => c._id === r.criteriaId);
                  const isCancelled = r.status === "CANCELLED";

                  return (
                    <div
                      key={r._id}
                      className={`p-4 flex items-start justify-between gap-3 ${
                        isCancelled ? "opacity-50 line-through bg-slate-50/50" : ""
                      }`}
                    >
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
                            <span className="font-bold text-slate-800 text-sm">
                              {crit?.name || "Tiêu chí thi đua"}
                            </span>
                            <span className="text-xs text-slate-400 font-normal">
                              ({crit?.category || "Chung"})
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
                            {isCancelled && <span className="text-rose-600 font-bold ml-1">(Đã hủy)</span>}
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
        </div>
      )}

      {/* Tab 2: My Class (Read-only) */}
      {activeTab === "class" && (
        <div className="space-y-6">
          {/* Class summary */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4">
            <div className="bg-white rounded-xl sm:rounded-2xl border border-slate-200/80 p-3.5 sm:p-4 shadow-2xs">
              <span className="text-[11px] sm:text-xs font-semibold text-slate-500">Tập thể lớp</span>
              <div className="text-xl sm:text-2xl font-black text-slate-800 mt-1">Lớp {myClass.className}</div>
              <span className="text-[10px] sm:text-[11px] text-slate-400 mt-0.5 block">Khối {myClass.grade}</span>
            </div>
            <div className="bg-white rounded-xl sm:rounded-2xl border border-slate-200/80 p-3.5 sm:p-4 shadow-2xs">
              <span className="text-[11px] sm:text-xs font-semibold text-slate-500">Sĩ số lớp</span>
              <div className="text-xl sm:text-2xl font-black text-slate-800 mt-1">{classmates.length} HS</div>
              <span className="text-[10px] sm:text-[11px] text-slate-400 mt-0.5 block">100% học sinh chính thức</span>
            </div>
            <div className="bg-white rounded-xl sm:rounded-2xl border border-slate-200/80 p-3.5 sm:p-4 shadow-2xs">
              <span className="text-[11px] sm:text-xs font-semibold text-slate-500">Giáo viên chủ nhiệm</span>
              <div className="text-xs sm:text-sm font-bold text-slate-800 mt-1 truncate">
                {myTeacher ? myTeacher.fullName : "Chưa phân công"}
              </div>
              <span className="text-[10px] sm:text-[11px] text-slate-400 mt-0.5 block">{myTeacher?.department || "Tổ Bộ môn"}</span>
            </div>
            <div className="bg-white rounded-xl sm:rounded-2xl border border-slate-200/80 p-3.5 sm:p-4 shadow-2xs">
              <span className="text-[11px] sm:text-xs font-semibold text-slate-500">Xếp hạng lớp</span>
              <div className="text-xl sm:text-2xl font-black text-blue-700 mt-1">
                #{classRank?.rank || 4} ({classRank?.score || 150}đ)
              </div>
              <span className="text-[10px] sm:text-[11px] text-slate-400 mt-0.5 block">14 lớp toàn trường</span>
            </div>
          </div>

          {/* Classmates Table (Read-only) */}
          <div className="bg-white rounded-xl sm:rounded-2xl border border-slate-200/80 shadow-2xs overflow-hidden">
            <div className="p-3 sm:p-4 border-b border-slate-100 flex items-center justify-between">
              <h3 className="font-bold text-slate-800 text-xs sm:text-sm">
                Danh Sách Thành Viên Lớp {myClass.className} (Chế độ xem)
              </h3>
              <span className="text-xs text-slate-400 hidden sm:inline">Chỉ đọc · {classmates.length} bạn học</span>
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
                    <th className="py-2 sm:py-3 px-1.5 sm:px-3 md:px-4 text-center">Điểm rèn luyện</th>
                    <th className="py-2 sm:py-3 px-2 sm:px-3 md:px-4 text-center hidden sm:table-cell">Trạng thái</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {classmates.map((st, idx) => {
                    const stRanking = studentRankings.find((r) => r.studentId === st._id);
                    const isSelf = st._id === currentStudent._id;

                    return (
                      <tr
                        key={st._id}
                        className={`transition-colors ${
                          isSelf ? "bg-blue-50/60 font-semibold" : "hover:bg-slate-50/80"
                        }`}
                      >
                        <td className="py-1.5 sm:py-2.5 px-1.5 sm:px-3 md:px-4 text-center text-[11px] sm:text-xs text-slate-400 font-medium">
                          {idx + 1}
                        </td>
                        <td className="py-1.5 sm:py-2.5 px-2 sm:px-3 md:px-4 font-mono text-xs font-semibold text-slate-600 hidden sm:table-cell">
                          {st.studentCode}
                        </td>
                        <td className="py-1.5 sm:py-2.5 px-2 sm:px-3 md:px-4">
                          <span className={isSelf ? "text-blue-700 font-bold" : "text-slate-800 font-medium"}>
                            {st.fullName} {isSelf && "★ (Bạn)"}
                          </span>
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
                        <td className="py-1.5 sm:py-2.5 px-1.5 sm:px-3 md:px-4 text-center">
                          <span className="font-extrabold text-blue-700 text-xs sm:text-sm md:text-base">
                            {stRanking?.score || 100}
                          </span>
                        </td>
                        <td className="py-1.5 sm:py-2.5 px-2 sm:px-3 md:px-4 text-center hidden sm:table-cell">
                          <Badge variant="success" size="sm">Đang học</Badge>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
