import AppText from '../../components/ui/AppText';
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { View, ScrollView, TouchableOpacity, Dimensions, ActivityIndicator, Linking, TextInput, Alert, Image } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { ArrowLeft, Play, CheckCircle2, Circle, FileText, MessageCircle, Download, Send, X, CornerDownRight, Trash2, RefreshCw, HelpCircle, Check, XCircle, RotateCcw, Award, ChevronRight, ChevronLeft } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { clsx } from 'clsx';
import courseService from '../../services/course/courseService';
import lessonProgressService from '../../services/course/lessonProgressService';
import commentService from '../../services/forum/commentService';
import { useAuth } from '../../context/AuthContext';
import { BASE_URL } from '../../config/api';
import { WEB_ORIGIN } from '../../config/environment';
import VideoPlayer, { getEmbeddedVideoUrl } from '../../components/course/VideoPlayer';

const { width } = Dimensions.get('window');
const BUNNY_PLAYBACK_HEADERS = { Referer: WEB_ORIGIN };

const addReplyToTree = (list, parentId, newReply) => {
    return list.map(c => {
        if (c.id === parentId) {
            return {
                ...c,
                replies: [...(c.replies || []), newReply]
            };
        }
        if (c.replies && c.replies.length > 0) {
            return {
                ...c,
                replies: addReplyToTree(c.replies, parentId, newReply)
            };
        }
        return c;
    });
};

const removeCommentFromTree = (list, targetId) => {
    return list
        .filter(c => c.id !== targetId)
        .map(c => {
            if (c.replies && c.replies.length > 0) {
                return {
                    ...c,
                    replies: removeCommentFromTree(c.replies, targetId)
                };
            }
            return c;
        });
};

