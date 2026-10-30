"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Arrow } from "@/components/Icons";

const demoRoles = [
  { role: "customer", label: "Customer", description: "Portal: enquiries, saved homes, payments" },
  { role: "staff", label: "Staff", description: "Operations desk and message inbox" },
  { role: "administrator", label: "Administrator", description: "Full workspace, records and user roles" },
] as const;

export default function DemoLogin() {
  const router = useRouter();
  const [pending, setPending] = useState<string | null>(null);
  const [error, setError] = useState("");

  async function start(role: string) {
    setPending(role);
    setError("");
    try {
      const response = await fetch(`/api/demo-login?role=${encodeURIComponent(role)}`, { method: "POST" });
      const result = (await response.json().catch(() => ({}))) as { redirect?: string; error?: string };
      if (!response.ok || !result.redirect) {
        setError(result.error ?? "Demo sign-in failed. Please try again.");
        setPending(null);
        return;
      }
      router.replace(result.redirect);
      router.refresh();
    } catch {
      setError("Network problem. Please check your connection and try again.");
      setPending(null);
    }
  }

  return (
    <div className="mb-6 rounded-xl border border-terra/30 bg-terra/5 p-4">
      <p className="text-xs font-bold uppercase tracking-[.14em] text-terra">Demo sign-in · development</p>
      <p className="mt-1 text-sm leading-6 text-mute">One tap signs you into a ready-made account for each role.</p>
      <div className="mt-3 grid gap-2">
        {demoRoles.map(({ role, label, description }) => (
          <button
            key={role}
            type="button"
            disabled={pending !== null}
            onClick={() => start(role)}
            className="btn min-h-12 w-full !justify-between !px-4 text-left disabled:cursor-wait disabled:opacity-60"
          >
            <span className="min-w-0">
              <span className="block text-sm font-semibold">{pending === role ? `Signing in as ${label.toLowerCase()}…` : label}</span>
              <span className="block text-xs font-normal text-mute">{description}</span>
            </span>
            <Arrow width={16} height={16} className="shrink-0 text-terra" />
          </button>
        ))}
      </div>
      {error && <p role="alert" className="mt-3 rounded-lg border border-red-800/20 bg-red-50 px-3 py-2 text-sm font-medium text-red-900">{error}</p>}
      <p className="mt-3 text-xs leading-5 text-mute">Testing only. These demo accounts use the credentials in your local <code>.env.local</code>.</p>
    </div>
  );
}
