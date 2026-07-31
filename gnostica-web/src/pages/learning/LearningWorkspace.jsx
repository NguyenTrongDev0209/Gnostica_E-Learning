import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ChevronLeft,
  ChevronRight,
  PlayCircle,
  CheckCircle2,
  MessageSquare,
  Info,
  FileText,
  MoreVertical,
  Loader2,
  Clock,
  Download,
  Trophy,
  Award,
  HelpCircle,
  XCircle,
  Send,
  Trash,
  Pencil,
  User,
  CornerDownRight,
  ChevronDown,
  ChevronUp,
  Target,
  AlertTriangle,
  RefreshCw,
  Star,
  Moon,
  Sun
} from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/common/micro/AppAccordion";
import Progress from "@/components/common/micro/AppProgress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/common/micro/AppTabs";
import { Button } from "@/components/common/micro/AppButton";
import AppCard, { AppCardContent } from "@/components/common/micro/AppCard";
import PageContainer from "@/components/common/core/PageContainer";
import courseService from "@/services/course/courseService";
import progressService from "@/services/course/progressService";
import enrollmentService from "@/services/course/enrollmentService";
import commentService from "@/services/forum/commentService";
import { reviewService } from "@/services/course/reviewService";
import useAuthStore from "@/store/useAuthStore";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/common/micro/AppAvatar";
import { cn } from "@/lib/utils";
import { AppToast } from "@/components/common/micro/AppToast";

const FALLBACK_LESSON_THUMBNAIL = "https://images.unsplash.com/photo-1498050108023-c5249f4df085?q=80&w=320&auto=format&fit=crop";
const BUNNY_LIBRARY_ID = import.meta.env.VITE_BUNNY_LIBRARY_ID;

