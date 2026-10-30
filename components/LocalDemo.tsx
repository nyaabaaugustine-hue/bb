"use client";

import { FormEvent, useEffect, useState } from "react";
import Img from "@/components/Img";
import { KIND_LABEL, listings, money } from "@/lib/data";
import { isRequestStatus, isRequestType, labelize, requestActions, requestStatusBadgeClass, requestTypeLabels, requestTypes, type RequestStatus, type RequestType } from "@/lib/portal-domain";
import { portalRoles, type PortalRole } from "@/lib/portal-roles";

const STORAGE_KEY = "bbhomes-local-demo-v1";

type DemoProfile = { name: string; email: string; phone: string; role: PortalRole };
type DemoRequest = {
  id: string;
  type: RequestType;
  listingSlug: string;
  description: string;
  requestedDate: string;
  createdAt: string;
  status: RequestStatus;
};
type DemoUser = { id: string; name: string; email: string; role: PortalRole };
type DemoNotification = { id: string; title: string; message: string; createdAt: string };
type DemoState = {
  profile: DemoProfile | null;
  signedIn: boolean;
  savedSlugs: string[];
  requests: DemoRequest[];
  notifications: DemoNotification[];
  userRoles: Record<string, PortalRole>;
};
type DemoView = "overview" | "requests" | "saved" | "profile" | "notifications" | "operations" | "users";

const sampleUsers: DemoUser[] = [
  { id: "sample-customer", name: "Sample customer", email: "customer@example.test", role: "customer" },
  { id: "sample-staff", name: "Sample staff member", email: "staff@example.test", role: "staff" },
  { id: "sample-admin", name: "Sample administrator", email: "admin@example.test", role: "administrator" },
];

const emptyState: DemoState = {
  profile: null,
  signedIn: false,
  savedSlugs: [],
  requests: [],
  notifications: [],
  userRoles: Object.fromEntries(sampleUsers.map((user) => [user.id, user.role])),
};

function readState(): DemoState {
  try {
    const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "null") as Partial<DemoState> | null;
    if (!stored || typeof stored !== "object") return emptyState;
    const storedProfile = stored.profile && typeof stored.profile.email === "string" ? stored.profile : null;
    const profile = storedProfile ? {
      name: typeof storedProfile.name === "string" ? storedProfile.name : "",
      email: storedProfile.email,
      phone: typeof storedProfile.phone === "string" ? storedProfile.phone : "",
      role: portalRoles.includes(storedProfile.role as PortalRole) ? storedProfile.role as PortalRole : "customer",
    } : null;
    const userRoles = Object.fromEntries(sampleUsers.map((user) => {
      const role = stored.userRoles?.[user.id];
      return [user.id, portalRoles.includes(role as PortalRole) ? role as PortalRole : user.role];
    }));
    return {
      profile,
      signedIn: Boolean(stored.signedIn && profile),
      savedSlugs: Array.isArray(stored.savedSlugs) ? stored.savedSlugs.filter((slug): slug is string => typeof slug === "string") : [],
      requests: Array.isArray(stored.requests) ? stored.requests.slice(0, 100).flatMap((value): DemoRequest[] => {
        if (!value || typeof value !== "object") return [];
        const request = value as Partial<DemoRequest>;
        if (
          typeof request.id !== "string" ||
          !isRequestType(request.type) ||
          typeof request.description !== "string"
        ) return [];
        return [{
          id: request.id,
          type: request.type,
          listingSlug: typeof request.listingSlug === "string" ? request.listingSlug : "",
          description: request.description,
          requestedDate: typeof request.requestedDate === "string" ? request.requestedDate : "",
          createdAt: typeof request.createdAt === "string" ? request.createdAt : new Date().toISOString(),
          status: isRequestStatus(request.status) ? request.status : "pending",
        }];
      }) : [],
      notifications: Array.isArray(stored.notifications) ? stored.notifications.slice(0, 30) : [],
      userRoles,
    };
  } catch {
    return emptyState;
  }
}

