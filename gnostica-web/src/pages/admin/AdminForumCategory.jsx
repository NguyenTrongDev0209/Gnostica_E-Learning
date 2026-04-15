import React, { useState, useEffect } from "react";
import {
  Plus,
  Search,
  Edit,
  Trash2,
  FolderOpen,
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
import { Button } from "@/components/ui/button";
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
import forumCategoryService from "@/services/forumCategoryService";

const categorySchema = z.object({
  name: z
    .string()
    .min(1, "Tên danh mục không được để trống")
    .max(255, "Tên danh mục không vượt quá 255 ký tự"),
  slug: z
    .string()
    .min(1, "Slug không được để trống")
    .max(255, "Slug không vượt quá 255 ký tự"),
  status: z.boolean().default(true),
});

export default function AdminForumCategory() {
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
      toast.error("Không thể tải danh sách danh mục diễn đàn");
    }
  };

  useEffect(() => {
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
      toast.success(`Đã chuyển trạng thái sang ${newStatus ? 'Hoạt động' : 'Tạm ẩn'}`);
      fetchCategories();
    } catch (error) {
      toast.error("Không thể cập nhật trạng thái");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Bạn có chắc chắn muốn xóa danh mục này?")) return;

    try {
      await forumCategoryService.deleteCategory(id);
      toast.success("Xóa danh mục thành công!");
      fetchCategories();
    } catch (error) {
      toast.error("Lỗi khi xóa danh mục");
    }
  };

  const onSubmit = async (data) => {
    try {
      if (editId) {
        await forumCategoryService.updateCategory(editId, data);
        toast.success("Cập nhật danh mục thành công!");
      } else {
        await forumCategoryService.createCategory(data);
        toast.success("Thêm danh mục thành công!");
      }

      setIsAddModalOpen(false);
      setEditId(null);
      form.reset({ name: "", slug: "", status: true });
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
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Quản Lý Danh Mục Diễn Đàn
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Thêm mới, chỉnh sửa danh mục bài viết trên diễn đàn.
          </p>
        </div>
        <Button
          className="font-bold flex items-center gap-2"
          onClick={() => setIsAddModalOpen(true)}
        >
          <Plus className="w-4 h-4" />
          Thêm Danh Mục
        </Button>
      </div>

      {/* Filter */}
      <Card className="border-slate-200 shadow-sm">
        <CardContent className="p-4 flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="relative w-full md:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input
              placeholder="Tìm danh mục..."
              className="pl-9 h-10 border-slate-200 focus:bg-white"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex text-sm font-medium text-slate-500 bg-slate-100 p-1 rounded-lg transition-all">
            <button
              onClick={() => setFilterStatus("all")}
              className={`px-3 py-1.5 rounded-md transition-colors ${filterStatus === "all" ? "bg-white text-slate-900 shadow-sm" : "hover:text-slate-900"}`}
            >
              Tất cả
            </button>
            <button
              onClick={() => setFilterStatus("active")}
              className={`px-3 py-1.5 rounded-md transition-colors ${filterStatus === "active" ? "bg-white text-slate-900 shadow-sm" : "hover:text-slate-900"}`}
            >
              Hoạt động
            </button>
            <button
              onClick={() => setFilterStatus("inactive")}
              className={`px-3 py-1.5 rounded-md transition-colors ${filterStatus === "inactive" ? "bg-white text-slate-900 shadow-sm" : "hover:text-slate-900"}`}
            >
              Tạm ẩn
            </button>
          </div>
        </CardContent>
      </Card>

      {/* Categories Table */}
      <Card className="border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-slate-50">
              <TableRow>
                <TableHead className="py-4 font-semibold text-slate-900 w-[40%] min-w-[200px]">
                  Danh mục
                </TableHead>
                <TableHead className="py-4 font-semibold text-slate-900 w-[30%] min-w-[150px]">
                  Slug
                </TableHead>
                <TableHead className="py-4 font-semibold text-slate-700 text-center w-32 whitespace-nowrap">
                  Số bài viết
                </TableHead>
                <TableHead className="py-4 font-semibold text-slate-700 w-32 whitespace-nowrap">
                  Trạng thái
                </TableHead>
                <TableHead className="py-4 font-semibold text-slate-700 text-center w-24 min-w-[100px]">
                  Thao tác
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredCategories.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="h-32 text-center text-slate-500 font-medium">
                    Không tìm thấy danh mục nào phù hợp.
                  </TableCell>
                </TableRow>
              ) : (
                filteredCategories.map((cat) => (
                  <TableRow key={cat.id} className="hover:bg-slate-50/50">
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                            <MessageSquare className="w-4 h-4 text-primary" />
                        </div>
                        <div>
                          <p className="font-bold text-slate-900">{cat.name}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <code className="text-xs bg-slate-100 px-2 py-1 rounded text-slate-600 font-mono">
                        {cat.slug}
                      </code>
                    </TableCell>
                    <TableCell className="text-center">
                      <span className="text-sm text-slate-600 font-bold bg-slate-100 px-2.5 py-1 rounded-full">
                        {cat.threadCount || 0}
                      </span>
                    </TableCell>
                    <TableCell>
                      {cat.status === true ? (
                        <span
                          onClick={() => toggleStatus(cat.id, false)}
                          className="inline-flex items-center gap-1.5 text-sm text-green-600 font-medium cursor-pointer hover:underline"
                        >
                          <span className="w-2 h-2 rounded-full bg-green-500" />{" "}
                          Hoạt động
                        </span>
                      ) : (
                        <span
                          onClick={() => toggleStatus(cat.id, true)}
                          className="inline-flex items-center gap-1.5 text-sm text-slate-500 font-medium cursor-pointer hover:underline"
                        >
                          <span className="w-2 h-2 rounded-full bg-slate-400" />{" "}
                          Tạm ẩn
                        </span>
                      )}
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="flex justify-center items-center gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-slate-400 hover:text-primary"
                          onClick={() => handleEdit(cat)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-slate-400 hover:text-red-500"
                          onClick={() => handleDelete(cat.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
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
              {editId ? "Cập Nhật Danh Mục" : "Thêm Danh Mục Diễn Đàn"}
            </DialogTitle>
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
                    <FormLabel className="text-slate-700 font-semibold">
                      Tên danh mục
                    </FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        onChange={(e) => {
                          field.onChange(e);
                          onNameChange(e);
                        }}
                        className="h-10 border-slate-200 focus-visible:ring-primary focus-visible:border-primary"
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
                    <FormLabel className="text-slate-700 font-semibold text-xs opacity-70">
                      Slug
                    </FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        readOnly
                        placeholder="Duong-dan-tinh"
                        className="h-10 border-slate-200 bg-slate-50 font-mono text-xs cursor-not-allowed"
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
                    <FormLabel className="text-slate-700 font-semibold">
                      Trạng thái
                    </FormLabel>
                    <Select
                      onValueChange={(val) => field.onChange(val === 'true')}
                      value={field.value ? 'true' : 'false'}
                    >
                      <FormControl>
                        <SelectTrigger className="h-10 border-slate-200 w-full">
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
                    form.reset({ name: "", slug: "", status: true });
                  }}
                  className="border-slate-200"
                >
                  Hủy bỏ
                </Button>
                <Button type="submit" className="bg-primary font-bold px-6">
                  {editId ? "Lưu Cập Nhật" : "Tạo danh mục"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
