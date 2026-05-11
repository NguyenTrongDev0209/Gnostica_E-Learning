import React, { useState, useEffect, useCallback, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { toast } from "sonner";
import courseService from "@/services/courseService";
import categoryService from "@/services/categoryService";

/**
 * Hook quản lý toàn bộ logic cho InstructorCourseForm.
 * Bao gồm: Form state, Autosave, Draft management, Media Uploads.
 */
export default function useInstructorCourseForm(courseSchema, viErrorMap) {
  const navigate = useNavigate();
  const { slug } = useParams();
  const isEditMode = !!slug;
  const isSubmittingRef = useRef(false);
  const lastDraftRef = useRef(null);
  const draftLoadedRef = useRef(false);
  const originalDataRef = useRef(null);

  const [activeTab, setActiveTab] = useState("basic");
  const [isUploading, setIsUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState("");
  const [activeUploads, setActiveUploads] = useState(0);
  const [isSavingDraft, setIsSavingDraft] = useState(false);
  const [showDraftModal, setShowDraftModal] = useState(false);
  const [pendingDraft, setPendingDraft] = useState(null);
  const [categories, setCategories] = useState([]);

  const methods = useForm({
    resolver: zodResolver(courseSchema, { errorMap: viErrorMap }),
    defaultValues: {
      title: "",
      slug: "",
      categoryId: "",
      level: "",
      description: "",
      price: "",
      discount: 0,
      status: 1,
      sections: [
        {
          title: "",
          status: 1,
          lessons: [{
            title: "",
            content: "",
            videoFile: null,
            status: 1,
            createdAt: new Date().toISOString(),
            updatedAt: null
          }],
          attachments: null,
          createdAt: new Date().toISOString(),
          updatedAt: null
        }
      ],
      thumbnail: null,
      promoVideo: null,
      createdAt: new Date().toISOString(),
      updatedAt: null,
      questionBank: []
    },
  });

  const getAuthHeaders = useCallback(() => {
    const userStr = localStorage.getItem("user");
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        if (user && user.token) {
          return { "Authorization": `Bearer ${user.token}` };
        }
      } catch (error) {
        console.error("useCourseForm: Error parsing user", error);
      }
    }
    return {};
  }, []);

  // --- UPLOAD HELPERS ---
  const uploadImageToCloudinary = async (file) => {
    if (typeof file === "string") return file;
    if (!file || file === "mock-url") return file;
    const formData = new FormData();
    formData.append("file", file);
    const res = await fetch("http://localhost:8080/api/upload/image", {
      method: "POST",
      body: formData,
      headers: { ...getAuthHeaders() }
    });
    const jsonData = await res.json();
    return jsonData.url;
  };

  const uploadDocumentToCloudinary = async (file) => {
    if (typeof file === "string") return file;
    if (!file) return null;
    const formData = new FormData();
    formData.append("file", file);
    const res = await fetch("http://localhost:8080/api/upload/document", {
      method: "POST",
      body: formData,
      headers: { ...getAuthHeaders() }
    });
    const jsonData = await res.json();
    return jsonData.url;
  };

  const uploadVideoToBunny = async (file, title, onProgress) => {
    if (typeof file === "string") return file;
    if (!file || file === "mock-url") return file;

    const initRes = await fetch("http://localhost:8080/api/upload/video/init", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...getAuthHeaders()
      },
      body: JSON.stringify({ title }),
    });
    const { videoId, libraryId, apiKey } = await initRes.json();
    if (!videoId) throw new Error("Could not initialize video on Bunny.net");

    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.open("PUT", `https://video.bunnycdn.com/library/${libraryId}/videos/${videoId}`);
      xhr.setRequestHeader("AccessKey", apiKey);
      xhr.setRequestHeader("Accept", "application/json");
      xhr.setRequestHeader("Content-Type", "application/octet-stream");

      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable) {
          const percentComplete = Math.round((event.loaded / event.total) * 100);
          if (onProgress) onProgress(percentComplete);
        }
      };

      xhr.onload = () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          resolve(videoId);
        } else {
          reject(new Error("Upload video failed to Bunny CDN"));
        }
      };

      xhr.onerror = () => reject(new Error("Network Error during upload"));
      xhr.send(file);
    });
  };

  // --- DRAFT LOGIC ---
  const saveDraft = useCallback(async (formData, showNotification = false) => {
    if (isUploading) return;
    const currentString = JSON.stringify(formData);
    if (!showNotification && lastDraftRef.current === currentString) return;
    
    try {
      if (showNotification) setIsSavingDraft(true);
      
      const dataToSave = {
        ...formData,
        thumbnail: formData.thumbnail instanceof File ? null : formData.thumbnail,
        promoVideo: formData.promoVideo instanceof File ? null : formData.promoVideo,
        sections: formData.sections?.map(s => ({
          ...s,
          lessons: s.lessons?.map(l => ({
            ...l,
            videoFile: l.videoFile instanceof File ? null : l.videoFile
          })) || []
        })) || []
      };

      const url = isEditMode 
        ? `http://localhost:8080/api/courses/draft?courseId=${formData.id || ""}&slug=${slug || ""}`
        : `http://localhost:8080/api/courses/draft`;

      await axios.post(url, dataToSave, {
        headers: getAuthHeaders()
      });
      
      lastDraftRef.current = currentString;
      
      if (showNotification) {
        toast.success("Lưu bản nháp thành công! Bản nháp này có hiệu lực 24h.");
        setTimeout(() => navigate("/instructor/courses"), 1200);
      }
    } catch (error) {
      if (showNotification) {
        toast.error("Không thể lưu bản nháp");
      }
    } finally {
      setIsSavingDraft(false);
    }
  }, [isUploading, isEditMode, slug, getAuthHeaders, navigate]);

  const restoreDraft = useCallback(() => {
    if (pendingDraft) {
      const rawCategoryId = pendingDraft.categoryId || pendingDraft.category?.id;
      const mappedDraft = {
        ...pendingDraft,
        categoryId: rawCategoryId ? rawCategoryId.toString() : "",
        level: pendingDraft.level || "",
        status: (pendingDraft.status !== null && pendingDraft.status !== undefined) ? Number(pendingDraft.status) : 1,
        sections: pendingDraft.sections?.map(s => ({
          ...s,
          status: (s.status !== null && s.status !== undefined) ? Number(s.status) : 1,
          lessons: s.lessons?.map(l => ({
            ...l,
            status: (l.status !== null && l.status !== undefined) ? Number(l.status) : 1,
            videoFile: l.videoUrl || l.videoFile || null
          })) || []
        })) || []
      };
      
      methods.reset(mappedDraft);
      lastDraftRef.current = JSON.stringify(methods.getValues());
      toast.success("Đã khôi phục bản nháp");
    }
    setShowDraftModal(false);
  }, [pendingDraft, methods]);

  // --- INITIALIZATION ---
  useEffect(() => {
    categoryService.getAllCategories(1, 1000, "", "active").then((res) => {
      setCategories(res?.data?.content || []);
    }).catch(err => console.error("useCourseForm: Load categories error", err));
  }, []);

  useEffect(() => {
    const checkDraft = async () => {
      try {
        const url = isEditMode 
          ? `http://localhost:8080/api/courses/draft?slug=${slug}`
          : `http://localhost:8080/api/courses/draft`;
          
        const res = await axios.get(url, { headers: getAuthHeaders() });
        if (res.data) {
          const draftData = (res.data.data && res.data.error !== undefined) ? res.data.data : res.data;
          if (draftData) {
            if (isEditMode) {
                // Auto-restore for existing courses
                const rawCategoryId = draftData.categoryId || draftData.category?.id;
                const mappedDraft = {
                  ...draftData,
                  categoryId: rawCategoryId ? rawCategoryId.toString() : "",
                  level: draftData.level || "",
                  status: (draftData.status !== null && draftData.status !== undefined) ? Number(draftData.status) : 1,
                  sections: draftData.sections?.map(s => ({
                    ...s,
                    status: (s.status !== null && s.status !== undefined) ? Number(s.status) : 1,
                    lessons: s.lessons?.map(l => ({
                      ...l,
                      status: (l.status !== null && l.status !== undefined) ? Number(l.status) : 1,
                      videoFile: l.videoUrl || l.videoFile || null
                    })) || []
                  })) || []
                };
                methods.reset(mappedDraft);
                lastDraftRef.current = JSON.stringify(methods.getValues());
                draftLoadedRef.current = true;
            } else {
                setPendingDraft(draftData);
                setShowDraftModal(true);
            }
          }
        }
      } catch (error) {}
    };
    checkDraft();
  }, [isEditMode, slug, getAuthHeaders, methods]);

  useEffect(() => {
    const loadCourseData = async () => {
      if (isEditMode && slug !== "new") {
        try {
          const data = await courseService.getCourseBySlug(slug);
          if (draftLoadedRef.current) return;

          // Eagerly load questions bank so it is available immediately for onSubmit
          let bankQuestions = [];
          try {
            if (data && data.id) {
              const qs = await courseService.getDraftQuestions(data.id);
              if (qs && Array.isArray(qs)) {
                bankQuestions = qs;
              }
            }
          } catch (qErr) {
            console.error("Không thể tải trước ngân hàng câu hỏi:", qErr);
          }

          const mappedData = {
            ...data,
            categoryId: data.categoryId?.toString() || "",
            status: (data.status !== null && data.status !== undefined) ? Number(data.status) : 1,
            questionBank: bankQuestions,
            sections: data.modules?.map(m => ({
              ...m,
              status: (m.status !== null && m.status !== undefined) ? Number(m.status) : 1,
              attachments: m.attachments?.[0]?.fileUrl || null,
              lessons: m.lessons?.map(l => ({
                ...l,
                status: (l.status !== null && l.status !== undefined) ? Number(l.status) : 1,
                videoFile: l.videoUrl || null
              })) || []
            })) || []
          };
          
          methods.reset(mappedData);
          lastDraftRef.current = JSON.stringify(methods.getValues());
          originalDataRef.current = lastDraftRef.current;
        } catch (err) {
          console.error("Lỗi khi tải dữ liệu khóa học:", err);
        }
      } else if (!isEditMode && !originalDataRef.current) {
          originalDataRef.current = JSON.stringify(methods.getValues());
      }
    };
    loadCourseData();
  }, [isEditMode, slug, methods]);

  // --- EXIT LOGIC ---
  const handleExitWithConfirmation = useCallback(async () => {
    const currentData = methods.getValues();
    const isDirty = originalDataRef.current && JSON.stringify(currentData) !== originalDataRef.current;

    if (isDirty) {
      const confirmMsg = isEditMode 
        ? "Bạn có các thay đổi chưa lưu. Bạn có chắc chắn muốn thoát và HỦY BỎ toàn bộ các thay đổi mới không?" 
        : "Bạn đang tạo khóa học mới nhưng chưa xuất bản. Bạn có chắc chắn muốn thoát và xóa bỏ bản nháp hiện tại không?";
        
      if (window.confirm(confirmMsg)) {
        try {
          const idToUse = isEditMode ? (currentData.id?.toString() || "") : "";
          const slugToUse = isEditMode ? (slug || "") : null;
          await courseService.deleteDraft({ courseId: idToUse, slug: slugToUse });
          isSubmittingRef.current = true;
          navigate("/instructor/courses");
        } catch (error) {
          isSubmittingRef.current = true;
          navigate("/instructor/courses");
        }
      }
    } else {
      navigate("/instructor/courses");
    }
  }, [isEditMode, slug, methods, navigate]);

  return {
    methods,
    isEditMode,
    slug,
    activeTab,
    setActiveTab,
    isUploading,
    setIsUploading,
    uploadStatus,
    setUploadStatus,
    activeUploads,
    setActiveUploads,
    isSavingDraft,
    showDraftModal,
    setShowDraftModal,
    categories,
    saveDraft,
    restoreDraft,
    handleExitWithConfirmation,
    isSubmittingRef,
    originalDataRef,
    uploadImageToCloudinary,
    uploadVideoToBunny,
    uploadDocumentToCloudinary,
    getAuthHeaders
  };
}
