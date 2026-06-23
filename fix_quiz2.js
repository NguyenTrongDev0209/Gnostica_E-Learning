const fs = require('fs');
const file = 'gnostica-web/src/components/pages/learning/QuizArea.jsx';
let lines = fs.readFileSync(file, 'utf8').split(/\r?\n/);

for (let i = 0; i < lines.length; i++) {
    if (lines[i].includes('import React, { useState, useEffect, useCallback } from "react";')) {
        lines[i] = 'import React, { useState, useEffect, useCallback, useRef } from "react";';
    }
    if (lines[i].includes('import { Trophy, Clock, Target, AlertTriangle, RefreshCw, XCircle, CheckCircle2, ChevronRight, Loader2, Info, User, Trash, CornerDownRight, ChevronDown, ChevronUp, Send, MessageSquare } from "lucide-react";')) {
        lines[i] = 'import { Trophy, Clock, Target, AlertTriangle, RefreshCw, XCircle, CheckCircle2, ChevronRight, ChevronLeft, Loader2, Info, User, Trash, CornerDownRight, ChevronDown, ChevronUp, Send, MessageSquare, HelpCircle, Award } from "lucide-react";';
    }
    if (lines[i].includes('setCorrectCount(existingResult.correctAnswers || 0);') && lines[i+1].includes('} else {') && lines[i+2].includes('setIsSubmitted(false);')) {
        lines.splice(i + 1, 0,
            '          if (quiz?.id) {',
            '              const saved = localStorage.getItem(`quiz_answers_${quiz.id}`);',
            '              if (saved) {',
            '                  try {',
            '                      setUserAnswers(JSON.parse(saved));',
            '                  } catch (e) {}',
            '              }',
            '          }'
        );
    }
    if (lines[i].includes('setCorrectCount(0);') && lines[i+1].includes('}') && lines[i+2].includes('}, [existingResult]);')) {
        lines.splice(i + 1, 0,
            '          setUserAnswers({});',
            '          if (quiz?.id) {',
            '              localStorage.removeItem(`quiz_answers_${quiz.id}`);',
            '          }'
        );
    }
    if (lines[i].includes('}, [existingResult]);')) {
        lines[i] = '  }, [existingResult, quiz?.id]);';
    }
    if (lines[i].includes('setIsSubmitted(true);') && lines[i+2].includes('// 3. Thông báo cho cha')) {
        lines.splice(i + 1, 0,
            '        localStorage.setItem(`quiz_answers_${quiz.id}`, JSON.stringify(userAnswers));'
        );
    }
    if (lines[i].includes('setCorrectCount(0);') && lines[i+2].includes('// 3. Thông báo cho cha để gỡ dấu tick')) {
        lines.splice(i + 1, 0,
            '          localStorage.removeItem(`quiz_answers_${quiz.id}`);'
        );
    }
}

fs.writeFileSync(file, lines.join('\n'), 'utf8');
console.log('done');
