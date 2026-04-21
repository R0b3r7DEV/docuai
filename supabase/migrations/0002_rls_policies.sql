-- DocuAI — Row Level Security
-- Requiere que el JWT de Clerk se configure como auth provider en Supabase

-- ============================================================
-- ACTIVAR RLS
-- ============================================================
ALTER TABLE organizations        ENABLE ROW LEVEL SECURITY;
ALTER TABLE users                ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents            ENABLE ROW LEVEL SECURITY;
ALTER TABLE document_extractions ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages        ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- HELPER: obtener organization_id del usuario autenticado
-- ============================================================
CREATE OR REPLACE FUNCTION get_org_id()
RETURNS UUID AS $$
BEGIN
  RETURN (
    SELECT organization_id FROM users
    WHERE id = auth.uid()::TEXT
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================
-- ORGANIZATIONS
-- ============================================================
CREATE POLICY org_select ON organizations
  FOR SELECT USING (id = get_org_id());

CREATE POLICY org_update ON organizations
  FOR UPDATE USING (id = get_org_id());

-- ============================================================
-- USERS
-- ============================================================
CREATE POLICY users_select ON users
  FOR SELECT USING (organization_id = get_org_id());

CREATE POLICY users_insert ON users
  FOR INSERT WITH CHECK (organization_id = get_org_id());

CREATE POLICY users_update ON users
  FOR UPDATE USING (organization_id = get_org_id());

-- ============================================================
-- DOCUMENTS
-- ============================================================
CREATE POLICY docs_select ON documents
  FOR SELECT USING (organization_id = get_org_id());

CREATE POLICY docs_insert ON documents
  FOR INSERT WITH CHECK (organization_id = get_org_id());

CREATE POLICY docs_update ON documents
  FOR UPDATE USING (organization_id = get_org_id());

-- Solo owner/admin pueden eliminar documentos
CREATE POLICY docs_delete ON documents
  FOR DELETE USING (
    organization_id = get_org_id()
    AND (SELECT role FROM users WHERE id = auth.uid()::TEXT) IN ('owner', 'admin')
  );

-- ============================================================
-- DOCUMENT_EXTRACTIONS (acceso a través de documents)
-- ============================================================
CREATE POLICY extractions_select ON document_extractions
  FOR SELECT USING (
    document_id IN (
      SELECT id FROM documents WHERE organization_id = get_org_id()
    )
  );

CREATE POLICY extractions_insert ON document_extractions
  FOR INSERT WITH CHECK (
    document_id IN (
      SELECT id FROM documents WHERE organization_id = get_org_id()
    )
  );

CREATE POLICY extractions_update ON document_extractions
  FOR UPDATE USING (
    document_id IN (
      SELECT id FROM documents WHERE organization_id = get_org_id()
    )
  );

-- ============================================================
-- CHAT_MESSAGES
-- ============================================================
CREATE POLICY chat_select ON chat_messages
  FOR SELECT USING (organization_id = get_org_id());

CREATE POLICY chat_insert ON chat_messages
  FOR INSERT WITH CHECK (organization_id = get_org_id());
