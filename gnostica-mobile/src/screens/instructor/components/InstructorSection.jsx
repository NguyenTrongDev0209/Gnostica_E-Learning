import React, { useState, useEffect } from 'react';
import { View, ScrollView, Image, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import AppText from '../../../components/ui/AppText';
import { Users, BookOpen } from 'lucide-react-native';
import instructorService from '../../../services/instructor/instructorService';

const InstructorSection = () => {
    const navigation = useNavigation();
    const [instructors, setInstructors] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchInstructors = async () => {
            try {
                const response = await instructorService.getAll();
                if (response && Array.isArray(response)) {
                    setInstructors(response.slice(0, 5));
                }
            } catch (error) {
                console.error('Error fetching instructors:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchInstructors();
    }, []);

    if (loading) {
        return (
            <View className="mt-4 mb-2 px-5 py-6 items-center justify-center">
                <ActivityIndicator size="small" color="#2563EB" />
            </View>
        );
    }

    if (!instructors.length) return null;

    return (
        <View className="mt-4 mb-2">
            <View className="px-5 mb-4 flex-row justify-between items-center">
                <AppText className="text-xl font-extrabold text-slate-800">
                    Giảng viên tiêu biểu
                </AppText>
                <TouchableOpacity onPress={() => navigation.navigate('InstructorList')}>
                    <AppText className="text-[13px] text-blue-600 font-semibold">Xem tất cả</AppText>
                </TouchableOpacity>
            </View>

            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{ paddingHorizontal: 12 }}
            >
                {instructors.map((instructor) => (
                    <TouchableOpacity 
                        key={instructor.id} 
                        activeOpacity={0.8}
                        onPress={() => navigation.navigate('InstructorList')}
                        className="bg-white mx-2 w-[160px] rounded-2xl p-4 border border-slate-100 shadow-sm items-center flex-col"
                    >
                        <Image 
                            source={{ uri: instructor.avatar || 'https://via.placeholder.com/100' }} 
                            className="w-16 h-16 rounded-full mb-3"
                            resizeMode="cover"
                        />
                        <AppText className="font-bold text-[14px] text-slate-800 text-center mb-1" numberOfLines={1}>
                            {instructor.fullName}
                        </AppText>
                        <AppText className="text-[11px] text-blue-600 font-medium text-center mb-3" numberOfLines={1}>
                            {instructor.email}
                        </AppText>
                        
                        <View className="w-full h-[1px] bg-slate-100 mb-3" />

                        <View className="flex-row items-center justify-between w-full px-1">
                            <View className="flex-row items-center gap-1.5">
                                <Users size={12} color="#64748B" />
                                <AppText className="text-[11px] text-slate-500 font-medium">
                                    {instructor.studentsCount || 0}
                                </AppText>
                            </View>
                            <View className="flex-row items-center gap-1.5">
                                <BookOpen size={12} color="#64748B" />
                                <AppText className="text-[11px] text-slate-500 font-medium">
                                    {instructor.coursesCount || 0}
                                </AppText>
                            </View>
                        </View>
                    </TouchableOpacity>
                ))}
            </ScrollView>
        </View>
    );
};

export default InstructorSection;
