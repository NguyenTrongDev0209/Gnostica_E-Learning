import { useState, useEffect } from "react";
import { toast } from "sonner";

export default function useSettingsForm(user) {
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    bio: "",
    avatar: ""
  });

  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [personalizationOpen, setPersonalizationOpen] = useState(false);
  const [cropModalOpen, setCropModalOpen] = useState(false);
  const [tempImage, setTempImage] = useState(null);

  useEffect(() => {
    if (user) {
      setFormData({
        fullName: user.fullName || "",
        email: user.email || "",
        phone: user.phone || "",
        bio: user.bio || "",
        avatar: user.avatar || ""
      });
    }
  }, [user]);

  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData(prev => ({ ...prev, [id]: value }));
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setTempImage(event.target.result);
        setCropModalOpen(true);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCropComplete = (croppedImage) => {
    setFormData(prev => ({ ...prev, avatar: croppedImage }));
    setCropModalOpen(false);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsLoading(true);
    setTimeout(() => {
      toast.success("Cập nhật thông tin thành công!");
      setIsLoading(false);
    }, 800);
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
