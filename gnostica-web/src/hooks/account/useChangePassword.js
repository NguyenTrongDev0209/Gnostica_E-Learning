import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import useAuthStore from "@/store/useAuthStore";

export default function useChangePassword() {
  const [loading, setLoading] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const token = useAuthStore(state => state.user?.token);

  const form = useForm({
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: ""
    }
  });

  const onSubmit = async (data) => {
    if (data.newPassword !== data.confirmPassword) {
      form.setError("confirmPassword", { message: "Mật khẩu xác nhận không khớp" });
      return;
    }
    
    if (!token) { setLoading(false); return; }

    setLoading(true);
    try {
      const res = await fetch("http://localhost:8080/api/account/change-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          currentPassword: data.currentPassword,
          newPassword: data.newPassword
        })
      });

      const result = await res.json();
      if (res.ok) {
        toast.success("Đổi mật khẩu thành công!");
        form.reset();
      } else {
        toast.error(result.message || "Đổi mật khẩu thất bại");
      }
    } catch (error) {
      toast.error("Lỗi khi đổi mật khẩu");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return {
    form,
    loading,
    onSubmit: form.handleSubmit(onSubmit),
    showCurrentPassword,
    setShowCurrentPassword,
    showNewPassword,
    setShowNewPassword,
    showConfirmPassword,
    setShowConfirmPassword
  };
}
