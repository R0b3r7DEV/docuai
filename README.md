# Lexia — Gestión documental con IA

> Sube una factura. En 10 segundos tienes todos los datos extraídos, clasificados y listos para analizar.

**Lexia** es una plataforma web SaaS que usa **Inteligencia Artificial** para automatizar la gestión documental de empresas españolas. Está orientada a pymes, autónomos y gestorías que todavía procesan facturas y contratos de forma manual.

URL de producción: [https://lexia.es](https://lexia.es)

---

## ¿Qué problema resuelve?

Una pyme española recibe decenas de facturas al mes en PDF o papel escaneado. Alguien tiene que abrirlas una a una, apuntar el proveedor, el importe, la fecha y el IVA en una hoja de Excel. Es tedioso, propenso a errores y consume horas de trabajo.

**Lexia elimina ese proceso.** Subes el documento y la IA hace el resto.

---

## Funcionalidades

| Función | Descripción |
|---------|-------------|
| **Extracción automática** | Lee PDFs e imágenes y extrae: proveedor, importe, fecha, IVA, tipo de documento y categoría de gasto |
| **OCR inteligente** | Procesa documentos escaneados con Tesseract (preprocesado con Sharp: escala de grises, contraste, nitidez) |
| **Chat con IA** | Responde preguntas en lenguaje natural: "¿Cuánto gasté en electricidad este trimestre?" |
| **Dashboard de métricas** | Gráficos de gastos mensuales, proveedores más frecuentes y tendencias |
| **Exportación a Excel** | Descarga todos tus documentos filtrados en formato .xlsx con un clic |
| **Modo gestoría** | Gestiona múltiples empresas clientes desde un único panel centralizado |
| **White-label** | Ofrece la plataforma bajo tu propia marca, colores y dominio personalizado |
| **Emails automáticos** | Bienvenida, documento procesado, límite alcanzado, invitaciones a clientes |
| **Reintentar extracción** | Si un documento falla, un botón relanza el pipeline de IA sin soporte técnico |
| **Onboarding guiado** | Checklist de 3 pasos para que los nuevos usuarios empiecen en minutos |

---

## Seguridad y cumplimiento

| Área | Implementación |
|------|---------------|
| **Rate limiting** | 10 subidas/min y 20 mensajes de chat/min por usuario (en memoria, HTTP 429) |
| **Validación de archivos** | Magic bytes — verifica el contenido real del archivo, no solo la extensión |
| **Aislamiento multi-tenant** | Row Level Security en Supabase — cada organización ve solo sus datos |
| **RGPD art. 17** | `DELETE /api/account/delete` borra todos los datos del usuario y su cuenta de Clerk |
| **Política de privacidad** | Página `/privacy` con base jurídica, destinatarios, plazos de retención y derechos |
| **Términos de servicio** | Página `/terms` con precios, cancelación, uso aceptable y ley española aplicable |
| **Consentimiento de cookies** | Banner con opciones "Esenciales" / "Aceptar todas" |
| **Monitorización de errores** | Sentry captura excepciones en cliente y servidor; ignora errores 4xx esperados |
| **Headers de seguridad** | X-Frame-Options, X-Content-Type-Options, Referrer-Policy, Permissions-Policy |

---

## Arquitectura general

```
USUARIO
  │
  ▼
[ Landing Page ]  →  [ Registro / Login (Clerk) ]
                              │
                              ▼
                    [ Panel de la App ]
                    ┌─────────────────────────────┐
                    │  Dashboard  │  Documentos   │
                    │  Chat IA    │  Configuración│
                    └─────────────────────────────┘
                              │
              ┌───────────────┼───────────────┐
              ▼               ▼               ▼
        [ Supabase ]   [ Claude AI ]    [ Inngest ]
        Base de datos   Extracción      Jobs en
        + Storage       y Chat          segundo plano
              │
        [ Stripe ]         [ Sentry ]       [ Resend ]
        Pagos              Errores          Emails
```

**Flujo de una factura:**
1. El usuario sube un PDF o imagen → rate limit + validación de magic bytes
2. El archivo se guarda en Supabase Storage
3. Inngest lanza un job en segundo plano (`lexia/document.uploaded`)
4. Si es imagen, Tesseract OCR extrae el texto (traineddata desde Supabase Storage → `/tmp`)
5. Claude AI analiza el contenido y devuelve los campos estructurados en JSON
6. Los datos se guardan en `document_extractions`; se envía email al usuario
7. El usuario ve el resultado — si hay error, puede reintentarlo con un clic

---

## Tecnologías

### Frontend

| Tecnología | Para qué sirve |
|------------|---------------|
| **Next.js 16** | Framework web: páginas, rutas y API del servidor |
| **React 19** | Biblioteca para construir la interfaz de usuario |
| **Tailwind CSS v4** | Sistema de diseño: colores, espaciados, tipografía |
| **Framer Motion** | Animaciones en la landing page (partículas, transiciones) |
| **Recharts** | Gráficos interactivos del dashboard |
| **Radix UI** | Componentes accesibles: modales, menús, switches, tooltips |

### Backend

| Tecnología | Para qué sirve |
|------------|---------------|
| **Supabase** | Base de datos PostgreSQL + almacenamiento de archivos |
| **Clerk** | Autenticación: registro, login, gestión de sesiones |
| **Anthropic Claude AI** | Extracción de datos de documentos y chat conversacional |
| **Tesseract.js** | OCR para facturas escaneadas |
| **Sharp** | Preprocesado de imágenes antes del OCR |
| **Inngest** | Cola de trabajos en segundo plano (procesamiento asíncrono) |
| **Stripe** | Pagos, suscripciones y portal de facturación |
| **Resend** | Emails transaccionales desde `hola@lexia.es` |
| **Sentry** | Monitorización de errores en cliente y servidor |
| **Zod** | Validación de datos en el servidor |

### Infraestructura y calidad

| Tecnología | Para qué sirve |
|------------|---------------|
| **Vercel** | Hosting y despliegue automático en cada push |
| **GitHub Actions** | CI: ejecuta tests + build en cada PR |
| **Vitest** | Tests unitarios e integración |
| **TypeScript** | Tipado estático en todo el proyecto |

---

## Estructura de carpetas

```
lexia/
│
├── app/                          # Páginas y rutas (Next.js App Router)
│   ├── page.tsx                  # Landing page pública
│   ├── layout.tsx                # Layout raíz: fuentes, Sentry, CookieBanner
│   ├── error.tsx                 # Página de error global con Sentry
│   ├── not-found.tsx             # Página 404 con branding Lexia
│   │
│   ├── (app)/                    # Rutas autenticadas
│   │   ├── app/dashboard/        # Panel principal con métricas y onboarding
│   │   ├── app/documents/        # Lista y detalle de documentos
│   │   ├── app/chat/             # Chat con IA
│   │   ├── app/upgrade/          # Planes y precios
│   │   ├── gestoria/             # Panel de gestoría
│   │   └── settings/whitelabel/  # Configuración white-label
│   │
│   ├── (auth)/                   # Login y registro (Clerk)
│   │
│   ├── (legal)/                  # Páginas legales RGPD
│   │   ├── privacy/              # Política de privacidad
│   │   └── terms/                # Términos de servicio
│   │
│   └── api/                      # API REST del servidor
│       ├── documents/            # CRUD + paginación
│       ├── documents/[id]/retry/ # Reintentar extracción fallida
│       ├── account/delete/       # Borrado de cuenta (RGPD art. 17)
│       ├── chat/                 # Chat IA con streaming
│       ├── stats/                # Métricas del dashboard
│       ├── export/               # Exportación Excel
│       ├── gestoria/             # API gestión de clientes
│       ├── whitelabel/           # API configuración de marca
│       ├── stripe/               # Checkout y portal Stripe
│       └── webhooks/             # Clerk · Stripe · Inngest
│
├── components/
│   ├── landing/                  # Secciones de la landing page
│   │   └── effects/              # Partículas, progreso de scroll, cursor glow
│   ├── app/                      # Componentes del panel
│   │   ├── ExtractionCard.tsx    # Datos extraídos + botón Reintentar
│   │   ├── OnboardingChecklist.tsx # 3 pasos guiados para usuarios nuevos
│   │   ├── StatsOverview.tsx     # Tarjetas de resumen
│   │   └── charts/               # Gráficos: tipo, gasto mensual, proveedores
│   ├── CookieBanner.tsx          # Banner de consentimiento de cookies
│   └── ui/                       # Componentes base Radix UI + Tailwind
│
├── lib/
│   ├── claude/extractor.ts       # Llama a Claude AI para extraer datos
│   ├── ocr/                      # preprocess.ts → extractor.ts → index.ts
│   ├── stripe/
│   │   ├── constants.ts          # PLAN_PRICES — única fuente de verdad de precios
│   │   └── limits.ts             # checkDocumentLimit, checkClientLimit
│   ├── email/                    # sender.ts + templates.ts
│   ├── whitelabel/               # resolver.ts + theme-context.tsx
│   ├── supabase/                 # server.ts + client.ts + storage.ts
│   └── utils/
│       ├── rateLimit.ts          # Rate limiter en memoria (ventana fija)
│       ├── auth.ts               # getAuthenticatedUser
│       ├── errors.ts             # handleApiError
│       ├── export.ts             # Generación de Excel
│       └── validators.ts         # Zod schemas + validateMimeType
│
├── inngest/
│   └── functions/
│       ├── processDocument.ts    # OCR + extracción IA + email de notificación
│       └── monthlySummary.ts     # Resumen mensual automático
│
├── sentry.client.config.ts       # Sentry: navegador (replay, filtro 4xx)
├── sentry.server.config.ts       # Sentry: servidor Node.js
├── instrumentation.ts            # Punto de entrada Next.js 15+ para Sentry
│
├── types/database.ts             # Tipos TypeScript de toda la BD
├── supabase/migrations/          # Scripts SQL: schema, RLS, billing, gestoría, rebrand
│
├── tests/
│   ├── unit/claude/              # Tests del extractor de Claude
│   ├── integration/api/          # Tests de endpoints documents y chat
│   └── setup.ts                  # Mocks de env vars para tests
│
├── .github/workflows/ci.yml      # CI: pnpm test + pnpm build en cada PR
└── PLAN.md                       # Plan de producción con estado de cada fase
```

---

## Modelos de datos principales

| Tabla | Descripción |
|-------|-------------|
| `organizations` | Empresa cliente. Plan, tipo (empresa/gestoría), suscripción Stripe |
| `users` | Usuario vinculado a una organización. Rol: owner / admin / member |
| `documents` | Archivo subido. Estado: pending → processing → done / error |
| `document_extractions` | Datos extraídos: proveedor, importe, fecha, IVA, confianza, OCR usado |
| `chat_messages` | Conversación con la IA por organización |
| `whitelabel_configs` | Marca, colores, logo, dominio y textos para gestorías white-label |

Todas las tablas tienen **Row Level Security** activa — una organización nunca puede acceder a los datos de otra.

---

## Planes

| Plan | Precio | Para quién |
|------|--------|-----------|
| **Trial** | Gratis | Prueba con 2 documentos, sin tarjeta |
| **Pro** | 10 €/mes | Pymes y autónomos — 20 docs/mes |
| **Gestoría** | 49 €/mes | Gestorías — hasta 50 empresas clientes |
| **Gestoría Pro** | 99 €/mes | Gestorías grandes — clientes ilimitados |
| **White-Label** | 299 €/mes | Plataforma bajo marca propia, 100 clientes |
| **White-Label Pro** | 599 €/mes | Clientes ilimitados + dominio personalizado |

Los precios se definen en un único lugar: `lib/stripe/constants.ts → PLAN_PRICES`.

---

## Variables de entorno

```bash
# Inteligencia Artificial
ANTHROPIC_API_KEY=

# Base de datos (Supabase)
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# Autenticación (Clerk)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
CLERK_SECRET_KEY=
CLERK_WEBHOOK_SECRET=

# Pagos (Stripe)
STRIPE_SECRET_KEY=
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=
STRIPE_WEBHOOK_SECRET=
STRIPE_GESTORIA_PRICE_ID=
STRIPE_GESTORIA_PRO_PRICE_ID=
STRIPE_WL_PRICE_ID=
STRIPE_WL_PRO_PRICE_ID=

# Email (Resend)
RESEND_API_KEY=

# Jobs en segundo plano (Inngest)
INNGEST_EVENT_KEY=
INNGEST_SIGNING_KEY=

# Monitorización de errores (Sentry) — opcional en local
NEXT_PUBLIC_SENTRY_DSN=
SENTRY_ORG=
SENTRY_PROJECT=
SENTRY_AUTH_TOKEN=   # Solo necesario en CI para subir source maps

# App
NEXT_PUBLIC_APP_URL=https://lexia.es
TESSERACT_LANG=spa+eng   # Idiomas OCR, por defecto español + inglés
```

---

## Comandos

```bash
pnpm install          # Instalar dependencias
pnpm dev              # Servidor de desarrollo local
pnpm build            # Build de producción (verifica TypeScript)
pnpm test             # Tests unitarios e integración (Vitest)
pnpm test:coverage    # Informe de cobertura de código
pnpm inngest:dev      # Servidor local de Inngest (jobs en segundo plano)
pnpm test:ocr         # Probar el pipeline de OCR
pnpm test:extractor   # Probar la extracción de documentos
```

---

## CI / CD

GitHub Actions ejecuta en cada PR:
1. `pnpm install --frozen-lockfile`
2. `pnpm test --run` — con variables de entorno mockeadas
3. `pnpm build` — usando secrets del repositorio

El workflow está en `.github/workflows/ci.yml`.

---

## Cómo desplegar

1. Fork del repositorio en GitHub
2. Conecta el repo en [vercel.com](https://vercel.com)
3. Añade todas las variables de entorno en Vercel
4. Ejecuta las migraciones SQL en Supabase (`supabase/migrations/` en orden)
5. Sube `spa.traineddata` y `eng.traineddata` al bucket `traineddata` de Supabase Storage (público)
6. Configura webhooks de Clerk, Stripe e Inngest apuntando a `https://tu-dominio/api/webhooks/...`

Cada `git push` despliega automáticamente una nueva versión en Vercel.

---

## Lo que hace a Lexia diferente

- **OCR real**: preprocesa imágenes con Sharp antes del OCR — extrae texto incluso de facturas escaneadas de mala calidad.
- **Chat con contexto documental**: no es solo extracción. El asistente responde preguntas complejas sobre tus documentos almacenados.
- **Multi-tenant seguro**: Row Level Security garantiza aislamiento completo entre organizaciones a nivel de base de datos.
- **White-label nativo**: gestorías pueden ofrecer toda la plataforma bajo su propia marca y dominio sin que sus clientes sepan que usan Lexia.
- **Procesamiento asíncrono**: OCR + IA en segundo plano con Inngest — la interfaz nunca se bloquea.
- **RGPD completo**: política de privacidad real, derecho al olvido (art. 17), consentimiento de cookies, términos de servicio bajo ley española.

---

## Licencia

Proyecto privado. Todos los derechos reservados.

---

*Construido con Next.js 16 · React 19 · Claude AI · Supabase · Clerk · Stripe · Inngest · Sentry · Vercel*
