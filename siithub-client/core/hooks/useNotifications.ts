import { toast } from "react-toastify"

export function useNotifications() {
  return {

    success: function(text: string) {
      toast.success(text);
    },

    error: function(text: string) {
      toast.error(text);
    }
  }
};