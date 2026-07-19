import React from 'react';
import { Star, BookOpen, Users, Clock, Flame, ThumbsUp, MessageSquare, Eye, ArrowUp, ArrowDown, Share2, PlayCircle } from 'lucide-react';
import AppCard, { AppCardContent } from "@/components/common/micro/AppCard";
import AppBadge from "@/components/common/micro/AppBadge";
import AppAvatar from "@/components/common/micro/AppAvatar";
import { cn } from "@/lib/utils";
import AppProgress from "@/components/common/micro/AppProgress";
import { Link } from 'react-router-dom';
import useAuthStore from '@/store/useAuthStore';
import threadService from '@/services/forum/threadService';
import { toast } from 'sonner';

const COURSE_IMAGE_FALLBACK = "https://images.unsplash.com/photo-1498050108023-c5249f4df085?q=80&w=600&auto=format&fit=crop";
const handleCourseImageError = (event) => {
  event.currentTarget.onerror = null;
  event.currentTarget.src = COURSE_IMAGE_FALLBACK;
};

const parsePriceValue = (value) => {
  if (typeof value === "number") return value;
  const digits = String(value ?? "").replace(/[^0-9]/g, "");
  return digits ? Number(digits) : 0;
};

const formatPriceValue = (value) => new Intl.NumberFormat("vi-VN").format(value);

const resolveDiscountedPrice = (price, originalPrice, discountPercentage) => {
  const currentValue = parsePriceValue(price);
  const originalValue = parsePriceValue(originalPrice);

  if (discountPercentage > 0 && originalValue > 0 && currentValue >= originalValue) {
    return formatPriceValue(Math.round(originalValue * (100 - discountPercentage) / 100));
  }

  return typeof price === "number" ? formatPriceValue(price) : price;
};

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
  const displayedPrice = resolveDiscountedPrice(price, originalPrice, discountPercentage);

  return (
    <Link to={link} className="block w-full h-full">
      <AppCard appVariant="default" className={cn("w-full h-full flex flex-col group hover-lift p-0 gap-0", className)}>
        {/* Top Image Section */}
        <div className="p-2 sm:p-3 pb-0">
          <div className="relative aspect-video overflow-hidden shadow-sm rounded-md bg-muted">
            <img
              src={image || COURSE_IMAGE_FALLBACK}
              alt={title}
              loading="lazy"
              decoding="async"
              onError={handleCourseImageError}
              className="w-full h-full object-cover"
            />
          </div>
        </div>

        {/* Content Section */}
        <AppCardContent className="p-3 sm:p-5 pt-2 sm:pt-4 flex flex-col gap-2 sm:gap-4">
          {/* Top Row (Instructor & Rating) */}
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-1.5 sm:gap-2">
              <AppAvatar 
                size="sm" 
                className="ring-2 ring-background shadow-sm h-5 w-5 sm:h-6 sm:w-6"
                src={instructor.avatar}
                alt={instructor.name}
                online={instructor.status === 'online'}
              />
              <span className="text-[11px] sm:text-sm font-semibold text-primary whitespace-nowrap">
                {instructor.name}
              </span>
            </div>

            <AppBadge variant="primary" className="px-1.5 py-0.5 sm:px-2 sm:py-1 flex items-center gap-0.5 sm:gap-1 text-[9px] sm:text-xs font-bold">
              <Star className="w-2.5 h-2.5 sm:w-3 sm:h-3 fill-warning text-warning" />
              {rating.toFixed(1)}
            </AppBadge>
          </div>

          {/* Title */}
          <h3 className="font-bold text-foreground text-sm sm:text-lg leading-tight clamp-2 min-h-[2.4rem] sm:min-h-[2.8rem]">
            {title}
          </h3>

          {/* Category Badge - Below Title */}
          <div className="flex">
            <AppBadge variant="secondary" className="bg-background text-primary hover:bg-background border-none px-1.5 sm:px-3 py-0.5 sm:py-1 flex items-center gap-1 sm:gap-1.5 text-[9px] sm:text-xs font-semibold">
              <span className="w-1 h-1 sm:w-1.5 sm:h-1.5 bg-primary" />
              {category}
            </AppBadge>
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
              <div className="text-sm sm:text-xl font-bold text-gradient-button leading-none">
                {displayedPrice}<span className="text-[10px] sm:text-lg ml-0.5">{currency}</span>
              </div>

              {originalPrice && (
                <div className="text-[10px] sm:text-sm text-muted-foreground line-through decoration-muted-foreground/50">
                  {originalPrice}{currency}
                </div>
              )}
            </div>

            {discountPercentage > 0 && (
              <AppBadge variant="error" soft className="px-1 sm:px-2 py-0.5 text-[9px] sm:text-xs font-bold rounded-sm">
                -{discountPercentage}%
              </AppBadge>
            )}
          </div>
        </AppCardContent>
      </AppCard>
    </Link>
  );
};

