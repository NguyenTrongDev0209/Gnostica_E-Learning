import AppText from '../../components/ui/AppText';
import React, { useState, useCallback, useEffect } from 'react';
import { View, ScrollView, TouchableOpacity, RefreshControl, Image, ActivityIndicator } from 'react-native';
import { Menu, Bell, User, History, ArrowUpRight, Search, Trash2 } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';

import SearchBar from '../../components/ui/SearchBar';
import Avatar from '../../components/ui/Avatar';
import HeroSection from './components/HeroSection';
import CategorySection from '../course/components/CategorySection';
import CourseSection from '../course/components/CourseSection';
import InstructorSection from '../instructor/components/InstructorSection';
import FAQSection from './components/FAQSection';
import SideMenu from '../../components/ui/SideMenu';
import FloatingAiButton from '../../components/ui/FloatingAiButton';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { getRecentSearches, addRecentSearch, clearRecentSearches } from '../../services/course/searchHistoryService';
import categoryService from '../../services/course/categoryService';
import courseService from '../../services/course/courseService';

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

const HomeScreen = () => {
    const navigation = useNavigation();
    const { isAuthenticated, user } = useAuth();
    const { isDarkMode } = useTheme();
    const [isMenuVisible, setIsMenuVisible] = useState(false);
    const insets = useSafeAreaInsets();
    const [refreshing, setRefreshing] = useState(false);
    const [refreshKey, setRefreshKey] = useState(0);

    // Search state
    const [searchQuery, setSearchQuery] = useState('');
    const [isSearchFocused, setIsSearchFocused] = useState(false);
    const [recentSearches, setRecentSearches] = useState([]);
    const [suggestedCategories, setSuggestedCategories] = useState([]);
    const [suggestedCourses, setSuggestedCourses] = useState([]);
    const [isSearching, setIsSearching] = useState(false);

    const onRefresh = useCallback(() => {
        setRefreshing(true);
        setRefreshKey(prev => prev + 1);
        setTimeout(() => {
            setRefreshing(false);
        }, 1500);
    }, []);

    const handleSearchFocus = async () => {
        setIsSearchFocused(true);
        const history = await getRecentSearches();
        setRecentSearches(history);
    };

    useEffect(() => {
        if (!isSearchFocused) return;

        const timer = setTimeout(async () => {
            setIsSearching(true);
            try {
                const trimmed = searchQuery.trim();
                const normKey = normalizeSearchText(trimmed);

                // 1. Fetch categories
                const catRes = await categoryService.getAll({ search: trimmed || undefined, limit: 10 });
                const catData = catRes?.data?.content || catRes?.content || catRes?.data || catRes;
                if (Array.isArray(catData)) {
                    let filteredCats = catData;
                    if (normKey) {
                        filteredCats = catData.filter(cat =>
                            cat.name && normalizeSearchText(cat.name).includes(normKey)
                        );
                    }
                    setSuggestedCategories(filteredCats.slice(0, 4));
                } else {
                    setSuggestedCategories([]);
                }

                // 2. Fetch courses & filter by title keyword
                const courseRes = await courseService.getAll({
                    title: trimmed || undefined,
                    search: trimmed || undefined,
                    size: 20
                });
                const courseData = courseRes?.data?.content || courseRes?.content || courseRes?.data || courseRes;
                if (Array.isArray(courseData)) {
                    let filteredCourses = courseData;
                    if (normKey) {
                        filteredCourses = courseData.filter(c =>
                            c.title && normalizeSearchText(c.title).includes(normKey)
                        );
                    }
                    setSuggestedCourses(filteredCourses.slice(0, 5).map(c => ({
                        id: c.id,
                        slug: c.slug,
                        title: c.title,
                        categoryName: c.categoryName || c.category?.name,
                        instructorName: c.instructorName || c.instructor?.name,
                        thumbnail: c.thumbnail,
                        salePrice: c.salePrice,
                        price: c.price
                    })));
                } else {
                    setSuggestedCourses([]);
                }
            } catch (err) {
                console.error('Error fetching search suggestions:', err);
            } finally {
                setIsSearching(false);
            }
        }, 300);

        return () => clearTimeout(timer);
    }, [searchQuery, isSearchFocused]);

    const executeSearch = async (queryText) => {
        const textToSearch = queryText !== undefined ? queryText : searchQuery;
        if (!textToSearch || !textToSearch.trim()) return;
        await addRecentSearch(textToSearch.trim());
        setIsSearchFocused(false);
        navigation.navigate('Search', { query: textToSearch.trim() });
    };

    const handleSelectCategory = (category) => {
        setIsSearchFocused(false);
        navigation.navigate('CourseCatalog', { categoryId: category.id, categoryName: category.name });
    };

    const handleSelectCourse = async (course) => {
        if (course.title) {
            await addRecentSearch(course.title);
        }
        setIsSearchFocused(false);
        if (course.slug) {
            navigation.navigate('CourseDetail', { slug: course.slug });
        } else {
            navigation.navigate('Search', { query: course.title });
        }
    };

    const handleClearHistory = async () => {
        await clearRecentSearches();
        setRecentSearches([]);
    };

    return (
        <View className={`flex-1 ${isDarkMode ? 'bg-slate-900' : 'bg-slate-50'}`}>
            <SideMenu visible={isMenuVisible} onClose={() => setIsMenuVisible(false)} />

            {/* Header */}
            <View
                className={`flex-row items-center px-4 pb-4 gap-3 z-50 border-b ${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-100'
                    }`}
                style={{ paddingTop: Math.max(insets.top, 20) + 12 }}
            >
                <TouchableOpacity className="p-1" onPress={() => setIsMenuVisible(true)}>
                    <Menu size={26} color={isDarkMode ? "#f8fafc" : "#1e293b"} />
                </TouchableOpacity>

                <View className="flex-1">
                    <SearchBar
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                        onFocus={handleSearchFocus}
                        onClear={() => setSearchQuery('')}
                        onSubmitEditing={() => executeSearch()}
                        placeholder="Tìm kiếm khóa học..."
                        style={{ backgroundColor: isDarkMode ? '#334155' : '#F1F5F9', borderRadius: 12, borderWidth: 0 }}
                    />
                </View>

                <TouchableOpacity className="p-1" onPress={() => navigation.navigate('Notifications')}>
                    <Bell size={24} color={isDarkMode ? "#f8fafc" : "#1e293b"} />
                </TouchableOpacity>

                <TouchableOpacity
                    onPress={() => navigation.navigate(isAuthenticated ? 'Profile' : 'Login')}
                >
                    {isAuthenticated ? (
                        <Avatar uri={user?.avatar} name={user?.fullName || user?.name || 'Học viên'} size={38} />
                    ) : (
                        <View className="w-[38px] h-[38px] rounded-[19px] bg-blue-600 border border-blue-600 items-center justify-center">
                            <User size={22} color="#ffffff" />
                        </View>
                    )}
                </TouchableOpacity>
            </View>

            {/* Live Search Suggestions Dropdown Overlay */}
            {isSearchFocused && (
                <TouchableOpacity
                    style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        backgroundColor: 'rgba(15, 23, 42, 0.4)',
                        zIndex: 999,
                    }}
                    activeOpacity={1}
                    onPress={() => setIsSearchFocused(false)}
                >
                    <TouchableOpacity
                        activeOpacity={1}
                        style={{
                            marginTop: Math.max(insets.top, 20) + 64,
                            marginHorizontal: 16,
                            backgroundColor: isDarkMode ? '#1e293b' : '#ffffff',
                            borderRadius: 16,
                            padding: 16,
                            maxHeight: 460,
                            shadowColor: '#000',
                            shadowOffset: { width: 0, height: 4 },
                            shadowOpacity: 0.2,
                            shadowRadius: 16,
                            elevation: 12,
                        }}
                    >
                        <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
                            {/* 1. Recent Searches */}
                            {!searchQuery.trim() && recentSearches.length > 0 && (
                                <View className="mb-4">
                                    <View className="flex-row items-center justify-between mb-2">
                                        <AppText className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                                            Lịch sử tìm kiếm
                                        </AppText>
                                        <TouchableOpacity onPress={handleClearHistory} className="flex-row items-center gap-1">
                                            <Trash2 size={12} color="#94A3B8" />
                                            <AppText className="text-xs text-slate-400 font-medium">Xóa lịch sử</AppText>
                                        </TouchableOpacity>
                                    </View>
                                    {recentSearches.map((item, idx) => (
                                        <TouchableOpacity
                                            key={`recent-${idx}`}
                                            onPress={() => executeSearch(item)}
                                            className={`flex-row items-center py-2.5 px-2 justify-between border-b ${isDarkMode ? 'border-slate-700/60' : 'border-slate-50'
                                                }`}
                                        >
                                            <View className="flex-row items-center flex-1 gap-2.5">
                                                <History size={16} color="#94A3B8" />
                                                <AppText className={`text-sm font-medium flex-1 ${isDarkMode ? 'text-slate-100' : 'text-slate-800'}`} numberOfLines={1}>
                                                    {item}
                                                </AppText>
                                            </View>
                                            <ArrowUpRight size={16} color="#94A3B8" />
                                        </TouchableOpacity>
                                    ))}
                                </View>
                            )}

                            {/* 2. Category Suggestions */}
                            {suggestedCategories.length > 0 && (
                                <View className="mb-4">
                                    <AppText className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                                        Danh mục gợi ý
                                    </AppText>
                                    {suggestedCategories.map(cat => (
                                        <TouchableOpacity
                                            key={`cat-${cat.id}`}
                                            onPress={() => handleSelectCategory(cat)}
                                            className={`flex-row items-center py-2.5 px-2 justify-between border-b ${isDarkMode ? 'border-slate-700/60' : 'border-slate-50'
                                                }`}
                                        >
                                            <View className="flex-row items-center flex-1 gap-2.5">
                                                <Search size={16} color="#3B82F6" />
                                                <AppText className={`text-sm font-semibold flex-1 ${isDarkMode ? 'text-slate-100' : 'text-slate-800'}`} numberOfLines={1}>
                                                    {cat.name}
                                                </AppText>
                                            </View>
                                            <ArrowUpRight size={16} color="#94A3B8" />
                                        </TouchableOpacity>
                                    ))}
                                </View>
                            )}

                            {/* 3. Course Suggestions */}
                            <View className="mb-2">
                                <View className="flex-row items-center justify-between mb-2">
                                    <AppText className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                                        {searchQuery.trim() ? 'Khóa học phù hợp' : 'Khóa học nổi bật'}
                                    </AppText>
                                    {isSearching && <ActivityIndicator size="small" color="#2563EB" />}
                                </View>
                                {suggestedCourses.length > 0 ? (
                                    suggestedCourses.map(course => (
                                        <TouchableOpacity
                                            key={`course-${course.id}`}
                                            onPress={() => handleSelectCourse(course)}
                                            className={`flex-row items-center py-2 px-1 gap-3 border-b ${isDarkMode ? 'border-slate-700/60' : 'border-slate-50'
                                                }`}
                                        >
                                            <Image
                                                source={{ uri: course.thumbnail || 'https://via.placeholder.com/120x80' }}
                                                className={`w-16 h-12 rounded-lg ${isDarkMode ? 'bg-slate-700' : 'bg-slate-200'}`}
                                                resizeMode="cover"
                                            />
                                            <View className="flex-1 justify-center">
                                                {course.categoryName ? (
                                                    <AppText className="text-[11px] font-bold text-blue-500 mb-0.5" numberOfLines={1}>
                                                        {course.categoryName}
                                                    </AppText>
                                                ) : null}
                                                <AppText className={`text-xs font-bold ${isDarkMode ? 'text-slate-100' : 'text-slate-800'}`} numberOfLines={1}>
                                                    {course.title}
                                                </AppText>
                                                {course.instructorName ? (
                                                    <AppText className="text-[11px] text-slate-400 mt-0.5" numberOfLines={1}>
                                                        {course.instructorName}
                                                    </AppText>
                                                ) : null}
                                            </View>
                                            <ArrowUpRight size={16} color="#94A3B8" />
                                        </TouchableOpacity>
                                    ))
                                ) : (
                                    !isSearching && (
                                        <AppText className="text-xs text-slate-400 italic py-2">
                                            {searchQuery.trim() ? `Không tìm thấy gợi ý cho "${searchQuery}"` : 'Nhập từ khóa để tìm kiếm khóa học.'}
                                        </AppText>
                                    )
                                )}
                            </View>
                        </ScrollView>
                    </TouchableOpacity>
                </TouchableOpacity>
            )}

            <ScrollView
                className="flex-1"
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: 80 }}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#2563EB']} />
                }
            >
                {/* Hero Banner */}
                <HeroSection />

                {/* Categories */}
                <CategorySection key={`cat-${refreshKey}`} />

                {/* Course Sections */}
                {isAuthenticated && (
                    <CourseSection key={`foryou-${refreshKey}`} title="Dành cho bạn" variant="foryou" />
                )}

                <CourseSection key={`trending-${refreshKey}`} title="Khóa học thịnh hành" variant="trending" />

                <InstructorSection key={`inst-${refreshKey}`} />

                <CourseSection key={`featured-${refreshKey}`} title="Khóa học nổi bật" variant="featured" />

                {/* FAQ Section */}
                <FAQSection />

                <View className="h-5" />
            </ScrollView>

            {/* Floating AI Assistant Button */}
            <FloatingAiButton bottomOffset={90} />
        </View>
    );
};

export default HomeScreen;
