# B B Homes website
Next.js 16 · TypeScript · Tailwind. Run: `npm install && npm run dev`.
Set `NEXT_PUBLIC_SITE_URL`, `NEXT_PUBLIC_EMAIL` and `NEXT_PUBLIC_CLOUDINARY_CLOUD` in `.env.local`. The WhatsApp number is `WA` in `lib/data.ts` (international format, no `+`).

## News & stories
- The `/blog` index and pre-rendered `/blog/[slug]` guides use entries in `lib/blog.ts`.

## Customer portal and Neon
- `/auth`, `/login`, and `/register` use Neon Managed Auth. `/account` is the signed-in customer area with a responsive dashboard, enquiries, saved homes, and a read-only payment record view. `/admin` uses database-backed RBAC: administrators have the highest access and can manage roles and financial records; staff can review customer requests; customers can access only their own records.
- `neon.ts` declares Postgres and Managed Auth. Run `neon deploy` after changing the policy. Neon CLI stores local connection settings in `.env.local`; never commit that file.
- Set `NEON_AUTH_COOKIE_SECRET` to a unique random value of at least 32 characters and set `SUPER_ADMIN_EMAILS` to the verified administrator bootstrap email(s). These accounts always have the highest access and are managed through deployment secrets, not the role editor. Add the same required server environment variables to the hosting provider.
- Run `npm run db:migrate` to apply the additive SQL migrations. Schema changes use `DATABASE_URL_UNPOOLED` when available.
- To create development/staging login accounts for all roles, configure `TEST_USERS_ENABLED=true`, `TEST_USERS_TARGET=development` or `staging`, `TEST_USERS_CONFIRM_BRANCH` to exactly match `NEON_BRANCH`, and the `TEST_ADMIN_*`, `TEST_STAFF_*`, and `TEST_CUSTOMER_*` email/password variables in a private environment file. Include `TEST_ADMIN_EMAIL` in `SUPER_ADMIN_EMAILS`. Use distinct passwords of at least 12 characters. After applying migrations, run `npm run db:seed:test-users`; the script refuses production mode and common production branch names, and never prints passwords. Complete email verification if the branch requires it.
- Customer appointments, property submissions and valuation requests begin as pending requests. The portal does not take payments or promise reservations; ledger entries must be manually verified by a super admin.
- Dashboard saved homes are customer-scoped. The messages and documents pages are informational until secure inbox and file-storage services are integrated; do not upload sensitive files through the dashboard.

## Placeholder (replace before launch)
- `lib/data.ts`: sample listings, prices, materials. Move to Neon + Drizzle or a headless CMS.
- Photos, logo, real copy. Keep `/privacy` and `/terms` under review with a lawyer.
- Public enquiries and deal-alert signups are written to `portal_enquiries` and `newsletter_subscribers`; there is no email delivery worker yet. Send team notifications and confirmation emails before launch.

## Next
- Replace sample catalogue data with verified availability, pricing, ownership documents and property-management workflows.
- Add payment-provider integration only after Mobile Money settlement, refund and reservation-expiry rules are agreed.
