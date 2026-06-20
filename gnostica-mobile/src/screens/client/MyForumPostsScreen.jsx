import React from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { ArrowLeft, MessageSquare, ThumbsUp, Eye, Clock } from 'lucide-react-native';

const mockPosts = [
    { id: 1, title: 'Hỏi về lỗi React Navigation', content: 'Khi mình dùng BottomTabNavigator thì bị che mất phần dưới...', time: '2 giờ trước', likes: 5, views: 120, comments: 3 },
    { id: 2, title: 'Chia sẻ lộ trình học Node.js 2026', content: 'Chào mọi người, hôm nay mình muốn chia sẻ một chút về...', time: '1 ngày trước', likes: 45, views: 500, comments: 12 },
];

export default function MyForumPostsScreen() {
    const navigation = useNavigation();

    return (
        <View className="flex-1 bg-slate-50">
            {/* Header */}
            <View className="pt-[52px] pb-4 px-5 bg-white flex-row items-center justify-between border-b border-slate-100">
                <View className="flex-row items-center">
                    <TouchableOpacity onPress={() => navigation.goBack()} className="mr-3 p-1">
                        <ArrowLeft size={24} color="#334155" />
                    </TouchableOpacity>
                    <Text className="text-[18px] font-extrabold text-slate-800">Bài viết của tôi</Text>
                </View>
                <TouchableOpacity onPress={() => navigation.navigate('CreatePost')} className="bg-blue-50 px-3 py-1.5 rounded-lg">
                    <Text className="text-blue-600 font-bold text-xs">Viết bài</Text>
                </TouchableOpacity>
            </View>

            <ScrollView className="flex-1 p-5" showsVerticalScrollIndicator={false}>
                {mockPosts.map(post => (
                    <TouchableOpacity 
                        key={post.id} 
                        className="bg-white p-4 rounded-2xl mb-4 border border-slate-100 shadow-sm"
                        activeOpacity={0.8}
                    >
                        <Text className="text-base font-bold text-slate-800 mb-1.5">{post.title}</Text>
                        <Text className="text-sm text-slate-500 mb-3" numberOfLines={2}>{post.content}</Text>
                        
                        <View className="flex-row items-center justify-between mt-2 pt-3 border-t border-slate-50">
                            <View className="flex-row items-center gap-1">
                                <Clock size={12} color="#94A3B8" />
                                <Text className="text-[11px] text-slate-400">{post.time}</Text>
                            </View>
                            <View className="flex-row items-center gap-4">
                                <View className="flex-row items-center gap-1">
                                    <ThumbsUp size={12} color="#64748B" />
                                    <Text className="text-[11px] text-slate-500 font-medium">{post.likes}</Text>
                                </View>
                                <View className="flex-row items-center gap-1">
                                    <Eye size={12} color="#64748B" />
                                    <Text className="text-[11px] text-slate-500 font-medium">{post.views}</Text>
                                </View>
                                <View className="flex-row items-center gap-1">
                                    <MessageSquare size={12} color="#64748B" />
                                    <Text className="text-[11px] text-slate-500 font-medium">{post.comments}</Text>
                                </View>
                            </View>
                        </View>
                    </TouchableOpacity>
                ))}

                {mockPosts.length === 0 && (
                    <View className="items-center justify-center py-20">
                        <MessageSquare size={48} color="#CBD5E1" strokeWidth={1} />
                        <Text className="text-slate-500 mt-4 text-center">Bạn chưa có bài đăng nào.</Text>
                    </View>
                )}
            </ScrollView>
        </View>
    );
}
