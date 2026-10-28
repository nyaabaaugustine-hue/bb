# Customer Portal and Neon Authentication

## Requirements

- When a visitor registers or signs in, the app shall authenticate them through Neon Managed Auth and establish a server-verified session.
- When a signed-in customer opens the portal, the app shall show only their viewing, rental, purchase, valuation, owner-listing, and investment requests.
- When a customer submits a request, the app shall save it as pending; it shall not claim availability, approve a listing, or charge money.
- When a super admin reviews the portal, the app shall allow only explicitly configured administrator email addresses to view all requests and verify ledger entries.
- When an administrator changes a record, the app shall record the actor and action in an audit log.

## Architecture

- Frontend: Next.js App Router, custom B B Homes sign-in/register pages, protected `/account` and `/admin` surfaces, responsive forms.
- Authentication: Neon Managed Auth via `@neondatabase/auth`; same-origin API proxy, server-side sessions, and a Next.js 16 `proxy.ts` matcher.
- Database: Neon Postgres queried only from Node server routes/pages using a pooled `DATABASE_URL`; additive SQL migrations use the direct `DATABASE_URL_UNPOOLED`.
- Authorization: customer ownership is enforced in SQL predicates. Super-admin access is checked server-side against `SUPER_ADMIN_EMAILS`; public registration cannot grant roles.
- Business states: customer submissions begin as `pending`; paid checkout and guaranteed reservations are out of scope until fees, refunds, and settlement rules are agreed.

## Security

- Never expose database URLs or the cookie secret to browser bundles.
- Validate request bodies and allowlist request/ledger states on the server.
- Use parameterized SQL for all customer-controlled values.
- Require a valid Neon Auth session on every protected page and API operation; UI route protection is not the authorization boundary.
- Use per-user request limits and write administrator actions to an append-only audit table.

## Implementation Plan

- [ ] Upgrade to the Next.js version required by the supported Neon Auth SDK.
- [ ] Add Neon Auth server/client modules, catch-all API route, middleware, and branded login/register routes.
- [ ] Add additive portal schema, migration runner, and server-side request/admin APIs.
- [ ] Build customer and super-admin portal pages with explicit pending/verified states.
- [ ] Verify production build, database connectivity, Neon Auth proxy reachability, and protected-route behavior.
