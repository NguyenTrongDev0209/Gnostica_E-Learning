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
import commentService from "@/services/forum/commentService";
import { Eye, EyeOff, Pencil } from "lucide-react";

export default function InstructorQA() {
  const { questions, reviews, templates, loading } = useInstructorQA();

  // State for Review Reply Form
  const [replyingReviewId, setReplyingReviewId] = useState(null);
  const [replyContent, setReplyContent] = useState("");
  const [reviewFilter, setReviewFilter] = useState("all");
  
  const [editingCommentId, setEditingCommentId] = useState(null);
  const [editingContent, setEditingContent] = useState("");
  
  const [editingReviewReplyId, setEditingReviewReplyId] = useState(null);
  const [editingReviewContent, setEditingReviewContent] = useState("");

  // State for Question Reply Form
  const [replyingQuestionId, setReplyingQuestionId] = useState(null);
  const [questionReplyContent, setQuestionReplyContent] = useState("");
  const [questionFilter, setQuestionFilter] = useState("all");

  const [expandedComments, setExpandedComments] = useState({});
  const [expandedReviews, setExpandedReviews] = useState({});

  const toggleComments = (id) => setExpandedComments(prev => ({ ...prev, [id]: !prev[id] }));
  const toggleReviews = (id) => setExpandedReviews(prev => ({ ...prev, [id]: !prev[id] }));

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

  const deleteMutation = useMutation({
    mutationFn: async (commentId) => {
      return await commentService.deleteComment(commentId, userEmail);
    },
    onSuccess: () => {
      AppToast.success("Đã xóa bình luận thành công!");
      queryClient.invalidateQueries({ queryKey: ['instructor_qa'] });
    },
    onError: (err) => {
      AppToast.error("Có lỗi xảy ra khi xóa bình luận: " + err.message);
    }
  });

  const editMutation = useMutation({
    mutationFn: async ({ commentId, content }) => {
      return await commentService.updateComment(commentId, { content, userEmail });
    },
    onSuccess: () => {
      AppToast.success("Đã cập nhật bình luận thành công!");
      setEditingCommentId(null);
      setEditingContent("");
      queryClient.invalidateQueries({ queryKey: ['instructor_qa'] });
    },
    onError: (err) => {
      AppToast.error("Có lỗi xảy ra khi cập nhật bình luận: " + err.message);
    }
  });

  const deleteReviewMutation = useMutation({
    mutationFn: async (reviewId) => {
      return await instructorDashboardService.deleteReview(reviewId);
    },
    onSuccess: () => {
      AppToast.success("Đã xóa phản hồi đánh giá thành công!");
      queryClient.invalidateQueries({ queryKey: ['instructor_qa'] });
    },
    onError: (err) => {
      AppToast.error("Có lỗi xảy ra khi xóa phản hồi: " + err.message);
    }
  });

  const editReviewMutation = useMutation({
    mutationFn: async ({ reviewId, content }) => {
      return await instructorDashboardService.updateReview(reviewId, content);
    },
    onSuccess: () => {
      AppToast.success("Đã cập nhật phản hồi đánh giá thành công!");
      setEditingReviewReplyId(null);
      setEditingReviewContent("");
      queryClient.invalidateQueries({ queryKey: ['instructor_qa'] });
    },
    onError: (err) => {
      AppToast.error("Có lỗi xảy ra khi cập nhật phản hồi: " + err.message);
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

  const replyReviewMutation = useMutation({
    mutationFn: async ({ parentReviewId, content }) => {
      return await instructorDashboardService.replyToReview(parentReviewId, content);
    },
    onSuccess: () => {
      AppToast.success("Đã gửi phản hồi đánh giá thành công!");
      setReplyingReviewId(null);
      setReplyContent("");
      queryClient.invalidateQueries({ queryKey: ['instructor_qa'] });
    },
    onError: (err) => {
      AppToast.error("Có lỗi xảy ra khi gửi phản hồi: " + err.message);
    }
  });

  const handleToggleStatus = (q) => {
    if (!userEmail) return;
    const newStatus = q.isHidden ? 1 : 0;
    toggleStatusMutation.mutate({
        commentId: q.id,
        status: newStatus
    });
  };
  
  // State for Quick Reply Templates
  const [editingTemplateId, setEditingTemplateId] = useState(null);
  const [templateInput, setTemplateInput] = useState("");
  const [showTemplateManager, setShowTemplateManager] = useState(false);

  const addTemplateMutation = useMutation({
    mutationFn: async (content) => {
      return await instructorDashboardService.createReplyTemplate(content);
    },
    onSuccess: () => {
      AppToast.success("Đã thêm mẫu thành công!");
      setTemplateInput("");
      queryClient.invalidateQueries({ queryKey: ['instructor_qa'] });
    }
  });

  const editTemplateMutation = useMutation({
    mutationFn: async ({ id, content }) => {
      return await instructorDashboardService.updateReplyTemplate(id, content);
    },
    onSuccess: () => {
      AppToast.success("Đã cập nhật mẫu thành công!");
      setTemplateInput("");
      setEditingTemplateId(null);
      queryClient.invalidateQueries({ queryKey: ['instructor_qa'] });
    }
  });

  const deleteTemplateMutation = useMutation({
    mutationFn: async (id) => {
      return await instructorDashboardService.deleteReplyTemplate(id);
    },
    onSuccess: () => {
      AppToast.success("Đã xóa mẫu thành công!");
      queryClient.invalidateQueries({ queryKey: ['instructor_qa'] });
    }
  });

  const handleAddOrEditTemplate = () => {
    if (!templateInput.trim()) return;
    if (editingTemplateId !== null) {
      editTemplateMutation.mutate({ id: editingTemplateId, content: templateInput.trim() });
    } else {
      addTemplateMutation.mutate(templateInput.trim());
    }
  };

  const handleDeleteTemplate = (id) => {
    deleteTemplateMutation.mutate(id);
  };

  const handleSubmitReply = () => {
    if (!replyContent.trim() || !replyingReviewId) return;
    replyReviewMutation.mutate({
      parentReviewId: replyingReviewId,
      content: replyContent
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  const filteredQuestions = questions.filter(q => {
    if (questionFilter === "unanswered") return q.status === "unanswered" && !q.isHidden;
    if (questionFilter === "hidden") return q.isHidden;
    return true; // "all"
  });

  const filteredReviews = reviews.filter(r => {
    if (reviewFilter === "not_responded") return r.status === "not_responded";
    if (reviewFilter === "responded") return r.status === "responded";
    return true; // "all"
  });

  const flattenReplies = (replies = [], parentAuthorName = null, depth = 0) => {
    return replies.flatMap(r => [
        { ...r, parentAuthorName, depth },
        ...flattenReplies(r.replies || [], r.studentName, depth + 1)
    ]);
  };

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
      </div>

      <AppTabsRoot defaultValue="questions" className="w-full">
        <AppTabsList className="mb-6 bg-secondary p-1">
          <AppTabsTrigger value="questions" className="px-8 py-2.5 font-bold data-[state=active]:bg-white data-[state=active]:text-success data-[state=active]:shadow-sm">
            <MessageSquare className="w-4 h-4 mr-2" />
            Hỏi Đáp
          </AppTabsTrigger>
          <AppTabsTrigger value="reviews" className="px-8 py-2.5 font-bold data-[state=active]:bg-white data-[state=active]:text-amber-600 data-[state=active]:shadow-sm">
            <Star className="w-4 h-4 mr-2" />
            Đánh Giá
          </AppTabsTrigger>
        </AppTabsList>

        <AppTabsContent value="questions" className="space-y-4">
           <div className="flex justify-end mb-2">
             <div className="flex text-sm font-bold text-muted-foreground bg-secondary p-1 rounded-lg w-fit">
               <AppButton onClick={() => setQuestionFilter("all")} className={`px-4 h-8 ${questionFilter === "all" ? "shadow-sm bg-white font-bold" : "font-normal bg-transparent"}`} appVariant={questionFilter === "all" ? "outline" : "ghostMuted"} variant={questionFilter === "all" ? "outline" : "ghost"} size="sm">Tất cả</AppButton>
               <AppButton onClick={() => setQuestionFilter("unanswered")} className={`px-4 h-8 ${questionFilter === "unanswered" ? "shadow-sm bg-white font-bold" : "font-normal bg-transparent"}`} appVariant={questionFilter === "unanswered" ? "outline" : "ghostMuted"} variant={questionFilter === "unanswered" ? "outline" : "ghost"} size="sm">Chưa trả lời</AppButton>
               <AppButton onClick={() => setQuestionFilter("hidden")} className={`px-4 h-8 ${questionFilter === "hidden" ? "shadow-sm bg-white font-bold" : "font-normal bg-transparent"}`} appVariant={questionFilter === "hidden" ? "outline" : "ghostMuted"} variant={questionFilter === "hidden" ? "outline" : "ghost"} size="sm">Đang ẩn</AppButton>
             </div>
           </div>
           {filteredQuestions.length === 0 ? (
             <div className="text-center py-10 bg-muted/50 rounded-lg">Không có câu hỏi nào.</div>
           ) : filteredQuestions.map((q) => (
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
                       <span className="flex items-center gap-1">Khóa học: <span className="text-muted-foreground font-bold">{q.courseName}</span></span>
                       <span className="flex items-center gap-1">Bài: <span className="text-muted-foreground font-bold">{q.lessonName}</span></span>
                     </div>
                     
                     <div className="mt-3 flex items-center gap-2">
                         <AppButton 
                             onClick={() => handleToggleStatus(q)}
                             appVariant="ghostMuted" 
                             variant="ghost"
                             size="sm" 
                             className={`h-7 px-2 font-bold ${q.isHidden ? 'text-muted-foreground hover:bg-secondary' : 'text-danger hover:bg-danger/10 hover:text-danger'}`}
                             title={q.isHidden ? "Hiển thị" : "Ẩn"}
                         >
                             {q.isHidden ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                         </AppButton>
                         <AppButton 
                             onClick={() => {
                                setReplyingQuestionId(replyingQuestionId === q.id ? null : q.id);
                                setEditingCommentId(null);
                             }}
                             appVariant="ghostMuted" 
                             variant="ghost" 
                             size="sm" 
                             className="h-7 px-2 font-bold text-primary hover:bg-primary/10"
                         >
                             {replyingQuestionId === q.id ? "Đóng lại" : "Phản hồi"}
                         </AppButton>
                         <AppButton 
                             onClick={() => {
                                 if (window.confirm("Bạn có chắc chắn muốn xóa bài thảo luận này?")) {
                                     deleteMutation.mutate(q.id);
                                 }
                             }}
                             appVariant="ghostMuted" 
                             variant="ghost" 
                             size="sm" 
                             className="h-7 px-2 font-bold text-muted-foreground hover:text-danger hover:bg-danger/10 ml-auto"
                         >
                             Xóa
                         </AppButton>
                     </div>

                     {replyingQuestionId === q.id && (
                        <div className="mt-3 bg-background border border-border rounded-lg p-3 animate-in fade-in slide-in-from-top-2 duration-200">
                           <textarea
                              value={questionReplyContent}
                              onChange={(e) => setQuestionReplyContent(e.target.value)}
                              placeholder={`Trả lời @${q.studentName}...`}
                              className="w-full rounded-md border border-border bg-background p-3 text-sm outline-none focus:border-primary min-h-[80px]"
                           />
                           <div className="mt-3 flex justify-end gap-2">
                              <AppButton variant="ghost" size="sm" onClick={() => setReplyingQuestionId(null)}>Hủy</AppButton>
                              <AppButton size="sm" onClick={() => handleSubmitQuestionReply(q)} disabled={!questionReplyContent.trim() || replyMutation.isPending} className="flex items-center gap-2">
                                {replyMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />} Gửi phản hồi
                              </AppButton>
                           </div>
                        </div>
                     )}

                     {q.replies && q.replies.length > 0 && (
                       <div className="mt-4">
                         <button onClick={() => toggleComments(q.id)} className="text-[13px] font-bold text-primary hover:underline flex items-center gap-1 mt-3 mb-2">
                           {expandedComments[q.id] ? "Thu gọn câu trả lời" : `Xem ${q.replies.length} câu trả lời`}
                         </button>
                         {expandedComments[q.id] && (
                           <div className="pl-4 border-l-2 border-border space-y-4">
                             {flattenReplies(q.replies, q.studentName).map(reply => (
                               <div key={reply.id} className="flex gap-3 relative group">
                             <div className="w-8 h-8 rounded-full overflow-hidden border border-border shrink-0">
                               <img src={reply.studentAvatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${reply.studentName}`} alt={reply.studentName} className="w-full h-full object-cover" />
                             </div>
                             <div className="flex-1 bg-secondary/50 rounded-lg p-3 relative opacity-100 transition-opacity">
                               {reply.isHidden && (
                                   <div className="absolute inset-0 bg-background/50 rounded-lg pointer-events-none" />
                               )}
                               <div className="flex justify-between items-center mb-1">
                                 <h5 className="font-bold text-sm text-foreground flex flex-wrap items-center gap-2">
                                    {reply.studentName}
                                    {reply.isAuthor && (
                                        <AppBadge className="bg-[#6b4eff] text-white hover:bg-[#6b4eff] border-none px-1.5 py-0 text-[11px]">Tác giả</AppBadge>
                                    )}
                                    {reply.parentAuthorName && (
                                        <span className="inline-flex items-center rounded-md border border-primary/20 bg-primary/5 px-1.5 py-0.5 text-[11px] font-semibold text-primary">
                                            trả lời @{reply.parentAuthorName}
                                        </span>
                                    )}
                                    {reply.isHidden && (
                                        <span className="text-[10px] text-danger font-bold uppercase">(Đang ẩn)</span>
                                    )}
                                 </h5>
                                 <span className="text-[10px] text-muted-foreground font-bold uppercase">{formatTime(reply.createdAt)}</span>
                               </div>
                               {editingCommentId === reply.id ? (
                                   <div className="mt-2">
                                       <textarea
                                          value={editingContent}
                                          onChange={(e) => setEditingContent(e.target.value)}
                                          className="w-full rounded-md border border-border bg-background p-2 text-sm outline-none focus:border-primary min-h-[70px] relative z-10"
                                       />
                                       <div className="mt-2 flex justify-end gap-2 relative z-10">
                                          <AppButton variant="ghost" size="sm" onClick={() => setEditingCommentId(null)}>Hủy</AppButton>
                                          <AppButton size="sm" onClick={() => {
                                              if (!editingContent.trim()) return;
                                              editMutation.mutate({ commentId: reply.id, content: editingContent });
                                          }} disabled={!editingContent.trim() || editMutation.isPending} className="flex items-center gap-2">
                                            {editMutation.isPending && <Loader2 className="w-4 h-4 animate-spin" />} Lưu
                                          </AppButton>
                                       </div>
                                   </div>
                               ) : (
                                   <p className="text-sm font-bold text-foreground relative z-10">{reply.content}</p>
                               )}

                               <div className="mt-2 flex items-center gap-2 relative z-10">
                                   <AppButton 
                                       onClick={() => handleToggleStatus(reply)}
                                       appVariant="ghostMuted" 
                                       variant="ghost"
                                       size="sm" 
                                       className={`h-6 px-1.5 font-bold ${reply.isHidden ? 'text-muted-foreground hover:bg-secondary' : 'text-danger hover:bg-danger/10 hover:text-danger'}`}
                                       title={reply.isHidden ? "Hiển thị" : "Ẩn"}
                                   >
                                       {reply.isHidden ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                                   </AppButton>
                                   <AppButton 
                                       onClick={() => {
                                          setReplyingQuestionId(replyingQuestionId === reply.id ? null : reply.id);
                                          setEditingCommentId(null);
                                       }}
                                       appVariant="ghostMuted" 
                                       variant="ghost" 
                                       size="sm" 
                                       className="h-6 px-1.5 text-[11px] font-bold text-primary hover:bg-primary/10"
                                   >
                                       {replyingQuestionId === reply.id ? "Đóng lại" : "Phản hồi"}
                                   </AppButton>
                                   {reply.isAuthor && (
                                       <>
                                           <AppButton 
                                               onClick={() => {
                                                   if (editingCommentId === reply.id) {
                                                       setEditingCommentId(null);
                                                   } else {
                                                       setEditingCommentId(reply.id);
                                                       setEditingContent(reply.content);
                                                       setReplyingQuestionId(null);
                                                   }
                                               }}
                                               appVariant="ghostMuted" 
                                               variant="ghost" 
                                               size="sm" 
                                               className="h-6 px-1.5 text-[11px] font-bold text-muted-foreground hover:text-primary hover:bg-primary/10 ml-auto"
                                           >
                                               Sửa
                                           </AppButton>
                                           <AppButton 
                                               onClick={() => {
                                                   if (window.confirm("Bạn có chắc chắn muốn xóa bình luận này?")) {
                                                       deleteMutation.mutate(reply.id);
                                                   }
                                               }}
                                               appVariant="ghostMuted" 
                                               variant="ghost" 
                                               size="sm" 
                                               className="h-6 px-1.5 text-[11px] font-bold text-muted-foreground hover:text-danger hover:bg-danger/10"
                                           >
                                               Xóa
                                           </AppButton>
                                       </>
                                   )}
                               </div>
                               
                               {replyingQuestionId === reply.id && (
                                  <div className="mt-3 bg-background border border-border rounded-lg p-3 animate-in fade-in slide-in-from-top-2 duration-200 relative z-10">
                                     <textarea
                                        value={questionReplyContent}
                                        onChange={(e) => setQuestionReplyContent(e.target.value)}
                                        placeholder={`Trả lời @${reply.studentName}...`}
                                        className="w-full rounded-md border border-border bg-background p-2 text-sm outline-none focus:border-primary min-h-[70px]"
                                     />
                                     <div className="mt-3 flex justify-end gap-2">
                                        <AppButton variant="ghost" size="sm" onClick={() => setReplyingQuestionId(null)}>Hủy</AppButton>
                                        <AppButton size="sm" onClick={() => {
                                            // Handle reply to reply
                                            if (!questionReplyContent.trim() || !userEmail) return;
                                            replyMutation.mutate({
                                                parentId: reply.id,
                                                targetId: q.targetId, // Same lesson target
                                                content: questionReplyContent
                                            });
                                        }} disabled={!questionReplyContent.trim() || replyMutation.isPending} className="flex items-center gap-2">
                                          {replyMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />} Gửi phản hồi
                                        </AppButton>
                                     </div>
                                  </div>
                               )}
                             </div>
                           </div>
                         ))}
                           </div>
                         )}
                       </div>
                     )}
                   </div>
                 </div>
               </AppCardContent>
             </AppCard>
           ))}
        </AppTabsContent>

        <AppTabsContent value="reviews" className="space-y-4">
           {/* Bộ lọc cho Đánh giá */}
           <div className="flex justify-end mb-2">
             <div className="flex text-sm font-bold text-muted-foreground bg-secondary p-1 rounded-lg w-fit">
               <AppButton onClick={() => setReviewFilter("all")} className={`px-4 h-8 ${reviewFilter === "all" ? "shadow-sm bg-white font-bold" : "font-normal bg-transparent"}`} appVariant={reviewFilter === "all" ? "outline" : "ghostMuted"} variant={reviewFilter === "all" ? "outline" : "ghost"} size="sm">Tất cả</AppButton>
               <AppButton onClick={() => setReviewFilter("not_responded")} className={`px-4 h-8 ${reviewFilter === "not_responded" ? "shadow-sm bg-white font-bold" : "font-normal bg-transparent"}`} appVariant={reviewFilter === "not_responded" ? "outline" : "ghostMuted"} variant={reviewFilter === "not_responded" ? "outline" : "ghost"} size="sm">Chưa trả lời</AppButton>
               <AppButton onClick={() => setReviewFilter("responded")} className={`px-4 h-8 ${reviewFilter === "responded" ? "shadow-sm bg-white font-bold" : "font-normal bg-transparent"}`} appVariant={reviewFilter === "responded" ? "outline" : "ghostMuted"} variant={reviewFilter === "responded" ? "outline" : "ghost"} size="sm">Đã trả lời</AppButton>
             </div>
           </div>

           {filteredReviews.length === 0 ? (
             <div className="text-center py-10 bg-muted/50 rounded-lg font-semibold">Không có đánh giá nào.</div>
           ) : filteredReviews.map((r) => (
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
                       <p className="text-sm font-bold text-foreground py-3 italic">"{r.content}"</p>
                        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest px-2 py-0.5 bg-secondary w-fit rounded">
                          Khóa học: <span className="text-foreground">{r.courseName}</span>
                        </p>
                        
                        <div className="mt-3 flex justify-start">
                           <AppButton 
                             onClick={() => setReplyingReviewId(replyingReviewId === r.id ? null : r.id)}
                             appVariant="ghostMuted" 
                             variant="ghost" 
                             size="sm" 
                             className={`h-7 px-2 font-bold ${replyingReviewId === r.id ? 'text-primary bg-primary/10' : 'text-primary hover:bg-primary/10'}`}
                           >
                             {replyingReviewId === r.id ? "Đóng lại" : "Trả lời"}
                           </AppButton>
                        </div>
                     </div>
                  </div>

                  {/* Hiển thị các câu trả lời đánh giá */}
                  {r.replies && r.replies.length > 0 && (
                    <div className="mt-4">
                      <button onClick={() => toggleReviews(r.id)} className="text-[13px] font-bold text-primary hover:underline flex items-center gap-1 mt-3 mb-2 px-5">
                        {expandedReviews[r.id] ? "Thu gọn câu trả lời" : `Xem ${r.replies.length} câu trả lời`}
                      </button>
                      {expandedReviews[r.id] && (
                        <div className="pl-4 border-l-2 border-border space-y-4 px-5 pb-5">
                          {flattenReplies(r.replies, r.studentName).map((reply) => (
                            <div key={reply.id} className="flex gap-3 relative group">
                          <div className="w-8 h-8 rounded-full overflow-hidden border border-border shrink-0 z-10 relative">
                            <img src={reply.studentAvatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${reply.studentName}`} alt={reply.studentName} className="w-full h-full object-cover" />
                          </div>
                          <div className="flex-1 bg-secondary/50 border border-border rounded-lg p-3">
                            <div className="flex justify-between items-start mb-2">
                              <div className="flex items-center gap-2">
                                <span className="font-bold text-sm text-foreground">{reply.studentName}</span>
                                {reply.isAuthor && (
                                  <AppBadge variant="secondary" className="text-[10px] h-5 bg-primary/10 text-primary border-primary/20">
                                    Tác giả
                                  </AppBadge>
                                )}
                                {reply.parentAuthorName && (
                                    <span className="inline-flex items-center rounded-md border border-primary/20 bg-primary/5 px-1.5 py-0.5 text-[11px] font-semibold text-primary">
                                        trả lời @{reply.parentAuthorName}
                                    </span>
                                )}
                              </div>
                              <span className="text-[10px] text-muted-foreground font-semibold">{formatTime(reply.createdAt)}</span>
                            </div>

                            {editingReviewReplyId === reply.id ? (
                              <div className="mt-2">
                                <textarea
                                   value={editingReviewContent}
                                   onChange={(e) => setEditingReviewContent(e.target.value)}
                                   className="w-full rounded border border-border bg-background p-2 text-sm font-semibold text-foreground outline-none focus:border-primary"
                                   rows={3}
                                />
                                <div className="flex justify-end gap-2 mt-2">
                                  <AppButton variant="ghost" size="sm" onClick={() => setEditingReviewReplyId(null)}>Hủy</AppButton>
                                  <AppButton size="sm" onClick={() => editReviewMutation.mutate({ reviewId: reply.id, content: editingReviewContent })} disabled={!editingReviewContent.trim() || editReviewMutation.isPending}>
                                    Lưu thay đổi
                                  </AppButton>
                                </div>
                              </div>
                            ) : (
                              <div className="text-sm font-bold text-foreground whitespace-pre-wrap">{reply.content}</div>
                            )}

                            <div className="mt-2 flex gap-2 justify-end">
                                <AppButton 
                                    onClick={() => setReplyingReviewId(replyingReviewId === reply.id ? null : reply.id)}
                                    appVariant="ghostMuted" 
                                    variant="ghost" 
                                    size="sm" 
                                    className="h-6 px-1.5 text-[11px] font-bold text-primary hover:bg-primary/10"
                                >
                                    {replyingReviewId === reply.id ? "Đóng lại" : "Trả lời"}
                                </AppButton>
                                {reply.isAuthor && (
                                  <>
                                    <AppButton 
                                        onClick={() => {
                                            if (editingReviewReplyId === reply.id) {
                                                setEditingReviewReplyId(null);
                                            } else {
                                                setEditingReviewReplyId(reply.id);
                                                setEditingReviewContent(reply.content);
                                            }
                                        }}
                                        appVariant="ghostMuted" 
                                        variant="ghost" 
                                        size="sm" 
                                        className="h-6 px-1.5 text-[11px] font-bold text-muted-foreground hover:text-primary hover:bg-primary/10 ml-auto opacity-0 group-hover:opacity-100 transition-opacity"
                                    >
                                        <Pencil className="w-3 h-3" />
                                    </AppButton>
                                    <AppButton 
                                        onClick={() => {
                                            if (window.confirm("Bạn có chắc chắn muốn xóa phản hồi này?")) {
                                                deleteReviewMutation.mutate(reply.id);
                                            }
                                        }}
                                        appVariant="ghostMuted" 
                                        variant="ghost" 
                                        size="sm" 
                                        className="h-6 px-1.5 text-[11px] font-bold text-muted-foreground hover:text-error hover:bg-error/10 opacity-0 group-hover:opacity-100 transition-opacity"
                                    >
                                        <Trash2 className="w-3 h-3" />
                                    </AppButton>
                                  </>
                                )}
                            </div>

                            {/* Reply to a reply form */}
                            {replyingReviewId === reply.id && (
                               <div className="mt-3 bg-background border border-border rounded-lg p-3 animate-in fade-in slide-in-from-top-2 duration-200">
                                  <textarea
                                     value={replyContent}
                                     onChange={(e) => setReplyContent(e.target.value)}
                                     placeholder={`Trả lời @${reply.studentName}...`}
                                     className="w-full rounded-md border border-border bg-background p-3 text-sm outline-none focus:border-primary min-h-[80px]"
                                  />
                                  <div className="mt-3 flex justify-end gap-2">
                                     <AppButton variant="ghost" size="sm" onClick={() => setReplyingReviewId(null)}>Hủy</AppButton>
                                     <AppButton size="sm" onClick={() => {
                                         if (!replyContent.trim()) return;
                                         replyReviewMutation.mutate({
                                           parentReviewId: reply.id,
                                           content: replyContent
                                         });
                                     }} disabled={!replyContent.trim() || replyReviewMutation.isPending} className="flex items-center gap-2">
                                       {replyReviewMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />} Gửi phản hồi
                                     </AppButton>
                                  </div>
                               </div>
                            )}

                          </div>
                        </div>
                      ))}
                     </div>
                    )}
                  </div>
                 )}
                 
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
                             {templates.map((tpl) => (
                               <button 
                                 key={tpl.id}
                                 onClick={() => setReplyContent(tpl.content)}
                                 className="text-xs bg-secondary hover:bg-secondary/80 text-foreground px-3 py-1.5 rounded-full transition-colors text-left"
                               >
                                 {tpl.content.length > 50 ? tpl.content.substring(0, 50) + "..." : tpl.content}
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
                                <AppButton size="sm" onClick={handleAddOrEditTemplate} disabled={!templateInput.trim() || addTemplateMutation.isPending || editTemplateMutation.isPending}>
                                  {editingTemplateId !== null ? "Lưu" : "Thêm"}
                                </AppButton>
                                {editingTemplateId !== null && (
                                  <AppButton variant="ghost" size="sm" onClick={() => {setEditingTemplateId(null); setTemplateInput("");}}>Hủy</AppButton>
                                )}
                              </div>
                              <div className="space-y-1 max-h-[150px] overflow-y-auto pr-2">
                                {templates.map((tpl) => (
                                  <div key={tpl.id} className="flex justify-between items-center bg-background border border-border rounded px-2 py-1.5 group">
                                    <span className="text-xs text-foreground flex-1 line-clamp-1">{tpl.content}</span>
                                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity ml-2">
                                      <button onClick={() => {setEditingTemplateId(tpl.id); setTemplateInput(tpl.content);}} className="p-1 hover:bg-muted text-muted-foreground hover:text-primary rounded">
                                        <Edit2 className="w-3 h-3" />
                                      </button>
                                      <button onClick={() => handleDeleteTemplate(tpl.id)} className="p-1 hover:bg-error/10 text-muted-foreground hover:text-error rounded">
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
                          <AppButton size="sm" onClick={handleSubmitReply} disabled={!replyContent.trim() || replyReviewMutation.isPending} className="flex items-center gap-2">
                            {replyReviewMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />} Gửi phản hồi
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
