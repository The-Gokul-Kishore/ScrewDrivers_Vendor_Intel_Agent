import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight, Download, Upload } from "lucide-react";
import { formatINR, invoices, vendors } from "../data/seed";
import { useDemoStore } from "../store/useDemoStore";
import { StatusPill } from "../components/StatusPill";

const PAGE_SIZE = 12;

export function Invoices() {
  const navigate = useNavigate();
  const simulated = useDemoStore((s) => s.simulated);
  const showToast = useDemoStore((s) => s.showToast);

  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("All");
  const [vendor, setVendor] = useState("All");
  const [page, setPage] = useState(0);

  const rows = useMemo(() => {
    return invoices
      .filter((i) => !i.simulated || simulated)
      .filter((i) => (status === "All" ? true : i.status === status))
      .filter((i) => (vendor === "All" ? true : i.vendorId === vendor))
      .filter((i) => {
        if (!query) return true;
        const v = vendors.find((x) => x.id === i.vendorId)?.name ?? "";
        return (
          i.id.toLowerCase().includes(query.toLowerCase()) ||
          i.poId.toLowerCase().includes(query.toLowerCase()) ||
          v.toLowerCase().includes(query.toLowerCase())
        );
      });
  }, [simulated, status, vendor, query]);

  const pageCount = Math.max(1, Math.ceil(rows.length / PAGE_SIZE));
  const safePage = Math.min(page, pageCount - 1);
  const visible = rows.slice(safePage * PAGE_SIZE, safePage * PAGE_SIZE + PAGE_SIZE);

  return (
    <div className="page">
      <div className="page-head">
        <div>
          <h1 className="page-title">Invoices</h1>
          <div className="page-sub">
            {rows.length} invoices · 5 vendors · extracted and matched against open POs
          </div>
        </div>
        <div className="page-actions">
          <button
            className="btn"
            onClick={() => showToast("Export queued", "Invoices and exceptions · CSV")}
          >
            <Download size={14} /> Export
          </button>
          <button
            className="btn primary"
            onClick={() =>
              showToast("Upload invoice", "Extraction runs first, then Thread checks the result")
            }
          >
            <Upload size={14} /> Upload invoice
          </button>
        </div>
      </div>

      <div className="card">
        <div className="filters">
          <input
            className="input search"
            placeholder="Search invoice, PO or vendor"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setPage(0);
            }}
          />
          <select
            className="input"
            value={vendor}
            onChange={(e) => {
              setVendor(e.target.value);
              setPage(0);
            }}
            aria-label="Filter by vendor"
          >
            <option value="All">All vendors</option>
            {vendors.map((v) => (
              <option key={v.id} value={v.id}>
                {v.name}
              </option>
            ))}
          </select>
          <select
            className="input"
            value={status}
            onChange={(e) => {
              setStatus(e.target.value);
              setPage(0);
            }}
            aria-label="Filter by status"
          >
            {["All", "Matched", "Exception", "Pending approval", "Paid", "On hold"].map((s) => (
              <option key={s} value={s}>
                {s === "All" ? "All statuses" : s}
              </option>
            ))}
          </select>
          <span className="spacer" />
          <span className="muted" style={{ fontSize: 11.5 }}>
            Extraction confidence shown per invoice
          </span>
        </div>

        <div className="table-wrap">
          <table className="data">
            <thead>
              <tr>
                <th>Invoice</th>
                <th>Vendor</th>
                <th>Date</th>
                <th>PO</th>
                <th style={{ textAlign: "right" }}>Taxable</th>
                <th style={{ textAlign: "right" }}>GST</th>
                <th>Status</th>
                <th>Extraction</th>
              </tr>
            </thead>
            <tbody>
              {visible.map((i) => (
                <tr
                  key={i.id}
                  className="clickable"
                  onClick={() => navigate(`/invoices/${i.id}`)}
                >
                  <td>
                    <div className="cell-strong mono">{i.id}</div>
                    {i.exceptionType && <div className="cell-sub">{i.exceptionType}</div>}
                  </td>
                  <td>{vendors.find((v) => v.id === i.vendorId)?.name}</td>
                  <td className="muted">{i.date}</td>
                  <td className="mono muted">{i.poId}</td>
                  <td className="num">{formatINR(i.amount)}</td>
                  <td className="num muted">{formatINR(i.tax)}</td>
                  <td>
                    <StatusPill status={i.status} />
                  </td>
                  <td>
                    <div className="conf">
                      <div className="conf-bar">
                        <i style={{ width: `${i.confidence * 100}%` }} />
                      </div>
                      {Math.round(i.confidence * 100)}%
                    </div>
                  </td>
                </tr>
              ))}
              {visible.length === 0 && (
                <tr>
                  <td colSpan={8}>
                    <div className="empty">No invoices match these filters.</div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="table-foot">
          <span>
            Showing {rows.length === 0 ? 0 : safePage * PAGE_SIZE + 1}–
            {Math.min(rows.length, (safePage + 1) * PAGE_SIZE)} of {rows.length}
          </span>
          <span className="spacer" />
          <button
            className="btn sm"
            disabled={safePage === 0}
            onClick={() => setPage((p) => Math.max(0, p - 1))}
          >
            Previous
          </button>
          <span>
            Page {safePage + 1} of {pageCount}
          </span>
          <button
            className="btn sm"
            disabled={safePage >= pageCount - 1}
            onClick={() => setPage((p) => Math.min(pageCount - 1, p + 1))}
          >
            Next <ArrowRight size={12} />
          </button>
        </div>
      </div>
    </div>
  );
}
