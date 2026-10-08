"use client";

import React, { useState, useMemo } from "react";
import { useApp } from "@/lib/AppContext";
import { StudentSortField, SortOrder, StudentTableItem } from "@/types";
import { Icons } from "../ui/Icons";
import { Badge, ScoreBadge } from "../ui/Badge";
import { Button } from "../ui/Button";
import { CustomSelect, CustomSelectOption } from "../ui/CustomSelect";

interface StudentTableProps {
  onScoreStudent?: (studentId: string, classId: string) => void;
  onAddStudent?: () => void;
}

export function StudentTable({ onScoreStudent }: StudentTableProps) {
  const { students, classes, studentRankings } = useApp();

  // Search state (Section 28)
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedGrade, setSelectedGrade] = useState<string>("");
  const [selectedClassId, setSelectedClassId] = useState<string>("");

  // Sort state (Section 29)
  const [sortField, setSortField] = useState<StudentSortField>("score");
  const [sortOrder, setSortOrder] = useState<SortOrder>("desc");

  // Pagination state (Section 30: default 50 items/page, with 20/50/100 option)
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(50);

  // Build table items with computed scores
  const tableData: StudentTableItem[] = useMemo(() => {
    return students.map((s) => {
      const cls = classes.find((c) => c._id === s.classId);
      const ranking = studentRankings.find((r) => r.studentId === s._id);

      return {
        _id: s._id,
        studentCode: s.studentCode,
        fullName: s.fullName,
        dateOfBirth: String(s.dateOfBirth),
        gender: s.gender === "MALE" ? "Nam" : s.gender === "FEMALE" ? "Nữ" : "Khác",
        classId: s.classId,
        className: cls?.className || "—",
        grade: cls?.grade || 6,
        score: ranking?.score || 100,
        positivePoints: ranking?.positivePoints || 0,
        negativePoints: ranking?.negativePoints || 0,
        status: s.status,
      };
    });
  }, [students, classes, studentRankings]);

  // Filtered items
  const filteredData = useMemo(() => {
    return tableData.filter((item) => {
      const matchSearch =
        item.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.studentCode.toLowerCase().includes(searchTerm.toLowerCase());
      const matchGrade = selectedGrade
        ? item.grade === Number(selectedGrade)
        : true;
      const matchClass = selectedClassId
        ? item.classId === selectedClassId
        : true;
      return matchSearch && matchGrade && matchClass;
    });
  }, [tableData, searchTerm, selectedGrade, selectedClassId]);

  // Sorted items
  const sortedData = useMemo(() => {
    return [...filteredData].sort((a, b) => {
      let result = 0;
      if (sortField === "score") {
        result = a.score - b.score;
      } else if (sortField === "fullName") {
        result = a.fullName.localeCompare(b.fullName, "vi");
      } else if (sortField === "studentCode") {
        result = a.studentCode.localeCompare(b.studentCode);
      } else if (sortField === "dateOfBirth") {
        result =
          new Date(a.dateOfBirth).getTime() - new Date(b.dateOfBirth).getTime();
      }
      return sortOrder === "asc" ? result : -result;
    });
  }, [filteredData, sortField, sortOrder]);

  // Pagination calculation
  const total = sortedData.length;
  const totalPages = Math.ceil(total / limit) || 1;
  const paginatedData = useMemo(() => {
    const start = (page - 1) * limit;
    return sortedData.slice(start, start + limit);
  }, [sortedData, page, limit]);

  const handleSort = (field: StudentSortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortOrder("desc");
    }
    setPage(1);
  };

  const filteredClasses = selectedGrade
    ? classes.filter((c) => c.grade === Number(selectedGrade))
    : classes;

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs overflow-hidden">
      {/* Top Filter and Search Bar */}
      <div className="p-3 sm:p-5 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-3 sm:gap-4">
        {/* Search Input (Section 28) */}
        <div className="relative w-full md:max-w-md">
          <Icons.Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setPage(1);
            }}
            placeholder="Tìm theo họ tên hoặc mã học sinh (VD: An, HS60101)..."
            className="w-full bg-slate-50 hover:bg-slate-100/70 border border-slate-200 rounded-xl py-2 pl-10 pr-4 text-xs sm:text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
          />
        </div>

        {/* Grade & Class filters with CustomSelect */}
        <div className="flex items-center gap-2 flex-wrap w-full md:w-auto">
          <CustomSelect
            value={selectedGrade}
            onChange={(val) => {
              setSelectedGrade(val);
              setSelectedClassId("");
              setPage(1);
            }}
            options={[
              { value: "", label: "Tất cả khối" },
              { value: "6", label: "Khối 6" },
              { value: "7", label: "Khối 7" },
              { value: "8", label: "Khối 8" },
              { value: "9", label: "Khối 9" },
            ]}
            size="sm"
            className="min-w-[110px] sm:min-w-[130px] flex-1 sm:flex-initial"
          />

          <CustomSelect
            value={selectedClassId}
            onChange={(val) => {
              setSelectedClassId(val);
              setPage(1);
            }}
            options={[
              { value: "", label: `Tất cả lớp (${classes.length} lớp)` },
              ...filteredClasses.map((c) => ({
                value: c._id,
                label: `Lớp ${c.className}`,
              })),
            ]}
            size="sm"
            className="min-w-[130px] sm:min-w-[150px] flex-1 sm:flex-initial"
          />

          <span className="text-xs text-slate-500 font-medium ml-1 hidden sm:inline">
            Tổng: <strong className="text-blue-700">{total}</strong> HS
          </span>
        </div>
      </div>

      {/* Main Table (Section 27) */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-[11px] sm:text-xs md:text-sm">
          <thead>
            <tr className="bg-slate-50/70 border-b border-slate-200/80 text-[10px] sm:text-[11px] md:text-xs font-bold text-slate-500 uppercase tracking-wider select-none">
              <th className="py-2 sm:py-3 px-1.5 sm:px-3 md:px-4 w-10 sm:w-12 text-center">STT</th>
              <th
                className="py-2 sm:py-3 px-2 sm:px-3 md:px-4 cursor-pointer hover:text-blue-600 transition-colors hidden sm:table-cell"
                onClick={() => handleSort("studentCode")}
              >
                <div className="flex items-center gap-1">
                  <span>Mã HS</span>
                  <Icons.ArrowUpDown className="w-3.5 h-3.5 opacity-60" />
                </div>
              </th>
              <th
                className="py-2 sm:py-3 px-2 sm:px-3 md:px-4 cursor-pointer hover:text-blue-600 transition-colors"
                onClick={() => handleSort("fullName")}
              >
                <div className="flex items-center gap-1">
                  <span>Họ tên</span>
                  <Icons.ArrowUpDown className="w-3.5 h-3.5 opacity-60" />
                </div>
              </th>
              <th
                className="py-2 sm:py-3 px-2 sm:px-3 md:px-4 cursor-pointer hover:text-blue-600 transition-colors hidden md:table-cell"
                onClick={() => handleSort("dateOfBirth")}
              >
                <div className="flex items-center gap-1">
                  <span>Ngày sinh</span>
                  <Icons.ArrowUpDown className="w-3.5 h-3.5 opacity-60" />
                </div>
              </th>
              <th className="py-2 sm:py-3 px-2 sm:px-3 md:px-4 hidden lg:table-cell">Giới tính</th>
              <th className="py-2 sm:py-3 px-1.5 sm:px-3 md:px-4">Lớp</th>
              <th
                className="py-2 sm:py-3 px-1.5 sm:px-3 md:px-4 text-center cursor-pointer hover:text-blue-600 transition-colors"
                onClick={() => handleSort("score")}
              >
                <div className="flex items-center justify-center gap-1">
                  <span>Điểm thi đua</span>
                  <Icons.ArrowUpDown className="w-3.5 h-3.5 opacity-60" />
                </div>
              </th>
              <th className="py-2 sm:py-3 px-2 sm:px-3 md:px-4 text-center hidden sm:table-cell">Trạng thái</th>
              <th className="py-2 sm:py-3 px-2 sm:px-3 md:px-4 text-right">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {paginatedData.length === 0 ? (
              <tr>
                <td colSpan={9} className="py-12 text-center text-slate-400">
                  Không tìm thấy học sinh phù hợp với từ khóa tìm kiếm.
                </td>
              </tr>
            ) : (
              paginatedData.map((item, idx) => {
                const serial = (page - 1) * limit + idx + 1;
                return (
                  <tr
                    key={item._id}
                    className="hover:bg-slate-50/80 transition-colors"
                  >
                    <td className="py-1.5 sm:py-2.5 px-1.5 sm:px-3 md:px-4 text-center text-[11px] sm:text-xs text-slate-400 font-medium">
                      {serial}
                    </td>
                    <td className="py-1.5 sm:py-2.5 px-2 sm:px-3 md:px-4 whitespace-nowrap font-mono text-xs font-semibold text-slate-600 hidden sm:table-cell">
                      {item.studentCode}
                    </td>
                    <td className="py-1.5 sm:py-2.5 px-2 sm:px-3 md:px-4">
                      <div className="font-bold text-slate-800 text-xs sm:text-sm md:text-base">
                        {item.fullName}
                      </div>
                      <div className="text-[10px] text-slate-400 font-mono sm:hidden">
                        {item.studentCode}
                      </div>
                    </td>
                    <td className="py-1.5 sm:py-2.5 px-2 sm:px-3 md:px-4 whitespace-nowrap text-xs text-slate-500 hidden md:table-cell">
                      {new Date(item.dateOfBirth).toLocaleDateString("vi-VN")}
                    </td>
                    <td className="py-1.5 sm:py-2.5 px-2 sm:px-3 md:px-4 whitespace-nowrap text-xs text-slate-600 hidden lg:table-cell">
                      {item.gender}
                    </td>
                    <td className="py-1.5 sm:py-2.5 px-1.5 sm:px-3 md:px-4 whitespace-nowrap">
                      <span className="text-[10px] sm:text-xs font-bold text-blue-700 bg-blue-50 px-1.5 sm:px-2 py-0.5 rounded-md border border-blue-200/50">
                        {item.className}
                      </span>
                    </td>
                    <td className="py-1.5 sm:py-2.5 px-1 sm:px-3 whitespace-nowrap text-center">
                      <div className="font-extrabold text-blue-700 text-xs sm:text-sm md:text-base">
                        {item.score}
                      </div>
                      <div className="inline-grid grid-cols-[1fr_1fr] items-center gap-1 sm:gap-1.5 w-[76px] sm:w-[94px] md:w-[108px] mx-auto mt-0.5">
                        <div className="flex justify-end">
                          <ScoreBadge points={item.positivePoints} showPlus={true} />
                        </div>
                        <div className="flex justify-start">
                          <ScoreBadge
                            points={-Math.abs(item.negativePoints)}
                            showPlus={false}
                          />
                        </div>
                      </div>
                    </td>
                    <td className="py-1.5 sm:py-2.5 px-2 sm:px-3 md:px-4 whitespace-nowrap text-center hidden sm:table-cell">
                      <Badge
                        variant={item.status === "ACTIVE" ? "success" : "neutral"}
                        size="sm"
                      >
                        {item.status === "ACTIVE" ? "Đang học" : "Đã chuyển"}
                      </Badge>
                    </td>
                    <td className="py-1.5 sm:py-2.5 px-2 sm:px-3 md:px-4 whitespace-nowrap text-right">
                      {onScoreStudent && (
                        <Button
                          variant="secondary"
                          size="sm"
                          className="px-2 py-1 text-xs"
                          icon={<Icons.Plus className="w-3.5 h-3.5" />}
                          onClick={() => onScoreStudent(item._id, item.classId)}
                        >
                          <span className="hidden xs:inline">Chấm điểm</span>
                        </Button>
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer (Section 30: default 50 items/page) */}
      <div className="p-3 sm:p-4 border-t border-slate-100 bg-slate-50/50 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
        <div className="flex items-center gap-3 flex-wrap justify-center sm:justify-start">
          <div>
            Hiển thị{" "}
            <strong className="text-slate-800">
              {total > 0 ? (page - 1) * limit + 1 : 0}
            </strong>{" "}
            đến{" "}
            <strong className="text-slate-800">
              {Math.min(page * limit, total)}
            </strong>{" "}
            / <strong className="text-slate-800">{total}</strong> HS
          </div>

          <div className="hidden sm:flex items-center gap-1.5 pl-2 border-l border-slate-200">
            <span>Hiển thị:</span>
            <CustomSelect
              value={limit}
              onChange={(val) => {
                setLimit(Number(val));
                setPage(1);
              }}
              options={[
                { value: 20, label: "20" },
                { value: 50, label: "50" },
                { value: 100, label: "100" },
              ]}
              size="sm"
              className="w-20"
            />
            <span>/ trang</span>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <Button
            variant="outline"
            size="sm"
            disabled={page <= 1}
            onClick={() => setPage((p) => Math.max(p - 1, 1))}
          >
            Trước
          </Button>

          <span className="px-2 sm:px-3 py-1 font-semibold text-slate-700">
            {page} / {totalPages}
          </span>

          <Button
            variant="outline"
            size="sm"
            disabled={page >= totalPages}
            onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
          >
            Sau
          </Button>
        </div>
      </div>
    </div>
  );
}
