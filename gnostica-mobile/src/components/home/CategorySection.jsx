import React from 'react';
import { Text, View, ScrollView, TouchableOpacity } from 'react-native';
import { MonitorPlay, PenTool, Lightbulb, Briefcase, Languages, Sparkles } from 'lucide-react-native';
import { categories } from '../../constants/mockData';
import { useNavigation } from '@react-navigation/native';

const ICONS = {
    MonitorPlay, PenTool, Lightbulb, Briefcase, Languages, Sparkles,
};

const CategorySection = () => {
    const navigation = useNavigation();
    return (
        <View className="mt-6">
            <View className="flex-row justify-between items-center px-5 mb-3.5">
                <Text className="text-[18px] font-extrabold text-slate-800">Danh mục</Text>
                <TouchableOpacity onPress={() => navigation.navigate('CategoryBrowse')}>
                    <Text className="text-[13px] text-blue-600 font-semibold">Tất cả</Text>
                </TouchableOpacity>
            </View>
            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{ paddingHorizontal: 16, gap: 10 }}
            >
                {categories.map((cat) => {
                    const IconComponent = ICONS[cat.icon];
                    return (
                        <TouchableOpacity
                            key={cat.id}
                            activeOpacity={0.75}
                            className="items-center w-[74px]"
                        >
                            <View
                                className="w-[58px] h-[58px] rounded-[18px] items-center justify-center mb-[7px]"
                                style={{
                                    backgroundColor: cat.bgColor,
                                    borderWidth: 1,
                                    borderColor: cat.color + '30',
                                }}
                            >
                                {IconComponent && <IconComponent size={26} color={cat.color} strokeWidth={1.8} />}
                            </View>
                            <Text className="text-[11px] text-slate-600 text-center font-semibold" numberOfLines={1}>
                                {cat.name}
                            </Text>
                        </TouchableOpacity>
                    );
                })}
            </ScrollView>
        </View>
    );
};

export default CategorySection;
