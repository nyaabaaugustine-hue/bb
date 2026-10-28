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
for (const path of ["/", "/homes", "/contact", "/about", "/services", "/blog", "/login", "/register", "/auth"]) {
  await check(`GET ${path} is public (200)`, expectStatus(path, 200));
}
await check("Unknown route returns 404", expectStatus("/this-page-does-not-exist", 404));

// Route protection (proxy.ts)
await check("/account redirects to login", expectRedirect("/account", "/login"));
await check("/account/saved keeps its deep link", expectRedirect("/account/saved", "next=%2Faccount%2Fsaved"));
await check("/admin redirects to login with next=/admin", expectRedirect("/admin", "next=%2Fadmin"));

// APIs reject anonymous callers
for (const path of ["/api/portal/requests", "/api/portal/saved-homes", "/api/admin/records", "/api/admin/users"]) {
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

// Neon Auth handler is mounted and the upstream auth service answers (anything but a server error)
await check("GET /api/auth/get-session is reachable (not 5xx)", async () => {
  const res = await hit("/api/auth/get-session");
  return res.status < 500 ? null : `got ${res.status} (check NEON_AUTH_BASE_URL and that the Neon Auth service is up)`;
});

console.log(failed ? `\n${failed} check(s) failed.` : "\nAll checks passed.");
process.exit(failed ? 1 : 0);
