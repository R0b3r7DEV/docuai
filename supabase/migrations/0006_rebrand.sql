-- Lexia — Rebrand desde DocuAI
-- Nota: los nombres de tablas no cambian por compatibilidad con RLS y foreign keys existentes
-- Solo actualizamos el schema de configuración white-label

-- Renombrar columna hide_docuai_branding → hide_brand en whitelabel_configs
ALTER TABLE whitelabel_configs
  RENAME COLUMN hide_docuai_branding TO hide_brand;
