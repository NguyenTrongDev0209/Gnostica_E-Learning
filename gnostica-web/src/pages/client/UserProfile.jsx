import React, { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import SectionContainer from '@/components/common/AppSection';
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback, AvatarBadge } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ForumPostCard } from "@/components/common/AppCard";
import {
  MessageSquare, ThumbsUp, Eye, Clock, MapPin, Link as LinkIcon,
  Calendar, Star, Award, BookOpen, Flame, UserPlus, Send
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

// ── Main Component ─────────────────────────────────────────
const UserProfile = () => {
  const { id } = useParams();
  const [following, setFollowing] = useState(false);
  
  const [isInstructorDialogOpen, setIsInstructorDialogOpen] = useState(false);
  const [agreedTerms, setAgreedTerms] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const currentUser = JSON.parse(localStorage.getItem('user'));
  
  // Logic hiển thị: Nếu là trang của tôi thì dùng data thật, ko thì dùng Mock
  const isOwnProfile = currentUser && (id === String(currentUser.id) || !id || currentUser.email === MOCK_USER.email); 
  const user = isOwnProfile ? { ...MOCK_USER, ...currentUser, name: currentUser.fullName, role: currentUser.role } : MOCK_USER;
  
  const isInstructor = (user.role || '').toUpperCase() === 'INSTRUCTOR';

  const handleBecomeInstructor = async () => {
    if (!agreedTerms) {
      toast.error("Vui lòng đồng ý với các điều khoản!");
      return;
    }

    setIsSubmitting(true);
    try {
      await authService.becomeInstructor(currentUser.email);
      toast.success("Chúc mừng! Bạn đã trở thành giảng viên.");
      setIsInstructorDialogOpen(false);
      // In real app: refresh data or update local state
      user.role = 'INSTRUCTOR'; // For demonstration
    } catch (error) {
      toast.error(error.toString());
    } finally {
      setIsSubmitting(false);
    }
  };

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
                      <Button
                        variant="outline"
                        size="sm"
                        className={`gap-1.5 h-9 font-semibold transition-all ${following ? 'border-primary text-primary bg-primary/5' : ''}`}
                        onClick={() => setFollowing(!following)}
                      >
                        <UserPlus className="w-4 h-4" />
                        {following ? 'Đang theo dõi' : 'Theo dõi'}
                      </Button>
                      <Button variant="outline" size="sm" className="gap-1.5 h-9">
                        <Send className="w-4 h-4" /> Nhắn tin
                      </Button>
                      
                      {isOwnProfile && !isInstructor && (
                        <Button 
                          className="gap-1.5 h-9 font-bold bg-orange-500 hover:bg-orange-600 border-none" 
                          size="sm"
                          onClick={() => setIsInstructorDialogOpen(true)}
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

              {/* Stats Row */}
              <Separator className="mt-5 mb-0" />
              <div className="grid grid-cols-2 sm:grid-cols-4 divide-x divide-border">
                <StatItem icon={BookOpen} value={user.stats.posts} label="Bài đăng" />
                <StatItem icon={ThumbsUp} value={user.stats.likes} label="Lượt thích" color="text-orange-500" />
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
            <Tabs defaultValue="posts">
              <TabsList className="bg-white border border-border h-10 mb-5 rounded-lg">
                <TabsTrigger value="posts" className="text-sm font-medium gap-1.5">
                  <BookOpen className="w-4 h-4" /> Bài đăng ({MOCK_POSTS.length})
                </TabsTrigger>
                <TabsTrigger value="liked" className="text-sm font-medium gap-1.5">
                  <ThumbsUp className="w-4 h-4" /> Đã thích ({MOCK_LIKED_POSTS.length})
                </TabsTrigger>
              </TabsList>

              <TabsContent value="posts" className="mt-0">
                <div className="flex flex-col gap-4">
                  {MOCK_POSTS.map(post => (
                    <ForumPostCard key={post.id} post={post} />
                  ))}
                </div>
              </TabsContent>

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

      {/* Become Instructor Dialog */}
      <Dialog open={isInstructorDialogOpen} onOpenChange={setIsInstructorDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">Đăng ký trở thành Giảng viên</DialogTitle>
            <DialogDescription>
              Trở thành giảng viên để chia sẻ kiến thức và tạo ra các khóa học tuyệt vời trên Gnostica.
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4 flex flex-col gap-4">
            <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 h-48 overflow-y-auto text-sm text-slate-600 leading-relaxed">
              <h4 className="font-bold text-slate-900 mb-2">ĐIỀU KHOẢN VÀ ĐIỀU KIỆN</h4>
              <p className="mb-2">1. Bạn cam kết các thông tin cung cấp là chính xác và trung thực.</p>
              <p className="mb-2">2. Nội dung các khóa học phải tuân thủ quy định về bản quyền và đạo đức nghề nghiệp.</p>
              <p className="mb-2">3. Bạn chịu trách nhiệm hoàn toàn về nội dung và chất lượng bài giảng của mình.</p>
              <p className="mb-2">4. Gnostica có quyền tạm dừng hoặc hủy bỏ tư cách giảng viên nếu phát hiện vi phạm nghiêm trọng các quy định chung.</p>
              <p className="mb-2">5. Tỷ lệ chia sẻ doanh thu sẽ được thực hiện theo thỏa thuận cụ thể cho từng khóa học.</p>
            </div>
            
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="terms" 
                checked={agreedTerms}
                onCheckedChange={setAgreedTerms}
              />
              <label 
                htmlFor="terms" 
                className="text-sm font-medium leading-none cursor-pointer select-none"
              >
                Tôi đã đọc và đồng ý với các điều khoản trên
              </label>
            </div>
          </div>

          <DialogFooter>
            <Button variant="ghost" onClick={() => setIsInstructorDialogOpen(false)}>Hủy</Button>
            <Button 
                onClick={handleBecomeInstructor} 
                disabled={!agreedTerms || isSubmitting}
                className="bg-primary hover:bg-primary/90"
            >
              {isSubmitting ? "Đang xử lý..." : "Xác nhận đăng ký"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default UserProfile;
