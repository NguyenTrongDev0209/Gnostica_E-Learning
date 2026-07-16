import React from "react";
import { useFormContext, Controller, useFieldArray } from "react-hook-form";
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

import SectionItem from "./SectionItem";

export default function CurriculumTab({ uploadVideoToBunny, setActiveUploads }) {
  const { control, watch, formState: { errors } } = useFormContext();
  const { fields, append, remove } = useFieldArray({
    control,
    name: "sections",
  });
  const currentCourseStatus = watch("status") ?? 1;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center border-b border-border pb-4">
        <div>
          <h3 className="text-lg font-bold text-foreground">
            Khung Chương Trình
          </h3>
          <p className="text-xs font-medium text-muted-foreground mt-1">
            Xây dựng kiến trúc bài giảng rõ ràng, rành mạch.
          </p>
        </div>
        <button
          type="button"
          onClick={() =>
            append({
              title: "",
              status: currentCourseStatus,
              lessons: [{
                title: "",
                content: "",
                videoFile: null,
                status: currentCourseStatus,
                createdAt: new Date().toISOString(),
                updatedAt: null
              }],
              attachments: null,
              createdAt: new Date().toISOString(),
              updatedAt: null,
            })
          }
          className="flex items-center gap-1.5 text-sm font-bold border border-border px-3 py-1.5 rounded-lg bg-muted hover:bg-secondary transition-colors"
        >
          <Plus size={16} className="text-muted-foreground" /> Thêm Chương
        </button>
      </div>

      {errors.sections?.root && (
        <div className="text-sm font-bold text-error bg-red-50 border border-error/20 p-3 rounded-lg">
          {errors.sections.root.message}
        </div>
      )}

      {/* Dùng div với overflow-y-auto đơn giản để đảm bảo cuộn luôn hoạt động */}
      <div className="max-h-[850px] overflow-y-auto pr-2 custom-scrollbar scroll-smooth">
        <Accordion
          type="multiple"
          defaultValue={[fields[0]?.id]}
          className="space-y-4 pb-24"
        >
          {fields.map((section, sectionIdx) => (
            <AccordionItem
              value={section.id}
              key={section.id}
              className="border border-border rounded-xl bg-muted overflow-hidden shadow-sm"
            >
              <AccordionTrigger className="px-5 py-4 hover:bg-secondary hover:no-underline border-b border-transparent data-[state=open]:border-border">
                <div className="flex items-center w-full pr-4 text-left">
                  <div className="flex flex-col gap-0.5 flex-1">
                    <span className="text-xs font-bold text-success uppercase tracking-widest">
                      Chương {sectionIdx + 1}
                    </span>
                    <span className="font-bold text-foreground line-clamp-1">
                      {/* Dùng UseWatch nếu muốn real-time title display, hiện tại dùng static or watch context. Để UX tối ưu nhất chúng ta cứ giữ tĩnh. */}
                      Nội dung chương
                    </span>
                  </div>
                  <div
                    role="button"
                    tabIndex={0}
                    onClick={(e) => {
                      e.stopPropagation();
                      e.preventDefault(); // Extra safety for accordion
                      if (confirm("Bạn chắc chắn muốn xóa chương này?")) {
                        remove(sectionIdx);
                      }
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.stopPropagation();
                        if (confirm("Bạn chắc chắn muốn xóa chương này?")) {
                          remove(sectionIdx);
                        }
                      }
                    }}
                    className="p-2 text-muted-foreground hover:text-error hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                  >
                    <Trash2 size={16} />
                  </div>
                </div>
              </AccordionTrigger>
              <AccordionContent className="p-0 bg-white border-t border-slate-50">
                <SectionItem
                  sectionIndex={sectionIdx}
                  control={control}
                  uploadVideoToBunny={uploadVideoToBunny}
                  setActiveUploads={setActiveUploads}
                />
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </div>
  );
}

// ------------------------------------------
// COMPONENT LESSON QUẢN LÝ ITEM CON
// ------------------------------------------
