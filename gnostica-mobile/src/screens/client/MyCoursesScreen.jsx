import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, FlatList } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import CourseProgressCard from '../../components/home/CourseProgressCard';
import Button from '../../components/ui/Button';
import { myCourses } from '../../constants/mockData';
import { useAuth } from '../../context/AuthContext';

const TABS = ['Đang học', 'Hoàn thành'];

const MyCoursesScreen = () => {
    const navigation = useNavigation();
    const { isAuthenticated } = useAuth();
    const [activeTab, setActiveTab] = useState(0);

    // Unauthenticated state
    if (!isAuthenticated) {
        return (
            <View style={{ flex: 1, backgroundColor: '#F8FAFC', justifyContent: 'center', alignItems: 'center', padding: 20 }}>
                <Text style={{ fontSize: 64, marginBottom: 16 }}>🔒</Text>
                <Text style={{ fontSize: 22, fontWeight: '800', color: '#1E293B', marginBottom: 8, textAlign: 'center' }}>
                    Yêu cầu đăng nhập
                </Text>
                <Text style={{ fontSize: 14, color: '#64748B', textAlign: 'center', marginBottom: 32, lineHeight: 22 }}>
                    Vui lòng đăng nhập để xem danh sách khóa học và tiến độ học tập của bạn.
                </Text>
                <Button
                    variant="primary"
                    style={{ width: '100%', maxWidth: 300, paddingVertical: 14 }}
                    onPress={() => navigation.navigate('Login')}
                >
                    Đăng nhập ngay
                </Button>
            </View>
        );
    }

    const data = activeTab === 0
        ? myCourses.filter(c => !c.completed)
        : myCourses.filter(c => c.completed);

    return (
        <View style={{ flex: 1, backgroundColor: '#F8FAFC' }}>
            {/* Header */}
            <View style={{
                backgroundColor: '#ffffff',
                paddingTop: 52,
                paddingHorizontal: 20,
                paddingBottom: 0,
                borderBottomWidth: 1,
                borderBottomColor: '#F1F5F9',
            }}>
                <Text style={{ fontSize: 22, fontWeight: '800', color: '#1E293B', marginBottom: 16 }}>
                    Khóa học của tôi
                </Text>

                {/* Tab selector */}
                <View style={{ flexDirection: 'row' }}>
                    {TABS.map((tab, idx) => (
                        <TouchableOpacity
                            key={tab}
                            onPress={() => setActiveTab(idx)}
                            style={{
                                paddingBottom: 12, marginRight: 24,
                                borderBottomWidth: 2.5,
                                borderBottomColor: activeTab === idx ? '#2563EB' : 'transparent',
                            }}
                        >
                            <Text style={{
                                fontSize: 15, fontWeight: '700',
                                color: activeTab === idx ? '#2563EB' : '#94A3B8',
                            }}>
                                {tab}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>
            </View>

            {/* Progress Summary */}
            {activeTab === 0 && data.length > 0 && (
                <View style={{
                    backgroundColor: '#EFF6FF',
                    marginHorizontal: 20, marginTop: 16,
                    borderRadius: 14, padding: 16,
                    flexDirection: 'row', alignItems: 'center', gap: 12,
                }}>
                    <Text style={{ fontSize: 32 }}>📚</Text>
                    <View>
                        <Text style={{ fontSize: 15, fontWeight: '800', color: '#1E3A8A' }}>
                            Bạn đang học {data.length} khóa
                        </Text>
                        <Text style={{ fontSize: 13, color: '#3B82F6', marginTop: 2 }}>
                            Tiếp tục học để hoàn thành mục tiêu!
                        </Text>
                    </View>
                </View>
            )}

            {/* List */}
            {data.length === 0 ? (
                <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', paddingBottom: 80 }}>
                    <Text style={{ fontSize: 48, marginBottom: 12 }}>
                        {activeTab === 0 ? '📖' : '🏆'}
                    </Text>
                    <Text style={{ fontSize: 17, fontWeight: '700', color: '#1E293B', marginBottom: 6 }}>
                        {activeTab === 0 ? 'Chưa có khóa học nào' : 'Chưa hoàn thành khóa nào'}
                    </Text>
                    <Text style={{ fontSize: 13, color: '#64748B', textAlign: 'center', paddingHorizontal: 40 }}>
                        {activeTab === 0
                            ? 'Hãy khám phá và đăng ký khóa học đầu tiên của bạn'
                            : 'Hãy kiên trì học và hoàn thành các khóa học đang học'
                        }
                    </Text>
                </View>
            ) : (
                <FlatList
                    data={data}
                    keyExtractor={item => item.id.toString()}
                    renderItem={({ item }) => <CourseProgressCard course={item} />}
                    contentContainerStyle={{ padding: 20 }}
                    showsVerticalScrollIndicator={false}
                />
            )}
        </View>
    );
};

export default MyCoursesScreen;
