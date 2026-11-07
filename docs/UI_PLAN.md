# UI Plan — Thread, the AP Exception Agent

A build plan for a demo that feels like Thread is **already part of an existing invoice / accounts-payable system** — and that it works **automatically**, without being asked.

---

## 1. Goal & guiding principle

**Demo promise:** a new invoice arrives, Thread detects an exception on its own, a notification badge appears, and the analyst opens an evidence-backed recommendation, approves it, and teaches the system a rule.

**Guiding principles:**

- **Embedded, not bolted on.** Thread lives inside a mature-looking AP product: dense tables, filters, status pills, breadcrumbs, approvals, audit trail.
- **Automatic by default.** Thread runs on every ingested invoice. The user does not prompt it to start.
- **Interrupt with restraint.** The badge reports work; it does not hijack the screen. Thread never opens itself.
- **Every claim is clickable.** Evidence chips resolve to real invoices, POs, prior cases and approvals.
- **Humans approve.** Thread recommends and routes. No autonomous payment execution.

**Demo length:** 5 minutes, 3 acts, one clear learning moment.

---

## 2. Implementation status (shell)

The shell is built and runnable:

```bash
npm install
npm run dev
```

- App chrome: dark sidebar, top bar, global `⌘K` search, ERP/GST sync chips, user menu with **Reset demo**
- Pages: Overview, Invoices, Invoice detail, Exceptions, Exception detail, Vendors, Vendor 360, Approvals, Learning, Audit
- Thread: floating button with count badge and red ring for high risk, inbox slide-over, review/snooze/dismiss, evidence chips, approval modal, feedback and correction toasts
- Automatic flow: **Simulate ERP sync** ingests `INV-1101` and increments the badge `3 → 4` with one pulse and a toast
- Fixtures: 5 vendors, 100 seeded invoices, 5 exception types, memory facts, patterns, approvals and audit events
- State: `localStorage` persistence for inbox, approvals and rule validation; reset restores the starting state

Not built yet: real upload/extraction, backend persistence, settings pages, role-based routing.

---

## 3. The name: Thread

**Thread** — the agent's name.

> **Every exception has a thread.**

Why it fits:

| Layer | Meaning |
| --- | --- |
| Screw thread | The project's screwdriver DNA; the part that actually holds things together |
| Case thread | Invoice → exception → evidence → decision → outcome, kept connected |
| Conversation thread | A continuing relationship with the vendor, not a one-off query |

**Voice:** short, operational, cites record IDs. No persona, no jokes, no emoji.

**Example lines:**
- "Thread found 4 prior freight exceptions for ABC Logistics."
- "Thread needs the current PO before recommending rejection."
- "Thread updated its memory from your correction."

**Mark:** a circular screw-thread spiral, drawn as a single continuous line. Monochrome, works at 16px in the sidebar and 24px on the floating button. The same mark carries the notification badge.

**Do not** name the feature "AI Insights" in the final UI — use **Thread** for the agent, and **Thread inbox** for its notification surface.

---

## 4. What "existing invoice system" means visually

Build a believable shell first; Thread lives inside it.

```
┌──────────────────────────────────────────────────────────────────────┐
│  AP Cloud   [Global search ⌘K]        Sync: ERP ✓  GST ✓  🔔  (AK)   │
├───────────────┬──────────────────────────────────────────────────────┤
│  Overview     │  Invoices / INV-1020                                 │
│  Invoices  ●3 │  ─────────────────────────────────────────────────   │
│  Exceptions   │  [Extraction] [Checks] [Evidence] [Approval]         │
│  Vendors      │                                                      │
│  Approvals    │   Dense grid: field · extracted · PO · status        │
│  Learning     │                                                      │
│  Audit log    │                                  ┌─────────────────┐ │
│               │                                  │  ✦ Thread       │ │
│               │                                  │  (slide-over)   │ │
└───────────────┴──────────────────────────────────┴─────────────────┘
                                                         ╭─────────╮
                                                         │  ⟳   3  │ ← floating Thread button + badge
                                                         ╰─────────╯
```

**Chrome checklist:**

