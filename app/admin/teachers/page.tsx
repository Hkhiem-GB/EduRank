"use client";

import React, { useState, useMemo } from "react";
import { useApp } from "@/lib/AppContext";
import { PageHeader } from "@/components/layout/PageHeader";
import { Icons } from "@/components/ui/Icons";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { CustomSelect, CustomSelectOption } from "@/components/ui/CustomSelect";
import { ITeacher } from "@/types";
import Link from "next/link";

export default function AdminTeachersPage() {
  const {
    teachers,
    classes,
    refreshData,
    showToast,
    addTeacher,
    updateTeacher,
    deactivateTeacher,
    deleteTeacher,
  } = useApp();

  const [searchTerm, setSearchTerm] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingTeacher, setEditingTeacher] = useState<ITeacher | null>(null);
  const [deactivatingTeacher, setDeactivatingTeacher] = useState<ITeacher | null>(null);
  const [deletingTeacher, setDeletingTeacher] = useState<ITeacher | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    department: "Tổ Tự Nhiên (Toán - Tin)",
    gender: "FEMALE" as "MALE" | "FEMALE",
    assignedClassId: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);

  // Refresh data handler
  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await refreshData();
      showToast("Đã làm mới dữ liệu danh sách giáo viên!", "info");
    } catch {
      showToast("Không thể làm mới dữ liệu.", "error");
    } finally {
      setIsRefreshing(false);
    }
  };

  // Filtered teachers
  const filteredTeachers = useMemo(() => {
    return teachers.filter((t) => {
      const matchSearch =
        t.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.teacherCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (t.email && t.email.toLowerCase().includes(searchTerm.toLowerCase()));
      const matchDept = departmentFilter === "ALL" || t.department === departmentFilter;
      const matchStatus = statusFilter === "ALL" || t.status === statusFilter;
      return matchSearch && matchDept && matchStatus;
    });
  }, [teachers, searchTerm, departmentFilter, statusFilter]);

  // Departments list for filter
  const departments = Array.from(new Set(teachers.map((t) => t.department))).filter(
    (d): d is string => Boolean(d)
  );

  const departmentFilterOptions: CustomSelectOption[] = [
    { value: "ALL", label: "Tất cả tổ bộ môn" },
    ...departments.map((d) => ({ value: d, label: d })),
  ];

  const statusFilterOptions: CustomSelectOption[] = [
    { value: "ALL", label: "Tất cả trạng thái" },
    { value: "ACTIVE", label: "Đang công tác" },
    { value: "INACTIVE", label: "Tạm khóa / Nghỉ" },
  ];

  const departmentFormOptions: CustomSelectOption[] = [
    { value: "Tổ Tự Nhiên (Toán - Tin)", label: "Tổ Tự Nhiên (Toán - Tin)" },
    { value: "Tổ KHTN (Lý - Hóa - Sinh)", label: "Tổ KHTN (Lý - Hóa - Sinh)" },
    { value: "Tổ Xã Hội (Văn - Sử - Địa)", label: "Tổ Xã Hội (Văn - Sử - Địa)" },
    { value: "Tổ Ngoại Ngữ", label: "Tổ Ngoại Ngữ" },
    { value: "Tổ Năng Khiếu (Âm nhạc - Mỹ thuật)", label: "Tổ Năng Khiếu (Âm nhạc - MT)" },
  ];

  const genderOptions: CustomSelectOption[] = [
    { value: "FEMALE", label: "Nữ" },
    { value: "MALE", label: "Nam" },
  ];

  const classOptions: CustomSelectOption[] = [
    { value: "", label: "-- Chưa chủ nhiệm lớp nào --" },
    ...classes.map((c) => ({
      value: String(c._id),
      label: `Lớp ${c.className} (Khối ${c.grade})`,
    })),
  ];

  const resetForm = () => {
    setFormData({
      fullName: "",
      email: "",
      phone: "",
      department: "Tổ Tự Nhiên (Toán - Tin)",
      gender: "FEMALE",
      assignedClassId: "",
      password: "",
    });
    setShowPassword(false);
  };

  const handleOpenAdd = () => {
    resetForm();
    setIsAddModalOpen(true);
  };

  const handleOpenEdit = (t: ITeacher) => {
    setEditingTeacher(t);
    const teacherIdStr = String(t._id);
    const teacherAssignedIdStr =
      typeof t.assignedClassId === "object" && t.assignedClassId !== null
        ? String((t.assignedClassId as any)._id)
        : t.assignedClassId
        ? String(t.assignedClassId)
        : "";

    const matchedClass = classes.find((c) => {
      const cHomeroomIdStr =
        typeof c.homeroomTeacherId === "object" && c.homeroomTeacherId !== null
          ? String((c.homeroomTeacherId as any)._id)
          : c.homeroomTeacherId
          ? String(c.homeroomTeacherId)
          : "";
      return (
        (teacherAssignedIdStr && String(c._id) === teacherAssignedIdStr) ||
        (cHomeroomIdStr && cHomeroomIdStr === teacherIdStr)
      );
    });

    setFormData({
      fullName: t.fullName,
      email: t.email || "",
      phone: t.phone || "",
      department: t.department || "Tổ Bộ môn",
      gender: (t.gender as "MALE" | "FEMALE") || "FEMALE",
      assignedClassId: matchedClass ? String(matchedClass._id) : teacherAssignedIdStr,
      password: "",
    });
    setShowPassword(false);
  };

  const handleSaveAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.fullName.trim()) return;

    const assignedCls = classes.find((c) => String(c._id) === formData.assignedClassId);
    addTeacher({
      fullName: formData.fullName,
      email: formData.email,
      phone: formData.phone,
      department: formData.department,
      gender: formData.gender,
      assignedClassId: formData.assignedClassId || undefined,
      assignedClassName: assignedCls ? `Lớp ${assignedCls.className}` : undefined,
      password: formData.password || "123456",
    });

    setIsAddModalOpen(false);
    resetForm();
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTeacher) return;

    const assignedCls = classes.find((c) => String(c._id) === formData.assignedClassId);
    updateTeacher({
      ...editingTeacher,
      fullName: formData.fullName,
      email: formData.email,
      phone: formData.phone,
      department: formData.department,
      gender: formData.gender,
      assignedClassId: formData.assignedClassId || undefined,
      assignedClassName: assignedCls ? `Lớp ${assignedCls.className}` : undefined,
    });

    setEditingTeacher(null);
    resetForm();
  };

  const handleConfirmDeactivate = () => {
    if (deactivatingTeacher) {
      deactivateTeacher(deactivatingTeacher._id);
      setDeactivatingTeacher(null);
    }
  };

  const handleConfirmDelete = () => {
    if (deletingTeacher) {
      deleteTeacher(deletingTeacher._id);
      setDeletingTeacher(null);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        greeting="Nhân sự sư phạm THCS Na Sầm"
        title="Quản Lý Đội Ngũ Giáo Viên"
        description="Danh sách cán bộ giáo viên, phân công giáo viên chủ nhiệm và quản trị tài khoản chuyên môn"
        badge={
          <span className="text-xs font-bold text-blue-700 bg-blue-50 border border-blue-200 px-3 py-1 rounded-full">
            {teachers.length} Giáo viên · {classes.length} Lớp phụ trách
          </span>
        }
        actions={
          <Button
            variant="primary"
            size="md"
            icon={<Icons.Plus className="w-4 h-4" />}
            onClick={handleOpenAdd}
          >
            Thêm giáo viên mới
          </Button>
        }
      />

      {/* Filter and Search Bar with CustomSelect */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-4 sm:p-5 shadow-2xs flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="relative flex-1 w-full max-w-md">
          <Icons.Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Tìm theo họ tên, mã GV hoặc email..."
            className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 pl-10 pr-4 text-xs sm:text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="flex items-center gap-2 flex-wrap w-full md:w-auto">
          {/* Nút Làm mới (Refresh) bên trái mục bộ lọc */}
          <button
            type="button"
            onClick={handleRefresh}
            disabled={isRefreshing}
            title="Làm mới dữ liệu"
            className="inline-flex items-center justify-center gap-1.5 px-3 py-2 text-xs sm:text-sm font-semibold text-slate-700 bg-slate-50 hover:bg-slate-100 active:scale-95 border border-slate-200 rounded-xl transition-all cursor-pointer disabled:opacity-50 shadow-2xs"
          >
            <Icons.RefreshCw
              className={`w-3.5 h-3.5 text-slate-600 transition-transform ${
                isRefreshing ? "animate-spin text-blue-600" : ""
              }`}
            />
            <span className="hidden sm:inline">Làm mới</span>
          </button>

          <CustomSelect
            value={departmentFilter}
            onChange={(val) => setDepartmentFilter(val)}
            options={departmentFilterOptions}
            size="sm"
            className="min-w-[170px]"
          />

          <CustomSelect
            value={statusFilter}
            onChange={(val) => setStatusFilter(val)}
            options={statusFilterOptions}
            size="sm"
            className="min-w-[150px]"
          />

          <span className="text-xs text-slate-500 font-medium ml-1 hidden sm:inline">
            Tổng: <strong className="text-blue-700">{filteredTeachers.length}</strong> GV
          </span>
        </div>
      </div>

      {/* Teachers Table */}
      <div className="bg-white rounded-xl sm:rounded-2xl border border-slate-200/80 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-[11px] sm:text-xs md:text-sm">
            <thead>
              <tr className="bg-slate-50/70 border-b border-slate-200/80 text-[10px] sm:text-[11px] md:text-xs font-bold text-slate-500 uppercase tracking-wider select-none">
                <th className="py-2 sm:py-3 px-1.5 sm:px-3 md:px-4 w-10 sm:w-12 text-center">STT</th>
                <th className="py-2 sm:py-3 px-2 sm:px-3 md:px-4 hidden sm:table-cell">Mã GV</th>
                <th className="py-2 sm:py-3 px-2 sm:px-3 md:px-4">Họ và tên</th>
                <th className="py-2 sm:py-3 px-2 sm:px-3 md:px-4 hidden md:table-cell">Tổ bộ môn</th>
                <th className="py-2 sm:py-3 px-2 sm:px-3 md:px-4 hidden lg:table-cell">Liên hệ</th>
                <th className="py-2 sm:py-3 px-1.5 sm:px-3 md:px-4">Lớp CN</th>
                <th className="py-2 sm:py-3 px-2 sm:px-3 md:px-4 text-center hidden sm:table-cell">Trạng thái</th>
                <th className="py-2 sm:py-3 px-2 sm:px-3 md:px-4 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredTeachers.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    Không tìm thấy giáo viên nào phù hợp với tìm kiếm.
                  </td>
                </tr>
              ) : (
                filteredTeachers.map((t, idx) => {
                  const teacherIdStr = String(t._id);
                  const teacherAssignedIdStr =
                    typeof t.assignedClassId === "object" && t.assignedClassId !== null
                      ? String((t.assignedClassId as any)._id)
                      : t.assignedClassId
                      ? String(t.assignedClassId)
                      : "";

                  const assignedCls = classes.find((c) => {
                    const cIdStr = String(c._id);
                    const cHomeroomIdStr =
                      typeof c.homeroomTeacherId === "object" && c.homeroomTeacherId !== null
                        ? String((c.homeroomTeacherId as any)._id)
                        : c.homeroomTeacherId
                        ? String(c.homeroomTeacherId)
                        : "";

                    return (
                      (teacherAssignedIdStr && cIdStr === teacherAssignedIdStr) ||
                      (cHomeroomIdStr && cHomeroomIdStr === teacherIdStr)
                    );
                  });

                  const displayClassName =
                    assignedCls?.className ||
                    (typeof t.assignedClassId === "object" && (t.assignedClassId as any)?.className) ||
                    (t.assignedClassName ? t.assignedClassName.replace(/^Lớp\s+/i, "") : null);

                  const targetClassId =
                    assignedCls?._id ||
                    (typeof t.assignedClassId === "object" ? (t.assignedClassId as any)?._id : null) ||
                    (typeof t.assignedClassId === "string" ? t.assignedClassId : null);

                  return (
                    <tr key={t._id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-1.5 sm:py-2.5 px-1.5 sm:px-3 md:px-4 text-center text-[11px] sm:text-xs text-slate-400 font-medium">
                        {idx + 1}
                      </td>
                      <td className="py-1.5 sm:py-2.5 px-2 sm:px-3 md:px-4 font-mono text-xs font-semibold text-slate-600 hidden sm:table-cell">
                        {t.teacherCode}
                      </td>
                      <td className="py-1.5 sm:py-2.5 px-2 sm:px-3 md:px-4">
                        <div className="font-bold text-slate-800 text-xs sm:text-sm md:text-base">
                          {t.fullName}
                        </div>
                        <div className="text-[10px] text-slate-400 sm:hidden flex items-center gap-1.5 mt-0.5">
                          <span className="font-mono">{t.teacherCode}</span>
                          <span>•</span>
                          <span>{t.department}</span>
                        </div>
                      </td>
                      <td className="py-1.5 sm:py-2.5 px-2 sm:px-3 md:px-4 hidden md:table-cell text-xs text-slate-600">
                        {t.department}
                      </td>
                      <td className="py-1.5 sm:py-2.5 px-2 sm:px-3 md:px-4 hidden lg:table-cell text-xs text-slate-600">
                        <div>{t.email}</div>
                        <div className="text-slate-400">{t.phone}</div>
                      </td>
                      <td className="py-1.5 sm:py-2.5 px-1.5 sm:px-3 md:px-4">
                        {displayClassName ? (
                          targetClassId ? (
                            <Link href={`/classes/${targetClassId}`}>
                              <span className="inline-flex items-center gap-1 text-[10px] sm:text-xs font-bold text-blue-700 bg-blue-50 border border-blue-200/70 hover:bg-blue-100 px-1.5 sm:px-2.5 py-0.5 sm:py-1 rounded-md transition-colors cursor-pointer">
                                <Icons.School className="w-3.5 h-3.5" />
                                Lớp {displayClassName}
                              </span>
                            </Link>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-[10px] sm:text-xs font-bold text-blue-700 bg-blue-50 border border-blue-200/70 px-1.5 sm:px-2.5 py-0.5 sm:py-1 rounded-md">
                              <Icons.School className="w-3.5 h-3.5" />
                              Lớp {displayClassName}
                            </span>
                          )
                        ) : (
                          <span className="text-[10px] sm:text-xs text-slate-400 italic">Chưa phân công</span>
                        )}
                      </td>
                      <td className="py-1.5 sm:py-2.5 px-2 sm:px-3 md:px-4 text-center hidden sm:table-cell">
                        <Badge variant={t.status === "ACTIVE" ? "success" : "neutral"} size="sm">
                          {t.status === "ACTIVE" ? "Đang dạy" : "Tạm khóa"}
                        </Badge>
                      </td>
                      <td className="py-1.5 sm:py-2.5 px-2 sm:px-3 md:px-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          {/* Chỉnh sửa */}
                          <button
                            onClick={() => handleOpenEdit(t)}
                            className="p-1 sm:p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                            title="Chỉnh sửa thông tin"
                          >
                            <Icons.Edit className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                          </button>

                          {/* Khóa / Mở khóa */}
                          <button
                            onClick={() => setDeactivatingTeacher(t)}
                            className={`p-1 sm:p-1.5 rounded-lg transition-colors cursor-pointer ${
                              t.status === "ACTIVE"
                                ? "text-slate-400 hover:text-amber-600 hover:bg-amber-50"
                                : "text-emerald-600 hover:bg-emerald-50"
                            }`}
                            title={t.status === "ACTIVE" ? "Khóa tài khoản" : "Mở khóa tài khoản"}
                          >
                            <Icons.Lock className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                          </button>

                          {/* Xóa giáo viên */}
                          <button
                            onClick={() => setDeletingTeacher(t)}
                            className="p-1 sm:p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                            title="Xóa giáo viên khỏi hệ thống"
                          >
                            <Icons.Trash2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
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

      {/* Add Teacher Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="➕ Thêm Giáo Viên Mới"
        description="Điền thông tin giáo viên để tạo hồ sơ sư phạm và tài khoản truy cập hệ thống"
      >
        <form onSubmit={handleSaveAdd} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Họ và tên giáo viên <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={formData.fullName}
              onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
              placeholder="VD: Cô Nguyễn Thị Mai"
              className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Email</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="mai.nt@thcsnasam.edu.vn"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Số điện thoại</label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="0912 345 678"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Tổ bộ môn</label>
              <CustomSelect
                value={formData.department}
                onChange={(val) => setFormData({ ...formData, department: val })}
                options={departmentFormOptions}
                className="w-full"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Giới tính</label>
              <CustomSelect
                value={formData.gender}
                onChange={(val) => setFormData({ ...formData, gender: val as "MALE" | "FEMALE" })}
                options={genderOptions}
                className="w-full"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Phân công lớp chủ nhiệm (nếu có)
            </label>
            <CustomSelect
              value={formData.assignedClassId}
              onChange={(val) => setFormData({ ...formData, assignedClassId: val })}
              options={classOptions}
              className="w-full"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Mật khẩu khởi tạo <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                placeholder="Nhập mật khẩu ban đầu (mặc định: 123456)"
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
          </div>

          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
            <Button
              type="button"
              variant="outline"
              size="md"
              onClick={() => setIsAddModalOpen(false)}
            >
              Hủy
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="md"
              icon={<Icons.Plus className="w-4 h-4" />}
            >
              Tạo tài khoản & Hồ sơ
            </Button>
          </div>
        </form>
      </Modal>

      {/* Edit Teacher Modal */}
      <Modal
        isOpen={Boolean(editingTeacher)}
        onClose={() => setEditingTeacher(null)}
        title="✏️ Cập Nhật Thông Tin Giáo Viên"
        description="Chỉnh sửa thông tin chuyên môn, tổ bộ môn và phân công chủ nhiệm"
      >
        <form onSubmit={handleSaveEdit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Họ và tên giáo viên <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={formData.fullName}
              onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Email</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Số điện thoại</label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Tổ bộ môn</label>
              <CustomSelect
                value={formData.department}
                onChange={(val) => setFormData({ ...formData, department: val })}
                options={departmentFormOptions}
                className="w-full"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Giới tính</label>
              <CustomSelect
                value={formData.gender}
                onChange={(val) => setFormData({ ...formData, gender: val as "MALE" | "FEMALE" })}
                options={genderOptions}
                className="w-full"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Phân công lớp chủ nhiệm
            </label>
            <CustomSelect
              value={formData.assignedClassId}
              onChange={(val) => setFormData({ ...formData, assignedClassId: val })}
              options={classOptions}
              className="w-full"
            />
          </div>

          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
            <Button
              type="button"
              variant="outline"
              size="md"
              onClick={() => setEditingTeacher(null)}
            >
              Hủy
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="md"
              icon={<Icons.Check className="w-4 h-4" />}
            >
              Lưu thay đổi
            </Button>
          </div>
        </form>
      </Modal>

      {/* Deactivate Teacher Modal */}
      <Modal
        isOpen={Boolean(deactivatingTeacher)}
        onClose={() => setDeactivatingTeacher(null)}
        title={
          deactivatingTeacher?.status === "ACTIVE"
            ? "🔒 Khóa Tài Khoản Giáo Viên"
            : "🔓 Mở Khóa Tài Khoản Giáo Viên"
        }
        maxWidth="sm"
      >
        <div className="space-y-4">
          <p className="text-xs sm:text-sm text-slate-600">
            {deactivatingTeacher?.status === "ACTIVE"
              ? `Bạn có chắc chắn muốn tạm khóa tài khoản của giáo viên "${deactivatingTeacher?.fullName}"? Giáo viên sẽ tạm thời không thể đăng nhập chấm điểm.`
              : `Bạn có chắc chắn muốn mở khóa tài khoản của giáo viên "${deactivatingTeacher?.fullName}"?`}
          </p>

          <div className="flex items-center justify-end gap-2.5 pt-2">
            <Button
              variant="outline"
              size="md"
              onClick={() => setDeactivatingTeacher(null)}
            >
              Hủy
            </Button>
            <Button
              variant={deactivatingTeacher?.status === "ACTIVE" ? "danger" : "primary"}
              size="md"
              onClick={handleConfirmDeactivate}
            >
              {deactivatingTeacher?.status === "ACTIVE" ? "Xác nhận khóa" : "Mở khóa"}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Delete Teacher Confirmation Modal */}
      <Modal
        isOpen={Boolean(deletingTeacher)}
        onClose={() => setDeletingTeacher(null)}
        title="🗑️ Xác Nhận Xóa Giáo Viên"
        maxWidth="sm"
      >
        <div className="space-y-4">
          <div className="p-3.5 bg-rose-50 rounded-xl border border-rose-200/80 text-rose-900 text-xs sm:text-sm">
            <p className="font-bold text-rose-700 mb-1">Cảnh báo hành động:</p>
            Bạn có chắc chắn muốn xóa vĩnh viễn giáo viên{" "}
            <strong>{deletingTeacher?.fullName}</strong> ({deletingTeacher?.teacherCode}) khỏi hệ thống?
            {deletingTeacher?.assignedClassId && (
              <p className="mt-2 text-rose-600 text-xs font-semibold">
                ⚠️ Giáo viên này đang là GVCN. Phân công chủ nhiệm của lớp sẽ được gỡ bỏ.
              </p>
            )}
          </div>

          <div className="flex items-center justify-end gap-2.5 pt-2">
            <Button
              variant="outline"
              size="md"
              onClick={() => setDeletingTeacher(null)}
            >
              Hủy
            </Button>
            <Button
              variant="danger"
              size="md"
              icon={<Icons.Trash2 className="w-4 h-4" />}
              onClick={handleConfirmDelete}
            >
              Xác nhận xóa
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
