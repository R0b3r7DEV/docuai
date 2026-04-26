import Link from 'next/link'
import { FileText } from 'lucide-react'

const columns = [
  {
    title: 'Producto',
    links: [
      { label: 'Características', href: '#caracteristicas' },
      { label: 'Cómo funciona', href: '#como-funciona' },
      { label: 'Precios', href: '#precios' },
      { label: 'Demo', href: '#demo' },
    ],
  },
  {
    title: 'Plataforma',
    links: [
      { label: 'Modo gestoría', href: '/sign-up' },
      { label: 'White-label', href: '/sign-up' },
      { label: 'API', href: '#' },
    ],
  },
  {
    title: 'Legal',
    links: [
      { label: 'Política de privacidad', href: '#' },
      { label: 'Términos de servicio', href: '#' },
      { label: 'Cookies', href: '#' },
    ],
  },
]

export function Footer() {
  return (
    <footer
      className="py-16 px-6"
      style={{ background: '#080808', borderTop: '1px solid rgba(255,255,255,0.05)' }}
    >
      <div className="max-w-6xl mx-auto">
        <div className="grid md:grid-cols-4 gap-10 mb-12">
          <div>
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: '#1D9E75' }}>
                <FileText className="h-4 w-4 text-white" />
              </div>
              <span className="font-bold text-lg text-white">DocuAI</span>
            </div>
            <p className="text-sm leading-relaxed max-w-44" style={{ color: 'rgba(255,255,255,0.38)' }}>
              Inteligencia documental para empresas españolas impulsada por Claude AI.
            </p>
          </div>

          {columns.map(col => (
            <div key={col.title}>
              <h3 className="text-white text-sm font-semibold mb-4">{col.title}</h3>
              <ul className="flex flex-col gap-2.5">
                {col.links.map(link => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-sm transition-colors hover:text-white"
                      style={{ color: 'rgba(255,255,255,0.38)' }}
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div
          className="flex flex-col sm:flex-row justify-between items-center gap-4 pt-8"
          style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}
        >
          <p className="text-xs" style={{ color: 'rgba(255,255,255,0.25)' }}>
            © {new Date().getFullYear()} DocuAI. Todos los derechos reservados.
          </p>
          <div className="flex gap-5">
            <Link href="/sign-in" className="text-xs transition-colors hover:text-white" style={{ color: 'rgba(255,255,255,0.28)' }}>
              Acceder
            </Link>
            <Link href="/sign-up" className="text-xs transition-colors hover:text-white" style={{ color: 'rgba(255,255,255,0.28)' }}>
              Registrarse
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
