import React from "react";
import { AppDialog, AppDialogContent, AppDialogHeader, AppDialogTitle, AppDialogFooter } from "@/components/common/micro/AppDialog";
import { Controller } from "react-hook-form";

import AppCard, { AppCardContent } from "@/components/common/micro/AppCard";
import forumCategoryService from "@/services/forum/forumCategoryService";
import { cn } from "@/lib/utils";

import useAdminCategories from "@/hooks/course/useAdminCategories";
import { toast } from "sonner";
import AppTabs from "@/components/common/micro/AppTabs";

import { useState, useEffect } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/common/micro/AppTable";
import DataTable from "@/components/common/composite/DataTable";

import { AppButton, TableActionIconButton } from "@/components/common/micro/AppButton";
import AppSelect from "@/components/common/micro/AppSelect";
import AppInput from "@/components/common/micro/AppInput";
import { Plus, Search, Edit, Trash2, MessageSquare, LayoutList, ChevronRight, FolderOpen } from "lucide-react";

export default function AdminCategoriesPage() {
    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div>
                <h1 className="text-2xl font-bold text-foreground tracking-tight">
                    Quản Lý Chủ Đề
                </h1>
                <p className="text-sm text-muted-foreground mt-1">
                    Quản lý chủ đề khóa học và chủ đề diễn đàn.
                </p>
            </div>

            <AppTabs
                defaultValue="courses"
                className="w-full"
                tabs={[
                    {
                        value: "courses",
                        label: (
                            <div className="flex items-center gap-2">
                                <LayoutList className="w-4 h-4" /> Khóa học
                            </div>
                        ),
                        content: <AdminCategories hideHeader={true} />
                    },
                    {
                        value: "forum",
                        label: (
                            <div className="flex items-center gap-2">
                                <MessageSquare className="w-4 h-4" /> Diễn đàn
                            </div>
                        ),
                        content: <AdminForumCategory hideHeader={true} />
                    }
                ]}
            />
        </div>
    );
}


// eslint-disable-next-line no-unused-vars
// eslint-disable-next-line no-unused-vars
// eslint-disable-next-line no-unused-vars

const ITEMS_PER_PAGE = 10;

const categorySchema = z.object({
  name: z
    .string()
    .min(1, "Tên chủ đề không được để trống")
    .max(255, "Tên chủ đề không vượt quá 255 ký tự"),
  slug: z
    .string()
    .min(1, "Slug không được để trống")
    .max(255, "Slug không vượt quá 255 ký tự"),
  parent_id: z.string(),
  status: z.boolean().default(true),
});

