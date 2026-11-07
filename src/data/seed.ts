export type Severity = "high" | "medium" | "low";
export type InvoiceStatus = "Matched" | "Exception" | "Pending approval" | "Paid" | "On hold";
export type ExceptionStatus = "Open" | "Pending approval" | "Resolved";
export type PatternStatus = "Observed" | "Validated" | "Authorized";

export interface Vendor {
  id: string;
  name: string;
  gstin: string;
  city: string;
  terms: string;
  risk: "Low" | "Medium" | "High";
  openBalance: number;
  invoiceCount: number;
  lastActivity: string;
}

export interface Invoice {
  id: string;
  vendorId: string;
  date: string;
  amount: number;
  tax: number;
  freight: number;
  status: InvoiceStatus;
  poId: string;
  confidence: number;
  exceptionType?: string;
  simulated?: boolean;
}

export interface ExceptionRow {
  id: string;
  invoiceId: string;
  vendorId: string;
  type: string;
  severity: Severity;
  amountAtRisk: number;
  age: string;
  confidence: number;
  status: ExceptionStatus;
  detectedAt: string;
  ruleMatch?: string;
  simulated?: boolean;
}

export interface Evidence {
  type: "invoice" | "po" | "case" | "payment" | "email";
  id: string;
  field: string;
  snippet: string;
}

export interface ThreadResponse {
  exceptionId: string;
  recommendation: string;
  confidence: { score: number; label: "High" | "Medium" | "Low" };
  checks: { name: string; result: "pass" | "fail" | "warn" }[];
  reasoning: string[];
  evidence: Evidence[];
  route: string;
  caveats: string[];
  priorCases: number;
  secondaryAction: string;
}

export interface Pattern {
  id: string;
  name: string;
  occurrences: number;
  prevented: number;
  status: PatternStatus;
  sourceCases: string[];
  owner?: string;
  lastSeen: string;
  description: string;
}

export interface AuditEntry {
  id: string;
  actor: "Thread" | "Human";
  action: string;
  target: string;
  timestamp: string;
  kind: "detection" | "recommendation" | "approval" | "correction" | "rule";
}

export interface MemoryFact {
  id: string;
  vendorId: string;
  property: string;
  value: string;
  source: string;
  updatedAt: string;
  confidence: number;
  verifiedBy?: string;
}

export interface Approval {
  id: string;
  exceptionId: string;
  route: string;
  amount: number;
  status: "Pending" | "Approved" | "Rejected";
  age: string;
  decidedBy?: string;
}

export const vendors: Vendor[] = [
  {
    id: "VENDOR_001",
    name: "ABC Logistics",
    gstin: "29ABCDE1234F1Z5",
    city: "Bengaluru",
    terms: "Net 30",
    risk: "Medium",
    openBalance: 842000,
    invoiceCount: 20,
    lastActivity: "Today, 09:12",
  },
  {
    id: "VENDOR_002",
    name: "SwiftLog Logistics",
    gstin: "27PQRSX5678G1Z2",
    city: "Pune",
    terms: "Net 45",
    risk: "High",
    openBalance: 1224000,
    invoiceCount: 20,
    lastActivity: "Today, 08:40",
  },
  {
    id: "VENDOR_003",
    name: "Meridian Components",
    gstin: "29LMNOP9012H1Z8",
    city: "Chennai",
    terms: "Net 30",
    risk: "Low",
    openBalance: 418500,
    invoiceCount: 20,
    lastActivity: "Yesterday, 16:05",
  },
  {
    id: "VENDOR_004",
    name: "Acme Industrial",
    gstin: "07UVWXY3456J1Z9",
    city: "Delhi",
    terms: "Net 15",
    risk: "High",
    openBalance: 1860000,
    invoiceCount: 20,
    lastActivity: "Today, 07:55",
  },
  {
    id: "VENDOR_005",
    name: "Nova Packaging",
    gstin: "33ZABCD7890K1Z3",
    city: "Coimbatore",
    terms: "Net 30",
    risk: "Low",
    openBalance: 296000,
    invoiceCount: 20,
    lastActivity: "2 days ago",
  },
];

