import * as XLSX from 'xlsx'
import type { DocumentWithExtraction } from '@/types/database'

export function generateXlsx(documents: DocumentWithExtraction[]): Buffer {
  const rows = documents.map((doc) => ({
    Archivo: doc.filename,
    Tipo: doc.extraction?.type ?? '',
    Fecha: doc.extraction?.issue_date ?? '',
    Proveedor: doc.extraction?.vendor ?? '',
    Concepto: doc.extraction?.concept ?? '',
    'Importe (€)': doc.extraction?.amount ?? '',
    Categoría: doc.extraction?.category ?? '',
    'Subido el': new Date(doc.created_at).toLocaleDateString('es-ES'),
  }))

  const ws = XLSX.utils.json_to_sheet(rows)
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, 'Documentos')

  ws['!cols'] = [
    { wch: 35 }, { wch: 16 }, { wch: 14 }, { wch: 30 },
    { wch: 40 }, { wch: 12 }, { wch: 16 }, { wch: 14 },
  ]

  return Buffer.from(XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' }))
}
