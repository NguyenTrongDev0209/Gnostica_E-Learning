import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { ArrowLeft, Star, Users, BookOpen } from 'lucide-react-native';

const mockInstructors = [
    { id: 1, name: 'Nguyễn Văn A', avatar: 'https://picsum.photos/seed/inst1/100/100', students: 12500, courses: 8, rating: 4.8 },
    { id: 2, name: 'Trần Thị B', avatar: 'https://picsum.photos/seed/inst2/100/100', students: 8400, courses: 5, rating: 4.9 },
];

export default function FavoriteInstructorsScreen() {
    const navigation = useNavigation();

    return (
        <View className="flex-1 bg-slate-50">
            {/* Header */}
            <View className="pt-[52px] pb-4 px-5 bg-white flex-row items-center border-b border-slate-100">
                <TouchableOpacity onPress={() => navigation.goBack()} className="mr-3 p-1">
                    <ArrowLeft size={24} color="#334155" />
                </TouchableOpacity>
                <Text className="text-[18px] font-extrabold text-slate-800">Giảng viên yêu thích</Text>
            </View>

            <ScrollView className="flex-1 p-5">
                {mockInstructors.map(instructor => (
                    <TouchableOpacity 
                        key={instructor.id} 
                        className="bg-white p-4 rounded-2xl mb-4 flex-row items-center shadow-sm border border-slate-100"
                        activeOpacity={0.8}
                    >
                        <Image source={{ uri: instructor.avatar }} className="w-16 h-16 rounded-full bg-slate-200 mr-4" />
                        <View className="flex-1">
                            <Text className="text-base font-extrabold text-slate-800 mb-1">{instructor.name}</Text>
                            <View className="flex-row items-center gap-3">
                                <View className="flex-row items-center gap-1">
                                    <Star size={12} color="#F59E0B" fill="#F59E0B" />
                                    <Text className="text-xs text-slate-500 font-medium">{instructor.rating}</Text>
                                </View>
                                <View className="flex-row items-center gap-1">
                                    <Users size={12} color="#64748B" />
                                    <Text className="text-xs text-slate-500">{instructor.students}</Text>
                                </View>
                                <View className="flex-row items-center gap-1">
                                    <BookOpen size={12} color="#64748B" />
                                    <Text className="text-xs text-slate-500">{instructor.courses}</Text>
                                </View>
                            </View>
                        </View>
                        <View className="w-10 h-10 rounded-full bg-red-50 items-center justify-center">
                            <Star size={20} color="#EF4444" fill="#EF4444" />
                        </View>
                    </TouchableOpacity>
                ))}
                
                {mockInstructors.length === 0 && (
                    <View className="items-center justify-center py-20">
                        <Star size={48} color="#CBD5E1" strokeWidth={1} />
                        <Text className="text-slate-500 mt-4 text-center">Bạn chưa có giảng viên yêu thích nào.</Text>
                    </View>
                )}
            </ScrollView>
        </View>
    );
}
