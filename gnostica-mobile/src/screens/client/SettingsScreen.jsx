import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, Switch, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import {
    ArrowLeft, ChevronRight, Lock, Package, Compass, Bell,
    Moon, Globe, Trash2, CircleHelp,
} from 'lucide-react-native';

const SETTINGS_GROUPS = [
    {
        title: 'Tài khoản',
        items: [
            { label: 'Thay đổi mật khẩu', icon: Lock,    color: '#3B82F6', target: 'ChangePassword' },
            { label: 'Đơn hàng của tôi',  icon: Package, color: '#10B981', target: 'Orders' },
        ],
    },
    {
        title: 'Khám phá',
        items: [
            { label: 'Danh mục khóa học', icon: Compass, color: '#8B5CF6', target: 'CourseCatalog' },
        ],
    },
    {
        title: 'Tùy chọn',
        items: [
            { label: 'Thông báo đẩy', icon: Bell,  color: '#F59E0B', type: 'toggle', key: 'notifications' },
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
    const [toggleStates, setToggleStates] = React.useState({
        notifications: true,
        darkMode: false,
    });

    const handleToggle = (key) => {
        setToggleStates(prev => ({ ...prev, [key]: !prev[key] }));
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

    return (
        <View className="flex-1 bg-slate-50">
            {/* Header */}
            <View className="bg-white pt-12 pb-4 px-4 border-b border-slate-100 flex-row items-center">
                <TouchableOpacity onPress={() => navigation.goBack()} className="p-2">
                    <ArrowLeft size={24} color="#1e293b" />
                </TouchableOpacity>
                <Text className="text-xl font-bold text-slate-800 ml-2">Cài đặt</Text>
            </View>

            <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
                {SETTINGS_GROUPS.map(group => (
                    <View key={group.title} className="mt-4">
                        <Text className="text-xs font-bold text-slate-400 px-5 mb-2 tracking-[0.8px] uppercase">
                            {group.title}
                        </Text>
                        <View className="bg-white border-y border-slate-100">
                            {group.items.map((item, idx) => (
                                <TouchableOpacity
                                    key={item.label}
                                    activeOpacity={item.type === 'toggle' ? 1 : 0.7}
                                    onPress={() => handlePress(item)}
                                    className="flex-row items-center py-3.5 px-5 border-b border-slate-50"
                                >
                                    <View
                                        className="w-9 h-9 rounded-xl items-center justify-center mr-3.5"
                                        style={{ backgroundColor: item.color + '15' }}
                                    >
                                        <item.icon size={18} color={item.color} strokeWidth={2} />
                                    </View>
                                    <Text className={`flex-1 text-[15px] font-medium ${item.type === 'danger' ? 'text-red-500' : 'text-slate-800'}`}>
                                        {item.label}
                                    </Text>

                                    {/* Right side */}
                                    {item.type === 'toggle' ? (
                                        <Switch
                                            value={toggleStates[item.key]}
                                            onValueChange={() => handleToggle(item.key)}
                                            trackColor={{ false: '#E2E8F0', true: '#93C5FD' }}
                                            thumbColor={toggleStates[item.key] ? '#2563EB' : '#f4f4f5'}
                                        />
                                    ) : item.type === 'info' ? (
                                        <Text className="text-sm text-slate-400 font-medium">{item.info}</Text>
                                    ) : (
                                        <ChevronRight size={16} color="#CBD5E1" />
                                    )}
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>
                ))}

                {/* App Version */}
                <View className="items-center py-8">
                    <Text className="text-slate-300 text-xs">Gnostica Mobile v1.0.0</Text>
                </View>
            </ScrollView>
        </View>
    );
};

export default SettingsScreen;
