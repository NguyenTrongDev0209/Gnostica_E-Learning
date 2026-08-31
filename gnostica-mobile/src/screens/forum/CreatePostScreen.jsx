import AppText from '../../components/ui/AppText';
import React, { useState, useEffect } from 'react';
import {
    View, ScrollView, TouchableOpacity, TextInput,
    KeyboardAvoidingView, Platform, Alert, ActivityIndicator,
    Image,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Image as ImageIcon, X, Hash, Plus } from 'lucide-react-native';
import AppHeader from '../../components/ui/AppHeader';
import forumCategoryService from '../../services/forum/forumCategoryService';
import threadService from '../../services/forum/threadService';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { LinearGradient } from 'expo-linear-gradient';
import * as ImagePicker from 'expo-image-picker';

const CreatePostScreen = () => {
    const navigation = useNavigation();
    const route = useRoute();
    const { user } = useAuth();
    const { isDarkMode } = useTheme();
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [categories, setCategories] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [loadingCategories, setLoadingCategories] = useState(true);
    const [submitting, setSubmitting] = useState(false);

    // Images
    const [images, setImages] = useState([]); // [{ uri, name, type }]

    // Hashtags
    const [hashtagInput, setHashtagInput] = useState('');
    const [hashtags, setHashtags] = useState([]);

    const initialCategoryParam = route.params?.category || (route.params?.categoryId ? { id: route.params?.categoryId, name: route.params?.categoryName } : null);

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const response = await forumCategoryService.getAll();
                const data = response.data || response.content || response;
                if (Array.isArray(data)) {
                    setCategories(data);
                    if (initialCategoryParam) {
                        const match = data.find(c =>
                            (initialCategoryParam.id && String(c.id) === String(initialCategoryParam.id)) ||
                            (initialCategoryParam.name && c.name?.toLowerCase() === initialCategoryParam.name?.toLowerCase())
                        );
                        if (match) {
                            setSelectedCategory(match);
                            return;
                        }
                    }
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

    const pickImages = async () => {
        try {
            const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
            if (status !== 'granted') {
                Alert.alert(
                    'Quyền truy cập',
                    'Cần cấp quyền truy cập thư viện ảnh để đính kèm hình ảnh.'
                );
                return;
            }

            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ['images'],
                allowsMultipleSelection: true,
                quality: 0.8,
                selectionLimit: Math.max(1, 5 - images.length),
            });

            if (!result.canceled && result.assets && result.assets.length > 0) {
                const newImgs = result.assets.map((asset) => {
                    const uri = asset.uri;
                    const filename = asset.fileName || uri.split('/').pop() || `image_${Date.now()}.jpg`;
                    const match = /\.(\w+)$/.exec(filename);
                    const type = asset.mimeType || (match ? `image/${match[1]}` : 'image/jpeg');

                    return {
                        uri: uri,
                        name: filename,
                        type: type,
                    };
                });
                setImages(prev => [...prev, ...newImgs].slice(0, 5));
            }
        } catch (e) {
            console.error('Error picking images:', e);
            Alert.alert('Lỗi', `Không thể mở thư viện ảnh. Vui lòng thử lại.`);
        }
    };

    const removeImage = (index) => {
        setImages(prev => prev.filter((_, i) => i !== index));
    };

    const addHashtag = () => {
        const tag = hashtagInput.trim().replace(/^#+/, '').replace(/\s+/g, '');
        if (!tag) return;
        if (hashtags.includes(tag)) {
            setHashtagInput('');
            return;
        }
        if (hashtags.length >= 5) {
            Alert.alert('Giới hạn', 'Tối đa 5 hashtag mỗi bài viết.');
            return;
        }
        setHashtags(prev => [...prev, tag]);
        setHashtagInput('');
    };

    const removeHashtag = (tag) => {
        setHashtags(prev => prev.filter(t => t !== tag));
    };

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

            if (hashtags.length > 0) {
                formData.append('hashtags', hashtags.join(','));
            }

            images.forEach((img, index) => {
                const imageUri = Platform.OS === 'android' ? img.uri : img.uri.replace('file://', '');
                formData.append('images', {
                    uri: imageUri,
                    name: img.name || `image_${Date.now()}_${index}.jpg`,
                    type: img.type || 'image/jpeg',
                });
            });

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
            style={{ flex: 1, backgroundColor: isDarkMode ? '#0f172a' : '#ffffff' }}
        >
            <AppHeader 
                title="Đăng bài thảo luận" 
                className={isDarkMode ? '!bg-slate-800 !border-slate-700' : ''}
                titleClassName={isDarkMode ? '!text-slate-100' : ''}
                rightComponent={
                    <TouchableOpacity onPress={handleCreate} disabled={submitting} style={{ paddingHorizontal: 4 }}>
                        {submitting ? (
                            <ActivityIndicator size="small" color="#f97316" />
                        ) : (
                            <LinearGradient
                                colors={['#fb923c', '#ea580c']}
                                style={{ paddingHorizontal: 16, paddingVertical: 7, borderRadius: 20 }}
                            >
                                <AppText style={{ color: '#fff', fontWeight: 'bold', fontSize: 14 }}>Đăng</AppText>
                            </LinearGradient>
                        )}
                    </TouchableOpacity>
                } 
            />

            <ScrollView style={{ flex: 1, paddingHorizontal: 16 }} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">

                {/* Category Selector */}
                <AppText style={{ color: '#94a3b8', fontWeight: 'bold', fontSize: 11, textTransform: 'uppercase', letterSpacing: 1, marginTop: 16, marginBottom: 8 }}>Chuyên mục</AppText>
                {loadingCategories ? (
                    <ActivityIndicator size="small" color="#64748b" style={{ alignSelf: 'flex-start', marginBottom: 20 }} />
                ) : (
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 20 }}>
                        {categories.map(cat => (
                            <TouchableOpacity
                                key={cat.id}
                                onPress={() => setSelectedCategory(cat)}
                                style={{
                                    marginRight: 8,
                                    paddingHorizontal: 16,
                                    paddingVertical: 8,
                                    borderRadius: 20,
                                    borderWidth: 1.5,
                                    borderColor: selectedCategory?.id === cat.id ? '#f97316' : (isDarkMode ? '#334155' : '#e2e8f0'),
                                    backgroundColor: selectedCategory?.id === cat.id ? (isDarkMode ? '#451a03' : '#fff7ed') : (isDarkMode ? '#1e293b' : '#f8fafc'),
                                }}
                            >
                                <AppText style={{ fontWeight: '600', color: selectedCategory?.id === cat.id ? '#ea580c' : (isDarkMode ? '#94a3b8' : '#64748b') }}>{cat.name}</AppText>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>
                )}

                {/* Title */}
                <TextInput
                    placeholder="Tiêu đề bài viết"
                    placeholderTextColor="#94a3b8"
                    style={{ fontSize: 22, fontWeight: 'bold', color: isDarkMode ? '#f8fafc' : '#0f172a', marginBottom: 12, fontFamily: 'Inter_700Bold' }}
                    multiline
                    value={title}
                    onChangeText={setTitle}
                />

                <View style={{ height: 1, backgroundColor: isDarkMode ? '#334155' : '#f1f5f9', marginBottom: 12 }} />

                {/* Content */}
                <TextInput
                    placeholder="Bạn muốn chia sẻ điều gì?"
                    placeholderTextColor="#94a3b8"
                    style={{ fontSize: 15, color: isDarkMode ? '#cbd5e1' : '#334155', minHeight: 160, textAlignVertical: 'top', lineHeight: 22 }}
                    multiline
                    textAlignVertical="top"
                    value={content}
                    onChangeText={setContent}
                />

                <View style={{ height: 1, backgroundColor: isDarkMode ? '#334155' : '#f1f5f9', marginVertical: 20 }} />

                {/* Image Picker */}
                <AppText style={{ color: '#94a3b8', fontWeight: 'bold', fontSize: 11, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 10 }}>Hình ảnh</AppText>
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 10 }}>
                    {images.map((img, index) => (
                        <View key={index} style={{ position: 'relative', width: 90, height: 90, borderRadius: 12, overflow: 'hidden' }}>
                            <Image source={{ uri: img.uri }} style={{ width: 90, height: 90, borderRadius: 12 }} />
                            <TouchableOpacity
                                onPress={() => removeImage(index)}
                                style={{
                                    position: 'absolute', top: 4, right: 4,
                                    backgroundColor: 'rgba(0,0,0,0.55)',
                                    borderRadius: 10, width: 20, height: 20,
                                    alignItems: 'center', justifyContent: 'center',
                                }}
                            >
                                <X size={12} color="#fff" />
                            </TouchableOpacity>
                        </View>
                    ))}
                    {images.length < 5 && (
                        <TouchableOpacity
                            onPress={pickImages}
                            style={{
                                width: 90, height: 90, borderRadius: 12,
                                borderWidth: 1.5, borderStyle: 'dashed', borderColor: isDarkMode ? '#475569' : '#cbd5e1',
                                backgroundColor: isDarkMode ? '#1e293b' : '#f8fafc',
                                alignItems: 'center', justifyContent: 'center',
                            }}
                        >
                            <ImageIcon size={22} color="#94a3b8" />
                            <AppText style={{ color: '#94a3b8', fontSize: 11, marginTop: 4 }}>Thêm ảnh</AppText>
                        </TouchableOpacity>
                    )}
                </View>

                <View style={{ height: 1, backgroundColor: isDarkMode ? '#334155' : '#f1f5f9', marginVertical: 20 }} />

                {/* Hashtags */}
                <AppText style={{ color: '#94a3b8', fontWeight: 'bold', fontSize: 11, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 10 }}>Hashtag</AppText>

                {/* Existing tags */}
                {hashtags.length > 0 && (
                    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 10 }}>
                        {hashtags.map(tag => (
                            <View key={tag} style={{
                                flexDirection: 'row', alignItems: 'center',
                                backgroundColor: isDarkMode ? '#451a03' : '#fff7ed', borderWidth: 1, borderColor: isDarkMode ? '#7c2d12' : '#fed7aa',
                                borderRadius: 20, paddingHorizontal: 12, paddingVertical: 5,
                            }}>
                                <AppText style={{ color: '#ea580c', fontWeight: '600', fontSize: 13 }}>#{tag}</AppText>
                                <TouchableOpacity onPress={() => removeHashtag(tag)} style={{ marginLeft: 6 }}>
                                    <X size={12} color="#ea580c" />
                                </TouchableOpacity>
                            </View>
                        ))}
                    </View>
                )}

                {/* Hashtag input */}
                {hashtags.length < 5 && (
                    <View style={{
                        flexDirection: 'row', alignItems: 'center',
                        borderWidth: 1.5, borderColor: isDarkMode ? '#334155' : '#e2e8f0',
                        borderRadius: 14, paddingHorizontal: 12, paddingVertical: 8,
                        backgroundColor: isDarkMode ? '#1e293b' : '#f8fafc',
                    }}>
                        <Hash size={16} color="#f97316" style={{ marginRight: 6 }} />
                        <TextInput
                            value={hashtagInput}
                            onChangeText={setHashtagInput}
                            onSubmitEditing={addHashtag}
                            placeholder="Nhập hashtag rồi nhấn +"
                            placeholderTextColor="#94a3b8"
                            returnKeyType="done"
                            style={{ flex: 1, fontSize: 14, color: isDarkMode ? '#f8fafc' : '#334155' }}
                            autoCapitalize="none"
                        />
                        <TouchableOpacity onPress={addHashtag} style={{ marginLeft: 8 }}>
                            <LinearGradient
                                colors={['#fb923c', '#ea580c']}
                                style={{ width: 28, height: 28, borderRadius: 14, alignItems: 'center', justifyContent: 'center' }}
                            >
                                <Plus size={16} color="#fff" strokeWidth={2.5} />
                            </LinearGradient>
                        </TouchableOpacity>
                    </View>
                )}

                <View style={{ height: 80 }} />
            </ScrollView>
        </KeyboardAvoidingView>
    );
};

export default CreatePostScreen;
