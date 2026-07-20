const fs = require('fs');
const file = 'gnostica-web/src/pages/instructor/InstructorCourseForm.jsx';
let content = fs.readFileSync(file, 'utf-8');
const lines = content.split('\n');

const startIdx = lines.findIndex(l => l.startsWith('function CourseStepper'));
const endIdx = lines.findIndex((l, idx) => idx > startIdx && l.startsWith('function VideoProgressCircle'));
let endOffset = endIdx;
while (endOffset < lines.length && !lines[endOffset].startsWith('}')) {
    endOffset++;
}

if (startIdx !== -1 && endIdx !== -1) {
    const imports = [
        "import { CourseStepper, CheckIcon, VideoProgressCircle } from './components/course-form/SharedUI';",
        "import { CourseDraftModal } from './components/course-form/CourseDraftModal';",
        "import { CourseAiReportModal } from './components/course-form/CourseAiReportModal';",
        "import { BasicInfoTab } from './components/course-form/BasicInfoTab';",
        "import { CurriculumTab } from './components/course-form/CurriculumTab';",
        "import { SettingsTab } from './components/course-form/SettingsTab';",
        "import { QuizTab } from './components/course-form/QuizTab';",
        "import { CategoryCascader } from './components/course-form/CategoryCascader';",
        "import { BackgroundVideoUploader } from './components/course-form/BackgroundVideoUploader';"
    ].join('\n');
    
    // We want to insert the imports right after the other imports
    const lastImportIdx = [...lines].reverse().findIndex(l => l.startsWith('import '));
    const actualLastImportIdx = lines.length - 1 - lastImportIdx;
    
    // Delete the components
    lines.splice(startIdx, endOffset - startIdx + 1);
    
    // Insert imports
    lines.splice(actualLastImportIdx + 1, 0, imports);
    
    fs.writeFileSync(file, lines.join('\n'));
    console.log('Replaced successfully');
} else {
    console.log('Could not find start/end bounds', startIdx, endIdx);
}
