import { toast } from "sonner";
import { Toaster as SonnerToaster } from "@/components/ui/sonner";

/**
 * AppToaster - Provider để render các Toast (thường đặt ở file root App.jsx)
 */
export function AppToaster(props) {
  return <SonnerToaster position="bottom-right" {...props} />;
}

/**
 * AppToast - Wrapper gọi hàm Toast (success, error, info, warning)
 * Thay vì import toast của sonner ở khắp nơi, dùng AppToast để thống nhất cách gọi
 * và dễ dàng chỉnh sửa/format chung nếu cần.
 */
export const AppToast = {
  success: (message, options) => {
    return toast.success(message, {
      className: "border-success/50 bg-success-soft-bg text-success-foreground",
      ...options,
    });
  },
  
  error: (message, options) => {
    return toast.error(message, {
      className: "border-error/50 bg-error-soft-bg text-error-foreground",
      ...options,
    });
  },
  
  info: (message, options) => {
    return toast.info(message, {
      className: "border-info/50 bg-info-soft-bg text-info-foreground",
      ...options,
    });
  },
  
  warning: (message, options) => {
    return toast.warning(message, {
      className: "border-warning/50 bg-warning-soft-bg text-warning-foreground",
      ...options,
    });
  },

  message: (message, options) => {
    return toast(message, options);
  },

  promise: (promise, options) => {
    return toast.promise(promise, options);
  },

  dismiss: (toastId) => {
    return toast.dismiss(toastId);
  }
};
