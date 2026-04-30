import Link from 'next/link'

const col1 = [
  { label: 'PRODUCTO', href: '#producto' },
  { label: 'PRECIOS', href: '#precios' },
  { label: 'GESTORÍAS', href: '#gestorias' },
  { label: 'WHITE-LABEL', href: '/sign-up' },
]

const col2 = [
  { label: 'PRIVACIDAD', href: '/privacy' },
  { label: 'TÉRMINOS', href: '/terms' },
  { label: 'COOKIES', href: '/privacy#cookies' },
  { label: 'CONTACTO', href: 'mailto:hola@lexia.es' },
]

const linkStyle = {
  fontSize: '11px',
  fontWeight: 300,
  letterSpacing: '0.08em',
  color: 'rgba(250,250,248,0.4)',
  textDecoration: 'none',
  display: 'block',
  marginBottom: '16px',
  transition: 'color 300ms',
} as const

export function Footer() {
  return (
    <footer style={{
      background: '#0A0A0A',
      borderTop: '0.5px solid rgba(255,255,255,0.08)',
      padding: '60px clamp(24px, 5vw, 80px) 40px',
    }}>
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr 1fr',
        gap: '40px',
        marginBottom: '48px',
      }}
      className="grid-cols-1 sm:grid-cols-3"
      >
        {/* Brand */}
        <div>
          <span style={{
            display: 'block',
            fontFamily: 'var(--font-dm-sans, system-ui)',
            fontSize: '16px',
            fontWeight: 300,
            letterSpacing: '0.14em',
            color: '#FAFAF8',
            marginBottom: '16px',
          }}>
            LEXIA
          </span>
          <p style={{
            fontSize: '11px',
            fontWeight: 300,
            letterSpacing: '0.04em',
            color: 'rgba(250,250,248,0.35)',
            lineHeight: 1.7,
            maxWidth: '200px',
          }}>
            Tus documentos.<br />Organizados.
          </p>
        </div>

        {/* Col 1 */}
        <div>
          {col1.map(({ label, href }) => (
            <Link
              key={label}
              href={href}
              style={linkStyle}
              onMouseEnter={e => (e.currentTarget.style.color = '#FAFAF8')}
              onMouseLeave={e => (e.currentTarget.style.color = 'rgba(250,250,248,0.4)')}
            >
              {label}
            </Link>
          ))}
        </div>

        {/* Col 2 */}
        <div>
          {col2.map(({ label, href }) => (
            <Link
              key={label}
              href={href}
              style={linkStyle}
              onMouseEnter={e => (e.currentTarget.style.color = '#FAFAF8')}
              onMouseLeave={e => (e.currentTarget.style.color = 'rgba(250,250,248,0.4)')}
            >
              {label}
            </Link>
          ))}
        </div>
      </div>

      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingTop: '24px',
        borderTop: '0.5px solid rgba(255,255,255,0.06)',
        flexWrap: 'wrap',
        gap: '12px',
      }}>
        <span style={{ fontSize: '11px', fontWeight: 300, letterSpacing: '0.06em', color: 'rgba(250,250,248,0.25)' }}>
          © {new Date().getFullYear()} Lexia
        </span>
        <span style={{ fontSize: '11px', fontWeight: 300, letterSpacing: '0.06em', color: 'rgba(250,250,248,0.25)' }}>
          Powered by Anthropic Claude
        </span>
      </div>
    </footer>
  )
}
