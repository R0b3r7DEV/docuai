# DocuAI

Inteligencia documental para pymes españolas. Sube facturas, contratos y nóminas — la IA extrae, clasifica y responde preguntas sobre tus documentos.

## Stack

- **Next.js 16** (App Router, Turbopack)
- **Clerk** — autenticación
- **Supabase** — base de datos PostgreSQL + Storage
- **Inngest** — procesamiento asíncrono de documentos
- **Anthropic Claude** — extracción de datos e IA conversacional
- **SheetJS** — exportación Excel

## Variables de entorno

Copia `.env.example` a `.env.local` y rellena todos los valores:

```bash
cp .env.example .env.local
```

| Variable | Descripción |
|---|---|
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | Clave pública de Clerk |
| `CLERK_SECRET_KEY` | Clave secreta de Clerk |
| `CLERK_WEBHOOK_SECRET` | Secret del webhook de Clerk (svix) |
| `NEXT_PUBLIC_SUPABASE_URL` | URL del proyecto Supabase |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Clave anon de Supabase |
| `SUPABASE_SERVICE_ROLE_KEY` | Clave service role de Supabase |
| `ANTHROPIC_API_KEY` | Clave de la API de Anthropic |
| `INNGEST_EVENT_KEY` | Event key de Inngest |
| `INNGEST_SIGNING_KEY` | Signing key de Inngest |
| `NEXT_PUBLIC_APP_URL` | URL pública de la app (ej: https://docuai.app) |

## Desarrollo local

```bash
# Instalar dependencias
pnpm install

# Iniciar Next.js
pnpm dev

# Iniciar Inngest Dev Server (en otra terminal)
pnpm inngest:dev
```

## Migraciones de base de datos

Las migraciones están en `supabase/migrations/`. Aplícalas en orden desde el dashboard de Supabase o con la CLI:

```bash
supabase db push
```

El orden es:
1. `0001_initial_schema.sql` — tablas principales
2. `0002_rls_policies.sql` — políticas RLS
3. `0003_export_logs.sql` — tabla de logs de exportación

## Webhook de Clerk

Configura un webhook en el dashboard de Clerk apuntando a:

```
https://tu-dominio.com/api/webhooks/clerk
```

Eventos necesarios: `user.created`

## Despliegue en Vercel

1. Importa el repositorio en Vercel
2. Añade todas las variables de entorno
3. El archivo `vercel.json` ya configura los timeouts necesarios para las funciones de larga duración

## Estructura del proyecto

```
app/
  (app)/          # Rutas protegidas de la aplicación
    app/
      chat/       # Chat con IA
      documents/  # Gestión de documentos
      settings/   # Configuración
  (auth)/         # Páginas de Clerk (sign-in, sign-up)
  api/            # Route handlers
components/
  app/            # Componentes de la aplicación
hooks/            # Custom hooks
inngest/          # Funciones de procesamiento asíncrono
lib/
  claude/         # Integración con Anthropic
  supabase/       # Cliente de Supabase
  utils/          # Utilidades compartidas
supabase/
  migrations/     # Migraciones SQL
types/            # Tipos TypeScript compartidos
```
