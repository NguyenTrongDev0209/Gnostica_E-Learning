import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { ArrowLeft, Search, Star, Globe, Smartphone, Cpu, BarChart3, Target, Briefcase, Monitor } from 'lucide-react-native';

const CATEGORIES = [
    { id: '1', name: 'Lập trình Web', courses: 24, icon: Globe, color: '#3b82f6' },
    { id: '2', name: 'Thiết kế Mobile', courses: 15, icon: Smartphone, color: '#ec4899' },
    { id: '3', name: 'Trí tuệ nhân tạo', courses: 8, icon: Cpu, color: '#8b5cf6' },
    { id: '4', name: 'Data Science', courses: 12, icon: BarChart3, color: '#10b981' },
    { id: '5', name: 'Digital Marketing', courses: 20, icon: Target, color: '#f59e0b' },
    { id: '6', name: 'Kỹ năng lãnh đạo', courses: 10, icon: Briefcase, color: '#6366f1' },
];

const CategoryBrowseScreen = () => {
    const navigation = useNavigation();

    return (
        <View className="flex-1 bg-slate-50">
            {/* Header */}
            <View className="bg-white pt-12 pb-4 px-4 border-b border-slate-100 flex-row items-center">
                <TouchableOpacity onPress={() => navigation.goBack()} className="p-2">
                    <ArrowLeft size={24} color="#1e293b" />
                </TouchableOpacity>
                <Text className="text-xl font-bold text-slate-800 ml-2">Khám phá danh mục</Text>
            </View>

            <ScrollView className="flex-1 p-4">
                <View className="flex-row flex-wrap justify-between">
                    {CATEGORIES.map(cat => (
                        <TouchableOpacity
                            key={cat.id}
                            className="w-[48%] bg-white rounded-3xl p-5 mb-4 shadow-sm border border-slate-100 items-center"
                            onPress={() => navigation.navigate('CourseCatalog', { category: cat.name })}
                        >
                            <View
                                className="w-14 h-14 rounded-2xl items-center justify-center mb-3"
                                style={{ backgroundColor: cat.color + '15' }}
                            >
                                <cat.icon size={28} color={cat.color} />
                            </View>
                            <Text className="text-slate-900 font-bold text-center text-sm">{cat.name}</Text>
                            <Text className="text-slate-400 text-[10px] mt-1">{cat.courses} Khóa học</Text>
                        </TouchableOpacity>
                    ))}
                </View>

                {/* Featured Section in Category */}
                <View className="mt-4">
                    <Text className="text-lg font-bold text-slate-800 mb-4">Danh mục phổ biến</Text>
                    <View className="bg-blue-600 rounded-3xl p-6 flex-row items-center justify-between overflow-hidden">
                        <View className="flex-1 pr-4">
                            <Text className="text-white font-bold text-xl mb-2">Ưu đãi hè - Lập trình</Text>
                            <Text className="text-blue-100 text-xs">Giảm tới 70% các khóa học lập trình web và di động duy nhất trong tháng này.</Text>
                            <TouchableOpacity className="bg-white px-4 py-2 rounded-xl mt-4 self-start">
                                <Text className="text-blue-600 font-bold text-xs">Xem ngay</Text>
                            </TouchableOpacity>
                        </View>
                        <View className="opacity-20 -mr-6">
                            <Monitor size={80} color="#fff" />
                        </View>
                    </View>
                </View>
                <View className="h-10" />
            </ScrollView>
        </View>
    );
};

export default CategoryBrowseScreen;
