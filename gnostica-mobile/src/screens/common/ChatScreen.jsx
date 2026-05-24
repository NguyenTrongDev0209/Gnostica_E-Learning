import React, { useState, useRef } from 'react';
import { View, Text, FlatList, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform } from 'react-native';
import { useNavigation } from '@react-navigation/native';

const ChatMessage = ({ m }) => (
    <View style={{ backgroundColor: m.outgoing ? '#DCFCE7' : '#F1F5F9', padding: 10, borderRadius: 10, marginVertical: 6, alignSelf: m.outgoing ? 'flex-end' : 'flex-start', maxWidth: '80%' }}>
        <Text style={{ color: '#0F172A' }}>{m.text}</Text>
    </View>
);

const ChatScreen = () => {
    const navigation = useNavigation();
    const [messages, setMessages] = useState([
        { id: '1', text: 'Xin chào! Bạn cần trợ giúp gì hôm nay?', outgoing: false },
    ]);
    const [input, setInput] = useState('');
    const listRef = useRef(null);

    const send = () => {
        if (!input.trim()) return;
        const msg = { id: String(Date.now()), text: input.trim(), outgoing: true };
        setMessages(prev => [...prev, msg]);
        setInput('');
        // mock reply
        setTimeout(() => {
            setMessages(prev => [...prev, { id: String(Date.now() + 1), text: 'Cảm ơn — chúng tôi đã nhận tin nhắn của bạn.', outgoing: false }]);
            listRef.current?.scrollToEnd({ animated: true });
        }, 800);
    };

    return (
        <KeyboardAvoidingView style={{ flex: 1, backgroundColor: '#F8FAFC' }} behavior={Platform.OS === 'ios' ? 'padding' : undefined} keyboardVerticalOffset={90}>
            <View style={{ paddingTop: 52, paddingHorizontal: 20, paddingBottom: 12, backgroundColor: '#ffffff', borderBottomWidth: 1, borderBottomColor: '#F1F5F9' }}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={{ marginBottom: 8 }}>
                    <Text style={{ color: '#2563EB', fontWeight: '700' }}>‹ Quay lại</Text>
                </TouchableOpacity>
                <Text style={{ fontSize: 20, fontWeight: '800' }}>Hỗ trợ</Text>
            </View>

            <FlatList
                ref={listRef}
                data={messages}
                keyExtractor={item => item.id}
                contentContainerStyle={{ padding: 20 }}
                renderItem={({ item }) => <ChatMessage m={item} />}
            />

            <View style={{ padding: 12, borderTopWidth: 1, borderTopColor: '#F1F5F9', backgroundColor: '#ffffff' }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                    <TextInput
                        value={input}
                        onChangeText={setInput}
                        placeholder="Nhập tin nhắn..."
                        style={{ flex: 1, backgroundColor: '#F1F5F9', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 10 }}
                    />
                    <TouchableOpacity onPress={send} style={{ marginLeft: 8, backgroundColor: '#2563EB', padding: 10, borderRadius: 8 }}>
                        <Text style={{ color: '#fff', fontWeight: '700' }}>Gửi</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </KeyboardAvoidingView>
    );
};

export default ChatScreen;
