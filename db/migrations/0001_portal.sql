CREATE TABLE IF NOT EXISTS portal_customers (
  id text PRIMARY KEY,
  email text NOT NULL,
  display_name text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS portal_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id text NOT NULL REFERENCES portal_customers(id),
  contact_email text NOT NULL,
  request_type text NOT NULL CHECK (
    request_type IN ('viewing', 'rental', 'purchase', 'investment', 'valuation', 'property_submission', 'consultation')
  ),
  listing_slug text,
  details jsonb NOT NULL DEFAULT '{}'::jsonb,
  status text NOT NULL DEFAULT 'pending' CHECK (
    status IN ('pending', 'in_review', 'confirmed', 'completed', 'cancelled', 'rejected')
  ),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS portal_requests_user_created_idx
  ON portal_requests (user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS portal_requests_status_created_idx
  ON portal_requests (status, created_at DESC);

CREATE TABLE IF NOT EXISTS investment_ledger (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id text NOT NULL REFERENCES portal_customers(id),
  transaction_type text NOT NULL CHECK (
    transaction_type IN ('contribution', 'withdrawal', 'return', 'fee')
  ),
  amount numeric(14, 2) NOT NULL CHECK (amount > 0),
  currency text NOT NULL DEFAULT 'GHS' CHECK (currency = 'GHS'),
  reference text NOT NULL,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'verified', 'rejected')),
  recorded_by text NOT NULL,
  verified_by text,
  verified_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS investment_ledger_user_created_idx
  ON investment_ledger (user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS investment_ledger_status_created_idx
  ON investment_ledger (status, created_at DESC);

CREATE TABLE IF NOT EXISTS portal_audit_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_user_id text NOT NULL,
  action text NOT NULL,
  entity_type text NOT NULL,
  entity_id text NOT NULL,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS portal_audit_log_entity_idx
  ON portal_audit_log (entity_type, entity_id, created_at DESC);
