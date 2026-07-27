import AppText from '../../components/ui/AppText';
import React, { useState, useEffect } from 'react';
import { View, ScrollView, TouchableOpacity, ActivityIndicator, Image, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Search, Plus, MessageCircle, Heart, Clock, ArrowBigUp, ArrowBigDown } from 'lucide-react-native';
import AppHeader from '../../components/ui/AppHeader';
import threadService from '../../services/forum/threadService';
import forumCategoryService from '../../services/forum/forumCategoryService';
import { useAuth } from '../../context/AuthContext';

const stripHtml = (html) => {
    if (!html) return '';
    return html.replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ').trim();
};

const ForumScreen = () => {
    const navigation = useNavigation();
    const { user } = useAuth();
    const [threads, setThreads] = useState([]);
    const [categories, setCategories] = useState([]);
    const [activeCategory, setActiveCategory] = useState(null);
    const [loading, setLoading] = useState(true);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [catRes, threadRes] = await Promise.all([
                forumCategoryService.getAll(),
                threadService.getAll({ page: 0, size: 20 })
            ]);
            
            const catData = catRes.data || catRes.content || catRes;
            if (Array.isArray(catData)) setCategories(catData);

            const threadData = threadRes.data || threadRes.content || threadRes;
            if (Array.isArray(threadData)) {
                setThreads(threadData);
            } else if (threadData?.content && Array.isArray(threadData.content)) {
                setThreads(threadData.content);
            }
        } catch (error) {
            console.error('Error fetching forum data:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleVote = async (postId, targetVoteValue) => {
        if (!user) {
            Alert.alert('Thông báo', 'Vui lòng đăng nhập để bình chọn.');
            return;
        }
        const targetPost = threads.find(t => t.id === postId);
        if (!targetPost) return;

        const currentVote = targetPost.userVote || 0;
        const newVoteValue = currentVote === targetVoteValue ? 0 : targetVoteValue;

        // Optimistic UI update
        setThreads(prev => prev.map(t => {
            if (t.id === postId) {
                const oldScore = t.voteScore != null ? t.voteScore : 0;
                const diff = newVoteValue - currentVote;
                return {
                    ...t,
                    userVote: newVoteValue,
                    voteScore: oldScore + diff
                };
            }
            return t;
        }));

        try {
            await threadService.vote(postId, user.email, newVoteValue);
        } catch (error) {
            console.error('Error voting thread:', error);
            setThreads(prev => prev.map(t => t.id === postId ? targetPost : t));
        }
    };

    const handleLike = async (postId) => {
        if (!user) {
            Alert.alert('Thông báo', 'Vui lòng đăng nhập để thích bài viết.');
            return;
        }
        const targetPost = threads.find(t => t.id === postId);
        if (!targetPost) return;

        const isLiked = targetPost.userLiked || false;
        const diff = isLiked ? -1 : 1;

        setThreads(prev => prev.map(t => {
            if (t.id === postId) {
                return {
                    ...t,
                    userLiked: !isLiked,
                    likes: (t.likes || 0) + diff
                };
            }
            return t;
        }));

        try {
            await threadService.like(postId, user.email);
        } catch (error) {
            console.error('Error liking thread:', error);
            setThreads(prev => prev.map(t => t.id === postId ? targetPost : t));
        }
    };

    const filteredThreads = activeCategory 
        ? threads.filter(t => t.category?.id === activeCategory.id || t.categoryId === activeCategory.id || t.topic?.id === activeCategory.id)
        : threads;

    return (
        <View className="flex-1 bg-slate-50">
            {/* Header */}
            <AppHeader title="Diễn đàn thảo luận" />

            {/* Categories */}
            <View className="bg-white border-b border-slate-100 py-3">
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 16 }}>
                    <TouchableOpacity
                        className={`mr-3 px-4 py-2 rounded-full ${!activeCategory ? 'bg-blue-600' : 'bg-slate-100'}`}
                        onPress={() => setActiveCategory(null)}
                    >
                        <AppText className={`text-sm font-medium ${!activeCategory ? 'text-white' : 'text-slate-700'}`}>
                            Tất cả
                        </AppText>
                    </TouchableOpacity>
                    {categories.map(cat => (
                        <TouchableOpacity
                            key={cat.id}
                            className={`mr-3 px-4 py-2 rounded-full ${activeCategory?.id === cat.id ? 'bg-blue-600' : 'bg-slate-100'}`}
                            onPress={() => setActiveCategory(cat)}
                        >
                            <AppText className={`text-sm font-medium ${activeCategory?.id === cat.id ? 'text-white' : 'text-slate-700'}`}>
                                {cat.name}
                            </AppText>
                        </TouchableOpacity>
                    ))}
                </ScrollView>
            </View>

            <ScrollView className="flex-1 p-4">
                {loading ? (
                    <View className="py-20">
                        <ActivityIndicator size="large" color="#2563EB" />
                    </View>
                ) : filteredThreads.length === 0 ? (
                    <View className="items-center py-20">
                        <MessageCircle size={48} color="#CBD5E1" strokeWidth={1} />
                        <AppText className="text-slate-500 mt-4">Chưa có bài đăng nào trong mục này.</AppText>
                    </View>
                ) : (
                    filteredThreads.map(post => {
                        const authorName = post.account?.fullName || post.account?.name || post.account?.username || post.authorName || 'Học viên';
                        const avatarUrl = post.account?.avatarUrl || post.authorAvatar;
                        const categoryName = post.topic?.name || post.category?.name || 'Thảo luận';
                        const formattedDate = post.createdAt ? new Date(post.createdAt).toLocaleDateString('vi-VN') : 'Gần đây';
                        const formattedTitle = post.title && post.title.length > 50
                            ? post.title.substring(0, 50).trim() + '...'
                            : post.title;

                        return (
                            <TouchableOpacity
                                key={post.id}
                                className="bg-white rounded-2xl p-4 mb-4 shadow-sm border border-slate-100"
                                onPress={() => navigation.navigate('ForumDetail', { post })}
                            >
                                <View className="flex-row items-center mb-3">
                                    <View className="w-8 h-8 rounded-full bg-blue-100 items-center justify-center overflow-hidden">
                                        {avatarUrl ? (
                                            <Image source={{ uri: avatarUrl }} className="w-full h-full" />
                                        ) : (
                                            <AppText className="text-blue-600 font-bold text-xs">{authorName.substring(0, 2).toUpperCase()}</AppText>
                                        )}
                                    </View>
                                    <View className="ml-2">
                                        <AppText className="text-slate-900 font-bold text-xs">{authorName}</AppText>
                                        <AppText className="text-slate-400 text-[10px]">{formattedDate}</AppText>
                                    </View>
                                    <View className="ml-auto bg-slate-50 px-2 py-0.5 rounded-md">
                                        <AppText className="text-slate-500 text-[10px] font-medium">{categoryName}</AppText>
                                    </View>
                                </View>

                                <AppText className="text-slate-900 font-bold text-base mb-2" numberOfLines={2}>{formattedTitle}</AppText>
                                <AppText className="text-slate-500 text-sm mb-4" numberOfLines={2}>{stripHtml(post.content)}</AppText>

                            <View className="flex-row items-center gap-2.5 border-t border-slate-50 pt-3">
                                {/* Vote buttons */}
                                <View className="flex-row items-center bg-slate-100 rounded-full px-2 py-1 gap-1">
                                    <TouchableOpacity 
                                        onPress={(e) => { e.stopPropagation?.(); handleVote(post.id, 1); }}
                                        activeOpacity={0.7}
                                    >
                                        <ArrowBigUp 
                                            size={18} 
                                            color={post.userVote === 1 ? '#2563eb' : '#64748b'} 
                                            fill={post.userVote === 1 ? '#2563eb' : 'transparent'} 
                                        />
                                    </TouchableOpacity>
                                    <AppText className={`text-xs font-bold px-1 ${post.userVote === 1 ? 'text-blue-600' : post.userVote === -1 ? 'text-red-500' : 'text-slate-700'}`}>
                                        {post.voteScore != null ? post.voteScore : 0}
                                    </AppText>
                                    <TouchableOpacity 
                                        onPress={(e) => { e.stopPropagation?.(); handleVote(post.id, -1); }}
                                        activeOpacity={0.7}
                                    >
                                        <ArrowBigDown 
                                            size={18} 
                                            color={post.userVote === -1 ? '#ef4444' : '#64748b'} 
                                            fill={post.userVote === -1 ? '#ef4444' : 'transparent'} 
                                        />
                                    </TouchableOpacity>
                                </View>

                                {/* Like (Heart) button */}
                                <TouchableOpacity 
                                    className="flex-row items-center bg-slate-100 rounded-full px-2.5 py-1"
                                    onPress={(e) => { e.stopPropagation?.(); handleLike(post.id); }}
                                    activeOpacity={0.7}
                                >
                                    <Heart size={14} color={post.userLiked ? "#ef4444" : "#64748b"} fill={post.userLiked ? "#ef4444" : "transparent"} />
                                    <AppText className={`text-xs ml-1 ${post.userLiked ? 'text-red-500 font-bold' : 'text-slate-600'}`}>{post.likes || 0}</AppText>
                                </TouchableOpacity>

                                <View className="flex-row items-center ml-1">
                                    <MessageCircle size={16} color="#64748b" />
                                    <AppText className="text-slate-500 text-xs ml-1">{post.commentCount || post.comments || 0}</AppText>
                                </View>
                                <View className="flex-row items-center ml-auto">
                                    <Clock size={14} color="#94A3B8" />
                                    <AppText className="text-slate-400 text-[10px] ml-1">{post.viewCount || post.views || 0} lượt xem</AppText>
                                </View>
                            </View>
                        </TouchableOpacity>
                    );
                })
                )}
                <View className="h-20" />
            </ScrollView>

            {/* FAB Create Post */}
            <TouchableOpacity 
                className="absolute bottom-6 right-6 w-14 h-14 bg-blue-600 rounded-full items-center justify-center shadow-lg shadow-blue-500/50"
                onPress={() => navigation.navigate('CreatePost')}
            >
                <Plus size={24} color="#ffffff" />
            </TouchableOpacity>
        </View>
    );
};

export default ForumScreen;
