import React from 'react';
import { useNavigate } from 'react-router-dom';
import PageContainer from "@/components/common/core/PageContainer";
import AppSelect from "@/components/common/micro/AppSelect";
import AppInput from "@/components/common/micro/AppInput";
import { AppButton } from "@/components/common/micro/AppButton";
import Input from "@/components/common/micro/AppInput";
import { Card, CardContent } from "@/components/common/micro/AppCard";
import { Send, FileText, Hash, X } from 'lucide-react';
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

    return (
        <div className="min-h-screen bg-muted pb-16 pt-8">
            <PageContainer.Section className="max-w-4xl mx-auto w-full app-container">
                <PageContainer.Header
                    title={<>Tạo bài viết <span className="bg-accent-gradient bg-clip-text text-transparent italic">Mới</span></>}
                    description="Chia sẻ kiến thức, câu hỏi hoặc thảo luận cùng cộng đồng."
                />

                <Card className="bg-white shadow-sm border-border">
                    <CardContent className="p-6 sm:p-8">
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
                    </CardContent>
                </Card>
            </PageContainer.Section>
        </div>
    );
};

export default ForumCreatePost;
