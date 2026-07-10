import AppText from '../../../components/ui/AppText';
import React, { useState, useEffect } from 'react';
import { View, TouchableOpacity, ActivityIndicator } from 'react-native';
import { MonitorPlay, PenTool, Lightbulb, Briefcase, Languages, Sparkles, TrendingUp, Camera, LayoutGrid } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import categoryService from '../../../services/course/categoryService';

const ICONS = {
    MonitorPlay, PenTool, Lightbulb, Briefcase, Languages, Sparkles, TrendingUp, Camera
};

const iconNames = ['MonitorPlay', 'PenTool', 'Lightbulb', 'Briefcase', 'Languages', 'Sparkles', 'TrendingUp', 'Camera'];
const colors = ['#2563EB', '#16A34A', '#D97706', '#9333EA', '#E11D48', '#0D9488', '#4F46E5', '#C026D3'];

const CategorySection = () => {
    const navigation = useNavigation();
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const response = await categoryService.getAll({ limit: 8 });
                if (response.data && response.data.content) {
                    setCategories(response.data.content.slice(0, 8));
                } else if (response.data && Array.isArray(response.data)) {
                    setCategories(response.data.slice(0, 8));
                }
            } catch (error) {
                console.error('Error fetching categories:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchCategories();
    }, []);

    if (loading) {
        return (
            <View className="mt-6 px-5 py-4 items-center justify-center">
                <ActivityIndicator size="small" color="#2563EB" />
            </View>
        );
    }

    if (!categories.length) return null;

    return (
        <View className="mt-6">
            <View className="flex-row justify-between items-center px-5 mb-4">
                <AppText className="text-[18px] font-extrabold text-slate-800">Danh mục</AppText>
                <TouchableOpacity onPress={() => navigation.navigate('CategoryBrowse')}>
                    <AppText className="text-[13px] text-blue-600 font-semibold">Tất cả</AppText>
                </TouchableOpacity>
            </View>
            <View className="flex-row flex-wrap px-2">
                {categories.map((cat, index) => {
                    const IconName = cat.icon || iconNames[index % iconNames.length];
                    const IconComponent = ICONS[IconName] || LayoutGrid;
                    const catColor = cat.color || colors[index % colors.length];
                    
                    return (
                        <TouchableOpacity
                            key={cat.id}
                            activeOpacity={0.75}
                            onPress={() => navigation.navigate('CourseCatalog', { categoryId: cat.id, categoryName: cat.name })}
                            className="items-center w-[25%] mb-4"
                        >
                            <View
                                className="w-[58px] h-[58px] rounded-[18px] items-center justify-center mb-[7px]"
                                style={{
                                    backgroundColor: catColor + '15',
                                    borderWidth: 1,
                                    borderColor: catColor + '30',
                                }}
                            >
                                <IconComponent size={26} color={catColor} strokeWidth={1.8} />
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
