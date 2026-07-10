import { useState, useEffect } from "react";
import { toast } from "sonner";
import accountService from "@/services/user/accountService";

export default function useSettingsForm(user) {
  const [personalizationOpen, setPersonalizationOpen] = useState(false);
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    bio: "",
    avatar: "",
  });

  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  // Crop state
  const [cropModalOpen, setCropModalOpen] = useState(false);
  const [tempImage, setTempImage] = useState(null);

  useEffect(() => {
    if (user) {
      setFormData({
        fullName: user.fullName || "",
        email: user.email || "",
        phone: user.phone || "",
        bio: "Học viên đam mê công nghệ và lập trình. Luôn thích khám phá các kiến thức mới về Frontend Development.",
        avatar: user.avatar || "",
      });
    }
  }, [user]);

  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Vui lòng chọn tệp hình ảnh!');
      return;
    }

    const reader = new FileReader();
    reader.addEventListener('load', () => {
      setTempImage(reader.result);
      setCropModalOpen(true);
    });
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const handleCropComplete = async (croppedFile) => {
    try {
      setIsUploading(true);
      const res = await accountService.updateAvatar(user.email, croppedFile);
      if (res.status === 200) {
        setFormData(prev => ({ ...prev, avatar: res.data.avatarUrl }));
        toast.success('Cập nhật ảnh đại diện thành công!');
        window.dispatchEvent(new Event('storage'));
      }
    } catch (error) {
      toast.error(error.message || 'Có lỗi xảy ra');
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsLoading(true);

    // Simulate API call for other profile info
    setTimeout(() => {
      setIsLoading(false);
      toast.success("Đã cập nhật thông tin cá nhân thành công!");
    }, 1000);
  };

  return {
    formData,
    isLoading,
    isUploading,
    personalizationOpen,
    setPersonalizationOpen,
    cropModalOpen,
    setCropModalOpen,
    tempImage,
    handleChange,
    handleAvatarChange,
    handleCropComplete,
    handleSubmit
  };
}
