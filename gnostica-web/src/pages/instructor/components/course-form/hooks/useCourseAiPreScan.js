import { useState } from "react";
import { toast } from "sonner";
import courseService from "@/services/course/courseService";

export default function useCourseAiPreScan(methods) {
  const [isPreScanning, setIsPreScanning] = useState(false);

  const handlePreScanWholeCourse = async () => {
    const curTitle = methods.getValues("title");
    const curDesc = methods.getValues("description");
    const sections = methods.getValues("sections") || [];
    
    if (!curTitle || curTitle.trim() === "") {
      toast.warning("Vui lòng nhập ít nhất tiêu đề khóa học trước khi quét thử!");
      return;
    }
    
    try {
      setIsPreScanning(true);
      toast.info("🚀 Đang trích xuất lời thoại video và tổng hợp dữ liệu...");

      const videoTranscriptMap = {};
      const transcriptPromises = [];

      sections.forEach((sect, sIdx) => {
        if (sect.lessons) {
          sect.lessons.forEach((less, lIdx) => {
            if (less.videoUrl) {
              const key = `${sIdx}-${lIdx}`;
              const p = courseService.getVideoTranscriptText(less.videoUrl)
                .then((res) => {
                  videoTranscriptMap[key] = res?.transcript || "[Không lấy được lời thoại]";
                })
                .catch(() => {
                  videoTranscriptMap[key] = "[Lỗi kết nối trích xuất lời thoại]";
                });
              transcriptPromises.push(p);
            }
          });
        }
      });

      if (transcriptPromises.length > 0) {
        await Promise.all(transcriptPromises);
      }

      let aggregatedText = "";
      aggregatedText += `[MÔ TẢ KHÓA HỌC]: ${curDesc || ""}\n\n`;
      
      sections.forEach((sect, sIdx) => {
        const sectTitle = sect.title || "";
        aggregatedText += `[CHƯƠNG ${sIdx + 1}]: ${sectTitle}\n`;
        
        if (sect.lessons) {
          sect.lessons.forEach((less, lIdx) => {
            const lessTitle = less.title || "";
            const lessContent = less.content || "";
            const videoKey = `${sIdx}-${lIdx}`;
            const videoTranscript = videoTranscriptMap[videoKey];

            aggregatedText += `  - [BÀI HỌC ${lIdx + 1}]: ${lessTitle}\n`;
            if (lessContent) {
              aggregatedText += `    [MÔ TẢ NỘI DUNG]: ${lessContent}\n`;
            }
            if (videoTranscript) {
              aggregatedText += `    [LỜI THOẠI CỦA VIDEO BÀI HỌC NÀY]:\n${videoTranscript}\n`;
            }
          });
        }

        if (sect.quiz) {
          aggregatedText += `  - [BÀI TRẮC NGHIỆM CHƯƠNG]: ${sect.quiz.title || "Chưa đặt tên"}\n`;
          if (sect.quiz.questions && sect.quiz.questions.length > 0) {
            sect.quiz.questions.forEach((q, qIdx) => {
              aggregatedText += `    + Câu hỏi ${qIdx + 1}: ${q.content}\n`;
              if (q.answers) {
                q.answers.forEach(a => {
                  aggregatedText += `      * ${a.content}${a.isCorrect ? " (Đúng)" : ""}\n`;
                });
              }
            });
          }
        }
        aggregatedText += "\n";
      });

      const questionBank = methods.getValues("questionBank") || [];
      if (questionBank.length > 0) {
        aggregatedText += `[NGÂN HÀNG CÂU HỎI TỔNG THỂ]:\n`;
        questionBank.forEach((q, qIdx) => {
          aggregatedText += `  + Câu hỏi ${qIdx + 1}: ${q.content}\n`;
          if (q.answers) {
            q.answers.forEach(a => {
              aggregatedText += `    * ${a.content}${a.isCorrect ? " (Đúng)" : ""}\n`;
            });
          }
          if (q.explanation) {
            aggregatedText += `    * Giải thích: ${q.explanation}\n`;
          }
        });
      }

      toast.info("🧠 Đang kích hoạt AI phân tích toàn diện văn bản & lời thoại video...");

      const res = await courseService.preScanCourseText(curTitle, aggregatedText);
      const reportString = typeof res === "string" ? res : JSON.stringify(res);
      methods.setValue("aiModerationReport", reportString, { shouldDirty: true });
      
      toast.success("🎉 Đã hoàn tất quét thử AI toàn bộ khóa học bao gồm cả lời thoại video!");
    } catch (e) {
      console.error("Pre-scan simulation failure:", e);
      toast.error("Gặp sự cố khi kết nối hệ thống quét AI.");
    } finally {
      setIsPreScanning(false);
    }
  };

  return { isPreScanning, handlePreScanWholeCourse };
}
