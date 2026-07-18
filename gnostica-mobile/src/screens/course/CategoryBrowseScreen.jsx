import AppText from '../../components/ui/AppText';
import React, { useState, useEffect } from 'react';
import { View, ScrollView, TouchableOpacity, Image, ActivityIndicator } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Search, Star, Globe, Smartphone, Cpu, BarChart3, Target, Briefcase, Monitor, LayoutGrid } from 'lucide-react-native';
import AppHeader from '../../components/ui/AppHeader';
import categoryService from '../../services/course/categoryService';

const ICONS = {
    Globe, Smartphone, Cpu, BarChart3, Target, Briefcase, Monitor
};
const iconNames = ['Globe', 'Smartphone', 'Cpu', 'BarChart3', 'Target', 'Briefcase', 'Monitor'];
const colors = ['#3b82f6', '#ec4899', '#8b5cf6', '#10b981', '#f59e0b', '#6366f1', '#06b6d4'];

const CategoryBrowseScreen = () => {
    const navigation = useNavigation();
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const response = await categoryService.getAll();
                let data = response.data?.content || response.content || response.data || response;
                if (Array.isArray(data)) {
                    setCategories(data);
                }
            } catch (error) {
                console.error('Error fetching categories:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchCategories();
    }, []);

    return (
        <View className="flex-1 bg-slate-50">
            {/* Header */}
            <AppHeader title="Khám phá danh mục" />

            <ScrollView className="flex-1 p-4" showsVerticalScrollIndicator={false}>
                {loading ? (
                    <ActivityIndicator size="large" color="#2563EB" style={{ marginTop: 40 }} />
                ) : (
                    <View className="flex-row flex-wrap justify-between">
                        {categories.map((cat, index) => {
                            const IconName = cat.icon || iconNames[index % iconNames.length];
                            const IconComponent = ICONS[IconName] || LayoutGrid;
                            const catColor = cat.color || colors[index % colors.length];

                            return (
                                <TouchableOpacity
                                    key={cat.id}
                                    className="w-[48%] bg-white rounded-3xl p-5 mb-4 shadow-sm border border-slate-100 items-center"
                                    onPress={() => navigation.navigate('CourseCatalog', { categoryId: cat.id, categoryName: cat.name })}
                                >
                                    <View
                                        className="w-14 h-14 rounded-2xl items-center justify-center mb-3"
                                        style={{ backgroundColor: catColor + '15' }}
                                    >
                                        <IconComponent size={28} color={catColor} />
                                    </View>
                                    <AppText className="text-slate-900 font-bold text-center text-sm">{cat.name}</AppText>
                                    <AppText className="text-slate-400 text-[10px] mt-1">{cat.courseCount || 0} Khóa học</AppText>
                                </TouchableOpacity>
                            )
                        })}
                    </View>
                )}

                {/* Featured Section in Category */}
                <View className="mt-4">
                    <AppText className="text-lg font-bold text-slate-800 mb-4">Danh mục phổ biến</AppText>
                    <View className="bg-blue-600 rounded-3xl p-6 flex-row items-center justify-between overflow-hidden">
                        <View className="flex-1 pr-4">
                            <AppText className="text-white font-bold text-xl mb-2">Ưu đãi hè - Lập trình</AppText>
                            <AppText className="text-blue-100 text-xs">Giảm tới 70% các khóa học lập trình web và di động duy nhất trong tháng này.</AppText>
                            <TouchableOpacity className="bg-white px-4 py-2 rounded-xl mt-4 self-start">
                                <AppText className="text-blue-600 font-bold text-xs">Xem ngay</AppText>
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