function AdminCategories({ hideHeader = false }) {
  const {
    categories,
    loading,
    searchTerm,
    setSearchTerm,
    filterStatus,
    setFilterStatus,
    currentPage,
    setCurrentPage,
    totalPages,
    totalElements,
    expanded,
    setExpanded,
    toggleStatus,
    handleDelete,
    generateSlug,
    saveCategory,
  } = useAdminCategories(ITEMS_PER_PAGE);

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editId, setEditId] = useState(null);

  const form = useForm({
    resolver: zodResolver(categorySchema),
    defaultValues: {
      name: "",
      slug: "",
      parent_id: "none",
      status: true,
    },
  });

  const onNameChange = (e) => {
    const name = e.target.value;
    form.setValue("name", name);
    form.setValue("slug", generateSlug(name), { shouldValidate: true });
  };

  const handleEdit = (e, cat, parentId = "none") => {
    e.stopPropagation();
    setEditId(cat.id);
    form.reset({
      name: cat.name,
      slug: cat.slug,
      parent_id: parentId.toString(),
      status: cat.status !== undefined ? cat.status : true,
    });
    setIsAddModalOpen(true);
  };

  const onSubmit = async (data) => {
    const success = await saveCategory(editId, data);
    if (success) {
      setIsAddModalOpen(false);
      setEditId(null);
      form.reset({ name: "", slug: "", parent_id: "none", status: true });
    }
  };


  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        {!hideHeader ? (
          <div>
            <h1 className="text-2xl font-bold text-foreground tracking-tight">
              Quản Lý Chủ Đề
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Thêm mới, chỉnh sửa và sắp xếp chủ đề khóa học.
            </p>
          </div>
        ) : (
          <div />
        )}
        <AppButton appVariant="gradient"
          className="flex items-center gap-2"
          onClick={() => setIsAddModalOpen(true)}
        >
          <Plus className="w-4 h-4" />
          Thêm Danh Mục
        </AppButton>
      </div>

      {/* Filter */}
      <AppCard appVariant="default" className="border-border shadow-sm">
        <AppCardContent className="p-4 flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="relative w-full md:w-80">
            
            <AppInput
              placeholder="Tìm chủ đề..."
              className="h-10 border-border focus:bg-white"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              icon={Search}
            />
          </div>
          <div className="flex text-sm font-medium text-muted-foreground bg-secondary p-1 rounded-lg transition-all">
            <AppButton appVariant="ghostMuted" variant="ghost"
              onClick={() => setFilterStatus("all")}
              className={`px-3 py-1.5 rounded-md transition-colors h-auto ${filterStatus === "all" ? "bg-white text-foreground shadow-sm hover:bg-white" : "hover:text-foreground"}`}
            >
              Tất cả
            </AppButton>
            <AppButton appVariant="ghostMuted" variant="ghost"
              onClick={() => setFilterStatus("active")}
              className={`px-3 py-1.5 rounded-md transition-colors h-auto ${filterStatus === "active" ? "bg-white text-foreground shadow-sm hover:bg-white" : "hover:text-foreground"}`}
            >
              Đang hoạt động
            </AppButton>
            <AppButton appVariant="ghostMuted" variant="ghost"
              onClick={() => setFilterStatus("inactive")}
              className={`px-3 py-1.5 rounded-md transition-colors h-auto ${filterStatus === "inactive" ? "bg-white text-foreground shadow-sm hover:bg-white" : "hover:text-foreground"}`}
            >
              Tạm ẩn
            </AppButton>
          </div>
        </AppCardContent>
      </AppCard>

      {/* Categories Table */}
      <DataTable
        columns={[
          {
            header: "",
            width: "40px",
            className: "text-center",
            cellClassName: "text-center w-10 mx-auto",
            render: (cat) => (
              cat.subcategories && cat.subcategories.length > 0 && (
                <AppButton appVariant="ghostMuted" variant="ghost" size="icon"
                  onClick={(e) => {
                    e.stopPropagation();
                    setExpanded(expanded === cat.id ? null : cat.id);
                  }}
                  className="h-8 w-8 hover:bg-muted rounded-lg transition-colors flex items-center justify-center mx-auto"
                >
                  <ChevronRight
                    className={cn(
                      "w-4 h-4 text-muted-foreground transition-transform duration-200",
                      expanded === cat.id && "rotate-90"
                    )}
                  />
                </AppButton>
              )
            ),
          },
          {
            header: "Chủ đề",
            width: "25%",
            className: "text-left",
            cellClassName: "text-left",
            render: (cat) => (
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                  <FolderOpen className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <p className="font-bold text-foreground">
                    {cat.name}
                  </p>
                </div>
              </div>
            ),
          },
          {
            header: "Slug",
            width: "20%",
            className: "text-left",
            cellClassName: "text-left",
            render: (cat) => (
              <code className="text-xs bg-white px-2 py-1 rounded border border-border text-muted-foreground font-mono">
                {cat.slug}
              </code>
            ),
          },
          {
            header: "Chủ đề con",
            width: "128px",
            className: "text-center",
            cellClassName: "text-center font-bold text-foreground",
            render: (cat) => cat.subcategories?.length || 0,
          },
          {
            header: "Khóa học",
            width: "96px",
            className: "text-center",
            cellClassName: "text-center font-bold text-foreground",
            render: (cat) => cat.courses || 0,
          },
          {
            header: "Trạng thái",
            width: "128px",
            className: "text-center",
            cellClassName: "text-center",
            render: (cat) => (
              cat.status === true ? (
                <span
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleStatus(cat.id, false);
                  }}
                  className="inline-flex items-center justify-center gap-1.5 text-sm text-success font-medium cursor-pointer hover:underline"
                >
                  <span className="w-2 h-2 rounded-full bg-success/10 text-success" /> Hoạt động
                </span>
              ) : (
                <span
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleStatus(cat.id, true);
                  }}
                  className="inline-flex items-center justify-center gap-1.5 text-sm text-muted-foreground font-medium cursor-pointer hover:underline"
                >
                  <span className="w-2 h-2 rounded-full bg-muted" /> Tạm ẩn
                </span>
              )
            ),
          },
          {
            header: "Thao tác",
            width: "100px",
            className: "text-center",
            cellClassName: "text-center",
            render: (cat) => (
              <div
                className="flex justify-center items-center gap-2"
                onClick={(e) => e.stopPropagation()}
              >
                <TableActionIconButton
                  icon={Edit}
                  onClick={(e) => handleEdit(e, cat)}
                />
                <TableActionIconButton
                  icon={Trash2}
                  colorVariant="error"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDelete(cat.id);
                  }}
                />
              </div>
            ),
          }
        ]}
        data={categories}
        isLoading={loading}
        loadingState="Đang tải dữ liệu..."
        emptyState="Không tìm thấy chủ đề nào phù hợp."
        onRowClick={(cat) => setExpanded(expanded === cat.id ? null : cat.id)}
        renderExpandedRow={(cat) => {
          if (expanded !== cat.id || !cat.subcategories || cat.subcategories.length === 0) return null;
          return cat.subcategories.map((sub) => (
            <TableRow
              key={sub.id}
              className="bg-muted/60 hover:bg-secondary"
            >
              <TableCell className="w-10" />
              <TableCell className="pl-12">
                <div className="flex items-center gap-3">
                  <div className="w-1.5 h-1.5 rounded-full bg-muted" />
                  <div>
                    <p className="font-bold text-foreground">
                      {sub.name}
                    </p>
                  </div>
                </div>
              </TableCell>
              <TableCell>
                <code className="text-xs bg-white px-2 py-1 rounded border border-border text-muted-foreground font-mono">
                  {sub.slug}
                </code>
              </TableCell>
              <TableCell className="text-center">
                <span className="text-sm text-muted-foreground font-medium block w-full">-</span>
              </TableCell>
              <TableCell className="text-center font-bold text-foreground">
                {sub.courses || 0}
              </TableCell>
              <TableCell className="text-center">
                {sub.status === true ? (
                  <span
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleStatus(sub.id, false);
                    }}
                    className="inline-flex items-center justify-center gap-1.5 text-sm text-success font-medium cursor-pointer hover:underline"
                  >
                    <span className="w-2 h-2 rounded-full bg-success/10 text-success" /> Hoạt động
                  </span>
                ) : (
                  <span
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleStatus(sub.id, true);
                    }}
                    className="inline-flex items-center justify-center gap-1.5 text-sm text-muted-foreground font-medium cursor-pointer hover:underline"
                  >
                    <span className="w-2 h-2 rounded-full bg-muted" /> Tạm ẩn
                  </span>
                )}
              </TableCell>
              <TableCell className="text-center">
                <div
                  className="flex justify-center items-center gap-2"
                  onClick={(e) => e.stopPropagation()}
                >
                  <AppButton appVariant="ghostMuted" variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-muted-foreground hover:text-primary border-none"
                    onClick={(e) => handleEdit(e, sub, cat.id)}
                  >
                    <Edit className="w-4 h-4" />
                  </AppButton>
                  <AppButton appVariant="ghostMuted" variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-muted-foreground hover:text-error border-none"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(sub.id);
                    }}
                  >
                    <Trash2 className="w-4 h-4" />
                  </AppButton>
                </div>
              </TableCell>
            </TableRow>
          ));
        }}
        pagination={{
          currentPage,
          totalPages,
          totalItems: totalElements,
          onPageChange: setCurrentPage,
          pageSize: ITEMS_PER_PAGE,
          zeroIndexed: false,
        }}
      />
      {/* Add Category Modal */}
      <AppDialog
        open={isAddModalOpen}
        onOpenChange={(open) => {
          setIsAddModalOpen(open);
          if (!open) {
            form.reset({ name: "", slug: "", parent_id: "none", status: true });
            setEditId(null);
          }
        }}
      >
        <AppDialogContent className="sm:max-w-[450px]">
          <AppDialogHeader>
            <AppDialogTitle className="text-xl font-bold flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                <Plus className="w-5 h-5 text-primary" />
              </div>
              {editId ? "Cập Nhật Chủ Đề" : "Thêm Chủ Đề Mới"}
            </AppDialogTitle>
          </AppDialogHeader>

          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-4 py-4"
          >
            <Controller
              control={form.control}
              name="name"
              render={({ field, fieldState: { error } }) => (
                <AppInput
                  label="Tên chủ đề"
                  {...field}
                  onChange={(e) => {
                    field.onChange(e);
                    onNameChange(e);
                  }}
                  className="h-10 border-border"
                  error={error?.message}
                />
              )}
            />

            <Controller
              control={form.control}
              name="slug"
              render={({ field, fieldState: { error } }) => (
                <AppInput
                  label="Slug"
                  {...field}
                  readOnly
                  placeholder="Duong-dan-tinh"
                  className="h-10 border-border bg-muted font-mono text-xs cursor-not-allowed"
                  error={error?.message}
                />
              )}
            />

            <Controller
              control={form.control}
              name="parent_id"
              render={({ field, fieldState: { error } }) => (
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Chủ đề cha</label>
                  <AppSelect
                    onValueChange={field.onChange}
                    value={field.value}
                    placeholder="Chọn chủ đề cha"
                    options={[
                      { label: "Không có (Chủ đề gốc)", value: "none" },
                      ...categories.map(cat => ({ label: cat.name, value: cat.id.toString() }))
                    ]}
                    error={!!error}
                  />
                  {error && <p className="text-[11px] text-error font-medium">{error.message}</p>}
                </div>
              )}
            />

            <Controller
              control={form.control}
              name="status"
              render={({ field, fieldState: { error } }) => (
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Trạng thái</label>
                  <AppSelect
                    onValueChange={(val) => field.onChange(val === 'true')}
                    value={field.value ? 'true' : 'false'}
                    placeholder="Chọn Trạng thái"
                    options={[
                      { label: "Hoạt động", value: "true" },
                      { label: "Tạm ẩn", value: "false" }
                    ]}
                    error={!!error}
                  />
                  {error && <p className="text-[11px] text-error font-medium">{error.message}</p>}
                </div>
              )}
            />

            <AppDialogFooter className="pt-4 gap-2">
              <AppButton appVariant="ghostMuted" variant="ghost"
                type="button"
                onClick={() => {
                  setIsAddModalOpen(false);
                  setEditId(null);
                  form.reset({ name: "", slug: "", parent_id: "none", status: true });
                }}
                className="border border-border"
              >
                Hủy bỏ
              </AppButton>
              <AppButton appVariant="gradient" type="submit" className="bg-primary font-bold px-6">
                {editId ? "Lưu Cập Nhật" : "Tạo chủ đề"}
              </AppButton>
            </AppDialogFooter>
          </form>
        </AppDialogContent>
      </AppDialog>
    </div>
  );
}

