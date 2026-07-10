// eslint-disable-next-line no-unused-vars
import React, { useState, useEffect } from "react";
import useAdminCategories from "@/hooks/course/useAdminCategories";
import {
  Plus,
  Search,
  Edit,
  Trash2,
  FolderOpen,
  ChevronRight,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import AppTable from "@/components/common/AppTable";
import { TableRow, TableCell } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { SimpleButton, TableActionIconButton, GhostButton } from "@/components/common/AppButton";
import { Label } from "@/components/ui/label";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
// eslint-disable-next-line no-unused-vars
import { toast } from "sonner";
import Fuse from "fuse.js";
// eslint-disable-next-line no-unused-vars
import categoryService from "@/services/course/categoryService";
import { DialogDescription } from "@/components/ui/dialog";

const ITEMS_PER_PAGE = 10;

const categorySchema = z.object({
  name: z
    .string()
    .min(1, "Tên danh mục không được để trống")
    .max(255, "Tên danh mục không vượt quá 255 ký tự"),
  slug: z
    .string()
    .min(1, "Slug không được để trống")
    .max(255, "Slug không vượt quá 255 ký tự"),
  parent_id: z.string(),
  status: z.boolean().default(true),
});

export default function AdminCategories({ hideHeader = false }) {
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
              Quản Lý Danh Mục
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Thêm mới, chỉnh sửa và sắp xếp danh mục khóa học.
            </p>
          </div>
        ) : (
          <div />
        )}
        <SimpleButton
          className="flex items-center gap-2"
          onClick={() => setIsAddModalOpen(true)}
        >
          <Plus className="w-4 h-4" />
          Thêm Danh Mục
        </SimpleButton>
      </div>

      {/* Filter */}
      <Card className="border-border shadow-sm">
        <CardContent className="p-4 flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="relative w-full md:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Tìm danh mục..."
              className="pl-9 h-10 border-border focus:bg-white"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex text-sm font-medium text-muted-foreground bg-secondary p-1 rounded-lg transition-all">
            <button
              onClick={() => setFilterStatus("all")}
              className={`px-3 py-1.5 rounded-md transition-colors ${filterStatus === "all" ? "bg-white text-foreground shadow-sm" : "hover:text-foreground"}`}
            >
              Tất cả
            </button>
            <button
              onClick={() => setFilterStatus("active")}
              className={`px-3 py-1.5 rounded-md transition-colors ${filterStatus === "active" ? "bg-white text-foreground shadow-sm" : "hover:text-foreground"}`}
            >
              Đang hoạt động
            </button>
            <button
              onClick={() => setFilterStatus("inactive")}
              className={`px-3 py-1.5 rounded-md transition-colors ${filterStatus === "inactive" ? "bg-white text-foreground shadow-sm" : "hover:text-foreground"}`}
            >
              Tạm ẩn
            </button>
          </div>
        </CardContent>
      </Card>

      {/* Categories Table */}
      <Card className="border-border shadow-sm overflow-hidden">
        <AppTable
          columns={[
            {
              width: "40px",
              className: "w-10 mx-auto",
              cellClassName: "w-8 pl-4",
              render: (cat) => (
                <ChevronRight
                  className={`w-4 h-4 text-muted-foreground transition-transform duration-200 ${expanded === cat.id ? "rotate-90" : ""}`}
                />
              ),
            },
            {
              header: "Danh mục",
              width: "25%",
              className: "min-w-[200px]",
              render: (cat) => (
                <div className="flex items-center gap-3">
                  <div>
                    <p className="font-bold text-foreground">{cat.name}</p>
                  </div>
                </div>
              ),
            },
            {
              header: "Slug",
              width: "20%",
              className: "min-w-[150px]",
              render: (cat) => (
                <code className="text-xs bg-secondary px-2 py-1 rounded text-muted-foreground font-mono">
                  {cat.slug}
                </code>
              ),
            },
            {
              header: "Danh mục con",
              className: "text-center w-32 whitespace-nowrap",
              cellClassName: "text-center",
              render: (cat) => (
                <span className="text-sm text-muted-foreground font-medium bg-secondary px-2.5 py-1 rounded-full">
                  {cat.subcategories ? cat.subcategories.length : 0}
                </span>
              ),
            },
            {
              header: "Khóa học",
              className: "text-center w-24 whitespace-nowrap",
              cellClassName: "text-center font-bold text-foreground",
              render: (cat) => cat.courses,
            },
            {
              header: "Trạng thái",
              className: "w-32 whitespace-nowrap",
              render: (cat) => (
                cat.status === true ? (
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
                )
              ),
            },
            {
              header: "Thao tác",
              className: "text-center w-24 min-w-[100px]",
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
            },
          ]}
          data={categories}
          isLoading={loading}
          loadingState="Đang tải danh mục..."
          emptyState="Không tìm thấy danh mục nào phù hợp."
          onRowClick={(cat) => setExpanded(expanded === cat.id ? null : cat.id)}
          rowClassName="cursor-pointer"
          pagination={{
            currentPage,
            totalPages,
            totalElements,
            onPageChange: setCurrentPage,
            zeroIndexed: false,
          }}
          renderExpandedRow={(cat) => {
            if (expanded === cat.id && cat.subcategories && cat.subcategories.length > 0) {
              return (
                <>
                  {cat.subcategories.map((sub) => (
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
                        {sub.courses}
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
                          <TableActionIconButton
                            icon={Edit}
                            onClick={(e) => handleEdit(e, sub, cat.id)}
                          />
                          <TableActionIconButton
                            icon={Trash2}
                            colorVariant="error"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDelete(sub.id);
                            }}
                          />
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </>
              );
            }
            return null;
          }}
        />
      </Card>
      {/* Add Category Modal */}
      <Dialog
        open={isAddModalOpen}
        onOpenChange={(open) => {
          setIsAddModalOpen(open);
          if (!open) {
            form.reset({ name: "", slug: "", parent_id: "none", status: true });
            setEditId(null);
          }
        }}
      >
        <DialogContent className="sm:max-w-[450px]">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                <Plus className="w-5 h-5 text-primary" />
              </div>
              {editId ? "Cập Nhật Danh Mục" : "Thêm Danh Mục Mới"}
            </DialogTitle>
            <DialogDescription>
              {editId
                ? "Chỉnh sửa thông tin danh mục hiện có."
                : "Tạo một danh mục mới để phân loại các khóa học của bạn."}
            </DialogDescription>
          </DialogHeader>

          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="space-y-4 py-4"
            >
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-foreground font-semibold">
                      Tên danh mục
                    </FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        onChange={(e) => {
                          field.onChange(e);
                          onNameChange(e);
                        }}
                        className="h-10 border-border focus-visible:ring-primary focus-visible:border-primary"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="slug"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-foreground font-semibold text-xs opacity-70">
                      Slug
                    </FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        readOnly
                        placeholder="Duong-dan-tinh"
                        className="h-10 border-border bg-muted font-mono text-xs cursor-not-allowed"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="parent_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-foreground font-semibold">
                      Danh mục cha
                    </FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger className="h-10 border-border w-full">
                          <SelectValue placeholder="Chọn danh mục cha" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="none">
                          Không có (Danh mục gốc)
                        </SelectItem>
                        {categories.map((cat) => (
                          <SelectItem key={cat.id} value={cat.id.toString()}>
                            {cat.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-foreground font-semibold">
                      Trạng thái
                    </FormLabel>
                    <Select
                      onValueChange={(val) => field.onChange(val === 'true')}
                      value={field.value ? 'true' : 'false'}
                    >
                      <FormControl>
                        <SelectTrigger className="h-10 border-border w-full">
                          <SelectValue placeholder="Chọn Trạng thái" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="true">Hoạt động</SelectItem>
                        <SelectItem value="false">Tạm ẩn</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <DialogFooter className="pt-4 gap-2">
                <GhostButton
                  type="button"
                  onClick={() => {
                    setIsAddModalOpen(false);
                    setEditId(null);
                    form.reset({ name: "", slug: "", parent_id: "none", status: true });
                  }}
                  className="border border-border"
                >
                  Hủy bỏ
                </GhostButton>
                <SimpleButton type="submit">
                  {editId ? "Lưu Cập Nhật" : "Tạo danh mục"}
                </SimpleButton>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