export default CourseCard;

export const CourseProgressCard = ({
  id,
  image,
  title,
  category,
  instructor,
  progressPercent = 0,
  lastAccessed,
  joinedAt,
  className,
  link
}) => {
  const to = link || `/courses/${id}/learn`;
  return (
    <Link to={to} className="block w-full">
      <AppCard appVariant="default" className={cn("w-full flex flex-row group hover-lift p-0 gap-0", className)}>
        {/* Left Image */}
        <div className="shrink-0 w-32 sm:w-48 p-2 sm:p-3 pr-0">
          <div className="relative w-full h-full min-h-[80px] sm:min-h-[100px] overflow-hidden rounded-lg bg-muted">
            {image ? (
              <img
                src={image}
                alt={title}
                loading="lazy"
                decoding="async"
                onError={handleCourseImageError}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                <BookOpen className="w-8 h-8 opacity-20" />
              </div>
            )}
            <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors duration-300" />
          </div>
        </div>

        {/* Right Content */}
        <AppCardContent className="flex-1 p-3 sm:p-4 flex flex-col gap-2 justify-between min-w-0">
          {/* Top: Instructor & Status */}
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <AppAvatar 
                size="sm" 
                className="ring-2 ring-background shadow-sm h-5 w-5 sm:h-6 sm:w-6"
                src={instructor?.avatar}
                alt={instructor?.name}
              />
              <span className="text-xs sm:text-sm font-semibold text-primary whitespace-nowrap truncate max-w-[120px] sm:max-w-[140px]">
                {instructor?.name || 'Gnostica'}
              </span>
              <span className="text-muted-foreground flex items-center gap-1">
                • Đã tham gia {joinedAt ? new Date(joinedAt).toLocaleDateString('vi-VN') : 'Gần đây'}
              </span>
            </div>
            {progressPercent === 100 && (
              <AppBadge variant="success" soft className="px-1.5 py-0 sm:px-2 sm:py-0.5 text-[9px] sm:text-xs font-bold shrink-0">
                Hoàn thành
              </AppBadge>
            )}
          </div>

          {/* Title */}
          <h3 className="font-bold text-foreground text-sm sm:text-base leading-tight clamp-2">
            {title}
          </h3>

          {/* Category */}
          {category && (
            <AppBadge variant="secondary" className="self-start bg-background text-primary hover:bg-background border-none px-1.5 sm:px-2 py-0.5 flex items-center gap-1 sm:gap-1.5 text-[9px] sm:text-xs font-semibold w-fit">
              <span className="w-1 h-1 sm:w-1.5 sm:h-1.5 bg-primary rounded-full" />
              {category}
            </AppBadge>
          )}

          {/* Progress Section */}
          <div className="flex items-center gap-3 sm:gap-4 mt-auto pt-2">
            <div className="flex-1">
              <div className="flex items-center justify-between text-[10px] sm:text-xs font-bold mb-1 sm:mb-1.5">
                <span className={progressPercent === 100 ? "text-success" : "text-primary"}>
                  {progressPercent}%
                </span>
              </div>
              <AppProgress value={progressPercent} className={cn("h-1.5 sm:h-2", progressPercent === 100 && "[&>div]:bg-success")} />
            </div>
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center bg-secondary hover:bg-primary group-hover:bg-primary group-hover:text-white text-muted-foreground transition-colors shrink-0 shadow-sm hover:shadow-md">
              <PlayCircle className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
          </div>
        </AppCardContent>
      </AppCard>
    </Link>
  );
};
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
  const displayedPrice = resolveDiscountedPrice(price, originalPrice, discountPercentage);

  return (
    <Link to={to} className="block w-full">
      <AppCard appVariant="default" className={cn("w-full flex flex-row group hover-lift p-0 gap-0", className)}>
        {/* Left Image */}
        <div className="shrink-0 w-56 sm:w-72 md:w-80 p-3 pr-0">
          <div className="relative w-full h-full min-h-[120px] overflow-hidden rounded-lg bg-muted">
            <img
              src={image || COURSE_IMAGE_FALLBACK}
              alt={title}
              loading="lazy"
              decoding="async"
              onError={handleCourseImageError}
              className="w-full h-full object-cover"
            />
          </div>
        </div>

        {/* Right Content */}
        <AppCardContent className="flex-1 p-4 flex flex-col gap-2 justify-between min-w-0">
          {/* Top: Instructor & Rating */}
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <AppAvatar 
                size="sm" 
                className="ring-2 ring-background shadow-sm h-6 w-6"
                src={instructor.avatar}
                alt={instructor.name}
                online={instructor.status === 'online'}
              />
              <span className="text-sm font-semibold text-primary whitespace-nowrap truncate max-w-[140px]">
                {instructor.name}
              </span>
            </div>
            <AppBadge variant="primary" className="px-2 py-0.5 flex items-center gap-1 text-xs font-bold shrink-0">
              <Star className="w-3 h-3 fill-warning text-warning" />
              {rating.toFixed(1)}
            </AppBadge>
          </div>

          {/* Title */}
          <h3 className="font-bold text-foreground text-base sm:text-lg leading-tight clamp-2">
            {title}
          </h3>

          {/* Category */}
          <AppBadge variant="secondary" className="self-start bg-background text-primary hover:bg-background border-none px-2 py-0.5 flex items-center gap-1.5 text-xs font-semibold w-fit">
            <span className="w-1.5 h-1.5 bg-primary rounded-full" />
            {category}
          </AppBadge>

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
            <div className="text-lg font-bold text-gradient-button leading-none">
              {displayedPrice}<span className="text-base ml-0.5">{currency}</span>
            </div>
            {originalPrice && (
              <div className="text-sm text-muted-foreground line-through decoration-muted-foreground/50">
                {originalPrice}{currency}
              </div>
            )}
            {discountPercentage > 0 && (
              <AppBadge variant="error" soft className="px-2 py-0.5 text-xs font-bold rounded-sm">
                -{discountPercentage}%
              </AppBadge>
            )}
          </div>
        </AppCardContent>
      </AppCard>
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
  const isPending = post.status === 1 || post.status === 3;
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

    if (isPending) {
      toast.info("Bài viết đang chờ duyệt, chưa thể tương tác!");
      return;
    }

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

    if (isPending) {
      toast.info("Bài viết đang chờ duyệt, chưa thể chia sẻ!");
      return;
    }

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

    if (isPending) {
      toast.info("Bài viết đang chờ duyệt, chưa thể tương tác!");
      return;
    }

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
      <AppCard appVariant="default" className={cn("hover:border-primary/50 transition-colors bg-card overflow-hidden group cursor-pointer p-0 gap-0", className)}>
        <AppCardContent className="p-4 sm:p-5">
          <div className="flex items-start gap-4">
            {/* Avatar - ẩn trên mobile nhỏ */}
            <div className="hidden sm:block shrink-0 mt-1">
              <AppAvatar 
                size="md" 
                className="ring-2 ring-transparent group-hover:ring-primary/20 transition-all"
                src={post.author.avatar}
                alt={post.author.name}
                online={post.author.status === 'online'}
              />
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              {/* Meta */}
              <div className="flex items-center gap-2 mb-2 text-xs text-muted-foreground flex-wrap">
                <span className="font-semibold text-primary">{post.category}</span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <AppAvatar 
                    size="sm" 
                    className="w-4 h-4 sm:hidden"
                    src={post.author.avatar}
                    alt={post.author.name}
                  />
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
                        <AppBadge variant="warning" soft className="text-[10px] py-0 px-1.5 h-5 font-semibold shrink-0">
                          Đang duyệt
                        </AppBadge>
                      )}
                      {post.status === 2 && (
                        <AppBadge variant="success" soft className="text-[10px] py-0 px-1.5 h-5 font-semibold shrink-0">
                          Đã duyệt
                        </AppBadge>
                      )}
                      {post.status === 3 && (
                        <AppBadge variant="error" soft className="text-[10px] py-0 px-1.5 h-5 font-semibold shrink-0">
                          Từ chối
                        </AppBadge>
                      )}
                      {post.status === 0 && (
                        <AppBadge variant="secondary" soft className="text-[10px] py-0 px-1.5 h-5 font-semibold shrink-0">
                          Ẩn
                        </AppBadge>
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
                      <AppBadge key={tag} variant="secondary" soft className="text-[10px] px-1.5 py-0 font-medium">
                        {tag}
                      </AppBadge>
                    ))}
                  </div>
                )}
                <div className={cn(
                  "flex items-center gap-4 text-xs font-medium text-muted-foreground shrink-0",
                  isPending && "opacity-40 pointer-events-none select-none"
                )}>
                  {/* Voting Pill */}
                  <div className="flex items-center gap-1 bg-slate-100 hover:bg-slate-200/80 dark:bg-slate-800 dark:hover:bg-slate-700/80 rounded-full px-2 py-0.5 border border-transparent transition-colors">
                    <button
                      onClick={(e) => handleVote(e, 1)}
                      disabled={isPending}
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
                      disabled={isPending}
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
                    disabled={isPending}
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
                    disabled={isPending}
                    className="flex items-center gap-1.5 hover:text-primary transition-colors"
                    title={isPending ? "Bài đang chờ duyệt" : "Chia sẻ liên kết"}
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
        </AppCardContent>
      </AppCard>
    </Link>
  );
};

