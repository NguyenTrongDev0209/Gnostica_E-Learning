import AppText from '../../components/ui/AppText';
import React, { useState, useEffect, useRef } from 'react';
import { View, ScrollView, TouchableOpacity, TextInput, KeyboardAvoidingView, Platform, ActivityIndicator, Alert, Image, useWindowDimensions } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { MessageCircle, Send, ArrowBigUp, ArrowBigDown, Heart, X, CornerDownRight, Trash2 } from 'lucide-react-native';
import RenderHtml from 'react-native-render-html';
import AppHeader from '../../components/ui/AppHeader';
import commentService from '../../services/forum/commentService';
import threadService from '../../services/forum/threadService';
import { useAuth } from '../../context/AuthContext';

const addReplyToTree = (list, parentId, newReply) => {
    return list.map(c => {
        if (c.id === parentId) {
            return {
                ...c,
                replies: [...(c.replies || []), newReply]
            };
        }
        if (c.replies && c.replies.length > 0) {
            return {
                ...c,
                replies: addReplyToTree(c.replies, parentId, newReply)
            };
        }
        return c;
    });
};

const removeCommentFromTree = (list, targetId) => {
    return list
        .filter(c => c.id !== targetId)
        .map(c => {
            if (c.replies && c.replies.length > 0) {
                return {
                    ...c,
                    replies: removeCommentFromTree(c.replies, targetId)
                };
            }
            return c;
        });
};

