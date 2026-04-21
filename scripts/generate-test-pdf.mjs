// Generates a minimal valid PDF with invoice content at public/test-doc.pdf
import { writeFileSync, existsSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const outputPath = join(__dirname, '..', 'public', 'test-doc.pdf')

if (existsSync(outputPath)) {
  console.log('test-doc.pdf ya existe, omitiendo generación.')
  process.exit(0)
}

function buildPdf() {
  const streamText = [
    'BT',
    '/F1 12 Tf',
    '50 750 Td',
    '(FACTURA NUM: 2024-001) Tj',
    '0 -18 Td',
    '(Proveedor: Acme Solutions S.L.) Tj',
    '0 -18 Td',
    '(NIF: B-12345678) Tj',
    '0 -18 Td',
    '(Fecha de emision: 15/01/2024) Tj',
    '0 -18 Td',
    '(Concepto: Servicios de consultoria IT) Tj',
    '0 -18 Td',
    '(Base imponible: 1.000,00 EUR) Tj',
    '0 -18 Td',
    '(IVA 21%: 210,00 EUR) Tj',
    '0 -18 Td',
    '(TOTAL FACTURA: 1.210,00 EUR) Tj',
    'ET',
  ].join('\n')

  const streamLen = Buffer.byteLength(streamText, 'latin1')

  const obj1 = '1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n'
  const obj2 = '2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n'
  const obj3 =
    '3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792]' +
    ' /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >>\nendobj\n'
  const obj4 = `4 0 obj\n<< /Length ${streamLen} >>\nstream\n${streamText}\nendstream\nendobj\n`
  const obj5 =
    '5 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>\nendobj\n'

  const header = '%PDF-1.4\n'
  const body = obj1 + obj2 + obj3 + obj4 + obj5

  // Compute xref offsets
  const off1 = Buffer.byteLength(header, 'latin1')
  const off2 = off1 + Buffer.byteLength(obj1, 'latin1')
  const off3 = off2 + Buffer.byteLength(obj2, 'latin1')
  const off4 = off3 + Buffer.byteLength(obj3, 'latin1')
  const off5 = off4 + Buffer.byteLength(obj4, 'latin1')
  const xrefStart = off1 + Buffer.byteLength(body, 'latin1')

  const pad = (n) => String(n).padStart(10, '0')
  const xref = [
    'xref',
    '0 6',
    `0000000000 65535 f `,
    `${pad(off1)} 00000 n `,
    `${pad(off2)} 00000 n `,
    `${pad(off3)} 00000 n `,
    `${pad(off4)} 00000 n `,
    `${pad(off5)} 00000 n `,
  ].join('\n') + '\n'

  const trailer = `trailer\n<< /Size 6 /Root 1 0 R >>\nstartxref\n${xrefStart}\n%%EOF\n`

  return Buffer.from(header + body + xref + trailer, 'latin1')
}

const pdfBuffer = buildPdf()
writeFileSync(outputPath, pdfBuffer)
console.log(`test-doc.pdf creado en ${outputPath} (${pdfBuffer.length} bytes)`)
