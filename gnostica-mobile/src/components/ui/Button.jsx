import React from 'react';
import { TouchableOpacity, Text, View } from 'react-native';
import { clsx } from 'clsx';

// Variant className maps
const variantClass = {
    primary:   'bg-blue-600',
    secondary: 'bg-slate-100',
    outline:   'bg-transparent border border-slate-300',
    ghost:     'bg-transparent',
    danger:    'bg-red-500',
};

const sizeClass = {
    default: 'px-4 py-3',
    sm:      'px-3 py-2',
    lg:      'px-6 py-4',
    icon:    'p-3',
};

const textVariantClass = {
    primary:   'text-white',
    secondary: 'text-slate-800',
    outline:   'text-slate-600',
    ghost:     'text-blue-600',
    danger:    'text-white',
};

const Button = ({
    children,
    onPress,
    variant = 'primary',
    size = 'default',
    className = '',
    textClassName = '',
    style,
    textStyle,
    icon: Icon,
    disabled = false,
    ...props
}) => {
    const iconSize = size === 'sm' ? 16 : 20;
    const iconColor = (variant === 'primary' || variant === 'danger') ? '#ffffff' : '#2563EB';

    return (
        <TouchableOpacity
            className={clsx(
                'flex-row items-center justify-center rounded-[10px]',
                variantClass[variant],
                sizeClass[size],
                disabled && 'opacity-50',
                className,
            )}
            style={style}
            onPress={onPress}
            disabled={disabled}
            activeOpacity={0.8}
            {...props}
        >
            {Icon && (
                <View className={children ? 'mr-2' : ''}>
                    <Icon size={iconSize} color={iconColor} />
                </View>
            )}
            {children && (
                <Text
                    className={clsx('font-semibold', textVariantClass[variant], textClassName)}
                    style={textStyle}
                >
                    {children}
                </Text>
            )}
        </TouchableOpacity>
    );
};

export default Button;
