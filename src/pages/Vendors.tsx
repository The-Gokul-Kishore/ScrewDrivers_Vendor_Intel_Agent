import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight, Building2 } from "lucide-react";
import {
  exceptions,
  formatCompactINR,
  formatINR,
  invoices,
  vendors,
} from "../data/seed";
import { useDemoStore } from "../store/useDemoStore";

const riskPill = { Low: "ok", Medium: "warn", High: "danger" } as const;

export function Vendors() {
  const navigate = useNavigate();
  const simulated = useDemoStore((s) => s.simulated);
  const [query, setQuery] = useState("");

  const rows = vendors.filter(
    (v) =>
      v.name.toLowerCase().includes(query.toLowerCase()) ||
      v.gstin.toLowerCase().includes(query.toLowerCase())
  );

  const openBalance = vendors.reduce((s, v) => s + v.openBalance, 0);

  return (
    <div className="page">
      <div className="page-head">
        <div>
          <h1 className="page-title">Vendors</h1>
          <div className="page-sub">
            {vendors.length} active vendors · {formatCompactINR(openBalance)} open balance · memory
            retained per vendor
          </div>
        </div>
      </div>

      <div className="card">
        <div className="filters">
          <input
            className="input search"
            placeholder="Search vendor or GSTIN"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <span className="spacer" />
          <span className="muted" style={{ fontSize: 11.5 }}>
            Vendor identity reconciled by GSTIN
          </span>
        </div>

        <div className="table-wrap">
          <table className="data">
            <thead>
              <tr>
                <th>Vendor</th>
                <th>Location</th>
                <th>Terms</th>
                <th>Risk</th>
                <th style={{ textAlign: "right" }}>Invoices</th>
                <th style={{ textAlign: "right" }}>Open balance</th>
                <th style={{ textAlign: "right" }}>Exceptions</th>
                <th>Last activity</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {rows.map((v) => {
                const openExceptions = exceptions.filter(
                  (e) =>
                    e.vendorId === v.id &&
                    e.status !== "Resolved" &&
                    (!e.simulated || simulated)
                ).length;
                const count = invoices.filter(
                  (i) => i.vendorId === v.id && (!i.simulated || simulated)
                ).length;
                return (
                  <tr key={v.id} className="clickable" onClick={() => navigate(`/vendors/${v.id}`)}>
                    <td>
                      <div className="row" style={{ gap: 8 }}>
                        <Building2 size={14} color="var(--muted)" />
                        <div>
                          <div className="cell-strong">{v.name}</div>
                          <div className="cell-sub mono">{v.gstin}</div>
                        </div>
                      </div>
                    </td>
                    <td className="muted">{v.city}</td>
                    <td>{v.terms}</td>
                    <td>
                      <span className={`pill ${riskPill[v.risk]}`}>{v.risk}</span>
                    </td>
                    <td className="num">{count}</td>
                    <td className="num">{formatINR(v.openBalance)}</td>
                    <td className="num">
                      {openExceptions > 0 ? (
                        <span className="pill danger">{openExceptions}</span>
                      ) : (
                        <span className="muted">0</span>
                      )}
                    </td>
                    <td className="muted">{v.lastActivity}</td>
                    <td>
                      <ArrowRight size={13} color="var(--muted-2)" />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className="table-foot">
          <span>Open balance is the sum of unmatched and approved invoices</span>
          <span className="spacer" />
          <span>Thread retains memory per GSTIN, not per name</span>
        </div>
      </div>
    </div>
  );
}
