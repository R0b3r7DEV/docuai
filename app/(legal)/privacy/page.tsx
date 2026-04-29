import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Política de privacidad',
  robots: { index: true, follow: false },
}

export default function PrivacyPage() {
  return (
    <article className="prose prose-gray max-w-none">
      <h1 className="text-3xl font-bold text-gray-900 mb-2">Política de privacidad</h1>
      <p className="text-gray-500 mb-10">Última actualización: 29 de abril de 2026</p>

      <Section title="1. Responsable del tratamiento">
        <p>
          El responsable del tratamiento de tus datos personales es <strong>Lexia</strong>
          (en adelante, «Lexia», «nosotros» o «el servicio»), con dirección de contacto:{' '}
          <a href="mailto:privacidad@lexia.es" className="text-emerald-600 hover:underline">privacidad@lexia.es</a>.
        </p>
      </Section>

      <Section title="2. Datos que recogemos">
        <ul>
          <li><strong>Datos de cuenta:</strong> nombre completo, dirección de correo electrónico y contraseña (gestionada por Clerk, Inc.).</li>
          <li><strong>Datos de empresa:</strong> nombre de la organización, NIF/CIF (si se facilita), plan contratado.</li>
          <li><strong>Documentos subidos:</strong> facturas, contratos, nóminas y cualquier otro archivo que cargues voluntariamente. Estos archivos se procesan con inteligencia artificial para extraer información estructurada.</li>
          <li><strong>Datos de uso:</strong> mensajes del chat con la IA, historial de documentos, metadatos de actividad (fechas de acceso, IPs).</li>
          <li><strong>Datos de pago:</strong> gestionados íntegramente por Stripe, Inc. Lexia nunca almacena datos de tarjeta.</li>
          <li><strong>Cookies:</strong> cookies técnicas necesarias para el funcionamiento del servicio y cookies analíticas opcionales (ver sección 7).</li>
        </ul>
      </Section>

      <Section title="3. Finalidad y base jurídica del tratamiento">
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="text-left py-2 pr-4 font-semibold">Finalidad</th>
              <th className="text-left py-2 font-semibold">Base jurídica (RGPD)</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {[
              ['Prestar el servicio contratado', 'Art. 6.1.b — ejecución de contrato'],
              ['Facturación y gestión de suscripción', 'Art. 6.1.b — ejecución de contrato'],
              ['Procesamiento de documentos con IA', 'Art. 6.1.b — ejecución de contrato'],
              ['Comunicaciones de servicio (alertas, límites)', 'Art. 6.1.b — ejecución de contrato'],
              ['Seguridad y prevención de fraude', 'Art. 6.1.f — interés legítimo'],
              ['Mejora del producto (análisis agregado anónimo)', 'Art. 6.1.f — interés legítimo'],
              ['Comunicaciones comerciales (newsletter)', 'Art. 6.1.a — consentimiento'],
            ].map(([fin, base]) => (
              <tr key={fin}>
                <td className="py-2 pr-4">{fin}</td>
                <td className="py-2 text-gray-600">{base}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Section>

      <Section title="4. Destinatarios y transferencias internacionales">
        <p>Compartimos datos únicamente con los proveedores necesarios para operar el servicio:</p>
        <ul>
          <li><strong>Supabase, Inc.</strong> (base de datos y almacenamiento) — servidores en la UE (Frankfurt).</li>
          <li><strong>Anthropic, PBC</strong> (procesamiento de IA) — EE. UU.; transferencia cubierta por cláusulas contractuales estándar de la UE.</li>
          <li><strong>Clerk, Inc.</strong> (autenticación) — EE. UU.; transferencia cubierta por cláusulas contractuales estándar de la UE.</li>
          <li><strong>Stripe, Inc.</strong> (pagos) — EE. UU.; transferencia cubierta por cláusulas contractuales estándar de la UE.</li>
          <li><strong>Resend, Inc.</strong> (envío de emails transaccionales) — EE. UU.; transferencia cubierta por cláusulas contractuales estándar de la UE.</li>
        </ul>
        <p>No vendemos ni cedemos datos a terceros con fines publicitarios.</p>
      </Section>

      <Section title="5. Plazo de conservación">
        <p>
          Conservamos tus datos mientras tu cuenta esté activa. Tras la cancelación o eliminación de la cuenta,
          los datos personales se eliminan en un plazo máximo de <strong>30 días</strong>, salvo que la ley
          española obligue a conservarlos durante un período mayor (p. ej., 5 años para registros contables
          según el Código de Comercio).
        </p>
      </Section>

      <Section title="6. Tus derechos">
        <p>Como interesado tienes derecho a:</p>
        <ul>
          <li><strong>Acceso</strong> — solicitar una copia de tus datos personales.</li>
          <li><strong>Rectificación</strong> — corregir datos inexactos o incompletos.</li>
          <li><strong>Supresión</strong> — solicitar el borrado de tus datos («derecho al olvido», art. 17 RGPD). Puedes hacerlo desde <em>Configuración → Cuenta → Eliminar cuenta</em> o escribiéndonos.</li>
          <li><strong>Portabilidad</strong> — recibir tus datos en formato estructurado y legible por máquina.</li>
          <li><strong>Oposición</strong> — oponerte a tratamientos basados en interés legítimo.</li>
          <li><strong>Limitación</strong> — solicitar la limitación del tratamiento mientras se resuelve una reclamación.</li>
        </ul>
        <p>
          Para ejercer cualquiera de estos derechos escríbenos a{' '}
          <a href="mailto:privacidad@lexia.es" className="text-emerald-600 hover:underline">privacidad@lexia.es</a>.
          También puedes presentar una reclamación ante la{' '}
          <a href="https://www.aepd.es" target="_blank" rel="noopener noreferrer" className="text-emerald-600 hover:underline">
            Agencia Española de Protección de Datos (AEPD)
          </a>.
        </p>
      </Section>

      <Section title="7. Cookies">
        <p>Utilizamos las siguientes categorías de cookies:</p>
        <ul>
          <li><strong>Esenciales:</strong> necesarias para la autenticación y el funcionamiento de la plataforma. No se pueden desactivar.</li>
          <li><strong>Analíticas (opcionales):</strong> recopilan datos agregados y anónimos sobre el uso del servicio para mejorar el producto. Solo se activan con tu consentimiento explícito.</li>
        </ul>
        <p>Puedes gestionar tus preferencias en cualquier momento desde el banner de cookies o desde la configuración de tu navegador.</p>
      </Section>

      <Section title="8. Seguridad">
        <p>
          Aplicamos medidas técnicas y organizativas adecuadas: cifrado en tránsito (TLS 1.3) y en reposo,
          control de acceso por roles, políticas de seguridad a nivel de fila (Row Level Security) en la base de datos,
          y auditorías periódicas de seguridad.
        </p>
      </Section>

      <Section title="9. Cambios en esta política">
        <p>
          Podemos actualizar esta política para reflejar cambios en el servicio o en la legislación.
          Te notificaremos por correo electrónico con al menos 30 días de antelación antes de que los cambios
          sean efectivos. El uso continuado del servicio tras esa fecha implica aceptación de la nueva política.
        </p>
      </Section>

      <Section title="10. Contacto">
        <p>
          Para cualquier consulta sobre privacidad:{' '}
          <a href="mailto:privacidad@lexia.es" className="text-emerald-600 hover:underline">privacidad@lexia.es</a>
        </p>
      </Section>
    </article>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mb-10">
      <h2 className="text-xl font-semibold text-gray-900 mb-4">{title}</h2>
      <div className="text-gray-700 leading-relaxed space-y-3">{children}</div>
    </section>
  )
}