const ForumDetailScreen = () => {
    const navigation = useNavigation();
    const route = useRoute();
    const inputRef = useRef(null);
    const { width } = useWindowDimensions();
    const { user } = useAuth();
    const { post: initialPost } = route.params || { post: {} };
    
    const [post, setPost] = useState(initialPost);
    const [comments, setComments] = useState([]);
    const [reply, setReply] = useState('');
    const [replyTarget, setReplyTarget] = useState(null); // { id, authorName }
    const [loadingComments, setLoadingComments] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [isLiked, setIsLiked] = useState(initialPost.userLiked || false);
    const [likesCount, setLikesCount] = useState(initialPost.likes || 0);

    useEffect(() => {
        const fetchDetails = async () => {
            if (!post.id) return;
            try {
                // Increment view
                await threadService.incrementView(post.id);

                // Fetch full thread data and comments in parallel
                const [threadRes, commentsRes] = await Promise.all([
                    threadService.getById(post.id),
                    commentService.getByThreadId(post.id)
                ]);

                const fetchedThread = threadRes?.data || (threadRes?.id ? threadRes : null);
                if (fetchedThread) {
                    setPost(prev => ({ ...prev, ...fetchedThread }));
                    if (fetchedThread.likes != null) setLikesCount(fetchedThread.likes);
                    if (fetchedThread.userLiked != null) setIsLiked(fetchedThread.userLiked);
                }

                const commentsData = commentsRes.data || commentsRes.content || commentsRes;
                if (Array.isArray(commentsData)) {
                    setComments(commentsData);
                } else if (commentsData?.content && Array.isArray(commentsData.content)) {
                    setComments(commentsData.content);
                }
            } catch (error) {
                console.error('Error fetching thread details:', error);
            } finally {
                setLoadingComments(false);
            }
        };

        fetchDetails();
    }, [post.id, user]);

    const handleVote = async (targetVoteValue) => {
        if (!user) {
            Alert.alert('Thông báo', 'Vui lòng đăng nhập để bình chọn.');
            return;
        }
        const currentVote = post.userVote || 0;
        const newVoteValue = currentVote === targetVoteValue ? 0 : targetVoteValue;
        const oldScore = post.voteScore != null ? post.voteScore : 0;
        const diff = newVoteValue - currentVote;

        setPost(prev => ({
            ...prev,
            userVote: newVoteValue,
            voteScore: oldScore + diff
        }));

        try {
            await threadService.vote(post.id, user.email, newVoteValue);
        } catch (error) {
            console.error('Error voting post:', error);
            setPost(prev => ({
                ...prev,
                userVote: currentVote,
                voteScore: oldScore
            }));
        }
    };

    const handleLike = async () => {
        if (!user) {
            Alert.alert('Thông báo', 'Vui lòng đăng nhập để thích bài viết.');
            return;
        }
        const nextLiked = !isLiked;
        const diff = nextLiked ? 1 : -1;
        setIsLiked(nextLiked);
        setLikesCount(prev => prev + diff);

        try {
            await threadService.like(post.id, user.email);
        } catch (error) {
            console.error('Error liking post', error);
            setIsLiked(!nextLiked);
            setLikesCount(prev => prev - diff);
        }
    };

    const handleStartReply = (comment) => {
        const name = comment.account?.fullName || comment.account?.name || comment.account?.username || comment.authorName || (comment.userEmail ? comment.userEmail.split('@')[0] : 'Học viên');
        setReplyTarget({ id: comment.id, authorName: name });
        setTimeout(() => {
            inputRef.current?.focus();
        }, 100);
    };

    const handleDeleteComment = (commentId) => {
        if (!user?.email) return;
        Alert.alert(
            'Xác nhận xóa',
            'Bạn có chắc chắn muốn xóa bình luận này?',
            [
                { text: 'Hủy', style: 'cancel' },
                {
                    text: 'Xóa',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await commentService.delete(commentId, user.email);
                            setComments(prev => removeCommentFromTree(prev, commentId));
                        } catch (error) {
                            console.error('Error deleting comment:', error);
                            Alert.alert('Lỗi', error?.message || 'Không thể xóa bình luận lúc này.');
                        }
                    }
                }
            ]
        );
    };

    const handleSendComment = async () => {
        if (!user) {
            Alert.alert('Thông báo', 'Vui lòng đăng nhập để bình luận.');
            return;
        }
        if (!reply.trim()) return;

        setSubmitting(true);
        try {
            const payload = {
                content: reply.trim(),
                targetType: 'THREAD',
                targetId: String(post.id),
                userEmail: user.email,
                ...(replyTarget?.id && { parentId: replyTarget.id })
            };
            const newComment = await commentService.create(payload);
            
            const rawRes = newComment?.data || newComment;
            const createdId = rawRes?.id || `temp-${Date.now()}-${Math.random()}`;
            const userName = user.fullName || user.name || (user.email ? user.email.split('@')[0] : 'Học viên');

            let created;
            if (typeof rawRes === 'object' && rawRes !== null && rawRes.id) {
                created = {
                    ...rawRes,
                    id: createdId,
                    account: rawRes.account || { fullName: userName, email: user.email }
                };
            } else {
                created = {
                    id: createdId,
                    content: reply.trim(),
                    authorName: userName,
                    account: { fullName: userName, email: user.email },
                    createdAt: new Date().toISOString(),
                    parent: replyTarget ? { id: replyTarget.id } : null
                };
            }
            
            if (replyTarget?.id) {
                setComments(prev => addReplyToTree(prev, replyTarget.id, created));
            } else {
                setComments(prev => [created, ...prev]);
            }

            setReply('');
            setReplyTarget(null);
        } catch (error) {
            console.error('Error adding comment', error);
            Alert.alert('Lỗi', error?.message || 'Không thể gửi bình luận lúc này.');
        } finally {
            setSubmitting(false);
        }
    };

    const authorName = post.account?.fullName || post.account?.name || post.account?.username || post.authorName || 'Học viên';
    const avatarUrl = post.account?.avatarUrl || post.authorAvatar;
    const categoryName = post.topic?.name || post.category?.name || 'Thảo luận';
    const formattedDate = post.createdAt ? new Date(post.createdAt).toLocaleDateString('vi-VN') : (post.time || 'Gần đây');

    const renderCommentItem = (comment, depth = 0, parentAuthorName = null, index = 0) => {
        const commentAuthor = comment.account?.fullName || comment.account?.name || comment.account?.username || comment.authorName || (comment.userEmail ? comment.userEmail.split('@')[0] : 'Học viên');
        const commentDate = comment.createdAt ? new Date(comment.createdAt).toLocaleDateString('vi-VN') : (comment.time || 'Vừa xong');
        const commentAvatar = comment.account?.avatarUrl || comment.authorAvatar;
        const itemKey = comment?.id != null ? `comment-${comment.id}` : `comment-depth${depth}-idx${index}-${Math.random()}`;

        const commentEmail = comment.account?.email || comment.userEmail;
        const postAuthorEmail = post.account?.email || post.userEmail || post.authorEmail;
        const isCommentOwner = user?.email && commentEmail && user.email.toLowerCase() === commentEmail.toLowerCase();
        const isPostOwner = user?.email && postAuthorEmail && user.email.toLowerCase() === postAuthorEmail.toLowerCase();
        const canDelete = isCommentOwner || isPostOwner;

        const indentClass = depth > 0 
            ? (depth === 1 ? 'ml-4 pl-3 border-l-2 border-blue-400 bg-blue-50/40' : 'ml-3 pl-2 border-l-2 border-slate-300 bg-slate-100/50') 
            : 'bg-slate-50';

        return (
            <View key={itemKey} className={`mb-3 p-3.5 rounded-2xl ${indentClass}`}>
                <View className="flex-row justify-between items-center mb-1.5">
                    <View className="flex-row items-center gap-2 flex-wrap">
                        {depth > 0 && <CornerDownRight size={14} color="#3b82f6" />}
                        <View className="w-6 h-6 rounded-full bg-blue-100 items-center justify-center overflow-hidden">
                            {commentAvatar ? (
                                <Image source={{ uri: commentAvatar }} className="w-full h-full" />
                            ) : (
                                <AppText className="text-blue-600 font-bold text-[10px]">{commentAuthor.substring(0, 2).toUpperCase()}</AppText>
                            )}
                        </View>
                        <AppText className="text-slate-900 font-bold text-xs">{commentAuthor}</AppText>
                        {parentAuthorName && (
                            <View className="bg-blue-100 px-1.5 py-0.5 rounded">
                                <AppText className="text-blue-700 text-[10px] font-semibold">@{parentAuthorName}</AppText>
                            </View>
                        )}
                    </View>
                    <AppText className="text-slate-400 text-[10px]">{commentDate}</AppText>
                </View>

                <AppText className="text-slate-700 text-sm mb-2">{comment.content}</AppText>

                {/* Action Buttons: Reply & Delete */}
                <View className="flex-row items-center gap-4 mt-1 pt-1">
                    <TouchableOpacity 
                        className="flex-row items-center self-start" 
                        onPress={() => handleStartReply(comment)}
                    >
                        <MessageCircle size={14} color="#2563eb" />
                        <AppText className="text-blue-600 text-xs font-semibold ml-1">Trả lời</AppText>
                    </TouchableOpacity>

                    {canDelete && (
                        <TouchableOpacity 
                            className="flex-row items-center self-start" 
                            onPress={() => handleDeleteComment(comment.id)}
                        >
                            <Trash2 size={14} color="#ef4444" />
                            <AppText className="text-red-500 text-xs font-semibold ml-1">Xóa</AppText>
                        </TouchableOpacity>
                    )}
                </View>

                {/* Render nested replies recursively */}
                {comment.replies && comment.replies.length > 0 && (
                    <View className="mt-3">
                        {comment.replies.map((replyItem, idx) => renderCommentItem(replyItem, depth + 1, commentAuthor, idx))}
                    </View>
                )}
            </View>
        );
    };

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : undefined}
            className="flex-1 bg-white"
        >
            <AppHeader title="Chi tiết bài đăng" />

            <ScrollView className="flex-1 px-4 pt-4" showsVerticalScrollIndicator={false}>
                {/* Main Post */}
                <View className="flex-row items-center mb-4">
                    <View className="w-10 h-10 rounded-full bg-blue-100 items-center justify-center overflow-hidden">
                        {avatarUrl ? (
                            <Image source={{ uri: avatarUrl }} className="w-full h-full" />
                        ) : (
                            <AppText className="text-blue-600 font-bold text-sm">{authorName.substring(0, 2).toUpperCase()}</AppText>
                        )}
                    </View>
                    <View className="ml-3">
                        <AppText className="text-slate-900 font-bold text-sm">{authorName}</AppText>
                        <AppText className="text-slate-400 text-xs">{formattedDate} • Trong {categoryName}</AppText>
                    </View>
                </View>

                <AppText className="text-slate-900 font-bold text-xl mb-4 leading-7">{post.title}</AppText>

                {/* Render HTML content properly */}
                {post.content ? (
                    <View className="mb-6">
                        <RenderHtml
                            contentWidth={width - 32}
                            source={{ html: post.content }}
                            baseStyle={{
                                fontSize: 15,
                                color: '#334155',
                                lineHeight: 24,
                            }}
                            tagsStyles={{
                                p: { marginTop: 0, marginBottom: 10 },
                                span: { fontSize: 15 },
                                img: { maxWidth: '100%' }
                            }}
                        />
                    </View>
                ) : null}

                <View className="flex-row items-center gap-3 border-t border-b border-slate-100 py-3.5 mb-6">
                    {/* Vote controls */}
                    <View className="flex-row items-center bg-slate-100 rounded-full px-3 py-1.5 gap-1.5">
                        <TouchableOpacity onPress={() => handleVote(1)} activeOpacity={0.7}>
                            <ArrowBigUp 
                                size={22} 
                                color={post.userVote === 1 ? '#2563eb' : '#64748b'} 
                                fill={post.userVote === 1 ? '#2563eb' : 'transparent'} 
                            />
                        </TouchableOpacity>
                        <AppText className={`text-sm font-bold px-1 ${post.userVote === 1 ? 'text-blue-600' : post.userVote === -1 ? 'text-red-500' : 'text-slate-700'}`}>
                            {post.voteScore != null ? post.voteScore : 0}
                        </AppText>
                        <TouchableOpacity onPress={() => handleVote(-1)} activeOpacity={0.7}>
                            <ArrowBigDown 
                                size={22} 
                                color={post.userVote === -1 ? '#ef4444' : '#64748b'} 
                                fill={post.userVote === -1 ? '#ef4444' : 'transparent'} 
                            />
                        </TouchableOpacity>
                    </View>

                    {/* Like Button (Heart) */}
                    <TouchableOpacity className="flex-row items-center bg-slate-100 rounded-full px-3 py-1.5" onPress={handleLike} activeOpacity={0.7}>
                        <Heart size={18} color={isLiked ? "#ef4444" : "#64748b"} fill={isLiked ? "#ef4444" : "transparent"} />
                        <AppText className={`text-sm ml-1.5 ${isLiked ? 'text-red-500 font-bold' : 'text-slate-600'}`}>{likesCount} Thích</AppText>
                    </TouchableOpacity>

                    {/* Comments Count */}
                    <View className="flex-row items-center ml-auto">
                        <MessageCircle size={18} color="#64748b" />
                        <AppText className="text-slate-500 text-sm ml-1.5">{comments.length || post.comments || 0} Bình luận</AppText>
                    </View>
                </View>

                {/* Comments Section */}
                <AppText className="text-slate-900 font-bold text-base mb-4">Bình luận ({comments.length || post.comments || 0})</AppText>
                
                {loadingComments ? (
                    <ActivityIndicator size="small" color="#2563EB" className="my-4" />
                ) : comments.length === 0 ? (
                    <AppText className="text-slate-400 italic mb-8">Chưa có bình luận nào. Hãy là người đầu tiên!</AppText>
                ) : (
                    comments.map((comment, index) => renderCommentItem(comment, 0, null, index))
                )}
                <View className="h-20" />
            </ScrollView>

            {/* Bottom Bar Input */}
            <View className="border-t border-slate-100 bg-white">
                {replyTarget && (
                    <View className="flex-row justify-between items-center bg-blue-50 px-4 py-2 border-b border-blue-100">
                        <AppText className="text-xs text-blue-700 font-medium">
                            Đang trả lời <AppText className="font-bold">{replyTarget.authorName}</AppText>
                        </AppText>
                        <TouchableOpacity onPress={() => setReplyTarget(null)}>
                            <X size={16} color="#1d4ed8" />
                        </TouchableOpacity>
                    </View>
                )}
                <View className="p-4 flex-row items-center gap-3">
                    <TextInput
                        ref={inputRef}
                        placeholder={replyTarget ? `Trả lời ${replyTarget.authorName}...` : "Viết bình luận của bạn..."}
                        className="flex-1 bg-slate-100 rounded-2xl px-4 py-3 text-slate-700"
                        value={reply}
                        onChangeText={setReply}
                        multiline
                    />
                    <TouchableOpacity 
                        className="bg-blue-600 w-12 h-12 rounded-2xl items-center justify-center shadow-md opacity-90"
                        onPress={handleSendComment}
                        disabled={submitting}
                    >
                        {submitting ? <ActivityIndicator size="small" color="#fff" /> : <Send size={20} color="#fff" />}
                    </TouchableOpacity>
                </View>
            </View>
        </KeyboardAvoidingView>
    );
};

export default ForumDetailScreen;
