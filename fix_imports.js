const fs = require('fs');
const file = 'gnostica-web/src/pages/instructor/InstructorCourseForm.jsx';
let content = fs.readFileSync(file, 'utf-8');

// Use string replacement for exact line matching to be safe
content = content.replace('import { useFormContext, useWatch, Controller, useFieldArray, FormProvider } from "react-hook-form";', 'import { Controller, FormProvider } from "react-hook-form";');
content = content.replace('import questionService from "@/services/course/questionService";\n', '');
content = content.replace('import { useParams, useNavigate } from "react-router-dom";', 'import { useNavigate } from "react-router-dom";');
content = content.replace('import courseService from "@/services/course/courseService";\n', '');
content = content.replace('import useCourseAiPreScan from "@/hooks/course/useCourseAiPreScan";\n', '');

// Remove quillModules and quillFormats blocks
const lines = content.split('\n');
const filteredLines = [];
let skip = false;
for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (line.startsWith('const quillModules = {')) {
        skip = true;
    }
    if (skip && line === '];') {
        skip = false;
        continue;
    }
    if (!skip) {
        filteredLines.push(line);
    }
}

fs.writeFileSync(file, filteredLines.join('\n'));
console.log('Fixed imports successfully');
