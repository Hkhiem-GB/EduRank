"use client";

import React, { useState, useEffect } from "react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { CustomSelect, CustomSelectOption } from "@/components/ui/CustomSelect";
import { Icons } from "@/components/ui/Icons";
import { useApp } from "@/lib/AppContext";

interface AddStudentModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultClassId?: string;
  onSuccess?: () => void;
}

export function AddStudentModal({
  isOpen,
  onClose,
  defaultClassId,
  onSuccess,
}: AddStudentModalProps) {
  const { classes, students, addStudent } = useApp();

  const [fullName, setFullName] = useState("");
  const [studentCode, setStudentCode] = useState("");
  const [classId, setClassId] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("2014-05-15");
  const [gender, setGender] = useState<"MALE" | "FEMALE" | "OTHER">("MALE");
  const [parentName, setParentName] = useState("");
  const [parentPhone, setParentPhone] = useState("");
  const [password, setPassword] = useState("123456");
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState("");

  // Prepare class options sorted by grade then classCode
  const classOptions: CustomSelectOption[] = [
    { value: "", label: "-- Chọn lớp học --" },
    ...[...classes]
      .sort((a, b) => (a.grade === b.grade ? a.className.localeCompare(b.className) : a.grade - b.grade))
      .map((c) => ({
        value: String(c._id),
        label: `Lớp ${c.className} (Khối ${c.grade}) · Phòng ${c.room || "—"}`,
      })),
  ];

  const genderOptions: CustomSelectOption[] = [
    { value: "MALE", label: "Nam" },
    { value: "FEMALE", label: "Nữ" },
    { value: "OTHER", label: "Khác" },
  ];

  // Auto-generate suggested student code
  const generateSuggestedCode = () => {
    const nextNum = students.length + 1;
    let candidate = `HS${String(nextNum).padStart(3, "0")}`;
    while (students.some((s) => s.studentCode === candidate)) {
      const current = parseInt(candidate.replace("HS", ""), 10) || nextNum;
      candidate = `HS${String(current + 1).padStart(3, "0")}`;
    }
    return candidate;
  };

  // Reset form when modal opens or defaultClassId changes
  useEffect(() => {
    if (isOpen) {
      setFullName("");
      setStudentCode(generateSuggestedCode());
      setClassId(defaultClassId || (classes[0] ? String(classes[0]._id) : ""));
      setDateOfBirth("2014-05-15");
      setGender("MALE");
      setParentName("");
      setParentPhone("");
      setPassword("123456");
      setShowPassword(false);
      setFormError("");
      setIsSubmitting(false);
    }
  }, [isOpen, defaultClassId, classes, students.length]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");

    if (!fullName.trim()) {
      setFormError("Vui lòng nhập họ và tên học sinh.");
      return;
    }
    if (!classId) {
      setFormError("Vui lòng chọn lớp học cho học sinh.");
      return;
    }
    if (!dateOfBirth) {
      setFormError("Vui lòng chọn ngày sinh.");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await addStudent({
        fullName: fullName.trim(),
        studentCode: studentCode.trim() || undefined,
        classId,
        dateOfBirth: new Date(dateOfBirth),
        gender,
        parentName: parentName.trim() || undefined,
        parentPhone: parentPhone.trim() || undefined,
        password: password.trim() || "123456",
      });

      if (res && res.success) {
        onSuccess?.();
        onClose();
      } else if (res && res.message) {
        setFormError(res.message);
      }
    } catch (err: any) {
      setFormError(err.message || "Lỗi máy chủ khi tạo hồ sơ học sinh.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectedClass = classes.find((c) => String(c._id) === classId);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="➕ Thêm Học Sinh Mới"
      description="Tạo hồ sơ học sinh, khởi tạo tài khoản đăng nhập và phân vào lớp học tương ứng"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {formError && (
          <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 flex items-center gap-2">
            <Icons.AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
            <span>{formError}</span>
          </div>
        )}

        {/* Họ tên */}
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">
            Họ và tên học sinh <span className="text-rose-500">*</span>
          </label>
          <input
            type="text"
            required
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            placeholder="VD: Nguyễn Văn Hoàng"
            className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Mã học sinh & Lớp học */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-bold text-slate-700">Mã học sinh</label>
              <button
                type="button"
                onClick={() => setStudentCode(generateSuggestedCode())}
                className="text-[10px] text-blue-600 hover:text-blue-800 font-semibold cursor-pointer"
              >
                Tự sinh mã
              </button>
            </div>
            <input
              type="text"
              value={studentCode}
              onChange={(e) => setStudentCode(e.target.value.toUpperCase())}
              placeholder="VD: HS012"
              className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono uppercase"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Lớp tiếp nhận <span className="text-rose-500">*</span>
            </label>
            <CustomSelect
              value={classId}
              onChange={(val) => setClassId(val)}
              options={classOptions}
              className="w-full"
            />
          </div>
        </div>

        {selectedClass && (
          <div className="px-3 py-2 bg-blue-50/70 border border-blue-100 rounded-xl text-xs text-blue-800 flex items-center justify-between">
            <span>
              Phân vào: <strong>Lớp {selectedClass.className}</strong> (Khối {selectedClass.grade})
            </span>
            <span className="text-slate-500 text-[11px]">
              Sĩ số hiện tại: {selectedClass.studentCount || 0} HS
            </span>
          </div>
        )}

        {/* Ngày sinh & Giới tính */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Ngày sinh <span className="text-rose-500">*</span>
            </label>
            <input
              type="date"
              required
              value={dateOfBirth}
              onChange={(e) => setDateOfBirth(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Giới tính</label>
            <CustomSelect
              value={gender}
              onChange={(val) => setGender(val as "MALE" | "FEMALE" | "OTHER")}
              options={genderOptions}
              className="w-full"
            />
          </div>
        </div>

        {/* Thông tin phụ huynh */}
        <div className="p-3 bg-slate-50/80 border border-slate-200/80 rounded-xl space-y-3">
          <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
            Thông tin liên hệ gia đình (Không bắt buộc)
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Họ tên phụ huynh</label>
              <input
                type="text"
                value={parentName}
                onChange={(e) => setParentName(e.target.value)}
                placeholder="VD: Nguyễn Văn Bình"
                className="w-full bg-white border border-slate-200 rounded-lg py-1.5 px-3 text-xs sm:text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Số điện thoại phụ huynh</label>
              <input
                type="tel"
                value={parentPhone}
                onChange={(e) => setParentPhone(e.target.value)}
                placeholder="VD: 0912 345 678"
                className="w-full bg-white border border-slate-200 rounded-lg py-1.5 px-3 text-xs sm:text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Mật khẩu khởi tạo */}
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">
            Mật khẩu đăng nhập ban đầu
          </label>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Mặc định: 123456"
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
            Tài khoản đăng nhập là <strong>Mã HS</strong> và mật khẩu mặc định là <strong>123456</strong>.
          </p>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
          <Button type="button" variant="outline" size="md" onClick={onClose} disabled={isSubmitting}>
            Hủy
          </Button>
          <Button
            type="submit"
            variant="primary"
            size="md"
            icon={isSubmitting ? <Icons.RefreshCw className="w-4 h-4 animate-spin" /> : <Icons.Plus className="w-4 h-4" />}
            disabled={isSubmitting}
          >
            {isSubmitting ? "Đang tạo..." : "Lưu & Tạo hồ sơ học sinh"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
