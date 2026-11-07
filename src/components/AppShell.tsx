import { useEffect, useMemo, useRef, useState } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import {
  AlertTriangle,
  ArrowUpRight,
  Bell,
  BrainCircuit,
  Building2,
  CheckSquare2,
  ChevronDown,
  FileText,
  LayoutDashboard,
  LogOut,
  RotateCcw,
  Search,
  Settings,
  ShieldCheck,
  ScrollText,
  X,
} from "lucide-react";
import { exceptions, invoices, vendors } from "../data/seed";
import { useDemoStore, useHasHighRisk, useUnreadCount } from "../store/useDemoStore";
import { ThreadMark } from "./ThreadMark";
import { ThreadInbox } from "./ThreadInbox";
import { Toast } from "./Toast";

const nav = [
  { to: "/", label: "Overview", icon: LayoutDashboard, end: true },
  { to: "/invoices", label: "Invoices", icon: FileText },
  { to: "/exceptions", label: "Exceptions", icon: AlertTriangle },
  { to: "/vendors", label: "Vendors", icon: Building2 },
  { to: "/approvals", label: "Approvals", icon: CheckSquare2 },
];

const intel = [
  { to: "/learning", label: "Learning", icon: BrainCircuit },
  { to: "/audit", label: "Audit log", icon: ScrollText },
];

