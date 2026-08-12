import React from 'react';
import { TouchableOpacity, View, StyleSheet } from 'react-native';
import { Bot, Sparkles } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';

const FloatingAiButton = ({ bottomOffset = 90, style }) => {
    const navigation = useNavigation();

    const handlePress = () => {
        navigation.navigate('AiChat');
    };

    return (
        <TouchableOpacity
            activeOpacity={0.85}
            onPress={handlePress}
            style={[styles.container, { bottom: bottomOffset }, style]}
        >
            <LinearGradient
                colors={['#3b82f6', '#1d4ed8']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.gradient}
            >
                <Bot size={18} color="#ffffff" strokeWidth={2.2} />
                <View style={styles.sparkleBadge}>
                    <Sparkles size={8} color="#f59e0b" fill="#f59e0b" />
                </View>
            </LinearGradient>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        right: 20,
        zIndex: 999,
        elevation: 6,
        shadowColor: '#2563eb',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.3,
        shadowRadius: 5,
    },
    gradient: {
        width: 42,
        height: 42,
        borderRadius: 21,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: '#ffffff',
    },
    sparkleBadge: {
        position: 'absolute',
        top: 1,
        right: 1,
        backgroundColor: '#ffffff',
        borderRadius: 6,
        padding: 1.5,
    }
});

export default FloatingAiButton;
