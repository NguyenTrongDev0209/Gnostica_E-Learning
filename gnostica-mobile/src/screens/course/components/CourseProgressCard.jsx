import AppText from '../../../components/ui/AppText';
import React from 'react';
import { View, Image, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';

const CourseProgressCard = ({ course, onPress }) => {
    const navigation = useNavigation();
    const rawProgress = course?.progressPercent ?? course?.progress ?? 0;
    const progress = Math.min(100, Math.max(0, Math.round(rawProgress)));
    const isCompleted = progress >= 100 || course?.completed;

    const handlePress = () => {
        if (onPress) {
            onPress();
        } else {
            navigation.navigate('Learning', { course });
        }
    };

    return (
        <TouchableOpacity
            onPress={handlePress}
            activeOpacity={0.85}
            className="flex-row bg-white rounded-[14px] mb-3 overflow-hidden border border-slate-100 shadow-sm"
        >
            {/* Thumbnail */}
            <Image
                source={{ uri: course?.thumbnail || course?.courseThumbnail || 'https://via.placeholder.com/150' }}
                className="bg-slate-200"
                style={{ width: 96, minHeight: 96 }}
                resizeMode="cover"
            />

            {/* Content */}
            <View className="flex-1 p-3 justify-between">
                <View>
                    <AppText numberOfLines={2} className="text-[13px] font-bold text-slate-800 leading-[18px]">
                        {course?.title || course?.courseTitle}
                    </AppText>
                    <AppText className="text-[11px] text-slate-500 mt-[3px] mb-2" numberOfLines={1}>
                        {course?.instructorName ? `Giảng viên: ${course.instructorName}` : (course?.lastLesson || 'Bài học tiếp theo')}
                    </AppText>
                </View>

                {/* Progress Bar */}
                <View>
                    <View className="h-1.5 bg-slate-200 rounded-full overflow-hidden">
                        <View
                            className="h-full rounded-full"
                            style={{
                                width: `${progress}%`,
                                backgroundColor: isCompleted ? '#10B981' : '#2563EB',
                            }}
                        />
                    </View>
                    <View className="flex-row justify-between mt-[5px] items-center">
                        <AppText
                            className="text-[11px] font-bold"
                            style={{ color: isCompleted ? '#10B981' : '#2563EB' }}
                        >
                            {isCompleted ? '✓ Hoàn thành' : `${progress}% hoàn thành`}
                        </AppText>
                        {!isCompleted && (
                            <AppText className="text-[11px] text-slate-400 font-medium">
                                {course?.completedLessons !== undefined && course?.totalLessons ? `${course.completedLessons}/${course.totalLessons} bài` : 'Tiếp tục'}
                            </AppText>
                        )}
                    </View>
                </View>
            </View>
        </TouchableOpacity>
    );
};

export default CourseProgressCard;
