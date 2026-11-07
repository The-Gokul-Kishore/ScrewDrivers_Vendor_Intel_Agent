import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  ArrowRight,
  BrainCircuit,
  Building2,
  FileText,
  MapPin,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import {
  exceptions,
  formatINR,
  invoices,
  memoryFacts,
  patterns,
  vendorById,
} from "../data/seed";
import { useDemoStore } from "../store/useDemoStore";
import { SeverityLabel, StatusPill } from "../components/StatusPill";
import { ThreadMark } from "../components/ThreadMark";

const tabs = ["Overview", "Invoices", "Exceptions", "Memory"] as const;
type Tab = (typeof tabs)[number];

const riskPill = { Low: "ok", Medium: "warn", High: "danger" } as const;

export function VendorDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const simulated = useDemoStore((s) => s.simulated);
  const showToast = useDemoStore((s) => s.showToast);
  const [tab, setTab] = useState<Tab>("Overview");

  const vendor = vendorById(id ?? "");
  if (!vendor) {
    return (
      <div className="page">
        <div className="card">
          <div className="empty">
            Vendor not found.
            <div style={{ marginTop: 10 }}>
              <Link className="btn sm" to="/vendors">
                Back to vendors
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const facts = memoryFacts.filter((f) => f.vendorId === vendor.id);
  const vendorInvoices = invoices.filter(
    (i) => i.vendorId === vendor.id && (!i.simulated || simulated)
  );
  const vendorExceptions = exceptions.filter(
    (e) => e.vendorId === vendor.id && (!e.simulated || simulated)
  );
  const openExceptions = vendorExceptions.filter((e) => e.status !== "Resolved");
  const pattern = patterns.find((p) => p.id === "PAT-01" && vendor.id === "VENDOR_001");

  return (
    <div className="page">
      <div className="breadcrumb">
        <Link to="/vendors">Vendors</Link>
        <span>/</span>
        <span>{vendor.name}</span>
      </div>

      <div className="page-head">
        <div>
          <div className="row">
            <h1 className="page-title">{vendor.name}</h1>
            <span className={`pill ${riskPill[vendor.risk]}`}>{vendor.risk} risk</span>
          </div>
          <div className="page-sub row" style={{ gap: 12, flexWrap: "wrap" }}>
            <span className="row" style={{ gap: 4 }}>
              <MapPin size={12} /> {vendor.city}
            </span>
            <span className="mono">{vendor.gstin}</span>
            <span>{vendor.terms}</span>
            <span>· {vendorInvoices.length} invoices</span>
          </div>
        </div>
        <div className="page-actions">
          <button
            className="btn"
            onClick={() => showToast("Vendor check running", "Identity, GSTIN and bank details")}
          >
            <ShieldCheck size={14} /> Run vendor check
          </button>
          <button
            className="btn primary"
            onClick={() => showToast("Thread is scoped", `Ask anything about ${vendor.name}`)}
          >
            <ThreadMark size={14} /> Ask Thread
          </button>
        </div>
      </div>

      <div className="detail-grid">
        <div className="card" style={{ minWidth: 0 }}>
          <div className="tabs">
            {tabs.map((t) => (
              <button key={t} className={`tab ${tab === t ? "active" : ""}`} onClick={() => setTab(t)}>
                {t}
                {t === "Exceptions" && openExceptions.length > 0 && (
                  <span className="pill danger" style={{ marginLeft: 6 }}>
                    {openExceptions.length}
                  </span>
                )}
              </button>
            ))}
          </div>

          <div className="card-body">
            {tab === "Overview" && (
              <div>
                <div className="field-grid">
                  <div className="field">
                    <div className="field-label">Legal name</div>
                    <div className="field-value">{vendor.name} Pvt Ltd</div>
                  </div>
                  <div className="field">
                    <div className="field-label">GSTIN</div>
                    <div className="field-value mono">{vendor.gstin}</div>
                  </div>
                  <div className="field">
                    <div className="field-label">Payment terms</div>
                    <div className="field-value">{vendor.terms}</div>
                  </div>
                  <div className="field">
                    <div className="field-label">Open balance</div>
                    <div className="field-value">{formatINR(vendor.openBalance)}</div>
                  </div>
                  <div className="field">
                    <div className="field-label">Bank details</div>
                    <div className="field-value" style={{ color: "var(--ok)" }}>
                      Verified · 04 Aug 2026
                    </div>
                  </div>
                  <div className="field">
                    <div className="field-label">Master data status</div>
                    <div className="field-value">Active · no blocks</div>
                  </div>
                </div>

                <div className="hr" />

                <div className="row" style={{ marginBottom: 10 }}>
                  <Sparkles size={14} color="#7c3aed" />
                  <span className="cell-strong">What Thread knows</span>
                  <span className="muted" style={{ fontSize: 11 }}>
                    · {facts.length} retained facts
                  </span>
                </div>
                <div className="stack" style={{ gap: 9 }}>
                  {facts.slice(0, 4).map((f) => (
                    <div
                      key={f.id}
                      style={{
                        padding: "9px 11px",
                        border: "1px solid var(--border)",
                        borderRadius: 8,
                        background: "#fcfcfd",
                      }}
                    >
                      <div className="row" style={{ gap: 6 }}>
                        <span className="field-label" style={{ margin: 0 }}>
                          {f.property}
                        </span>
                        <span className="spacer" />
                        <span className="pill neutral">
                          {Math.round(f.confidence * 100)}%
                        </span>
                      </div>
                      <div style={{ fontSize: 12, marginTop: 3 }}>{f.value}</div>
                      <div className="cell-sub">
                        Source: <span className="mono">{f.source}</span> · {f.updatedAt}
                        {f.verifiedBy ? ` · verified by ${f.verifiedBy}` : ""}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {tab === "Invoices" && (
              <div className="table-wrap">
                <table className="data">
                  <thead>
                    <tr>
                      <th>Invoice</th>
                      <th>Date</th>
                      <th>PO</th>
                      <th style={{ textAlign: "right" }}>Amount</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {vendorInvoices.map((i) => (
                      <tr
                        key={i.id}
                        className="clickable"
                        onClick={() => navigate(`/invoices/${i.id}`)}
                      >
                        <td className="mono cell-strong">{i.id}</td>
                        <td className="muted">{i.date}</td>
                        <td className="mono muted">{i.poId}</td>
                        <td className="num">{formatINR(i.amount)}</td>
                        <td>
                          <StatusPill status={i.status} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {tab === "Exceptions" && (
              <div className="table-wrap">
                <table className="data">
                  <thead>
                    <tr>
                      <th>Severity</th>
                      <th>Exception</th>
                      <th>Invoice</th>
                      <th style={{ textAlign: "right" }}>At risk</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {vendorExceptions.map((e) => (
                      <tr
                        key={e.id}
                        className="clickable"
                        onClick={() => navigate(`/exceptions/${e.id}`)}
                      >
                        <td>
                          <SeverityLabel severity={e.severity} />
                        </td>
                        <td className="cell-strong">{e.type}</td>
                        <td className="mono">{e.invoiceId}</td>
                        <td className="num">{formatINR(e.amountAtRisk)}</td>
                        <td>
                          <StatusPill status={e.status} />
                        </td>
                      </tr>
                    ))}
                    {vendorExceptions.length === 0 && (
                      <tr>
                        <td colSpan={5}>
                          <div className="empty">No exceptions for this vendor.</div>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}

            {tab === "Memory" && (
              <div>
                <div className="row" style={{ marginBottom: 12 }}>
                  <BrainCircuit size={14} color="#4f46e5" />
                  <span className="muted" style={{ fontSize: 11.5 }}>
                    Retained facts are inspectable and always linked to a source record.
                  </span>
                </div>
                <div className="table-wrap">
                  <table className="data">
                    <thead>
                      <tr>
                        <th>Fact</th>
                        <th>Source</th>
                        <th>Updated</th>
                        <th>Confidence</th>
                        <th>Verified</th>
                      </tr>
                    </thead>
                    <tbody>
                      {facts.map((f) => (
                        <tr key={f.id}>
                          <td>
                            <div className="cell-strong">{f.property}</div>
                            <div className="cell-sub">{f.value}</div>
                          </td>
                          <td className="mono">{f.source}</td>
                          <td className="muted">{f.updatedAt}</td>
                          <td>
                            <div className="conf">
                              <div className="conf-bar">
                                <i style={{ width: `${f.confidence * 100}%` }} />
                              </div>
                              {Math.round(f.confidence * 100)}%
                            </div>
                          </td>
                          <td className="muted">{f.verifiedBy ?? "Thread"}</td>
                        </tr>
                      ))}
                      {facts.length === 0 && (
                        <tr>
                          <td colSpan={5}>
                            <div className="empty">No retained memory yet.</div>
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="stack">
          <div className="pane">
            <div className="pane-head">
              <div className="pane-mark">
                <ThreadMark size={16} />
              </div>
              <div>
                <div className="pane-title">Thread remembers</div>
                <div className="pane-sub">Vendor memory · auto-run</div>
              </div>
              <span className="spacer" />
              <span className="pill ok">Live</span>
            </div>
            <div className="pane-body">
              <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
                <div style={{ fontSize: 30, fontWeight: 700, letterSpacing: "-0.04em" }}>
                  {facts.length}
                </div>
                <div className="muted" style={{ fontSize: 12 }}>
                  retained facts
                </div>
              </div>
              <div className="muted" style={{ fontSize: 11.5, marginTop: 2 }}>
                {vendorExceptions.length} exceptions · {openExceptions.length} open ·{" "}
                {formatINR(vendor.openBalance)} exposure
              </div>

              <div className="hr" />
              {facts.slice(0, 3).map((f) => (
                <div key={f.id} style={{ marginBottom: 9 }}>
                  <div className="field-label">{f.property}</div>
                  <div style={{ fontSize: 11.5, marginTop: 2 }}>{f.value}</div>
                </div>
              ))}

              {pattern && (
                <>
                  <div className="hr" />
                  <div className="field-label">Active pattern</div>
                  <div className="row" style={{ gap: 6, marginTop: 4 }}>
                    <span style={{ fontSize: 12, fontWeight: 600 }}>Freight duplication</span>
                    <span className="pill warn">Observed</span>
                  </div>
                  <div className="muted" style={{ fontSize: 11, marginTop: 3 }}>
                    {pattern.occurrences} cases · {formatINR(pattern.prevented)} prevented
                  </div>
                </>
              )}

              <button
                className="btn"
                style={{ width: "100%", marginTop: 13 }}
                onClick={() => navigate("/learning")}
              >
                Review patterns <ArrowRight size={14} />
              </button>
            </div>
          </div>

          <div className="card">
            <div className="card-head">
              <div className="card-title">Linked records</div>
            </div>
            <div className="card-body stack" style={{ gap: 8 }}>
              <button
                className="row"
                style={{ justifyContent: "space-between", border: 0, background: "transparent" }}
                onClick={() => navigate("/invoices")}
              >
                <span className="row" style={{ gap: 7 }}>
                  <FileText size={14} color="var(--muted)" /> Invoices
                </span>
                <span className="muted">{vendorInvoices.length}</span>
              </button>
              <button
                className="row"
                style={{ justifyContent: "space-between", border: 0, background: "transparent" }}
                onClick={() => navigate("/exceptions")}
              >
                <span className="row" style={{ gap: 7 }}>
                  <Building2 size={14} color="var(--muted)" /> Exceptions
                </span>
                <span className="muted">{vendorExceptions.length}</span>
              </button>
              <button
                className="row"
                style={{ justifyContent: "space-between", border: 0, background: "transparent" }}
                onClick={() => showToast("Vendor master", `${vendor.name} · ${vendor.gstin}`)}
              >
                <span className="row" style={{ gap: 7 }}>
                  <ShieldCheck size={14} color="var(--muted)" /> Master data
                </span>
                <span className="pill ok">Verified</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
