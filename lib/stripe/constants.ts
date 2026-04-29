export const TRIAL_DOC_LIMIT = 2
export const PRO_DOC_LIMIT = 20
export const GESTORIA_MAX_CLIENTS = 50
export const GESTORIA_PRO_MAX_CLIENTS = -1  // unlimited
export const GESTORIA_DOCS_PER_CLIENT = 20

// Single source of truth for all plan prices (€/month)
export const PLAN_PRICES = {
  pro:            10,
  gestoria:       49,
  gestoria_pro:   99,
  whitelabel:    299,
  whitelabel_pro: 599,
} as const

export type PlanId = keyof typeof PLAN_PRICES
