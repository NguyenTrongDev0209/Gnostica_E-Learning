import AppText from '../ui/AppText';
import React from 'react';
import { View, TouchableOpacity } from 'react-native';
import { MonitorPlay, PenTool, Lightbulb, Briefcase, Languages, Sparkles, TrendingUp, Camera } from 'lucide-react-native';
import { categories } from '../../constants/mockData';
import { useNavigation } from '@react-navigation/native';

const ICONS = {
    MonitorPlay, PenTool, Lightbulb, Briefcase, Languages, Sparkles, TrendingUp, Camera
};

const CategorySection = () => {
    const navigation = useNavigation();
    return (
        <View className="mt-6">
            <View className="flex-row justify-between items-center px-5 mb-4">
                <AppText className="text-[18px] font-extrabold text-slate-800">Danh mục</AppText>
                <TouchableOpacity onPress={() => navigation.navigate('CategoryBrowse')}>
                    <AppText className="text-[13px] text-blue-600 font-semibold">Tất cả</AppText>
                </TouchableOpacity>
            </View>
            <View className="flex-row flex-wrap px-2">
                {categories.map((cat) => {
                    const IconComponent = ICONS[cat.icon];
                    return (
                        <TouchableOpacity
                            key={cat.id}
                            activeOpacity={0.75}
                            className="items-center w-[25%] mb-4"
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
                            <AppText className="text-[11px] text-slate-600 text-center font-semibold" numberOfLines={1}>
                                {cat.name}
                            </AppText>
                        </TouchableOpacity>
                    );
                })}
            </View>
        </View>
    );
};

export default CategorySection;
