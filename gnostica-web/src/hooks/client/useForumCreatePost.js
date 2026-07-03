import { useState } from 'react';
import { useMutation, useQuery } from "@tanstack/react-query";
import { useNavigate } from 'react-router-dom';
import threadService from '@/services/threadService';
import forumCategoryService from '@/services/forumCategoryService';
import { toast } from "sonner";

export default function useForumCreatePost() {
  const navigate = useNavigate();
  const [content, setContent] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [errors, setErrors] = useState({});

  const { data: categories = [] } = useQuery({
    queryKey: ['forum_categories_active'],
    queryFn: async () => {
      const res = await forumCategoryService.getAllCategories();
      const data = res?.data || res || [];
      return Array.isArray(data) ? data.filter(cat => cat.status === true) : [];
    },
    staleTime: 1000 * 60 * 30, // 30 min cache
  });

  const validateForm = () => {
    const newErrors = {};
    if (!categoryId) {
        newErrors.categoryId = "Vui lòng chọn chủ đề.";
    }
    
    // Clean up content HTML to see if it actually has text or images
    const textOnly = content.replace(/<[^>]*>/g, '').trim();
    const hasImages = content.includes('<img');
    if (!textOnly && !hasImages) {
        newErrors.content = "Vui lòng nhập nội dung bài viết.";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const createMutation = useMutation({
    mutationFn: async (formData) => {
      return await threadService.createThread(formData);
    },
    onSuccess: () => {
      toast.success("Tạo bài viết thành công!");
      navigate('/forum');
    },
    onError: (error) => {
      console.error("Error creating post:", error);
      if (error.response && error.response.status === 401) {
          toast.error("Vui lòng đăng nhập để tạo bài viết.");
          navigate('/login');
      } else {
          const errorMsg = error.response?.data || "Có lỗi xảy ra khi tạo bài viết.";
          toast.error(typeof errorMsg === 'string' ? errorMsg : JSON.stringify(errorMsg));
      }
    }
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
        toast.error("Vui lòng điền đầy đủ thông tin bắt buộc.");
        return;
    }

    const userStr = localStorage.getItem('user');
    if (!userStr) {
        toast.error("Vui lòng đăng nhập để tạo bài viết.");
        navigate('/login');
        return;
    }
    
    const user = JSON.parse(userStr);
    
    const formData = new FormData();
    formData.append('content', content);
    formData.append('categoryId', categoryId);
    formData.append('authorEmail', user.email || user.username || ""); 

    await createMutation.mutateAsync(formData);
  };

  return {
    content,
    setContent,
    categoryId,
    setCategoryId,
    categories,
    errors,
    setErrors,
    handleSubmit,
    isSubmitting: createMutation.isPending
  };
}
