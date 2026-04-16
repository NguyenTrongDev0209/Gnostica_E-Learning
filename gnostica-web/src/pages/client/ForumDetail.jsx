import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link, useParams } from 'react-router-dom';
import SectionContainer, { AppBreadcrumb } from '@/components/common/AppSection';
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback, AvatarBadge } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import {
  ThumbsUp, MessageSquare, Eye, Clock, Tag, Flame, ChevronLeft,
  Flag, Send
} from 'lucide-react';
import { cn } from "@/lib/utils";
import RenderContent from '@/components/common/RenderContent';
import CommentCard from '@/components/common/CommentCard';
import { toast } from 'sonner';
// import { forumCommentsMock, relatedForumPostsMock } from "@/mocks/forum";
// import { relatedForumPostsMock } from "@/mocks/forum";

// Helper: simple markdown-like renderer exported to common

const ForumDetail = () => {
  const { id } = useParams();
  const [post, setPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [comment, setComment] = useState('');
  const [postLiked, setPostLiked] = useState(false);
  const [relatedPosts, setRelatedPosts] = useState([]);

  useEffect(() => {
    const fetchPost = async () => {
      setIsLoading(true);
      try {
        const res = await axios.get(`http://localhost:8080/api/threads/${id}`);
        setPost(res.data);
      } catch (err) {
        console.error("Error fetching post detail:", err);
        setError("Không thể tải bài viết. Vui lòng thử lại sau.");
      } finally {
        setIsLoading(false);
      }
    };
    if (id) fetchPost();
  }, [id]);

  useEffect(() => {
    const fetchComments = async () => {
      try {
        const res = await axios.get(`http://localhost:8080/api/comments/thread/${id}`);
        setComments(res.data);
      } catch (err) {
        console.error("Error fetching comments:", err);
      }
    };
    if (id) fetchComments();
  }, [id]);

  useEffect(() => {
    const fetchLikeStatus = async () => {
      try {
        const userData = JSON.parse(localStorage.getItem('user'));
        const email = userData?.email;
        if (email && id) {
          const res = await axios.get(`http://localhost:8080/api/threads/${id}/like-status?email=${email}`);
          setPostLiked(res.data.isLiked);
        }
      } catch (err) {
        console.error("Error fetching like status:", err);
      }
    };
    fetchLikeStatus();
  }, [id]);

  useEffect(() => {
    const fetchRelatedPosts = async () => {
      try {
        const res = await axios.get(`http://localhost:8080/api/threads/${id}/related`);
        setRelatedPosts(res.data);
      } catch (err) {
        console.error("Error fetching related posts:", err);
      }
    };
    if (id) fetchRelatedPosts();
  }, [id]);

  const handleSendComment = async () => {
    if (!comment.trim()) return;
    try {
      const userData = JSON.parse(localStorage.getItem('user'));
      const userEmail = userData?.email;

      const res = await axios.post('http://localhost:8080/api/comments', {
        content: comment,
        objectId: id,
        userEmail: userEmail, // Gửi email thay vì dùng token
        parentId: null
      });

      setComments(prev => [res.data, ...prev]);
      setPost(prev => ({
        ...prev,
        commentCount: (prev.commentCount || 0) + 1
      }));
      setComment('');
      toast.success("Đã gửi bình luận");
    } catch (err) {
      console.error("Error sending comment:", err);
      const errorMsg = err.response?.data?.message || err.response?.data || err.message;
      toast.error("Lỗi khi gửi bình luận: " + errorMsg);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50/50">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
          <p className="text-slate-500 font-medium">Đang tải nội dung...</p>
        </div>
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50/50">
        <div className="text-center p-8 bg-white rounded-xl shadow-sm border max-w-md">
          <h2 className="text-2xl font-bold text-slate-800 mb-2">Thao tác thất bại</h2>
          <p className="text-slate-500 mb-6">{error || "Không tìm thấy bài viết này."}</p>
          <Link to="/forum">
            <Button className="bg-button-gradient font-bold w-full">Quay lại Diễn đàn</Button>
          </Link>
        </div>
      </div>
    );
  }

  const breadcrumbItems = [
    { component: <Link to="/">Trang chủ</Link> },
    { component: <Link to="/forum">Diễn đàn</Link> },
    { label: post.content.substring(0, 30) + '...', isLast: true }
  ];

  return (
    <div className="min-h-screen bg-slate-50/50 pb-16 pt-8">
      <SectionContainer containerClassName="w-full">

        {/* Breadcrumb */}
        <AppBreadcrumb items={breadcrumbItems} />

        <div className="flex flex-col lg:flex-row gap-8">

          {/* ── Main Content ── */}
          <div className="flex-1 flex flex-col gap-6 min-w-0">

            {/* Post Card */}
            <Card className="bg-white border-border shadow-sm">
              <CardContent className="p-5 sm:p-7">
                {/* Category + Hot badge */}
                <div className="flex items-center gap-2 mb-3 flex-wrap">
                  <Badge variant="secondary" className="bg-primary/10 text-primary border-none text-xs font-semibold">
                    {post.category?.name || "Thảo luận"}
                  </Badge>
                  {(post.views || 0) > 100 && (
                    <Badge className="bg-orange-100 text-orange-600 border-none text-xs font-semibold gap-1">
                      <Flame className="w-3 h-3 fill-orange-500" /> Đang hot
                    </Badge>
                  )}
                </div>

                {/* Title (Derived from content for now as requested) */}
                <h1 className="text-xl sm:text-2xl font-bold text-foreground mb-5 leading-snug">
                  {post.content.substring(0, 100)}{(post.content.length > 100) ? '...' : ''}
                </h1>

                {/* Author meta */}
                <div className="flex items-center gap-3 mb-5 pb-5 border-b border-border">
                  <Avatar className="w-10 h-10 ring-2 ring-primary/10">
                    <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${post.account?.email || 'default'}`} alt={post.account?.fullName} />
                    <AvatarFallback className="bg-primary/10 text-primary font-bold">
                      {(post.account?.fullName || "A").substring(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-sm font-semibold text-slate-800">{post.account?.fullName || "Ẩn danh"}</p>
                    <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                      <Clock className="w-3 h-3" /> {new Date(post.createdAt).toLocaleDateString('vi-VN')}
                      <span className="mx-1">·</span>
                      <Eye className="w-3 h-3" /> {post.views || 0} lượt xem
                    </p>
                  </div>
                </div>

                {/* Post body */}
                <RenderContent text={post.content} />

                {/* Post Images Grid */}
                {post.images && post.images.length > 0 && (
                  <div className={cn(
                    "mt-8 grid gap-4",
                    post.images.length === 1 ? "grid-cols-1" : "grid-cols-1 sm:grid-cols-2"
                  )}>
                    {post.images.map((img, index) => (
                      <div key={index} className="rounded-xl overflow-hidden border border-border shadow-sm group bg-slate-50">
                        <img
                          src={img.imageUrl}
                          alt={`img-${index}`}
                          className="w-full h-auto object-contain max-h-[500px] mx-auto group-hover:scale-[1.02] transition-transform duration-500"
                        />
                      </div>
                    ))}
                  </div>
                )}

                {/* Tags */}
                <div className="flex items-center gap-1.5 flex-wrap mt-6 pt-5 border-t border-border">
                  <Tag className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <Badge variant="secondary" className="bg-slate-100 text-slate-600 hover:bg-slate-200 border-none text-xs">
                    Thảo luận
                  </Badge>
                </div>

                {/* Action bar */}
                <div className="flex items-center justify-between mt-5 flex-wrap gap-3">
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className={`gap-1.5 h-9 ${postLiked ? 'border-primary text-primary bg-primary/5' : ''}`}
                      onClick={async () => {
                        try {
                          const userData = JSON.parse(localStorage.getItem('user'));
                          const userEmail = userData?.email;
                          if (!userEmail) {
                            alert("Vui lòng đăng nhập để thích bài viết!");
                            return;
                          }

                          const res = await axios.post(`http://localhost:8080/api/threads/${id}/like`, {
                            userEmail: userEmail
                          });
                          setPost(res.data);
                          // Toggle trạng thái dựa trên việc backend vừa làm (add hoặc remove Like)
                          if (!postLiked) {
                             toast.success("Đã thích bài viết");
                          }
                          setPostLiked(!postLiked);
                        } catch (err) {
                          console.error("Error liking thread:", err);
                          toast.error("Không thể thực hiện thao tác Thích");
                        }
                      }}
                    >
                      <ThumbsUp className={`w-4 h-4 ${postLiked ? 'fill-primary' : ''}`} />
                      {post.likes || 0} Hữu ích
                    </Button>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="ghost" size="sm" className="gap-1.5 h-9 text-slate-400 hover:text-red-500">
                      <Flag className="w-4 h-4" /> Báo cáo
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Comments Section */}
            <div>
              <h2 className="text-base font-bold text-slate-800 mb-4 flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-primary" />
                {post.commentCount || 0} Bình luận
              </h2>

              <div className="flex flex-col gap-5">
                {comments.map(c => (
                  <CommentCard
                    key={c.id}
                    comment={{
                      ...c,
                      author: {
                        name: c.account?.fullName || "Ẩn danh",
                        avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${c.account?.email || 'default'}`,
                        status: "online",
                        role: c.account?.role?.name || "Member"
                      },
                      createdAt: new Date(c.createdAt).toLocaleString('vi-VN'),
                      replies: (c.replies || []).map(r => ({
                        ...r,
                        author: {
                          name: r.account?.fullName || "Ẩn danh",
                          avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${r.account?.email || 'default'}`,
                          status: "online",
                          role: r.account?.role?.name || "Member"
                        },
                        createdAt: new Date(r.createdAt).toLocaleString('vi-VN')
                      }))
                    }}
                    threadId={id}
                    onCommentAdded={(newReply) => {
                      // Refresh or update locally
                      setComments(prev => prev.map(parent =>
                        parent.id === c.id
                          ? { ...parent, replies: [...(parent.replies || []), newReply] }
                          : parent
                      ));
                    }}
                    onCommentDeleted={(deletedId) => {
                      // Xử lý xóa locally
                      setComments(prev => {
                        // Tìm comment bị xóa để biết số lượng bình luận cần giảm (bao gồm reply)
                        let countToRemove = 0;
                        const findAndCount = (list) => {
                          for (let i = 0; i < list.length; i++) {
                            if (list[i].id === deletedId) {
                               countToRemove = 1 + (list[i].replies?.length || 0);
                               return list.filter(item => item.id !== deletedId);
                            }
                            if (list[i].replies) {
                               const updatedReplies = findAndCount(list[i].replies);
                               if (countToRemove > 0) {
                                  list[i].replies = updatedReplies;
                                  return list;
                               }
                            }
                          }
                          return list;
                        };

                        const newList = findAndCount([...prev]);
                        
                        if (countToRemove > 0) {
                           setPost(curr => ({
                             ...curr,
                             commentCount: Math.max(0, (curr.commentCount || 0) - countToRemove)
                           }));
                        }
                        return newList;
                      });
                    }}
                  />
                ))}
              </div>
            </div>

            {/* Reply Box */}
            <Card className="bg-white border-border shadow-sm">
              <CardContent className="p-5">
                <h3 className="text-sm font-bold text-slate-700 mb-3">Viết bình luận của bạn</h3>
                <Textarea
                  placeholder="Chia sẻ kiến thức hoặc đặt câu hỏi thêm..."
                  className="min-h-[120px] resize-none bg-slate-50 border-slate-200 focus:bg-white transition-colors"
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                />
                <div className="flex justify-end mt-3">
                  <Button
                    className="bg-button-gradient hover:brightness-110 gap-2 font-bold"
                    disabled={!comment.trim()}
                    onClick={handleSendComment}
                  >
                    <Send className="w-4 h-4" /> Gửi bình luận
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* ── Sidebar ── */}
          <div className="w-full lg:w-72 xl:w-80 flex flex-col gap-6 shrink-0">

            {/* Author Info */}
            <Card className="bg-white shadow-sm border-border">
              <CardContent className="p-5">
                <h3 className="text-sm font-bold text-slate-700 mb-4">Thông tin tác giả</h3>
                <div className="flex items-center gap-3 mb-4">
                  <Avatar className="w-12 h-12 ring-2 ring-primary/10">
                    <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${post.account?.email || 'default'}`} />
                    <AvatarFallback className="bg-primary/10 text-primary font-bold">
                      {(post.account?.fullName || "A").substring(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-bold text-slate-800">{post.account?.fullName || "Ẩn danh"}</p>
                    <p className="text-xs text-muted-foreground">Email: {post.account?.email}</p>
                  </div>
                </div>
                <Separator className="mb-4" />
                <div className="flex justify-around text-center">
                  <div>
                    <p className="font-bold text-slate-800">{post.likes || 0}</p>
                    <p className="text-xs text-muted-foreground">Lượt thích</p>
                  </div>
                  <div>
                    <p className="font-bold text-slate-800">{post.commentCount || 0}</p>
                    <p className="text-xs text-muted-foreground">Bình luận</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Post Stats */}
            <Card className="bg-white shadow-sm border-border">
              <CardContent className="p-5">
                <h3 className="text-sm font-bold text-slate-700 mb-4">Thống kê bài viết</h3>
                <div className="flex flex-col gap-3">
                  {[
                    { icon: Eye, label: 'Lượt xem', value: post.views || 0 },
                    { icon: ThumbsUp, label: 'Lượt thích', value: post.likes || 0 },
                    { icon: MessageSquare, label: 'Bình luận', value: post.commentCount || 0 },
                  ].map(({ icon: Icon, label, value }) => (
                    <div key={label} className="flex items-center justify-between text-sm">
                      <span className="flex items-center gap-2 text-slate-500">
                        <Icon className="w-4 h-4 text-primary/70" /> {label}
                      </span>
                      <span className="font-semibold text-slate-700">{value}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Related Posts */}
            <Card className="bg-white shadow-sm border-border">
              <CardContent className="p-5">
                <h3 className="text-sm font-bold text-slate-700 mb-4">Bài viết liên quan</h3>
                <div className="flex flex-col gap-3">
                  {relatedPosts.length > 0 ? (
                    relatedPosts.map(p => (
                      <Link
                        key={p.id}
                        to={`/forum/${p.id}`}
                        className="group flex flex-col gap-1 hover:bg-slate-50 rounded-md p-2 -mx-2 transition-colors"
                      >
                        <span className="text-xs text-primary font-medium">{p.category?.name || "Thảo luận"}</span>
                        <span className="text-sm font-medium text-slate-700 group-hover:text-primary transition-colors line-clamp-2 leading-snug">
                          {p.content.substring(0, 70)}{p.content.length > 70 ? '...' : ''}
                        </span>
                      </Link>
                    ))
                  ) : (
                    <p className="text-xs text-slate-400 text-center py-2">Không có bài viết liên quan</p>
                  )}
                </div>

                <Separator className="my-4" />
                <Link to="/forum">
                  <Button variant="outline" className="w-full text-sm gap-2" size="sm">
                    <ChevronLeft className="w-4 h-4" /> Quay về diễn đàn
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </SectionContainer>
    </div>
  );
};

export default ForumDetail;
