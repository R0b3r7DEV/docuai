// Tipos que reflejan el schema de Supabase — actualizar tras cambios en migraciones

export type OrgPlan = 'trial' | 'free' | 'pro' | 'enterprise'
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

export interface Organization {
  id: string
  name: string
  slug: string
  plan: OrgPlan
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
