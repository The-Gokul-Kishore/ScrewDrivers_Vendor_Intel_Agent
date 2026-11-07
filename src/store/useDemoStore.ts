import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { exceptions, patterns, type PatternStatus, type Severity } from "../data/seed";

export interface InboxItem {
  id: string;
  exceptionId: string;
  vendorId: string;
  invoiceId: string;
  type: string;
  severity: Severity;
  amountAtRisk: number;
  age: string;
  confidence: number;
  detectedAt: string;
  unread: boolean;
}

export interface ToastState {
  message: string;
  detail?: string;
  nonce: number;
}

interface DemoState {
  inbox: InboxItem[];
  inboxOpen: boolean;
  simulated: boolean;
  toast: ToastState | null;
  patternStatus: Record<string, PatternStatus>;
  decidedApprovals: Record<string, boolean>;
  openInbox: () => void;
  closeInbox: () => void;
  markRead: (itemId: string) => void;
  markAllRead: () => void;
  dismiss: (itemId: string) => void;
  simulateSync: () => void;
  validatePattern: (patternId: string) => void;
  approveException: (exceptionId: string) => void;
  showToast: (message: string, detail?: string) => void;
  clearToast: () => void;
  resetDemo: () => void;
}

const initialInbox = (): InboxItem[] =>
  ["EXC-1020", "EXC-1018", "EXC-1025"].map((id) => {
    const exc = exceptions.find((e) => e.id === id)!;
    return {
      id: exc.id,
      exceptionId: exc.id,
      vendorId: exc.vendorId,
      invoiceId: exc.invoiceId,
      type: exc.type,
      severity: exc.severity,
      amountAtRisk: exc.amountAtRisk,
      age: exc.age,
      confidence: exc.confidence,
      detectedAt: exc.detectedAt,
      unread: true,
    };
  });

const initialPatternStatus = (): Record<string, PatternStatus> =>
  Object.fromEntries(patterns.map((p) => [p.id, p.status]));

export const useDemoStore = create<DemoState>()(
  persist(
    (set, get) => ({
      inbox: initialInbox(),
      inboxOpen: false,
      simulated: false,
      toast: null,
      patternStatus: initialPatternStatus(),
      decidedApprovals: {},

      openInbox: () => set({ inboxOpen: true }),
      closeInbox: () => set({ inboxOpen: false }),

      markRead: (itemId) =>
        set((s) => ({
          inbox: s.inbox.map((i) => (i.id === itemId ? { ...i, unread: false } : i)),
        })),

      markAllRead: () =>
        set((s) => ({ inbox: s.inbox.map((i) => ({ ...i, unread: false })) })),

      dismiss: (itemId) =>
        set((s) => ({
          inbox: s.inbox.filter((i) => i.id !== itemId),
        })),

      simulateSync: () => {
        const { simulated, inbox, showToast } = get();
        if (simulated) {
          showToast("No new exceptions", "ERP sync complete · 0 new items");
          return;
        }
        const exc = exceptions.find((e) => e.id === "EXC-1101")!;
        const item: InboxItem = {
          id: exc.id,
          exceptionId: exc.id,
          vendorId: exc.vendorId,
          invoiceId: exc.invoiceId,
          type: exc.type,
          severity: exc.severity,
          amountAtRisk: exc.amountAtRisk,
          age: "Just now",
          confidence: exc.confidence,
          detectedAt: "Just now",
          unread: true,
        };
        set({ simulated: true, inbox: [item, ...inbox] });
        showToast(
          "Thread flagged INV-1101",
          "Duplicate freight · ₹9,500 · auto-detected on ERP sync"
        );
      },

      validatePattern: (patternId) => {
        const { showToast } = get();
        const pattern = patterns.find((p) => p.id === patternId);
        set((s) => ({
          patternStatus: { ...s.patternStatus, [patternId]: "Validated" },
        }));
        if (pattern) {
          showToast(
            "Rule validated",
            `${pattern.name} · future invoices will use this rule`
          );
        }
      },

      approveException: (exceptionId) => {
        const { showToast } = get();
        set((s) => ({
          decidedApprovals: { ...s.decidedApprovals, [exceptionId]: true },
          inbox: s.inbox.map((i) =>
            i.exceptionId === exceptionId ? { ...i, unread: false } : i
          ),
        }));
        showToast(
          "Approval recorded",
          `${exceptionId} resolved · Thread updated its memory`
        );
      },

      showToast: (message, detail) =>
        set({ toast: { message, detail, nonce: Date.now() } }),

      clearToast: () => set({ toast: null }),

      resetDemo: () => {
        try {
          localStorage.removeItem("thread-ap-demo");
        } catch {
          /* ignore */
        }
        set({
          inbox: initialInbox(),
          inboxOpen: false,
          simulated: false,
          toast: null,
          patternStatus: initialPatternStatus(),
          decidedApprovals: {},
        });
        window.location.assign("/");
      },
    }),
    {
      name: "thread-ap-demo",
      storage: createJSONStorage(() => localStorage),
      partialize: (s) => ({
        inbox: s.inbox,
        simulated: s.simulated,
        patternStatus: s.patternStatus,
        decidedApprovals: s.decidedApprovals,
      }),
    }
  )
);

export const useUnreadCount = () =>
  useDemoStore((s) => s.inbox.filter((i) => i.unread).length);

export const useHasHighRisk = () =>
  useDemoStore((s) => s.inbox.some((i) => i.unread && i.severity === "high"));