const exceptionTypes: Record<string, string> = {
  "INV-1018": "Price mismatch",
  "INV-1020": "Freight duplication",
  "INV-1025": "GST discrepancy",
  "INV-1042": "Duplicate invoice",
  "INV-1063": "Vendor bank change",
  "INV-1101": "Freight duplication",
};

const resolvedIds = new Set(["INV-1001", "INV-1003", "INV-1005", "INV-1012"]);
const specialStatus: Record<string, InvoiceStatus> = {
  "INV-1001": "Paid",
  "INV-1003": "Paid",
  "INV-1005": "Paid",
  "INV-1012": "Paid",
  "INV-1018": "Exception",
  "INV-1020": "Exception",
  "INV-1025": "Exception",
  "INV-1042": "Exception",
  "INV-1063": "On hold",
  "INV-1101": "Exception",
};

const bases = [240000, 185000, 420000, 96000, 310000];

function round500(n: number) {
  return Math.round(n / 500) * 500;
}

const generatedInvoices: Invoice[] = vendors.flatMap((vendor, i) =>
  Array.from({ length: 20 }, (_, n) => {
    const id = `INV-${1001 + i * 20 + n}`;
    const amount = round500(bases[i] + ((n * 37) % 9) * bases[i] * 0.06);
    const freight = i === 0 ? 12000 : i === 3 ? 8500 : 0;
    const status: InvoiceStatus =
      specialStatus[id] ?? (n % 7 === 0 ? "Paid" : n % 11 === 0 ? "Pending approval" : "Matched");
    return {
      id,
      vendorId: vendor.id,
      date: `0${(n % 9) + 1}-10-2026`.replace(/^0(\d)/, "$1"),
      amount,
      tax: Math.round(amount * 0.18),
      freight,
      status,
      poId: `PO-${200 + i * 20 + n}`,
      confidence: 0.93 + ((n * 13) % 6) / 100,
      exceptionType: exceptionTypes[id],
    };
  })
);

export const invoices: Invoice[] = [
  ...generatedInvoices,
  {
    id: "INV-1101",
    vendorId: "VENDOR_001",
    date: "7-11-2026",
    amount: 267500,
    tax: 48150,
    freight: 9500,
    status: "Exception",
    poId: "PO-8841",
    confidence: 0.96,
    exceptionType: "Freight duplication",
    simulated: true,
  },
];

export const exceptions: ExceptionRow[] = [
  {
    id: "EXC-1020",
    invoiceId: "INV-1020",
    vendorId: "VENDOR_001",
    type: "Freight duplication",
    severity: "medium",
    amountAtRisk: 12000,
    age: "42m",
    confidence: 0.92,
    status: "Open",
    detectedAt: "Today, 09:12",
  },
  {
    id: "EXC-1018",
    invoiceId: "INV-1018",
    vendorId: "VENDOR_001",
    type: "Price mismatch",
    severity: "high",
    amountAtRisk: 48000,
    age: "1h 20m",
    confidence: 0.88,
    status: "Open",
    detectedAt: "Today, 08:34",
  },
  {
    id: "EXC-1025",
    invoiceId: "INV-1025",
    vendorId: "VENDOR_002",
    type: "GST discrepancy",
    severity: "high",
    amountAtRisk: 18000,
    age: "2h 05m",
    confidence: 0.81,
    status: "Open",
    detectedAt: "Today, 07:49",
  },
  {
    id: "EXC-1042",
    invoiceId: "INV-1042",
    vendorId: "VENDOR_003",
    type: "Duplicate invoice",
    severity: "medium",
    amountAtRisk: 124500,
    age: "3h 10m",
    confidence: 0.95,
    status: "Open",
    detectedAt: "Today, 06:44",
  },
  {
    id: "EXC-1063",
    invoiceId: "INV-1063",
    vendorId: "VENDOR_004",
    type: "Vendor bank change",
    severity: "high",
    amountAtRisk: 860000,
    age: "4h 02m",
    confidence: 0.9,
    status: "Open",
    detectedAt: "Today, 05:52",
  },
  {
    id: "EXC-1012",
    invoiceId: "INV-1012",
    vendorId: "VENDOR_001",
    type: "Freight duplication",
    severity: "medium",
    amountAtRisk: 12000,
    age: "26d",
    confidence: 0.96,
    status: "Resolved",
    detectedAt: "12 Oct 2026",
  },
  {
    id: "EXC-1001",
    invoiceId: "INV-1001",
    vendorId: "VENDOR_001",
    type: "Freight duplication",
    severity: "medium",
    amountAtRisk: 12000,
    age: "58d",
    confidence: 0.94,
    status: "Resolved",
    detectedAt: "10 Sep 2026",
  },
  {
    id: "EXC-1101",
    invoiceId: "INV-1101",
    vendorId: "VENDOR_001",
    type: "Freight duplication",
    severity: "medium",
    amountAtRisk: 9500,
    age: "Just now",
    confidence: 0.93,
    status: "Open",
    detectedAt: "Today, 09:54",
    simulated: true,
  },
];

