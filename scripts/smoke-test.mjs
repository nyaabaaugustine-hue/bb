// Smoke test for a running dev/prod server. Usage:
//   npm run smoke                       (defaults to http://localhost:3000)
//   npm run smoke -- http://localhost:3001
// Exits non-zero if any check fails. Makes no writes: all requests are
// unauthenticated and the POST checks are rejected before touching the database.

const base = (process.argv[2] || process.env.SMOKE_BASE_URL || "http://localhost:3000").replace(/\/$/, "");
let failed = 0;

async function hit(path, init = {}) {
  return fetch(base + path, { redirect: "manual", ...init });
}

async function check(name, fn) {
  try {
    const problem = await fn();
    if (problem) throw new Error(problem);
    console.log(`PASS  ${name}`);
  } catch (error) {
    failed += 1;
    console.log(`FAIL  ${name}  ->  ${error instanceof Error ? error.message : error}`);
  }
}

const expectStatus = (path, status, init) => async () => {
  const res = await hit(path, init);
  return res.status === status ? null : `expected ${status}, got ${res.status}`;
};

const expectRedirect = (path, mustContain) => async () => {
  const res = await hit(path);
  const location = res.headers.get("location") || "";
  if (![301, 302, 303, 307, 308].includes(res.status)) return `expected a redirect, got ${res.status}`;
  return location.includes(mustContain) ? null : `redirected to "${location}", expected it to contain "${mustContain}"`;
};

console.log(`Smoke testing ${base}\n`);

// Public pages
for (const path of ["/", "/homes", "/homes/existing-three-bed-home", "/land-and-build", "/materials", "/invest", "/contact", "/about", "/services", "/blog", "/blog/verify-land-before-you-buy", "/privacy", "/terms", "/register", "/auth"]) {
  await check(`GET ${path} is public (200)`, expectStatus(path, 200));
}
await check("GET /login is public (200, or the dev demo redirect)", async () => {
  const res = await hit("/login");
  if (res.status === 200) return null;
  const location = res.headers.get("location") || "";
  return res.status === 307 && location.includes("/local-demo")
    ? null
    : `expected 200 or a dev redirect to /local-demo, got ${res.status} ${location}`;
});
await check("Unknown route returns 404", expectStatus("/this-page-does-not-exist", 404));

// Crawler and security basics
for (const path of ["/sitemap.xml", "/robots.txt"]) {
  await check(`GET ${path} is served (200)`, expectStatus(path, 200));
}
await check("Public pages send security headers", async () => {
  const res = await hit("/");
  const csp = res.headers.get("content-security-policy") || "";
  const checks = [
    [res.headers.get("x-content-type-options") === "nosniff", "x-content-type-options"],
    [res.headers.get("x-frame-options") === "DENY", "x-frame-options"],
    [!!res.headers.get("referrer-policy"), "referrer-policy"],
    [csp.includes("frame-ancestors 'none'"), "content-security-policy"],
  ];
  const missing = checks.filter(([ok]) => !ok).map(([, name]) => name);
  return missing.length ? `missing or invalid: ${missing.join(", ")}` : null;
});

// Route protection (proxy.ts)
await check("/account redirects to login", expectRedirect("/account", "/login"));
await check("/account/saved keeps its deep link", expectRedirect("/account/saved", "next=%2Faccount%2Fsaved"));
await check("/account/messages keeps its deep link", expectRedirect("/account/messages", "next=%2Faccount%2Fmessages"));
await check("/admin redirects to login with next=/admin", expectRedirect("/admin", "next=%2Fadmin"));

// APIs reject anonymous callers
for (const path of ["/api/portal/requests", "/api/portal/saved-homes", "/api/portal/messages", "/api/admin/records", "/api/admin/users", "/api/admin/messages"]) {
  await check(`GET ${path} rejects anonymous (401)`, expectStatus(path, 401));
}

// CSRF / same-origin guard: mutating calls without a matching Origin are refused
const json = { "content-type": "application/json" };
await check("POST /api/portal/requests without Origin is refused (403)",
  expectStatus("/api/portal/requests", 403, { method: "POST", headers: json, body: "{}" }));
await check("PATCH /api/admin/users with foreign Origin is refused (403)",
  expectStatus("/api/admin/users", 403, { method: "PATCH", headers: { ...json, origin: "https://evil.example" }, body: "{}" }));
await check("POST /api/portal/requests with same Origin but no session is 401",
  expectStatus("/api/portal/requests", 401, { method: "POST", headers: { ...json, origin: base }, body: "{}" }));
await check("POST /api/portal/messages without Origin is refused (403)",
  expectStatus("/api/portal/messages", 403, { method: "POST", headers: json, body: "{}" }));
await check("POST /api/portal/messages with same Origin but no session is 401",
  expectStatus("/api/portal/messages", 401, { method: "POST", headers: { ...json, origin: base }, body: "{}" }));
await check("POST /api/admin/messages with foreign Origin is refused (403)",
  expectStatus("/api/admin/messages", 403, { method: "POST", headers: { ...json, origin: "https://evil.example" }, body: "{}" }));
await check("PATCH /api/portal/profile with foreign Origin is refused (403)",
  expectStatus("/api/portal/profile", 403, { method: "PATCH", headers: { ...json, origin: "https://evil.example" }, body: "{}" }));
await check("PATCH /api/admin/enquiries with foreign Origin is refused (403)",
  expectStatus("/api/admin/enquiries", 403, { method: "PATCH", headers: { ...json, origin: "https://evil.example" }, body: "{}" }));

// Public forms validate before writing: a same-origin but empty body is a 400
await check("POST /api/enquiry rejects an empty body (400)",
  expectStatus("/api/enquiry", 400, { method: "POST", headers: { ...json, origin: base }, body: "{}" }));
await check("POST /api/subscribe rejects an empty body (400)",
  expectStatus("/api/subscribe", 400, { method: "POST", headers: { ...json, origin: base }, body: "{}" }));

// Neon Auth handler is mounted and the upstream auth service answers (anything but a server error)
await check("GET /api/auth/get-session is reachable (not 5xx)", async () => {
  const res = await hit("/api/auth/get-session");
  return res.status < 500 ? null : `got ${res.status} (check NEON_AUTH_BASE_URL and that the Neon Auth service is up)`;
});

console.log(failed ? `\n${failed} check(s) failed.` : "\nAll checks passed.");
process.exit(failed ? 1 : 0);
