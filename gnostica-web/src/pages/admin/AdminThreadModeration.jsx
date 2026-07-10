import React, { useState, useEffect } from "react";
import threadService from "@/services/forum/threadService";
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
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { SimpleButton, GhostButton } from "@/components/common/AppButton";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { toast } from "sonner";
// eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence } from "framer-motion";
import RenderContent from "@/components/common/RenderContent";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export default function AdminThreadModeration() {
  const [pendingThreads, setPendingThreads] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [expandedThreads, setExpandedThreads] = useState({});
  const [confirmState, setConfirmState] = useState({
    isOpen: false,
    threadId: null,
    type: "", // "approve" | "delete"
    title: "",
    description: "",
  });

  const fetchPendingThreads = async () => {
    setIsLoading(true);
    try {
      const res = await threadService.getPendingThreads(0, 100);
      setPendingThreads(res?.content || res?.data?.content || res?.data || res || []);
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

  const openConfirm = (id, type) => {
    if (type === "approve") {
      setConfirmState({
        isOpen: true,
        threadId: id,
        type: "approve",
        title: "Xác nhận duyệt bài viết",
        description: "Bạn có chắc chắn muốn phê duyệt bài viết này hiển thị trên cộng đồng?",
      });
    } else if (type === "delete") {
      setConfirmState({
        isOpen: true,
        threadId: id,
        type: "delete",
        title: "Xác nhận từ chối bài viết",
        description: "Hành động này sẽ từ chối và xóa bài viết khỏi danh sách chờ. Bạn không thể hoàn tác hành động này.",
      });
    }
  };

  const handleConfirmAction = async () => {
    const { threadId, type } = confirmState;
    setConfirmState(prev => ({ ...prev, isOpen: false }));
    if (!threadId) return;

    if (type === "approve") {
      try {
        await threadService.approveThread(threadId);
        toast.success("Duyệt bài viết thành công!");
        setPendingThreads(prev => prev.filter(t => t.id !== threadId));
      } catch (error) {
        console.error("Error approving thread:", error);
        toast.error("Phê duyệt bài viết thất bại");
      }
    } else if (type === "delete") {
      try {
        await threadService.deleteThread(threadId);
        toast.success("Đã từ chối và xóa bài viết!");
        setPendingThreads(prev => prev.filter(t => t.id !== threadId));
      } catch (error) {
        console.error("Error deleting thread:", error);
        toast.error("Xóa bài viết thất bại");
      }
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
          <h1 className="text-2xl font-bold text-foreground tracking-tight flex items-center gap-2">
            <ShieldCheck className="w-7 h-7 text-primary" />
            Kiểm duyệt bài viết
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Duyệt hoặc từ chối các bài đăng mới từ học viên và giảng viên trước khi hiển thị trên cộng đồng.
          </p>
        </div>
        <GhostButton onClick={fetchPendingThreads} className="h-10 font-bold shrink-0 border border-border bg-white text-foreground hover:bg-muted">
          Làm mới danh sách
        </GhostButton>
      </div>

      {/* Stats Widget */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-info/20 shadow-sm">
          <CardContent className="p-5 flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-sm font-semibold text-info/80">Bài viết chờ duyệt</p>
              <h3 className="text-3xl font-extrabold text-info">{pendingThreads.length}</h3>
            </div>
            <div className="w-12 h-12 rounded-full bg-info/10 text-info/10 flex items-center justify-center text-info">
              <MessageSquare className="w-6 h-6" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Pending List Area */}
      <Card className="border-border shadow-sm">
        <CardHeader className="border-b bg-muted py-4">
          <CardTitle className="text-lg font-bold text-foreground">
            Danh sách chờ kiểm duyệt
          </CardTitle>
          <CardDescription>
            Tất cả bài viết được đăng lên mặc định sẽ ở trạng thái chờ duyệt.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-20 gap-4 text-muted-foreground">
              <div className="animate-spin rounded-full h-9 w-9 border-b-2 border-primary"></div>
              <p className="text-sm font-medium">Đang tải dữ liệu kiểm duyệt...</p>
            </div>
          ) : pendingThreads.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center gap-4">
              <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center text-success border border-success/20 shadow-sm">
                <ShieldCheck className="w-8 h-8" />
              </div>
              <div className="space-y-1">
                <h3 className="text-lg font-bold text-foreground">Hệ thống sạch bài viết chờ duyệt</h3>
                <p className="text-sm text-muted-foreground max-w-sm px-4">
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
                      className="p-5 flex flex-col md:flex-row md:items-start gap-4 hover:bg-muted/30 transition-colors"
                    >
                      {/* Left: Author Info */}
                      <div className="md:w-56 shrink-0 flex flex-row md:flex-col items-center md:items-start gap-3 border-b md:border-b-0 pb-3 md:pb-0 border-border">
                        <Avatar className="w-11 h-11 border border-border shadow-sm shrink-0">
                          <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${thread.account?.email || 'default'}`} />
                          <AvatarFallback className="bg-primary/10 text-primary font-bold">
                            {thread.account?.fullName?.substring(0, 2).toUpperCase() || "UN"}
                          </AvatarFallback>
                        </Avatar>
                        <div className="min-w-0 md:space-y-1">
                          <p className="font-bold text-sm text-foreground truncate" title={thread.account?.fullName}>
                            {thread.account?.fullName || "Ẩn danh"}
                          </p>
                          <p className="text-xs text-muted-foreground truncate" title={thread.account?.email}>
                            {thread.account?.email}
                          </p>
                          <div className="hidden md:flex items-center gap-1.5 text-[11px] text-muted-foreground mt-1">
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
                          <span className="text-[11px] text-muted-foreground md:hidden flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {formatDate(thread.createdAt)}
                          </span>
                        </div>

                        {/* Content text */}
                        <div className="relative text-sm text-muted-foreground leading-relaxed font-normal">
                          <div className={(!isExpanded && hasLongContent) ? "line-clamp-4 max-h-[120px] overflow-hidden" : ""}>
                            <RenderContent text={thread.content} />
                          </div>
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
                                className="group relative w-20 h-20 rounded-md overflow-hidden border border-border shadow-sm bg-muted transition-all hover:scale-105"
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
                        <SimpleButton
                          size="sm"
                          className="w-full md:w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold h-9 gap-1.5 shadow-md transition-all border-none"
                          onClick={() => openConfirm(thread.id, "approve")}
                        >
                          <CheckCircle2 className="w-4 h-4" /> Duyệt bài
                        </SimpleButton>
                        <GhostButton
                          size="sm"
                          className="w-full md:w-full border border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700 font-bold h-9 gap-1.5 transition-all bg-white"
                          onClick={() => openConfirm(thread.id, "delete")}
                        >
                          <Trash2 className="w-4 h-4" /> Từ chối
                        </GhostButton>
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Confirmation Alert Dialog */}
      <AlertDialog open={confirmState.isOpen} onOpenChange={(open) => setConfirmState(prev => ({ ...prev, isOpen: open }))}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <div className="flex items-center gap-2">
              <AlertCircle className={`w-5 h-5 ${confirmState.type === "approve" ? "text-emerald-500" : "text-rose-500"}`} />
              <AlertDialogTitle className="text-lg font-bold">{confirmState.title}</AlertDialogTitle>
            </div>
            <AlertDialogDescription className="mt-2 text-sm text-muted-foreground leading-relaxed">
              {confirmState.description}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="mt-4">
            <AlertDialogCancel className="h-9 font-semibold">Hủy</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmAction}
              className={`h-9 font-bold text-white transition-all ${
                confirmState.type === "approve"
                  ? "bg-emerald-600 hover:bg-emerald-700"
                  : "bg-rose-600 hover:bg-rose-700"
              }`}
            >
              Xác nhận
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
