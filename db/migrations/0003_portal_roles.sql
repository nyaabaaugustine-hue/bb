CREATE TABLE IF NOT EXISTS portal_user_roles (
  user_id text PRIMARY KEY,
  role text NOT NULL CHECK (role IN ('administrator', 'staff', 'customer')),
  assigned_by text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS portal_user_roles_role_idx
  ON portal_user_roles (role);
