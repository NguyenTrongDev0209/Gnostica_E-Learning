import React, { createContext, useState, useContext } from 'react';
import { View, ActivityIndicator, Text, Modal } from 'react-native';

const LoadingContext = createContext();

export const useLoading = () => useContext(LoadingContext);

export const LoadingProvider = ({ children }) => {
    const [isLoading, setIsLoading] = useState(false);
    const [loadingText, setLoadingText] = useState('');

    const showLoading = (text = 'Đang tải...') => {
        setLoadingText(text);
        setIsLoading(true);
    };

    const hideLoading = () => {
        setIsLoading(false);
        setLoadingText('');
    };

    return (
        <LoadingContext.Provider value={{ isLoading, showLoading, hideLoading }}>
            {children}
            {isLoading && (
                <Modal transparent animationType="fade" visible={isLoading}>
                    <View className="flex-1 items-center justify-center" style={{ backgroundColor: 'rgba(0, 0, 0, 0.4)' }}>
                        <View className="bg-white p-6 rounded-2xl items-center shadow-sm border border-slate-100 min-w-[140px]">
                            <ActivityIndicator size="large" color="#2563EB" />
                            {loadingText ? (
                                <Text className="mt-4 text-slate-700 font-medium text-sm text-center">
                                    {loadingText}
                                </Text>
                            ) : null}
                        </View>
                    </View>
                </Modal>
            )}
        </LoadingContext.Provider>
    );
};
