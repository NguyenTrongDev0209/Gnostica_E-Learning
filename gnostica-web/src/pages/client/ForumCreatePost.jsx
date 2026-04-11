import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import SectionContainer, { PageHeader } from '@/components/common/AppSection';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { ImagePlus, X, Send } from 'lucide-react';
import { toast } from "sonner";
import axios from 'axios';
import { useEffect } from 'react';

const ForumCreatePost = () => {
    const navigate = useNavigate();
    const [content, setContent] = useState('');
    const [categoryId, setCategoryId] = useState('');
    const [images, setImages] = useState([]);
    const [previewUrls, setPreviewUrls] = useState([]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [categories, setCategories] = useState([]);
    const [errors, setErrors] = useState({});

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const res = await axios.get('http://localhost:8080/api/forum-categories');
                setCategories(res.data);
            } catch (error) {
                console.error("Failed to load forum categories", error);
                toast.error("Không thể tải danh sách chủ đề.");
            }
        };
        fetchCategories();
    }, []);
    

    const handleImageChange = (e) => {
        const files = Array.from(e.target.files);
        if (files.length === 0) return;

        // Add to images state
        setImages(prev => [...prev, ...files]);

        // Create preview URLs
        const newPreviewUrls = files.map(file => URL.createObjectURL(file));
        setPreviewUrls(prev => [...prev, ...newPreviewUrls]);
    };

    const removeImage = (indexToRemove) => {
        setImages(prev => prev.filter((_, index) => index !== indexToRemove));
        setPreviewUrls(prev => {
            const newUrls = prev.filter((_, index) => index !== indexToRemove);
            // Optionally revoke the object URL to avoid memory leaks
            URL.revokeObjectURL(prev[indexToRemove]);
            return newUrls;
        });
    };

    const validateForm = () => {
        const newErrors = {};
        if (!categoryId) {
            newErrors.categoryId = "Vui lòng chọn chủ đề.";
        }
        if (!content.trim()) {
            newErrors.content = "Vui lòng nhập nội dung bài viết.";
        }
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!validateForm()) {
            toast.error("Vui lòng điền đầy đủ thông tin bắt buộc.");
            return;
        }

        setIsSubmitting(true);

        try {
            const formData = new FormData();
            formData.append('content', content);
            formData.append('categoryId', categoryId);
            
            images.forEach(image => {
                formData.append('images', image);
            });

            // Get user from localStorage
            const userStr = localStorage.getItem('user');
            if (!userStr) {
                toast.error("Vui lòng đăng nhập để tạo bài viết.");
                navigate('/login');
                setIsSubmitting(false);
                return;
            }
            const user = JSON.parse(userStr);
            console.log("Current user from localStorage:", user);
            formData.append('authorEmail', user.email || user.username || ""); 

            console.log("--- FormData Debug ---");
            for (let pair of formData.entries()) {
                console.log(pair[0] + ': ' + (pair[1] instanceof File ? `File: ${pair[1].name}` : pair[1]));
            }

            const headers = {
                'Content-Type': 'multipart/form-data',
            };

            const response = await axios.post('http://localhost:8080/api/threads', formData, { headers });

            if (response.status === 200 || response.status === 201) {
                toast.success("Tạo bài viết thành công!");
                // Navigate back to forum or to the new thread detail (if response returns ID)
                navigate('/forum');
            }
        } catch (error) {
            console.error("Error creating post:", error);
            // Example of handling unauthorized 
            if (error.response && error.response.status === 401) {
                toast.error("Vui lòng đăng nhập để tạo bài viết.");
                navigate('/login');
            } else {
                const errorMsg = error.response?.data || "Có lỗi xảy ra khi tạo bài viết.";
                toast.error(typeof errorMsg === 'string' ? errorMsg : JSON.stringify(errorMsg));
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50/50 pb-16 pt-8">
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
                                <label className="text-sm font-semibold text-slate-700">
                                    Chủ đề <span className="text-red-500">*</span>
                                </label>
                                <select 
                                    className={`flex h-12 w-full items-center justify-between rounded-md border ${errors.categoryId ? 'border-red-500' : 'border-input'} bg-slate-50 px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50`}
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
                                {errors.categoryId && <span className="text-xs text-red-500">{errors.categoryId}</span>}
                            </div>

                            {/* Rich Text Content */}
                            <div className="flex flex-col gap-2 relative z-0">
                                <label className="text-sm font-semibold text-slate-700">
                                    Nội dung <span className="text-red-500">*</span>
                                </label>
                                <textarea
                                    className={`flex min-h-[200px] w-full rounded-md border ${errors.content ? 'border-red-500' : 'border-input'} bg-slate-50 px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-y`}
                                    value={content}
                                    onChange={(e) => {
                                        setContent(e.target.value);
                                        if (errors.content) setErrors(prev => ({ ...prev, content: null }));
                                    }}
                                    placeholder="Bạn muốn hỏi hoặc chia sẻ gì?"
                                />
                                {errors.content && <span className="text-xs text-red-500">{errors.content}</span>}
                            </div>

                            {/* Image Upload */}
                            <div className="flex flex-col gap-4">
                                <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
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
                                        <div className="w-24 h-24 sm:w-32 sm:h-32 border-2 border-dashed border-slate-300 rounded-lg flex flex-col items-center justify-center text-slate-500 hover:bg-slate-50 hover:border-primary transition-colors bg-white">
                                            <ImagePlus className="w-6 h-6 sm:w-8 sm:h-8 mb-2" />
                                            <span className="text-xs px-2 text-center">Thêm ảnh</span>
                                        </div>
                                    </div>

                                    {/* Previews */}
                                    {previewUrls.map((url, index) => (
                                        <div key={index} className="relative w-24 h-24 sm:w-32 sm:h-32 group rounded-lg overflow-hidden border bg-slate-100">
                                            <img src={url} alt={`preview-${index}`} className="w-full h-full object-cover" />
                                            <button 
                                                type="button"
                                                onClick={() => removeImage(index)}
                                                className="absolute top-1 right-1 bg-red-500 hover:bg-red-600 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center transform scale-90"
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
