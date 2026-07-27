import AppCard, { AppCardContent, AppCardHeader, AppCardTitle } from "@/components/common/micro/AppCard";
import AppInput from "@/components/common/micro/AppInput";
import AppTextarea from "@/components/common/micro/AppTextarea";
import { Label } from "@/components/common/micro/AppLabel";
import { Image as ImageIcon, Loader2, Plus, Trash2 } from "lucide-react";
import { AppButton } from "@/components/common/micro/AppButton";
import { aboutCTAMock, aboutHeroMock, aboutStepsMock, aboutToolsMock, aboutVisionMock } from "@/mocks/staticPages";

const defaults = {
  hero: aboutHeroMock,
  toolsHeading: "Công cụ Học tập Chuyên biệt của Chúng tôi",
  toolsDescription: "Công nghệ tiên tiến kết hợp với thiết kế tinh tế để mang lại hành trình giáo dục liền mạch, phù hợp với tiềm năng độc nhất của bạn.",
  tools: aboutToolsMock.map(({ title, description }) => ({ title, description, url: "" })),
  solutionsEyebrow: "CÁCH CHÚNG TÔI LÀM VIỆC",
  solutionsTitle: "Giải pháp Học tập Đơn giản!",
  steps: aboutStepsMock,
  solutionsPrimaryCta: "Tìm hiểu thêm",
  solutionsPrimaryCtaUrl: "",
  solutionsSecondaryCta: "Triết lý của Chúng tôi",
  solutionsSecondaryCtaUrl: "",
  vision: aboutVisionMock,
  testimonialsDescription: "",
  testimonials: [],
  cta: aboutCTAMock,
};

function parseContent(raw) {
  try { return raw ? { ...defaults, ...JSON.parse(raw) } : defaults; }
  catch { return defaults; }
}

