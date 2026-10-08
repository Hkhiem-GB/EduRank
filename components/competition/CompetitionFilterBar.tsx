"use client";

import React from "react";
import { useApp } from "@/lib/AppContext";
import { Icons } from "../ui/Icons";
import { CustomSelect, CustomSelectOption } from "../ui/CustomSelect";

export function CompetitionFilterBar() {
  const { filter, setFilter, classes } = useApp();

  const handleYearChange = (val: string) => {
    setFilter((prev) => ({ ...prev, schoolYearId: val }));
  };

  const handleWeekChange = (val: number | string) => {
    const w = Number(val);
    // Tính ngày bắt đầu - ngày kết thúc tương ứng với tuần
    const startDay = (w - 1) * 7 + 1;
    const endDay = w * 7;
    const pad = (n: number) => String(n).padStart(2, "0");
    const sDate = `${pad(((startDay - 1) % 30) + 1)}/10/2026`;
    const eDate = `${pad(((endDay - 1) % 30) + 1)}/10/2026`;

    setFilter((prev) => ({
      ...prev,
      week: w,
      startDate: sDate,
      endDate: eDate,
    }));
  };

  const handleGradeChange = (val: string) => {
    const gradeNum = val ? Number(val) : undefined;
    setFilter((prev) => ({ ...prev, grade: gradeNum, classId: undefined }));
  };

  const handleClassChange = (val: string) => {
    setFilter((prev) => ({ ...prev, classId: val || undefined }));
  };

  const filteredClasses = filter.grade
    ? classes.filter((c) => c.grade === filter.grade)
    : classes;

  const currentWeek = filter.week || 6;
  const currentStartDate = filter.startDate || "01/10/2026";
  const currentEndDate = filter.endDate || "07/10/2026";

  const schoolYearOptions: CustomSelectOption[] = [
    { value: "2026-2027", label: "Năm học 2026–2027 (Hiện tại)" },
  ];

  const weekOptions: CustomSelectOption[] = [
    { w: 1, s: "01/09", e: "07/09" },
    { w: 2, s: "08/09", e: "14/09" },
    { w: 3, s: "15/09", e: "21/09" },
    { w: 4, s: "22/09", e: "28/09" },
    { w: 5, s: "29/09", e: "05/10" },
    { w: 6, s: "01/10", e: "07/10" },
    { w: 7, s: "08/10", e: "14/10" },
    { w: 8, s: "15/10", e: "21/10" },
  ].map((item) => ({
    value: item.w,
    label: `Tuần ${item.w} (${item.s} — ${item.e})${item.w === 6 ? " • Hiện tại" : ""}`,
  }));

  const gradeOptions: CustomSelectOption[] = [
    { value: "", label: "Tất cả các khối" },
    { value: "6", label: `Khối 6 (${classes.filter((c) => c.grade === 6).length} lớp)` },
    { value: "7", label: `Khối 7 (${classes.filter((c) => c.grade === 7).length} lớp)` },
    { value: "8", label: `Khối 8 (${classes.filter((c) => c.grade === 8).length} lớp)` },
    { value: "9", label: `Khối 9 (${classes.filter((c) => c.grade === 9).length} lớp)` },
  ];

  const classOptions: CustomSelectOption[] = [
    { value: "", label: `Tất cả (${filteredClasses.length} lớp)` },
    ...filteredClasses.map((c) => ({
      value: c._id,
      label: `Lớp ${c.className} (${c.studentCount} HS)`,
    })),
  ];

  return (
    <div className="bg-white rounded-xl sm:rounded-2xl border border-slate-200/80 p-3 sm:p-4 mb-4 sm:mb-6 shadow-2xs">
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-3 sm:gap-4">
        {/* Label with icon and live week date badge (Section 8.4) */}
        <div className="flex items-center gap-2.5 sm:gap-3">
          <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 border border-blue-100">
            <Icons.Filter className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
              <span className="font-bold text-slate-800 text-xs sm:text-sm">
                Bộ lọc thi đua
              </span>
              <span className="text-[10px] sm:text-[11px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-200/60 truncate max-w-full">
                Tuần {currentWeek}: {currentStartDate} — {currentEndDate}
              </span>
            </div>
            <span className="text-slate-400 font-normal text-[11px] sm:text-xs block mt-0.5 truncate">
              Dữ liệu thi đua theo tuần học và khối lớp ({classes.length} Lớp)
            </span>
          </div>
        </div>

        {/* Filter controls with CustomSelect */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3 flex-1 xl:max-w-4xl">
          {/* Năm học */}
          <div>
            <CustomSelect
              label="Năm học"
              value={filter.schoolYearId || "sy_2026_2027"}
              onChange={handleYearChange}
              options={schoolYearOptions}
              className="w-full"
            />
          </div>

          {/* Tuần học */}
          <div>
            <CustomSelect
              label={`Tuần học`}
              value={currentWeek}
              onChange={handleWeekChange}
              options={weekOptions}
              className="w-full"
            />
          </div>

          {/* Khối lớp */}
          <div>
            <CustomSelect
              label="Khối lớp"
              value={filter.grade ? String(filter.grade) : ""}
              onChange={handleGradeChange}
              options={gradeOptions}
              className="w-full"
            />
          </div>

          {/* Lớp */}
          <div>
            <CustomSelect
              label="Lớp học"
              value={filter.classId || ""}
              onChange={handleClassChange}
              options={classOptions}
              className="w-full"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
