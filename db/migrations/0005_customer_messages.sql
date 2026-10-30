-- Customer contact preferences shown on the profile page and used when the
-- team follows up. Empty values mean "not stated yet".
ALTER TABLE portal_customers ADD COLUMN IF NOT EXISTS preferred_channel text;
ALTER TABLE portal_customers ADD COLUMN IF NOT EXISTS preferred_zone text;
ALTER TABLE portal_customers ADD COLUMN IF NOT EXISTS budget_min numeric(14, 2);
ALTER TABLE portal_customers ADD COLUMN IF NOT EXISTS budget_max numeric(14, 2);
ALTER TABLE portal_customers ADD COLUMN IF NOT EXISTS marketing_opt_in boolean NOT NULL DEFAULT false;

-- Two-way account messages. Customer messages and team replies share one
-- thread per customer; read_at marks the message read by its recipient.
CREATE TABLE IF NOT EXISTS portal_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id text NOT NULL REFERENCES portal_customers(id) ON DELETE CASCADE,
  request_id uuid REFERENCES portal_requests(id) ON DELETE SET NULL,
  author_id text REFERENCES portal_customers(id) ON DELETE SET NULL,
  author_role text NOT NULL CHECK (author_role IN ('customer', 'team')),
  body text NOT NULL CHECK (char_length(body) BETWEEN 1 AND 4000),
  read_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS portal_messages_user_created_idx
  ON portal_messages (user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS portal_messages_unread_idx
  ON portal_messages (user_id, author_role)
  WHERE read_at IS NULL;
