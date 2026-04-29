-- Lexia — Schema inicial
-- Ejecutar en Supabase SQL Editor o via CLI: supabase db push

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- ENUMS
-- ============================================================
CREATE TYPE org_plan AS ENUM ('free', 'pro', 'enterprise');
CREATE TYPE user_role AS ENUM ('owner', 'admin', 'member');
CREATE TYPE document_status AS ENUM ('pending', 'processing', 'done', 'error');
CREATE TYPE extraction_type AS ENUM (
  'factura', 'presupuesto', 'nomina', 'contrato',
  'albaran', 'extracto_bancario', 'balance', 'otro'
);
CREATE TYPE extraction_category AS ENUM (
  'suministros', 'servicios', 'personal', 'alquiler',
  'material', 'impuestos', 'otro'
);
CREATE TYPE message_role AS ENUM ('user', 'assistant');

-- ============================================================
-- ORGANIZATIONS
-- ============================================================
CREATE TABLE organizations (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name       TEXT NOT NULL,
  slug       TEXT NOT NULL UNIQUE,
  plan       org_plan NOT NULL DEFAULT 'free',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_organizations_slug ON organizations(slug);

-- ============================================================
-- USERS
-- ============================================================
CREATE TABLE users (
  id              TEXT PRIMARY KEY, -- Clerk user_id
  email           TEXT NOT NULL UNIQUE,
  full_name       TEXT,
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  role            user_role NOT NULL DEFAULT 'member',
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_users_organization_id ON users(organization_id);
CREATE INDEX idx_users_email ON users(email);

-- ============================================================
-- DOCUMENTS
-- ============================================================
CREATE TABLE documents (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  uploaded_by     TEXT NOT NULL REFERENCES users(id) ON DELETE SET NULL,
  filename        TEXT NOT NULL,
  storage_path    TEXT NOT NULL,
  mime_type       TEXT NOT NULL,
  size_bytes      BIGINT NOT NULL,
  status          document_status NOT NULL DEFAULT 'pending',
  raw_text        TEXT,
  error_message   TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_documents_organization_id ON documents(organization_id);
CREATE INDEX idx_documents_uploaded_by ON documents(uploaded_by);
CREATE INDEX idx_documents_status ON documents(status);
CREATE INDEX idx_documents_created_at ON documents(created_at DESC);

-- ============================================================
-- DOCUMENT_EXTRACTIONS
-- ============================================================
CREATE TABLE document_extractions (
  id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  document_id      UUID NOT NULL UNIQUE REFERENCES documents(id) ON DELETE CASCADE,
  type             extraction_type NOT NULL DEFAULT 'otro',
  issue_date       DATE,
  vendor           TEXT,
  concept          TEXT,
  amount           NUMERIC(12, 2),
  currency         CHAR(3) NOT NULL DEFAULT 'EUR',
  category         extraction_category NOT NULL DEFAULT 'otro',
  raw_json         JSONB NOT NULL,
  confidence_score FLOAT CHECK (confidence_score BETWEEN 0 AND 1),
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_extractions_document_id ON document_extractions(document_id);
CREATE INDEX idx_extractions_type ON document_extractions(type);
CREATE INDEX idx_extractions_category ON document_extractions(category);
CREATE INDEX idx_extractions_issue_date ON document_extractions(issue_date DESC);
CREATE INDEX idx_extractions_vendor ON document_extractions(vendor);
CREATE INDEX idx_extractions_raw_json ON document_extractions USING GIN(raw_json);

-- ============================================================
-- CHAT_MESSAGES
-- ============================================================
CREATE TABLE chat_messages (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  user_id         TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  role            message_role NOT NULL,
  content         TEXT NOT NULL,
  context_doc_ids UUID[],
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_chat_organization_id ON chat_messages(organization_id);
CREATE INDEX idx_chat_user_id ON chat_messages(user_id);
CREATE INDEX idx_chat_created_at ON chat_messages(created_at DESC);

-- ============================================================
-- TRIGGER: auto-actualizar updated_at
-- ============================================================
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_organizations_updated_at
  BEFORE UPDATE ON organizations FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trg_users_updated_at
  BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trg_documents_updated_at
  BEFORE UPDATE ON documents FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trg_extractions_updated_at
  BEFORE UPDATE ON document_extractions FOR EACH ROW EXECUTE FUNCTION update_updated_at();
