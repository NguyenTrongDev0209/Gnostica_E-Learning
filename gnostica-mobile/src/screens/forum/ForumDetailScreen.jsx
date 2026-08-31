import AppText from '../../components/ui/AppText';
import React, { useState, useEffect, useRef } from 'react';
import { View, ScrollView, TouchableOpacity, TextInput, KeyboardAvoidingView, Platform, ActivityIndicator, Alert, Image, useWindowDimensions, Modal, Share } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { MessageCircle, Send, ArrowBigUp, ArrowBigDown, Heart, X, CornerDownRight, Trash2, MoreHorizontal, Share2, Flag, Plus } from 'lucide-react-native';
import RenderHtml from 'react-native-render-html';
import AppHeader from '../../components/ui/AppHeader';
import FloatingAiButton from '../../components/ui/FloatingAiButton';
import commentService from '../../services/forum/commentService';
import threadService from '../../services/forum/threadService';
import threadReportService from '../../services/forum/threadReportService';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { LinearGradient } from 'expo-linear-gradient';

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
    const { isDarkMode } = useTheme();
    const initialPost = route.params?.post || (
        (route.params?.id || route.params?.threadId) ? {
            id: route.params?.id || route.params?.threadId,
            title: route.params?.title || 'Bài viết diễn đàn'
        } : {}
    );
    const [post, setPost] = useState(initialPost);
    const [comments, setComments] = useState([]);
    const [reply, setReply] = useState('');
    const [replyTarget, setReplyTarget] = useState(null); // { id, authorName }
    const [loadingComments, setLoadingComments] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [isLiked, setIsLiked] = useState(initialPost.userLiked || false);
    const [likesCount, setLikesCount] = useState(initialPost.likes || 0);
    const [showMenu, setShowMenu] = useState(false);
    const [showReportModal, setShowReportModal] = useState(false);
    const [reportType, setReportType] = useState('');
    const [reportDetail, setReportDetail] = useState('');
    const [hasReported, setHasReported] = useState(false);
    const [submittingReport, setSubmittingReport] = useState(false);

    useEffect(() => {
        const fetchDetails = async () => {
            if (!post?.id || isNaN(Number(post.id))) {
                setLoadingComments(false);
                return;
            }
            const numericId = Number(post.id);

            try {
                await threadService.incrementView(numericId).catch(() => {});

                const [threadRes, commentsRes] = await Promise.all([
                    threadService.getById(numericId).catch(() => null),
                    commentService.getByThreadId(numericId).catch(() => null)
                ]);

                const fetchedThread = threadRes?.data || (threadRes?.id ? threadRes : null);
                if (fetchedThread) {
                    setPost(prev => ({ ...prev, ...fetchedThread }));
                    if (fetchedThread.likes != null) setLikesCount(fetchedThread.likes);
                    if (fetchedThread.userLiked != null) setIsLiked(fetchedThread.userLiked);
                }

                const commentsData = commentsRes?.data || commentsRes?.content || commentsRes;
                if (Array.isArray(commentsData)) {
                    setComments(commentsData);
                } else if (commentsData?.content && Array.isArray(commentsData.content)) {
                    setComments(commentsData.content);
                }

                if (user?.email) {
                    threadReportService.checkReportStatus(numericId, user.email)
                        .then(res => {
                            const isRep = res?.data ?? res;
                            if (isRep === true) setHasReported(true);
                        })
                        .catch(() => {});
                }
            } catch (error) {
                console.error('Error fetching thread details:', error);
            } finally {
                setLoadingComments(false);
            }
        };

        fetchDetails();
    }, [post?.id, user]);

    const handleVote = async (targetVoteValue) => {
        if (!user) {
            Alert.alert('Thông báo', 'Vui lòng đăng nhập để bình chọn.');
            return;
        }
        const currentVote = post.userVote || 0;
        const oldScore = post.voteScore || 0;
        let newVote = 0;
        let newScore = oldScore;

        if (targetVoteValue === 1) {
            newVote = currentVote === 1 ? 0 : 1;
        } else {
            newVote = currentVote === -1 ? 0 : -1;
        }

        if (currentVote === 1 && newVote === 0) newScore -= 1;
        else if (currentVote === 1 && newVote === -1) newScore -= 2;
        else if (currentVote === -1 && newVote === 0) newScore += 1;
        else if (currentVote === -1 && newVote === 1) newScore += 2;
        else if (currentVote === 0 && newVote === 1) newScore += 1;
        else if (currentVote === 0 && newVote === -1) newScore -= 1;

        setPost(prev => ({
            ...prev,
            userVote: newVote,
            voteScore: newScore
        }));

        try {
            await threadService.vote(post.id, user.email, newVote);
        } catch (error) {
            console.error('Error voting post', error);
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

        const authorEmail = post?.authorEmail || post?.account?.email;
        if (authorEmail && authorEmail === user.email) {
            Alert.alert('Thông báo', 'Bạn không thể thích bài viết của chính mình!');
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

    const handleShare = async () => {
        setShowMenu(false);
        try {
            await Share.share({
                message: `${post.title}\n\nXem bài viết tại Gnostica`,
                title: post.title,
            });
        } catch (e) {
            console.error('Share error:', e);
        }
    };

    const handleOpenReport = () => {
        setShowMenu(false);
        if (!user) {
            Alert.alert('Thông báo', 'Vui lòng đăng nhập để tố cáo bài viết.');
            return;
        }
        if (hasReported) {
            Alert.alert('Thông báo', 'Bạn đã tố cáo bài viết này rồi.');
            return;
        }
        setReportType('');
        setReportDetail('');
        setShowReportModal(true);
    };

    const handleSubmitReport = async () => {
        if (!reportType) {
            Alert.alert('Lỗi', 'Vui lòng chọn loại vi phạm.');
            return;
        }
        setSubmittingReport(true);
        try {
            await threadReportService.createReport(post.id, user.email, reportType, reportDetail);
            setHasReported(true);
            setShowReportModal(false);
            Alert.alert('Thành công', 'Báo cáo của bạn đã được gửi. Cảm ơn bạn!');
        } catch (e) {
            const errorMsg = e?.message || e?.response?.data?.message || (typeof e === 'string' ? e : '');
            if (errorMsg.includes('đã báo cáo')) {
                setHasReported(true);
                setShowReportModal(false);
                Alert.alert('Thông báo', 'Bạn đã tố cáo bài viết này rồi.');
            } else if (errorMsg) {
                Alert.alert('Lỗi', errorMsg);
            } else {
                Alert.alert('Lỗi', 'Không thể gửi báo cáo. Vui lòng thử lại.');
            }
        } finally {
            setSubmittingReport(false);
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
    const getHashtagBadge = (p) => {
        if (p?.hashtags && p.hashtags.length > 0) {
            const list = p.hashtags
                .map(h => h?.hashtag?.name || h?.name)
                .filter(Boolean)
                .slice(0, 3)
                .map(name => (name.startsWith('#') ? name : `#${name}`));
            if (list.length > 0) return list.join(' ');
        }
        if (p?.tags && p.tags.length > 0) {
            const list = p.tags
                .filter(Boolean)
                .slice(0, 3)
                .map(t => (t.startsWith('#') ? t : `#${t}`));
            if (list.length > 0) return list.join(' ');
        }
        const cat = p?.topic?.name || p?.topic?.title || p?.category?.name;
        if (!cat || cat === 'Thảo luận') return '#Gnostica';
        return cat.startsWith('#') ? cat : `#${cat.replace(/\s+/g, '')}`;
    };
    const categoryName = getHashtagBadge(post);
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
            ? (depth === 1 ? (isDarkMode ? 'ml-4 pl-3 border-l-2 border-blue-500 bg-slate-800/90' : 'ml-4 pl-3 border-l-2 border-blue-400 bg-blue-50/40') : (isDarkMode ? 'ml-3 pl-2 border-l-2 border-slate-600 bg-slate-800/60' : 'ml-3 pl-2 border-l-2 border-slate-300 bg-slate-100/50'))
            : (isDarkMode ? 'bg-slate-800/80' : 'bg-slate-50');

        return (
            <View key={itemKey} className={`mb-3 p-3.5 rounded-2xl ${indentClass}`}>
                <View className="flex-row justify-between items-center mb-1.5">
                    <View className="flex-row items-center gap-2 flex-wrap">
                        {depth > 0 && <CornerDownRight size={14} color="#3b82f6" />}
                        <View className="w-6 h-6 rounded-full bg-blue-600 items-center justify-center overflow-hidden">
                            {commentAvatar ? (
                                <Image source={{ uri: commentAvatar }} className="w-full h-full" />
                            ) : (
                                <AppText className="text-white font-bold text-[10px]">{commentAuthor.substring(0, 2).toUpperCase()}</AppText>
                            )}
                        </View>
                        <AppText className={`font-bold text-xs ${isDarkMode ? 'text-slate-100' : 'text-slate-900'}`}>{commentAuthor}</AppText>
                        {parentAuthorName && (
                            <View className={`${isDarkMode ? 'bg-blue-950/80' : 'bg-blue-100'} px-1.5 py-0.5 rounded`}>
                                <AppText className="text-blue-400 text-[10px] font-semibold">@{parentAuthorName}</AppText>
                            </View>
                        )}
                    </View>
                    <AppText className={`text-[10px] ${isDarkMode ? 'text-slate-400' : 'text-slate-400'}`}>{commentDate}</AppText>
                </View>

                <AppText className={`text-sm mb-2 ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>{comment.content}</AppText>

                {/* Action Buttons: Reply & Delete */}
                <View className="flex-row items-center gap-4 mt-1 pt-1">
                    <TouchableOpacity
                        className="flex-row items-center self-start"
                        onPress={() => handleStartReply(comment)}
                    >
                        <MessageCircle size={14} color="#3b82f6" />
                        <AppText className="text-blue-500 text-xs font-semibold ml-1">Trả lời</AppText>
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
            className={`flex-1 ${isDarkMode ? 'bg-slate-900' : 'bg-white'}`}
        >
            <AppHeader 
                title="Chi tiết bài đăng" 
                className={isDarkMode ? '!bg-slate-800 !border-slate-700' : ''}
                titleClassName={isDarkMode ? '!text-slate-100' : ''}
            />

            <ScrollView className="flex-1 px-4 pt-4" showsVerticalScrollIndicator={false}>
                {/* Main Post */}
                <View className="flex-row items-center mb-4">
                    <View className="w-10 h-10 rounded-full bg-blue-600 items-center justify-center overflow-hidden">
                        {avatarUrl ? (
                            <Image source={{ uri: avatarUrl }} className="w-full h-full" />
                        ) : (
                            <AppText className="text-white font-bold text-sm">{authorName.substring(0, 2).toUpperCase()}</AppText>
                        )}
                    </View>
                    <View className="ml-3">
                        <AppText className={`font-bold text-sm ${isDarkMode ? 'text-slate-100' : 'text-slate-900'}`}>{authorName}</AppText>
                        <AppText className={`text-xs ${isDarkMode ? 'text-slate-400' : 'text-slate-400'}`}>{formattedDate} • Trong {categoryName} • {post.viewCount ?? post.views ?? 1} lượt xem</AppText>
                    </View>
                </View>

                <AppText className={`font-bold text-xl mb-4 leading-7 ${isDarkMode ? 'text-slate-100' : 'text-slate-900'}`}>{post.title}</AppText>

                {/* Render HTML content properly */}
                {post.content ? (
                    <View className="mb-6">
                        <RenderHtml
                            contentWidth={width - 32}
                            source={{ html: post.content }}
                            baseStyle={{
                                fontSize: 15,
                                color: isDarkMode ? '#cbd5e1' : '#334155',
                                lineHeight: 24,
                            }}
                            tagsStyles={{
                                p: { marginTop: 0, marginBottom: 10 },
                                span: { fontSize: 15, color: isDarkMode ? '#cbd5e1' : '#334155' },
                                img: {
                                    maxWidth: width - 32,
                                    width: width - 32,
                                    height: 'auto',
                                    borderRadius: 10,
                                    marginVertical: 8,
                                    alignSelf: 'center',
                                },
                            }}
                            renderersProps={{
                                img: {
                                    enableExperimentalPercentWidth: true,
                                },
                            }}
                        />
                    </View>
                ) : null}

                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, borderTopWidth: 1, borderBottomWidth: 1, borderColor: isDarkMode ? '#334155' : '#f1f5f9', paddingVertical: 12, marginBottom: 24 }}>
                    {/* Vote controls */}
                    <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: isDarkMode ? '#1e293b' : '#f1f5f9', borderRadius: 99, paddingHorizontal: 10, paddingVertical: 6, gap: 4 }}>
                        <TouchableOpacity onPress={() => handleVote(1)} activeOpacity={0.7}>
                            <ArrowBigUp size={22} color={post.userVote === 1 ? '#3b82f6' : (isDarkMode ? '#94a3b8' : '#64748b')} fill={post.userVote === 1 ? '#3b82f6' : 'transparent'} />
                        </TouchableOpacity>
                        <AppText style={{ fontSize: 13, fontWeight: 'bold', paddingHorizontal: 2, color: post.userVote === 1 ? '#3b82f6' : post.userVote === -1 ? '#ef4444' : (isDarkMode ? '#f8fafc' : '#334155') }}>
                            {post.voteScore != null ? post.voteScore : 0}
                        </AppText>
                        <TouchableOpacity onPress={() => handleVote(-1)} activeOpacity={0.7}>
                            <ArrowBigDown size={22} color={post.userVote === -1 ? '#ef4444' : (isDarkMode ? '#94a3b8' : '#64748b')} fill={post.userVote === -1 ? '#ef4444' : 'transparent'} />
                        </TouchableOpacity>
                    </View>

                    {/* Like Button */}
                    <TouchableOpacity onPress={handleLike} activeOpacity={0.7}
                        style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: isDarkMode ? '#1e293b' : '#f1f5f9', borderRadius: 99, paddingHorizontal: 12, paddingVertical: 7 }}>
                        <Heart size={17} color={isLiked ? '#ef4444' : (isDarkMode ? '#94a3b8' : '#64748b')} fill={isLiked ? '#ef4444' : 'transparent'} />
                        <AppText style={{ fontSize: 13, marginLeft: 5, color: isLiked ? '#ef4444' : (isDarkMode ? '#cbd5e1' : '#64748b'), fontWeight: isLiked ? 'bold' : 'normal' }}>{likesCount}</AppText>
                    </TouchableOpacity>

                    {/* Comment Count (no label) */}
                    <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: isDarkMode ? '#1e293b' : '#f1f5f9', borderRadius: 99, paddingHorizontal: 12, paddingVertical: 7 }}>
                        <MessageCircle size={17} color={isDarkMode ? '#94a3b8' : '#64748b'} />
                        <AppText style={{ fontSize: 13, marginLeft: 5, color: isDarkMode ? '#cbd5e1' : '#64748b' }}>{comments.length || post.commentCount || post.comments || 0}</AppText>
                    </View>

                    {/* More (...) button */}
                    <TouchableOpacity
                        onPress={() => setShowMenu(true)}
                        activeOpacity={0.7}
                        style={{ marginLeft: 'auto', width: 36, height: 36, borderRadius: 18, backgroundColor: isDarkMode ? '#1e293b' : '#f1f5f9', alignItems: 'center', justifyContent: 'center' }}
                    >
                        <MoreHorizontal size={20} color={isDarkMode ? '#94a3b8' : '#64748b'} />
                    </TouchableOpacity>
                </View>

                {/* More Menu Modal (bottom sheet style) */}
                <Modal visible={showMenu} transparent animationType="fade" onRequestClose={() => setShowMenu(false)}>
                    <TouchableOpacity
                        style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.55)' }}
                        activeOpacity={1}
                        onPress={() => setShowMenu(false)}
                    >
                        <View style={{
                            position: 'absolute', bottom: 0, left: 0, right: 0,
                            backgroundColor: isDarkMode ? '#1e293b' : '#fff', borderTopLeftRadius: 24, borderTopRightRadius: 24,
                            paddingBottom: 36, paddingTop: 8,
                        }}>
                            {/* Handle */}
                            <View style={{ width: 40, height: 4, backgroundColor: isDarkMode ? '#334155' : '#e2e8f0', borderRadius: 2, alignSelf: 'center', marginBottom: 16 }} />

                            {/* Share */}
                            <TouchableOpacity onPress={handleShare} activeOpacity={0.8}
                                style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 16, paddingHorizontal: 24, gap: 14 }}>
                                <View style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: isDarkMode ? '#0f172a' : '#eff6ff', alignItems: 'center', justifyContent: 'center' }}>
                                    <Share2 size={22} color="#3b82f6" />
                                </View>
                                <View>
                                    <AppText style={{ fontSize: 15, fontWeight: '700', color: isDarkMode ? '#f8fafc' : '#1e293b' }}>Chia sẻ</AppText>
                                    <AppText style={{ fontSize: 12, color: isDarkMode ? '#94a3b8' : '#94a3b8', marginTop: 1 }}>Chia sẻ bài viết với bạn bè</AppText>
                                </View>
                            </TouchableOpacity>

                            {/* Report */}
                            <TouchableOpacity onPress={handleOpenReport} activeOpacity={0.8}
                                style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 16, paddingHorizontal: 24, gap: 14,
                                    opacity: hasReported ? 0.5 : 1 }}>
                                <View style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: hasReported ? '#451a1a' : (isDarkMode ? '#451a1a' : '#fff5f5'), alignItems: 'center', justifyContent: 'center' }}>
                                    <Flag size={22} color={hasReported ? '#dc2626' : '#ef4444'} fill={hasReported ? '#dc2626' : 'transparent'} />
                                </View>
                                <View>
                                    <AppText style={{ fontSize: 15, fontWeight: '700', color: hasReported ? '#dc2626' : '#ef4444' }}>
                                        {hasReported ? 'Đã tố cáo' : 'Tố cáo'}
                                    </AppText>
                                    <AppText style={{ fontSize: 12, color: isDarkMode ? '#94a3b8' : '#94a3b8', marginTop: 1 }}>Báo cáo nội dung vi phạm</AppText>
                                </View>
                            </TouchableOpacity>
                        </View>
                    </TouchableOpacity>
                </Modal>

                {/* Report Form Modal */}
                <Modal visible={showReportModal} transparent animationType="slide" onRequestClose={() => setShowReportModal(false)}>
                    <TouchableOpacity style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.55)' }} activeOpacity={1} onPress={() => setShowReportModal(false)} />
                    <View style={{
                        position: 'absolute', bottom: 0, left: 0, right: 0,
                        backgroundColor: isDarkMode ? '#1e293b' : '#fff', borderTopLeftRadius: 24, borderTopRightRadius: 24,
                        paddingBottom: 36, paddingHorizontal: 20, paddingTop: 8,
                    }}>
                        <View style={{ width: 40, height: 4, backgroundColor: isDarkMode ? '#334155' : '#e2e8f0', borderRadius: 2, alignSelf: 'center', marginBottom: 20 }} />
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 20 }}>
                            <View style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: isDarkMode ? '#451a1a' : '#fef2f2', alignItems: 'center', justifyContent: 'center' }}>
                                <Flag size={20} color="#ef4444" />
                            </View>
                            <View>
                                <AppText style={{ fontSize: 17, fontWeight: 'bold', color: isDarkMode ? '#f8fafc' : '#1e293b' }}>Tố cáo bài viết</AppText>
                                <AppText style={{ fontSize: 12, color: '#94a3b8' }}>Vui lòng chọn loại vi phạm</AppText>
                            </View>
                        </View>

                        {/* Report types */}
                        {[
                            { value: 'spam', label: 'Spam / Quảng cáo' },
                            { value: 'harassment', label: 'Quấy rối / Lăng mạ' },
                            { value: 'inappropriate', label: 'Nội dung không phù hợp' },
                            { value: 'copyright', label: 'Vi phạm bản quyền' },
                            { value: 'other', label: 'Khác' },
                        ].map(opt => (
                            <TouchableOpacity key={opt.value} onPress={() => setReportType(opt.value)} activeOpacity={0.8}
                                style={{
                                    flexDirection: 'row', alignItems: 'center', paddingVertical: 12,
                                    paddingHorizontal: 14, marginBottom: 8, borderRadius: 12,
                                    borderWidth: 1.5,
                                    borderColor: reportType === opt.value ? '#ef4444' : (isDarkMode ? '#334155' : '#e2e8f0'),
                                    backgroundColor: reportType === opt.value ? (isDarkMode ? '#451a1a' : '#fef2f2') : (isDarkMode ? '#0f172a' : '#f8fafc'),
                                }}>
                                <View style={{
                                    width: 18, height: 18, borderRadius: 9, borderWidth: 2,
                                    borderColor: reportType === opt.value ? '#ef4444' : '#cbd5e1',
                                    backgroundColor: reportType === opt.value ? '#ef4444' : 'transparent',
                                    marginRight: 10,
                                }} />
                                <AppText style={{ fontSize: 14, fontWeight: '600', color: reportType === opt.value ? '#ef4444' : (isDarkMode ? '#cbd5e1' : '#334155') }}>
                                    {opt.label}
                                </AppText>
                            </TouchableOpacity>
                        ))}

                        <TextInput
                            placeholder="Chi tiết vi phạm (không bắt buộc)..."
                            placeholderTextColor="#94a3b8"
                            value={reportDetail}
                            onChangeText={setReportDetail}
                            multiline
                            style={{
                                borderWidth: 1, borderColor: isDarkMode ? '#334155' : '#e2e8f0', borderRadius: 12,
                                padding: 12, marginTop: 8, marginBottom: 16,
                                minHeight: 80, fontSize: 14, color: isDarkMode ? '#f8fafc' : '#334155', textAlignVertical: 'top',
                            }}
                        />

                        <View style={{ flexDirection: 'row', gap: 10 }}>
                            <TouchableOpacity onPress={() => setShowReportModal(false)} style={{ flex: 1, paddingVertical: 14, borderRadius: 14, borderWidth: 1, borderColor: isDarkMode ? '#334155' : '#e2e8f0', alignItems: 'center' }}>
                                <AppText style={{ fontWeight: '700', color: isDarkMode ? '#cbd5e1' : '#64748b' }}>Hủy</AppText>
                            </TouchableOpacity>
                            <TouchableOpacity onPress={handleSubmitReport} disabled={submittingReport} activeOpacity={0.85} style={{ flex: 1.5, borderRadius: 14, overflow: 'hidden' }}>
                                <LinearGradient colors={['#f87171', '#dc2626']} style={{ paddingVertical: 14, alignItems: 'center' }}>
                                    {submittingReport
                                        ? <ActivityIndicator size="small" color="#fff" />
                                        : <AppText style={{ fontWeight: 'bold', color: '#fff', fontSize: 15 }}>Gửi báo cáo</AppText>
                                    }
                                </LinearGradient>
                            </TouchableOpacity>
                        </View>
                    </View>
                </Modal>

                {/* Comments Section */}
                <AppText className={`font-bold text-base mb-4 ${isDarkMode ? 'text-slate-100' : 'text-slate-900'}`}>Bình luận ({comments.length || post.comments || 0})</AppText>

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
            <View className={`border-t ${isDarkMode ? 'border-slate-800 bg-slate-900' : 'border-slate-100 bg-white'}`}>
                {replyTarget && (
                    <View className={`flex-row justify-between items-center px-4 py-2 border-b ${isDarkMode ? 'bg-blue-950/80 border-blue-900' : 'bg-blue-50 border-blue-100'}`}>
                        <AppText className="text-xs text-blue-400 font-medium">
                            Đang trả lời <AppText className="font-bold">{replyTarget.authorName}</AppText>
                        </AppText>
                        <TouchableOpacity onPress={() => setReplyTarget(null)}>
                            <X size={16} color="#3b82f6" />
                        </TouchableOpacity>
                    </View>
                )}
                <View className="p-4 flex-row items-center gap-3">
                    <TextInput
                        ref={inputRef}
                        placeholder={replyTarget ? `Trả lời ${replyTarget.authorName}...` : "Viết bình luận của bạn..."}
                        placeholderTextColor="#94a3b8"
                        className={`flex-1 rounded-2xl px-4 py-3 ${isDarkMode ? 'bg-slate-800 text-slate-100' : 'bg-slate-100 text-slate-700'}`}
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

            {/* FAB Create Post (with auto-selected category) */}
            <TouchableOpacity
                activeOpacity={0.85}
                style={{
                    position: 'absolute',
                    bottom: 140,
                    right: 20,
                    width: 42,
                    height: 42,
                    borderRadius: 21,
                    elevation: 6,
                    shadowColor: '#ea580c',
                    shadowOffset: { width: 0, height: 3 },
                    shadowOpacity: 0.3,
                    shadowRadius: 5,
                    zIndex: 999,
                }}
                onPress={() => {
                    const postCat = post?.category || post?.topic;
                    navigation.navigate('CreatePost', {
                        category: postCat,
                        categoryId: postCat?.id || post?.categoryId,
                        categoryName: postCat?.name || postCat?.title
                    });
                }}
            >
                <LinearGradient
                    colors={['#fb923c', '#ea580c']}
                    style={{
                        width: 42,
                        height: 42,
                        borderRadius: 21,
                        borderWidth: 2,
                        borderColor: '#ffffff',
                        alignItems: 'center',
                        justifyContent: 'center',
                    }}
                >
                    <Plus size={20} color="#ffffff" strokeWidth={2.4} />
                </LinearGradient>
            </TouchableOpacity>

            {/* Floating AI Assistant Button */}
            <FloatingAiButton bottomOffset={190} />
        </KeyboardAvoidingView>
    );
};

export default ForumDetailScreen;