- Org switcher, user avatar with role ("AP Analyst"), notification bell.
- Breadcrumbs on every detail page; tabs inside records.
- Data grids: sorting, filter chips, bulk select, row hover actions, empty states.
- Status taxonomy: `Matched`, `Exception`, `Pending approval`, `Approved`, `Rejected`, `Scheduled`, `Paid`.
- Record detail with right-rail activity timeline.
- Toasts, confirmation modals, immutable audit entries.
- Integration page: "Connected: ERP, GST portal, Email, Helpdesk" with last-sync timestamps.
- `⌘K` command palette.

**Where Thread appears:**

| Placement | Behavior |
| --- | --- |
| Floating button, bottom-right | Always available; carries the notification badge |
| Sidebar "Exceptions" row | Mirrors the same unread count for discoverability |
| Thread inbox (slide-over) | Auto-detected exceptions, grouped by severity |
| Inline `✦ Thread` on rows | Opens the pane scoped to that invoice/exception |
| Thread pane (right slide-over) | Contextual analysis for the open record |
| Learning page | Observed patterns and proposed rules |

**Permissions line** in the Thread header: `Read: invoices · POs · vendors · exceptions · approvals` / `Write: none without approval`.

---

## 5. Automatic detection & the notification badge

This is the core of "it's an automatic system", so build it deliberately.

### 4.1 What the badge means

- Count = **unresolved exceptions Thread detected and assigned to the current user**, not messages.
- Scoped per user and per role; an AP manager sees items routed to them.
- Includes only items at or above the user's severity threshold (default **Medium**).
- **High-severity items get a red ring** around the badge; the count stays neutral (amber/indigo) so the UI doesn't scream.
- Cap display at `9+` (or `99+` at scale); keep the true count in the accessible label.
- Zero = **no badge at all** (not a grey zero).

### 4.2 Badge states

| State | Visual | Trigger |
| --- | --- | --- |
| Empty | Plain Thread mark | Nothing unresolved |
| New | Count + one 400ms scale pulse | A detection lands while the app is open |
| Unread backlog | Static count | Items present from a prior session |
| High risk | Count + red ring | Bank-detail change, suspected fraud, large value |
| Snoozed | Moon glyph replaces count | User snoozed the inbox |
| Paused | Grey dot, no count | Auto-run toggled off in settings |
| Error | Small warning glyph | Ingestion/sync failure — never silently drop items |

**Motion budget:** one pulse per new detection, no looping animation, respect `prefers-reduced-motion`.

### 4.3 Interaction

1. Click the floating button → **Thread inbox** slides in from the right.
2. Inbox groups: **Needs review**, **Watching**, **Snoozed**, **Done today**.
3. Each row: severity dot, exception type, vendor, invoice ID, amount at risk, age, confidence, rule match.
4. Row actions: **Review**, **Snooze** (1h / tomorrow), **Dismiss** (requires a reason).
5. **Review** opens the exception record *behind* the pane with Thread's analysis already loaded.
6. Reviewing or dismissing decrements the badge; "Mark all read" is available but never the default.
7. Badge state persists in `localStorage` so a refresh doesn't reset the demo.

### 4.4 Automatic run behavior

- Thread runs **on ingestion** — invoice upload, email-in, or simulated ERP sync. No prompt.
- A small **"Auto-run · last checked 12s ago"** chip in the inbox sells the automation.
- Settings (read-only in the demo): severity threshold, quiet hours, daily digest, routed queues.
- **Demo control:** a "Simulate ERP sync" action triggers a detection after ~2 seconds, so the badge increment can be shown live.
- Notifications: in-app toast only — "Thread flagged INV-1101 · duplicate freight · ₹9,500". No modal.

### 4.5 Accessibility

- `aria-label="Thread: 3 new exceptions"` and `aria-live="polite"` on the count.
- Never color-only: severity text, icon and label.
- Focus ring on the floating button; `Esc` closes the inbox; focus returns to the trigger.
- 44×44px minimum target; badge text at least 11px bold with AA contrast.

### 4.6 Anti-patterns to avoid

- Badge counting "AI suggestions" the user never asked for.
- Red for low-severity items; infinite blinking; modal takeover.
- Auto-opening the pane on detection.
- A badge that never clears, which teaches users to ignore it.

---

## 6. Default decisions

