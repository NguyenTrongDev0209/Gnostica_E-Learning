import AppText from '../../components/ui/AppText';
import React, { useState, useEffect, useCallback } from 'react';
import { View, ScrollView, TouchableOpacity, ActivityIndicator, Image, Alert } from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { Search, Plus, MessageCircle, Heart, Clock, ArrowBigUp, ArrowBigDown, ChevronLeft, ChevronRight } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import AppHeader from '../../components/ui/AppHeader';
import SearchBar from '../../components/ui/SearchBar';
import FloatingAiButton from '../../components/ui/FloatingAiButton';
import threadService from '../../services/forum/threadService';
import forumCategoryService from '../../services/forum/forumCategoryService';
import { useAuth } from '../../context/AuthContext';

const normalizeSearchText = (text) => {
    if (!text) return '';
    return text
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/đ/g, 'd')
        .replace(/Đ/g, 'd')
        .trim();
};

const stripHtml = (html) => {
    if (!html) return '';
    return html.replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ').trim();
};

const PAGE_SIZE = 10;

const ForumScreen = () => {
    const navigation = useNavigation();
    const { user } = useAuth();
    const [threads, setThreads] = useState([]);
    const [categories, setCategories] = useState([]);
    const [activeCategory, setActiveCategory] = useState(null);
    const [categoryLimit, setCategoryLimit] = useState(5);

    const visibleCategories = categories.slice(0, categoryLimit);
    const hasMoreCategories = categories.length > categoryLimit;
    const [searchQuery, setSearchQuery] = useState('');
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(0);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [catRes, threadRes] = await Promise.all([
                forumCategoryService.getAll(),
                threadService.getAll({ page: 0, size: 200 })
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

    useFocusEffect(
        useCallback(() => {
            fetchData();
        }, [])
    );

    const handleVote = async (postId, targetVoteValue) => {
        if (!user) {
            Alert.alert('Thông báo', 'Vui lòng đăng nhập để bình chọn.');
            return;
        }
        const targetPost = threads.find(t => t.id === postId);
        if (!targetPost) return;

        const currentVote = targetPost.userVote || 0;
        const newVoteValue = currentVote === targetVoteValue ? 0 : targetVoteValue;

        setThreads(prev => prev.map(t => {
            if (t.id === postId) {
                const oldScore = t.voteScore != null ? t.voteScore : 0;
                const diff = newVoteValue - currentVote;
                return { ...t, userVote: newVoteValue, voteScore: oldScore + diff };
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

        const authorEmail = targetPost.authorEmail || targetPost.account?.email;
        if (authorEmail && authorEmail === user.email) {
            Alert.alert('Thông báo', 'Bạn không thể thích bài viết của chính mình!');
            return;
        }

        const isLiked = targetPost.userLiked || false;
        const diff = isLiked ? -1 : 1;
        setThreads(prev => prev.map(t => {
            if (t.id === postId) return { ...t, userLiked: !isLiked, likes: (t.likes || 0) + diff };
            return t;
        }));

        try {
            await threadService.like(postId, user.email);
        } catch (error) {
            console.error('Error liking thread:', error);
            setThreads(prev => prev.map(t => t.id === postId ? targetPost : t));
        }
    };

    // Reset trang về 0 khi đổi category
    const handleCategoryChange = (cat) => {
        setActiveCategory(cat);
        setCurrentPage(0);
    };

    const isThreadInCategory = (t, cat) => {
        if (!cat) return true;
        if (!t) return false;

        // 1. Match by ID (String comparison)
        const catIdStr = cat.id != null ? String(cat.id) : null;
        const threadCatIdStr = (t.topic?.id != null ? String(t.topic.id) : null) ||
                               (t.category?.id != null ? String(t.category.id) : null) ||
                               (t.topicId != null ? String(t.topicId) : null) ||
                               (t.categoryId != null ? String(t.categoryId) : null);

        if (catIdStr && threadCatIdStr && catIdStr === threadCatIdStr) {
            return true;
        }

        // 2. Match by Slug
        const catSlug = (cat.slug || '').toLowerCase().trim();
        const threadSlug = (t.topic?.slug || t.category?.slug || t.topicSlug || t.categorySlug || '').toLowerCase().trim();
        if (catSlug && threadSlug && (catSlug === threadSlug || catSlug.includes(threadSlug) || threadSlug.includes(catSlug))) {
            return true;
        }

        // 3. Match by Name / Title
        const catName = normalizeSearchText(cat.name || cat.title || '');
        const threadTitle = normalizeSearchText(
            t.topic?.title || t.topic?.name || t.category?.title || t.category?.name || t.topicName || t.categoryName || ''
        );

        if (catName && threadTitle) {
            if (threadTitle === catName || threadTitle.includes(catName) || catName.includes(threadTitle)) {
                return true;
            }
        }

        // 4. Match by Hashtags
        if (catName && Array.isArray(t.hashtags)) {
            const matchTag = t.hashtags.some(h => {
                const tagName = normalizeSearchText(h?.hashtag?.name || h?.name || '');
                return tagName && (tagName.includes(catName) || catName.includes(tagName));
            });
            if (matchTag) return true;
        }

        return false;
    };

    const filteredThreads = threads.filter(t => {
        const matchCategory = isThreadInCategory(t, activeCategory);
        if (!matchCategory) return false;

        if (!searchQuery.trim()) return true;
        const key = normalizeSearchText(searchQuery);
        const title = normalizeSearchText(t.title);
        const content = normalizeSearchText(t.content);
        const author = normalizeSearchText(t.account?.fullName || t.authorName);

        return title.includes(key) || content.includes(key) || author.includes(key);
    });

    const totalPages = Math.ceil(filteredThreads.length / PAGE_SIZE);
    const pagedThreads = filteredThreads.slice(currentPage * PAGE_SIZE, (currentPage + 1) * PAGE_SIZE);

    const getPageNumbers = () => {
        const pages = [];
        const start = Math.max(0, currentPage - 2);
        const end = Math.min(totalPages - 1, start + 4);
        for (let i = start; i <= end; i++) pages.push(i);
        return pages;
    };

    return (
        <View className="flex-1 bg-slate-50">
            <AppHeader title="Diễn đàn thảo luận" />

            {/* Search Bar */}
            <View className="bg-white px-4 pt-3 pb-1 border-b border-slate-100">
                <SearchBar
                    value={searchQuery}
                    onChangeText={(text) => {
                        setSearchQuery(text);
                        setCurrentPage(0);
                    }}
                    placeholder="Tìm kiếm bài viết diễn đàn..."
                    onClear={() => {
                        setSearchQuery('');
                        setCurrentPage(0);
                    }}
                />
            </View>

            {/* Categories Filter Bar */}
            <View className="bg-white border-b border-slate-100" style={{ paddingVertical: 10 }}>
                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={{ paddingHorizontal: 16, gap: 8, alignItems: 'center' }}
                >
                    <TouchableOpacity
                        activeOpacity={0.8}
                        onPress={() => handleCategoryChange(null)}
                        style={{
                            marginRight: 4, borderRadius: 20, overflow: 'hidden',
                            shadowColor: !activeCategory ? '#2563eb' : 'transparent',
                            shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.25,
                            shadowRadius: 4, elevation: !activeCategory ? 4 : 0,
                        }}
                    >
                        {!activeCategory ? (
                            <LinearGradient
                                colors={['#3b82f6', '#1d4ed8']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                                style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20 }}
                            >
                                <AppText style={{ color: '#fff', fontSize: 13, fontWeight: '700' }}>Tất cả</AppText>
                                <View style={{ backgroundColor: 'rgba(255,255,255,0.3)', borderRadius: 10, paddingHorizontal: 6, paddingVertical: 1, marginLeft: 6 }}>
                                    <AppText style={{ color: '#fff', fontSize: 10, fontWeight: '800' }}>{threads.length}</AppText>
                                </View>
                            </LinearGradient>
                        ) : (
                            <View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, backgroundColor: '#f1f5f9', borderWidth: 1, borderColor: '#e2e8f0' }}>
                                <AppText style={{ color: '#64748b', fontSize: 13, fontWeight: '600' }}>Tất cả</AppText>
                                <View style={{ backgroundColor: '#e2e8f0', borderRadius: 10, paddingHorizontal: 6, paddingVertical: 1, marginLeft: 6 }}>
                                    <AppText style={{ color: '#94a3b8', fontSize: 10, fontWeight: '700' }}>{threads.length}</AppText>
                                </View>
                            </View>
                        )}
                    </TouchableOpacity>

                    {visibleCategories.map(cat => {
                        const isActive = activeCategory?.id === cat.id;
                        const count = threads.filter(t => isThreadInCategory(t, cat)).length;
                        return (
                            <TouchableOpacity
                                key={cat.id} activeOpacity={0.8}
                                onPress={() => handleCategoryChange(cat)}
                                style={{
                                    marginRight: 4, borderRadius: 20, overflow: 'hidden',
                                    shadowColor: isActive ? '#2563eb' : 'transparent',
                                    shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.25,
                                    shadowRadius: 4, elevation: isActive ? 4 : 0,
                                }}
                            >
                                {isActive ? (
                                    <LinearGradient
                                        colors={['#3b82f6', '#1d4ed8']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                                        style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20 }}
                                    >
                                        <AppText style={{ color: '#fff', fontSize: 13, fontWeight: '700' }}>{cat.name}</AppText>
                                        {count > 0 && (
                                            <View style={{ backgroundColor: 'rgba(255,255,255,0.3)', borderRadius: 10, paddingHorizontal: 6, paddingVertical: 1, marginLeft: 6 }}>
                                                <AppText style={{ color: '#fff', fontSize: 10, fontWeight: '800' }}>{count}</AppText>
                                            </View>
                                        )}
                                    </LinearGradient>
                                ) : (
                                    <View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, backgroundColor: '#f1f5f9', borderWidth: 1, borderColor: '#e2e8f0' }}>
                                        <AppText style={{ color: '#475569', fontSize: 13, fontWeight: '600' }}>{cat.name}</AppText>
                                        {count > 0 && (
                                            <View style={{ backgroundColor: '#e2e8f0', borderRadius: 10, paddingHorizontal: 6, paddingVertical: 1, marginLeft: 6 }}>
                                                <AppText style={{ color: '#94a3b8', fontSize: 10, fontWeight: '700' }}>{count}</AppText>
                                            </View>
                                        )}
                                    </View>
                                )}
                            </TouchableOpacity>
                        );
                    })}

                    {/* Nút Xem thêm / Thu gọn */}
                    {hasMoreCategories ? (
                        <TouchableOpacity
                            activeOpacity={0.8}
                            onPress={() => setCategoryLimit(prev => prev + 10)}
                            style={{
                                marginRight: 4,
                                borderRadius: 20,
                                backgroundColor: '#eff6ff',
                                borderWidth: 1.5,
                                borderColor: '#93c5fd',
                                paddingHorizontal: 14,
                                paddingVertical: 8,
                                flexDirection: 'row',
                                alignItems: 'center',
                            }}
                        >
                            <AppText style={{ color: '#2563eb', fontSize: 13, fontWeight: '700' }}>Xem thêm +</AppText>
                        </TouchableOpacity>
                    ) : categoryLimit > 5 ? (
                        <TouchableOpacity
                            activeOpacity={0.8}
                            onPress={() => setCategoryLimit(5)}
                            style={{
                                marginRight: 4,
                                borderRadius: 20,
                                backgroundColor: '#f8fafc',
                                borderWidth: 1,
                                borderColor: '#cbd5e1',
                                paddingHorizontal: 14,
                                paddingVertical: 8,
                                flexDirection: 'row',
                                alignItems: 'center',
                            }}
                        >
                            <AppText style={{ color: '#64748b', fontSize: 13, fontWeight: '600' }}>Thu gọn</AppText>
                        </TouchableOpacity>
                    ) : null}
                </ScrollView>
            </View>

            <ScrollView className="flex-1 p-4">
                {loading ? (
                    <View className="py-20">
                        <ActivityIndicator size="large" color="#2563EB" />
                    </View>
                ) : pagedThreads.length === 0 ? (
                    <View className="items-center py-20">
                        <MessageCircle size={48} color="#CBD5E1" strokeWidth={1} />
                        <AppText className="text-slate-500 mt-4">Chưa có bài đăng nào trong mục này.</AppText>
                    </View>
                ) : (
                    pagedThreads.map(post => {
                        const authorName = post.account?.fullName || post.account?.name || post.account?.username || post.authorName || 'Học viên';
                        const avatarUrl = post.account?.avatarUrl || post.authorAvatar;
                        const getHashtagBadge = (p) => {
                            if (p.hashtags && p.hashtags.length > 0) {
                                const list = p.hashtags.map(h => h?.hashtag?.name || h?.name).filter(Boolean).slice(0, 3).map(name => (name.startsWith('#') ? name : `#${name}`));
                                if (list.length > 0) return list.join(' ');
                            }
                            if (p.tags && p.tags.length > 0) {
                                const list = p.tags.filter(Boolean).slice(0, 3).map(t => (t.startsWith('#') ? t : `#${t}`));
                                if (list.length > 0) return list.join(' ');
                            }
                            const cat = p.topic?.name || p.topic?.title || p.category?.name;
                            if (!cat || cat === 'Thảo luận') return '#Gnostica';
                            return cat.startsWith('#') ? cat : `#${cat.replace(/\s+/g, '')}`;
                        };
                        const categoryName = getHashtagBadge(post);
                        const formattedDate = post.createdAt ? new Date(post.createdAt).toLocaleDateString('vi-VN') : 'Gần đây';
                        const formattedTitle = post.title && post.title.length > 50 ? post.title.substring(0, 50).trim() + '...' : post.title;

                        return (
                            <TouchableOpacity
                                key={post.id}
                                className="bg-white rounded-2xl p-4 mb-4 shadow-sm border border-slate-100"
                                onPress={() => navigation.navigate('ForumDetail', { post })}
                            >
                                <View className="flex-row items-center mb-3">
                                    <View className="w-8 h-8 rounded-full bg-blue-600 items-center justify-center overflow-hidden">
                                        {avatarUrl ? (
                                            <Image source={{ uri: avatarUrl }} className="w-full h-full" />
                                        ) : (
                                            <AppText className="text-white font-bold text-xs">{authorName.substring(0, 2).toUpperCase()}</AppText>
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
                                    <View className="flex-row items-center bg-slate-100 rounded-full px-2 py-1 gap-1">
                                        <TouchableOpacity onPress={(e) => { e.stopPropagation?.(); handleVote(post.id, 1); }} activeOpacity={0.7}>
                                            <ArrowBigUp size={18} color={post.userVote === 1 ? '#2563eb' : '#64748b'} fill={post.userVote === 1 ? '#2563eb' : 'transparent'} />
                                        </TouchableOpacity>
                                        <AppText className={`text-xs font-bold px-1 ${post.userVote === 1 ? 'text-blue-600' : post.userVote === -1 ? 'text-red-500' : 'text-slate-700'}`}>
                                            {post.voteScore != null ? post.voteScore : 0}
                                        </AppText>
                                        <TouchableOpacity onPress={(e) => { e.stopPropagation?.(); handleVote(post.id, -1); }} activeOpacity={0.7}>
                                            <ArrowBigDown size={18} color={post.userVote === -1 ? '#ef4444' : '#64748b'} fill={post.userVote === -1 ? '#ef4444' : 'transparent'} />
                                        </TouchableOpacity>
                                    </View>

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

                {/* Phân trang */}
                {!loading && totalPages > 1 && (
                    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 16, gap: 6 }}>
                        {/* Nút Trước */}
                        <TouchableOpacity
                            onPress={() => setCurrentPage(p => Math.max(0, p - 1))}
                            disabled={currentPage === 0}
                            activeOpacity={0.7}
                            style={{
                                width: 32, height: 32, borderRadius: 16,
                                backgroundColor: '#f1f5f9', borderWidth: 1, borderColor: '#e2e8f0',
                                alignItems: 'center', justifyContent: 'center',
                                opacity: currentPage === 0 ? 0.35 : 1,
                            }}
                        >
                            <AppText style={{ fontSize: 15, fontWeight: '700', color: '#475569', lineHeight: 20 }}>{'<'}</AppText>
                        </TouchableOpacity>

                        {/* Số trang */}
                        {getPageNumbers().map(pageNum => (
                            <TouchableOpacity
                                key={pageNum}
                                onPress={() => setCurrentPage(pageNum)}
                                activeOpacity={0.8}
                                style={{
                                    width: 32, height: 32, borderRadius: 16,
                                    alignItems: 'center', justifyContent: 'center',
                                    backgroundColor: pageNum === currentPage ? '#2563eb' : '#f1f5f9',
                                    borderWidth: 1,
                                    borderColor: pageNum === currentPage ? '#2563eb' : '#e2e8f0',
                                }}
                            >
                                <AppText style={{ fontSize: 13, fontWeight: '700', color: pageNum === currentPage ? '#fff' : '#64748b' }}>
                                    {pageNum + 1}
                                </AppText>
                            </TouchableOpacity>
                        ))}

                        {/* Nút Sau */}
                        <TouchableOpacity
                            onPress={() => setCurrentPage(p => Math.min(totalPages - 1, p + 1))}
                            disabled={currentPage >= totalPages - 1}
                            activeOpacity={0.7}
                            style={{
                                width: 32, height: 32, borderRadius: 16,
                                backgroundColor: '#f1f5f9', borderWidth: 1, borderColor: '#e2e8f0',
                                alignItems: 'center', justifyContent: 'center',
                                opacity: currentPage >= totalPages - 1 ? 0.35 : 1,
                            }}
                        >
                            <AppText style={{ fontSize: 15, fontWeight: '700', color: '#475569', lineHeight: 20 }}>{'>'}</AppText>
                        </TouchableOpacity>
                    </View>
                )}



                <View style={{ height: 100 }} />
            </ScrollView>

            {/* FAB Create Post */}
            <TouchableOpacity
                activeOpacity={0.85}
                style={{
                    position: 'absolute', bottom: 140, right: 20,
                    width: 42, height: 42, borderRadius: 21,
                    backgroundColor: 'transparent', elevation: 6,
                    shadowColor: '#ea580c', shadowOffset: { width: 0, height: 3 },
                    shadowOpacity: 0.3, shadowRadius: 5, zIndex: 999,
                }}
                onPress={() => navigation.navigate('CreatePost')}
            >
                <LinearGradient
                    colors={['#fb923c', '#ea580c']}
                    style={{ width: 42, height: 42, borderRadius: 21, borderWidth: 2, borderColor: '#ffffff', alignItems: 'center', justifyContent: 'center' }}
                >
                    <Plus size={20} color="#ffffff" strokeWidth={2.4} />
                </LinearGradient>
            </TouchableOpacity>

            <FloatingAiButton bottomOffset={190} />
        </View>
    );
};

export default ForumScreen;
