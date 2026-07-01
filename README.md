# Lexia — AI-Powered Document Management for SMBs

> Upload an invoice. In ~10 seconds you get every field extracted, classified and ready to analyze.

**Lexia** is a multi-tenant **SaaS platform** that uses AI to automate document management for small and medium businesses, freelancers and accounting firms (*gestorías*) that still process invoices and contracts by hand.

<p>
  <img alt="Next.js" src="https://img.shields.io/badge/Next.js_16-000000?style=flat&logo=next.js&logoColor=white" />
  <img alt="React" src="https://img.shields.io/badge/React_19-20232A?style=flat&logo=react&logoColor=61DAFB" />
  <img alt="TypeScript" src="https://img.shields.io/badge/TypeScript-3178C6?style=flat&logo=typescript&logoColor=white" />
  <img alt="Tailwind CSS" src="https://img.shields.io/badge/Tailwind_v4-38BDF8?style=flat&logo=tailwindcss&logoColor=white" />
  <img alt="Supabase" src="https://img.shields.io/badge/Supabase-3ECF8E?style=flat&logo=supabase&logoColor=white" />
  <img alt="Claude" src="https://img.shields.io/badge/Claude_AI-D97757?style=flat&logo=anthropic&logoColor=white" />
  <img alt="Stripe" src="https://img.shields.io/badge/Stripe-635BFF?style=flat&logo=stripe&logoColor=white" />
  <img alt="Clerk" src="https://img.shields.io/badge/Clerk-6C47FF?style=flat&logo=clerk&logoColor=white" />
  <img alt="Inngest" src="https://img.shields.io/badge/Inngest-000000?style=flat&logo=inngest&logoColor=white" />
  <img alt="Sentry" src="https://img.shields.io/badge/Sentry-362D59?style=flat&logo=sentry&logoColor=white" />
  <img alt="Vitest" src="https://img.shields.io/badge/Vitest-6E9F18?style=flat&logo=vitest&logoColor=white" />
</p>

<p>
  <a href="https://docuai-one.vercel.app/"><img alt="Live demo" src="https://img.shields.io/badge/🚀_Live_demo-docuai--one.vercel.app-000000?style=for-the-badge&logo=vercel&logoColor=white" /></a>
</p>

