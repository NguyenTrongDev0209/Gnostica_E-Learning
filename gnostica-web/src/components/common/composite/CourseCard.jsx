import React from 'react';
import { Star, BookOpen, Users, Clock, Flame, ThumbsUp, MessageSquare, Eye, ArrowUp, ArrowDown, Share2 } from 'lucide-react';
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback, AvatarBadge } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { Link } from 'react-router-dom';
import useAuthStore from '@/store/useAuthStore';
import threadService from '@/services/forum/threadService';
import { toast } from 'sonner';

const CourseCard = ({
  image,
  category = "Data Science",
  rating = 4.9,
  title = "Python For Data Science",
  classes = 18,
  students = 160,
  price = "432.000",
  originalPrice = "864.000",
  discountPercentage = 50,
  currency = "đ",
  instructor = {
    name: "Alex Taylor",
    avatar: "https://images.unsplash.com/photo-1599566150163-29194dcaad36?q=80&w=100&auto=format&fit=crop",
    status: "online"
  },
  link = "/courses/1",
  className
}) => {
  return (
    <Link to={link} className="block w-full h-full">
      <Card className={cn("w-full h-full flex flex-col shadow-sm hover:shadow-md transition-all duration-300 border border-border overflow-hidden bg-card group", className)}>
        {/* Top Image Section */}
        <div className="p-2 sm:p-3 pb-0">
          <div className="relative aspect-video overflow-hidden shadow-sm rounded-md bg-muted">
            <img
              src={image || "https://images.unsplash.com/photo-1498050108023-c5249f4df085?q=80&w=400&auto=format&fit=crop"}
              alt={title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
          </div>
        </div>

        {/* Content Section */}
        <CardContent className="p-3 sm:p-5 pt-2 sm:pt-4 flex flex-col gap-2 sm:gap-4">
          {/* Top Row (Instructor & Rating) */}
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-1.5 sm:gap-2">
              <Avatar size="sm" className="ring-2 ring-white shadow-sm h-5 w-5 sm:h-6 sm:w-6">
                <AvatarImage src={instructor.avatar} alt={instructor.name} />
                <AvatarFallback>{instructor.name.charAt(0)}</AvatarFallback>
                {instructor.status === 'online' && (
                  <AvatarBadge className="bg-success/10 text-success border-2 border-white ring-0" />
                )}
              </Avatar>
              <span className="text-[11px] sm:text-sm font-semibold text-primary whitespace-nowrap">
                {instructor.name}
              </span>
            </div>

            <Badge variant="secondary" className="bg-primary text-primary-foreground hover:bg-primary border-none px-1.5 py-0.5 sm:px-2 sm:py-1 flex items-center gap-0.5 sm:gap-1 text-[9px] sm:text-xs font-bold">
              <Star className="w-2.5 h-2.5 sm:w-3 sm:h-3 fill-yellow-400 text-warning" />
              {rating.toFixed(1)}
            </Badge>
          </div>

          {/* Title */}
          <h3 className="font-bold text-foreground text-sm sm:text-lg leading-tight line-clamp-2 min-h-[2.4rem] sm:min-h-[2.8rem]">
            {title}
          </h3>

          {/* Category Badge - Below Title */}
          <div className="flex">
            <Badge variant="secondary" className="bg-background text-primary hover:bg-background border-none px-1.5 sm:px-3 py-0.5 sm:py-1 flex items-center gap-1 sm:gap-1.5 text-[9px] sm:text-xs font-semibold">
              <span className="w-1 h-1 sm:w-1.5 sm:h-1.5 bg-primary" />
              {category}
            </Badge>
          </div>

          {/* Info Row (Students) */}
          <div className="flex items-center gap-3 sm:gap-6 text-muted-foreground">
            <div className="flex items-center gap-1 sm:gap-2">
              <Users className="w-3 sm:w-4 h-3 sm:h-4 text-primary/70" />
              <span className="text-[10px] sm:text-sm font-medium">{students} học viên</span>
            </div>
          </div>

          {/* Separator Line */}
          <div className="border-t border-border my-0 sm:my-1" />

          {/* Footer Row (Price Only) */}
          <div className="flex items-center justify-between gap-1 flex-wrap mt-auto pt-1">
            <div className="flex items-center gap-1.5 flex-wrap">
              <div className="text-sm sm:text-xl font-bold bg-accent-gradient bg-clip-text text-transparent leading-none">
                {price}<span className="text-[10px] sm:text-lg ml-0.5">{currency}</span>
              </div>

              {originalPrice && (
                <div className="text-[10px] sm:text-sm text-muted-foreground line-through decoration-muted-foreground/50">
                  {originalPrice}{currency}
                </div>
              )}
            </div>

            {discountPercentage > 0 && (
              <Badge variant="destructive" className="bg-error/10 text-error hover:bg-error/10 text-error text-white border-none px-1 sm:px-2 py-0.5 text-[9px] sm:text-xs font-bold rounded-sm">
                -{discountPercentage}%
              </Badge>
            )}
          </div>
        </CardContent>
      </Card>
    </Link>
  );
};

export default CourseCard;
/**
 * CourseCardHorizontal - Card khóa học nằm ngang cho trang danh mục.
 * Same style system as AppCard but in landscape/row layout.
 */
export const CourseCardHorizontal = ({
  id,
  image,
  category = "Danh mục",
  rating = 4.9,
  title = "Tên khóa học",
  classes = 18,
  students = 160,
  price = "432.000",
  originalPrice = "864.000",
  discountPercentage = 50,
  currency = "đ",
  instructor = {
    name: "Giảng viên",
    avatar: "https://images.unsplash.com/photo-1599566150163-29194dcaad36?q=80&w=100&auto=format&fit=crop",
    status: "online"
  },
  link,
  className
}) => {
  const to = link || `/courses/${id}`;
  return (
    <Link to={to} className="block w-full">
      <Card className={cn("w-full flex flex-row shadow-sm hover:shadow-md transition-all duration-300 border border-border overflow-hidden bg-card group", className)}>
        {/* Left Image */}
        <div className="shrink-0 w-56 sm:w-72 md:w-80 p-3 pr-0">
          <div className="relative w-full h-full min-h-[120px] overflow-hidden rounded-lg bg-muted">
            <img
              src={image || "https://images.unsplash.com/photo-1498050108023-c5249f4df085?q=80&w=400&auto=format&fit=crop"}
              alt={title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
          </div>
        </div>

        {/* Right Content */}
        <CardContent className="flex-1 p-4 flex flex-col gap-2 justify-between min-w-0">
          {/* Top: Instructor & Rating */}
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Avatar size="sm" className="ring-2 ring-white shadow-sm h-6 w-6">
                <AvatarImage src={instructor.avatar} alt={instructor.name} />
                <AvatarFallback>{instructor.name.charAt(0)}</AvatarFallback>
                {instructor.status === 'online' && (
                  <AvatarBadge className="bg-success/10 text-success border-2 border-white ring-0" />
                )}
              </Avatar>
              <span className="text-sm font-semibold text-primary whitespace-nowrap truncate max-w-[140px]">
                {instructor.name}
              </span>
            </div>
            <Badge variant="secondary" className="bg-primary text-primary-foreground hover:bg-primary border-none px-2 py-0.5 flex items-center gap-1 text-xs font-bold shrink-0">
              <Star className="w-3 h-3 fill-yellow-400 text-warning" />
              {rating.toFixed(1)}
            </Badge>
          </div>

          {/* Title */}
          <h3 className="font-bold text-foreground text-base sm:text-lg leading-tight line-clamp-2">
            {title}
          </h3>

          {/* Category */}
          <Badge variant="secondary" className="self-start bg-background text-primary hover:bg-background border-none px-2 py-0.5 flex items-center gap-1.5 text-xs font-semibold w-fit">
            <span className="w-1.5 h-1.5 bg-primary rounded-full" />
            {category}
          </Badge>

          {/* Info Row */}
          <div className="flex items-center gap-4 text-muted-foreground text-xs">
            <div className="flex items-center gap-1.5">
              <BookOpen className="w-4 h-4 text-primary/70" />
              <span className="font-medium">{classes} bài học</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Users className="w-4 h-4 text-primary/70" />
              <span className="font-medium">{students.toLocaleString()} học viên</span>
            </div>
          </div>

          {/* Separator */}
          <div className="border-t border-border" />

          {/* Price */}
          <div className="flex items-center gap-2 flex-wrap mt-auto">
            <div className="text-lg font-bold bg-accent-gradient bg-clip-text text-transparent leading-none">
              {price}<span className="text-base ml-0.5">{currency}</span>
            </div>
            {originalPrice && (
              <div className="text-sm text-muted-foreground line-through decoration-muted-foreground/50">
                {originalPrice}{currency}
              </div>
            )}
            {discountPercentage > 0 && (
              <Badge variant="destructive" className="bg-error/10 text-error hover:bg-error/10 text-error text-white border-none px-2 py-0.5 text-xs font-bold rounded-sm">
                -{discountPercentage}%
              </Badge>
            )}
          </div>
        </CardContent>
      </Card>
    </Link>
  );
};

/**
 * ForumPostCard - Card hiển thị một bài đăng trên diễn đàn.
 * Props:
 *  - post: { id, title, content, author: { name, avatar, status }, category, tags, createdAt, stats: { replies, views, likes }, isHot }
 *  - className
 */
export const ForumPostCard = ({ post, className }) => {
  if (!post) return null;

  const currentUser = useAuthStore(state => state.user);
  const [voteScore, setVoteScore] = React.useState(post.voteScore || 0);
  const [userVote, setUserVote] = React.useState(post.userVote || 0);
  const [likesCount, setLikesCount] = React.useState(post.stats?.likes || 0);
  const [userLiked, setUserLiked] = React.useState(post.userLiked || false);

  React.useEffect(() => {
    if (post.voteScore !== undefined) setVoteScore(post.voteScore);
    if (post.userVote !== undefined) setUserVote(post.userVote);
  }, [post.voteScore, post.userVote]);

  React.useEffect(() => {
    if (post.stats?.likes !== undefined) setLikesCount(post.stats.likes);
    if (post.userLiked !== undefined) setUserLiked(post.userLiked);
  }, [post.stats?.likes, post.userLiked]);

  const handleLike = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!currentUser) {
      toast.error("Vui lòng đăng nhập để thích bài viết!");
      return;
    }

    const nextLiked = !userLiked;
    setUserLiked(nextLiked);
    setLikesCount(prev => prev + (nextLiked ? 1 : -1));

    try {
      await threadService.toggleLike(post.id, currentUser.email);
    } catch (err) {
      console.error("Error liking:", err);
      // Revert state
      setUserLiked(!nextLiked);
      setLikesCount(prev => prev + (nextLiked ? -1 : 1));
      toast.error("Thao tác Thích thất bại!");
    }
  };

  const handleShare = (e) => {
    e.preventDefault();
    e.stopPropagation();
    const shareUrl = `${window.location.origin}/forum/${post.slug || post.id}`;
    navigator.clipboard.writeText(shareUrl)
      .then(() => {
        toast.success("Đã sao chép liên kết chia sẻ!");
      })
      .catch(() => {
        toast.error("Không thể sao chép liên kết!");
      });
  };

  const handleVote = async (e, type) => {
    e.preventDefault();
    e.stopPropagation();

    if (!currentUser) {
      toast.error("Vui lòng đăng nhập để bình chọn bài viết!");
      return;
    }

    let newVote = 0;
    if (type === 1) { // Upvote
      newVote = userVote === 1 ? 0 : 1;
    } else { // Downvote
      newVote = userVote === -1 ? 0 : -1;
    }

    const diff = newVote - userVote;
    setUserVote(newVote);
    setVoteScore(prev => prev + diff);

    try {
      await threadService.voteThread(post.id, currentUser.email, newVote);
    } catch (err) {
      console.error("Error voting:", err);
      // Revert state
      setUserVote(userVote);
      setVoteScore(prev => prev - diff);
      toast.error("Thao tác bình chọn thất bại!");
    }
  };

  return (
    <Link to={`/forum/${post.slug || post.id}`} className="block">
      <Card className={cn("hover:border-primary/50 transition-colors bg-white overflow-hidden group cursor-pointer", className)}>
        <CardContent className="p-4 sm:p-5">
          <div className="flex items-start gap-4">
            {/* Avatar - ẩn trên mobile nhỏ */}
            <div className="hidden sm:block shrink-0 mt-1">
              <Avatar size="md" className="ring-2 ring-transparent group-hover:ring-primary/20 transition-all">
                <AvatarImage src={post.author.avatar} alt={post.author.name} />
                <AvatarFallback className="bg-primary/10 text-primary font-bold">
                  {post.author.name.substring(0, 2).toUpperCase()}
                </AvatarFallback>
                {post.author.status === 'online' && (
                  <AvatarBadge className="bg-success/10 text-success border-2 border-white ring-0" />
                )}
              </Avatar>
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              {/* Meta */}
              <div className="flex items-center gap-2 mb-2 text-xs text-muted-foreground flex-wrap">
                <span className="font-semibold text-primary">{post.category}</span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <Avatar size="sm" className="w-4 h-4 sm:hidden">
                    <AvatarImage src={post.author.avatar} />
                    <AvatarFallback className="text-[8px]">{post.author.name[0]}</AvatarFallback>
                  </Avatar>
                  <span className="font-medium text-foreground">{post.author.name}</span>
                </span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" />
                  {post.createdAt}
                </span>
                {post.status !== undefined && post.status !== null && (
                  <>
                    <span>•</span>
                    <span className="flex items-center">
                      {post.status === 1 && (
                        <Badge variant="secondary" className="bg-warning/10 text-warning hover:bg-warning/20 border-none text-[10px] py-0 px-1.5 h-5 font-semibold shrink-0">
                          Đang duyệt
                        </Badge>
                      )}
                      {post.status === 2 && (
                        <Badge variant="secondary" className="bg-success/10 text-success hover:bg-success/20 border-none text-[10px] py-0 px-1.5 h-5 font-semibold shrink-0">
                          Đã duyệt
                        </Badge>
                      )}
                      {post.status === 3 && (
                        <Badge variant="destructive" className="bg-error/10 text-error hover:bg-error/20 border-none text-[10px] py-0 px-1.5 h-5 font-semibold shrink-0">
                          Từ chối
                        </Badge>
                      )}
                      {post.status === 0 && (
                        <Badge variant="secondary" className="bg-muted text-muted-foreground hover:bg-muted border-none text-[10px] py-0 px-1.5 h-5 font-semibold shrink-0">
                          Ẩn
                        </Badge>
                      )}
                    </span>
                  </>
                )}
              </div>

              {/* Title */}
              <h3 className="text-lg font-bold text-foreground mb-1 group-hover:text-primary transition-colors flex items-center gap-2">
                {post.isHot && <Flame className="w-4 h-4 text-warning fill-orange-500 shrink-0" />}
                <span className="line-clamp-2">{post.title}</span>
              </h3>

              {/* Snippet */}
              <p className="text-sm text-muted-foreground line-clamp-2 mb-3">{post.content}</p>

              {/* Tags & Stats */}
              <div className="flex flex-col items-start gap-3 mt-auto">
                {post.tags && post.tags.length > 0 && (
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {post.tags.map(tag => (
                      <Badge key={tag} variant="secondary" className="bg-secondary text-muted-foreground hover:bg-muted text-[10px] px-1.5 py-0 font-medium border-none shadow-none">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                )}
                <div className="flex items-center gap-4 text-xs font-medium text-muted-foreground shrink-0">
                  {/* Voting Pill */}
                  <div className="flex items-center gap-1 bg-slate-100 hover:bg-slate-200/80 dark:bg-slate-800 dark:hover:bg-slate-700/80 rounded-full px-2 py-0.5 border border-transparent transition-colors">
                    <button
                      onClick={(e) => handleVote(e, 1)}
                      className={cn(
                        "p-1 hover:text-orange-500 rounded-full transition-colors",
                        userVote === 1 && "text-orange-500 font-bold"
                      )}
                    >
                      <ArrowUp className="w-3.5 h-3.5" />
                    </button>
                    <span className={cn(
                      "px-1 font-semibold text-[11px] min-w-[12px] text-center",
                      userVote === 1 && "text-orange-500",
                      userVote === -1 && "text-blue-500"
                    )}>
                      {voteScore}
                    </span>
                    <button
                      onClick={(e) => handleVote(e, -1)}
                      className={cn(
                        "p-1 hover:text-blue-500 rounded-full transition-colors",
                        userVote === -1 && "text-blue-500 font-bold"
                      )}
                    >
                      <ArrowDown className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <button
                    onClick={handleLike}
                    className={cn(
                      "flex items-center gap-1.5 hover:text-primary transition-colors",
                      userLiked && "text-primary font-semibold"
                    )}
                  >
                    <ThumbsUp className={cn("w-4 h-4", userLiked && "fill-primary")} />
                    <span>{likesCount}</span>
                  </button>
                  <div className="flex items-center gap-1.5 hover:text-primary transition-colors">
                    <MessageSquare className="w-4 h-4" /><span>{post.stats.replies}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Eye className="w-4 h-4" /><span>{post.stats.views}</span>
                  </div>
                  <button
                    onClick={handleShare}
                    className="flex items-center gap-1.5 hover:text-primary transition-colors"
                    title="Chia sẻ liên kết"
                  >
                    <Share2 className="w-4 h-4" />
                    <span>Chia sẻ</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Right Image Thumbnail */}
            {post.images && post.images.length > 0 && (
              <div className="hidden md:block w-32 h-24 shrink-0 rounded-md overflow-hidden border border-border mt-1">
                <img
                  src={post.images[0].imageUrl}
                  alt="preview"
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </Link>
  );
};

