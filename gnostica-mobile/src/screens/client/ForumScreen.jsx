import AppText from '../../components/ui/AppText';
import React, { useState } from 'react';
import { View, ScrollView, TouchableOpacity, TextInput, Image } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Search, MessageSquare, Plus, Filter, MessageCircle, Heart } from 'lucide-react-native';
import AppHeader from '../../components/ui/AppHeader';


const MOCK_POSTS = [
    {
        id: '1',
        author: 'Hoàng Long',
        avatar: 'HL',
        title: 'Làm sao để tối ưu performance cho React Native app?',
        content: 'Chào mọi người, mình đang gặp vấn đề với việc re-render nhiều lần trong list lớn...',
        category: 'Lập trình',
        likes: 12,
        comments: 5,
        time: '30 phút trước'
    },
    {
        id: '2',
        author: 'Minh Anh',
        avatar: 'MA',
        title: 'Lời khuyên cho người mới học UI/UX',
        content: 'Bắt đầu từ đâu khi muốn chuyển sang thiết kế giao diện di động?',
        category: 'Thiết kế',
        likes: 25,
        comments: 14,
        time: '2 giờ trước'
    }
];

const ForumScreen = () => {
    const navigation = useNavigation();
    const [searchQuery, setSearchQuery] = useState('');

    return (
        <View className="flex-1 bg-slate-50">
            {/* Header */}
            <AppHeader title="Diễn đàn thảo luận" />

            <ScrollView className="flex-1 p-4">
                {MOCK_POSTS.map(post => (
                    <TouchableOpacity
                        key={post.id}
                        className="bg-white rounded-2xl p-4 mb-4 shadow-sm border border-slate-100"
                        onPress={() => navigation.navigate('ForumDetail', { post })}
                    >
                        <View className="flex-row items-center mb-3">
                            <View className="w-8 h-8 rounded-full bg-blue-100 items-center justify-center">
                                <AppText className="text-blue-600 font-bold text-xs">{post.avatar}</AppText>
                            </View>
                            <View className="ml-2">
                                <AppText className="text-slate-900 font-bold text-xs">{post.author}</AppText>
                                <AppText className="text-slate-400 text-[10px]">{post.time}</AppText>
                            </View>
                            <View className="ml-auto bg-slate-50 px-2 py-0.5 rounded-md">
                                <AppText className="text-slate-500 text-[10px] font-medium">{post.category}</AppText>
                            </View>
                        </View>

                        <AppText className="text-slate-900 font-bold text-base mb-2">{post.title}</AppText>
                        <AppText className="text-slate-500 text-sm mb-4" numberOfLines={2}>{post.content}</AppText>

                        <View className="flex-row gap-4 border-t border-slate-50 pt-3">
                            <View className="flex-row items-center">
                                <Heart size={16} color="#ef4444" />
                                <AppText className="text-slate-500 text-xs ml-1">{post.likes}</AppText>
                            </View>
                            <View className="flex-row items-center">
                                <MessageCircle size={16} color="#64748b" />
                                <AppText className="text-slate-500 text-xs ml-1">{post.comments}</AppText>
                            </View>
                        </View>
                    </TouchableOpacity>
                ))}
                <View className="h-10" />
            </ScrollView>
        </View>
    );
};

export default ForumScreen;
