import AppText from '../ui/AppText';
import React from 'react';
import { View, ScrollView, TouchableOpacity } from 'react-native';
import CourseCard from './CourseCard';
import { courses, featuredCourses } from '../../constants/mockData';

const CourseSection = ({ title, variant = 'trending' }) => {
    const data = variant === 'featured' ? featuredCourses : courses;

    return (
        <View className="mt-7">
            <View className="flex-row justify-between items-center px-5 mb-3">
                <AppText className="text-[18px] font-extrabold text-slate-800">{title}</AppText>
                <TouchableOpacity>
                    <AppText className="text-[13px] text-blue-600 font-semibold">Xem tất cả</AppText>
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
