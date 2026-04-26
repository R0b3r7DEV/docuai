'use client'

import { motion } from 'framer-motion'
import { Play, X, FileText, MessageSquare, BarChart3, Upload } from 'lucide-react'
import * as Dialog from '@radix-ui/react-dialog'

export function DemoVideo() {
  return (
    <section id="demo" className="py-24 px-6" style={{ background: '#0A0A0A' }}>
      <div className="max-w-5xl mx-auto">
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: 28 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
          viewport={{ once: true }}
        >
          <h2
            className="text-3xl sm:text-4xl font-bold text-white mb-4"
            style={{ fontFamily: 'var(--font-playfair)' }}
          >
            Míralo en acción
          </h2>
          <p className="text-white/50 max-w-lg mx-auto" style={{ fontFamily: 'var(--font-dm-sans)' }}>
            En menos de 30 segundos verás cómo DocuAI extrae los datos de una factura real.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.97, y: 20 }}
          whileInView={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
          viewport={{ once: true }}
        >
          {/* macOS window chrome */}
          <div
            className="rounded-2xl overflow-hidden"
            style={{ border: '1px solid rgba(255,255,255,0.08)', boxShadow: '0 40px 80px rgba(0,0,0,0.6)' }}
          >
            <div
              className="h-10 flex items-center px-4 gap-2"
              style={{ background: '#161616', borderBottom: '1px solid rgba(255,255,255,0.05)' }}
            >
              <div className="w-3 h-3 rounded-full" style={{ background: '#FF5F57' }} />
              <div className="w-3 h-3 rounded-full" style={{ background: '#FEBC2E' }} />
              <div className="w-3 h-3 rounded-full" style={{ background: '#28C840' }} />
              <div className="flex-1 flex justify-center">
                <div
                  className="rounded-md px-10 py-1 text-xs"
                  style={{ background: '#0D0D0D', color: 'rgba(255,255,255,0.25)' }}
                >
                  app.docuai.es/app/documents
                </div>
              </div>
            </div>

            <Dialog.Root>
              <Dialog.Trigger asChild>
                <div
                  className="relative flex items-center justify-center cursor-pointer group"
                  style={{
                    aspectRatio: '16/9',
                    background: 'linear-gradient(135deg, #0F1F1A 0%, #0A0A0A 100%)',
                  }}
                >
                  {/* Grid pattern */}
                  <div
                    className="absolute inset-0 pointer-events-none opacity-30"
                    style={{
                      backgroundImage: 'radial-gradient(rgba(29,158,117,0.2) 1px, transparent 1px)',
                      backgroundSize: '24px 24px',
                    }}
                  />

                  {/* Fake app UI preview */}
                  <div className="absolute inset-4 rounded-xl overflow-hidden opacity-40 pointer-events-none" style={{ border: '1px solid rgba(29,158,117,0.15)' }}>
                    <div className="h-full flex" style={{ background: 'rgba(15,25,20,0.8)' }}>
                      {/* Sidebar */}
                      <div className="w-48 p-3 flex flex-col gap-1" style={{ borderRight: '1px solid rgba(255,255,255,0.05)' }}>
                        {[BarChart3, FileText, MessageSquare].map((Icon, i) => (
                          <div
                            key={i}
                            className="flex items-center gap-2 rounded-lg px-3 py-2"
                            style={{ background: i === 1 ? 'rgba(29,158,117,0.2)' : 'transparent' }}
                          >
                            <Icon className="h-3.5 w-3.5" style={{ color: i === 1 ? '#1D9E75' : 'rgba(255,255,255,0.3)' }} />
                            <span className="text-[10px]" style={{ color: i === 1 ? '#4DF0B8' : 'rgba(255,255,255,0.3)' }}>
                              {['Dashboard', 'Documentos', 'Chat IA'][i]}
                            </span>
                          </div>
                        ))}
                      </div>
                      {/* Main */}
                      <div className="flex-1 p-4">
                        <div className="h-4 w-32 rounded mb-4" style={{ background: 'rgba(255,255,255,0.08)' }} />
                        <div className="grid grid-cols-3 gap-2 mb-4">
                          {[1, 2, 3].map(i => (
                            <div key={i} className="h-12 rounded-lg" style={{ background: 'rgba(29,158,117,0.08)', border: '1px solid rgba(29,158,117,0.12)' }} />
                          ))}
                        </div>
                        {[1, 2, 3, 4].map(i => (
                          <div key={i} className="h-8 rounded mb-2 flex items-center px-3 gap-2" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.04)' }}>
                            <div className="w-4 h-4 rounded" style={{ background: 'rgba(29,158,117,0.3)' }} />
                            <div className="flex-1 h-2 rounded" style={{ background: 'rgba(255,255,255,0.08)', width: `${60 + i * 8}%` }} />
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Play button */}
                  <motion.div
                    className="relative z-10 flex flex-col items-center gap-4"
                    whileHover={{ scale: 1.05 }}
                    transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                  >
                    <div
                      className="w-20 h-20 rounded-full flex items-center justify-center"
                      style={{
                        background: '#1D9E75',
                        boxShadow: '0 0 40px rgba(29,158,117,0.5), 0 0 80px rgba(29,158,117,0.2)',
                      }}
                    >
                      <Play className="h-8 w-8 text-white ml-1" fill="white" />
                    </div>
                    <span className="text-white/50 text-sm">Haz clic para ver el demo</span>
                  </motion.div>
                </div>
              </Dialog.Trigger>

              <Dialog.Portal>
                <Dialog.Overlay className="fixed inset-0 z-50 backdrop-blur-md" style={{ background: 'rgba(0,0,0,0.85)' }} />
                <Dialog.Content className="fixed inset-0 z-50 flex items-center justify-center p-6">
                  <Dialog.Title className="sr-only">Demo de DocuAI</Dialog.Title>
                  <div className="relative w-full max-w-4xl">
                    <Dialog.Close className="absolute -top-10 right-0 flex items-center gap-1.5 text-sm text-white/55 hover:text-white transition-colors">
                      <X className="h-4 w-4" />
                      Cerrar
                    </Dialog.Close>
                    <div
                      className="aspect-video rounded-2xl flex flex-col items-center justify-center"
                      style={{ background: '#111', border: '1px solid rgba(255,255,255,0.08)' }}
                    >
                      <div
                        className="w-16 h-16 rounded-full flex items-center justify-center mb-4"
                        style={{ background: 'rgba(29,158,117,0.15)', border: '1px solid rgba(29,158,117,0.3)' }}
                      >
                        <Upload className="h-7 w-7" style={{ color: '#1D9E75' }} />
                      </div>
                      <p className="text-white/60 text-sm">Vídeo de demo disponible próximamente</p>
                      <p className="text-white/30 text-xs mt-1">Mientras tanto, pruébalo gratis</p>
                    </div>
                  </div>
                </Dialog.Content>
              </Dialog.Portal>
            </Dialog.Root>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