export default function AboutSettings({ values, onChange, onImageUpload, onTestimonialAvatarUpload, isUploading }) {
  const content = parseContent(values["about.content"]);
  const set = (path, value) => {
    const next = structuredClone(content);
    let target = next;
    path.slice(0, -1).forEach((key) => { target = target[key]; });
    target[path.at(-1)] = value;
    onChange("about.content", JSON.stringify(next));
  };
  const updateList = (key, index, field, value) => {
    const list = content[key].map((item, itemIndex) => itemIndex === index ? { ...item, [field]: value } : item);
    set([key], list);
  };

  return <div className="space-y-6">
    <Section title="Banner trang Giới thiệu">
      <div className="grid md:grid-cols-3 gap-4">
        <ImageField label="Banner mở đầu" settingKey="about.hero_banner_url" {...{ values, onImageUpload, isUploading }} />
        <ImageField label="Banner giải pháp" settingKey="about.solutions_banner_url" {...{ values, onImageUpload, isUploading }} />
        <ImageField label="Banner tầm nhìn" settingKey="about.vision_banner_url" {...{ values, onImageUpload, isUploading }} />
      </div>
    </Section>
    <Section title="Phần mở đầu">
      <Grid>
        <Field label="Nhãn nhỏ" value={content.hero.badge} onChange={(v) => set(["hero", "badge"], v)} />
        <Field label="Phần chữ nhấn mạnh" value={content.hero.highlight} onChange={(v) => set(["hero", "highlight"], v)} />
      </Grid>
      <Field label="Tiêu đề" value={content.hero.title} onChange={(v) => set(["hero", "title"], v)} />
      <TextField label="Mô tả" value={content.hero.description} onChange={(v) => set(["hero", "description"], v)} />
      <Grid><Field label="Nút chính" value={content.hero.primaryCta} onChange={(v) => set(["hero", "primaryCta"], v)} /><Field label="Nút phụ" value={content.hero.secondaryCta} onChange={(v) => set(["hero", "secondaryCta"], v)} /></Grid>
      <Grid><UrlField label="URL nút chính" value={content.hero.primaryCtaUrl} onChange={(v) => set(["hero", "primaryCtaUrl"], v)} /><UrlField label="URL nút phụ" value={content.hero.secondaryCtaUrl} onChange={(v) => set(["hero", "secondaryCtaUrl"], v)} /></Grid>
    </Section>
    <Section title="Công cụ học tập">
      <Field label="Tiêu đề khối" value={content.toolsHeading} onChange={(v) => set(["toolsHeading"], v)} />
      <TextField label="Mô tả khối" value={content.toolsDescription} onChange={(v) => set(["toolsDescription"], v)} />
      <ToolEditor items={content.tools} onUpdate={(i, f, v) => updateList("tools", i, f, v)} onAdd={() => set(["tools"], [...content.tools, { title: "Công cụ mới", description: "", url: "" }])} onRemove={(i) => set(["tools"], content.tools.filter((_, x) => x !== i))} />
    </Section>
    <Section title="Quy trình và giải pháp">
      <Grid><Field label="Nhãn nhỏ" value={content.solutionsEyebrow} onChange={(v) => set(["solutionsEyebrow"], v)} /><Field label="Tiêu đề" value={content.solutionsTitle} onChange={(v) => set(["solutionsTitle"], v)} /></Grid>
      <ListEditor items={content.steps} onUpdate={(i, f, v) => updateList("steps", i, f, v)} onAdd={() => set(["steps"], [...content.steps, { title: "Bước mới", description: "" }])} onRemove={(i) => set(["steps"], content.steps.filter((_, x) => x !== i))} />
      <Grid><Field label="Nút chính" value={content.solutionsPrimaryCta} onChange={(v) => set(["solutionsPrimaryCta"], v)} /><Field label="Nút phụ" value={content.solutionsSecondaryCta} onChange={(v) => set(["solutionsSecondaryCta"], v)} /></Grid>
      <Grid><UrlField label="URL nút chính" value={content.solutionsPrimaryCtaUrl} onChange={(v) => set(["solutionsPrimaryCtaUrl"], v)} /><UrlField label="URL nút phụ" value={content.solutionsSecondaryCtaUrl} onChange={(v) => set(["solutionsSecondaryCtaUrl"], v)} /></Grid>
    </Section>
    <Section title="Tầm nhìn">
      <Field label="Tiêu đề" value={content.vision.title} onChange={(v) => set(["vision", "title"], v)} />
      <TextField label="Đoạn 1" value={content.vision.paragraphs?.[0] || ""} onChange={(v) => set(["vision", "paragraphs"], [v, content.vision.paragraphs?.[1] || ""])} />
      <TextField label="Đoạn 2" value={content.vision.paragraphs?.[1] || ""} onChange={(v) => set(["vision", "paragraphs"], [content.vision.paragraphs?.[0] || "", v])} />
      <Grid><Field label="Trích dẫn" value={content.vision.quote} onChange={(v) => set(["vision", "quote"], v)} /><Field label="Tác giả" value={content.vision.author} onChange={(v) => set(["vision", "author"], v)} /></Grid>
    </Section>
    <Section title="Học viên nói gì">
      <TextField label="Mô tả phần học viên nói gì" value={content.testimonialsDescription} onChange={(v) => set(["testimonialsDescription"], v)} />
      <TestimonialEditor
        items={content.testimonials}
        onUpdate={(index, field, value) => updateList("testimonials", index, field, value)}
        onAdd={() => set(["testimonials"], [...content.testimonials, { name: "Học viên mới", role: "", avatar: "", rating: 5, text: "" }])}
        onRemove={(index) => set(["testimonials"], content.testimonials.filter((_, itemIndex) => itemIndex !== index))}
        onAvatarUpload={onTestimonialAvatarUpload}
        isUploading={isUploading}
      />
    </Section>
    <Section title="Kêu gọi hành động cuối trang">
      <Field label="Tiêu đề" value={content.cta.title} onChange={(v) => set(["cta", "title"], v)} />
      <TextField label="Mô tả" value={content.cta.description} onChange={(v) => set(["cta", "description"], v)} />
      <Field label="Nội dung nút" value={content.cta.buttonText} onChange={(v) => set(["cta", "buttonText"], v)} />
      <UrlField label="URL nút" value={content.cta.buttonUrl} onChange={(v) => set(["cta", "buttonUrl"], v)} />
    </Section>
  </div>;
}

function Section({ title, children }) { return <AppCard><AppCardHeader><AppCardTitle>{title}</AppCardTitle></AppCardHeader><AppCardContent className="space-y-4">{children}</AppCardContent></AppCard>; }
function Grid({ children }) { return <div className="grid md:grid-cols-2 gap-4">{children}</div>; }
function Field({ label, value = "", onChange }) { return <div className="space-y-2"><Label>{label}</Label><AppInput value={value} onChange={(e) => onChange(e.target.value)} /></div>; }
function UrlField({ label, value = "", onChange }) { return <div className="space-y-2"><Label>{label}</Label><AppInput type="url" value={value} placeholder="/courses hoặc https://..." onChange={(e) => onChange(e.target.value)} /></div>; }
function TextField({ label, value = "", onChange }) { return <div className="space-y-2"><Label>{label}</Label><AppTextarea value={value} onChange={(e) => onChange(e.target.value)} className="min-h-24" /></div>; }
function ListEditor({ items = [], onUpdate, onAdd, onRemove }) { return <div className="space-y-3">{items.map((item, i) => <div key={i} className="grid gap-3 rounded-xl border p-3 md:grid-cols-[1fr_2fr_auto]"><AppInput value={item.title} onChange={(e) => onUpdate(i, "title", e.target.value)} /><AppTextarea value={item.description} onChange={(e) => onUpdate(i, "description", e.target.value)} /><AppButton type="button" variant="ghost" size="icon" onClick={() => onRemove(i)}><Trash2 className="w-4 h-4" /></AppButton></div>)}<AppButton type="button" variant="outline" onClick={onAdd}><Plus className="w-4 h-4 mr-2" />Thêm mục</AppButton></div>; }

