import AppText from '../../components/ui/AppText';
import React, { useState } from 'react';
import { View, ScrollView, TouchableOpacity, TextInput, Image } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { ArrowLeft, Search, MessageSquare, Plus, Filter, MessageCircle, Heart } from 'lucide-react-native';

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
            <View className="bg-white pt-12 pb-4 px-4 border-b border-slate-100">
                <View className="flex-row items-center justify-between mb-4">
                    <View className="flex-row items-center">
                        <TouchableOpacity onPress={() => navigation.goBack()} className="p-2">
                            <ArrowLeft size={24} color="#1e293b" />
                        </TouchableOpacity>
                        <AppText className="text-xl font-bold text-slate-800 ml-2">Diễn đàn thảo luận</AppText>
                    </View>
                    <TouchableOpacity
                        className="bg-blue-600 w-10 h-10 rounded-full items-center justify-center shadow-lg"
                        onPress={() => navigation.navigate('CreatePost')}
                    >
                        <Plus size={24} color="#fff" />
                    </TouchableOpacity>
                </View>

                <View className="flex-row gap-2">
                    <View className="flex-1 flex-row items-center bg-slate-100 rounded-xl px-3 py-2">
                        <Search size={18} color="#64748b" />
                        <TextInput
                            placeholder="Tìm kiếm bài viết..."
                            className="flex-1 ml-2 text-slate-700"
                            value={searchQuery}
                            onChangeText={setSearchQuery}
                        />
                    </View>
                    <TouchableOpacity className="bg-slate-100 w-10 h-10 rounded-xl items-center justify-center">
                        <Filter size={18} color="#64748b" />
                    </TouchableOpacity>
                </View>

                {/* Categories Scroll */}
                <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mt-4 -mx-4 px-4">
                    {['Tất cả', 'Lập trình', 'Thiết kế', 'Kinh doanh', 'Marketing', 'Kỹ năng mềm'].map((cat, i) => (
                        <TouchableOpacity
                            key={cat}
                            className={`px-4 py-2 rounded-full mr-2 ${i === 0 ? 'bg-blue-600' : 'bg-white border border-slate-200'}`}
                        >
                            <AppText className={`text-xs font-bold ${i === 0 ? 'text-white' : 'text-slate-600'}`}>{cat}</AppText>
                        </TouchableOpacity>
                    ))}
                </ScrollView>
            </View>

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
