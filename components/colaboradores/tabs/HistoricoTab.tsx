import { CheckCircle2, XCircle, Clock, ChartArea } from "lucide-react"
import type { HistorialColaborador } from "@/lib/colaboradores/type"

type HistoricoTabProps = {
  historialColaborador: HistorialColaborador[]
}

export default function HistoricoTab({ historialColaborador }: HistoricoTabProps) {
  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold text-foreground">Historial de Actividades</h2>
      </div>
      <div className="relative">
        {/* Timeline line */}
        <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-border" />

        <div className="space-y-6">
          {historialColaborador.map((item, index) => (
            <div key={index} className="relative flex gap-4">
              {/* Timeline dot */}
              <div
                className={`relative z-10 w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 ${
                  item.TIPO === "success"
                    ? "bg-green-100 dark:bg-green-900"
                    : item.TIPO === "error"
                      ? "bg-red-100 dark:bg-red-900"
                      : "bg-blue-100 dark:bg-blue-900"
                }`}
              >
                {item.TIPO === "success" && (
                  <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400" />
                )}
                {item.TIPO === "error" && (
                  <XCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
                )}
                {item.TIPO === "info" && (
                  <Clock className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                )}
              </div>

              {/* Content */}
              <div className="flex-1 bg-card rounded-lg p-4 border border-border">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="text-base font-semibold text-foreground">{item.ACCION}</h3>
                  <div className="text-xs text-muted-foreground">
                    <div>{item.FECHA}</div>
                    <div>{item.TIEMPO}</div>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground">{item.DETALLE}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {historialColaborador.length === 0 && (
        <div className="text-center py-10 text-muted-foreground">
          <div className="h-20 w-20 rounded-full bg-muted mx-auto mb-4 flex items-center justify-center">
            <ChartArea className="h-10 w-10 opacity-50" />
          </div>
          <p className="text-lg font-medium">No se ha encontrado historial de colaborador.</p>
        </div>
      )}
    </div>
  )
}
