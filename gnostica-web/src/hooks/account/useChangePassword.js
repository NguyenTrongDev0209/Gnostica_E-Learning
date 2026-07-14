import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

export default function useChangePassword() {
  const [loading, setLoading] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const form = useForm({
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: ""
    }
  });

  const onSubmit = (data) => {
    if (data.newPassword !== data.confirmPassword) {
      form.setError("confirmPassword", { message: "M?t kh?u x�c nh?n kh�ng kh?p" });
      return;
    }
    
    setLoading(true);
    setTimeout(() => {
      toast.success("�?i m?t kh?u th�nh c�ng!");
      form.reset();
      setLoading(false);
    }, 800);
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