export const threadResponses: Record<string, ThreadResponse> = {
  "EXC-1020": {
    exceptionId: "EXC-1020",
    recommendation:
      "Reject the ₹12,000 freight line. PO-204 already includes freight for this shipment.",
    confidence: { score: 0.92, label: "High" },
    checks: [
      { name: "Duplicate invoice", result: "pass" },
      { name: "Totals", result: "pass" },
      { name: "Freight", result: "fail" },
      { name: "GST", result: "pass" },
    ],
    reasoning: [
      "INV-1001, INV-1003 and INV-1005 had the same freight charge rejected",
      "INV-1012 was confirmed by an AP manager on the same PO terms",
      "Current PO-204 covers freight, so the standalone line is a duplicate",
    ],
    evidence: [
      { type: "invoice", id: "INV-1020", field: "Freight line", snippet: "₹12,000" },
      { type: "po", id: "PO-204", field: "Freight", snippet: "Included" },
      { type: "case", id: "INV-1005", field: "Resolution", snippet: "Rejected" },
      { type: "case", id: "INV-1012", field: "Resolution", snippet: "Confirmed by AP Manager" },
    ],
    route: "AP Manager",
    caveats: ["Confirm PO-204 covers this shipment before rejecting."],
    priorCases: 5,
    secondaryAction: "Ask AP Manager",
  },
  "EXC-1101": {
    exceptionId: "EXC-1101",
    recommendation:
      "Reject the ₹9,500 freight line. PO-8841 already includes freight for this shipment.",
    confidence: { score: 0.93, label: "High" },
    checks: [
      { name: "Duplicate invoice", result: "pass" },
      { name: "Totals", result: "pass" },
      { name: "Freight", result: "fail" },
      { name: "GST", result: "pass" },
    ],
    reasoning: [
      "Thread matched rule “Freight duplication — ABC Logistics” on arrival",
      "PO-8841 covers freight for this shipment",
      "4 prior cases were resolved by rejecting the standalone freight line",
    ],
    evidence: [
      { type: "invoice", id: "INV-1101", field: "Freight line", snippet: "₹9,500" },
      { type: "po", id: "PO-8841", field: "Freight", snippet: "Included" },
      { type: "case", id: "INV-1020", field: "Resolution", snippet: "Rejected" },
    ],
    route: "AP Manager",
    caveats: ["Rule validated 2 minutes ago. Contract verification still required."],
    priorCases: 5,
    secondaryAction: "Ask AP Manager",
  },
  "EXC-1018": {
    exceptionId: "EXC-1018",
    recommendation:
      "Hold the invoice. PO-218 authorises ₹2,40,000; the invoice bills ₹2,88,000 after a revised rate card.",
    confidence: { score: 0.88, label: "High" },
    checks: [
      { name: "Duplicate invoice", result: "pass" },
      { name: "Totals", result: "pass" },
      { name: "Price", result: "fail" },
      { name: "Freight", result: "pass" },
    ],
    reasoning: [
      "Extracted unit price is 18% above the PO rate",
      "A rate revision exists but is not linked to this PO",
      "Prior price disputes for this vendor were resolved by a change order",
    ],
    evidence: [
      { type: "invoice", id: "INV-1018", field: "Unit price", snippet: "₹1,180" },
      { type: "po", id: "PO-218", field: "Unit price", snippet: "₹1,000" },
    ],
    route: "Category Manager",
    caveats: ["Verify whether a revised rate card was signed before rejecting."],
    priorCases: 3,
    secondaryAction: "Request change order",
  },
  "EXC-1025": {
    exceptionId: "EXC-1025",
    recommendation:
      "Route to Tax Lead. CGST/SGST was applied where the place of supply suggests IGST.",
    confidence: { score: 0.81, label: "Medium" },
    checks: [
      { name: "Duplicate invoice", result: "pass" },
      { name: "Totals", result: "pass" },
      { name: "GST", result: "warn" },
    ],
    reasoning: [
      "Vendor GSTIN is Maharashtra; ship-to location is Karnataka",
      "Invoice charges CGST + SGST instead of IGST",
      "Thread will not infer tax treatment from memory alone",
    ],
    evidence: [
      { type: "invoice", id: "INV-1025", field: "Tax split", snippet: "CGST 9% + SGST 9%" },
      { type: "po", id: "PO-243", field: "Ship to", snippet: "Bengaluru, KA" },
    ],
    route: "Tax Lead",
    caveats: ["Place of supply and transaction type must be validated."],
    priorCases: 2,
    secondaryAction: "Ask Tax Lead",
  },
  "EXC-1042": {
    exceptionId: "EXC-1042",
    recommendation:
      "Block payment. INV-1042 matches INV-1039 on vendor, amount and line items.",
    confidence: { score: 0.95, label: "High" },
    checks: [
      { name: "Duplicate invoice", result: "fail" },
      { name: "Totals", result: "pass" },
      { name: "Quantity", result: "pass" },
    ],
    reasoning: [
      "Same vendor, amount and three matching line items as INV-1039",
      "INV-1039 was paid on 28 Oct 2026",
      "Vendor identity resolves to a single GSTIN",
    ],
    evidence: [
      { type: "invoice", id: "INV-1042", field: "Amount", snippet: "₹1,24,500" },
      { type: "payment", id: "PAY-1039", field: "Status", snippet: "Paid 28 Oct" },
    ],
    route: "AP Manager",
    caveats: ["Check for a credit note before rejecting."],
    priorCases: 1,
    secondaryAction: "Ask AP Manager",
  },
  "EXC-1063": {
    exceptionId: "EXC-1063",
    recommendation:
      "Freeze the vendor master change. The bank update request came from a lookalike domain.",
    confidence: { score: 0.9, label: "High" },
    checks: [
      { name: "Domain match", result: "fail" },
      { name: "Callback verified", result: "fail" },
      { name: "GSTIN", result: "pass" },
    ],
    reasoning: [
      "Request originated from acme-industrial.co, not acmeindustrial.in",
      "No callback verification recorded",
      "A 2024 bank-change attempt from the same domain was blocked",
    ],
    evidence: [
      { type: "email", id: "EML-8821", field: "Sender", snippet: "accounts@acme-industrial.co" },
      { type: "case", id: "AUD-2024-11", field: "Outcome", snippet: "Blocked" },
    ],
    route: "AP Manager + Security",
    caveats: ["Do not update bank details until callback verification completes."],
    priorCases: 1,
    secondaryAction: "Freeze vendor master",
  },
};

