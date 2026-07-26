import AppText from '../../components/ui/AppText';
import React, { useState, useEffect } from 'react';
import { View, ScrollView, TouchableOpacity, Dimensions } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { ArrowLeft, Play, CheckCircle2, Circle, FileText, MessageCircle } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { clsx } from 'clsx';
import Video from 'react-native-video';
import lessonProgressService from '../../services/course/lessonProgressService';

const { width } = Dimensions.get('window');

const LearningScreen = () => {
    const navigation = useNavigation();
    const route = useRoute();
    const insets = useSafeAreaInsets();
    const course = route.params?.course;
    
    const [activeTab, setActiveTab] = useState('curriculum');
    const [activeLesson, setActiveLesson] = useState(null);

    const TABS = [
        { key: 'curriculum', label: 'Nội dung' },
        { key: 'materials', label: 'Tài liệu' },
        { key: 'qa',         label: 'Hỏi đáp' },
    ];

    useEffect(() => {
        if (course?.curriculum?.length > 0) {
            const firstSection = course.curriculum[0];
            const lessons = firstSection.lessons || [];
            if (lessons.length > 0) {
                setActiveLesson(lessons[0]);
            }
        }
    }, [course]);

    const handleLessonEnd = () => {
        if (activeLesson) {
            lessonProgressService.markComplete(activeLesson.id).catch(console.error);
        }
    };

    if (!course) return null;

    return (
        <View className="flex-1 bg-white">
            {/* Header + Video Player */}
            <View className="bg-slate-900 pb-0" style={{ paddingTop: Math.max(insets.top, 20) + 12 }}>
                {/* Navbar */}
                <View className="flex-row items-center px-5 mb-3">
                    <TouchableOpacity onPress={() => navigation.goBack()} className="p-1">
                        <ArrowLeft size={24} color="#ffffff" />
                    </TouchableOpacity>
                    <AppText className="flex-1 text-white text-base font-bold ml-3" numberOfLines={1}>
                        {course.title || course.courseTitle}
                    </AppText>
                </View>

                {/* Video Player */}
                <View
                    className="bg-black items-center justify-center"
                    style={{ width, height: width * 0.5625 }}
                >
                    {activeLesson?.videoUrl ? (
                        <Video 
                            source={{ uri: activeLesson.videoUrl }} 
                            style={{ width: '100%', height: '100%' }}
                            controls={true}
                            resizeMode="contain"
                            onEnd={handleLessonEnd}
                        />
                    ) : (
                        <View className="items-center">
                            <AppText className="text-white text-sm">Video không khả dụng</AppText>
                        </View>
                    )}
                </View>
                
                {activeLesson && (
                    <View className="px-5 py-3">
                        <AppText className="text-white text-lg font-bold">{activeLesson.title}</AppText>
                    </View>
                )}
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
                        <AppText className={clsx(
                            'text-sm font-semibold',
                            activeTab === tab.key ? 'text-blue-600' : 'text-slate-500',
                        )}>
                            {tab.label}
                        </AppText>
                    </TouchableOpacity>
                ))}
            </View>

            {/* Tab Views */}
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ flexGrow: 1, backgroundColor: '#F8FAFC' }}>
                {activeTab === 'curriculum' && (
                    <View className="pb-10">
                        {(course.curriculum || []).map((section, secIdx) => (
                            <View key={secIdx} className="bg-white mb-2 border-b border-slate-100">
                                <View className="p-4 bg-slate-50">
                                    <AppText className="text-[13px] text-slate-500 font-medium mb-1">
                                        Chương {secIdx + 1}
                                    </AppText>
                                    <AppText className="text-[15px] font-bold text-slate-800">
                                        {section.section || section.title}
                                    </AppText>
                                </View>
                                
                                {(section.lessons || []).map((lesson, lessIdx) => {
                                    const isCurrent = activeLesson?.id === lesson.id;
                                    const isCompleted = false; // Need to map from progress data

                                    return (
                                        <TouchableOpacity
                                            key={lesson.id || lessIdx}
                                            onPress={() => setActiveLesson(lesson)}
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
                                                <AppText className={clsx(
                                                    'text-sm text-slate-800',
                                                    isCurrent ? 'font-bold' : 'font-medium',
                                                )}>
                                                    {lesson.title}
                                                </AppText>
                                                <AppText className="text-xs text-slate-500 mt-1">
                                                    Video • {lesson.duration || '12:45'}
                                                </AppText>
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
                        <AppText className="text-sm text-slate-500">
                            Tài liệu tham khảo và mã nguồn của khóa học sẽ được hiển thị ở đây.
                        </AppText>
                    </View>
                )}

                {activeTab === 'qa' && (
                    <View className="p-5">
                        <AppText className="text-sm text-slate-500">
                            Chưa có câu hỏi nào. Tương tác với giảng viên và các bạn học viên khác tại đây.
                        </AppText>
                    </View>
                )}
            </ScrollView>
        </View>
    );
};

export default LearningScreen;
