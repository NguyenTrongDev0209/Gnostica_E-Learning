// eslint-disable-next-line no-unused-vars
import React, { useState } from "react";
import { 
  MessageSquare, 
  Star, 
  Reply, 
  ThumbsUp, 
  Clock,
  CheckCircle2,
  AlertCircle,
  Loader2,
  X,
  Plus,
  Edit2,
  Trash2,
  Send,
  Settings
} from "lucide-react";
import AppCard, { AppCardContent, AppCardHeader, AppCardTitle, AppCardDescription } from "@/components/common/micro/AppCard";
import { AppToast } from "@/components/common/micro/AppToast";
import { AppButton } from "@/components/common/micro/AppButton";
import AppInput from "@/components/common/micro/AppInput";
import AppBadge from "@/components/common/micro/AppBadge";
import { Tabs as AppTabsRoot, TabsContent as AppTabsContent, TabsList as AppTabsList, TabsTrigger as AppTabsTrigger } from "@/components/common/micro/AppTabs";
import useInstructorQA from "@/hooks/forum/useInstructorQA";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { instructorDashboardService } from "@/services/instructor/instructorDashboardService";
import { Eye, EyeOff } from "lucide-react";

export default function InstructorQA() {
  const { questions, reviews, loading } = useInstructorQA();

  // State for Review Reply Form
  const [replyingReviewId, setReplyingReviewId] = useState(null);
  const [replyContent, setReplyContent] = useState("");
  
  // State for Question Reply Form
  const [replyingQuestionId, setReplyingQuestionId] = useState(null);
  const [questionReplyContent, setQuestionReplyContent] = useState("");

  const queryClient = useQueryClient();
  const currentUser = (() => {
    try { return JSON.parse(localStorage.getItem('user_info') || localStorage.getItem('user')); } catch { return null; }
  })();
  const userEmail = currentUser?.email;

  const replyMutation = useMutation({
    mutationFn: async ({ parentId, targetId, content }) => {
      return await instructorDashboardService.replyToQuestion(parentId, targetId, content, userEmail);
    },
    onSuccess: () => {
      AppToast.success("Đã gửi phản hồi thành công!");
      setReplyingQuestionId(null);
      setQuestionReplyContent("");
      queryClient.invalidateQueries({ queryKey: ['instructor_qa'] });
    },
    onError: (err) => {
      AppToast.error("Có lỗi xảy ra khi gửi phản hồi: " + err.message);
    }
  });

  const toggleStatusMutation = useMutation({
    mutationFn: async ({ commentId, status }) => {
      return await instructorDashboardService.toggleQuestionStatus(commentId, status, userEmail);
    },
    onSuccess: () => {
      AppToast.success("Đã cập nhật trạng thái hỏi đáp thành công!");
      queryClient.invalidateQueries({ queryKey: ['instructor_qa'] });
    },
    onError: (err) => {
      AppToast.error("Có lỗi xảy ra khi cập nhật trạng thái: " + err.message);
    }
  });

  const handleSubmitQuestionReply = (q) => {
    if (!questionReplyContent.trim()) return;
    if (!userEmail) {
        AppToast.error("Không tìm thấy email người dùng.");
        return;
    }
    replyMutation.mutate({
        parentId: q.id,
        targetId: q.targetId,
        content: questionReplyContent
    });
  };

  const handleToggleStatus = (q) => {
    if (!userEmail) return;
    const newStatus = q.isHidden ? 1 : 0;
    toggleStatusMutation.mutate({
        commentId: q.id,
        status: newStatus
    });
  };
  
  // State for Quick Reply Templates
  const [templates, setTemplates] = useState(() => {
    const saved = localStorage.getItem("gnostica_instructor_reply_templates");
    if (saved) return JSON.parse(saved);
    return [
      "Cảm ơn bạn đã phản hồi, tôi sẽ tiếp tục cải thiện khóa học!",
      "Rất vui vì khóa học mang lại giá trị cho bạn.",
      "Cảm ơn bạn, chúc bạn học tập tốt!"
    ];
  });
  
  const [editingTemplateIdx, setEditingTemplateIdx] = useState(null);
  const [templateInput, setTemplateInput] = useState("");
  const [showTemplateManager, setShowTemplateManager] = useState(false);

  const saveTemplates = (newTemplates) => {
    setTemplates(newTemplates);
    localStorage.setItem("gnostica_instructor_reply_templates", JSON.stringify(newTemplates));
  };

  const handleAddOrEditTemplate = () => {
    if (!templateInput.trim()) return;
    let newTpls = [...templates];
    if (editingTemplateIdx !== null) {
      newTpls[editingTemplateIdx] = templateInput.trim();
    } else {
      newTpls.push(templateInput.trim());
    }
    saveTemplates(newTpls);
    setTemplateInput("");
    setEditingTemplateIdx(null);
  };

  const handleDeleteTemplate = (idx) => {
    let newTpls = [...templates];
    newTpls.splice(idx, 1);
    saveTemplates(newTpls);
  };

  const handleSubmitReply = () => {
    if (!replyContent.trim()) return;
    AppToast.success("Đã gửi phản hồi thành công!");
    setReplyingReviewId(null);
    setReplyContent("");
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  const formatTime = (timeString) => {
    try {
      if (!timeString) return "";
      const date = new Date(timeString);
      return date.toLocaleDateString("vi-VN", {
        day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit"
      });
    // eslint-disable-next-line no-unused-vars
    } catch (e) {
      return timeString;
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground tracking-tight flex items-center gap-2">
            <MessageSquare className="w-6 h-6 text-primary" />
            Hỏi Đáp & Đánh Giá
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Tương tác với học viên qua các câu hỏi bài học và quản lý phản hồi khóa học.
          </p>
        </div>
        <div className="flex text-sm font-bold text-muted-foreground bg-secondary p-1 rounded-lg">
          <AppButton appVariant="outline" variant="outline" className="px-4 h-9 shadow-sm bg-white">Tất cả</AppButton>
          <AppButton appVariant="ghostMuted" variant="ghost" className="px-4 h-9 font-normal">Chưa trả lời</AppButton>
        </div>
      </div>

      <AppTabsRoot defaultValue="questions" className="w-full">
        <AppTabsList className="mb-6 bg-secondary p-1">
          <AppTabsTrigger value="questions" className="px-8 py-2.5 font-bold data-[state=active]:bg-white data-[state=active]:text-success data-[state=active]:shadow-sm">
            <MessageSquare className="w-4 h-4 mr-2" />
            Hỏi Đáp ({questions.filter(q => q.status === 'unanswered').length})
          </AppTabsTrigger>
          <AppTabsTrigger value="reviews" className="px-8 py-2.5 font-bold data-[state=active]:bg-white data-[state=active]:text-amber-600 data-[state=active]:shadow-sm">
            <Star className="w-4 h-4 mr-2" />
            Đánh Giá ({reviews.filter(r => r.status === 'not_responded').length})
          </AppTabsTrigger>
        </AppTabsList>

        <AppTabsContent value="questions" className="space-y-4">
           {questions.length === 0 ? (
             <div className="text-center py-10 bg-muted/50 rounded-lg">Không có câu hỏi nào.</div>
           ) : questions.map((q) => (
             <AppCard key={q.id} className="border-border shadow-sm hover:border-success/20 transition-colors group">
               <AppCardContent className="p-0">
                 <div className="p-5 flex gap-4">
                   <div className="w-10 h-10 rounded-full overflow-hidden border border-border shrink-0">
                     <img src={q.studentAvatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${q.studentName}`} alt={q.studentName} className="w-full h-full object-cover" />
                   </div>
                   <div className="flex-1 min-w-0">
                     <div className="flex justify-between items-start mb-2">
                       <div>
                         <h4 className="font-bold text-foreground">{q.studentName}</h4>
                         <p className="text-xs text-muted-foreground font-bold uppercase tracking-tight">{formatTime(q.createdAt)}</p>
                       </div>
                       {q.status === 'unanswered' ? (
                         <AppBadge className="bg-warning/10 text-warning hover:bg-warning/10 border-none font-bold">
                           <AlertCircle className="w-3 h-3 mr-1.5" /> Chưa phản hồi
                         </AppBadge>
                       ) : (
                         <AppBadge className="bg-success/10 text-success hover:bg-success/10 text-success border-none font-bold">
                           <CheckCircle2 className="w-3 h-3 mr-1.5" /> Đã trả lời
                         </AppBadge>
                       )}
                     </div>
                     <p className="text-sm font-bold text-foreground mb-3 bg-muted p-3 rounded-lg border-l-4 border-l-green-500">
                       "{q.content}"
                     </p>
                     <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs font-bold text-muted-foreground uppercase tracking-tighter">
                       <span className="flex items-center gap-1">Khóa: <span className="text-muted-foreground font-bold">{q.courseName}</span></span>
                       <span className="flex items-center gap-1">Bài: <span className="text-muted-foreground font-bold">{q.lessonName}</span></span>
                     </div>
                     {q.replies && q.replies.length > 0 && (
                       <div className="mt-4 pl-4 border-l-2 border-border space-y-4">
                         {q.replies.map(reply => (
                           <div key={reply.id} className="flex gap-3">
                             <div className="w-8 h-8 rounded-full overflow-hidden border border-border shrink-0">
                               <img src={reply.studentAvatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${reply.studentName}`} alt={reply.studentName} className="w-full h-full object-cover" />
                             </div>
                             <div className="flex-1 bg-secondary/50 rounded-lg p-3 relative">
                               <div className="flex justify-between items-center mb-1">
                                 <h5 className="font-bold text-sm text-foreground flex items-center gap-2">
                                    {reply.studentName}
                                    {reply.isAuthor && (
                                        <AppBadge className="bg-blue-100 text-blue-700 hover:bg-blue-100 border-none px-1.5 py-0 text-[10px]">Tác giả</AppBadge>
                                    )}
                                 </h5>
                                 <span className="text-[10px] text-muted-foreground font-bold uppercase">{formatTime(reply.createdAt)}</span>
                               </div>
                               <p className="text-sm font-medium text-foreground">{reply.content}</p>
                             </div>
                           </div>
                         ))}
                       </div>
                     )}
                   </div>
                 </div>
                 <div className="px-5 py-3 border-t border-border bg-muted flex justify-between items-center group-hover:bg-success/5 transition-colors">
                    <div className="flex items-center gap-4">
                      <button className="text-xs font-bold text-muted-foreground hover:text-muted-foreground flex items-center gap-1.5">
                        <ThumbsUp className="w-3.5 h-3.5" /> {q.likes || 0} Hữu ích
                      </button>
                    </div>
                    <div className="flex items-center gap-2">
                        <AppButton 
                            onClick={() => handleToggleStatus(q)}
                            appVariant="ghostMuted" 
                            variant="ghost"
                            size="sm" 
                            className={`h-8 font-bold ${q.isHidden ? 'text-muted-foreground hover:bg-secondary' : 'text-danger hover:bg-danger/10 hover:text-danger'}`}
                        >
                            {q.isHidden ? <><Eye className="w-3.5 h-3.5 mr-1.5" /> Đã ẩn</> : <><EyeOff className="w-3.5 h-3.5 mr-1.5" /> Ẩn hỏi đáp</>}
                        </AppButton>
                        <AppButton 
                        onClick={() => setReplyingQuestionId(replyingQuestionId === q.id ? null : q.id)}
                        appVariant="gradient" 
                        size="sm" 
                        className="bg-success/10 text-success hover:bg-success/20 font-bold h-8"
                        >
                        {replyingQuestionId === q.id ? "Đóng lại" : <><Reply className="w-3.5 h-3.5 mr-1.5" /> Phản hồi ngay</>}
                        </AppButton>
                    </div>
                 </div>

                 {replyingQuestionId === q.id && (
                    <div className="px-5 py-4 bg-background border-t border-border animate-in fade-in slide-in-from-top-2 duration-200">
                       <textarea
                          value={questionReplyContent}
                          onChange={(e) => setQuestionReplyContent(e.target.value)}
                          placeholder="Nhập nội dung hướng dẫn/trả lời học viên..."
                          className="w-full rounded-md border border-border bg-background p-3 text-sm outline-none focus:border-primary min-h-[100px]"
                       />
                       <div className="mt-4 flex justify-end gap-2">
                          <AppButton variant="ghost" size="sm" onClick={() => setReplyingQuestionId(null)}>Hủy</AppButton>
                          <AppButton size="sm" onClick={() => handleSubmitQuestionReply(q)} disabled={!questionReplyContent.trim() || replyMutation.isPending} className="flex items-center gap-2">
                            {replyMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />} Gửi phản hồi
                          </AppButton>
                       </div>
                    </div>
                 )}
               </AppCardContent>
             </AppCard>
           ))}
        </AppTabsContent>

        <AppTabsContent value="reviews" className="space-y-4">
           {reviews.length === 0 ? (
             <div className="text-center py-10 bg-muted/50 rounded-lg">Không có đánh giá nào.</div>
           ) : reviews.map((r) => (
             <AppCard key={r.id} className="border-border shadow-sm hover:border-amber-200 transition-colors">
               <AppCardContent className="p-0">
                 <div className="p-5 flex gap-4">
                    <div className="w-10 h-10 rounded-full overflow-hidden border border-border shrink-0">
                      <img src={r.studentAvatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${r.studentName}`} alt={r.studentName} className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1 min-w-0">
                       <div className="flex justify-between items-start mb-2">
                         <div>
                            <h4 className="font-bold text-foreground">{r.studentName}</h4>
                            <div className="flex gap-0.5 mt-1">
                              {[1, 2, 3, 4, 5].map((star) => (
                                <Star key={star} className={`w-3 h-3 ${star <= r.rating ? 'text-amber-500 fill-amber-500' : 'text-slate-200'}`} />
                              ))}
                            </div>
                         </div>
                         <span className="text-xs text-muted-foreground font-bold uppercase">{formatTime(r.createdAt)}</span>
                       </div>
                       <p className="text-sm font-medium text-muted-foreground py-3 italic">"{r.content}"</p>
                       <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest px-2 py-0.5 bg-secondary w-fit rounded">
                         Khóa học: <span className="text-foreground">{r.courseName}</span>
                       </p>
                    </div>
                 </div>
                 <div className="px-5 py-3 border-t border-border bg-muted flex justify-end">
                    <AppButton 
                      onClick={() => setReplyingReviewId(replyingReviewId === r.id ? null : r.id)}
                      appVariant="ghostMuted" 
                      variant="ghost" 
                      size="sm" 
                      className={`h-8 font-bold ${replyingReviewId === r.id ? 'text-foreground hover:bg-secondary' : 'text-warning hover:bg-warning/10 hover:text-warning'}`}
                    >
                      {replyingReviewId === r.id ? "Đóng lại" : "Trả lời đánh giá \u2192"}
                    </AppButton>
                 </div>
                 
                 {replyingReviewId === r.id && (
                    <div className="px-5 py-4 bg-background border-t border-border animate-in fade-in slide-in-from-top-2 duration-200">
                       <textarea
                          value={replyContent}
                          onChange={(e) => setReplyContent(e.target.value)}
                          placeholder="Nhập nội dung trả lời của bạn..."
                          className="w-full rounded-md border border-border bg-background p-3 text-sm outline-none focus:border-primary min-h-[80px]"
                       />
                       
                       <div className="mt-3">
                         <div className="flex items-center justify-between mb-2">
                           <span className="text-xs font-bold text-muted-foreground uppercase">Mẫu trả lời nhanh</span>
                           <button onClick={() => setShowTemplateManager(!showTemplateManager)} className="text-xs text-primary hover:underline flex items-center gap-1">
                             <Settings className="w-3 h-3" /> Quản lý mẫu
                           </button>
                         </div>
                         
                         {/* Danh sách templates để click chọn */}
                         {!showTemplateManager && (
                           <div className="flex flex-wrap gap-2">
                             {templates.map((tpl, idx) => (
                               <button 
                                 key={idx}
                                 onClick={() => setReplyContent(tpl)}
                                 className="text-xs bg-secondary hover:bg-secondary/80 text-foreground px-3 py-1.5 rounded-full transition-colors text-left"
                               >
                                 {tpl.length > 50 ? tpl.substring(0, 50) + "..." : tpl}
                               </button>
                             ))}
                             {templates.length === 0 && <span className="text-xs text-muted-foreground italic">Chưa có mẫu nào.</span>}
                           </div>
                         )}

                         {/* Trình quản lý mẫu (Thêm/Sửa/Xóa) */}
                         {showTemplateManager && (
                           <div className="bg-muted p-3 rounded-lg border border-border">
                              <div className="flex gap-2 mb-3">
                                <input
                                  type="text"
                                  value={templateInput}
                                  onChange={(e) => setTemplateInput(e.target.value)}
                                  placeholder="Nhập nội dung mẫu..."
                                  className="flex-1 rounded border border-border bg-background px-2 py-1 text-sm outline-none focus:border-primary"
                                />
                                <AppButton size="sm" onClick={handleAddOrEditTemplate} disabled={!templateInput.trim()}>
                                  {editingTemplateIdx !== null ? "Lưu" : "Thêm"}
                                </AppButton>
                                {editingTemplateIdx !== null && (
                                  <AppButton variant="ghost" size="sm" onClick={() => {setEditingTemplateIdx(null); setTemplateInput("");}}>Hủy</AppButton>
                                )}
                              </div>
                              <div className="space-y-1 max-h-[150px] overflow-y-auto pr-2">
                                {templates.map((tpl, idx) => (
                                  <div key={idx} className="flex justify-between items-center bg-background border border-border rounded px-2 py-1.5 group">
                                    <span className="text-xs text-foreground flex-1 line-clamp-1">{tpl}</span>
                                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity ml-2">
                                      <button onClick={() => {setEditingTemplateIdx(idx); setTemplateInput(tpl);}} className="p-1 hover:bg-muted text-muted-foreground hover:text-primary rounded">
                                        <Edit2 className="w-3 h-3" />
                                      </button>
                                      <button onClick={() => handleDeleteTemplate(idx)} className="p-1 hover:bg-error/10 text-muted-foreground hover:text-error rounded">
                                        <Trash2 className="w-3 h-3" />
                                      </button>
                                    </div>
                                  </div>
                                ))}
                              </div>
                           </div>
                         )}
                       </div>

                       <div className="mt-4 flex justify-end gap-2">
                          <AppButton variant="ghost" size="sm" onClick={() => setReplyingReviewId(null)}>Hủy</AppButton>
                          <AppButton size="sm" onClick={handleSubmitReply} disabled={!replyContent.trim()} className="flex items-center gap-2">
                            <Send className="w-4 h-4" /> Gửi phản hồi
                          </AppButton>
                       </div>
                    </div>
                 )}
               </AppCardContent>
             </AppCard>
           ))}
        </AppTabsContent>
      </AppTabsRoot>
    </div>
  );
}
