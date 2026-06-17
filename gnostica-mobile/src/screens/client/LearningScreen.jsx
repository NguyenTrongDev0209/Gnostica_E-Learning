import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Dimensions } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { ArrowLeft, Play, CheckCircle2, Circle, FileText, MessageCircle } from 'lucide-react-native';
import { clsx } from 'clsx';

const { width } = Dimensions.get('window');

const LearningScreen = () => {
    const navigation = useNavigation();
    const route = useRoute();
    const course = route.params?.course;
    const [activeTab, setActiveTab] = useState('curriculum');

    if (!course) return null;

    const TABS = [
        { key: 'curriculum', label: 'Nội dung' },
        { key: 'materials', label: 'Tài liệu' },
        { key: 'qa',         label: 'Hỏi đáp' },
    ];

    return (
        <View className="flex-1 bg-white">
            {/* Header + Video Player */}
            <View className="bg-slate-900 pt-12 pb-0">
                {/* Navbar */}
                <View className="flex-row items-center px-5 mb-3">
                    <TouchableOpacity onPress={() => navigation.goBack()} className="p-1">
                        <ArrowLeft size={24} color="#ffffff" />
                    </TouchableOpacity>
                    <Text className="flex-1 text-white text-base font-bold ml-3" numberOfLines={1}>
                        {course.title}
                    </Text>
                </View>

                {/* Video Player */}
                <View
                    className="bg-black items-center justify-center"
                    style={{ width, height: width * 0.5625 }}
                >
                    {/* Play button overlay */}
                    <TouchableOpacity className="w-16 h-16 rounded-full bg-white/20 items-center justify-center">
                        <View className="w-12 h-12 rounded-full bg-blue-600 items-center justify-center pl-1">
                            <Play size={24} color="#ffffff" fill="#ffffff" />
                        </View>
                    </TouchableOpacity>
                    <View className="absolute bottom-3 right-3 bg-black/60 px-2 py-1 rounded">
                        <Text className="text-white text-xs font-semibold">12:45</Text>
                    </View>
                </View>
            </View>

            {/* Content Tabs */}
            <View className="flex-row border-b border-slate-100">
                {TABS.map(tab => (
                    <TouchableOpacity
                        key={tab.key}
                        className={clsx(
                            'flex-1 items-center py-3.5 border-b-2',
                            activeTab === tab.key ? 'border-blue-600' : 'border-transparent',
                        )}
                        onPress={() => setActiveTab(tab.key)}
                    >
                        <Text className={clsx(
                            'text-sm font-semibold',
                            activeTab === tab.key ? 'text-blue-600' : 'text-slate-500',
                        )}>
                            {tab.label}
                        </Text>
                    </TouchableOpacity>
                ))}
            </View>

            {/* Tab Views */}
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ flexGrow: 1, backgroundColor: '#F8FAFC' }}>
                {activeTab === 'curriculum' && (
                    <View className="pb-10">
                        {course.curriculum?.map((section, secIdx) => (
                            <View key={secIdx} className="bg-white mb-2 border-b border-slate-100">
                                <View className="p-4 bg-slate-50">
                                    <Text className="text-[13px] text-slate-500 font-medium mb-1">
                                        Chương {secIdx + 1}
                                    </Text>
                                    <Text className="text-[15px] font-bold text-slate-800">
                                        {section.section}
                                    </Text>
                                </View>
                                {[1, 2, 3].map((lesson, lessIdx) => {
                                    const isCompleted = secIdx === 0 && lessIdx < 2;
                                    const isCurrent   = secIdx === 0 && lessIdx === 2;
                                    return (
                                        <TouchableOpacity
                                            key={lessIdx}
                                            className={clsx(
                                                'flex-row items-center p-4 border-b border-slate-100',
                                                isCurrent ? 'bg-blue-50' : 'bg-white',
                                            )}
                                        >
                                            <View className="mr-3">
                                                {isCompleted
                                                    ? <CheckCircle2 size={24} color="#10B981" />
                                                    : isCurrent
                                                        ? <Play size={24} color="#2563EB" />
                                                        : <Circle size={24} color="#CBD5E1" />
                                                }
                                            </View>
                                            <View className="flex-1">
                                                <Text className={clsx(
                                                    'text-sm text-slate-800',
                                                    isCurrent ? 'font-bold' : 'font-medium',
                                                )}>
                                                    {lesson}. Bài học mô phỏng {secIdx + 1}.{lessIdx + 1}
                                                </Text>
                                                <Text className="text-xs text-slate-500 mt-1">
                                                    Video • 12:45
                                                </Text>
                                            </View>
                                        </TouchableOpacity>
                                    );
                                })}
                            </View>
                        ))}
                    </View>
                )}

                {activeTab === 'materials' && (
                    <View className="p-5">
                        <Text className="text-sm text-slate-500">
                            Tài liệu tham khảo và mã nguồn của khóa học sẽ được hiển thị ở đây.
                        </Text>
                    </View>
                )}

                {activeTab === 'qa' && (
                    <View className="p-5">
                        <Text className="text-sm text-slate-500">
                            Chưa có câu hỏi nào. Tương tác với giảng viên và các bạn học viên khác tại đây.
                        </Text>
                    </View>
                )}
            </ScrollView>
        </View>
    );
};

export default LearningScreen;
