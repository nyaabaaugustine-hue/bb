import { getPool } from "@/lib/db";
import { getBootstrapAdministratorEmails } from "@/lib/portal";
import {
  enquiryStatuses,
  isEnquiryStatus,
  isRequestStatus,
  isRequestType,
  pageCount,
  readPage,
  type EnquiryStatus,
  type RequestStatus,
} from "@/lib/portal-domain";

export const ADMIN_PAGE_SIZE = 20;

type SearchParams = Record<string, string | string[] | undefined>;

function first(value: string | string[] | undefined) {
  return (Array.isArray(value) ? value[0] : value)?.trim() ?? "";
}

export type AdminRequestFilters = { status: string; type: string; q: string; page: number };
export type AdminEnquiryFilters = { status: string; q: string; page: number };

export function parseRequestFilters(params: SearchParams): AdminRequestFilters {
  const status = first(params.status);
  const type = first(params.type);
  return {
    status: status === "all" || isRequestStatus(status) ? status : "open",
    type: isRequestType(type) ? type : "all",
    q: first(params.q).slice(0, 100),
    page: Number.parseInt(first(params.page), 10) || 1,
  };
}

export function parseEnquiryFilters(params: SearchParams): AdminEnquiryFilters {
  const status = first(params.enquiryStatus);
  return {
    status: status === "all" || isEnquiryStatus(status) ? status : "new",
    q: first(params.enquiryQ).slice(0, 100),
    page: Number.parseInt(first(params.enquiryPage), 10) || 1,
  };
}

type RequestWhere = { where: string; params: unknown[] };

function requestWhere(filters: AdminRequestFilters): RequestWhere {
  const clauses: string[] = [];
  const params: unknown[] = [];
  if (filters.status === "open") {
    clauses.push("r.status IN ('pending', 'in_review', 'confirmed')");
  } else if (isRequestStatus(filters.status)) {
    params.push(filters.status);
    clauses.push(`r.status = $${params.length}`);
  }
  if (isRequestType(filters.type)) {
    params.push(filters.type);
    clauses.push(`r.request_type = $${params.length}`);
  }
  if (filters.q) {
    params.push(`%${filters.q}%`);
    const index = params.length;
    clauses.push(`(c.display_name ILIKE $${index} OR c.email ILIKE $${index} OR COALESCE(r.listing_slug, '') ILIKE $${index} OR COALESCE(r.details->>'description', '') ILIKE $${index} OR r.id::text ILIKE $${index})`);
  }
  return { where: clauses.length ? `WHERE ${clauses.join(" AND ")}` : "", params };
}

export type AdminRequestRow = {
  id: string;
  user_id: string;
  email: string;
  display_name: string;
  request_type: string;
  listing_slug: string | null;
  details: { description?: string; requestedDate?: string | null };
  status: RequestStatus;
  created_at: Date;
  updated_at: Date;
  assigned_to: string | null;
  assigned_name: string | null;
  staff_note: string | null;
};

export async function loadAdminRequests(filters: AdminRequestFilters) {
  const db = getPool();
  const { where, params } = requestWhere(filters);
  const countResult = await db.query<{ total: number }>(
    `SELECT count(*)::int AS total
     FROM portal_requests r
     JOIN portal_customers c ON c.id = r.user_id
     ${where}`,
    params,
  );
  const total = countResult.rows[0]?.total ?? 0;
  const totalPages = pageCount(total, ADMIN_PAGE_SIZE);
  const page = readPage(String(filters.page), totalPages);

  const [rows, statusCounts] = await Promise.all([
    db.query<AdminRequestRow>(
      `SELECT r.id, r.user_id, c.email, c.display_name, r.request_type, r.listing_slug,
              r.details, r.status, r.created_at, r.updated_at, r.assigned_to, r.staff_note,
              agent.display_name AS assigned_name
       FROM portal_requests r
       JOIN portal_customers c ON c.id = r.user_id
       LEFT JOIN portal_customers agent ON agent.id = r.assigned_to
       ${where}
       ORDER BY r.created_at DESC
       LIMIT $${params.length + 1} OFFSET $${params.length + 2}`,
      [...params, ADMIN_PAGE_SIZE, (page - 1) * ADMIN_PAGE_SIZE],
    ),
    db.query<{ status: RequestStatus; count: number }>(
      "SELECT status, count(*)::int AS count FROM portal_requests GROUP BY status",
    ),
  ]);

  return {
    rows: rows.rows,
    total,
    page,
    pageSize: ADMIN_PAGE_SIZE,
    totalPages,
    statusCounts: Object.fromEntries(statusCounts.rows.map((row) => [row.status, row.count])) as Partial<Record<RequestStatus, number>>,
  };
}

