import React, { useState } from "react";
import { 
  MessageSquare, 
  Star, 
  Search, 
  Filter, 
  MoreHorizontal, 
  Reply, 
  ThumbsUp, 
  Clock,
  CheckCircle2,
  AlertCircle,
  Loader2
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import useInstructorQA from "@/hooks/instructor/useInstructorQA";

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

      <Tabs defaultValue="questions" className="w-full">
        <TabsList className="mb-6 bg-secondary p-1">
          <TabsTrigger value="questions" className="px-8 py-2.5 font-bold data-[state=active]:bg-white data-[state=active]:text-success data-[state=active]:shadow-sm">
            <MessageSquare className="w-4 h-4 mr-2" />
            Hỏi Đáp ({questions.filter(q => q.status === 'unanswered').length})
          </TabsTrigger>
          <TabsTrigger value="reviews" className="px-8 py-2.5 font-bold data-[state=active]:bg-white data-[state=active]:text-amber-600 data-[state=active]:shadow-sm">
            <Star className="w-4 h-4 mr-2" />
            Đánh Giá ({reviews.filter(r => r.status === 'not_responded').length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="questions" className="space-y-4">
           {questions.length === 0 ? (
             <div className="text-center py-10 bg-muted/50 rounded-lg">Không có câu hỏi nào.</div>
           ) : questions.map((q) => (
             <Card key={q.id} className="border-border shadow-sm hover:border-success/20 transition-colors group">
               <CardContent className="p-0">
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
                         <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-100 border-none font-bold">
                           <AlertCircle className="w-3 h-3 mr-1.5" /> Chưa phản hồi
                         </Badge>
                       ) : (
                         <Badge className="bg-success/10 text-success hover:bg-success/10 text-success border-none font-bold">
                           <CheckCircle2 className="w-3 h-3 mr-1.5" /> Đã trả lời
                         </Badge>
                       )}
                     </div>
                     <p className="text-sm font-bold text-foreground mb-3 bg-muted p-3 rounded-lg border-l-4 border-l-green-500">
                       "{q.content}"
                     </p>
                     <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs font-bold text-muted-foreground uppercase tracking-tighter">
                       <span className="flex items-center gap-1">Khóa: <span className="text-muted-foreground font-black">{q.courseName}</span></span>
                       <span className="flex items-center gap-1">Bài: <span className="text-muted-foreground font-black">{q.lessonName}</span></span>
                     </div>
                   </div>
                 </div>
                 <div className="px-5 py-3 border-t border-border bg-muted flex justify-between items-center group-hover:bg-green-50/30 transition-colors">
                    <div className="flex items-center gap-4">
                      <button className="text-xs font-bold text-muted-foreground hover:text-muted-foreground flex items-center gap-1.5">
                        <ThumbsUp className="w-3.5 h-3.5" /> {q.likes || 0} Hữu ích
                      </button>
                    </div>
                    <Button size="sm" className="bg-success/10 text-success hover:bg-success/10 text-success text-white font-bold h-8 shadow-none">
                      <Reply className="w-3.5 h-3.5 mr-1.5" /> Phản hồi ngay
                    </Button>
                 </div>
               </CardContent>
             </Card>
           ))}
        </TabsContent>

        <TabsContent value="reviews" className="space-y-4">
           {reviews.length === 0 ? (
             <div className="text-center py-10 bg-muted/50 rounded-lg">Không có đánh giá nào.</div>
           ) : reviews.map((r) => (
             <Card key={r.id} className="border-border shadow-sm hover:border-amber-200 transition-colors">
               <CardContent className="p-0">
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
                       <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest px-2 py-0.5 bg-secondary w-fit rounded">
                         Khóa học: <span className="text-foreground">{r.courseName}</span>
                       </p>
                    </div>
                 </div>
                 <div className="px-5 py-3 border-t border-border bg-muted flex justify-end">
                    <Button variant="ghost" size="sm" className="h-8 font-bold text-amber-600 hover:bg-amber-50">
                      Cảm ơn học viên &rarr;
                    </Button>
                 </div>
               </CardContent>
             </Card>
           ))}
        </TabsContent>
      </Tabs>
    </div>
  );
}
