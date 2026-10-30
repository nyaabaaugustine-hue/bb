// Pure domain rules shared by the customer portal, staff workspace, and public
// forms. Keep this module free of database or server-only imports.

export const requestTypes = [
  "viewing",
  "rental",
  "purchase",
  "investment",
  "valuation",
  "property_submission",
  "consultation",
] as const;
export type RequestType = (typeof requestTypes)[number];

export const requestTypeLabels: Record<RequestType, string> = {
  viewing: "Book a viewing",
  rental: "Ask about renting",
  purchase: "Ask about buying",
  investment: "Discuss an investment",
  valuation: "Request a valuation",
  property_submission: "Submit my property",
  consultation: "Book a meeting",
};

export const requestStatuses = [
  "pending",
  "in_review",
  "confirmed",
  "completed",
  "cancelled",
  "rejected",
] as const;
export type RequestStatus = (typeof requestStatuses)[number];

export const terminalRequestStatuses = new Set<RequestStatus>(["completed", "cancelled", "rejected"]);

export const requestTransitions: Record<RequestStatus, readonly RequestStatus[]> = {
  pending: ["in_review", "confirmed", "cancelled", "rejected"],
  in_review: ["confirmed", "completed", "cancelled", "rejected"],
  confirmed: ["completed", "cancelled"],
  completed: [],
  cancelled: [],
  rejected: [],
};

/** Staff-facing buttons, kept in the same order as the transition list. */
export const requestActions: Partial<Record<RequestStatus, { status: RequestStatus; label: string }[]>> = {
  pending: [
    { status: "in_review", label: "Start review" },
    { status: "confirmed", label: "Confirm" },
    { status: "cancelled", label: "Cancel" },
    { status: "rejected", label: "Reject" },
  ],
  in_review: [
    { status: "confirmed", label: "Confirm" },
    { status: "completed", label: "Complete" },
    { status: "cancelled", label: "Cancel" },
    { status: "rejected", label: "Reject" },
  ],
  confirmed: [
    { status: "completed", label: "Complete" },
    { status: "cancelled", label: "Cancel" },
  ],
};

export const customerCancellableStatuses = new Set<RequestStatus>(["pending", "in_review", "confirmed"]);

export const requestStages = ["pending", "in_review", "confirmed", "completed"] as const;

export const requestStageCopy: Record<RequestStatus, string> = {
  pending: "Your request is received and waiting for the team to review it.",
  in_review: "The team is reviewing your request and will follow up with you.",
  confirmed: "The team has confirmed the next step with you.",
  completed: "This request is complete. You can contact the team if you need more help.",
  cancelled: "This request was cancelled. Contact the team if you need help restarting it.",
  rejected: "The team could not proceed with this request. Contact them if you would like to discuss another option.",
};

export function referencePrefix(type: string) {
  if (type === "viewing") return "SV";
  if (type === "valuation" || type === "property_submission") return "QT";
  return "BB";
}

/** Stable human reference derived from the request UUID. */
export function requestReference(item: { id: string; request_type: string }) {
  return `${referencePrefix(item.request_type)}-${item.id.slice(0, 8).toUpperCase()}`;
}

export const ledgerTypes = ["contribution", "withdrawal", "return", "fee"] as const;
export type LedgerType = (typeof ledgerTypes)[number];
export const ledgerTypeLabels: Record<LedgerType, string> = {
  contribution: "Investment contribution",
  withdrawal: "Withdrawal",
  return: "Return",
  fee: "Fee",
};
export const ledgerStatuses = ["pending", "verified", "rejected"] as const;
export type LedgerStatus = (typeof ledgerStatuses)[number];

export const enquiryCategories = ["enquiry", "service", "quote"] as const;
export type EnquiryCategory = (typeof enquiryCategories)[number];
export const enquiryCategoryPrefix: Record<EnquiryCategory, string> = {
  enquiry: "BB",
  service: "SV",
  quote: "QT",
};

export const enquiryChannels = ["whatsapp", "phone", "email"] as const;
export type EnquiryChannel = (typeof enquiryChannels)[number];
export const enquiryChannelLabels: Record<EnquiryChannel, string> = {
  whatsapp: "WhatsApp",
  phone: "Phone call",
  email: "Email",
};

export const enquiryStatuses = ["new", "contacted", "closed"] as const;
export type EnquiryStatus = (typeof enquiryStatuses)[number];

export const enquiryTransitions: Record<EnquiryStatus, readonly EnquiryStatus[]> = {
  new: ["contacted", "closed"],
  contacted: ["closed"],
  closed: [],
};

export function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export function isRequestStatus(value: unknown): value is RequestStatus {
  return typeof value === "string" && (requestStatuses as readonly string[]).includes(value);
}

export function isRequestType(value: unknown): value is RequestType {
  return typeof value === "string" && (requestTypes as readonly string[]).includes(value);
}

export function isLedgerType(value: unknown): value is LedgerType {
  return typeof value === "string" && (ledgerTypes as readonly string[]).includes(value);
}

export function isEnquiryStatus(value: unknown): value is EnquiryStatus {
  return typeof value === "string" && (enquiryStatuses as readonly string[]).includes(value);
}

export function isEnquiryCategory(value: unknown): value is EnquiryCategory {
  return typeof value === "string" && (enquiryCategories as readonly string[]).includes(value);
}

export function isEnquiryChannel(value: unknown): value is EnquiryChannel {
  return typeof value === "string" && (enquiryChannels as readonly string[]).includes(value);
}

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
export function isValidEmail(value: string) {
  return EMAIL.test(value);
}

/** Accepts 054 198 8383, +233541988383 or 233541988383. Returns 233XXXXXXXXX or null. */
export function normalizeGhanaPhone(raw: string): string | null {
  const digits = raw.replace(/[\s\-().]/g, "").replace(/^\+/, "");
  if (/^233\d{9}$/.test(digits)) return digits;
  if (/^0\d{9}$/.test(digits)) return `233${digits.slice(1)}`;
  if (/^\d{9}$/.test(digits)) return `233${digits}`;
  return null;
}

/** Human-friendly version of a stored 233XXXXXXXXX number. */
export function displayPhone(value: string | null | undefined) {
  if (!value) return "";
  if (/^233\d{9}$/.test(value)) return `0${value.slice(3, 5)} ${value.slice(5, 8)} ${value.slice(8)}`;
  return value;
}

export function labelize(value: string) {
  return value.replaceAll("_", " ");
}

export function requestStatusBadgeClass(status: string) {
  if (status === "confirmed" || status === "completed") return "badge-moss";
  if (status === "cancelled" || status === "rejected") return "badge border-line text-mute";
  return "badge-sand";
}

export function readPage(value: string | string[] | undefined, totalPages: number) {
  const raw = Array.isArray(value) ? value[0] : value;
  const page = Number.parseInt(raw ?? "1", 10);
  const safe = Number.isFinite(page) && page > 0 ? page : 1;
  return Math.min(safe, Math.max(totalPages, 1));
}

export function pageCount(total: number, pageSize: number) {
  return Math.max(1, Math.ceil(total / pageSize));
}
