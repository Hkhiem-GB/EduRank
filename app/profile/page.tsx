"use client";

import React, { useState, useMemo, useEffect } from "react";
import { useApp } from "@/lib/AppContext";
import { uploadAvatarApi, changePasswordApi } from "@/lib/api";
import { PageHeader } from "@/components/layout/PageHeader";
import { Icons } from "@/components/ui/Icons";
import { Badge, ScoreBadge, RankBadge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";

export default function ProfilePage() {
  const {
    currentUser,
    activeRole,
    teachers,
    students,
    classes,
    studentRankings,
    setCurrentUser,
    classRankings,
    studentRecords,
    classRecords,
    criteria,
    showToast,
  } = useApp();

  // Avatar state - synced with currentUser
  const [avatarUrl, setAvatarUrl] = useState<string | null>(currentUser?.avatarUrl || null);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);

  useEffect(() => {
    if (currentUser?.avatarUrl) {
      setAvatarUrl(currentUser.avatarUrl);
    }
  }, [currentUser?.avatarUrl]);

  // Change Password Modal state
  const [isChangePasswordOpen, setIsChangePasswordOpen] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrentPw, setShowCurrentPw] = useState(false);
  const [showNewPw, setShowNewPw] = useState(false);
  const [showConfirmPw, setShowConfirmPw] = useState(false);
  const [passwordErrors, setPasswordErrors] = useState<{
    current?: string;
    new?: string;
    confirm?: string;
  }>({});
  const [isSubmittingPassword, setIsSubmittingPassword] = useState(false);

  // Lookup teacher/student details for richer profile data
  const teacherDetails = useMemo(() => {
    return teachers.find((t) => t.teacherCode === currentUser.accountCode);
  }, [teachers, currentUser.accountCode]);

  const studentDetails = useMemo(() => {
    return students.find((s) => s.studentCode === currentUser.accountCode);
  }, [students, currentUser.accountCode]);

  // Derived profile fields with graceful fallbacks
  const phone = teacherDetails?.phone || "0912 345 678";
  const email =
    teacherDetails?.email ||
    (activeRole === "STUDENT"
      ? "an.nguyen@hocsinh.thcsnasam.edu.vn"
      : `${currentUser.accountCode.toLowerCase()}@thcsnasam.edu.vn`);

  const dateOfBirth = useMemo(() => {
    if (studentDetails?.dateOfBirth) {
      const d = new Date(studentDetails.dateOfBirth);
      return !isNaN(d.getTime()) ? d.toLocaleDateString("vi-VN") : "15/05/2012";
    }
    if (teacherDetails?.dateOfBirth) {
      const d = new Date(teacherDetails.dateOfBirth);
      return !isNaN(d.getTime()) ? d.toLocaleDateString("vi-VN") : "12/08/1986";
    }
    return activeRole === "STUDENT" ? "15/05/2012" : "15/08/1985";
  }, [studentDetails, teacherDetails, activeRole]);

  // Tên lớp hiển thị (cho ô Lớp)
  const classNameDisplay = useMemo(() => {
    if (activeRole === "STUDENT") {
      const cls = classes.find((c) => c._id === studentDetails?.classId) || classes[0];
      return cls ? `Lớp ${cls.className}` : "Lớp 6A1";
    }
    if (activeRole === "TEACHER") {
      return teacherDetails?.assignedClassName
        ? `Lớp ${teacherDetails.assignedClassName}`
        : "Chưa phân công chủ nhiệm";
    }
    return "Toàn trường (14 lớp)";
  }, [activeRole, studentDetails, teacherDetails, classes]);

  // Tổ / Đơn vị công tác (cho ô Tổ)
  const departmentDisplay = useMemo(() => {
    if (activeRole === "STUDENT") {
      return "Tổ 1";
    }
    if (activeRole === "TEACHER") {
      return teacherDetails?.department || "Tổ bộ môn";
    }
    return teacherDetails?.department || "Ban Giám Hiệu";
  }, [activeRole, teacherDetails]);

  // Competition score calculation
  const scoreStats = useMemo(() => {
    if (activeRole === "STUDENT" && studentDetails) {
      const records = studentRecords.filter((r) => r.studentId === studentDetails._id);
      let plus = 0;
      let minus = 0;
      records.forEach((r) => {
        if (r.points > 0) plus += r.points;
        if (r.points < 0) minus += Math.abs(r.points);
      });
      const rankInfo = studentRankings.find((r) => r.studentId === studentDetails._id);
      const totalScore = rankInfo?.score ?? (100 + plus - minus);
      return {
        hasScore: true,
        currentScore: totalScore,
        plusPoints: plus,
        minusPoints: minus,
        rank: rankInfo?.rank ?? 0,
        rankContext: "Toàn trường",
        recentRecords: records.slice(0, 5),
      };
    }

    if (activeRole === "TEACHER" && (teacherDetails?.assignedClassId || teacherDetails?._id)) {
      const teacherClass = classes.find((c) => {
        const cHomeroomIdStr =
          typeof c.homeroomTeacherId === "object" && c.homeroomTeacherId !== null
            ? String((c.homeroomTeacherId as any)._id)
            : c.homeroomTeacherId
            ? String(c.homeroomTeacherId)
            : "";
        const tClassId =
          typeof teacherDetails?.assignedClassId === "object" && teacherDetails?.assignedClassId !== null
            ? String((teacherDetails.assignedClassId as any)._id)
            : teacherDetails?.assignedClassId
            ? String(teacherDetails.assignedClassId)
            : "";
        return (
          (tClassId && String(c._id) === tClassId) ||
          (cHomeroomIdStr && cHomeroomIdStr === String(teacherDetails?._id))
        );
      });

      const clsId = teacherClass ? String(teacherClass._id) : (teacherDetails?.assignedClassId ? String(teacherDetails.assignedClassId) : "");
      if (clsId) {
        const records = classRecords.filter((r) => String(r.classId) === clsId);
        let plus = 0;
        let minus = 0;
        records.forEach((r) => {
          if (r.points > 0) plus += r.points;
          if (r.points < 0) minus += Math.abs(r.points);
        });
        const rankInfo = classRankings.find((r) => String(r.classId) === clsId);
        const displayClassName = teacherClass?.className || teacherDetails?.assignedClassName || "";
        return {
          hasScore: true,
          currentScore: rankInfo?.score ?? (100 + plus - minus),
          plusPoints: plus,
          minusPoints: minus,
          rank: rankInfo?.rank ?? 0,
          rankContext: displayClassName ? `Lớp ${displayClassName.replace(/^Lớp\s+/i, "")}` : "Lớp chủ nhiệm",
          recentRecords: records.slice(0, 5),
        };
      }
    }

    // Default system overview score metrics for Admin
    return {
      hasScore: false,
      currentScore: 100,
      plusPoints: 0,
      minusPoints: 0,
      rank: 1,
      rankContext: "Hệ thống",
      recentRecords: [],
    };
  }, [
    activeRole,
    studentDetails,
    teacherDetails,
    studentRecords,
    classRecords,
    studentRankings,
    classRankings,
  ]);

  // User creation year & 4-year cohort calculation (1 khóa = 4 năm tự động tính từ năm tạo tài khoản)
  const cohort = useMemo(() => {
    const rawDate =
      studentDetails?.createdAt ||
      teacherDetails?.createdAt;
    let startYear = 2024;
    if (rawDate) {
      const parsedYear = new Date(rawDate).getFullYear();
      if (!isNaN(parsedYear)) startYear = parsedYear;
    }
    return `${startYear}–${startYear + 4}`;
  }, [studentDetails, teacherDetails]);

  // Lịch sử ghi nhận cộng / trừ điểm thi đua gần đây
  const pointHistory = useMemo(() => {
    if (activeRole === "STUDENT" && studentDetails) {
      return studentRecords
        .filter((r) => r.studentId === studentDetails._id && r.status === "ACTIVE")
        .map((r) => {
          const crit = criteria.find((c) => c._id === r.criteriaId);
          return {
            id: r._id,
            title: crit?.name || r.note || "Ghi nhận thi đua",
            category: crit?.category || "Rèn luyện cá nhân",
            points: r.points,
            date: new Date(r.createdAt).toLocaleDateString("vi-VN"),
            note: r.note,
            recorder: r.createdBy,
          };
        });
    }

    if (activeRole === "TEACHER" && (teacherDetails?.assignedClassId || teacherDetails?._id)) {
      const teacherClass = classes.find((c) => {
        const cHomeroomIdStr =
          typeof c.homeroomTeacherId === "object" && c.homeroomTeacherId !== null
            ? String((c.homeroomTeacherId as any)._id)
            : c.homeroomTeacherId
            ? String(c.homeroomTeacherId)
            : "";
        const tClassId =
          typeof teacherDetails?.assignedClassId === "object" && teacherDetails?.assignedClassId !== null
            ? String((teacherDetails.assignedClassId as any)._id)
            : teacherDetails?.assignedClassId
            ? String(teacherDetails.assignedClassId)
            : "";
        return (
          (tClassId && String(c._id) === tClassId) ||
          (cHomeroomIdStr && cHomeroomIdStr === String(teacherDetails?._id))
        );
      });

      const clsId = teacherClass ? String(teacherClass._id) : (teacherDetails?.assignedClassId ? String(teacherDetails.assignedClassId) : "");
      const displayClassName = teacherClass?.className || teacherDetails?.assignedClassName || "9A1";

      if (clsId) {
        const clsRecs = classRecords
          .filter((r) => String(r.classId) === clsId && r.status === "ACTIVE")
          .map((r) => {
            const crit = criteria.find((c) => c._id === r.criteriaId);
            return {
              id: r._id,
              title: crit?.name || r.note || "Thi đua tập thể",
              category: `Lớp ${displayClassName.replace(/^Lớp\s+/i, "")}`,
              points: r.points,
              date: new Date(r.createdAt).toLocaleDateString("vi-VN"),
              note: r.note,
              recorder: r.createdBy,
            };
          });

        const stRecs = studentRecords
          .filter((r) => String(r.classId) === clsId && r.status === "ACTIVE")
          .slice(0, 5)
          .map((r) => {
            const crit = criteria.find((c) => c._id === r.criteriaId);
            const st = students.find((s) => s._id === r.studentId);
            return {
              id: r._id,
              title: crit?.name || r.note || "Kỷ luật học sinh",
              category: st ? `${st.fullName}` : "Học sinh lớp",
              points: r.points,
              date: new Date(r.createdAt).toLocaleDateString("vi-VN"),
              note: r.note,
              recorder: r.createdBy,
            };
          });

        return [...clsRecs, ...stRecs];
      }
    }

    // Admin & Super Admin: danh sách ghi nhận thi đua gần đây toàn trường
    return studentRecords
      .filter((r) => r.status === "ACTIVE")
      .slice(0, 8)
      .map((r) => {
        const crit = criteria.find((c) => c._id === r.criteriaId);
        const st = students.find((s) => s._id === r.studentId);
        return {
          id: r._id,
          title: crit?.name || "Tiêu chí thi đua",
          category: st ? `${st.fullName} (${st.studentCode})` : "Học sinh",
          points: r.points,
          date: new Date(r.createdAt).toLocaleDateString("vi-VN"),
          note: r.note,
          recorder: r.createdBy,
        };
      });
  }, [
    activeRole,
    studentDetails,
    teacherDetails,
    studentRecords,
    classRecords,
    students,
  ]);

  // Handle Avatar Change with real ImgBB upload
  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setIsUploadingAvatar(true);
      try {
        const res = await uploadAvatarApi(file);
        if (res.success && res.avatarUrl) {
          setAvatarUrl(res.avatarUrl);
          setCurrentUser((prev) => ({ ...prev, avatarUrl: res.avatarUrl }));
          showToast("Cập nhật ảnh đại diện lên ImgBB thành công!", "success");
        } else {
          showToast(res.message || "Tải lên ảnh thất bại.", "error");
        }
      } catch (err: any) {
        showToast(err.message || "Lỗi khi tải ảnh lên ImgBB.", "error");
      } finally {
        setIsUploadingAvatar(false);
        // Reset file input value so user can re-upload same file if desired
        e.target.value = "";
      }
    }
  };

  // Handle Change Password Form with real API
  const handleChangePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errors: { current?: string; new?: string; confirm?: string } = {};

    if (!currentPassword.trim()) {
      errors.current = "Vui lòng nhập mật khẩu hiện tại.";
    }
    if (!newPassword.trim()) {
      errors.new = "Vui lòng nhập mật khẩu mới.";
    } else if (newPassword.length < 6) {
      errors.new = "Mật khẩu mới phải có ít nhất 6 ký tự.";
    }
    if (!confirmPassword.trim()) {
      errors.confirm = "Vui lòng xác nhận mật khẩu mới.";
    } else if (newPassword !== confirmPassword) {
      errors.confirm = "Mật khẩu xác nhận không khớp.";
    }

    if (Object.keys(errors).length > 0) {
      setPasswordErrors(errors);
      return;
    }

    setPasswordErrors({});
    setIsSubmittingPassword(true);

    try {
      const res = await changePasswordApi({
        oldPassword: currentPassword,
        newPassword: newPassword,
      });

      if (res.success) {
        setIsChangePasswordOpen(false);
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
        showToast(res.message || "Đổi mật khẩu thành công!", "success");
      } else {
        showToast(res.message || "Đổi mật khẩu thất bại.", "error");
      }
    } catch (err: any) {
      showToast(err.message || "Lỗi khi đổi mật khẩu.", "error");
    } finally {
      setIsSubmittingPassword(false);
    }
  };

  const getRoleBadge = (role: string) => {
    switch (role) {
      case "SUPER_ADMIN":
        return (
          <span
            key={role}
            className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg text-xs font-bold bg-purple-50 text-purple-700 border border-purple-200/80 shadow-2xs"
          >
            <Icons.ShieldCheck className="w-3.5 h-3.5 text-purple-600 shrink-0" />
            <span>Super Admin</span>
          </span>
        );
      case "ADMIN":
        return (
          <span
            key={role}
            className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200/80 shadow-2xs"
          >
            <Icons.Award className="w-3.5 h-3.5 text-blue-600 shrink-0" />
            <span>Admin Ban Thi Đua</span>
          </span>
        );
      case "TEACHER":
        return (
          <span
            key={role}
            className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200/80 shadow-2xs"
          >
            <Icons.BookOpen className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            <span>Giáo Viên</span>
          </span>
        );
      case "STUDENT":
        return (
          <span
            key={role}
            className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg text-xs font-bold bg-amber-50 text-amber-800 border border-amber-200/80 shadow-2xs"
          >
            <Icons.User className="w-3.5 h-3.5 text-amber-600 shrink-0" />
            <span>Học Sinh</span>
          </span>
        );
      default:
        return (
          <span
            key={role}
            className="inline-flex items-center px-2 py-0.5 rounded-lg text-xs font-bold bg-slate-100 text-slate-700"
          >
            {role}
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* 1. Page Header */}
      <PageHeader
        greeting="Tài khoản cá nhân"
        title="Hồ sơ cá nhân"
        description="Quản lý thông tin cá nhân, hồ sơ rèn luyện và bảo mật tài khoản người dùng"
      />

      {/* 2. Main Profile Hero Banner & Info Card */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs overflow-hidden">
        {/* Decorative Top Accent Gradient */}
        <div className="h-28 sm:h-32 bg-gradient-to-r from-blue-700 via-blue-600 to-sky-500 relative">
          <div className="absolute inset-0 opacity-15 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:16px_16px]" />
        </div>

        {/* Profile Card Body */}
        <div className="px-4 sm:px-6 pb-6 pt-0 relative">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 -mt-14 sm:-mt-16 mb-5">
            {/* Avatar with Camera upload button */}
            <div className="relative inline-block shrink-0">
              <div className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-2xl bg-gradient-to-tr from-blue-700 to-blue-500 text-white font-black text-3xl sm:text-4xl flex items-center justify-center border-4 border-white shadow-md overflow-hidden">
                {avatarUrl ? (
                  <img
                    src={avatarUrl}
                    alt={currentUser.fullName}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span>{currentUser.fullName.split(" ").slice(-1)[0][0]}</span>
                )}

                {/* Uploading loading overlay */}
                {isUploadingAvatar && (
                  <div className="absolute inset-0 bg-black/60 backdrop-blur-xs flex flex-col items-center justify-center gap-1 text-white text-xs z-10">
                    <Icons.RefreshCw className="w-6 h-6 animate-spin text-white" />
                    <span className="text-[10px] font-semibold">Đang tải...</span>
                  </div>
                )}
              </div>

              {/* Upload trigger overlay */}
              <label
                htmlFor="avatar-upload"
                className={`absolute bottom-1 right-1 p-2 rounded-xl bg-blue-600 text-white hover:bg-blue-700 cursor-pointer shadow-sm hover:scale-105 active:scale-95 transition-all ${
                  isUploadingAvatar ? "opacity-50 pointer-events-none" : ""
                }`}
                title="Đổi ảnh đại diện (ImgBB)"
              >
                <Icons.Sparkles className="w-4 h-4" />
                <input
                  id="avatar-upload"
                  type="file"
                  accept="image/*"
                  disabled={isUploadingAvatar}
                  onChange={handleAvatarChange}
                  className="sr-only"
                />
              </label>
            </div>

            {/* Quick Actions on Desktop */}
            <div className="flex items-center gap-2.5 flex-wrap">
              <label
                htmlFor="avatar-upload-btn"
                className={`inline-flex items-center gap-2 px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-bold transition-colors cursor-pointer shadow-2xs ${
                  isUploadingAvatar ? "opacity-50 pointer-events-none" : ""
                }`}
              >
                {isUploadingAvatar ? (
                  <Icons.RefreshCw className="w-3.5 h-3.5 animate-spin text-blue-600" />
                ) : (
                  <Icons.Edit className="w-3.5 h-3.5 text-slate-500" />
                )}
                <span>{isUploadingAvatar ? "Đang lưu lên ImgBB..." : "Đổi ảnh đại diện"}</span>
                <input
                  id="avatar-upload-btn"
                  type="file"
                  accept="image/*"
                  disabled={isUploadingAvatar}
                  onChange={handleAvatarChange}
                  className="sr-only"
                />
              </label>

              <Button
                variant="primary"
                size="md"
                onClick={() => setIsChangePasswordOpen(true)}
                icon={<Icons.Lock className="w-4 h-4" />}
                className="cursor-pointer"
              >
                Đổi mật khẩu
              </Button>
            </div>
          </div>

          {/* User Name & Info Grid */}
          <div className="space-y-3">
            <div>
              <div className="flex items-center gap-2.5 flex-wrap">
                <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                  {currentUser.fullName}
                </h2>
                <span className="text-xs font-mono font-semibold px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 border border-slate-200">
                  Mã: {currentUser.accountCode}
                </span>
                <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  Đang hoạt động
                </span>
              </div>
            </div>

            {/* Khung thông tin cá nhân theo đúng thứ tự yêu cầu:
                1. Chức vụ/vai trò
                2. Lớp
                3. Tổ
                4. Ngày sinh
                5. Số điện thoại
                6. Email
                7. Niên khóa (chỉ hiển thị với vai trò học sinh)
                Laptop: hiển thị 3 nội dung / hàng. Mobile: hiển thị 1 nội dung / hàng. */}
            <div className="pt-3 mt-3 border-t border-slate-100 grid grid-cols-1 md:grid-cols-3 gap-2.5 sm:gap-3.5 text-xs">
              {/* 1. Chức vụ / vai trò */}
              <div className="flex items-center gap-2.5 p-2.5 rounded-xl bg-slate-50/80 border border-slate-200/60 min-w-0">
                <div className="p-1.5 rounded-lg bg-blue-50 text-blue-600 shrink-0">
                  <Icons.ShieldCheck className="w-4 h-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <span className="text-[11px] text-slate-400 block font-medium">Chức vụ / vai trò</span>
                  <div className="flex items-center gap-1.5 flex-wrap mt-0.5">
                    {currentUser.roles.map((r) => getRoleBadge(r))}
                  </div>
                </div>
              </div>

              {/* 2. Lớp */}
              <div className="flex items-center gap-2.5 p-2.5 rounded-xl bg-slate-50/80 border border-slate-200/60 min-w-0">
                <div className="p-1.5 rounded-lg bg-blue-50 text-blue-600 shrink-0">
                  <Icons.School className="w-4 h-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <span className="text-[11px] text-slate-400 block font-medium">Lớp</span>
                  <span className="font-bold text-slate-800 text-xs sm:text-sm truncate block" title={classNameDisplay}>
                    {classNameDisplay}
                  </span>
                </div>
              </div>

              {/* 3. Tổ */}
              <div className="flex items-center gap-2.5 p-2.5 rounded-xl bg-slate-50/80 border border-slate-200/60 min-w-0">
                <div className="p-1.5 rounded-lg bg-blue-50 text-blue-600 shrink-0">
                  <Icons.Users className="w-4 h-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <span className="text-[11px] text-slate-400 block font-medium">Tổ</span>
                  <span className="font-bold text-slate-800 text-xs sm:text-sm truncate block" title={departmentDisplay}>
                    {departmentDisplay}
                  </span>
                </div>
              </div>

              {/* 4. Ngày sinh */}
              <div className="flex items-center gap-2.5 p-2.5 rounded-xl bg-slate-50/80 border border-slate-200/60 min-w-0">
                <div className="p-1.5 rounded-lg bg-blue-50 text-blue-600 shrink-0">
                  <Icons.Calendar className="w-4 h-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <span className="text-[11px] text-slate-400 block font-medium">Ngày sinh</span>
                  <span className="font-bold text-slate-800 text-xs sm:text-sm block">
                    {dateOfBirth}
                  </span>
                </div>
              </div>

              {/* 5. Số điện thoại */}
              <div className="flex items-center gap-2.5 p-2.5 rounded-xl bg-slate-50/80 border border-slate-200/60 min-w-0">
                <div className="p-1.5 rounded-lg bg-blue-50 text-blue-600 shrink-0">
                  <Icons.Phone className="w-4 h-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <span className="text-[11px] text-slate-400 block font-medium">Số điện thoại</span>
                  <span className="font-bold text-slate-800 text-xs sm:text-sm block">
                    {phone}
                  </span>
                </div>
              </div>

              {/* 6. Email */}
              <div className="flex items-center gap-2.5 p-2.5 rounded-xl bg-slate-50/80 border border-slate-200/60 min-w-0">
                <div className="p-1.5 rounded-lg bg-blue-50 text-blue-600 shrink-0">
                  <Icons.Mail className="w-4 h-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <span className="text-[11px] text-slate-400 block font-medium">Email</span>
                  <span className="font-bold text-slate-800 text-xs sm:text-sm truncate block" title={email}>
                    {email}
                  </span>
                </div>
              </div>

              {/* 7. Niên khóa (chỉ hiển thị với vai trò học sinh) */}
              {activeRole === "STUDENT" && (
                <div className="flex items-center gap-2.5 p-2.5 rounded-xl bg-slate-50/80 border border-slate-200/60 min-w-0">
                  <div className="p-1.5 rounded-lg bg-blue-50 text-blue-600 shrink-0">
                    <Icons.GraduationCap className="w-4 h-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <span className="text-[11px] text-slate-400 block font-medium">Niên khóa</span>
                    <span className="font-bold text-slate-800 text-xs sm:text-sm truncate block">
                      Khóa {cohort}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 3. Detailed Information Cards Grid: Giữ lại card Điểm Thi Đua & card Lịch Sử Cộng/Trừ Điểm */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Card 1: Điểm thi đua & Rèn luyện (Giữ lại card ở giữa cũ) */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-2xs space-y-4">
          <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100">
            <div className="p-2 rounded-xl bg-amber-50 text-amber-600">
              <Icons.Trophy className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-800">Điểm Thi Đua & Xếp Hạng</h3>
              <p className="text-[11px] text-slate-400">Kết quả rèn luyện học kỳ hiện tại</p>
            </div>
          </div>

          {scoreStats.hasScore ? (
            <div className="space-y-3.5">
              {/* Highlight Score & Rank */}
              <div className="p-3.5 bg-gradient-to-br from-blue-50 to-indigo-50/60 rounded-xl border border-blue-100 flex items-center justify-between">
                <div>
                  <span className="text-[11px] font-bold text-blue-700 block uppercase tracking-wide">
                    Điểm thi đua hiện tại
                  </span>
                  <div className="text-2xl font-black text-blue-900 mt-0.5">
                    {scoreStats.currentScore} <span className="text-xs font-bold text-blue-700">điểm</span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-[10px] font-medium text-slate-500 block mb-1">
                    {scoreStats.rankContext}
                  </span>
                  <RankBadge rank={scoreStats.rank} />
                </div>
              </div>

              {/* Điểm cộng và Điểm trừ */}
              <div className="grid grid-cols-2 gap-2.5 pt-1">
                <div className="p-3 bg-emerald-50/70 border border-emerald-200/70 rounded-xl">
                  <div className="flex items-center gap-1.5 text-emerald-800 text-xs font-bold mb-1">
                    <Icons.TrendingUp className="w-4 h-4 text-emerald-600" />
                    <span>Điểm cộng (+)</span>
                  </div>
                  <div className="text-lg font-black text-emerald-700">
                    +{scoreStats.plusPoints} <span className="text-xs font-bold">điểm</span>
                  </div>
                  <span className="text-[10px] text-emerald-600">Thành tích & Khen thưởng</span>
                </div>

                <div className="p-3 bg-rose-50/70 border border-rose-200/70 rounded-xl">
                  <div className="flex items-center gap-1.5 text-rose-800 text-xs font-bold mb-1">
                    <Icons.TrendingDown className="w-4 h-4 text-rose-600" />
                    <span>Điểm trừ (-)</span>
                  </div>
                  <div className="text-lg font-black text-rose-700">
                    -{scoreStats.minusPoints} <span className="text-xs font-bold">điểm</span>
                  </div>
                  <span className="text-[10px] text-rose-600">Nhắc nhở & Vi phạm</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-4 bg-slate-50 rounded-xl text-center space-y-2">
              <Icons.ShieldCheck className="w-8 h-8 text-blue-600 mx-auto" />
              <p className="text-xs font-bold text-slate-800">Tài khoản Quản Trị Hệ Thống</p>
              <p className="text-[11px] text-slate-500">
                Toàn quyền giám sát điểm thi đua của 14 lớp và 496 học sinh THCS Na Sầm.
              </p>
            </div>
          )}
        </div>

        {/* Card 2: Lịch sử cộng trừ điểm (Thay cho card bên phải cũ) */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-2xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-blue-50 text-blue-600">
                <Icons.History className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-800">Lịch Sử Ghi Nhận Điểm</h3>
                <p className="text-[11px] text-slate-400">Nhật ký cộng / trừ điểm rèn luyện & thi đua</p>
              </div>
            </div>
            <span className="text-xs font-semibold text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-200/60">
              {pointHistory.length} lượt
            </span>
          </div>

          {pointHistory.length === 0 ? (
            <div className="p-8 text-center text-slate-400 text-xs">
              <Icons.History className="w-8 h-8 text-slate-300 mx-auto mb-2" />
              Chưa có lượt ghi nhận điểm thi đua nào gần đây.
            </div>
          ) : (
            <div className="space-y-2.5 max-h-[340px] overflow-y-auto pr-1">
              {pointHistory.map((item) => (
                <div
                  key={item.id}
                  className="p-3 rounded-xl bg-slate-50/80 hover:bg-slate-100/60 border border-slate-100 flex items-center justify-between gap-3 transition-colors"
                >
                  <div className="flex items-start gap-2.5 min-w-0">
                    <div
                      className={`p-1.5 rounded-lg shrink-0 mt-0.5 ${
                        item.points > 0
                          ? "bg-emerald-100/70 text-emerald-700"
                          : "bg-rose-100/70 text-rose-700"
                      }`}
                    >
                      {item.points > 0 ? (
                        <Icons.TrendingUp className="w-4 h-4" />
                      ) : (
                        <Icons.TrendingDown className="w-4 h-4" />
                      )}
                    </div>
                    <div className="min-w-0">
                      <div className="font-bold text-slate-800 text-xs truncate">
                        {item.title}
                      </div>
                      <div className="text-[11px] text-slate-500 truncate flex items-center gap-1.5 mt-0.5">
                        <span>{item.category}</span>
                        <span>•</span>
                        <span>{item.date}</span>
                        {item.recorder && (
                          <>
                            <span className="hidden sm:inline">•</span>
                            <span className="text-slate-400 hidden sm:inline truncate">
                              {item.recorder}
                            </span>
                          </>
                        )}
                      </div>
                      {item.note && (
                        <p className="text-[10px] text-slate-400 italic truncate mt-0.5">
                          {item.note}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="shrink-0 text-right">
                    <ScoreBadge points={item.points} showPlus={item.points > 0} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* 4. Custom Change Password Modal (Requirement 4) */}
      <Modal
        isOpen={isChangePasswordOpen}
        onClose={() => setIsChangePasswordOpen(false)}
        title="Đổi Mật Khẩu Tài Khoản"
        maxWidth="md"
      >
        <form onSubmit={handleChangePasswordSubmit} className="space-y-4 pt-1">
          <div className="p-3 bg-blue-50 rounded-xl border border-blue-100 text-xs text-blue-800 flex items-start gap-2.5">
            <Icons.Info className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
            <span>
              Mật khẩu mới phải có độ dài tối thiểu <strong>6 ký tự</strong> và không trùng với mật khẩu cũ.
            </span>
          </div>

          {/* Mật khẩu hiện tại */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Mật khẩu hiện tại <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <input
                type={showCurrentPw ? "text" : "password"}
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="Nhập mật khẩu đang sử dụng..."
                className={`w-full bg-slate-50 border rounded-xl py-2 pl-3.5 pr-10 text-xs text-slate-800 focus:outline-none focus:ring-2 ${
                  passwordErrors.current
                    ? "border-rose-400 focus:ring-rose-200"
                    : "border-slate-200 focus:ring-blue-500/20 focus:border-blue-500"
                }`}
              />
              <button
                type="button"
                onClick={() => setShowCurrentPw(!showCurrentPw)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                title={showCurrentPw ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
              >
                <Icons.Eye className="w-4 h-4" />
              </button>
            </div>
            {passwordErrors.current && (
              <p className="text-[11px] text-rose-600 font-semibold mt-1 flex items-center gap-1">
                <Icons.AlertCircle className="w-3 h-3" />
                <span>{passwordErrors.current}</span>
              </p>
            )}
          </div>

          {/* Mật khẩu mới */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Mật khẩu mới <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <input
                type={showNewPw ? "text" : "password"}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Nhập mật khẩu mới (tối thiểu 6 ký tự)..."
                className={`w-full bg-slate-50 border rounded-xl py-2 pl-3.5 pr-10 text-xs text-slate-800 focus:outline-none focus:ring-2 ${
                  passwordErrors.new
                    ? "border-rose-400 focus:ring-rose-200"
                    : "border-slate-200 focus:ring-blue-500/20 focus:border-blue-500"
                }`}
              />
              <button
                type="button"
                onClick={() => setShowNewPw(!showNewPw)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                title={showNewPw ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
              >
                <Icons.Eye className="w-4 h-4" />
              </button>
            </div>
            {passwordErrors.new && (
              <p className="text-[11px] text-rose-600 font-semibold mt-1 flex items-center gap-1">
                <Icons.AlertCircle className="w-3 h-3" />
                <span>{passwordErrors.new}</span>
              </p>
            )}
          </div>

          {/* Xác nhận mật khẩu mới */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Xác nhận mật khẩu mới <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <input
                type={showConfirmPw ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Nhập lại mật khẩu mới..."
                className={`w-full bg-slate-50 border rounded-xl py-2 pl-3.5 pr-10 text-xs text-slate-800 focus:outline-none focus:ring-2 ${
                  passwordErrors.confirm
                    ? "border-rose-400 focus:ring-rose-200"
                    : "border-slate-200 focus:ring-blue-500/20 focus:border-blue-500"
                }`}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPw(!showConfirmPw)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                title={showConfirmPw ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
              >
                <Icons.Eye className="w-4 h-4" />
              </button>
            </div>
            {passwordErrors.confirm && (
              <p className="text-[11px] text-rose-600 font-semibold mt-1 flex items-center gap-1">
                <Icons.AlertCircle className="w-3 h-3" />
                <span>{passwordErrors.confirm}</span>
              </p>
            )}
          </div>

          {/* Buttons */}
          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
            <Button
              type="button"
              variant="outline"
              size="md"
              onClick={() => setIsChangePasswordOpen(false)}
            >
              Hủy
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="md"
              disabled={isSubmittingPassword}
              icon={<Icons.Check className="w-4 h-4" />}
            >
              {isSubmittingPassword ? "Đang cập nhật..." : "Đổi mật khẩu"}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
