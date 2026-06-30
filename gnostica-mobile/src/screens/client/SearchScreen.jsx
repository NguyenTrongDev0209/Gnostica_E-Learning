import AppText from '../../components/ui/AppText';
import React, { useState, useEffect } from 'react';
import { View, ScrollView, TouchableOpacity, FlatList, ActivityIndicator } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { clsx } from 'clsx';
import SearchBar from '../../components/ui/SearchBar';
import CourseCard from '../../components/home/CourseCard';
import courseService from '../../services/courseService';

const FILTERS = ['Tất cả', 'Miễn phí', 'Lập trình', 'Thiết kế', 'Marketing', 'Ngoại ngữ'];

const SearchScreen = () => {
    const [query, setQuery] = useState('');
    const [activeFilter, setActiveFilter] = useState('Tất cả');
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const timer = setTimeout(() => {
            const searchCourses = async () => {
                setLoading(true);
                try {
                    const response = await courseService.getAll({ 
                        title: query !== '' ? query : undefined 
                    });
                    
                    let results = [];
                    if (response.content) {
                        results = response.content.map(course => ({
                            id: course.id.toString(),
                            slug: course.slug,
                            title: course.title,
                            thumbnail: course.thumbnail,
                            instructor: course.instructorName || 'Giảng viên',
                            rating: 4.5,
                            category: course.categoryName,
                            studentCount: course.students || 0,
                            price: new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(course.salePrice),
                            originalPrice: course.discount > 0 ? new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(course.price) : null
                        }));
                    }
                    
                    // Local filtering if needed since backend might not support complex filters
                    if (activeFilter !== 'Tất cả') {
                        results = results.filter(c => {
                            if (activeFilter === 'Miễn phí') return c.price === '0 ₫' || c.price === '0 đ';
                            return c.category === activeFilter;
                        });
                    }
                    
                    setCourses(results);
                } catch (err) {
                    console.error(err);
                } finally {
                    setLoading(false);
                }
            };
            searchCourses();
        }, 500); // debounce 500ms
        
        return () => clearTimeout(timer);
    }, [query, activeFilter]);

    return (
        <View className="flex-1 bg-slate-50">
            {/* Header */}
            <View className="bg-white pt-10 px-5 pb-4">
                <AppText className="text-2xl font-extrabold text-slate-800 mb-3.5">
                    Tìm kiếm
                </AppText>
                <SearchBar
                    value={query}
                    onChangeText={setQuery}
                    onClear={() => setQuery('')}
                    style={{ backgroundColor: '#F1F5F9', borderWidth: 0, borderRadius: 12 }}
                />
            </View>

            {/* Filter Chips */}
            <View className="bg-white border-b border-slate-100">
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
                                    : 'bg-slate-50 border-slate-200',
                            )}
                        >
                            <AppText className={clsx(
                                'text-[13px] font-bold',
                                activeFilter === f ? 'text-white' : 'text-slate-500',
                            )}>
                                {f}
                            </AppText>
                        </TouchableOpacity>
                    ))}
                </ScrollView>
            </View>

            {/* Results */}
            {loading ? (
                <View className="flex-1 items-center justify-center">
                    <ActivityIndicator size="large" color="#2563EB" />
                </View>
            ) : courses.length === 0 ? (
                <View className="flex-1 items-center justify-center pb-24">
                    <AppText className="text-5xl mb-3">🔍</AppText>
                    <AppText className="text-[17px] font-bold text-slate-800 mb-1.5">
                        Không tìm thấy kết quả
                    </AppText>
                    <AppText className="text-[13px] text-slate-500 text-center px-10">
                        Hãy thử từ khóa khác hoặc thay đổi bộ lọc
                    </AppText>
                </View>
            ) : (
                <FlatList
                    data={courses}
                    keyExtractor={item => item.id.toString()}
                    numColumns={2}
                    contentContainerStyle={{ padding: 16, paddingBottom: 120, gap: 12 }}
                    columnWrapperStyle={{ gap: 12 }}
                    showsVerticalScrollIndicator={false}
                    renderItem={({ item }) => (
                        <View className="flex-1">
                            <CourseCard course={item} />
                        </View>
                    )}
                />
            )}
        </View>
    );
};

export default SearchScreen;
