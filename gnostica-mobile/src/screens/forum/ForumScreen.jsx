import AppText from '../../components/ui/AppText';
import React, { useState, useEffect } from 'react';
import { View, ScrollView, TouchableOpacity, ActivityIndicator, Image } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Search, Plus, MessageCircle, Heart, Clock } from 'lucide-react-native';
import AppHeader from '../../components/ui/AppHeader';
import threadService from '../../services/forum/threadService';
import forumCategoryService from '../../services/forum/forumCategoryService';

const ForumScreen = () => {
    const navigation = useNavigation();
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

    const filteredThreads = activeCategory 
        ? threads.filter(t => t.category?.id === activeCategory.id || t.categoryId === activeCategory.id)
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
                    filteredThreads.map(post => (
                        <TouchableOpacity
                            key={post.id}
                            className="bg-white rounded-2xl p-4 mb-4 shadow-sm border border-slate-100"
                            onPress={() => navigation.navigate('ForumDetail', { post })}
                        >
                            <View className="flex-row items-center mb-3">
                                <View className="w-8 h-8 rounded-full bg-blue-100 items-center justify-center overflow-hidden">
                                    {post.authorAvatar ? (
                                        <Image source={{ uri: post.authorAvatar }} className="w-full h-full" />
                                    ) : (
                                        <AppText className="text-blue-600 font-bold text-xs">{post.authorName?.substring(0,2) || 'GN'}</AppText>
                                    )}
                                </View>
                                <View className="ml-2">
                                    <AppText className="text-slate-900 font-bold text-xs">{post.authorName || 'Học viên'}</AppText>
                                    <AppText className="text-slate-400 text-[10px]">{post.createdAt || 'Gần đây'}</AppText>
                                </View>
                                <View className="ml-auto bg-slate-50 px-2 py-0.5 rounded-md">
                                    <AppText className="text-slate-500 text-[10px] font-medium">{post.category?.name || 'Thảo luận'}</AppText>
                                </View>
                            </View>

                            <AppText className="text-slate-900 font-bold text-base mb-2">{post.title}</AppText>
                            <AppText className="text-slate-500 text-sm mb-4" numberOfLines={2}>{post.content}</AppText>

                            <View className="flex-row gap-4 border-t border-slate-50 pt-3">
                                <View className="flex-row items-center">
                                    <Heart size={16} color="#ef4444" />
                                    <AppText className="text-slate-500 text-xs ml-1">{post.likes || 0}</AppText>
                                </View>
                                <View className="flex-row items-center">
                                    <MessageCircle size={16} color="#64748b" />
                                    <AppText className="text-slate-500 text-xs ml-1">{post.comments || 0}</AppText>
                                </View>
                                <View className="flex-row items-center ml-auto">
                                    <Clock size={14} color="#94A3B8" />
                                    <AppText className="text-slate-400 text-[10px] ml-1">{post.views || 0} lượt xem</AppText>
                                </View>
                            </View>
                        </TouchableOpacity>
                    ))
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
