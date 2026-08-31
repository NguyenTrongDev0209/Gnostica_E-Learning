import React, { useState, useEffect, useRef } from 'react';
import {
    View,
    TextInput,
    TouchableOpacity,
    FlatList,
    KeyboardAvoidingView,
    Platform,
    ActivityIndicator,
    ScrollView,
    Image
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ChevronLeft, Send, Bot, Sparkles, Plus, User, BookOpen, MessageSquare, ChevronRight, PlayCircle, Eye, ThumbsUp } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import AppText from '../../components/ui/AppText';
import aiService from '../../services/ai/aiService';
import enrollmentService from '../../services/course/enrollmentService';
import threadService from '../../services/forum/threadService';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { LinearGradient } from 'expo-linear-gradient';

const QUICK_PROMPTS = [
    { id: '1', title: '📊 Tiến độ học tập', prompt: 'Tiến độ học tập của tôi như thế nào?' },
    { id: '2', title: '🔥 Bài viết nổi bật', prompt: 'Cho tôi xem các bài viết nổi bật trên diễn đàn' },
    { id: '3', title: '🚀 Lộ trình học ngắn gọn', prompt: 'Tóm tắt ngắn gọn lộ trình học lập trình Web từ cơ bản đến nâng cao.' },
    { id: '4', title: '💡 Giải thích khái niệm', prompt: 'Giải thích ngắn gọn Async/Await trong 3 dòng.' }
];

const isProgressQuery = (text) => {
    if (!text) return false;
    const lower = text.toLowerCase();
    return lower.includes('tiến độ') ||
           lower.includes('đang học') ||
           lower.includes('học tập của tôi') ||
           lower.includes('khóa học của tôi') ||
           lower.includes('học đến đâu') ||
           lower.includes('tiến trình') ||
           (lower.includes('khóa học') && lower.includes('tôi'));
};

const isForumQuery = (text) => {
    if (!text) return false;
    const lower = text.toLowerCase();
    return lower.includes('bài viết nổi bật') ||
           lower.includes('bài đăng nổi bật') ||
           lower.includes('bài viết xem nhiều') ||
           lower.includes('bài viết hot') ||
           lower.includes('xem nhiều nhất') ||
           lower.includes('diễn đàn nổi bật') ||
           lower.includes('top bài viết');
};

