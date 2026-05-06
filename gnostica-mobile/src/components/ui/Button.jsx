import React from 'react';
import { TouchableOpacity, Text, View } from 'react-native';

const Button = ({
    children,
    onPress,
    variant = 'primary',
    size = 'default',
    className = '',
    textClassName = '',
    icon: Icon,
    disabled = false,
    ...props
}) => {
    // Base classes for the button wrapper
    let baseLayout = 'flex-row items-center justify-center rounded-lg active:opacity-80';

    // Variant classes
    const variants = {
        primary: 'bg-primary',
        secondary: 'bg-gray-100',
        outline: 'bg-transparent border border-gray-300',
        ghost: 'bg-transparent',
        danger: 'bg-red-500',
    };

    // Size classes
    const sizes = {
        default: 'px-4 py-3',
        sm: 'px-3 py-2',
        lg: 'px-6 py-4',
        icon: 'p-3',
    };

    // Text colors based on variant
    const textColors = {
        primary: 'text-white',
        secondary: 'text-gray-900',
        outline: 'text-gray-700',
        ghost: 'text-primary',
        danger: 'text-white',
    };

    const buttonClasses = `${baseLayout} ${variants[variant]} ${sizes[size]} ${disabled ? 'opacity-50' : ''} ${className}`;
    const textClasses = `font-semibold ${textColors[variant]} ${textClassName}`;

    return (
        <TouchableOpacity
            className={buttonClasses}
            onPress={onPress}
            disabled={disabled}
            {...props}
        >
            {Icon && (
                <View className={children ? 'mr-2' : ''}>
                    <Icon size={size === 'sm' ? 16 : 20} color={variant === 'primary' ? 'white' : 'currentColor'} />
                </View>
            )}
            {children && <Text className={textClasses}>{children}</Text>}
        </TouchableOpacity>
    );
};

export default Button;
