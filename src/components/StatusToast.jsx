import { useEffect } from "react";

export default function StatusToast({ type = "success", message, onClose }) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 3000); // Auto-close after 3s
    return () => clearTimeout(timer);
  }, [onClose]);

  const bgColor =
    type === "success"
      ? "bg-green-500 border-green-700"
      : "bg-red-500 border-red-700";

  return (
    <div
      className={`fixed top-5 right-5 z-50 px-4 py-2 rounded shadow-lg border text-white ${bgColor}`}
    >
      {message}
    </div>
  );
}