type EnquiryWhere = { where: string; params: unknown[] };

function enquiryWhere(filters: AdminEnquiryFilters): EnquiryWhere {
  const clauses: string[] = [];
  const params: unknown[] = [];
  if (isEnquiryStatus(filters.status)) {
    params.push(filters.status);
    clauses.push(`e.status = $${params.length}`);
  }
  if (filters.q) {
    params.push(`%${filters.q}%`);
    const index = params.length;
    clauses.push(`(e.name ILIKE $${index} OR e.phone ILIKE $${index} OR COALESCE(e.email, '') ILIKE $${index} OR e.subject ILIKE $${index} OR COALESCE(e.message, '') ILIKE $${index} OR e.reference ILIKE $${index})`);
  }
  return { where: clauses.length ? `WHERE ${clauses.join(" AND ")}` : "", params };
}

export type AdminEnquiryRow = {
  id: string;
  reference: string;
  name: string;
  phone: string;
  email: string | null;
  channel: string;
  category: string;
  subject: string;
  message: string | null;
  status: EnquiryStatus;
  created_at: Date;
  handled_name: string | null;
};

export async function loadAdminEnquiries(filters: AdminEnquiryFilters) {
  const db = getPool();
  const { where, params } = enquiryWhere(filters);
  const countResult = await db.query<{ total: number }>(
    `SELECT count(*)::int AS total FROM portal_enquiries e ${where}`,
    params,
  );
  const total = countResult.rows[0]?.total ?? 0;
  const totalPages = pageCount(total, ADMIN_PAGE_SIZE);
  const page = readPage(String(filters.page), totalPages);

  const [rows, statusCounts] = await Promise.all([
    db.query<AdminEnquiryRow>(
      `SELECT e.id, e.reference, e.name, e.phone, e.email, e.channel, e.category, e.subject,
              e.message, e.status, e.created_at, handler.display_name AS handled_name
       FROM portal_enquiries e
       LEFT JOIN portal_customers handler ON handler.id = e.handled_by
       ${where}
       ORDER BY e.created_at DESC
       LIMIT $${params.length + 1} OFFSET $${params.length + 2}`,
      [...params, ADMIN_PAGE_SIZE, (page - 1) * ADMIN_PAGE_SIZE],
    ),
    db.query<{ status: EnquiryStatus; count: number }>(
      "SELECT status, count(*)::int AS count FROM portal_enquiries GROUP BY status",
    ),
  ]);

  return {
    rows: rows.rows,
    total,
    page,
    pageSize: ADMIN_PAGE_SIZE,
    totalPages,
    statusCounts: Object.fromEntries(statusCounts.rows.map((row) => [row.status, row.count])) as Partial<Record<EnquiryStatus, number>>,
  };
}

export async function loadAdminSummary() {
  const { rows } = await getPool().query<{
    customers: number;
    open_requests: number;
    resolved_30d: number;
    new_enquiries: number;
    pending_ledger: number;
    unread_messages: number;
  }>(
    `SELECT
       (SELECT count(*)::int FROM portal_customers) AS customers,
       (SELECT count(*)::int FROM portal_requests WHERE status IN ('pending', 'in_review', 'confirmed')) AS open_requests,
       (SELECT count(*)::int FROM portal_requests WHERE status = 'completed' AND updated_at > now() - interval '30 days') AS resolved_30d,
       (SELECT count(*)::int FROM portal_enquiries WHERE status = 'new') AS new_enquiries,
       (SELECT count(*)::int FROM investment_ledger WHERE status = 'pending') AS pending_ledger,
       (SELECT count(*)::int FROM portal_messages WHERE author_role = 'customer' AND read_at IS NULL) AS unread_messages`,
  );
  return rows[0];
}

export type StaffOption = { id: string; email: string; display_name: string };

export async function loadStaffOptions(): Promise<StaffOption[]> {
  const { rows } = await getPool().query<StaffOption>(
    `SELECT c.id, c.email, c.display_name
     FROM portal_customers c
     LEFT JOIN portal_user_roles r ON r.user_id = c.id
     WHERE r.role IN ('staff', 'administrator') OR lower(c.email) = ANY($1::text[])
     ORDER BY c.display_name, c.email
     LIMIT 100`,
    [getBootstrapAdministratorEmails()],
  );
  return rows;
}

export type RoleUser = {
  id: string;
  email: string;
  display_name: string;
  role: "administrator" | "staff" | "customer";
  bootstrap_admin: boolean;
};

