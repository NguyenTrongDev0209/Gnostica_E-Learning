import React from 'react';
import { useNavigate } from 'react-router-dom';
import SectionContainer, { PageHeader } from '@/components/common/AppSection';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Send } from 'lucide-react';
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
        content,
        setContent,
        categoryId,
        setCategoryId,
        categories,
        errors,
        setErrors,
        handleSubmit,
        isSubmitting
    } = useForumCreatePost();

    return (
        <div className="min-h-screen bg-muted pb-16 pt-8">
            <SectionContainer containerClassName="max-w-4xl mx-auto w-full">
                <PageHeader
                    title="Tạo bài viết"
                    highlightedTitle="Mới"
                    description="Chia sẻ kiến thức, câu hỏi hoặc thảo luận cùng cộng đồng."
                    className="mb-8"
                />

                <Card className="bg-white shadow-sm border-border">
                    <CardContent className="p-6 sm:p-8">
                        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
                            {/* Category Selection */}
                            <div className="flex flex-col gap-2">
                                <label className="text-sm font-semibold text-foreground">
                                    Chủ đề <span className="text-error">*</span>
                                </label>
                                <select 
                                    className={`flex h-12 w-full items-center justify-between rounded-md border ${errors.categoryId ? 'border-error/20' : 'border-input'} bg-muted px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50`}
                                    value={categoryId}
                                    onChange={(e) => {
                                        setCategoryId(e.target.value);
                                        if (errors.categoryId) setErrors(prev => ({ ...prev, categoryId: null }));
                                    }}
                                >
                                    <option value="">Chọn chủ đề...</option>
                                    {categories.map(cat => (
                                        <option key={cat.id} value={cat.id}>{cat.name}</option>
                                    ))}
                                </select>
                                {errors.categoryId && <span className="text-xs text-error">{errors.categoryId}</span>}
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

                            {/* Submit Button */}
                            <div className="flex justify-end pt-4 mt-2 border-t">
                                <span className="flex-1"></span>
                                <Button 
                                    type="button" 
                                    variant="outline" 
                                    className="mr-3" 
                                    onClick={() => navigate(-1)}
                                >
                                    Hủy
                                </Button>
                                <Button 
                                    type="submit" 
                                    className="bg-button-gradient hover:brightness-110 font-bold px-8 flex items-center gap-2"
                                    disabled={isSubmitting}
                                >
                                    {isSubmitting ? 'Đang Đăng...' : (
                                        <>
                                            <Send className="w-4 h-4" /> Đăng bài
                                        </>
                                    )}
                                </Button>
                            </div>

                        </form>
                    </CardContent>
                </Card>
            </SectionContainer>
        </div>
    );
};

export default ForumCreatePost;
