import { useMemo, useState } from "react";
import { Download, Lock, ScrollText } from "lucide-react";
import { auditEntries } from "../data/seed";
import { useDemoStore } from "../store/useDemoStore";

const kindPill: Record<string, string> = {
  detection: "info",
  recommendation: "info",
  approval: "ok",
  correction: "warn",
  rule: "neutral",
};

export function Audit() {
  const showToast = useDemoStore((s) => s.showToast);
  const [actor, setActor] = useState("All");

  const rows = useMemo(
    () => auditEntries.filter((a) => (actor === "All" ? true : a.actor === actor)),
    [actor]
  );

  return (
    <div className="page">
      <div className="page-head">
        <div>
          <h1 className="page-title">Audit log</h1>
          <div className="page-sub">
            Immutable events · every Thread claim resolves to a source record
          </div>
        </div>
        <div className="page-actions">
          <button
            className="btn"
            onClick={() => showToast("Audit export queued", "CSV · last 90 days")}
          >
            <Download size={14} /> Export
          </button>
        </div>
      </div>

      <div className="card">
        <div className="filters">
          <div className="row" style={{ gap: 5 }}>
            {["All", "Thread", "Human"].map((a) => (
              <button
                key={a}
                className={`btn sm ${actor === a ? "primary" : ""}`}
                onClick={() => setActor(a)}
              >
                {a}
              </button>
            ))}
          </div>
          <span className="spacer" />
          <span className="pill neutral">
            <Lock size={10} /> Append-only
          </span>
          <span className="muted" style={{ fontSize: 11.5 }}>
            {rows.length} events
          </span>
        </div>

        <div className="table-wrap">
          <table className="data">
            <thead>
              <tr>
                <th>Timestamp</th>
                <th>Actor</th>
                <th>Action</th>
                <th>Target</th>
                <th>Type</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((a) => (
                <tr key={a.id}>
                  <td className="muted" style={{ whiteSpace: "nowrap" }}>
                    {a.timestamp}
                  </td>
                  <td>
                    <span className={`pill ${a.actor === "Thread" ? "info" : "neutral"}`}>
                      {a.actor}
                    </span>
                  </td>
                  <td className="cell-strong">{a.action}</td>
                  <td className="mono">{a.target}</td>
                  <td>
                    <span className={`pill ${kindPill[a.kind] ?? "neutral"}`}>{a.kind}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="table-foot">
          <span className="row" style={{ gap: 5 }}>
            <ScrollText size={12} /> Events are retained even if memory is corrected or superseded.
          </span>
          <span className="spacer" />
          <span>No edits · no deletes</span>
        </div>
      </div>
    </div>
  );
}
