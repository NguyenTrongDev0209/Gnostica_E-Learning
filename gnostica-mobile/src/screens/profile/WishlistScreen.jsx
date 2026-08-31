import AppText from '../../components/ui/AppText';
import React, { useState, useCallback } from 'react';
import { View, ScrollView, TouchableOpacity, Image, ActivityIndicator, Alert } from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { Trash2, ShoppingCart, Star, Heart, ArrowRight } from 'lucide-react-native';
import Button from '../../components/ui/Button';
import AppHeader from '../../components/ui/AppHeader';
import favouriteService from '../../services/instructor/favouriteService';
import { useTheme } from '../../context/ThemeContext';

const WishlistScreen = () => {
    const navigation = useNavigation();
    const { isDarkMode } = useTheme();
    const [wishlist, setWishlist] = useState([]);
    const [loading, setLoading] = useState(true);

    useFocusEffect(
        useCallback(() => {
            let isMounted = true;
            setLoading(true);
            
            favouriteService.getWishlist()
                .then(response => {
                    if (!isMounted) return;
                    const raw = response?.data || response;
                    const list = Array.isArray(raw) ? raw : (raw?.content || []);
                    setWishlist(list);
                })
                .catch(error => {
                    console.error('Error fetching wishlist:', error);
                })
                .finally(() => {
                    if (isMounted) setLoading(false);
                });

            return () => {
                isMounted = false;
            };
        }, [])
    );

    const handleRemove = async (courseId) => {
        try {
            await favouriteService.toggle(courseId);
            setWishlist(prev => prev.filter(c => (c.id || c.courseId) !== courseId));
        } catch (error) {
            Alert.alert('Lỗi', 'Không thể xóa khỏi danh sách yêu thích.');
        }
    };

    const formatPrice = (value) => {
        if (value == null) return 'Miễn phí';
        if (typeof value === 'string' && value.includes('đ')) return value;
        const num = typeof value === 'number' ? value : parseInt(value, 10);
        if (isNaN(num) || num === 0) return 'Miễn phí';
        return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".") + ' đ';
    };

    return (
        <View className={`flex-1 ${isDarkMode ? 'bg-slate-900' : 'bg-slate-50'}`}>
            <AppHeader 
                title="Danh sách yêu thích" 
                className={isDarkMode ? '!bg-slate-800 !border-slate-700' : ''}
                titleClassName={isDarkMode ? '!text-slate-100' : ''}
            />

            <ScrollView className="flex-1 p-4" showsVerticalScrollIndicator={false}>
                {loading ? (
                    <View className="flex-1 items-center justify-center py-20">
                        <ActivityIndicator size="large" color="#2563EB" />
                    </View>
                ) : wishlist.length === 0 ? (
                    <View className={`items-center justify-center py-16 px-4 rounded-2xl border mt-4 ${
                        isDarkMode ? 'bg-slate-800 border-slate-700/60' : 'bg-white border-slate-100'
                    }`}>
                        <View className={`w-16 h-16 rounded-full items-center justify-center mb-4 ${
                            isDarkMode ? 'bg-pink-950/60' : 'bg-pink-50'
                        }`}>
                            <Heart size={32} color="#EC4899" />
                        </View>
                        <AppText className={`text-lg font-bold ${isDarkMode ? 'text-slate-100' : 'text-slate-800'}`}>Danh sách lưu đang trống</AppText>
                        <AppText className={`text-center mt-2 text-sm leading-5 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                            Hãy lưu lại những khóa học bạn quan tâm để dễ dàng xem và đăng ký học nhé!
                        </AppText>
                        <Button
                            variant="primary"
                            className="mt-6 px-6 py-3 rounded-xl"
                            onPress={() => navigation.navigate('CourseCatalog')}
                        >
                            Khám phá khóa học ngay
                        </Button>
                    </View>
                ) : (
                    wishlist.map(item => {
                        const targetId = item.id || item.courseId;
                        const thumbnail = item.thumbnail || item.courseThumbnail || item.image || 'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=400&q=80';
                        const title = item.title || item.courseTitle || 'Khóa học Gnostica';
                        const instructor = item.instructor || item.instructorName || item.account?.fullName || 'Giảng viên Gnostica';
                        const price = item.salePrice || item.price;
                        const rating = item.rating || 5.0;

                        return (
                            <TouchableOpacity
                                key={targetId}
                                activeOpacity={0.85}
                                onPress={() => navigation.navigate('CourseDetail', { course: item })}
                                className={`rounded-2xl p-3 mb-3 shadow-sm border flex-row ${
                                    isDarkMode ? 'bg-slate-800 border-slate-700/60' : 'bg-white border-slate-100'
                                }`}
                            >
                                <Image
                                    source={{ uri: thumbnail }}
                                    className={`w-24 h-24 rounded-xl ${isDarkMode ? 'bg-slate-700' : 'bg-slate-100'}`}
                                    resizeMode="cover"
                                />
                                <View className="flex-1 ml-3.5 justify-between">
                                    <View>
                                        <AppText className={`font-bold text-[15px] leading-5 ${isDarkMode ? 'text-slate-100' : 'text-slate-800'}`} numberOfLines={2}>
                                            {title}
                                        </AppText>
                                        <AppText className={`text-xs mt-1 font-medium ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                                            {instructor}
                                        </AppText>
                                        <View className="flex-row items-center mt-1 gap-1">
                                            <Star size={12} color="#fbbf24" fill="#fbbf24" />
                                            <AppText className={`text-xs font-bold ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>{rating}</AppText>
                                        </View>
                                    </View>

                                    <View className={`flex-row justify-between items-center mt-2 pt-2 border-t ${
                                        isDarkMode ? 'border-slate-700/60' : 'border-slate-50'
                                    }`}>
                                        <AppText className="text-blue-500 font-extrabold text-base">
                                            {formatPrice(price)}
                                        </AppText>
                                        
                                        <View className="flex-row items-center gap-2">
                                            <TouchableOpacity 
                                                className={`p-2 rounded-full ${isDarkMode ? 'bg-red-950/60' : 'bg-red-50'}`}
                                                onPress={() => handleRemove(targetId)}
                                                activeOpacity={0.7}
                                            >
                                                <Trash2 size={16} color="#ef4444" />
                                            </TouchableOpacity>

                                            <View className={`flex-row items-center gap-1 px-3 py-1.5 rounded-full ${
                                                isDarkMode ? 'bg-blue-950/80' : 'bg-blue-50'
                                            }`}>
                                                <AppText className="text-xs font-bold text-blue-400">Xem khóa học</AppText>
                                                <ArrowRight size={13} color="#3b82f6" />
                                            </View>
                                        </View>
                                    </View>
                                </View>
                            </TouchableOpacity>
                        );
                    })
                )}
                <View className="h-20" />
            </ScrollView>
        </View>
    );
};

export default WishlistScreen;
