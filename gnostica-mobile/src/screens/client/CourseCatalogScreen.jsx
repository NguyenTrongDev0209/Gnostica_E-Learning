import AppText from '../../components/ui/AppText';
import React, { useState } from 'react';
import { View, TouchableOpacity, FlatList } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { SlidersHorizontal, TrendingUp, Clock, DollarSign } from 'lucide-react-native';
import { clsx } from 'clsx';
import CourseCard from '../../components/home/CourseCard';
import { courses } from '../../constants/mockData';
import AppHeader from '../../components/ui/AppHeader';


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
            <AppHeader title="Tất cả khóa học" />

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