| Decision | Default | Why |
| --- | --- | --- |
| Stack | Next.js + TypeScript + Tailwind + shadcn/ui | Fast enterprise UI, easy deploy |
| Tables | TanStack Table | Sorting/filtering without hand-rolling |
| State | Zustand + TanStack Query (mocked) | Trivial demo reset |
| Motion | Framer Motion, restrained | Recall staging + one badge pulse |
| Icons | Lucide + custom Thread mark | Consistent, neutral |
| Data | Local JSON fixtures behind a mock API (MSW or route handlers) | Deterministic, offline-safe |
| AI | Pre-written responses with simulated streaming; optional LLM adapter | Demo cannot fail |
| Persistence | `localStorage` for read state, approvals, feedback + reset | Survives refresh, resettable |
| Currency/locale | INR (`en-IN`), GST fields | Matches the target market |
| Target viewport | 1440×900, passable at 1280×720 | Projector safety |

Open choices: name/logo of the host invoice system, accent color, light-only vs light+dark.

---

## 7. Screen map

| # | Screen | Purpose | Must-have components |
| --- | --- | --- | --- |
| 1 | **Overview** | Establish the product before Thread appears | Invoice volume, exception rate, open approvals, Thread summary card |
| 2 | **Invoices** | Ingestion and extraction | Upload, extraction confidence per field, status, linked PO |
| 3 | **Invoice detail** | Where exceptions surface | Field-level diff, deterministic checks, evidence, approval, timeline |
| 4 | **Exceptions queue** | The working list | Filters by type/severity/vendor, amount at risk, assignee, age |
| 5 | **Exception detail** | The core demo | Thread recommendation, why, evidence chips, route, actions |
| 6 | **Vendor intelligence** | The memory surface | Profile, history, exception patterns, memory inspector tab |
| 7 | **Approvals** | Human-in-the-loop | What changes, why, approver authority, confirm/cancel |
| 8 | **Learning analytics** | The payoff | Observed → Validated → Authorized rules, source cases, accuracy |
| 9 | **Thread inbox** | Automatic notifications | Badge sync, grouped list, review/snooze/dismiss |
| 10 | **Audit log** | Governance credibility | Actor, action, evidence, before/after, timestamp |
| 11 | **Reset demo** | Operational safety | One-click reseed, hidden in the user menu |

**Cut line if time is short:** 1, 3, 4, 5, 7, 8, 9.

---

## 8. Thread answer anatomy (trust design)

Recommendation first, evidence always visible, uncertainty never hidden.

```
┌────────────────────────────────────────────────────┐
│ ⌀ Thread                    ABC Logistics      ✕  │
│ Read: invoices, POs, vendors · Write: approval only│
├────────────────────────────────────────────────────┤
│ INV-1020 · Duplicate freight · ₹12,000 · Medium    │
│                                                    │
│ ● Recalled 5 prior freight cases from 100 invoices │
│   checks · invoices · POs · resolutions            │
│                                                    │
│ RECOMMENDATION                     92% · High      │
│ Reject the ₹12,000 freight line. PO-204 already    │
│ includes freight for this shipment.                │
│ Route: AP Manager · No payment action executed.    │
│                                                    │
│ CHECKS                                             │
│ ✓ Duplicate invoice   ✓ Totals   ✗ Freight         │
│                                                    │
│ WHY THIS                                   ▾       │
│ 1. INV-1001, 1003, 1005 had the same charge rejected│
│ 2. INV-1012 was confirmed by an AP manager         │
│ 3. Current PO-204 covers freight                   │
│                                                    │
│ EVIDENCE                                           │
│ [INV-1020] [PO-204] [INV-1005] [INV-1012]  +1      │
│                                                    │
│ [Reject freight] [Ask AP Manager] [Draft note]     │
│                                                    │
│ Helpful?  👍  👎      Correct Thread               │
└────────────────────────────────────────────────────┘
```

**Rules:**

- **Every evidence chip opens the real record** with the cited field highlighted. No dead chips.
- **Confidence is qualitative + numeric** and honest. Low confidence shows "Needs review", not a fabricated score.
- **Memory vs. current record** are visually distinct. A current contract, PO, tax rule or authorization always wins over stale memory.
- **"Not enough evidence" state:** Thread says so and offers the next-best step. One scripted scenario must show this.
- **Progress is staged:** `Reading invoice… → Running checks… → Recalling vendor history… → Comparing 5 cases…` (1.5–2.5s total).
- **Feedback loop:** correction captures a reason, then shows "Memory updated — future ABC Logistics freight cases will use this."

---

## 9. Demo storyboard (5 minutes)

### Act 1 — The system as it is (0:00–0:45)

