# Plan de producción — Lexia

Estado actual: base sólida, **no lista para clientes de pago**.
Este documento se sigue en orden. Marca cada tarea con `[x]` cuando esté completa.

---

## Fase 0 — Setup manual (sin código, ~2h)

> Prerequisito para que todo lo demás funcione. Sin esto la app está rota en producción.

- [x] **0.1** Ejecutar `supabase/migrations/0006_rebrand.sql` en Supabase SQL Editor
- [x] **0.2** Crear bucket `whitelabel` en Supabase Storage → marcar como público
- [ ] **0.3** Crear 4 productos en Stripe con precios recurrentes mensuales:
  - `lexia_gestoria` → 49 €/mes
  - `lexia_gestoria_pro` → 99 €/mes
  - `lexia_whitelabel` → 299 €/mes
  - `lexia_whitelabel_pro` → 599 €/mes
- [ ] **0.4** Añadir en Vercel las 4 env vars de Stripe:
  - `STRIPE_GESTORIA_PRICE_ID`
  - `STRIPE_GESTORIA_PRO_PRICE_ID`
  - `STRIPE_WL_PRICE_ID`
  - `STRIPE_WL_PRO_PRICE_ID`
- [ ] **0.5** Verificar dominio `lexia.es` en Resend → configurar DNS SPF + DKIM
- [ ] **0.6** Actualizar `NEXT_PUBLIC_APP_URL=https://lexia.es` en Vercel

---

## Fase 1 — Seguridad crítica (~1 día de código)

> Sin esto un usuario malintencionado puede generar facturas de miles de euros en minutos.

- [x] **1.1** Rate limiting en `/api/documents/upload` — máx. 10 req/min por usuario
- [x] **1.2** Rate limiting en `/api/chat` — máx. 20 req/min por usuario
- [x] **1.3** Validación de tipo de archivo real en upload (magic bytes, no solo extensión)
- [x] **1.4** Límite de contexto en chat — truncar si el usuario tiene demasiados documentos

**Archivos a tocar:**
```
app/api/documents/upload/route.ts
app/api/chat/route.ts
```

---

## Fase 2 — Cumplimiento RGPD (~2 días de código)

> Obligatorio por ley en España/UE. Sin esto no se puede cobrar a empresas europeas.

- [x] **2.1** Crear página `/privacy` con política de privacidad real
- [x] **2.2** Crear página `/terms` con términos de servicio reales
- [x] **2.3** Banner de cookies con consentimiento explícito (librería `react-cookie-consent`)
- [x] **2.4** Endpoint `DELETE /api/account` — borra todos los datos del usuario (art. 17 RGPD)
- [x] **2.5** Actualizar links del footer en `components/landing/Footer.tsx` para apuntar a las páginas reales

**Archivos a crear:**
```
app/(legal)/privacy/page.tsx
app/(legal)/terms/page.tsx
app/api/account/delete/route.ts
components/CookieBanner.tsx
```

---

## Fase 3 — Fiabilidad (~1 día de código)

> Para no ir ciego cuando algo falla en producción.

- [x] **3.1** Instalar y configurar Sentry (`@sentry/nextjs`) — captura errores en cliente y servidor
- [x] **3.2** Resolver Tesseract en Vercel: subir archivos `.traineddata` a Supabase Storage y descargarlos al iniciar el worker (evita timeout por cold start)
- [x] **3.3** Revisar branding en `app/not-found.tsx` y `app/error.tsx` — deben mostrar Lexia, no página en blanco

**Archivos a tocar:**
```
sentry.client.config.ts     (nuevo)
sentry.server.config.ts     (nuevo)
lib/ocr/extractor.ts        (descargar traineddata desde Storage)
app/not-found.tsx
app/error.tsx
```

---

## Fase 4 — Calidad de producto (~2-3 días de código)

> La diferencia entre "funciona" y "es bueno de verdad".

- [x] **4.1** Unificar precios en `lib/stripe/constants.ts` — una sola fuente de verdad para landing y upgrade page
- [x] **4.2** Empty state en dashboard para usuarios nuevos — CTA "Sube tu primer documento"
- [x] **4.3** Checklist de onboarding (3 pasos: subir doc → ver extracción → probar chat)
- [x] **4.4** Mensaje de error legible cuando la extracción falla + botón "Reintentar"
- [x] **4.5** Verificar que `buildWelcomeEmail` se llama al crear cuenta (webhook Clerk → `api/webhooks/clerk`)
- [x] **4.6** Verificar que el email de límite alcanzado se dispara correctamente

**Archivos a tocar:**
```
lib/stripe/constants.ts
app/(app)/app/dashboard/page.tsx
components/app/OnboardingChecklist.tsx   (nuevo)
components/app/ExtractionCard.tsx
app/api/webhooks/clerk/route.ts
```

---

## Fase 5 — Infraestructura (~1 día)

> Para poder iterar sin miedo a romper producción.

- [ ] **5.1** Crear entorno de staging en Vercel con base de datos Supabase separada
- [x] **5.2** Añadir GitHub Actions: en cada PR ejecutar `pnpm build` + `pnpm test`

**Archivos a crear:**
```
.github/workflows/ci.yml
```

---

## Orden de implementación

| Semana | Fases |
|--------|-------|
| Semana 1 | Fase 0 (manual) + Fase 1 (rate limiting) |
| Semana 2 | Fase 2 (RGPD) + Fase 3.1 (Sentry) |
| Semana 3 | Fase 3.2 (Tesseract) + Fase 4.1 + 4.2 + 4.3 |
| Semana 4 | Fase 4.4 + 4.5 + 4.6 + Fase 5 |

**Estimación total: 3-4 semanas** para poder ofrecer Lexia a clientes de pago con garantías razonables.

---

## Notas

- Empezar siempre por la Fase 0 — sin las migraciones y env vars aplicadas, nada de lo demás tiene sentido.
- La Fase 2 (RGPD) es innegociable si se cobra a empresas europeas.
- La Fase 1 (seguridad) puede hacerse en paralelo con la Fase 0.
- Las Fases 4 y 5 pueden reordenarse según prioridades del negocio.
