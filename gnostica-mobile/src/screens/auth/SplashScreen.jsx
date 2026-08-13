import React, { useEffect, useRef } from 'react';
import { View, Image, Animated, Dimensions, StatusBar } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import AppText from '../../components/ui/AppText';

const { width, height } = Dimensions.get('window');

const SplashScreen = ({ onFinish }) => {
    // Animation values
    const logoScale = useRef(new Animated.Value(0.3)).current;
    const logoOpacity = useRef(new Animated.Value(0)).current;
    const textOpacity = useRef(new Animated.Value(0)).current;
    const textTranslateY = useRef(new Animated.Value(20)).current;
    const taglineOpacity = useRef(new Animated.Value(0)).current;
    const screenOpacity = useRef(new Animated.Value(1)).current;

    useEffect(() => {
        StatusBar.setBarStyle('light-content');

        // Step 1: Logo appears with spring
        Animated.sequence([
            Animated.parallel([
                Animated.spring(logoScale, {
                    toValue: 1,
                    tension: 80,
                    friction: 8,
                    useNativeDriver: true,
                }),
                Animated.timing(logoOpacity, {
                    toValue: 1,
                    duration: 400,
                    useNativeDriver: true,
                }),
            ]),

            // Step 2: Brand name slides up
            Animated.parallel([
                Animated.timing(textOpacity, {
                    toValue: 1,
                    duration: 350,
                    useNativeDriver: true,
                }),
                Animated.timing(textTranslateY, {
                    toValue: 0,
                    duration: 350,
                    useNativeDriver: true,
                }),
            ]),

            // Step 3: Tagline fades in
            Animated.timing(taglineOpacity, {
                toValue: 1,
                duration: 300,
                useNativeDriver: true,
            }),

            // Step 4: Hold for 800ms
            Animated.delay(800),

            // Step 5: Fade out entire screen
            Animated.timing(screenOpacity, {
                toValue: 0,
                duration: 400,
                useNativeDriver: true,
            }),
        ]).start(() => {
            StatusBar.setBarStyle('dark-content');
            onFinish?.();
        });
    }, []);

    return (
        <Animated.View style={{ flex: 1, opacity: screenOpacity }}>
            <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
            <LinearGradient
                colors={['#1e3a8a', '#2563eb', '#3b82f6']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}
            >
                {/* Decorative circles */}
                <View style={{
                    position: 'absolute',
                    top: -80,
                    right: -80,
                    width: 280,
                    height: 280,
                    borderRadius: 140,
                    backgroundColor: 'rgba(255,255,255,0.06)',
                }} />
                <View style={{
                    position: 'absolute',
                    bottom: -60,
                    left: -60,
                    width: 220,
                    height: 220,
                    borderRadius: 110,
                    backgroundColor: 'rgba(255,255,255,0.05)',
                }} />

                {/* Logo container */}
                <Animated.View style={{
                    opacity: logoOpacity,
                    transform: [{ scale: logoScale }],
                    alignItems: 'center',
                }}>
                    {/* Logo icon */}
                    <Image
                        source={require('../../assets/images/Gnostica_Mark.webp')}
                        style={{ width: 150, height: 36, marginBottom: 24 }}
                        resizeMode="contain"
                    />

                    {/* Brand name: logo đã có chữ, bỏ chữ trắng trùng lặp */}
                    <Animated.View style={{
                        opacity: textOpacity,
                        transform: [{ translateY: textTranslateY }],
                        alignItems: 'center',
                    }}>
                        {/* Tagline */}
                        <Animated.View style={{ opacity: taglineOpacity, marginTop: 8, alignItems: 'center' }}>
                            <View style={{
                                height: 1,
                                width: 180,
                                backgroundColor: 'rgba(255,255,255,0.3)',
                                marginBottom: 10,
                            }} />
                            <AppText style={{
                                fontSize: 14,
                                color: 'rgba(255,255,255,0.75)',
                                fontFamily: 'Inter_400Regular',
                                letterSpacing: 0.5,
                            }}>
                                Học không giới hạn
                            </AppText>
                        </Animated.View>
                    </Animated.View>
                </Animated.View>

                {/* Bottom version */}
                <Animated.View style={{
                    position: 'absolute',
                    bottom: 48,
                    opacity: taglineOpacity,
                }}>
                    <AppText style={{
                        color: 'rgba(255,255,255,0.4)',
                        fontSize: 12,
                        fontFamily: 'Inter_400Regular',
                    }}>
                        v1.0.0
                    </AppText>
                </Animated.View>
            </LinearGradient>
        </Animated.View>
    );
};

export default SplashScreen;
