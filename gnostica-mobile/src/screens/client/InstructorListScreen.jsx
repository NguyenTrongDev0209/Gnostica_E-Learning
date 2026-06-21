import AppText from '../../components/ui/AppText';
import React, { useState } from 'react';
import { View, ScrollView, TouchableOpacity, Image, Dimensions } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Star, Users, BookOpen, Heart, MessageCircle, Award } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import AppHeader from '../../components/ui/AppHeader';

const { width } = Dimensions.get('window');
const CARD_WIDTH = width - 48;

const MOCK_INSTRUCTORS = [
    {
        id: '1',
        name: 'Nguyễn Văn An',
        specialty: 'Senior Web Developer',
        org: 'Google Vietnam',
        rating: 4.9,
        reviews: 1240,
        students: 15000,
        courses: 12,
        experience: '8 năm',
        avatar: 'https://i.pravatar.cc/400?u=instructor1',
        tags: ['React', 'Node.js', 'TypeScript'],
        about: 'Chuyên gia phát triển web với hơn 8 năm kinh nghiệm tại các công ty công nghệ hàng đầu. Đam mê chia sẻ kiến thức và giúp học viên đạt được mục tiêu nghề nghiệp.',
        accentColor: '#3b82f6',
        accentBg: '#eff6ff',
        coverGradient: ['#1e3a8a', '#2563eb'],
    },
    {
        id: '2',
        name: 'Trần Thị Bích',
        specialty: 'UI/UX Design Lead',
        org: 'Grab Design Studio',
        rating: 4.8,
        reviews: 980,
        students: 8400,
        courses: 8,
        experience: '6 năm',
        avatar: 'https://i.pravatar.cc/400?u=instructor2',
        tags: ['Figma', 'Design System', 'Prototyping'],
        about: 'Trưởng nhóm thiết kế với kinh nghiệm xây dựng design system cho nhiều sản phẩm triệu người dùng. Tư vấn UX cho hơn 20 startup trong khu vực.',
        accentColor: '#8b5cf6',
        accentBg: '#f5f3ff',
        coverGradient: ['#4c1d95', '#7c3aed'],
    },
    {
        id: '3',
        name: 'Lê Hoàng Cường',
        specialty: 'Data Scientist',
        org: 'VinAI Research',
        rating: 4.7,
        reviews: 620,
        students: 5200,
        courses: 5,
        experience: '5 năm',
        avatar: 'https://i.pravatar.cc/400?u=instructor3',
        tags: ['Python', 'Machine Learning', 'Deep Learning'],
        about: 'Nhà khoa học dữ liệu với các công trình nghiên cứu được công bố tại các hội nghị quốc tế. Giúp học viên nắm vững AI từ nền tảng đến ứng dụng thực tế.',
        accentColor: '#10b981',
        accentBg: '#ecfdf5',
        coverGradient: ['#064e3b', '#059669'],
    },
];

const formatNumber = (num) => {
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toString();
};

const InstructorCard = ({ instructor }) => {
    const [liked, setLiked] = useState(false);

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
                    colors={instructor.coverGradient}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={{ flex: 1 }}
                />
                {/* Decorative circles */}
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

                {/* Like button */}
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

                {/* Avatar - overlapping cover */}
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
                            source={{ uri: instructor.avatar }}
                            style={{ width: '100%', height: '100%' }}
                        />
                    </View>
                </View>

                {/* Rating badge on cover */}
                <View style={{
                    position: 'absolute', bottom: 14, right: 14,
                    flexDirection: 'row', alignItems: 'center',
                    backgroundColor: 'rgba(0,0,0,0.35)',
                    paddingHorizontal: 10, paddingVertical: 5,
                    borderRadius: 12,
                }}>
                    <Star size={12} color="#fbbf24" fill="#fbbf24" />
                    <AppText style={{ color: '#fff', fontSize: 13, fontFamily: 'Inter_700Bold', marginLeft: 4 }}>
                        {instructor.rating}
                    </AppText>
                    <AppText style={{ color: 'rgba(255,255,255,0.7)', fontSize: 11, marginLeft: 3 }}>
                        ({formatNumber(instructor.reviews)})
                    </AppText>
                </View>
            </View>

            {/* Body */}
            <View style={{ paddingTop: 56, paddingHorizontal: 24, paddingBottom: 24 }}>
                {/* Name + org */}
                <AppText style={{ fontSize: 20, fontFamily: 'Inter_700Bold', color: '#1e293b' }}>
                    {instructor.name}
                </AppText>
                <AppText style={{ fontSize: 13, color: '#64748b', fontFamily: 'Inter_500Medium', marginTop: 2 }}>
                    {instructor.specialty}
                </AppText>
                <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 4 }}>
                    <Award size={13} color={instructor.accentColor} />
                    <AppText style={{ fontSize: 12, color: instructor.accentColor, fontFamily: 'Inter_600SemiBold', marginLeft: 4 }}>
                        {instructor.org}
                    </AppText>
                </View>

                {/* Tags */}
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 14 }}>
                    {instructor.tags.map(tag => (
                        <View key={tag} style={{
                            backgroundColor: instructor.accentBg,
                            paddingHorizontal: 10, paddingVertical: 4,
                            borderRadius: 8,
                        }}>
                            <AppText style={{ fontSize: 12, color: instructor.accentColor, fontFamily: 'Inter_600SemiBold' }}>
                                {tag}
                            </AppText>
                        </View>
                    ))}
                </View>

                {/* About */}
                <AppText style={{
                    fontSize: 13, color: '#64748b', fontFamily: 'Inter_400Regular',
                    lineHeight: 20, marginTop: 14,
                }} numberOfLines={3}>
                    {instructor.about}
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
                        { label: 'Học viên', value: formatNumber(instructor.students), icon: Users },
                        { label: 'Khóa học', value: instructor.courses, icon: BookOpen },
                        { label: 'Kinh nghiệm', value: instructor.experience, icon: Award },
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
                        backgroundColor: instructor.accentBg,
                        alignItems: 'center', justifyContent: 'center',
                    }}>
                        <MessageCircle size={20} color={instructor.accentColor} />
                    </TouchableOpacity>

                    <TouchableOpacity
                        activeOpacity={0.85}
                        style={{ flex: 1, borderRadius: 14, overflow: 'hidden' }}
                    >
                        <LinearGradient
                            colors={instructor.coverGradient}
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
    return (
        <View style={{ flex: 1, backgroundColor: '#f8fafc' }}>
            {/* Header */}
            <AppHeader title="Giảng viên tiêu biểu" />

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

                {MOCK_INSTRUCTORS.map(instructor => (
                    <InstructorCard key={instructor.id} instructor={instructor} />
                ))}
            </ScrollView>
        </View>
    );
};

export default InstructorListScreen;
