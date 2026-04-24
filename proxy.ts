import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'

const isProtectedRoute = createRouteMatcher([
  '/app(.*)',
  '/api/documents(.*)',
  '/api/chat(.*)',
  '/api/export(.*)',
  '/api/settings(.*)',
  '/api/stripe/(.*)',
])

const isPublicRoute = createRouteMatcher([
  '/api/webhooks/(.*)',
])

const isAuthRoute = createRouteMatcher(['/sign-in(.*)', '/sign-up(.*)'])

export const proxy = clerkMiddleware(async (auth, req) => {
  // Webhooks son públicos — Inngest y Clerk verifican con sus propias firmas
  if (isPublicRoute(req)) return

  const { userId } = await auth()

  // Si está autenticado y va a / o a sign-in/sign-up → redirige a la app
  if (userId && (req.nextUrl.pathname === '/' || isAuthRoute(req))) {
    return NextResponse.redirect(new URL('/app/documents', req.url))
  }

  // Rutas protegidas requieren autenticación
  if (isProtectedRoute(req)) await auth.protect()
})

export const config = {
  matcher: [
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/(api|trpc)(.*)',
  ],
}
