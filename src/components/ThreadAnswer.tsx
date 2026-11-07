import {
  AlertTriangle,
  Check,
  ChevronDown,
  ThumbsDown,
  ThumbsUp,
  X,
} from "lucide-react";
import {
  formatINR,
  threadResponses,
  vendorById,
  type ExceptionRow,
} from "../data/seed";
import { useDemoStore } from "../store/useDemoStore";
import { ThreadMark } from "./ThreadMark";

const primaryAction: Record<string, string> = {
  "Freight duplication": "Reject freight",
  "Price mismatch": "Hold invoice",
  "GST discrepancy": "Route to Tax Lead",
  "Duplicate invoice": "Block payment",
  "Vendor bank change": "Freeze vendor master",
};

export function ThreadAnswer({
  exception,
  onEvidence,
  onAction,
}: {
  exception: ExceptionRow;
  onEvidence?: (recordId: string) => void;
  onAction?: (label: string) => void;
}) {
  const showToast = useDemoStore((s) => s.showToast);
  const response = threadResponses[exception.id];
  const vendor = vendorById(exception.vendorId);
  const action = primaryAction[exception.type] ?? "Review exception";

  const confidence = response?.confidence ?? {
    score: exception.confidence,
    label: exception.confidence >= 0.85 ? ("High" as const) : ("Medium" as const),
  };
  const checks = response?.checks ?? [
    { name: "Duplicate invoice", result: "pass" as const },
    { name: "Totals", result: "pass" as const },
    { name: "Vendor terms", result: "warn" as const },
  ];
  const reasoning =
    response?.reasoning ?? [
      `Thread matched this invoice against ${vendor.name} history.`,
      "Current PO and approval matrix take precedence over memory.",
    ];
  const evidence = response?.evidence ?? [
    { type: "invoice" as const, id: exception.invoiceId, field: "Amount", snippet: formatINR(exception.amountAtRisk) },
  ];
  const route = response?.route ?? "AP Manager";
  const caveats = response?.caveats ?? ["Verify the current PO before acting on this recommendation."];
  const priorCases = response?.priorCases ?? 3;

  return (
    <section className="pane" aria-label="Thread analysis">
      <div className="pane-head">
        <div className="pane-mark">
          <ThreadMark size={16} />
        </div>
        <div>
          <div className="pane-title">Thread</div>
          <div className="pane-sub">Vendor memory · auto-run</div>
        </div>
        <span className="spacer" />
        <span className="pill neutral">Read-only</span>
      </div>

      <div className="pane-body">
        <div className="row" style={{ gap: 6, marginBottom: 8, flexWrap: "wrap" }}>
          <span className="cell-strong">{exception.type}</span>
          <span className="muted">·</span>
          <span className="mono">{exception.invoiceId}</span>
          <span className="muted">·</span>
          <span className="muted">{formatINR(exception.amountAtRisk)} at risk</span>
        </div>

        <div className="recall-line">
          <span className="recall-dot" />
          Recalled {priorCases} similar cases from 100 invoices
        </div>

        <div className="answer-label">Recommendation</div>
        <div className="reco">
          {response?.recommendation ??
            `Review ${exception.type.toLowerCase()} on ${exception.invoiceId} against the current PO before deciding.`}
        </div>

        <div className="conf-row">
          <span className={`conf-chip ${confidence.label !== "High" ? "med" : ""}`}>
            {Math.round(confidence.score * 100)}% · {confidence.label}
          </span>
          <span className="route-line">
            Route: {route} · no payment executed
          </span>
        </div>

        <div className="checks">
          {checks.map((c) => (
            <span key={c.name} className={`check ${c.result}`}>
              {c.result === "pass" ? (
                <Check size={10} />
              ) : c.result === "fail" ? (
                <X size={10} />
              ) : (
                <AlertTriangle size={10} />
              )}
              {c.name}
            </span>
          ))}
        </div>

        <details className="why" open>
          <summary className="row" style={{ justifyContent: "space-between" }}>
            <span>Why this</span>
            <ChevronDown size={13} />
          </summary>
          <ol>
            {reasoning.map((r, i) => (
              <li key={i}>{r}</li>
            ))}
          </ol>
        </details>

        <div className="answer-label">Evidence</div>
        <div className="evidence">
          {evidence.map((e) => (
            <button
              key={`${e.type}-${e.id}`}
              className="evidence-chip"
              title={`${e.field}: ${e.snippet}`}
              onClick={() => onEvidence?.(e.id)}
            >
              {e.id}
            </button>
          ))}
        </div>

        <div
          className="row"
          style={{
            gap: 7,
            alignItems: "flex-start",
            marginTop: 12,
            padding: "8px 9px",
            background: "#fffaeb",
            border: "1px solid #fedf89",
            borderRadius: 8,
            color: "#93370d",
            fontSize: 10.5,
            lineHeight: 1.45,
          }}
        >
          <AlertTriangle size={13} style={{ flex: "none", marginTop: 1 }} />
          <span>{caveats[0]}</span>
        </div>

        <div className="pane-actions">
          <button className="btn primary sm" onClick={() => onAction?.(action)}>
            {action}
          </button>
          <button
            className="btn sm"
            onClick={() =>
              showToast("Routed for review", `${response?.secondaryAction ?? "Ask AP Manager"} · ${exception.invoiceId}`)
            }
          >
            {response?.secondaryAction ?? "Ask AP Manager"}
          </button>
          <button
            className="btn ghost sm"
            onClick={() => showToast("Draft note ready", "Grounded in the evidence above")}
          >
            Draft note
          </button>
        </div>

        <div className="feedback">
          <span>Helpful?</span>
          <button
            aria-label="Mark answer helpful"
            onClick={() => showToast("Feedback recorded", "Thread will keep using this pattern")}
          >
            <ThumbsUp size={12} />
          </button>
          <button
            aria-label="Mark answer not helpful"
            onClick={() => showToast("Feedback recorded", "Thread will ask for a correction reason")}
          >
            <ThumbsDown size={12} />
          </button>
          <span className="spacer" />
          <button
            className="btn ghost sm"
            onClick={() => showToast("Correction captured", "Memory updated for this vendor")}
          >
            Correct Thread
          </button>
        </div>
      </div>
    </section>
  );
}
