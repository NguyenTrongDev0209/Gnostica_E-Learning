import React from 'react';
import { Text, View, ImageBackground } from 'react-native';
import Button from '../ui/Button';

const HeroSection = () => {
    return (
        <View style={{ paddingHorizontal: 20, paddingTop: 16, paddingBottom: 8 }}>
            <ImageBackground
                source={{ uri: 'https://picsum.photos/seed/hero99/800/400' }}
                style={{ borderRadius: 20, overflow: 'hidden', minHeight: 180 }}
                imageStyle={{ borderRadius: 20 }}
            >
                {/* Gradient overlay */}
                <View style={{
                    position: 'absolute',
                    top: 0, bottom: 0, left: 0, right: 0,
                    backgroundColor: 'rgba(30, 58, 138, 0.80)',
                    borderRadius: 20,
                }} />
                <View style={{ padding: 24, justifyContent: 'center', minHeight: 180 }}>
                    <Text style={{ color: '#BAE6FD', fontSize: 12, fontWeight: '700', letterSpacing: 1.5, marginBottom: 6, textTransform: 'uppercase' }}>
                        Gnostica E-Learning
                    </Text>
                    <Text style={{ color: '#ffffff', fontSize: 22, fontWeight: '800', lineHeight: 30, marginBottom: 6 }}>
                        Khai phá kiến thức{'\n'}mới mỗi ngày
                    </Text>
                    <Text style={{ color: 'rgba(255,255,255,0.75)', fontSize: 13, marginBottom: 18, lineHeight: 18 }}>
                        Cùng Gnostica chinh phục mọi kỹ năng
                    </Text>
                    <Button
                        variant="ghost"
                        style={{
                            backgroundColor: '#ffffff',
                            alignSelf: 'flex-start',
                            paddingHorizontal: 20,
                            paddingVertical: 10,
                            borderRadius: 10,
                        }}
                        textStyle={{ color: '#1D4ED8', fontWeight: '700', fontSize: 13 }}
                    >
                        Khám phá ngay
                    </Button>
                </View>
            </ImageBackground>
        </View>
    );
};

export default HeroSection;
