-- Lexia — Whitelabel + Rebrand
-- Crea la tabla whitelabel_configs y extiende organizations para los planes white-label

-- 1. Crear plan_type si no existe, luego añadir valores whitelabel
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'plan_type') THEN
    CREATE TYPE plan_type AS ENUM (
      'free', 'pro', 'enterprise',
      'trial',
      'gestoria', 'gestoria_pro',
      'whitelabel', 'whitelabel_pro'
    );
  END IF;
END$$;

-- Añadir valores individualmente por si el tipo ya existía sin ellos
DO $$ BEGIN ALTER TYPE plan_type ADD VALUE IF NOT EXISTS 'trial';        EXCEPTION WHEN others THEN NULL; END$$;
DO $$ BEGIN ALTER TYPE plan_type ADD VALUE IF NOT EXISTS 'gestoria';     EXCEPTION WHEN others THEN NULL; END$$;
DO $$ BEGIN ALTER TYPE plan_type ADD VALUE IF NOT EXISTS 'gestoria_pro'; EXCEPTION WHEN others THEN NULL; END$$;
DO $$ BEGIN ALTER TYPE plan_type ADD VALUE IF NOT EXISTS 'whitelabel';   EXCEPTION WHEN others THEN NULL; END$$;
DO $$ BEGIN ALTER TYPE plan_type ADD VALUE IF NOT EXISTS 'whitelabel_pro'; EXCEPTION WHEN others THEN NULL; END$$;

-- 2. Añadir columna gestoria_name a organizations (nombre de la gestoría que gestiona la empresa)
ALTER TABLE organizations
  ADD COLUMN IF NOT EXISTS gestoria_name text;

-- 3. Crear tabla whitelabel_configs
CREATE TABLE IF NOT EXISTS whitelabel_configs (
  id                   uuid        PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id      uuid        NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  brand_name           text        NOT NULL DEFAULT 'Mi Marca',
  brand_logo_url       text,
  brand_favicon_url    text,
  primary_color        text        NOT NULL DEFAULT '#1D9E75',
  primary_dark         text        NOT NULL DEFAULT '#085041',
  custom_domain        text        UNIQUE,
  support_email        text,
  hide_brand           boolean     NOT NULL DEFAULT false,
  custom_login_message text,
  custom_footer_text   text,
  max_clients          integer     NOT NULL DEFAULT 100,
  created_at           timestamptz NOT NULL DEFAULT now(),
  updated_at           timestamptz NOT NULL DEFAULT now(),
  UNIQUE(organization_id)
);

CREATE INDEX IF NOT EXISTS idx_whitelabel_configs_org    ON whitelabel_configs(organization_id);
CREATE INDEX IF NOT EXISTS idx_whitelabel_configs_domain ON whitelabel_configs(custom_domain);

-- 4. Si la tabla existía con la columna antigua, renombrarla
--    (seguro: no hace nada si la columna ya se llama hide_brand o no existe)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'whitelabel_configs'
      AND column_name = 'hide_docuai_branding'
  ) THEN
    ALTER TABLE whitelabel_configs RENAME COLUMN hide_docuai_branding TO hide_brand;
  END IF;
END $$;

-- 5. RLS para whitelabel_configs
ALTER TABLE whitelabel_configs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "wl_select_own"  ON whitelabel_configs;
DROP POLICY IF EXISTS "wl_insert_own"  ON whitelabel_configs;
DROP POLICY IF EXISTS "wl_update_own"  ON whitelabel_configs;
DROP POLICY IF EXISTS "wl_delete_own"  ON whitelabel_configs;

CREATE POLICY "wl_select_own"
  ON whitelabel_configs FOR SELECT
  USING (
    organization_id IN (
      SELECT organization_id FROM users WHERE id = auth.uid()::text
    )
  );

CREATE POLICY "wl_insert_own"
  ON whitelabel_configs FOR INSERT
  WITH CHECK (
    organization_id IN (
      SELECT organization_id FROM users WHERE id = auth.uid()::text
    )
  );

CREATE POLICY "wl_update_own"
  ON whitelabel_configs FOR UPDATE
  USING (
    organization_id IN (
      SELECT organization_id FROM users WHERE id = auth.uid()::text
    )
  );

CREATE POLICY "wl_delete_own"
  ON whitelabel_configs FOR DELETE
  USING (
    organization_id IN (
      SELECT organization_id FROM users WHERE id = auth.uid()::text
    )
  );
