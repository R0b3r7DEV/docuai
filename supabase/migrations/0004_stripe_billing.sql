-- Migration 0004: Stripe billing fields + trial plan

-- Add 'trial' value to the plan enum
-- (Supabase/Postgres requires ADD VALUE for existing enums)
DO $$
BEGIN
  ALTER TYPE plan_type ADD VALUE IF NOT EXISTS 'trial';
EXCEPTION WHEN others THEN NULL;
END$$;

-- Stripe and subscription fields on organizations
ALTER TABLE organizations
  ADD COLUMN IF NOT EXISTS stripe_customer_id      text UNIQUE,
  ADD COLUMN IF NOT EXISTS stripe_subscription_id  text UNIQUE,
  ADD COLUMN IF NOT EXISTS subscription_status     text NOT NULL DEFAULT 'trialing',
  ADD COLUMN IF NOT EXISTS trial_docs_used         integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS current_period_end      timestamptz;

-- View: monthly document usage per org (done documents only)
CREATE OR REPLACE VIEW monthly_doc_usage AS
SELECT
  organization_id,
  COUNT(*) AS docs_this_month
FROM documents
WHERE
  status = 'done'
  AND created_at >= date_trunc('month', now())
GROUP BY organization_id;
