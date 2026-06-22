const fs = require('fs');
const file = 'gnostica-web/src/components/pages/learning/QuizArea.jsx';
let content = fs.readFileSync(file, 'utf8');

// 1. Fix imports
content = content.replace(
  'import React, { useState, useEffect, useCallback } from "react";',
  'import React, { useState, useEffect, useCallback, useRef } from "react";'
);
content = content.replace(
  'import { Trophy, Clock, Target, AlertTriangle, RefreshCw, XCircle, CheckCircle2, ChevronRight, Loader2, Info, User, Trash, CornerDownRight, ChevronDown, ChevronUp, Send, MessageSquare } from "lucide-react";',
  'import { Trophy, Clock, Target, AlertTriangle, RefreshCw, XCircle, CheckCircle2, ChevronRight, ChevronLeft, Loader2, Info, User, Trash, CornerDownRight, ChevronDown, ChevronUp, Send, MessageSquare, HelpCircle, Award } from "lucide-react";'
);

// 2. Fix useEffect
content = content.replace(
  `  // Tải dữ liệu cũ nếu bài tập này học viên ĐÃ LÀM RỒI
  useEffect(() => {
      if (existingResult) {
          setIsSubmitted(true);
          setScorePercent(existingResult.point || 0);
          setCorrectCount(existingResult.correctAnswers || 0);
      } else {
          setIsSubmitted(false);
          setScorePercent(0);
          setCorrectCount(0);
      }
  }, [existingResult]);`,
  `  // Tải dữ liệu cũ nếu bài tập này học viên ĐÃ LÀM RỒI
  useEffect(() => {
      if (existingResult) {
          setIsSubmitted(true);
          setScorePercent(existingResult.point || 0);
          setCorrectCount(existingResult.correctAnswers || 0);
          if (quiz?.id) {
              const saved = localStorage.getItem(\`quiz_answers_\${quiz.id}\`);
              if (saved) {
                  try {
                      setUserAnswers(JSON.parse(saved));
                  } catch (e) {}
              }
          }
      } else {
          setIsSubmitted(false);
          setScorePercent(0);
          setCorrectCount(0);
          setUserAnswers({});
          if (quiz?.id) {
              localStorage.removeItem(\`quiz_answers_\${quiz.id}\`);
          }
      }
  }, [existingResult, quiz?.id]);`
);

// 3. Fix handleSubmitQuiz to save
content = content.replace(
  `        // 2. Cập nhật state hiển thị local
        setCorrectCount(correct);
        setScorePercent(finalScore);
        setIsSubmitted(true);`,
  `        // 2. Cập nhật state hiển thị local
        setCorrectCount(correct);
        setScorePercent(finalScore);
        setIsSubmitted(true);
        localStorage.setItem(\`quiz_answers_\${quiz.id}\`, JSON.stringify(userAnswers));`
);

// 4. Fix handleReset to delete
content = content.replace(
  `          // 2. Reset state giao diện local
          setIsSubmitted(false);
          setUserAnswers({});
          setScorePercent(0);
          setCorrectCount(0);`,
  `          // 2. Reset state giao diện local
          setIsSubmitted(false);
          setUserAnswers({});
          setScorePercent(0);
          setCorrectCount(0);
          localStorage.removeItem(\`quiz_answers_\${quiz.id}\`);`
);

fs.writeFileSync(file, content, 'utf8');
console.log('done');
