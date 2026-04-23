import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link, useParams, useNavigate } from 'react-router-dom';
import SectionContainer from '@/components/common/AppSection';
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback, AvatarBadge } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import AppCard, { ForumPostCard } from "@/components/common/AppCard";
import {
  MessageSquare, ThumbsUp, Eye, Clock, MapPin, Link as LinkIcon,
  Calendar, Star, Award, BookOpen, Flame, UserPlus, Send, Users
} from 'lucide-react';
import StatItem from '@/components/common/StatItem';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import authService from '@/services/authService';
import followingService from '@/services/followingService';
import { toast } from 'sonner';

// ── Mock Data ──────────────────────────────────────────────
const MOCK_USER = {
  id: 1,
  name: "Nguyễn Văn A",
  username: "nguyenvana",
  avatar: "https://i.pravatar.cc/150?u=a042581f4e29026024d",
  coverColor: "from-violet-600 via-purple-600 to-indigo-600",
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
    { label: "Người mới tích cực", color: "bg-blue-100 text-blue-700" },
    { label: "Hot Poster", color: "bg-orange-100 text-orange-600" },
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
  const [loading, setLoading] = useState(true);
  const [instructorCourses, setInstructorCourses] = useState([]);
  const [loadingCourses, setLoadingCourses] = useState(false);
  const navigate = useNavigate();

  const currentUser = JSON.parse(localStorage.getItem('user'));
  const isOwnProfile = currentUser && (id === String(currentUser.id) || !id);

  // Check following status
  useEffect(() => {
    const checkStatus = async () => {
        if (currentUser && id && !isOwnProfile) {
            try {
                const res = await followingService.checkFollowing(id);
                setFollowing(res.data.isFollowing);
            } catch (err) {
                console.error("Lỗi kiểm tra trạng thái theo dõi", err);
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
        setFollowing(res.data.isFollowing);
        toast.success(res.data.message);
    } catch (err) {
        toast.error("Không thể thực hiện thao tác này!");
    } finally {
        setFollowLoading(false);
    }
  };

  const [userData, setUserData] = useState(() => 
    isOwnProfile ? { ...MOCK_USER, ...currentUser, name: currentUser.fullName, role: currentUser.role } : MOCK_USER
  );

  useEffect(() => {
    // Nếu là chính mình, đã set ở trạng thái khởi tạo, nhưng vẫn có thể fetch mới, tạm bọc trong loading để render
    if (isOwnProfile) {
        setLoading(false);
        return;
    }
    
    // Nếu là xem user khác, tải dữ liệu
    const fetchUserData = async () => {
        setLoading(true);
        try {
            // Thử gọi api dành cho public profile
            const response = await axios.get(`http://localhost:8080/api/instructors/${id}/profile`);
            const data = response.data;
            setUserData(prev => ({
                ...prev,
                id: data.id,
                name: data.name,
                avatar: data.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(data.name)}&background=random&color=fff`,
                email: data.email,
                role: "INSTRUCTOR",
                stats: {
                    ...prev.stats,
                    courses: data.coursesCount || 0,
                    students: data.studentsCount || 0,
                }
            }));
            
            // Xử lý load khóa học nếu là INSTRUCTOR
            setLoadingCourses(true);
            try {
                const coursesResp = await axios.get(`http://localhost:8080/api/instructors/${id}/courses`);
                setInstructorCourses(coursesResp.data || []);
            } catch (err) {
                console.error("Không thể lấy danh sách khóa học của giảng viên", err);
            } finally {
                setLoadingCourses(false);
            }

        } catch (error) {
            console.error("Không thể lấy thông tin chi tiết user", error);
            // Fallback back to MOCK with id if error
        } finally {
            setLoading(false);
        }
    };
    if (id) fetchUserData();
  }, [id, isOwnProfile]);
  
  const user = userData;
  const isInstructor = (user.role || '').toUpperCase() === 'INSTRUCTOR';

  const handleBecomeInstructor = async () => {
    navigate('/apply-instructor');
  };

  if (loading) {
     return <div className="min-h-screen flex items-center justify-center">Đang tải hồ sơ...</div>;
  }

  return (
    <div className="min-h-screen bg-slate-50/50 pb-16">

      {/* Cover Banner */}
      <div className={`w-full h-40 sm:h-52 bg-gradient-to-r ${user.coverColor} relative`}>
        <div className="absolute inset-0 opacity-20 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC40Ij48cGF0aCBkPSJNMzYgMzRjMC0yLjIgMS44LTQgNC00czQgMS44IDQgNC0xLjggNC00IDQtNC0xLjgtNC00eiIvPjwvZz48L2c+PC9zdmc+')] bg-repeat" />
      </div>

      <SectionContainer containerClassName="w-full">
        {/* Profile Header */}
        <div className="relative -mt-16 sm:-mt-20 mb-6">
          <Card className="bg-white border-border shadow-sm">
            <CardContent className="p-5 sm:p-7">
              <div className="flex flex-col sm:flex-row sm:items-end gap-4">
                {/* Avatar */}
                <div className="shrink-0 -mt-12 sm:-mt-16">
                  <Avatar className="w-24 h-24 sm:w-28 sm:h-28 ring-4 ring-white shadow-lg">
                    <AvatarImage src={user.avatar} alt={user.name} />
                    <AvatarFallback className="bg-primary/10 text-primary font-bold text-2xl">
                      {user.name.substring(0, 2).toUpperCase()}
                    </AvatarFallback>
                    {user.status === 'online' && (
                      <AvatarBadge className="bg-green-500 border-[3px] border-white ring-0 w-5 h-5" />
                    )}
                  </Avatar>
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 flex-wrap">
                    <div>
                      <h1 className="text-2xl font-bold text-slate-900 leading-tight">{user.name}</h1>
                      <p className="text-sm text-muted-foreground font-medium">@{user.username}</p>
                      {/* Badges */}
                      <div className="flex gap-2 flex-wrap mt-2">
                        <Badge className="bg-primary/10 text-primary border-none text-xs font-semibold">
                          {user.role}
                        </Badge>
                        {user.badges.map(b => (
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
                      <Button variant="outline" size="sm" className="gap-1.5 h-9">
                        <Send className="w-4 h-4" /> Nhắn tin
                      </Button>
                      
                      {isOwnProfile && !isInstructor && (
                        <Button 
                          className="gap-1.5 h-9 font-bold bg-orange-500 hover:bg-orange-600 border-none" 
                          size="sm"
                          onClick={handleBecomeInstructor}
                        >
                          <Award className="w-4 h-4" /> Đăng ký giảng viên
                        </Button>
                      )}
                    </div>
                  </div>

                  {/* Bio & Meta */}
                  <p className="text-sm text-slate-600 mt-3 leading-relaxed max-w-2xl">{user.bio}</p>
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-3 text-xs text-muted-foreground">
                    {user.location && (
                      <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" />{user.location}</span>
                    )}
                    {user.website && (
                      <a href={user.website} target="_blank" rel="noreferrer"
                        className="flex items-center gap-1 hover:text-primary transition-colors">
                        <LinkIcon className="w-3.5 h-3.5" />{user.website.replace('https://', '')}
                      </a>
                    )}
                    <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" />Tham gia {user.joinedAt}</span>
                  </div>
                </div>
              </div>

              <Separator className="mt-5 mb-0" />
              <div className="grid grid-cols-2 sm:grid-cols-4 divide-x divide-border">
                {isInstructor ? (
                  <>
                    <StatItem icon={BookOpen} value={user.stats.courses || 0} label="Khóa học" />
                    <StatItem icon={Users} value={user.stats.students || 0} label="Học viên" color="text-orange-500" />
                  </>
                ) : (
                  <>
                    <StatItem icon={BookOpen} value={user.stats.posts} label="Bài đăng" />
                    <StatItem icon={ThumbsUp} value={user.stats.likes} label="Lượt thích" color="text-orange-500" />
                  </>
                )}
                <StatItem icon={Eye} value={user.stats.views} label="Lượt xem" color="text-blue-500" />
                <StatItem icon={MessageSquare} value={user.stats.comments} label="Bình luận" color="text-green-500" />
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
                          <AppCard 
                            key={course.id} 
                            title={course.title} 
                            image={course.thumbnail} 
                            price={course.price} 
                            category={course.category?.name} 
                            students={course.enrollments ? course.enrollments.length : 0}
                            classes={course.modules ? course.modules.length : 0}
                            instructor={{name: user.name, avatar: user.avatar, status: user.status}}
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
            {/* Achievements */}
            <Card className="bg-white shadow-sm border-border">
              <CardContent className="p-5">
                <h3 className="text-sm font-bold text-slate-700 mb-4 flex items-center gap-2">
                  <Award className="w-4 h-4 text-primary" /> Thành tích
                </h3>
                <div className="flex flex-col gap-3">
                  {[
                    { icon: Flame, label: "5 bài đang hot", color: "text-orange-500 bg-orange-50" },
                    { icon: Star, label: "Top 10 tuần này", color: "text-yellow-600 bg-yellow-50" },
                    { icon: MessageSquare, label: "50+ bình luận", color: "text-blue-600 bg-blue-50" },
                  ].map(({ icon: Icon, label, color }) => (
                    <div key={label} className={`flex items-center gap-3 rounded-lg px-3 py-2.5 ${color.split(' ')[1]}`}>
                      <Icon className={`w-4 h-4 shrink-0 ${color.split(' ')[0]}`} />
                      <span className="text-xs font-medium text-slate-700">{label}</span>
                    </div>
                  ))}
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
      </SectionContainer>
    </div>
  );
};

export default UserProfile;
