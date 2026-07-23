import { useState } from "react";
import DOMPurify from "dompurify";
import ReactQuill from "react-quill-new";
import "react-quill-new/dist/quill.snow.css";
import { Check, ChevronDown, Eye, FilePlus2, GripVertical, Loader2, Plus, Save, Trash2 } from "lucide-react";
import { toast } from "sonner";
import AppCard, { AppCardContent, AppCardHeader, AppCardTitle } from "@/components/common/micro/AppCard";
import { AppButton } from "@/components/common/micro/AppButton";
import AppInput from "@/components/common/micro/AppInput";
import { Label } from "@/components/common/micro/AppLabel";
import { Switch } from "@/components/ui/switch";
import { useAdminPages, useAdminTerms } from "@/hooks/settings/useSiteSettings";
import Skeleton from "@/components/common/micro/AppSkeleton";

const EMPTY_PAGE = { title: "", slug: "", urlPath: "", content: "<p>Nhập nội dung trang...</p>", metadata: {}, status: 0 };

const createPageDraft = (page) => ({ ...(page || EMPTY_PAGE), metadata: page?.metadata || {}, urlPath: page?.slug ? `/${page.slug}` : "" });
const toSlug = (urlPath) => {
  const normalizedPath = urlPath.trim().toLowerCase();
  if (!/^\/[a-z0-9]+(?:-[a-z0-9]+)*(?:\/[a-z0-9]+(?:-[a-z0-9]+)*)*$/.test(normalizedPath)) return null;
  return normalizedPath.slice(1);
};

