import AppText from '../../components/ui/AppText';
import React, { useState, useEffect } from 'react';
import { View, TouchableOpacity, FlatList, ActivityIndicator } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { clsx } from 'clsx';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import CourseProgressCard from './components/CourseProgressCard';
import Button from '../../components/ui/Button';
import { useAuth } from '../../context/AuthContext';
import enrollmentService from '../../services/course/enrollmentService';

const TABS = ['Đang học', 'Hoàn thành'];

const MyCoursesScreen = () => {
    const navigation = useNavigation();
    const { isAuthenticated } = useAuth();
    const insets = useSafeAreaInsets();
    const [activeTab, setActiveTab] = useState(0);
    
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (isAuthenticated) {
            const fetchMyCourses = async () => {
                setLoading(true);
                try {
                    const response = await enrollmentService.getMyCourses();
                    const data = response.data || response;
                    if (Array.isArray(data)) {
                        setCourses(data);
                    } else if (data && data.content) {
                        setCourses(data.content);
                    }
                } catch (error) {
                    console.error('Error fetching my courses:', error);
                } finally {
                    setLoading(false);
                }
            };
            fetchMyCourses();
        } else {
            setLoading(false);
        }
    }, [isAuthenticated]);

    // Unauthenticated state
    if (!isAuthenticated) {
        return (
            <View className="flex-1 bg-slate-50 justify-center items-center p-5">
                <AppText className="text-6xl mb-4">🔒</AppText>
                <AppText className="text-[22px] font-extrabold text-slate-800 mb-2 text-center">
                    Yêu cầu đăng nhập
                </AppText>
                <AppText className="text-sm text-slate-500 text-center mb-8 leading-[22px]">
                    Vui lòng đăng nhập để xem danh sách khóa học và tiến độ học tập của bạn.
                </AppText>
                <Button
                    variant="primary"
                    className="w-full max-w-[300px] py-3.5"
                    onPress={() => navigation.navigate('Login')}
                >
                    Đăng nhập ngay
                </Button>
            </View>
        );
    }

    // data filter logic assuming progress === 100 or completed flag
    const data = activeTab === 0
        ? courses.filter(c => c.progress < 100 && !c.completed)
        : courses.filter(c => c.progress === 100 || c.completed);

    return (
        <View className="flex-1 bg-slate-50">
            {/* Header */}
            <View className="bg-white px-5 pb-0 border-b border-slate-100" style={{ paddingTop: Math.max(insets.top, 20) + 12 }}>
                <AppText className="text-[22px] font-extrabold text-slate-800 mb-4">
                    Khóa học của tôi
                </AppText>

                {/* Tab selector */}
                <View className="flex-row">
                    {TABS.map((tab, idx) => (
                        <TouchableOpacity
                            key={tab}
                            onPress={() => setActiveTab(idx)}
                            className={clsx(
                                'pb-3 mr-6',
                                activeTab === idx ? 'border-b-[2.5px] border-blue-600' : 'border-b-[2.5px] border-transparent',
                            )}
                        >
                            <AppText className={clsx(
                                'text-[15px] font-bold',
                                activeTab === idx ? 'text-blue-600' : 'text-slate-400',
                            )}>
                                {tab}
                            </AppText>
                        </TouchableOpacity>
                    ))}
                </View>
            </View>

            {loading ? (
                <View className="flex-1 items-center justify-center">
                    <ActivityIndicator size="large" color="#2563EB" />
                </View>
            ) : (
                <>
                    {/* Progress Summary */}
                    {activeTab === 0 && data.length > 0 && (
                        <View className="bg-blue-50 mx-5 mt-4 rounded-[14px] p-4 flex-row items-center gap-3">
                            <AppText className="text-4xl">📚</AppText>
                            <View>
                                <AppText className="text-[15px] font-extrabold text-blue-900">
                                    Bạn đang học {data.length} khóa
                                </AppText>
                                <AppText className="text-[13px] text-blue-500 mt-0.5">
                                    Tiếp tục học để hoàn thành mục tiêu!
                                </AppText>
                            </View>
                        </View>
                    )}

                    {/* List */}
                    {data.length === 0 ? (
                        <View className="flex-1 items-center justify-center pb-20">
                            <AppText className="text-5xl mb-3">
                                {activeTab === 0 ? '📖' : '🏆'}
                            </AppText>
                            <AppText className="text-[17px] font-bold text-slate-800 mb-1.5">
                                {activeTab === 0 ? 'Chưa có khóa học nào' : 'Chưa hoàn thành khóa nào'}
                            </AppText>
                            <AppText className="text-[13px] text-slate-500 text-center px-10">
                                {activeTab === 0
                                    ? 'Hãy khám phá và đăng ký khóa học đầu tiên của bạn'
                                    : 'Hãy kiên trì học và hoàn thành các khóa học đang học'
                                }
                            </AppText>
                        </View>
                    ) : (
                        <FlatList
                            data={data}
                            keyExtractor={item => (item.id || item.courseId || Math.random()).toString()}
                            renderItem={({ item }) => (
                                <CourseProgressCard 
                                    course={item} 
                                    onPress={() => navigation.navigate('Learning', { course: item })}
                                />
                            )}
                            contentContainerStyle={{ padding: 20, paddingBottom: 80 }}
                            showsVerticalScrollIndicator={false}
                        />
                    )}
                </>
            )}
        </View>
    );
};

export default MyCoursesScreen;
