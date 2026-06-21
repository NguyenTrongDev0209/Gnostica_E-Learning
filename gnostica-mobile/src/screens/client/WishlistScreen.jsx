import AppText from '../../components/ui/AppText';
import React from 'react';
import { View, ScrollView, TouchableOpacity, Image } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Trash2, ShoppingCart, Star } from 'lucide-react-native';
import Button from '../../components/ui/Button';
import AppHeader from '../../components/ui/AppHeader';

const MOCK_WISHLIST = [
    {
        id: '1',
        title: 'Lập trình React Native toàn tập',
        instructor: 'Nguyễn Văn A',
        price: '499.000đ',
        image: 'https://img.freepik.com/free-vector/app-development-concept-with-programming-languages_23-2148703831.jpg',
        rating: 4.8,
    },
    {
        id: '2',
        title: 'Thiết kế UI/UX hiện đại cho Mobile',
        instructor: 'Trần Thị B',
        price: '599.000đ',
        image: 'https://img.freepik.com/free-vector/user-interface-design-concept-illustration_114360-1202.jpg',
        rating: 4.9,
    }
];

const WishlistScreen = () => {
    const navigation = useNavigation();

    return (
        <View className="flex-1 bg-slate-50">
            {/* Header */}
            <AppHeader title="Danh sách yêu thích" />

            <ScrollView className="flex-1 p-4">
                {MOCK_WISHLIST.length === 0 ? (
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
                    MOCK_WISHLIST.map(item => (
                        <View key={item.id} className="bg-white rounded-2xl p-3 mb-4 shadow-sm border border-slate-100 flex-row">
                            <Image
                                source={{ uri: item.image }}
                                className="w-24 h-24 rounded-xl"
                            />
                            <View className="flex-1 ml-4 justify-between">
                                <View>
                                    <AppText className="text-slate-900 font-bold text-base" numberOfLines={2}>{item.title}</AppText>
                                    <AppText className="text-slate-500 text-xs mt-1">{item.instructor}</AppText>
                                    <View className="flex-row items-center mt-1">
                                        <Star size={12} color="#fbbf24" fill="#fbbf24" />
                                        <AppText className="text-slate-700 text-xs font-medium ml-1">{item.rating}</AppText>
                                    </View>
                                </View>
                                <View className="flex-row justify-between items-center">
                                    <AppText className="text-primary font-bold text-base">{item.price}</AppText>
                                    <View className="flex-row gap-2">
                                        <TouchableOpacity className="p-2 bg-slate-50 rounded-full">
                                            <Trash2 size={16} color="#ef4444" />
                                        </TouchableOpacity>
                                        <TouchableOpacity className="p-2 bg-blue-50 rounded-full">
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
