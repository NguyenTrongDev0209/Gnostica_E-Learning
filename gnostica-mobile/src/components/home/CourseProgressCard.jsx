import AppText from '../ui/AppText';
import React from 'react';
import { View, Image, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';

const CourseProgressCard = ({ course }) => {
    const navigation = useNavigation();
    const progress = course?.progress || 0;
    const isCompleted = progress >= 100;

    return (
        <TouchableOpacity
            onPress={() => navigation.navigate('Learning', { course })}
            activeOpacity={0.85}
            className="flex-row bg-white rounded-[14px] mb-3 overflow-hidden border border-slate-100 shadow-sm"
        >
            {/* Thumbnail */}
            <Image
                source={{ uri: course?.thumbnail }}
                className="bg-slate-200"
                style={{ width: 96, minHeight: 96 }}
                resizeMode="cover"
            />

            {/* Content */}
            <View className="flex-1 p-3">
                <AppText numberOfLines={2} className="text-[13px] font-bold text-slate-800 leading-[18px]">
                    {course?.title}
                </AppText>
                <AppText className="text-[11px] text-slate-500 mt-[3px] mb-2.5" numberOfLines={1}>
                    {course?.lastLesson}
                </AppText>

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
                    <View className="flex-row justify-between mt-[5px]">
                        <AppText
                            className="text-[11px] font-bold"
                            style={{ color: isCompleted ? '#10B981' : '#2563EB' }}
                        >
                            {isCompleted ? '✓ Hoàn thành' : `${progress}% hoàn thành`}
                        </AppText>
                        {!isCompleted && (
                            <AppText className="text-[11px] text-slate-400 font-medium">Tiếp tục</AppText>
                        )}
                    </View>
                </View>
            </View>
        </TouchableOpacity>
    );
};

export default CourseProgressCard;
