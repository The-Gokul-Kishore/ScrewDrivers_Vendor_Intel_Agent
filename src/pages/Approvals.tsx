import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight, CheckSquare2, ShieldCheck } from "lucide-react";
import {
  approvals,
  exceptions,
  formatINR,
  threadResponses,
  vendorById,
  type Approval,
} from "../data/seed";
import { useDemoStore } from "../store/useDemoStore";
import { StatusPill } from "../components/StatusPill";

export function Approvals() {
  const navigate = useNavigate();
  const decided = useDemoStore((s) => s.decidedApprovals);
  const [tab, setTab] = useState<"Pending" | "History">("Pending");

  const rows: (Approval & {
    type: string;
    vendorId?: string;
    invoiceId: string;
    effectiveStatus: Approval["status"];
  })[] = [
    ...approvals.map((a) => {
      const exc = exceptions.find((e) => e.id === a.exceptionId);
      const isDecided = !!decided[a.exceptionId];
      return {
        ...a,
        type: exc?.type ?? "Exception",
        vendorId: exc?.vendorId,
        invoiceId: exc?.invoiceId ?? "—",
        effectiveStatus: isDecided ? ("Approved" as const) : a.status,
      };
    }),
    ...Object.keys(decided)
      .filter((exceptionId) => !approvals.some((a) => a.exceptionId === exceptionId))
      .map((exceptionId) => {
        const exc = exceptions.find((e) => e.id === exceptionId);
        return {
          id: `APV-${exceptionId.replace("EXC-", "")}`,
          exceptionId,
          route: threadResponses[exceptionId]?.route ?? "AP Manager",
          amount: exc?.amountAtRisk ?? 0,
          status: "Approved" as const,
          age: "Just now",
          decidedBy: "R. Menon",
          type: exc?.type ?? "Exception",
          vendorId: exc?.vendorId,
          invoiceId: exc?.invoiceId ?? "—",
          effectiveStatus: "Approved" as const,
        };
      }),
  ];

  const filtered = rows.filter((r) =>
    tab === "Pending" ? r.effectiveStatus === "Pending" : r.effectiveStatus !== "Pending"
  );
  const pending = rows.filter((r) => r.effectiveStatus === "Pending");
  const pendingValue = pending.reduce((s, r) => s + r.amount, 0);

  return (
    <div className="page">
      <div className="page-head">
        <div>
          <h1 className="page-title">Approvals</h1>
          <div className="page-sub">
            {pending.length} pending · {formatINR(pendingValue)} awaiting a human decision
          </div>
        </div>
        <div className="page-actions">
          <span className="pill ok" style={{ height: 30, padding: "0 10px" }}>
            <ShieldCheck size={12} /> No autonomous execution
          </span>
        </div>
      </div>

      <div className="card">
        <div className="tabs">
          {(["Pending", "History"] as const).map((t) => (
            <button key={t} className={`tab ${tab === t ? "active" : ""}`} onClick={() => setTab(t)}>
              {t}
              {t === "Pending" && pending.length > 0 && (
                <span className="pill warn" style={{ marginLeft: 6 }}>
                  {pending.length}
                </span>
              )}
            </button>
          ))}
        </div>

        <div className="table-wrap">
          <table className="data">
            <thead>
              <tr>
                <th>Approval</th>
                <th>Exception</th>
                <th>Vendor</th>
                <th>Route</th>
                <th style={{ textAlign: "right" }}>Amount</th>
                <th>Age</th>
                <th>Status</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {filtered.map((r) => (
                <tr
                  key={r.id}
                  className="clickable"
                  onClick={() => navigate(`/exceptions/${r.exceptionId}`)}
                >
                  <td className="mono cell-strong">{r.id}</td>
                  <td>
                    <div className="cell-strong">{r.type}</div>
                    <div className="cell-sub mono">{r.invoiceId}</div>
                  </td>
                  <td>{r.vendorId ? vendorById(r.vendorId).name : "—"}</td>
                  <td>{r.route}</td>
                  <td className="num">{formatINR(r.amount)}</td>
                  <td className="muted">{r.age}</td>
                  <td>
                    <StatusPill status={r.effectiveStatus} />
                  </td>
                  <td>
                    <ArrowRight size={13} color="var(--muted-2)" />
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={8}>
                    <div className="empty">
                      <CheckSquare2 size={20} style={{ marginBottom: 6 }} />
                      <div>{tab === "Pending" ? "No pending approvals." : "No decisions yet."}</div>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="table-foot">
          <span>
            Every approval records the approver, authority, comment and timestamp.
          </span>
          <span className="spacer" />
          <span>Thread recommends · humans decide</span>
        </div>
      </div>
    </div>
  );
}
