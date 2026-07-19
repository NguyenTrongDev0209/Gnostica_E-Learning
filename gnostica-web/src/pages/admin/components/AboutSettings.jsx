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
  tools: aboutToolsMock.map(({ title, description }) => ({ title, description })),
  solutionsEyebrow: "CÁCH CHÚNG TÔI LÀM VIỆC",
  solutionsTitle: "Giải pháp Học tập Đơn giản!",
  steps: aboutStepsMock,
  vision: aboutVisionMock,
  cta: aboutCTAMock,
};

function parseContent(raw) {
  try { return raw ? { ...defaults, ...JSON.parse(raw) } : defaults; }
  catch { return defaults; }
}

export default function AboutSettings({ values, onChange, onImageUpload, isUploading }) {
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
    </Section>
    <Section title="Công cụ học tập">
      <Field label="Tiêu đề khối" value={content.toolsHeading} onChange={(v) => set(["toolsHeading"], v)} />
      <TextField label="Mô tả khối" value={content.toolsDescription} onChange={(v) => set(["toolsDescription"], v)} />
      <ListEditor items={content.tools} onUpdate={(i, f, v) => updateList("tools", i, f, v)} onAdd={() => set(["tools"], [...content.tools, { title: "Công cụ mới", description: "" }])} onRemove={(i) => set(["tools"], content.tools.filter((_, x) => x !== i))} />
    </Section>
    <Section title="Quy trình và giải pháp">
      <Grid><Field label="Nhãn nhỏ" value={content.solutionsEyebrow} onChange={(v) => set(["solutionsEyebrow"], v)} /><Field label="Tiêu đề" value={content.solutionsTitle} onChange={(v) => set(["solutionsTitle"], v)} /></Grid>
      <ListEditor items={content.steps} onUpdate={(i, f, v) => updateList("steps", i, f, v)} onAdd={() => set(["steps"], [...content.steps, { title: "Bước mới", description: "" }])} onRemove={(i) => set(["steps"], content.steps.filter((_, x) => x !== i))} />
    </Section>
    <Section title="Tầm nhìn">
      <Field label="Tiêu đề" value={content.vision.title} onChange={(v) => set(["vision", "title"], v)} />
      <TextField label="Đoạn 1" value={content.vision.paragraphs?.[0] || ""} onChange={(v) => set(["vision", "paragraphs"], [v, content.vision.paragraphs?.[1] || ""])} />
      <TextField label="Đoạn 2" value={content.vision.paragraphs?.[1] || ""} onChange={(v) => set(["vision", "paragraphs"], [content.vision.paragraphs?.[0] || "", v])} />
      <Grid><Field label="Trích dẫn" value={content.vision.quote} onChange={(v) => set(["vision", "quote"], v)} /><Field label="Tác giả" value={content.vision.author} onChange={(v) => set(["vision", "author"], v)} /></Grid>
    </Section>
    <Section title="Kêu gọi hành động cuối trang">
      <Field label="Tiêu đề" value={content.cta.title} onChange={(v) => set(["cta", "title"], v)} />
      <TextField label="Mô tả" value={content.cta.description} onChange={(v) => set(["cta", "description"], v)} />
      <Field label="Nội dung nút" value={content.cta.buttonText} onChange={(v) => set(["cta", "buttonText"], v)} />
    </Section>
  </div>;
}

function Section({ title, children }) { return <AppCard><AppCardHeader><AppCardTitle>{title}</AppCardTitle></AppCardHeader><AppCardContent className="space-y-4">{children}</AppCardContent></AppCard>; }
function Grid({ children }) { return <div className="grid md:grid-cols-2 gap-4">{children}</div>; }
function Field({ label, value = "", onChange }) { return <div className="space-y-2"><Label>{label}</Label><AppInput value={value} onChange={(e) => onChange(e.target.value)} /></div>; }
function TextField({ label, value = "", onChange }) { return <div className="space-y-2"><Label>{label}</Label><AppTextarea value={value} onChange={(e) => onChange(e.target.value)} className="min-h-24" /></div>; }
function ListEditor({ items = [], onUpdate, onAdd, onRemove }) { return <div className="space-y-3">{items.map((item, i) => <div key={i} className="grid md:grid-cols-[1fr_2fr_auto] gap-3 rounded-xl border p-3"><AppInput value={item.title} onChange={(e) => onUpdate(i, "title", e.target.value)} /><AppTextarea value={item.description} onChange={(e) => onUpdate(i, "description", e.target.value)} /><AppButton type="button" variant="ghost" size="icon" onClick={() => onRemove(i)}><Trash2 className="w-4 h-4" /></AppButton></div>)}<AppButton type="button" variant="outline" onClick={onAdd}><Plus className="w-4 h-4 mr-2" />Thêm mục</AppButton></div>; }
function ImageField({ label, settingKey, values, onImageUpload, isUploading }) { return <div className="space-y-2"><Label>{label}</Label><label className="block h-40 rounded-xl border-2 border-dashed overflow-hidden cursor-pointer bg-muted"><input type="file" accept="image/*" className="sr-only" disabled={isUploading} onChange={(e) => onImageUpload(e.target.files?.[0], settingKey)} />{isUploading ? <span className="h-full flex items-center justify-center"><Loader2 className="animate-spin" /></span> : values[settingKey] ? <img src={values[settingKey]} alt={label} className="w-full h-full object-cover" /> : <span className="h-full flex flex-col gap-2 items-center justify-center text-muted-foreground"><ImageIcon /><small>Chọn ảnh (tối đa 5MB)</small></span>}</label></div>; }
