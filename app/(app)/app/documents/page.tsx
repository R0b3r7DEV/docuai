'use client'

import { Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import { useDocuments } from '@/hooks/useDocuments'
import { UploadZone } from '@/components/app/UploadZone'
import { DocumentTable } from '@/components/app/DocumentTable'
import { ExportButton } from '@/components/app/ExportButton'
import { UpgradeBanner } from '@/components/app/UpgradeBanner'
import { CheckCircle } from 'lucide-react'

function DocumentsContent() {
  const {
    documents,
    isLoading,
    pagination,
    filters,
    setFilters,
    refresh,
    deleteDocument,
  } = useDocuments()

  const searchParams = useSearchParams()
  const [showUpgradeSuccess, setShowUpgradeSuccess] = useState(false)

  useEffect(() => {
    if (searchParams.get('upgraded') === 'true') {
      setShowUpgradeSuccess(true)
      setTimeout(() => setShowUpgradeSuccess(false), 6000)
    }
  }, [searchParams])

  return (
    <div className="flex flex-col gap-5">
      {showUpgradeSuccess && (
        <div className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm bg-emerald-50 border border-emerald-200 text-emerald-800">
          <CheckCircle className="h-4 w-4 text-emerald-600 shrink-0" />
          <span className="font-medium">¡Bienvenido a Lexia Pro!</span>
          <span className="text-emerald-700">Ya puedes subir hasta 20 documentos al mes.</span>
        </div>
      )}

      <UpgradeBanner />

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
        <div className="flex items-center gap-2">
          <ExportButton filters={filters} disabled={pagination.total === 0} />
        </div>
      </div>

      <UploadZone onUploadComplete={refresh} />

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

export default function DocumentsPage() {
  return (
    <Suspense>
      <DocumentsContent />
    </Suspense>
  )
}
