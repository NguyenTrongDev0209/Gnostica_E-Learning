import { useState } from "react";
import { toast } from "sonner";

export default function useChangePassword() {
  const [formData, setFormData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [showPassword, setShowPassword] = useState({
    current: false,
    new: false,
    confirm: false,
  });

  const [isLoading, setIsLoading] = useState(false);

  const togglePasswordVisibility = (field) => {
    setShowPassword((prev) => ({ ...prev, [field]: !prev[field] }));
  };

  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (formData.newPassword !== formData.confirmPassword) {
      toast.error("Mật khẩu xác nhận không khớp!");
      return;
    }

    if (formData.newPassword.length < 8) {
      toast.error("Mật khẩu mới phải có ít nhất 8 ký tự.");
      return;
    }

    setIsLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      setFormData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
      toast.success("Mật khẩu đã được thay đổi an toàn!");
    }, 1200);
  };

  // Password Strength Indicators
  const pwdLength = formData.newPassword.length;
  const hasUpperCase = /[A-Z]/.test(formData.newPassword);
  const hasNumber = /[0-9]/.test(formData.newPassword);
  const hasSpecial = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]+/.test(formData.newPassword);
  
  const strengthScore = [pwdLength >= 8, hasUpperCase, hasNumber, hasSpecial].filter(Boolean).length;
  
  const getStrengthWord = () => {
    if (pwdLength === 0) return { word: "", color: "bg-muted" };
    if (strengthScore <= 1) return { word: "Yếu", color: "bg-error/10 text-error" };
    if (strengthScore === 2) return { word: "Trung bình", color: "bg-warning/10 text-warning" };
    if (strengthScore >= 3) return { word: "Mạnh", color: "bg-emerald-500" };
    return { word: "", color: "bg-muted" };
  };

  const strengthInfo = getStrengthWord();

  return {
    formData,
    showPassword,
    isLoading,
    togglePasswordVisibility,
    handleChange,
    handleSubmit,
    pwdLength,
    hasUpperCase,
    hasNumber,
    hasSpecial,
    strengthScore,
    strengthInfo
  };
}
