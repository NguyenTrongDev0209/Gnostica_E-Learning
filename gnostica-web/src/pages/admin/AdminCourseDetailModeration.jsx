import React from "react";
import AppSelect from "@/components/common/micro/AppSelect";
import AppInput from "@/components/common/micro/AppInput";
import { CheckCircle2, BookOpen, Layers, Video, ArrowLeft, Loader2, Sparkles, AlertTriangle, ShieldCheck, ShieldAlert, FileText, Trophy, ExternalLink, ChevronRight, Download } from "lucide-react";
import { useParams, useNavigate } from "react-router-dom";

import useAdminCourseModeration from "@/hooks/admin/useAdminCourseModeration";

export default function AdminCourseDetailModeration() {
  const { slug } = useParams();
  const navigate = useNavigate();

  const {
    course,
    loading,
    isSubmitting,
    isRejectModalOpen,
    setIsRejectModalOpen,
    isProfileModalOpen,
    setIsProfileModalOpen,
    rejectReason,
    setRejectReason,
    activePreview,
    setActivePreview,
    playerRef,

    isEmbedLink,
    handleApprove,
    handleConfirmReject
  } = useAdminCourseModeration(slug);

  if (loading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center space-y-3">
        <Loader2 className="w-10 h-10 animate-spin text-primary" />
        <p className="text-muted-foreground font-bold">Đang biên dịch dữ liệu khóa học...</p>
      </div>
    );
  }

  if (!course) return null;

  const validModules = course?.modules?.filter((m) => !m.deleted) || [];
  const totalLessons = validModules.reduce((sum, mod) => sum + (mod.lessons?.filter(l => !l.deleted).length || 0), 0);

  const formatFriendlyDate = (dateStr) => {
     if (!dateStr) return "Chưa cập nhật";
     const d = new Date(dateStr);
     return d.toLocaleDateString("vi-VN");
  };

  const instructorInfo = {
      name: course.instructorName || "Giảng viên Gnostica",
      avatar: course.instructorAvatar,
      email: course.instructorEmail || "N/A",
      phone: course.instructorPhone || "---",
      cccd: "---",
      address: "Việt Nam",
      joinedDate: formatFriendlyDate(course.instructorCreatedAt),
      job: "Đối tác giảng dạy",
      bio: "Giảng viên độc lập liên kết với nền tảng giáo dục trực tuyến Gnostica.",
      bankName: "Ngân hàng đã đăng ký",
      bankNumber: "---",
      bankHolder: (course.instructorName || "").toUpperCase(),
      courses: 1,
      students: "--",
      rating: "5.0"
  };

  const getEmbedUrl = (url) => {
    if (!url) return null;
    const uuidRegex = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/;
    let libraryId = "655066"; 
    let videoId = url;
    let baseUrl = "";
    
    if (url.includes("/")) {
      const parts = url.split("/");
      const lastPart = parts[parts.length - 1];
      if (uuidRegex.test(lastPart)) {
        videoId = lastPart;
        const secondToLast = parts[parts.length - 2];
        if (secondToLast && secondToLast.length > 2) {
          libraryId = secondToLast;
        }
      }
    }

    if (uuidRegex.test(videoId)) {
      baseUrl = `https://player.mediadelivery.net/embed/${libraryId}/${videoId}`;
    } else if (url.includes("video.bunny.net/play/") || url.includes("video.bunny.net/embed/")) {
      baseUrl = url.replace(/video\.bunny\.net\/(play|embed)\//, "player.mediadelivery.net/embed/");
    } else {
      baseUrl = url.replace("iframe.mediadelivery.net", "player.mediadelivery.net");
    }

    const separator = baseUrl.includes("?") ? "&" : "?";
    return `${baseUrl}${separator}playerjs=1&content_ended=1`;
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 4: return <Badge className="bg-amber-50 text-amber-700 border-amber-200"><span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse mr-1"></span> Chờ duyệt</Badge>;
      case 1: return <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200">Đã duyệt</Badge>;
      case 3: return <Badge className="bg-rose-50 text-rose-700 border-rose-200">Bị từ chối</Badge>;
      default: return <Badge className="bg-muted text-muted-foreground border-border">Khác</Badge>;
    }
  };

  return (
    <div className="max-w-[1400px] mx-auto space-y-6 animate-in fade-in duration-500 pb-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-border/60 shadow-sm sticky top-4 z-20 backdrop-blur-md bg-white/95">
        <div className="flex items-center gap-4 min-w-0">
          <AppButton appVariant="ghostMuted" variant="ghost" size="icon" onClick={() => navigate("/admin/course-moderation")} className="h-10 w-10 rounded-xl shrink-0 border border-border bg-white hover:bg-muted hover:text-primary transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </AppButton>
          <div className="min-w-0">
            <div className="flex items-center gap-2 mb-0.5">
              <span className="text-[11px] font-black text-muted-foreground uppercase tracking-wider">ID: {course.id}</span>
              {getStatusBadge(course.status)}
            </div>
            <h1 className="text-xl font-black text-foreground tracking-tight truncate leading-tight">{course.title || "Chưa đặt tên"}</h1>
          </div>
        </div>

        <div className="flex items-center gap-3 shrink-0 ml-14 md:ml-0">
          {course.status === 4 && (
            <>
              <AppButton appVariant="ghostMuted" variant="ghost" onClick={() => setIsRejectModalOpen(true)} disabled={isSubmitting} className="font-bold text-rose-600 border border-rose-200 bg-white hover:bg-rose-50 hover:text-rose-700 h-10 px-5">
                Từ chối kiểm duyệt
              </AppButton>
              <AppButton appVariant="gradient" onClick={handleApprove} disabled={isSubmitting} className="font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-md gap-2 border-none px-6 h-10">
                <CheckCircle2 className="w-4.5 h-4.5" /> Phê duyệt khóa học
              </AppButton>
            </>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        <div className="lg:col-span-8 space-y-6">
          <div className="bg-white rounded-2xl border border-border/60 shadow-sm overflow-hidden">
            <div className="p-5 border-b border-border flex items-center justify-between bg-muted">
              <h2 className="font-extrabold text-foreground flex items-center gap-2">
                {activePreview ? (
                  <>
                    {activePreview.type === "lesson" && <Video className="w-5 h-5 text-info" />}
                    {activePreview.type === "quiz" && <Trophy className="w-5 h-5 text-violet-500" />}
                    Xem trước: {activePreview.data.title || "Nội dung bài"}
                  </>
                ) : (
                  <>
                    <Video className="w-5 h-5 text-indigo-500" /> Video giới thiệu (Promo Video)
                  </>
                )}
              </h2>
              {activePreview && (
                <AppButton appVariant="ghostMuted" variant="ghost" size="sm" className="text-indigo-600 border-none font-bold hover:bg-indigo-50 gap-1 text-xs" onClick={() => setActivePreview(null)}>
                  Xem Promo Video
                </AppButton>
              )}
            </div>
            <div className="p-6">
              {activePreview ? (
                <div className="space-y-4 animate-in fade-in duration-300">
                  {activePreview.type === "lesson" ? (
                    <div className="space-y-4">
                      {activePreview.data.videoUrl ? (
                        <div className="aspect-video rounded-xl bg-slate-950 overflow-hidden shadow-lg border border-border relative">
                          {isEmbedLink(activePreview.data.videoUrl) ? (
                            <iframe
                              ref={playerRef}
                              width="100%"
                              height="100%"
                              src={`${getEmbedUrl(activePreview.data.videoUrl)}&autoplay=true`}
                              title={activePreview.data.title}
                              frameBorder="0"
                              allowFullScreen
                              className="w-full h-full"
                            ></iframe>
                          ) : (
                            <video ref={playerRef} src={activePreview.data.videoUrl} controls className="w-full h-full object-contain" poster={course.thumbnail} />
                          )}
                        </div>
                      ) : (
                        <div className="min-h-[300px] bg-secondary flex items-center justify-center rounded-xl text-muted-foreground">Chưa upload video cho bài học này</div>
                      )}
                      
                      <Tabs defaultValue="content" className="w-full mt-2">
                        <TabsList className="grid w-full grid-cols-2 mb-4 bg-secondary p-1 rounded-xl h-11">
                          <TabsTrigger value="content" className="font-bold text-xs">Tóm tắt bài giảng</TabsTrigger>
                          <TabsTrigger value="attachments" className="font-bold text-xs flex items-center gap-2">
                            <FileText className="w-3.5 h-3.5 text-indigo-600" /> Tài liệu chương
                            {activePreview.moduleAttachments?.length > 0 && (
                              <Badge className="h-4 px-1.5 py-0 text-[10px] bg-indigo-100 text-indigo-700">{activePreview.moduleAttachments.length}</Badge>
                            )}
                          </TabsTrigger>
                        </TabsList>
                        <TabsContent value="content">
                          <div className="p-5 bg-muted border border-border/60 rounded-xl min-h-[120px]">
                            <h4 className="font-black text-[13px] uppercase tracking-wider mb-2.5 flex items-center gap-2"><BookOpen className="w-4 h-4 text-info" /> Chi tiết bài giảng:</h4>
                            <div className="text-muted-foreground text-sm prose prose-sm" dangerouslySetInnerHTML={{__html: activePreview.data.content || "<p>Không có mô tả.</p>"}} />
                          </div>
                        </TabsContent>
                        <TabsContent value="attachments">
                           {activePreview.moduleAttachments?.length > 0 ? (
                             <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                               {activePreview.moduleAttachments.map((file, i) => (
                                 <div key={i} className="flex items-center justify-between p-4 bg-white border border-border rounded-xl shadow-sm hover:border-indigo-200">
                                   <div className="flex items-center gap-3">
                                     <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center text-amber-600 border border-amber-100"><FileText className="w-5 h-5" /></div>
                                     <div className="min-w-0">
                                       <p className="text-[13px] font-bold truncate">{file.fileUrl?.split('/').pop()}</p>
                                       <p className="text-[10px] text-muted-foreground uppercase">{file.fileType || "DOCUMENT"}</p>
                                     </div>
                                   </div>
                                   <AppButton appVariant="ghostMuted" variant="ghost" size="icon" className="border-none hover:bg-muted" onClick={() => window.open(file.fileUrl, '_blank')}><Download className="w-4 h-4" /></AppButton>
                                 </div>
                               ))}
                             </div>
                           ) : (
                             <div className="p-10 text-center border border-dashed rounded-xl flex flex-col items-center justify-center">
                               <FileText className="w-8 h-8 text-slate-300 mb-2" />
                               <p className="text-muted-foreground text-xs font-bold italic">Chương này chưa có tài liệu đính kèm.</p>
                             </div>
                           )}
                        </TabsContent>
                      </Tabs>
                    </div>
                  ) : (
                    <div className="min-h-[350px] bg-gradient-to-br from-violet-50 to-white border border-violet-100 rounded-xl p-6">
                      <div className="flex items-center gap-3 mb-4 border-b border-violet-100 pb-3">
                        <div className="w-10 h-10 rounded-full bg-violet-600 text-white flex items-center justify-center"><Trophy className="w-5 h-5" /></div>
                        <div>
                          <h3 className="font-black">Bài kiểm tra Trắc nghiệm: {activePreview.data.title}</h3>
                          <p className="text-[11px] text-muted-foreground font-bold mt-0.5">Bao gồm {activePreview.data.questions?.length || 0} câu hỏi trắc nghiệm</p>
                        </div>
                      </div>
                      <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2">
                        {activePreview.data.questions?.map((q, idx) => (
                          <div key={q.id} className="p-4 bg-white rounded-xl border border-border shadow-sm">
                            <p className="font-bold text-sm mb-3">Câu {idx + 1}: {q.text || q.content}</p>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                              {q.options ? Object.entries(q.options).map(([key, val]) => (
                                <div key={key} className={`p-2.5 rounded-lg border text-sm font-medium flex items-center justify-between ${q.correct === key ? 'bg-emerald-50 border-emerald-200 text-emerald-800' : 'bg-muted border-transparent text-muted-foreground'}`}>
                                  <div className="flex gap-2">
                                    <span className="font-bold">{key}.</span> 
                                    <span>{val}</span>
                                  </div>
                                </div>
                              )) : q.answers?.map((a) => (
                                <div key={a.id} className={`p-2.5 rounded-lg border text-sm font-medium flex items-center justify-between ${a.isCorrect ? 'bg-emerald-50 border-emerald-200 text-emerald-800' : 'bg-muted border-transparent text-muted-foreground'}`}>
                                  {a.content}
                                </div>
                              ))}
                            </div>
                            {q.explanation && <div className="mt-3 p-3 bg-indigo-50 border border-indigo-100 rounded-lg text-xs font-medium text-indigo-900"><strong className="text-indigo-700">Giải thích:</strong> {q.explanation}</div>}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="aspect-video rounded-xl bg-slate-950 overflow-hidden shadow-lg border border-border relative">
                  {course.promoVideo ? (
                    isEmbedLink(course.promoVideo) ? (
                      <iframe ref={playerRef} width="100%" height="100%" src={getEmbedUrl(course.promoVideo)} title="Promo" frameBorder="0" allowFullScreen className="w-full h-full"></iframe>
                    ) : (
                      <video ref={playerRef} src={course.promoVideo} controls className="w-full h-full object-contain" poster={course.thumbnail} />
                    )
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center text-muted-foreground bg-secondary">
                      <Video className="w-12 h-12 mb-3 opacity-20" />
                      <p className="font-bold">Chưa tải lên Video giới thiệu</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        <CourseCurriculumSidebar 
           course={course} 
           validModules={validModules} 
           totalLessons={totalLessons} 
           setIsProfileModalOpen={setIsProfileModalOpen} 
           setActivePreview={setActivePreview} 
           activePreview={activePreview} 
        />
      </div>

      <CourseRejectModal
         isOpen={isRejectModalOpen}
         onClose={setIsRejectModalOpen}
         courseName={course.title}
         rejectReason={rejectReason}
         setRejectReason={setRejectReason}
         onConfirm={handleConfirmReject}
      />

      <InstructorProfileModal 
         isOpen={isProfileModalOpen}
         onClose={setIsProfileModalOpen}
         instructor={instructorInfo}
      />
    </div>
  );
}


function CourseCurriculumSidebar({ course, validModules, totalLessons, setIsProfileModalOpen, setActivePreview, activePreview }) {
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
        <AppButton appVariant="ghostMuted" variant="ghost"
          size="sm"
          onClick={() => setIsProfileModalOpen(true)}
          className="font-bold text-xs rounded-lg hover:bg-indigo-50 hover:text-indigo-700 transition-colors shrink-0 border border-border"
        >
          Hồ sơ
        </AppButton>
      </div>

      <div className="bg-white rounded-2xl border border-border/60 shadow-sm flex flex-col overflow-hidden max-h-[calc(100vh-200px)]">
        <div className="p-5 bg-slate-900 text-white flex-shrink-0">
          <h3 className="font-black flex items-center gap-2.5 tracking-tight text-[17px]">
            <BookOpen className="w-5 h-5 text-indigo-400" /> Chương trình đào tạo
          </h3>
          <p className="text-slate-300 text-xs font-bold mt-1 flex items-center gap-2">
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