const stripHtml = (html) => {
    if (!html || typeof html !== 'string') return html || '';
    return html
        .replace(/<[^>]*>/g, '')
        .replace(/&nbsp;/gi, ' ')
        .replace(/&amp;/gi, '&')
        .replace(/&lt;/gi, '<')
        .replace(/&gt;/gi, '>')
        .replace(/&quot;/gi, '"')
        .replace(/&#39;/gi, "'")
        .trim();
};

const MobileQuizView = ({ quiz, onBack }) => {
    const [currentIdx, setCurrentIdx] = useState(0);
    const [selectedAnswers, setSelectedAnswers] = useState({});
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [resultScore, setResultScore] = useState(0);
    const [correctCount, setCorrectCount] = useState(0);

    const questions = useMemo(() => {
        if (!quiz?.questions) return [];
        return quiz.questions.map((q, idx) => {
            let optionsList = [];
            if (q.options && typeof q.options === 'object' && !Array.isArray(q.options)) {
                optionsList = Object.entries(q.options).map(([key, val]) => ({
                    key,
                    label: key,
                    text: stripHtml(typeof val === 'string' ? val : (val?.text || val?.content || String(val))),
                    isCorrect: q.correct === key
                }));
            } else if (Array.isArray(q.options)) {
                optionsList = q.options.map((opt, i) => {
                    if (typeof opt === 'string') {
                        const key = String.fromCharCode(65 + i);
                        return { key, label: key, text: stripHtml(opt), isCorrect: q.correct === key };
                    }
                    const key = opt.key || opt.id || opt.optionLabel || String.fromCharCode(65 + i);
                    return {
                        key,
                        label: key,
                        text: stripHtml(opt.text || opt.content || opt.val || ''),
                        isCorrect: q.correct === key || opt.isCorrect === true
                    };
                });
            } else if (Array.isArray(q.answers)) {
                optionsList = q.answers.map((ans, i) => ({
                    key: ans.id || ans.optionLabel || String.fromCharCode(65 + i),
                    label: ans.optionLabel || ans.id || String.fromCharCode(65 + i),
                    text: stripHtml(ans.content || ans.text || ''),
                    isCorrect: ans.isCorrect || q.correct === ans.id
                }));
            }

            return {
                id: q.id || `q-${idx}`,
                text: stripHtml(q.text || q.content || q.title || `Câu hỏi ${idx + 1}`),
                options: optionsList,
                correct: q.correct,
                explanation: stripHtml(q.explanation || q.explain),
                level: q.level
            };
        });
    }, [quiz?.questions]);

    if (!quiz || questions.length === 0) {
        return (
            <View className="p-6 bg-white rounded-2xl m-4 border border-slate-100 items-center justify-center py-12">
                <HelpCircle size={48} color="#94A3B8" />
                <AppText className="text-base font-bold text-slate-800 mt-4 text-center">
                    Chưa có câu hỏi cho bài tập này
                </AppText>
                <AppText className="text-xs text-slate-400 mt-1 text-center">
                    Nội dung bài tập đang được cập nhật. Vui lòng quay lại sau!
                </AppText>
                <TouchableOpacity 
                    onPress={onBack}
                    className="mt-6 bg-blue-600 px-6 py-2.5 rounded-xl flex-row items-center"
                >
                    <ArrowLeft size={16} color="#fff" />
                    <AppText className="text-white text-sm font-bold ml-2">Quay lại bài học</AppText>
                </TouchableOpacity>
            </View>
        );
    }

    const currentQuestion = questions[currentIdx];

    const handleSelectOption = (optionKey) => {
        if (isSubmitted) return;
        setSelectedAnswers(prev => ({
            ...prev,
            [currentQuestion.id]: optionKey
        }));
    };

    const handleSubmitQuiz = async () => {
        if (Object.keys(selectedAnswers).length === 0) {
            Alert.alert('Thông báo', 'Vui lòng chọn ít nhất 1 đáp án trước khi nộp bài!');
            return;
        }

        setSubmitting(true);
        try {
            let correct = 0;
            questions.forEach(q => {
                const selectedKey = selectedAnswers[q.id];
                const correctOpt = q.options.find(o => o.isCorrect || o.key === q.correct);
                if (selectedKey && ((correctOpt && selectedKey === correctOpt.key) || selectedKey === q.correct)) {
                    correct++;
                }
            });

            const score = Math.round((correct / questions.length) * 100);

            await lessonProgressService.submitQuiz(quiz.id, {
                point: score * 1.0,
                totalQuestions: questions.length,
                correctAnswers: correct
            });

            setCorrectCount(correct);
            setResultScore(score);
            setIsSubmitted(true);
        } catch (error) {
            console.error('Error submitting quiz:', error);
            Alert.alert('Lỗi', 'Không thể nộp bài tập lúc này. Vui lòng thử lại.');
        } finally {
            setSubmitting(false);
        }
    };

    const handleResetQuiz = () => {
        Alert.alert(
            'Làm lại bài tập',
            'Bạn có chắc chắn muốn xóa kết quả hiện tại để làm lại từ đầu không?',
            [
                { text: 'Hủy', style: 'cancel' },
                {
                    text: 'Làm lại',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await lessonProgressService.resetQuiz(quiz.id);
                            setIsSubmitted(false);
                            setSelectedAnswers({});
                            setResultScore(0);
                            setCorrectCount(0);
                            setCurrentIdx(0);
                        } catch (error) {
                            console.error('Error resetting quiz:', error);
                            Alert.alert('Lỗi', 'Không thể reset bài tập lúc này.');
                        }
                    }
                }
            ]
        );
    };

    const isPassed = resultScore >= 50;

    return (
        <View className="p-4 pb-12">
            {/* Result Header if Submitted */}
            {isSubmitted && (
                <View className={clsx(
                    'p-5 rounded-2xl mb-5 border items-center shadow-sm',
                    isPassed ? 'bg-emerald-50 border-emerald-200' : 'bg-amber-50 border-amber-200'
                )}>
                    <View className={clsx(
                        'w-12 h-12 rounded-full items-center justify-center mb-3',
                        isPassed ? 'bg-emerald-500' : 'bg-amber-500'
                    )}>
                        <Award size={24} color="#fff" />
                    </View>
                    <AppText className={clsx(
                        'text-lg font-bold text-center',
                        isPassed ? 'text-emerald-800' : 'text-amber-800'
                    )}>
                        {isPassed ? 'Chúc mừng! Bạn đã hoàn thành bài tập' : 'Chưa đạt điểm đỗ'}
                    </AppText>
                    <AppText className="text-xs text-slate-600 mt-1 text-center">
                        Kết quả: <AppText className="font-bold text-base">{resultScore}%</AppText> ({correctCount}/{questions.length} câu đúng)
                    </AppText>

                    <TouchableOpacity 
                        onPress={handleResetQuiz}
                        className="mt-4 bg-white px-4 py-2 rounded-xl border border-slate-200 flex-row items-center shadow-sm"
                    >
                        <RotateCcw size={16} color="#475569" />
                        <AppText className="text-slate-700 text-xs font-bold ml-2">Làm lại bài tập</AppText>
                    </TouchableOpacity>
                </View>
            )}

            {/* Quiz Progress Bar */}
            <View className="bg-white p-4 rounded-2xl border border-slate-100 mb-4 shadow-sm">
                <View className="flex-row justify-between items-center mb-2">
                    <AppText className="text-xs text-slate-500 font-medium">
                        Câu {currentIdx + 1} / {questions.length}
                    </AppText>
                    <AppText className="text-xs text-blue-600 font-bold">
                        Đã trả lời {Object.keys(selectedAnswers).length}/{questions.length}
                    </AppText>
                </View>
                <View className="h-2 bg-slate-100 rounded-full overflow-hidden">
                    <View 
                        className="h-full bg-blue-600 rounded-full" 
                        style={{ width: `${((currentIdx + 1) / questions.length) * 100}%` }}
                    />
                </View>
            </View>

            {/* Question Card */}
            <View className="bg-white p-5 rounded-2xl border border-slate-100 mb-5 shadow-sm">
                <View className="flex-row items-center justify-between mb-3">
                    <View className="bg-blue-50 px-2.5 py-1 rounded-lg">
                        <AppText className="text-blue-700 text-xs font-bold">
                            Câu hỏi {currentIdx + 1}
                        </AppText>
                    </View>
                    {currentQuestion.level && (
                        <AppText className="text-xs text-slate-400 capitalize">
                            Mức độ: {currentQuestion.level}
                        </AppText>
                    )}
                </View>

                <AppText className="text-slate-900 font-bold text-base mb-5 leading-6">
                    {currentQuestion.text}
                </AppText>

                {/* Options List */}
                <View className="gap-3">
                    {currentQuestion.options.map((opt) => {
                        const isSelected = selectedAnswers[currentQuestion.id] === opt.key;
                        const isCorrectOpt = opt.isCorrect || opt.key === currentQuestion.correct;
                        
                        let cardStyle = 'bg-slate-50 border-slate-200';
                        let badgeStyle = 'bg-slate-200 text-slate-700';

                        if (isSubmitted) {
                            if (isCorrectOpt) {
                                cardStyle = 'bg-emerald-50 border-emerald-400';
                                badgeStyle = 'bg-emerald-500 text-white';
                            } else if (isSelected && !isCorrectOpt) {
                                cardStyle = 'bg-red-50 border-red-400';
                                badgeStyle = 'bg-red-500 text-white';
                            }
                        } else if (isSelected) {
                            cardStyle = 'bg-blue-50 border-blue-500';
                            badgeStyle = 'bg-blue-600 text-white';
                        }

                        return (
                            <TouchableOpacity
                                key={opt.key}
                                disabled={isSubmitted}
                                onPress={() => handleSelectOption(opt.key)}
                                className={clsx(
                                    'p-4 rounded-xl border flex-row items-center justify-between',
                                    cardStyle
                                )}
                            >
                                <View className="flex-row items-center flex-1 mr-2">
                                    <View className={clsx(
                                        'w-7 h-7 rounded-lg items-center justify-center mr-3',
                                        badgeStyle
                                    )}>
                                        <AppText className="font-bold text-xs">
                                            {opt.label}
                                        </AppText>
                                    </View>
                                    <AppText className="text-sm font-medium text-slate-800 flex-1">
                                        {opt.text}
                                    </AppText>
                                </View>

                                {isSubmitted && isCorrectOpt && (
                                    <CheckCircle2 size={20} color="#10B981" />
                                )}
                                {isSubmitted && isSelected && !isCorrectOpt && (
                                    <XCircle size={20} color="#EF4444" />
                                )}
                            </TouchableOpacity>
                        );
                    })}
                </View>

                {/* Explanation section if submitted */}
                {isSubmitted && currentQuestion.explanation && (
                    <View className="mt-4 p-3.5 bg-blue-50 rounded-xl border border-blue-100">
                        <AppText className="text-xs font-bold text-blue-800 mb-1">
                            Giải thích đáp án:
                        </AppText>
                        <AppText className="text-xs text-blue-700 leading-5">
                            {currentQuestion.explanation}
                        </AppText>
                    </View>
                )}
            </View>

            {/* Navigation & Submit Controls */}
            <View className="flex-row items-center justify-between gap-3">
                <TouchableOpacity
                    disabled={currentIdx === 0}
                    onPress={() => setCurrentIdx(prev => Math.max(0, prev - 1))}
                    className={clsx(
                        'flex-1 py-3.5 rounded-xl border flex-row items-center justify-center',
                        currentIdx === 0 ? 'bg-slate-100 border-slate-200 opacity-50' : 'bg-white border-slate-200'
                    )}
                >
                    <ChevronLeft size={18} color="#475569" />
                    <AppText className="text-slate-700 text-sm font-bold ml-1">Câu trước</AppText>
                </TouchableOpacity>

                {currentIdx < questions.length - 1 ? (
                    <TouchableOpacity
                        onPress={() => setCurrentIdx(prev => Math.min(questions.length - 1, prev + 1))}
                        className="flex-1 py-3.5 rounded-xl bg-blue-600 flex-row items-center justify-center shadow-sm"
                    >
                        <AppText className="text-white text-sm font-bold mr-1">Câu tiếp</AppText>
                        <ChevronRight size={18} color="#fff" />
                    </TouchableOpacity>
                ) : !isSubmitted ? (
                    <TouchableOpacity
                        onPress={handleSubmitQuiz}
                        disabled={submitting}
                        className="flex-1 py-3.5 rounded-xl bg-emerald-600 flex-row items-center justify-center shadow-sm"
                    >
                        {submitting ? (
                            <ActivityIndicator size="small" color="#fff" />
                        ) : (
                            <>
                                <Check size={18} color="#fff" />
                                <AppText className="text-white text-sm font-bold ml-1">Nộp bài tập</AppText>
                            </>
                        )}
                    </TouchableOpacity>
                ) : (
                    <TouchableOpacity
                        onPress={handleResetQuiz}
                        className="flex-1 py-3.5 rounded-xl bg-slate-800 flex-row items-center justify-center shadow-sm"
                    >
                        <RotateCcw size={18} color="#fff" />
                        <AppText className="text-white text-sm font-bold ml-1">Làm lại</AppText>
                    </TouchableOpacity>
                )}
            </View>
        </View>
    );
};