export const patterns: Pattern[] = [
  {
    id: "PAT-01",
    name: "Freight duplication — ABC Logistics",
    occurrences: 5,
    prevented: 61000,
    status: "Observed",
    sourceCases: ["INV-1001", "INV-1003", "INV-1005", "INV-1012", "INV-1020"],
    lastSeen: "Today",
    description:
      "Standalone freight lines recur when the applicable PO already includes freight. All five cases were rejected after PO verification.",
  },
  {
    id: "PAT-02",
    name: "Price mismatch after rate revision",
    occurrences: 3,
    prevented: 144000,
    status: "Validated",
    sourceCases: ["INV-1018", "INV-0987", "INV-0954"],
    owner: "R. Menon · Category Manager",
    lastSeen: "2 days ago",
    description:
      "Invoices arrive at the revised rate before a change order is linked to the PO. Validated resolution: request the change order, then re-match.",
  },
  {
    id: "PAT-03",
    name: "GST place-of-supply mismatch",
    occurrences: 2,
    prevented: 36000,
    status: "Observed",
    sourceCases: ["INV-1025", "INV-0981"],
    lastSeen: "Today",
    description:
      "Inter-state shipments billed with CGST/SGST. Thread flags for the Tax Lead and never infers treatment from memory.",
  },
];

