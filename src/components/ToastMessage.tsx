"use client";

import { useEffect } from "react";

interface ToastMessageProps {
  message: string | null;
  onClose: () => void;
}

export function ToastMessage({ message, onClose }: ToastMessageProps) {
  useEffect(() => {
    if (!message) {
      return;
    }
    const timer = window.setTimeout(onClose, 2600);
    return () => window.clearTimeout(timer);
  }, [message, onClose]);

  if (!message) {
    return null;
  }

  return (
    <div className="fixed right-4 top-4 z-50 rounded border border-slate-300 bg-white px-4 py-2 text-sm shadow-sm">
      {message}
    </div>
  );
}
