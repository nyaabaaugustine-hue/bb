# Feature: Customer dashboard

## Requirements (EARS Format)

- While a customer is signed in, when they open `/account`, the system shall show their current requests, next action, and recent account activity.
- While a customer is signed in, when they navigate the dashboard, the system shall offer phase-one links for overview, enquiries, saved homes, messages, documents, and profile.
- While a customer is using a phone, the dashboard shall provide a fixed bottom navigation for overview, messages, documents, read-only payments, and more.
- While a customer is not signed in, when they request any dashboard route, the system shall redirect them to sign in and preserve the requested internal destination.
- The dashboard shall not claim to support payments, document uploads, or a unified agent inbox before those services are implemented.

## Architecture

### Frontend

- Add a shared responsive portal shell with a desktop sidebar, support links, and mobile bottom navigation.
- Keep the existing account overview and request creation workflow.
- Add enquiry, saved-home, message, document, profile, payments, and "more" routes with explicit working states.
- Saved homes are per-customer records, synchronized through authenticated API routes.

### Backend

- Add a `customer_saved_homes` table keyed to the authenticated portal customer.
- Add authenticated `GET`, `POST`, and `DELETE` operations under `/api/portal/saved-homes`.
- Validate every requested listing slug against the server's published listing catalog.
- Use parameterized queries and return only the current customer's records.

### Security

- Dashboard routes remain behind Neon Auth middleware and server-side session checks.
- API operations derive customer identity only from the verified Neon Auth session.
- Same-origin checks protect mutations; request payloads have strict size/shape constraints and listing IDs are allowlisted.
- No payment execution, file upload, document URL, agent-message data, or cross-customer data is exposed.
- RBAC roles are `administrator`, `staff`, and `customer`; verified bootstrap administrators from `SUPER_ADMIN_EMAILS` always receive the highest role.
- Staff can review/update customer requests but cannot view or mutate financial ledger records or manage roles. Administrators can manage roles and financial records. Role changes are audited and cannot remove the last database-backed administrator.
- Customer registrations always have the customer role unless an administrator explicitly changes it.

## Implementation Plan

- [x] Add the customer-scoped saved homes migration and authenticated API.
- [x] Add the responsive dashboard shell and phase-one navigation.
- [x] Implement enquiry, saved homes, message, document, profile, payment, and more views.
- [x] Preserve the existing request workflow and make the payment view strictly read-only.
- [x] Add server-enforced RBAC, administrator role management, and test-user seeding.
- [x] Run type checks, production build, and unauthenticated route/API smoke tests.
