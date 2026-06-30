import AppText from '../../components/ui/AppText';
import React, { useState, useEffect } from 'react';
import { View, ScrollView, TouchableOpacity, TextInput, KeyboardAvoidingView, Platform, ActivityIndicator, Alert, Image } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { MessageCircle, Heart, Send, Image as ImageIcon } from 'lucide-react-native';
import AppHeader from '../../components/ui/AppHeader';
import commentService from '../../services/commentService';
import threadService from '../../services/threadService';
import { useAuth } from '../../context/AuthContext';

const ForumDetailScreen = () => {
    const navigation = useNavigation();
    const route = useRoute();
    const { user } = useAuth();
    const { post: initialPost } = route.params || { post: {} };
    
    const [post, setPost] = useState(initialPost);
    const [comments, setComments] = useState([]);
    const [reply, setReply] = useState('');
    const [loadingComments, setLoadingComments] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [isLiked, setIsLiked] = useState(false);
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

                if (threadRes.data || threadRes.content) {
                    setPost(threadRes.data || threadRes.content);
                }

                const commentsData = commentsRes.data || commentsRes.content || commentsRes;
                if (Array.isArray(commentsData)) {
                    setComments(commentsData);
                } else if (commentsData?.content && Array.isArray(commentsData.content)) {
                    setComments(commentsData.content);
                }

                // Check like status if logged in
                if (user?.email) {
                    const likeStatus = await threadService.getLikeStatus(post.id, user.email);
                    if (likeStatus.data?.isLiked) {
                        setIsLiked(true);
                    }
                }
            } catch (error) {
                console.error('Error fetching thread details:', error);
            } finally {
                setLoadingComments(false);
            }
        };

        fetchDetails();
    }, [post.id, user]);

    const handleLike = async () => {
        if (!user) {
            Alert.alert('Thông báo', 'Vui lòng đăng nhập để thích bài viết.');
            return;
        }
        try {
            await threadService.like(post.id, user.email);
            setIsLiked(!isLiked);
            setLikesCount(prev => isLiked ? prev - 1 : prev + 1);
        } catch (error) {
            console.error('Error liking post', error);
        }
    };

    const handleSendComment = async () => {
        if (!user) {
            Alert.alert('Thông báo', 'Vui lòng đăng nhập để bình luận.');
            return;
        }
        if (!reply.trim()) return;

        setSubmitting(true);
        try {
            const newComment = await commentService.create({
                content: reply.trim(),
                objectId: post.id,
                userEmail: user.email
            });
            
            // Assume the API returns the created comment, or we just append a local one
            const created = newComment.data || newComment.content || newComment || {
                id: Math.random(),
                content: reply.trim(),
                authorName: user.name,
                createdAt: 'Vừa xong'
            };
            
            setComments(prev => [created, ...prev]);
            setReply('');
        } catch (error) {
            console.error('Error adding comment', error);
            Alert.alert('Lỗi', 'Không thể gửi bình luận lúc này.');
        } finally {
            setSubmitting(false);
        }
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
                        {post.authorAvatar ? (
                            <Image source={{ uri: post.authorAvatar }} className="w-full h-full" />
                        ) : (
                            <AppText className="text-blue-600 font-bold text-sm">{post.authorName?.substring(0,2) || 'GN'}</AppText>
                        )}
                    </View>
                    <View className="ml-3">
                        <AppText className="text-slate-900 font-bold text-sm">{post.authorName || 'Học viên'}</AppText>
                        <AppText className="text-slate-400 text-xs">{post.createdAt || post.time || 'Gần đây'} • Trong {post.category?.name || 'Thảo luận'}</AppText>
                    </View>
                </View>

                <AppText className="text-slate-900 font-bold text-xl mb-4 leading-7">{post.title}</AppText>
                <AppText className="text-slate-700 text-base leading-6 mb-8">
                    {post.content}
                </AppText>

                <View className="flex-row gap-6 border-t border-b border-slate-50 py-4 mb-6">
                    <TouchableOpacity className="flex-row items-center" onPress={handleLike}>
                        <Heart size={20} color={isLiked ? "#ef4444" : "#64748b"} fill={isLiked ? "#ef4444" : "transparent"} />
                        <AppText className={`text-sm ml-1.5 ${isLiked ? 'text-red-500 font-bold' : 'text-slate-500'}`}>{likesCount} Thích</AppText>
                    </TouchableOpacity>
                    <View className="flex-row items-center">
                        <MessageCircle size={20} color="#64748b" />
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
                    comments.map(comment => (
                        <View key={comment.id} className="mb-6 bg-slate-50 p-4 rounded-2xl">
                            <View className="flex-row justify-between items-center mb-2">
                                <AppText className="text-slate-900 font-bold text-xs">{comment.authorName || comment.userEmail || 'Thành viên'}</AppText>
                                <AppText className="text-slate-400 text-[10px]">{comment.createdAt || comment.time || 'Vừa xong'}</AppText>
                            </View>
                            <AppText className="text-slate-700 text-sm">{comment.content}</AppText>
                        </View>
                    ))
                )}
                <View className="h-20" />
            </ScrollView>

            {/* Bottom Bar Input */}
            <View className="p-4 border-t border-slate-100 bg-white flex-row items-center gap-3">
                <TextInput
                    placeholder="Viết bình luận của bạn..."
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
        </KeyboardAvoidingView>
    );
};

export default ForumDetailScreen;
