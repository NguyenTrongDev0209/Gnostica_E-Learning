import React from 'react';
import { Text, View, ScrollView, TouchableOpacity } from 'react-native';
import CourseCard from './CourseCard';
import { courses, featuredCourses } from '../../constants/mockData';

const CourseSection = ({ title, variant = 'trending' }) => {
    const data = variant === 'featured' ? featuredCourses : courses;

    return (
        <View style={{ marginTop: 28 }}>
            <View style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
                paddingHorizontal: 20,
                marginBottom: 12,
            }}>
                <Text style={{ fontSize: 18, fontWeight: '800', color: '#1E293B' }}>{title}</Text>
                <TouchableOpacity>
                    <Text style={{ fontSize: 13, color: '#2563EB', fontWeight: '600' }}>Xem tất cả</Text>
                </TouchableOpacity>
            </View>
            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{ paddingHorizontal: 12, paddingBottom: 4 }}
            >
                {data.map((course) => (
                    <View key={course.id} style={{ marginHorizontal: 8 }}>
                        <CourseCard course={course} width={220} />
                    </View>
                ))}
            </ScrollView>
        </View>
    );
};

export default CourseSection;
