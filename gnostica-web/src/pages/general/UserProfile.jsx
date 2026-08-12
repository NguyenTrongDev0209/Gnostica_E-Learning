import React, { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import PageContainer from "@/components/common/core/PageContainer";
import { Card, CardContent } from "@/components/common/micro/AppCard";
import { Avatar, AvatarImage, AvatarFallback, AvatarBadge } from "@/components/common/micro/AppAvatar";
import Badge from "@/components/common/micro/AppBadge";
import { Button } from "@/components/common/micro/AppButton";
import Separator from "@/components/common/micro/AppSeparator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/common/micro/AppTabs";
import CourseCard, { ForumPostCard } from "@/components/common/composite/CourseCard";
import {
  MessageSquare, ThumbsUp, Eye, Clock, MapPin, Link as LinkIcon,
  Calendar, Star, Award, BookOpen, Flame, UserPlus, Send, Users, Sparkles, Loader2
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
const StatBlock = ({ icon: iconComp, value, label, color = "text-primary" }) => {
  const Icon = iconComp;
  return (
    <div className="flex flex-col items-center gap-1 py-3 px-4">
      <Icon className={`w-5 h-5 ${color} mb-0.5`} />
      <span className="text-xl font-bold text-foreground">{value}</span>
      <span className="text-xs text-muted-foreground font-medium">{label}</span>
    </div>
  );
};
import { useQuery } from '@tanstack/react-query';
import instructorService from '@/services/instructor/instructorService';
import followingService from '@/services/instructor/followingService';
import { useCreateConversation } from '@/hooks/messaging/useCreateConversation';
import { toast } from 'sonner';
import PersonalizationModal from '@/components/common/composite/PersonalizationModal';

// ── Mock Data ──────────────────────────────────────────────
const MOCK_USER = {
  id: 1,
  name: "Nguyễn Văn A",
  username: "nguyenvana",
  avatar: "https://i.pravatar.cc/150?u=a042581f4e29026024d",
  coverColor: "from-primary/80 via-primary to-primary/90",
  status: "online",
  bio: "Frontend Developer đam mê ReactJS và UI/UX. Mình thích chia sẻ kiến thức với cộng đồng và học hỏi từ mọi người.",
  location: "Hồ Chí Minh, Việt Nam",
  website: "https://github.com/nguyenvana",
  joinedAt: "Tháng 1, 2025",
  role: "Member",
  stats: {
    posts: 24,
    likes: 186,
    views: 3420,
    comments: 95,
  },
  badges: [
    { label: "Người mới tích cực", color: "bg-info/10 text-info text-info" },
    { label: "Hot Poster", color: "bg-warning/10 text-warning text-warning" },
  ],
};

const MOCK_POSTS = [
  {
    id: 1,
    title: "Lộ trình học ReactJS cơ bản cho người mới bắt đầu năm 2026",
    content: "Chào mọi người, mình mới bắt đầu tìm hiểu về lập trình Front-end và đặc biệt quan tâm tới ReactJS...",
    author: { name: "Nguyễn Văn A", avatar: "https://i.pravatar.cc/150?u=a042581f4e29026024d", status: "online" },
    category: "Hỏi đáp lập trình",
    tags: ["ReactJS", "Frontend", "Beginner"],
    createdAt: "2 giờ trước",
    stats: { replies: 15, views: 234, likes: 45 },
    isHot: true,
  },
  {
    id: 4,
    title: "Làm sao để tối ưu hóa performance trong ứng dụng NextJS?",
    content: "Dạo gần đây ứng dụng Next.js của mình load khá chậm ở các trang SSR...",
    author: { name: "Nguyễn Văn A", avatar: "https://i.pravatar.cc/150?u=a042581f4e29026024d", status: "online" },
    category: "Hỏi đáp lập trình",
    tags: ["NextJS", "Performance", "SSR"],
    createdAt: "2 ngày trước",
    stats: { replies: 12, views: 345, likes: 56 },
    isHot: false,
  },
];

const MOCK_LIKED_POSTS = [
  {
    id: 2,
    title: "Review khóa học Python Data Science tại TechOne",
    content: "Mình vừa hoàn thành xong module 1 của khóa học Python Data Science...",
    author: { name: "Trần Thị B", avatar: "https://i.pravatar.cc/150?u=a042581f4e29026704d", status: "offline" },
    category: "Chia sẻ kinh nghiệm",
    tags: ["Python", "Data Science", "Review"],
    createdAt: "5 giờ trước",
    stats: { replies: 8, views: 156, likes: 23 },
    isHot: false,
  },
];

const UserProfile = () => {
  const { id } = useParams();
  const [following, setFollowing] = useState(false);
  const [followLoading, setFollowLoading] = useState(false);
  const [isPersonalizationOpen, setIsPersonalizationOpen] = useState(false);
  const [isCoursePickerOpen, setIsCoursePickerOpen] = useState(false);
  const navigate = useNavigate();

  let currentUser = null;
  try {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      currentUser = JSON.parse(userStr);
    }
  } catch (error) {
    console.error("Failed to parse user from localStorage:", error);
  }

  const isOwnProfile = !!(currentUser && (id === String(currentUser.id) || !id));

  // Check following status
  useEffect(() => {
    const checkStatus = async () => {
      if (currentUser && id && !isOwnProfile) {
        try {
          const res = await followingService.checkFollowing(id);
          setFollowing(res?.isFollowing || false);
        } catch (_err) {
          console.error("Lỗi kiểm tra trạng thái theo dõi", _err);
        }
      }
    };
    checkStatus();
  }, [id, currentUser, isOwnProfile]);

  const handleToggleFollow = async () => {
    if (!currentUser) {
      toast.error("Vui lòng đăng nhập để theo dõi giảng viên!");
      return;
    }
    try {
      setFollowLoading(true);
      const res = await followingService.toggleFollow(id);
      setFollowing(res?.isFollowing || false);
      toast.success(res?.message || "Đã cập nhật trạng thái theo dõi!");
    } catch {
      toast.error("Không thể thực hiện thao tác này!");
    } finally {
      setFollowLoading(false);
    }
  };


  const { data: fetchedProfile, isLoading: loadingProfile } = useQuery({
    queryKey: ['instructor-profile', id],
    queryFn: () => instructorService.getInstructorProfile(id),
    enabled: !!id && !isOwnProfile,
    retry: false
  });

  const { data: fetchedCourses, isLoading: loadingCourses } = useQuery({
    queryKey: ['instructor-courses', id],
    queryFn: () => instructorService.getInstructorCourses(id),
    enabled: !!id && !isOwnProfile,
    retry: false
  });

  const user = isOwnProfile 
    ? { ...MOCK_USER, ...currentUser, name: currentUser.fullName, role: currentUser.role }
    : fetchedProfile 
      ? {
          ...MOCK_USER,
          id: fetchedProfile.id,
          name: fetchedProfile.name || fetchedProfile.fullName,
          avatar: fetchedProfile.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(fetchedProfile.name || fetchedProfile.fullName)}&background=random&color=fff`,
          email: fetchedProfile.email,
          role: fetchedProfile.role || "INSTRUCTOR",
          bio: fetchedProfile.bio || "",
          title: fetchedProfile.title || "",
          website: fetchedProfile.website || "",
          linkedin: fetchedProfile.linkedin || "",
          stats: {
            ...MOCK_USER.stats,
            courses: fetchedProfile.coursesCount || 0,
            students: fetchedProfile.studentsCount || 0,
          }
        }
      : MOCK_USER;

  const instructorCourses = fetchedCourses || [];
  const isInstructor = (user.role || '').toUpperCase() === 'INSTRUCTOR';
  const loading = loadingProfile;

  const { createForStudent, isCreatingStudent } = useCreateConversation();

  const openConversationForCourse = async (courseId) => {
    if (!courseId || isCreatingStudent) return;

    try {
      const conversation = await createForStudent(courseId);
      if (conversation?.id) {
        setIsCoursePickerOpen(false);
        navigate(`/account/messages/${conversation.id}`);
      }
    } catch (err) {
      const message =
        err?.response?.data?.message ||
        err?.response?.data?.data?.message ||
        "Bạn cần đăng ký khóa học này trước khi có thể nhắn tin với giảng viên.";
      toast.error(message);
    }
  };

  const handleMessageInstructor = async () => {
    if (!currentUser) {
      toast.error("Vui lòng đăng nhập để nhắn tin!");
      return;
    }

    if (!isInstructor) {
      toast.error("Chỉ có thể nhắn tin với giảng viên.");
      return;
    }

    if (!instructorCourses || instructorCourses.length === 0) {
      toast.error("Giảng viên này chưa có khóa học đã xuất bản.");
      return;
    }

    if (instructorCourses.length === 1) {
      await openConversationForCourse(instructorCourses[0].id);
      return;
    }

    setIsCoursePickerOpen(true);
  };

  const handleBecomeInstructor = async () => {
    navigate('/apply-instructor');
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">�ang t?i h? so...</div>;
  }

  return (
    <div className="min-h-screen bg-muted pb-16">

      {/* Cover Banner */}
      <div className={`w-full h-40 sm:h-52 bg-gradient-to-r ${user?.coverColor || "from-violet-600 via-purple-600 to-indigo-600"} relative`}>
        <div className="absolute inset-0 opacity-20 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC40Ij48cGF0aCBkPSJNMzYgMzRjMC0yLjIgMS44LTQgNC00czQgMS44IDQgNC0xLjggNC00IDQtNC0xLjgtNC00eiIvPjwvZz48L2c+PC9zdmc+')] bg-repeat" />
      </div>

      <PageContainer.Section className="w-full app-container">
        {/* Profile Header */}
        <div className="relative -mt-16 sm:-mt-20 mb-6">
          <Card className="bg-white border-border shadow-sm">
            <CardContent className="p-5 sm:p-7">
              <div className="flex flex-col sm:flex-row sm:items-end gap-4">
                {/* Avatar */}
                <div className="shrink-0 -mt-12 sm:-mt-16">
                  <Avatar className="w-24 h-24 sm:w-28 sm:h-28 ring-4 ring-white shadow-lg">
                    <AvatarImage src={user?.avatar} alt={user?.name || "Giảng viên"} />
                    <AvatarFallback className="bg-primary/10 text-primary font-bold text-2xl">
                      {(user?.name || "GV").substring(0, 2).toUpperCase()}
                    </AvatarFallback>
                    {user?.status === 'online' && (
                      <AvatarBadge className="bg-success/10 text-success border-[3px] border-white ring-0 w-5 h-5" />
                    )}
                  </Avatar>
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 flex-wrap">
                    <div>
                      <h1 className="text-2xl font-bold text-foreground leading-tight">{user?.name || "Giảng viên"}</h1>
                      <p className="text-sm text-muted-foreground font-medium">@{user?.username || (user?.email ? user.email.split('@')[0] : "giangvien")}</p>
                      {/* Badges */}
                      <div className="flex gap-2 flex-wrap mt-2">
                        <Badge className="bg-primary/10 text-primary border-none text-xs font-semibold">
                          {user?.role || "Giảng viên"}
                        </Badge>
                        {(user?.badges || []).map(b => (
                          <Badge key={b.label} className={`${b.color} border-none text-xs font-semibold`}>
                            {b.label}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 shrink-0">
                      {!isOwnProfile && (
                        <Button
                          variant="outline"
                          size="sm"
                          disabled={followLoading}
                          className={`gap-1.5 h-9 font-semibold transition-all ${following ? 'border-primary text-primary bg-primary/5' : ''}`}
                          onClick={handleToggleFollow}
                        >
                          {followLoading ? (
                            <div className="w-4 h-4 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
                          ) : (
                            <UserPlus className="w-4 h-4" />
                          )}
                          {following ? 'Đang theo dõi' : 'Theo dõi'}
                        </Button>
                      )}
                      {!isOwnProfile && isInstructor && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="gap-1.5 h-9"
                          onClick={handleMessageInstructor}
                          disabled={isCreatingStudent || loadingCourses}
                        >
                          {isCreatingStudent ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <Send className="w-4 h-4" />
                          )}
                          Nhắn tin
                        </Button>
                      )}

                      {isOwnProfile && !isInstructor && (
                        <Button
                          className="gap-1.5 h-9 font-bold bg-primary hover:bg-primary/90 border-none"
                          size="sm"
                          onClick={handleBecomeInstructor}
                        >
                          <Award className="w-4 h-4" /> Đăng ký giảng viên
                        </Button>
                      )}
                    </div>
                  </div>

                  {/* Bio & Meta */}
                  <p className="text-sm text-muted-foreground mt-3 leading-relaxed max-w-2xl">{user?.bio || ""}</p>
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-3 text-xs text-muted-foreground">
                    {user?.location && (
                      <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" />{user.location}</span>
                    )}
                    {user?.website && (
                      <a href={user.website} target="_blank" rel="noreferrer"
                        className="flex items-center gap-1 hover:text-primary transition-colors">
                        <LinkIcon className="w-3.5 h-3.5" />{user.website.replace('https://', '')}
                      </a>
                    )}
                    {user?.linkedin && (
                      <a href={user.linkedin} target="_blank" rel="noreferrer"
                        className="flex items-center gap-1 hover:text-primary transition-colors text-blue-600 font-semibold">
                        <LinkIcon className="w-3.5 h-3.5 text-blue-500" />LinkedIn
                      </a>
                    )}
                    <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" />Tham gia {user?.joinedAt || "Mới đây"}</span>
                  </div>
                </div>
              </div>

              <Separator className="mt-5 mb-0" />
              <div className="grid grid-cols-2 sm:grid-cols-4 divide-x divide-border">
                {isInstructor ? (
                  <>
                    <StatBlock icon={BookOpen} value={user.stats.courses || 0} label="Khóa học" />
                    <StatBlock icon={Users} value={user.stats.students || 0} label="Học viên" color="text-warning" />
                  </>
                ) : (
                  <>
                    <StatBlock icon={BookOpen} value={user.stats.posts} label="Bài đăng" />
                    <StatBlock icon={ThumbsUp} value={user.stats.likes} label="Lượt thích" color="text-warning" />
                  </>
                )}
                <StatBlock icon={Eye} value={user.stats.views} label="Lượt xem" color="text-info" />
                <StatBlock icon={MessageSquare} value={user.stats.comments} label="Bình luận" color="text-success" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Content Tabs */}
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Main Tabs */}
          <div className="flex-1 min-w-0">
            <Tabs defaultValue={isInstructor ? "courses" : "posts"}>
              <TabsList className="bg-white border border-border h-10 mb-5 rounded-lg flex gap-2">
                {isInstructor ? (
                  <TabsTrigger value="courses" className="text-sm font-medium gap-1.5 flex-1 md:flex-none">
                    <BookOpen className="w-4 h-4" /> Khóa học ({instructorCourses.length})
                  </TabsTrigger>
                ) : (
                  <TabsTrigger value="posts" className="text-sm font-medium gap-1.5 flex-1 md:flex-none">
                    <BookOpen className="w-4 h-4" /> Bài đăng ({MOCK_POSTS.length})
                  </TabsTrigger>
                )}
                <TabsTrigger value="liked" className="text-sm font-medium gap-1.5 flex-1 md:flex-none">
                  <ThumbsUp className="w-4 h-4" /> Đã thích ({MOCK_LIKED_POSTS.length})
                </TabsTrigger>
              </TabsList>

              {isInstructor ? (
                <TabsContent value="courses" className="mt-0">
                  {loadingCourses ? (
                    <div className="text-center py-10 text-muted-foreground">Đang tải danh sách khóa học...</div>
                  ) : instructorCourses.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      {instructorCourses.map(course => (
                        <CourseCard
                          key={course.id}
                          title={course.title}
                          image={course.thumbnail}
                          price={course.price}
                          category={course.category?.name}
                          students={course.enrollments ? course.enrollments.length : 0}
                          classes={course.modules ? course.modules.length : 0}
                          instructor={{ name: user.name, avatar: user.avatar, status: user.status }}
                          link={`/courses/${course.slug}`}
                        />
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-10 text-muted-foreground">Giảng viên này chưa có khóa học nào.</div>
                  )}
                </TabsContent>
              ) : (
                <TabsContent value="posts" className="mt-0">
                  <div className="flex flex-col gap-4">
                    {MOCK_POSTS.map(post => (
                      <ForumPostCard key={post.id} post={post} />
                    ))}
                  </div>
                </TabsContent>
              )}

              <TabsContent value="liked" className="mt-0">
                <div className="flex flex-col gap-4">
                  {MOCK_LIKED_POSTS.map(post => (
                    <ForumPostCard key={post.id} post={post} />
                  ))}
                </div>
              </TabsContent>
            </Tabs>
          </div>

          {/* Sidebar */}
          <div className="w-full lg:w-64 xl:w-72 shrink-0 flex flex-col gap-5">
            {/* Personalization Info */}
            {isOwnProfile && (
              <Card className="bg-white shadow-sm border-border">
                <CardContent className="p-5">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-warning" /> Cá nhân hóa
                    </h3>
                    <Button variant="ghost" size="icon" className="h-6 w-6 text-info" onClick={() => setIsPersonalizationOpen(true)}>
                      <LinkIcon className="w-3 h-3" />
                    </Button>
                  </div>
                  <div className="space-y-3">
                    <div>
                      <p className="text-[10px] uppercase font-bold text-muted-foreground mb-1">Trình độ</p>
                      <Badge variant="outline" className="bg-info-soft text-info-foreground border-info/20">
                        {user.level || "Chưa thiết lập"}
                      </Badge>
                    </div>
                    <div>
                      <p className="text-[10px] uppercase font-bold text-muted-foreground mb-1">Chuyên ngành</p>
                      <div className="flex flex-wrap gap-1">
                        {user.interests && user.interests.length > 0 ? (
                          user.interests.map(cat => (
                            <Badge key={cat.id} variant="secondary" className="text-[11px]">
                              {cat.name}
                            </Badge>
                          ))
                        ) : (
                          <span className="text-xs text-muted-foreground italic">Chưa thiết lập</span>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Achievements */}
            <Card className="bg-white shadow-sm border-border">
              <CardContent className="p-5">
                <h3 className="text-sm font-bold text-foreground mb-4 flex items-center gap-2">
                  <Award className="w-4 h-4 text-primary" /> Thành tích
                </h3>
                <div className="flex flex-col gap-3">
                  {[
                    { icon: Flame, label: "5 bài đang hot", color: "text-warning bg-warning-soft" },
                    { icon: Star, label: "Top 10 tuần này", color: "text-warning bg-warning-soft" },
                    { icon: MessageSquare, label: "50+ bình luận", color: "text-info bg-info-soft" },
                  ].map(({ icon: iconItem, label, color }) => {
                    const Icon = iconItem;
                    return (
                      <div key={label} className={`flex items-center gap-3 rounded-lg px-3 py-2.5 ${color.split(' ')[1]}`}>
                        <Icon className={`w-4 h-4 shrink-0 ${color.split(' ')[0]}`} />
                        <span className="text-xs font-medium text-foreground">{label}</span>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Back to forum */}
            <Link to="/forum">
              <Button variant="outline" className="w-full text-sm gap-2">
                ← Quay về diễn đàn
              </Button>
            </Link>
          </div>
        </div>
      </PageContainer.Section>

      <Dialog open={isCoursePickerOpen} onOpenChange={setIsCoursePickerOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Chọn khóa học để nhắn tin</DialogTitle>
            <DialogDescription>
              Bạn chỉ có thể nhắn tin trong khóa học mà mình đã đăng ký.
            </DialogDescription>
          </DialogHeader>

          <div className="max-h-80 space-y-2 overflow-y-auto pr-1">
            {instructorCourses.map((course) => (
              <button
                key={course.id}
                type="button"
                disabled={isCreatingStudent}
                onClick={() => openConversationForCourse(course.id)}
                className="flex w-full items-center gap-3 rounded-xl border border-border p-3 text-left transition-colors hover:border-primary/40 hover:bg-primary/5 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <div className="h-12 w-16 shrink-0 overflow-hidden rounded-lg bg-muted">
                  {course.thumbnail ? (
                    <img
                      src={course.thumbnail}
                      alt=""
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center">
                      <BookOpen className="h-5 w-5 text-muted-foreground" />
                    </div>
                  )}
                </div>

                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-foreground">
                    {course.title}
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Nhấn để mở cuộc trò chuyện
                  </p>
                </div>

                {isCreatingStudent ? (
                  <Loader2 className="h-4 w-4 shrink-0 animate-spin text-primary" />
                ) : (
                  <Send className="h-4 w-4 shrink-0 text-primary" />
                )}
              </button>
            ))}
          </div>
        </DialogContent>
      </Dialog>

      <PersonalizationModal
        forceOpen={isPersonalizationOpen}
        onClose={() => setIsPersonalizationOpen(false)}
      />
    </div>
  );
};

export default UserProfile;
