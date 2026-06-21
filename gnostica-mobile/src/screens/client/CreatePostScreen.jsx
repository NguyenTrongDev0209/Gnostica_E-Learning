import AppText from '../../components/ui/AppText';
import React, { useState } from 'react';
import { View, ScrollView, TouchableOpacity, TextInput, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Image as ImageIcon, ChevronDown } from 'lucide-react-native';
import Button from '../../components/ui/Button';
import AppHeader from '../../components/ui/AppHeader';


const CreatePostScreen = () => {
    const navigation = useNavigation();
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [category, setCategory] = useState('Lập trình');

    const handleCreate = () => {
        if (!title.trim() || !content.trim()) {
            Alert.alert('Lỗi', 'Vui lòng nhập đầy đủ tiêu đề và nội dung.');
            return;
        }
        Alert.alert('Thành công', 'Bài viết của bạn đã được đăng!', [
            { text: 'OK', onPress: () => navigation.goBack() }
        ]);
    };

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : undefined}
            className="flex-1 bg-white"
        >
            {/* Header */}
            <AppHeader title="Đăng bài thảo luận" />

            <ScrollView className="flex-1 p-4">
                {/* Category Selector */}
                <AppText className="text-slate-500 font-bold text-xs uppercase tracking-wider mb-2">Chuyên mục</AppText>
                <TouchableOpacity className="flex-row items-center justify-between bg-slate-50 p-4 rounded-2xl mb-6 border border-slate-100">
                    <AppText className="text-slate-800 font-medium">{category}</AppText>
                    <ChevronDown size={18} color="#64748b" />
                </TouchableOpacity>

                <TextInput
                    placeholder="Tiêu đề bài viết"
                    className="text-2xl font-bold text-slate-900 mb-4"
                    multiline
                    value={title}
                    onChangeText={setTitle}
                />

                <TextInput
                    placeholder="Bạn muốn chia sẻ điều gì?"
                    className="text-base text-slate-700 min-h-[200px]"
                    multiline
                    textAlignVertical="top"
                    value={content}
                    onChangeText={setContent}
                />

                <View className="h-px bg-slate-100 my-6" />

                <TouchableOpacity className="flex-row items-center bg-slate-50 p-4 rounded-2xl border border-dashed border-slate-300">
                    <ImageIcon size={20} color="#64748b" />
                    <AppText className="ml-3 text-slate-500 font-medium">Thêm hình ảnh minh họa</AppText>
                </TouchableOpacity>

                <View className="h-20" />
            </ScrollView>
        </KeyboardAvoidingView>
    );
};

export default CreatePostScreen;
