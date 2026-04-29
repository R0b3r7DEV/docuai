// Tipos que reflejan el schema de Supabase — actualizar tras cambios en migraciones

export type OrgPlan = 'trial' | 'free' | 'pro' | 'gestoria' | 'gestoria_pro' | 'whitelabel' | 'whitelabel_pro' | 'enterprise'
export type OrgType = 'empresa' | 'gestoria'
export type SubscriptionStatus = 'trialing' | 'active' | 'past_due' | 'canceled' | 'incomplete'
export type UserRole = 'owner' | 'admin' | 'member'
export type DocumentStatus = 'pending' | 'processing' | 'done' | 'error'
export type ExtractionType =
  | 'factura'
  | 'presupuesto'
  | 'nomina'
  | 'contrato'
  | 'albaran'
  | 'extracto_bancario'
  | 'balance'
  | 'otro'
export type ExtractionCategory =
  | 'suministros'
  | 'servicios'
  | 'personal'
  | 'alquiler'
  | 'material'
  | 'impuestos'
  | 'otro'
export type MessageRole = 'user' | 'assistant'
export type InvitationStatus = 'pending' | 'accepted' | 'expired' | 'canceled'
export type GestoriaClientStatus = 'active' | 'inactive'

export interface Organization {
  id: string
  name: string
  slug: string
  plan: OrgPlan
  org_type: OrgType
  gestoria_id: string | null
  client_count: number
  max_clients: number
  // Stripe billing fields
  stripe_customer_id: string | null
  stripe_subscription_id: string | null
  subscription_status: SubscriptionStatus
  trial_docs_used: number
  current_period_end: string | null
  created_at: string
  updated_at: string
}

export interface User {
  id: string // Clerk user_id
  email: string
  full_name: string | null
  organization_id: string
  role: UserRole
  created_at: string
  updated_at: string
}

export interface Document {
  id: string
  organization_id: string
  uploaded_by: string
  filename: string
  storage_path: string
  mime_type: string
  size_bytes: number
  status: DocumentStatus
  raw_text: string | null
  error_message: string | null
  created_at: string
  updated_at: string
}

export interface DocumentExtraction {
  id: string
  document_id: string
  type: ExtractionType
  issue_date: string | null
  vendor: string | null
  concept: string | null
  amount: number | null
  currency: string
  category: ExtractionCategory
  raw_json: Record<string, unknown>
  confidence_score: number | null
  ocr_used: boolean
  ocr_confidence: number | null
  created_at: string
  updated_at: string
}

export interface ChatMessage {
  id: string
  organization_id: string
  user_id: string
  role: MessageRole
  content: string
  context_doc_ids: string[] | null
  created_at: string
}

export interface DocumentWithExtraction extends Document {
  extraction: DocumentExtraction | null
}

export interface GestoriaClient {
  id: string
  gestoria_id: string
  client_org_id: string
  invited_by: string
  status: GestoriaClientStatus
  created_at: string
  organization: Organization
}

export interface ClientInvitation {
  id: string
  gestoria_id: string
  email: string
  company_name: string
  token: string
  status: InvitationStatus
  expires_at: string
  created_at: string
}

export interface GestoriaClientStats {
  client_org_id: string
  name: string
  slug: string
  docs_this_month: number
  docs_total: number
  last_doc_date: string | null
  status: GestoriaClientStatus
}

export interface GestoriaPlan {
  maxClients: number  // -1 = unlimited
  price: number
  docsPerClientPerMonth: number
}

export interface WhitelabelConfig {
  id: string
  organization_id: string
  brand_name: string
  brand_logo_url: string | null
  brand_favicon_url: string | null
  primary_color: string
  primary_dark: string
  custom_domain: string | null
  support_email: string | null
  hide_brand: boolean
  custom_login_message: string | null
  custom_footer_text: string | null
  max_clients: number
  created_at: string
  updated_at: string
}

export interface WhitelabelContext {
  config: WhitelabelConfig | null
  isWhitelabel: boolean
}
