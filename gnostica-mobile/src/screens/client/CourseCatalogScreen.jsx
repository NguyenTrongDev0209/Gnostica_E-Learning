import React from 'react';
import { View, Text, ScrollView } from 'react-native';
import CourseCard from '../../components/home/CourseCard';
import { courses } from '../../constants/mockData';

const CourseCatalogScreen = () => {
    return (
        <ScrollView style={{ flex: 1, backgroundColor: '#F8FAFC' }}>
            <View style={{ padding: 20 }}>
                <Text style={{ fontSize: 20, fontWeight: '700', marginBottom: 12 }}>Danh mục khóa học</Text>
            </View>

            <View style={{ paddingHorizontal: 12, flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' }}>
                {courses.map(course => (
                    <View key={course.id} style={{ width: '48%', marginBottom: 12 }}>
                        <CourseCard course={course} />
                    </View>
                ))}
            </View>

            <View style={{ height: 20 }} />
        </ScrollView>
    );
};

export default CourseCatalogScreen;
