import * as Sentry from '@sentry/nextjs'

const dsn = process.env.NEXT_PUBLIC_SENTRY_DSN

if (dsn) {
  Sentry.init({
    dsn,
    environment: process.env.NODE_ENV,
    tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
    // Replay only in production, 10% of sessions + 100% of sessions with errors
    replaysSessionSampleRate: 0.1,
    replaysOnErrorSampleRate: 1.0,
    integrations: [
      Sentry.replayIntegration({
        maskAllText: true,
        blockAllMedia: true,
      }),
    ],
    // Don't capture 4xx errors — those are expected (auth, validation, rate limits)
    beforeSend(event) {
      if (event.exception) {
        const status = (event.extra?.status as number | undefined) ?? 0
        if (status >= 400 && status < 500) return null
      }
      return event
    },
  })
}
