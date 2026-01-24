import { Check, X } from "lucide-react"
import type { Colaborador, ResumenColaborador } from "@/lib/colaboradores/type"
import { getCompletionColors } from "@/lib/colaboradores/type"

type GeneralTabProps = {
  collaborator: Colaborador
  resumenColaborador: ResumenColaborador[]
}

export default function GeneralTab({ collaborator, resumenColaborador }: GeneralTabProps) {
  const colors = getCompletionColors(collaborator.PORCENTAJE_CUMPLIMIENTO)

  return (
    <div className="space-y-6">
      <div className="bg-card border border-border rounded-lg p-6">
        <h2 className="text-xl font-semibold text-foreground mb-6">
          Estado Actual
        </h2>
        {/* Info lista */}
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3">
            <span className="text-muted-foreground font-medium">Puesto:</span>
            <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900 rounded-full text-sm font-semibold text-blue-700 dark:text-blue-300">
              {collaborator.PUESTO}
            </span>
          </div>
          <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3">
            <span className="text-muted-foreground font-medium">Jefe Inmediato:</span>
            <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900 rounded-full text-sm font-semibold text-blue-700 dark:text-blue-300">
              {collaborator.ENCARGADO}
            </span>
          </div>
          <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3">
            <span className="text-muted-foreground font-medium">Fecha de ingreso:</span>
            <span className="text-sm font-semibold text-muted-foreground">
              {collaborator.FECHA_INGRESO}
            </span>
          </div>
        </div>
        <div className="w-full h-px bg-border my-6" />

        {/* --- Porcentaje de cumplimiento --- */}
        <div className="bg-card border border-border rounded-lg p-6 flex flex-col items-center">
          <div className="relative w-24 h-24 mb-4">
            <div className={`absolute inset-0 rounded-full ${colors.lightClass}`} />
            <div
              className={`absolute inset-0 rounded-full border-4 ${colors.colorClass}`}
              style={{
                clipPath: `polygon(
                  0 0,
                  100% 0,
                  100% ${collaborator.PORCENTAJE_CUMPLIMIENTO}%,
                  0 ${collaborator.PORCENTAJE_CUMPLIMIENTO}%
                )`,
              }}
            />
            <div className="absolute inset-0 flex items-center justify-center">
              <span className={`text-base font-semibold ${colors.textClass}`}>
                {collaborator.PORCENTAJE_CUMPLIMIENTO}%
              </span>
            </div>
          </div>
          <p className="text-base font-semibold text-foreground">
            % de cumplimiento
          </p>
        </div>
      </div>

      {/* --- Resumen del Estado de Capacitación --- */}
      <div className="bg-card border-2 border-border rounded-lg p-6">
        <h2 className="text-lg font-semibold text-foreground mb-6">
          Resumen del Estado de Capacitación
        </h2>
        <div className="space-y-4">
          {resumenColaborador.map((item, index) => (
            <div
              key={index}
              className="flex items-center justify-between gap-4"
            >
              <span className="text-base text-foreground font-medium">
                {item.ETIQUETA}
              </span>
              <div className="flex items-center gap-2 text-right">
                {item.VALOR && (
                  <span className="text-base text-muted-foreground">
                    {item.VALOR}
                  </span>
                )}
                {item.ESTADO === "check" && (
                  <Check className="w-5 h-5 text-green-500" strokeWidth={3} />
                )}
                {item.ESTADO === "cross" && (
                  <X className="w-5 h-5 text-red-500" strokeWidth={3} />
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
