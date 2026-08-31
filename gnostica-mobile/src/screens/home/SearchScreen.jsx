import AppText from '../../components/ui/AppText';
import React, { useState, useEffect } from 'react';
import { View, ScrollView, TouchableOpacity, FlatList, ActivityIndicator } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { clsx } from 'clsx';
import { ArrowUpDown, ArrowUp, ArrowDown, ChevronLeft, ChevronRight } from 'lucide-react-native';
import SearchBar from '../../components/ui/SearchBar';
import CourseCard from '../course/components/CourseCard';
import courseService from '../../services/course/courseService';
import { useTheme } from '../../context/ThemeContext';

const PAGE_SIZE = 10;

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

const FILTERS = ['Tất cả', 'Miễn phí', 'Lập trình', 'Thiết kế', 'Marketing', 'Ngoại ngữ'];

const SearchScreen = () => {
    const route = useRoute();
    const { isDarkMode } = useTheme();
    const [query, setQuery] = useState(route.params?.query || '');
    const [activeFilter, setActiveFilter] = useState(route.params?.categoryName || 'Tất cả');
    const [priceSort, setPriceSort] = useState('default'); // 'default' | 'asc' | 'desc'
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);

    const totalPages = Math.max(1, Math.ceil(courses.length / PAGE_SIZE));
    const paginatedCourses = courses.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

    const togglePriceSort = () => {
        setPriceSort(prev => {
            if (prev === 'default') return 'asc';
            if (prev === 'asc') return 'desc';
            return 'default';
        });
        setCurrentPage(1);
    };

    // Reset page on filter/sort/query change
    useEffect(() => { setCurrentPage(1); }, [query, activeFilter, priceSort]);

    useEffect(() => {
        if (route.params?.query !== undefined) {
            setQuery(route.params.query);
        }
        if (route.params?.categoryName !== undefined) {
            setActiveFilter(route.params.categoryName);
        }
    }, [route.params?.query, route.params?.categoryName]);

    useEffect(() => {
        const timer = setTimeout(() => {
            const searchCourses = async () => {
                setLoading(true);
                try {
                    const trimmed = query.trim();
                    const response = await courseService.getAll({ 
                        title: trimmed !== '' ? trimmed : undefined,
                        search: trimmed !== '' ? trimmed : undefined,
                        size: 200
                    });
                    
                    const rawList = response?.data?.content || response?.content || response?.data || response;
                    const courseList = Array.isArray(rawList) ? rawList : [];

                    let results = courseList.map(course => ({
                        id: course.id ? course.id.toString() : Math.random().toString(),
                        slug: course.slug,
                        title: course.title,
                        thumbnail: course.thumbnail,
                        instructor: course.instructorName || course.instructor?.name || 'Giảng viên',
                        rating: 4.5,
                        category: course.categoryName || course.category?.name,
                        studentCount: course.students || 0,
                        rawPrice: course.salePrice !== undefined && course.salePrice !== null ? course.salePrice : (course.price || 0),
                        price: new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(course.salePrice || course.price || 0),
                        originalPrice: course.discount > 0 ? new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(course.price) : null
                    }));
                    
                    // Title keyword filter matching
                    if (trimmed) {
                        const normKey = normalizeSearchText(trimmed);
                        results = results.filter(c => 
                            c.title && normalizeSearchText(c.title).includes(normKey)
                        );
                    }

                    // Category & Price filter
                    if (activeFilter !== 'Tất cả') {
                        results = results.filter(c => {
                            if (activeFilter === 'Miễn phí') return c.rawPrice === 0 || c.price === '0 ₫' || c.price === '0 đ';
                            return c.category === activeFilter;
                        });
                    }

                    // Price sorting
                    if (priceSort === 'asc') {
                        results.sort((a, b) => a.rawPrice - b.rawPrice);
                    } else if (priceSort === 'desc') {
                        results.sort((a, b) => b.rawPrice - a.rawPrice);
                    }
                    
                    setCourses(results);
                } catch (err) {
                    console.error('Error fetching search courses:', err);
                } finally {
                    setLoading(false);
                }
            };
            searchCourses();
        }, 300);
        
        return () => clearTimeout(timer);
    }, [query, activeFilter, priceSort]);

    // Pagination bar component
    const PaginationBar = () => {
        if (totalPages <= 1) return null;

        const getPages = () => {
            if (totalPages <= 5) return Array.from({ length: totalPages }, (_, i) => i + 1);
            if (currentPage <= 3) return [1, 2, 3, 4, 5];
            if (currentPage >= totalPages - 2) return [totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
            return [currentPage - 2, currentPage - 1, currentPage, currentPage + 1, currentPage + 2];
        };

        return (
            <View style={{
                flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
                paddingVertical: 16, paddingHorizontal: 12, gap: 4,
                backgroundColor: isDarkMode ? '#0f172a' : '#f8fafc',
                borderTopWidth: 1, borderTopColor: isDarkMode ? '#334155' : '#e2e8f0'
            }}>
                {/* Prev */}
                <TouchableOpacity
                    onPress={() => setCurrentPage(p => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    style={{
                        width: 36, height: 36, borderRadius: 10,
                        backgroundColor: currentPage === 1 ? (isDarkMode ? '#1e293b' : '#f1f5f9') : (isDarkMode ? '#334155' : '#fff'),
                        borderWidth: 1, borderColor: currentPage === 1 ? (isDarkMode ? '#334155' : '#e2e8f0') : (isDarkMode ? '#475569' : '#cbd5e1'),
                        alignItems: 'center', justifyContent: 'center',
                        opacity: currentPage === 1 ? 0.4 : 1,
                    }}
                >
                    <ChevronLeft size={16} color={isDarkMode ? "#94a3b8" : "#475569"} strokeWidth={2.5} />
                </TouchableOpacity>

                {/* Page numbers */}
                {getPages().map(page => (
                    <TouchableOpacity
                        key={page}
                        onPress={() => setCurrentPage(page)}
                        style={{
                            width: 36, height: 36, borderRadius: 10,
                            backgroundColor: currentPage === page ? '#2563eb' : (isDarkMode ? '#334155' : '#fff'),
                            borderWidth: 1, borderColor: currentPage === page ? '#2563eb' : (isDarkMode ? '#475569' : '#cbd5e1'),
                            alignItems: 'center', justifyContent: 'center',
                        }}
                    >
                        <AppText style={{
                            fontSize: 13,
                            fontWeight: '700',
                            color: currentPage === page ? '#ffffff' : (isDarkMode ? '#cbd5e1' : '#475569'),
                        }}>
                            {page}
                        </AppText>
                    </TouchableOpacity>
                ))}

                {/* Next */}
                <TouchableOpacity
                    onPress={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    style={{
                        width: 36, height: 36, borderRadius: 10,
                        backgroundColor: currentPage === totalPages ? (isDarkMode ? '#1e293b' : '#f1f5f9') : (isDarkMode ? '#334155' : '#fff'),
                        borderWidth: 1, borderColor: currentPage === totalPages ? (isDarkMode ? '#334155' : '#e2e8f0') : (isDarkMode ? '#475569' : '#cbd5e1'),
                        alignItems: 'center', justifyContent: 'center',
                        opacity: currentPage === totalPages ? 0.4 : 1,
                    }}
                >
                    <ChevronRight size={16} color={isDarkMode ? "#94a3b8" : "#475569"} strokeWidth={2.5} />
                </TouchableOpacity>
            </View>
        );
    };

    return (
        <View className={`flex-1 ${isDarkMode ? 'bg-slate-900' : 'bg-slate-50'}`}>
            {/* Header */}
            <View className={`pt-10 px-5 pb-4 ${isDarkMode ? 'bg-slate-800' : 'bg-white'}`}>
                <AppText className={`text-2xl font-extrabold mb-3.5 ${isDarkMode ? 'text-slate-100' : 'text-slate-800'}`}>
                    Tìm kiếm
                </AppText>
                <SearchBar
                    value={query}
                    onChangeText={setQuery}
                    onClear={() => setQuery('')}
                    style={{ backgroundColor: isDarkMode ? '#334155' : '#F1F5F9', borderWidth: 0, borderRadius: 12 }}
                />
            </View>

            {/* Filter Chips */}
            <View className={`border-b ${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-100'}`}>
                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={{ paddingHorizontal: 16, paddingVertical: 14, gap: 8 }}
                >
                    {FILTERS.map(f => (
                        <TouchableOpacity
                            key={f}
                            onPress={() => setActiveFilter(f)}
                            className={clsx(
                                'px-[18px] py-2 rounded-[10px] border',
                                activeFilter === f
                                    ? 'bg-blue-600 border-blue-600'
                                    : (isDarkMode ? 'bg-slate-700 border-slate-600' : 'bg-slate-50 border-slate-200'),
                            )}
                        >
                            <AppText className={clsx(
                                'text-[13px] font-bold',
                                activeFilter === f ? 'text-white' : (isDarkMode ? 'text-slate-300' : 'text-slate-500'),
                            )}>
                                {f}
                            </AppText>
                        </TouchableOpacity>
                    ))}
                </ScrollView>
            </View>

            {/* Price Sort & Results Count Bar */}
            <View className={`flex-row items-center justify-between px-4 py-2.5 border-b ${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-100'}`}>
                <AppText className={`text-xs font-semibold ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                    {courses.length} khóa học
                    {totalPages > 1 ? ` · Trang ${currentPage}/${totalPages}` : ''}
                </AppText>

                <TouchableOpacity
                    activeOpacity={0.7}
                    onPress={togglePriceSort}
                    className={clsx(
                        'flex-row items-center gap-1.5 px-3 py-1.5 rounded-full border',
                        priceSort !== 'default'
                            ? (isDarkMode ? 'bg-blue-950 border-blue-900' : 'bg-blue-50 border-blue-200')
                            : (isDarkMode ? 'bg-slate-700 border-slate-600' : 'bg-slate-50 border-slate-200')
                    )}
                >
                    {priceSort === 'asc' ? (
                        <ArrowUp size={14} color="#3b82f6" strokeWidth={2.5} />
                    ) : priceSort === 'desc' ? (
                        <ArrowDown size={14} color="#3b82f6" strokeWidth={2.5} />
                    ) : (
                        <ArrowUpDown size={14} color={isDarkMode ? "#94a3b8" : "#64748b"} strokeWidth={2} />
                    )}
                    <AppText className={clsx(
                        'text-xs font-bold',
                        priceSort !== 'default' ? 'text-blue-500' : (isDarkMode ? 'text-slate-300' : 'text-slate-600')
                    )}>
                        {priceSort === 'asc'
                            ? 'Giá: Thấp -> Cao'
                            : priceSort === 'desc'
                                ? 'Giá: Cao -> Thấp'
                                : 'Sắp xếp giá'}
                    </AppText>
                </TouchableOpacity>
            </View>

            {/* Results */}
            {loading ? (
                <View className="flex-1 items-center justify-center">
                    <ActivityIndicator size="large" color="#2563EB" />
                </View>
            ) : courses.length === 0 ? (
                <View className="flex-1 items-center justify-center pb-24">
                    <AppText className="text-5xl mb-3">🔍</AppText>
                    <AppText className={`text-[17px] font-bold mb-1.5 ${isDarkMode ? 'text-slate-100' : 'text-slate-800'}`}>
                        Không tìm thấy kết quả
                    </AppText>
                    <AppText className={`text-[13px] text-center px-10 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                        Hãy thử từ khóa khác hoặc thay đổi bộ lọc
                    </AppText>
                </View>
            ) : (
                <FlatList
                    data={paginatedCourses}
                    keyExtractor={item => item.id.toString()}
                    numColumns={2}
                    contentContainerStyle={{ padding: 16, paddingBottom: 8, gap: 12 }}
                    columnWrapperStyle={{ gap: 12 }}
                    showsVerticalScrollIndicator={false}
                    renderItem={({ item }) => (
                        <View className="flex-1">
                            <CourseCard course={item} />
                        </View>
                    )}
                    ListFooterComponent={<PaginationBar />}
                />
            )}
        </View>
    );
};

export default SearchScreen;
