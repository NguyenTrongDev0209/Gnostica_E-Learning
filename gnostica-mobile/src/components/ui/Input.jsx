import AppText from './AppText';
import React from 'react';
import { TextInput, View } from 'react-native';

const Input = ({
    label,
    icon: Icon,
    rightIcon,
    error,
    className = '',
    containerClassName = '',
    ...props
}) => {
    return (
        <View className={`flex-col gap-1.5 ${containerClassName}`}>
            {label && <AppText className="text-sm font-medium text-slate-700">{label}</AppText>}
            <View className="relative justify-center">
                {Icon && (
                    <View className="absolute left-3 z-10">
                        <Icon size={16} color="#64748b" />
                    </View>
                )}
                <TextInput
                    className={`h-11 bg-slate-50 border rounded-md px-3 text-base text-gray-900 ${Icon ? 'pl-9' : ''} ${rightIcon ? 'pr-10' : ''} ${error ? 'border-red-500' : 'border-slate-200'} ${className}`}
                    placeholderTextColor="#94a3b8"
                    {...props}
                />
                {rightIcon && (
                    <View className="absolute right-3 z-10">
                        {rightIcon}
                    </View>
                )}
            </View>
            {error && <AppText className="text-red-500 text-xs mt-1">{error}</AppText>}
        </View>
    );
};

export default Input;
