import { useState, useEffect } from "react";
import DOMPurify from "dompurify";
import ReactQuill from "react-quill-new";
import "react-quill-new/dist/quill.snow.css";
import { Check, ChevronDown, Eye, FilePlus2, GripVertical, Loader2, Plus, Save, Trash2, X, FileText } from "lucide-react";
import { toast } from "sonner";
import AppCard, { AppCardContent, AppCardHeader, AppCardTitle } from "@/components/common/micro/AppCard";
import { AppButton } from "@/components/common/micro/AppButton";
import AppInput from "@/components/common/micro/AppInput";
import { Label } from "@/components/common/micro/AppLabel";
import { Switch } from "@/components/ui/switch";
import { useAdminTerms } from "@/hooks/settings/useSiteSettings";
import Skeleton from "@/components/common/micro/AppSkeleton";

const EMPTY_DRAFT = {
  title: "",
  urlPath: "",
  content: "",
  status: 1,
};

function toSlug(str = "") {
  return str
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function TermEditor({
  module,
  term,
  disabled,
  createTermMutation,
  updateTermMutation,
  deleteTermMutation,
  onSaved,
  onDeleted,
}) {
  const [draft, setDraft] = useState(() => {
    if (term) {
      return {
        title: term.title || "",
        urlPath: term.urlPath || "",
        content: term.content || "<p>Nhập nội dung bài viết...</p>",
        status: term.status ?? 1,
      };
    }
    return { ...EMPTY_DRAFT };
  });

  useEffect(() => {
    if (term) {
      setDraft({
        title: term.title || "",
        urlPath: term.urlPath || "",
        content: term.content || "<p>Nhập nội dung bài viết...</p>",
        status: term.status ?? 1,
      });
    } else {
      setDraft({ ...EMPTY_DRAFT });
    }
  }, [term]);

  const [showPreview, setShowPreview] = useState(false);
  const isSaving = createTermMutation?.isPending || updateTermMutation?.isPending;

  const handleSave = async () => {
    if (disabled || isSaving) return;

    if (!module && !term) {
      toast.error("Vui lòng chọn hoặc tạo một mục trước");
      return;
    }
    const trimmedTitle = draft.title.trim();
    if (!trimmedTitle) {
      toast.error("Vui lòng nhập tiêu đề bài viết");
      return;
    }

    let trimmedUrl = draft.urlPath.trim();
    if (!trimmedUrl) {
      trimmedUrl = `/terms/${toSlug(trimmedTitle)}`;
    } else {
      if (!trimmedUrl.startsWith("/")) {
        trimmedUrl = `/${trimmedUrl}`;
      }
      if (!trimmedUrl.startsWith("/terms/")) {
        trimmedUrl = `/terms${trimmedUrl}`;
      }
    }

    if (!draft.content.trim()) {
      toast.error("Vui lòng nhập nội dung bài viết");
      return;
    }

    const cleanedContent = draft.content
      .replace(/&nbsp;/gi, " ")
      .replace(/\u00a0/g, " ");

    const payload = {
      termModuleId: module?.id || term?.termModuleId,
      title: trimmedTitle,
      urlPath: trimmedUrl,
      content: cleanedContent,
      sortOrder: term?.sortOrder ?? 0,
      status: draft.status,
      metadata: term?.metadata || {},
    };

    try {
      if (term?.id) {
        const saved = await updateTermMutation.mutateAsync({ id: term.id, ...payload });
        toast.success("Cập nhật bài viết điều khoản thành công");
        onSaved?.(saved);
      } else {
        const saved = await createTermMutation.mutateAsync(payload);
        toast.success("Tạo bài viết điều khoản mới thành công");
        onSaved?.(saved);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Không thể lưu bài viết điều khoản");
    }
  };

  const handleDelete = async () => {
    if (disabled) return;
    if (!term?.id || !window.confirm(`Bạn có chắc chắn muốn xóa bài viết "${term.title}"?`)) return;
    try {
      await deleteTermMutation.mutateAsync(term.id);
      toast.success("Đã xóa bài viết thành công");
      onDeleted?.();
    } catch (error) {
      toast.error(error.response?.data?.message || "Không thể xóa bài viết");
    }
  };

  const pageTitle = term?.id
    ? `Biên tập: ${term.title}`
    : module
    ? `Tạo trang mới: ${module.title}`
    : "Tạo trang mới";

  return (
    <AppCard
      className={`border-border shadow-sm transition-all duration-200 ${
        disabled ? "opacity-40 pointer-events-none select-none grayscale-[20%]" : ""
      }`}
    >
      <AppCardHeader className="flex-row items-center justify-between border-b border-border pb-4">
        <AppCardTitle className="flex items-center gap-2.5">
          <FileText className="size-5 text-primary" />
          <span className="truncate max-w-md">{pageTitle}</span>
          {disabled && (
            <span className="rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-semibold text-amber-800 dark:bg-amber-900/30 dark:text-amber-400">
              Đang tạo mục mới
            </span>
          )}
        </AppCardTitle>
        <div className="flex items-center gap-2">
          <AppButton
            appVariant="ghostMuted"
            disabled={disabled}
            onClick={() => setShowPreview((prev) => !prev)}
          >
            <Eye className="mr-2 size-4" />
            {showPreview ? "Biên tập" : "Xem trước"}
          </AppButton>
          {term?.id && (
            <AppButton
              appVariant="ghostMuted"
              disabled={disabled}
              className="text-error hover:bg-error/10"
              onClick={handleDelete}
              title="Xóa bài viết này"
            >
              <Trash2 className="size-4" />
            </AppButton>
          )}
        </div>
      </AppCardHeader>

      <AppCardContent className="space-y-5 pt-6">
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="pageTitle">Tiêu đề bài viết</Label>
            <AppInput
              id="pageTitle"
              disabled={disabled || isSaving}
              value={draft.title}
              onChange={(e) => setDraft({ ...draft, title: e.target.value })}
              placeholder="Ví dụ: Điều khoản sử dụng"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="pageSlug">Đường dẫn URL</Label>
            <AppInput
              id="pageSlug"
              disabled={disabled || isSaving}
              value={draft.urlPath}
              onChange={(e) => setDraft({ ...draft, urlPath: e.target.value })}
              placeholder="/terms/dieu-khoan-su-dung"
            />
          </div>
        </div>

        {/* Trình soạn thảo hoặc Xem trước */}
        {showPreview ? (
          <div
            className="prose prose-sm min-h-72 max-w-none rounded-xl border border-border bg-card p-6 shadow-inner"
            dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(draft.content) }}
          />
        ) : (
          <div className="overflow-hidden rounded-xl border border-border bg-card [&_.ql-container]:min-h-64 [&_.ql-editor]:min-h-64">
            <ReactQuill
              theme="snow"
              placeholder="Nhập nội dung bài viết..."
              readOnly={disabled || isSaving}
              value={draft.content}
              onChange={(content) => setDraft({ ...draft, content })}
            />
          </div>
        )}

        {/* Thanh thao tác dưới cùng */}
        <div className="flex flex-col gap-4 border-t border-border pt-4 sm:flex-row sm:items-center sm:justify-between">
          <label className="flex items-center gap-3 text-sm font-semibold cursor-pointer">
            <Switch
              disabled={disabled || isSaving}
              checked={draft.status === 1}
              onCheckedChange={(checked) => setDraft({ ...draft, status: checked ? 1 : 0 })}
            />
            {draft.status === 1 ? (
              <span className="text-success font-medium">Đã xuất bản</span>
            ) : (
              <span className="text-muted-foreground font-medium">Bản nháp</span>
            )}
          </label>
          <AppButton onClick={handleSave} disabled={disabled || isSaving}>
            {isSaving ? <Loader2 className="mr-2 size-4 animate-spin" /> : <Save className="mr-2 size-4" />}
            Lưu trang
          </AppButton>
        </div>
      </AppCardContent>
    </AppCard>
  );
}

