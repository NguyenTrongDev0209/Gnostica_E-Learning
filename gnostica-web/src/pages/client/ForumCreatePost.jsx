import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import SectionContainer, { PageHeader } from '@/components/common/AppSection';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { ImagePlus, X, Send } from 'lucide-react';
import useForumCreatePost from "@/hooks/client/useForumCreatePost";

const ForumCreatePost = () => {
    const navigate = useNavigate();
    const {
        content,
        setContent,
        categoryId,
        setCategoryId,
        previewUrls,
        categories,
        errors,
        setErrors,
        handleImageChange,
        removeImage,
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
                                <textarea
                                    className={`flex min-h-[200px] w-full rounded-md border ${errors.content ? 'border-error/20' : 'border-input'} bg-muted px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-y`}
                                    value={content}
                                    onChange={(e) => {
                                        setContent(e.target.value);
                                        if (errors.content) setErrors(prev => ({ ...prev, content: null }));
                                    }}
                                    placeholder="Bạn muốn hỏi hoặc chia sẻ gì?"
                                />
                                {errors.content && <span className="text-xs text-error">{errors.content}</span>}
                            </div>

                            {/* Image Upload */}
                            <div className="flex flex-col gap-4">
                                <label className="text-sm font-semibold text-foreground flex items-center gap-2">
                                    Đính kèm hình ảnh
                                    <span className="text-xs font-normal text-muted-foreground">(Tùy chọn, có thể chọn nhiều ảnh)</span>
                                </label>
                                
                                <div className="flex flex-wrap gap-4">
                                    {/* Upload Button */}
                                    <div className="relative">
                                        <input 
                                            type="file" 
                                            multiple 
                                            accept="image/*" 
                                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                            onChange={handleImageChange}
                                        />
                                        <div className="w-24 h-24 sm:w-32 sm:h-32 border-2 border-dashed border-border rounded-lg flex flex-col items-center justify-center text-muted-foreground hover:bg-muted hover:border-primary transition-colors bg-white">
                                            <ImagePlus className="w-6 h-6 sm:w-8 sm:h-8 mb-2" />
                                            <span className="text-xs px-2 text-center">Thêm ảnh</span>
                                        </div>
                                    </div>

                                    {/* Previews */}
                                    {previewUrls.map((url, index) => (
                                        <div key={index} className="relative w-24 h-24 sm:w-32 sm:h-32 group rounded-lg overflow-hidden border bg-secondary">
                                            <img src={url} alt={`preview-${index}`} className="w-full h-full object-cover" />
                                            <button 
                                                type="button"
                                                onClick={() => removeImage(index)}
                                                className="absolute top-1 right-1 bg-error/10 text-error hover:bg-error/10 text-error text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center transform scale-90"
                                            >
                                                <X className="w-4 h-4" />
                                            </button>
                                        </div>
                                    ))}
                                </div>
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
