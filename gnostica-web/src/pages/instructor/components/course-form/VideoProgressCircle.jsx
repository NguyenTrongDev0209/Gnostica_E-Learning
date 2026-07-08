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


export default function VideoProgressCircle({ progress, size = 60 }) {
  const radius = size * 0.4;
  const stroke = size * 0.08;
  const normalizedRadius = radius - stroke * 2;
  const circumference = normalizedRadius * 2 * Math.PI;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      <svg
        height={size}
        width={size}
        className="transform -rotate-90"
      >
        <circle
          stroke="#f1f5f9"
          fill="transparent"
          strokeWidth={stroke}
          r={normalizedRadius}
          cx={size / 2}
          cy={size / 2}
        />
        <circle
          stroke="#22c55e"
          fill="transparent"
          strokeWidth={stroke}
          strokeDasharray={circumference + ' ' + circumference}
          style={{ strokeDashoffset, transition: 'stroke-dashoffset 0.35s' }}
          strokeLinecap="round"
          r={normalizedRadius}
          cx={size / 2}
          cy={size / 2}
        />
      </svg>
      <span className="absolute text-[10px] font-bold text-success">{progress}%</span>
    </div>
  );
}

