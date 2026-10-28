import { getPool } from "@/lib/db";
import type { PortalRole } from "@/lib/portal-roles";

export { portalRoles } from "@/lib/portal-roles";
export type { PortalRole } from "@/lib/portal-roles";

export type PortalUser = {
  id: string;
  email: string | null;
  name?: string | null;
  emailVerified?: boolean;
};

export async function syncPortalCustomer(user: PortalUser) {
  if (!user.id || !user.email) throw new Error("The authenticated account is missing its identity.");
  await getPool().query(
    `INSERT INTO portal_customers (id, email, display_name)
     VALUES ($1, $2, $3)
     ON CONFLICT (id) DO UPDATE
       SET email = EXCLUDED.email,
           display_name = EXCLUDED.display_name,
           updated_at = now()`,
    [user.id, user.email.toLowerCase(), user.name ?? ""],
  );
}

export function getBootstrapAdministratorEmails() {
  return (process.env.SUPER_ADMIN_EMAILS ?? "")
    .split(",")
    .map((address) => address.trim().toLowerCase())
    .filter(Boolean);
}

export function isBootstrapAdministratorEmail(email: string | null | undefined) {
  return Boolean(email && getBootstrapAdministratorEmails().includes(email.toLowerCase()));
}

export function isBootstrapAdministrator(email: string | null | undefined, emailVerified: boolean) {
  return emailVerified && isBootstrapAdministratorEmail(email);
}

export async function getPortalRole(user: PortalUser): Promise<PortalRole> {
  if (isBootstrapAdministrator(user.email, user.emailVerified ?? false)) {
    return "administrator";
  }
  const { rows } = await getPool().query<{ role: PortalRole }>(
    "SELECT role FROM portal_user_roles WHERE user_id = $1",
    [user.id],
  );
  const role = rows[0]?.role ?? "customer";
  if (role !== "customer" && !user.emailVerified) return "customer";
  return role;
}

export function canAccessOperations(role: PortalRole) {
  return role === "administrator" || role === "staff";
}

export async function getSessionUser() {
  const { data, error } = await (await import("@/lib/auth/server")).auth.getSession();
  if (error) throw new Error("Unable to verify the current account session.");
  return data?.user ?? null;
}
