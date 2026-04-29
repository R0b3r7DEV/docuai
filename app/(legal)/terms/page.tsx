import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Términos de servicio',
  robots: { index: true, follow: false },
}

export default function TermsPage() {
  return (
    <article className="prose prose-gray max-w-none">
      <h1 className="text-3xl font-bold text-gray-900 mb-2">Términos de servicio</h1>
      <p className="text-gray-500 mb-10">Última actualización: 29 de abril de 2026</p>

      <Section title="1. Objeto y aceptación">
        <p>
          Estos Términos de Servicio («Términos») regulan el acceso y uso de la plataforma Lexia,
          un servicio de gestión documental inteligente operado por Lexia («nosotros», «el servicio»).
        </p>
        <p>
          Al registrarte o utilizar el servicio, aceptas estos Términos en su totalidad. Si actúas en nombre
          de una empresa u organización, confirmas que tienes autoridad para vincularla a estos Términos.
        </p>
      </Section>

      <Section title="2. Descripción del servicio">
        <p>Lexia permite a empresas y profesionales:</p>
        <ul>
          <li>Subir y almacenar documentos empresariales (facturas, contratos, nóminas, etc.).</li>
          <li>Extraer automáticamente información estructurada mediante inteligencia artificial.</li>
          <li>Consultar y analizar documentos a través de un asistente conversacional.</li>
          <li>Gestionar equipos y, en planes avanzados, ofrecer el servicio bajo su propia marca (white-label).</li>
        </ul>
      </Section>

      <Section title="3. Registro y cuenta">
        <ul>
          <li>Debes proporcionar información veraz y actualizada al registrarte.</li>
          <li>Eres responsable de mantener la confidencialidad de tus credenciales de acceso.</li>
          <li>Debes notificarnos inmediatamente cualquier uso no autorizado de tu cuenta.</li>
          <li>Debes tener al menos 18 años o actuar como representante legal de una empresa.</li>
        </ul>
      </Section>

      <Section title="4. Planes y precios">
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="text-left py-2 pr-4 font-semibold">Plan</th>
              <th className="text-left py-2 pr-4 font-semibold">Precio</th>
              <th className="text-left py-2 font-semibold">Descripción</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {[
              ['Free / Trial', 'Gratis', 'Hasta 10 documentos. Solo para evaluación.'],
              ['Gestoría', '49 €/mes', 'Documentos ilimitados, modo gestoría.'],
              ['Gestoría Pro', '99 €/mes', 'Todo lo anterior + funciones avanzadas.'],
              ['White-label', '299 €/mes', 'Marca personalizada para hasta 100 clientes.'],
              ['White-label Pro', '599 €/mes', 'Marca personalizada para clientes ilimitados.'],
            ].map(([plan, precio, desc]) => (
              <tr key={plan}>
                <td className="py-2 pr-4 font-medium">{plan}</td>
                <td className="py-2 pr-4 text-gray-600">{precio}</td>
                <td className="py-2 text-gray-600">{desc}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <p>
          Los precios son en euros e incluyen el IVA aplicable. Nos reservamos el derecho a modificar los precios
          con un preaviso mínimo de 30 días por correo electrónico.
        </p>
      </Section>

      <Section title="5. Facturación y cancelación">
        <ul>
          <li>La suscripción se factura mensualmente por adelantado mediante Stripe.</li>
          <li>Puedes cancelar tu suscripción en cualquier momento desde <em>Configuración → Facturación</em>. El acceso se mantiene hasta el final del período facturado.</li>
          <li>No ofrecemos reembolsos por períodos parciales, salvo que la ley aplicable lo exija.</li>
          <li>En caso de impago, el acceso puede suspenderse tras un aviso previo.</li>
        </ul>
      </Section>

      <Section title="6. Uso aceptable">
        <p>Está <strong>prohibido</strong> utilizar el servicio para:</p>
        <ul>
          <li>Subir contenido ilegal, incluyendo documentos que vulneren derechos de terceros.</li>
          <li>Intentar acceder a datos de otras organizaciones o eludir los controles de seguridad.</li>
          <li>Realizar ingeniería inversa, descompilar o copiar el software.</li>
          <li>Usar el servicio para actividades fraudulentas o que violen la legislación española o europea.</li>
          <li>Sobrecargar intencionadamente la infraestructura (ataques DoS/DDoS).</li>
          <li>Hacer scraping o extracción masiva de datos de la plataforma.</li>
        </ul>
        <p>El incumplimiento puede resultar en la suspensión inmediata de la cuenta sin derecho a reembolso.</p>
      </Section>

      <Section title="7. Propiedad intelectual">
        <ul>
          <li><strong>Tuya:</strong> eres el único propietario de los documentos que subes y de los datos extraídos de ellos.</li>
          <li><strong>Nuestra:</strong> el software, diseño, marca y tecnología de Lexia son propiedad exclusiva de Lexia. No adquieres ninguna licencia sobre ellos salvo el derecho de uso del servicio.</li>
          <li>Nos concedes una licencia limitada, no exclusiva y revocable para procesar tus documentos con el único fin de prestar el servicio.</li>
        </ul>
      </Section>

      <Section title="8. Privacidad y seguridad">
        <p>
          El tratamiento de datos personales se rige por nuestra{' '}
          <a href="/privacy" className="text-emerald-600 hover:underline">Política de privacidad</a>,
          que forma parte de estos Términos por referencia.
        </p>
        <p>
          Aplicamos medidas de seguridad adecuadas, pero no podemos garantizar la seguridad absoluta de ningún sistema.
          Eres responsable de mantener contraseñas seguras y de notificar cualquier brecha de seguridad que detectes.
        </p>
      </Section>

      <Section title="9. Limitación de responsabilidad">
        <p>
          En la máxima medida permitida por la ley española:
        </p>
        <ul>
          <li>El servicio se presta «tal cual» y «según disponibilidad».</li>
          <li>No somos responsables de decisiones empresariales tomadas en base a los resultados de la IA.</li>
          <li>La responsabilidad total acumulada de Lexia ante un cliente no superará el importe pagado por dicho cliente en los 12 meses anteriores al evento causante del daño.</li>
          <li>No somos responsables de daños indirectos, lucro cesante o pérdida de datos salvo por dolo o negligencia grave.</li>
        </ul>
      </Section>

      <Section title="10. Disponibilidad del servicio">
        <p>
          Nos comprometemos a mantener una disponibilidad razonable del servicio. Podemos interrumpirlo temporalmente
          por mantenimiento, actualizaciones o causas de fuerza mayor. Las interrupciones planificadas se anunciarán
          con antelación cuando sea posible.
        </p>
      </Section>

      <Section title="11. Modificación y resolución">
        <p>
          Podemos modificar estos Términos con un preaviso de 30 días. El uso continuado del servicio tras ese plazo
          implica aceptación de los cambios. Podemos resolver el contrato por incumplimiento grave de estos Términos,
          con aviso previo salvo en casos de urgencia.
        </p>
      </Section>

      <Section title="12. Ley aplicable y jurisdicción">
        <p>
          Estos Términos se rigen por la legislación española. Para la resolución de conflictos, las partes se
          someten a los juzgados y tribunales competentes de España, sin perjuicio de los derechos que la
          legislación de consumidores y usuarios otorga a quienes contraten como particulares.
        </p>
      </Section>

      <Section title="13. Contacto">
        <p>
          Para cualquier consulta:{' '}
          <a href="mailto:info@lexia.es" className="text-emerald-600 hover:underline">info@lexia.es</a>
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
