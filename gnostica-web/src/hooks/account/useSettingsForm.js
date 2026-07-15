import { useState, useEffect } from "react";
import { toast } from "sonner";
import useAuthStore from "@/store/useAuthStore";

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

  const setUser = useAuthStore(state => state.setUser);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user?.email) return;

    setIsLoading(true);
    try {
      // 1. Update Profile
      const res = await fetch(`http://localhost:8080/api/account/profile?email=${user.email}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName: formData.fullName,
          phone: formData.phone,
          bio: formData.bio,
          title: "", // Not used in form currently
          website: "", // Not used
          linkedin: "" // Not used
        })
      });

      if (res.ok) {
        // Update user state and local storage
        const updatedUser = { ...user, fullName: formData.fullName, phone: formData.phone, bio: formData.bio };
        setUser(updatedUser);
        localStorage.setItem("user", JSON.stringify(updatedUser));
        
        toast.success("Cập nhật thông tin thành công!");
      } else {
        toast.error("Cập nhật thất bại.");
      }
    } catch (error) {
      toast.error("Lỗi khi cập nhật.");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
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