export function AppShell() {
  const navigate = useNavigate();
  const unread = useUnreadCount();
  const highRisk = useHasHighRisk();
  const openInbox = useDemoStore((s) => s.openInbox);
  const simulateSync = useDemoStore((s) => s.simulateSync);
  const simulated = useDemoStore((s) => s.simulated);
  const showToast = useDemoStore((s) => s.showToast);
  const resetDemo = useDemoStore((s) => s.resetDemo);

  const [cmdkOpen, setCmdkOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);
  const [pulse, setPulse] = useState(false);
  const prevCount = useRef(unread);

  useEffect(() => {
    if (unread > prevCount.current) {
      setPulse(true);
      const t = window.setTimeout(() => setPulse(false), 450);
      prevCount.current = unread;
      return () => window.clearTimeout(t);
    }
    prevCount.current = unread;
  }, [unread]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setCmdkOpen((o) => !o);
      }
      if (e.key === "Escape") {
        setCmdkOpen(false);
        setMenuOpen(false);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  const cmdkItems = useMemo(() => {
    const pages = [...nav, ...intel].map((n) => ({
      label: n.label,
      sub: "Page",
      path: n.to,
    }));
    const vendorItems = vendors.map((v) => ({
      label: v.name,
      sub: `Vendor · ${v.gstin}`,
      path: `/vendors/${v.id}`,
    }));
    const exceptionItems = exceptions
      .filter((e) => e.status !== "Resolved")
      .map((e) => ({
        label: `${e.type} · ${e.invoiceId}`,
        sub: `Exception · ${e.id}`,
        path: `/exceptions/${e.id}`,
      }));
    const invoiceItems = invoices.slice(0, 20).map((i) => ({
      label: i.id,
      sub: `Invoice · ${vendors.find((v) => v.id === i.vendorId)?.name}`,
      path: `/invoices/${i.id}`,
    }));
    return [...pages, ...exceptionItems, ...vendorItems, ...invoiceItems];
  }, []);

  const filtered = cmdkItems.filter(
    (i) =>
      i.label.toLowerCase().includes(query.toLowerCase()) ||
      i.sub.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="shell">
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-mark">
            <ThreadMark size={19} />
          </div>
          <div className="brand-text">
            <div className="brand-name">AP Cloud</div>
            <div className="brand-sub">Thread · vendor intelligence</div>
          </div>
        </div>

        <div className="nav-scroll">
          <div className="nav-section">Operations</div>
          {nav.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={({ isActive }) => `nav-item ${isActive ? "active" : ""}`}
                style={{ position: "relative" }}
              >
                <Icon />
                <span>{item.label}</span>
                {item.to === "/exceptions" && unread > 0 && (
                  <span className={`nav-badge ${highRisk ? "risk" : ""}`} aria-label={`${unread} new exceptions`}>
                    {unread > 9 ? "9+" : unread}
                  </span>
                )}
              </NavLink>
            );
          })}

          <div className="nav-section" style={{ marginTop: 8 }}>
            Intelligence
          </div>
          {intel.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) => `nav-item ${isActive ? "active" : ""}`}
              >
                <Icon />
                <span>{item.label}</span>
              </NavLink>
            );
          })}

          <div className="nav-section" style={{ marginTop: 8 }}>
            Workspace
          </div>
          <button
            className="nav-item"
            style={{ width: "100%", border: 0, background: "transparent", textAlign: "left" }}
            onClick={() => showToast("Settings", "Severity thresholds, routing and integrations")}
          >
            <Settings />
            <span>Settings</span>
          </button>
        </div>

        <div className="sidebar-foot">
          <div className="avatar">AK</div>
          <div className="user-meta" style={{ lineHeight: 1.25 }}>
            <div className="user-name">Arjun K.</div>
            <div className="user-role">AP Analyst</div>
          </div>
        </div>
      </aside>

      <div className="main">
        <header className="topbar">
          <button className="search-trigger" onClick={() => setCmdkOpen(true)}>
            <Search size={14} />
            <span>Search invoices, vendors, exceptions…</span>
            <span className="kbd">⌘K</span>
          </button>

          <div className="topbar-right">
            <button
              className="sync-chip"
              onClick={simulateSync}
              title="Run ERP sync now"
              style={{ cursor: "pointer" }}
            >
              <span className="sync-dot" />
              ERP synced {simulated ? "just now" : "2m ago"}
            </button>
            <span className="sync-chip optional">
              <ShieldCheck size={12} color="#067647" />
              GST ✓
            </span>
            <button
              className="icon-btn"
              aria-label={`${unread} notifications`}
              onClick={openInbox}
            >
              <Bell size={16} />
              {unread > 0 && <span className="dot" />}
            </button>
            <div style={{ position: "relative", marginLeft: 2 }}>
              <button
                className="avatar"
                style={{ border: 0, width: 30, height: 30 }}
                onClick={() => setMenuOpen((o) => !o)}
                aria-label="Open user menu"
              >
                AK
              </button>
              {menuOpen && (
                <>
                  <div className="menu-backdrop" onClick={() => setMenuOpen(false)} />
                  <div className="user-menu">
                    <div style={{ padding: "11px 12px" }}>
                      <div className="user-name" style={{ color: "var(--text)" }}>
                        Arjun K.
                      </div>
                      <div className="user-role">AP Analyst · Finance Ops</div>
                    </div>
                    <button
                      className="menu-item"
                      onClick={() => {
                        setMenuOpen(false);
                        showToast("Notification settings", "Severity threshold and quiet hours");
                      }}
                    >
                      <Settings size={14} /> Notification settings
                    </button>
                    <button
                      className="menu-item"
                      onClick={() => {
                        setMenuOpen(false);
                        showToast("Integrations", "ERP · GST · Email · Helpdesk connected");
                      }}
                    >
                      <ShieldCheck size={14} /> Integrations
                    </button>
                    <button
                      className="menu-item danger"
                      onClick={() => {
                        setMenuOpen(false);
                        resetDemo();
                      }}
                    >
                      <RotateCcw size={14} /> Reset demo
                    </button>
                    <button
                      className="menu-item"
                      onClick={() => {
                        setMenuOpen(false);
                        showToast("Signed out", "Demo session only");
                      }}
                    >
                      <LogOut size={14} /> Sign out
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </header>

        <main className="content">
          <Outlet />
        </main>
      </div>

      <button
        className="thread-fab"
        onClick={openInbox}
        aria-label={`Thread: ${unread} new exceptions`}
        title="Thread inbox"
      >
        <ThreadMark size={26} />
        {unread > 0 && (
          <span className={`fab-badge ${highRisk ? "risk" : ""} ${pulse ? "pulse" : ""}`}>
            {unread > 9 ? "9+" : unread}
          </span>
        )}
      </button>

      <ThreadInbox />
      <Toast />

      {cmdkOpen && (
        <div
          className="overlay"
          style={{ display: "flex", alignItems: "flex-start", justifyContent: "center", paddingTop: "12vh" }}
          onClick={() => setCmdkOpen(false)}
        >
          <div
            className="cmdk"
            role="dialog"
            aria-modal="true"
            aria-label="Global search"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="cmdk-input-row">
              <Search size={15} color="var(--muted)" />
              <input
                autoFocus
                className="cmdk-input"
                placeholder="Search invoices, vendors, exceptions…"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
              <button className="icon-btn" onClick={() => setCmdkOpen(false)} aria-label="Close search">
                <X size={15} />
              </button>
            </div>
            <div className="cmdk-list">
              {filtered.slice(0, 12).map((item) => (
                <button
                  key={`${item.path}-${item.label}`}
                  className="cmdk-item"
                  onClick={() => {
                    setCmdkOpen(false);
                    setQuery("");
                    navigate(item.path);
                  }}
                >
                  <div>
                    <div className="cmdk-label">{item.label}</div>
                    <div className="cmdk-sub">{item.sub}</div>
                  </div>
                  <ArrowUpRight size={13} color="var(--muted-2)" />
                </button>
              ))}
              {filtered.length === 0 && (
                <div className="empty" style={{ padding: 24 }}>
                  No matches for “{query}”.
                </div>
              )}
            </div>
            <div className="cmdk-foot">
              <span>
                <ChevronDown size={12} /> Navigate
              </span>
              <span className="spacer" />
              <span>Esc to close</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