1. Land on **Overview**. Point out exception rate and the open queue. Thread button shows **3** (backlog).
2. Open **INV-1020** from the queue. Show extraction, the field diff, and the failed freight check.
3. Briefly show the manual alternative: prior cases spread across invoices, POs and email. "This is the 30-minute hunt."

### Act 2 — Thread detects on its own (0:45–3:15)

4. Trigger **Simulate ERP sync** (or upload a new invoice). A "Thread is checking…" chip appears.
5. ~2 seconds later the badge goes **3 → 4** with one pulse and a toast: *"Thread flagged INV-1101 · duplicate freight · ₹9,500"*.
6. Click the floating button → **Thread inbox**. Show the new item on top, severity and amount at risk.
7. Click **Review** → exception detail opens with the pane already populated.
8. Expand **Why this**; click `PO-204` → record peek highlights *freight included*.
9. Click `INV-1005` and `INV-1012` → prior rejection and prior manager confirmation.
10. Click **Reject freight** → approval modal (route, authority, audit note) → confirm → toast and audit entry. Badge decrements.

### Act 3 — Thread learns (3:15–5:00)

11. Open **Learning analytics**. Pattern: *Freight duplication · 5 occurrences · ₹61,000 prevented*. Status `Observed`.
12. Review source cases and **Validate** the rule. Status → `Validated`, owner recorded.
13. Open the next invoice in the queue. Thread cites the validated rule immediately and skips the full recall step.
14. Show **Audit log**: detection → recommendation → human approval → rule validation.
15. **Reset demo** from the user menu; return to Overview.

**Failure moment to keep:** one scenario where Thread says *"Not enough evidence — current PO is missing"* and routes to the AP manager. It makes the confident answers credible.

---

## 10. Demo data & simulated backend

### 9.1 Dataset

**5 vendors × 20 invoices = 100 invoices**, plus POs, payments, exceptions, resolutions, approvals and audit entries.

Each record carries: stable ID, vendor, GSTIN, currency INR, amounts, tax split, dates, status, source system, owner, and realistically messy descriptions.

### 9.2 Scripted scenarios

| # | Scenario | What Thread proves |
| --- | --- | --- |
| 1 | **Freight duplication** — ABC Logistics, ₹12,000 | Recall + exact citations + approval route |
| 2 | **Price mismatch with misleading history** — memory says "accept", current PO says "reject" | Current record overrides stale memory |
| 3 | **GST discrepancy** — CGST/SGST applied where IGST may apply | Thread flags and routes; never infers tax from memory |
| 4 | **Duplicate vendor identity** — `Acme` vs `ACME PVT LTD`, GSTIN mismatch | Vendor identity reconciliation |
| 5 | **Bank-detail change** — email requests a new account | High-severity red ring, no execution, escalate |

Plant **one deliberately misleading prior approval** to show governance: repetition is not proof.

### 9.3 Memory model

| Entity | Fields |
| --- | --- |
| `MemoryFact` | id, entityType, entityId, property, value, sourceRef, confidence, updatedAt, verifiedBy |
| `Episode` | id, type (exception/resolution), summary, outcome, linkedFacts |
| `Feedback` | id, suggestionId, verdict, correctedValue, reason, user, createdAt |
| `Pattern` | id, signature, occurrences, firstSeen, proposedRule, status (`Observed` / `Validated` / `Authorized`) |
| `AuditEntry` | id, actor (Thread/human), action, target, before/after, timestamp |

### 9.4 Automatic detection simulation

- On "ERP sync", enqueue a detection job; after ~2s, append an item to the inbox and increment the badge.
- Precompute similarity and evidence per scenario so results are deterministic.
- Stream the analysis in three chunks; never block the UI.
- The optional live-LLM adapter must emit the same contract, with a canned fallback on error or >6s latency.

### 9.5 Agent response contract

