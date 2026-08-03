import React from 'react';
import { View, TextInput, TouchableOpacity } from 'react-native';
import { Search, X } from 'lucide-react-native';

const SearchBar = ({
    value,
    onChangeText,
    placeholder = 'Tìm kiếm khóa học...',
    onClear,
    style,
    onFocus,
    onBlur,
    onSubmitEditing,
    ...props
}) => {
    return (
        <View
            className="flex-row items-center bg-slate-100 rounded-[14px] px-3.5 py-2.5"
            style={[value ? { borderWidth: 1, borderColor: '#2563eb' } : { borderWidth: 1, borderColor: 'transparent' }, style]}
        >
            <Search size={18} color="#94a3b8" strokeWidth={2} />
            <TextInput
                value={value}
                onChangeText={onChangeText}
                placeholder={placeholder}
                placeholderTextColor="#94a3b8"
                className="flex-1 ml-2.5 text-[15px] text-slate-800 p-0"
                autoCapitalize="none"
                returnKeyType="search"
                onFocus={onFocus}
                onBlur={onBlur}
                onSubmitEditing={onSubmitEditing}
                {...props}
            />
            {value ? (
                <TouchableOpacity onPress={onClear} className="p-0.5">
                    <X size={16} color="#94a3b8" />
                </TouchableOpacity>
            ) : null}
        </View>
    );
};

export default SearchBar;
