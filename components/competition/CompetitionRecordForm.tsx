"use client";

import React, { useState, useEffect } from "react";
import { useApp } from "@/lib/AppContext";
import { Button } from "../ui/Button";
import { ScoreBadge } from "../ui/Badge";
import { Icons } from "../ui/Icons";
import { CustomSelect, CustomSelectOption } from "../ui/CustomSelect";
import { CompetitionTarget } from "@/types";

interface FormProps {
  onSuccess?: () => void;
  defaultTarget?: CompetitionTarget;
  defaultClassId?: string;
  defaultStudentId?: string;
}

export function CompetitionRecordForm({
  onSuccess,
  defaultTarget = "CLASS",
  defaultClassId,
  defaultStudentId,
}: FormProps) {
  const { classes, students, criteria, addCompetitionRecord } = useApp();

  const [targetType, setTargetType] = useState<CompetitionTarget>(defaultTarget);
  const [classId, setClassId] = useState<string>(
    defaultClassId || (classes[0]?._id ?? "")
  );
  const [studentId, setStudentId] = useState<string>(
    defaultStudentId || (students[0]?._id ?? "")
  );

  // Filter criteria matching targetType
  const availableCriteria = criteria.filter(
    (c) => c.targetType === targetType && c.isActive
  );

  const [criteriaId, setCriteriaId] = useState<string>(
    availableCriteria[0]?._id || ""
  );
  const [note, setNote] = useState<string>("");

  // When targetType changes, update criteriaId
  useEffect(() => {
    const matched = criteria.filter(
      (c) => c.targetType === targetType && c.isActive
    );
    if (matched.length > 0) {
      setCriteriaId(matched[0]._id);
    }
  }, [targetType, criteria]);

  // When classId changes and targetType is STUDENT, update studentId
  const studentsInClass = students.filter((s) => s.classId === classId);
  useEffect(() => {
    if (targetType === "STUDENT" && studentsInClass.length > 0) {
      setStudentId(studentsInClass[0]._id);
    }
  }, [classId, targetType]);

  const selectedCriterion = criteria.find((c) => c._id === criteriaId);
  const points = selectedCriterion?.points || 0;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!criteriaId) return;

    addCompetitionRecord({
      targetType,
      classId,
      studentId: targetType === "STUDENT" ? studentId : undefined,
      criteriaId,
      points,
      note: note.trim() || undefined,
    });

    if (onSuccess) {
      onSuccess();
    }
  };

  const classOptions: CustomSelectOption[] = classes.map((c) => ({
    value: c._id,
    label: `Lớp ${c.className} (Khối ${c.grade} · ${c.studentCount} HS)`,
  }));

  const studentOptions: CustomSelectOption[] =
    studentsInClass.length > 0
      ? studentsInClass.map((s) => ({
          value: s._id,
          label: `${s.fullName} (${s.studentCode})`,
        }))
      : [{ value: "", label: "Lớp này chưa có danh sách học sinh" }];

  const criteriaOptions: CustomSelectOption[] = availableCriteria.map((c) => ({
    value: c._id,
    label: `${c.name} (${c.points > 0 ? `+${c.points}` : c.points}đ · ${c.category})`,
  }));

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Target Type Selector */}
      <div>
        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
          Đối tượng ghi nhận thi đua
        </label>
        <div className="grid grid-cols-2 gap-2 bg-slate-100 p-1 rounded-xl">
          <button
            type="button"
            onClick={() => setTargetType("CLASS")}
            className={`py-2 px-3 rounded-lg text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
              targetType === "CLASS"
                ? "bg-white text-blue-700 shadow-xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <Icons.School className="w-4 h-4" />
            <span>Tập thể Lớp</span>
          </button>
          <button
            type="button"
            onClick={() => setTargetType("STUDENT")}
            className={`py-2 px-3 rounded-lg text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
              targetType === "STUDENT"
                ? "bg-white text-blue-700 shadow-xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <Icons.User className="w-4 h-4" />
            <span>Cá nhân Học sinh</span>
          </button>
        </div>
      </div>

      {/* Lớp học */}
      <div>
        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
          Lớp học (THCS Na Sầm)
        </label>
        <CustomSelect
          value={classId}
          onChange={(val) => setClassId(val)}
          options={classOptions}
          className="w-full"
        />
      </div>

      {/* Học sinh (nếu chọn targetType === 'STUDENT') */}
      {targetType === "STUDENT" && (
        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
            Chọn Học sinh
          </label>
          <CustomSelect
            value={studentId}
            onChange={(val) => setStudentId(val)}
            options={studentOptions}
            className="w-full"
          />
        </div>
      )}

      {/* Tiêu chí thi đua */}
      <div>
        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
          Tiêu chí thi đua
        </label>
        <CustomSelect
          value={criteriaId}
          onChange={(val) => setCriteriaId(val)}
          options={criteriaOptions}
          className="w-full"
        />
        {selectedCriterion?.description && (
          <p className="text-xs text-slate-500 mt-1">
            {selectedCriterion.description}
          </p>
        )}
      </div>

      {/* Điểm áp dụng Preview */}
      <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200/80 flex items-center justify-between">
        <div>
          <span className="text-xs font-medium text-slate-500 block">
            Mức điểm áp dụng theo quy chế:
          </span>
          <span className="text-xs font-bold text-slate-700">
            {selectedCriterion?.category || "Chung"}
          </span>
        </div>
        <ScoreBadge points={points} />
      </div>

      {/* Ghi chú chi tiết */}
      <div>
        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
          Ghi chú cụ thể (Tùy chọn)
        </label>
        <textarea
          rows={2}
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="VD: Tiết 3 môn Toán cô Mai xếp loại Tốt / Nhặt được ví tiền ở sân trường..."
          className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs sm:text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Submit Button */}
      <div className="pt-2">
        <Button
          type="submit"
          variant="primary"
          size="md"
          className="w-full justify-center"
          icon={<Icons.Plus className="w-4 h-4" />}
        >
          Xác nhận ghi điểm ({points > 0 ? `+${points}` : points} điểm)
        </Button>
      </div>
    </form>
  );
}