🌐 **Live demo:** [docuai-one.vercel.app](https://docuai-one.vercel.app/) &nbsp;·&nbsp; 🇪🇸 *A Spanish version of this document is available on request.*

<!-- TODO: screenshot — dashboard with expense charts -->

---

## The problem it solves

A typical SMB receives dozens of invoices a month as PDFs or scanned paper. Someone has to open them one by one and copy the supplier, amount, date and VAT into a spreadsheet. It is tedious, error-prone and eats hours of work every week.

**Lexia removes that process.** You upload the document and the AI does the rest — extraction, classification and a natural-language chat on top of your data.

---

## Key features

- **Automatic data extraction** — reads PDFs and images and extracts supplier, amount, date, VAT, document type and expense category as structured JSON (Claude AI).
- **OCR for scanned documents** — Tesseract.js with a Sharp preprocessing step (grayscale, contrast, sharpening) so it works even on poor-quality scans.
- **AI chat over your documents** — answer natural-language questions such as *"How much did I spend on electricity this quarter?"* against your stored data.
- **Metrics dashboard** — monthly expense charts, most frequent suppliers and trends (Recharts).
- **One-click Excel export** — download filtered documents as `.xlsx`.
- **Accounting-firm mode (*gestoría*)** — manage multiple client companies from a single centralized panel, with per-client impersonation.
- **White-label** — firms can serve the whole platform under their own brand, colors and custom domain.
- **Asynchronous processing** — OCR + AI run as background jobs (Inngest), so the UI never blocks; failed extractions can be re-run with one click.
- **Transactional emails** — welcome, document processed, limit reached and client invitations (Resend).
- **Guided onboarding** — a 3-step checklist to get new users productive in minutes.

## Security & compliance

- **Multi-tenant isolation** via PostgreSQL Row Level Security — an organization can never read another's data.
- **File validation by magic bytes** — verifies the real file content, not just the extension.
- **Rate limiting** — 10 uploads/min and 20 chat messages/min per user (HTTP 429).
- **GDPR** — right to erasure (art. 17) endpoint that deletes all user data and the Clerk account; real privacy policy and terms pages; cookie-consent banner.
- **Error monitoring** — Sentry on client and server, ignoring expected 4xx errors.
- **Security headers** — X-Frame-Options, X-Content-Type-Options, Referrer-Policy, Permissions-Policy.

---

## Tech stack

| Layer | Technologies |
|---|---|
| **Frontend** | Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS v4, Radix UI, Framer Motion, Recharts |
| **Backend** | Next.js Route Handlers, Supabase (PostgreSQL + Storage), Zod |
| **AI / OCR** | Anthropic Claude, Tesseract.js, Sharp |
| **Auth & billing** | Clerk (auth), Stripe (subscriptions & billing portal) |
| **Async & email** | Inngest (background jobs), Resend (transactional email) |
| **Ops & quality** | Sentry, Vitest, GitHub Actions (CI), Vercel |

---

## How an invoice flows through the system

```
Upload (PDF/image)
   │  rate limit + magic-byte validation
   ▼
Supabase Storage ──► Inngest job (lexia/document.uploaded)
                          │
                          ├─ image? ─► Tesseract OCR (Sharp preprocess)
                          ▼
                     Claude AI ─► structured JSON (supplier, amount, VAT, ...)
                          ▼
              document_extractions (Postgres) ─► email notification
                          ▼
                 User sees the result · retry on failure
```

---

## Getting started

Requirements: **Node.js 24** and **pnpm 10** (the versions used in CI).

```bash
pnpm install                 # install dependencies
cp .env.example .env.local   # fill in your keys (see below)
pnpm inngest:dev             # start the local Inngest server (background jobs)
pnpm dev                     # start the app on http://localhost:3000
```

Useful scripts (from `package.json`):

```bash
pnpm build            # production build (also type-checks)
pnpm test             # unit + integration tests (Vitest)
pnpm test:coverage    # coverage report
pnpm test:ocr         # exercise the OCR pipeline
pnpm test:extractor   # exercise the document extractor
```

Minimum environment variables (full list in `.env.example`): `ANTHROPIC_API_KEY`, the three `SUPABASE` keys, the `CLERK` keys, the `STRIPE` keys, `RESEND_API_KEY` and the `INNGEST` keys. Sentry variables are optional in local development.

> **Note:** to run OCR you must upload `spa.traineddata` and `eng.traineddata` to a public `traineddata` bucket in Supabase Storage.

---

## Project structure

```
app/
├── (app)/            # authenticated area: dashboard, documents, chat, settings,
│                     #   gestoria/ (client management), settings/whitelabel/
├── (auth)/           # Clerk sign-in / sign-up
├── (legal)/          # GDPR privacy policy & terms
└── api/              # REST route handlers
    ├── documents/    #   CRUD, upload, [id]/retry (re-run a failed extraction)
    ├── chat/         #   AI chat with history
    ├── stripe/       #   checkout & billing portal
    ├── gestoria/     #   client management + impersonation
    ├── whitelabel/   #   branding & custom-domain config
    └── webhooks/     #   Clerk · Stripe · Inngest
lib/
├── claude/           # AI extractor, prompts, output schemas
├── ocr/              # preprocess → extractor → index
├── stripe/           # PLAN_PRICES (single source of truth) + plan limits
├── whitelabel/       # domain resolver + theme context
└── utils/            # rate limiter, auth, error handling, Excel export, validators
inngest/functions/    # processDocument (OCR + AI + email), monthlySummary
supabase/migrations/  # schema, RLS policies, billing, gestoria, rebrand
tests/                # unit (Claude extractor) + integration (documents & chat APIs)
```

### Core data model

`organizations` · `users` · `documents` (pending → processing → done/error) · `document_extractions` · `chat_messages` · `whitelabel_configs`. Every table is protected by Row Level Security.

---

## What I learned building this

- Designing a **secure multi-tenant SaaS** where data isolation is enforced at the database layer (RLS), not just in application code.
- Building a resilient **async pipeline** (upload → OCR → AI → notify) with a job runner, so a slow AI call never blocks the UI and failures are recoverable.
- Integrating a real **billing system** end to end: Stripe checkout, subscription plans, usage limits and a webhook-driven state machine.
- Taking a product to **production-grade quality**: CI, tests, error monitoring, GDPR compliance and security headers — not just a happy-path demo.
- Modeling a real business domain (**invoicing for SMBs and accounting firms**), combining my software background with my finance/accounting training.

---

## License

Private project. All rights reserved.
