import React from 'react';
import { View, ScrollView, Image, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import AppText from '../ui/AppText';
import { Users, BookOpen } from 'lucide-react-native';

const mockInstructors = [
  { id: 1, name: "Nguyễn Văn An", role: "Giảng viên Lập trình", avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=100&auto=format&fit=crop", students: "8.5k", courses: 12 },
  { id: 2, name: "Trần Thị Bích", role: "Chuyên gia UI/UX", avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=100&auto=format&fit=crop", students: "6.2k", courses: 8 },
  { id: 3, name: "Lê Hoàng Nam", role: "Chuyên gia Marketing", avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=100&auto=format&fit=crop", students: "4.3k", courses: 5 },
  { id: 4, name: "Phạm Minh Tuấn", role: "Data Scientist", avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?q=80&w=100&auto=format&fit=crop", students: "12k", courses: 15 },
];

const InstructorSection = () => {
    const navigation = useNavigation();
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
                {mockInstructors.map((instructor) => (
                    <TouchableOpacity 
                        key={instructor.id} 
                        activeOpacity={0.8}
                        onPress={() => navigation.navigate('InstructorList')}
                        className="bg-white mx-2 w-[160px] rounded-2xl p-4 border border-slate-100 shadow-sm items-center flex-col"
                    >
                        <Image 
                            source={{ uri: instructor.avatar }} 
                            className="w-16 h-16 rounded-full mb-3"
                            resizeMode="cover"
                        />
                        <AppText className="font-bold text-[14px] text-slate-800 text-center mb-1" numberOfLines={1}>
                            {instructor.name}
                        </AppText>
                        <AppText className="text-[11px] text-blue-600 font-medium text-center mb-3" numberOfLines={1}>
                            {instructor.role}
                        </AppText>
                        
                        <View className="w-full h-[1px] bg-slate-100 mb-3" />

                        <View className="flex-row items-center justify-between w-full px-1">
                            <View className="flex-row items-center gap-1.5">
                                <Users size={12} color="#64748B" />
                                <AppText className="text-[11px] text-slate-500 font-medium">{instructor.students}</AppText>
                            </View>
                            <View className="flex-row items-center gap-1.5">
                                <BookOpen size={12} color="#64748B" />
                                <AppText className="text-[11px] text-slate-500 font-medium">{instructor.courses}</AppText>
                            </View>
                        </View>
                    </TouchableOpacity>
                ))}
            </ScrollView>
        </View>
    );
};

export default InstructorSection;
