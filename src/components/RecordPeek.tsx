import { ArrowUpRight, X } from "lucide-react";
import { recordDetails } from "../data/seed";
import { useDemoStore } from "../store/useDemoStore";

export function RecordPeek({
  recordId,
  onClose,
}: {
  recordId: string | null;
  onClose: () => void;
}) {
  const showToast = useDemoStore((s) => s.showToast);
  if (!recordId) return null;

  const record = recordDetails[recordId];
  const isCase = recordId.startsWith("INV-100") || recordId.startsWith("INV-1012");

  return (
    <>
      <div className="overlay" style={{ zIndex: 70 }} onClick={onClose} aria-hidden="true" />
      <aside className="peek" role="dialog" aria-modal="true" aria-label={`${recordId} detail`}>
        <div className="peek-head">
          <div>
            <div className="pane-title mono">{recordId}</div>
            <div className="pane-sub">
              {record?.subtitle ?? (isCase ? "Prior case" : "Source record")}
            </div>
          </div>
          <span className="spacer" />
          <span className="pill neutral">Source record</span>
          <button className="icon-btn" onClick={onClose} aria-label="Close record">
            <X size={16} />
          </button>
        </div>

        <div className="peek-body">
          {record ? (
            <div>
              <div className="field-grid">
                {record.fields.map((f) => (
                  <div className="field" key={f.label}>
                    <div className="field-label">{f.label}</div>
                    <div className="field-value">
                      {f.highlight ? <span className="highlight">{f.value}</span> : f.value}
                    </div>
                  </div>
                ))}
              </div>

              <div
                className="row"
                style={{
                  marginTop: 16,
                  padding: "9px 10px",
                  borderRadius: 8,
                  background: "#f8fafc",
                  border: "1px solid var(--border)",
                  fontSize: 11,
                  color: "var(--muted)",
                  lineHeight: 1.5,
                }}
              >
                Thread cites this record by stable ID. The highlighted field is the exact evidence
                used in the recommendation.
              </div>

              <button
                className="btn primary"
                style={{ marginTop: 16, width: "100%" }}
                onClick={() => showToast("Opening full record", `${recordId} · read-only view`)}
              >
                Open full record <ArrowUpRight size={14} />
              </button>
            </div>
          ) : (
            <div className="empty">
              No preview is loaded for this record.
              <div style={{ marginTop: 8 }}>
                <button className="btn sm" onClick={onClose}>
                  Close
                </button>
              </div>
            </div>
          )}
        </div>
      </aside>
    </>
  );
}
