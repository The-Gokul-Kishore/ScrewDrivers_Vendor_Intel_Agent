<div align="center">

# Vendor Intelligence Agent

**Persistent vendor memory for AP exception resolution**

[![Status](https://img.shields.io/badge/status-hackathon%20project-blueviolet)]()
[![Domain](https://img.shields.io/badge/domain-accounts%20payable-0A66C2)]()
[![Memory](https://img.shields.io/badge/pattern-retain%20%C2%B7%20recall%20%C2%B7%20reflect-success)]()

[Overview](#overview) · [The Problem](#the-problem) · [What Thread Remembers](#what-thread-remembers) · [How It Works](#how-it-works) · [Example](#example) · [Demo Scope](#demo-scope) · [Docs](#docs)

</div>

---

## Meet Thread

**Thread** is the agent inside the product.

> **Every exception has a thread.**

A screw thread is what holds two parts together. A case thread is what connects an invoice, its evidence, the decision, and the outcome. Thread follows both — so the next analyst inherits the reasoning, not just the result.

Thread is not a chatbot bolted onto a dashboard. It runs automatically on every new invoice, surfaces what needs attention with a notification badge, and explains itself only when asked.

---

## Overview

Accounts payable teams process large volumes of routine invoices, but **exceptions** — price and quantity mismatches, duplicate billing, tax discrepancies, missing approvals and unusual vendor practices — consume disproportionate attention.

Much of the knowledge required to resolve these cases resides with **experienced AP employees rather than in reusable systems**.

Thread adds a persistent vendor-memory and exception-resolution layer to existing AP and ERP systems. It:

- **Retains** invoice exceptions and their outcomes
- **Recalls** relevant vendor history when a new invoice arrives
- **Reflects** repeated cases into proposed operational rules

Existing systems remain responsible for invoice processing, accounting and payments. Thread supplies historical context, explainable recommendations and controlled workflow automation.

---

## The Problem

A typical AP workflow:

```text
invoice receipt → extraction → vendor identification → PO & goods-receipt matching
→ tax and terms validation → approval → payment scheduling → ERP posting
```

An exception occurs when any check fails:

| Exception type | Example | Potential impact |
| --- | --- | --- |
| **Price mismatch** | PO ₹50,000; invoice ₹55,000 | Overpayment or dispute |
| **Quantity mismatch** | PO 100 units; invoice 120 | Incorrect billing |
| **Duplicate invoice** | Same invoice submitted twice | Double payment |
| **Tax discrepancy** | Incorrect GST treatment or arithmetic | Compliance and reconciliation issues |
| **Freight duplication** | Freight billed separately although included in the PO | Financial leakage |
| **Missing approval** | Required authorization absent | Unauthorized payment |
| **Payment-term mismatch** | Contract says Net 30; invoice says Net 15 | Dispute or premature payment |
| **Vendor-specific exception** | Regional approval required | Processing delay |

> The challenge is not only detecting an invoice mismatch. It is preserving institutional knowledge about how specific vendors behave, which exceptions were legitimate, who resolved them, and what evidence justified the outcome.

A new employee should not need to rediscover the same vendor history by searching old email threads and ERP records.

---

## What Thread Remembers

| Memory | What it captures |
| --- | --- |
| 🏢 **Vendor profile** | Legal name, GSTIN, payment terms, master-data status, aliases |
| 🧾 **Invoices & line items** | Amounts, taxes, dates, extracted fields and source documents |
| 📦 **Purchase orders** | Lines, quantities, prices, freight terms and contracts |
| ⚠️ **Exceptions** | Type, severity, evidence references and status |
| ✅ **Resolutions** | Proposed and final action, rationale and outcome |
| 🧑‍💼 **Approvals & corrections** | Approver, decision, authority, timestamp and comments |
| 🔁 **Validated rules** | Rule definition, source cases, scope, effective dates and owner |

Every remembered fact stays linked to its source record and decision. Memory is **inspectable**, not a black box.

---

## How It Works

```text
Invoice arrives
      │
      ▼
┌──────────────────────┐
│  Deterministic checks │  duplicates · totals · quantity · price · tax · terms
└──────────┬───────────┘
           │ exception
           ▼
┌──────────────────────┐
│  Retain / Recall     │  vendor history · prior exceptions · resolutions
└──────────┬───────────┘
           │ exact evidence references
           ▼
┌──────────────────────┐
│  Reasoning           │  recommendation · risk · approval route
└──────────┬───────────┘
           │
           ▼
┌──────────────────────┐
│  Human approval      │  approve · correct · give feedback
└──────────┬───────────┘
           │
           ▼
┌──────────────────────┐
│  Reflect             │  repeated cases → proposed vendor rule
└──────────────────────┘
```

**Critical safeguard:** repetition is not proof of correctness. Five prior approvals may all have been mistakes. A current contract, PO, tax rule or authorization matrix always overrides stale or contradictory memory.

---

## Example

**Vendor:** ABC Logistics · **Invoice:** INV-1020

> **Detected:** potential duplicate freight charge of ₹12,000.
>
> **Evidence:** INV-1001, INV-1003 and INV-1005 had similar charges rejected; INV-1012 was confirmed by an AP manager.
>
> **Recommendation:** reject the additional freight component only if the current PO covers this shipment.
>
> **Confidence:** high historical similarity; contract verification required.
>
> **Route:** AP Manager. No payment action executed.

---

## The Interface

Thread lives inside the invoice system, not beside it:

- A **floating Thread button** with a live notification badge for auto-detected exceptions
- A **Thread inbox** grouped by severity, with vendor, amount at risk and age
- **Evidence chips** on every recommendation that open the real invoice, PO, ticket or approval
- A **memory inspector** showing what Thread knows, where it learned it, and when
- An **approval queue** where humans decide; Thread never moves money on its own

Full screen and interaction plan: [`docs/UI_PLAN.md`](docs/UI_PLAN.md)

---

## Screenshots

<div align="center">

| | |
| :-: | :-: |
| ![Vendor Intelligence — overview](docs/images/vendor-intelligence-overview.png) | ![Vendor Intelligence — memory layer](docs/images/vendor-intelligence-memory-layer.png) |
| ![Vendor Intelligence — workflow](docs/images/vendor-intelligence-workflow.png) | ![Vendor Intelligence — recommended resolution](docs/images/vendor-intelligence-resolution.png) |

*Vendor Intelligence Agent — project visuals.*

</div>

---

## Run the demo

```bash
npm install
npm run dev
```

Open **http://localhost:5173**.

**Five-minute path:**

1. **Overview** shows the exception queue and the Thread badge — 3 unread, one red ring for high risk.
2. Click **Simulate ERP sync** (top-bar chip or Overview button). Invoice `INV-1101` is ingested, the badge goes **3 → 4** with one pulse, and a toast reports the duplicate freight.
3. Open the **Thread inbox** and review the new exception. Thread's analysis is already waiting.
4. Expand **Why this**, then open `PO-8841`, `INV-1020` and the prior cases from the evidence chips.
5. Approve the recommended action, confirm the PO check, and watch the exception resolve and the memory update.
6. Open **Learning** and validate the freight-duplication rule.
7. Reset from the avatar menu to return to the exact starting state.

Built with React 19, TypeScript, Vite, Tailwind CSS 4, Zustand, React Router and Lucide.

---

## Demo Scope

- **5 vendors · 100 invoices**, with recurring exception types, historical approvals, human corrections, payment terms and deliberately misleading cases
- **Scenarios:** freight duplication, price mismatch, duplicate invoice, GST discrepancy, unusual vendor bank-detail change
- **Progression to show:** unfamiliar exception → evidence-backed recommendation → human-validated rule → faster handling next time
- **Always visible:** evidence citations, confidence, approval routing and an audit trail
- **Never:** autonomous payment execution or a citation that cannot be resolved to a real record

---

## Evaluation

| Metric | Definition |
| --- | --- |
| Exception precision | Share of flagged cases that are genuine exceptions |
| Exception recall | Share of genuine exceptions detected |
| Recommendation accuracy | Share judged correct by authorized reviewers |
| Evidence accuracy | Whether cited cases exist and support the explanation |
| Safe automation rate | Eligible exceptions handled within policy without manual resolution |
| Resolution time | Detection to final resolution |
| Verified leakage prevented | Confirmed avoided incorrect payments |

Automation percentage alone is not success. A system that automatically approves incorrect invoices is unsafe.

---

## Docs

- [UI plan](docs/UI_PLAN.md) — screens, Thread naming, badge behavior, demo storyboard, build phases
- [AP Exception Agent research report](docs/AP_Exception_Agent_Research_Report.pdf) — problem definition, competitive analysis, architecture, governance, roadmap

---

## Tags

`#AccountsPayable` `#AIAgents` `#EnterpriseAI` `#VendorIntelligence` `#GST` `#FinanceTech` `#Automation` `#ProcureToPay`
