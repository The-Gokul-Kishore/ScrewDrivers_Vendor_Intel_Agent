import type { ExceptionStatus, InvoiceStatus, Severity } from "../data/seed";

const statusClass: Record<string, string> = {
  Matched: "ok",
  Exception: "danger",
  "Pending approval": "warn",
  Paid: "neutral",
  "On hold": "warn",
  Open: "danger",
  Resolved: "neutral",
  Pending: "warn",
  Approved: "ok",
  Rejected: "danger",
  Observed: "warn",
  Validated: "ok",
  Authorized: "info",
};

export function StatusPill({
  status,
}: {
  status: InvoiceStatus | ExceptionStatus | "Pending" | "Approved" | "Rejected" | "Observed" | "Validated" | "Authorized";
}) {
  return <span className={`pill ${statusClass[status] ?? "neutral"}`}>{status}</span>;
}

export function SeverityLabel({ severity }: { severity: Severity }) {
  return (
    <span className={`sev ${severity}`}>
      <span className="sev-dot" />
      {severity}
    </span>
  );
}
