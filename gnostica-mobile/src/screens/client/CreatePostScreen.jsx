import AppText from '../../components/ui/AppText';
import React, { useState, useEffect } from 'react';
import { View, ScrollView, TouchableOpacity, TextInput, KeyboardAvoidingView, Platform, Alert, ActivityIndicator } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Image as ImageIcon, ChevronDown } from 'lucide-react-native';
import Button from '../../components/ui/Button';
import AppHeader from '../../components/ui/AppHeader';
import forumCategoryService from '../../services/forumCategoryService';
import threadService from '../../services/threadService';
import { useAuth } from '../../context/AuthContext';

const CreatePostScreen = () => {
    const navigation = useNavigation();
    const { user } = useAuth();
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [categories, setCategories] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [loadingCategories, setLoadingCategories] = useState(true);
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const response = await forumCategoryService.getAll();
                const data = response.data || response.content || response;
                if (Array.isArray(data)) {
                    setCategories(data);
                    if (data.length > 0) setSelectedCategory(data[0]);
                }
            } catch (error) {
                console.error('Error fetching categories:', error);
            } finally {
                setLoadingCategories(false);
            }
        };
        fetchCategories();
    }, []);

    const handleCreate = async () => {
        if (!user) {
            Alert.alert('Thông báo', 'Vui lòng đăng nhập để đăng bài.');
            return;
        }
        if (!title.trim() || !content.trim()) {
            Alert.alert('Lỗi', 'Vui lòng nhập đầy đủ tiêu đề và nội dung.');
            return;
        }
        if (!selectedCategory) {
            Alert.alert('Lỗi', 'Vui lòng chọn chuyên mục.');
            return;
        }

        setSubmitting(true);
        try {
            const formData = new FormData();
            formData.append('title', title.trim());
            formData.append('content', content.trim());
            formData.append('authorEmail', user.email);
            formData.append('categoryId', selectedCategory.id);
            // Optionally handle images here if implemented later

            await threadService.create(formData);
            Alert.alert('Thành công', 'Bài viết của bạn đã được đăng!', [
                { text: 'OK', onPress: () => navigation.goBack() }
            ]);
        } catch (error) {
            console.error('Error creating post:', error);
            Alert.alert('Lỗi', 'Không thể tạo bài đăng lúc này.');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : undefined}
            className="flex-1 bg-white"
        >
            <AppHeader title="Đăng bài thảo luận" rightComponent={
                <TouchableOpacity onPress={handleCreate} disabled={submitting}>
                    {submitting ? (
                        <ActivityIndicator size="small" color="#2563EB" />
                    ) : (
                        <AppText className="text-blue-600 font-bold">Đăng</AppText>
                    )}
                </TouchableOpacity>
            } />

            <ScrollView className="flex-1 p-4" showsVerticalScrollIndicator={false}>
                {/* Category Selector */}
                <AppText className="text-slate-500 font-bold text-xs uppercase tracking-wider mb-2">Chuyên mục</AppText>
                
                {loadingCategories ? (
                    <ActivityIndicator size="small" color="#64748b" className="self-start mb-6" />
                ) : (
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-6">
                        {categories.map(cat => (
                            <TouchableOpacity
                                key={cat.id}
                                className={`mr-2 px-4 py-2 rounded-xl border ${selectedCategory?.id === cat.id ? 'border-blue-600 bg-blue-50' : 'border-slate-200 bg-slate-50'}`}
                                onPress={() => setSelectedCategory(cat)}
                            >
                                <AppText className={`font-medium ${selectedCategory?.id === cat.id ? 'text-blue-700' : 'text-slate-600'}`}>{cat.name}</AppText>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>
                )}

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
