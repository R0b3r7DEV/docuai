-- ─── Gestoría mode migration ──────────────────────────────────────────────────

-- 1. Extend plan_type enum
ALTER TYPE plan_type ADD VALUE IF NOT EXISTS 'gestoria';
ALTER TYPE plan_type ADD VALUE IF NOT EXISTS 'gestoria_pro';

-- 2. Org type enum
DO $$ BEGIN
  CREATE TYPE org_type AS ENUM ('empresa', 'gestoria');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- 3. Extend organizations table
ALTER TABLE organizations
  ADD COLUMN IF NOT EXISTS org_type      org_type NOT NULL DEFAULT 'empresa',
  ADD COLUMN IF NOT EXISTS gestoria_id   uuid     REFERENCES organizations(id),
  ADD COLUMN IF NOT EXISTS client_count  integer  NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS max_clients   integer  NOT NULL DEFAULT 0;

-- 4. gestoria_clients junction table
CREATE TABLE IF NOT EXISTS gestoria_clients (
  id            uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  gestoria_id   uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  client_org_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  invited_by    text NOT NULL REFERENCES users(id),
  status        text NOT NULL DEFAULT 'active',
  created_at    timestamptz NOT NULL DEFAULT now(),
  UNIQUE(gestoria_id, client_org_id)
);

CREATE INDEX IF NOT EXISTS idx_gestoria_clients_gestoria ON gestoria_clients(gestoria_id);
CREATE INDEX IF NOT EXISTS idx_gestoria_clients_client   ON gestoria_clients(client_org_id);

-- 5. client_invitations table
CREATE TABLE IF NOT EXISTS client_invitations (
  id           uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  gestoria_id  uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  email        text NOT NULL,
  company_name text NOT NULL,
  token        text NOT NULL UNIQUE DEFAULT encode(gen_random_bytes(32), 'hex'),
  status       text NOT NULL DEFAULT 'pending',
  expires_at   timestamptz NOT NULL DEFAULT now() + interval '7 days',
  created_at   timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_client_invitations_gestoria ON client_invitations(gestoria_id);
CREATE INDEX IF NOT EXISTS idx_client_invitations_token    ON client_invitations(token);

-- 6. session_tokens table (for impersonation)
CREATE TABLE IF NOT EXISTS session_tokens (
  id         uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  token      text NOT NULL UNIQUE,
  gestoria_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  client_org_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  created_by text NOT NULL REFERENCES users(id),
  expires_at timestamptz NOT NULL DEFAULT now() + interval '1 hour',
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_session_tokens_token ON session_tokens(token);

-- 7. RLS for gestoria_clients
ALTER TABLE gestoria_clients ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "gestoria_clients_select" ON gestoria_clients;
CREATE POLICY "gestoria_clients_select"
  ON gestoria_clients FOR SELECT
  USING (
    gestoria_id IN (
      SELECT organization_id FROM users WHERE id = auth.uid()::text
    )
  );

-- 8. RLS for client_invitations
ALTER TABLE client_invitations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "invitations_select_own" ON client_invitations;
CREATE POLICY "invitations_select_own"
  ON client_invitations FOR SELECT
  USING (
    gestoria_id IN (
      SELECT organization_id FROM users WHERE id = auth.uid()::text
    )
  );

-- 9. Function to update client_count on organizations
CREATE OR REPLACE FUNCTION update_gestoria_client_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE organizations SET client_count = client_count + 1
    WHERE id = NEW.gestoria_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE organizations SET client_count = GREATEST(client_count - 1, 0)
    WHERE id = OLD.gestoria_id;
  END IF;
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_gestoria_client_count ON gestoria_clients;
CREATE TRIGGER trg_gestoria_client_count
  AFTER INSERT OR DELETE ON gestoria_clients
  FOR EACH ROW EXECUTE FUNCTION update_gestoria_client_count();
