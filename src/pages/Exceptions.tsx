import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight, RefreshCw } from "lucide-react";
import { exceptions, formatINR, vendorById } from "../data/seed";
import { useDemoStore } from "../store/useDemoStore";
import { SeverityLabel, StatusPill } from "../components/StatusPill";

export function Exceptions() {
  const navigate = useNavigate();
  const simulated = useDemoStore((s) => s.simulated);
  const simulateSync = useDemoStore((s) => s.simulateSync);

  const [severity, setSeverity] = useState("All");
  const [status, setStatus] = useState("Open");
  const [query, setQuery] = useState("");

  const rows = useMemo(
    () =>
      exceptions
        .filter((e) => !e.simulated || simulated)
        .filter((e) => (status === "All" ? true : e.status === status))
        .filter((e) => (severity === "All" ? true : e.severity === severity))
        .filter((e) => {
          if (!query) return true;
          const v = vendorById(e.vendorId).name;
          return (
            e.type.toLowerCase().includes(query.toLowerCase()) ||
            e.invoiceId.toLowerCase().includes(query.toLowerCase()) ||
            v.toLowerCase().includes(query.toLowerCase())
          );
        }),
    [simulated, status, severity, query]
  );

  const atRisk = rows
    .filter((e) => e.status !== "Resolved")
    .reduce((s, e) => s + e.amountAtRisk, 0);

  return (
    <div className="page">
      <div className="page-head">
        <div>
          <h1 className="page-title">Exceptions</h1>
          <div className="page-sub">
            {rows.filter((e) => e.status !== "Resolved").length} open ·{" "}
            {formatINR(atRisk)} at risk · detected automatically by Thread
          </div>
        </div>
        <div className="page-actions">
          <button className="btn" onClick={simulateSync}>
            <RefreshCw size={14} /> Sync now
          </button>
        </div>
      </div>

      <div className="card">
        <div className="filters">
          <input
            className="input search"
            placeholder="Search exception, invoice or vendor"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <div className="row" style={{ gap: 5 }}>
            {["All", "high", "medium", "low"].map((s) => (
              <button
                key={s}
                className={`btn sm ${severity === s ? "primary" : ""}`}
                onClick={() => setSeverity(s)}
              >
                {s === "All" ? "All severity" : s[0].toUpperCase() + s.slice(1)}
              </button>
            ))}
          </div>
          <span className="spacer" />
          <select
            className="input"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            aria-label="Filter by status"
          >
            {["Open", "All", "Pending approval", "Resolved"].map((s) => (
              <option key={s} value={s}>
                {s === "All" ? "All statuses" : s}
              </option>
            ))}
          </select>
        </div>

        <div className="table-wrap">
          <table className="data">
            <thead>
              <tr>
                <th>Severity</th>
                <th>Exception</th>
                <th>Vendor</th>
                <th>Invoice</th>
                <th style={{ textAlign: "right" }}>At risk</th>
                <th>Confidence</th>
                <th>Detected</th>
                <th>Status</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {rows.map((e) => (
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
                  <td>{vendorById(e.vendorId).name}</td>
                  <td className="mono">{e.invoiceId}</td>
                  <td className="num">{formatINR(e.amountAtRisk)}</td>
                  <td>
                    <div className="conf">
                      <div className="conf-bar">
                        <i style={{ width: `${e.confidence * 100}%` }} />
                      </div>
                      {Math.round(e.confidence * 100)}%
                    </div>
                  </td>
                  <td className="muted">{e.detectedAt}</td>
                  <td>
                    <StatusPill status={e.status} />
                  </td>
                  <td>
                    <ArrowRight size={13} color="var(--muted-2)" />
                  </td>
                </tr>
              ))}
              {rows.length === 0 && (
                <tr>
                  <td colSpan={9}>
                    <div className="empty">No exceptions match these filters.</div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="table-foot">
          <span>
            {rows.length} exception{rows.length === 1 ? "" : "s"} · Thread runs on ingestion, not on
            a schedule
          </span>
          <span className="spacer" />
          <span>Routes: AP Manager · Tax Lead · Category Manager</span>
        </div>
      </div>
    </div>
  );
}
