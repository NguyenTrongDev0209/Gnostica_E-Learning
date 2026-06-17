import React from 'react';
import { Text, View, ImageBackground } from 'react-native';
import Button from '../ui/Button';

const HeroSection = () => {
    return (
        <View className="px-5 pt-4 pb-2">
            <ImageBackground
                source={{ uri: 'https://picsum.photos/seed/hero99/800/400' }}
                className="rounded-[20px] overflow-hidden min-h-[180px]"
                imageStyle={{ borderRadius: 20 }}
            >
                {/* Gradient overlay */}
                <View className="absolute top-0 bottom-0 left-0 right-0 rounded-[20px]"
                    style={{ backgroundColor: 'rgba(30, 58, 138, 0.80)' }}
                />
                <View className="p-6 justify-center min-h-[180px]">
                    <Text className="text-sky-200 text-xs font-bold tracking-[1.5px] mb-1.5 uppercase">
                        Gnostica E-Learning
                    </Text>
                    <Text className="text-white text-[22px] font-extrabold leading-[30px] mb-1.5">
                        Khai phá kiến thức{'\n'}mới mỗi ngày
                    </Text>
                    <Text className="text-white/75 text-[13px] mb-[18px] leading-[18px]">
                        Cùng Gnostica chinh phục mọi kỹ năng
                    </Text>
                    <Button
                        variant="ghost"
                        className="bg-white self-start px-5 py-2.5 rounded-[10px]"
                        textClassName="text-blue-700 font-bold text-[13px]"
                    >
                        Khám phá ngay
                    </Button>
                </View>
            </ImageBackground>
        </View>
    );
};

export default HeroSection;
