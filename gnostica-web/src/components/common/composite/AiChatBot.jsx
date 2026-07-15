import React, { useState, useEffect, useRef } from 'react';
import { MessageCircle, X, Send, Bot, User, Loader2, Minimize2, Maximize2, ThumbsUp, Folder } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { sendChatMessage } from '@/services/admin/aiService';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

const FAQS = [
    { id: '1', text: 'Tìm kiếm khóa học Java' },
    { id: '2', text: 'Xem các bài viết nổi bật' },
    { id: '3', text: 'Thành viên đóng góp tích cực nhất' },
    { id: '4', text: 'Chuyên mục thảo luận diễn đàn' }
];

const AiChatBot = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([
        { role: 'assistant', content: 'Xin chào! Tôi là trợ lý ảo của Gnostica E-Learning. Tôi có thể giúp gì cho bạn hôm nay?' }
    ]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isMinimized, setIsMinimized] = useState(false);
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

    const renderMessageContent = (content) => {
        if (!content) return null;

        // Clean any system/tool logs block if it starts with /* and ends with */
        const cleanedContent = content.replace(/\/\*[\s\S]*?\*\//g, '').trim();

        const parts = cleanedContent.split(/(\[\[CARD:[^\]]+\]\])/g);

        return parts.map((part, index) => {
            const cardMatch = part.match(/\[\[CARD:(.*?)\|(.*?)\|(.*?)\|(.*?)\|(.*?)\|(.*?)\|(.*?)\]\]/);
            if (cardMatch) {
                const [, type, id, title, info, author, category, imgUrl] = cardMatch;

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
        });
    };

    const handleSend = async (e, textToSend = null) => {
        if (e) e.preventDefault();
        const finalInput = textToSend ? textToSend : input;
        if (!finalInput.trim() || isLoading) return;

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
                        {!isMinimized && <p className="text-[10px] opacity-80">Đang trực tuyến</p>}
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
                                    {renderMessageContent(msg.content)}
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
                                    <span className="text-xs text-muted-foreground italic">Trợ lý đang trả lời...</span>
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
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Input Area */}
                    <form onSubmit={handleSend} className="p-4 bg-white border-t border-border flex items-center gap-2">
                        <input
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            placeholder="Nhập tin nhắn..."
                            className="flex-1 bg-secondary/30 border-none px-4 py-2 rounded-full text-sm focus:ring-1 focus:ring-primary outline-none"
                            disabled={isLoading}
                        />
                        <button
                            type="submit"
                            disabled={isLoading || !input.trim()}
                            className="w-10 h-10 bg-primary text-white rounded-full flex items-center justify-center hover:scale-105 active:scale-95 disabled:opacity-50 disabled:scale-100 transition-all"
                        >
                            <Send size={18} />
                        </button>
                    </form>
                </>
            )}
        </div>
    );
};

export default AiChatBot;
