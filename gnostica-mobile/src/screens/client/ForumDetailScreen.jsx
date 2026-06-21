import AppText from '../../components/ui/AppText';
import React, { useState } from 'react';
import { View, ScrollView, TouchableOpacity, TextInput, KeyboardAvoidingView, Platform } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { ArrowLeft, MessageCircle, Heart, Share2, Send } from 'lucide-react-native';

const MOCK_COMMENTS = [
    {
        id: 'c1',
        author: 'Dương Trần',
        content: 'Bạn có thể thử dùng React.memo hoặc useMemo cho các component phức tạp trong list nhé.',
        time: '15 phút trước'
    },
    {
        id: 'c2',
        author: 'Trần Văn C',
        content: 'Cảm ơn bài viết rất bổ ích mẫu, FlashList của Shopify cũng là một lựa chọn tốt.',
        time: '5 phút trước'
    }
];

const ForumDetailScreen = () => {
    const navigation = useNavigation();
    const route = useRoute();
    const { post } = route.params || { post: {} };
    const [reply, setReply] = useState('');

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : undefined}
            className="flex-1 bg-white"
        >
            {/* Header */}
            <View className="pt-12 pb-4 px-4 border-b border-slate-100 flex-row items-center justify-between">
                <TouchableOpacity onPress={() => navigation.goBack()} className="p-2">
                    <ArrowLeft size={24} color="#1e293b" />
                </TouchableOpacity>
                <AppText className="text-lg font-bold text-slate-800">Chi tiết bài viết</AppText>
                <TouchableOpacity className="p-2">
                    <Share2 size={20} color="#64748b" />
                </TouchableOpacity>
            </View>

            <ScrollView className="flex-1 px-4 pt-4">
                {/* Main Post */}
                <View className="flex-row items-center mb-4">
                    <View className="w-10 h-10 rounded-full bg-blue-100 items-center justify-center">
                        <AppText className="text-blue-600 font-bold text-sm">{post.avatar}</AppText>
                    </View>
                    <View className="ml-3">
                        <AppText className="text-slate-900 font-bold text-sm">{post.author}</AppText>
                        <AppText className="text-slate-400 text-xs">{post.time} • Trong {post.category}</AppText>
                    </View>
                </View>

                <AppText className="text-slate-900 font-bold text-xl mb-4 leading-7">{post.title}</AppText>
                <AppText className="text-slate-700 text-base leading-6 mb-8">
                    {post.content}
                    {"\n\n"}
                    Đây là nội dung chi tiết bài viết giả định để minh họa cho giao diện mobile. Bài viết thảo luận về các vấn đề kỹ thuật hoặc chia sẻ kinh nghiệm học tập thực tế.
                </AppText>

                <View className="flex-row gap-6 border-t border-b border-slate-50 py-4 mb-6">
                    <TouchableOpacity className="flex-row items-center">
                        <Heart size={20} color="#64748b" />
                        <AppText className="text-slate-500 text-sm ml-1.5">{post.likes} Thích</AppText>
                    </TouchableOpacity>
                    <View className="flex-row items-center">
                        <MessageCircle size={20} color="#64748b" />
                        <AppText className="text-slate-500 text-sm ml-1.5">{post.comments} Bình luận</AppText>
                    </View>
                </View>

                {/* Comments Section */}
                <AppText className="text-slate-900 font-bold text-base mb-4">Bình luận ({post.comments})</AppText>
                {MOCK_COMMENTS.map(comment => (
                    <View key={comment.id} className="mb-6 bg-slate-50 p-4 rounded-2xl">
                        <View className="flex-row justify-between items-center mb-1">
                            <AppText className="text-slate-900 font-bold text-xs">{comment.author}</AppText>
                            <AppText className="text-slate-400 text-[10px]">{comment.time}</AppText>
                        </View>
                        <AppText className="text-slate-700 text-sm">{comment.content}</AppText>
                    </View>
                ))}
                <View className="h-20" />
            </ScrollView>

            {/* Bottom Bar Input */}
            <View className="p-4 border-t border-slate-100 bg-white flex-row items-center gap-3">
                <TextInput
                    placeholder="Viết bình luận của bạn..."
                    className="flex-1 bg-slate-100 rounded-2xl px-4 py-3 text-slate-700"
                    value={reply}
                    onChangeText={setReply}
                    multiline
                />
                <TouchableOpacity className="bg-blue-600 w-12 h-12 rounded-2xl items-center justify-center shadow-md">
                    <Send size={20} color="#fff" />
                </TouchableOpacity>
            </View>
        </KeyboardAvoidingView>
    );
};

export default ForumDetailScreen;
