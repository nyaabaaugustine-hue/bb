-- Customer profile details used when the team follows up.
ALTER TABLE portal_customers ADD COLUMN IF NOT EXISTS phone text;

-- Staff ownership of requests, internal notes, and the moment a customer cancelled.
ALTER TABLE portal_requests ADD COLUMN IF NOT EXISTS assigned_to text REFERENCES portal_customers(id) ON DELETE SET NULL;
ALTER TABLE portal_requests ADD COLUMN IF NOT EXISTS staff_note text;
ALTER TABLE portal_requests ADD COLUMN IF NOT EXISTS cancelled_at timestamptz;

CREATE INDEX IF NOT EXISTS portal_requests_created_idx
  ON portal_requests (created_at DESC);
CREATE INDEX IF NOT EXISTS portal_requests_assigned_idx
  ON portal_requests (assigned_to, status, created_at DESC);
CREATE INDEX IF NOT EXISTS portal_requests_open_idx
  ON portal_requests (status, created_at DESC)
  WHERE status IN ('pending', 'in_review', 'confirmed');

-- Public enquiries previously existed only in server logs.
CREATE SEQUENCE IF NOT EXISTS portal_enquiry_reference_seq;

CREATE TABLE IF NOT EXISTS portal_enquiries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  reference text NOT NULL UNIQUE,
  name text NOT NULL,
  phone text NOT NULL,
  email text,
  channel text NOT NULL DEFAULT 'whatsapp' CHECK (channel IN ('whatsapp', 'phone', 'email')),
  category text NOT NULL DEFAULT 'enquiry' CHECK (category IN ('enquiry', 'service', 'quote')),
  subject text NOT NULL,
  message text,
  status text NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'contacted', 'closed')),
  handled_by text REFERENCES portal_customers(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS portal_enquiries_status_created_idx
  ON portal_enquiries (status, created_at DESC);
CREATE INDEX IF NOT EXISTS portal_enquiries_created_idx
  ON portal_enquiries (created_at DESC);

-- Newsletter sign-ups previously existed only in server logs.
CREATE TABLE IF NOT EXISTS newsletter_subscribers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL UNIQUE,
  phone text,
  status text NOT NULL DEFAULT 'subscribed' CHECK (status IN ('subscribed', 'unsubscribed')),
  source text NOT NULL DEFAULT 'website',
  consented_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS newsletter_subscribers_created_idx
  ON newsletter_subscribers (created_at DESC);
