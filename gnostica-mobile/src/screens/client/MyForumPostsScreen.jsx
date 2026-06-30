import AppText from '../../components/ui/AppText';
import React, { useState, useEffect } from 'react';
import { View, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { MessageSquare, ThumbsUp, Eye, Clock } from 'lucide-react-native';
import AppHeader from '../../components/ui/AppHeader';
import threadService from '../../services/threadService';
import { useAuth } from '../../context/AuthContext';

export default function MyForumPostsScreen() {
    const navigation = useNavigation();
    const { user } = useAuth();
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchMyPosts = async () => {
            if (!user?.email) return;
            try {
                const response = await threadService.getMyPosts(user.email, { page: 0, size: 20 });
                const data = response.data || response.content || response;
                if (Array.isArray(data)) {
                    setPosts(data);
                } else if (data?.content && Array.isArray(data.content)) {
                    setPosts(data.content);
                }
            } catch (error) {
                console.error('Error fetching my posts:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchMyPosts();
    }, [user]);

    return (
        <View className="flex-1 bg-slate-50">
            {/* Header */}
            <AppHeader title="Bài đăng của tôi" />

            <ScrollView className="flex-1 p-5" showsVerticalScrollIndicator={false}>
                {loading ? (
                    <View className="py-20 items-center">
                        <ActivityIndicator size="large" color="#2563EB" />
                    </View>
                ) : posts.length === 0 ? (
                    <View className="items-center justify-center py-20">
                        <MessageSquare size={48} color="#CBD5E1" strokeWidth={1} />
                        <AppText className="text-slate-500 mt-4 text-center">Bạn chưa có bài đăng nào.</AppText>
                    </View>
                ) : (
                    posts.map(post => (
                        <TouchableOpacity 
                            key={post.id} 
                            className="bg-white p-4 rounded-2xl mb-4 border border-slate-100 shadow-sm"
                            activeOpacity={0.8}
                            onPress={() => navigation.navigate('ForumDetail', { post })}
                        >
                            <AppText className="text-base font-bold text-slate-800 mb-1.5">{post.title}</AppText>
                            <AppText className="text-sm text-slate-500 mb-3" numberOfLines={2}>{post.content}</AppText>
                            
                            <View className="flex-row items-center justify-between mt-2 pt-3 border-t border-slate-50">
                                <View className="flex-row items-center gap-1">
                                    <Clock size={12} color="#94A3B8" />
                                    <AppText className="text-[11px] text-slate-400">{post.createdAt || 'Gần đây'}</AppText>
                                </View>
                                <View className="flex-row items-center gap-4">
                                    <View className="flex-row items-center gap-1">
                                        <ThumbsUp size={12} color="#64748B" />
                                        <AppText className="text-[11px] text-slate-500 font-medium">{post.likes || 0}</AppText>
                                    </View>
                                    <View className="flex-row items-center gap-1">
                                        <Eye size={12} color="#64748B" />
                                        <AppText className="text-[11px] text-slate-500 font-medium">{post.views || 0}</AppText>
                                    </View>
                                    <View className="flex-row items-center gap-1">
                                        <MessageSquare size={12} color="#64748B" />
                                        <AppText className="text-[11px] text-slate-500 font-medium">{post.comments || 0}</AppText>
                                    </View>
                                </View>
                            </View>
                        </TouchableOpacity>
                    ))
                )}
            </ScrollView>
        </View>
    );
}
