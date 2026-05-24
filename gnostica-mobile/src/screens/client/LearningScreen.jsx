import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Dimensions } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { ArrowLeft, Play, CheckCircle2, Circle, FileText, MessageCircle } from 'lucide-react-native';

const { width } = Dimensions.get('window');

const LearningScreen = () => {
    const navigation = useNavigation();
    const route = useRoute();
    const course = route.params?.course;
    const [activeTab, setActiveTab] = useState('curriculum');

    if (!course) return null;

    return (
        <View style={{ flex: 1, backgroundColor: '#ffffff' }}>
            {/* Header + Video Player Placeholder */}
            <View style={{ backgroundColor: '#0f172a', paddingTop: 48, paddingBottom: 0 }}>
                {/* Header Navbar */}
                <View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, marginBottom: 12 }}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={{ padding: 4 }}>
                        <ArrowLeft size={24} color="#ffffff" />
                    </TouchableOpacity>
                    <Text style={{ flex: 1, color: '#ffffff', fontSize: 16, fontWeight: '700', marginLeft: 12 }} numberOfLines={1}>
                        {course.title}
                    </Text>
                </View>

                {/* Video Player */}
                <View style={{
                    width: width, height: width * 0.5625, // 16:9 ratio
                    backgroundColor: '#000000',
                    justifyContent: 'center', alignItems: 'center',
                }}>
                    {/* Fake play button overlay */}
                    <TouchableOpacity style={{
                        width: 64, height: 64, borderRadius: 32,
                        backgroundColor: 'rgba(255,255,255,0.2)',
                        alignItems: 'center', justifyContent: 'center',
                    }}>
                        <View style={{
                            width: 48, height: 48, borderRadius: 24,
                            backgroundColor: '#2563EB',
                            alignItems: 'center', justifyContent: 'center',
                            paddingLeft: 4, // center play icon visually
                        }}>
                            <Play size={24} color="#ffffff" fill="#ffffff" />
                        </View>
                    </TouchableOpacity>
                    <View style={{ position: 'absolute', bottom: 12, right: 12, backgroundColor: 'rgba(0,0,0,0.6)', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 4 }}>
                        <Text style={{ color: '#fff', fontSize: 12, fontWeight: '600' }}>12:45</Text>
                    </View>
                </View>
            </View>

            {/* Content Tabs */}
            <View style={{ flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: '#F1F5F9' }}>
                {[
                    { key: 'curriculum', label: 'Nội dung' },
                    { key: 'materials', label: 'Tài liệu' },
                    { key: 'qa', label: 'Hỏi đáp' }
                ].map(tab => (
                    <TouchableOpacity
                        key={tab.key}
                        style={{
                            flex: 1, alignItems: 'center', paddingVertical: 14,
                            borderBottomWidth: activeTab === tab.key ? 2 : 0,
                            borderBottomColor: '#2563EB',
                        }}
                        onPress={() => setActiveTab(tab.key)}
                    >
                        <Text style={{
                            fontSize: 14, fontWeight: '600',
                            color: activeTab === tab.key ? '#2563EB' : '#64748B'
                        }}>
                            {tab.label}
                        </Text>
                    </TouchableOpacity>
                ))}
            </View>

            {/* Tab Views */}
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ flexGrow: 1, backgroundColor: '#F8FAFC' }}>
                {activeTab === 'curriculum' && (
                    <View style={{ paddingBottom: 40 }}>
                        {course.curriculum?.map((section, secIdx) => (
                            <View key={secIdx} style={{ backgroundColor: '#ffffff', marginBottom: 8, borderBottomWidth: 1, borderBottomColor: '#f1f5f9' }}>
                                <View style={{ padding: 16, backgroundColor: '#F8FAFC' }}>
                                    <Text style={{ fontSize: 13, color: '#64748B', fontWeight: '500', marginBottom: 4 }}>
                                        Chương {secIdx + 1}
                                    </Text>
                                    <Text style={{ fontSize: 15, fontWeight: '700', color: '#1E293B' }}>
                                        {section.section}
                                    </Text>
                                </View>
                                {/* Simulate lessons */}
                                {[1, 2, 3].map((lesson, lessIdx) => {
                                    // Mock state: chapter 1 is completed, chapter 2 is current, chapter 3 is locked
                                    const isCompleted = secIdx === 0 && lessIdx < 2;
                                    const isCurrent = secIdx === 0 && lessIdx === 2;

                                    return (
                                        <TouchableOpacity
                                            key={lessIdx}
                                            style={{
                                                flexDirection: 'row', alignItems: 'center',
                                                padding: 16, borderBottomWidth: 1, borderBottomColor: '#f1f5f9',
                                                backgroundColor: isCurrent ? '#EFF6FF' : '#ffffff'
                                            }}
                                        >
                                            <View style={{ marginRight: 12 }}>
                                                {isCompleted ? <CheckCircle2 size={24} color="#10B981" /> : (isCurrent ? <Play size={24} color="#2563EB" /> : <Circle size={24} color="#CBD5E1" />)}
                                            </View>
                                            <View style={{ flex: 1 }}>
                                                <Text style={{ fontSize: 14, fontWeight: isCurrent ? '700' : '500', color: '#1E293B' }}>
                                                    {lesson}. Bài học mô phỏng {secIdx + 1}.{lessIdx + 1}
                                                </Text>
                                                <Text style={{ fontSize: 12, color: '#64748B', marginTop: 4 }}>
                                                    Video • 12:45
                                                </Text>
                                            </View>
                                        </TouchableOpacity>
                                    )
                                })}
                            </View>
                        ))}
                    </View>
                )}

                {activeTab === 'materials' && (
                    <View style={{ padding: 20 }}>
                        <Text style={{ color: '#64748b', fontSize: 14 }}>Tài liệu tham khảo và mã nguồn của khóa học sẽ được hiển thị ở đây.</Text>
                    </View>
                )}

                {activeTab === 'qa' && (
                    <View style={{ padding: 20 }}>
                        <Text style={{ color: '#64748b', fontSize: 14 }}>Chưa có câu hỏi nào. Tương tác với giảng viên và các bạn học viên khác tại đây.</Text>
                    </View>
                )}
            </ScrollView>
        </View>
    );
};

export default LearningScreen;
