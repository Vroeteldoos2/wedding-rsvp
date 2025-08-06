import { Toaster, toast } from "react-hot-toast";

export const notifySuccess = (msg) => toast.success(msg);
export const notifyError = (msg) => toast.error(msg);

export function ToastProvider({ children }) {
  return (
    <>
      <Toaster position="top-center" />
      {children}
    </>
  );
}