import React from 'react';
import { View, Text, TextInput, TouchableOpacity } from 'react-native';
import { Search, X } from 'lucide-react-native';

const SearchBar = ({ value, onChangeText, placeholder = 'Tìm kiếm khóa học...', onClear, style }) => {
    return (
        <View
            style={[{
                flexDirection: 'row',
                alignItems: 'center',
                backgroundColor: '#F1F5F9',
                borderRadius: 14,
                paddingHorizontal: 14,
                paddingVertical: 10,
                borderWidth: 1,
                borderColor: value ? '#2563eb' : 'transparent',
            }, style]}
        >
            <Search size={18} color="#94a3b8" strokeWidth={2} />
            <TextInput
                value={value}
                onChangeText={onChangeText}
                placeholder={placeholder}
                placeholderTextColor="#94a3b8"
                style={{
                    flex: 1,
                    marginLeft: 10,
                    fontSize: 15,
                    color: '#1e293b',
                    padding: 0,
                }}
                autoCapitalize="none"
                returnKeyType="search"
            />
            {value ? (
                <TouchableOpacity onPress={onClear} style={{ padding: 2 }}>
                    <X size={16} color="#94a3b8" />
                </TouchableOpacity>
            ) : null}
        </View>
    );
};

export default SearchBar;
