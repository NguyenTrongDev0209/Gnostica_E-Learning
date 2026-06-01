import React from 'react';
import { TouchableOpacity, Text, View } from 'react-native';

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
    const variantStyles = {
        primary: { backgroundColor: '#2563EB' },
        secondary: { backgroundColor: '#F1F5F9' },
        outline: { backgroundColor: 'transparent', borderWidth: 1, borderColor: '#CBD5E1' },
        ghost: { backgroundColor: 'transparent' },
        danger: { backgroundColor: '#EF4444' },
    };

    const sizeStyles = {
        default: { paddingHorizontal: 16, paddingVertical: 12 },
        sm: { paddingHorizontal: 12, paddingVertical: 8 },
        lg: { paddingHorizontal: 24, paddingVertical: 16 },
        icon: { padding: 12 },
    };

    const textColorStyles = {
        primary: { color: '#ffffff' },
        secondary: { color: '#1E293B' },
        outline: { color: '#475569' },
        ghost: { color: '#2563EB' },
        danger: { color: '#ffffff' },
    };

    const iconSize = size === 'sm' ? 16 : 20;
    const iconColor = variant === 'primary' || variant === 'danger' ? '#ffffff' : '#2563EB';

    return (
        <TouchableOpacity
            style={[
                {
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderRadius: 10,
                    opacity: disabled ? 0.5 : 1,
                },
                variantStyles[variant],
                sizeStyles[size],
                style,
            ]}
            onPress={onPress}
            disabled={disabled}
            activeOpacity={0.8}
            {...props}
        >
            {Icon && (
                <View style={{ marginRight: children ? 8 : 0 }}>
                    <Icon size={iconSize} color={iconColor} />
                </View>
            )}
            {children && (
                <Text style={[{ fontWeight: '600', ...textColorStyles[variant] }, textStyle]}>
                    {children}
                </Text>
            )}
        </TouchableOpacity>
    );
};

export default Button;
