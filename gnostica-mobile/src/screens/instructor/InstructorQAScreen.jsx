import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { ArrowLeft, MessageCircle, Send } from 'lucide-react-native';

const MOCK_QUESTIONS = [
    {
        id: '1',
        student: 'Kha Tran',
        course: 'React Native thực chiến',
        question: 'Thầy cho em hỏi làm sao để setup Push Notification với Expo mà không cần server?',
        time: '10 phút trước',
        avatar: 'KT'
    },
    {
        id: '2',
        student: 'Văn Huy',
        course: 'UI/UX Design',
        question: 'Em không thấy tài nguyên bài 12 đâu ạ, thầy kiểm tra giúp em với.',
        time: '1 giờ trước',
        avatar: 'VH'
    }
];

const InstructorQAScreen = () => {
    const navigation = useNavigation();

    return (
        <View className="flex-1 bg-slate-50">
            {/* Header */}
            <View className="bg-white pt-12 pb-4 px-4 border-b border-slate-100 flex-row items-center">
                <TouchableOpacity onPress={() => navigation.goBack()} className="p-2">
                    <ArrowLeft size={24} color="#1e293b" />
                </TouchableOpacity>
                <Text className="text-xl font-bold text-slate-800 ml-2">Hỏi đáp học viên</Text>
            </View>

            <ScrollView className="flex-1 p-4">
                <View className="bg-blue-50 p-4 rounded-2xl mb-6 flex-row items-center">
                    <MessageCircle size={20} color="#2563eb" />
                    <Text className="text-blue-600 text-xs font-bold ml-3 italic">
                        Bạn đang có 4 câu hỏi mới cần giải đáp trong hôm nay.
                    </Text>
                </View>

                {MOCK_QUESTIONS.map(q => (
                    <View key={q.id} className="bg-white rounded-3xl p-5 mb-5 shadow-sm border border-slate-100">
                        <View className="flex-row items-center mb-3">
                            <View className="w-8 h-8 rounded-full bg-slate-100 items-center justify-center">
                                <Text className="text-slate-600 font-bold text-[10px]">{q.avatar}</Text>
                            </View>
                            <View className="ml-2">
                                <Text className="text-slate-900 font-bold text-xs">{q.student}</Text>
                                <Text className="text-slate-400 text-[10px]">{q.time}</Text>
                            </View>
                            <View className="ml-auto bg-blue-50 px-2 py-0.5 rounded">
                                <Text className="text-primary text-[9px] font-bold" numberOfLines={1}>{q.course}</Text>
                            </View>
                        </View>

                        <Text className="text-slate-700 text-sm mb-6 leading-5">"{q.question}"</Text>

                        <View className="flex-row gap-3">
                            <TextInput
                                placeholder="Nhập câu trả lời..."
                                className="flex-1 bg-slate-50 rounded-xl px-4 py-2.5 text-xs text-slate-700 border border-slate-100"
                            />
                            <TouchableOpacity className="bg-blue-600 w-11 h-11 rounded-xl items-center justify-center">
                                <Send size={18} color="#fff" />
                            </TouchableOpacity>
                        </View>
                    </View>
                ))}
            </ScrollView>
        </View>
    );
};

export default InstructorQAScreen;