function PageEditor({ page, module, createMutation, updateMutation, deleteMutation, onSaved, onDeleted }) {
  const [draft, setDraft] = useState(() => createPageDraft(page));
  const [showPreview, setShowPreview] = useState(false);
  const isSaving = createMutation.isPending || updateMutation.isPending;
  const isTermsPage = draft.urlPath.trim().toLowerCase().startsWith("/terms");
  const updateTermsMetadata = (key, value) => setDraft({ ...draft, metadata: { ...draft.metadata, [key]: value } });

  const savePage = async () => {
    const slug = toSlug(draft.urlPath);
    if (!draft.title.trim() || !slug || !draft.content.trim()) {
      toast.error("Vui lòng nhập tiêu đề, đường dẫn URL dạng /ten-trang và nội dung");
      return;
    }
    const payload = {
      title: draft.title.trim(),
      slug,
      content: draft.content,
      metadata: draft.metadata,
      status: draft.status,
    };
    try {
      const saved = page?.id
        ? await updateMutation.mutateAsync({ id: page.id, ...payload })
        : await createMutation.mutateAsync(payload);
      setDraft(createPageDraft(saved));
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
        <AppCardTitle>{page?.id ? `Biên tập: ${page.title}` : module ? `Tạo trang mới: ${module.title}` : "Tạo trang mới"}</AppCardTitle>
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
            <Label htmlFor="pageSlug">Đường dẫn URL</Label>
            <AppInput id="pageSlug" value={draft.urlPath} onChange={(event) => setDraft({ ...draft, urlPath: event.target.value })} placeholder="/privacy-policy" />
          </div>
        </div>

        {isTermsPage && (
          <div className="space-y-4 rounded-xl border border-border bg-muted/40 p-4">
            <div>
              <h3 className="font-semibold text-foreground">Hiển thị trong menu Điều khoản</h3>
              <p className="mt-1 text-sm text-muted-foreground">Tạo module bằng cách nhập tên nhóm. Các trang cùng tên nhóm sẽ được xếp chung.</p>
            </div>
            <div className="grid gap-4 md:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="termsMenuGroup">Tên module</Label>
                <AppInput id="termsMenuGroup" value={draft.metadata.menuGroup || ""} onChange={(event) => updateTermsMetadata("menuGroup", event.target.value)} placeholder="Ví dụ: Giảng viên" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="termsMenuOrder">Thứ tự module</Label>
                <AppInput id="termsMenuOrder" type="number" min="0" value={draft.metadata.menuOrder ?? 0} onChange={(event) => updateTermsMetadata("menuOrder", Number(event.target.value))} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="termsPageOrder">Thứ tự trang</Label>
                <AppInput id="termsPageOrder" type="number" min="0" value={draft.metadata.pageOrder ?? 0} onChange={(event) => updateTermsMetadata("pageOrder", Number(event.target.value))} />
              </div>
            </div>
            <label className="flex items-center gap-3 text-sm font-semibold text-foreground">
              <Switch checked={draft.metadata.showInTermsMenu !== false} onCheckedChange={(checked) => updateTermsMetadata("showInTermsMenu", checked)} />
              Hiển thị trang này trong menu Điều khoản
            </label>
          </div>
        )}

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

function TermModulesMenu({ creatingModuleId, onCreateTerm }) {
  const { data: modules = [], createModuleMutation } = useAdminTerms();
  const [isCreating, setIsCreating] = useState(false);
  const [title, setTitle] = useState("");
  const [expanded, setExpanded] = useState({});
  const [orderedModules, setOrderedModules] = useState([]);
  const [draggedId, setDraggedId] = useState(null);
  const createModule = async () => {
    if (!title.trim()) return toast.error("Vui lòng nhập tên mục");
    await createModuleMutation.mutateAsync({ title: title.trim(), sortOrder: modules.length, status: 1, metadata: {} });
    setTitle(""); setIsCreating(false);
  };
  return <section className="h-fit space-y-3"><h2 className="text-base font-bold text-foreground">Mục Điều khoản</h2><div className="space-y-2">
    {isCreating ? <div className="flex items-center gap-2 rounded-lg border border-primary/30 p-2"><AppInput autoFocus value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Tên mục" onKeyDown={(e) => e.key === "Enter" && createModule()} /><button type="button" onClick={createModule} className="rounded-md p-2 text-primary hover:bg-primary/10" aria-label="Xác nhận tạo mục"><Check className="size-4" /></button></div> : <AppButton appVariant="ghostMuted" className="w-full justify-start" onClick={() => setIsCreating(true)}><FilePlus2 className="mr-2 size-4" />Tạo mục</AppButton>}
    {(orderedModules.length ? orderedModules : modules).map((module) => { const open = expanded[module.id] !== false; const isCreatingTerm = creatingModuleId === module.id; return <div key={module.id} draggable onDragStart={() => { setOrderedModules(modules); setDraggedId(module.id); setExpanded({}); }} onDragOver={(event) => event.preventDefault()} onDrop={() => setOrderedModules((current) => { const from = current.findIndex((item) => item.id === draggedId); const to = current.findIndex((item) => item.id === module.id); if (from < 0 || to < 0) return current; const next = [...current]; next.splice(to, 0, next.splice(from, 1)[0]); return next; })} onDragEnd={() => setDraggedId(null)} className="rounded-lg border border-border bg-card"><div className="flex items-center gap-1 p-2.5"><span className="cursor-grab p-1 text-muted-foreground active:cursor-grabbing" aria-label="Kéo để đổi vị trí"><GripVertical className="size-4" /></span><button type="button" className="min-w-0 flex-1 text-left text-sm font-medium text-foreground" onClick={() => setExpanded((s) => ({ ...s, [module.id]: !open }))}>{module.title}</button><button type="button" onClick={() => { setExpanded((s) => ({ ...s, [module.id]: true })); onCreateTerm(module); }} className="rounded-md p-1.5 text-primary hover:bg-primary/10" aria-label={`Tạo trang trong mục ${module.title}`}><Plus className="size-4" /></button><button type="button" onClick={() => setExpanded((s) => ({ ...s, [module.id]: !open }))} className="p-1.5 text-muted-foreground hover:text-foreground" aria-label="Thu gọn hoặc mở mục"><ChevronDown className={`size-4 transition-transform ${open ? "" : "-rotate-90"}`} /></button></div>{open && <div className="space-y-1 border-t border-border p-2">{isCreatingTerm && <button type="button" className="block w-full rounded-md bg-primary/10 px-3 py-2 text-left text-sm font-medium text-primary">(Trang mới)</button>}{module.terms?.length ? module.terms.map((term) => <button key={term.id} type="button" className="block w-full rounded-md px-3 py-2 text-left text-sm text-muted-foreground hover:bg-muted hover:text-foreground">{term.title}</button>) : !isCreatingTerm && <p className="px-3 py-2 text-sm text-muted-foreground">(Chưa có trang)</p>}</div>}</div>; })}
  </div></section>;
}

export default function PageSettings() {
  const { data: pages = [], isLoading, createMutation, updateMutation, deleteMutation } = useAdminPages();
  const [selectedId, setSelectedId] = useState(null);
  const [newTermModule, setNewTermModule] = useState(null);
  const selectedPage = selectedId === "new" ? null : pages.find((page) => page.id === selectedId) || pages[0] || null;
  const editorKey = selectedId === "new" ? "new" : selectedPage?.id || "empty";

  if (isLoading) return <div className="grid gap-6 lg:grid-cols-[420px_minmax(0,1fr)]"><div className="space-y-3 rounded-xl border border-border bg-card p-5"><Skeleton className="h-6 w-36" />{Array.from({ length: 4 }).map((_, index) => <Skeleton key={index} className="h-12 w-full" />)}</div><div className="space-y-5 rounded-xl border border-border bg-card p-5"><Skeleton className="h-7 w-56" /><div className="grid gap-4 md:grid-cols-2"><Skeleton className="h-11 w-full" /><Skeleton className="h-11 w-full" /></div><Skeleton className="h-72 w-full" /><Skeleton className="h-11 w-40 ml-auto" /></div></div>;

  return (
    <div className="grid gap-6 lg:grid-cols-[420px_minmax(0,1fr)]">
      <TermModulesMenu creatingModuleId={newTermModule?.id} onCreateTerm={(module) => { setNewTermModule(module); setSelectedId("new"); }} />
      {/* <AppCard className="h-fit border-border shadow-sm">
        <AppCardHeader><AppCardTitle>Mục Điều khoản</AppCardTitle></AppCardHeader>
        <AppCardContent className="space-y-2">
          <AppButton appVariant="ghostMuted" className="w-full justify-start" onClick={() => setSelectedId("new")}><FilePlus2 className="mr-2 size-4" />Tạo mục</AppButton>
          {pages.map((page) => (
            <div key={page.id} className={`rounded-lg transition-colors ${selectedPage?.id === page.id && selectedId !== "new" ? "bg-primary/10" : "hover:bg-muted"}`}>
              <div className="flex items-center gap-1 px-3 py-2">
                <button type="button" onClick={() => setSelectedId(page.id)} className="min-w-0 flex-1 text-left text-sm">
                  <span className="block truncate font-semibold">{page.title}</span>
                  <span className="block text-xs text-muted-foreground">/{page.slug}</span>
                </button>
                <button type="button" onClick={() => setSelectedId("new")} className="rounded-md p-1.5 text-primary hover:bg-primary/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" aria-label={`Tạo trang trong mục ${page.title}`}><Plus className="size-4" /></button>
              </div>
            </div>
          ))}
        </AppCardContent>
      </AppCard> */}

      <PageEditor
        key={editorKey}
        page={selectedPage}
        module={selectedId === "new" ? newTermModule : null}
        createMutation={createMutation}
        updateMutation={updateMutation}
        deleteMutation={deleteMutation}
        onSaved={(saved) => setSelectedId(saved.id)}
        onDeleted={() => setSelectedId(null)}
      />
    </div>
  );
}
