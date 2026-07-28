import AppText from '../../components/ui/AppText';
import React, { useState, useEffect, useCallback } from 'react';
import { View, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { MessageSquare, ThumbsUp, Eye, Clock, Heart } from 'lucide-react-native';
import AppHeader from '../../components/ui/AppHeader';
import threadService from '../../services/forum/threadService';
import { useAuth } from '../../context/AuthContext';
import { LinearGradient } from 'expo-linear-gradient';

const TABS = [
    { key: 'my',    label: 'Bài viết của tôi', icon: MessageSquare },
    { key: 'liked', label: 'Yêu thích',         icon: Heart },
];

const stripHtml = (html) => {
    if (!html) return '';
    return html.replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ').trim();
};

const PostCard = ({ post, onPress }) => {
    const formatted = post.title && post.title.length > 55
        ? post.title.substring(0, 55).trim() + '...'
        : post.title;

    const dateStr = post.createdAt
        ? new Date(post.createdAt).toLocaleDateString('vi-VN')
        : 'Gần đây';

    return (
        <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => onPress(post)}
            style={{
                backgroundColor: '#fff',
                borderRadius: 16,
                padding: 16,
                marginBottom: 12,
                borderWidth: 1,
                borderColor: '#F1F5F9',
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 1 },
                shadowOpacity: 0.04,
                shadowRadius: 4,
                elevation: 2,
            }}
        >
            <AppText style={{ fontSize: 15, fontWeight: '700', color: '#1e293b', marginBottom: 6, lineHeight: 22 }} numberOfLines={2}>
                {formatted}
            </AppText>
            <AppText style={{ fontSize: 13, color: '#64748b', marginBottom: 12, lineHeight: 18 }} numberOfLines={2}>
                {stripHtml(post.content)}
            </AppText>

            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingTop: 10, borderTopWidth: 1, borderTopColor: '#F8FAFC' }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                    <Clock size={11} color="#94A3B8" />
                    <AppText style={{ fontSize: 11, color: '#94A3B8' }}>{dateStr}</AppText>
                </View>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 14 }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                        <Heart size={12} color="#ec4899" />
                        <AppText style={{ fontSize: 11, color: '#64748b', fontWeight: '600' }}>{post.likes || 0}</AppText>
                    </View>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                        <Eye size={12} color="#64748b" />
                        <AppText style={{ fontSize: 11, color: '#64748b', fontWeight: '600' }}>{post.viewCount || post.views || 0}</AppText>
                    </View>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                        <MessageSquare size={12} color="#64748b" />
                        <AppText style={{ fontSize: 11, color: '#64748b', fontWeight: '600' }}>{post.commentCount || post.comments || 0}</AppText>
                    </View>
                </View>
            </View>
        </TouchableOpacity>
    );
};

const EmptyState = ({ tab }) => (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', paddingTop: 80 }}>
        {tab === 'my'
            ? <MessageSquare size={52} color="#CBD5E1" strokeWidth={1.2} />
            : <Heart size={52} color="#CBD5E1" strokeWidth={1.2} />
        }
        <AppText style={{ color: '#94a3b8', marginTop: 16, fontSize: 14, textAlign: 'center' }}>
            {tab === 'my'
                ? 'Bạn chưa có bài đăng nào.'
                : 'Bạn chưa thích bài viết nào.'}
        </AppText>
    </View>
);

export default function MyForumPostsScreen() {
    const navigation = useNavigation();
    const { user } = useAuth();
    const [activeTab, setActiveTab] = useState('my');
    const [myPosts, setMyPosts] = useState([]);
    const [likedPosts, setLikedPosts] = useState([]);
    const [loadingMy, setLoadingMy] = useState(true);
    const [loadingLiked, setLoadingLiked] = useState(true);

    useEffect(() => {
        if (!user?.email) return;

        // Fetch my posts
        (async () => {
            try {
                const res = await threadService.getMyPosts(user.email, { page: 0, size: 20 });
                const data = res.data || res.content || res;
                if (Array.isArray(data)) setMyPosts(data);
                else if (data?.content && Array.isArray(data.content)) setMyPosts(data.content);
            } catch (e) {
                console.error('Error fetching my posts:', e);
            } finally {
                setLoadingMy(false);
            }
        })();

        // Fetch liked posts
        (async () => {
            try {
                const res = await threadService.getMyLikedPosts(user.email, { page: 0, size: 20 });
                const data = res.data || res.content || res;
                if (Array.isArray(data)) setLikedPosts(data);
                else if (data?.content && Array.isArray(data.content)) setLikedPosts(data.content);
            } catch (e) {
                console.error('Error fetching liked posts:', e);
            } finally {
                setLoadingLiked(false);
            }
        })();
    }, [user]);

    const goToPost = (post) => navigation.navigate('ForumDetail', { post });

    const isLoading = activeTab === 'my' ? loadingMy : loadingLiked;
    const currentPosts = activeTab === 'my' ? myPosts : likedPosts;

    return (
        <View style={{ flex: 1, backgroundColor: '#F8FAFC' }}>
            <AppHeader title="Bài viết diễn đàn" />

            {/* Tab Bar */}
            <View style={{
                flexDirection: 'row',
                backgroundColor: '#fff',
                paddingHorizontal: 16,
                paddingVertical: 10,
                borderBottomWidth: 1,
                borderBottomColor: '#F1F5F9',
                gap: 8,
            }}>
                {TABS.map(tab => {
                    const isActive = activeTab === tab.key;
                    return (
                        <TouchableOpacity
                            key={tab.key}
                            activeOpacity={0.8}
                            onPress={() => setActiveTab(tab.key)}
                            style={{ flex: 1, borderRadius: 12, overflow: 'hidden' }}
                        >
                            {isActive ? (
                                <LinearGradient
                                    colors={tab.key === 'liked' ? ['#ec4899', '#be185d'] : ['#6d28d9', '#4c1d95']}
                                    style={{
                                        flexDirection: 'row',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        paddingVertical: 10,
                                        gap: 6,
                                        borderRadius: 12,
                                    }}
                                >
                                    <tab.icon size={15} color="#fff" fill={tab.key === 'liked' ? '#fff' : 'none'} />
                                    <AppText style={{ color: '#fff', fontWeight: '700', fontSize: 13 }}>{tab.label}</AppText>
                                </LinearGradient>
                            ) : (
                                <View style={{
                                    flexDirection: 'row',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    paddingVertical: 10,
                                    gap: 6,
                                    backgroundColor: '#F8FAFC',
                                    borderRadius: 12,
                                    borderWidth: 1,
                                    borderColor: '#E2E8F0',
                                }}>
                                    <tab.icon size={15} color="#94a3b8" />
                                    <AppText style={{ color: '#94a3b8', fontWeight: '600', fontSize: 13 }}>{tab.label}</AppText>
                                </View>
                            )}
                        </TouchableOpacity>
                    );
                })}
            </View>

            <ScrollView style={{ flex: 1, paddingHorizontal: 16, paddingTop: 16 }} showsVerticalScrollIndicator={false}>
                {isLoading ? (
                    <View style={{ paddingTop: 80, alignItems: 'center' }}>
                        <ActivityIndicator size="large" color="#6d28d9" />
                    </View>
                ) : currentPosts.length === 0 ? (
                    <EmptyState tab={activeTab} />
                ) : (
                    currentPosts.map(post => (
                        <PostCard key={post.id} post={post} onPress={goToPost} />
                    ))
                )}
                <View style={{ height: 80 }} />
            </ScrollView>
        </View>
    );
}
