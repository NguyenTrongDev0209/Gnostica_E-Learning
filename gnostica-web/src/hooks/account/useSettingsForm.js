import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

export default function useSettingsForm(user) {
  const [loading, setLoading] = useState(false);
  
  const form = useForm({
    defaultValues: {
      fullName: "",
      phone: "",
      headline: "",
      bio: "",
      website: "",
      facebook: "",
      linkedin: "",
    }
  });

  useEffect(() => {
    if (user) {
      form.reset({
        fullName: user.fullName || "",
        phone: user.phone || "",
        headline: user.headline || "H?c vi�n t?i Gnostica",
        bio: user.bio || "Xin ch�o, t�i l� h?c vi�n m?i.",
        website: user.website || "",
        facebook: user.facebook || "",
        linkedin: user.linkedin || "",
      });
    }
  }, [user, form]);

  const onSubmit = (data) => {
    setLoading(true);
    setTimeout(() => {
      toast.success("C?p nh?t th�ng tin th�nh c�ng!");
      setLoading(false);
    }, 800);
  };

  const handleAvatarUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      toast.success("�� t?i ?nh l�n th�nh c�ng (mock)");
    }
  };

  return {
    form,
    loading,
    onSubmit: form.handleSubmit(onSubmit),
    handleAvatarUpload
  };
}