export const auditEntries: AuditEntry[] = [
  {
    id: "AUD-01",
    actor: "Thread",
    action: "Detected duplicate freight on INV-1020",
    target: "EXC-1020",
    timestamp: "Today, 09:12",
    kind: "detection",
  },
  {
    id: "AUD-02",
    actor: "Thread",
    action: "Recommended rejecting ₹12,000 freight line",
    target: "EXC-1020",
    timestamp: "Today, 09:12",
    kind: "recommendation",
  },
  {
    id: "AUD-03",
    actor: "Human",
    action: "Approved rejection of freight line",
    target: "EXC-1012",
    timestamp: "12 Oct 2026, 14:22",
    kind: "approval",
  },
  {
    id: "AUD-04",
    actor: "Thread",
    action: "Proposed rule: freight duplication for ABC Logistics",
    target: "PAT-01",
    timestamp: "Today, 09:20",
    kind: "rule",
  },
  {
    id: "AUD-05",
    actor: "Human",
    action: "Corrected vendor match from ACME IND to Acme Industrial",
    target: "VENDOR_004",
    timestamp: "Yesterday, 17:40",
    kind: "correction",
  },
  {
    id: "AUD-06",
    actor: "Thread",
    action: "Flagged bank-detail change request from lookalike domain",
    target: "EXC-1063",
    timestamp: "Today, 05:52",
    kind: "detection",
  },
  {
    id: "AUD-07",
    actor: "Human",
    action: "Validated price-mismatch rule",
    target: "PAT-02",
    timestamp: "2 days ago, 11:05",
    kind: "rule",
  },
  {
    id: "AUD-08",
    actor: "Thread",
    action: "Retained resolution for INV-1012",
    target: "VENDOR_001",
    timestamp: "12 Oct 2026, 14:25",
    kind: "correction",
  },
];

