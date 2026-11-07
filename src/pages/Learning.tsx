import { useNavigate } from "react-router-dom";
import {
  ArrowRight,
  BrainCircuit,
  Check,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { formatINR, patterns } from "../data/seed";
import { useDemoStore } from "../store/useDemoStore";
import { StatusPill } from "../components/StatusPill";

export function Learning() {
  const navigate = useNavigate();
  const patternStatus = useDemoStore((s) => s.patternStatus);
  const validatePattern = useDemoStore((s) => s.validatePattern);
  const showToast = useDemoStore((s) => s.showToast);

  const statusOf = (id: string, fallback: string) =>
    (patternStatus[id] ?? fallback) as "Observed" | "Validated" | "Authorized";

  const validated = patterns.filter((p) => statusOf(p.id, p.status) === "Validated").length;
  const prevented = patterns.reduce((s, p) => s + p.prevented, 0);

  return (
    <div className="page">
      <div className="page-head">
        <div>
          <h1 className="page-title">Learning</h1>
          <div className="page-sub">
            Observed → Validated → Authorized · repetition never becomes policy without a human
          </div>
        </div>
        <div className="page-actions">
          <span className="pill neutral" style={{ height: 30, padding: "0 10px" }}>
            <BrainCircuit size={12} /> Reflection layer
          </span>
        </div>
      </div>

      <div className="kpi-grid">
        <div className="card kpi">
          <div className="kpi-label">Patterns</div>
          <div className="kpi-value">{patterns.length}</div>
          <div className="kpi-foot">Discovered from historical cases</div>
        </div>
        <div className="card kpi">
          <div className="kpi-label">Validated rules</div>
          <div className="kpi-value">{validated}</div>
          <div className="kpi-foot">Human-confirmed · scoped</div>
        </div>
        <div className="card kpi">
          <div className="kpi-label">Leakage prevented</div>
          <div className="kpi-value">₹{Math.round(prevented / 1000)}K</div>
          <div className="kpi-foot">Across all observed patterns</div>
        </div>
        <div className="card kpi">
          <div className="kpi-label">Safe automation</div>
          <div className="kpi-value">0%</div>
          <div className="kpi-foot">No rule executes payments</div>
        </div>
      </div>

      <div className="section-grid">
        <div className="stack">
          {patterns.map((p) => {
            const status = statusOf(p.id, p.status);
            const step = status === "Observed" ? 0 : status === "Validated" ? 1 : 2;
            return (
              <div className="card" key={p.id}>
                <div className="card-head">
                  <div>
                    <div className="card-title">{p.name}</div>
                    <div className="card-sub">Last seen {p.lastSeen} · {p.sourceCases.length} source cases</div>
                  </div>
                  <span className="spacer" />
                  <StatusPill status={status} />
                </div>
                <div className="pattern">
                  <div className="muted" style={{ fontSize: 12, lineHeight: 1.55 }}>
                    {p.description}
                  </div>

                  <div className="pattern-meta">
                    <span>
                      <b>{p.occurrences}</b> occurrences
                    </span>
                    <span>
                      <b>{formatINR(p.prevented)}</b> prevented
                    </span>
                    {p.owner && <span>Owner: {p.owner}</span>}
                  </div>

                  <div className="source-list">
                    {p.sourceCases.map((c) => (
                      <span key={c} className="evidence-chip" style={{ cursor: "default" }}>
                        {c}
                      </span>
                    ))}
                  </div>

                  <div className="row" style={{ gap: 0, marginTop: 14 }}>
                    {["Observed", "Validated", "Authorized"].map((label, i) => (
                      <div
                        key={label}
                        className="row"
                        style={{ gap: 6, flex: i < 2 ? 1 : 0 }}
                      >
                        <span
                          className="row"
                          style={{
                            gap: 5,
                            fontSize: 10.5,
                            fontWeight: 650,
                            color:
                              i <= step
                                ? i === step
                                  ? "var(--accent)"
                                  : "var(--ok)"
                                : "var(--muted-2)",
                            whiteSpace: "nowrap",
                          }}
                        >
                          <span
                            style={{
                              width: 16,
                              height: 16,
                              borderRadius: 999,
                              display: "grid",
                              placeItems: "center",
                              background: i < step ? "var(--ok-soft)" : i === step ? "var(--accent-soft)" : "#f2f4f7",
                              border: `1px solid ${i < step ? "#abefc6" : i === step ? "#c7d2fe" : "var(--border)"}`,
                              color: i < step ? "var(--ok)" : i === step ? "var(--accent)" : "var(--muted-2)",
                            }}
                          >
                            {i < step ? <Check size={10} /> : i + 1}
                          </span>
                          {label}
                        </span>
                        {i < 2 && (
                          <span
                            style={{
                              flex: 1,
                              height: 1,
                              background: i < step ? "#abefc6" : "var(--border)",
                              margin: "0 8px",
                            }}
                          />
                        )}
                      </div>
                    ))}
                  </div>

                  <div className="row" style={{ marginTop: 13 }}>
                    {status === "Observed" ? (
                      <button className="btn primary sm" onClick={() => validatePattern(p.id)}>
                        <ShieldCheck size={13} /> Validate rule
                      </button>
                    ) : (
                      <button
                        className="btn sm"
                        onClick={() =>
                          showToast("Rule scope", `${p.name} · applies only to this vendor and PO terms`)
                        }
                      >
                        View rule scope <ArrowRight size={12} />
                      </button>
                    )}
                    <button
                      className="btn ghost sm"
                      onClick={() => navigate("/audit")}
                    >
                      Audit trail
                    </button>
                    <span className="spacer" />
                    {status === "Validated" && (
                      <span className="pill ok">
                        <Check size={10} /> Applied to new invoices
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="stack">
          <div className="card">
            <div className="card-head">
              <Sparkles size={14} color="#7c3aed" />
              <div className="card-title">Governance</div>
            </div>
            <div className="card-body stack" style={{ gap: 12 }}>
              <div className="row" style={{ gap: 8, alignItems: "flex-start" }}>
                <ShieldCheck size={14} color="#067647" style={{ flex: "none", marginTop: 1 }} />
                <div style={{ fontSize: 11.5, lineHeight: 1.55 }}>
                  <b>Human validation required.</b> Thread proposes; an AP manager promotes a pattern
                  to a validated rule.
                </div>
              </div>
              <div className="row" style={{ gap: 8, alignItems: "flex-start" }}>
                <ShieldAlert size={14} color="#b54708" style={{ flex: "none", marginTop: 1 }} />
                <div style={{ fontSize: 11.5, lineHeight: 1.55 }}>
                  <b>Repetition is not proof.</b> Five prior approvals may all be mistakes. Current
                  PO, contract and tax rules override memory.
                </div>
              </div>
              <div className="row" style={{ gap: 8, alignItems: "flex-start" }}>
                <BrainCircuit size={14} color="#4f46e5" style={{ flex: "none", marginTop: 1 }} />
                <div style={{ fontSize: 11.5, lineHeight: 1.55 }}>
                  <b>No payment execution.</b> Even authorized rules route recommendations; they do
                  not move money.
                </div>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="card-head">
              <div className="card-title">How reflection works</div>
            </div>
            <div className="card-body">
              <div className="timeline">
                <div className="tl-item accent">
                  <div className="tl-title">Retain</div>
                  <div className="tl-time">Exception facts, evidence, corrections and outcomes</div>
                </div>
                <div className="tl-item accent">
                  <div className="tl-title">Recall</div>
                  <div className="tl-time">Relevant vendor history on the next invoice</div>
                </div>
                <div className="tl-item accent">
                  <div className="tl-title">Reflect</div>
                  <div className="tl-time">Repeated cases become a proposed rule</div>
                </div>
                <div className="tl-item">
                  <div className="tl-title">Govern</div>
                  <div className="tl-time">Human validates scope, limits and effective dates</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
