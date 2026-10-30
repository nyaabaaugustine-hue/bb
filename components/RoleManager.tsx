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

export default function RoleManager({ initialUsers }: { initialUsers: RoleUser[] }) {
  const router = useRouter();
  const [users, setUsers] = useState(initialUsers);
  const [query, setQuery] = useState("");
  const [pendingId, setPendingId] = useState("");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  useEffect(() => setUsers(initialUsers), [initialUsers]);

  const matching = users.filter((user) => {
    const needle = query.trim().toLowerCase();
    return !needle || `${user.display_name} ${user.email}`.toLowerCase().includes(needle);
  });
  const staffCount = users.filter((user) => user.role === "staff").length;
  const administratorCount = users.filter((user) => user.role === "administrator").length;

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
    <section id="user-roles" className="panel mt-8 scroll-mt-28">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="eyebrow">Access control</p>
          <h2 className="mt-2 text-2xl">User roles</h2>
          <p className="mt-1 text-sm leading-6 text-mute">Administrators have the highest access. Staff can manage requests and enquiries; customers can only access their own account. Bootstrap administrators are controlled by the server environment.</p>
        </div>
        <span className="badge badge-sand">{administratorCount} admin · {staffCount} staff</span>
      </div>
      <label className="mt-4 block max-w-sm text-sm font-semibold">Find a user
        <input type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Name or email" className="field mt-1 min-h-11 w-full" />
      </label>
      {error && <p role="alert" className="mt-4 rounded-lg border border-red-800/20 bg-red-50 px-4 py-3 text-sm font-medium text-red-900">{error}</p>}
      {notice && <p role="status" className="mt-4 rounded-lg border border-moss/20 bg-moss/5 px-4 py-3 text-sm font-medium text-moss">{notice}</p>}
      <div className="mt-4 divide-y divide-line border-y border-line">
        {matching.length === 0 ? (
          <p className="py-4 text-sm text-mute">{users.length === 0 ? "No customer accounts yet." : "No users match this search."}</p>
        ) : matching.map((user) => (
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
                disabled={pendingId === user.id || user.bootstrap_admin}
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
