import React from 'react';
import PageContainer from "@/components/common/core/PageContainer";
import AppBreadcrumb from "@/components/common/micro/AppBreadcrumb";
import { ForumPostCard } from "@/components/common/composite/CourseCard";
import { ChevronLeft, ThumbsUp, LayoutGrid, Trash2, FileText } from 'lucide-react';
import { AppButton } from "@/components/common/micro/AppButton";
import { useNavigate, Link } from "react-router-dom";
import AppPagination from "@/components/common/micro/AppPagination";
import AppAlertDialog from "@/components/common/micro/AppAlertDialog";
import AppSkeleton from "@/components/common/micro/AppSkeleton";
import AppCard, { AppCardContent } from "@/components/common/micro/AppCard";
import AppAvatar from "@/components/common/micro/AppAvatar";
import { cn } from "@/lib/utils";
import useMyForumPosts from "@/hooks/forum/useMyForumPosts";

// ── MyForumSidebar ──
const MyForumSidebar = ({ currentUser, userStats, activeTab, setActiveTab }) => {
  return (
    <div className="w-full lg:w-72 xl:w-80 flex flex-col gap-6 shrink-0 order-2 lg:order-1">
      <AppCard appVariant="default" className="bg-white shadow-sm border-border overflow-hidden">
        <div className="h-24 bg-accent-gradient" />
        <AppCardContent className="p-5 -mt-12 text-center">
          <AppAvatar 
            className="w-20 h-20 mx-auto border-4 border-white shadow-md mb-4 bg-white"
            src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${currentUser?.email || 'default'}`}
            fallback={currentUser?.fullName?.substring(0, 2).toUpperCase() || "U"}
          />
          <h3 className="font-bold text-lg text-foreground mb-1">{currentUser?.fullName || "Tài khoản của tôi"}</h3>
          <p className="text-sm text-muted-foreground mb-6">{currentUser?.email}</p>

          <div className="grid grid-cols-2 gap-4 pt-6 border-t border-border">
            <div className="flex flex-col items-center">
              <div className="w-10 h-10 bg-info/10 text-info rounded-full flex items-center justify-center mb-2">
                <FileText className="w-5 h-5" />
              </div>
              <span className="text-xl font-bold text-foreground">{userStats?.threadCount || 0}</span>
              <span className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Bài viết</span>
            </div>
            <div className="flex flex-col items-center">
              <div className="w-10 h-10 bg-warning/10 text-warning rounded-full flex items-center justify-center mb-2">
                <ThumbsUp className="w-5 h-5" />
              </div>
              <span className="text-xl font-bold text-foreground">{userStats?.totalLikes || 0}</span>
              <span className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Lượt thích</span>
            </div>
          </div>
        </AppCardContent>
      </AppCard>

      <AppCard appVariant="default" className="bg-white shadow-sm border-border">
        <AppCardContent className="p-5">
          <h4 className="font-bold text-sm text-foreground mb-4 flex items-center gap-2">
            <LayoutGrid className="w-4 h-4 text-primary" />
            Truy cập nhanh
          </h4>
          <div className="flex flex-col gap-2">
            <AppButton appVariant="ghostMuted" variant="ghost"
              className={cn(
                "w-full justify-start text-sm gap-3 font-semibold",
                activeTab === 'my-posts' ? "bg-primary/10 text-primary hover:bg-primary/20" : "hover:bg-muted text-muted-foreground hover:text-foreground"
              )}
              onClick={() => setActiveTab('my-posts')}
            >
              <FileText className="w-4 h-4" />
              Bài viết của tôi
            </AppButton>
            <AppButton appVariant="ghostMuted" variant="ghost"
              className={cn(
                "w-full justify-start text-sm gap-3 font-semibold",
                activeTab === 'liked' ? "bg-primary/10 text-primary hover:bg-primary/20" : "hover:bg-muted text-muted-foreground hover:text-foreground"
              )}
              onClick={() => setActiveTab('liked')}
            >
              <ThumbsUp className="w-4 h-4" />
              Bài viết đã thích
            </AppButton>
            <Link to="/account" className="w-full">
              <AppButton appVariant="ghostMuted" variant="ghost" className="w-full justify-start text-sm hover:bg-muted gap-3 text-muted-foreground hover:text-foreground">
                Tài khoản của tôi
              </AppButton>
            </Link>
          </div>
        </AppCardContent>
      </AppCard>
    </div>
  );
};


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
                        title={<>Bài viết <span className="text-accent-highlight">{activeTab === 'liked' ? "đã thích" : "của tôi"}</span></>}
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
                                    <AppSkeleton key={i} className="h-40 w-full rounded-xl bg-white" />
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
                                <AppAlertDialog 
                                    open={!!threadToDelete} 
                                    onOpenChange={(open) => !open && setThreadToDelete(null)}
                                    title="Xác nhận xóa bài viết?"
                                    description="Hành động này không thể hoàn tác. Bài viết, hình ảnh, lượt thích và toàn bộ bình luận liên quan sẽ bị xóa vĩnh viễn."
                                    onConfirm={handleDelete}
                                    variant="destructive"
                                    confirmText="Tiếp tục xóa"
                                />

                                {/* Pagination Component */}
                                {totalPages > 1 && (
                                    <div className="flex justify-center mt-8 mb-4">
                                        <AppPagination 
                                            currentPage={currentPage + 1} 
                                            totalPages={totalPages} 
                                            onPageChange={(page) => setCurrentPage(page - 1)} 
                                        />
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
