import React, { useState, useEffect } from 'react';
import axios from 'axios';
import SectionContainer, { PageHeader, AppBreadcrumb } from '@/components/common/AppSection';
import { ForumPostCard } from "@/components/common/AppCard";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ThumbsUp, FileText, LayoutGrid, Trash2 } from 'lucide-react';

import { useNavigate, Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import {
    Pagination,
    PaginationContent,
    PaginationEllipsis,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
} from "@/components/ui/pagination";
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
import { toast } from "sonner";

const MyForumPosts = () => {
    const navigate = useNavigate();
    const [threads, setThreads] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(0);
    const [userStats, setUserStats] = useState({ threadCount: 0, totalLikes: 0 });
    const [currentUser, setCurrentUser] = useState(null);
    const [threadToDelete, setThreadToDelete] = useState(null);

    useEffect(() => {
        const userData = JSON.parse(localStorage.getItem('user'));
        setCurrentUser(userData);
    }, []);

    useEffect(() => {
        const fetchMyThreads = async () => {
            if (!currentUser?.email) return;

            setIsLoading(true);
            try {
                // Fetch all threads to handle pagination on frontend like ForumPage.jsx
                const res = await axios.get(`http://localhost:8080/api/threads/me?email=${currentUser.email}&page=0&size=1000`);
                setThreads(res.data.content);
            } catch (error) {
                console.error("Failed to fetch your threads", error);
            } finally {
                setIsLoading(false);
            }
        };

        const fetchMyStats = async () => {
             if (!currentUser?.email) return;
             try {
                const res = await axios.get(`http://localhost:8080/api/threads/me/stats?email=${currentUser.email}`);
                setUserStats(res.data);
             } catch (error) {
                console.error("Failed to fetch statistics", error);
             }
        };

        fetchMyThreads();
        fetchMyStats();
    }, [currentUser]); // Remove currentPage to handle it locally

    const handleDelete = async () => {
        if (!threadToDelete) return;

        try {
            await axios.delete(`http://localhost:8080/api/threads/${threadToDelete}`);
            // Xóa khỏi danh sách cục bộ
            setThreads(prev => prev.filter(t => t.id !== threadToDelete));
            // Cập nhật lại stats
            setUserStats(prev => ({
                ...prev,
                threadCount: Math.max(0, prev.threadCount - 1)
            }));
            toast.success("Đã xóa bài viết thành công!");
        } catch (error) {
            console.error("Failed to delete thread", error);
            toast.error("Có lỗi xảy ra khi xóa bài viết.");
        } finally {
            setThreadToDelete(null);
        }
    };

    const mappedPosts = threads.map(thread => ({
        id: thread.id,
        title: thread.content.substring(0, 100) + (thread.content.length > 100 ? "..." : ""),
        content: thread.content,
        author: {
            name: thread.account?.fullName || "Ẩn danh",
            avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${thread.account?.email || 'default'}`,
            status: "online"
        },
        category: thread.category?.name || "Thảo luận",
        tags: [],
        createdAt: new Date(thread.createdAt).toLocaleDateString('vi-VN', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        }),
        stats: {
            likes: thread.likes || 0,
            views: thread.views || 0,
            replies: thread.commentCount || 0
        },
        images: thread.images || [],
        isHot: (thread.views || 0) > 50,
        status: thread.status
    }));

    const postsPerPage = 5;
    const totalPages = Math.ceil(mappedPosts.length / postsPerPage);
    const currentPosts = mappedPosts.slice(currentPage * postsPerPage, (currentPage + 1) * postsPerPage);

    // Reset page if data changes
    useEffect(() => {
        setCurrentPage(0);
    }, [threads.length]);

    const breadcrumbItems = [
        { component: <Link to="/">Trang chủ</Link> },
        { component: <Link to="/forum">Diễn đàn</Link> },
        { label: "Bài viết của tôi", isLast: true }
    ];

    return (
        <div className="min-h-screen bg-slate-50/50 pb-16 pt-8">
            <SectionContainer containerClassName="w-full">
                <AppBreadcrumb items={breadcrumbItems} />

                <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 sm:mb-12 gap-4">
                    <PageHeader
                        title="Bài viết"
                        highlightedTitle="của tôi"
                        description="Quản lý và xem lại tất cả các nội dung bạn đã chia sẻ trên diễn đàn."
                        className="mb-0 sm:mb-0"
                    />
                    <Link to="/forum">
                        <Button variant="outline" className="gap-2">
                           <ChevronLeft className="w-4 h-4" /> Quay lại diễn đàn
                        </Button>
                    </Link>
                </div>

                <div className="flex flex-col lg:flex-row gap-8">
                    {/* Sidebar Stats */}
                    <div className="w-full lg:w-72 xl:w-80 flex flex-col gap-6 shrink-0 order-2 lg:order-1">
                        <Card className="bg-white shadow-sm border-border overflow-hidden">
                            <div className="h-24 bg-button-gradient" />
                            <CardContent className="p-5 -mt-12 text-center">
                                <Avatar className="w-20 h-20 mx-auto border-4 border-white shadow-md mb-4 bg-white">
                                    <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${currentUser?.email || 'default'}`} />
                                    <AvatarFallback className="bg-primary/10 text-primary text-xl font-bold">
                                        {currentUser?.fullName?.substring(0, 2).toUpperCase() || "U"}
                                    </AvatarFallback>
                                </Avatar>
                                <h3 className="font-bold text-lg text-slate-800 mb-1">{currentUser?.fullName || "Tài khoản của tôi"}</h3>
                                <p className="text-sm text-muted-foreground mb-6">{currentUser?.email}</p>

                                <div className="grid grid-cols-2 gap-4 pt-6 border-t border-slate-100">
                                    <div className="flex flex-col items-center">
                                        <div className="w-10 h-10 bg-blue-50 text-blue-500 rounded-full flex items-center justify-center mb-2">
                                            <FileText className="w-5 h-5" />
                                        </div>
                                        <span className="text-xl font-bold text-slate-800">{userStats.threadCount || 0}</span>
                                        <span className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Bài viết</span>
                                    </div>
                                    <div className="flex flex-col items-center">
                                        <div className="w-10 h-10 bg-orange-50 text-orange-500 rounded-full flex items-center justify-center mb-2">
                                            <ThumbsUp className="w-5 h-5" />
                                        </div>
                                        <span className="text-xl font-bold text-slate-800">{userStats.totalLikes || 0}</span>
                                        <span className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Lượt thích</span>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="bg-white shadow-sm border-border">
                            <CardContent className="p-5">
                                <h4 className="font-bold text-sm text-slate-700 mb-4 flex items-center gap-2">
                                    <LayoutGrid className="w-4 h-4 text-primary" />
                                    Truy cập nhanh
                                </h4>
                                <div className="flex flex-col gap-2">
                                    <Link to="/forum">
                                        <Button variant="ghost" className="w-full justify-start text-sm hover:bg-slate-50 gap-3">
                                            <ChevronLeft className="w-4 h-4" /> Toàn bộ diễn đàn
                                        </Button>
                                    </Link>
                                    <Link to="/account">
                                        <Button variant="ghost" className="w-full justify-start text-sm hover:bg-slate-50 gap-3">
                                            Tài khoản của tôi
                                        </Button>
                                    </Link>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Main Content */}
                    <div className="flex-1 order-1 lg:order-2">


                        {/* Post List */}
                        {isLoading ? (
                            <div className="flex flex-col items-center justify-center py-16 bg-white rounded-lg border">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                                <p className="mt-4 text-slate-500">Đang tải bài viết của bạn...</p>
                            </div>
                        ) : currentPosts.length > 0 ? (
                            <div className="flex flex-col gap-4">
                                {currentPosts.map((post) => (
                                    <div key={post.id} className="relative group">
                                        <ForumPostCard post={post} />
                                        <button
                                            onClick={(e) => {
                                                e.preventDefault();
                                                e.stopPropagation();
                                                setThreadToDelete(post.id);
                                            }}
                                            className="absolute top-4 right-4 p-2 bg-red-50 text-red-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-500 hover:text-white shadow-sm z-10"
                                            title="Xóa bài viết"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                ))}

                                {/* Deletion Confirmation Dialog */}
                                <AlertDialog open={!!threadToDelete} onOpenChange={(open) => !open && setThreadToDelete(null)}>
                                    <AlertDialogContent>
                                        <AlertDialogHeader>
                                            <AlertDialogTitle>Xác nhận xóa bài viết?</AlertDialogTitle>
                                            <AlertDialogDescription>
                                                Hành động này không thể hoàn tác. Bài viết, hình ảnh, lượt thích và toàn bộ bình luận liên quan sẽ bị xóa vĩnh viễn.
                                            </AlertDialogDescription>
                                        </AlertDialogHeader>
                                        <AlertDialogFooter>
                                            <AlertDialogCancel>Hủy</AlertDialogCancel>
                                            <AlertDialogAction 
                                                onClick={handleDelete}
                                                className="bg-red-500 hover:bg-red-600 font-bold"
                                            >
                                                Tiếp tục xóa
                                            </AlertDialogAction>
                                        </AlertDialogFooter>
                                    </AlertDialogContent>
                                </AlertDialog>

                                {/* Pagination Component */}
                                {totalPages > 1 && (
                                    <div className="flex justify-center mt-8 mb-4">
                                        <Pagination>
                                            <PaginationContent>
                                                <PaginationItem>
                                                    <PaginationPrevious 
                                                        onClick={() => setCurrentPage(prev => Math.max(0, prev - 1))}
                                                        className={currentPage === 0 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                                                    />
                                                </PaginationItem>

                                                {[...Array(totalPages)].map((_, i) => (
                                                    <PaginationItem key={i}>
                                                        <PaginationLink
                                                            onClick={() => setCurrentPage(i)}
                                                            isActive={currentPage === i}
                                                            className="cursor-pointer"
                                                        >
                                                            {i + 1}
                                                        </PaginationLink>
                                                    </PaginationItem>
                                                ))}

                                                <PaginationItem>
                                                    <PaginationNext 
                                                        onClick={() => setCurrentPage(prev => Math.min(totalPages - 1, prev + 1))}
                                                        className={currentPage === totalPages - 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                                                    />
                                                </PaginationItem>
                                            </PaginationContent>
                                        </Pagination>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center py-20 text-center bg-white rounded-lg border border-dashed border-border">
                                <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
                                    <LayoutGrid className="w-8 h-8 text-slate-400" />
                                </div>
                                <h3 className="text-lg font-bold text-slate-700 mb-1">Bạn chưa có bài viết nào</h3>
                                <p className="text-slate-500 text-sm max-w-sm">
                                    Hãy chia sẻ kiến thức hoặc đặt câu hỏi đầu tiên của bạn ngay hôm nay!
                                </p>
                                <Button
                                    className="mt-6 bg-button-gradient font-bold px-8"
                                    onClick={() => navigate('/forum/create')}
                                >
                                    + Tạo bài viết đầu tiên
                                </Button>
                            </div>
                        )}
                    </div>
                </div>
            </SectionContainer>
        </div>
    );
};

export default MyForumPosts;
