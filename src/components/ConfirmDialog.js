"use client";

import { useEffect } from "react";
import Button from "@/components/Button";

export default function ConfirmDialog({ open, title = "Confirm", description, confirmText = "Confirm", onConfirm, onClose }) {
  useEffect(() => {
    function onKey(e) {
      if (e.key === "Escape") onClose?.();
    }
    if (open) window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/30 p-4">
      <div className="w-full max-w-md rounded-2xl bg-white shadow-xl">
        <div className="border-b border-slate-100 px-5 py-4">
          <div className="text-sm font-semibold text-slate-900">{title}</div>
        </div>
        <div className="px-5 py-4 text-sm text-slate-700">{description}</div>
        <div className="flex items-center justify-end gap-2 border-t border-slate-100 px-5 py-4">
          <Button variant="secondary" onClick={onClose}>Cancel</Button>
          <Button variant="primary" onClick={onConfirm}>{confirmText}</Button>
        </div>
      </div>
    </div>
  );
}
