import { useState, useEffect, useRef } from 'react';
import threadService from '@/services/forum/threadService';
import threadReportService from '@/services/forum/threadReportService';
import commentService from '@/services/forum/commentService';
import { toast } from 'sonner';

export default function useForumDetail(id) {
  const [post, setPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [postLiked, setPostLiked] = useState(false);
  const [relatedPosts, setRelatedPosts] = useState([]);
  const [hasReported, setHasReported] = useState(false);
  const [isSubmittingReport, setIsSubmittingReport] = useState(false);

  const hasIncrementedView = useRef(false);

  useEffect(() => {
    const fetchPostData = async () => {
      setIsLoading(true);
      try {
        const postData = await threadService.getThreadById(id);
        setPost(postData);
        
        // Parallel requests for other data
        const [commentsData, relatedData] = await Promise.all([
            commentService.getCommentsByThreadId(id).catch(() => []),
            threadService.getRelatedThreads(id).catch(() => [])
        ]);
        
        setComments(commentsData);
        setRelatedPosts(relatedData);

        // Fetch user specific data if logged in
        const userData = JSON.parse(localStorage.getItem('user'));
        const email = userData?.email;
        if (email) {
            const [likeStatus, reportStatus] = await Promise.all([
                threadService.getLikeStatus(id, email).catch(() => ({ isLiked: false })),
                threadReportService.checkReportStatus(id, email).catch(() => false)
            ]);
            setPostLiked(likeStatus.isLiked);
            setHasReported(reportStatus);
        }

        // Increment view count
        if (!hasIncrementedView.current) {
            await threadService.viewThread(id).catch(() => {});
            hasIncrementedView.current = true;
        }

      } catch (err) {
        console.error("Error fetching forum detail:", err);
        setError("Không thể tải bài viết. Vui lòng thử lại sau.");
      } finally {
        setIsLoading(false);
      }
    };

    if (id) fetchPostData();
  }, [id]);

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

      await threadReportService.createReport(id, userEmail, reportType, reportDetail);
      
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
        objectId: id,
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

        const updatedPost = await threadService.toggleLike(id, userEmail);
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

  const handleCommentAdded = (newReply, parentId) => {
      setComments(prev => prev.map(parent =>
        parent.id === parentId
          ? { ...parent, replies: [...(parent.replies || []), newReply] }
          : parent
      ));
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
    postLiked,
    relatedPosts,
    hasReported,
    isSubmittingReport,
    handleSendReport,
    handleSendComment,
    handleToggleLike,
    handleCommentAdded,
    handleCommentDeleted
  };
}
