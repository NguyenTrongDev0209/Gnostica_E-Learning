const fs = require('fs');
const path = require('path');

const srcFilePath = path.join('d:', 'Gnostica_E-Learning', 'gnostica-web', 'src', 'pages', 'instructor', 'InstructorCourseForm.jsx');
const targetDir = path.join('d:', 'Gnostica_E-Learning', 'gnostica-web', 'src', 'components', 'pages', 'instructor', 'course-form');

if (!fs.existsSync(targetDir)) {
    fs.mkdirSync(targetDir, { recursive: true });
}

const content = fs.readFileSync(srcFilePath, 'utf-8');
const lines = content.split('\n');

const componentLines = {
    CourseStepper: { start: 963, end: 1159 },
    CategoryCascader: { start: 1160, end: 1241 },
    BasicInfoTab: { start: 1242, end: 1500 },
    SettingsTab: { start: 1501, end: 1510 },
    QuizTab: { start: 1511, end: 2121 },
    MediaTab: { start: 2122, end: 2221 },
    PricingTab: { start: 2222, end: 2318 },
    CheckIcon: { start: 2319, end: 2340 },
    CurriculumTab: { start: 2341, end: 2453 },
    SectionItem: { start: 2454, end: 3002 },
    VideoProgressCircle: { start: 3003, end: 3041 },
    BackgroundVideoUploader: { start: 3042, end: lines.length - 1 }
};

// Common imports for all subcomponents
const commonImports = `import React from "react";
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
import courseService from "@/services/courseService";
import { useParams } from "react-router-dom";
import { ChevronDown, ChevronRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
`;

for (const [name, pos] of Object.entries(componentLines)) {
    let compCode = lines.slice(pos.start, pos.end + 1).join('\n');
    let extraImports = "";
    
    // Add internal component dependencies
    if (name === 'SettingsTab') {
        extraImports += `import MediaTab from "./MediaTab";\nimport PricingTab from "./PricingTab";\n`;
    }
    if (name === 'CurriculumTab') {
        extraImports += `import SectionItem from "./SectionItem";\n`;
    }
    if (name === 'SectionItem') {
        extraImports += `import BackgroundVideoUploader from "./BackgroundVideoUploader";\n`;
    }
    if (name === 'BackgroundVideoUploader') {
        extraImports += `import VideoProgressCircle from "./VideoProgressCircle";\nimport { CheckIcon } from "./CheckIcon";\n`;
    }
    if (name === 'CheckIcon') {
        compCode = compCode.replace('function CheckIcon', 'export function CheckIcon');
    } else {
        compCode = compCode.replace(`function ${name}`, `export default function ${name}`);
    }

    const finalCode = `${commonImports}\n${extraImports}\n${compCode}`;
    const targetFile = path.join(targetDir, `${name}.jsx`);
    fs.writeFileSync(targetFile, finalCode, 'utf-8');
    console.log(`Extracted ${name} to ${targetFile}`);
}

// Modify InstructorCourseForm
const mainComponentLines = lines.slice(0, 963);
const importsToAdd = `
import CourseStepper from "@/components/pages/instructor/course-form/CourseStepper";
import BasicInfoTab from "@/components/pages/instructor/course-form/BasicInfoTab";
import QuizTab from "@/components/pages/instructor/course-form/QuizTab";
import CurriculumTab from "@/components/pages/instructor/course-form/CurriculumTab";
import SettingsTab from "@/components/pages/instructor/course-form/SettingsTab";
`;

// Find where to insert the new imports (after the last import)
let lastImportIndex = 0;
for (let i = 0; i < mainComponentLines.length; i++) {
    if (mainComponentLines[i].startsWith('import ')) {
        lastImportIndex = i;
    }
}
mainComponentLines.splice(lastImportIndex + 1, 0, importsToAdd);

fs.writeFileSync(srcFilePath, mainComponentLines.join('\n'), 'utf-8');
console.log('Updated InstructorCourseForm.jsx');
