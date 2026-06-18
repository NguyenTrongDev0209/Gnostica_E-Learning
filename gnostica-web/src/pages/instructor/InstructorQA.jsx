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
  AlertCircle
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const MOCK_QUESTIONS = [
  {
    id: "QA-101",
    user: "Lê Văn Minh",
    course: "Fullstack Next.js Masterclass",
    lesson: "Cài đặt Prisma ORM",
    content: "Chào thầy, em cài Prisma bị lỗi 'Command not found'. Thầy xem giúp em với ạ.",
    time: "45 phút trước",
    status: "unanswered",
    avatar: "https://i.pravatar.cc/150?u=q1"
  },
  {
    id: "QA-102",
    user: "Trần Thế Quang",
    course: "React Native cho người mới",
    lesson: "Sử dụng Expo Go",
    content: "Làm sao để deploy app React Native lên App Store vậy thầy?",
    time: "3 giờ trước",
    status: "answered",
    avatar: "https://i.pravatar.cc/150?u=q2"
  },
  {
    id: "QA-103",
    user: "Nguyễn Thu Huyền",
    course: "Tailwind CSS Thực chiến",
    lesson: "Grid vs Flexbox",
    content: "Em vẫn chưa phân biệt được khi nào dùng Grid khi nào dùng Flexbox cho container lớn.",
    time: "1 ngày trước",
    status: "unanswered",
    avatar: "https://i.pravatar.cc/150?u=q3"
  }
];

const MOCK_REVIEWS = [
  {
    id: "REV-201",
    user: "Phạm Anh Khoa",
    course: "Fullstack Next.js Masterclass",
    rating: 5,
    content: "Khóa học quá đỉnh, kiến thức thực chiến và dễ áp dụng.",
    time: "2 giờ trước",
    status: "not_responded",
    avatar: "https://i.pravatar.cc/150?u=r1"
  },
  {
    id: "REV-202",
    user: "Hoàng Minh Chế",
    course: "Figma UI/UX Design",
    rating: 4,
    content: "Nội dung rất hay nhưng phần Auto Layout hơi nhanh.",
    time: "1 ngày trước",
    status: "responded",
    avatar: "https://i.pravatar.cc/150?u=r2"
  }
];

export default function InstructorQA() {
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
            Hỏi Đáp ({MOCK_QUESTIONS.filter(q => q.status === 'unanswered').length})
          </TabsTrigger>
          <TabsTrigger value="reviews" className="px-8 py-2.5 font-bold data-[state=active]:bg-white data-[state=active]:text-amber-600 data-[state=active]:shadow-sm">
            <Star className="w-4 h-4 mr-2" />
            Đánh Giá ({MOCK_REVIEWS.filter(r => r.status === 'not_responded').length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="questions" className="space-y-4">
           {MOCK_QUESTIONS.map((q) => (
             <Card key={q.id} className="border-border shadow-sm hover:border-success/20 transition-colors group">
               <CardContent className="p-0">
                 <div className="p-5 flex gap-4">
                   <div className="w-10 h-10 rounded-full overflow-hidden border border-border shrink-0">
                     <img src={q.avatar} alt={q.user} className="w-full h-full object-cover" />
                   </div>
                   <div className="flex-1 min-w-0">
                     <div className="flex justify-between items-start mb-2">
                       <div>
                         <h4 className="font-bold text-foreground">{q.user}</h4>
                         <p className="text-xs text-muted-foreground font-bold uppercase tracking-tight">{q.time}</p>
                       </div>
                       {q.status === 'unanswered' ? (
                         <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-100 border-none font-bold">
                           <AlertCircle className="w-3 h-3 mr-1.5" /> Chưa phản hồi
                         </Badge>
                       ) : (
                         <Badge className="bg-success/10 text-success text-success hover:bg-success/10 text-success border-none font-bold">
                           <CheckCircle2 className="w-3 h-3 mr-1.5" /> Đã trả lời
                         </Badge>
                       )}
                     </div>
                     <p className="text-sm font-bold text-foreground mb-3 bg-muted p-3 rounded-lg border-l-4 border-l-green-500">
                       "{q.content}"
                     </p>
                     <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs font-bold text-muted-foreground uppercase tracking-tighter">
                       <span className="flex items-center gap-1">Khóa: <span className="text-muted-foreground font-black">{q.course}</span></span>
                       <span className="flex items-center gap-1">Bài: <span className="text-muted-foreground font-black">{q.lesson}</span></span>
                     </div>
                   </div>
                 </div>
                 <div className="px-5 py-3 border-t border-border bg-muted flex justify-between items-center group-hover:bg-green-50/30 transition-colors">
                    <div className="flex items-center gap-4">
                      <button className="text-xs font-bold text-muted-foreground hover:text-muted-foreground flex items-center gap-1.5">
                        <ThumbsUp className="w-3.5 h-3.5" /> Hữu ích
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
           {MOCK_REVIEWS.map((r) => (
             <Card key={r.id} className="border-border shadow-sm hover:border-amber-200 transition-colors">
               <CardContent className="p-0">
                 <div className="p-5 flex gap-4">
                    <div className="w-10 h-10 rounded-full overflow-hidden border border-border shrink-0">
                      <img src={r.avatar} alt={r.user} className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1 min-w-0">
                       <div className="flex justify-between items-start mb-2">
                         <div>
                            <h4 className="font-bold text-foreground">{r.user}</h4>
                            <div className="flex gap-0.5 mt-1">
                              {[1, 2, 3, 4, 5].map((star) => (
                                <Star key={star} className={`w-3 h-3 ${star <= r.rating ? 'text-amber-500 fill-amber-500' : 'text-slate-200'}`} />
                              ))}
                            </div>
                         </div>
                         <span className="text-xs text-muted-foreground font-bold uppercase">{r.time}</span>
                       </div>
                       <p className="text-sm font-medium text-muted-foreground py-3 italic">"{r.content}"</p>
                       <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest px-2 py-0.5 bg-secondary w-fit rounded">
                         Khóa học: <span className="text-foreground">{r.course}</span>
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
