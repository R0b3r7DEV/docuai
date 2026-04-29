import * as Sentry from '@sentry/nextjs'

const dsn = process.env.SENTRY_DSN ?? process.env.NEXT_PUBLIC_SENTRY_DSN

if (dsn) {
  Sentry.init({
    dsn,
    environment: process.env.NODE_ENV,
    tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
    // Don't log every request — only real server errors
    beforeSend(event) {
      if (event.exception) {
        const status = (event.extra?.status as number | undefined) ?? 0
        if (status >= 400 && status < 500) return null
      }
      return event
    },
  })
}
