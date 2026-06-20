import React from 'react';
import { Text, View, Image, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Star, Users } from 'lucide-react-native';
import Avatar from '../ui/Avatar';

const CourseCard = ({ course, width }) => {
    const navigation = useNavigation();

    // Calculate discount
    const currentPrice = parseInt(course?.price?.replace(/\D/g, '')) || 0;
    const originalPrice = parseInt(course?.originalPrice?.replace(/\D/g, '')) || 0;
    const discount = originalPrice > 0 ? Math.round(((originalPrice - currentPrice) / originalPrice) * 100) : 0;

    return (
        <TouchableOpacity
            onPress={() => navigation.navigate('CourseDetail', { course })}
            className="bg-white rounded-[14px] flex-col shadow-sm border border-slate-200 overflow-hidden mb-1"
            style={{ width: width || '100%' }}
            activeOpacity={0.85}
        >
            {/* Top Image Section */}
            <View className="p-2 pb-0">
                <View className="w-full h-[130px] rounded-lg overflow-hidden bg-slate-100">
                    <Image
                        source={{ uri: course?.thumbnail }}
                        className="w-full h-full"
                        resizeMode="cover"
                    />
                </View>
            </View>

            {/* Content Section */}
            <View className="p-3 pt-3 flex-col">
                {/* Top Row: Instructor & Rating */}
                <View className="flex-row items-center justify-between mb-2">
                    <View className="flex-row items-center gap-1.5 flex-1 pr-2">
                        <Avatar name={course?.instructor || 'GV'} size={20} />
                        <Text className="text-xs font-semibold text-blue-600 flex-1" numberOfLines={1}>
                            {course?.instructor}
                        </Text>
                    </View>
                    <View className="bg-blue-600 px-1.5 py-0.5 rounded flex-row items-center gap-1">
                        <Star size={10} color="#FBBF24" fill="#FBBF24" />
                        <Text className="text-[10px] font-bold text-white">
                            {(course?.rating || 0).toFixed(1)}
                        </Text>
                    </View>
                </View>

                {/* Title */}
                <Text
                    numberOfLines={2}
                    className="text-[14px] font-bold text-slate-900 leading-[20px] mb-2"
                    style={{ minHeight: 40 }}
                >
                    {course?.title}
                </Text>

                {/* Category */}
                {course?.category && (
                    <View className="self-start bg-slate-50 rounded px-2 py-0.5 flex-row items-center gap-1.5 mb-2">
                        <View className="w-1.5 h-1.5 rounded-full bg-blue-600" />
                        <Text className="text-[10px] font-semibold text-blue-600">
                            {course.category}
                        </Text>
                    </View>
                )}

                {/* Students */}
                <View className="flex-row items-center gap-1.5 mb-2.5">
                    <Users size={12} color="#64748B" />
                    <Text className="text-[11px] font-medium text-slate-500">
                        {course?.studentCount ? course.studentCount.toLocaleString('vi-VN') : 0} học viên
                    </Text>
                </View>

                {/* Separator Line */}
                <View className="h-[1px] bg-slate-100 mb-2" />

                {/* Footer Row (Price) */}
                <View className="flex-row items-center justify-between">
                    <View className="flex-row items-end gap-1.5 flex-wrap flex-1">
                        <Text className="text-base font-extrabold text-blue-600">
                            {course?.price}
                        </Text>
                        {course?.originalPrice && (
                            <Text className="text-[10px] text-slate-400 line-through mb-1">
                                {course.originalPrice}
                            </Text>
                        )}
                    </View>
                    {discount > 0 && (
                        <View className="bg-red-50 px-1.5 py-0.5 rounded ml-1">
                            <Text className="text-red-500 text-[10px] font-bold">
                                -{discount}%
                            </Text>
                        </View>
                    )}
                </View>
            </View>
        </TouchableOpacity>
    );
};

export default CourseCard;