const forumCategorySchema = z.object({
  name: z
    .string()
    .min(1, "Tên chủ đề không được để trống")
    .max(255, "Tên chủ đề không vượt quá 255 ký tự"),
  slug: z
    .string()
    .min(1, "Slug không được để trống")
    .max(255, "Slug không vượt quá 255 ký tự"),
  status: z.boolean().default(true),
});

function AdminForumCategory({ hideHeader = false }) {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editId, setEditId] = useState(null);
  const [categories, setCategories] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const FORUM_PAGE_SIZE = 10;

  const fetchCategories = async () => {
    try {
      const response = await forumCategoryService.getAllCategories();
      if (response && response.data) {
        setCategories(response.data || []);
      }
    } catch (error) {
      console.error("Failed to fetch forum categories", error);
      toast.error("Không thể tải danh sách chủ đề diễn đàn");
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchCategories();
  }, []);

  const form = useForm({
    resolver: zodResolver(forumCategorySchema),
    defaultValues: {
      name: "",
      slug: "",
      status: true,
    },
  });

  const generateSlug = (text) => {
    return text
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[đĐ]/g, "d")
      .trim()
      .replace(/[^\w\s-]/g, "")
      .replace(/[\s_-]+/g, "-")
      .replace(/^-+|-+$/g, "");
  };

  const onNameChange = (e) => {
    const name = e.target.value;
    form.setValue("name", name);
    form.setValue("slug", generateSlug(name), { shouldValidate: true });
  };

  const handleEdit = (cat) => {
    setEditId(cat.id);
    form.reset({
      name: cat.name,
      slug: cat.slug,
      status: cat.status !== undefined ? cat.status : true,
    });
    setIsAddModalOpen(true);
  };

  const toggleStatus = async (id, newStatus) => {
    try {
      await forumCategoryService.updateStatus(id, newStatus);
      toast.success(newStatus ? "Đã hiển thị chủ đề thành công" : "Đã ẩn chủ đề thành công");
      // eslint-disable-next-line react-hooks/set-state-in-effect
      fetchCategories();
      // eslint-disable-next-line no-unused-vars
    } catch (error) {
      toast.error("Không thể cập nhật trạng thái");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Bạn có chắc chắn muốn xóa chủ đề này?")) return;

    try {
      await forumCategoryService.deleteCategory(id);
      toast.success("Xóa chủ đề thành công!");
      fetchCategories();
    } catch (error) {
      toast.error("Lỗi khi xóa chủ đề");
    }
  };

  const onSubmit = async (data) => {
    // Kiểm tra trùng tên chủ đề
    const isDuplicate = categories.some(
      (cat) =>
        cat.name.toLowerCase().trim() === data.name.toLowerCase().trim() &&
        cat.id !== editId
    );

    if (isDuplicate) {
      toast.error("Chủ đề đã tồn tại");
      return;
    }

    try {
      if (editId) {
        await forumCategoryService.updateCategory(editId, data);
        toast.success("Đã chỉnh sửa chủ đề thành công");
      } else {
        await forumCategoryService.createCategory(data);
        toast.success("Đã tạo chủ đề thành công!");
      }

      setIsAddModalOpen(false);
      setEditId(null);
      form.reset({ name: "", slug: "", status: true });
      // eslint-disable-next-line react-hooks/set-state-in-effect
      fetchCategories();
    } catch (error) {
      const errorMessage =
        error?.response?.data?.message || "Có lỗi xảy ra, vui lòng thử lại.";
      toast.error(errorMessage);
    }
  };

  const filteredCategories = categories.filter((cat) => {
    const matchesSearch = cat.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus =
      filterStatus === "all" ||
      (filterStatus === "active" && cat.status === true) ||
      (filterStatus === "inactive" && cat.status === false);
    return matchesSearch && matchesStatus;
  });

  const forumTotalPages = Math.ceil(filteredCategories.length / FORUM_PAGE_SIZE);
  const forumStartIndex = (currentPage - 1) * FORUM_PAGE_SIZE;
  const paginatedForumCategories = filteredCategories.slice(forumStartIndex, forumStartIndex + FORUM_PAGE_SIZE);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filterStatus]);

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        {!hideHeader ? (
          <div>
            <h1 className="text-2xl font-bold text-foreground tracking-tight">
              Quản Lý Chủ Đề Diễn Đàn
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Thêm mới, chỉnh sửa chủ đề bài viết trên diễn đàn.
            </p>
          </div>
        ) : (
          <div />
        )}
        <AppButton appVariant="gradient"
          className="flex items-center gap-2"
          onClick={() => setIsAddModalOpen(true)}
        >
          <Plus className="w-4 h-4" />
          Thêm Chủ Đề
        </AppButton>
      </div>

      {/* Filter */}
      <AppCard appVariant="default" className="border-border shadow-sm">
        <AppCardContent className="p-4 flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="relative w-full md:w-80">
            
            <AppInput
              placeholder="Tìm chủ đề..."
              className="h-10 border-border focus:bg-white"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              icon={Search}
            />
          </div>
          <div className="flex text-sm font-medium text-muted-foreground bg-secondary p-1 rounded-lg transition-all">
            <AppButton appVariant="ghostMuted" variant="ghost"
              onClick={() => setFilterStatus("all")}
              className={`px-3 py-1.5 rounded-md transition-colors h-auto ${filterStatus === "all" ? "bg-white text-foreground shadow-sm hover:bg-white" : "hover:text-foreground"}`}
            >
              Tất cả
            </AppButton>
            <AppButton appVariant="ghostMuted" variant="ghost"
              onClick={() => setFilterStatus("active")}
              className={`px-3 py-1.5 rounded-md transition-colors h-auto ${filterStatus === "active" ? "bg-white text-foreground shadow-sm hover:bg-white" : "hover:text-foreground"}`}
            >
              Hoạt động
            </AppButton>
            <AppButton appVariant="ghostMuted" variant="ghost"
              onClick={() => setFilterStatus("inactive")}
              className={`px-3 py-1.5 rounded-md transition-colors h-auto ${filterStatus === "inactive" ? "bg-white text-foreground shadow-sm hover:bg-white" : "hover:text-foreground"}`}
            >
              Tạm ẩn
            </AppButton>
          </div>
        </AppCardContent>
      </AppCard>

      {/* Categories Table */}
      <DataTable
        columns={[
          {
            header: "Chủ đề",
            width: "40%",
            className: "text-left",
            cellClassName: "text-left",
            render: (cat) => (
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                  <MessageSquare className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <p className="font-bold text-foreground">{cat.name}</p>
                </div>
              </div>
            ),
          },
          {
            header: "Slug",
            width: "30%",
            className: "text-left",
            cellClassName: "text-left",
            render: (cat) => (
              <code className="text-xs bg-secondary px-2 py-1 rounded text-muted-foreground font-mono">
                {cat.slug}
              </code>
            ),
          },
          {
            header: "Số bài viết",
            width: "128px",
            className: "text-center",
            cellClassName: "text-center",
            render: (cat) => (
              <span className="text-sm text-muted-foreground font-bold bg-secondary px-2.5 py-1 rounded-full">
                {cat.threadCount || 0}
              </span>
            ),
          },
          {
            header: "Trạng thái",
            width: "128px",
            className: "text-center",
            cellClassName: "text-center",
            render: (cat) => (
              cat.status === true ? (
                <span
                  onClick={() => toggleStatus(cat.id, false)}
                  className="inline-flex items-center justify-center gap-1.5 text-sm text-success font-medium cursor-pointer hover:underline"
                >
                  <span className="w-2 h-2 rounded-full bg-success/10 text-success" /> Hoạt động
                </span>
              ) : (
                <span
                  onClick={() => toggleStatus(cat.id, true)}
                  className="inline-flex items-center justify-center gap-1.5 text-sm text-muted-foreground font-medium cursor-pointer hover:underline"
                >
                  <span className="w-2 h-2 rounded-full bg-muted" /> Tạm ẩn
                </span>
              )
            ),
          },
          {
            header: "Thao tác",
            width: "100px",
            className: "text-center",
            cellClassName: "text-center",
            render: (cat) => (
              <div className="flex justify-center items-center gap-2">
                <TableActionIconButton
                  icon={Edit}
                  onClick={() => handleEdit(cat)}
                />
                <TableActionIconButton
                  icon={Trash2}
                  colorVariant="error"
                  onClick={() => handleDelete(cat.id)}
                />
              </div>
            ),
          },
        ]}
        data={paginatedForumCategories}
        emptyState="Không tìm thấy chủ đề nào phù hợp."
        pagination={{
          currentPage,
          totalPages: forumTotalPages,
          totalItems: filteredCategories.length,
          onPageChange: setCurrentPage,
          pageSize: FORUM_PAGE_SIZE,
          zeroIndexed: false,
        }}
      />

      {/* Add/Edit Category Modal */}
      <AppDialog
        open={isAddModalOpen}
        onOpenChange={(open) => {
          setIsAddModalOpen(open);
          if (!open) {
            form.reset({ name: "", slug: "", status: true });
            setEditId(null);
          }
        }}
      >
        <AppDialogContent className="sm:max-w-[450px]">
          <AppDialogHeader>
            <AppDialogTitle className="text-xl font-bold flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                <Plus className="w-5 h-5 text-primary" />
              </div>
              {editId ? "Cập Nhật Chủ Đề" : "Thêm Chủ Đề Diễn Đàn"}
            </AppDialogTitle>
          </AppDialogHeader>

          <form
            onSubmit={form.handleSubmit(onSubmit, () => {
              toast.error("Vui lòng điền đầy đủ thông tin bắt buộc");
            })}
            className="space-y-4 py-4"
          >
            <Controller
              control={form.control}
              name="name"
              render={({ field, fieldState: { error } }) => (
                <AppInput
                  label="Tên chủ đề"
                  {...field}
                  onChange={(e) => {
                    field.onChange(e);
                    onNameChange(e);
                  }}
                  className="h-10 border-border"
                  error={error?.message}
                />
              )}
            />

            <Controller
              control={form.control}
              name="slug"
              render={({ field, fieldState: { error } }) => (
                <AppInput
                  label="Slug"
                  {...field}
                  readOnly
                  placeholder="Duong-dan-tinh"
                  className="h-10 border-border bg-muted font-mono text-xs cursor-not-allowed"
                  error={error?.message}
                />
              )}
            />

            <Controller
              control={form.control}
              name="status"
              render={({ field, fieldState: { error } }) => (
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Trạng thái</label>
                  <AppSelect
                    onValueChange={(val) => field.onChange(val === 'true')}
                    value={field.value ? 'true' : 'false'}
                    placeholder="Chọn Trạng thái"
                    options={[
                      { label: "Hoạt động", value: "true" },
                      { label: "Tạm ẩn", value: "false" }
                    ]}
                    error={!!error}
                  />
                  {error && <p className="text-[11px] text-error font-medium">{error.message}</p>}
                </div>
              )}
            />

            <AppDialogFooter className="pt-4 gap-2">
              <AppButton appVariant="ghostMuted" variant="ghost"
                type="button"
                onClick={() => {
                  setIsAddModalOpen(false);
                  setEditId(null);
                  form.reset({ name: "", slug: "", status: true });
                }}
                className="border border-border"
              >
                Hủy bỏ
              </AppButton>
              <AppButton appVariant="gradient" type="submit" className="bg-primary font-bold px-6">
                {editId ? "Lưu Cập Nhật" : "Tạo chủ đề"}
              </AppButton>
            </AppDialogFooter>
          </form>
        </AppDialogContent>
      </AppDialog>
    </div>
  );
}