export async function loadRoleUsers(): Promise<RoleUser[]> {
  const { rows } = await getPool().query<RoleUser>(
    `SELECT c.id, c.email, c.display_name,
            CASE
              WHEN lower(c.email) = ANY($1::text[]) THEN 'administrator'
              ELSE COALESCE(r.role, 'customer')
            END AS role,
            lower(c.email) = ANY($1::text[]) AS bootstrap_admin
     FROM portal_customers c
     LEFT JOIN portal_user_roles r ON r.user_id = c.id
     ORDER BY c.display_name, c.email
     LIMIT 500`,
    [getBootstrapAdministratorEmails()],
  );
  return rows;
}

export type LedgerRow = {
  id: string;
  user_id: string;
  email: string;
  display_name: string;
  transaction_type: string;
  amount: string;
  currency: string;
  reference: string;
  status: string;
  created_at: Date;
  verified_at: Date | null;
};

export async function loadLedger(limit = 50): Promise<LedgerRow[]> {
  const { rows } = await getPool().query<LedgerRow>(
    `SELECT l.id, l.user_id, c.email, c.display_name, l.transaction_type, l.amount,
            l.currency, l.reference, l.status, l.created_at, l.verified_at
     FROM investment_ledger l
     JOIN portal_customers c ON c.id = l.user_id
     ORDER BY l.created_at DESC
     LIMIT $1`,
    [limit],
  );
  return rows;
}

export type AuditRow = {
  id: string;
  action: string;
  entity_type: string;
  entity_id: string;
  metadata: Record<string, unknown>;
  created_at: Date;
  actor_email: string | null;
};

export async function loadAudit(limit = 15): Promise<AuditRow[]> {
  const { rows } = await getPool().query<AuditRow>(
    `SELECT a.id, a.action, a.entity_type, a.entity_id, a.metadata, a.created_at, actor.email AS actor_email
     FROM portal_audit_log a
     LEFT JOIN portal_customers actor ON actor.id = a.actor_user_id
     ORDER BY a.created_at DESC
     LIMIT $1`,
    [limit],
  );
  return rows;
}

export type CustomerOption = { id: string; email: string; display_name: string };

export async function loadCustomerOptions(limit = 250): Promise<CustomerOption[]> {
  const { rows } = await getPool().query<CustomerOption>(
    "SELECT id, email, display_name FROM portal_customers ORDER BY display_name, email LIMIT $1",
    [limit],
  );
  return rows;
}

export type MessageThread = {
  user_id: string;
  email: string;
  display_name: string;
  phone: string | null;
  last_body: string;
  last_role: "customer" | "team";
  last_at: Date;
  unread: number;
};

export async function loadMessageThreads(limit = 50): Promise<MessageThread[]> {
  const { rows } = await getPool().query<MessageThread>(
    `WITH latest AS (
       SELECT DISTINCT ON (m.user_id) m.user_id, m.body, m.author_role, m.created_at
       FROM portal_messages m
       ORDER BY m.user_id, m.created_at DESC
     )
     SELECT l.user_id, c.email, c.display_name, c.phone,
            l.body AS last_body, l.author_role AS last_role, l.created_at AS last_at,
            (SELECT count(*)::int
             FROM portal_messages u
             WHERE u.user_id = l.user_id AND u.author_role = 'customer' AND u.read_at IS NULL) AS unread
     FROM latest l
     JOIN portal_customers c ON c.id = l.user_id
     ORDER BY l.created_at DESC
     LIMIT $1`,
    [limit],
  );
  return rows;
}

export type MessageRow = {
  id: string;
  user_id: string;
  request_id: string | null;
  author_role: "customer" | "team";
  body: string;
  read_at: Date | null;
  created_at: Date;
};

export async function loadMessageThread(userId: string) {
  const { rows } = await getPool().query<MessageRow>(
    `SELECT id, user_id, request_id, author_role, body, read_at, created_at
     FROM portal_messages
     WHERE user_id = $1
     ORDER BY created_at ASC
     LIMIT 300`,
    [userId],
  );
  return rows;
}

export type MessageCustomer = { id: string; email: string; display_name: string; phone: string | null };

export async function loadMessageCustomer(userId: string): Promise<MessageCustomer | null> {
  const { rows } = await getPool().query<MessageCustomer>(
    "SELECT id, email, display_name, phone FROM portal_customers WHERE id = $1",
    [userId],
  );
  return rows[0] ?? null;
}

export const enquiryStatusOptions = enquiryStatuses;
