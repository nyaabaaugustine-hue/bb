CREATE TABLE IF NOT EXISTS customer_saved_homes (
  user_id text NOT NULL REFERENCES portal_customers(id) ON DELETE CASCADE,
  listing_slug text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, listing_slug)
);

CREATE INDEX IF NOT EXISTS customer_saved_homes_user_created_idx
  ON customer_saved_homes (user_id, created_at DESC);