```json
{
  "exceptionId": "EXC-1020",
  "invoiceId": "INV-1020",
  "vendorId": "VENDOR_001",
  "status": "answered",
  "severity": "medium",
  "recommendation": "Reject the ₹12,000 freight line; PO-204 already includes freight.",
  "confidence": { "score": 0.92, "label": "High" },
  "checks": [
    { "name": "duplicate_invoice", "result": "pass" },
    { "name": "totals", "result": "pass" },
    { "name": "freight", "result": "fail" }
  ],
  "reasoning": [
    "INV-1001, INV-1003, INV-1005 had similar charges rejected",
    "INV-1012 was confirmed by an AP manager",
    "Current PO-204 covers freight"
  ],
  "evidence": [
    { "type": "invoice", "id": "INV-1020", "field": "freight", "snippet": "₹12,000" },
    { "type": "po", "id": "PO-204", "field": "freightIncluded", "snippet": "Included" },
    { "type": "invoice", "id": "INV-1005", "field": "resolution", "snippet": "Rejected" }
  ],
  "route": "AP Manager",
  "actions": [
    { "id": "reject-freight", "label": "Reject freight", "requiresApproval": true },
    { "id": "escalate", "label": "Ask AP Manager", "requiresApproval": true }
  ],
  "caveats": ["Confirm the current PO covers this shipment"],
  "ruleMatch": null,
  "memoryUsed": ["vendor:VENDOR_001", "pattern:freight-duplication"]
}
```

---

## 11. Build phases

| Phase | Scope | Estimate |
| --- | --- | --- |
| **0. Foundations** | Tokens, shell chrome, seed data, mock API contract, reset, Thread mark | 1 day |
| **1. Believable system** | Overview, invoices, invoice detail, exceptions queue, vendor intelligence | 1.5–2 days |
| **2. Automatic layer** | Detection simulation, floating button, badge states, inbox, toasts | 1–1.5 days |
| **3. Thread core** | Pane, staged recall, answer anatomy, evidence chips, record peek | 2–3 days |
| **4. Human loop** | Approval modal, audit entries, corrections, memory inspector | 1–1.5 days |
| **5. Learning payoff** | Learning analytics, pattern cards, rule validation, second invoice | 1 day |
| **6. Polish** | Empty/loading/error states, keyboard nav, 1280px pass, rehearsal | 1 day |

**Total:** 7–10 focused days solo; ~4–5 days with two people splitting shell/data and Thread/badge.

---

## 12. Acceptance checklist

- [ ] Thread runs automatically on ingestion; no prompt is required.
- [ ] Badge increments live with one pulse and a toast; it decrements on review/dismiss.
- [ ] High-severity items show a red ring; low severity never does.
- [ ] The pane never opens by itself.
- [ ] Every evidence chip opens a real record and highlights the cited field.
- [ ] Current PO/contract/tax rule visibly overrides conflicting memory.
- [ ] One scenario demonstrates insufficient evidence and a safe route.
- [ ] Approval is required for every state change; audit log records it.
- [ ] Correction changes a later answer (rule applied on the next invoice).
- [ ] Fully offline; reset restores the exact starting state in under 2 seconds.
- [ ] Readable at 1280×720; no text below 12px; AA contrast.
- [ ] `⌘K` search, `Esc` closes overlays, focus trapped in modals.
- [ ] Five-minute run-through completes without a manual refresh.

---

## 13. Risks & mitigations

| Risk | Mitigation |
| --- | --- |
| Badge feels like spam | Severity threshold, one pulse, no auto-open, snooze |
| Live LLM is slow or hallucinates | Fixture-first; optional adapter validated against the contract |
| Audience distrusts the AI | Evidence-first layout, confidence, caveats, visible permissions |
| "It's just a chatbot" | Keep the shell visible; deep-link every claim; automatic detection is the story |
| Demo overruns | Three acts, guided spotlight toggle, cut Act 1 short |
| Fake-looking data | Realistic vendor names, GSTINs, messy descriptions, unresolved cases |
| Stale memory looks authoritative | Show effective dates and current-record precedence on every answer |

---

## 14. Stretch additions

- **Email-in simulator:** paste a vendor email and watch Thread open a pre-filled exception.
- **"Explain like an auditor"** toggle: swap the recommendation for a source-by-source trace.
- **Memory graph:** vendor ↔ exceptions ↔ facts.
- **Approval card in Slack/Teams** mock.
- **Before/after metrics:** exception resolution time with and without Thread.

---

## 15. Decisions to confirm before building

1. Host invoice system name and logo; light-only vs light+dark.
2. Confirm **Thread** as the final name (alternatives: Rivet, Torque, Latch).
3. Floating button placement: bottom-right (recommended) or pinned to the sidebar only.
4. Whether the badge count is per-user or per-queue (recommended: per-user, role-scoped).
5. Whether to attempt a live model or keep the demo fully canned for reliability.