export const memoryFacts: MemoryFact[] = [
  {
    id: "MEM-01",
    vendorId: "VENDOR_001",
    property: "Freight treatment",
    value: "Freight is included in the PO for shipments via the Bengaluru hub.",
    source: "PO-204",
    updatedAt: "12 Oct 2026",
    confidence: 0.96,
    verifiedBy: "AP Manager",
  },
  {
    id: "MEM-02",
    vendorId: "VENDOR_001",
    property: "Common exception",
    value: "Standalone freight lines are duplicated on 1 in 4 invoices.",
    source: "INV-1001 · 1003 · 1005 · 1012 · 1020",
    updatedAt: "Today",
    confidence: 0.92,
  },
  {
    id: "MEM-03",
    vendorId: "VENDOR_001",
    property: "Resolution pattern",
    value: "Duplicate freight disputes resolve in about 6 hours after PO verification.",
    source: "5 resolved exceptions",
    updatedAt: "Today",
    confidence: 0.89,
  },
  {
    id: "MEM-04",
    vendorId: "VENDOR_001",
    property: "Payment terms",
    value: "Net 30, no early-payment discount.",
    source: "Vendor master",
    updatedAt: "04 Aug 2026",
    confidence: 0.99,
    verifiedBy: "Master data",
  },
  {
    id: "MEM-05",
    vendorId: "VENDOR_001",
    property: "Regional approval",
    value: "Above ₹5,00,000 requires AP Manager approval.",
    source: "Approval matrix",
    updatedAt: "01 Apr 2026",
    confidence: 0.97,
  },
  {
    id: "MEM-06",
    vendorId: "VENDOR_002",
    property: "Tax profile",
    value: "Inter-state supplies to Karnataka; IGST expected.",
    source: "GSTIN 27PQRSX5678G1Z2",
    updatedAt: "18 Sep 2026",
    confidence: 0.94,
  },
  {
    id: "MEM-07",
    vendorId: "VENDOR_003",
    property: "Invoice sequencing",
    value: "Invoices 1039 and 1042 share the same line items and amount.",
    source: "INV-1039 · INV-1042",
    updatedAt: "Today",
    confidence: 0.95,
  },
  {
    id: "MEM-08",
    vendorId: "VENDOR_004",
    property: "Bank details",
    value: "Bank update attempted in 2024 from a lookalike domain; blocked.",
    source: "AUD-2024-11",
    updatedAt: "14 Nov 2024",
    confidence: 0.98,
    verifiedBy: "Security",
  },
  {
    id: "MEM-09",
    vendorId: "VENDOR_004",
    property: "Approval sensitivity",
    value: "All bank-detail changes require callback verification.",
    source: "Vendor master policy",
    updatedAt: "01 Apr 2026",
    confidence: 0.99,
  },
  {
    id: "MEM-10",
    vendorId: "VENDOR_005",
    property: "Payment behaviour",
    value: "Consistently paid on time; no disputed invoices in 12 months.",
    source: "Payment history",
    updatedAt: "30 Sep 2026",
    confidence: 0.93,
  },
];

export const approvals: Approval[] = [
  {
    id: "APV-001",
    exceptionId: "EXC-1020",
    route: "AP Manager",
    amount: 12000,
    status: "Pending",
    age: "42m",
  },
  {
    id: "APV-002",
    exceptionId: "EXC-1018",
    route: "Category Manager",
    amount: 48000,
    status: "Pending",
    age: "1h 20m",
  },
  {
    id: "APV-003",
    exceptionId: "EXC-1025",
    route: "Tax Lead",
    amount: 18000,
    status: "Pending",
    age: "2h 05m",
  },
  {
    id: "APV-004",
    exceptionId: "EXC-1012",
    route: "AP Manager",
    amount: 12000,
    status: "Approved",
    age: "26d",
    decidedBy: "R. Menon",
  },
  {
    id: "APV-005",
    exceptionId: "EXC-0987",
    route: "Category Manager",
    amount: 84000,
    status: "Approved",
    age: "31d",
    decidedBy: "S. Iyer",
  },
];

export const recordDetails: Record<
  string,
  { title: string; subtitle: string; fields: { label: string; value: string; highlight?: boolean }[] }
