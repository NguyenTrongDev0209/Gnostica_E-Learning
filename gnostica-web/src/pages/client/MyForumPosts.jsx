import React, { useState, useEffect } from 'react';
import threadService from '@/services/forum/threadService';
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

import useMyForumPosts from "@/hooks/forum/useMyForumPosts";

const MyForumPosts = () => {
    const navigate = useNavigate();
    
    const {
        currentUser,
        userStats,
        isLoading,
        currentPosts,
        totalPages,
        currentPage,
        setCurrentPage,
        threadToDelete,
        setThreadToDelete,
        handleDelete
    } = useMyForumPosts(5);

    const breadcrumbItems = [
        { component: <Link to="/">Trang chủ</Link> },
        { component: <Link to="/forum">Diễn đàn</Link> },
        { label: "Bài viết của tôi", isLast: true }
    ];

    return (
        <div className="min-h-screen bg-muted pb-16 pt-8">
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
                                <h3 className="font-bold text-lg text-foreground mb-1">{currentUser?.fullName || "Tài khoản của tôi"}</h3>
                                <p className="text-sm text-muted-foreground mb-6">{currentUser?.email}</p>

                                <div className="grid grid-cols-2 gap-4 pt-6 border-t border-border">
                                    <div className="flex flex-col items-center">
                                        <div className="w-10 h-10 bg-blue-50 text-info rounded-full flex items-center justify-center mb-2">
                                            <FileText className="w-5 h-5" />
                                        </div>
                                        <span className="text-xl font-bold text-foreground">{userStats.threadCount || 0}</span>
                                        <span className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Bài viết</span>
                                    </div>
                                    <div className="flex flex-col items-center">
                                        <div className="w-10 h-10 bg-orange-50 text-warning rounded-full flex items-center justify-center mb-2">
                                            <ThumbsUp className="w-5 h-5" />
                                        </div>
                                        <span className="text-xl font-bold text-foreground">{userStats.totalLikes || 0}</span>
                                        <span className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Lượt thích</span>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="bg-white shadow-sm border-border">
                            <CardContent className="p-5">
                                <h4 className="font-bold text-sm text-foreground mb-4 flex items-center gap-2">
                                    <LayoutGrid className="w-4 h-4 text-primary" />
                                    Truy cập nhanh
                                </h4>
                                <div className="flex flex-col gap-2">
                                    <Link to="/forum">
                                        <Button variant="ghost" className="w-full justify-start text-sm hover:bg-muted gap-3">
                                            <ChevronLeft className="w-4 h-4" /> Toàn bộ diễn đàn
                                        </Button>
                                    </Link>
                                    <Link to="/account">
                                        <Button variant="ghost" className="w-full justify-start text-sm hover:bg-muted gap-3">
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
                                <p className="mt-4 text-muted-foreground">Đang tải bài viết của bạn...</p>
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
                                            className="absolute top-4 right-4 p-2 bg-red-50 text-error rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-error/10 text-error hover:text-white shadow-sm z-10"
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
                                                className="bg-error/10 text-error hover:bg-error/10 text-error font-bold"
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
                                <div className="w-16 h-16 bg-secondary rounded-full flex items-center justify-center mb-4">
                                    <LayoutGrid className="w-8 h-8 text-muted-foreground" />
                                </div>
                                <h3 className="text-lg font-bold text-foreground mb-1">Bạn chưa có bài viết nào</h3>
                                <p className="text-muted-foreground text-sm max-w-sm">
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
