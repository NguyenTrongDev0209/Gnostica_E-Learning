import AppText from '../../components/ui/AppText';
import React, { useState } from 'react';
import { View, TouchableOpacity, FlatList } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { ArrowLeft, SlidersHorizontal, TrendingUp, Clock, DollarSign } from 'lucide-react-native';
import { clsx } from 'clsx';
import CourseCard from '../../components/home/CourseCard';
import { courses } from '../../constants/mockData';

const SORT_OPTIONS = [
    { key: 'popular', label: 'Phổ biến', icon: TrendingUp },
    { key: 'newest',  label: 'Mới nhất', icon: Clock },
    { key: 'price',   label: 'Giá',     icon: DollarSign },
];

const CourseCatalogScreen = () => {
    const navigation = useNavigation();
    const route = useRoute();
    const categoryName = route.params?.category;
    const [activeSort, setActiveSort] = useState('popular');

    const filteredCourses = categoryName
        ? courses.filter(c => c.category === categoryName)
        : courses;

    const sortedCourses = [...filteredCourses].sort((a, b) => {
        if (activeSort === 'newest') return b.id - a.id;
        if (activeSort === 'price') {
            const priceA = parseInt(a.price.replace(/\D/g, '')) || 0;
            const priceB = parseInt(b.price.replace(/\D/g, '')) || 0;
            return priceA - priceB;
        }
        return (b.studentCount || 0) - (a.studentCount || 0);
    });

    return (
        <View className="flex-1 bg-slate-50">
            {/* Header */}
            <View className="bg-white pt-12 pb-4 px-4 border-b border-slate-100">
                <View className="flex-row items-center justify-between">
                    <View className="flex-row items-center">
                        <TouchableOpacity onPress={() => navigation.goBack()} className="p-2">
                            <ArrowLeft size={24} color="#1e293b" />
                        </TouchableOpacity>
                        <View className="ml-2">
                            <AppText className="text-xl font-bold text-slate-800">
                                {categoryName || 'Tất cả khóa học'}
                            </AppText>
                            <AppText className="text-xs text-slate-400 mt-0.5">
                                {sortedCourses.length} khóa học
                            </AppText>
                        </View>
                    </View>
                    <TouchableOpacity className="w-10 h-10 bg-slate-50 rounded-xl items-center justify-center border border-slate-200">
                        <SlidersHorizontal size={18} color="#64748b" />
                    </TouchableOpacity>
                </View>

                {/* Sort Bar */}
                <View className="flex-row mt-4 gap-2">
                    {SORT_OPTIONS.map(option => (
                        <TouchableOpacity
                            key={option.key}
                            onPress={() => setActiveSort(option.key)}
                            className={clsx(
                                'flex-row items-center px-3.5 py-2 rounded-xl gap-1.5',
                                activeSort === option.key
                                    ? 'bg-blue-600'
                                    : 'bg-slate-50 border border-slate-200',
                            )}
                        >
                            <option.icon
                                size={14}
                                color={activeSort === option.key ? '#fff' : '#64748b'}
                            />
                            <AppText className={clsx(
                                'text-xs font-bold',
                                activeSort === option.key ? 'text-white' : 'text-slate-500',
                            )}>
                                {option.label}
                            </AppText>
                        </TouchableOpacity>
                    ))}
                </View>
            </View>

            {/* Course Grid */}
            <FlatList
                data={sortedCourses}
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
        </View>
    );
};

export default CourseCatalogScreen;
