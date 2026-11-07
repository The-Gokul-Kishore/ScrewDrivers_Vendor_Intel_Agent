import { useEffect } from "react";
import { useDemoStore } from "../store/useDemoStore";
import { ThreadMark } from "./ThreadMark";

export function Toast() {
  const toast = useDemoStore((s) => s.toast);
  const clearToast = useDemoStore((s) => s.clearToast);

  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(() => clearToast(), 4500);
    return () => window.clearTimeout(timer);
  }, [toast?.nonce, toast, clearToast]);

  if (!toast) return null;

  return (
    <div className="toast" role="status" aria-live="polite">
      <span className="toast-mark">
        <ThreadMark size={13} />
      </span>
      <span>
        <b style={{ fontWeight: 650 }}>{toast.message}</b>
        {toast.detail && <span style={{ color: "#cbd5e1", marginLeft: 6 }}>{toast.detail}</span>}
      </span>
    </div>
  );
}
