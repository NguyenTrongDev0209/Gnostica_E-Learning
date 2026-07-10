import React from "react";
import {   Controller } from "react-hook-form";
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

import MediaTab from "./MediaTab";
import PricingTab from "./PricingTab";

export default function SettingsTab({ uploadVideoToBunny, setActiveUploads }) {
  return (
    <div className="space-y-12">
      <MediaTab uploadVideoToBunny={uploadVideoToBunny} setActiveUploads={setActiveUploads} />
      <div className="border-t border-border"></div>
      <PricingTab />
    </div>
  );
}

