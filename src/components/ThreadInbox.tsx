import { useNavigate } from "react-router-dom";
import { X, ArrowUpRight, ShieldAlert, Clock } from "lucide-react";
import { formatINR, vendorById } from "../data/seed";
import { useDemoStore } from "../store/useDemoStore";
import { ThreadMark } from "./ThreadMark";
import { SeverityLabel } from "./StatusPill";

export function ThreadInbox() {
  const navigate = useNavigate();
  const open = useDemoStore((s) => s.inboxOpen);
  const inbox = useDemoStore((s) => s.inbox);
  const close = useDemoStore((s) => s.closeInbox);
  const markRead = useDemoStore((s) => s.markRead);
  const dismiss = useDemoStore((s) => s.dismiss);
  const showToast = useDemoStore((s) => s.showToast);

  if (!open) return null;

  const unread = inbox.filter((i) => i.unread);
  const reviewed = inbox.filter((i) => !i.unread);

  const review = (id: string, exceptionId: string) => {
    markRead(id);
    close();
    navigate(`/exceptions/${exceptionId}`);
  };

  const snooze = (id: string, label: string) => {
    markRead(id);
    showToast("Snoozed for 1 hour", label);
    close();
  };

  const remove = (id: string) => {
    dismiss(id);
    showToast("Exception dismissed", "Reason recorded in the audit log");
  };

  const renderItem = (item: (typeof inbox)[number]) => (
    <div key={item.id} className={`inbox-item ${item.unread ? "unread" : ""}`}>
      <div className="inbox-item-top">
        <SeverityLabel severity={item.severity} />
        <span className="inbox-item-title">{item.type}</span>
        <span className="spacer" />
        {item.unread && <span className="pill info">New</span>}
        {item.severity === "high" && (
          <ShieldAlert size={13} color="#b42318" aria-label="High risk" />
        )}
      </div>
      <div className="inbox-item-meta">
        {vendorById(item.vendorId).name} · <span className="mono">{item.invoiceId}</span> ·{" "}
        <b style={{ color: "var(--text)", fontWeight: 650 }}>{formatINR(item.amountAtRisk)}</b> at
        risk
      </div>
      <div className="inbox-item-meta row" style={{ gap: 10 }}>
        <span className="row" style={{ gap: 4 }}>
          <Clock size={11} /> {item.age}
        </span>
        <span>{Math.round(item.confidence * 100)}% confidence</span>
        <span className="spacer" />
        <span>Auto-detected</span>
      </div>
      <div className="inbox-item-actions">
        <button
          className="btn sm primary"
          onClick={() => review(item.id, item.exceptionId)}
        >
          Review <ArrowUpRight size={12} />
        </button>
        <button className="btn sm ghost" onClick={() => snooze(item.id, `${item.type} · ${item.invoiceId}`)}>
          Snooze
        </button>
        <button className="btn sm ghost" onClick={() => remove(item.id)}>
          Dismiss
        </button>
      </div>
    </div>
  );

  return (
    <>
      <div className="overlay" onClick={close} aria-hidden="true" />
      <aside
        className="inbox"
        role="dialog"
        aria-modal="true"
        aria-label="Thread inbox"
        onKeyDown={(e) => e.key === "Escape" && close()}
      >
        <div className="inbox-head">
          <div className="inbox-mark">
            <ThreadMark size={17} />
          </div>
          <div>
            <div className="inbox-title">Thread</div>
            <div className="inbox-sub">
              {unread.length > 0
                ? `${unread.length} exception${unread.length === 1 ? "" : "s"} need review`
                : "Nothing waiting for review"}
            </div>
          </div>
          <button className="icon-btn" style={{ marginLeft: "auto" }} onClick={close} aria-label="Close inbox">
            <X size={16} />
          </button>
        </div>

        <div className="auto-chip">
          <span className="sync-dot" />
          Auto-run on · last checked 12s ago
        </div>

        <div className="inbox-list">
          {unread.length > 0 && <div className="inbox-group">Needs review</div>}
          {unread.map(renderItem)}

          {reviewed.length > 0 && <div className="inbox-group">Reviewed</div>}
          {reviewed.map(renderItem)}

          {inbox.length === 0 && (
            <div className="empty" style={{ paddingTop: 48 }}>
              <ThreadMark size={26} />
              <div style={{ marginTop: 10, fontWeight: 600 }}>Nothing waiting.</div>
              <div style={{ marginTop: 3 }}>
                Thread checks every new invoice automatically and only interrupts when it finds
                something.
              </div>
            </div>
          )}
        </div>

        <div className="inbox-foot">
          <span>Showing Medium severity and above</span>
          <span className="spacer" />
          <button
            className="btn sm ghost"
            onClick={() => showToast("Notification preferences", "Severity threshold, quiet hours and routing")}
          >
            Settings
          </button>
        </div>
      </aside>
    </>
  );
}
