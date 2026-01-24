import { BookOpen, FileText } from "lucide-react"
import type { CapacitacionColaborador } from "@/lib/colaboradores/type"

type CapacitacionesTabProps = {
  capacitaciones: CapacitacionColaborador[]
  onDownloadAsistencia: (sesionId: number) => void
  loadingDownload: boolean
}

export default function CapacitacionesTab({
  capacitaciones,
  onDownloadAsistencia,
  loadingDownload,
}: CapacitacionesTabProps) {
  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold text-foreground">Todas las Capacitaciones</h2>
      </div>
      <div className="space-y-4">
        {capacitaciones.map((capacitacion, index) => (
          <div
            key={index}
            className="bg-card rounded-lg p-6 border border-border hover:border-primary transition-colors"
          >
            <div className="flex flex-col sm:flex-row gap-4 items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-4 mb-2">
                  <h3 className="text-base font-semibold text-foreground">{capacitacion.NOMBRE_CAPACITACION}</h3>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      capacitacion.ESTADO === "Completado"
                        ? "bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300"
                        : capacitacion.ESTADO === "En Progreso"
                          ? "bg-yellow-100 dark:bg-yellow-900 text-yellow-700 dark:text-yellow-300"
                          : "bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300"
                    }`}
                  >
                    {capacitacion.ESTADO}
                  </span>
                </div>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <span>{capacitacion.FECHA}</span>
                  {capacitacion.NOTA && (
                    <>
                      <div className="w-px h-4 bg-border" />
                      <span>Nota: {capacitacion.NOTA}</span>
                    </>
                  )}
                </div>
              </div>
              {capacitacion.ASISTENCIA && (
                <button
                  onClick={() => onDownloadAsistencia(capacitacion.ID_SESION)}
                  disabled={loadingDownload}
                  className="flex text-sm items-center gap-2 px-4 py-2 border border-border text-foreground font-semibold rounded-lg hover:bg-muted transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <FileText className="w-4 h-4" />
                  Ver Asistencia
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {capacitaciones.length === 0 && (
        <div className="text-center py-10 text-muted-foreground">
          <div className="h-20 w-20 rounded-full bg-muted mx-auto mb-4 flex items-center justify-center">
            <BookOpen className="h-10 w-10 opacity-50" />
          </div>
          <p className="text-lg font-medium">No se encontraron capacitaciones</p>
        </div>
      )}
    </div>
  )
}
