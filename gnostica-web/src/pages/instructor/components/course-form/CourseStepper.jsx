import React from "react";
import { useFormContext, useWatch, Controller, useFieldArray } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { toast } from "sonner";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { ArrowLeft, ArrowRight, Video, GripVertical, Trash2, Plus, PlayCircle, FileText, Check, Loader2, Sparkles, Database, CheckCircle2, ListOrdered, Search, Pencil } from "lucide-react";
import ReactQuill from "react-quill-new";
import "react-quill-new/dist/quill.snow.css";
import courseService from "@/services/course/courseService";
import { useParams } from "react-router-dom";
import { ChevronDown, ChevronRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";


export default function CourseStepper({ activeTab, onTabChange }) {
  const { control } = useFormContext();

  // Watch only necessary fields for performance
  const formValues =
    useWatch({
      control,
      name: [
        "title",
        "description",
        "sections",
        "thumbnail",
        "promoVideo",
        "price",
        "questionBank",
      ],
    }) || [];

  const steps = React.useMemo(() => {
    // Basic Info Progress
    const basicFields = [formValues[0], formValues[1]];
    const basicFilled = basicFields.filter((f) => f && f.length > 0).length;
    const basicPercent = (basicFilled / 2) * 100;

    // Curriculum Progress (at least one section with title)
    const sections = formValues[2] || [];
    const curriculumPercent = sections.some(
      (s) => s.title && s.title.length > 0,
    )
      ? 100
      : 0;

    // Media Progress (thumbnail and promoVideo)
    const mediaFields = [formValues[3], formValues[4]];
    const mediaFilled = mediaFields.filter(
      (f) => f !== null && f !== undefined,
    ).length;
    const mediaPercent = (mediaFilled / 2) * 100;

    // Pricing Progress
    const price = formValues[5];
    const pricingPercent = price && price > 0 ? 100 : 0;

    const settingsPercent = (mediaPercent + pricingPercent) / 2;

    // Quiz Progress
    const questionBank = formValues[6];
    const quizPercent = (questionBank && questionBank.length > 0) ? 100 : 0;

    return [
      {
        id: "basic",
        label: "Thông tin cơ bản",
        step: 1,
        progress: basicPercent,
      },
      {
        id: "quiz",
        label: "Ngân hàng câu hỏi",
        step: 2,
        progress: quizPercent,
      },
      {
        id: "curriculum",
        label: "Nội dung bài học",
        step: 3,
        progress: curriculumPercent,
      },
      {
        id: "settings",
        label: "Media & Định giá",
        step: 4,
        progress: settingsPercent,
      },
    ];
  }, [formValues]);

  const currentStepNum = steps.find((s) => s.id === activeTab)?.step || 1;

  return (
    <div className="flex items-center justify-between w-full max-w-4xl mx-auto h-20">
      {steps.map((s, idx) => {
        const isActive = s.id === activeTab;
        const isCompleted = s.progress === 100;
        const isLast = idx === steps.length - 1;

        // SVG Circle properties
        const radius = 18;
        const circumference = 2 * Math.PI * radius;
        // Map 0-100 progress to stroke offset
        const offset = circumference - (s.progress / 100) * circumference;

        return (
          <React.Fragment key={s.id}>
            {/* Step Node with Circular Progress */}
            <div
              className="relative flex flex-col items-center justify-center group cursor-pointer"
              onClick={() => onTabChange(s.id)}
            >
              <div className="relative w-12 h-12 flex items-center justify-center">
                {/* SVG Progress Ring */}
                <svg className="absolute inset-0 w-full h-full -rotate-90 transform group-hover:scale-105 transition-transform duration-300">
                  <circle
                    cx="24"
                    cy="24"
                    r={radius}
                    stroke="currentColor"
                    strokeWidth="3"
                    fill="transparent"
                    className="text-slate-100"
                  />
                  <circle
                    cx="24"
                    cy="24"
                    r={radius}
                    stroke="currentColor"
                    strokeWidth="3"
                    fill="transparent"
                    strokeDasharray={circumference}
                    strokeDashoffset={offset}
                    className="text-success transition-all duration-500 ease-out"
                    strokeLinecap="round"
                  />
                </svg>

                {/* Inner Circle Content */}
                <div
                  className={`
                    w-[28px] h-[28px] rounded-full flex items-center justify-center font-bold text-sm z-10 transition-all duration-300
                    ${isActive
                      ? "bg-success/10 text-success text-white shadow-lg shadow-green-100 scale-105"
                      : isCompleted
                        ? "bg-success/10 text-success text-white"
                        : "bg-white text-slate-300"
                    }
                  `}
                >
                  {isCompleted ? (
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="3"
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  ) : (
                    s.step
                  )}
                </div>
              </div>

              {/* Label */}
              <div className="absolute -bottom-6 whitespace-nowrap text-[11px] font-bold transition-all duration-300 text-center uppercase tracking-tighter">
                <p
                  className={`${isActive ? "text-success scale-110" : isCompleted ? "text-success" : "text-muted-foreground opacity-60"}`}
                >
                  {s.label}
                </p>
              </div>
            </div>

            {/* Connection Line Segment */}
            {!isLast && (
              <div className="flex-1 mx-2 h-[2px] bg-secondary relative rounded-full overflow-hidden">
                <div
                  className={`
                    absolute inset-0 bg-success/10 text-success transition-all duration-1000 ease-out
                    ${currentStepNum > idx + 1 ? "w-full" : "w-0"}
                  `}
                />
              </div>
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}

// ==========================================
// SUB-COMPONENTS CHO TỪNG TAB
// ==========================================

const quillModules = {
  toolbar: [
    ["bold", "italic", "underline"],
    [{ list: "ordered" }, { list: "bullet" }],
    ["clean"],
  ],
};