const AiChatScreen = () => {
    const navigation = useNavigation();
    const { user } = useAuth();
    const { isDarkMode } = useTheme();
    const flatListRef = useRef(null);

    const [messages, setMessages] = useState([
        {
            id: 'welcome',
            role: 'assistant',
            content: 'Xin chào! Tôi là Trợ lý AI Gnostica. Bạn có thể hỏi tôi về Tiến độ học tập hoặc Các bài viết nổi bật trên Diễn đàn nhé!',
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
    ]);
    const [inputMessage, setInputMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [sessionId, setSessionId] = useState(null);
    const [quota, setQuota] = useState({ remaining: 15, dailyLimit: 15 });

    const fetchQuota = () => {
        aiService.getQuota()
            .then(data => {
                if (data?.remaining !== undefined) setQuota(data);
            })
            .catch(() => {});
    };

    useEffect(() => {
        fetchQuota();
    }, []);

    useEffect(() => {
        setTimeout(() => {
            flatListRef.current?.scrollToEnd({ animated: true });
        }, 100);
    }, [messages]);

    const handleSendMessage = async (textToSend = null) => {
        const query = (textToSend || inputMessage).trim();
        if (!query || isLoading) return;

        const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        const userMsg = {
            id: Date.now().toString(),
            role: 'user',
            content: query,
            timestamp: timeStr
        };

        const updatedMessages = [...messages, userMsg];
        setMessages(updatedMessages);
        setInputMessage('');
        setIsLoading(true);

        try {
            if (isProgressQuery(query)) {
                try {
                    const res = await enrollmentService.getMyCourses();
                    const list = res?.data || [];
                    if (Array.isArray(list) && list.length > 0) {
                        const top5 = list.slice(0, 5);
                        const progressCardsStr = top5.map(c => {
                            const cId = c.slug || c.courseSlug || c.courseId || c.id;
                            const title = c.title || c.courseTitle || 'Khóa học';
                            const percent = c.progressPercent !== undefined ? c.progressPercent : (c.progress || 0);
                            const lessonsInfo = `${c.completedLessons || 0}/${c.totalLessons || 0} bài`;
                            const last = c.lastLesson || 'Bài học tiếp theo';
                            const thumb = c.thumbnail || c.courseThumbnail || 'none';
                            return `[[CARD:progress|${cId}|${title}|${percent}|${lessonsInfo}|${last}|${thumb}]]`;
                        }).join('\n\n');

                        const replyMsg = {
                            id: (Date.now() + 1).toString(),
                            role: 'assistant',
                            content: `Dưới đây là 5 khóa học mới nhất cùng tiến độ học tập của bạn:\n\n${progressCardsStr}`,
                            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                        };
                        setMessages(prev => [...prev, replyMsg]);
                        setIsLoading(false);
                        return;
                    } else {
                        const emptyMsg = {
                            id: (Date.now() + 1).toString(),
                            role: 'assistant',
                            content: 'Bạn hiện chưa đăng ký khóa học nào hoặc chưa bắt đầu học. Hãy khám phá danh sách khóa học và bắt đầu ngay nhé!',
                            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                        };
                        setMessages(prev => [...prev, emptyMsg]);
                        setIsLoading(false);
                        return;
                    }
                } catch (err) {
                    console.error('Error fetching progress for AI chat:', err);
                }
            }

            if (isForumQuery(query)) {
                try {
                    const res = await threadService.getAll({ page: 0, size: 5, sortBy: 'viewCount' });
                    const list = res?.data?.content || res?.content || res?.data || res;
                    if (Array.isArray(list) && list.length > 0) {
                        const top5 = list.slice(0, 5);
                        const forumCardsStr = top5.map(t => {
                            const tId = t.id;
                            const title = t.title || 'Bài viết diễn đàn';
                            const views = t.viewCount ?? t.views ?? 1;
                            const likes = t.likes ?? t.voteScore ?? 0;
                            const info = `${views} lượt xem • ${likes} bình chọn`;
                            const author = t.account?.fullName || t.authorName || 'Tác giả';
                            const category = t.topic?.name || t.category?.name || 'Diễn đàn Gnostica';
                            const img = t.images?.[0] || 'none';
                            return `[[CARD:forum|${tId}|${title}|${info}|${author}|${category}|${img}]]`;
                        }).join('\n\n');

                        const replyMsg = {
                            id: (Date.now() + 1).toString(),
                            role: 'assistant',
                            content: `Dưới đây là Top 5 bài viết nổi bật có nhiều lượt xem nhất trên Diễn đàn năm nay:\n\n${forumCardsStr}`,
                            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                        };
                        setMessages(prev => [...prev, replyMsg]);
                        setIsLoading(false);
                        return;
                    }
                } catch (err) {
                    console.error('Error fetching top forum threads for AI chat:', err);
                }
            }

            const apiMessages = updatedMessages
                .filter(m => m.id !== 'welcome')
                .map((m, idx, arr) => {
                    if (idx === arr.length - 1 && m.role === 'user') {
                        return {
                            role: m.role,
                            content: `${m.content}\n\n[Yêu cầu hệ thống: Hãy trả lời ngắn gọn, súc tích, đi thẳng vào trọng tâm, tối đa 2-3 đoạn ngắn, không trình bày dài dòng]`
                        };
                    }
                    return { role: m.role, content: m.content };
                });

            const response = await aiService.sendChatMessage(apiMessages, sessionId);

            if (response) {
                const replyContent = response.content || response.reply || response.data?.content || 'Rất tiếc, tôi chưa thể xử lý yêu cầu này.';
                const newSessionId = response.sessionId || sessionId;

                if (newSessionId) setSessionId(newSessionId);

                const aiMsg = {
                    id: (Date.now() + 1).toString(),
                    role: 'assistant',
                    content: replyContent,
                    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                };
                setMessages(prev => [...prev, aiMsg]);
            }
        } catch (error) {
            console.error('Error sending message:', error);
            const errorMsg = {
                id: (Date.now() + 1).toString(),
                role: 'assistant',
                content: 'Không thể kết nối với máy chủ AI. Vui lòng kiểm tra lại kết nối mạng hoặc thử lại sau.',
                timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                isError: true
            };
            setMessages(prev => [...prev, errorMsg]);
        } finally {
            setIsLoading(false);
            fetchQuota();
        }
    };

    const handleNewChat = () => {
        setSessionId(null);
        setMessages([
            {
                id: 'welcome-' + Date.now(),
                role: 'assistant',
                content: 'Đã bắt đầu cuộc trò chuyện mới! Bạn có thể hỏi bất kỳ câu hỏi nào.',
                timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            }
        ]);
    };

    const handleCardPress = (cardData) => {
        const { type, id, title } = cardData;
        if (type === 'progress') {
            navigation.navigate('Learning', { course: { slug: id, id: id, title: title } });
        } else if (type === 'course') {
            navigation.navigate('CourseDetail', { slug: id, id: id, course: { id: id, slug: id, title: title } });
        } else if (type === 'forum') {
            const numericId = Number(id);
            navigation.navigate('ForumDetail', { id: numericId, threadId: numericId, post: { id: numericId, title: title } });
        } else if (type === 'category') {
            navigation.navigate('CourseCatalog', { categoryName: title, categoryId: id });
        } else {
            navigation.navigate('Search', { query: title });
        }
    };

    const renderCard = (cardData, key) => {
        const { type, id, title, info, author, category, imgUrl } = cardData;
        const hasThumb = imgUrl && imgUrl !== 'none' && imgUrl !== 'null';

        if (type === 'progress') {
            const percent = parseInt(info) || 0;
            const lessonsInfo = author || '0 bài';
            const lastLesson = category || 'Bài học tiếp theo';

            return (
                <TouchableOpacity
                    key={key}
                    activeOpacity={0.85}
                    onPress={() => handleCardPress(cardData)}
                    className={`mt-2.5 mb-2 border rounded-2xl p-3.5 shadow-xs ${
                        isDarkMode ? 'bg-slate-900 border-slate-700' : 'bg-white border-blue-100'
                    }`}
                >
                    <View className="flex-row items-center mb-2">
                        {hasThumb && (
                            <Image
                                source={{ uri: imgUrl }}
                                className={`w-12 h-12 rounded-xl mr-3 border ${
                                    isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-slate-100 border-slate-100'
                                }`}
                                resizeMode="cover"
                            />
                        )}
                        <View className="flex-1">
                            <View className="flex-row items-center justify-between">
                                <AppText className={`font-bold text-sm flex-1 mr-2 ${isDarkMode ? 'text-slate-100' : 'text-slate-900'}`} numberOfLines={1}>
                                    {title}
                                </AppText>
                                <View className={`px-2 py-0.5 rounded-full border ${
                                    isDarkMode ? 'bg-blue-950/80 border-blue-900' : 'bg-blue-50 border-blue-100'
                                }`}>
                                    <AppText className="text-blue-400 font-bold text-xs">{percent}%</AppText>
                                </View>
                            </View>

                            <AppText className={`text-xs mt-0.5 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`} numberOfLines={1}>
                                {lessonsInfo} • {lastLesson}
                            </AppText>
                        </View>
                    </View>

                    {/* Progress Bar */}
                    <View className={`h-2 rounded-full overflow-hidden mb-3 ${isDarkMode ? 'bg-slate-800' : 'bg-slate-100'}`}>
                        <View className="h-full bg-blue-600 rounded-full" style={{ width: `${Math.min(100, Math.max(0, percent))}%` }} />
                    </View>

                    {/* CTA Button */}
                    <TouchableOpacity
                        onPress={() => handleCardPress(cardData)}
                        className="bg-blue-600 py-2 px-3 rounded-xl flex-row items-center justify-center"
                    >
                        <PlayCircle size={15} color="#ffffff" />
                        <AppText className="text-white text-xs font-bold ml-1.5">Tiếp tục học</AppText>
                    </TouchableOpacity>
                </TouchableOpacity>
            );
        }

        const isCourse = type === 'course';

        return (
            <TouchableOpacity
                key={key}
                activeOpacity={0.8}
                onPress={() => handleCardPress(cardData)}
                className={`mt-2.5 mb-2 border rounded-2xl p-3 shadow-xs ${
                    isDarkMode ? 'bg-slate-900 border-slate-700' : 'bg-white border-blue-100'
                }`}
            >
                <View className="flex-row items-start">
                    {hasThumb && (
                        <Image
                            source={{ uri: imgUrl }}
                            className={`w-12 h-12 rounded-xl mr-3 border ${
                                isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-slate-100 border-slate-100'
                            }`}
                            resizeMode="cover"
                        />
                    )}
                    <View className="flex-1">
                        <View className="flex-row items-center justify-between mb-1">
                            <View className="flex-row items-center flex-1 mr-2">
                                <View className={`w-5 h-5 rounded-full items-center justify-center mr-1.5 ${
                                    isDarkMode ? 'bg-blue-950' : 'bg-blue-100'
                                }`}>
                                    {isCourse ? (
                                        <BookOpen size={12} color="#3b82f6" />
                                    ) : (
                                        <MessageSquare size={12} color="#3b82f6" />
                                    )}
                                </View>
                                <AppText className="text-[11px] font-bold text-blue-400 flex-1" numberOfLines={1}>
                                    {category || 'Gnostica'}
                                </AppText>
                            </View>
                            {author ? (
                                <AppText className="text-[10px] text-slate-400 font-medium">{author}</AppText>
                            ) : null}
                        </View>

                        <AppText className={`font-bold text-xs leading-4 mb-1 ${isDarkMode ? 'text-slate-100' : 'text-slate-900'}`} numberOfLines={2}>
                            {title}
                        </AppText>

                        {info && info !== 'none' && info !== 'null' ? (
                            <AppText className={`text-[11px] mb-1.5 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`} numberOfLines={2}>
                                {info}
                            </AppText>
                        ) : null}
                    </View>
                </View>

                <View className={`flex-row items-center justify-between pt-1.5 mt-1 border-t ${
                    isDarkMode ? 'border-slate-800' : 'border-slate-100'
                }`}>
                    <AppText className="text-[10px] font-semibold text-blue-400">Xem chi tiết</AppText>
                    <ChevronRight size={14} color="#3b82f6" />
                </View>
            </TouchableOpacity>
        );
    };

    const renderMessageBody = (rawContent, isUser, isError) => {
        if (!rawContent) return null;

        let cleaned = rawContent.replace(/\/\*[\s\S]*?\*\//g, '').trim();
        const parts = cleaned.split(/(\[\[CARD:[^\]]+\]\])/g);

        return (
            <View>
                {parts.map((part, index) => {
                    const cardMatch = part.match(/\[\[CARD:(.*?)\|(.*?)\|(.*?)\|(.*?)\|(.*?)\|(.*?)\|(.*?)\]\]/);
                    if (cardMatch) {
                        const cardData = {
                            type: cardMatch[1],
                            id: cardMatch[2],
                            title: cardMatch[3],
                            info: cardMatch[4],
                            author: cardMatch[5],
                            category: cardMatch[6],
                            imgUrl: cardMatch[7]
                        };
                        return renderCard(cardData, `card-${index}`);
                    }

                    let textContent = part.replace(/\*\*/g, '').trim();
                    if (!textContent) return null;

                    return (
                        <AppText
                            key={`text-${index}`}
                            className={`text-sm leading-5 ${isUser ? 'text-white' : isError ? 'text-red-500' : (isDarkMode ? 'text-slate-100' : 'text-slate-800')}`}
                        >
                            {textContent}
                        </AppText>
                    );
                })}
            </View>
        );
    };

    const userAvatar = user?.avatarUrl || user?.avatar;

    const renderMessage = ({ item }) => {
        const isUser = item.role === 'user';

        return (
            <View className={`flex-row mb-4 px-4 ${isUser ? 'justify-end' : 'justify-start'}`}>
                {!isUser && (
                    <View className="w-8 h-8 rounded-full bg-blue-600 items-center justify-center mr-2 self-start mt-1 shadow-sm overflow-hidden">
                        <Bot size={18} color="#ffffff" />
                    </View>
                )}

                <View
                    className={`max-w-[82%] p-3.5 rounded-2xl ${
                        isUser
                            ? 'bg-blue-600 rounded-br-none shadow-sm'
                            : item.isError
                            ? (isDarkMode ? 'bg-red-950/80 border border-red-800' : 'bg-red-50 border border-red-200')
                            : (isDarkMode ? 'bg-slate-800 border border-slate-700/60 rounded-bl-none shadow-sm' : 'bg-white border border-slate-200 rounded-bl-none shadow-sm')
                    }`}
                >
                    {renderMessageBody(item.content, isUser, item.isError)}
                    {item.timestamp ? (
                        <AppText className={`text-[10px] mt-1.5 ${isUser ? 'text-blue-200 text-right' : 'text-slate-400'}`}>
                            {item.timestamp}
                        </AppText>
                    ) : null}
                </View>

                {isUser && (
                    <View className={`w-8 h-8 rounded-full items-center justify-center ml-2 self-start mt-1 overflow-hidden border ${
                        isDarkMode ? 'bg-slate-700 border-slate-600' : 'bg-slate-200 border-slate-200'
                    }`}>
                        {userAvatar ? (
                            <Image source={{ uri: userAvatar }} className="w-full h-full rounded-full" resizeMode="cover" />
                        ) : (
                            <User size={18} color={isDarkMode ? "#cbd5e1" : "#475569"} />
                        )}
                    </View>
                )}
            </View>
        );
    };

    return (
        <SafeAreaView className={`flex-1 ${isDarkMode ? 'bg-slate-900' : 'bg-slate-50'}`}>
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                className="flex-1"
                keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
            >
                {/* Header */}
                <View className={`border-b px-4 py-3 flex-row items-center justify-between shadow-sm ${
                    isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'
                }`}>
                    <View className="flex-row items-center">
                        <TouchableOpacity
                            onPress={() => navigation.goBack()}
                            className={`p-1.5 mr-2 rounded-full ${isDarkMode ? 'bg-slate-700' : 'bg-slate-100'}`}
                        >
                            <ChevronLeft size={22} color={isDarkMode ? '#f8fafc' : '#334155'} />
                        </TouchableOpacity>

                        <View className="flex-row items-center">
                            <LinearGradient
                                colors={['#3b82f6', '#1d4ed8']}
                                className="w-9 h-9 rounded-full items-center justify-center mr-2.5 overflow-hidden shadow-xs"
                            >
                                <Bot size={20} color="#ffffff" />
                            </LinearGradient>
                            <View>
                                <View className="flex-row items-center">
                                    <AppText className={`font-bold text-base mr-1.5 ${isDarkMode ? 'text-slate-100' : 'text-slate-900'}`}>Gnostica AI</AppText>
                                    <Sparkles size={14} color="#f59e0b" fill="#f59e0b" />
                                </View>
                                <View className="flex-row items-center mt-0.5">
                                    <View className={`w-2 h-2 rounded-full mr-1.5 ${quota.remaining > 0 ? 'bg-emerald-500' : 'bg-red-500'}`} />
                                    <AppText className={`text-xs font-medium ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>Còn {quota.remaining}/{quota.dailyLimit} lượt hôm nay</AppText>
                                </View>
                            </View>
                        </View>
                    </View>

                    {/* New Chat Button */}
                    <TouchableOpacity
                        onPress={handleNewChat}
                        className={`p-2 rounded-full border ${isDarkMode ? 'bg-blue-950/80 border-blue-900' : 'bg-blue-50 border-blue-200'}`}
                    >
                        <Plus size={18} color="#3b82f6" />
                    </TouchableOpacity>
                </View>

                {/* Message List */}
                <View className="flex-1">
                    <FlatList
                        ref={flatListRef}
                        data={messages}
                        keyExtractor={item => item.id}
                        renderItem={renderMessage}
                        contentContainerStyle={{ paddingVertical: 16 }}
                        ListHeaderComponent={
                            messages.length <= 2 ? (
                                <View className="px-4 mb-4">
                                    <AppText className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2.5">
                                        Gợi ý câu hỏi nhanh
                                    </AppText>
                                    <ScrollView horizontal showsHorizontalScrollIndicator={false} className="flex-row">
                                        {QUICK_PROMPTS.map(p => (
                                            <TouchableOpacity
                                                key={p.id}
                                                onPress={() => handleSendMessage(p.prompt)}
                                                className={`border rounded-xl p-3 mr-3 shadow-xs max-w-[220px] ${
                                                    isDarkMode ? 'bg-slate-800 border-slate-700/60' : 'bg-white border-blue-100'
                                                }`}
                                            >
                                                <AppText className={`font-semibold text-xs mb-1 ${isDarkMode ? 'text-blue-400' : 'text-blue-700'}`}>
                                                    {p.title}
                                                </AppText>
                                                <AppText className={`text-xs ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`} numberOfLines={2}>
                                                    {p.prompt}
                                                </AppText>
                                            </TouchableOpacity>
                                        ))}
                                    </ScrollView>
                                </View>
                            ) : null
                        }
                        ListFooterComponent={
                            isLoading ? (
                                <View className={`flex-row items-center ml-4 mb-4 p-3 rounded-2xl rounded-bl-none max-w-[120px] border ${
                                    isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'
                                }`}>
                                    <ActivityIndicator size="small" color="#2563eb" className="mr-2" />
                                    <AppText className={`text-xs ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>Đang trả lời...</AppText>
                                </View>
                            ) : null
                        }
                    />
                </View>

                {/* Input Bar */}
                <View className={`border-t px-4 py-3 flex-row items-center ${
                    isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'
                }`}>
                    <TextInput
                        className={`flex-1 px-4 py-2.5 rounded-full text-sm max-h-24 font-normal ${
                            isDarkMode ? 'bg-slate-700 text-slate-100' : 'bg-slate-100 text-slate-800'
                        }`}
                        placeholder="Đặt câu hỏi cho AI Gnostica..."
                        placeholderTextColor="#94a3b8"
                        value={inputMessage}
                        onChangeText={setInputMessage}
                        multiline
                        editable={!isLoading}
                    />

                    <TouchableOpacity
                        onPress={() => handleSendMessage()}
                        disabled={!inputMessage.trim() || isLoading}
                        className={`w-10 h-10 rounded-full items-center justify-center ml-2.5 ${
                            inputMessage.trim() && !isLoading ? 'bg-blue-600' : (isDarkMode ? 'bg-slate-700' : 'bg-slate-200')
                        }`}
                    >
                        <Send size={18} color={inputMessage.trim() && !isLoading ? '#ffffff' : '#94a3b8'} />
                    </TouchableOpacity>
                </View>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
};

export default AiChatScreen;
