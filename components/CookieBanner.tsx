'use client'

import CookieConsent from 'react-cookie-consent'
import Link from 'next/link'

export function CookieBanner() {
  return (
    <CookieConsent
      location="bottom"
      buttonText="Aceptar todas"
      declineButtonText="Solo esenciales"
      enableDeclineButton
      cookieName="lexia_cookie_consent"
      style={{
        background: '#111827',
        borderTop: '1px solid rgba(255,255,255,0.08)',
        padding: '16px 24px',
        alignItems: 'center',
        gap: '16px',
        fontSize: '14px',
      }}
      buttonStyle={{
        background: '#1D9E75',
        color: '#fff',
        fontSize: '13px',
        fontWeight: '500',
        borderRadius: '6px',
        padding: '8px 18px',
        border: 'none',
        cursor: 'pointer',
      }}
      declineButtonStyle={{
        background: 'transparent',
        color: 'rgba(255,255,255,0.55)',
        fontSize: '13px',
        fontWeight: '400',
        borderRadius: '6px',
        padding: '8px 14px',
        border: '1px solid rgba(255,255,255,0.15)',
        cursor: 'pointer',
      }}
      contentStyle={{ flex: '1', margin: 0 }}
    >
      <span style={{ color: 'rgba(255,255,255,0.8)' }}>
        Usamos cookies esenciales para el funcionamiento del servicio y cookies analíticas opcionales para mejorar la experiencia.{' '}
        <Link href="/privacy" style={{ color: '#1D9E75', textDecoration: 'underline' }}>
          Más información
        </Link>
        .
      </span>
    </CookieConsent>
  )
}
