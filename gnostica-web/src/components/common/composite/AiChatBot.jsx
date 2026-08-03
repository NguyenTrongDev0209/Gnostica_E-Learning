import React, { useState, useEffect, useRef } from 'react';
import {
    MessageCircle, X, Send, Bot, User, Loader2, Minimize2, Maximize2,
    ThumbsUp, Folder, Image as ImageIcon, Paperclip, CheckCircle, UploadCloud, Ticket
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { sendChatMessage, uploadChatImage } from '@/services/admin/aiService';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import useAuthStore from '@/store/useAuthStore';

const FAQS = [
    { id: '1', text: 'Tìm kiếm khóa học Java' },
    { id: '2', text: 'Xem các bài viết nổi bật' },
    { id: '3', text: 'Thành viên đóng góp tích cực nhất' },
    { id: '4', text: 'Chuyên mục thảo luận diễn đàn' }
];

/**
 * Component khung Upload tối đa 3 ảnh trực tiếp trong chat.
 * Tự động gửi thông tin ảnh và tạo yêu cầu tới Admin khi người dùng bấm gửi.
 */
const ImageUploadWidget = ({ onSubmitted }) => {
    const currentUser = useAuthStore((state) => state.user);
    const [supportContent, setSupportContent] = useState('');
    const [uploading, setUploading] = useState(false);
    const [urls, setUrls] = useState([]);
    const [isSubmitted, setIsSubmitted] = useState(false);
    const fileInputRef = useRef(null);

    if (!currentUser) {
        return (
            <div className="mt-3 bg-amber-50 border border-amber-200 rounded-xl p-3 text-center text-xs font-semibold text-amber-800 flex items-center justify-center gap-2">
                <span>Vui lòng <Link to="/login" className="text-primary font-bold hover:underline">Đăng nhập</Link> để gửi Yêu cầu hỗ trợ tới Admin.</span>
            </div>
        );
    }

    const handleFileChange = async (e) => {
        const files = Array.from(e.target.files || []);
        if (!files.length) return;

        const remainingSlots = 3 - urls.length;
        if (remainingSlots <= 0) {
            toast.error('Bạn chỉ được chọn tối đa 3 ảnh minh họa.');
            return;
        }

        const selectedFiles = files.slice(0, remainingSlots);
        setUploading(true);

        try {
            const uploadPromises = selectedFiles.map(file => uploadChatImage(file));
            const newUrls = await Promise.all(uploadPromises);
            setUrls(prev => [...prev, ...newUrls].slice(0, 3));
            toast.success(`Đã tải lên thành công ${newUrls.length} ảnh!`);
        } catch (error) {
            console.error('Lỗi khi tải ảnh lên:', error);
            toast.error('Không thể tải một số ảnh lên, vui lòng thử lại.');
        } finally {
            setUploading(false);
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    };

    const handleRemoveImage = (indexToRemove) => {
        setUrls(prev => prev.filter((_, idx) => idx !== indexToRemove));
    };

    const handleConfirmSubmit = () => {
        if (isSubmitted) return;
        setIsSubmitted(true);
        if (onSubmitted) {
            onSubmitted(urls, supportContent);
        }
    };

    if (isSubmitted) {
        return (
            <div className="mt-3 bg-emerald-50 border border-emerald-200 rounded-xl p-3 text-center text-xs font-semibold text-emerald-700 flex items-center justify-center gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Đã gửi thông tin minh chứng & chuyển yêu cầu tới Admin.</span>
            </div>
        );
    }

    return (
        <div className="mt-3 bg-gradient-to-br from-primary/5 to-purple-500/5 border-2 border-dashed border-primary/40 rounded-xl p-3.5 flex flex-col items-center justify-center text-center transition-all duration-200">
            <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept="image/*"
                multiple
                className="hidden"
            />

            {/* Ô nhập nội dung chi tiết sự cố / yêu cầu hỗ trợ */}
            <div className="w-full mb-3 text-left">
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Mô tả chi tiết sự cố / yêu cầu hỗ trợ:
                </label>
                <textarea
                    rows={2}
                    value={supportContent}
                    onChange={(e) => setSupportContent(e.target.value)}
                    placeholder="Nhập mô tả lỗi hoặc sự cố bạn gặp phải..."
                    className="w-full p-2.5 text-xs bg-white border border-border rounded-lg outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 resize-none text-foreground placeholder:text-muted-foreground shadow-sm"
                />
            </div>

            {/* Danh sách ảnh đã tải lên (tối đa 3 ảnh) */}
            {urls.length > 0 && (
                <div className="w-full mb-3">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-[11px] font-bold text-primary">Ảnh minh chứng ({urls.length}/3)</span>
                        {urls.length < 3 && (
                            <button
                                type="button"
                                onClick={() => fileInputRef.current?.click()}
                                disabled={uploading}
                                className="text-[10px] text-primary underline font-medium hover:opacity-80"
                            >
                                + Thêm ảnh khác
                            </button>
                        )}
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                        {urls.map((url, idx) => (
                            <div key={idx} className="relative group aspect-square rounded-lg overflow-hidden border border-border bg-black/5 shadow-sm">
                                <img src={url} alt={`Evidence ${idx + 1}`} className="w-full h-full object-cover" />
                                <button
                                    type="button"
                                    onClick={() => handleRemoveImage(idx)}
                                    className="absolute top-1 right-1 w-5 h-5 bg-black/60 hover:bg-red-600 text-white rounded-full flex items-center justify-center transition-colors"
                                    title="Xóa ảnh này"
                                >
                                    <X size={12} />
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {uploading ? (
                <div className="flex items-center gap-2 text-primary text-xs font-semibold py-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Đang tải ảnh lên Cloudinary...</span>
                </div>
            ) : urls.length < 3 && (
                <div
                    onClick={() => fileInputRef.current?.click()}
                    className="flex flex-col items-center gap-1.5 py-1 cursor-pointer group w-full"
                >
                    <div className="w-9 h-9 rounded-full bg-primary/10 text-primary flex items-center justify-center group-hover:scale-110 group-hover:bg-primary group-hover:text-white transition-all shadow-sm">
                        <UploadCloud className="w-5 h-5" />
                    </div>
                    <div>
                        <p className="text-xs font-bold text-primary group-hover:underline">
                            {urls.length === 0 ? '📷 Nhấp để chọn tối đa 3 ảnh chụp màn hình sự cố' : 'Nhấp để chọn thêm ảnh'}
                        </p>
                        <p className="text-[10px] text-muted-foreground mt-0.5">Hỗ trợ PNG, JPG, WEBP (Tối đa 3 ảnh)</p>
                    </div>
                </div>
            )}

            {/* Nút bấm tự động gửi yêu cầu qua admin và kết thúc */}
            <div className="mt-3 w-full flex items-center justify-center gap-2 pt-2.5 border-t border-primary/10">
                <button
                    type="button"
                    onClick={handleConfirmSubmit}
                    disabled={uploading}
                    className="w-full py-2 px-3 bg-primary hover:bg-primary/90 text-white text-xs font-bold rounded-lg shadow-sm transition-all flex items-center justify-center gap-1.5 active:scale-95 disabled:opacity-50"
                >
                    <Send className="w-3.5 h-3.5" />
                    <span>{urls.length > 0 ? `Gửi ${urls.length} ảnh & Tạo yêu cầu hỗ trợ` : 'Gửi yêu cầu tới Admin ngay'}</span>
                </button>
            </div>
        </div>
    );
};

const AiChatBot = () => {
    const currentUser = useAuthStore((state) => state.user);
    const isAuthenticated = !!currentUser;

    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([
        { role: 'assistant', content: 'Xin chào! Tôi là trợ lý ảo của Gnostica E-Learning. Tôi có thể giúp gì cho bạn hôm nay?' }
    ]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isMinimized, setIsMinimized] = useState(false);
    const [attachedImageUrl, setAttachedImageUrl] = useState(null);
    const [isUploadingInputImage, setIsUploadingInputImage] = useState(false);
    const bottomFileInputRef = useRef(null);

    const userMessageCount = messages.filter(m => m.role === 'user').length;
    const isGuestLimitReached = !isAuthenticated && userMessageCount >= 5;

    const messagesEndRef = useRef(null);

    const [width, setWidth] = useState(840);
    const [height, setHeight] = useState(700);
    const [isResizing, setIsResizing] = useState(false);
    const resizeRef = useRef({
        isResizing: false,
        direction: '',
        startX: 0,
        startY: 0,
        startWidth: 0,
        startHeight: 0
    });
    const navigate = useNavigate();

    useEffect(() => {
        if (typeof window !== 'undefined') {
            setWidth(Math.min(840, window.innerWidth - 48));
            setHeight(Math.min(700, window.innerHeight - 48));
        }
    }, []);

    useEffect(() => {
        const handleMouseMove = (e) => {
            if (!resizeRef.current.isResizing) return;
            const clientX = e.clientX || (e.touches && e.touches[0]?.clientX);
            const clientY = e.clientY || (e.touches && e.touches[0]?.clientY);
            if (clientX === undefined || clientY === undefined) return;

            const { direction, startX, startY, startWidth, startHeight } = resizeRef.current;

            let newWidth = startWidth;
            let newHeight = startHeight;

            if (direction.includes('w')) {
                const deltaX = clientX - startX;
                newWidth = Math.max(320, Math.min(window.innerWidth - 48, startWidth - deltaX));
            }
            if (direction.includes('n')) {
                const deltaY = clientY - startY;
                newHeight = Math.max(200, Math.min(window.innerHeight - 48, startHeight - deltaY));
            }

            setWidth(newWidth);
            setHeight(newHeight);
        };

        const handleMouseUp = () => {
            if (resizeRef.current.isResizing) {
                setIsResizing(false);
                resizeRef.current.isResizing = false;
            }
        };

        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseup', handleMouseUp);
        document.addEventListener('touchmove', handleMouseMove, { passive: false });
        document.addEventListener('touchend', handleMouseUp);

        return () => {
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
            document.removeEventListener('touchmove', handleMouseMove);
            document.removeEventListener('touchend', handleMouseUp);
        };
    }, []);

    const handleMouseDown = (e, direction) => {
        e.preventDefault();
        e.stopPropagation();
        setIsResizing(true);
        resizeRef.current = {
            isResizing: true,
            direction,
            startX: e.clientX,
            startY: e.clientY,
            startWidth: width,
            startHeight: height
        };
    };

    const handleTouchStart = (e, direction) => {
        const touch = e.touches[0];
        if (!touch) return;
        setIsResizing(true);
        resizeRef.current = {
            isResizing: true,
            direction,
            startX: touch.clientX,
            startY: touch.clientY,
            startWidth: width,
            startHeight: height
        };
    };

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleImageUploadedFromWidget = (urls, contentText) => {
        if (!isAuthenticated) {
            toast.error('Vui lòng đăng nhập tài khoản để gửi Yêu cầu hỗ trợ tới Admin.');
            return;
        }

        let msg = contentText && contentText.trim()
            ? `Sự cố: ${contentText.trim()}`
            : `Tôi đã gửi yêu cầu hỗ trợ, xin vui lòng quay lại sau`;

        if (urls && urls.length > 0) {
            handleSend(null, `${msg} (TẠO TICKET NGAY DÙM TÔI) (ImageURLs: ${urls.join(', ')})`);
        } else {
            handleSend(null, `${msg} (TẠO TICKET NGAY DÙM TÔI)`);
        }
    };

    const handleBottomFileChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        if (!file.type.startsWith('image/')) {
            toast.error('Vui lòng chọn định dạng file ảnh.');
            return;
        }

        setIsUploadingInputImage(true);
        try {
            const url = await uploadChatImage(file);
            setAttachedImageUrl(url);
            toast.success('Đã chọn ảnh đính kèm!');
        } catch (error) {
            console.error(error);
            toast.error('Không thể tải ảnh lên.');
        } finally {
            setIsUploadingInputImage(false);
        }
    };

    const renderMessageContent = (msg) => {
        const content = msg.content;
        if (!content) return null;

        // Clean any system/tool logs block if it starts with /* and ends with */
        const cleanedContent = content.replace(/\/\*[\s\S]*?\*\//g, '').trim();

        // Tự động phát hiện xem câu trả lời của AI có chứa thẻ yêu cầu upload ảnh hay không
        const isAskingForImage = msg.role === 'assistant' && (
            cleanedContent.includes('[[CARD:upload_image]]')
        );

        // Bỏ thẻ trigger [[CARD:upload_image]], [[CARD:ticket]] và các URL đính kèm khỏi văn bản hiển thị giao diện
        let displayContent = cleanedContent
            .replace(/\[\[CARD:upload_image\]\]/g, '')
            .replace(/\[\[CARD:ticket[^\]]*\]\]/g, '')
            .trim();
        if (msg.role === 'user') {
            displayContent = displayContent.replace(/\s*\(TẠO TICKET NGAY DÙM TÔI\)/g, '')
                                           .replace(/\s*\(ImageURLs:[^\)]*\)/g, '')
                                           .trim();
        }

        const parts = displayContent.split(/(\[\[CARD:[^\]]+\]\])/g);

        return (
            <>
                {parts.map((part, index) => {
                    const cardMatch = part.match(/\[\[CARD:(.*?)\|(.*?)\|(.*?)\|(.*?)\|(.*?)\|(.*?)\|(.*?)\]\]/);
                    if (cardMatch) {
                        const [, type, id, title, info, author, category, imgUrl] = cardMatch;

                        if (type === 'upload_image') {
                            return <ImageUploadWidget key={index} onSubmitted={handleImageUploadedFromWidget} />;
                        }

                        const isCourse = type === 'course';
                        let linkTo = '#';
                        let icon = <Folder className="w-3.5 h-3.5" />;
                        let infoText = info;
                        let avatarUrl = imgUrl;

                        if (type === 'course') {
                            linkTo = `/courses/${id}`;
                            icon = <Folder className="w-3.5 h-3.5" />;
                            infoText = `Giá: ${info}`;
                            avatarUrl = imgUrl && imgUrl !== 'none' ? imgUrl : 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=150';
                        } else if (type === 'forum') {
                            linkTo = `/forum/${id}`;
                            icon = <ThumbsUp className="w-3.5 h-3.5" />;
                            infoText = info.includes('likes') ? info : `${info === 'null' ? '0' : info} likes`;
                            avatarUrl = imgUrl && imgUrl !== 'none' ? imgUrl : `https://api.dicebear.com/7.x/avataaars/svg?seed=${author}`;
                        } else if (type === 'category') {
                            linkTo = `/forum?category=${encodeURIComponent(title)}`;
                            icon = <Folder className="w-3.5 h-3.5" />;
                            infoText = info;
                            avatarUrl = `https://api.dicebear.com/7.x/identicon/svg?seed=${title}`;
                        } else if (type === 'contributor') {
                            linkTo = `/profile/${id}`;
                            icon = <ThumbsUp className="w-3.5 h-3.5" />;
                            infoText = info;
                            avatarUrl = `https://api.dicebear.com/7.x/avataaars/svg?seed=${author}`;
                        }

                        const handleLinkClick = (e, to) => {
                            e.preventDefault();
                            if (to && to !== '#') {
                                navigate(to);
                            }
                        };

                        return (
                            <Link
                                key={index}
                                to={linkTo}
                                onClick={(e) => handleLinkClick(e, linkTo)}
                                className="block mt-2 mb-3 bg-white border border-border/50 hover:border-primary/50 transition-colors rounded-xl p-3 shadow-sm hover:shadow-md group no-underline text-card-foreground"
                            >
                                <div className="flex items-start gap-3">
                                    <div className="shrink-0 mt-0.5">
                                        <div className="w-8 h-8 rounded-full overflow-hidden border border-border bg-muted ring-2 ring-transparent group-hover:ring-primary/20 transition-all">
                                            <img src={avatarUrl} alt={author} className="w-full h-full object-cover" />
                                        </div>
                                    </div>

                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground mb-1">
                                            <span className="font-semibold text-primary">{category}</span>
                                            <span>•</span>
                                            <span className="truncate text-muted-foreground font-medium">{author}</span>
                                        </div>

                                        <h3 className="font-bold text-[13px] leading-tight line-clamp-2 group-hover:text-primary transition-colors text-foreground mb-2">
                                            {title}
                                        </h3>

                                        <div className="flex items-center gap-3 text-[11px] font-medium text-muted-foreground">
                                            <div className="flex items-center gap-1 hover:text-primary transition-colors">
                                                {icon}
                                                <span>{infoText}</span>
                                            </div>
                                        </div>
                                    </div>

                                    {imgUrl && imgUrl !== 'none' && !isCourse && (
                                        <div className="w-16 h-16 shrink-0 rounded-md overflow-hidden border border-border mt-0.5 hidden sm:block">
                                            <img src={imgUrl} alt="preview" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                                        </div>
                                    )}
                                </div>
                            </Link>
                        );
                    }
                    return (
                        <span key={index} className="whitespace-pre-wrap">{part.replace(/---/g, '').trim()}</span>
                    );
                })}

                {/* Tự động hiển thị khung Upload ảnh trực tiếp nếu AI hỏi ảnh */}
                {isAskingForImage && !displayContent.includes('[[CARD:upload_image]]') && (
                    <ImageUploadWidget onSubmitted={handleImageUploadedFromWidget} />
                )}
            </>
        );
    };

    const handleSend = async (e, textToSend = null) => {
        if (e) e.preventDefault();
        let finalInput = textToSend ? textToSend : input;

        if (!finalInput.trim() || isLoading) return;

        // Giới hạn 5 câu hỏi khi chưa đăng nhập
        if (!isAuthenticated && userMessageCount >= 5) {
            toast.error('Bạn đã dùng hết 5 lượt hỏi miễn phí. Vui lòng đăng nhập để tiếp tục.');
            return;
        }

        // Chặn gửi yêu cầu hỗ trợ khi chưa đăng nhập
        const isSupportRequest = finalInput.toLowerCase().includes('yêu cầu hỗ trợ') ||
                                finalInput.toLowerCase().includes('tôi cần hỗ trợ') ||
                                finalInput.includes('TẠO TICKET NGAY DÙM TÔI');
        if (!isAuthenticated && isSupportRequest) {
            toast.error('Vui lòng đăng nhập tài khoản để gửi Yêu cầu hỗ trợ tới Admin.');
            setMessages(prev => [...prev,
                { role: 'user', content: 'Yêu cầu hỗ trợ' },
                { role: 'assistant', content: 'Vui lòng đăng nhập tài khoản để gửi Yêu cầu hỗ trợ tới Admin.' }
            ]);
            if (!textToSend) setInput('');
            return;
        }

        // Nếu người dùng có đính kèm ảnh ở thanh input
        if (attachedImageUrl) {
            finalInput = `${finalInput} (ImageURLs: ${attachedImageUrl})`.trim();
            setAttachedImageUrl(null);
        }

        const userMessage = { role: 'user', content: finalInput };
        setMessages(prev => [...prev, userMessage]);
        if (!textToSend) setInput('');
        setIsLoading(true);

        try {
            const chatHistory = [...messages, userMessage];
            const response = await sendChatMessage(chatHistory);
            setMessages(prev => [...prev, { role: 'assistant', content: response.content }]);
        } catch (error) {
            toast.error('Dịch vụ đang gặp sự cố, vui lòng thử lại trong ít phút.');
            setMessages(prev => [...prev, { role: 'assistant', content: 'Dịch vụ đang gặp sự cố, vui lòng thử lại trong ít phút.' }]);
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };

    const toggleChat = () => {
        setIsOpen(!isOpen);
        if (isMinimized) setIsMinimized(false);
    };

    if (!isOpen) {
        return (
            <button
                onClick={toggleChat}
                className="fixed bottom-6 right-6 w-14 h-14 bg-gradient-to-br from-primary to-primary-foreground text-white rounded-full shadow-lg flex items-center justify-center hover:scale-110 transition-all duration-300 z-50 group"
            >
                <div className="absolute inset-0 rounded-full bg-primary animate-ping opacity-20 group-hover:hidden"></div>
                <MessageCircle size={28} />
            </button>
        );
    }

    return (
        <div
            className={cn(
                "fixed bottom-6 right-6 bg-card border border-border rounded-2xl shadow-2xl overflow-hidden flex flex-col z-50",
                isMinimized ? "w-72 h-14 transition-all duration-300" : (isResizing ? "" : "transition-all duration-300")
            )}
            style={isMinimized ? {} : { width: `${width}px`, height: `${height}px`, maxWidth: '95vw', maxHeight: '90vh' }}
        >
            {!isMinimized && (
                <>
                    {/* Resize handles */}
                    <div
                        className="absolute top-0 left-0 right-0 h-1 cursor-ns-resize z-50 select-none hover:bg-white/30 transition-colors"
                        onMouseDown={(e) => handleMouseDown(e, 'n')}
                        onTouchStart={(e) => handleTouchStart(e, 'n')}
                    />
                    <div
                        className="absolute top-0 bottom-0 left-0 w-1.5 cursor-ew-resize z-50 select-none hover:bg-primary/20 transition-colors"
                        onMouseDown={(e) => handleMouseDown(e, 'w')}
                        onTouchStart={(e) => handleTouchStart(e, 'w')}
                    />
                    <div
                        className="absolute top-0 left-0 w-3 h-3 cursor-nwse-resize z-50 select-none hover:bg-white/40 rounded-br-lg transition-colors"
                        onMouseDown={(e) => handleMouseDown(e, 'nw')}
                        onTouchStart={(e) => handleTouchStart(e, 'nw')}
                    />
                </>
            )}
            {/* Header */}
            <div className="bg-primary p-4 text-white flex items-center justify-between cursor-pointer" onClick={() => isMinimized && setIsMinimized(false)}>
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                        <Bot size={20} />
                    </div>
                    <div>
                        <h3 className="font-bold text-sm leading-tight">Gnostica Assistant</h3>
                        {!isMinimized && (
                            <p className="text-[10px] opacity-80">
                                {isAuthenticated ? 'Đang trực tuyến' : `Khách (${userMessageCount}/5 câu hỏi)`}
                            </p>
                        )}
                    </div>
                </div>
                <div className="flex items-center gap-1">
                    <button onClick={(e) => { e.stopPropagation(); setIsMinimized(!isMinimized); }} className="p-1 hover:bg-white/10 rounded">
                        {isMinimized ? <Maximize2 size={16} /> : <Minimize2 size={16} />}
                    </button>
                    <button onClick={(e) => { e.stopPropagation(); setIsOpen(false); }} className="p-1 hover:bg-white/10 rounded">
                        <X size={16} />
                    </button>
                </div>
            </div>

            {!isMinimized && (
                <>
                    {/* Messages Body */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-background/50">
                        {messages.map((msg, index) => (
                            <div key={index} className={cn(
                                "flex gap-2 max-w-[85%]",
                                msg.role === 'user' ? "ml-auto flex-row-reverse" : "mr-auto"
                            )}>
                                <div className={cn(
                                    "w-8 h-8 rounded-full flex items-center justify-center shrink-0",
                                    msg.role === 'user' ? "bg-header-orange text-white" : "bg-primary/10 text-primary"
                                )}>
                                    {msg.role === 'user' ? <User size={16} /> : <Bot size={16} />}
                                </div>
                                <div className={cn(
                                    "p-3 rounded-2xl text-sm flex flex-col gap-1",
                                    msg.role === 'user' ? "bg-header-orange text-white rounded-tr-none" : "bg-white border border-border rounded-tl-none shadow-sm w-full"
                                )}>
                                    {renderMessageContent(msg)}
                                </div>
                            </div>
                        ))}
                        {isLoading && (
                            <div className="flex gap-2 max-w-[85%]">
                                <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0">
                                    <Bot size={16} />
                                </div>
                                <div className="p-3 rounded-2xl bg-white border border-border rounded-tl-none shadow-sm flex items-center gap-2">
                                    <Loader2 size={16} className="animate-spin text-primary" />
                                    <span className="text-xs text-muted-foreground italic">Trợ lý đang xử lý...</span>
                                </div>
                            </div>
                        )}
                        {messages.length === 1 && !isLoading && (
                            <div className="flex flex-col gap-2 mt-4 ml-10 mr-auto max-w-[85%] select-none">
                                <span className="text-xs text-muted-foreground font-semibold flex items-center gap-1">
                                    💡 Các câu hỏi thường gặp:
                                </span>
                                <div className="flex flex-col sm:flex-row flex-wrap gap-2">
                                    {FAQS.map((faq) => (
                                        <button
                                            key={faq.id}
                                            type="button"
                                            onClick={() => handleSend(null, faq.text)}
                                            className="text-left text-xs bg-white border border-border hover:border-primary hover:text-primary rounded-xl px-4 py-2.5 shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer"
                                        >
                                            {faq.text}
                                        </button>
                                    ))}
                                </div>
                                <p className="text-[11px] text-muted-foreground mt-1.5 font-medium flex items-center gap-1">
                                    💬 Gửi{" "}
                                    <button
                                        type="button"
                                        onClick={() => {
                                            if (!isAuthenticated) {
                                                toast.error('Vui lòng đăng nhập tài khoản để gửi Yêu cầu hỗ trợ tới Admin.');
                                            } else {
                                                handleSend(null, "Yêu cầu hỗ trợ");
                                            }
                                        }}
                                        className="text-primary font-bold hover:underline cursor-pointer inline-flex items-center gap-0.5 bg-primary/10 px-1.5 py-0.5 rounded-md"
                                    >
                                        "Yêu cầu hỗ trợ"
                                    </button>{" "}
                                    nếu bạn gặp vấn đề và cần hỗ trợ {!isAuthenticated && "(yêu cầu đăng nhập)"}.
                                </p>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Input Area */}
                    <div className="bg-white border-t border-border p-3 flex flex-col gap-2">
                        {isGuestLimitReached ? (
                            <div className="bg-amber-50 border border-amber-200 p-3 rounded-xl text-center text-xs font-semibold text-amber-800 flex items-center justify-center gap-2">
                                <span>🔒 Bạn đã dùng hết 5 lượt hỏi miễn phí khi chưa đăng nhập.</span>
                                <Link to="/login" className="text-primary font-bold hover:underline underline">
                                    Đăng nhập ngay
                                </Link>
                            </div>
                        ) : (
                            <>
                                {/* Hiển thị xem trước ảnh đính kèm nếu người dùng đính kèm từ thanh input */}
                                {attachedImageUrl && (
                                    <div className="flex items-center gap-2 bg-secondary/40 p-2 rounded-lg text-xs w-fit">
                                        <img src={attachedImageUrl} alt="attachment" className="w-8 h-8 rounded object-cover border" />
                                        <span className="text-muted-foreground font-medium text-[11px]">Đã đính kèm ảnh</span>
                                        <button
                                            type="button"
                                            onClick={() => setAttachedImageUrl(null)}
                                            className="text-muted-foreground hover:text-destructive p-0.5"
                                        >
                                            <X size={14} />
                                        </button>
                                    </div>
                                )}

                                <form onSubmit={handleSend} className="flex items-center gap-2">
                                    <input
                                        type="file"
                                        ref={bottomFileInputRef}
                                        onChange={handleBottomFileChange}
                                        accept="image/*"
                                        className="hidden"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => bottomFileInputRef.current?.click()}
                                        disabled={isLoading || isUploadingInputImage}
                                        title="Đính kèm ảnh minh họa"
                                        className="w-9 h-9 rounded-full bg-secondary/50 hover:bg-secondary text-muted-foreground hover:text-primary flex items-center justify-center transition-colors shrink-0"
                                    >
                                        {isUploadingInputImage ? <Loader2 size={16} className="animate-spin" /> : <ImageIcon size={18} />}
                                    </button>

                                    <input
                                        type="text"
                                        value={input}
                                        onChange={(e) => setInput(e.target.value)}
                                        placeholder={!isAuthenticated ? `Nhập tin nhắn (Còn ${5 - userMessageCount}/5 lượt)...` : "Nhập tin nhắn..."}
                                        className="flex-1 bg-secondary/30 border-none px-4 py-2 rounded-full text-sm focus:ring-1 focus:ring-primary outline-none"
                                        disabled={isLoading}
                                    />

                                    <button
                                        type="submit"
                                        disabled={isLoading || (!input.trim() && !attachedImageUrl)}
                                        className="w-10 h-10 bg-primary text-white rounded-full flex items-center justify-center hover:scale-105 active:scale-95 disabled:opacity-50 disabled:scale-100 transition-all shrink-0"
                                    >
                                        <Send size={18} />
                                    </button>
                                </form>
                            </>
                        )}
                    </div>
                </>
            )}
        </div>
    );
};

export default AiChatBot;
