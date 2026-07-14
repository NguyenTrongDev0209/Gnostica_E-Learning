import React from 'react';
import PageContainer from "@/components/common/core/PageContainer";
import AppBreadcrumb from "@/components/common/micro/AppBreadcrumb";
import { ForumPostCard } from "@/components/common/composite/CourseCard";
import { ChevronLeft, ThumbsUp, LayoutGrid, Trash2 } from 'lucide-react';
import { AppButton } from "@/components/common/micro/AppButton";
import { useNavigate, Link } from "react-router-dom";
import {
    Pagination,
    PaginationContent,
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
import { Skeleton } from "@/components/ui/skeleton";

import useMyForumPosts from "@/hooks/forum/useMyForumPosts";
import MyForumSidebar from './components/MyForumSidebar';

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
        handleDelete,
        activeTab,
        setActiveTab
    } = useMyForumPosts(5);

    const breadcrumbItems = [
        { component: <Link to="/">Trang chủ</Link> },
        { component: <Link to="/forum">Diễn đàn</Link> },
        { label: activeTab === 'liked' ? "Bài viết đã thích" : "Bài viết của tôi", isLast: true }
    ];

    return (
        <div className="min-h-screen bg-muted pb-16 pt-8">
            <PageContainer.Section className="w-full app-container">
                <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 sm:mb-12 gap-4">
                    <PageContainer.Header
                        title={<>Bài viết <span className="bg-accent-gradient bg-clip-text text-transparent italic">{activeTab === 'liked' ? "đã thích" : "của tôi"}</span></>}
                        description={activeTab === 'liked' ? "Xem lại danh sách tất cả các bài viết bạn đã bày tỏ thái độ yêu thích." : "Quản lý và xem lại tất cả các nội dung bạn đã chia sẻ trên diễn đàn."}
                        className="mb-0 sm:mb-0"
                    >
                        <AppBreadcrumb paths={breadcrumbItems} />
                    </PageContainer.Header>
                    <Link to="/forum">
                        <AppButton appVariant="ghostMuted" variant="ghost" className="gap-2 border border-border">
                           <ChevronLeft className="w-4 h-4" /> Quay lại diễn đàn
                        </AppButton>
                    </Link>
                </div>

                <div className="flex flex-col lg:flex-row gap-8">
                    {/* Sidebar Stats */}
                    <MyForumSidebar
                        currentUser={currentUser}
                        userStats={userStats}
                        activeTab={activeTab}
                        setActiveTab={setActiveTab}
                    />

                    {/* Main Content */}
                    <div className="flex-1 order-1 lg:order-2">

                        {/* Post List */}
                        {isLoading ? (
                            <div className="flex flex-col gap-4">
                                {[1, 2, 3].map(i => (
                                    <Skeleton key={i} className="h-40 w-full rounded-xl bg-white" />
                                ))}
                            </div>
                        ) : currentPosts.length > 0 ? (
                            <div className="flex flex-col gap-4">
                                {currentPosts.map((post) => (
                                    <div key={post.id} className="relative group">
                                        <ForumPostCard post={post} />
                                        {activeTab === 'my-posts' && (
                                            <button
                                                onClick={(e) => {
                                                    e.preventDefault();
                                                    e.stopPropagation();
                                                    setThreadToDelete(post.id);
                                                }}
                                                className="absolute top-4 right-4 p-2 bg-error/10 text-error rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-error/20 hover:text-error-foreground shadow-sm z-10"
                                                title="Xóa bài viết"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        )}
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
                                                    <AppButton appVariant="ghostMuted" variant="ghost" 
                                                        onClick={() => setCurrentPage(prev => Math.max(0, prev - 1))}
                                                        className={currentPage === 0 ? "pointer-events-none opacity-50 h-9" : "cursor-pointer h-9"}
                                                    >
                                                        <PaginationPrevious className="p-0 hover:bg-transparent" />
                                                    </AppButton>
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
                                                    <AppButton appVariant="ghostMuted" variant="ghost" 
                                                        onClick={() => setCurrentPage(prev => Math.max(totalPages - 1, prev + 1))}
                                                        className={currentPage === totalPages - 1 ? "pointer-events-none opacity-50 h-9" : "cursor-pointer h-9"}
                                                    >
                                                        <PaginationNext className="p-0 hover:bg-transparent" />
                                                    </AppButton>
                                                </PaginationItem>
                                            </PaginationContent>
                                        </Pagination>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center py-20 text-center bg-white rounded-lg border border-dashed border-border">
                                <div className="w-16 h-16 bg-secondary rounded-full flex items-center justify-center mb-4">
                                    {activeTab === 'liked' ? <ThumbsUp className="w-8 h-8 text-muted-foreground" /> : <LayoutGrid className="w-8 h-8 text-muted-foreground" />}
                                </div>
                                <h3 className="text-lg font-bold text-foreground mb-1">
                                    {activeTab === 'liked' ? "Bạn chưa thích bài viết nào" : "Bạn chưa có bài viết nào"}
                                </h3>
                                <p className="text-muted-foreground text-sm max-w-sm">
                                    {activeTab === 'liked'
                                        ? "Hãy khám phá diễn đàn và bày tỏ sự ủng hộ bằng cách thích các bài viết hữu ích nhé!"
                                        : "Hãy chia sẻ kiến thức hoặc đặt câu hỏi đầu tiên của bạn ngay hôm nay!"}
                                </p>
                                <AppButton appVariant="gradient"
                                    className="mt-6 px-8"
                                    onClick={() => navigate(activeTab === 'liked' ? '/forum' : '/forum/create')}
                                >
                                    {activeTab === 'liked' ? "Đi tới diễn đàn" : "+ Tạo bài viết đầu tiên"}
                                </AppButton>
                            </div>
                        )}
                    </div>
                </div>
            </PageContainer.Section>
        </div>
    );
};

export default MyForumPosts;
