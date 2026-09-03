import AppText from '../../components/ui/AppText';
import React, { useState, useEffect } from 'react';
import { View, ScrollView, TouchableOpacity, Switch, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
    ChevronRight, Lock, Compass,
    Moon, Globe, Trash2, CircleHelp,
} from 'lucide-react-native';
import { useTheme } from '../../context/ThemeContext';
import AppHeader from '../../components/ui/AppHeader';

const SETTINGS_GROUPS = [
    {
        title: 'Tài khoản',
        items: [
            { label: 'Thay đổi mật khẩu', icon: Lock,    color: '#3B82F6', target: 'ChangePassword' },
        ],
    },
    {
        title: 'Khám phá',
        items: [
            { label: 'Danh mục khóa học', icon: Compass, color: '#8B5CF6', target: 'CategoryBrowse' },
        ],
    },
    {
        title: 'Tùy chọn',
        items: [
            { label: 'Chế độ tối',    icon: Moon,  color: '#6366F1', type: 'toggle', key: 'darkMode' },
            { label: 'Ngôn ngữ',     icon: Globe, color: '#06B6D4', type: 'info', info: 'Tiếng Việt' },
        ],
    },
    {
        title: 'Khác',
        items: [
            { label: 'Trung tâm trợ giúp',  icon: CircleHelp, color: '#64748B', type: 'link' },
            { label: 'Xóa tài khoản',       icon: Trash2,     color: '#EF4444', type: 'danger' },
        ],
    },
];

const SettingsScreen = () => {
    const navigation = useNavigation();
    const { isDarkMode, toggleDarkMode } = useTheme();

    const handleToggle = (key) => {
        if (key === 'darkMode') {
            toggleDarkMode(!isDarkMode);
        }
    };

    const handlePress = (item) => {
        if (item.target) {
            navigation.navigate(item.target);
        } else if (item.type === 'danger') {
            Alert.alert(
                'Xóa tài khoản',
                'Bạn có chắc chắn muốn xóa tài khoản? Hành động này không thể hoàn tác.',
                [{ text: 'Hủy' }, { text: 'Xóa', style: 'destructive' }]
            );
        }
    };

    const isDark = isDarkMode;

    return (
        <View className={`flex-1 ${isDark ? 'bg-slate-900' : 'bg-slate-50'}`}>
            {/* Header */}
            <AppHeader 
                title="Cài đặt" 
                className={isDark ? '!bg-slate-800 !border-slate-700' : ''}
                titleClassName={isDark ? '!text-slate-100' : ''}
            />

            <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
                {SETTINGS_GROUPS.map(group => (
                    <View key={group.title} className="mt-4">
                        <AppText className={`text-xs font-bold px-5 mb-2 tracking-[0.8px] uppercase ${isDark ? 'text-slate-400' : 'text-slate-400'}`}>
                            {group.title}
                        </AppText>
                        <View className={`border-y ${isDark ? 'bg-slate-800 border-slate-700/60' : 'bg-white border-slate-100'}`}>
                            {group.items.map((item, idx) => (
                                <TouchableOpacity
                                    key={item.label}
                                    activeOpacity={item.type === 'toggle' ? 1 : 0.7}
                                    onPress={() => handlePress(item)}
                                    className={`flex-row items-center py-3.5 px-5 border-b ${isDark ? 'border-slate-700/40' : 'border-slate-50'}`}
                                >
                                    <View
                                        className="w-9 h-9 rounded-xl items-center justify-center mr-3.5"
                                        style={{ backgroundColor: item.color }}
                                    >
                                        <item.icon size={18} color="#ffffff" strokeWidth={2} />
                                    </View>
                                    <AppText className={`flex-1 text-[15px] font-medium ${item.type === 'danger' ? 'text-red-500' : (isDark ? 'text-slate-100' : 'text-slate-800')}`}>
                                        {item.label}
                                    </AppText>

                                    {/* Right side */}
                                    {item.type === 'toggle' ? (
                                        <Switch
                                            value={item.key === 'darkMode' ? isDark : false}
                                            onValueChange={() => handleToggle(item.key)}
                                            trackColor={{ false: isDark ? '#334155' : '#E2E8F0', true: '#3B82F6' }}
                                            thumbColor={(item.key === 'darkMode' ? isDark : false) ? '#FFFFFF' : (isDark ? '#94A3B8' : '#f4f4f5')}
                                        />
                                    ) : item.type === 'info' ? (
                                        <AppText className={`text-sm font-medium ${isDark ? 'text-slate-400' : 'text-slate-400'}`}>{item.info}</AppText>
                                    ) : (
                                        <ChevronRight size={16} color={isDark ? "#64748B" : "#CBD5E1"} />
                                    )}
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>
                ))}

                {/* App Version */}
                <View className="items-center py-8">
                    <AppText className={`text-xs ${isDark ? 'text-slate-500' : 'text-slate-300'}`}>Gnostica Mobile v1.0.0</AppText>
                </View>
            </ScrollView>
        </View>
    );
};

export default SettingsScreen;
