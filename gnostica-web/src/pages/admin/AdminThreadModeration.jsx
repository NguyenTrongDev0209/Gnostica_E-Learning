import React, { useState, useEffect } from "react";
import { 
  ShieldCheck, 
  Trash2, 
  CheckCircle2, 
  MessageSquare, 
  Calendar, 
  User, 
  Layers,
  ChevronDown,
  ChevronUp,
  Image as ImageIcon,
  AlertCircle
} from "lucide-react";
import axios from "axios";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";

export default function AdminThreadModeration() {
  const [pendingThreads, setPendingThreads] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [expandedThreads, setExpandedThreads] = useState({});

  const fetchPendingThreads = async () => {
    setIsLoading(true);
    try {
      const res = await axios.get("http://localhost:8080/api/threads/pending?page=0&size=100");
      setPendingThreads(res.data.content || []);
    } catch (error) {
      console.error("Error fetching pending threads:", error);
      toast.error("Không thể tải danh sách bài viết chờ duyệt");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPendingThreads();
  }, []);

  const handleApprove = async (id) => {
    try {
      await axios.post(`http://localhost:8080/api/threads/${id}/approve`);
      toast.success("Duyệt bài viết thành công!");
      // Smoothly remove approved thread from local state
      setPendingThreads(prev => prev.filter(t => t.id !== id));
    } catch (error) {
      console.error("Error approving thread:", error);
      toast.error("Phê duyệt bài viết thất bại");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Bạn có chắc chắn muốn xóa/từ chối bài viết này?")) return;
    try {
      await axios.delete(`http://localhost:8080/api/threads/${id}`);
      toast.success("Đã từ chối và xóa bài viết!");
      setPendingThreads(prev => prev.filter(t => t.id !== id));
    } catch (error) {
      console.error("Error deleting thread:", error);
      toast.error("Xóa bài viết thất bại");
    }
  };

  const toggleExpand = (id) => {
    setExpandedThreads(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const formatDate = (dateString) => {
    if (!dateString) return "";
    return new Date(dateString).toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-10">
      {/* Header Panel */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <ShieldCheck className="w-7 h-7 text-primary" />
            Kiểm duyệt bài viết
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Duyệt hoặc từ chối các bài đăng mới từ học viên và giảng viên trước khi hiển thị trên cộng đồng.
          </p>
        </div>
        <Button onClick={fetchPendingThreads} variant="outline" className="h-10 font-bold shrink-0">
          Làm mới danh sách
        </Button>
      </div>

      {/* Stats Widget */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-100 shadow-sm">
          <CardContent className="p-5 flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-sm font-semibold text-blue-700/80">Bài viết chờ duyệt</p>
              <h3 className="text-3xl font-extrabold text-blue-900">{pendingThreads.length}</h3>
            </div>
            <div className="w-12 h-12 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-600">
              <MessageSquare className="w-6 h-6" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Pending List Area */}
      <Card className="border-border shadow-sm">
        <CardHeader className="border-b bg-slate-50/50 py-4">
          <CardTitle className="text-lg font-bold text-slate-800">
            Danh sách chờ kiểm duyệt
          </CardTitle>
          <CardDescription>
            Tất cả bài viết được đăng lên mặc định sẽ ở trạng thái chờ duyệt.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-20 gap-4 text-slate-500">
              <div className="animate-spin rounded-full h-9 w-9 border-b-2 border-primary"></div>
              <p className="text-sm font-medium">Đang tải dữ liệu kiểm duyệt...</p>
            </div>
          ) : pendingThreads.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center gap-4">
              <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center text-green-600 border border-green-100 shadow-sm">
                <ShieldCheck className="w-8 h-8" />
              </div>
              <div className="space-y-1">
                <h3 className="text-lg font-bold text-slate-800">Hệ thống sạch bài viết chờ duyệt</h3>
                <p className="text-sm text-slate-400 max-w-sm px-4">
                  Tuyệt vời! Hiện không có bài đăng nào cần kiểm duyệt vào lúc này.
                </p>
              </div>
            </div>
          ) : (
            <div className="divide-y divide-border">
              <AnimatePresence>
                {pendingThreads.map((thread) => {
                  const isExpanded = expandedThreads[thread.id];
                  const hasLongContent = thread.content && thread.content.length > 250;
                  
                  return (
                    <motion.div
                      key={thread.id}
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, x: -50 }}
                      transition={{ duration: 0.3 }}
                      className="p-5 flex flex-col md:flex-row md:items-start gap-4 hover:bg-slate-50/30 transition-colors"
                    >
                      {/* Left: Author Info */}
                      <div className="md:w-56 shrink-0 flex flex-row md:flex-col items-center md:items-start gap-3 border-b md:border-b-0 pb-3 md:pb-0 border-slate-100">
                        <Avatar className="w-11 h-11 border border-slate-200 shadow-sm shrink-0">
                          <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${thread.account?.email || 'default'}`} />
                          <AvatarFallback className="bg-primary/10 text-primary font-bold">
                            {thread.account?.fullName?.substring(0, 2).toUpperCase() || "UN"}
                          </AvatarFallback>
                        </Avatar>
                        <div className="min-w-0 md:space-y-1">
                          <p className="font-bold text-sm text-slate-800 truncate" title={thread.account?.fullName}>
                            {thread.account?.fullName || "Ẩn danh"}
                          </p>
                          <p className="text-xs text-slate-400 truncate" title={thread.account?.email}>
                            {thread.account?.email}
                          </p>
                          <div className="hidden md:flex items-center gap-1.5 text-[11px] text-slate-400 mt-1">
                            <Calendar className="w-3.5 h-3.5" />
                            {formatDate(thread.createdAt)}
                          </div>
                        </div>
                      </div>

                      {/* Middle: Content and Category */}
                      <div className="flex-1 min-w-0 space-y-2.5">
                        <div className="flex items-center gap-2 flex-wrap">
                          <Badge variant="secondary" className="bg-primary/10 text-primary hover:bg-primary/10 border-none font-semibold px-2 py-0.5 text-xs">
                            <Layers className="w-3 h-3 mr-1" />
                            {thread.category?.name || "Chưa phân loại"}
                          </Badge>
                          <span className="text-[11px] text-slate-400 md:hidden flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {formatDate(thread.createdAt)}
                          </span>
                        </div>

                        {/* Content text */}
                        <div className="relative text-sm text-slate-600 leading-relaxed font-normal">
                          <p className={`whitespace-pre-line ${(!isExpanded && hasLongContent) ? "line-clamp-4" : ""}`}>
                            {thread.content}
                          </p>
                          {hasLongContent && (
                            <button
                              onClick={() => toggleExpand(thread.id)}
                              className="text-xs font-bold text-primary hover:underline mt-2 flex items-center gap-1 focus:outline-none"
                            >
                              {isExpanded ? (
                                <>Thu gọn <ChevronUp className="w-3 h-3" /></>
                              ) : (
                                <>Đọc thêm bản đầy đủ <ChevronDown className="w-3 h-3" /></>
                              )}
                            </button>
                          )}
                        </div>

                        {/* Image gallery if present */}
                        {thread.images && thread.images.length > 0 && (
                          <div className="flex items-center gap-2 flex-wrap pt-2">
                            {thread.images.map((img, index) => (
                              <a
                                key={index}
                                href={img.imageUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="group relative w-20 h-20 rounded-md overflow-hidden border border-slate-200 shadow-sm bg-slate-50 transition-all hover:scale-105"
                              >
                                <img
                                  src={img.imageUrl}
                                  alt={`Attachment ${index}`}
                                  className="w-full h-full object-cover"
                                />
                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white transition-opacity">
                                  <ImageIcon className="w-4 h-4" />
                                </div>
                              </a>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Right: Actions */}
                      <div className="md:w-36 shrink-0 flex md:flex-col items-center justify-end md:justify-start gap-2 pt-2 md:pt-0">
                        <Button
                          size="sm"
                          className="w-full md:w-full bg-green-600 hover:bg-green-700 text-white font-bold h-9 gap-1.5 shadow-sm shadow-green-600/10"
                          onClick={() => handleApprove(thread.id)}
                        >
                          <CheckCircle2 className="w-4 h-4" /> Duyệt bài
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="w-full md:w-full border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700 font-bold h-9 gap-1.5"
                          onClick={() => handleDelete(thread.id)}
                        >
                          <Trash2 className="w-4 h-4" /> Từ chối
                        </Button>
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
