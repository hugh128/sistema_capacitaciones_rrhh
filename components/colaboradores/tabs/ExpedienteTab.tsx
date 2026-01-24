import { useState } from "react"
import { ChevronDown, ChevronUp, FileText, Download, Award, CheckCircle2 } from "lucide-react"
import type { CapacitacionColaborador } from "@/lib/colaboradores/type"

type ExpedienteTabProps = {
  capacitaciones: CapacitacionColaborador[]
  colaboradorId: number
  onDownloadAsistencia: (sesionId: number) => void
  onDownloadExamen: (colaboradorId: number, sesionId: number) => void
  onDownloadDiploma: (colaboradorId: number, sesionId: number) => void
  loadingDownload: boolean
}

export default function ExpedienteTab({
  capacitaciones,
  colaboradorId,
  onDownloadAsistencia,
  onDownloadExamen,
  onDownloadDiploma,
  loadingDownload,
}: ExpedienteTabProps) {
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set())

  const capacitacionesFinalizadas = capacitaciones.filter(
    (cap) => cap.ESTADO_SESION === "FINALIZADA"
  )

  const capacitacionesPorCategoria = capacitacionesFinalizadas.reduce((acc, cap) => {
    const categoria = cap.CATEGORIA || "Sin Categoría"
    if (!acc[categoria]) {
      acc[categoria] = []
    }
    acc[categoria].push(cap)
    return acc
  }, {} as Record<string, CapacitacionColaborador[]>)

  const categorias = Object.keys(capacitacionesPorCategoria).sort()

  const toggleCategoria = (categoria: string) => {
    setExpandedCategories((prev) => {
      const newSet = new Set(prev)
      if (newSet.has(categoria)) {
        newSet.delete(categoria)
      } else {
        newSet.add(categoria)
      }
      return newSet
    })
  }

  if (capacitacionesFinalizadas.length === 0) {
    return (
      <div className="text-center py-10 text-muted-foreground">
        <div className="h-20 w-20 rounded-full bg-muted mx-auto mb-4 flex items-center justify-center">
          <CheckCircle2 className="h-10 w-10 opacity-50" />
        </div>
        <p className="text-lg font-medium">No se encontraron capacitaciones finalizadas</p>
      </div>
    )
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold text-foreground">
          Expediente de Capacitaciones Finalizadas
        </h2>
        <span className="text-sm text-muted-foreground">
          {capacitacionesFinalizadas.length} {capacitacionesFinalizadas.length === 1 ? 'capacitación' : 'capacitaciones'}
        </span>
      </div>

      <div className="space-y-3">
        {categorias.map((categoria) => {
          const isExpanded = expandedCategories.has(categoria)
          const capacitacionesCategoria = capacitacionesPorCategoria[categoria]

          return (
            <div key={categoria} className="border border-border rounded-lg overflow-hidden">
              {/* Header de categoría */}
              <button
                onClick={() => toggleCategoria(categoria)}
                className="w-full flex items-center justify-between p-4 bg-muted/40 hover:bg-muted transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                    <span className="text-sm font-bold text-blue-600 dark:text-blue-400">
                      {capacitacionesCategoria.length}
                    </span>
                  </div>
                  <div className="text-left">
                    <h3 className="text-base font-semibold text-foreground">{categoria}</h3>
                    <p className="text-xs text-muted-foreground">
                      {capacitacionesCategoria.length} {capacitacionesCategoria.length === 1 ? 'capacitación completada' : 'capacitaciones completadas'}
                    </p>
                  </div>
                </div>
                {isExpanded ? (
                  <ChevronUp className="w-5 h-5 text-muted-foreground" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-muted-foreground" />
                )}
              </button>

              {/* Contenido expandible */}
              {isExpanded && (
                <div className="p-4 space-y-3 bg-card">
                  {capacitacionesCategoria.map((capacitacion, index) => (
                    <div
                      key={index}
                      className="bg-muted/30 rounded-lg p-4 border border-border hover:border-primary/50 transition-all"
                    >
                      <div className="flex flex-col gap-3">
                        {/* Header de la capacitación */}
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            <h4 className="text-sm font-semibold text-foreground mb-1">
                              {capacitacion.NOMBRE_CAPACITACION}
                            </h4>
                            <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                              {capacitacion.CODIGO_DOCUMENTO && (
                                <>
                                  <span className="font-mono bg-muted px-2 py-0.5 rounded">
                                    {capacitacion.CODIGO_DOCUMENTO}
                                  </span>
                                  <span>•</span>
                                </>
                              )}
                              <span>{capacitacion.FECHA}</span>
                              {capacitacion.NOTA && (
                                <>
                                  <span>•</span>
                                  <span className="font-semibold text-green-600 dark:text-green-400">
                                    Nota: {capacitacion.NOTA}
                                  </span>
                                </>
                              )}
                            </div>
                          </div>
                          <span className="px-3 py-1 rounded-full text-xs font-semibold bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 whitespace-nowrap">
                            Completado
                          </span>
                        </div>

                        {/* Botones de descarga */}
                        <div className="flex flex-wrap gap-2">
                          {capacitacion.ASISTENCIA && (
                            <button
                              onClick={() => onDownloadAsistencia(capacitacion.ID_SESION)}
                              disabled={loadingDownload}
                              className="flex items-center gap-2 px-3 py-2 text-xs bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300 font-semibold rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900 transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                            >
                              <FileText className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                              Descargar Asistencia
                            </button>
                          )}
                          {capacitacion.EXAMEN && (
                            <button
                              onClick={() => onDownloadExamen(colaboradorId, capacitacion.ID_SESION)}
                              disabled={loadingDownload}
                              className="flex items-center gap-2 px-3 py-2 text-xs bg-purple-50 dark:bg-purple-950 border border-purple-200 dark:border-purple-800 text-purple-700 dark:text-purple-300 font-semibold rounded-lg hover:bg-purple-100 dark:hover:bg-purple-900 transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                            >
                              <Download className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
                              Descargar Examen
                            </button>
                          )}
                          {capacitacion.DIPLOMA && (
                            <button
                              onClick={() => onDownloadDiploma(colaboradorId, capacitacion.ID_SESION)}
                              disabled={loadingDownload}
                              className="flex items-center gap-2 px-3 py-2 text-xs bg-amber-50 dark:bg-amber-950 border border-amber-200 dark:border-amber-800 text-amber-700 dark:text-amber-300 font-semibold rounded-lg hover:bg-amber-100 dark:hover:bg-amber-900 transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                            >
                              <Award className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                              Descargar Diploma
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
