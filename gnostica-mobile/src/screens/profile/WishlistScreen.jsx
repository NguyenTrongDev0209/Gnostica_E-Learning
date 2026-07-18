import AppText from '../../components/ui/AppText';
import React, { useEffect, useState } from 'react';
import { View, ScrollView, TouchableOpacity, Image, ActivityIndicator, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Trash2, ShoppingCart, Star } from 'lucide-react-native';
import Button from '../../components/ui/Button';
import AppHeader from '../../components/ui/AppHeader';
import favouriteService from '../../services/instructor/favouriteService';

const WishlistScreen = () => {
    const navigation = useNavigation();
    const [wishlist, setWishlist] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchWishlist = async () => {
        try {
            const response = await favouriteService.getWishlist();
            const data = response.data || response.content || response;
            if (Array.isArray(data)) {
                setWishlist(data);
            }
        } catch (error) {
            console.error('Error fetching wishlist:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchWishlist();
    }, []);

    const handleRemove = async (courseId) => {
        try {
            await favouriteService.toggle(courseId);
            setWishlist(prev => prev.filter(c => c.id !== courseId && c.courseId !== courseId));
        } catch (error) {
            Alert.alert('Lỗi', 'Không thể xóa khỏi danh sách yêu thích.');
        }
    };

    const formatPrice = (priceNum) => {
        if (!priceNum) return 'Miễn phí';
        return priceNum.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".") + ' đ';
    };

    return (
        <View className="flex-1 bg-slate-50">
            <AppHeader title="Danh sách yêu thích" />

            <ScrollView className="flex-1 p-4">
                {loading ? (
                    <View className="flex-1 items-center justify-center mt-20">
                        <ActivityIndicator size="large" color="#2563EB" />
                    </View>
                ) : wishlist.length === 0 ? (
                    <View className="items-center justify-center mt-20">
                        <AppText className="text-6xl mb-4">💔</AppText>
                        <AppText className="text-lg font-bold text-slate-800">Trống trải quá...</AppText>
                        <AppText className="text-slate-500 text-center mt-2">Hãy lưu lại những khóa học bạn yêu thích nhé!</AppText>
                        <Button
                            variant="primary"
                            className="mt-6 px-8"
                            onPress={() => navigation.navigate('CourseCatalog')}
                        >
                            Khám phá ngay
                        </Button>
                    </View>
                ) : (
                    wishlist.map(item => (
                        <View key={item.id || item.courseId} className="bg-white rounded-2xl p-3 mb-4 shadow-sm border border-slate-100 flex-row">
                            <Image
                                source={{ uri: item.thumbnail || item.image || 'https://picsum.photos/200' }}
                                className="w-24 h-24 rounded-xl"
                            />
                            <View className="flex-1 ml-4 justify-between">
                                <View>
                                    <AppText className="text-slate-900 font-bold text-base" numberOfLines={2}>{item.title || item.courseTitle}</AppText>
                                    <AppText className="text-slate-500 text-xs mt-1">{item.instructor || item.instructorName || 'Giảng viên'}</AppText>
                                    <View className="flex-row items-center mt-1">
                                        <Star size={12} color="#fbbf24" fill="#fbbf24" />
                                        <AppText className="text-slate-700 text-xs font-medium ml-1">{item.rating || 4.5}</AppText>
                                    </View>
                                </View>
                                <View className="flex-row justify-between items-center">
                                    <AppText className="text-primary font-bold text-base">{formatPrice(item.price || item.salePrice)}</AppText>
                                    <View className="flex-row gap-2">
                                        <TouchableOpacity 
                                            className="p-2 bg-slate-50 rounded-full"
                                            onPress={() => handleRemove(item.id || item.courseId)}
                                        >
                                            <Trash2 size={16} color="#ef4444" />
                                        </TouchableOpacity>
                                        <TouchableOpacity 
                                            className="p-2 bg-blue-50 rounded-full"
                                            onPress={() => navigation.navigate('CourseDetail', { course: item })}
                                        >
                                            <ShoppingCart size={16} color="#2563eb" />
                                        </TouchableOpacity>
                                    </View>
                                </View>
                            </View>
                        </View>
                    ))
                )}
            </ScrollView>
        </View>
    );
};

export default WishlistScreen;
