import { useState, useEffect, useRef } from 'react';
import threadService from '@/services/forum/threadService';
import threadReportService from '@/services/forum/threadReportService';
import commentService from '@/services/forum/commentService';
import { toast } from 'sonner';

export default function useForumDetail(slug) {
  const [post, setPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem('user')); } catch { return null; }
  });
  
  const [postLiked, setPostLiked] = useState(false);
  const [postVoteStatus, setPostVoteStatus] = useState(0);
  const [relatedPosts, setRelatedPosts] = useState([]);
  const [hasReported, setHasReported] = useState(false);
  const [isSubmittingReport, setIsSubmittingReport] = useState(false);

  const hasIncrementedView = useRef(false);

  useEffect(() => {
    const fetchPostData = async () => {
      setIsLoading(true);
      try {
        const postData = await threadService.getThreadBySlug(slug);
        setPost(postData);
        
        // Parallel requests for other data using postData.id
        const [commentsData, relatedData] = await Promise.all([
            commentService.getCommentsByThreadId(postData.id).catch(() => []),
            threadService.getRelatedThreads(postData.id).catch(() => [])
        ]);
        
        setComments(commentsData);
        // Filter out the current post from related posts
        const filtered = Array.isArray(relatedData)
          ? relatedData.filter(p => p.id !== postData.id)
          : [];
        setRelatedPosts(filtered);

        // Fetch user specific data if logged in
        const userData = JSON.parse(localStorage.getItem('user'));
        const email = userData?.email;
        if (email) {
            const [likeStatus, reportStatus, voteStatusRes] = await Promise.all([
                threadService.getLikeStatus(postData.id, email).catch(() => ({ isLiked: false })),
                threadReportService.checkReportStatus(postData.id, email).catch(() => false),
                threadService.getVoteStatus(postData.id, email).catch(() => ({ voteType: 0 }))
            ]);
            setPostLiked(likeStatus.isLiked);
            setHasReported(reportStatus);
            setPostVoteStatus(voteStatusRes.voteType || 0);
        }

        // Increment view count
        if (!hasIncrementedView.current) {
            await threadService.viewThread(postData.id).catch(() => {});
            hasIncrementedView.current = true;
        }

      } catch (err) {
        console.error("Error fetching forum detail:", err);
        setError("Không thể tải bài viết. Vui lòng thử lại sau.");
      } finally {
        setIsLoading(false);
      }
    };

    if (slug) fetchPostData();
  }, [slug]);

  const handleSendReport = async (reportType, reportDetail, onSuccess) => {
    if (!reportType) {
      toast.error("Vui lòng chọn vi phạm");
      return;
    }
    
    setIsSubmittingReport(true);
    try {
      const userData = JSON.parse(localStorage.getItem('user'));
      const userEmail = userData?.email;
      
      if (!userEmail) {
        toast.error("Vui lòng đăng nhập để thực hiện chức năng này.");
        return;
      }

      await threadReportService.createReport(post.id, userEmail, reportType, reportDetail);
      
      toast.success("Đã gửi báo cáo");
      setHasReported(true);
      if (onSuccess) onSuccess();
    } catch (error) {
      console.error("Error reporting thread:", error);
      const errorData = error.response?.data;
      if (typeof errorData === 'string' && errorData.includes("Bạn đã báo cáo")) {
        toast.error("Bạn đã báo cáo bài viết này rồi");
        setHasReported(true);
      } else if (errorData?.message?.includes("Bạn đã báo cáo")) {
        toast.error("Bạn đã báo cáo bài viết này rồi");
        setHasReported(true);
      } else {
        toast.error("Đã có lỗi xảy ra khi gửi báo cáo.");
      }
    } finally {
      setIsSubmittingReport(false);
    }
  };

  const handleSendComment = async (content, onSuccess) => {
    if (!content.trim()) return;
    try {
      const userData = JSON.parse(localStorage.getItem('user'));
      const userEmail = userData?.email;

      const newComment = await commentService.addComment({
        content: content,
        threadId: post.id,
        userEmail: userEmail,
        parentId: null
      });

      setComments(prev => [newComment, ...prev]);
      setPost(prev => ({
        ...prev,
        commentCount: (prev.commentCount || 0) + 1
      }));
      toast.success("Đã gửi bình luận");
      if (onSuccess) onSuccess();
    } catch (err) {
      console.error("Error sending comment:", err);
      const errorMsg = err.response?.data?.message || err.response?.data || err.message;
      toast.error("Lỗi khi gửi bình luận: " + errorMsg);
    }
  };

  const handleToggleLike = async () => {
    try {
        const userData = JSON.parse(localStorage.getItem('user'));
        const userEmail = userData?.email;
        if (!userEmail) {
            toast.error("Vui lòng đăng nhập để thích bài viết!");
            return;
        }

        const updatedPost = await threadService.toggleLike(post.id, userEmail);
        setPost(updatedPost);
        
        if (!postLiked) {
            toast.success("Đã thích bài viết");
        }
        setPostLiked(!postLiked);
    } catch (err) {
        console.error("Error liking thread:", err);
        toast.error("Không thể thực hiện thao tác Thích");
    }
  };

  const handleVote = async (voteValue) => {
    try {
        const userData = JSON.parse(localStorage.getItem('user'));
        const userEmail = userData?.email;
        if (!userEmail) {
            toast.error("Vui lòng đăng nhập để bình chọn bài viết!");
            return;
        }

        let newVote = 0;
        if (voteValue === 1) { // Upvote
          newVote = postVoteStatus === 1 ? 0 : 1;
        } else { // Downvote
          newVote = postVoteStatus === -1 ? 0 : -1;
        }

        const updatedPost = await threadService.voteThread(post.id, userEmail, newVote);
        setPost(updatedPost);
        setPostVoteStatus(newVote);
        if (newVote === 1) {
            toast.success("Đã bình chọn lên bài viết");
        } else if (newVote === -1) {
            toast.success("Đã bình chọn xuống bài viết");
        }
    } catch (err) {
        console.error("Error voting thread:", err);
        toast.error("Không thể thực hiện thao tác bình chọn");
    }
  };

  const handleCommentAdded = (newReply, parentId) => {
      setComments(prev => {
        const addToTree = (list) => {
          return list.map(item => {
            if (item.id === parentId) {
              return { ...item, replies: [...(item.replies || []), newReply] };
            }
            if (item.replies && item.replies.length > 0) {
              return { ...item, replies: addToTree(item.replies) };
            }
            return item;
          });
        };
        return addToTree(prev);
      });
  };

  const handleCommentDeleted = (deletedId) => {
      setComments(prev => {
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
  };

  return {
    post,
    comments,
    isLoading,
    error,
    currentUser,
    postLiked,
    postVoteStatus,
    relatedPosts,
    hasReported,
    isSubmittingReport,
    handleSendReport,
    handleSendComment,
    handleToggleLike,
    handleVote,
    handleCommentAdded,
    handleCommentDeleted
  };
}
