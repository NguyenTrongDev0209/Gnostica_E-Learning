import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { ArrowLeft, Star, Users, BookOpen } from 'lucide-react-native';

const MOCK_INSTRUCTORS = [
    {
        id: '1',
        name: 'Nguyễn Văn A',
        specialty: 'Senior Web Developer',
        rating: 4.9,
        students: '15,000+',
        courses: 12,
        avatar: 'https://i.pravatar.cc/150?u=a1'
    },
    {
        id: '2',
        name: 'Trần Thị B',
        specialty: 'UI/UX Design Master',
        rating: 4.8,
        students: '8,400+',
        courses: 8,
        avatar: 'https://i.pravatar.cc/150?u=b2'
    },
    {
        id: '3',
        name: 'Lê Hoàng C',
        specialty: 'Data Scientist @ TechCorp',
        rating: 4.7,
        students: '5,200+',
        courses: 5,
        avatar: 'https://i.pravatar.cc/150?u=c3'
    }
];

const InstructorListScreen = () => {
    const navigation = useNavigation();

    return (
        <View className="flex-1 bg-slate-50">
            {/* Header */}
            <View className="bg-white pt-12 pb-4 px-4 border-b border-slate-100 flex-row items-center">
                <TouchableOpacity onPress={() => navigation.goBack()} className="p-2">
                    <ArrowLeft size={24} color="#1e293b" />
                </TouchableOpacity>
                <Text className="text-xl font-bold text-slate-800 ml-2">Giảng viên tiêu biểu</Text>
            </View>

            <ScrollView className="flex-1 p-4">
                <Text className="text-slate-500 text-sm mb-6 leading-5">
                    Học hỏi từ những chuyên gia hàng đầu trong ngành với kinh nghiệm thực chiến phong phú.
                </Text>

                {MOCK_INSTRUCTORS.map(instructor => (
                    <TouchableOpacity
                        key={instructor.id}
                        className="bg-white rounded-3xl p-5 mb-6 shadow-sm border border-slate-100"
                        onPress={() => { }}
                    >
                        <View className="flex-row items-center mb-5">
                            <Image
                                source={{ uri: instructor.avatar }}
                                className="w-16 h-16 rounded-2xl"
                            />
                            <View className="ml-4 flex-1">
                                <Text className="text-slate-900 font-bold text-lg">{instructor.name}</Text>
                                <Text className="text-slate-500 text-sm mt-0.5">{instructor.specialty}</Text>
                                <View className="flex-row items-center mt-2">
                                    <Star size={14} color="#fbbf24" fill="#fbbf24" />
                                    <Text className="text-slate-700 text-xs font-bold ml-1">{instructor.rating}</Text>
                                    <Text className="text-slate-400 text-xs ml-3">Phản hồi tốt</Text>
                                </View>
                            </View>
                        </View>

                        <View className="flex-row items-center border-t border-slate-50 pt-4 gap-6">
                            <View className="flex-row items-center px-1">
                                <Users size={16} color="#64748b" />
                                <Text className="text-slate-600 text-xs font-medium ml-2">{instructor.students} Học viên</Text>
                            </View>
                            <View className="flex-row items-center px-1">
                                <BookOpen size={16} color="#64748b" />
                                <Text className="text-slate-600 text-xs font-medium ml-2">{instructor.courses} Khóa học</Text>
                            </View>
                        </View>

                        <TouchableOpacity
                            className="mt-6 bg-slate-900 py-3 rounded-2xl items-center"
                            onPress={() => { }}
                        >
                            <Text className="text-white font-bold text-sm">Xem hồ sơ</Text>
                        </TouchableOpacity>
                    </TouchableOpacity>
                ))}
                <View className="h-10" />
            </ScrollView>
        </View>
    );
};

export default InstructorListScreen;