function TermModulesMenu({
  modules = [],
  activeModuleId,
  selectedTermId,
  isCreating,
  setIsCreating,
  createModuleMutation,
  deleteModuleMutation,
  onSelectTerm,
  onCreateTerm,
}) {
  const [title, setTitle] = useState("");
  const [expanded, setExpanded] = useState({});

  const createModule = async () => {
    if (!title.trim()) return toast.error("Vui lòng nhập tên mục");
    try {
      await createModuleMutation.mutateAsync({
        title: title.trim(),
        sortOrder: modules.length,
        status: 1,
        metadata: {},
      });
      setTitle("");
      setIsCreating(false);
      toast.success("Đã tạo mục mới thành công");
    } catch (error) {
      toast.error(error.response?.data?.message || "Không thể tạo mục");
    }
  };

  const cancelCreate = () => {
    setTitle("");
    setIsCreating(false);
  };

  const deleteModule = async (module) => {
    if (module.terms?.length > 0) {
      toast.warning("Hãy xóa hoặc chuyển các bài viết con trong mục này trước");
      return;
    }
    if (!window.confirm(`Bạn có chắc muốn xóa mục "${module.title}"?`)) return;
    try {
      await deleteModuleMutation.mutateAsync(module.id);
      toast.success("Đã xóa mục thành công");
    } catch (error) {
      toast.error(error.response?.data?.message || "Không thể xóa mục");
    }
  };

  return (
    <section className="h-fit space-y-3">
      <h2 className="text-base font-bold text-foreground">Mục Điều khoản</h2>
      <div className="space-y-2">
        {isCreating ? (
          <div className="flex items-center gap-2 rounded-lg border border-primary/40 bg-card p-2 shadow-xs">
            <AppInput
              autoFocus
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Tên mục"
              onKeyDown={(e) => {
                if (e.key === "Enter") createModule();
                if (e.key === "Escape") cancelCreate();
              }}
            />
            <button
              type="button"
              onClick={createModule}
              className="rounded-md p-2 text-primary hover:bg-primary/10 transition-colors"
              aria-label="Xác nhận tạo mục"
              title="Lưu mục"
            >
              <Check className="size-4" />
            </button>
            <button
              type="button"
              onClick={cancelCreate}
              className="rounded-md p-2 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
              aria-label="Hủy tạo mục"
              title="Hủy"
            >
              <X className="size-4" />
            </button>
          </div>
        ) : (
          <AppButton appVariant="ghostMuted" className="w-full justify-start" onClick={() => setIsCreating(true)}>
            <FilePlus2 className="mr-2 size-4" />
            Tạo mục
          </AppButton>
        )}

        {modules.length === 0 && !isCreating ? (
          <p className="px-3 py-4 text-xs text-muted-foreground text-center rounded-lg border border-dashed border-border">
            Chưa có mục nào. Nhấn "Tạo mục" để bắt đầu.
          </p>
        ) : (
          modules.map((module) => {
            const isExpanded = expanded[module.id] !== false;
            const isCurrentModule = activeModuleId === module.id;

            return (
              <div
                key={module.id}
                className={`rounded-lg border bg-card shadow-xs transition-colors ${
                  isCurrentModule ? "border-primary/40" : "border-border"
                }`}
              >
                <div className="flex items-center gap-1 p-2.5">
                  <span className="p-1 text-muted-foreground">
                    <GripVertical className="size-4" />
                  </span>
                  <button
                    type="button"
                    className="min-w-0 flex-1 text-left text-sm font-semibold text-foreground truncate hover:text-primary"
                    onClick={() => setExpanded((prev) => ({ ...prev, [module.id]: !isExpanded }))}
                  >
                    {module.title}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setExpanded((prev) => ({ ...prev, [module.id]: true }));
                      onCreateTerm(module);
                    }}
                    className="rounded-md p-1.5 text-primary hover:bg-primary/10 transition-colors"
                    aria-label={`Tạo trang trong mục ${module.title}`}
                    title="Tạo bài viết mới trong mục này"
                  >
                    <Plus className="size-4" />
                  </button>
                  {(!module.terms || module.terms.length === 0) && (
                    <button
                      type="button"
                      onClick={() => deleteModule(module)}
                      className="rounded-md p-1.5 text-muted-foreground hover:bg-error/10 hover:text-error transition-colors"
                      title="Xóa mục trống này"
                    >
                      <Trash2 className="size-3.5" />
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => setExpanded((prev) => ({ ...prev, [module.id]: !isExpanded }))}
                    className="p-1.5 text-muted-foreground hover:text-foreground transition-colors"
                    aria-label="Thu gọn hoặc mở mục"
                  >
                    <ChevronDown className={`size-4 transition-transform ${isExpanded ? "" : "-rotate-90"}`} />
                  </button>
                </div>

                {isExpanded && (
                  <div className="space-y-1 border-t border-border p-2">
                    {activeModuleId === module.id && selectedTermId === "new" && (
                      <div className="block w-full rounded-md bg-primary/10 px-3 py-2 text-left text-sm font-medium text-primary">
                        + (Trang mới)
                      </div>
                    )}
                    {module.terms?.length ? (
                      module.terms.map((term) => {
                        const isSelected = selectedTermId === term.id;
                        return (
                          <button
                            key={term.id}
                            type="button"
                            onClick={() => onSelectTerm(term, module)}
                            className={`block w-full rounded-md px-3 py-2 text-left text-sm transition-colors ${
                              isSelected
                                ? "bg-primary/10 font-bold text-primary"
                                : "text-muted-foreground hover:bg-muted hover:text-foreground"
                            }`}
                          >
                            {term.title}
                          </button>
                        );
                      })
                    ) : (
                      activeModuleId !== module.id || selectedTermId !== "new" ? (
                        <p className="px-3 py-2 text-xs italic text-muted-foreground">(Chưa có bài viết)</p>
                      ) : null
                    )}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </section>
  );
}

export default function PageSettings() {
  const {
    data: modules = [],
    isLoading,
    createModuleMutation,
    deleteModuleMutation,
    createTermMutation,
    updateTermMutation,
    deleteTermMutation,
  } = useAdminTerms();

  const [activeModule, setActiveModule] = useState(null);
  const [selectedTerm, setSelectedTerm] = useState(null);
  const [isCreatingTerm, setIsCreatingTerm] = useState(false);
  const [isCreatingModule, setIsCreatingModule] = useState(false);

  // Tự động chọn bài viết đầu tiên nếu chưa chọn gì
  useEffect(() => {
    if (!activeModule && modules.length > 0) {
      const firstMod = modules[0];
      setActiveModule(firstMod);
      if (firstMod.terms?.length > 0) {
        setSelectedTerm(firstMod.terms[0]);
        setIsCreatingTerm(false);
      } else {
        setSelectedTerm(null);
        setIsCreatingTerm(true);
      }
    }
  }, [modules, activeModule]);

  if (isLoading) {
    return (
      <div className="grid gap-6 lg:grid-cols-[380px_minmax(0,1fr)]">
        <div className="space-y-3 rounded-xl border border-border bg-card p-5">
          <Skeleton className="h-6 w-36" />
          {Array.from({ length: 4 }).map((_, index) => (
            <Skeleton key={index} className="h-12 w-full" />
          ))}
        </div>
        <div className="space-y-5 rounded-xl border border-border bg-card p-5">
          <Skeleton className="h-7 w-56" />
          <div className="grid gap-4 md:grid-cols-2">
            <Skeleton className="h-11 w-full" />
            <Skeleton className="h-11 w-full" />
          </div>
          <Skeleton className="h-72 w-full" />
          <Skeleton className="h-11 w-40 ml-auto" />
        </div>
      </div>
    );
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[380px_minmax(0,1fr)]">
      <TermModulesMenu
        modules={modules}
        activeModuleId={activeModule?.id}
        selectedTermId={isCreatingTerm ? "new" : selectedTerm?.id}
        isCreating={isCreatingModule}
        setIsCreating={setIsCreatingModule}
        createModuleMutation={createModuleMutation}
        deleteModuleMutation={deleteModuleMutation}
        onSelectTerm={(term, mod) => {
          setActiveModule(mod);
          setSelectedTerm(term);
          setIsCreatingTerm(false);
        }}
        onCreateTerm={(mod) => {
          setActiveModule(mod);
          setSelectedTerm(null);
          setIsCreatingTerm(true);
        }}
      />

      <TermEditor
        key={isCreatingTerm ? `new-${activeModule?.id}` : selectedTerm?.id || "empty"}
        module={activeModule}
        term={isCreatingTerm ? null : selectedTerm}
        disabled={isCreatingModule}
        createTermMutation={createTermMutation}
        updateTermMutation={updateTermMutation}
        deleteTermMutation={deleteTermMutation}
        onSaved={(saved) => {
          setIsCreatingTerm(false);
          setSelectedTerm(saved);
        }}
        onDeleted={() => {
          setSelectedTerm(null);
          setIsCreatingTerm(false);
        }}
      />
    </div>
  );
}
