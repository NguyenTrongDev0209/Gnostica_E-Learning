import AppText from '../../../components/ui/AppText';
import React, { useState, useEffect } from 'react';
import { View, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import CourseCard from './CourseCard';
import courseService from '../../../services/course/courseService';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../../../context/ThemeContext';
import { useAuth } from '../../../context/AuthContext';

const CourseSection = ({ title, variant = 'trending', customData, limit = 5 }) => {
    const navigation = useNavigation();
    const { isAuthenticated } = useAuth();
    const { isDarkMode } = useTheme();
    const [data, setData] = useState(customData || []);
    const [loading, setLoading] = useState(!customData);

    useEffect(() => {
        if (customData) {
            setData(customData);
            setLoading(false);
            return;
        }

        // Nếu là 'foryou' mà chưa đăng nhập → bỏ qua, không fetch
        if (variant === 'foryou' && !isAuthenticated) {
            setLoading(false);
            return;
        }

        const fetchCourses = async () => {
            try {
                let response;
                if (variant === 'featured') {
                    response = await courseService.getAll({ size: limit });
                } else if (variant === 'foryou') {
                    response = await courseService.getRecommendations({ size: limit });
                } else {
                    response = await courseService.getAll({ size: limit });
                }
                
                if (response && response.content && response.content.length > 0) {
                    const formatted = response.content.map(course => ({
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
                    setData(formatted);
                } else {
                    setData([]);
                }
            } catch (error) {
                const errorMsg = error?.message || error?.error || (typeof error === 'object' ? JSON.stringify(error) : String(error));
                console.warn(`Unable to fetch ${variant} courses from server: ${errorMsg}`);
                setData([]);
            } finally {
                setLoading(false);
            }
        };

        fetchCourses();
    }, [variant, customData, limit, isAuthenticated]);

    if (loading) {
        return (
            <View className="mt-7 px-5 py-10 items-center justify-center">
                <ActivityIndicator size="small" color="#2563EB" />
            </View>
        );
    }

    if (!data || data.length === 0) return null;

    return (
        <View className="mt-7">
            <View className="flex-row justify-between items-center px-5 mb-3">
                <AppText className={`text-[18px] font-extrabold ${isDarkMode ? 'text-slate-100' : 'text-slate-800'}`}>{title}</AppText>
                <TouchableOpacity onPress={() => navigation.navigate('CourseCatalog')}>
                    <AppText className="text-[13px] text-blue-500 font-semibold">Xem tất cả</AppText>
                </TouchableOpacity>
            </View>
            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{ paddingHorizontal: 12, paddingBottom: 4 }}
            >
                {data.map((course) => (
                    <View key={course.id} className="mx-2">
                        <CourseCard course={course} width={220} />
                    </View>
                ))}
            </ScrollView>
        </View>
    );
};

export default CourseSection;
