# Lexia — Gestión documental con IA

> Sube una factura. En 10 segundos tienes todos los datos extraídos, clasificados y listos para analizar.

**Lexia** es una plataforma web SaaS (Software como Servicio) que usa **Inteligencia Artificial** para automatizar la gestión documental de empresas españolas. Está orientada a pymes, autónomos y gestorías que todavía procesan facturas y contratos de forma manual.

URL de producción: [https://lexia.es](https://lexia.es) *(placeholder — gestionar desde Vercel Dashboard)*

---

## ¿Qué problema resuelve?

Hoy en día, una pyme española recibe decenas de facturas al mes en formato PDF o papel escaneado. Alguien tiene que abrirlas una a una, apuntar el proveedor, el importe, la fecha y el IVA en una hoja de Excel. Es tedioso, propenso a errores y consume horas de trabajo.

**Lexia elimina ese proceso.** Subes el documento y la IA hace el resto.

---

## ¿Qué puede hacer Lexia?

| Función | Descripción |
|---------|-------------|
| **Extracción automática** | Lee PDFs, imágenes y facturas escaneadas y extrae: proveedor, importe, fecha, IVA, tipo de documento y categoría de gasto |
| **OCR inteligente** | Procesa documentos escaneados de baja calidad usando reconocimiento óptico de caracteres con preprocesado de imagen |
| **Chat con IA** | Responde preguntas en lenguaje natural: "¿Cuánto gasté en electricidad este trimestre?" |
| **Dashboard de métricas** | Gráficos de gastos mensuales, proveedores más frecuentes y tendencias |
| **Exportación a Excel** | Descarga todos tus documentos filtrados en formato .xlsx con un clic |
| **Modo gestoría** | Una gestoría puede gestionar múltiples empresas clientes desde un único panel |
| **White-label** | Gestorías grandes pueden ofrecer la plataforma bajo su propia marca y dominio |
| **Emails automáticos** | Resumen mensual de actividad, alertas de pago fallido, invitaciones a clientes |

---

## Demostración

La landing page pública está en la raíz del proyecto y muestra todas las funcionalidades con animaciones, secciones de precios y un vídeo de demo.

Una vez registrado, el usuario accede a `/app/dashboard` donde ve sus métricas, puede subir documentos y chatear con la IA.

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
              ▼
        [ Stripe ]
        Pagos y suscripciones
```

**Flujo de una factura:**
1. El usuario sube un PDF o imagen
2. El archivo se guarda en Supabase Storage
3. Inngest lanza un job en segundo plano
4. Si es imagen, Tesseract OCR extrae el texto
5. Claude AI analiza el contenido y devuelve los campos estructurados
6. Los datos se guardan en la base de datos
7. El usuario ve el resultado en la interfaz

---

## Tecnologías utilizadas

### Frontend (lo que ve el usuario)

| Tecnología | Para qué sirve |
|------------|---------------|
| **Next.js 16** | Framework web. Gestiona las páginas, rutas y API del servidor |
| **React 19** | Biblioteca para construir la interfaz de usuario |
| **Tailwind CSS v4** | Sistema de diseño y estilos (define colores, espaciados, tipografía) |
| **Framer Motion** | Animaciones fluidas en la landing page (partículas, transiciones, parallax) |
| **Recharts** | Gráficos interactivos del dashboard (barras, sectores, tendencias) |
| **Radix UI** | Componentes accesibles: modales, menús desplegables, switches, tooltips |
| **Lucide React** | Librería de iconos SVG |

### Backend (el motor invisible)

| Tecnología | Para qué sirve |
|------------|---------------|
| **Supabase** | Base de datos PostgreSQL + almacenamiento de archivos |
| **Clerk** | Autenticación de usuarios: registro, login, gestión de sesiones |
| **Anthropic Claude AI** | Motor de IA para extraer datos de documentos y el chat |
| **Tesseract.js** | OCR (reconocimiento óptico de caracteres) para facturas escaneadas |
| **Sharp** | Procesado de imágenes antes del OCR: escala de grises, contraste, nitidez |
| **Inngest** | Cola de trabajos en segundo plano para procesar documentos sin bloquear la interfaz |
| **Stripe** | Pagos, suscripciones y gestión de planes |
| **Resend** | Envío de emails transaccionales (resúmenes, alertas, invitaciones) |

### Infraestructura

| Tecnología | Para qué sirve |
|------------|---------------|
| **Vercel** | Hosting y despliegue automático (cada push a GitHub despliega una nueva versión) |
| **Supabase Storage** | Almacenamiento de los documentos subidos por los usuarios |
| **TypeScript** | Tipado estático que previene errores en el código |
| **Zod** | Validación de datos en el servidor (asegura que los inputs son correctos) |

---

## Estructura de carpetas

```
lexia/
│
├── app/                          # Páginas y rutas de la aplicación
│   ├── page.tsx                  # Landing page pública
│   ├── layout.tsx                # Layout raíz (fuentes, metadatos, tema)
│   ├── globals.css               # Estilos globales y variables de diseño
│   │
│   ├── (app)/                    # Páginas que requieren autenticación
│   │   ├── app/dashboard/        # Panel principal con métricas
│   │   ├── app/documents/        # Lista y detalle de documentos
│   │   ├── app/chat/             # Chat con IA
│   │   ├── app/settings/         # Configuración de cuenta
│   │   ├── app/upgrade/          # Página de planes y precios
│   │   ├── gestoria/             # Panel de gestoría (clientes, invitaciones)
│   │   ├── settings/whitelabel/  # Configuración white-label
│   │   └── onboarding/           # Asistentes de configuración inicial
│   │
│   ├── (auth)/                   # Páginas de autenticación
│   │   ├── sign-in/              # Login con Clerk
│   │   └── sign-up/              # Registro con Clerk
│   │
│   └── api/                      # Endpoints del servidor (API REST)
│       ├── documents/            # CRUD de documentos
│       ├── chat/                 # Endpoint del chat IA
│       ├── stats/                # Estadísticas del dashboard
│       ├── export/               # Exportación a Excel
│       ├── gestoria/             # API de gestoría
│       ├── whitelabel/           # API de white-label
│       ├── stripe/               # Checkout y portal de facturación
│       ├── settings/             # Configuración de usuario
│       └── webhooks/             # Receptores de eventos externos
│           ├── clerk/            # Eventos de autenticación
│           ├── stripe/           # Eventos de pagos
│           └── inngest/          # Jobs en segundo plano
│
├── components/                   # Componentes reutilizables de React
│   ├── landing/                  # Componentes de la landing page
│   │   ├── Navbar.tsx            # Barra de navegación
│   │   ├── Hero.tsx              # Sección principal con animaciones
│   │   ├── DemoVideo.tsx         # Mockup con reproductor de demo
│   │   ├── Features.tsx          # Tarjetas de características
│   │   ├── HowItWorks.tsx        # Pasos del proceso
│   │   ├── Testimonials.tsx      # Rotación automática de testimonios
│   │   ├── Pricing.tsx           # Planes con toggle mensual/anual
│   │   ├── FinalCTA.tsx          # Formulario de captación de email
│   │   ├── Footer.tsx            # Pie de página
│   │   └── effects/              # Efectos visuales
│   │       ├── ParticleBackground.tsx  # Canvas animado con partículas
│   │       ├── ScrollProgress.tsx      # Barra de progreso de scroll
│   │       └── GlowCursor.tsx          # Resplandor que sigue el cursor
│   │
│   ├── app/                      # Componentes del panel de la app
│   │   ├── AppSidebar.tsx        # Barra lateral de navegación
│   │   ├── ExtractionCard.tsx    # Tarjeta con los datos extraídos
│   │   ├── DocumentUpload.tsx    # Zona de arrastrar y soltar archivos
│   │   ├── ChatInterface.tsx     # Interfaz del chat con IA
│   │   ├── StatsOverview.tsx     # Tarjetas de resumen de estadísticas
│   │   └── charts/               # Gráficos del dashboard
│   │       ├── DocsByTypeChart.tsx      # Gráfico circular por tipo
│   │       ├── SpendingByMonthChart.tsx # Barras mensuales
│   │       └── TopVendorsChart.tsx      # Top proveedores
│   │
│   └── ui/                       # Componentes base del sistema de diseño
│       └── button, badge, dialog, switch, tooltip... (Radix UI + Tailwind)
│
├── lib/                          # Lógica de negocio compartida
│   ├── claude/
│   │   └── extractor.ts          # Llama a Claude AI para extraer datos
│   ├── ocr/
│   │   ├── preprocess.ts         # Preprocesa imágenes con Sharp
│   │   ├── extractor.ts          # Ejecuta Tesseract OCR
│   │   └── index.ts              # Orquesta OCR → Claude
│   ├── stripe/
│   │   ├── client.ts             # Cliente Stripe inicializado
│   │   └── constants.ts          # Límites por plan
│   ├── email/
│   │   ├── sender.ts             # Función de envío vía Resend
│   │   └── templates.ts          # Plantillas HTML de emails
│   ├── whitelabel/
│   │   ├── resolver.ts           # Detecta dominio personalizado → marca
│   │   └── theme-context.tsx     # Aplica colores y logo dinámicamente
│   ├── supabase/
│   │   ├── server.ts             # Cliente con permisos de servidor
│   │   └── client.ts             # Cliente para el navegador
│   └── utils/
│       ├── auth.ts               # Helpers de autenticación
│       ├── errors.ts             # Manejo de errores de API
│       ├── export.ts             # Generación de Excel con xlsx
│       └── cn.ts                 # Utilidad para clases CSS condicionales
│
├── inngest/
│   └── functions/
│       ├── processDocument.ts    # Job: OCR + extracción de documentos
│       └── monthlySummary.ts     # Job: resumen mensual automático (día 1)
│
├── types/
│   └── database.ts               # Tipos TypeScript de toda la base de datos
│
├── supabase/
│   └── migrations/               # Scripts SQL para crear las tablas
│
├── scripts/
│   ├── test-ocr.ts               # Script para probar el OCR
│   └── test-extractor.ts         # Script para probar la extracción
│
└── Archivos de configuración
    ├── next.config.ts            # Configuración de Next.js
    ├── vercel.json               # Límites de tiempo y memoria en Vercel
    ├── tsconfig.json             # Configuración de TypeScript
    └── .env.example              # Variables de entorno necesarias
```

---

## Modelos de datos principales

### Organización (`organizations`)
Representa una empresa cliente. Tiene un plan (`trial`, `pro`, `gestoria`, `whitelabel`…), un tipo (`empresa` o `gestoria`) y toda la información de suscripción de Stripe.

### Documento (`documents`)
Archivo subido por el usuario. Tiene un estado (`pending`, `processing`, `done`, `error`) y apunta al archivo en Supabase Storage.

### Extracción (`document_extractions`)
Los datos que la IA extrajo del documento: proveedor, importe, fecha, IVA, categoría, tipo de documento, nivel de confianza, y si se usó OCR.

### Mensaje de chat (`chat_messages`)
Conversación del usuario con la IA. Incluye el contexto de qué documentos se consultaron.

### Configuración white-label (`whitelabel_configs`)
Nombre de marca, colores, logo, dominio personalizado y pie de página para gestorías que revenden la plataforma bajo su marca.

---

## Planes disponibles

| Plan | Precio | Para quién |
|------|--------|-----------|
| **Trial** | Gratis | Prueba con 2 documentos, sin tarjeta |
| **Pro** | 10 €/mes | Pymes y autónomos, 20 docs/mes |
| **Gestoría** | 49 €/mes | Gestorías, hasta 10 empresas clientes |
| **Gestoría Pro** | 99 €/mes | Gestorías grandes, hasta 50 clientes |
| **White-Label** | 299 €/mes | Plataforma bajo marca propia, 100 clientes |
| **White-Label Pro** | 599 €/mes | Clientes ilimitados + dominio personalizado |

---

## Variables de entorno necesarias

Para ejecutar el proyecto se necesitan las siguientes claves de servicios externos:

```bash
# Inteligencia Artificial (Anthropic)
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
STRIPE_PRICE_ID=              # Plan Pro
STRIPE_GESTORIA_PRICE_ID=     # Plan Gestoría
STRIPE_GESTORIA_PRO_PRICE_ID= # Plan Gestoría Pro
STRIPE_WL_PRICE_ID=           # Plan White-Label
STRIPE_WL_PRO_PRICE_ID=       # Plan White-Label Pro

# Email (Resend) — desde hola@lexia.es
RESEND_API_KEY=

# Jobs en segundo plano (Inngest)
INNGEST_EVENT_KEY=
INNGEST_SIGNING_KEY=

# URL de la app
NEXT_PUBLIC_APP_URL=https://lexia.es

# OCR (opcional, por defecto español + inglés)
TESSERACT_LANG=spa+eng

# Admin
ADMIN_SECRET_KEY=
VERCEL_TOKEN=
VERCEL_PROJECT_ID=
```

---

## Comandos del proyecto

```bash
# Instalar dependencias
pnpm install

# Servidor de desarrollo local
pnpm dev

# Construir para producción (verifica errores TypeScript)
pnpm build

# Tests unitarios
pnpm test

# Probar el pipeline de OCR
pnpm test:ocr

# Probar la extracción de documentos
pnpm test:extractor

# Servidor local de Inngest (jobs en segundo plano)
pnpm inngest:dev
```

---

## Cómo desplegar

El proyecto está configurado para desplegarse en **Vercel** con un clic:

1. Haz fork del repositorio en GitHub
2. Conecta el repositorio en [vercel.com](https://vercel.com)
3. Añade todas las variables de entorno del apartado anterior
4. Ejecuta las migraciones de Supabase (`supabase/migrations/`)
5. Configura los webhooks de Clerk, Stripe e Inngest apuntando a tu dominio

Cada vez que hagas `git push`, Vercel despliega automáticamente una nueva versión.

---

## Tests

El proyecto incluye tests con **Vitest** + **Testing Library**:

```bash
pnpm test           # Ejecuta todos los tests
pnpm test:ui        # Interfaz visual de tests
pnpm test:coverage  # Informe de cobertura de código
```

---

## Lo que hace a Lexia diferente

- **OCR propio**: a diferencia de soluciones que sólo aceptan PDFs legibles, Lexia preprocesa imágenes con Sharp (escala de grises, normalización, contraste) antes del OCR, logrando extraer texto incluso de facturas escaneadas de mala calidad.

- **IA conversacional sobre tus documentos**: no es sólo extracción. El chat conecta directamente con tus documentos almacenados y responde preguntas complejas con contexto real.

- **Multi-tenant seguro**: cada organización tiene sus datos completamente aislados mediante Row Level Security de Supabase. Una empresa nunca puede ver los datos de otra.

- **White-label nativo**: las gestorías pueden ofrecer toda la plataforma bajo su propia marca, colores y dominio personalizado, sin que sus clientes sepan que usan Lexia.

- **Jobs asíncronos**: el procesamiento OCR + IA se ejecuta en segundo plano con Inngest, por lo que la interfaz nunca se bloquea aunque el documento tarde en procesarse.

---

## Licencia

Proyecto privado. Todos los derechos reservados.

---

*Construido con Next.js 16, React 19, Claude AI, Supabase, Clerk, Stripe, Inngest y Vercel.*
