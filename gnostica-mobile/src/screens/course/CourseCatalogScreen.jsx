import AppText from '../../components/ui/AppText';
import React, { useState, useEffect } from 'react';
import { View, TouchableOpacity, FlatList, ActivityIndicator } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { SlidersHorizontal, TrendingUp, Clock, DollarSign } from 'lucide-react-native';
import { clsx } from 'clsx';
import CourseCard from './components/CourseCard';
import courseService from '../../services/course/courseService';
import AppHeader from '../../components/ui/AppHeader';

const SORT_OPTIONS = [
    { key: 'popular', label: 'Phổ biến', icon: TrendingUp },
    { key: 'newest',  label: 'Mới nhất', icon: Clock },
    { key: 'price',   label: 'Giá',     icon: DollarSign },
];

const CourseCatalogScreen = () => {
    const navigation = useNavigation();
    const route = useRoute();
    const { categoryId, categoryName } = route.params || {};
    const [activeSort, setActiveSort] = useState('popular');
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchCourses = async () => {
            setLoading(true);
            try {
                // sort mapping: popular -> rating? newest -> createdAt? price -> salePrice?
                let sortBy = 'id';
                let sortDir = 'desc';
                if (activeSort === 'newest') {
                    sortBy = 'id';
                } else if (activeSort === 'price') {
                    sortBy = 'salePrice';
                    sortDir = 'asc';
                }
                
                const response = await courseService.getAll({ 
                    categoryId: categoryId,
                    sortBy: sortBy,
                    sortDir: sortDir
                });
                
                if (response.content) {
                    const formatted = response.content.map(course => ({
                        id: course.id.toString(),
                        slug: course.slug,
                        title: course.title,
                        thumbnail: course.thumbnail,
                        instructor: course.instructorName || 'Giảng viên',
                        rating: 4.5, // Giả sử backend chưa có field rating cho từng khóa ở API list
                        category: course.categoryName || categoryName,
                        studentCount: course.students || 0,
                        price: new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(course.salePrice),
                        originalPrice: course.discount > 0 ? new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(course.price) : null
                    }));
                    setCourses(formatted);
                }
            } catch (error) {
                console.error('Error fetching course catalog:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchCourses();
    }, [categoryId, activeSort]);

    return (
        <View className="flex-1 bg-slate-50">
            {/* Header */}
            <AppHeader title={categoryName || "Tất cả khóa học"} />

            {/* Sort options */}
            <View className="bg-white border-b border-slate-100 flex-row px-4 py-3 justify-between">
                {SORT_OPTIONS.map(opt => {
                    const isActive = activeSort === opt.key;
                    return (
                        <TouchableOpacity
                            key={opt.key}
                            onPress={() => setActiveSort(opt.key)}
                            className={clsx(
                                "flex-row items-center gap-1.5 px-3 py-1.5 rounded-lg",
                                isActive ? "bg-blue-50" : ""
                            )}
                        >
                            <opt.icon size={16} color={isActive ? "#2563EB" : "#64748B"} />
                            <AppText className={clsx(
                                "text-sm font-semibold",
                                isActive ? "text-blue-600" : "text-slate-500"
                            )}>{opt.label}</AppText>
                        </TouchableOpacity>
                    );
                })}
            </View>

            {/* Course Grid */}
            {loading ? (
                <View className="flex-1 items-center justify-center">
                    <ActivityIndicator size="large" color="#2563EB" />
                </View>
            ) : (
                <FlatList
                    data={courses}
                    keyExtractor={item => item.id.toString()}
                    numColumns={2}
                    contentContainerStyle={{ padding: 12, paddingBottom: 100 }}
                    columnWrapperStyle={{ gap: 12 }}
                    ItemSeparatorComponent={() => <View className="h-3" />}
                    showsVerticalScrollIndicator={false}
                    renderItem={({ item }) => (
                        <View className="flex-1">
                            <CourseCard course={item} />
                        </View>
                    )}
                    ListEmptyComponent={
                        <View className="items-center justify-center py-20">
                            <AppText className="text-5xl mb-4">📚</AppText>
                            <AppText className="text-lg font-bold text-slate-800">Chưa có khóa học</AppText>
                            <AppText className="text-sm text-slate-500 mt-1">Danh mục này đang được cập nhật.</AppText>
                        </View>
                    }
                />
            )}
        </View>
    );
};

export default CourseCatalogScreen;
