import React from 'react';
import { View, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { ArrowLeft } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import AppText from './AppText';
import { useTheme } from '../../context/ThemeContext';

const AppHeader = ({ title, rightComponent, onBackPress, showBack = true, className = '', titleClassName = '', iconColor }) => {
    let navigation = null;
    try {
        navigation = useNavigation();
    } catch (_) {}

    const insets = useSafeAreaInsets();
    const { isDarkMode } = useTheme();

    const handleBackPress = () => {
        if (onBackPress) {
            onBackPress();
        } else if (navigation && typeof navigation.goBack === 'function' && navigation.canGoBack()) {
            navigation.goBack();
        }
    };

    const defaultIconColor = iconColor || (isDarkMode ? '#f8fafc' : '#1e293b');

    return (
        <View 
            className={`px-4 pb-4 border-b flex-row items-center justify-between ${
                isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-100'
            } ${className}`}
            style={{ paddingTop: Math.max(insets.top, 20) + 12 }}
        >
            <View className="flex-row items-center flex-1">
                {showBack && (
                    <TouchableOpacity 
                        onPress={handleBackPress} 
                        className="p-2 -ml-2"
                        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                    >
                        <ArrowLeft size={24} color={defaultIconColor} />
                    </TouchableOpacity>
                )}
                <AppText 
                    className={`text-xl font-bold flex-1 ${showBack ? 'ml-2' : ''} ${
                        isDarkMode ? 'text-slate-100' : 'text-slate-800'
                    } ${titleClassName}`}
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
