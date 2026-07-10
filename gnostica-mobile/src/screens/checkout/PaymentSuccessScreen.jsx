import AppText from '../../components/ui/AppText';
import React, { useEffect, useRef } from 'react';
import { View, TouchableOpacity, Animated, Easing } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { CheckCircle2, ChevronRight, Home } from 'lucide-react-native';

export default function PaymentSuccessScreen() {
    const navigation = useNavigation();
    
    // Animation cho icon checkmark
    const scaleAnim = useRef(new Animated.Value(0)).current;
    const opacityAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        Animated.sequence([
            Animated.timing(scaleAnim, {
                toValue: 1.2,
                duration: 400,
                easing: Easing.bezier(0.25, 0.1, 0.25, 1),
                useNativeDriver: true,
            }),
            Animated.timing(scaleAnim, {
                toValue: 1,
                duration: 200,
                easing: Easing.bezier(0.25, 0.1, 0.25, 1),
                useNativeDriver: true,
            })
        ]).start();

        Animated.timing(opacityAnim, {
            toValue: 1,
            duration: 600,
            useNativeDriver: true,
        }).start();
    }, []);

    return (
        <View className="flex-1 bg-white items-center justify-center p-6">
            <Animated.View 
                className="items-center mb-8"
                style={{ 
                    transform: [{ scale: scaleAnim }],
                    opacity: opacityAnim 
                }}
            >
                <View className="w-28 h-28 bg-green-50 rounded-full items-center justify-center mb-6 border-8 border-green-100">
                    <CheckCircle2 size={64} color="#10B981" />
                </View>
                
                <AppText className="text-3xl font-black text-slate-800 text-center mb-3">
                    Thanh toán thành công!
                </AppText>
                
                <AppText className="text-base text-slate-500 text-center px-4 leading-6">
                    Bạn đã thanh toán thành công. Hãy bắt đầu hành trình học tập ngay bây giờ nhé.
                </AppText>
            </Animated.View>

            <Animated.View 
                className="w-full mt-4"
                style={{ opacity: opacityAnim }}
            >
                <TouchableOpacity 
                    className="w-full bg-blue-600 flex-row items-center justify-center py-4 rounded-xl mb-4 shadow-sm shadow-blue-200"
                    onPress={() => navigation.reset({
                        index: 0,
                        routes: [{ name: 'Main', state: { routes: [{ name: 'MyCourses' }] } }],
                    })}
                >
                    <AppText className="text-white font-extrabold text-lg mr-2">Vào học ngay</AppText>
                    <ChevronRight size={20} color="white" />
                </TouchableOpacity>

                <TouchableOpacity 
                    className="w-full bg-slate-50 flex-row items-center justify-center py-4 rounded-xl border border-slate-200"
                    onPress={() => navigation.reset({
                        index: 0,
                        routes: [{ name: 'Main', state: { routes: [{ name: 'Home' }] } }],
                    })}
                >
                    <Home size={20} color="#64748B" className="mr-2" />
                    <AppText className="text-slate-600 font-bold text-lg">Về trang chủ</AppText>
                </TouchableOpacity>
            </Animated.View>
        </View>
    );
}
