import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import PageContainer from "@/components/common/core/PageContainer";
import AppSelect from "@/components/common/micro/AppSelect";
import AppInput from "@/components/common/micro/AppInput";
import { AppButton } from "@/components/common/micro/AppButton";
import Input from "@/components/common/micro/AppInput";
import AppCard, { AppCardContent } from "@/components/common/micro/AppCard";
import AppAvatar from "@/components/common/micro/AppAvatar";
import AppBadge from "@/components/common/micro/AppBadge";
import RenderContent from "@/components/common/core/RenderContent";
import { Send, FileText, Hash, X, Clock, Eye, MessageSquare, ThumbsUp } from 'lucide-react';
import useForumCreatePost from "@/hooks/forum/useForumCreatePost";
import ReactQuill from "react-quill-new";
import "react-quill-new/dist/quill.snow.css";

const quillModules = {
    toolbar: [
        [{ header: [1, 2, false] }],
        ["bold", "italic", "underline", "strike"],
        [{ list: "ordered" }, { list: "bullet" }],
        ["link", "image"],
        ["clean"],
    ],
};

const stripHtml = (html) => (html || "")
    .replace(/<[^>]*>/g, "")
    .replace(/&nbsp;/g, " ")
    .trim();

const ForumPostPreview = ({ title, content, hashtags, category, user }) => {
    const hasContent = Boolean(stripHtml(content)) || String(content || "").includes("<img");
    const displayName = user?.fullName || user?.name || "Bạn";
    const displayEmail = user?.email || "preview@gnostica";
    const avatar = user?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${displayEmail}`;

    return (
        <AppCard appVariant="default" className="sticky top-24 bg-white border-border shadow-sm">
            <AppCardContent className="p-5">
                <div className="mb-4 flex items-center justify-between gap-3 border-b border-border pb-4">
                    <div>
                        <p className="text-xs font-semibold uppercase tracking-wide text-primary">Xem trước</p>
                        <h2 className="mt-1 text-base font-bold text-foreground">Bài viết của bạn</h2>
                    </div>
                    {category && (
                        <span className="max-w-[160px] truncate text-xs font-semibold text-primary">
                            {category.name}
                        </span>
                    )}
                </div>

                <div className="p-0">
                    <div className="mb-3 flex items-center gap-3">
                        <AppAvatar
                            size="md"
                            className="ring-2 ring-primary/10"
                            src={avatar}
                            fallback={displayName.substring(0, 1).toUpperCase()}
                            alt={displayName}
                        />
                        <div className="min-w-0">
                            <p className="truncate text-sm font-semibold text-foreground">{displayName}</p>
                            <p className="flex items-center gap-1 text-xs text-muted-foreground">
                                <Clock className="h-3 w-3" />
                                Vừa xong
                            </p>
                        </div>
                    </div>

                    <h3 className="mb-2 line-clamp-2 text-lg font-bold text-foreground">
                        {title.trim() || "Tiêu đề bài viết sẽ hiển thị ở đây"}
                    </h3>

                    <div className="min-h-24 text-sm leading-6 text-foreground">
                        {hasContent ? (
                            <RenderContent text={content} />
                        ) : (
                            <p className="text-muted-foreground">Nội dung bạn nhập sẽ được xem trước tại đây.</p>
                        )}
                    </div>

                    <div className="mt-3 flex flex-wrap gap-2">
                        {hashtags.length > 0 ? hashtags.map(tag => (
                            <AppBadge key={tag} variant="secondary" soft className="text-xs">
                                #{tag}
                            </AppBadge>
                        )) : (
                            <span className="text-xs text-muted-foreground">Chưa có hashtag</span>
                        )}
                    </div>

                    <div className="mt-4 flex items-center gap-4 border-t border-border pt-3 text-xs font-medium text-muted-foreground">
                        <span className="flex items-center gap-1.5"><ThumbsUp className="h-4 w-4" />0</span>
                        <span className="flex items-center gap-1.5"><MessageSquare className="h-4 w-4" />0</span>
                        <span className="flex items-center gap-1.5"><Eye className="h-4 w-4" />0</span>
                    </div>
                </div>
            </AppCardContent>
        </AppCard>
    );
};

const ForumCreatePost = () => {
    const navigate = useNavigate();
    const {
        title,
        setTitle,
        content,
        setContent,
        categoryId,
        setCategoryId,
        hashtags,
        tagInput,
        setTagInput,
        addTag,
        removeTag,
        handleTagKeyDown,
        categories,
        errors,
        setErrors,
        handleSubmit,
        isSubmitting
    } = useForumCreatePost();
    const currentUser = useMemo(() => {
        try {
            return JSON.parse(localStorage.getItem('user'));
        } catch {
            return null;
        }
    }, []);
    const selectedCategory = useMemo(
        () => categories.find(category => String(category.id) === String(categoryId)),
        [categories, categoryId]
    );

    return (
        <div className="min-h-screen bg-muted pb-16 pt-8">
            <PageContainer.Section className="w-full app-container">
                <PageContainer.Header
                    title={<>Tạo bài viết <span className="text-accent-highlight">Mới</span></>}
                    description="Chia sẻ kiến thức, câu hỏi hoặc thảo luận cùng cộng đồng."
                />

                <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(320px,420px)] lg:items-start">
                    <AppCard appVariant="default" className="bg-white shadow-sm border-border">
                    <AppCardContent className="p-6 sm:p-8">
                        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
                            {/* Category Selection */}
                            <div className="flex flex-col gap-2">
                                <label className="text-sm font-semibold text-foreground">
                                    Chủ đề <span className="text-error">*</span>
                                </label>
                                <AppSelect
                                    value={categoryId}
                                    onValueChange={(val) => {
                                        setCategoryId(val);
                                        if (errors.categoryId) setErrors(prev => ({ ...prev, categoryId: null }));
                                    }}
                                    placeholder="Chọn chủ đề..."
                                    error={!!errors.categoryId}
                                    options={categories.map(cat => ({ label: cat.name, value: cat.id }))}
                                />
                                {errors.categoryId && <span className="text-xs text-error">{errors.categoryId}</span>}
                            </div>

                            {/* Title Input */}
                            <div className="flex flex-col gap-2">
                                <label className="text-sm font-semibold text-foreground flex items-center gap-1.5">
                                    <FileText className="w-4 h-4 text-primary" />
                                    Tiêu đề bài viết <span className="text-error">*</span>
                                </label>
                                <div className="relative">
                                    <Input
                                        type="text"
                                        placeholder="Nhập tiêu đề ngắn gọn, rõ ràng cho bài viết..."
                                        value={title}
                                        onChange={(e) => {
                                            setTitle(e.target.value);
                                            if (errors.title) setErrors(prev => ({ ...prev, title: null }));
                                        }}
                                        maxLength={255}
                                        className={`h-12 text-sm pr-20 ${errors.title ? 'border-error/60 focus-visible:ring-error/30' : ''}`}
                                    />
                                    <span className={`absolute right-3 top-1/2 -translate-y-1/2 text-xs font-medium tabular-nums ${
                                        title.length > 200 ? 'text-warning' : 'text-muted-foreground'
                                    }`}>
                                        {title.length}/255
                                    </span>
                                </div>
                                {errors.title && <span className="text-xs text-error">{errors.title}</span>}
                            </div>

                            {/* Rich Text Content */}
                            <div className="flex flex-col gap-2 relative z-0">
                                <label className="text-sm font-semibold text-foreground">
                                    Nội dung <span className="text-error">*</span>
                                </label>
                                <div className="rounded-lg border border-border overflow-hidden focus-within:border-ring focus-within:ring-3 focus-within:ring-ring/50 transition-all bg-white">
                                    <ReactQuill
                                        theme="snow"
                                        value={content}
                                        onChange={(val) => {
                                            setContent(val);
                                            if (errors.content) setErrors(prev => ({ ...prev, content: null }));
                                        }}
                                        modules={quillModules}
                                        placeholder="Bạn muốn hỏi hoặc chia sẻ gì? Bạn có thể đính kèm ảnh trực tiếp trong bài viết bằng nút tải ảnh trên thanh công cụ."
                                        className="[&_.ql-toolbar.ql-snow]:!border-0 [&_.ql-toolbar.ql-snow]:!border-b [&_.ql-toolbar.ql-snow]:!border-border [&_.ql-toolbar]:bg-muted [&_.ql-container.ql-snow]:!border-0 [&_.ql-container]:min-h-[250px] [&_.ql-editor]:min-h-[250px] [&_.ql-editor]:text-sm [&_.ql-editor]:text-foreground font-sans"
                                    />
                                </div>
                                {errors.content && <span className="text-xs text-error">{errors.content}</span>}
                            </div>

                            {/* Hashtags */}
                            <div className="flex flex-col gap-2">
                                <AppInput
                                    icon={Hash}
                                    label="Hashtag"
                                    labelRight={<span className="text-xs text-muted-foreground font-normal">(tối đa 10, nhấn Space hoặc Enter để thêm)</span>}
                                    value={tagInput}
                                    onChange={(e) => setTagInput(e.target.value)}
                                    onKeyDown={handleTagKeyDown}
                                    placeholder={hashtags.length < 10 ? "Thêm hashtag..." : "Đã đạt giới hạn 10 hashtag"}
                                    disabled={hashtags.length >= 10}
                                    className="bg-background"
                                />
                                {hashtags.length > 0 && (
                                    <div className="flex flex-wrap gap-2 mt-1">
                                        {hashtags.map(tag => (
                                            <span
                                                key={tag}
                                                className="inline-flex items-center gap-1 bg-primary/10 text-primary text-xs font-semibold px-2.5 py-1 rounded-full border border-primary/20"
                                            >
                                                #{tag}
                                                <button
                                                    type="button"
                                                    onClick={() => removeTag(tag)}
                                                    className="hover:text-error transition-colors ml-0.5"
                                                    aria-label={`Xóa hashtag ${tag}`}
                                                >
                                                    <X className="w-3 h-3" />
                                                </button>
                                            </span>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Submit Button */}
                            <div className="flex justify-end pt-4 mt-2 border-t">
                                <span className="flex-1"></span>
                                <AppButton appVariant="ghostMuted" variant="ghost" 
                                    type="button" 
                                    className="mr-3 border border-border" 
                                    onClick={() => navigate(-1)}
                                >
                                    Hủy
                                </AppButton>
                                <AppButton appVariant="gradient" 
                                    type="submit" 
                                    className="px-8 flex items-center gap-2"
                                    disabled={isSubmitting}
                                >
                                    {isSubmitting ? 'Đang Đăng...' : (
                                        <>
                                            <Send className="w-4 h-4" /> Đăng bài
                                        </>
                                    )}
                                </AppButton>
                            </div>

                        </form>
                    </AppCardContent>
                    </AppCard>

                    <ForumPostPreview
                        title={title}
                        content={content}
                        hashtags={hashtags}
                        category={selectedCategory}
                        user={currentUser}
                    />
                </div>
            </PageContainer.Section>
        </div>
    );
};

export default ForumCreatePost;
