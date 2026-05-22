import React from 'react';
import { Star, BookOpen, Users } from 'lucide-react';
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback, AvatarBadge } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { Link } from 'react-router-dom';

const AppCard = ({
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
                <AvatarBadge className="bg-green-500 border-2 border-white ring-0" />
              )}
            </Avatar>
            <span className="text-[11px] sm:text-sm font-semibold text-primary whitespace-nowrap">
              {instructor.name}
            </span>
          </div>

          <Badge variant="secondary" className="bg-primary text-primary-foreground hover:bg-primary border-none px-1.5 py-0.5 sm:px-2 sm:py-1 flex items-center gap-0.5 sm:gap-1 text-[9px] sm:text-xs font-bold">
            <Star className="w-2.5 h-2.5 sm:w-3 sm:h-3 fill-yellow-400 text-yellow-400" />
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
            <div className="text-sm sm:text-xl font-bold bg-button-gradient bg-clip-text text-transparent leading-none">
              {price}<span className="text-[10px] sm:text-lg ml-0.5">{currency}</span>
            </div>
            
            {originalPrice && (
              <div className="text-[10px] sm:text-sm text-muted-foreground line-through decoration-muted-foreground/50">
                {originalPrice}{currency}
              </div>
            )}
          </div>

          {discountPercentage > 0 && (
            <Badge variant="destructive" className="bg-red-500 hover:bg-red-600 text-white border-none px-1 sm:px-2 py-0.5 text-[9px] sm:text-xs font-bold rounded-sm">
              -{discountPercentage}%
            </Badge>
          )}
        </div>
      </CardContent>
    </Card>
    </Link>
  );
};

export default AppCard;

import { MessageSquare, Eye, ThumbsUp, Clock, Tag, Flame } from 'lucide-react';

/**
 * ForumPostCard - Card hiển thị một bài đăng trên diễn đàn.
 * Props:
 *  - post: { id, title, content, author: { name, avatar, status }, category, tags, createdAt, stats: { replies, views, likes }, isHot }
 *  - className
 */
export const ForumPostCard = ({ post, className }) => {
  if (!post) return null;
  return (
    <Link to={`/forum/${post.id}`} className="block">
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
                <AvatarBadge className="bg-green-500 border-2 border-white ring-0" />
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
                <span className="font-medium text-slate-700">{post.author.name}</span>
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" />
                {post.createdAt}
              </span>
            </div>

            {/* Title */}
            <h3 className="text-lg font-bold text-foreground mb-1 group-hover:text-primary transition-colors flex items-center gap-2">
              {post.isHot && <Flame className="w-4 h-4 text-orange-500 fill-orange-500 shrink-0" />}
              {post.status === false && <Badge variant="destructive" className="bg-red-500 text-white border-none text-[10px] h-5">Bị ẩn / Vi phạm</Badge>}
              <span className="line-clamp-2">{post.title}</span>
            </h3>

            {/* Snippet */}
            <p className="text-sm text-slate-500 line-clamp-2 mb-3">{post.content}</p>

            {/* Tags & Stats */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mt-auto">
            {post.tags && post.tags.length > 0 && (
              <div className="flex items-center gap-1.5 flex-wrap">
                {post.tags.map(tag => (
                  <Badge key={tag} variant="secondary" className="bg-slate-100 text-slate-600 hover:bg-slate-200 text-[10px] px-1.5 py-0 font-medium border-none shadow-none">
                    {tag}
                  </Badge>
                ))}
              </div>
            )}
              <div className="flex items-center gap-4 text-xs font-medium text-slate-500 shrink-0">
                <div className="flex items-center gap-1.5 hover:text-primary transition-colors">
                  <ThumbsUp className="w-4 h-4" /><span>{post.stats.likes}</span>
                </div>
                <div className="flex items-center gap-1.5 hover:text-primary transition-colors">
                  <MessageSquare className="w-4 h-4" /><span>{post.stats.replies}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Eye className="w-4 h-4" /><span>{post.stats.views}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Image Thumbnail */}
          {post.images && post.images.length > 0 && (
            <div className="hidden md:block w-32 h-24 shrink-0 rounded-md overflow-hidden border border-slate-100 mt-1">
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

