import { useState } from "react";
import DOMPurify from "dompurify";
import ReactQuill from "react-quill-new";
import "react-quill-new/dist/quill.snow.css";
import { Eye, FilePlus2, Loader2, Save, Trash2 } from "lucide-react";
import { toast } from "sonner";
import AppCard, { AppCardContent, AppCardHeader, AppCardTitle } from "@/components/common/micro/AppCard";
import { AppButton } from "@/components/common/micro/AppButton";
import AppInput from "@/components/common/micro/AppInput";
import { Label } from "@/components/common/micro/AppLabel";
import { Switch } from "@/components/ui/switch";
import { useAdminPages } from "@/hooks/settings/useSiteSettings";
import Skeleton from "@/components/common/micro/AppSkeleton";

const EMPTY_PAGE = { title: "", slug: "", content: "<p>Nhập nội dung trang...</p>", status: 0 };

function PageEditor({ page, createMutation, updateMutation, deleteMutation, onSaved, onDeleted }) {
  const [draft, setDraft] = useState(page || EMPTY_PAGE);
  const [showPreview, setShowPreview] = useState(false);
  const isSaving = createMutation.isPending || updateMutation.isPending;

  const savePage = async () => {
    if (!draft.title.trim() || !draft.slug.trim() || !draft.content.trim()) {
      toast.error("Vui lòng nhập đầy đủ tiêu đề, slug và nội dung");
      return;
    }
    const payload = {
      title: draft.title.trim(),
      slug: draft.slug.trim().toLowerCase(),
      content: draft.content,
      status: draft.status,
    };
    try {
      const saved = page?.id
        ? await updateMutation.mutateAsync({ id: page.id, ...payload })
        : await createMutation.mutateAsync(payload);
      setDraft(saved);
      onSaved(saved);
      toast.success("Đã lưu trang nội dung");
    } catch (error) {
      toast.error(error.response?.data?.message || "Không thể lưu trang nội dung");
    }
  };

  const deletePage = async () => {
    if (!page?.id || !window.confirm("Bạn có chắc muốn xóa trang này?")) return;
    try {
      await deleteMutation.mutateAsync(page.id);
      onDeleted();
      toast.success("Đã xóa trang nội dung");
    } catch (error) {
      toast.error(error.response?.data?.message || "Không thể xóa trang nội dung");
    }
  };

  return (
    <AppCard className="border-border shadow-sm">
      <AppCardHeader className="flex-row items-center justify-between">
        <AppCardTitle>{page?.id ? `Biên tập: ${page.title}` : "Tạo trang mới"}</AppCardTitle>
        <div className="flex gap-2">
          <AppButton appVariant="ghostMuted" onClick={() => setShowPreview((value) => !value)}><Eye className="mr-2 size-4" />{showPreview ? "Biên tập" : "Xem trước"}</AppButton>
          {page?.id && <AppButton appVariant="ghostMuted" className="text-error" onClick={deletePage}><Trash2 className="size-4" /></AppButton>}
        </div>
      </AppCardHeader>
      <AppCardContent className="space-y-5">
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="pageTitle">Tiêu đề</Label>
            <AppInput id="pageTitle" value={draft.title} onChange={(event) => setDraft({ ...draft, title: event.target.value })} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="pageSlug">Slug</Label>
            <AppInput id="pageSlug" value={draft.slug} onChange={(event) => setDraft({ ...draft, slug: event.target.value.replace(/[^a-z0-9-]/g, "") })} placeholder="privacy-policy" />
          </div>
        </div>

        {showPreview ? (
          <div className="prose prose-sm min-h-72 max-w-none rounded-xl border border-border bg-card p-6" dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(draft.content) }} />
        ) : (
          <div className="overflow-hidden rounded-xl border border-border bg-card [&_.ql-container]:min-h-64 [&_.ql-editor]:min-h-64">
            <ReactQuill theme="snow" value={draft.content} onChange={(content) => setDraft({ ...draft, content })} />
          </div>
        )}

        <div className="flex flex-col gap-4 border-t border-border pt-4 sm:flex-row sm:items-center sm:justify-between">
          <label className="flex items-center gap-3 text-sm font-semibold">
            <Switch checked={draft.status === 1} onCheckedChange={(checked) => setDraft({ ...draft, status: checked ? 1 : 0 })} />
            {draft.status === 1 ? "Đã xuất bản" : "Bản nháp"}
          </label>
          <AppButton onClick={savePage} disabled={isSaving}>
            {isSaving ? <Loader2 className="mr-2 size-4 animate-spin" /> : <Save className="mr-2 size-4" />}
            Lưu trang
          </AppButton>
        </div>
      </AppCardContent>
    </AppCard>
  );
}

export default function PageSettings() {
  const { data: pages = [], isLoading, createMutation, updateMutation, deleteMutation } = useAdminPages();
  const [selectedId, setSelectedId] = useState(null);
  const selectedPage = selectedId === "new" ? null : pages.find((page) => page.id === selectedId) || pages[0] || null;
  const editorKey = selectedId === "new" ? "new" : selectedPage?.id || "empty";

  if (isLoading) return <div className="grid gap-6 lg:grid-cols-[260px_minmax(0,1fr)]"><div className="space-y-3 rounded-xl border border-border bg-card p-5"><Skeleton className="h-6 w-36" />{Array.from({ length: 4 }).map((_, index) => <Skeleton key={index} className="h-12 w-full" />)}</div><div className="space-y-5 rounded-xl border border-border bg-card p-5"><Skeleton className="h-7 w-56" /><div className="grid gap-4 md:grid-cols-2"><Skeleton className="h-11 w-full" /><Skeleton className="h-11 w-full" /></div><Skeleton className="h-72 w-full" /><Skeleton className="h-11 w-40 ml-auto" /></div></div>;

  return (
    <div className="grid gap-6 lg:grid-cols-[260px_minmax(0,1fr)]">
      <AppCard className="h-fit border-border shadow-sm">
        <AppCardHeader><AppCardTitle>Trang nội dung</AppCardTitle></AppCardHeader>
        <AppCardContent className="space-y-2">
          <AppButton appVariant="ghostMuted" className="w-full justify-start" onClick={() => setSelectedId("new")}><FilePlus2 className="mr-2 size-4" />Tạo trang mới</AppButton>
          {pages.map((page) => (
            <button key={page.id} type="button" onClick={() => setSelectedId(page.id)} className={`w-full rounded-lg px-3 py-2 text-left text-sm transition-colors ${selectedPage?.id === page.id && selectedId !== "new" ? "bg-primary/10 font-bold text-primary" : "hover:bg-muted"}`}>
              <span className="block truncate">{page.title}</span>
              <span className="text-xs text-muted-foreground">/{page.slug} · {page.status === 1 ? "Đã xuất bản" : "Nháp"}</span>
            </button>
          ))}
        </AppCardContent>
      </AppCard>

      <PageEditor
        key={editorKey}
        page={selectedPage}
        createMutation={createMutation}
        updateMutation={updateMutation}
        deleteMutation={deleteMutation}
        onSaved={(saved) => setSelectedId(saved.id)}
        onDeleted={() => setSelectedId(null)}
      />
    </div>
  );
}
