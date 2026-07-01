import AppText from '../../components/ui/AppText';
import React, { useState, useEffect } from 'react';
import { View, ScrollView, TouchableOpacity, Image, ActivityIndicator, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Star, Users, BookOpen } from 'lucide-react-native';
import AppHeader from '../../components/ui/AppHeader';
import followingService from '../../services/followingService';

export default function FavoriteInstructorsScreen() {
    const navigation = useNavigation();
    const [instructors, setInstructors] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchInstructors = async () => {
        try {
            const response = await followingService.getFollowedInstructors();
            const data = response.data || response.content || response;
            if (Array.isArray(data)) {
                setInstructors(data);
            }
        } catch (error) {
            console.error('Error fetching favorite instructors:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchInstructors();
    }, []);

    const handleUnfollow = async (instructorId) => {
        try {
            await followingService.toggle(instructorId);
            setInstructors(prev => prev.filter(ins => ins.id !== instructorId && ins.instructorId !== instructorId));
        } catch (error) {
            Alert.alert('Lỗi', 'Không thể bỏ theo dõi giảng viên.');
        }
    };

    return (
        <View className="flex-1 bg-slate-50">
            <AppHeader title="Giảng viên yêu thích" />

            <ScrollView className="flex-1 p-5">
                {loading ? (
                    <View className="flex-1 items-center justify-center py-20">
                        <ActivityIndicator size="large" color="#2563EB" />
                    </View>
                ) : instructors.length === 0 ? (
                    <View className="items-center justify-center py-20">
                        <Star size={48} color="#CBD5E1" strokeWidth={1} />
                        <AppText className="text-slate-500 mt-4 text-center">Bạn chưa có giảng viên yêu thích nào.</AppText>
                    </View>
                ) : (
                    instructors.map(instructor => (
                        <TouchableOpacity 
                            key={instructor.id || instructor.instructorId} 
                            className="bg-white p-4 rounded-2xl mb-4 flex-row items-center shadow-sm border border-slate-100"
                            activeOpacity={0.8}
                        >
                            <Image source={{ uri: instructor.avatar || 'https://picsum.photos/100' }} className="w-16 h-16 rounded-full bg-slate-200 mr-4" />
                            <View className="flex-1">
                                <AppText className="text-base font-extrabold text-slate-800 mb-1">{instructor.name || instructor.fullName}</AppText>
                                <View className="flex-row items-center gap-3">
                                    <View className="flex-row items-center gap-1">
                                        <Star size={12} color="#F59E0B" fill="#F59E0B" />
                                        <AppText className="text-xs text-slate-500 font-medium">{instructor.rating || 5.0}</AppText>
                                    </View>
                                    <View className="flex-row items-center gap-1">
                                        <Users size={12} color="#64748B" />
                                        <AppText className="text-xs text-slate-500">{instructor.students || 0}</AppText>
                                    </View>
                                    <View className="flex-row items-center gap-1">
                                        <BookOpen size={12} color="#64748B" />
                                        <AppText className="text-xs text-slate-500">{instructor.courses || 0}</AppText>
                                    </View>
                                </View>
                            </View>
                            <TouchableOpacity 
                                className="w-10 h-10 rounded-full bg-red-50 items-center justify-center"
                                onPress={() => handleUnfollow(instructor.id || instructor.instructorId)}
                            >
                                <Star size={20} color="#EF4444" fill="#EF4444" />
                            </TouchableOpacity>
                        </TouchableOpacity>
                    ))
                )}
            </ScrollView>
        </View>
    );
}
