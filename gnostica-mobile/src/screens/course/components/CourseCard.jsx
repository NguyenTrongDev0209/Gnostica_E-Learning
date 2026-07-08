import AppText from '../../../components/ui/AppText';
import React from 'react';
import { View, Image, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Star, Users } from 'lucide-react-native';
import MaskedView from '@react-native-masked-view/masked-view';
import { LinearGradient } from 'expo-linear-gradient';
import Avatar from '../../../components/ui/Avatar';

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
                        <AppText className="text-xs font-semibold text-blue-600 flex-1" numberOfLines={1}>
                            {course?.instructor}
                        </AppText>
                    </View>
                    <View className="bg-blue-600 px-1.5 py-0.5 rounded flex-row items-center gap-1">
                        <Star size={10} color="#FBBF24" fill="#FBBF24" />
                        <AppText className="text-[10px] font-bold text-white">
                            {(course?.rating || 0).toFixed(1)}
                        </AppText>
                    </View>
                </View>

                {/* Title */}
                <AppText
                    numberOfLines={2}
                    className="text-[14px] font-bold text-slate-900 leading-[20px] mb-2"
                    style={{ minHeight: 40 }}
                >
                    {course?.title}
                </AppText>

                {/* Category */}
                {course?.category && (
                    <View className="self-start bg-slate-50 rounded px-2 py-0.5 flex-row items-center gap-1.5 mb-2">
                        <View className="w-1.5 h-1.5 rounded-full bg-blue-600" />
                        <AppText className="text-[10px] font-semibold text-blue-600">
                            {course.category}
                        </AppText>
                    </View>
                )}

                {/* Students */}
                <View className="flex-row items-center gap-1.5 mb-2.5">
                    <Users size={12} color="#64748B" />
                    <AppText className="text-[11px] font-medium text-slate-500">
                        {course?.studentCount ? course.studentCount.toLocaleString('vi-VN') : 0} học viên
                    </AppText>
                </View>

                {/* Separator Line */}
                <View className="h-[1px] bg-slate-100 mb-2" />

                {/* Footer Row (Price) */}
                <View className="flex-row items-center justify-between">
                    <View className="flex-row items-end gap-1.5 flex-wrap flex-1">
                        <MaskedView
                            maskElement={
                                <AppText className="text-base font-extrabold bg-transparent">
                                    {course?.price}
                                </AppText>
                            }
                        >
                            <LinearGradient
                                colors={['#fb923c', '#ea580c']}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 0 }}
                            >
                                <AppText className="text-base font-extrabold opacity-0">
                                    {course?.price}
                                </AppText>
                            </LinearGradient>
                        </MaskedView>
                        {course?.originalPrice && (
                            <AppText className="text-[10px] text-slate-400 line-through mb-1">
                                {course.originalPrice}
                            </AppText>
                        )}
                    </View>
                    {discount > 0 && (
                        <View className="bg-red-50 px-1.5 py-0.5 rounded ml-1">
                            <AppText className="text-red-500 text-[10px] font-bold">
                                -{discount}%
                            </AppText>
                        </View>
                    )}
                </View>
            </View>
        </TouchableOpacity>
    );
};

export default CourseCard;
