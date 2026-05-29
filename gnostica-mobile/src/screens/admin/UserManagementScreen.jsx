import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { ArrowLeft, Search, User, ShieldAlert, Ban, Mail } from 'lucide-react-native';

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
            <View className="bg-white pt-12 pb-4 px-4 border-b border-slate-100">
                <View className="flex-row items-center mb-4">
                    <TouchableOpacity onPress={() => navigation.goBack()} className="p-2">
                        <ArrowLeft size={24} color="#1e293b" />
                    </TouchableOpacity>
                    <Text className="text-xl font-bold text-slate-800 ml-2">Quản lý người dùng</Text>
                </View>

                <View className="flex-row items-center bg-slate-100 rounded-2xl px-4 py-2.5 mb-2">
                    <Search size={20} color="#94a3b8" />
                    <TextInput
                        placeholder="Tìm theo tên, email hoặc ID..."
                        className="flex-1 ml-2 text-slate-700 text-sm"
                    />
                </View>
            </View>

            <ScrollView className="flex-1 p-4">
                {MOCK_USERS.map(user => (
                    <View key={user.id} className="bg-white rounded-3xl p-5 mb-4 shadow-sm border border-slate-100">
                        <View className="flex-row items-center mb-4">
                            <View className={`w-12 h-12 rounded-2xl items-center justify-center ${user.status === 'Banned' ? 'bg-red-50' : 'bg-blue-50'}`}>
                                <User size={24} color={user.status === 'Banned' ? '#ef4444' : '#2563eb'} />
                            </View>
                            <View className="ml-4 flex-1">
                                <Text className="text-slate-900 font-bold text-base">{user.name}</Text>
                                <Text className="text-slate-400 text-xs mt-0.5">{user.email}</Text>
                            </View>
                            <View className={`px-2 py-1 rounded-md ${user.role === 'Instructor' ? 'bg-purple-50' : 'bg-slate-50'}`}>
                                <Text className={`text-[9px] font-bold uppercase ${user.role === 'Instructor' ? 'text-purple-600' : 'text-slate-500'}`}>
                                    {user.role}
                                </Text>
                            </View>
                        </View>

                        <View className="flex-row gap-2 border-t border-slate-50 pt-4">
                            <TouchableOpacity className="flex-1 flex-row items-center justify-center bg-slate-50 py-2.5 rounded-xl gap-2">
                                <Mail size={16} color="#64748b" />
                                <Text className="text-slate-600 font-bold text-xs">Liên hệ</Text>
                            </TouchableOpacity>
                            <TouchableOpacity className="flex-1 flex-row items-center justify-center bg-slate-50 py-2.5 rounded-xl gap-2">
                                <ShieldAlert size={16} color="#64748b" />
                                <Text className="text-slate-600 font-bold text-xs">Phân quyền</Text>
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