const formatLessonDuration = (metadata) => {
  if (!metadata) return "--:--";

  try {
    const parsedMetadata = typeof metadata === "string" ? JSON.parse(metadata) : metadata;
    const totalSeconds = Math.max(0, Math.round(Number(parsedMetadata?.durationSeconds || parsedMetadata?.duration || 0)));
    if (!Number.isFinite(totalSeconds) || totalSeconds === 0) return "--:--";

    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    if (hours > 0) {
      return `${hours}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
    }

    return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
  } catch {
    return "--:--";
  }
};

const getCourseRatingSummary = (course) => {
  const reviews = Array.isArray(course?.reviews) ? course.reviews : [];
  const reviewCount = Number(course?.reviewCount ?? reviews.length ?? 0);
  const averageRating = Math.max(0, Math.min(5, Number(course?.rating || 0)));
  const distribution = [5, 4, 3, 2, 1].map((rating) => {
    const count = reviews.filter((review) => Number(review.rating) === rating).length;

    return {
      rating,
      count,
      percentage: reviewCount > 0 ? Math.round((count / reviewCount) * 100) : 0,
    };
  });

  return { averageRating, reviewCount, distribution, reviews };
};

const getInitialDarkMode = () => {
  if (typeof window === "undefined") return false;

  const savedTheme = window.localStorage.getItem("gnostica-theme");
  if (savedTheme === "dark") return true;
  if (savedTheme === "light") return false;

  return window.matchMedia?.("(prefers-color-scheme: dark)")?.matches || false;
};

// Component ho tro: giao dien Hoi dap Q&A
const getCommentAuthorName = (comment) => comment?.account?.fullName || "Học viên Gnostica";
const getCurrentUserName = (user) => user?.fullName || user?.name || "Bạn";
const countCommentTree = (items = []) => items.reduce((total, item) => total + 1 + countCommentTree(item.replies || []), 0);
const flattenLessonReplies = (replies = [], parentAuthorName) => replies.flatMap((reply) => [
  { ...reply, parentAuthorName },
  ...flattenLessonReplies(reply.replies || [], getCommentAuthorName(reply)),
]);

function LessonQA({ lesson }) {
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [newComment, setNewComment] = useState("");
  const [replyingTo, setReplyingTo] = useState(null);
  const [replyParentId, setReplyParentId] = useState(null);
  const [replyTargetName, setReplyTargetName] = useState("");
  const [replyContent, setReplyContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [collapsedComments, setCollapsedComments] = useState(new Set());
  const [editingCommentId, setEditingCommentId] = useState(null);
  const [editingContent, setEditingContent] = useState("");
  const [qaFilter, setQaFilter] = useState("all");
  const currentUser = useAuthStore(state => state.user);
  const commentCount = countCommentTree(comments);
  const filteredComments = comments.filter((comment) => {
    if (qaFilter === "mine") return comment.account?.email === currentUser?.email;
    if (qaFilter === "answered") return (comment.replies || []).length > 0;
    return true;
  });

  const toggleCollapse = (id) => {
    setCollapsedComments(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const startReplying = (comment, parentId) => {
    setReplyingTo(comment.id);
    setReplyParentId(parentId);
    setReplyTargetName(getCommentAuthorName(comment));
    setEditingCommentId(null);
  };

  const cancelReplying = () => {
    setReplyingTo(null);
    setReplyParentId(null);
    setReplyTargetName("");
    setReplyContent("");
  };

  const fetchComments = useCallback(async () => {
    if (!lesson?.id) return;
    setLoading(true);
    setErrorMessage("");
    try {
      const data = await commentService.getCommentsByTarget("LESSON", lesson.id);
      setComments(data || []);
    } catch (error) {
      console.error("Failed to fetch comments", error);
      setErrorMessage(error?.response?.data || "Không thể tải thảo luận của bài học.");
    } finally {
      setLoading(false);
    }
  }, [lesson?.id]);

  useEffect(() => {
    fetchComments();
    setReplyingTo(null);
    setReplyParentId(null);
    setReplyTargetName("");
    setEditingCommentId(null);
    setEditingContent("");
  }, [fetchComments]);

  const handleSubmit = async (e, parentId = null) => {
    e.preventDefault();
    const content = parentId ? replyContent : newComment;
    if (!content.trim() || !currentUser?.email) return;

    setIsSubmitting(true);
    setErrorMessage("");
    try {
      await commentService.addComment({
        content: content.trim(),
        targetType: "LESSON",
        targetId: lesson.id,
        userEmail: currentUser.email,
        parentId,
      });

      if (parentId) {
        cancelReplying();
      } else {
        setNewComment("");
      }
      await fetchComments();
    } catch (error) {
      setErrorMessage(error?.response?.data || "Đã xảy ra lỗi khi gửi bình luận.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const startEditing = (comment) => {
    setEditingCommentId(comment.id);
    setEditingContent(comment.content || "");
    cancelReplying();
  };

  const cancelEditing = () => {
    setEditingCommentId(null);
    setEditingContent("");
  };

  const handleUpdate = async (e, commentId) => {
    e.preventDefault();
    if (!editingContent.trim() || !currentUser?.email) return;

    setIsSubmitting(true);
    setErrorMessage("");
    try {
      await commentService.updateComment(commentId, {
        content: editingContent.trim(),
        userEmail: currentUser.email,
      });
      cancelEditing();
      await fetchComments();
    } catch (error) {
      setErrorMessage(error?.response?.data || "Cập nhật bình luận thất bại.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Bạn có chắc chắn muốn xóa bình luận này?")) return;
    setErrorMessage("");
    try {
      await commentService.deleteComment(id, currentUser.email);
      await fetchComments();
    } catch (error) {
      setErrorMessage(error?.response?.data || "Xóa bình luận thất bại.");
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "Vừa xong";
    return new Date(dateString).toLocaleDateString("vi-VN", {
      day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit"
    });
  };

  const renderComment = (comment, isReply = false, parentAuthorName = "", rootCommentId = null) => {
    const isOwner = currentUser?.email === comment.account?.email;
    const isEditing = editingCommentId === comment.id;
    const flattenedReplies = isReply ? [] : flattenLessonReplies(comment.replies || [], getCommentAuthorName(comment));
    const hasReplies = flattenedReplies.length > 0;
    const isCollapsed = collapsedComments.has(comment.id);
    const isEdited = comment.updatedAt && comment.createdAt && comment.updatedAt !== comment.createdAt;
    const replyRootId = rootCommentId || comment.id;

    return (
      <div key={comment.id} className={cn("flex gap-3", isReply ? "ml-8 mt-4 sm:ml-16" : "")}>
        <div className="mt-1 shrink-0">
          <Avatar className="size-9 border border-border ring-2 ring-transparent transition-all hover:ring-primary/20">
            <AvatarImage src={comment.account?.avatar} />
            <AvatarFallback className="bg-primary/10 text-primary font-bold">
              {getCommentAuthorName(comment).charAt(0) || <User className="size-4" />}
            </AvatarFallback>
          </Avatar>
        </div>

        <div className="min-w-0 flex-1">
          <div className={cn("rounded-xl bg-card p-4 shadow-sm", isEditing ? "border border-primary/30" : "border border-border")}>
            <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-sm font-semibold text-foreground">{getCommentAuthorName(comment)}</span>
                {isReply && parentAuthorName && (
                  <span className="inline-flex items-center rounded-md border border-primary/20 bg-primary/5 px-2 py-0.5 text-xs font-semibold text-primary">
                    trả lời @{parentAuthorName}
                  </span>
                )}
                {isEdited && <span className="text-xs font-medium text-muted-foreground">Đã chỉnh sửa</span>}
              </div>
              <span className="flex items-center gap-1 text-[11px] text-muted-foreground">
                <Clock className="size-3" /> {formatDate(comment.createdAt)}
              </span>
            </div>

            {isEditing ? (
              <form onSubmit={(e) => handleUpdate(e, comment.id)} className="space-y-3">
                <textarea
                  value={editingContent}
                  onChange={(e) => setEditingContent(e.target.value)}
                  className="min-h-[88px] w-full resize-y rounded-lg border border-border bg-background p-3 text-sm text-foreground outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary/15"
                  autoFocus
                />
                <div className="flex justify-end gap-2">
                  <Button type="button" appVariant="ghostMuted" variant="ghost" size="sm" onClick={cancelEditing} className="h-8 rounded-md px-3">
                    Hủy
                  </Button>
                  <Button type="submit" size="sm" disabled={isSubmitting || !editingContent.trim()} className="h-8 gap-2 rounded-md px-3">
                    <CheckCircle2 className="size-4" /> Lưu
                  </Button>
                </div>
              </form>
            ) : (
              <p className="whitespace-pre-wrap text-sm leading-6 text-foreground">{comment.content}</p>
            )}
          </div>

          {!isEditing && (
            <div className="mt-2 flex items-center gap-3 px-1">
              <button
                type="button"
                onClick={() => replyingTo === comment.id ? cancelReplying() : startReplying(comment, replyRootId)}
                className="flex items-center gap-1 text-xs font-medium text-muted-foreground transition-colors hover:text-primary"
              >
                <CornerDownRight className="size-3.5" /> Trả lời
              </button>
              {hasReplies && (
                <button
                  type="button"
                  onClick={() => toggleCollapse(comment.id)}
                  className="flex items-center gap-1 text-xs font-medium text-muted-foreground transition-colors hover:text-primary"
                >
                  {isCollapsed ? (
                    <><MessageSquare className="size-3.5" /> {flattenedReplies.length} phản hồi</>
                  ) : (
                    <><ChevronUp className="size-3.5" /> Ẩn phản hồi</>
                  )}
                </button>
              )}
              {isOwner && (
                <>
                  <button
                    type="button"
                    onClick={() => startEditing(comment)}
                    className="flex items-center gap-1 text-xs font-medium text-muted-foreground transition-colors hover:text-primary"
                  >
                    <Pencil className="size-3.5" /> Sửa
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(comment.id)}
                    className="text-xs font-medium text-muted-foreground transition-colors hover:text-error"
                  >
                    Xóa
                  </button>
                </>
              )}
            </div>
          )}

          {replyingTo === comment.id && (
            <form onSubmit={(e) => handleSubmit(e, replyParentId || replyRootId)} className="mt-3 rounded-lg border border-border bg-card p-3 shadow-sm">
              <input
                type="text"
                value={replyContent}
                onChange={(e) => setReplyContent(e.target.value)}
                placeholder={`Trả lời @${replyTargetName || getCommentAuthorName(comment)}...`}
                className="h-10 w-full rounded-lg border border-border bg-background px-3 text-sm outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary/15"
                autoFocus
              />
              <div className="mt-3 flex justify-end gap-2">
                <Button type="button" appVariant="ghostMuted" variant="ghost" size="sm" onClick={cancelReplying} className="h-8 rounded-md px-3">
                  Hủy
                </Button>
                <Button type="submit" size="sm" disabled={isSubmitting || !replyContent.trim()} className="h-8 gap-2 rounded-md px-3">
                  {isSubmitting ? <Loader2 className="size-4 animate-spin" /> : <><Send className="size-4" /> Trả lời</>}
                </Button>
              </div>
            </form>
          )}

          {hasReplies && !isCollapsed && (
            <div className="mt-4">
              {flattenedReplies.map(reply => renderComment(reply, true, reply.parentAuthorName, comment.id))}
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="py-2">
        <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
          <div>
            <h3 className="app-section-title flex items-center gap-3">
              <MessageSquare className="size-5 text-primary" /> Thảo luận bài học
            </h3>
            <p className="mt-1 text-sm font-medium text-muted-foreground">
              Đặt câu hỏi theo bài học hiện tại để giảng viên và học viên khác cùng trao đổi.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="inline-flex h-8 items-center rounded-lg border border-primary/20 bg-primary/10 px-3 text-xs font-semibold text-primary">
              {commentCount} bình luận
            </span>
            <Button type="button" appVariant="ghostMuted" variant="ghost" size="sm" onClick={fetchComments} disabled={loading} className="h-8 gap-2 rounded-md px-3">
              <RefreshCw className={cn("size-4", loading && "animate-spin")} /> Làm mới
            </Button>
          </div>
        </div>

        <div className="mb-5 flex flex-wrap gap-2">
          {[
            { value: "all", label: "Tất cả" },
            { value: "mine", label: "Câu hỏi của tôi" },
            { value: "answered", label: "Có phản hồi" },
          ].map((filter) => (
            <button
              key={filter.value}
              type="button"
              onClick={() => setQaFilter(filter.value)}
              className={cn(
                "h-8 rounded-lg border px-3 text-xs font-semibold transition-colors",
                qaFilter === filter.value
                  ? "border-primary/30 bg-primary/10 text-primary"
                  : "border-border bg-card text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              {filter.label}
            </button>
          ))}
        </div>

        <form onSubmit={(e) => handleSubmit(e, null)} className="mb-8">
          <div className="flex gap-3">
            <Avatar className="size-11 shrink-0 border border-border">
              <AvatarImage src={currentUser?.avatar} />
              <AvatarFallback className="bg-primary/10 text-primary font-bold">
                {getCurrentUserName(currentUser).charAt(0) || <User className="size-5" />}
              </AvatarFallback>
            </Avatar>
            <div className="relative flex-1 overflow-hidden rounded-lg border border-border bg-card shadow-sm transition-all focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/15">
              <textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Nhập câu hỏi về bài học này..."
                className="min-h-[112px] w-full resize-y border-0 bg-card p-4 pr-24 text-sm text-foreground outline-none placeholder:text-muted-foreground focus:ring-0"
              />
              <Button
                type="submit"
                disabled={isSubmitting || !newComment.trim() || !currentUser?.email}
                className="absolute bottom-3 right-3 h-9 gap-2 rounded-lg px-4 font-semibold shadow-sm"
              >
                {isSubmitting ? <Loader2 className="size-4 animate-spin" /> : <>Gửi <Send className="size-4" /></>}
              </Button>
            </div>
          </div>
        </form>

        {errorMessage && (
          <div className="mb-5 rounded-lg border border-error/20 bg-error-soft px-4 py-3 text-sm font-medium text-error">
            {errorMessage}
          </div>
        )}

        {loading ? (
          <div className="flex items-center justify-center gap-3 rounded-lg border border-dashed border-border bg-muted/60 py-10 text-sm font-semibold text-muted-foreground">
            <Loader2 className="size-5 animate-spin" />
            Đang tải thảo luận...
          </div>
        ) : filteredComments.length > 0 ? (
          <div className="space-y-5">
            {filteredComments.map(c => renderComment(c, false))}
          </div>
        ) : (
          <div className="rounded-lg border border-dashed border-border bg-muted/70 py-12 text-center text-muted-foreground">
            <MessageSquare className="mx-auto mb-3 size-11 opacity-25" />
            <p className="font-semibold text-foreground">
              {comments.length > 0 ? "Không có bình luận phù hợp." : "Chưa có bình luận nào."}
            </p>
            <p className="mt-1 text-sm">
              {comments.length > 0 ? "Thử đổi bộ lọc để xem thêm thảo luận." : "Hãy là người đầu tiên đặt câu hỏi!"}
            </p>
          </div>
        )}
    </div>
  );
}

function QuizArea({ quiz, existingResult, onBack, onQuizCompleted, onQuizReset }) {
  const [userAnswers, setUserAnswers] = useState({});
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [scorePercent, setScorePercent] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [isSyncing, setIsSyncing] = useState(false);
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);
  const quizTopRef = useRef(null);

  const questions = useMemo(() => {
    return (quiz?.questions || []).map(q => {
      if (q.text && q.options) {
        const answersArray = Object.entries(q.options).map(([key, val]) => ({
          id: key,
          optionLabel: key,
          content: val,
          isCorrect: q.correct === key
        }));
        return {
          ...q,
          content: q.text,
          answers: answersArray
        };
      }
      return q;
    });
  }, [quiz?.questions]);

  const answeredCount = Object.keys(userAnswers).length;
  const answeredPercent = questions.length > 0 ? Math.round((answeredCount / questions.length) * 100) : 0;

  useEffect(() => {
      setUserAnswers({});
      setCurrentQuestionIdx(0);
  }, [quiz?.id]);

  useEffect(() => {
      // Chi xem la da nop bai khi status === 2 (Submitted)
      // status === 1 la dang lam lai (reset) -> cho phep lam lai
      if (existingResult && existingResult.status === 2) {
          setIsSubmitted(true);
          setScorePercent(existingResult.point || 0);
          setCorrectCount(existingResult.correctAnswers || 0);
          if (quiz?.id) {
              const saved = localStorage.getItem(`quiz_answers_${quiz.id}`);
              if (saved) {
                  try {
                      const parsed = JSON.parse(saved);
                      setUserAnswers(parsed);
                      
                      let localCorrect = 0;
                      const qs = questions;
                      qs.forEach(q => {
                          const selectedId = parsed[q.id];
                          const correctOpt = q.answers?.find(a => a.isCorrect);
                          if (selectedId && correctOpt && selectedId === correctOpt.id) {
                              localCorrect++;
                          }
                      });
                      const localScore = qs.length > 0 ? Math.round((localCorrect / qs.length) * 100) : 0;
                      
                      setScorePercent(localScore);
                      setCorrectCount(localCorrect);
                  } catch (e) {}
              }
          }
      } else {
          setIsSubmitted(false);
          setScorePercent(0);
          setCorrectCount(0);
          setUserAnswers({});
          setCurrentQuestionIdx(0);
      }
  }, [existingResult, quiz?.id, questions]);

  if (!quiz || questions.length === 0) {
    return (
      <div className="w-full rounded-xl border border-border bg-card p-10 text-center shadow-sm md:p-16">
        <div className="mx-auto mb-6 flex size-20 items-center justify-center rounded-xl border border-info/20 bg-info-soft text-info">
            <HelpCircle className="size-9" />
        </div>
        <h2 className="mb-2 text-2xl font-bold text-foreground">Chương học chưa có bài tập</h2>
        <p className="text-sm font-medium text-muted-foreground">Bài quiz này hiện chưa chứa câu hỏi nào.</p>
      </div>
    );
  }

  const handleOptionSelect = (qId, optId) => {
    if (isSubmitted || isSyncing) return;
    setUserAnswers(prev => ({ ...prev, [qId]: optId }));
  };

  const handleSubmitQuiz = async () => {
    if (Object.keys(userAnswers).length === 0) {
        AppToast.warning("Vui lòng trả lời ít nhất một câu hỏi trước khi nộp bài!");
        return;
    }
    
    setIsSyncing(true);
    try {
        let correct = 0;
        questions.forEach(q => {
            const selectedId = userAnswers[q.id];
            const correctOpt = q.answers?.find(a => a.isCorrect);
            if (selectedId && correctOpt && selectedId === correctOpt.id) {
                correct++;
            }
        });
        
        const finalScore = Math.round((correct / questions.length) * 100);

        await progressService.submitQuizResult(quiz.id, {
            point: finalScore * 1.0,
            totalQuestions: questions.length,
            correctAnswers: correct
        });

        setCorrectCount(correct);
        setScorePercent(finalScore);
        setIsSubmitted(true);
        localStorage.setItem(`quiz_answers_${quiz.id}`, JSON.stringify(userAnswers));

        if (onQuizCompleted) {
            onQuizCompleted(quiz.id, finalScore, correct, questions.length);
        }

        quizTopRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } catch (err) {
        AppToast.error("Đã xảy ra lỗi khi gửi bài làm, vui lòng thử lại sau!");
    } finally {
        setIsSyncing(false);
    }
  };

  const handleReset = async () => {
      if (!window.confirm("Bạn có chắc chắn muốn xóa kết quả hiện tại để làm lại từ đầu không?")) return;

      setIsSyncing(true);
      try {
          await progressService.resetQuizResult(quiz.id);

          setIsSubmitted(false);
          setUserAnswers({});
          setScorePercent(0);
          setCorrectCount(0);
          setCurrentQuestionIdx(0);
          localStorage.removeItem(`quiz_answers_${quiz.id}`);

          if (onQuizReset) {
              onQuizReset(quiz.id);
          }
      } catch (err) {
          AppToast.error("Đã xảy ra lỗi khi reset bài tập. Vui lòng thử lại sau!");
      } finally {
          setIsSyncing(false);
      }
  };

  const isPassed = scorePercent >= 50;

  const renderQuestion = (q, idx, isReviewMode) => {
      return (
          <div key={q.id} className="space-y-6 rounded-xl border border-border bg-card p-6 shadow-sm transition-all duration-300 md:p-8 animate-in fade-in">
              <h3 className="flex items-start gap-3 text-base font-semibold leading-relaxed text-foreground">
                  <span className="flex h-8 shrink-0 items-center rounded-lg border border-primary/20 bg-primary/10 px-3 text-sm font-bold text-primary">
                    Câu {idx + 1}
                  </span>
                  <span className="pt-1" dangerouslySetInnerHTML={{ __html: q.content }}></span>
              </h3>

              <div className="grid grid-cols-1 gap-3">
                  {(q.answers || []).map((opt, oIdx) => {
                      const optionLabel = opt.optionLabel || String.fromCharCode(65 + oIdx);
                      const isSelected = userAnswers[q.id] == opt.id; 
                      const isCorrect = opt.isCorrect;

                      let buttonClass = "w-full flex items-center justify-between gap-4 rounded-lg border p-4 text-left text-sm font-medium transition-all duration-200 ";
                      let icon = null;

                      if (!isSubmitted) {
                          if (isSelected) {
                              buttonClass += "border-primary/40 bg-primary/10 text-primary shadow-sm";
                          } else {
                              buttonClass += "border-border bg-muted/30 text-foreground hover:border-primary/30 hover:bg-primary/5";
                          }
                      } else {
                          if (isSelected && isCorrect) {
                              buttonClass += "border-success/40 bg-success-soft text-success shadow-sm";
                              icon = (
                                  <span className="flex shrink-0 items-center gap-1 rounded-lg border border-success/20 bg-card px-2 py-1 text-xs font-semibold text-success">
                                      <CheckCircle2 className="size-3" /> Đúng
                                  </span>
                              );
                          } else if (isSelected && !isCorrect) {
                              buttonClass += "border-error/40 bg-error-soft text-error shadow-sm";
                              icon = (
                                  <span className="flex shrink-0 items-center gap-1 rounded-lg border border-error/20 bg-card px-2 py-1 text-xs font-semibold text-error">
                                      <XCircle className="size-3" /> Sai
                                  </span>
                              );
                          } else if (isCorrect) {
                              buttonClass += "border-success/30 bg-success-soft/60 text-success";
                              icon = (
                                  <span className="flex shrink-0 items-center gap-1 rounded-lg border border-success/20 bg-card px-2 py-1 text-xs font-semibold text-success">
                                      <CheckCircle2 className="size-3" /> Đáp án
                                  </span>
                              );
                          } else {
                              buttonClass += "border-border bg-muted/20 text-muted-foreground opacity-75";
                          }
                      }

                      return (
                          <button
                              key={opt.id}
                              disabled={isSyncing || isSubmitted}
                              onClick={() => handleOptionSelect(q.id, opt.id)}
                              className={buttonClass}
                          >
                              <span className="flex min-w-0 items-start gap-3">
                                <span className={`flex size-7 shrink-0 items-center justify-center rounded-full border text-xs font-bold ${
                                  isSelected
                                    ? "border-current bg-card/70"
                                    : "border-border bg-card text-muted-foreground"
                                }`}>
                                  {optionLabel}
                                </span>
                                <span className="pt-1 leading-5">{opt.content || opt.answerText}</span>
                              </span>
                              {icon}
                          </button>
                      );
                  })}
              </div>
              {isSubmitted && q.explanation && (
                  <div className="animate-in fade-in slide-in-from-top-2 mt-4 rounded-lg border border-info/20 bg-info-soft p-4 text-sm text-info">
                      <p className="mb-1 flex items-center gap-1.5 font-semibold text-foreground"><Info className="size-4 text-info" /> Giải thích</p>
                      <div dangerouslySetInnerHTML={{ __html: q.explanation }}></div>
                  </div>
              )}
          </div>
      );
  };

  return (
    <div ref={quizTopRef} className="mx-auto w-full max-w-5xl space-y-6 pb-12 pt-2">
        <div className="animate-in fade-in rounded-xl border border-border bg-card p-6 shadow-sm duration-500 md:p-8">
            <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex items-center gap-4">
                <div className="flex size-14 shrink-0 items-center justify-center rounded-xl border border-primary/20 bg-primary/10 text-primary shadow-sm">
                    <Trophy className="size-7" />
                </div>
                <div className="min-w-0">
                    <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-primary">Bài kiểm tra trắc nghiệm</p>
                    <h2 className="text-xl font-bold leading-tight text-foreground md:text-2xl">
                        {quiz.title}
                    </h2>
                    <div className="mt-3 flex flex-wrap items-center gap-2 text-xs font-medium text-muted-foreground">
                        <span className="inline-flex h-7 items-center gap-1.5 rounded-lg border border-border bg-muted px-2.5">
                          <HelpCircle className="size-3.5" />
                          {questions.length} câu hỏi
                        </span>
                        <span className="inline-flex h-7 items-center gap-1.5 rounded-lg border border-border bg-muted px-2.5">
                          <CheckCircle2 className="size-3.5" />
                          {answeredCount}/{questions.length} đã trả lời
                        </span>
                    </div>
                </div>
              </div>
            </div>

            {!isSubmitted && (
              <div className="mt-6">
                <div className="mb-2 flex items-center justify-between text-xs font-semibold text-muted-foreground">
                  <span>Tiến độ làm bài (Câu {currentQuestionIdx + 1}/{questions.length})</span>
                  <span>{answeredPercent}%</span>
                </div>
                <Progress value={answeredPercent} className="h-2 bg-muted [&>div]:bg-primary" />
              </div>
            )}
        </div>

        {isSubmitted && (
            <div className={`animate-in slide-in-from-top flex flex-col gap-6 rounded-xl border p-6 shadow-sm duration-500 md:flex-row md:items-center md:justify-between md:p-8 ${
              isPassed
                ? "border-success/20 bg-success-soft text-success"
                : "border-warning/20 bg-warning-soft text-warning"
            }`}>
                <div className="flex items-center gap-5">
                    <div className={`flex size-16 shrink-0 items-center justify-center rounded-xl border shadow-sm ${
                      isPassed
                        ? "border-success/20 bg-success text-success-foreground"
                        : "border-warning/20 bg-warning text-warning-foreground"
                    }`}>
                        {isPassed ? <Award className="size-8" /> : <HelpCircle className="size-8" />}
                    </div>
                    <div className="min-w-0">
                        <h3 className="text-xl font-bold leading-tight text-foreground">
                            {isPassed ? "Bạn đã vượt qua bài kiểm tra" : "Bạn cần ôn lại thêm"}
                        </h3>
                        <p className="mt-2 text-sm font-medium text-muted-foreground">
                            Kết quả: <strong className="font-bold text-foreground">{correctCount}/{questions.length}</strong> đáp án đúng, đạt <strong className="font-bold text-foreground">{scorePercent}%</strong>.
                        </p>
                        {!isPassed && (
                            <p className="mt-2 flex items-center gap-1.5 text-xs font-semibold text-warning">
                                <Info className="size-3.5" /> Bạn cần đạt từ 50% trở lên để vượt qua bài kiểm tra này.
                            </p>
                        )}
                    </div>
                </div>
                
                <div className="flex flex-wrap gap-3 shrink-0">
                    <Button 
                       onClick={handleReset} 
                       disabled={isSyncing}
                       variant="outline" 
                       className="h-10 rounded-lg gap-2 font-semibold"
                    >
                        {isSyncing ? <Loader2 className="size-4 animate-spin" /> : null}
                        Làm lại bài thi
                    </Button>
                </div>
            </div>
        )}

        <div className="space-y-5 relative">
            {!isSubmitted ? (
                <div className="animate-in slide-in-from-right-4 duration-300">
                    {questions[currentQuestionIdx] && renderQuestion(questions[currentQuestionIdx], currentQuestionIdx, false)}
                </div>
            ) : (
                <div className="space-y-6">
                    {questions.map((q, idx) => renderQuestion(q, idx, true))}
                </div>
            )}
        </div>

        {!isSubmitted && (
            <div className="pt-4 flex justify-between items-center bg-card p-4 rounded-xl border border-border shadow-sm">
                <Button 
                    variant="outline"
                    onClick={() => setCurrentQuestionIdx(prev => Math.max(0, prev - 1))}
                    disabled={currentQuestionIdx === 0 || isSyncing}
                    className="h-11 px-6 font-semibold"
                >
                    Quay lại
                </Button>
                
                {currentQuestionIdx < questions.length - 1 ? (
                    <Button 
                        onClick={() => setCurrentQuestionIdx(prev => Math.min(questions.length - 1, prev + 1))}
                        disabled={isSyncing}
                        className="h-11 px-8 font-semibold bg-primary text-primary-foreground hover:bg-primary/90"
                    >
                        Tiếp theo
                    </Button>
                ) : (
                    <Button 
                        onClick={handleSubmitQuiz}
                        disabled={isSyncing}
                        className="h-11 px-8 font-semibold bg-success hover:bg-success/90 text-white gap-2 shadow-md shadow-success/20"
                    >
                        {isSyncing ? <Loader2 className="size-4 animate-spin" /> : <CheckCircle2 className="size-4" />}
                        Nộp bài
                    </Button>
                )}
            </div>
        )}
    </div>
  );
}


// ── Component Hỗ Trợ: Giao Diện Làm Bài Quiz Cho Học Viên ──
export default function LearningWorkspace() {
  const { id: slug } = useParams();
  const navigate = useNavigate();
  const currentUser = useAuthStore(state => state.user);
  const searchParams = new URLSearchParams(window.location.search);
  const targetLessonSlug = searchParams.get("lesson");
  const isRestart = searchParams.get("restart") === "true";
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [checkingEnrollment, setCheckingEnrollment] = useState(true);
  const [activeSectionIdx, setActiveSectionIdx] = useState(0);
  const [activeLessonIdx, setActiveLessonIdx] = useState(0);
  const [activeViewMode, setActiveViewMode] = useState("video"); // 'video' | 'quiz'
  const [openSectionValues, setOpenSectionValues] = useState([]);
  const [lessonProgress, setLessonProgress] = useState([]);
  const [quizProgress, setQuizProgress] = useState([]); // Track existing quiz results
  const [serverProgressPercent, setServerProgressPercent] = useState(null); // Từ server, nguồn sự thật
  const [certifiUrl, setCertifiUrl] = useState(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [isDarkMode, setIsDarkMode] = useState(getInitialDarkMode);
  const [lastProgressSavedAt, setLastProgressSavedAt] = useState(null);
  const [isProgressSaving, setIsProgressSaving] = useState(false);
  const [showRatingForm, setShowRatingForm] = useState(false);
  const [draftRating, setDraftRating] = useState(0);
  const [draftReviewComment, setDraftReviewComment] = useState("");
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  const [courseRatingSummary, setCourseRatingSummary] = useState({
    averageRating: 0,
    reviewCount: 0,
    distribution: [
      { rating: 5, count: 0, percentage: 0 },
      { rating: 4, count: 0, percentage: 0 },
      { rating: 3, count: 0, percentage: 0 },
      { rating: 2, count: 0, percentage: 0 },
      { rating: 1, count: 0, percentage: 0 }
    ],
    reviews: []
  });

  // === REFS để tránh stale closure trong interval/listener ===
  const currentTimeRef = useRef(0);
  const currentLessonRef = useRef(null);
  const completedIdsRef = useRef([]);
  const hasEndedRef = useRef(false); // Chặn gọi completed nhiều lần
  const activePlaylistItemRef = useRef(null);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", isDarkMode);
    window.localStorage.setItem("gnostica-theme", isDarkMode ? "dark" : "light");

    return () => {
      // Remove dark class when leaving the workspace so it doesn't affect other pages
      document.documentElement.classList.remove("dark");
    };
  }, [isDarkMode]);

  useEffect(() => {
    const checkAccessAndFetch = async () => {
      try {
        setCheckingEnrollment(true);
        const access = await enrollmentService.checkEnrollment(slug);
        setIsEnrolled(access.isEnrolled);

        if (access.isEnrolled) {
          await fetchCourseData();
        } else {
          setLoading(false);
        }
      } catch (err) {
        setIsEnrolled(false);
        setLoading(false);
      } finally {
        setCheckingEnrollment(false);
      }
    };

    if (slug) {
      checkAccessAndFetch();
    }
  }, [slug]);

  const fetchCourseData = async () => {
    try {
      setLoading(true);
      const [courseData, progressData, reviewsRes] = await Promise.all([
        courseService.getCourseBySlug(slug),
        progressService.getCourseProgress(slug),
        reviewService.getCourseReviews(slug).catch(() => ({ data: { reviews: [], averageRating: 0, reviewCount: 0, distribution: [] } }))
      ]);
      
      // Lấy tất cả Module và Lesson (kể cả ẩn hoặc xóa mềm) cho người dùng đã mua khóa học
      const activeModules = courseData.modules || [];
      
      if (activeModules.length === 0) {
          navigate("/404");
          return;
      }

      setCourse({ ...courseData, modules: activeModules });
      if (reviewsRes && reviewsRes.data) {
        setCourseRatingSummary(reviewsRes.data);
      }
      setOpenSectionValues(activeModules.map((_, index) => `section-${index}`));
      
      // Nhận data gộp: { lessons: [], quizzes: [], progressPercent }
      const lessonsList = progressData?.lessons || [];
      setLessonProgress(lessonsList);
      setQuizProgress(progressData?.quizzes || []);
      setCertifiUrl(progressData?.certificateUrl || progressData?.certifiUrl || null);
      // Lưu progressPercent từ server làm nguồn sự thật
      if (typeof progressData?.progressPercent === 'number') {
        setServerProgressPercent(progressData.progressPercent);
      }

      // Khôi phục phiên học:
      // 1. Ưu tiên lesson trong URL
      // 2. Sau đó mới đến bài học vừa xem gần nhất trong DB
      let lessonFound = false;
      if (targetLessonSlug) {
           activeModules.forEach((mod, sIdx) => {
              const lIdx = mod.lessons.findIndex(l => String(l.id) === targetLessonSlug);
              if (lIdx !== -1) {
                  setActiveSectionIdx(sIdx);
                  setActiveLessonIdx(lIdx);
                  lessonFound = true;
              }
          });
      }

      if (!lessonFound && lessonsList && lessonsList.length > 0) {
          const lastActive = [...lessonsList]
              .filter(p => p.updatedAt)
              .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))[0];
          
          if (lastActive) {
              activeModules.forEach((mod, sIdx) => {
                  const lIdx = mod.lessons.findIndex(l => l.id === lastActive.lessonId);
                  if (lIdx !== -1) {
                      setActiveSectionIdx(sIdx);
                      setActiveLessonIdx(lIdx);
                  }
              });
          }
      }
    } catch (err) {
      navigate("/404");
    } finally {
      setLoading(false);
    }
  };

  // === Derived values ===
  const completedLessonIds = lessonProgress.filter(lp => lp.isCompleted).map(lp => lp.lessonId);
  // Quizzes đã pass = point >= 50 (bao gồm cả sau khi reset vì backend giữ point)
  const completedQuizIds = quizProgress.filter(qp => (qp.point ?? 0) >= 50).map(qp => qp.quizId);
  const allLessons = course?.modules?.flatMap((section) => section.lessons) || [];
  const totalLessonsCount = allLessons.length;
  // Tổng số quiz trong khóa học
  const totalQuizzesCount = course?.modules?.filter(m => m.quiz != null).length || 0;
  const totalSteps = totalLessonsCount + totalQuizzesCount;
  // Dùng progressPercent từ server nếu có (đồng bộ với My Courses)
  const progressValue = serverProgressPercent != null
    ? serverProgressPercent
    : (totalSteps > 0
        ? Math.round(((completedLessonIds.length + completedQuizIds.length) / totalSteps) * 100)
        : 0);

  const currentSection = course?.modules?.[activeSectionIdx];
  const currentLesson = currentSection?.lessons?.[activeLessonIdx];
  
  const currentLessonProgress = lessonProgress.find(lp => lp.lessonId === currentLesson?.id);
  const startAtTime = isRestart ? 0 : (currentLessonProgress?.lastWatchedTime || 0);
  const currentLessonDuration = formatLessonDuration(currentLesson?.metadata);
  const currentSectionLessonCount = currentSection?.lessons?.length || 0;
  const currentLessonNumber = activeLessonIdx + 1;
  const isCurrentLessonCompleted = Boolean(currentLessonProgress?.isCompleted);
  
  const currentUserReview = courseRatingSummary?.reviews?.find((review) => String(review.accountId) === String(currentUser?.id));
  const progressSavedLabel = lastProgressSavedAt
    ? lastProgressSavedAt.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" })
    : null;

  const handleSubmitReview = async (event) => {
    event.preventDefault();
    if (!draftRating) return;

    try {
      setIsSubmittingReview(true);
      await reviewService.submitReview(slug, draftRating, draftReviewComment.trim());
      
      const reviewsRes = await reviewService.getCourseReviews(slug);
      if (reviewsRes && reviewsRes.data) {
        setCourseRatingSummary(reviewsRes.data);
      }
      
      setShowRatingForm(false);
      AppToast.success("Gửi đánh giá thành công! Cảm ơn bạn đã đóng góp.");
    } catch (error) {
      AppToast.error(error.response?.data?.message || "Có lỗi xảy ra khi gửi báo cáo.");
    } finally {
      setIsSubmittingReview(false);
    }
  };

  // === Sync quiz results callbacks ===
  const onQuizCompleted = (quizId, point, correctAnswers, totalQuestions) => {
      setQuizProgress(prev => {
          const exists = prev.some(q => q.quizId == quizId);
          if (exists) {
              return prev.map(q => q.quizId == quizId ? { ...q, point, correctAnswers, totalQuestions, status: 2 } : q);
          }
          return [...prev, { quizId, point, correctAnswers, totalQuestions, status: 2, completedAt: new Date().toISOString() }];
      });
      // Cập nhật server progress
      progressService.getCourseProgress(slug).then(res => {
          if (typeof res?.progressPercent === 'number') {
              setServerProgressPercent(res.progressPercent);
          }
      }).catch(() => {});
  };

  const onQuizReset = (quizId) => {
      // KHÔNG xóa khỏi local state để giữ tiến độ đã đạt được
      // Chỉ cần re-fetch để lấy lại trạng thái từ server
      progressService.getCourseProgress(slug).then(res => {
          setQuizProgress(res?.quizzes || []);
          if (typeof res?.progressPercent === 'number') {
              setServerProgressPercent(res.progressPercent);
          }
      }).catch(() => {});
  };

  // === Đồng bộ refs mỗi khi giá trị thay đổi ===
  useEffect(() => { currentLessonRef.current = currentLesson; }, [currentLesson]);
  useEffect(() => { completedIdsRef.current = completedLessonIds; }, [completedLessonIds]);

  useEffect(() => {
    const activeSectionValue = `section-${activeSectionIdx}`;
    setOpenSectionValues((prev) => (
      prev.includes(activeSectionValue) ? prev : [...prev, activeSectionValue]
    ));
  }, [activeSectionIdx, activeLessonIdx, activeViewMode]);

  useEffect(() => {
    const scrollTimer = window.setTimeout(() => {
      activePlaylistItemRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "nearest",
      });
    }, 120);

    return () => window.clearTimeout(scrollTimer);
  }, [activeSectionIdx, activeLessonIdx, activeViewMode, openSectionValues]);

  // Auto fetch certificate URL when progress reaches 100%
  useEffect(() => {
      if (progressValue === 100 && !certifiUrl) {
          progressService.getCourseProgress(slug).then(res => {
              if (res?.data?.certifiUrl) {
                  setCertifiUrl(res.data.certifiUrl);
              }
          }).catch(console.error);
      }
  }, [progressValue, certifiUrl, slug]);

  const handleLessonSelect = (sectionIdx, lessonIdx) => {
    setActiveSectionIdx(sectionIdx);
    setActiveLessonIdx(lessonIdx);
    setActiveViewMode("video");
  };

  const handleQuizSelect = (sectionIdx) => {
      setActiveSectionIdx(sectionIdx);
      setActiveViewMode("quiz");
  };

  const handleNextLesson = useCallback(() => {
    if (!course?.modules) return;

    const section = course.modules[activeSectionIdx];
    const lessons = section?.lessons || [];

    if (activeViewMode === "video") {
      if (activeLessonIdx < lessons.length - 1) {
        // Còn bài trong chương hiện tại
        setActiveLessonIdx(activeLessonIdx + 1);
      } else if (section.quiz) {
        // Hết bài trong chương, nhưng có quiz -> chuyển sang quiz
        setActiveViewMode("quiz");
      } else if (activeSectionIdx < course.modules.length - 1) {
        // Hết bài, không có quiz -> sang chương tiếp theo
        setActiveSectionIdx(activeSectionIdx + 1);
        setActiveLessonIdx(0);
        setActiveViewMode("video");
      }
    } else if (activeViewMode === "quiz") {
      if (activeSectionIdx < course.modules.length - 1) {
        // Đang ở quiz, sang chương tiếp theo
        setActiveSectionIdx(activeSectionIdx + 1);
        setActiveLessonIdx(0);
        setActiveViewMode("video");
      }
    }
  }, [course, activeSectionIdx, activeLessonIdx, activeViewMode]);

  const markLessonComplete = useCallback(async (lessonId) => {
    if (completedIdsRef.current.includes(lessonId)) return;
    try {
        await progressService.markLessonCompleted(lessonId);
        setLastProgressSavedAt(new Date());
        setLessonProgress(prev => {
            const existing = prev.find(p => p.lessonId === lessonId);
            if (existing) {
                return prev.map(p => p.lessonId === lessonId ? { ...p, isCompleted: true } : p);
            }
            return [...prev, { lessonId, isCompleted: true, lastWatchedTime: 0 }];
        });
        // Đồng bộ progressPercent từ server
        progressService.getCourseProgress(slug).then(res => {
            if (typeof res?.progressPercent === 'number') {
                setServerProgressPercent(res.progressPercent);
            }
        }).catch(() => {});
    } catch (err) {
    }
  }, [slug]);

  const handleLessonEnded = useCallback(async () => {
    const lesson = currentLessonRef.current;
    if (!lesson) return;
    
    // Nếu bài học đã có tích xanh rồi, chúng ta chỉ cần chuyển bài
    if (completedIdsRef.current.includes(lesson.id)) {
        handleNextLesson();
        return;
    }

    if (hasEndedRef.current) return;
    hasEndedRef.current = true;

    
    try {
        // Gọi API lưu trạng thái hoàn thành
        await markLessonComplete(lesson.id);
        // Sau khi lưu xong, tự động chuyển bài sau 1 giây để người dùng kịp thấy tích xanh
        setTimeout(() => {
            handleNextLesson();
        }, 1000);
    } catch (err) {
        // Dù lỗi lưu nhưng vẫn chuyển bài để không làm gián đoạn trải nghiệm học
        handleNextLesson();
    }
  }, [markLessonComplete, handleNextLesson]);

  // === Reset trạng thái ended khi đổi bài ===
  useEffect(() => {
    hasEndedRef.current = false;
    currentTimeRef.current = 0;
    setCurrentTime(0);
  }, [currentLesson?.id]);

  // Video URL handling logic
  const getEmbedUrl = (url) => {
    if (!url) return null;
    const uuidRegex = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/;
    let libraryId = BUNNY_LIBRARY_ID;
    let videoId = url;
    let baseUrl = "";
    
    // Resilient dynamic check: Check if the url is a composite string format: "libraryId/videoId"
    if (url.includes("/")) {
      const parts = url.split("/");
      const lastPart = parts[parts.length - 1];
      if (uuidRegex.test(lastPart)) {
        videoId = lastPart;
        // Extra safety: Only assign libraryId if there's a non-empty value before the slash
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
    let finalUrl = `${baseUrl}${separator}playerjs=1&content_ended=1`;
    
    if (startAtTime > 0) {
        finalUrl += `&t=${startAtTime}`;
    }
    
    return finalUrl;
  };

  const getVideoIdentifiers = (url) => {
    if (!url) return null;
    const uuidRegex = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/;
    let libraryId = BUNNY_LIBRARY_ID;
    let videoId = url;

    if (url.includes("/")) {
      const parts = url.split("/").filter(Boolean);
      const lastPart = parts[parts.length - 1];
      const secondToLast = parts[parts.length - 2];

      if (uuidRegex.test(lastPart)) {
        videoId = lastPart;
        if (secondToLast && secondToLast.length > 2) {
          libraryId = secondToLast;
        }
      }
    }

    if (!uuidRegex.test(videoId)) return null;
    return { libraryId, videoId };
  };

  const getLessonThumbnail = (lesson) => {
    const directThumbnail =
      lesson?.thumbnail ||
      lesson?.thumbnailUrl ||
      lesson?.videoThumbnail ||
      lesson?.imageUrl;

    if (directThumbnail) return directThumbnail;

    const bunnyVideo = getVideoIdentifiers(lesson?.videoUrl);
    if (bunnyVideo) {
      return `https://vz-${bunnyVideo.libraryId}.b-cdn.net/${bunnyVideo.videoId}/thumbnail.jpg?width=160&height=90`;
    }

    return course?.thumbnail || course?.image || FALLBACK_LESSON_THUMBNAIL;
  };

  const isEmbedLink = (url) => {
    if (!url) return false;
    const isDirectVideo = /\.(m3u8|mp4|mov|webm)($|\?)/i.test(url);
    if (isDirectVideo) return false;

    const uuidRegex = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/;
    // Check direct UUID
    if (uuidRegex.test(url)) return true;
    // Check composite libraryId/videoId format
    if (url.includes("/")) {
      const parts = url.split("/");
      if (uuidRegex.test(parts[parts.length - 1])) return true;
    }

    const lowUrl = url.toLowerCase();
    return (lowUrl.includes("mediadelivery.net") || lowUrl.includes("bunny.net") || lowUrl.includes("vimeo.com")) && !lowUrl.includes("b-cdn.net");
  };

  const embedUrl = getEmbedUrl(currentLesson?.videoUrl);
  const useIframe = isEmbedLink(currentLesson?.videoUrl);

  // === CORE: Polling thời gian + Auto-sync + Auto-complete ===
  const durationRef = useRef(0);

  useEffect(() => {
    if (!currentLesson || loading) return;
    const lessonId = currentLesson.id;

    // 1. Khởi tạo tiến độ ngay lập tức nếu bài học chưa có trong DB
    const hasProgress = lessonProgress.some(lp => lp.lessonId === lessonId);
    if (!hasProgress) {
        progressService.updateLastWatchedTime(lessonId, 0);
        setLessonProgress(prev => [...prev, { 
            lessonId, isCompleted: false, lastWatchedTime: 0, 
            updatedAt: new Date().toISOString() 
        }]);
    }

    // 2. Lắng nghe postMessage responses từ Iframe
    const handleMessage = (event) => {
        try {
            const data = typeof event.data === 'string' ? JSON.parse(event.data) : event.data;
            if (!data || data.context !== 'player.js') return;
            
            if (data.event === 'ready') {
                const iframe = document.getElementById('bunny-video-player');
                if (iframe?.contentWindow) {
                    iframe.contentWindow.postMessage(JSON.stringify({
                        context: 'player.js', method: 'addEventListener', value: 'ended'
                    }), '*');
                    iframe.contentWindow.postMessage(JSON.stringify({
                        context: 'player.js', method: 'addEventListener', value: 'timeupdate'
                    }), '*');
                }
            }

            // Phản hồi từ poll getCurrentTime
            if (data.event === 'getCurrentTime' && data.value != null) {
                const time = typeof data.value === 'number' ? data.value : parseFloat(data.value) || 0;
                if (time > 0) {
                    currentTimeRef.current = time;
                    setCurrentTime(time);
                }
            }

            // Phản hồi từ poll getDuration
            if (data.event === 'getDuration' && data.value != null) {
                const dur = typeof data.value === 'number' ? data.value : parseFloat(data.value) || 0;
                if (dur > 0) {
                    durationRef.current = dur;
                }
            }

            // Sự kiện timeupdate (nếu Bunny gửi)
            if (data.event === 'timeupdate') {
                const seconds = data.value?.seconds ?? data.value ?? 0;
                if (typeof seconds === 'number' && seconds > 0) {
                    currentTimeRef.current = seconds;
                    setCurrentTime(seconds);
                }
                if (data.value?.duration) {
                    durationRef.current = data.value.duration;
                }
            }

            // Sự kiện kết thúc (nếu Bunny gửi)
            if (data.event === 'ended' || data.event === 'finish') {
                handleLessonEnded();
            }
        } catch (e) {
            // Bỏ qua lỗi parse
        }
    };

    window.addEventListener('message', handleMessage);

    // 3. POLLING: Mỗi 2s, hỏi iframe currentTime + duration + kiểm tra kết thúc
    const pollInterval = setInterval(() => {
        const iframe = document.getElementById('bunny-video-player');
        if (iframe?.contentWindow) {
            iframe.contentWindow.postMessage(JSON.stringify({
                context: 'player.js', method: 'getCurrentTime'
            }), '*');
            iframe.contentWindow.postMessage(JSON.stringify({
                context: 'player.js', method: 'getDuration'
            }), '*');
        }

        // === TỰ ĐỘNG HOÀN THÀNH: So sánh thời gian hiện tại vs tổng thời lượng ===
        const ct = currentTimeRef.current;
        const dur = durationRef.current;
        if (dur > 0 && ct > 0 && ct >= dur - 2 && !hasEndedRef.current) {
            handleLessonEnded();
        }
    }, 2000);

    // 4. AUTO-SYNC: Mỗi 10s, gửi thời gian hiện tại lên server
    const syncInterval = setInterval(() => {
        if (currentTimeRef.current > 0) {
            setIsProgressSaving(true);
            progressService.updateLastWatchedTime(lessonId, currentTimeRef.current)
              .then(() => setLastProgressSavedAt(new Date()))
              .finally(() => setIsProgressSaving(false));
        }
    }, 10000);

    return () => {
        window.removeEventListener('message', handleMessage);
        clearInterval(pollInterval);
        clearInterval(syncInterval);
        durationRef.current = 0;
    };
  }, [currentLesson?.id, loading]);


  if (checkingEnrollment || (loading && !course)) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background">
        <Loader2 className="w-12 h-12 animate-spin text-primary mb-4" />
        <p className="text-muted-foreground font-medium animate-pulse">Đang kiểm tra quyền truy cập...</p>
      </div>
    );
  }

  if (!isEnrolled) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background p-6 text-center">
        <div className="w-24 h-24 bg-red-50 rounded-full flex items-center justify-center mb-6 border border-error/20 shadow-inner">
          <Info className="w-10 h-10 text-error" />
        </div>
        <h2 className="text-2xl font-black text-foreground mb-2 uppercase tracking-tight">Truy cập bị từ chối</h2>
        <p className="text-muted-foreground max-w-md mx-auto mb-8 font-bold">
          Bạn chưa sở hữu khóa học này hoặc phiên thanh toán chưa được xác nhận. Vui lòng mua khóa học để bắt đầu học tập.
        </p>
        <div className="flex gap-4">
          <Button 
            onClick={() => navigate(`/course/${slug}`)}
            className="font-black px-8 py-6 rounded-xl shadow-xl shadow-primary/20"
          >
            Đến trang khóa học
          </Button>
          <Button 
            variant="outline"
            onClick={() => navigate("/account/my-courses")}
            className="font-black px-8 py-6 rounded-xl border-border"
          >
            Khóa học của tôi
          </Button>
        </div>
      </div>
    );
  }

  if (!course) return null;

  const handlePrevLesson = () => {
    if (activeViewMode === "quiz") {
      setActiveViewMode("video");
      setActiveLessonIdx((currentSection?.lessons?.length || 1) - 1);
    } else if (activeLessonIdx > 0) {
      setActiveLessonIdx(activeLessonIdx - 1);
    } else if (activeSectionIdx > 0) {
      const prevSectionIdx = activeSectionIdx - 1;
      setActiveSectionIdx(prevSectionIdx);
      const prevSection = course.modules[prevSectionIdx];
      if (prevSection?.quiz) {
        setActiveViewMode("quiz");
      } else {
        setActiveViewMode("video");
        setActiveLessonIdx((prevSection?.lessons?.length || 1) - 1);
      }
    }
  };

  const isFirstNavigationItem = activeViewMode === "video" && activeSectionIdx === 0 && activeLessonIdx === 0;
  const isLastNavigationItem =
    activeSectionIdx === (course?.modules?.length || 1) - 1 &&
    (
      (activeViewMode === "video" && activeLessonIdx === (currentSection?.lessons?.length || 1) - 1 && !currentSection?.quiz) ||
      activeViewMode === "quiz"
    );

  return (
    <PageContainer className="h-screen overflow-hidden font-sans">
      <PageContainer.Content disableContainer className="h-full !gap-y-4 md:!gap-y-6 pb-0 overflow-hidden">
      {/* ── Header ── */}
      <header className="h-16 border-b border-border bg-card px-4 shadow-sm md:px-6 z-50 shrink-0 flex items-center justify-between">
        <div className="flex items-center gap-4 min-w-0">
          <button
            onClick={() => navigate("/account/my-courses")}
            className="flex size-10 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground group"
          >
            <ChevronLeft className="size-5 group-hover:-translate-x-0.5 transition-transform" />
          </button>
          <div className="flex items-center gap-3">
            <div className="flex size-9 items-center justify-center rounded-lg border border-primary/20 bg-primary/10 text-primary">
                <PlayCircle className="size-5" />
            </div>
            <h1 className="hidden max-w-[220px] truncate text-sm font-semibold text-foreground md:text-base lg:max-w-md sm:block">
                {course.title}
            </h1>
          </div>
        </div>

        <div className="flex-1 max-w-xl px-12 hidden md:block">
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between gap-3 text-xs font-semibold">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <span>Tiến độ</span>
                  <span className="rounded-md border border-primary/20 bg-primary/10 px-2 py-0.5 text-primary">
                    {progressValue}%
                  </span>
                </div>
                <span className="text-muted-foreground">{completedLessonIds.length}/{totalLessonsCount} BÀI HỌC</span>
            </div>
            <Progress value={progressValue} className="h-2 bg-muted [&>div]:bg-primary" />
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsDarkMode((value) => !value)}
            title={isDarkMode ? "Chế độ sáng" : "Chế độ tối"}
            aria-label={isDarkMode ? "Chế độ sáng" : "Chế độ tối"}
            className="hidden size-10 rounded-lg border border-border bg-card text-foreground hover:bg-muted lg:flex"
          >
            {isDarkMode ? <Sun className="size-4" /> : <Moon className="size-4" />}
          </Button>
          {progressValue === 100 && certifiUrl && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => window.open(`/certificate/${certifiUrl}`, '_blank')}
              className="ml-2 hidden items-center gap-2 rounded-lg border-warning/30 text-warning font-semibold hover:bg-warning-soft hover:text-warning-foreground lg:flex"
            >
              <Award className="w-4 h-4" /> Xem chứng chỉ
            </Button>
          )}
          <div className="flex items-center gap-1 rounded-lg border border-border bg-muted p-1">
            <button
              onClick={handlePrevLesson}
              disabled={isFirstNavigationItem}
              title="Bài trước"
              aria-label="Bài trước"
              className="flex size-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-card hover:text-foreground disabled:cursor-not-allowed disabled:opacity-40"
            >
              <ChevronUp className="size-5" />
            </button>
            <button
              onClick={handleNextLesson}
              disabled={isLastNavigationItem}
              title="Bài tiếp theo"
              aria-label="Bài tiếp theo"
              className="flex size-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-card hover:text-foreground disabled:cursor-not-allowed disabled:opacity-40"
            >
              <ChevronDown className="size-5" />
            </button>
          </div>
        </div>
      </header>

      {/* ── Body ── */}
      <div className="flex-1 overflow-y-auto bg-background">
        <div className="app-container py-8">
          <div className="flex flex-col items-start gap-8 lg:flex-row">

            {/* ── Left: Video + Info ── */}
            <div className="flex-1 min-w-0">
              {activeViewMode === "video" ? (
                <>
                  {/* Video Player Section */}
                  <div className="relative aspect-video w-full overflow-hidden rounded-xl border border-border bg-black shadow-sm group">
                    {useIframe ? (
                      <iframe
                        id="bunny-video-player"
                        width="100%"
                        height="100%"
                        src={`${embedUrl}&autoplay=true`}
                        title={currentLesson?.title}
                        frameBorder="0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                        className="w-full h-full"
                      ></iframe>
                    ) : (
                      <video
                        src={currentLesson?.videoUrl}
                        controls
                        autoPlay
                        onEnded={handleLessonEnded}
                        onTimeUpdate={(e) => {
                            const time = e.target.currentTime;
                            setCurrentTime(time);
                            currentTimeRef.current = time;
                        }}
                        className="w-full h-full"
                      >
                        Trình duyệt không hỗ trợ phát video.
                      </video>
                    )}
                    <div className="absolute left-5 top-5 rounded-lg border border-white/20 bg-black/40 px-4 py-3 text-white backdrop-blur pointer-events-none opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                      <p className="mb-1 text-xs font-semibold text-accent">Gnostica Learning</p>
                      <h3 className="text-sm font-semibold">{currentLesson?.title}</h3>
                    </div>
                  </div>

                  {/* Lesson Title Section */}
                  <div className="my-8">
                    <h2 className="text-2xl font-bold leading-tight text-foreground md:text-3xl">
                      {currentLesson?.title}
                    </h2>
                    <div className="mt-4 flex flex-wrap items-center gap-2 text-sm">
                        <span className="inline-flex h-8 max-w-full items-center gap-2 rounded-lg border border-border bg-card px-3 font-medium text-foreground">
                          <FileText className="size-3.5 text-primary" />
                          <span className="truncate">{currentSection?.title}</span>
                        </span>
                        <span className="inline-flex h-8 items-center gap-2 rounded-lg border border-border bg-muted px-3 font-medium text-muted-foreground">
                          <PlayCircle className="size-3.5" />
                          Bài {currentLessonNumber}/{currentSectionLessonCount}
                        </span>
                        <span className="inline-flex h-8 items-center gap-2 rounded-lg border border-border bg-muted px-3 font-medium text-muted-foreground">
                          <PlayCircle className="size-3.5" />
                          {currentLessonDuration}
                        </span>
                        <span className={`inline-flex h-8 items-center gap-2 rounded-lg border px-3 font-medium ${
                          isCurrentLessonCompleted
                            ? "border-success/20 bg-success/10 text-success"
                            : "border-primary/20 bg-primary/10 text-primary"
                        }`}>
                          <CheckCircle2 className="size-3.5" />
                          {isCurrentLessonCompleted ? "Hoàn thành" : "Đang học"}
                        </span>
                        <span className="inline-flex h-8 items-center gap-2 rounded-lg border border-border bg-muted px-3 font-medium text-muted-foreground">
                          {isProgressSaving ? <Loader2 className="size-3.5 animate-spin" /> : <CheckCircle2 className="size-3.5" />}
                          {isProgressSaving
                            ? "Đang lưu tiến độ"
                            : progressSavedLabel
                              ? `Đã lưu ${progressSavedLabel}`
                              : "Tự động lưu tiến độ"}
                        </span>
                    </div>
                  </div>

                  {/* Tabs Container */}
                  <Tabs defaultValue="overview" className="w-full">
                    <TabsList variant="line" className="h-11 w-full gap-3 rounded-none border-b border-border bg-transparent p-0 sm:w-fit">
                      <TabsTrigger 
                        value="overview" 
                        className="h-11 rounded-none px-1 text-sm font-semibold"
                      >
                        <Info className="size-4" /> Tổng quan
                      </TabsTrigger>
                      <TabsTrigger 
                        value="qa" 
                        className="h-11 rounded-none px-1 text-sm font-semibold"
                      >
                        <MessageSquare className="size-4" /> Hỏi đáp
                      </TabsTrigger>
                      <TabsTrigger 
                        value="resources" 
                        className="h-11 rounded-none px-1 text-sm font-semibold"
                      >
                        <FileText className="size-4" /> Tài liệu
                      </TabsTrigger>
                    </TabsList>

                    <TabsContent value="overview" className="mt-6 outline-none">
                      <div className="space-y-6">
                        <AppCard appVariant="default" className="shadow-sm">
                          <AppCardContent className="p-6 md:p-8">
                          <h3 className="app-section-title mb-6 flex items-center gap-3">
                            <Info className="size-5 text-primary" />
                            Nội dung bài học
                          </h3>
                          <div 
                            className="html-content app-body-text max-w-none leading-7 text-muted-foreground"
                            dangerouslySetInnerHTML={{ __html: currentLesson?.content }}
                          />
                          </AppCardContent>
                        </AppCard>

                        <AppCard appVariant="default" className="shadow-sm">
                          <AppCardContent className="p-6 md:p-8">
                            <h3 className="app-section-title mb-6 flex items-center gap-3">
                              <Star className="size-5 fill-warning text-warning" />
                              Đánh giá khóa học
                            </h3>
                            <div className="grid gap-8 md:grid-cols-[180px_1fr] md:items-center">
                              <div className="text-center md:text-left">
                                <div className="text-5xl font-bold text-warning">
                                  {courseRatingSummary.averageRating.toFixed(1)}
                                </div>
                                <div
                                  className="mt-3 flex justify-center gap-1 md:justify-start"
                                  aria-label={`${courseRatingSummary.averageRating.toFixed(1)} trên 5 sao`}
                                >
                                  {Array.from({ length: 5 }).map((_, index) => (
                                    <Star
                                      key={index}
                                      className={`h-5 w-5 text-warning ${index < Math.round(courseRatingSummary.averageRating) ? "fill-warning" : "fill-transparent"}`}
                                    />
                                  ))}
                                </div>
                                <p className="mt-2 text-sm text-muted-foreground">
                                  {courseRatingSummary.reviewCount} đánh giá
                                </p>
                              </div>

                              <div className="space-y-3">
                                {courseRatingSummary.distribution.map((item) => (
                                  <div key={item.rating} className="grid grid-cols-[52px_1fr_42px] items-center gap-3 text-sm">
                                    <div className="flex items-center gap-1 font-medium text-foreground">
                                      <span>{item.rating}</span>
                                      <Star className="h-4 w-4 fill-warning text-warning" />
                                    </div>
                                    <Progress
                                      value={item.percentage}
                                      className="h-2 bg-muted [&>div]:bg-warning"
                                    />
                                    <span className="text-right text-muted-foreground">{item.percentage}%</span>
                                  </div>
                                ))}
                              </div>
                            </div>

                            <div className="mt-8 border-t border-border pt-6">
                              {currentUserReview ? (
                                <div className="rounded-xl border border-primary/20 bg-primary/5 p-4">
                                  <div className="flex flex-wrap items-center justify-between gap-3">
                                    <div>
                                      <p className="text-sm font-semibold text-foreground">Đánh giá của tôi</p>
                                      <div className="mt-2 flex items-center gap-1" aria-label={`${currentUserReview.rating} trên 5 sao`}>
                                        {Array.from({ length: 5 }).map((_, index) => (
                                          <Star
                                            key={index}
                                            className={`h-4 w-4 text-warning ${index < Number(currentUserReview.rating) ? "fill-warning" : "fill-transparent"}`}
                                          />
                                        ))}
                                      </div>
                                    </div>
                                    <Button
                                      type="button"
                                      variant="outline"
                                      size="sm"
                                      onClick={() => {
                                        setDraftRating(Number(currentUserReview.rating || 0));
                                        setDraftReviewComment(currentUserReview.comment || "");
                                        setShowRatingForm(true);
                                      }}
                                      className="h-9 rounded-lg"
                                    >
                                      Sửa đánh giá
                                    </Button>
                                  </div>
                                  {currentUserReview.comment && (
                                    <p className="mt-3 text-sm leading-6 text-muted-foreground">{currentUserReview.comment}</p>
                                  )}
                                </div>
                              ) : (
                                <div className="flex flex-col gap-4 rounded-xl border border-border bg-muted/50 p-4 sm:flex-row sm:items-center sm:justify-between">
                                  <div>
                                    <p className="text-sm font-semibold text-foreground">Bạn chưa đánh giá khóa học này.</p>
                                    <p className="mt-1 text-sm text-muted-foreground">Ghi lại cảm nhận của bạn để giảng viên cải thiện nội dung tốt hơn.</p>
                                  </div>
                                  <Button
                                    type="button"
                                    onClick={() => setShowRatingForm((value) => !value)}
                                    className="h-10 shrink-0 rounded-lg"
                                  >
                                    Đánh giá khóa học
                                  </Button>
                                </div>
                              )}

                              {showRatingForm && (
                                <form onSubmit={handleSubmitReview} className="mt-4 rounded-xl border border-border bg-card p-4">
                                  <div className="flex flex-wrap items-center gap-2">
                                    {Array.from({ length: 5 }).map((_, index) => {
                                      const value = index + 1;
                                      return (
                                        <button
                                          key={value}
                                          type="button"
                                          onClick={() => setDraftRating(value)}
                                          className="rounded-md p-1 text-warning transition-transform hover:scale-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                                          aria-label={`${value} sao`}
                                        >
                                          <Star className={`h-6 w-6 ${value <= draftRating ? "fill-warning" : "fill-transparent"}`} />
                                        </button>
                                      );
                                    })}
                                    <span className="ml-1 text-sm font-medium text-muted-foreground">
                                      {draftRating > 0 ? `${draftRating}/5 sao` : "Chọn số sao"}
                                    </span>
                                  </div>
                                  <textarea
                                    value={draftReviewComment}
                                    onChange={(event) => setDraftReviewComment(event.target.value)}
                                    placeholder="Chia sẻ ngắn về trải nghiệm học của bạn..."
                                    className="mt-4 min-h-[96px] w-full resize-y rounded-lg border border-border bg-background p-3 text-sm text-foreground outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary/15"
                                  />
                                  <div className="mt-4 flex justify-end gap-2">
                                    <Button type="button" variant="ghost" size="sm" onClick={() => setShowRatingForm(false)} className="h-9 rounded-lg">
                                      Hủy
                                    </Button>
                                    <Button type="submit" size="sm" disabled={!draftRating || isSubmittingReview} className="h-9 rounded-lg">
                                      {isSubmittingReview ? "Đang gửi..." : "Gửi đánh giá"}
                                    </Button>
                                  </div>
                                </form>
                              )}
                            </div>
                          </AppCardContent>
                        </AppCard>
                      </div>
                    </TabsContent>

                    <TabsContent value="qa" className="mt-6 outline-none">
                      <LessonQA lesson={currentLesson} />
                    </TabsContent>

                    <TabsContent value="resources" className="mt-6 outline-none">
                       {currentSection?.attachments && currentSection.attachments.length > 0 ? (
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {currentSection.attachments.map((file, i) => (
                              <AppCard key={file.id || i} appVariant="default" className="group shadow-sm hover:border-primary/40">
                                <AppCardContent className="flex items-center justify-between gap-4 p-5">
                                <div className="flex items-center gap-4">
                                  <div className="flex size-12 items-center justify-center rounded-lg border border-border bg-muted text-primary transition-colors group-hover:bg-primary/10">
                                    <FileText className="size-5" />
                                  </div>
                                  <div className="min-w-0">
                                    <p className="mb-1 max-w-[220px] truncate text-sm font-semibold text-foreground">
                                        {file.fileUrl.split('/').pop() || `Tài liệu ${i + 1}`}
                                    </p>
                                    <p className="text-xs font-medium text-muted-foreground">
                                        {file.fileType || "DOCUMENT"} • FILE DOWNLOAD
                                    </p>
                                  </div>
                                </div>
                                <Button 
                                    variant="ghost" 
                                    size="icon" 
                                    className="size-10 rounded-lg text-primary hover:bg-primary/10"
                                    onClick={() => window.open(file.fileUrl, '_blank')}
                                >
                                  <Download className="size-5" />
                                </Button>
                                </AppCardContent>
                              </AppCard>
                            ))}
                          </div>
                       ) : (
                          <div className="rounded-xl border border-dashed border-border bg-card p-12 text-center text-sm font-medium text-muted-foreground shadow-sm">
                            Chương này chưa tải lên tài liệu tham khảo.
                          </div>
                       )}
                    </TabsContent>
                  </Tabs>
                </>
              ) : (
                <QuizArea 
                   quiz={currentSection?.quiz} 
                   existingResult={quizProgress.find(qp => qp.quizId == currentSection?.quiz?.id)}
                   onQuizCompleted={onQuizCompleted}
                   onQuizReset={onQuizReset}
                   onBack={() => setActiveViewMode("video")} 
                />
              )}
            </div>

            {/* ── Right: Course Playlist Sidebar ── */}
            <aside className="flex w-full shrink-0 flex-col overflow-hidden rounded-xl border border-border bg-card shadow-sm lg:w-[380px] xl:w-[420px]">
              <div className="flex items-center justify-between border-b border-border bg-muted p-6">
                <div className="flex flex-col gap-1">
                    <h3 className="text-sm font-bold text-foreground">Nội dung khóa học</h3>
                    <p className="text-xs font-medium text-muted-foreground">Danh sách bài giảng dành cho bạn</p>
                </div>
                <div className="rounded-lg border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
                    {course?.modules?.length || 0} CHƯƠNG
                </div>
              </div>

              <div>
                <Accordion type="multiple" value={openSectionValues} onValueChange={setOpenSectionValues}>
                  {course.modules.map((section, sIdx) => {
                    const isActiveSection = activeSectionIdx === sIdx;
                    const sectionLessons = section.lessons || [];
                    const sectionCompletedCount = sectionLessons.filter((lesson) => completedLessonIds.includes(lesson.id)).length;
                    const sectionProgress = sectionLessons.length > 0
                      ? Math.round((sectionCompletedCount / sectionLessons.length) * 100)
                      : 0;
                    const isQuizCurrent = activeSectionIdx === sIdx && activeViewMode === "quiz";
                    const quizQuestionCount =
                      section.quiz?.questions?.length ||
                      section.quiz?.questionCount ||
                      section.quiz?.totalQuestions ||
                      0;
                    return (
                      <AccordionItem
                        key={section.id || sIdx}
                        value={`section-${sIdx}`}
                        className="border-b-0"
                      >
                        <AccordionTrigger className="items-center rounded-none px-5 py-4 text-left font-semibold transition-colors hover:bg-muted hover:no-underline focus-visible:border-transparent focus-visible:ring-0 focus-visible:after:border-transparent [&[data-state=open]]:bg-muted [&_[data-slot=accordion-trigger-icon]]:self-center [&_[data-slot=accordion-trigger-icon]]:size-5">
                          <div className="flex min-w-0 flex-1 flex-col items-start gap-2 text-left">
                            <span className="hidden">
                              Phần {sIdx + 1}
                            </span>
                            <span className="w-full truncate text-sm font-semibold text-foreground">
                              {section.title}
                            </span>
                            <div className="flex w-full items-center gap-3 text-xs font-medium text-muted-foreground">
                              <span className="shrink-0">{sectionCompletedCount}/{sectionLessons.length} bài học</span>
                              <span className="shrink-0 text-primary">{sectionProgress}% hoàn thành</span>
                            </div>
                          </div>
                        </AccordionTrigger>
                        <AccordionContent className="!p-0">
                          <div className="flex flex-col">
                            {sectionLessons.map((lesson, lIdx) => {
                              const isCurrent = activeViewMode === "video" && activeSectionIdx === sIdx && activeLessonIdx === lIdx;
                              const isCompleted = completedLessonIds.includes(lesson.id);
                              const lessonThumbnail = getLessonThumbnail(lesson);
                              const lessonDuration = formatLessonDuration(lesson.metadata);
                              return (
                                <button
                                  key={lesson.id || lIdx}
                                  ref={isCurrent ? activePlaylistItemRef : null}
                                  onClick={() => handleLessonSelect(sIdx, lIdx)}
                                  className={`relative flex items-start gap-3 border px-5 py-4 text-left transition-colors before:absolute before:bottom-3 before:left-0 before:top-3 before:w-1 before:rounded-r-full before:transition-colors
                                    ${isCurrent 
                                        ? "border-primary/30 bg-primary/10 text-primary before:bg-primary" 
                                        : "border-transparent text-foreground before:bg-transparent hover:bg-muted"}`}
                                >
                                  <div className="relative mt-0.5 h-12 w-20 shrink-0 overflow-hidden rounded-md border border-border bg-muted">
                                    {lessonThumbnail ? (
                                      <img
                                        src={lessonThumbnail}
                                        alt=""
                                        className="h-full w-full object-cover"
                                        loading="lazy"
                                        decoding="async"
                                        onError={(event) => {
                                          if (event.currentTarget.src !== FALLBACK_LESSON_THUMBNAIL) {
                                            event.currentTarget.src = course?.thumbnail || course?.image || FALLBACK_LESSON_THUMBNAIL;
                                          }
                                        }}
                                      />
                                    ) : (
                                      <div className="flex h-full w-full items-center justify-center text-muted-foreground">
                                        <PlayCircle className="size-5" />
                                      </div>
                                    )}
                                    <span className="absolute inset-0 bg-black/10" />
                                    <span className={`absolute left-1.5 top-1.5 flex size-5 items-center justify-center rounded-full shadow-sm ${
                                      isCompleted
                                        ? "bg-success text-success-foreground"
                                        : isCurrent
                                          ? "bg-primary text-primary-foreground"
                                          : "bg-card/90 text-muted-foreground"
                                    }`}>
                                      {isCompleted ? <CheckCircle2 className="size-3" /> : <PlayCircle className="size-3" />}
                                    </span>
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <p className={`text-sm font-semibold leading-snug ${isCurrent ? "text-primary" : "text-foreground"}`}>
                                      {lesson.title}
                                    </p>
                                    <div className={`mt-1.5 flex items-center gap-2 text-xs font-medium ${isCurrent ? "text-primary/80" : "text-muted-foreground"}`}>
                                      <PlayCircle className="size-3" />
                                      <span>{lessonDuration}</span>
                                    </div>
                                  </div>
                                </button>
                              );
                            })}
                            
                            {/* Thêm Render Quiz của Chương */}
                            {section.quiz && (
                              <button
                                ref={isQuizCurrent ? activePlaylistItemRef : null}
                                onClick={() => handleQuizSelect(sIdx)}
                                className={`relative flex items-start gap-3 border px-5 py-4 text-left transition-colors before:absolute before:bottom-3 before:left-0 before:top-3 before:w-1 before:rounded-r-full before:transition-colors
                                  ${isQuizCurrent
                                      ? "border-info/30 bg-info/10 text-info before:bg-info" 
                                      : "border-transparent text-foreground before:bg-transparent hover:bg-muted"}`}
                              >
                                <div className="shrink-0">
                                   {completedQuizIds.includes(section.quiz.id) ? (
                                       <div className="flex size-9 items-center justify-center rounded-lg bg-success/10 text-success">
                                          <CheckCircle2 className="size-3" />
                                       </div>
                                   ) : (
                                      <div className={`flex size-9 items-center justify-center rounded-lg ${isQuizCurrent ? "bg-info text-info-foreground" : "bg-info-soft text-info"}`}>
                                         <FileText className="size-4" />
                                      </div>
                                   )}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className={`text-sm font-semibold leading-snug ${isQuizCurrent ? "text-info" : "text-foreground"}`}>
                                    {section.quiz.title || "Bài tập cuối chương"}
                                  </p>
                                  <div className={`mt-1.5 flex items-center gap-2 text-xs font-medium ${isQuizCurrent ? "text-info/80" : "text-muted-foreground"}`}>
                                    <CheckCircle2 className="size-3" />
                                    <span>{quizQuestionCount > 0 ? `${quizQuestionCount} câu hỏi` : "Bài kiểm tra"}</span>
                                  </div>
                                </div>
                              </button>
                            )}
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
      </div>
      </PageContainer.Content>
    </PageContainer>
  );
}