> = {
  "INV-1020": {
    title: "INV-1020",
    subtitle: "ABC Logistics · 04 Oct 2026",
    fields: [
      { label: "Invoice amount", value: "₹2,52,000" },
      { label: "Taxable value", value: "₹2,40,000" },
      { label: "Freight line", value: "₹12,000", highlight: true },
      { label: "GST (18%)", value: "₹43,200" },
      { label: "PO reference", value: "PO-204" },
      { label: "Status", value: "Exception · duplicate freight" },
    ],
  },
  "PO-204": {
    title: "PO-204",
    subtitle: "ABC Logistics · Bengaluru hub",
    fields: [
      { label: "Freight", value: "Included in PO value", highlight: true },
      { label: "PO value", value: "₹2,40,000" },
      { label: "Ship to", value: "Bengaluru, KA" },
      { label: "Approved by", value: "R. Menon" },
      { label: "Valid from", value: "01 Aug 2026" },
      { label: "Status", value: "Open for invoicing" },
    ],
  },
  "INV-1005": {
    title: "INV-1005",
    subtitle: "ABC Logistics · 11 Sep 2026",
    fields: [
      { label: "Exception", value: "Freight duplication" },
      { label: "Resolution", value: "Rejected duplicate freight", highlight: true },
      { label: "Amount removed", value: "₹12,000" },
      { label: "Approved by", value: "R. Menon · AP Manager" },
      { label: "Resolution time", value: "5h 40m" },
      { label: "Status", value: "Resolved" },
    ],
  },
  "INV-1012": {
    title: "INV-1012",
    subtitle: "ABC Logistics · 12 Oct 2026",
    fields: [
      { label: "Exception", value: "Freight duplication" },
      { label: "Resolution", value: "Confirmed by AP Manager", highlight: true },
      { label: "Reason", value: "Freight not included on this route" },
      { label: "Approved by", value: "R. Menon · AP Manager" },
      { label: "Resolution time", value: "2h 10m" },
      { label: "Status", value: "Resolved" },
    ],
  },
  "INV-1101": {
    title: "INV-1101",
    subtitle: "ABC Logistics · 07 Nov 2026",
    fields: [
      { label: "Invoice amount", value: "₹2,67,500" },
      { label: "Freight line", value: "₹9,500", highlight: true },
      { label: "PO reference", value: "PO-8841" },
      { label: "GST (18%)", value: "₹48,150" },
      { label: "Detected", value: "Just now · auto-run" },
      { label: "Status", value: "Exception · duplicate freight" },
    ],
  },
  "INV-1018": {
    title: "INV-1018",
    subtitle: "ABC Logistics · 03 Oct 2026",
    fields: [
      { label: "Invoice amount", value: "₹2,88,000" },
      { label: "PO value", value: "₹2,40,000" },
      { label: "Unit price", value: "₹1,180", highlight: true },
      { label: "PO unit price", value: "₹1,000" },
      { label: "Variance", value: "18% above PO" },
      { label: "Status", value: "Exception · price mismatch" },
    ],
  },
  "INV-1025": {
    title: "INV-1025",
    subtitle: "SwiftLog Logistics · 05 Oct 2026",
    fields: [
      { label: "Tax split", value: "CGST 9% + SGST 9%", highlight: true },
      { label: "Place of supply", value: "Bengaluru, KA" },
      { label: "Vendor GSTIN", value: "27PQRSX5678G1Z2" },
      { label: "Taxable value", value: "₹1,00,000" },
      { label: "Tax", value: "₹18,000" },
      { label: "Status", value: "Exception · GST" },
    ],
  },
  "INV-1042": {
    title: "INV-1042",
    subtitle: "Meridian Components · 28 Oct 2026",
    fields: [
      { label: "Amount", value: "₹1,24,500", highlight: true },
      { label: "Matching invoice", value: "INV-1039" },
      { label: "Line items", value: "3 of 3 match" },
      { label: "Paid on", value: "28 Oct 2026" },
      { label: "Payment ref", value: "PAY-1039" },
      { label: "Status", value: "Blocked" },
    ],
  },
  "INV-1063": {
    title: "INV-1063",
    subtitle: "Acme Industrial · 07 Nov 2026",
    fields: [
      { label: "Request", value: "Bank account update" },
      { label: "Sender domain", value: "acme-industrial.co", highlight: true },
      { label: "Registered domain", value: "acmeindustrial.in" },
      { label: "Callback verification", value: "Not completed" },
      { label: "Amount exposed", value: "₹8,60,000" },
      { label: "Status", value: "Frozen" },
    ],
  },
};

export const formatINR = (n: number) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(n);

export const formatCompactINR = (n: number) => {
  if (n >= 10000000) return `₹${(n / 10000000).toFixed(2)}Cr`;
  if (n >= 100000) return `₹${(n / 100000).toFixed(1)}L`;
  if (n >= 1000) return `₹${(n / 1000).toFixed(0)}K`;
  return `₹${n}`;
};

export const vendorById = (id: string) => vendors.find((v) => v.id === id)!;
export const invoiceById = (id: string) => invoices.find((i) => i.id === id);
export const exceptionById = (id: string) => exceptions.find((e) => e.id === id);

export const isResolvedHistorical = (invoiceId: string) => resolvedIds.has(invoiceId);
