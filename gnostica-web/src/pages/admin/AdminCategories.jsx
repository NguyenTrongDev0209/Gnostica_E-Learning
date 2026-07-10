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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import { toast } from "sonner";
import Fuse from "fuse.js";
import categoryService from "@/services/course/categoryService";
import { DialogDescription } from "@/components/ui/dialog";

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
              Quản Lý Chủ Đề
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Thêm mới, chỉnh sửa và sắp xếp chủ đề khóa học.
            </p>
          </div>
        ) : (
          <div />
        )}
        <Button
          className="font-bold flex items-center gap-2"
          onClick={() => setIsAddModalOpen(true)}
        >
          <Plus className="w-4 h-4" />
          Thêm Chủ Đề
        </Button>
      </div>

      {/* Filter */}
      <Card className="border-border shadow-sm">
        <CardContent className="p-4 flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="relative w-full md:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Tìm chủ đề..."
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
              {categories.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="h-32 text-center text-muted-foreground font-medium">
                    Không tìm thấy chủ đề nào phù hợp.
                  </TableCell>
                </TableRow>
              ) : (
                categories.map((cat) => (
                  <React.Fragment key={cat.id}>
                    <TableRow
                      key={cat.id}
                      className="hover:bg-muted cursor-pointer"
                      onClick={() =>
                        setExpanded(expanded === cat.id ? null : cat.id)
                      }
                    >
                      <TableCell className="w-8 pl-4">
                        <ChevronRight
                          className={`w-4 h-4 text-muted-foreground transition-transform duration-200 ${expanded === cat.id ? "rotate-90" : ""}`}
                        />
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-3">
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
                        <span className="text-sm text-muted-foreground font-medium bg-secondary px-2.5 py-1 rounded-full">
                          {cat.subcategories ? cat.subcategories.length : 0}
                        </span>
                      </TableCell>
                      <TableCell className="text-center font-bold text-foreground">
                        {cat.courses}
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
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-muted-foreground hover:text-primary"
                            onClick={(e) => handleEdit(e, cat)}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-muted-foreground hover:text-error"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDelete(cat.id);
                            }}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>

                    {/* Subcategories expanded row */}
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
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-muted-foreground hover:text-primary"
                                onClick={(e) => handleEdit(e, sub, cat.id)}
                              >
                                <Edit className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-muted-foreground hover:text-error"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDelete(sub.id);
                                }}
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
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
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                >
                  Trước
                </Button>
                {Array.from({ length: totalPages }).map((_, idx) => (
                  <Button
                    key={idx}
                    variant={currentPage === idx + 1 ? "default" : "outline"}
                    size="sm"
                    className="w-8 h-8 rounded-lg p-0"
                    onClick={() => setCurrentPage(idx + 1)}
                  >
                    {idx + 1}
                  </Button>
                ))}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                >
                  Sau
                </Button>
              </div>
            </div>
          )}
        </div>
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
              {editId ? "Cập Nhật Chủ Đề" : "Thêm Chủ Đề Mới"}
            </DialogTitle>
            <DialogDescription>
              {editId
                ? "Chỉnh sửa thông tin chủ đề hiện có."
                : "Tạo một chủ đề mới để phân loại các khóa học của bạn."}
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
                      Tên chủ đề
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
                      Chủ đề cha
                    </FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger className="h-10 border-border w-full">
                          <SelectValue placeholder="Chọn chủ đề cha" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="none">
                          Không có (Chủ đề gốc)
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
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setIsAddModalOpen(false);
                    setEditId(null);
                    form.reset({ name: "", slug: "", parent_id: "none", status: true });
                  }}
                  className="border-border"
                >
                  Hủy bỏ
                </Button>
                <Button type="submit" className="bg-primary font-bold px-6">
                  {editId ? "Lưu Cập Nhật" : "Tạo chủ đề"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
