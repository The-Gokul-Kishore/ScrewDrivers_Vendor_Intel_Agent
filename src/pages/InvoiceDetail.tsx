import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  Check,
  Download,
  FileText,
  ShieldCheck,
  X,
} from "lucide-react";
import {
  exceptions,
  formatINR,
  invoiceById,
  recordDetails,
  threadResponses,
  vendorById,
} from "../data/seed";
import { useDemoStore } from "../store/useDemoStore";
import { RecordPeek } from "../components/RecordPeek";
import { SeverityLabel, StatusPill } from "../components/StatusPill";
import { ThreadAnswer } from "../components/ThreadAnswer";
import { ThreadMark } from "../components/ThreadMark";

const tabs = ["Extraction", "Checks", "Evidence", "Approval"] as const;
type Tab = (typeof tabs)[number];

export function InvoiceDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const showToast = useDemoStore((s) => s.showToast);
  const [tab, setTab] = useState<Tab>("Extraction");
  const [peek, setPeek] = useState<string | null>(null);

  const invoice = invoiceById(id ?? "");
  if (!invoice) {
    return (
      <div className="page">
        <div className="card">
          <div className="empty">
            Invoice not found.
            <div style={{ marginTop: 10 }}>
              <Link className="btn sm" to="/invoices">
                Back to invoices
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const vendor = vendorById(invoice.vendorId);
  const exception = exceptions.find((e) => e.invoiceId === invoice.id);
  const response = exception ? threadResponses[exception.id] : undefined;
  const checks = response?.checks ?? [
    { name: "Duplicate invoice", result: "pass" as const },
    { name: "PO match", result: "pass" as const },
    { name: "Totals", result: "pass" as const },
    { name: "GST", result: "pass" as const },
    { name: "Payment terms", result: "pass" as const },
  ];

  const fields = [
    { label: "Invoice number", value: invoice.id, conf: 1 },
    { label: "Invoice date", value: invoice.date, conf: 0.99 },
    { label: "Vendor", value: vendor.name, conf: 0.98 },
    { label: "Vendor GSTIN", value: vendor.gstin, conf: 0.97 },
    { label: "Taxable value", value: formatINR(invoice.amount), conf: 0.99 },
    { label: "GST (18%)", value: formatINR(invoice.tax), conf: 0.98 },
    { label: "Freight line", value: invoice.freight ? formatINR(invoice.freight) : "None", conf: 0.95 },
    { label: "PO reference", value: invoice.poId, conf: 0.96 },
  ];

  return (
    <div className="page">
      <div className="breadcrumb">
        <Link to="/invoices">Invoices</Link>
        <span>/</span>
        <span className="mono">{invoice.id}</span>
      </div>

      <div className="page-head">
        <div>
          <div className="row">
            <h1 className="page-title mono">{invoice.id}</h1>
            <StatusPill status={invoice.status} />
            {exception && <SeverityLabel severity={exception.severity} />}
          </div>
          <div className="page-sub">
            {vendor.name} · {invoice.date} · {invoice.poId}
            {exception ? ` · ${exception.type}` : " · no exception detected"}
          </div>
        </div>
        <div className="page-actions">
          <button
            className="btn"
            onClick={() => showToast("Opening source document", `${invoice.id}.pdf · read-only`)}
          >
            <Download size={14} /> Source PDF
          </button>
          {exception ? (
            <button
              className="btn primary"
              onClick={() => navigate(`/exceptions/${exception.id}`)}
            >
              Review with Thread <ArrowRight size={14} />
            </button>
          ) : (
            <button className="btn" onClick={() => navigate(`/vendors/${vendor.id}`)}>
              Vendor memory <ArrowRight size={14} />
            </button>
          )}
        </div>
      </div>

      <div className="detail-grid">
        <div className="card" style={{ minWidth: 0 }}>
          <div className="tabs">
            {tabs.map((t) => (
              <button
                key={t}
                className={`tab ${tab === t ? "active" : ""}`}
                onClick={() => setTab(t)}
              >
                {t}
              </button>
            ))}
          </div>

          <div className="card-body">
            {tab === "Extraction" && (
              <>
                <div className="row" style={{ marginBottom: 12 }}>
                  <FileText size={14} color="var(--muted)" />
                  <span className="muted" style={{ fontSize: 11.5 }}>
                    Extracted from the uploaded PDF · field-level confidence
                  </span>
                </div>
                <div className="field-grid">
                  {fields.map((f) => (
                    <div className="field" key={f.label}>
                      <div className="field-label">{f.label}</div>
                      <div className="field-value">{f.value}</div>
                      <div className="conf" style={{ marginTop: 3 }}>
                        <div className="conf-bar">
                          <i style={{ width: `${f.conf * 100}%` }} />
                        </div>
                        {Math.round(f.conf * 100)}% confidence
                      </div>
                    </div>
                  ))}
                </div>
                <div
                  className="row"
                  style={{
                    marginTop: 14,
                    padding: "9px 11px",
                    background: "#f8fafc",
                    border: "1px solid var(--border)",
                    borderRadius: 8,
                    fontSize: 11.5,
                    color: "var(--muted)",
                  }}
                >
                  <ShieldCheck size={14} color="#067647" />
                  Arithmetic checks pass. Thread treats the document as untrusted input and resolves
                  every cited record from the database.
                </div>
              </>
            )}

            {tab === "Checks" && (
              <div>
                <div className="muted" style={{ fontSize: 11.5, marginBottom: 12 }}>
                  Deterministic checks run before Thread is called.
                </div>
                {checks.map((c) => (
                  <div
                    key={c.name}
                    className="row"
                    style={{
                      padding: "10px 0",
                      borderBottom: "1px solid #f0f1f4",
                      justifyContent: "space-between",
                    }}
                  >
                    <div className="row" style={{ gap: 8 }}>
                      {c.result === "pass" ? (
                        <Check size={14} color="#12b76a" />
                      ) : c.result === "fail" ? (
                        <X size={14} color="#d92d20" />
                      ) : (
                        <AlertTriangle size={14} color="#f79009" />
                      )}
                      <span style={{ fontSize: 12.5, fontWeight: 550 }}>{c.name}</span>
                    </div>
                    <span className={`pill ${c.result === "pass" ? "ok" : c.result === "fail" ? "danger" : "warn"}`}>
                      {c.result === "pass" ? "Passed" : c.result === "fail" ? "Failed" : "Needs review"}
                    </span>
                  </div>
                ))}
                <div className="muted" style={{ fontSize: 11.5, marginTop: 12 }}>
                  {exception
                    ? `${exception.type} was raised from these checks. Current PO and contract override historical memory.`
                    : "All deterministic checks passed. No vendor memory was needed for this invoice."}
                </div>
              </div>
            )}

            {tab === "Evidence" && (
              <div>
                <div className="muted" style={{ fontSize: 11.5, marginBottom: 12 }}>
                  Records Thread would cite. Every reference resolves to a real record by stable ID.
                </div>
                <div className="stack" style={{ gap: 8 }}>
                  {[invoice.poId, ...(response?.evidence.map((e) => e.id) ?? [])]
                    .filter((v, i, a) => a.indexOf(v) === i)
                    .map((recordId) => (
                      <button
                        key={recordId}
                        className="row"
                        style={{
                          justifyContent: "space-between",
                          padding: "10px 12px",
                          border: "1px solid var(--border)",
                          borderRadius: 8,
                          background: "#fff",
                          textAlign: "left",
                        }}
                        onClick={() => setPeek(recordId)}
                      >
                        <span>
                          <span className="mono cell-strong">{recordId}</span>
                          <span className="muted" style={{ marginLeft: 8, fontSize: 11.5 }}>
                            {recordDetails[recordId]?.subtitle ?? "Linked record"}
                          </span>
                        </span>
                        <ArrowRight size={13} color="var(--muted)" />
                      </button>
                    ))}
                </div>
              </div>
            )}

            {tab === "Approval" && (
              <div>
                <div className="field-grid">
                  <div className="field">
                    <div className="field-label">Route</div>
                    <div className="field-value">{response?.route ?? "No approval required"}</div>
                  </div>
                  <div className="field">
                    <div className="field-label">Authority</div>
                    <div className="field-value">Up to ₹5,00,000</div>
                  </div>
                  <div className="field">
                    <div className="field-label">Payment execution</div>
                    <div className="field-value" style={{ color: "var(--ok)" }}>
                      Never by Thread
                    </div>
                  </div>
                  <div className="field">
                    <div className="field-label">Audit trail</div>
                    <div className="field-value">Immutable · source-linked</div>
                  </div>
                </div>
                {exception ? (
                  <div style={{ marginTop: 14 }}>
                    <button
                      className="btn primary"
                      onClick={() => navigate(`/exceptions/${exception.id}`)}
                    >
                      Open approval <ArrowRight size={14} />
                    </button>
                  </div>
                ) : (
                  <div className="muted" style={{ marginTop: 14, fontSize: 12 }}>
                    This invoice has no open exception. It can proceed through the standard approval
                    workflow.
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        <div>
          {exception ? (
            <ThreadAnswer
              exception={exception}
              onEvidence={(recordId) => setPeek(recordId)}
              onAction={() =>
                navigate(`/exceptions/${exception.id}`)
              }
            />
          ) : (
            <div className="pane">
              <div className="pane-head">
                <div className="pane-mark">
                  <ThreadMark size={16} />
                </div>
                <div>
                  <div className="pane-title">Thread</div>
                  <div className="pane-sub">Vendor memory · auto-run</div>
                </div>
                <span className="spacer" />
                <span className="pill ok">Clear</span>
              </div>
              <div className="pane-body">
                <div className="recall-line">
                  <span className="recall-dot" />
                  Ran 5 checks on arrival
                </div>
                <div className="reco">
                  No exception found. Invoice is matched to {invoice.poId} and can proceed through
                  the standard approval route.
                </div>
                <div className="hr" />
                <div className="answer-label">Vendor context</div>
                <div className="muted" style={{ fontSize: 11.5, lineHeight: 1.55 }}>
                  Thread still refreshed memory for {vendor.name}: payment terms, approval matrix
                  and any recent exception patterns.
                </div>
                <button
                  className="btn"
                  style={{ width: "100%", marginTop: 12 }}
                  onClick={() => navigate(`/vendors/${vendor.id}`)}
                >
                  Open vendor memory <ArrowRight size={14} />
                </button>
              </div>
            </div>
          )}

          <div className="card" style={{ marginTop: 14 }}>
            <div className="card-head">
              <div className="card-title">Processing timeline</div>
            </div>
            <div className="card-body">
              <div className="timeline">
                {[
                  { t: "Received", d: `${invoice.date} · email-in`, a: false },
                  { t: "Extracted", d: "18 fields · 97% confidence", a: false },
                  { t: "Checks run", d: "duplicate · totals · PO · GST", a: false },
                  {
                    t: exception ? "Exception detected" : "No exception",
                    d: exception ? `${exception.detectedAt} · ${exception.type}` : "All checks passed",
                    a: true,
                  },
                  ...(exception
                    ? [{ t: "Thread recalled", d: "5 prior cases · evidence linked", a: true }]
                    : []),
                ].map((s) => (
                  <div key={s.t} className={`tl-item ${s.a ? "accent" : ""}`}>
                    <div className="tl-title">{s.t}</div>
                    <div className="tl-time">{s.d}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div style={{ marginTop: 14 }}>
        <button className="btn ghost" onClick={() => navigate(-1)}>
          <ArrowLeft size={14} /> Back
        </button>
      </div>

      <RecordPeek recordId={peek} onClose={() => setPeek(null)} />
    </div>
  );
}
