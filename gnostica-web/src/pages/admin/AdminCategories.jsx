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
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

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
    resolver: zodResolver(forumCategorySchema),
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
      <AppCard appVariant="default" className="border-border shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-muted">
              <TableRow>
                <TableHead className="py-4 font-semibold text-foreground w-10 mx-auto" />
                <TableHead className="py-4 font-semibold text-foreground w-[25%] min-w-[200px]">
                  Chủ đề
                </TableHead>
                <TableHead className="py-4 font-semibold text-foreground w-[20%] min-w-[150px]">
                  Slug
                </TableHead>
                <TableHead className="py-4 font-semibold text-foreground text-center w-32 whitespace-nowrap">
                  Chủ đề con
                </TableHead>
                <TableHead className="py-4 font-semibold text-foreground text-center w-24 whitespace-nowrap">
                  Khóa học
                </TableHead>
                <TableHead className="py-4 font-semibold text-foreground w-32 whitespace-nowrap">
                  Trạng thái
                </TableHead>
                <TableHead className="py-4 font-semibold text-foreground text-center w-24 min-w-[100px]">
                  Thao tác
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={7} className="h-32 text-center text-muted-foreground font-medium">
                    <div className="flex flex-col items-center justify-center gap-3">
                      <div className="w-6 h-6 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
                      <span className="text-sm animate-pulse">Đang tải dữ liệu...</span>
                    </div>
                  </TableCell>
                </TableRow>
              ) : categories.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="h-32 text-center text-muted-foreground font-medium">
                    Không tìm thấy chủ đề nào phù hợp.
                  </TableCell>
                </TableRow>
              ) : (
                categories.map((cat) => (
                  <React.Fragment key={cat.id}>
                    {/* Parent category row */}
                    <TableRow
                      key={cat.id}
                      className="hover:bg-muted cursor-pointer"
                      onClick={() => setExpanded(expanded === cat.id ? null : cat.id)}
                    >
                      <TableCell className="w-10 text-center">
                        {cat.subcategories && cat.subcategories.length > 0 && (
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
                        )}
                      </TableCell>
                      <TableCell>
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
                      </TableCell>
                      <TableCell>
                        <code className="text-xs bg-white px-2 py-1 rounded border border-border text-muted-foreground font-mono">
                          {cat.slug}
                        </code>
                      </TableCell>
                      <TableCell className="text-center font-bold text-foreground">
                        {cat.subcategories?.length || 0}
                      </TableCell>
                      <TableCell className="text-center font-bold text-foreground">
                        {cat.courses || 0}
                      </TableCell>
                      <TableCell>
                        {cat.status === true ? (
                          <span
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleStatus(cat.id, false);
                            }}
                            className="inline-flex items-center gap-1.5 text-sm text-success font-medium cursor-pointer hover:underline"
                          >
                            <span className="w-2 h-2 rounded-full bg-success/10 text-success" />{" "}
                            Hoạt động
                          </span>
                        ) : (
                          <span
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleStatus(cat.id, true);
                            }}
                            className="inline-flex items-center gap-1.5 text-sm text-muted-foreground font-medium cursor-pointer hover:underline"
                          >
                            <span className="w-2 h-2 rounded-full bg-muted" />{" "}
                            Tạm ẩn
                          </span>
                        )}
                      </TableCell>
                      <TableCell className="text-center">
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
                      </TableCell>
                    </TableRow>

                    {/* Subcategories expanded rows */}
                    {expanded === cat.id &&
                      cat.subcategories &&
                      cat.subcategories.length > 0 &&
                      cat.subcategories.map((sub) => (
                        <TableRow
                          key={sub.id}
                          className="bg-muted/60 hover:bg-secondary"
                        >
                          <TableCell className="w-8" />
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
                          <TableCell>
                            {sub.status === true ? (
                              <span
                                onClick={(e) => {
                                  e.stopPropagation();
                                  toggleStatus(sub.id, false);
                                }}
                                className="inline-flex items-center gap-1.5 text-sm text-success font-medium cursor-pointer hover:underline"
                              >
                                <span className="w-2 h-2 rounded-full bg-success/10 text-success" />{" "}
                                Hoạt động
                              </span>
                            ) : (
                              <span
                                onClick={(e) => {
                                  e.stopPropagation();
                                  toggleStatus(sub.id, true);
                                }}
                                className="inline-flex items-center gap-1.5 text-sm text-muted-foreground font-medium cursor-pointer hover:underline"
                              >
                                <span className="w-2 h-2 rounded-full bg-muted" />{" "}
                                Tạm ẩn
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
                      ))}
                  </React.Fragment>
                ))
              )}
            </TableBody>
          </Table>
          {totalPages > 1 && (
            <div className="flex flex-col sm:flex-row justify-between items-center py-4 px-4 bg-white border-t border-border gap-4">
              <span className="text-sm font-medium text-muted-foreground">
                Hiển thị {(currentPage - 1) * ITEMS_PER_PAGE + 1} - {Math.min(currentPage * ITEMS_PER_PAGE, totalElements)} của {totalElements} chủ đề
              </span>
              <div className="flex gap-2">
                <AppButton appVariant="ghostMuted" variant="ghost"
                  size="sm"
                  className="border border-border bg-white"
                  onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                >
                  Trước
                </AppButton>
                {Array.from({ length: totalPages }).map((_, idx) => {
                  const Btn = currentPage === idx + 1 ? TableActionIconButton : TableActionIconButton;
                  return (
                    <Btn
                      key={idx}
                      size="sm"
                      className={`w-8 h-8 rounded-lg p-0 ${currentPage === idx + 1 ? 'bg-primary' : 'border border-border bg-white'}`}
                      onClick={() => setCurrentPage(idx + 1)}
                    >
                      {idx + 1}
                    </Btn>
                  );
                })}
                <AppButton appVariant="ghostMuted" variant="ghost"
                  size="sm"
                  className="border border-border bg-white"
                  onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                >
                  Sau
                </AppButton>
              </div>
            </div>
          )}
        </div>
      </AppCard>
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
    resolver: zodResolver(categorySchema),
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
      <AppCard appVariant="default" className="border-border shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-muted">
              <TableRow>
                <TableHead className="py-4 font-semibold text-foreground w-[40%] min-w-[200px]">
                  Chủ đề
                </TableHead>
                <TableHead className="py-4 font-semibold text-foreground w-[30%] min-w-[150px]">
                  Slug
                </TableHead>
                <TableHead className="py-4 font-semibold text-foreground text-center w-32 whitespace-nowrap">
                  Số bài viết
                </TableHead>
                <TableHead className="py-4 font-semibold text-foreground w-32 whitespace-nowrap">
                  Trạng thái
                </TableHead>
                <TableHead className="py-4 font-semibold text-foreground text-center w-24 min-w-[100px]">
                  Thao tác
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredCategories.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="h-32 text-center text-muted-foreground font-medium">
                    Không tìm thấy chủ đề nào phù hợp.
                  </TableCell>
                </TableRow>
              ) : (
                filteredCategories.map((cat) => (
                  <TableRow key={cat.id} className="hover:bg-muted">
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                          <MessageSquare className="w-4 h-4 text-primary" />
                        </div>
                        <div>
                          <p className="font-bold text-foreground">{cat.name}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <code className="text-xs bg-secondary px-2 py-1 rounded text-muted-foreground font-mono">
                        {cat.slug}
                      </code>
                    </TableCell>
                    <TableCell className="text-center">
                      <span className="text-sm text-muted-foreground font-bold bg-secondary px-2.5 py-1 rounded-full">
                        {cat.threadCount || 0}
                      </span>
                    </TableCell>
                    <TableCell>
                      {cat.status === true ? (
                        <span
                          onClick={() => toggleStatus(cat.id, false)}
                          className="inline-flex items-center gap-1.5 text-sm text-success font-medium cursor-pointer hover:underline"
                        >
                          <span className="w-2 h-2 rounded-full bg-success/10 text-success" />{" "}
                          Hoạt động
                        </span>
                      ) : (
                        <span
                          onClick={() => toggleStatus(cat.id, true)}
                          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground font-medium cursor-pointer hover:underline"
                        >
                          <span className="w-2 h-2 rounded-full bg-muted" />{" "}
                          Tạm ẩn
                        </span>
                      )}
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="flex justify-center items-center gap-2">
                        <AppButton appVariant="ghostMuted" variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-muted-foreground hover:text-primary border-none"
                          onClick={() => handleEdit(cat)}
                        >
                          <Edit className="w-4 h-4" />
                        </AppButton>
                        <AppButton appVariant="ghostMuted" variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-muted-foreground hover:text-error border-none"
                          onClick={() => handleDelete(cat.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </AppButton>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </AppCard>

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
