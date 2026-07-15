import React, { useState, useEffect } from "react";
import {
  Plus,
  Search,
  Edit,
  Trash2,
  MessageSquare,
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
import { TableActionIconButton, AppButton } from "@/components/common/micro/AppButton";
import { Input } from "@/components/ui/input";
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
import forumCategoryService from "@/services/forum/forumCategoryService";

const categorySchema = z.object({
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

export default function AdminForumCategory({ hideHeader = false }) {
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
              Hoạt động
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
      </Card>

      {/* Add/Edit Category Modal */}
      <Dialog
        open={isAddModalOpen}
        onOpenChange={(open) => {
          setIsAddModalOpen(open);
          if (!open) {
            form.reset({ name: "", slug: "", status: true });
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
              {editId ? "Cập Nhật Chủ Đề" : "Thêm Chủ Đề Diễn Đàn"}
            </DialogTitle>
          </DialogHeader>

          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit, () => {
                toast.error("Vui lòng điền đầy đủ thông tin bắt buộc");
              })}
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
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
