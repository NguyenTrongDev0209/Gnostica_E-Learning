import AppText from '../../components/ui/AppText';
import React, { useState, useEffect } from 'react';
import {
    View, ScrollView, TouchableOpacity, TextInput,
    KeyboardAvoidingView, Platform, Alert, ActivityIndicator,
    Image,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Image as ImageIcon, X, Hash, Plus } from 'lucide-react-native';
import AppHeader from '../../components/ui/AppHeader';
import forumCategoryService from '../../services/forum/forumCategoryService';
import threadService from '../../services/forum/threadService';
import { useAuth } from '../../context/AuthContext';
import { LinearGradient } from 'expo-linear-gradient';

const CreatePostScreen = () => {
    const navigation = useNavigation();
    const { user } = useAuth();
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

    const pickImages = async () => {
        try {
            const ImagePicker = await import('expo-image-picker');
            const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
            if (status !== 'granted') {
                Alert.alert('Quyền truy cập', 'Cần cấp quyền truy cập thư viện ảnh để thêm hình ảnh.');
                return;
            }
            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsMultipleSelection: true,
                quality: 0.8,
                selectionLimit: 5,
            });
            if (!result.canceled && result.assets) {
                const newImgs = result.assets.map((asset) => ({
                    uri: asset.uri,
                    name: asset.fileName || `image_${Date.now()}.jpg`,
                    type: asset.mimeType || 'image/jpeg',
                }));
                setImages(prev => [...prev, ...newImgs].slice(0, 5));
            }
        } catch (e) {
            Alert.alert('Lỗi', 'Không thể mở thư viện ảnh. Vui lòng thử lại.');
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

            images.forEach((img) => {
                formData.append('images', {
                    uri: img.uri,
                    name: img.name,
                    type: img.type,
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
            style={{ flex: 1, backgroundColor: '#ffffff' }}
        >
            <AppHeader title="Đăng bài thảo luận" rightComponent={
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
            } />

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
                                    borderColor: selectedCategory?.id === cat.id ? '#f97316' : '#e2e8f0',
                                    backgroundColor: selectedCategory?.id === cat.id ? '#fff7ed' : '#f8fafc',
                                }}
                            >
                                <AppText style={{ fontWeight: '600', color: selectedCategory?.id === cat.id ? '#ea580c' : '#64748b' }}>{cat.name}</AppText>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>
                )}

                {/* Title */}
                <TextInput
                    placeholder="Tiêu đề bài viết"
                    placeholderTextColor="#94a3b8"
                    style={{ fontSize: 22, fontWeight: 'bold', color: '#0f172a', marginBottom: 12, fontFamily: 'Inter_700Bold' }}
                    multiline
                    value={title}
                    onChangeText={setTitle}
                />

                <View style={{ height: 1, backgroundColor: '#f1f5f9', marginBottom: 12 }} />

                {/* Content */}
                <TextInput
                    placeholder="Bạn muốn chia sẻ điều gì?"
                    placeholderTextColor="#94a3b8"
                    style={{ fontSize: 15, color: '#334155', minHeight: 160, textAlignVertical: 'top', lineHeight: 22 }}
                    multiline
                    textAlignVertical="top"
                    value={content}
                    onChangeText={setContent}
                />

                <View style={{ height: 1, backgroundColor: '#f1f5f9', marginVertical: 20 }} />

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
                                borderWidth: 1.5, borderStyle: 'dashed', borderColor: '#cbd5e1',
                                backgroundColor: '#f8fafc',
                                alignItems: 'center', justifyContent: 'center',
                            }}
                        >
                            <ImageIcon size={22} color="#94a3b8" />
                            <AppText style={{ color: '#94a3b8', fontSize: 11, marginTop: 4 }}>Thêm ảnh</AppText>
                        </TouchableOpacity>
                    )}
                </View>

                <View style={{ height: 1, backgroundColor: '#f1f5f9', marginVertical: 20 }} />

                {/* Hashtags */}
                <AppText style={{ color: '#94a3b8', fontWeight: 'bold', fontSize: 11, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 10 }}>Hashtag</AppText>

                {/* Existing tags */}
                {hashtags.length > 0 && (
                    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 10 }}>
                        {hashtags.map(tag => (
                            <View key={tag} style={{
                                flexDirection: 'row', alignItems: 'center',
                                backgroundColor: '#fff7ed', borderWidth: 1, borderColor: '#fed7aa',
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
                        borderWidth: 1.5, borderColor: '#e2e8f0',
                        borderRadius: 14, paddingHorizontal: 12, paddingVertical: 8,
                        backgroundColor: '#f8fafc',
                    }}>
                        <Hash size={16} color="#f97316" style={{ marginRight: 6 }} />
                        <TextInput
                            value={hashtagInput}
                            onChangeText={setHashtagInput}
                            onSubmitEditing={addHashtag}
                            placeholder="Nhập hashtag rồi nhấn +"
                            placeholderTextColor="#94a3b8"
                            returnKeyType="done"
                            style={{ flex: 1, fontSize: 14, color: '#334155' }}
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
