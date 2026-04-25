import React from 'react';
import { Text, View, ScrollView, TouchableOpacity } from 'react-native';
import CourseCard from './CourseCard';

const courses = [
    { id: 1, title: 'Khóa học React Native từ cơ bản đến nâng cao', instructor: 'Nguyễn Văn A', price: '499.000đ' },
    { id: 2, title: 'Thiết kế UI/UX chuyên nghiệp với Figma', instructor: 'Lê Thị B', price: '399.000đ' },
    { id: 3, title: 'Lập trình Spring Boot Backend thực chiến', instructor: 'Trần Văn C', price: '599.000đ' },
];

const CourseSection = ({ title }) => {
    return (
        <View className="mt-6">
            <View className="flex-row justify-between items-center px-5 mb-4">
                <Text className="text-xl font-bold text-gray-800">{title}</Text>
                <TouchableOpacity>
                    <Text className="text-primary font-semibold active:opacity-60">Xem thêm</Text>
                </TouchableOpacity>
            </View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 15 }}>
                {courses.map((course) => (
                    <CourseCard
                        key={course.id}
                        title={course.title}
                        instructor={course.instructor}
                        price={course.price}
                    />
                ))}
            </ScrollView>
        </View>
    );
};

export default CourseSection;
