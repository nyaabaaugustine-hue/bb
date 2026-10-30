"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { ZONES } from "@/lib/data";
import { enquiryChannelLabels, enquiryChannels } from "@/lib/portal-domain";

export default function ProfileForm({ displayName, phone, preferredChannel, preferredZone, budgetMin, budgetMax, marketingOptIn }: {
  displayName: string;
  phone: string;
  preferredChannel: string | null;
  preferredZone: string | null;
  budgetMin: string | null;
  budgetMax: string | null;
  marketingOptIn: boolean;
}) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setError("");
    setNotice("");
    const form = new FormData(event.currentTarget);
    try {
      const response = await fetch("/api/portal/profile", {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          displayName: form.get("displayName"),
          phone: form.get("phone"),
          preferredChannel: form.get("preferredChannel"),
          preferredZone: form.get("preferredZone"),
          budgetMin: form.get("budgetMin"),
          budgetMax: form.get("budgetMax"),
          marketingOptIn: form.get("marketingOptIn") === "on",
        }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(typeof result.error === "string" ? result.error : "We couldn't save your profile.");
      setNotice("Profile updated.");
      router.refresh();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "We couldn't save your profile.");
    } finally {
      setPending(false);
    }
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      <div>
        <label className="label" htmlFor="profile-name">Display name</label>
        <input id="profile-name" name="displayName" defaultValue={displayName} minLength={1} maxLength={120} required autoComplete="name" className="field min-h-11" />
        <p className="mt-1 text-xs text-mute">The name your agent uses when they contact you.</p>
      </div>
      <div>
        <label className="label" htmlFor="profile-phone">Phone number</label>
        <input id="profile-phone" name="phone" defaultValue={phone} type="tel" inputMode="tel" autoComplete="tel" placeholder="054 198 8383" className="field min-h-11" />
        <p className="mt-1 text-xs text-mute">Optional. Used for callback requests, never shown publicly.</p>
      </div>

      <fieldset className="space-y-4 border-t border-line pt-4">
        <legend className="text-sm font-bold uppercase tracking-wide text-terra">How we should reach you</legend>
        <div>
          <label className="label" htmlFor="profile-channel">Preferred reply channel</label>
          <select id="profile-channel" name="preferredChannel" defaultValue={preferredChannel ?? ""} className="field min-h-11">
            <option value="">No preference</option>
            {enquiryChannels.map((channel) => <option key={channel} value={channel}>{enquiryChannelLabels[channel]}</option>)}
          </select>
        </div>
        <div>
          <label className="label" htmlFor="profile-zone">Preferred area</label>
          <select id="profile-zone" name="preferredZone" defaultValue={preferredZone ?? ""} className="field min-h-11">
            <option value="">No preference</option>
            {ZONES.map((zone) => <option key={zone} value={zone}>{zone}</option>)}
          </select>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <label className="label" htmlFor="profile-budget-min">Budget from (GHS)</label>
            <input id="profile-budget-min" name="budgetMin" type="number" inputMode="numeric" min="0" max="100000000" step="100" defaultValue={budgetMin ?? ""} placeholder="Optional" className="field min-h-11" />
          </div>
          <div>
            <label className="label" htmlFor="profile-budget-max">Budget up to (GHS)</label>
            <input id="profile-budget-max" name="budgetMax" type="number" inputMode="numeric" min="0" max="100000000" step="100" defaultValue={budgetMax ?? ""} placeholder="Optional" className="field min-h-11" />
          </div>
        </div>
        <label className="flex items-start gap-2 text-sm leading-5">
          <input type="checkbox" name="marketingOptIn" defaultChecked={marketingOptIn} className="mt-0.5 h-4 w-4 accent-[#b8541f]" />
          <span>Send me occasional property and land updates. You can opt out at any time.</span>
        </label>
      </fieldset>

      {error && <p role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-900">{error}</p>}
      {notice && <p role="status" className="rounded-lg bg-moss/5 px-3 py-2 text-sm font-medium text-moss">{notice}</p>}
      <button type="submit" className="btn-primary min-h-11" disabled={pending}>{pending ? "Saving…" : "Save changes"}</button>
    </form>
  );
}
