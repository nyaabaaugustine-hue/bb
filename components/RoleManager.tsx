"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { portalRoles, type PortalRole } from "@/lib/portal-roles";

type RoleUser = {
  id: string;
  email: string;
  display_name: string;
  role: PortalRole;
  bootstrap_admin: boolean;
};

const roleLabels: Record<PortalRole, string> = {
  administrator: "Administrator",
  staff: "Staff / agent",
  customer: "Customer",
};

export default function RoleManager({ initialUsers }: { initialUsers: { id: string; email: string; display_name: string }[] }) {
  const router = useRouter();
  const [users, setUsers] = useState<RoleUser[]>(
    initialUsers.map((user) => ({ ...user, role: "customer", bootstrap_admin: false })),
  );
  const [loading, setLoading] = useState(true);
  const [pendingId, setPendingId] = useState("");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  async function loadUsers() {
    const response = await fetch("/api/admin/users", { cache: "no-store" });
    const result = await response.json();
    if (!response.ok) throw new Error(typeof result.error === "string" ? result.error : "We couldn't load user roles.");
    setUsers(result.users as RoleUser[]);
  }

  useEffect(() => {
    loadUsers()
      .catch((cause: unknown) => setError(cause instanceof Error ? cause.message : "We couldn't load user roles."))
      .finally(() => setLoading(false));
  }, []);

  async function changeRole(userId: string, role: PortalRole) {
    const target = users.find((user) => user.id === userId);
    if (
      role === "administrator" &&
      target?.role !== "administrator" &&
      !window.confirm(`Grant highest-level administrator access to ${target?.email}?`)
    ) return;

    setPendingId(userId);
    setError("");
    setNotice("");
    try {
      const response = await fetch("/api/admin/users", {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ userId, role }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(typeof result.error === "string" ? result.error : "We couldn't update this role.");
      setUsers((current) => current.map((user) => user.id === userId ? { ...user, role } : user));
      setNotice("Role updated and audit logged.");
      router.refresh();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "We couldn't update this role.");
    } finally {
      setPendingId("");
    }
  }

  return (
    <section className="panel mt-8">
      <div>
        <p className="eyebrow">Access control</p>
        <h2 className="mt-2 text-2xl">User roles</h2>
        <p className="mt-1 text-sm leading-6 text-mute">Administrators have the highest access. Staff can manage requests; customers can only access their own account. Bootstrap administrators are controlled by the server environment.</p>
      </div>
      {error && <p role="alert" className="mt-4 rounded-lg border border-red-800/20 bg-red-50 px-4 py-3 text-sm font-medium text-red-900">{error}</p>}
      {notice && <p role="status" className="mt-4 rounded-lg border border-moss/20 bg-moss/5 px-4 py-3 text-sm font-medium text-moss">{notice}</p>}
      <div className="mt-4 divide-y divide-line border-y border-line">
        {loading ? <p role="status" className="py-4 text-sm text-mute">Loading users…</p> : users.length === 0 ? (
          <p className="py-4 text-sm text-mute">No customer accounts yet.</p>
        ) : users.map((user) => (
          <div key={user.id} className="flex flex-wrap items-center justify-between gap-3 py-4">
            <div className="min-w-0">
              <p className="truncate font-semibold">{user.display_name || user.email}</p>
              <p className="break-all text-sm text-mute">{user.email}</p>
              {user.bootstrap_admin && <p className="mt-1 text-xs font-semibold text-terra">Protected by SUPER_ADMIN_EMAILS</p>}
            </div>
            <label className="flex items-center gap-2 text-sm font-medium">
              <span className="sr-only">Role for {user.email}</span>
              <select
                className="field min-h-10 w-44"
                value={user.role}
                disabled={loading || pendingId === user.id || user.bootstrap_admin}
                onChange={(event) => changeRole(user.id, event.target.value as PortalRole)}
              >
                {portalRoles.map((role) => <option key={role} value={role}>{roleLabels[role]}</option>)}
              </select>
              {pendingId === user.id && <span className="text-xs text-mute">Saving…</span>}
            </label>
          </div>
        ))}
      </div>
    </section>
  );
}
