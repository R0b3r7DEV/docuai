# DocuAI

**Plataforma SaaS de gestión documental inteligente con IA** — extrae, clasifica y analiza facturas, contratos y documentos de empresa de forma automática.

---

## Demo en vivo

[docuai.es](https://docuai.es)

---

## Stack tecnológico

| Capa | Tecnología |
|------|-----------|
| Framework | Next.js 16 (App Router + Turbopack) |
| Lenguaje | TypeScript 5 |
| Base de datos | Supabase (PostgreSQL + RLS) |
| Almacenamiento | Supabase Storage |
| Autenticación | Clerk (OAuth, Email/Password) |
| Pagos | Stripe (subscriptions + webhooks) |
| IA | Anthropic Claude claude-sonnet-4-6 |
| Cola de tareas | Inngest (background jobs + cron) |
| Email | Resend |
| UI | Tailwind CSS + shadcn/ui |
| Gráficas | Recharts |
| Deploy | Vercel |

---

## Funcionalidades principales

### Extracción de documentos con IA
- Soporte para PDF, PNG, JPEG, WEBP y texto plano
- Extracción de campos: tipo, proveedor, fecha, importe, divisa, categoría
- PDF grandes (>4 MB) → procesado con `pdf-parse` antes de enviar a Claude
- Pipeline asíncrono con Inngest: `pending → processing → done | error`

### Sistema multi-tenant
- Aislamiento completo por `organization_id` con Supabase RLS
- Cada usuario tiene su propia organización con plan y límites
- Invitaciones por email con token seguro (24h TTL)

### Planes y pagos (Stripe)
| Plan | Precio | Documentos | Usuarios |
|------|--------|------------|---------|
| Trial | Gratis | 2 docs | 1 |
| Pro | 10 €/mes | 20 docs/mes | 1 |
| Gestoría | 99 €/mes | 50 clientes × 20 docs | ilimitados |
| Gestoría Pro | 199 €/mes | Clientes ilimitados × 20 docs | ilimitados |

### Modo Gestoría (multi-empresa)
- Gestorías pueden administrar N empresas cliente desde un panel centralizado
- Estadísticas agregadas: documentos y facturas de todos los clientes
- **Impersonation**: acceder a la cuenta de un cliente con un solo clic (token JWT de 1h)
- Flujo de invitación: email → link → registro en Clerk → vinculación automática

### Dashboard de métricas
- Resumen mensual con delta vs. mes anterior
- Gráfica de actividad últimos 6 meses (Recharts)
- Distribución de documentos por tipo (PieChart)
- Top proveedores (horizontal BarChart)

### Emails automáticos (Resend)
- Bienvenida al registrarse
- Documento procesado (con tipo, proveedor e importe)
- Límite de documentos alcanzado
- Resumen mensual (cron el día 1 de cada mes a las 9:00)
- Pago fallido

---

## Arquitectura

```
┌─────────────────────────────────────────────────────┐
│                     Vercel Edge                      │
│   Next.js App Router (RSC + Client Components)       │
│   Middleware: Clerk auth + impersonation header      │
└────────────┬─────────────────────┬──────────────────┘
             │                     │
    ┌────────▼────────┐   ┌────────▼────────┐
    │   Supabase DB   │   │  Supabase       │
    │   PostgreSQL    │   │  Storage        │
    │   + RLS         │   │  (documentos)   │
    └────────┬────────┘   └─────────────────┘
             │
    ┌────────▼────────────────────────────────┐
    │              Inngest                     │
    │  process-document (retries: 3)           │
    │  monthly-summary  (cron: 0 9 1 * *)     │
    └────────┬─────────────────────────────────┘
             │
    ┌────────▼────────┐
    │  Anthropic API  │
    │  claude-sonnet  │
    └─────────────────┘
```

### Flujo de procesado de documentos

```
Usuario sube archivo
    → POST /api/documents/upload
    → Validación MIME (firma de bytes) + límite de plan
    → Upload a Supabase Storage
    → INSERT documents (status: pending)
    → inngest.send('docuai/document.uploaded')
    → [background] process-document:
        1. marcar-processing   → status: processing
        2. descargar-archivo   → buffer desde Storage
        3. extraer-con-ia      → Claude API
        4. guardar-extraccion  → INSERT document_extractions + status: done
        5. → sendEmail (documento procesado)
```

### Esquema de base de datos

```sql
organizations     -- plan, stripe_subscription_id, org_type, max_clients
users             -- clerk_id, email, role, organization_id
documents         -- storage_path, mime_type, status, error_message
document_extractions -- type, vendor, amount, currency, confidence_score
gestoria_clients  -- gestoria_id, client_org_id, status
client_invitations -- token, email, company_name, expires_at
session_tokens    -- impersonation tokens (1h TTL)
```

---

## Variables de entorno

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# Clerk
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
CLERK_SECRET_KEY=
CLERK_WEBHOOK_SECRET=

# Anthropic
ANTHROPIC_API_KEY=

# Stripe
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
STRIPE_PRICE_ID=              # Pro 10€/mes
STRIPE_GESTORIA_PRICE_ID=     # Gestoría 99€/mes
STRIPE_GESTORIA_PRO_PRICE_ID= # Gestoría Pro 199€/mes

# Inngest
INNGEST_SIGNING_KEY=
INNGEST_EVENT_KEY=

# Resend
RESEND_API_KEY=

# App
NEXT_PUBLIC_APP_URL=https://docuai.es
```

---

## Instalación local

```bash
git clone https://github.com/R0b3r7DEV/docuai
cd docuai
pnpm install

# Configurar variables de entorno
cp .env.example .env.local

# Ejecutar migraciones de Supabase
supabase db push

# Iniciar servidor de desarrollo
pnpm dev

# En otra terminal, iniciar Inngest dev server
npx inngest-cli@latest dev
```

---

## Decisiones de diseño

**Por qué Inngest en lugar de un cron convencional**
El pipeline de documentos puede tardar 10-30 segundos (descarga + Claude API). Vercel corta las funciones a los 30s en el plan gratuito. Con Inngest cada `step.run` tiene su propio timeout y los reintentos son automáticos, lo que elimina fallos silenciosos.

**Por qué separar `lib/stripe/constants.ts` de `limits.ts`**
`limits.ts` importa `supabaseServer` (server-only). Si los límites numéricos estuvieran ahí, componentes client como `UpgradeBanner` explotarían con un error de bundler. Los constantes van en un archivo sin side-effects importables desde cualquier contexto.

**Por qué `sessionStorage` para impersonación**
La gestoría necesita "acceder como cliente" sin cambiar la sesión de Clerk. Un token efímero en `sessionStorage` + header `x-impersonate-org` resuelve la autorización en el servidor sin tocar cookies ni JWTs de Clerk, y se limpia al cerrar la pestaña.

**Por qué validar MIME por firma de bytes**
Los archivos cuya extensión no coincida con el contenido real se rechazan. Esto previene que se suba un ejecutable renombrado a `.pdf` y luego se envíe a Claude o se descargue sin restricciones.

---

## Autor

**Roberto** · [github.com/R0b3r7DEV](https://github.com/R0b3r7DEV)