const LearningScreen = () => {
    const navigation = useNavigation();
    const route = useRoute();
    const insets = useSafeAreaInsets();
    const { user } = useAuth();
    const initialCourse = route.params?.course;

    const [courseDetail, setCourseDetail] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('curriculum');
    const [activeLesson, setActiveLesson] = useState(null);
    const [activeQuiz, setActiveQuiz] = useState(null);
    const [isLessonPlayerOpen, setIsLessonPlayerOpen] = useState(false);
    const [playback, setPlayback] = useState({ lessonId: null, source: null, embedSource: null, loading: false, error: null });

    // Q&A state
    const [comments, setComments] = useState([]);
    const [loadingComments, setLoadingComments] = useState(false);
    const [commentText, setCommentText] = useState('');
    const [replyTarget, setReplyTarget] = useState(null);
    const [submittingComment, setSubmittingComment] = useState(false);

    const TABS = [
        { key: 'curriculum', label: 'Nội dung' },
        { key: 'materials',  label: 'Tài liệu' },
        { key: 'qa',         label: 'Hỏi đáp' },
    ];

    const slug = initialCourse?.slug || initialCourse?.courseSlug;

    useEffect(() => {
        const fetchCourseContent = async () => {
            if (!slug) {
                const fallbackModules = initialCourse?.modules || initialCourse?.curriculum || [];
                if (fallbackModules.length > 0 && fallbackModules[0]?.lessons?.length > 0) {
                    setActiveLesson(fallbackModules[0].lessons[0]);
                }
                setLoading(false);
                return;
            }

            try {
                setLoading(true);
                const response = await courseService.getBySlug(slug);
                const detail = response?.data || response;
                setCourseDetail(detail);

                const modulesList = detail?.modules || initialCourse?.modules || initialCourse?.curriculum || [];
                if (modulesList.length > 0) {
                    for (const mod of modulesList) {
                        const lessons = mod.lessons || [];
                        if (lessons.length > 0) {
                            setActiveLesson(lessons[0]);
                            break;
                        }
                    }
                }
            } catch (error) {
                console.error('Error loading course learning content:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchCourseContent();
    }, [slug]);

    const fetchLessonComments = useCallback(async () => {
        if (!activeLesson?.id) return;
        setLoadingComments(true);
        try {
            const res = await commentService.getByTarget('LESSON', activeLesson.id);
            const data = res?.data || res?.content || res;
            if (Array.isArray(data)) {
                setComments(data);
            } else if (data?.content && Array.isArray(data.content)) {
                setComments(data.content);
            } else {
                setComments([]);
            }
        } catch (error) {
            console.error('Error fetching lesson comments:', error);
            setComments([]);
        } finally {
            setLoadingComments(false);
        }
    }, [activeLesson?.id]);

    useEffect(() => {
        if (activeLesson?.id && activeTab === 'qa') {
            fetchLessonComments();
            setReplyTarget(null);
            setCommentText('');
        }
    }, [activeLesson?.id, activeTab, fetchLessonComments]);

    const handleSendLessonComment = async () => {
        if (!user) {
            Alert.alert('Thông báo', 'Vui lòng đăng nhập để bình luận hoặc đặt câu hỏi.');
            return;
        }
        if (!commentText.trim() || !activeLesson?.id) return;

        setSubmittingComment(true);
        try {
            const payload = {
                content: commentText.trim(),
                targetType: 'LESSON',
                targetId: String(activeLesson.id),
                userEmail: user.email,
                ...(replyTarget?.id && { parentId: replyTarget.id })
            };
            const res = await commentService.create(payload);
            const rawRes = res?.data || res;
            const createdId = rawRes?.id || `temp-${Date.now()}`;
            const userName = user.fullName || user.name || (user.email ? user.email.split('@')[0] : 'Học viên');

            let created;
            if (typeof rawRes === 'object' && rawRes !== null && rawRes.id) {
                created = {
                    ...rawRes,
                    id: createdId,
                    account: rawRes.account || { fullName: userName, email: user.email, avatarUrl: user.avatarUrl }
                };
            } else {
                created = {
                    id: createdId,
                    content: commentText.trim(),
                    authorName: userName,
                    account: { fullName: userName, email: user.email, avatarUrl: user.avatarUrl },
                    createdAt: new Date().toISOString(),
                    parent: replyTarget ? { id: replyTarget.id } : null
                };
            }

            if (replyTarget?.id) {
                setComments(prev => addReplyToTree(prev, replyTarget.id, created));
            } else {
                setComments(prev => [created, ...prev]);
            }

            setCommentText('');
            setReplyTarget(null);
        } catch (error) {
            console.error('Error adding lesson comment:', error);
            Alert.alert('Lỗi', error?.message || 'Không thể gửi bình luận lúc này.');
        } finally {
            setSubmittingComment(false);
        }
    };

    const handleDeleteLessonComment = (commentId) => {
        if (!user?.email) return;
        Alert.alert(
            'Xác nhận xóa',
            'Bạn có chắc chắn muốn xóa câu hỏi/bình luận này?',
            [
                { text: 'Hủy', style: 'cancel' },
                {
                    text: 'Xóa',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await commentService.delete(commentId, user.email);
                            setComments(prev => removeCommentFromTree(prev, commentId));
                        } catch (error) {
                            console.error('Error deleting comment:', error);
                            Alert.alert('Lỗi', error?.message || 'Không thể xóa câu hỏi lúc này.');
                        }
                    }
                }
            ]
        );
    };

    useEffect(() => {
        let cancelled = false;
        const lessonId = activeLesson?.id;
        const storedVideoUrl = activeLesson?.videoUrl;

        setIsLessonPlayerOpen(false);

        if (!lessonId || !storedVideoUrl) {
            setPlayback({ lessonId: lessonId || null, source: null, embedSource: null, loading: false, error: null });
            return undefined;
        }

        setPlayback({ lessonId, source: null, embedSource: null, loading: true, error: null });
        courseService.getLessonPlayback(lessonId)
            .then((response) => {
                const data = response?.data || response;
                if (!data?.sourceUrl) throw new Error('Server did not return a playable video URL');
                if (!cancelled) setPlayback({
                    lessonId,
                    source: data.sourceUrl,
                    embedSource: data.embedUrl || null,
                    loading: false,
                    error: null
                });
            })
            .catch((error) => {
                console.error('Unable to resolve lesson video playback:', error);
                if (!cancelled) setPlayback({
                    lessonId,
                    source: null,
                    embedSource: null,
                    loading: false,
                    error: 'Không thể tải luồng video. Vui lòng thử lại sau.'
                });
            });

        return () => {
            cancelled = true;
        };
    }, [activeLesson?.id, activeLesson?.videoUrl]);

    const videoSource = playback.lessonId === activeLesson?.id ? playback.source : null;
    // Lesson delivery uses the server-resolved HLS URL and explicit CDN
    // authorisation headers. Bunny's nested iframe requests cannot inherit
    // those headers in Android WebView, so keep native HLS as the reliable
    // learning player.
    const playerSource = videoSource;
    const hasPlayableVideo = Boolean(playerSource && (getEmbeddedVideoUrl(playerSource) || playerSource));

    const modulesList = useMemo(() => {
        return courseDetail?.modules || initialCourse?.modules || initialCourse?.curriculum || [];
    }, [courseDetail, initialCourse]);

    const getFullFileUrl = useCallback((url) => {
        if (!url) return null;
        if (url.startsWith('http://') || url.startsWith('https://')) return url;
        const host = BASE_URL.replace('/api', '');
        return `${host}${url.startsWith('/') ? '' : '/'}${url}`;
    }, []);

    const allAttachments = useMemo(() => {
        const list = [];
        const processAtt = (att, defaultTitle) => {
            if (!att) return;
            if (typeof att === 'string') {
                const fullUrl = getFullFileUrl(att);
                if (fullUrl) {
                    list.push({
                        id: att,
                        fileName: att.split('/').pop() || 'Tài liệu',
                        fileUrl: fullUrl,
                        fileType: 'DOCUMENT',
                        moduleTitle: defaultTitle
                    });
                }
            } else if (typeof att === 'object') {
                const rawUrl = att.fileUrl || att.url || att.path;
                const fullUrl = getFullFileUrl(rawUrl);
                if (fullUrl || att.fileName) {
                    list.push({
                        ...att,
                        fileName: att.fileName || (rawUrl ? rawUrl.split('/').pop() : 'Tài liệu đính kèm'),
                        fileUrl: fullUrl || rawUrl,
                        fileType: att.fileType || 'DOCUMENT',
                        moduleTitle: defaultTitle
                    });
                }
            }
        };

        // Course level attachments
        if (courseDetail?.attachments) {
            if (Array.isArray(courseDetail.attachments)) {
                courseDetail.attachments.forEach(att => processAtt(att, 'Tài liệu khóa học'));
            } else {
                processAtt(courseDetail.attachments, 'Tài liệu khóa học');
            }
        }

        // Module & Lesson level attachments
        modulesList.forEach((mod) => {
            const modTitle = mod.title || mod.section || 'Chương';
            if (mod.attachments) {
                if (Array.isArray(mod.attachments)) {
                    mod.attachments.forEach(att => processAtt(att, modTitle));
                } else {
                    processAtt(mod.attachments, modTitle);
                }
            }
            (mod.lessons || []).forEach((lesson) => {
                const lessonTitle = `${modTitle} • ${lesson.title}`;
                if (lesson.attachments) {
                    if (Array.isArray(lesson.attachments)) {
                        lesson.attachments.forEach(att => processAtt(att, lessonTitle));
                    } else {
                        processAtt(lesson.attachments, lessonTitle);
                    }
                }
                if (lesson.attachmentUrl) {
                    processAtt(lesson.attachmentUrl, lessonTitle);
                }
                if (lesson.fileUrl && !lesson.videoUrl) {
                    processAtt(lesson.fileUrl, lessonTitle);
                }
            });
        });

        return list;
    }, [courseDetail, modulesList, getFullFileUrl]);

    const renderCommentItem = (comment, depth = 0, parentAuthorName = null, index = 0) => {
        const commentAuthor = comment.account?.fullName || comment.account?.name || comment.account?.username || comment.authorName || (comment.userEmail ? comment.userEmail.split('@')[0] : 'Học viên');
        const commentDate = comment.createdAt ? new Date(comment.createdAt).toLocaleDateString('vi-VN') : (comment.time || 'Vừa xong');
        const commentAvatar = comment.account?.avatarUrl || comment.authorAvatar;
        const itemKey = comment?.id != null ? `comment-${comment.id}` : `comment-depth${depth}-idx${index}-${Math.random()}`;

        const commentEmail = comment.account?.email || comment.userEmail;
        const isCommentOwner = user?.email && commentEmail && user.email.toLowerCase() === commentEmail.toLowerCase();

        const indentClass = depth > 0 
            ? (depth === 1 ? 'ml-3 pl-3 border-l-2 border-blue-400 bg-blue-50/40' : 'ml-2 pl-2 border-l-2 border-slate-300 bg-slate-100/50') 
            : 'bg-white border border-slate-100 shadow-sm';

        return (
            <View key={itemKey} className={`mb-3 p-3.5 rounded-2xl ${indentClass}`}>
                <View className="flex-row justify-between items-center mb-1.5">
                    <View className="flex-row items-center gap-2 flex-wrap">
                        {depth > 0 && <CornerDownRight size={14} color="#3b82f6" />}
                        <View className="w-7 h-7 rounded-full bg-blue-100 items-center justify-center overflow-hidden">
                            {commentAvatar ? (
                                <Image source={{ uri: commentAvatar }} className="w-full h-full" />
                            ) : (
                                <AppText className="text-blue-600 font-bold text-[11px]">{commentAuthor.substring(0, 2).toUpperCase()}</AppText>
                            )}
                        </View>
                        <AppText className="text-slate-900 font-bold text-xs">{commentAuthor}</AppText>
                        {parentAuthorName && (
                            <View className="bg-blue-100 px-1.5 py-0.5 rounded">
                                <AppText className="text-blue-700 text-[10px] font-semibold">@{parentAuthorName}</AppText>
                            </View>
                        )}
                    </View>
                    <AppText className="text-slate-400 text-[10px]">{commentDate}</AppText>
                </View>

                <AppText className="text-slate-700 text-sm mb-2">{comment.content}</AppText>

                {/* Action Buttons: Reply & Delete */}
                <View className="flex-row items-center gap-4 mt-1 pt-1">
                    <TouchableOpacity 
                        className="flex-row items-center self-start" 
                        onPress={() => setReplyTarget({ id: comment.id, authorName: commentAuthor })}
                    >
                        <MessageCircle size={14} color="#2563eb" />
                        <AppText className="text-blue-600 text-xs font-semibold ml-1">Trả lời</AppText>
                    </TouchableOpacity>

                    {isCommentOwner && (
                        <TouchableOpacity 
                            className="flex-row items-center self-start" 
                            onPress={() => handleDeleteLessonComment(comment.id)}
                        >
                            <Trash2 size={14} color="#ef4444" />
                            <AppText className="text-red-500 text-xs font-semibold ml-1">Xóa</AppText>
                        </TouchableOpacity>
                    )}
                </View>

                {/* Render nested replies recursively */}
                {comment.replies && comment.replies.length > 0 && (
                    <View className="mt-3">
                        {comment.replies.map((replyItem, idx) => renderCommentItem(replyItem, depth + 1, commentAuthor, idx))}
                    </View>
                )}
            </View>
        );
    };

    if (!initialCourse && !courseDetail) return null;

    const displayTitle = courseDetail?.title || initialCourse?.title || initialCourse?.courseTitle || 'Khóa học';

    return (
        <View className="flex-1 bg-white">
            {/* Header + Video Player / Quiz Header */}
            <View className="bg-slate-900 pb-0" style={{ paddingTop: Math.max(insets.top, 20) + 12 }}>
                {/* Navbar */}
                <View className="flex-row items-center px-5 mb-3">
                    <TouchableOpacity onPress={() => navigation.goBack()} className="p-1">
                        <ArrowLeft size={24} color="#ffffff" />
                    </TouchableOpacity>
                    <AppText className="flex-1 text-white text-base font-bold ml-3" numberOfLines={1}>
                        {displayTitle}
                    </AppText>
                </View>

                {/* Video Player Area or Quiz Banner Header */}
                {activeQuiz ? (
                    <View className="px-5 py-4 bg-indigo-900 flex-row items-center justify-between border-t border-indigo-800">
                        <View className="flex-1 mr-3">
                            <View className="flex-row items-center gap-2 mb-1">
                                <View className="bg-indigo-500 px-2 py-0.5 rounded">
                                    <AppText className="text-white text-[10px] font-bold">BÀI KIỂM TRA</AppText>
                                </View>
                                <AppText className="text-indigo-200 text-xs">
                                    {(activeQuiz.questions?.length || 0)} câu hỏi
                                </AppText>
                            </View>
                            <AppText className="text-white text-base font-bold" numberOfLines={1}>
                                {stripHtml(activeQuiz.title) || 'Bài tập trắc nghiệm'}
                            </AppText>
                        </View>
                        <TouchableOpacity
                            onPress={() => {
                                setActiveQuiz(null);
                                if (!activeLesson && modulesList[0]?.lessons?.length > 0) {
                                    setActiveLesson(modulesList[0].lessons[0]);
                                }
                            }}
                            className="bg-indigo-700 px-3 py-1.5 rounded-xl border border-indigo-500 flex-row items-center"
                        >
                            <Play size={14} color="#fff" />
                            <AppText className="text-white text-xs font-bold ml-1.5">Xem video</AppText>
                        </TouchableOpacity>
                    </View>
                ) : (
                    <>
                        <View
                            className="bg-black items-center justify-center"
                            style={{ width, height: width * 0.5625, overflow: 'hidden' }}
                        >
                            {loading || playback.loading ? (
                                <ActivityIndicator size="large" color="#2563EB" />
                            ) : hasPlayableVideo && isLessonPlayerOpen ? (
                                <VideoPlayer
                                    key={activeLesson?.id}
                                    style={{ width, height: width * 0.5625 }}
                                    source={activeLesson?.videoUrl || playerSource}
                                    fallbackSource={videoSource}
                                    embedUrl={playback.embedSource}
                                    requestHeaders={BUNNY_PLAYBACK_HEADERS}
                                    autoplay
                                />
                            ) : hasPlayableVideo ? (
                                <TouchableOpacity
                                    onPress={() => setIsLessonPlayerOpen(true)}
                                    activeOpacity={0.85}
                                    className="items-center justify-center w-full h-full"
                                    accessibilityRole="button"
                                    accessibilityLabel="Phát video bài học"
                                >
                                    <View className="w-14 h-14 rounded-full bg-violet-500 items-center justify-center">
                                        <Play size={28} color="#fff" fill="#fff" />
                                    </View>
                                    <AppText className="text-white font-semibold mt-3">Phát bài học</AppText>
                                </TouchableOpacity>
                            ) : (
                                <View className="items-center justify-center px-4">
                                    <AppText className="text-white text-sm font-medium text-center">
                                        {activeLesson ? 'Bài học này chưa có Video' : 'Video không khả dụng'}
                                    </AppText>
                                    {activeLesson && (
                                        <AppText className="text-slate-400 text-xs mt-1 text-center" numberOfLines={1}>
                                            {activeLesson.title}
                                        </AppText>
                                    )}
                                </View>
                            )}
                        </View>
                        
                        {activeLesson && (
                            <View className="px-5 py-3 bg-slate-800">
                                <AppText className="text-white text-base font-bold" numberOfLines={1}>
                                    {activeLesson.title}
                                </AppText>
                            </View>
                        )}
                    </>
                )}
            </View>

            {/* Content Tabs (Hidden when in Quiz mode to focus on Quiz questions) */}
            {!activeQuiz && (
                <View className="flex-row border-b border-slate-100 bg-white">
                    {TABS.map(tab => (
                        <TouchableOpacity
                            key={tab.key}
                            className={clsx(
                                'flex-1 items-center py-3.5 border-b-2',
                                activeTab === tab.key ? 'border-blue-600' : 'border-transparent',
                            )}
                            onPress={() => setActiveTab(tab.key)}
                        >
                            <AppText className={clsx(
                                'text-sm font-semibold',
                                activeTab === tab.key ? 'text-blue-600' : 'text-slate-500',
                            )}>
                                {tab.label}
                            </AppText>
                        </TouchableOpacity>
                    ))}
                </View>
            )}

            {/* Tab Views or Mobile Quiz View */}
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ flexGrow: 1, backgroundColor: '#F8FAFC' }}>
                {loading ? (
                    <View className="flex-1 items-center justify-center py-20">
                        <ActivityIndicator size="large" color="#2563EB" />
                        <AppText className="text-xs text-slate-400 mt-2">Đang tải nội dung khóa học...</AppText>
                    </View>
                ) : activeQuiz ? (
                    <MobileQuizView quiz={activeQuiz} onBack={() => setActiveQuiz(null)} />
                ) : (
                    <>
                        {activeTab === 'curriculum' && (
                            <View className="pb-10">
                                {modulesList.length === 0 ? (
                                    <View className="items-center justify-center p-8 bg-white m-5 rounded-2xl border border-slate-100">
                                        <AppText className="text-slate-500 text-sm">Chưa có bài học nào trong khóa học này.</AppText>
                                    </View>
                                ) : (
                                    modulesList.map((section, secIdx) => (
                                        <View key={section.id || secIdx} className="bg-white mb-2 border-b border-slate-100">
                                            <View className="p-4 bg-slate-50">
                                                <AppText className="text-[13px] text-slate-500 font-medium mb-1">
                                                    Chương {secIdx + 1}
                                                </AppText>
                                                <AppText className="text-[15px] font-bold text-slate-800">
                                                    {section.title || section.section}
                                                </AppText>
                                            </View>
                                            
                                            {(section.lessons || []).map((lesson, lessIdx) => {
                                                const isCurrent = !activeQuiz && activeLesson?.id === lesson.id;
                                                const isCompleted = false;

                                                return (
                                                    <TouchableOpacity
                                                        key={lesson.id || lessIdx}
                                                        onPress={() => {
                                                            setActiveLesson(lesson);
                                                            setActiveQuiz(null);
                                                        }}
                                                        className={clsx(
                                                            'flex-row items-center p-4 border-b border-slate-100',
                                                            isCurrent ? 'bg-blue-50' : 'bg-white',
                                                        )}
                                                    >
                                                        <View className="mr-3">
                                                            {isCompleted
                                                                ? <CheckCircle2 size={22} color="#10B981" />
                                                                : isCurrent
                                                                    ? <Play size={22} color="#2563EB" />
                                                                    : <Circle size={22} color="#CBD5E1" />
                                                            }
                                                        </View>
                                                        <View className="flex-1">
                                                            <AppText className={clsx(
                                                                'text-sm text-slate-800',
                                                                isCurrent ? 'font-bold text-blue-700' : 'font-medium',
                                                            )}>
                                                                {lesson.title}
                                                            </AppText>
                                                            <AppText className="text-xs text-slate-400 mt-1">
                                                                {lesson.videoUrl ? 'Video' : 'Văn bản'}
                                                            </AppText>
                                                        </View>
                                                    </TouchableOpacity>
                                                );
                                            })}

                                            {/* Chapter Quiz / Câu hỏi bài tập trắc nghiệm */}
                                            {section.quiz && (
                                                <TouchableOpacity
                                                    onPress={() => {
                                                        setActiveQuiz(section.quiz);
                                                        setActiveLesson(null);
                                                    }}
                                                    className={clsx(
                                                        'flex-row items-center p-4 border-b border-slate-100',
                                                        activeQuiz?.id === section.quiz.id ? 'bg-indigo-50 border-indigo-200' : 'bg-white',
                                                    )}
                                                >
                                                    <View className="mr-3 w-8 h-8 rounded-full bg-indigo-100 items-center justify-center">
                                                        <HelpCircle size={18} color="#4F46E5" />
                                                    </View>
                                                    <View className="flex-1">
                                                        <View className="flex-row items-center gap-2">
                                                            <AppText className={clsx(
                                                                'text-sm font-bold',
                                                                activeQuiz?.id === section.quiz.id ? 'text-indigo-700' : 'text-slate-800',
                                                            )}>
                                                                {stripHtml(section.quiz.title) || 'Bài tập kiểm tra'}
                                                            </AppText>
                                                            <View className="bg-indigo-100 px-2 py-0.5 rounded-full">
                                                                <AppText className="text-[10px] font-bold text-indigo-700">Quiz</AppText>
                                                            </View>
                                                        </View>
                                                        <AppText className="text-xs text-slate-400 mt-1">
                                                            {(section.quiz.questions?.length || 0)} câu hỏi trắc nghiệm
                                                        </AppText>
                                                    </View>
                                                    <ChevronRight size={18} color="#94A3B8" />
                                                </TouchableOpacity>
                                            )}
                                        </View>
                                    ))
                                )}
                            </View>
                        )}

                        {activeTab === 'materials' && (
                            <View className="p-5">
                                {allAttachments.length === 0 ? (
                                    <View className="bg-white p-8 rounded-2xl border border-slate-100 items-center">
                                        <FileText size={40} color="#CBD5E1" />
                                        <AppText className="text-sm font-semibold text-slate-700 text-center mt-3">
                                            Chưa có tài liệu đính kèm
                                        </AppText>
                                        <AppText className="text-xs text-slate-400 text-center mt-1">
                                            Khóa học này hiện chưa cập nhật tập tin đính kèm cho bài học hoặc chương.
                                        </AppText>
                                    </View>
                                ) : (
                                    allAttachments.map((att, idx) => (
                                        <TouchableOpacity
                                            key={att.id || `att-${idx}`}
                                            onPress={() => {
                                                if (att.fileUrl) {
                                                    Linking.openURL(att.fileUrl).catch(() => {
                                                        Alert.alert('Lỗi', 'Không thể mở tập tin đính kèm này.');
                                                    });
                                                }
                                            }}
                                            className="bg-white p-4 rounded-2xl border border-slate-100 mb-3 flex-row items-center justify-between shadow-sm"
                                        >
                                            <View className="flex-row items-center flex-1 mr-3">
                                                <View className="w-10 h-10 rounded-xl bg-blue-50 items-center justify-center mr-3">
                                                    <FileText size={22} color="#2563EB" />
                                                </View>
                                                <View className="flex-1">
                                                    <AppText className="text-sm font-bold text-slate-800" numberOfLines={1}>
                                                        {att.fileName || `Tài liệu ${idx + 1}`}
                                                    </AppText>
                                                    <AppText className="text-xs text-slate-400 mt-0.5" numberOfLines={1}>
                                                        {att.moduleTitle}
                                                    </AppText>
                                                </View>
                                            </View>
                                            <View className="w-8 h-8 rounded-full bg-slate-100 items-center justify-center">
                                                <Download size={18} color="#2563EB" />
                                            </View>
                                        </TouchableOpacity>
                                    ))
                                )}
                            </View>
                        )}

                        {activeTab === 'qa' && (
                            <View className="p-4 pb-12">
                                {/* Lesson Q&A Header */}
                                <View className="bg-white p-4 rounded-2xl border border-slate-100 mb-4 flex-row items-center justify-between shadow-sm">
                                    <View className="flex-1 mr-2">
                                        <AppText className="text-slate-900 font-bold text-base">
                                            Hỏi đáp bài học
                                        </AppText>
                                        <AppText className="text-xs text-slate-500 mt-0.5" numberOfLines={1}>
                                            {activeLesson ? activeLesson.title : 'Chọn bài học để thảo luận'}
                                        </AppText>
                                    </View>
                                    <TouchableOpacity 
                                        onPress={fetchLessonComments} 
                                        className="p-2.5 bg-slate-50 rounded-xl border border-slate-100 flex-row items-center"
                                    >
                                        <RefreshCw size={16} color="#475569" />
                                    </TouchableOpacity>
                                </View>

                                {/* Input box */}
                                <View className="bg-white p-3.5 rounded-2xl border border-slate-100 mb-5 shadow-sm">
                                    {replyTarget && (
                                        <View className="flex-row justify-between items-center bg-blue-50 px-3 py-1.5 rounded-lg mb-2">
                                            <AppText className="text-xs text-blue-700 font-medium">
                                                Đang trả lời <AppText className="font-bold">@{replyTarget.authorName}</AppText>
                                            </AppText>
                                            <TouchableOpacity onPress={() => setReplyTarget(null)}>
                                                <X size={14} color="#1d4ed8" />
                                            </TouchableOpacity>
                                        </View>
                                    )}
                                    <View className="flex-row items-center gap-2">
                                        <TextInput
                                            placeholder={replyTarget ? `Trả lời ${replyTarget.authorName}...` : "Đặt câu hỏi hoặc thảo luận..."}
                                            placeholderTextColor="#94A3B8"
                                            className="flex-1 bg-slate-50 rounded-xl px-3.5 py-2.5 text-sm text-slate-800"
                                            value={commentText}
                                            onChangeText={setCommentText}
                                            multiline
                                        />
                                        <TouchableOpacity 
                                            className="bg-blue-600 w-10 h-10 rounded-xl items-center justify-center shadow-sm"
                                            onPress={handleSendLessonComment}
                                            disabled={submittingComment}
                                        >
                                            {submittingComment ? <ActivityIndicator size="small" color="#fff" /> : <Send size={18} color="#fff" />}
                                        </TouchableOpacity>
                                    </View>
                                </View>

                                {/* List of comments */}
                                {loadingComments ? (
                                    <View className="items-center justify-center py-10">
                                        <ActivityIndicator size="small" color="#2563EB" />
                                        <AppText className="text-xs text-slate-400 mt-2">Đang tải thảo luận...</AppText>
                                    </View>
                                ) : comments.length === 0 ? (
                                    <View className="bg-white p-8 rounded-2xl border border-slate-100 items-center justify-center">
                                        <MessageCircle size={40} color="#CBD5E1" />
                                        <AppText className="text-sm font-semibold text-slate-700 mt-3 text-center">
                                            Chưa có câu hỏi nào
                                        </AppText>
                                        <AppText className="text-xs text-slate-400 text-center mt-1">
                                            Hãy đặt câu hỏi đầu tiên về bài học này để giảng viên và cộng đồng hỗ trợ bạn!
                                        </AppText>
                                    </View>
                                ) : (
                                    <View>
                                        {comments.map((comment, index) => renderCommentItem(comment, 0, null, index))}
                                    </View>
                                )}
                            </View>
                        )}
                    </>
                )}
            </ScrollView>
        </View>
    );
};

export default LearningScreen;
