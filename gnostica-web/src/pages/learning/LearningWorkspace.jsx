import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { 
  ChevronLeft, 
  ChevronRight, 
  PlayCircle, 
  CheckCircle2, 
  MessageSquare, 
  Info, 
  FileText, 
  MoreVertical,
  LayoutDashboard,
  Settings,
  X
} from "lucide-react";
import { 
  Accordion, 
  AccordionContent, 
  AccordionItem, 
  AccordionTrigger 
} from "@/components/ui/accordion";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { getCourseDetailById } from "@/mocks/courses";

export default function LearningWorkspace() {
  const { id } = useParams();
  const navigate = useNavigate();
  const course = getCourseDetailById(id || "1");

  const [activeSectionIdx, setActiveSectionIdx] = useState(0);
  const [activeLessonIdx, setActiveLessonIdx] = useState(0);
  const [completedLessons, setCompletedLessons] = useState([0]); // Mock completed first lesson

  const currentSection = course.curriculum[activeSectionIdx];
  const currentLesson = currentSection.lessons[activeLessonIdx];

  // Calculate total lessons and completed count
  const allLessons = course.curriculum.flatMap(section => section.lessons);
  const totalLessonsCount = allLessons.length;
  const progressValue = Math.round((completedLessons.length / totalLessonsCount) * 100);

  const handleLessonSelect = (sectionIdx, lessonIdx) => {
    setActiveSectionIdx(sectionIdx);
    setActiveLessonIdx(lessonIdx);
  };

  const handleNextLesson = () => {
    if (activeLessonIdx < currentSection.lessons.length - 1) {
      setActiveLessonIdx(activeLessonIdx + 1);
    } else if (activeSectionIdx < course.curriculum.length - 1) {
      setActiveSectionIdx(activeSectionIdx + 1);
      setActiveLessonIdx(0);
    }
  };

  const handlePrevLesson = () => {
    if (activeLessonIdx > 0) {
      setActiveLessonIdx(activeLessonIdx - 1);
    } else if (activeSectionIdx > 0) {
      const prevSectionIdx = activeSectionIdx - 1;
      setActiveSectionIdx(prevSectionIdx);
      setActiveLessonIdx(course.curriculum[prevSectionIdx].lessons.length - 1);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-white">
      {/* 1. Immersive Header */}
      <header className="h-16 bg-slate-900 text-white flex items-center justify-between px-4 z-50 shrink-0">
        <div className="flex items-center gap-4 min-w-0">
          <button 
            onClick={() => navigate("/account/my-courses")}
            className="p-2 hover:bg-slate-800 rounded-lg transition-colors text-slate-300 hover:text-white"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <Separator orientation="vertical" className="h-6 bg-slate-700 hidden sm:block" />
          <h1 className="font-bold text-sm md:text-base truncate max-w-[200px] lg:max-w-md hidden sm:block">
            {course.title}
          </h1>
        </div>

        <div className="flex-1 max-w-xl px-8 hidden md:block">
          <div className="flex items-center gap-3">
            <Progress value={progressValue} className="h-1.5 flex-1 bg-slate-800 [&>div]:bg-primary" />
            <span className="text-[11px] font-bold text-slate-400 whitespace-nowrap uppercase tracking-wider">
              {completedLessons.length}/{totalLessonsCount} BÀI HỌC ({progressValue}%)
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button 
            variant="ghost" 
            size="sm" 
            className="text-slate-300 hover:bg-slate-800 hover:text-white font-bold hidden lg:flex items-center gap-2"
          >
            <LayoutDashboard className="w-4 h-4" />
            Bảng điều khiển
          </Button>
          <div className="flex items-center gap-1 bg-slate-800 p-1 rounded-lg">
             <button 
                onClick={handlePrevLesson}
                disabled={activeSectionIdx === 0 && activeLessonIdx === 0}
                className="p-1.5 hover:bg-slate-700 disabled:opacity-30 disabled:cursor-not-allowed rounded transition-colors"
             >
               <ChevronLeft className="w-5 h-5" />
             </button>
             <button 
                onClick={handleNextLesson}
                disabled={activeSectionIdx === course.curriculum.length - 1 && activeLessonIdx === currentSection.lessons.length - 1}
                className="p-1.5 hover:bg-slate-700 disabled:opacity-30 disabled:cursor-not-allowed rounded transition-colors"
             >
               <ChevronRight className="w-5 h-5" />
             </button>
          </div>
          <button className="p-2 hover:bg-slate-800 rounded-lg transition-colors ml-2">
            <MoreVertical className="w-5 h-5 text-slate-400" />
          </button>
        </div>
      </header>

      {/* 2. Main Layout Area */}
      <div className="flex flex-1 overflow-hidden flex-col lg:flex-row">
        
        {/* Left Column: Player & Info */}
        <main className="flex-1 overflow-y-auto bg-slate-50 custom-scrollbar">
          {/* Video Player Section */}
          <div className="bg-slate-900 w-full flex justify-center border-b border-white/5">
            <div className="w-full max-w-7xl aspect-video relative shadow-2xl shadow-black/50 overflow-hidden ring-1 ring-white/10">
              <div className="absolute inset-0 flex items-center justify-center">
                <PlayCircle className="w-20 h-20 text-white/20 animate-pulse" />
              </div>
              {/* Mock Player Information Overlay */}
              <div className="absolute top-4 left-4 p-3 rounded-lg bg-black/40 backdrop-blur-md border border-white/10 text-white">
                <p className="text-xs font-bold text-primary mb-0.5 uppercase tracking-widest italic">Đang phát</p>
                <h3 className="text-sm font-black">{currentLesson.title}</h3>
              </div>
            </div>
          </div>

          {/* Lesson Content Tabs */}
          <div className="p-6 md:p-10 max-w-5xl mx-auto">
            <div className="mb-8">
              <h2 className="text-2xl md:text-3xl font-black text-slate-900 leading-tight">
                {currentLesson.title}
              </h2>
              <p className="text-slate-500 mt-2 font-medium italic">Bài giảng thuộc chương: {currentSection.title}</p>
            </div>

            <Tabs defaultValue="overview" className="w-full">
              <TabsList className="bg-slate-100 p-1 rounded-xl w-full sm:w-fit">
                <TabsTrigger value="overview" className="rounded-lg font-bold flex items-center gap-2">
                  <Info className="w-4 h-4" /> Tổng quan
                </TabsTrigger>
                <TabsTrigger value="qa" className="rounded-lg font-bold flex items-center gap-2">
                  <MessageSquare className="w-4 h-4" /> Hỏi & Đáp
                </TabsTrigger>
                <TabsTrigger value="resources" className="rounded-lg font-bold flex items-center gap-2">
                  <FileText className="w-4 h-4" /> Tài liệu
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="overview" className="mt-8">
                <div className="bg-white rounded-2xl p-8 border border-slate-200 shadow-sm leading-relaxed text-slate-700">
                  <h3 className="text-xl font-bold text-slate-900 mb-4">Chi tiết bài học</h3>
                  <p>
                    Chào mừng bạn đến với bài học <strong>"{currentLesson.title}"</strong>. 
                    Trong chương trình này, chúng ta sẽ đi sâu vào kiến thức nền tảng và thực hành các ví dụ cụ thể. 
                    Hãy đảm bảo bạn dành ít nhất {currentLesson.duration} để theo dõi trọn vẹn nội dung này.
                  </p>
                  <div className="mt-6 p-4 bg-primary/5 rounded-xl border border-primary/10">
                    <h4 className="font-bold text-primary mb-2 flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4" /> Bạn sẽ học được gì?
                    </h4>
                    <ul className="text-sm space-y-1 ml-6 list-disc opacity-80">
                      <li>Nắm vững core concept của {currentLesson.title}</li>
                      <li>Thực hành dự án thực tế áp dụng kiến thức</li>
                      <li>Optimization kỹ năng xử lý vấn đề</li>
                    </ul>
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="qa" className="mt-8">
                 <div className="bg-white rounded-2xl p-8 border border-slate-200 shadow-sm text-center">
                    <MessageSquare className="w-12 h-12 text-slate-200 mx-auto mb-4" />
                    <h3 className="font-bold text-slate-900">Tính năng Hỏi & Đáp</h3>
                    <p className="text-slate-500 max-w-md mx-auto mt-2">
                      Chưa có câu hỏi nào trong bài này. Hãy là người đầu tiên đặt câu hỏi để nhận được sự hỗ trợ từ cộng đồng và giảng viên!
                    </p>
                    <Button className="mt-6 font-bold px-8">Đặt câu hỏi ngay</Button>
                 </div>
              </TabsContent>

              <TabsContent value="resources" className="mt-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[1, 2].map((i) => (
                    <div key={i} className="flex items-center justify-between p-4 bg-white border border-slate-200 rounded-xl hover:border-primary transition-all group">
                       <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-orange-50 flex items-center justify-center text-orange-600">
                             <FileText className="w-5 h-5" />
                          </div>
                          <div>
                            <p className="text-sm font-bold text-slate-900">Tài liệu tham khảo {i}.pdf</p>
                            <p className="text-[10px] text-slate-400 font-medium">PDF • 2.4 MB</p>
                          </div>
                       </div>
                       <Button variant="ghost" size="sm" className="font-bold text-primary opacity-0 group-hover:opacity-100 transition-opacity">Tải xuống</Button>
                    </div>
                  ))}
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </main>

        {/* Right Column: Playlist Sidebar */}
        <aside className="w-full lg:w-[350px] xl:w-[400px] border-l border-slate-200 flex flex-col h-full bg-white relative z-10 lg:static">
          <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
            <h3 className="font-black text-slate-900 uppercase tracking-wider text-xs">Nội dung khóa học</h3>
            <button className="text-slate-400 lg:hidden" onClick={() => {}}>
              <X className="w-4 h-4" />
            </button>
          </div>
          
          <div className="flex-1 overflow-y-auto custom-scrollbar">
            <Accordion type="multiple" defaultValue={[`section-${activeSectionIdx}`]}>
              {course.curriculum.map((section, sIdx) => {
                const isActiveSection = activeSectionIdx === sIdx;
                return (
                  <AccordionItem 
                    key={sIdx} 
                    value={`section-${sIdx}`} 
                    className={`border-b border-slate-50 last:border-0 ${isActiveSection ? 'bg-slate-50/30' : ''}`}
                  >
                    <AccordionTrigger className="px-5 py-4 hover:bg-slate-50 hover:no-underline [&[data-state=open]]:bg-slate-50 transition-all">
                      <div className="flex flex-col items-start gap-1 text-left min-w-0">
                        <span className="text-[10px] font-black text-primary uppercase tracking-widest italic">Phần {sIdx + 1}</span>
                        <span className="font-bold text-slate-900 text-sm truncate w-full">{section.title}</span>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="pb-0">
                      <div className="flex flex-col">
                        {section.lessons.map((lesson, lIdx) => {
                          const isCurrent = activeSectionIdx === sIdx && activeLessonIdx === lIdx;
                          const isCompleted = completedLessons.includes(lIdx); // Mock logic
                          
                          return (
                            <button
                              key={lIdx}
                              onClick={() => handleLessonSelect(sIdx, lIdx)}
                              className={`
                                flex items-start gap-3 px-5 py-3.5 transition-all text-left group
                                ${isCurrent ? 'bg-primary/5 ring-1 ring-primary/10' : 'hover:bg-slate-50'}
                              `}
                            >
                              <div className="mt-0.5 shrink-0">
                                {isCurrent ? (
                                  <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center animate-bounce shadow-sm">
                                    <PlayCircle className="w-3 h-3 text-white" />
                                  </div>
                                ) : isCompleted ? (
                                  <CheckCircle2 className="w-5 h-5 text-emerald-500 fill-emerald-50" />
                                ) : (
                                  <div className="w-5 h-5 rounded-full border-2 border-slate-200 group-hover:border-primary/50 transition-colors" />
                                )}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className={`text-sm font-bold leading-snug break-words ${isCurrent ? 'text-primary' : 'text-slate-700'}`}>
                                  {lesson.title}
                                </p>
                                <div className="flex items-center gap-2 mt-1 text-[10px] font-semibold text-slate-400">
                                  <PlayCircle className="w-3 h-3" />
                                  <span>{lesson.duration}</span>
                                </div>
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                );
              })}
            </Accordion>
          </div>
        </aside>

      </div>
    </div>
  );
}
