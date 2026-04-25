import React from 'react';
import { Text, View, ScrollView, TouchableOpacity } from 'react-native';
import { MonitorPlay, PenTool, Lightbulb, Briefcase } from 'lucide-react-native';

const categories = [
    { name: 'Lập trình', icon: MonitorPlay },
    { name: 'Thiết kế', icon: PenTool },
    { name: 'Marketing', icon: Lightbulb },
    { name: 'Kinh doanh', icon: Briefcase },
];

const CategorySection = () => {
    return (
        <View className="mt-6">
            <View className="flex-row justify-between items-center px-5 mb-4">
                <Text className="text-xl font-bold text-gray-800">Danh mục nổi bật</Text>
                <TouchableOpacity>
                    <Text className="text-primary font-semibold active:opacity-60">Tất cả</Text>
                </TouchableOpacity>
            </View>
            <View className="flex-row justify-between px-5">
                {categories.map((cat, index) => {
                    const IconComponent = cat.icon;
                    return (
                        <View key={index} className="items-center w-[22%]">
                            <View className="w-16 h-16 rounded-2xl bg-white mb-2 shadow-sm border border-gray-100 items-center justify-center">
                                <IconComponent size={28} color="#2563eb" strokeWidth={1.5} />
                            </View>
                            <Text className="text-xs text-gray-500 text-center">{cat.name}</Text>
                        </View>
                    );
                })}
            </View>
        </View>
    );
};

export default CategorySection;
