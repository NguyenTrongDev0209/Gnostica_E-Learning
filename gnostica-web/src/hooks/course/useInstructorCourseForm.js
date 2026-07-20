import React, { useState, useEffect, useCallback, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate, useParams } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axiosClient from "@/lib/axiosClient";
import { toast } from "sonner";
import courseService from "@/services/course/courseService";
import categoryService from "@/services/course/categoryService";
import questionService from "@/services/course/questionService";

/**
 * Hook quản lý toàn bộ logic cho InstructorCourseForm.
 * Đã áp dụng React Query cho các mutation lớn (Save Draft) và Load Dữ Liệu Danh Mục.
 */
export default function useInstructorCourseForm(courseSchema, viErrorMap) {
  const navigate = useNavigate();
  const { slug } = useParams();
  const isEditMode = !!slug;
  const isSubmittingRef = useRef(false);
  const lastDraftRef = useRef(null);
  const draftLoadedRef = useRef(false);
  const originalDataRef = useRef(null);
  const queryClient = useQueryClient();

  const [activeTab, setActiveTab] = useState("basic");
  const [isUploading, setIsUploading] = useState(false);
  const isUploadingRef = useRef(false);
  
  const handleSetIsUploading = useCallback((val) => {
    isUploadingRef.current = val;
    setIsUploading(val);
  }, []);

  const [uploadStatus, setUploadStatus] = useState("");
  const [activeUploads, setActiveUploads] = useState(0);
  const [showDraftModal, setShowDraftModal] = useState(false);
  const [pendingDraft, setPendingDraft] = useState(null);

  const methods = useForm({
    resolver: zodResolver(courseSchema, { errorMap: viErrorMap }),
    defaultValues: {
      id: "",
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
  const uploadImageToCloudinary = useCallback(async (file) => {
    if (typeof file === "string") return file;
    if (!file || file === "mock-url") return file;
    const formData = new FormData();
    formData.append("file", file);
    const response = await axiosClient.post("/upload/image", formData, {
      headers: {
        "Content-Type": "multipart/form-data"
      }
    });
    return response.data?.url || response.data;
  }, []);

  const uploadDocumentToCloudinary = useCallback(async (file) => {
    if (typeof file === "string") return file;
    if (!file) return null;
    const formData = new FormData();
    formData.append("file", file);
    const response = await axiosClient.post("/upload/document", formData, {
      headers: {
        "Content-Type": "multipart/form-data"
      }
    });
    return response.data?.url || response.data;
  }, []);

  const uploadVideoToBunny = useCallback(async (file, title, onProgress) => {
    if (typeof file === "string") return file;
    if (!file || file === "mock-url") return file;

    const initRes = await axiosClient.post("/upload/video/init", { title });
    const { videoId, libraryId, authorizationSignature, authorizationExpire } = initRes.data;
    if (!videoId) throw new Error("Could not initialize video on Bunny.net");

    return new Promise((resolve, reject) => {
      import("tus-js-client").then((tus) => {
        const upload = new tus.Upload(file, {
          endpoint: "https://video.bunnycdn.com/tusupload",
          retryDelays: [0, 3000, 5000, 10000, 20000],
          // A new videoId and signature are issued above for every attempt.
          // Never reuse a stored TUS URL belonging to an older videoId.
          removeFingerprintOnSuccess: true,
          headers: {
            AuthorizationSignature: authorizationSignature,
            AuthorizationExpire: String(authorizationExpire),
            LibraryId: String(libraryId),
            VideoId: String(videoId)
          },
          metadata: {
            filetype: file.type,
            title: title || file.name
          },
          onError: function (error) {
            const status = error.originalResponse?.getStatus?.();
            const body = error.originalResponse?.getBody?.();
            console.error("Bunny TUS upload failed", { status, body, error });
            reject(new Error(
              `Upload video failed to Bunny CDN via TUS${status ? ` (HTTP ${status})` : ""}`
            ));
          },
          onProgress: function (bytesUploaded, bytesTotal) {
            const percentComplete = Math.round((bytesUploaded / bytesTotal) * 100);
            if (onProgress) onProgress(percentComplete);
          },
          onSuccess: function () {
            resolve(`${libraryId}/${videoId}`);
          }
        });

        upload.start();
      }).catch(err => {
        console.error("Failed to load tus-js-client", err);
        reject(err);
      });
    });
  }, []);

  // --- DRAFT LOGIC WITH REACT QUERY MUTATION ---
  const saveDraftMutation = useMutation({
    mutationFn: async (formData) => {
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

      const url = isEditMode ? `/courses/draft?courseId=${formData.id || ""}&slug=${slug || ""}` : `/courses/draft`;
      return await axiosClient.post(url, dataToSave);
    }
  });

  const saveDraft = useCallback(async (formData, showNotification = false) => {
    if (isUploadingRef.current) return;
    const currentString = JSON.stringify(formData);
    if (!showNotification && lastDraftRef.current === currentString) return;
    
    try {
      lastDraftRef.current = currentString;
      await saveDraftMutation.mutateAsync(formData);
      
      if (showNotification) {
        toast.success("Lưu bản nháp thành công! Bản nháp này có hiệu lực 24h.");
        setTimeout(() => navigate("/instructor/courses"), 1200);
      }
    } catch (error) {
      if (showNotification) {
        toast.error("Không thể lưu bản nháp");
      }
    }
  }, [saveDraftMutation, navigate]);

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

  // --- REACT QUERY FOR DATA FETCHING ---
  const { data: categories = [] } = useQuery({
    queryKey: ['categories_active'],
    queryFn: async () => {
      const res = await categoryService.getAllCategories(1, 1000, "", "active");
      return res?.data?.content || [];
    },
    staleTime: 1000 * 60 * 10
  });

  useEffect(() => {
    const checkDraft = async () => {
      try {
        const url = isEditMode ? `/courses/draft?slug=${slug}` : `/courses/draft`;
        const res = await axiosClient.get(url);
        if (res && res.data) {
          const draftData = res.data;
          if (draftData && Object.keys(draftData).length > 0) {
            if (isEditMode) {
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
          } else {
            if (!isEditMode) localStorage.removeItem("course_questions_new");
          }
        } else {
          if (!isEditMode) localStorage.removeItem("course_questions_new");
        }
      } catch (error) {
        if (!isEditMode) localStorage.removeItem("course_questions_new");
      }
    };
    checkDraft();
  }, [isEditMode, slug, methods]);

  useEffect(() => {
    const loadCourseData = async () => {
      if (isEditMode && slug !== "new") {
        try {
          const data = await courseService.getCourseBySlug(slug);
          if (draftLoadedRef.current) return;

          let bankQuestions = [];
          try {
            if (data && data.id) {
              const qs = await questionService.getDraftQuestions(data.id);
              if (qs && Array.isArray(qs)) {
                bankQuestions = qs;
              }
            }
          } catch (qErr) {}

          const mappedData = {
            ...data,
            categoryId: data.categoryId?.toString() || "",
            status: (data.status !== null && data.status !== undefined) ? Number(data.status) : 1,
            promoVideo: data.promoVideo || null,
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
        } catch (err) {}
      } else if (!isEditMode && !originalDataRef.current) {
          originalDataRef.current = JSON.stringify(methods.getValues());
      }
    };
    loadCourseData();
  }, [isEditMode, slug, methods]);

  // --- EXIT LOGIC ---
  const handleExitWithConfirmation = useCallback(async () => {
    const isDirty = methods.formState.isDirty;

    if (isDirty) {
      const confirmMsg = isEditMode 
        ? "Bạn có các thay đổi chưa lưu. Bạn có chắc chắn muốn thoát và HỦY BỎ toàn bộ các thay đổi mới không?" 
        : "Bạn đang tạo khóa học mới nhưng chưa xuất bản. Bạn có chắc chắn muốn thoát và xóa bỏ bản nháp hiện tại không?";
        
      if (window.confirm(confirmMsg)) {
        try {
          const idToUse = isEditMode ? (methods.getValues().id?.toString() || "") : "";
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

  // --- GLOBAL CLICK & UNLOAD EVENTS ---
  useEffect(() => {
    const handleGlobalClick = async (e) => {
      if (isSubmittingRef.current) return;
      const anchor = e.target.closest('a');
      const button = e.target.closest('button');
      const isNavAction =
        (anchor && anchor.getAttribute('href')) ||
        (button && (
          button.title === "Đăng xuất" ||
          button.title?.includes("Về trang chủ") ||
          button.innerText.includes("Tạo khóa học mới") ||
          button.closest('aside')
        ));

      if (!isNavAction) return;
      
      const isDirty = methods.formState.isDirty;
      if (isDirty) {
        const confirmMsg = isEditMode
          ? "Bạn có các thay đổi chưa lưu. Bạn có chắc chắn muốn thoát và HỦY BỎ toàn bộ các thay đổi mới này để quay lại dữ liệu gốc không?"
          : "Bạn đang tạo khóa học mới nhưng chưa xuất bản. Bạn có chắc chắn muốn thoát và xóa bỏ bản nháp hiện tại không?";

        if (!window.confirm(confirmMsg)) {
          e.preventDefault();
          e.stopPropagation();
        } else {
          try {
            let originalData = {};
            try {
               originalData = JSON.parse(originalDataRef.current || "{}");
            } catch (err) {}
            const idToUse = isEditMode ? (originalData?.id?.toString() || "") : "";
            const slugToUse = isEditMode ? (slug || "") : null;
            isSubmittingRef.current = true;
            courseService.deleteDraft({ courseId: idToUse, slug: slugToUse });
          } catch (err) {
            isSubmittingRef.current = true;
          }
        }
      }
    };
    document.addEventListener('click', handleGlobalClick, true);
    return () => document.removeEventListener('click', handleGlobalClick, true);
  }, [isEditMode, slug, methods, originalDataRef, isSubmittingRef]);

  useEffect(() => {
    const handleBeforeUnload = (e) => {
      const isDirty = methods.formState.isDirty;
      if (isDirty) {
        saveDraft(methods.getValues(), false);
        e.preventDefault();
        e.returnValue = '';
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [saveDraft, methods]);

  // --- AUTO SAVE & UPLOAD LOGIC ---
  useEffect(() => {
    const timer = setInterval(() => {
      saveDraft(methods.getValues(), false);
    }, 10000);
    return () => clearInterval(timer);
  }, [methods, saveDraft]);

  const watchThumbnail = methods.watch("thumbnail");
  useEffect(() => {
    if (watchThumbnail instanceof File) {
      const autoUploadThumbnail = async () => {
        try {
          handleSetIsUploading(true);
          setUploadStatus("Đang tải lên ảnh đại diện...");
          const url = await uploadImageToCloudinary(watchThumbnail);
          methods.setValue("thumbnail", url);
          saveDraft({ ...methods.getValues(), thumbnail: url }, false);
        } catch (error) {
          toast.error("Không thể tải lên ảnh đại diện tự động");
        } finally {
          handleSetIsUploading(false);
          setUploadStatus("");
        }
      };
      autoUploadThumbnail();
    }
  }, [watchThumbnail, methods, uploadImageToCloudinary, saveDraft, handleSetIsUploading, setUploadStatus]);

  // --- SUBMIT ---
  const onSubmit = async (data) => {
    try {
      handleSetIsUploading(true);
      setUploadStatus("Đang kiểm tra dữ liệu...");

      if (data.thumbnail && data.thumbnail instanceof File) {
        setUploadStatus("Đang tải lên ảnh đại diện...");
        data.thumbnail = await uploadImageToCloudinary(data.thumbnail);
      }

      if (data.promoVideo && data.promoVideo instanceof File) {
        setUploadStatus("Đang hoàn tất tải video giới thiệu...");
        try {
          data.promoVideo = await uploadVideoToBunny(data.promoVideo, "Promo Video");
        } catch (vErr) {
          data.promoVideo = "upload-failed-promo";
        }
      }

      for (let sIdx = 0; sIdx < data.sections.length; sIdx++) {
        const section = data.sections[sIdx];
        if (section.attachments && section.attachments instanceof File) {
          setUploadStatus(`Đang xử lý tài liệu chương ${sIdx + 1}...`);
          try {
            section.attachments = await uploadDocumentToCloudinary(section.attachments);
          } catch (docErr) {
            section.attachments = null;
          }
        }

        for (let lIdx = 0; lIdx < section.lessons.length; lIdx++) {
          const lesson = section.lessons[lIdx];
          if (lesson.videoFile && lesson.videoFile instanceof File) {
            setUploadStatus(`Đang hoàn tất bài: ${lesson.title}`);
            try {
              lesson.videoUrl = await uploadVideoToBunny(lesson.videoFile, lesson.title);
              lesson.videoFile = lesson.videoUrl;
            } catch (vErr) {
              lesson.videoUrl = "upload-failed-lesson";
            }
          }
        }
      }

      setUploadStatus("Đang tiến hành xuất bản...");
      data.updatedAt = new Date().toISOString();
      isSubmittingRef.current = true;

      const sanitizeId = (id) => (typeof id === 'number' || (!isNaN(id) && id !== "")) ? Number(id) : null;

      const finalData = {
        ...data,
        categoryId: Number(data.categoryId),
        price: Number(data.price),
        questionBank: data.questionBank || [],
        sections: data.sections?.map(s => ({
          ...s,
          id: sanitizeId(s.id),
          lessons: s.lessons?.map(l => ({
            ...l,
            id: sanitizeId(l.id),
            videoUrl: typeof l.videoFile === "string" ? l.videoFile : l.videoUrl
          }))
        }))
      };

      if (isEditMode && slug !== "new") {
        await courseService.updateCourse(slug, finalData);
      } else {
        await courseService.createCourse(finalData);
      }

      localStorage.removeItem(`course_questions_${slug || 'new'}`);
      toast.success(isEditMode && slug !== "new" ? "Cập nhật khóa học thành công!" : "Lưu khóa học thành công!");
      setTimeout(() => navigate("/instructor/courses"), 1500);
    } catch (error) {
      console.error("Submit Error:", error);
      toast.error(error.response?.data?.error || "Lỗi tải lên hoặc lưu khóa học.");
    } finally {
      handleSetIsUploading(false);
      setUploadStatus("");
    }
  };

  return {
    methods,
    isEditMode,
    slug,
    activeTab,
    setActiveTab,
    isUploading,
    setIsUploading: handleSetIsUploading,
    uploadStatus,
    setUploadStatus,
    activeUploads,
    setActiveUploads,
    isSavingDraft: saveDraftMutation.isPending,
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
    getAuthHeaders,
    onSubmit
  };
}
