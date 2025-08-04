// src/hooks/useToast.ts

import { useCallback } from "react";
import { toast, type ToastOptions } from "react-toastify";

interface CustomToastOptions extends ToastOptions {
  message?: string;
}

export const useToast = () => {
  const showToast = useCallback(
    (
      message: string,
      type: "success" | "error" | "info" | "warn" = "info",
      options?: CustomToastOptions
    ) => {
      switch (type) {
        case "success":
          toast.success(message, options);
          break;
        case "error":
          toast.error(message, options);
          break;
        case "info":
          toast.info(message, options);
          break;
        case "warn":
          toast.warn(message, options);
          break;
        default:
          toast(message, options);
      }
    },
    []
  );

  return { showToast };
};
