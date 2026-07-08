import React from "react";
import { Button } from "@/components/ui/button";
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion";
import { CheckCircle2, BookOpen, Layers, Video, Trophy, ChevronRight } from "lucide-react";

export default function CourseCurriculumSidebar({ course, validModules, totalLessons, setIsProfileModalOpen, setActivePreview, activePreview }) {
  return (
    <div className="lg:col-span-4 space-y-6 lg:sticky lg:top-[100px]">
      <div className="bg-white p-5 rounded-2xl border border-border/60 shadow-sm flex items-center gap-4">
        <div className="relative shrink-0 flex items-center justify-center">
          {course.instructorAvatar ? (
            <img src={course.instructorAvatar} alt="avt" className="w-14 h-14 rounded-full object-cover ring-4 ring-slate-50 shadow-sm" />
          ) : (
            <div className="w-14 h-14 bg-secondary rounded-full flex items-center justify-center text-muted-foreground font-bold shadow-sm">
               GV
            </div>
          )}
          <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-emerald-500 rounded-full border-2 border-white flex items-center justify-center text-white shadow">
            <CheckCircle2 className="w-3 h-3 fill-white text-emerald-500" />
          </div>
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider mb-0.5">
            Tác giả học liệu
          </p>
          <p className="text-[15px] font-black text-foreground truncate">
            {course.instructorName || "Giảng viên Gnostica"}
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setIsProfileModalOpen(true)}
          className="font-bold text-xs rounded-lg hover:bg-indigo-50 hover:text-indigo-700 transition-colors shrink-0"
        >
          Hồ sơ
        </Button>
      </div>

      <div className="bg-white rounded-2xl border border-border/60 shadow-sm flex flex-col overflow-hidden max-h-[calc(100vh-200px)]">
        <div className="p-5 bg-muted text-white flex-shrink-0">
          <h3 className="font-black flex items-center gap-2.5 tracking-tight text-[17px]">
            <BookOpen className="w-5 h-5 text-indigo-400" /> Chương trình đào tạo
          </h3>
          <p className="text-muted-foreground text-xs font-bold mt-1 flex items-center gap-2">
            <Layers className="w-3.5 h-3.5" /> {validModules.length} Chương • {totalLessons} Bài giảng
          </p>
        </div>
        <div className="overflow-y-auto p-4 space-y-3 bg-muted scrollbar-thin">
          {validModules.length > 0 ? (
            <Accordion type="multiple" defaultValue={[`mod-${validModules[0]?.id}`]} className="w-full space-y-3">
              {validModules.map((mod) => {
                 const validLessons = mod.lessons?.filter(l => !l.deleted) || [];
                 return (
                    <AccordionItem key={mod.id} value={`mod-${mod.id}`} className="border border-border rounded-xl overflow-hidden shadow-sm bg-white transition-all duration-200">
                      <AccordionTrigger className="px-4 py-3.5 hover:no-underline hover:bg-muted font-extrabold text-foreground text-left text-sm leading-tight">
                        <span className="truncate max-w-[90%]">{mod.title}</span>
                      </AccordionTrigger>
                      <AccordionContent className="px-2 pb-2 pt-0 space-y-1">
                         {validLessons.map((les, lIdx) => (
                            <div
                              key={les.id}
                              onClick={() => {
                                 setActivePreview({ type: "lesson", data: les, moduleAttachments: mod.attachments });
                                 window.scrollTo({ top: 0, behavior: "smooth" });
                              }}
                              className={`flex items-center justify-between p-2 rounded-lg cursor-pointer transition-all group/item border ${activePreview?.type === "lesson" && activePreview.data.id === les.id ? 'bg-indigo-50 border-indigo-200 text-indigo-900' : 'border-transparent hover:bg-muted text-muted-foreground'}`}
                            >
                               <div className="flex items-center gap-2 min-w-0">
                                  <Video className={`w-3.5 h-3.5 shrink-0 ${activePreview?.type === "lesson" && activePreview.data.id === les.id ? 'text-indigo-600' : 'text-info opacity-70'}`} />
                                  <span className={`text-xs truncate font-bold ${activePreview?.type === "lesson" && activePreview.data.id === les.id ? 'text-indigo-950' : 'text-foreground'}`}>
                                     {lIdx + 1}. {les.title}
                                  </span>
                               </div>
                               <ChevronRight className={`w-3 h-3 transition-all opacity-0 group-hover/item:opacity-100 group-hover/item:translate-x-0.5`} />
                            </div>
                         ))}
                         {mod.quiz && (
                            <div
                              onClick={() => {
                                 setActivePreview({ type: "quiz", data: mod.quiz });
                                 window.scrollTo({ top: 0, behavior: "smooth" });
                              }}
                              className={`flex items-center justify-between p-2 rounded-lg cursor-pointer transition-all group/item border ${activePreview?.type === "quiz" && activePreview.data.id === mod.quiz.id ? 'bg-violet-50 border-violet-200 text-violet-900' : 'border-transparent hover:bg-muted text-muted-foreground'}`}
                            >
                               <div className="flex items-center gap-2 min-w-0">
                                  <Trophy className="w-3.5 h-3.5 text-violet-600 opacity-80 shrink-0" />
                                  <span className="text-xs truncate font-black text-violet-700 uppercase tracking-wide">
                                     Quiz: {mod.quiz.title || "Kiểm tra kiến thức"}
                                  </span>
                               </div>
                               <ChevronRight className="w-3 h-3 transition-all opacity-0 group-hover/item:opacity-100" />
                            </div>
                         )}
                      </AccordionContent>
                    </AccordionItem>
                 );
              })}
            </Accordion>
          ) : (
            <p className="text-center text-muted-foreground italic text-xs font-medium py-10">Khóa học này hiện chưa có chương trình học nào.</p>
          )}
        </div>
      </div>
    </div>
  );
}
