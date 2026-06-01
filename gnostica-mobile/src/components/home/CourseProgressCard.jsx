import React from 'react';
import { View, Text, Image, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';

const CourseProgressCard = ({ course }) => {
    const navigation = useNavigation();
    const progress = course?.progress || 0;
    const isCompleted = progress >= 100;

    return (
        <TouchableOpacity
            onPress={() => navigation.navigate('Learning', { course })}
            activeOpacity={0.85}
            style={{
                flexDirection: 'row',
                backgroundColor: '#ffffff',
                borderRadius: 14,
                marginBottom: 12,
                overflow: 'hidden',
                borderWidth: 1,
                borderColor: '#F1F5F9',
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 1 },
                shadowOpacity: 0.06,
                shadowRadius: 6,
                elevation: 2,
            }}
        >
            {/* Thumbnail */}
            <Image
                source={{ uri: course?.thumbnail }}
                style={{ width: 96, height: 'auto', backgroundColor: '#E2E8F0', minHeight: 96 }}
                resizeMode="cover"
            />

            {/* Content */}
            <View style={{ flex: 1, padding: 12 }}>
                <Text numberOfLines={2} style={{ fontSize: 13, fontWeight: '700', color: '#1E293B', lineHeight: 18 }}>
                    {course?.title}
                </Text>
                <Text style={{ fontSize: 11, color: '#64748B', marginTop: 3, marginBottom: 10 }} numberOfLines={1}>
                    {course?.lastLesson}
                </Text>

                {/* Progress Bar */}
                <View>
                    <View style={{
                        height: 6,
                        backgroundColor: '#E2E8F0',
                        borderRadius: 99,
                        overflow: 'hidden',
                    }}>
                        <View style={{
                            height: '100%',
                            width: `${progress}%`,
                            backgroundColor: isCompleted ? '#10B981' : '#2563EB',
                            borderRadius: 99,
                        }} />
                    </View>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 5 }}>
                        <Text style={{ fontSize: 11, color: isCompleted ? '#10B981' : '#2563EB', fontWeight: '700' }}>
                            {isCompleted ? '✓ Hoàn thành' : `${progress}% hoàn thành`}
                        </Text>
                        {!isCompleted && (
                            <Text style={{ fontSize: 11, color: '#94A3B8', fontWeight: '500' }}>Tiếp tục</Text>
                        )}
                    </View>
                </View>
            </View>
        </TouchableOpacity>
    );
};

export default CourseProgressCard;
