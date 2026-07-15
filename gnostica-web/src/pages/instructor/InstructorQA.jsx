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
  Loader2
} from "lucide-react";
import AppCard, { AppCardContent, AppCardHeader, AppCardTitle, AppCardDescription } from "@/components/common/micro/AppCard";
import { AppButton } from "@/components/common/micro/AppButton";
import AppInput from "@/components/common/micro/AppInput";
import AppBadge from "@/components/common/micro/AppBadge";
import { Tabs as AppTabsRoot, TabsContent as AppTabsContent, TabsList as AppTabsList, TabsTrigger as AppTabsTrigger } from "@/components/common/micro/AppTabs";
import useInstructorQA from "@/hooks/forum/useInstructorQA";

export default function InstructorQA() {
  const { questions, reviews, loading } = useInstructorQA();

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
          <h1 className="text-2xl font-bold text-foreground tracking-tight">Hỏi Đáp & Đánh Giá</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Tương tác với học viên qua các câu hỏi bài học và quản lý phản hồi khóa học.
          </p>
        </div>
        <div className="flex text-sm font-bold text-muted-foreground bg-secondary p-1 rounded-lg">
          <button className="px-4 py-2 rounded-md bg-white text-foreground shadow-sm">Tất cả</button>
          <button className="px-4 py-2 rounded-md hover:text-foreground transition-colors">Chưa trả lời</button>
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
                   </div>
                 </div>
                 <div className="px-5 py-3 border-t border-border bg-muted flex justify-between items-center group-hover:bg-success/5 transition-colors">
                    <div className="flex items-center gap-4">
                      <button className="text-xs font-bold text-muted-foreground hover:text-muted-foreground flex items-center gap-1.5">
                        <ThumbsUp className="w-3.5 h-3.5" /> {q.likes || 0} Hữu ích
                      </button>
                    </div>
                    <AppButton appVariant="gradient" size="sm" className="bg-success/10 text-success hover:bg-success/20 font-bold h-8">
                      <Reply className="w-3.5 h-3.5 mr-1.5" /> Phản hồi ngay
                    </AppButton>
                 </div>
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
                    <AppButton appVariant="ghostMuted" variant="ghost" size="sm" className="h-8 font-bold text-warning hover:bg-warning/10 hover:text-warning">
                      Cảm ơn học viên &rarr;
                    </AppButton>
                 </div>
               </AppCardContent>
             </AppCard>
           ))}
        </AppTabsContent>
      </AppTabsRoot>
    </div>
  );
}
