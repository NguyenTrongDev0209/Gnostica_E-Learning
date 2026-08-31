import AppText from '../../components/ui/AppText';
import React, { useState, useEffect, useMemo } from 'react';
import { View, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Globe, Smartphone, Cpu, BarChart3, Target, Briefcase, LayoutGrid, Award, ChevronRight } from 'lucide-react-native';
import AppHeader from '../../components/ui/AppHeader';
import categoryService from '../../services/course/categoryService';
import { useTheme } from '../../context/ThemeContext';

const ICONS = {
    Globe, Smartphone, Cpu, BarChart3, Target, Briefcase
};
const iconNames = ['Globe', 'Smartphone', 'Cpu', 'BarChart3', 'Target', 'Briefcase'];
const colors = ['#3b82f6', '#ec4899', '#8b5cf6', '#10b981', '#f59e0b', '#6366f1', '#06b6d4'];

const CategoryBrowseScreen = () => {
    const navigation = useNavigation();
    const { isDarkMode, colors: themeColors } = useTheme();
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

    // Sắp xếp lấy Top 5 danh mục có nhiều khóa học nhất
    const topCategories = useMemo(() => {
        return [...categories]
            .sort((a, b) => {
                const countA = a.courseCount ?? a.courses ?? 0;
                const countB = b.courseCount ?? b.courses ?? 0;
                return countB - countA;
            })
            .slice(0, 5);
    }, [categories]);

    return (
        <View className={`flex-1 ${isDarkMode ? 'bg-slate-900' : 'bg-slate-50'}`}>
            {/* Header */}
            <AppHeader 
                title="Khám phá danh mục" 
                className={isDarkMode ? '!bg-slate-800 !border-slate-700' : ''}
                titleClassName={isDarkMode ? '!text-slate-100' : ''}
            />

            <ScrollView className="flex-1 p-4" showsVerticalScrollIndicator={false}>
                {loading ? (
                    <ActivityIndicator size="large" color="#2563EB" style={{ marginTop: 40 }} />
                ) : (
                    <>
                        {/* 1. SECTION: Danh mục phổ biến (Ở đầu trang) */}
                        <View className="mb-6">
                            <AppText className={`text-lg font-bold mb-3 ${isDarkMode ? 'text-slate-100' : 'text-slate-800'}`}>
                                Danh mục phổ biến
                            </AppText>

                            {/* Top 5 danh mục nhiều khóa học nhất */}
                            {topCategories.length > 0 && (
                                <View>
                                    <View className="flex-row items-center mb-3">
                                        <Award size={16} color="#3B82F6" />
                                        <AppText className={`text-sm font-semibold ml-1.5 ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                                            Top 5 danh mục nhiều khóa học nhất
                                        </AppText>
                                    </View>
                                    <View>
                                        {topCategories.map((cat, index) => {
                                            const IconName = cat.icon || iconNames[index % iconNames.length];
                                            const IconComponent = ICONS[IconName] || LayoutGrid;
                                            const catColor = cat.color || colors[index % colors.length];
                                            const count = cat.courseCount ?? cat.courses ?? 0;

                                            return (
                                                <TouchableOpacity
                                                    key={`top-${cat.id}`}
                                                    activeOpacity={0.75}
                                                    className={`flex-row items-center rounded-2xl p-3.5 mb-2.5 border shadow-sm ${
                                                        isDarkMode ? 'bg-slate-800 border-slate-700/60' : 'bg-white border-slate-100'
                                                    }`}
                                                    onPress={() => navigation.navigate('CourseCatalog', { categoryId: cat.id, categoryName: cat.name })}
                                                >
                                                    <View className={`w-7 h-7 rounded-full items-center justify-center mr-3 ${
                                                        isDarkMode ? 'bg-blue-950' : 'bg-blue-50'
                                                    }`}>
                                                        <AppText className="text-xs font-bold text-blue-500">#{index + 1}</AppText>
                                                    </View>
                                                    <View
                                                        className="w-11 h-11 rounded-xl items-center justify-center mr-3.5"
                                                        style={{ backgroundColor: catColor + '20' }}
                                                    >
                                                        <IconComponent size={22} color={catColor} />
                                                    </View>
                                                    <View className="flex-1">
                                                        <AppText className={`font-bold text-sm ${isDarkMode ? 'text-slate-100' : 'text-slate-900'}`}>{cat.name}</AppText>
                                                        <AppText className={`text-xs mt-0.5 ${isDarkMode ? 'text-slate-400' : 'text-slate-400'}`}>{count} Khóa học</AppText>
                                                    </View>
                                                    <ChevronRight size={18} color={isDarkMode ? "#64748B" : "#94A3B8"} />
                                                </TouchableOpacity>
                                            );
                                        })}
                                    </View>
                                </View>
                            )}
                        </View>

                        {/* 2. SECTION: Tất cả danh mục */}
                        <View className="mb-4">
                            <AppText className={`text-lg font-bold mb-3 ${isDarkMode ? 'text-slate-100' : 'text-slate-800'}`}>
                                Tất cả danh mục
                            </AppText>
                            <View className="flex-row flex-wrap justify-between">
                                {categories.map((cat, index) => {
                                    const IconName = cat.icon || iconNames[index % iconNames.length];
                                    const IconComponent = ICONS[IconName] || LayoutGrid;
                                    const catColor = cat.color || colors[index % colors.length];
                                    const count = cat.courseCount ?? cat.courses ?? 0;

                                    return (
                                        <TouchableOpacity
                                            key={cat.id}
                                            className={`w-[48%] rounded-3xl p-5 mb-4 shadow-sm border items-center ${
                                                isDarkMode ? 'bg-slate-800 border-slate-700/60' : 'bg-white border-slate-100'
                                            }`}
                                            onPress={() => navigation.navigate('CourseCatalog', { categoryId: cat.id, categoryName: cat.name })}
                                        >
                                            <View
                                                className="w-14 h-14 rounded-2xl items-center justify-center mb-3"
                                                style={{ backgroundColor: catColor + '20' }}
                                            >
                                                <IconComponent size={28} color={catColor} />
                                            </View>
                                            <AppText className={`font-bold text-center text-sm ${isDarkMode ? 'text-slate-100' : 'text-slate-900'}`}>{cat.name}</AppText>
                                            <AppText className={`text-[10px] mt-1 ${isDarkMode ? 'text-slate-400' : 'text-slate-400'}`}>{count} Khóa học</AppText>
                                        </TouchableOpacity>
                                    );
                                })}
                            </View>
                        </View>
                    </>
                )}
                <View className="h-10" />
            </ScrollView>
        </View>
    );
};

export default CategoryBrowseScreen;
