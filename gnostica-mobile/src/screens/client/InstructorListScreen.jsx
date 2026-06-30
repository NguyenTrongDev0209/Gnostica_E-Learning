import AppText from '../../components/ui/AppText';
import React, { useState, useEffect } from 'react';
import { View, ScrollView, TouchableOpacity, Image, Dimensions, ActivityIndicator } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Star, Users, BookOpen, Heart, MessageCircle, Award } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import AppHeader from '../../components/ui/AppHeader';
import instructorService from '../../services/instructorService';

const { width } = Dimensions.get('window');
const CARD_WIDTH = width - 48;

const formatNumber = (num) => {
    if (!num) return '0';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toString();
};

const InstructorCard = ({ instructor }) => {
    const [liked, setLiked] = useState(false);
    
    const avatar = instructor.avatar || 'https://via.placeholder.com/150';
    const accentColor = '#3b82f6';
    const accentBg = '#eff6ff';
    const coverGradient = ['#1e3a8a', '#2563eb'];

    return (
        <View style={{
            width: CARD_WIDTH,
            backgroundColor: '#fff',
            borderRadius: 24,
            marginBottom: 24,
            overflow: 'hidden',
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.08,
            shadowRadius: 16,
            elevation: 6,
        }}>
            {/* Cover + Avatar area */}
            <View style={{ height: 140 }}>
                <LinearGradient
                    colors={coverGradient}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={{ flex: 1 }}
                />
                <View style={{
                    position: 'absolute', right: -30, top: -30,
                    width: 130, height: 130, borderRadius: 65,
                    backgroundColor: 'rgba(255,255,255,0.08)',
                }} />
                <View style={{
                    position: 'absolute', left: -15, bottom: -15,
                    width: 90, height: 90, borderRadius: 45,
                    backgroundColor: 'rgba(255,255,255,0.06)',
                }} />

                <TouchableOpacity
                    onPress={() => setLiked(!liked)}
                    style={{
                        position: 'absolute', top: 14, right: 14,
                        width: 36, height: 36, borderRadius: 18,
                        backgroundColor: 'rgba(255,255,255,0.2)',
                        alignItems: 'center', justifyContent: 'center',
                    }}
                >
                    <Heart size={18} color={liked ? '#f43f5e' : '#fff'} fill={liked ? '#f43f5e' : 'transparent'} />
                </TouchableOpacity>

                <View style={{
                    position: 'absolute',
                    bottom: -44,
                    left: 24,
                }}>
                    <View style={{
                        width: 88, height: 88, borderRadius: 24,
                        borderWidth: 4, borderColor: '#fff',
                        overflow: 'hidden',
                        shadowColor: '#000',
                        shadowOffset: { width: 0, height: 4 },
                        shadowOpacity: 0.15,
                        shadowRadius: 8,
                        elevation: 8,
                    }}>
                        <Image
                            source={{ uri: avatar }}
                            style={{ width: '100%', height: '100%' }}
                        />
                    </View>
                </View>
            </View>

            {/* Body */}
            <View style={{ paddingTop: 56, paddingHorizontal: 24, paddingBottom: 24 }}>
                <AppText style={{ fontSize: 20, fontFamily: 'Inter_700Bold', color: '#1e293b' }}>
                    {instructor.fullName}
                </AppText>
                <AppText style={{ fontSize: 13, color: '#64748b', fontFamily: 'Inter_500Medium', marginTop: 2 }}>
                    {instructor.email}
                </AppText>

                {/* About */}
                <AppText style={{
                    fontSize: 13, color: '#64748b', fontFamily: 'Inter_400Regular',
                    lineHeight: 20, marginTop: 14,
                }} numberOfLines={3}>
                    Giảng viên tại Gnostica. Chúng tôi luôn mong muốn mang đến những trải nghiệm học tập tốt nhất.
                </AppText>

                {/* Stats row */}
                <View style={{
                    flexDirection: 'row',
                    marginTop: 20,
                    paddingTop: 16,
                    borderTopWidth: 1,
                    borderTopColor: '#f1f5f9',
                }}>
                    {[
                        { label: 'Học viên', value: formatNumber(instructor.studentsCount), icon: Users },
                        { label: 'Khóa học', value: instructor.coursesCount || 0, icon: BookOpen },
                        { label: 'Đánh giá', value: '4.9', icon: Star },
                    ].map(({ label, value, icon: Icon }, idx) => (
                        <View key={label} style={{
                            flex: 1, alignItems: 'center',
                            borderRightWidth: idx < 2 ? 1 : 0,
                            borderRightColor: '#f1f5f9',
                        }}>
                            <AppText style={{ fontSize: 17, fontFamily: 'Inter_700Bold', color: '#1e293b' }}>
                                {value}
                            </AppText>
                            <AppText style={{ fontSize: 11, color: '#94a3b8', fontFamily: 'Inter_400Regular', marginTop: 2 }}>
                                {label}
                            </AppText>
                        </View>
                    ))}
                </View>

                {/* Action buttons */}
                <View style={{ flexDirection: 'row', gap: 10, marginTop: 20 }}>
                    <TouchableOpacity style={{
                        width: 44, height: 44, borderRadius: 14,
                        backgroundColor: accentBg,
                        alignItems: 'center', justifyContent: 'center',
                    }}>
                        <MessageCircle size={20} color={accentColor} />
                    </TouchableOpacity>

                    <TouchableOpacity
                        activeOpacity={0.85}
                        style={{ flex: 1, borderRadius: 14, overflow: 'hidden' }}
                    >
                        <LinearGradient
                            colors={coverGradient}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 0 }}
                            style={{
                                height: 44,
                                alignItems: 'center',
                                justifyContent: 'center',
                            }}
                        >
                            <AppText style={{ color: '#fff', fontSize: 14, fontFamily: 'Inter_700Bold' }}>
                                Xem khóa học
                            </AppText>
                        </LinearGradient>
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    );
};

const InstructorListScreen = () => {
    const [instructors, setInstructors] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchInstructors = async () => {
            try {
                const response = await instructorService.getAll();
                if (Array.isArray(response)) {
                    setInstructors(response);
                } else if (response.content) {
                    setInstructors(response.content);
                }
            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        };
        fetchInstructors();
    }, []);

    return (
        <View style={{ flex: 1, backgroundColor: '#f8fafc' }}>
            <AppHeader title="Giảng viên tiêu biểu" />

            {loading ? (
                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                    <ActivityIndicator size="large" color="#2563EB" />
                </View>
            ) : (
                <ScrollView
                    style={{ flex: 1 }}
                    contentContainerStyle={{ padding: 24, paddingBottom: 80 }}
                    showsVerticalScrollIndicator={false}
                >
                    <AppText style={{
                        fontSize: 13, color: '#94a3b8', fontFamily: 'Inter_400Regular',
                        marginBottom: 20, lineHeight: 20,
                    }}>
                        Học hỏi từ các chuyên gia hàng đầu với kinh nghiệm thực chiến.
                    </AppText>

                    {instructors.map(instructor => (
                        <InstructorCard key={instructor.id} instructor={instructor} />
                    ))}
                </ScrollView>
            )}
        </View>
    );
};

export default InstructorListScreen;
