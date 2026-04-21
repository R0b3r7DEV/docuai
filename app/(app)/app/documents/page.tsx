'use client'

import { useDocuments } from '@/hooks/useDocuments'
import { UploadZone } from '@/components/app/UploadZone'
import { DocumentTable } from '@/components/app/DocumentTable'
import { ExportButton } from '@/components/app/ExportButton'

export default function DocumentsPage() {
  const {
    documents,
    isLoading,
    pagination,
    filters,
    setFilters,
    refresh,
    deleteDocument,
  } = useDocuments()

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-2xl font-semibold">Documentos</h2>
          {!isLoading && (
            <p className="text-sm text-muted-foreground mt-0.5">
              {pagination.total === 0
                ? 'Sin documentos todavía'
                : `${pagination.total} documento${pagination.total !== 1 ? 's' : ''}`}
            </p>
          )}
        </div>
        <ExportButton filters={filters} disabled={pagination.total === 0} />
      </div>

      {/* Upload zone */}
      <UploadZone onUploadComplete={refresh} />

      {/* Document table */}
      <DocumentTable
        documents={documents}
        isLoading={isLoading}
        currentFilters={filters}
        onFilter={setFilters}
        onDelete={deleteDocument}
        pagination={pagination}
        onPageChange={(page) => setFilters({ ...filters, page })}
        onSort={() => {}}
      />
    </div>
  )
}
