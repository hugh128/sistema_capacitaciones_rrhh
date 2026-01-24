import { GraduationCap, User, Briefcase, Calendar, FileCheck, Download, Check, X } from "lucide-react"
import type { DETALLE_PLAN_COLABORADOR } from "@/lib/colaboradores/type"

type InduccionTabProps = {
  detallePlanColaborador?: DETALLE_PLAN_COLABORADOR
  onDownloadPlanInduccion: (idPlan: number) => void
  loadingDownload: boolean
}

export default function InduccionTab({
  detallePlanColaborador,
  onDownloadPlanInduccion,
  loadingDownload,
}: InduccionTabProps) {
  if (!detallePlanColaborador) {
    return (
      <div className="text-center py-10 text-muted-foreground">
        <div className="h-20 w-20 rounded-full bg-muted mx-auto mb-4 flex items-center justify-center">
          <GraduationCap className="h-10 w-10 opacity-50" />
        </div>
        <p className="text-lg font-medium">Cargando información de inducción...</p>
      </div>
    )
  }

  if (detallePlanColaborador.PLANES.length === 0) {
    return (
      <div className="text-center py-10 text-muted-foreground">
        <div className="h-20 w-20 rounded-full bg-muted mx-auto mb-4 flex items-center justify-center">
          <GraduationCap className="h-10 w-10 opacity-50" />
        </div>
        <p className="text-lg font-medium">
          No hay planes de inducción activos para este colaborador.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Información del Colaborador */}
      <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 rounded-lg p-6 border border-blue-200 dark:border-blue-800">
        <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
          <User className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          Información del Colaborador
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
              <User className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Colaborador</p>
              <p className="text-sm font-semibold text-foreground">
                {detallePlanColaborador.INFORMACION_COLABORADOR.nombreColaborador}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-purple-100 dark:bg-purple-900 flex items-center justify-center">
              <Briefcase className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Departamento</p>
              <p className="text-sm font-semibold text-foreground">
                {detallePlanColaborador.INFORMACION_COLABORADOR.departamentoColaborador}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center">
              <GraduationCap className="w-5 h-5 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Cargo</p>
              <p className="text-sm font-semibold text-foreground">
                {detallePlanColaborador.INFORMACION_COLABORADOR.cargo}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-orange-100 dark:bg-orange-900 flex items-center justify-center">
              <User className="w-5 h-5 text-orange-600 dark:text-orange-400" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Jefe Inmediato</p>
              <p className="text-sm font-semibold text-foreground">
                {detallePlanColaborador.INFORMACION_COLABORADOR.jefeInmediatoNombre}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Planes de Inducción */}
      <div>
        <h2 className="text-lg font-semibold text-foreground mb-4">Planes de Inducción</h2>
        <div className="space-y-4">
          {detallePlanColaborador.PLANES.map((plan) => {
            const capacitacionesPlan = detallePlanColaborador.DETALLE_CAPACITACIONES.filter(
              (cap) => cap.ID_PLAN === plan.ID_PLAN
            )

            const capacitacionesPorDepartamento = capacitacionesPlan.reduce((acc, cap) => {
              if (!acc[cap.departamentoCapacitacion]) {
                acc[cap.departamentoCapacitacion] = []
              }
              acc[cap.departamentoCapacitacion].push(cap)
              return acc
            }, {} as Record<string, typeof capacitacionesPlan>)

            const progressColor = plan.planCompletado
              ? "bg-green-500"
              : plan.porcentajeCompletado >= 50
                ? "bg-yellow-500"
                : "bg-blue-500"

            return (
              <div
                key={plan.ID_PLAN_COLABORADOR}
                className="bg-card rounded-lg border border-border overflow-hidden"
              >
                {/* Encabezado del Plan */}
                <div className="bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-950 dark:to-indigo-950 p-6">
                  <div className="flex flex-col gap-4 sm:flex-row sm:gap-0 items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="text-xl font-semibold text-white mb-2">
                          {plan.nombrePlan}{" "}
                          <span
                            className={`
                              px-2 py-0.5 rounded-full text-xs font-semibold align-middle
                              ${
                                plan.estadoPlan === "ACTIVO"
                                  ? "bg-green-200 text-green-800"
                                  : "bg-red-200 text-red-800"
                              }
                            `}
                          >
                            {plan.estadoPlan}
                          </span>
                        </h3>
                      </div>
                      <p className="text-blue-100 text-sm mb-3">{plan.descripcionPlan}</p>
                      <div className="flex flex-wrap gap-3">
                        <div className="flex items-center gap-2 bg-white/20 px-3 py-1.5 rounded-lg">
                          <Calendar className="w-4 h-4 text-white" />
                          <span className="text-xs text-white font-medium">
                            Inicio:{" "}
                            {new Date(plan.fechaInicioInduccion).toLocaleDateString("es-GT")}
                          </span>
                        </div>
                        {plan.fechaFinInduccion && (
                          <div className="flex items-center gap-2 bg-white/20 px-3 py-1.5 rounded-lg">
                            <Calendar className="w-4 h-4 text-white" />
                            <span className="text-xs text-white font-medium">
                              Fin: {new Date(plan.fechaFinInduccion).toLocaleDateString("es-GT")}
                            </span>
                          </div>
                        )}
                        <div className="flex items-center gap-2 bg-white/20 px-3 py-1.5 rounded-lg">
                          <FileCheck className="w-4 h-4 text-white" />
                          <span className="text-xs text-white font-medium">
                            {plan.capacitacionesCompletadas} de {plan.totalCapacitaciones}{" "}
                            completadas
                          </span>
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => onDownloadPlanInduccion(plan.ID_PLAN)}
                      disabled={loadingDownload}
                      className="flex items-center gap-2 px-2 sm:px-4 py-2 text-sm bg-white text-blue-600 font-semibold rounded-lg hover:bg-blue-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                    >
                      <Download className="w-4 h-4" />
                      Descargar Plan
                    </button>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-blue-100 font-medium">Progreso del Plan</span>
                      <span className="text-xs text-white font-semibold">
                        {plan.porcentajeCompletado.toFixed(0)}%
                      </span>
                    </div>
                    <div className="w-full h-2.5 bg-white/20 rounded-full overflow-hidden">
                      <div
                        className={`h-full ${progressColor} transition-all duration-500 rounded-full`}
                        style={{ width: `${plan.porcentajeCompletado}%` }}
                      />
                    </div>
                  </div>
                </div>

                <div className="p-6 space-y-6">
                  {Object.entries(capacitacionesPorDepartamento).map(
                    ([departamento, capacitaciones]) => (
                      <div key={departamento}>
                        <div className="flex items-center gap-2 mb-3">
                          <div className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                            <span className="text-xs font-bold text-blue-600 dark:text-blue-400">
                              {capacitaciones[0].codigoDepartamento}
                            </span>
                          </div>
                          <h4 className="text-base font-semibold text-foreground">
                            {departamento}
                          </h4>
                          <span className="text-xs text-muted-foreground">
                            ({capacitaciones.length}{" "}
                            {capacitaciones.length === 1 ? "capacitación" : "capacitaciones"})
                          </span>
                        </div>

                        <div className="space-y-3">
                          {capacitaciones.map((cap, idx) => (
                            <div
                              key={idx}
                              className="bg-muted/30 rounded-lg p-4 border border-border hover:border-primary/50 transition-all"
                            >
                              <div className="flex items-start justify-between gap-4 mb-3">
                                <div className="flex-1">
                                  <h5 className="text-sm font-semibold text-foreground mb-1">
                                    {cap.documento}
                                  </h5>
                                  <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                                    <span className="font-mono bg-muted px-2 py-0.5 rounded">
                                      {cap.codigo}
                                    </span>
                                    <span>•</span>
                                    <span>Versión {cap.version ?? "0"}</span>
                                    <span>•</span>
                                    <span>Capacitador: {cap.nombreCapacitador}</span>
                                  </div>
                                </div>
                                <span
                                  className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap ${
                                    cap.estatus === "Completa"
                                      ? "bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300"
                                      : cap.estatus === "Sin Sesión Asignada"
                                        ? "bg-yellow-100 dark:bg-yellow-900 text-yellow-700 dark:text-yellow-300"
                                        : cap.estatus === "Reprobada"
                                          ? "bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300"
                                          : cap.estatus === "Incompleta"
                                            ? "bg-orange-100 dark:bg-orange-900 text-orange-700 dark:text-orange-300"
                                            : cap.estatus === "En Revisión"
                                              ? "bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300"
                                              : "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300"
                                  }`}
                                >
                                  {cap.estatus}
                                </span>
                              </div>

                              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                <div className="flex items-center gap-2 bg-card p-2 rounded border border-border">
                                  <div
                                    className={`w-5 h-5 rounded flex items-center justify-center ${
                                      cap.lectura
                                        ? "bg-green-100 dark:bg-green-900"
                                        : "bg-gray-100 dark:bg-gray-800"
                                    }`}
                                  >
                                    {cap.lectura ? (
                                      <Check
                                        className="w-3 h-3 text-green-600 dark:text-green-400"
                                        strokeWidth={3}
                                      />
                                    ) : (
                                      <X className="w-3 h-3 text-gray-400" strokeWidth={2} />
                                    )}
                                  </div>
                                  <span className="text-xs text-muted-foreground">Lectura</span>
                                </div>

                                <div className="flex items-center gap-2 bg-card p-2 rounded border border-border">
                                  <div
                                    className={`w-5 h-5 rounded flex items-center justify-center ${
                                      cap.capacitacion
                                        ? "bg-green-100 dark:bg-green-900"
                                        : "bg-gray-100 dark:bg-gray-800"
                                    }`}
                                  >
                                    {cap.capacitacion ? (
                                      <Check
                                        className="w-3 h-3 text-green-600 dark:text-green-400"
                                        strokeWidth={3}
                                      />
                                    ) : (
                                      <X className="w-3 h-3 text-gray-400" strokeWidth={2} />
                                    )}
                                  </div>
                                  <span className="text-xs text-muted-foreground">
                                    Capacitación
                                  </span>
                                </div>

                                <div className="flex items-center gap-2 bg-card p-2 rounded border border-border">
                                  <div
                                    className={`w-5 h-5 rounded flex items-center justify-center ${
                                      cap.evaluacion
                                        ? "bg-green-100 dark:bg-green-900"
                                        : "bg-gray-100 dark:bg-gray-800"
                                    }`}
                                  >
                                    {cap.evaluacion ? (
                                      <Check
                                        className="w-3 h-3 text-green-600 dark:text-green-400"
                                        strokeWidth={3}
                                      />
                                    ) : (
                                      <X className="w-3 h-3 text-gray-400" strokeWidth={2} />
                                    )}
                                  </div>
                                  <span className="text-xs text-muted-foreground">Evaluación</span>
                                </div>

                                <div className="flex items-center gap-2 bg-card p-2 rounded border border-border">
                                  <div
                                    className={`w-5 h-5 rounded flex items-center justify-center ${
                                      cap.calificacion
                                        ? "bg-blue-100 dark:bg-blue-900"
                                        : "bg-gray-100 dark:bg-gray-800"
                                    }`}
                                  >
                                    <span
                                      className={`text-[10px] font-bold ${
                                        cap.calificacion
                                          ? "text-blue-600 dark:text-blue-400"
                                          : "text-gray-400"
                                      }`}
                                    >
                                      {cap.calificacion || "-"}
                                    </span>
                                  </div>
                                  <span className="text-xs text-muted-foreground">Nota</span>
                                </div>
                              </div>

                              {cap.fechaEvaluacion && (
                                <div className="mt-2 pt-2 border-t border-border">
                                  <span className="text-xs text-muted-foreground">
                                    Fecha de evaluación:{" "}
                                    {new Date(cap.fechaEvaluacion).toLocaleDateString("es-GT")}
                                  </span>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