function ToolEditor({ items = [], onUpdate, onAdd, onRemove }) {
  return <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">{items.map((item, index) => <div key={index} className="aspect-square overflow-y-auto rounded-xl border border-border bg-card p-4 scrollbar-thin"><div className="flex items-start justify-between gap-3"><p className="font-semibold text-foreground">Công cụ {index + 1}</p><AppButton type="button" variant="ghost" size="icon" onClick={() => onRemove(index)} aria-label={`Xóa công cụ ${index + 1}`}><Trash2 className="w-4 h-4" /></AppButton></div><div className="mt-3 space-y-3"><Field label="Tên công cụ" value={item.title} onChange={(value) => onUpdate(index, "title", value)} /><UrlField label="URL nút Đọc thêm" value={item.url} onChange={(value) => onUpdate(index, "url", value)} /><TextField label="Mô tả" value={item.description} onChange={(value) => onUpdate(index, "description", value)} /></div></div>)}<button type="button" onClick={onAdd} className="flex aspect-square flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed border-border bg-muted/40 p-4 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"><Plus className="w-7 h-7" /><span className="font-semibold">Thêm công cụ</span></button></div>;
}
function ImageField({ label, settingKey, values, onImageUpload, isUploading }) { return <div className="space-y-2"><Label>{label}</Label><label className="block aspect-square rounded-xl border-2 border-dashed overflow-hidden cursor-pointer bg-muted"><input type="file" accept="image/*" className="sr-only" disabled={isUploading} onChange={(e) => onImageUpload(e.target.files?.[0], settingKey)} />{isUploading ? <span className="h-full flex items-center justify-center"><Loader2 className="animate-spin" /></span> : values[settingKey] ? <img src={values[settingKey]} alt={label} className="w-full h-full object-cover" /> : <span className="h-full flex flex-col gap-2 items-center justify-center text-muted-foreground"><ImageIcon /><small>Chọn ảnh (tối đa 5MB)</small></span>}</label></div>; }
function TestimonialEditor({ items = [], onUpdate, onAdd, onRemove, onAvatarUpload, isUploading }) {
  const handleAvatarChange = async (event, index) => {
    const url = await onAvatarUpload?.(event.target.files?.[0]);
    if (url) onUpdate(index, "avatar", url);
    event.target.value = "";
  };

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {items.map((item, index) => (
        <div key={index} className="aspect-square overflow-y-auto rounded-xl border border-border bg-card p-4 scrollbar-thin">
          <div className="flex items-start gap-3">
            <label className="block w-20 shrink-0 cursor-pointer">
              <span className="sr-only">Tải ảnh đại diện cho học viên {index + 1}</span>
              <input type="file" accept="image/*" className="sr-only" disabled={isUploading} onChange={(event) => handleAvatarChange(event, index)} />
              <span className="flex aspect-square items-center justify-center overflow-hidden rounded-xl border-2 border-dashed border-border bg-muted text-muted-foreground">
                {isUploading ? <Loader2 className="animate-spin" /> : item.avatar ? <img src={item.avatar} alt={item.name || `Học viên ${index + 1}`} className="h-full w-full object-cover" /> : <ImageIcon className="w-5 h-5" />}
              </span>
              <span className="mt-1 block text-center text-xs font-medium text-primary">Tải ảnh</span>
            </label>
            <div className="min-w-0 flex-1 space-y-2">
              <Field label="Họ tên" value={item.name} onChange={(value) => onUpdate(index, "name", value)} />
              <Field label="Vai trò" value={item.role} onChange={(value) => onUpdate(index, "role", value)} />
            </div>
            <AppButton type="button" variant="ghost" size="icon" onClick={() => onRemove(index)} aria-label={`Xóa học viên ${index + 1}`}><Trash2 className="w-4 h-4" /></AppButton>
          </div>
          <div className="mt-3 grid grid-cols-[110px_minmax(0,1fr)] gap-3">
            <div className="space-y-2"><Label>Đánh giá</Label><AppInput type="number" min="1" max="5" value={item.rating} onChange={(event) => onUpdate(index, "rating", Number(event.target.value))} /></div>
            <TextField label="Nhận xét" value={item.text} onChange={(value) => onUpdate(index, "text", value)} />
          </div>
        </div>
      ))}
      <button type="button" onClick={onAdd} className="flex aspect-square flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed border-border bg-muted/40 p-4 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
        <Plus className="w-7 h-7" />
        <span className="font-semibold">Thêm học viên</span>
      </button>
    </div>
  );
}
