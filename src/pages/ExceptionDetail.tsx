import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  Check,
  FileText,
  ShieldCheck,
  Sparkles,
  X,
} from "lucide-react";
import {
  exceptions,
  formatINR,
  patterns,
  recordDetails,
  threadResponses,
  vendorById,
} from "../data/seed";
import { useDemoStore } from "../store/useDemoStore";
import { ApprovalModal } from "../components/ApprovalModal";
import { RecordPeek } from "../components/RecordPeek";
import { SeverityLabel, StatusPill } from "../components/StatusPill";
import { ThreadAnswer } from "../components/ThreadAnswer";

const actionByType: Record<string, string> = {
  "Freight duplication": "Reject freight",
  "Price mismatch": "Hold invoice",
  "GST discrepancy": "Route to Tax Lead",
  "Duplicate invoice": "Block payment",
  "Vendor bank change": "Freeze vendor master",
};

export function ExceptionDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const decided = useDemoStore((s) => s.decidedApprovals);

  const [peek, setPeek] = useState<string | null>(null);
  const [modal, setModal] = useState(false);

  const exception = exceptions.find((e) => e.id === id);
  if (!exception) {
    return (
      <div className="page">
        <div className="card">
          <div className="empty">
            Exception not found.
            <div style={{ marginTop: 10 }}>
              <Link className="btn sm" to="/exceptions">
                Back to exceptions
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const vendor = vendorById(exception.vendorId);
  const response = threadResponses[exception.id];
  const action = actionByType[exception.type] ?? "Review exception";
  const isDecided = !!decided[exception.id];
  const invoiceRecord = recordDetails[exception.invoiceId];
  const checks = response?.checks ?? [];
  const linkedPattern =
    exception.type === "Freight duplication"
      ? patterns.find((p) => p.id === "PAT-01")
      : exception.type === "Price mismatch"
        ? patterns.find((p) => p.id === "PAT-02")
        : exception.type === "GST discrepancy"
          ? patterns.find((p) => p.id === "PAT-03")
          : undefined;

  return (
    <div className="page">
      <div className="breadcrumb">
        <Link to="/exceptions">Exceptions</Link>
        <span>/</span>
        <span className="mono">{exception.id}</span>
      </div>

      <div className="page-head">
        <div>
          <div className="row">
            <h1 className="page-title">{exception.type}</h1>
            <SeverityLabel severity={exception.severity} />
            <StatusPill status={isDecided ? "Resolved" : exception.status} />
          </div>
          <div className="page-sub">
            {vendor.name} · <span className="mono">{exception.invoiceId}</span> ·{" "}
            {formatINR(exception.amountAtRisk)} at risk · detected {exception.detectedAt}
          </div>
        </div>
        <div className="page-actions">
          <button className="btn" onClick={() => navigate(`/invoices/${exception.invoiceId}`)}>
            <FileText size={14} /> Open invoice
          </button>
          {isDecided ? (
            <span className="pill ok" style={{ height: 34, padding: "0 12px" }}>
              <ShieldCheck size={13} /> Approved · memory updated
            </span>
          ) : (
            <button className="btn primary" onClick={() => setModal(true)}>
              {action} <ArrowRight size={14} />
            </button>
          )}
        </div>
      </div>

      {isDecided && (
        <div
          className="row"
          style={{
            gap: 9,
            padding: "10px 13px",
            background: "var(--ok-soft)",
            border: "1px solid #abefc6",
            borderRadius: 10,
            color: "var(--ok)",
            fontSize: 12,
            marginBottom: 14,
          }}
        >
          <ShieldCheck size={15} />
          <span>
            <b>Approval recorded by R. Menon · AP Manager.</b> No payment was executed. Thread
            retained the outcome and updated vendor memory.
          </span>
        </div>
      )}

      <div className="detail-grid">
        <div className="stack">
          <div className="card">
            <div className="card-head">
              <div>
                <div className="card-title">Invoice &amp; checks</div>
                <div className="card-sub">
                  {invoiceRecord?.subtitle ?? `${vendor.name} · ${exception.invoiceId}`}
                </div>
              </div>
              <button
                className="card-link"
                onClick={() => navigate(`/invoices/${exception.invoiceId}`)}
              >
                Open invoice <ArrowRight size={13} />
              </button>
            </div>
            <div className="card-body">
              <div className="field-grid">
                {(invoiceRecord?.fields ?? []).map((f) => (
                  <div className="field" key={f.label}>
                    <div className="field-label">{f.label}</div>
                    <div className="field-value">
                      {f.highlight ? <span className="highlight">{f.value}</span> : f.value}
                    </div>
                  </div>
                ))}
              </div>

              <div className="hr" />

              <div className="answer-label">Deterministic checks</div>
              <div className="checks" style={{ marginBottom: 0 }}>
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

              <div
                className="row"
                style={{
                  marginTop: 12,
                  padding: "9px 11px",
                  background: "#f8fafc",
                  border: "1px solid var(--border)",
                  borderRadius: 8,
                  fontSize: 11,
                  color: "var(--muted)",
                  alignItems: "flex-start",
                }}
              >
                <ShieldCheck size={14} color="#067647" style={{ flex: "none", marginTop: 1 }} />
                <span>
                  <b style={{ color: "var(--text)" }}>Current record precedence.</b> The PO,
                  contract, tax rule and approval matrix always override historical memory. Repetition
                  is not proof of correctness.
                </span>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="card-head">
              <div>
                <div className="card-title">Evidence thread</div>
                <div className="card-sub">
                  {response?.priorCases ?? 0} prior cases · every reference resolves to a record
                </div>
              </div>
              <span className="pill neutral">Source-linked</span>
            </div>
            <div className="card-body">
              <div className="stack" style={{ gap: 8 }}>
                {(response?.evidence ?? []).map((e) => (
                  <button
                    key={`${e.type}-${e.id}`}
                    className="row"
                    style={{
                      justifyContent: "space-between",
                      padding: "10px 12px",
                      border: "1px solid var(--border)",
                      borderRadius: 8,
                      background: "#fff",
                      textAlign: "left",
                    }}
                    onClick={() => setPeek(e.id)}
                  >
                    <span style={{ minWidth: 0 }}>
                      <span className="mono cell-strong">{e.id}</span>
                      <span className="muted" style={{ marginLeft: 8, fontSize: 11.5 }}>
                        {e.field}
                      </span>
                      <div className="cell-sub">{e.snippet}</div>
                    </span>
                    <ArrowRight size={13} color="var(--muted)" style={{ flex: "none" }} />
                  </button>
                ))}
              </div>

              <div className="hr" />
              <div className="answer-label">Resolution path</div>
              <div className="timeline" style={{ marginTop: 4 }}>
                <div className="tl-item accent">
                  <div className="tl-title">Detected by Thread</div>
                  <div className="tl-time">{exception.detectedAt} · {exception.type}</div>
                </div>
                <div className="tl-item accent">
                  <div className="tl-title">Recalled {response?.priorCases ?? 0} prior cases</div>
                  <div className="tl-time">Exact invoices, POs and approvals cited</div>
                </div>
                <div className="tl-item">
                  <div className="tl-title">Recommended: {action.toLowerCase()}</div>
                  <div className="tl-time">
                    Routed to {response?.route ?? "AP Manager"} · payment execution blocked
                  </div>
                </div>
                <div className={`tl-item ${isDecided ? "accent" : ""}`}>
                  <div className="tl-title">{isDecided ? "Approved by human" : "Awaiting approval"}</div>
                  <div className="tl-time">
                    {isDecided ? "R. Menon · AP Manager · outcome retained" : "Human decision required"}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="card-head">
              <div className="card-title">Pattern context</div>
              <Sparkles size={14} color="#7c3aed" style={{ marginLeft: "auto" }} />
            </div>
            <div className="card-body">
              {linkedPattern ? (
                <>
                  <div className="row" style={{ gap: 8, marginBottom: 6 }}>
                    <span className="cell-strong">{linkedPattern.name}</span>
                    <span className={`pill ${linkedPattern.status === "Validated" ? "ok" : "warn"}`}>
                      {linkedPattern.status}
                    </span>
                  </div>
                  <div className="muted" style={{ fontSize: 11.5, lineHeight: 1.55 }}>
                    {linkedPattern.occurrences} occurrences ·{" "}
                    {formatINR(linkedPattern.prevented)} prevented · last seen{" "}
                    {linkedPattern.lastSeen.toLowerCase()}.
                  </div>
                  <button
                    className="btn sm"
                    style={{ marginTop: 10 }}
                    onClick={() => navigate("/learning")}
                  >
                    Review pattern <ArrowRight size={12} />
                  </button>
                </>
              ) : (
                <>
                  <div className="row" style={{ gap: 8, marginBottom: 6 }}>
                    <span className="cell-strong">No validated pattern yet</span>
                    <span className="pill neutral">First occurrence</span>
                  </div>
                  <div className="muted" style={{ fontSize: 11.5, lineHeight: 1.55 }}>
                    This case will be retained as a memory episode. Thread needs a repeated,
                    human-confirmed outcome before proposing a rule. Current policy still applies.
                  </div>
                  <button
                    className="btn sm"
                    style={{ marginTop: 10 }}
                    onClick={() => navigate(`/vendors/${vendor.id}`)}
                  >
                    Open vendor memory <ArrowRight size={12} />
                  </button>
                </>
              )}
            </div>
          </div>
        </div>

        <ThreadAnswer
          exception={exception}
          onEvidence={(recordId) => setPeek(recordId)}
          onAction={() => setModal(true)}
        />
      </div>

      <div style={{ marginTop: 14 }}>
        <button className="btn ghost" onClick={() => navigate("/exceptions")}>
          <ArrowLeft size={14} /> All exceptions
        </button>
      </div>

      {modal && (
        <ApprovalModal
          exception={exception}
          actionLabel={action}
          onClose={() => setModal(false)}
        />
      )}
      <RecordPeek recordId={peek} onClose={() => setPeek(null)} />
    </div>
  );
}
