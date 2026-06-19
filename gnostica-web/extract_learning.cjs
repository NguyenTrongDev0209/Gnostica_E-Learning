const fs = require('fs');
const path = require('path');

const srcFilePath = path.join('d:', 'Gnostica_E-Learning', 'gnostica-web', 'src', 'pages', 'learning', 'LearningWorkspace.jsx');
const targetDir = path.join('d:', 'Gnostica_E-Learning', 'gnostica-web', 'src', 'components', 'pages', 'learning');

if (!fs.existsSync(targetDir)) {
    fs.mkdirSync(targetDir, { recursive: true });
}

const content = fs.readFileSync(srcFilePath, 'utf-8');
const lines = content.split('\n');

const componentLines = {
    QuizArea: { start: 42, end: 306 },
    LessonQA: { start: 307, end: 508 }
};

// Common imports for all subcomponents
const commonImports = `import React, { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { Trophy, Clock, Target, AlertTriangle, RefreshCw, XCircle, CheckCircle2, ChevronRight, Loader2, Info, User, Trash, CornerDownRight, ChevronDown, ChevronUp, Send, MessageSquare } from "lucide-react";
import courseService from "@/services/courseService";
import commentService from "@/services/commentService";
import useAuthStore from "@/store/useAuthStore";
`;

for (const [name, pos] of Object.entries(componentLines)) {
    let compCode = lines.slice(pos.start, pos.end + 1).join('\n');
    compCode = compCode.replace(`function ${name}`, `export default function ${name}`);

    const finalCode = `${commonImports}\n${compCode}`;
    const targetFile = path.join(targetDir, `${name}.jsx`);
    fs.writeFileSync(targetFile, finalCode, 'utf-8');
    console.log(`Extracted ${name} to ${targetFile}`);
}

// Modify LearningWorkspace.jsx to remove these lines and add imports
const linesToKeep = [];
for (let i = 0; i < lines.length; i++) {
    let skip = false;
    for (const [name, pos] of Object.entries(componentLines)) {
        if (i >= pos.start && i <= pos.end) {
            skip = true;
            break;
        }
    }
    if (!skip) {
        linesToKeep.push(lines[i]);
    }
}

const importsToAdd = `
import QuizArea from "@/components/pages/learning/QuizArea";
import LessonQA from "@/components/pages/learning/LessonQA";
`;

// Insert after imports
let lastImportIndex = 0;
for (let i = 0; i < linesToKeep.length; i++) {
    if (linesToKeep[i].startsWith('import ')) {
        lastImportIndex = i;
    }
}
linesToKeep.splice(lastImportIndex + 1, 0, importsToAdd);

fs.writeFileSync(srcFilePath, linesToKeep.join('\n'), 'utf-8');
console.log('Updated LearningWorkspace.jsx');
