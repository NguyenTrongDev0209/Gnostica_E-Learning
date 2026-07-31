import React from 'react';
import { View, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { ArrowLeft } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import AppText from './AppText';

const AppHeader = ({ title, rightComponent, onBackPress, showBack = true, className = '', titleClassName = '' }) => {
    let navigation = null;
    try {
        navigation = useNavigation();
    } catch (_) {}

    const insets = useSafeAreaInsets();

    const handleBackPress = () => {
        if (onBackPress) {
            onBackPress();
        } else if (navigation && typeof navigation.goBack === 'function' && navigation.canGoBack()) {
            navigation.goBack();
        }
    };

    return (
        <View 
            className={`bg-white px-4 pb-4 border-b border-slate-100 flex-row items-center justify-between ${className}`}
            style={{ paddingTop: Math.max(insets.top, 20) + 12 }}
        >
            <View className="flex-row items-center flex-1">
                {showBack && (
                    <TouchableOpacity 
                        onPress={handleBackPress} 
                        className="p-2 -ml-2"
                        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                    >
                        <ArrowLeft size={24} color="#1e293b" />
                    </TouchableOpacity>
                )}
                <AppText 
                    className={`text-xl font-bold text-slate-800 flex-1 ${showBack ? 'ml-2' : ''} ${titleClassName}`}
                    numberOfLines={1}
                >
                    {title}
                </AppText>
            </View>
            
            {rightComponent && (
                <View className="ml-2">
                    {rightComponent}
                </View>
            )}
        </View>
    );
};

export default AppHeader;
