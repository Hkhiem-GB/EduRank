"use client";

import React, { useState, useMemo } from "react";
import { useApp } from "@/lib/AppContext";
import { PageHeader } from "@/components/layout/PageHeader";
import { Icons } from "@/components/ui/Icons";
import { Badge, ScoreBadge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { CustomSelect, CustomSelectOption } from "@/components/ui/CustomSelect";

export default function AdminAuditHistoryPage() {
  const { auditLogs } = useApp();

  const [searchTerm, setSearchTerm] = useState("");
  const [actionFilter, setActionFilter] = useState("ALL");
  const [targetTypeFilter, setTargetTypeFilter] = useState("ALL");
  const [pointFilter, setPointFilter] = useState("ALL");

  // Pagination
  const [page, setPage] = useState(1);
  const limit = 20;

  const actionOptions: CustomSelectOption[] = [
    { value: "ALL", label: "Tất cả hành động" },
    { value: "LOGIN", label: "Đăng nhập" },
    { value: "CREATE", label: "Ghi nhận / Tạo mới" },
    { value: "CANCEL", label: "Hủy bản ghi" },
    { value: "ASSIGN", label: "Bổ nhiệm GVCN" },
    { value: "UPDATE", label: "Cập nhật" },
    { value: "DELETE", label: "Xóa bỏ" },
    { value: "DEACTIVATE", label: "Khóa tài khoản" },
  ];

  const targetTypeOptions: CustomSelectOption[] = [
    { value: "ALL", label: "Tất cả đối tượng" },
    { value: "COMPETITION_RECORD", label: "Bản ghi thi đua" },
    { value: "CLASS", label: "Lớp học" },
    { value: "STUDENT", label: "Học sinh" },
    { value: "TEACHER", label: "Giáo viên" },
    { value: "CRITERIA", label: "Tiêu chí" },
    { value: "USER", label: "Tài khoản" },
  ];

  const pointOptions: CustomSelectOption[] = [
    { value: "ALL", label: "Tất cả điểm số" },
    { value: "PLUS", label: "Điểm cộng (+)" },
    { value: "MINUS", label: "Điểm trừ (-)" },
    { value: "ZERO", label: "Không đổi (—)" },
  ];

  const filteredLogs = useMemo(() => {
    return auditLogs.filter((log) => {
      const matchSearch =
        log.actorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.targetName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.actorId.toLowerCase().includes(searchTerm.toLowerCase());

      const matchAction = actionFilter === "ALL" || log.action === actionFilter;
      const matchTarget = targetTypeFilter === "ALL" || log.targetType === targetTypeFilter;

      const matchPoint =
        pointFilter === "ALL" ||
        (pointFilter === "PLUS" && (log.pointChange ?? 0) > 0) ||
        (pointFilter === "MINUS" && (log.pointChange ?? 0) < 0) ||
        (pointFilter === "ZERO" && (!log.pointChange || log.pointChange === 0));

      return matchSearch && matchAction && matchTarget && matchPoint;
    });
  }, [auditLogs, searchTerm, actionFilter, targetTypeFilter, pointFilter]);

  const total = filteredLogs.length;
  const totalPages = Math.ceil(total / limit) || 1;
  const paginatedLogs = useMemo(() => {
    const start = (page - 1) * limit;
    return filteredLogs.slice(start, start + limit);
  }, [filteredLogs, page, limit]);

  const getActionBadge = (action: string) => {
    switch (action) {
      case "LOGIN":
        return <Badge variant="primary" size="sm">Đăng nhập</Badge>;
      case "CREATE":
        return <Badge variant="success" size="sm">Ghi nhận</Badge>;
      case "CANCEL":
        return <Badge variant="danger" size="sm">Hủy bỏ</Badge>;
      case "ASSIGN":
        return <Badge variant="primary" size="sm">Bổ nhiệm</Badge>;
      case "UPDATE":
        return <Badge variant="warning" size="sm">Cập nhật</Badge>;
      case "DELETE":
        return <Badge variant="danger" size="sm">Xóa bỏ</Badge>;
      case "DEACTIVATE":
        return <Badge variant="neutral" size="sm">Khóa/Tạm dừng</Badge>;
      default:
        return <Badge variant="neutral" size="sm">{action}</Badge>;
    }
  };

  const getTargetTypeBadge = (targetType: string) => {
    switch (targetType) {
      case "COMPETITION_RECORD":
        return "Bản ghi thi đua";
      case "CLASS":
        return "Lớp học";
      case "STUDENT":
        return "Học sinh";
      case "TEACHER":
        return "Giáo viên";
      case "CRITERIA":
        return "Tiêu chí";
      case "USER":
        return "Tài khoản";
      default:
        return targetType;
    }
  };

  return (
    <div className="space-y-4">
      {/* Page Header without badge */}
      <PageHeader
        greeting="Nhật ký vận hành hệ thống"
        title="Lịch Sử Hoạt Động & Kiểm Toán Hệ Thống"
        description="Ghi nhận tự động và toàn diện mọi thao tác từ đăng nhập, chấm điểm thi đua, bổ nhiệm GVCN, quản lý lớp học và tài khoản"
      />

      {/* Filter and Search Bar: 3 Filters in EXACTLY 1 Row */}
      <div className="bg-white rounded-xl border border-slate-200/80 p-3 shadow-2xs flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-2.5">
        <div className="relative flex-1 min-w-[200px]">
          <Icons.Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setPage(1);
            }}
            placeholder="Tìm theo người thực hiện, đối tượng, mô tả..."
            className="w-full bg-slate-50 border border-slate-200 rounded-lg py-1.5 pl-8 pr-3 text-xs text-slate-800 focus:outline-none focus:ring-1.5 focus:ring-blue-500 placeholder:text-slate-400"
          />
        </div>

        {/* 3 Nút lọc nằm trọn vẹn trong 1 HÀNG DUY NHẤT */}
        <div className="grid grid-cols-3 gap-2 w-full lg:w-auto shrink-0">
          <CustomSelect
            value={actionFilter}
            onChange={(val) => {
              setActionFilter(val);
              setPage(1);
            }}
            options={actionOptions}
            size="sm"
            className="w-full lg:w-36"
            buttonClassName="py-1 px-2.5 text-xs rounded-lg"
          />

          <CustomSelect
            value={targetTypeFilter}
            onChange={(val) => {
              setTargetTypeFilter(val);
              setPage(1);
            }}
            options={targetTypeOptions}
            size="sm"
            className="w-full lg:w-36"
            buttonClassName="py-1 px-2.5 text-xs rounded-lg"
          />

          <CustomSelect
            value={pointFilter}
            onChange={(val) => {
              setPointFilter(val);
              setPage(1);
            }}
            options={pointOptions}
            size="sm"
            className="w-full lg:w-36"
            buttonClassName="py-1 px-2.5 text-xs rounded-lg"
          />
        </div>
      </div>

      {/* Main Table */}
      <div className="bg-white rounded-xl border border-slate-200/80 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-[11px] sm:text-xs md:text-sm">
            <thead>
              <tr className="bg-slate-50/70 border-b border-slate-200/80 text-[10px] sm:text-[11px] md:text-xs font-bold text-slate-500 uppercase tracking-wider select-none">
                <th className="py-2 sm:py-2.5 px-1.5 sm:px-3 w-10 text-center">STT</th>
                <th className="py-2 sm:py-2.5 px-2 sm:px-3 whitespace-nowrap">Thời gian</th>
                <th className="py-2 sm:py-2.5 px-2 sm:px-3 whitespace-nowrap">Người thực hiện</th>
                <th className="py-2 sm:py-2.5 px-1.5 sm:px-3 text-center whitespace-nowrap">Hành động</th>
                <th className="py-2 sm:py-2.5 px-2 sm:px-3 whitespace-nowrap">Đối tượng</th>
                <th className="py-2 sm:py-2.5 px-2 sm:px-3">Chi tiết thao tác</th>
                <th className="py-2 sm:py-2.5 px-1.5 sm:px-3 text-center whitespace-nowrap">Điểm số</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {paginatedLogs.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400 text-xs">
                    Không tìm thấy bản ghi nhật ký nào phù hợp với bộ lọc.
                  </td>
                </tr>
              ) : (
                paginatedLogs.map((log, idx) => {
                  const serial = (page - 1) * limit + idx + 1;
                  return (
                    <tr key={log._id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-1.5 sm:py-2 px-1.5 sm:px-3 text-center text-[11px] text-slate-400 font-medium">
                        {serial}
                      </td>
                      <td className="py-1.5 sm:py-2 px-2 sm:px-3 whitespace-nowrap text-[11px] text-slate-500 font-mono">
                        {log.timestamp}
                      </td>
                      <td className="py-1.5 sm:py-2 px-2 sm:px-3 whitespace-nowrap">
                        <div className="font-bold text-slate-800 text-xs sm:text-sm">
                          {log.actorName}
                        </div>
                        <div className="text-[11px] text-slate-400 font-mono">
                          {log.actorId} · <span className="font-sans font-medium text-blue-600">{log.actorRole}</span>
                        </div>
                      </td>
                      <td className="py-1.5 sm:py-2 px-1.5 sm:px-3 whitespace-nowrap text-center">
                        {getActionBadge(log.action)}
                      </td>
                      <td className="py-1.5 sm:py-2 px-2 sm:px-3 whitespace-nowrap">
                        <div className="font-semibold text-slate-800 text-xs sm:text-sm">
                          {log.targetName}
                        </div>
                        <div className="text-[10px] text-slate-400">
                          {getTargetTypeBadge(log.targetType)}
                        </div>
                      </td>
                      <td className="py-1.5 sm:py-2 px-2 sm:px-3 text-xs text-slate-600 max-w-sm">
                        {log.description}
                      </td>
                      <td className="py-1.5 sm:py-2 px-1.5 sm:px-3 whitespace-nowrap text-center">
                        {log.pointChange !== undefined && log.pointChange !== 0 ? (
                          <ScoreBadge points={log.pointChange} />
                        ) : (
                          <span className="text-slate-300 font-mono">—</span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer: Compact */}
        <div className="p-2.5 sm:p-3 border-t border-slate-100 bg-slate-50/50 flex flex-col sm:flex-row items-center justify-between gap-2.5 text-xs text-slate-500">
          <div>
            <span className="hidden sm:inline">Hiển thị </span>
            <strong className="text-slate-800">
              {total > 0 ? (page - 1) * limit + 1 : 0}
            </strong>–<strong className="text-slate-800">
              {Math.min(page * limit, total)}
            </strong>
            <span className="hidden sm:inline"> trong tổng số <strong className="text-blue-700">{total}</strong> sự kiện</span>
            <span className="sm:hidden"> / <strong className="text-blue-700">{total}</strong></span>
          </div>

          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="sm"
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(p - 1, 1))}
              className="py-1 px-2.5 text-xs h-7"
            >
              Trang trước
            </Button>

            <span className="px-2.5 py-0.5 font-semibold text-slate-700 text-xs">
              {page} / {totalPages}
            </span>

            <Button
              variant="outline"
              size="sm"
              disabled={page >= totalPages}
              onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
              className="py-1 px-2.5 text-xs h-7"
            >
              Trang sau
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
