import React from 'react';
import { Text, View } from 'react-native';
import Button from '../ui/Button';

const HeroSection = () => {
    return (
        <View className="p-5">
            <View className="bg-primary rounded-2xl p-6 min-h-[180px] justify-center shadow-md">
                <Text className="text-white text-2xl font-bold mb-2">Khai phá kiến thức mới</Text>
                <Text className="text-white/80 text-base mb-5">Cùng Gnostica chinh phục mọi kỹ năng</Text>
                <Button
                    variant="ghost"
                    className="bg-white self-start px-6 rounded-lg shadow-sm"
                    textClassName="text-primary font-bold"
                >
                    Khám phá ngay
                </Button>
            </View>
        </View>
    );
};

export default HeroSection;
