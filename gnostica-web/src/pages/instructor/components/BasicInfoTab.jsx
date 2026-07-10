import { toast } from "sonner";
import React from "react";
import { useFormContext, useWatch, Controller } from "react-hook-form";
import { Input } from "@/components/ui/input";

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { ArrowLeft, ArrowRight, Video, GripVertical, Trash2, Plus, PlayCircle, FileText, Check, Loader2, Sparkles, Database, CheckCircle2, ListOrdered, Search, Pencil } from "lucide-react";
import ReactQuill from "react-quill-new";
import "react-quill-new/dist/quill.snow.css";
import { ChevronDown, ChevronRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import CategoryCascader from "./CategoryCascader";

const quillModules = {
  toolbar: [
    ["bold", "italic", "underline"],
    [{ list: "ordered" }, { list: "bullet" }],
    ["clean"],
  ],
};

export default function BasicInfoTab({ categories }) {
  const {
    register,
    control,
    setValue,
    getValues,
    replace,
    formState: { errors },
  } = useFormContext();

  const title = useWatch({ control, name: "title" });
  const categoryId = useWatch({ control, name: "categoryId" });
  const currentStatus = useWatch({ control, name: "status" });
  const aiModerationReport = useWatch({ control, name: "aiModerationReport" });

  // Logic tìm danh mục được chọn (bao gồm đệ quy cấp 2)
  const selectedCategory = React.useMemo(() => {
    if (!categoryId || !categories) return null;
    const searchId = categoryId.toString();
    for (const cat of categories) {
      if (cat.id.toString() === searchId) return cat;
      if (cat.subcategories) {
        const sub = cat.subcategories.find(s => s.id.toString() === searchId);
        if (sub) return sub;
      }
    }
    return null;
  }, [categoryId, categories]);

  const isCategoryHidden = selectedCategory && selectedCategory.status === false;

  // Nếu danh mục bị ẩn, ép buộc khóa học phải ẩn theo
  React.useEffect(() => {
    if (isCategoryHidden && currentStatus !== 2) {
      setValue("status", 2);

      // Đồng bộ xuống chương và bài học ngay lập tức
      const currentSections = getValues("sections") || [];
      const updatedSections = currentSections.map(s => ({
        ...s,
        status: 2,
        lessons: s.lessons?.map(l => ({ ...l, status: 2 })) || []
      }));
      setValue("sections", updatedSections, { shouldDirty: true });
      if (replace) replace(updatedSections);

      toast.info(`Danh mục "${selectedCategory.name}" đang ẩn, khóa học đã được chuyển sang trạng thái Ẩn để đồng bộ.`);
    }
  }, [isCategoryHidden, currentStatus, setValue, getValues, replace, selectedCategory]);

  React.useEffect(() => {
    // Chỉ thực hiện tạo slug và validate nếu title CÓ giá trị
    // Nếu title chưa được nhập lần nào hoặc bị xóa sạch, ta chỉ truyền giá trị "" mà KHÔNG validate
    if (title && typeof title === "string" && title.trim() !== "") {
      const generatedSlug = title.toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[đĐ]/g, "d")
        .replace(/[^a-z0-9\s-]/g, "")
        .trim()
        .replace(/\s+/g, "-")
        .replace(/-+/g, "-");

      setValue("slug", generatedSlug, {
        shouldValidate: true,
        shouldDirty: true
      });
    } else {
      // Khi title rỗng, chỉ cập nhật giá trị slug về rỗng, không ép validate
      // Lỗi "bắt buộc" sẽ chỉ hiện ra khi người dùng bấm Lưu khóa học (Submit)
      setValue("slug", "", {
        shouldValidate: false,
        shouldDirty: true
      });
    }
  }, [title, setValue]);

  return (
    <div className="space-y-6 w-full">
      <div>
        <h3 className="text-lg font-bold text-foreground border-b border-border pb-2 mb-4">
          THÔNG TIN CƠ BẢN
        </h3>
      </div>

      {aiModerationReport && (
        <div className="flex items-center gap-1.5 bg-violet-50/50 border border-violet-100/60 px-4 py-2 rounded-xl text-violet-700 text-xs font-bold">
          <Sparkles className="w-3.5 h-3.5 animate-pulse" />
          Mẹo: Bấm nút <span className="underline font-black decoration-2 decoration-violet-300 mx-0.5">"Kết quả kiểm duyệt AI"</span> ở góc trên hoặc dưới cùng màn hình để xem chi tiết thẩm định.
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <label className="block text-xs font-bold text-muted-foreground uppercase tracking-widest pl-1">
            Tên Khóa Học <span className="text-error">*</span>
          </label>
          <Input
            className="h-11 border-border focus:border-success/20 font-medium"
            placeholder="Ví dụ: React Native Masterclass 2026..."
            {...register("title")}
          />
          {errors.title && (
            <p className="text-xs font-bold text-error mt-1.5 pl-1">
              {errors.title.message}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <label className="block text-xs font-bold text-muted-foreground uppercase tracking-widest pl-1">
            Slug <span className="text-error">*</span>
          </label>
          <Input
            className="h-11 border-border bg-muted font-medium cursor-not-allowed"
            placeholder="react-native-masterclass-2026"
            {...register("slug")}
            readOnly
          />
          {errors.slug && (
            <p className="text-xs font-bold text-error mt-1.5 pl-1">
              {errors.slug.message}
            </p>
          )}
        </div>
      </div>



      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <label className="block text-xs font-bold text-muted-foreground uppercase tracking-widest pl-1">
            Danh Mục <span className="text-error">*</span>
          </label>
          <Controller
            name="categoryId"
            control={control}
            render={({ field }) => (
              <CategoryCascader
                categories={categories}
                value={field.value}
                onChange={field.onChange}
              />
            )}
          />
          {errors.categoryId && (
            <p className="text-xs font-bold text-error mt-1.5 pl-1">
              {errors.categoryId.message}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <label className="block text-xs font-bold text-muted-foreground uppercase tracking-widest pl-1">
            Cấp Độ <span className="text-error">*</span>
          </label>
          <Controller
            name="level"
            control={control}
            render={({ field }) => (
              <Select onValueChange={field.onChange} defaultValue={field.value} value={field.value}>
                <SelectTrigger className="w-full !h-11 border-border focus:border-success/20 font-medium bg-white data-[state=open]:ring-1 data-[state=open]:ring-green-500">
                  <SelectValue placeholder="Chọn cấp độ" />
                </SelectTrigger>
                <SelectContent className="bg-white">
                  <SelectItem value="beginner">Người mới bắt đầu</SelectItem>
                  <SelectItem value="intermediate">Trung bình</SelectItem>
                  <SelectItem value="advanced">Nâng cao</SelectItem>
                  <SelectItem value="all">Dành cho mọi đối tượng</SelectItem>
                </SelectContent>
              </Select>
            )}
          />
          {errors.level && (
            <p className="text-xs font-bold text-error mt-1.5 pl-1">
              {errors.level.message}
            </p>
          )}
        </div>
        <div className="space-y-2">
          <label className="block text-xs font-bold text-muted-foreground uppercase tracking-widest pl-1">
            Trạng Thái <span className="text-error">*</span>
          </label>
          <Controller
            name="status"
            control={control}
            render={({ field }) => (
              <Select
                onValueChange={(val) => {
                  const newStatus = Number(val);

                  // Chặn bật hoạt động nếu danh mục đang ẩn
                  if (isCategoryHidden && newStatus === 1) {
                    toast.warning("Danh mục của khóa học đang ẩn, không thể bật trạng thái Hoạt động.");
                    return;
                  }

                  field.onChange(newStatus);

                  // Logic Đồng bộ trạng thái: Course -> Module -> Lesson
                  const currentSections = getValues("sections") || [];
                  const updatedSections = currentSections.map(s => ({
                    ...s,
                    status: newStatus,
                    lessons: s.lessons?.map(l => ({
                      ...l,
                      status: newStatus
                    })) || []
                  }));

                  // setValue với shouldDirty giúp các Controller cấp sâu (lessons) nhận diện thay đổi
                  setValue("sections", updatedSections, { shouldDirty: true });
                  // replace giúp cập nhật ngay lập tức giao diện Accordion/FieldArray của chương
                  if (replace) replace(updatedSections);
                }}
                value={(field.value ?? 1).toString()}
                disabled={isCategoryHidden}
              >
                <SelectTrigger className={`w-full !h-11 border-border focus:border-success/20 font-medium ${isCategoryHidden ? 'bg-muted opacity-80' : 'bg-white'}`}>
                  <SelectValue placeholder="Chọn trạng thái" />
                </SelectTrigger>
                <SelectContent className="bg-white">
                  <SelectItem value="1" disabled={isCategoryHidden}>Hoạt động {isCategoryHidden && "(Danh mục cha đang ẩn)"}</SelectItem>
                  <SelectItem value="2">Ẩn</SelectItem>
                </SelectContent>
              </Select>
            )}
          />
        </div>
      </div>

      <div className="space-y-2">
        <label className="block text-xs font-bold text-muted-foreground uppercase tracking-widest pl-1">
          Mô Tả Khóa Học (Tuỳ chọn)
        </label>
        <div className="rounded-lg border border-border overflow-hidden focus-within:border-ring focus-within:ring-3 focus-within:ring-ring/50 transition-all bg-white">
          <Controller
            name="description"
            control={control}
            render={({ field }) => (
              <ReactQuill
                theme="snow"
                value={field.value || ""}
                onChange={field.onChange}
                modules={quillModules}
                placeholder="Mô tả về lợi ích và mục tiêu của khóa học dành cho học viên..."
                className="[&_.ql-toolbar.ql-snow]:!border-0 [&_.ql-toolbar.ql-snow]:!border-b [&_.ql-toolbar.ql-snow]:!border-border [&_.ql-toolbar]:bg-muted [&_.ql-container.ql-snow]:!border-0 [&_.ql-container]:min-h-[120px] [&_.ql-editor]:min-h-[120px] [&_.ql-editor]:text-sm [&_.ql-editor]:text-foreground font-sans"
              />
            )}
          />
        </div>
        {errors.description && (
          <p className="text-xs font-bold text-error mt-1.5 pl-1">{errors.description.message}</p>
        )}
      </div>
    </div>
  );
}

