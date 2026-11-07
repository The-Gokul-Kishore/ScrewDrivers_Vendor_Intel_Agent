import { useNavigate } from "react-router-dom";
import {
  AlertTriangle,
  ArrowDownRight,
  ArrowRight,
  ArrowUpRight,
  RefreshCw,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import {
  auditEntries,
  exceptions,
  formatCompactINR,
  formatINR,
  vendorById,
} from "../data/seed";
import { useDemoStore, useUnreadCount } from "../store/useDemoStore";
import { SeverityLabel, StatusPill } from "../components/StatusPill";
import { ThreadMark } from "../components/ThreadMark";

const byType = [
  { label: "Freight duplication", count: 5, high: false },
  { label: "Price mismatch", count: 3, high: true },
  { label: "GST discrepancy", count: 2, high: true },
  { label: "Duplicate invoice", count: 1, high: false },
  { label: "Vendor bank change", count: 1, high: true },
];

export function Overview() {
  const navigate = useNavigate();
  const simulated = useDemoStore((s) => s.simulated);
  const simulateSync = useDemoStore((s) => s.simulateSync);
  const openInbox = useDemoStore((s) => s.openInbox);
  const unread = useUnreadCount();

  const open = exceptions.filter(
    (e) => e.status === "Open" && (!e.simulated || simulated)
  );
  const atRisk = open.reduce((sum, e) => sum + e.amountAtRisk, 0);
  const highCount = open.filter((e) => e.severity === "high").length;

  return (
    <div className="page">
      <div className="page-head">
        <div>
          <h1 className="page-title">Overview</h1>
          <div className="page-sub">
            Saturday, 7 November 2026 · Finance Operations · India
          </div>
        </div>
        <div className="page-actions">
          <button className="btn" onClick={simulateSync}>
            <RefreshCw size={14} /> Simulate ERP sync
          </button>
          <button className="btn primary" onClick={() => navigate("/exceptions")}>
            Review exceptions <ArrowRight size={14} />
          </button>
        </div>
      </div>

      <div className="kpi-grid">
        <div className="card kpi">
          <div className="kpi-label">Invoices this month</div>
          <div className="kpi-value">100</div>
          <div className="kpi-foot">5 vendors · 100% extracted</div>
        </div>
        <div className="card kpi">
          <div className="kpi-label">Exception rate</div>
          <div className="kpi-value">15%</div>
          <div className="kpi-foot">
            <span className="trend-down">
              <ArrowDownRight size={12} /> 2.1 pts
            </span>
            vs last month
          </div>
        </div>
        <div className="card kpi">
          <div className="kpi-label">Open exceptions</div>
          <div className="kpi-value">{open.length}</div>
          <div className="kpi-foot">
            <span style={{ color: "var(--danger)", fontWeight: 650 }}>{highCount} high risk</span>
            <span>· {formatCompactINR(atRisk)} at risk</span>
          </div>
        </div>
        <div className="card kpi">
          <div className="kpi-label">Leakage prevented</div>
          <div className="kpi-value">₹2.4L</div>
          <div className="kpi-foot">
            <span className="trend-up">
              <ArrowUpRight size={12} /> ₹61K
            </span>
            this quarter
          </div>
        </div>
      </div>

      <div className="section-grid" style={{ marginBottom: 14 }}>
        <div className="card">
          <div className="card-head">
            <div>
              <div className="card-title">Exception queue</div>
              <div className="card-sub">Prioritised by severity and value at risk</div>
            </div>
            <button className="card-link" onClick={() => navigate("/exceptions")}>
              View all <ArrowRight size={13} />
            </button>
          </div>
          <div className="table-wrap">
            <table className="data">
              <thead>
                <tr>
                  <th>Severity</th>
                  <th>Exception</th>
                  <th>Vendor · Invoice</th>
                  <th style={{ textAlign: "right" }}>At risk</th>
                  <th>Age</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {open.slice(0, 5).map((e) => (
                  <tr
                    key={e.id}
                    className="clickable"
                    onClick={() => navigate(`/exceptions/${e.id}`)}
                  >
                    <td>
                      <SeverityLabel severity={e.severity} />
                    </td>
                    <td>
                      <div className="cell-strong">{e.type}</div>
                      <div className="cell-sub mono">{e.id}</div>
                    </td>
                    <td>
                      <div>{vendorById(e.vendorId).name}</div>
                      <div className="cell-sub mono">{e.invoiceId}</div>
                    </td>
                    <td className="num">{formatINR(e.amountAtRisk)}</td>
                    <td className="muted">{e.age}</td>
                    <td>
                      <StatusPill status={e.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="card" style={{ overflow: "hidden" }}>
          <div
            className="card-head"
            style={{
              background: "linear-gradient(180deg, #fbfbff, #fff)",
              borderBottom: "1px solid var(--border)",
            }}
          >
            <div className="pane-mark">
              <ThreadMark size={15} />
            </div>
            <div>
              <div className="card-title">Thread</div>
              <div className="card-sub">Automatic vendor intelligence</div>
            </div>
            <span className="spacer" />
            <span className="pill ok">
              <span className="sync-dot" style={{ width: 5, height: 5 }} /> Auto-run
            </span>
          </div>
          <div className="card-body">
            <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
              <div style={{ fontSize: 32, fontWeight: 700, letterSpacing: "-0.04em" }}>
                {unread}
              </div>
              <div className="muted" style={{ fontSize: 12 }}>
                exceptions need review
              </div>
            </div>
            <div className="muted" style={{ fontSize: 11.5, marginTop: 3 }}>
              {highCount} high risk · {formatCompactINR(atRisk)} at risk · last checked 12s ago
            </div>

            <div className="hr" />

            <div className="answer-label">Today</div>
            <div className="stack" style={{ gap: 8 }}>
              <div className="row" style={{ fontSize: 11.5, color: "var(--muted)" }}>
                <Sparkles size={13} color="#4f46e5" />
                <span>
                  <b style={{ color: "var(--text)" }}>{open.length}</b> exceptions detected
                  automatically
                </span>
              </div>
              <div className="row" style={{ fontSize: 11.5, color: "var(--muted)" }}>
                <ShieldCheck size={13} color="#067647" />
                <span>
                  <b style={{ color: "var(--text)" }}>₹61,000</b> leakage prevented by prior cases
                </span>
              </div>
              <div className="row" style={{ fontSize: 11.5, color: "var(--muted)" }}>
                <AlertTriangle size={13} color="#b54708" />
                <span>1 pattern ready for validation</span>
              </div>
            </div>

            <button
              className="btn primary"
              style={{ width: "100%", marginTop: 14 }}
              onClick={openInbox}
            >
              <ThreadMark size={14} /> Open Thread inbox
            </button>
          </div>
        </div>
      </div>

      <div className="section-grid">
        <div className="card">
          <div className="card-head">
            <div>
              <div className="card-title">Exceptions by type</div>
              <div className="card-sub">Rolling 90 days</div>
            </div>
            <button className="card-link" onClick={() => navigate("/learning")}>
              Learning <ArrowRight size={13} />
            </button>
          </div>
          <div className="card-body">
            <div className="bars">
              {byType.map((b) => (
                <div className="bar-row" key={b.label}>
                  <span className="muted">{b.label}</span>
                  <div className="bar-track">
                    <div
                      className={`bar-fill ${b.high ? "high" : ""}`}
                      style={{ width: `${(b.count / 5) * 100}%` }}
                    />
                  </div>
                  <span className="bar-val">{b.count}</span>
                </div>
              ))}
            </div>
            <div className="hr" />
            <div className="row" style={{ fontSize: 11.5, color: "var(--muted)" }}>
              <ShieldCheck size={13} color="#12b76a" />
              Freight duplication is Thread's strongest pattern — 5 cases, all resolved with
              PO verification.
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-head">
            <div>
              <div className="card-title">Recent activity</div>
              <div className="card-sub">Thread and human actions</div>
            </div>
            <button className="card-link" onClick={() => navigate("/audit")}>
              Audit log <ArrowRight size={13} />
            </button>
          </div>
          <div className="card-body">
            <div className="timeline">
              {auditEntries.slice(0, 4).map((a) => (
                <div key={a.id} className={`tl-item ${a.actor === "Thread" ? "accent" : ""}`}>
                  <div className="tl-title">
                    {a.actor === "Thread" ? "Thread" : "Human"} · {a.action}
                  </div>
                  <div className="tl-time">
                    {a.timestamp} · {a.target}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
