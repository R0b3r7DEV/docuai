import Link from 'next/link'
import { FileText } from 'lucide-react'

export default function LegalLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-white text-gray-900">
      <header className="border-b border-gray-100 py-4 px-6">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-md flex items-center justify-center" style={{ background: '#1D9E75' }}>
              <FileText className="h-3.5 w-3.5 text-white" />
            </div>
            <span className="font-semibold text-gray-900">Lexia</span>
          </Link>
          <Link href="/" className="text-sm text-gray-500 hover:text-gray-900 transition-colors">
            ← Volver al inicio
          </Link>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-12">
        {children}
      </main>

      <footer className="border-t border-gray-100 py-6 px-6 mt-16">
        <div className="max-w-4xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-3 text-sm text-gray-400">
          <span>© {new Date().getFullYear()} Lexia</span>
          <div className="flex gap-6">
            <Link href="/privacy" className="hover:text-gray-700 transition-colors">Privacidad</Link>
            <Link href="/terms" className="hover:text-gray-700 transition-colors">Términos</Link>
            <Link href="mailto:info@lexia.es" className="hover:text-gray-700 transition-colors">Contacto</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
