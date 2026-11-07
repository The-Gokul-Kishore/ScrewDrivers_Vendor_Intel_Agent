import { useState } from "react";
import { ShieldCheck, X } from "lucide-react";
import { formatINR, vendorById, type ExceptionRow } from "../data/seed";
import { useDemoStore } from "../store/useDemoStore";
import { ThreadMark } from "./ThreadMark";

export function ApprovalModal({
  exception,
  actionLabel,
  onClose,
}: {
  exception: ExceptionRow;
  actionLabel: string;
  onClose: () => void;
}) {
  const approveException = useDemoStore((s) => s.approveException);
  const [verified, setVerified] = useState(false);
  const [note, setNote] = useState("");
  const vendor = vendorById(exception.vendorId);

  const confirm = () => {
    approveException(exception.id);
    onClose();
  };

  return (
    <div className="modal-wrap" role="dialog" aria-modal="true" aria-label="Approve action">
      <div className="modal">
        <div className="modal-head">
          <div className="pane-mark">
            <ThreadMark size={16} />
          </div>
          <div>
            <div className="modal-title">Approve action</div>
            <div className="card-sub">
              {exception.type} · <span className="mono">{exception.invoiceId}</span>
            </div>
          </div>
          <button className="icon-btn" style={{ marginLeft: "auto" }} onClick={onClose} aria-label="Close">
            <X size={16} />
          </button>
        </div>

        <div className="modal-body">
          <div className="reco" style={{ marginBottom: 14 }}>
            <b>{actionLabel}</b>
            <div style={{ marginTop: 4, color: "var(--muted)", fontSize: 11.5 }}>
              {vendor.name} · {formatINR(exception.amountAtRisk)} at risk · routed to AP Manager
            </div>
          </div>

          <div className="field-grid" style={{ marginBottom: 12 }}>
            <div className="field">
              <div className="field-label">Exception</div>
              <div className="field-value">{exception.type}</div>
            </div>
            <div className="field">
              <div className="field-label">Approver</div>
              <div className="field-value">R. Menon · AP Manager</div>
            </div>
            <div className="field">
              <div className="field-label">Authority</div>
              <div className="field-value">Up to ₹5,00,000</div>
            </div>
            <div className="field">
              <div className="field-label">Executes payment</div>
              <div className="field-value" style={{ color: "var(--ok)" }}>
                No · recommendation only
              </div>
            </div>
          </div>

          <label className="field-label" htmlFor="approval-note">
            Note for the audit trail
          </label>
          <textarea
            id="approval-note"
            className="input"
            style={{ width: "100%", height: 64, padding: 9, marginTop: 4, resize: "vertical" }}
            placeholder="Optional — e.g. PO-204 freight confirmed"
            value={note}
            onChange={(e) => setNote(e.target.value)}
          />

          <label
            className="row"
            style={{ gap: 8, marginTop: 12, fontSize: 12, color: "var(--muted)" }}
          >
            <input
              type="checkbox"
              checked={verified}
              onChange={(e) => setVerified(e.target.checked)}
              style={{ accentColor: "#4f46e5" }}
            />
            I verified the current PO, contract or policy for this vendor.
          </label>
        </div>

        <div className="modal-foot">
          <button className="btn" onClick={onClose}>
            Cancel
          </button>
          <button className="btn primary" disabled={!verified} onClick={confirm}>
            <ShieldCheck size={15} /> Approve &amp; resolve
          </button>
        </div>
      </div>
    </div>
  );
}