function makeId() {
  return globalThis.crypto?.randomUUID?.() ?? `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

function displayDate(value: string) {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "Date unavailable" : date.toLocaleString();
}

function roleLabel(role: PortalRole) {
  return role === "administrator" ? "Administrator" : role === "staff" ? "Staff" : "Customer";
}

export default function LocalDemo() {
  const [data, setData] = useState<DemoState | null>(null);
  const [view, setView] = useState<DemoView>("overview");
  const [feedback, setFeedback] = useState("");
  const [error, setError] = useState("");

  useEffect(() => setData(readState()), []);

  function save(next: DemoState, notification?: Omit<DemoNotification, "id" | "createdAt">) {
    const timestamp = new Date().toISOString();
    const updated = notification
      ? { ...next, notifications: [{ ...notification, id: makeId(), createdAt: timestamp }, ...next.notifications].slice(0, 30) }
      : next;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    setData(updated);
    if (notification) setFeedback(notification.message);
  }

  function signIn(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!data) return;
    setError("");
    const form = new FormData(event.currentTarget);
    const name = String(form.get("name") ?? "").trim();
    const email = String(form.get("email") ?? "").trim().toLowerCase();
    if (data.profile && email !== data.profile.email) {
      setError("This browser already has a local demo profile. Clear its data before starting a different one.");
      return;
    }
    const selectedRole = String(form.get("role")) as PortalRole;
    const role = portalRoles.includes(selectedRole) ? selectedRole : "customer";
    const profile = data.profile ? { ...data.profile, name: name || data.profile.name, role } : { name, email, phone: "", role };
    save({ ...data, profile, signedIn: true }, {
      title: `${roleLabel(role)} demo started`,
      message: `Welcome, ${profile.name || profile.email}. This simulated ${roleLabel(role).toLowerCase()} session stays in this browser.`,
    });
  }

  function signOut() {
    if (!data) return;
    save({ ...data, signedIn: false }, {
      title: "Signed out locally",
      message: "Your demo data remains in this browser until you clear it.",
    });
  }

  function clearData() {
    localStorage.removeItem(STORAGE_KEY);
    setData(emptyState);
    setView("overview");
    setFeedback("Local demo data cleared from this browser.");
    setError("");
  }

  function toggleSaved(slug: string) {
    if (!data) return;
    const isSaved = data.savedSlugs.includes(slug);
    save({
      ...data,
      savedSlugs: isSaved ? data.savedSlugs.filter((item) => item !== slug) : [slug, ...data.savedSlugs],
    }, {
      title: isSaved ? "Home removed" : "Home saved",
      message: isSaved ? "The home was removed from your local shortlist." : "The home was added to your local shortlist.",
    });
  }

  function createRequest(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!data) return;
    setError("");
    const form = new FormData(event.currentTarget);
    const type = String(form.get("type")) as RequestType;
    const listingSlug = String(form.get("listingSlug") ?? "");
    const description = String(form.get("description") ?? "").trim();
    const requestedDate = String(form.get("requestedDate") ?? "");
    const request: DemoRequest = {
      id: makeId(),
      type,
      listingSlug,
      description,
      requestedDate,
      createdAt: new Date().toISOString(),
      status: "pending",
    };
    save({ ...data, requests: [request, ...data.requests] }, {
      title: "Demo request received",
      message: "Your simulated request is saved locally. No email or team notification was sent.",
    });
    event.currentTarget.reset();
  }

  function changeRequestStatus(id: string, status: RequestStatus) {
    if (!data) return;
    const request = data.requests.find((item) => item.id === id);
    if (!request || !(requestActions[request.status] ?? []).some((action) => action.status === status)) return;
    save({ ...data, requests: data.requests.map((item) => item.id === id ? { ...item, status } : item) }, {
      title: "Request status updated",
      message: `The local request is now ${labelize(status)}. No customer or staff notification was sent.`,
    });
  }

  function changeUserRole(user: DemoUser, role: PortalRole) {
    if (!data || data.profile?.role !== "administrator") return;
    save({
      ...data,
      userRoles: { ...data.userRoles, [user.id]: role },
      profile: user.email === data.profile.email ? { ...data.profile, role } : data.profile,
    }, {
      title: "Demo role updated",
      message: `${user.name}'s simulated role is now ${roleLabel(role)}.`,
    });
  }

  function updateProfile(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!data?.profile) return;
    const form = new FormData(event.currentTarget);
    const profile = {
      ...data.profile,
      name: String(form.get("name") ?? "").trim(),
      phone: String(form.get("phone") ?? "").trim(),
    };
    save({ ...data, profile }, {
      title: "Profile updated",
      message: "Your changes are saved in this browser only.",
    });
  }

  const savedListings = listings.filter((listing) => data?.savedSlugs.includes(listing.slug));
  const featuredListings = listings.slice(0, 4);
  const activeRole = data?.profile?.role ?? "customer";
  const operationsUsers = [
    ...sampleUsers.filter((user) => user.email !== data?.profile?.email).map((user) => ({ ...user, role: data?.userRoles[user.id] ?? user.role })),
    ...(data?.profile ? [{ id: "active-profile", name: data.profile.name || "Current demo user", email: data.profile.email, role: data.profile.role }] : []),
  ];
  const navigation: [DemoView, string][] = [
    ["overview", "Overview"],
    ["requests", `Requests (${data?.requests.length ?? 0})`],
    ["saved", `Saved (${data?.savedSlugs.length ?? 0})`],
    ["profile", "Profile"],
    ["notifications", `Notifications (${data?.notifications.length ?? 0})`],
  ];
  if (activeRole === "staff" || activeRole === "administrator") navigation.push(["operations", "Operations"]);
  if (activeRole === "administrator") navigation.push(["users", "User roles"]);

  return (
    <section className="wrap max-w-6xl">
      <header className="flex flex-wrap items-end justify-between gap-5 border-b border-line pb-6">
        <div>
          <p className="eyebrow">Browser-only simulation</p>
          <h1 className="mt-2 text-3xl leading-tight sm:text-4xl">Customer journey sandbox</h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-mute">Local profile, saved homes, requests, and notifications. Nothing here signs into Neon or sends email.</p>
        </div>
        {data?.signedIn && data.profile && (
          <div className="flex items-center gap-3">
            <p className="max-w-48 truncate text-sm font-semibold">{data.profile.name || data.profile.email}</p>
            <button type="button" className="btn min-h-10" onClick={signOut}>Sign out</button>
          </div>
        )}
      </header>

      {feedback && <p role="status" className="mt-5 border-l-4 border-moss bg-moss/5 px-4 py-3 text-sm font-medium text-moss">{feedback}</p>}

      {data === null ? (
        <p className="py-10 text-sm text-mute">Loading local demo…</p>
      ) : !data.signedIn ? (
        <div className="mx-auto mt-8 max-w-xl">
          <form className="panel space-y-4" onSubmit={signIn}>
            <div>
              <p className="eyebrow">Local account</p>
              <h2 className="mt-2 text-2xl">{data.profile ? "Sign back in" : "Start a demo profile"}</h2>
              <p className="mt-2 text-sm leading-6 text-mute">No password is used or stored in this simulator.</p>
            </div>
            <div>
              <label className="label" htmlFor="demo-role">Simulate role</label>
              <select id="demo-role" name="role" className="field min-h-12" defaultValue={data.profile?.role ?? "customer"}>
                {portalRoles.map((role) => <option key={role} value={role}>{roleLabel(role)}</option>)}
              </select>
              <p className="mt-1 text-xs text-mute">Role selection only changes this local simulation. It grants no real account access.</p>
            </div>
            <div>
              <label className="label" htmlFor="demo-name">Name</label>
              <input id="demo-name" name="name" className="field min-h-12" autoComplete="name" required maxLength={100} defaultValue={data.profile?.name ?? ""} />
            </div>
            <div>
              <label className="label" htmlFor="demo-email">Email</label>
              <input id="demo-email" name="email" type="email" className="field min-h-12" autoComplete="email" required maxLength={254} defaultValue={data.profile?.email ?? ""} readOnly={Boolean(data.profile)} />
            </div>
            {error && <p role="alert" className="rounded-lg border border-red-800/20 bg-red-50 px-3 py-2.5 text-sm font-medium text-red-900">{error}</p>}
            <button type="submit" className="btn-primary min-h-12 w-full justify-center">{data.profile ? "Sign in locally" : "Start local session"}</button>
          </form>
          <p className="mt-4 text-center text-sm text-mute">This is separate from your real B B Homes account.</p>
        </div>
      ) : (
        <>
          <nav aria-label="Local demo sections" className="mt-6 flex gap-1 overflow-x-auto border-b border-line pb-2">
            {navigation.map(([key, label]) => (
              <button key={key} type="button" aria-pressed={view === key} className="seg-item min-w-max" onClick={() => setView(key)}>{label}</button>
            ))}
          </nav>

          {view === "overview" && (
            <div className="mt-6 grid items-start gap-8 xl:grid-cols-[minmax(0,1.2fr)_minmax(18rem,0.8fr)]">
              <section>
                <div className="rounded-xl bg-ink px-5 py-6 text-cream sm:px-7">
                  <p className="text-xs font-bold uppercase tracking-[.14em] text-sand">Local journey</p>
                  <h2 className="mt-2 text-2xl">Good to have you here, {data.profile?.name || "there"}.</h2>
                  <p className="mt-2 break-all text-sm text-cream/70">{data.profile?.email}</p>
                  <div className="mt-5 flex flex-wrap gap-5 text-sm">
                    <span><strong>{data.requests.length}</strong> requests</span>
                    <span><strong>{data.savedSlugs.length}</strong> saved homes</span>
                    <span><strong>{data.notifications.length}</strong> notifications</span>
                  </div>
                </div>
                <section className="mt-7">
                  <div className="flex flex-wrap items-end justify-between gap-3">
                    <div><h2 className="text-2xl">Explore homes</h2><p className="mt-1 text-sm text-mute">Save a listing to try the shortlist flow.</p></div>
                    <button type="button" className="text-sm font-semibold text-terra hover:underline" onClick={() => setView("saved")}>View saved</button>
                  </div>
                  <div className="mt-4 grid gap-3 sm:grid-cols-2">
                    {featuredListings.map((listing) => {
                      const isSaved = data.savedSlugs.includes(listing.slug);
                      return (
                        <article key={listing.slug} className="overflow-hidden rounded-lg border border-line bg-card">
                          <div className="relative aspect-[16/9]"><Img id={listing.img} alt={listing.title} sizes="(min-width:640px) 40vw, 100vw" /></div>
                          <div className="p-4">
                            <p className="text-xs font-semibold uppercase text-terra">{KIND_LABEL[listing.kind]} · {listing.zone}</p>
                            <h3 className="mt-1 font-semibold">{listing.title}</h3>
                            <p className="mt-2 font-serif text-lg font-bold">{money(listing.price)}{listing.kind === "rent" ? " / month" : ""}</p>
                            <button type="button" className={isSaved ? "btn mt-3 min-h-10 w-full" : "btn-primary mt-3 min-h-10 w-full"} aria-pressed={isSaved} onClick={() => toggleSaved(listing.slug)}>{isSaved ? "Remove from saved" : "Save home"}</button>
                          </div>
                        </article>
                      );
                    })}
                  </div>
                </section>
              </section>

              <aside className="space-y-7">
                <section className="panel">
                  <h2 className="text-2xl">Send a request</h2>
                  <p className="mt-1 text-sm leading-6 text-mute">Create a simulated enquiry, viewing, or valuation request.</p>
                  <form className="mt-5 space-y-4" onSubmit={createRequest}>
                    <div>
                      <label className="label" htmlFor="demo-request-type">Request type</label>
                      <select id="demo-request-type" name="type" className="field min-h-12" required defaultValue="viewing">
                        {requestTypes.map((type) => <option key={type} value={type}>{requestTypeLabels[type]}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="label" htmlFor="demo-listing">Property</label>
                      <select id="demo-listing" name="listingSlug" className="field min-h-12" defaultValue="">
                        <option value="">Not property-specific</option>
                        {listings.map((listing) => <option key={listing.slug} value={listing.slug}>{listing.title}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="label" htmlFor="demo-date">Preferred date</label>
                      <input id="demo-date" name="requestedDate" type="datetime-local" className="field min-h-12" />
                    </div>
                    <div>
                      <label className="label" htmlFor="demo-description">Details</label>
                      <textarea id="demo-description" name="description" rows={3} minLength={10} maxLength={2000} className="field resize-y" required placeholder="Tell us what you are considering." />
                    </div>
                    <button type="submit" className="btn-primary min-h-12 w-full justify-center">Create local request</button>
                    <p className="text-xs leading-5 text-mute">This creates a browser-only record. It does not notify staff or reserve a property.</p>
                  </form>
                </section>
                <NotificationList notifications={data.notifications.slice(0, 4)} onViewAll={() => setView("notifications")} />
              </aside>
            </div>
          )}

          {view === "requests" && (
            <section className="mt-6">
              <h2 className="text-2xl">Local requests</h2>
              <p className="mt-1 text-sm text-mute">These records exist only in this browser and remain pending for simulation.</p>
              <div className="mt-4 divide-y divide-line border-y border-line">
                {data.requests.length === 0 ? <p className="py-6 text-sm text-mute">No local requests yet. Create one from the overview.</p> : data.requests.map((request) => (
                  <article key={request.id} className="py-4">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <h3 className="font-semibold">{requestTypeLabels[request.type]}</h3>
                      <span className={`${requestStatusBadgeClass(request.status)} capitalize`}>{labelize(request.status)} · demo</span>
                    </div>
                    <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-mute">{request.description}</p>
                    <p className="mt-2 text-xs text-mute">Ref LOCAL-{request.id.slice(0, 8).toUpperCase()} · {displayDate(request.createdAt)}{request.requestedDate ? ` · Preferred ${displayDate(request.requestedDate)}` : ""}</p>
                    {(activeRole === "staff" || activeRole === "administrator") && (requestActions[request.status] ?? []).length > 0 && (
                      <div className="mt-3 flex flex-wrap gap-2">
                        {(requestActions[request.status] ?? []).map((action) => (
                          <button key={action.status} type="button" className="btn min-h-9 px-3 text-xs" onClick={() => changeRequestStatus(request.id, action.status)}>{action.label} locally</button>
                        ))}
                      </div>
                    )}
                  </article>
                ))}
              </div>
            </section>
          )}

          {view === "saved" && (
            <section className="mt-6">
              <h2 className="text-2xl">Saved homes</h2>
              <p className="mt-1 text-sm text-mute">Your local shortlist is saved in this browser.</p>
              {savedListings.length === 0 ? <p className="mt-4 border-y border-line py-6 text-sm text-mute">No saved homes yet. Add one from the overview.</p> : (
                <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                  {savedListings.map((listing) => (
                    <article key={listing.slug} className="overflow-hidden rounded-lg border border-line bg-card">
                      <div className="relative aspect-[16/9]"><Img id={listing.img} alt={listing.title} sizes="(min-width:1280px) 30vw, (min-width:640px) 45vw, 100vw" /></div>
                      <div className="p-4">
                        <p className="text-xs font-semibold uppercase text-terra">{KIND_LABEL[listing.kind]} · {listing.zone}</p>
                        <h3 className="mt-1 font-semibold">{listing.title}</h3>
                        <p className="mt-2 font-serif text-lg font-bold">{money(listing.price)}</p>
                        <button type="button" className="btn mt-3 min-h-10 w-full" onClick={() => toggleSaved(listing.slug)}>Remove from saved</button>
                      </div>
                    </article>
                  ))}
                </div>
              )}
            </section>
          )}

          {view === "profile" && data.profile && (
            <section className="mt-6 max-w-xl">
              <h2 className="text-2xl">Local profile</h2>
              <p className="mt-1 text-sm text-mute">Profile changes are saved only in this browser.</p>
              <form className="panel mt-4 space-y-4" onSubmit={updateProfile}>
                <div><label className="label" htmlFor="profile-name">Name</label><input id="profile-name" name="name" className="field min-h-12" required maxLength={100} defaultValue={data.profile.name} /></div>
                <div><label className="label" htmlFor="profile-email">Email</label><input id="profile-email" className="field min-h-12 bg-cream" value={data.profile.email} readOnly /></div>
                <div><label className="label" htmlFor="profile-phone">Phone</label><input id="profile-phone" name="phone" type="tel" className="field min-h-12" autoComplete="tel" maxLength={30} defaultValue={data.profile.phone} /></div>
                <button type="submit" className="btn-primary min-h-12">Save profile</button>
              </form>
            </section>
          )}

          {view === "notifications" && (
            <section className="mt-6 max-w-3xl">
              <div className="flex flex-wrap items-end justify-between gap-3">
                <div><h2 className="text-2xl">Notification history</h2><p className="mt-1 text-sm text-mute">Local in-app notifications only. No emails or staff alerts are sent.</p></div>
                <button type="button" className="btn min-h-10" onClick={() => save({ ...data, notifications: [] }, { title: "Notifications cleared", message: "Local notification history was cleared." })}>Clear history</button>
              </div>
              <div className="mt-4"><NotificationList notifications={data.notifications} /></div>
            </section>
          )}

          {view === "operations" && (activeRole === "staff" || activeRole === "administrator") && (
            <section className="mt-6">
              <p className="eyebrow">{roleLabel(activeRole)} simulator</p>
              <h2 className="mt-2 text-2xl">Request desk</h2>
              <p className="mt-1 text-sm leading-6 text-mute">Move local requests through the same status stages as the team workflow. These changes do not reach the live operations queue.</p>
              {data.requests.length === 0 ? <p className="mt-4 border-y border-line py-6 text-sm text-mute">No requests to review. Create one from Overview, then return here.</p> : (
                <div className="mt-4 divide-y divide-line border-y border-line">
                  {data.requests.map((request) => (
                    <article key={request.id} className="py-4">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div><h3 className="font-semibold">{requestTypeLabels[request.type]}</h3><p className="mt-1 text-xs text-mute">LOCAL-{request.id.slice(0, 8).toUpperCase()}</p></div>
                        <span className={`${requestStatusBadgeClass(request.status)} capitalize`}>{labelize(request.status)}</span>
                      </div>
                      <p className="mt-2 text-sm leading-6 text-mute">{request.description}</p>
                      {(requestActions[request.status] ?? []).length > 0 ? (
                        <div className="mt-3 flex flex-wrap gap-2">
                          {(requestActions[request.status] ?? []).map((action) => <button key={action.status} type="button" className="btn min-h-9 px-3 text-xs" onClick={() => changeRequestStatus(request.id, action.status)}>{action.label}</button>)}
                        </div>
                      ) : <p className="mt-3 text-xs font-medium text-mute">No more status changes are available.</p>}
                    </article>
                  ))}
                </div>
              )}
            </section>
          )}

          {view === "users" && activeRole === "administrator" && (
            <section className="mt-6 max-w-3xl">
              <p className="eyebrow">Administrator simulator</p>
              <h2 className="mt-2 text-2xl">Sample user roles</h2>
              <p className="mt-1 text-sm leading-6 text-mute">These sample records exist only in this browser. Changing a role has no effect on real accounts or permissions.</p>
              <div className="mt-4 divide-y divide-line border-y border-line">
                {operationsUsers.map((user) => (
                  <div key={user.id} className="flex flex-wrap items-center justify-between gap-3 py-4">
                    <div className="min-w-0"><p className="truncate font-semibold">{user.name}</p><p className="break-all text-sm text-mute">{user.email}</p></div>
                    <label className="flex items-center gap-2 text-sm font-medium">
                      <span className="sr-only">Simulated role for {user.email}</span>
                      <select className="field min-h-10 w-44" value={user.role} onChange={(event) => changeUserRole(user, event.target.value as PortalRole)}>
                        {portalRoles.map((role) => <option key={role} value={role}>{roleLabel(role)}</option>)}
                      </select>
                    </label>
                  </div>
                ))}
              </div>
            </section>
          )}

          {error && <p role="alert" className="mt-5 rounded-lg border border-red-800/20 bg-red-50 px-3 py-2.5 text-sm font-medium text-red-900">{error}</p>}
          <div className="mt-10 border-t border-line pt-5">
            <button type="button" className="text-sm font-semibold text-red-800 underline-offset-4 hover:underline" onClick={clearData}>Clear all local demo data</button>
          </div>
        </>
      )}
    </section>
  );
}

function NotificationList({ notifications, onViewAll }: { notifications: DemoNotification[]; onViewAll?: () => void }) {
  return (
    <section className="border-t border-line pt-5">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-xl">Notifications</h2>
        {onViewAll && <button type="button" className="text-sm font-semibold text-terra hover:underline" onClick={onViewAll}>View all</button>}
      </div>
      {notifications.length === 0 ? <p className="mt-3 text-sm text-mute">Your local notifications will appear here.</p> : (
        <ul className="mt-3 divide-y divide-line">
          {notifications.map((notification) => (
            <li key={notification.id} className="py-3 first:pt-0">
              <p className="text-sm font-semibold">{notification.title}</p>
              <p className="mt-1 text-sm leading-5 text-mute">{notification.message}</p>
              <p className="mt-1 text-xs text-mute">{displayDate(notification.createdAt)}</p>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}