import React from 'react';
import { TouchableOpacity, Text, View, Platform } from 'react-native';
import { useNavigation } from '@react-navigation/native';

const GlobalChatButton = () => {
    const navigation = useNavigation();

    return (
        <View pointerEvents="box-none" style={{ position: 'absolute', bottom: 24, right: 18, zIndex: 1000 }}>
            <TouchableOpacity
                onPress={() => navigation.navigate('Chat')}
                activeOpacity={0.85}
                style={{
                    backgroundColor: '#10B981',
                    paddingHorizontal: 16,
                    paddingVertical: 12,
                    borderRadius: 999,
                    shadowColor: '#000',
                    shadowOpacity: 0.12,
                    shadowOffset: { width: 0, height: 4 },
                    shadowRadius: 8,
                    elevation: 6,
                }}
            >
                <Text style={{ color: '#fff', fontWeight: '800' }}>Chat</Text>
            </TouchableOpacity>
        </View>
    );
};

export default GlobalChatButton;
