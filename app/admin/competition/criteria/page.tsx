"use client";

import React, { useState } from "react";
import { useApp } from "@/lib/AppContext";
import { PageHeader } from "@/components/layout/PageHeader";
import { Icons } from "@/components/ui/Icons";
import { ScoreBadge, Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { CustomSelect } from "@/components/ui/CustomSelect";
import { CompetitionTarget, ICompetitionCriteria } from "@/types";

export default function CriteriaManagementPage() {
  const { criteria, activeRole, addCriteria, updateCriteria, deleteCriteria } = useApp();
  const [filterTarget, setFilterTarget] = useState<"ALL" | CompetitionTarget>("ALL");
  const [searchTerm, setSearchTerm] = useState("");

  const isSuperAdmin = activeRole === "SUPER_ADMIN";

  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<ICompetitionCriteria | null>(null);
  const [deletingItem, setDeletingItem] = useState<ICompetitionCriteria | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    targetType: "CLASS" as CompetitionTarget,
    points: 10,
    category: "Học tập",
    description: "",
  });

  const resetForm = () => {
    setFormData({
      name: "",
      targetType: "CLASS",
      points: 10,
      category: "Học tập",
      description: "",
    });
  };

  const handleOpenAdd = () => {
    resetForm();
    setIsAddModalOpen(true);
  };

  const handleOpenEdit = (item: ICompetitionCriteria) => {
    setEditingItem(item);
    setFormData({
      name: item.name,
      targetType: item.targetType,
      points: item.points,
      category: item.category || "Chung",
      description: item.description || "",
    });
  };

  const handleSaveAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    addCriteria({
      name: formData.name,
      targetType: formData.targetType,
      points: Number(formData.points),
      category: formData.category,
      description: formData.description,
      isActive: true,
    });

    setIsAddModalOpen(false);
    resetForm();
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem) return;

    updateCriteria({
      ...editingItem,
      name: formData.name,
      targetType: formData.targetType,
      points: Number(formData.points),
      category: formData.category,
      description: formData.description,
    });

    setEditingItem(null);
    resetForm();
  };

  const handleConfirmDelete = () => {
    if (deletingItem) {
      deleteCriteria(deletingItem._id);
      setDeletingItem(null);
    }
  };

  // Filtered criteria list
  const filtered = criteria.filter((c) => {
    const matchTarget = filterTarget === "ALL" ? true : c.targetType === filterTarget;
    const matchSearch =
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (c.category && c.category.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchTarget && matchSearch;
  });

  return (
    <div className="space-y-6">
      <PageHeader
        greeting="Quy chế thi đua sư phạm"
        title="Danh Mục Tiêu Chí Chấm Điểm Thi Đua"
        description="Quy chuẩn tính điểm cộng, điểm trừ dành cho tập thể lớp và cá nhân học sinh tại THCS Na Sầm"
        badge={
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-blue-700 bg-blue-50 border border-blue-200 px-3 py-1 rounded-full">
              {criteria.length} Tiêu chí chuẩn
            </span>
            {!isSuperAdmin && (
              <span className="text-xs font-bold text-amber-700 bg-amber-50 border border-amber-200 px-2.5 py-1 rounded-full flex items-center gap-1">
                <Icons.Lock className="w-3 h-3" />
                Chỉ xem (Read-only)
              </span>
            )}
          </div>
        }
        actions={
          isSuperAdmin ? (
            <Button
              variant="primary"
              size="md"
              icon={<Icons.Plus className="w-4 h-4" />}
              onClick={handleOpenAdd}
            >
              Thêm tiêu chí mới
            </Button>
          ) : undefined
        }
      />

      {/* Admin Notice */}
      {!isSuperAdmin && (
        <div className="p-4 bg-amber-50 border border-amber-200/80 rounded-2xl flex items-center gap-3 text-xs sm:text-sm text-amber-900">
          <Icons.AlertCircle className="w-5 h-5 text-amber-600 shrink-0" />
          <div>
            <strong>Lưu ý phân quyền:</strong> Tài khoản Quản Trị Viên (ADMIN) chỉ có quyền tra cứu tiêu chí. Quyền Thêm mới, Chỉnh sửa và Ngưng áp dụng tiêu chí thuộc về Quản Trị Cấp Cao (SUPER_ADMIN).
          </div>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Search */}
        <div className="relative w-full sm:max-w-md">
          <Icons.Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Tìm theo tên tiêu chí hoặc danh mục..."
            className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 pl-10 pr-4 text-xs sm:text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Target Filter Tabs */}
        <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl w-full sm:w-auto">
          <button
            onClick={() => setFilterTarget("ALL")}
            className={`flex-1 sm:flex-initial px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              filterTarget === "ALL"
                ? "bg-white text-blue-700 shadow-xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Tất cả ({criteria.length})
          </button>
          <button
            onClick={() => setFilterTarget("CLASS")}
            className={`flex-1 sm:flex-initial px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              filterTarget === "CLASS"
                ? "bg-white text-blue-700 shadow-xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Tập thể Lớp ({criteria.filter((c) => c.targetType === "CLASS").length})
          </button>
          <button
            onClick={() => setFilterTarget("STUDENT")}
            className={`flex-1 sm:flex-initial px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              filterTarget === "STUDENT"
                ? "bg-white text-blue-700 shadow-xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Cá nhân HS ({criteria.filter((c) => c.targetType === "STUDENT").length})
          </button>
        </div>
      </div>

      {/* Criteria Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((item) => {
          const isClass = item.targetType === "CLASS";

          return (
            <div
              key={item._id}
              className={`bg-white rounded-2xl border p-5 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between ${
                item.isActive ? "border-slate-200/80" : "border-slate-200 opacity-60 bg-slate-50/50"
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-2.5">
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                      isClass
                        ? "bg-blue-50 text-blue-700 border border-blue-200"
                        : "bg-indigo-50 text-indigo-700 border border-indigo-200"
                    }`}
                  >
                    {isClass ? "Tập thể Lớp" : "Cá nhân Học sinh"}
                  </span>

                  <ScoreBadge points={item.points} />
                </div>

                <h4 className="text-sm font-bold text-slate-800 mb-1">
                  {item.name}
                </h4>

                {item.description && (
                  <p className="text-xs text-slate-500 leading-relaxed mb-3">
                    {item.description}
                  </p>
                )}
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400">
                <span className="font-semibold text-slate-600">
                  📁 {item.category || "Chung"}
                </span>

                <div className="flex items-center gap-2">
                  <Badge variant={item.isActive ? "success" : "neutral"} size="sm">
                    {item.isActive ? "Áp dụng" : "Ngưng áp dụng"}
                  </Badge>

                  {/* Super admin edit/delete controls */}
                  {isSuperAdmin && (
                    <div className="flex items-center gap-1 ml-1 pl-2 border-l border-slate-200">
                      <button
                        onClick={() => handleOpenEdit(item)}
                        className="p-1 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                        title="Chỉnh sửa tiêu chí"
                      >
                        <Icons.Edit className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => setDeletingItem(item)}
                        className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded transition-colors"
                        title={item.isActive ? "Ngưng áp dụng tiêu chí" : "Kích hoạt lại tiêu chí"}
                      >
                        {item.isActive ? (
                          <Icons.Trash2 className="w-3.5 h-3.5" />
                        ) : (
                          <Icons.RefreshCw className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Criteria Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="➕ Thêm Tiêu Chí Thi Đua Mới"
        description="Định nghĩa nội dung tiêu chí và điểm cộng/trừ vào quỹ điểm thi đua"
      >
        <form onSubmit={handleSaveAdd} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Tên tiêu chí <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="VD: Tham gia trực nhật chuyên cần..."
              className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Đối tượng áp dụng
              </label>
              <CustomSelect
                value={formData.targetType}
                onChange={(val) =>
                  setFormData({ ...formData, targetType: val as CompetitionTarget })
                }
                options={[
                  { value: "CLASS", label: "Tập thể Lớp" },
                  { value: "STUDENT", label: "Cá nhân Học sinh" },
                ]}
                className="w-full"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Điểm áp dụng (+ hoặc -) <span className="text-rose-500">*</span>
              </label>
              <input
                type="number"
                required
                value={formData.points}
                onChange={(e) => setFormData({ ...formData, points: Number(e.target.value) })}
                placeholder="VD: 10 hoặc -10"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Danh mục phân loại
            </label>
            <input
              type="text"
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              placeholder="VD: Nề nếp, Học tập, Vệ sinh, Kỷ luật..."
              className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Mô tả chi tiết quy định
            </label>
            <textarea
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Mô tả cụ thể trường hợp vi phạm hoặc khen thưởng..."
              className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
            <Button variant="outline" type="button" onClick={() => setIsAddModalOpen(false)}>
              Hủy
            </Button>
            <Button variant="primary" type="submit">
              Lưu tiêu chí
            </Button>
          </div>
        </form>
      </Modal>

      {/* Edit Criteria Modal */}
      <Modal
        isOpen={Boolean(editingItem)}
        onClose={() => setEditingItem(null)}
        title={`✏️ Chỉnh Sửa Tiêu Chí: ${editingItem?.name}`}
        description="Cập nhật thông tin điểm số và quy định áp dụng"
      >
        <form onSubmit={handleSaveEdit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Tên tiêu chí <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Đối tượng áp dụng
              </label>
              <CustomSelect
                value={formData.targetType}
                onChange={(val) =>
                  setFormData({ ...formData, targetType: val as CompetitionTarget })
                }
                options={[
                  { value: "CLASS", label: "Tập thể Lớp" },
                  { value: "STUDENT", label: "Cá nhân Học sinh" },
                ]}
                className="w-full"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Điểm áp dụng (+ hoặc -) <span className="text-rose-500">*</span>
              </label>
              <input
                type="number"
                required
                value={formData.points}
                onChange={(e) => setFormData({ ...formData, points: Number(e.target.value) })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Danh mục phân loại
            </label>
            <input
              type="text"
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Mô tả chi tiết
            </label>
            <textarea
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
            <Button variant="outline" type="button" onClick={() => setEditingItem(null)}>
              Hủy
            </Button>
            <Button variant="primary" type="submit">
              Cập nhật
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete / Toggle Confirmation Modal */}
      <Modal
        isOpen={Boolean(deletingItem)}
        onClose={() => setDeletingItem(null)}
        title={
          deletingItem?.isActive
            ? "⚠️ Xác nhận ngưng áp dụng tiêu chí"
            : "🔄 Xác nhận kích hoạt lại tiêu chí"
        }
        description={`Thay đổi trạng thái áp dụng tiêu chí: ${deletingItem?.name}`}
      >
        <div className="space-y-4">
          <p className="text-sm text-slate-600">
            {deletingItem?.isActive ? (
              <>
                Tiêu chí <strong className="text-slate-900">{deletingItem.name}</strong> sẽ được chuyển sang trạng thái <strong>Ngưng áp dụng</strong> (soft-delete). Các bản ghi thi đua trước đây vẫn được bảo toàn nguyên vẹn.
              </>
            ) : (
              <>
                Kích hoạt lại tiêu chí <strong className="text-slate-900">{deletingItem?.name}</strong> để tiếp tục cho phép ghi điểm thi đua.
              </>
            )}
          </p>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
            <Button variant="outline" onClick={() => setDeletingItem(null)}>
              Hủy bỏ
            </Button>
            <Button
              variant={deletingItem?.isActive ? "danger" : "primary"}
              onClick={handleConfirmDelete}
            >
              {deletingItem?.isActive ? "Xác nhận ngưng áp dụng" : "Kích hoạt lại"}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
