import AppText from '../../components/ui/AppText';
import React from 'react';
import { View, ScrollView, TouchableOpacity, TextInput } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Search, User, ShieldAlert, Ban, Mail } from 'lucide-react-native';
import AppHeader from '../../components/ui/AppHeader';


const MOCK_USERS = [
    { id: '1', name: 'Kha Trần', email: 'kha@example.com', role: 'Student', status: 'Active' },
    { id: '2', name: 'Hoàng Long', email: 'long@instructor.com', role: 'Instructor', status: 'Active' },
    { id: '3', name: 'Spammer Bot', email: 'spam@bot.com', role: 'Student', status: 'Banned' }
];

const UserManagementScreen = () => {
    const navigation = useNavigation();

    return (
        <View className="flex-1 bg-slate-50">
            {/* Header */}
            <AppHeader title="Quản lý người dùng" />

            <ScrollView className="flex-1 p-4">
                {MOCK_USERS.map(user => (
                    <View key={user.id} className="bg-white rounded-3xl p-5 mb-4 shadow-sm border border-slate-100">
                        <View className="flex-row items-center mb-4">
                            <View className={`w-12 h-12 rounded-2xl items-center justify-center ${user.status === 'Banned' ? 'bg-red-50' : 'bg-blue-50'}`}>
                                <User size={24} color={user.status === 'Banned' ? '#ef4444' : '#2563eb'} />
                            </View>
                            <View className="ml-4 flex-1">
                                <AppText className="text-slate-900 font-bold text-base">{user.name}</AppText>
                                <AppText className="text-slate-400 text-xs mt-0.5">{user.email}</AppText>
                            </View>
                            <View className={`px-2 py-1 rounded-md ${user.role === 'Instructor' ? 'bg-purple-50' : 'bg-slate-50'}`}>
                                <AppText className={`text-[9px] font-bold uppercase ${user.role === 'Instructor' ? 'text-purple-600' : 'text-slate-500'}`}>
                                    {user.role}
                                </AppText>
                            </View>
                        </View>

                        <View className="flex-row gap-2 border-t border-slate-50 pt-4">
                            <TouchableOpacity className="flex-1 flex-row items-center justify-center bg-slate-50 py-2.5 rounded-xl gap-2">
                                <Mail size={16} color="#64748b" />
                                <AppText className="text-slate-600 font-bold text-xs">Liên hệ</AppText>
                            </TouchableOpacity>
                            <TouchableOpacity className="flex-1 flex-row items-center justify-center bg-slate-50 py-2.5 rounded-xl gap-2">
                                <ShieldAlert size={16} color="#64748b" />
                                <AppText className="text-slate-600 font-bold text-xs">Phân quyền</AppText>
                            </TouchableOpacity>
                            <TouchableOpacity
                                className={`w-12 items-center justify-center rounded-xl ${user.status === 'Banned' ? 'bg-green-50' : 'bg-red-50'}`}
                            >
                                <Ban size={18} color={user.status === 'Banned' ? '#10b981' : '#ef4444'} />
                            </TouchableOpacity>
                        </View>
                    </View>
                ))}
            </ScrollView>
        </View>
    );
};

export default UserManagementScreen;
