"use client"

import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog"
import { Calendar, Users, Award, Building2, Briefcase, CheckCircle2, XCircle, Target, BookOpen } from "lucide-react"
import type { ProgramaDetalle } from "@/lib/programas_capacitacion/types"
import type { Departamento, Puesto } from "@/lib/types"

interface TrainingDetailModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  training: ProgramaDetalle | null
  departamentos: Departamento[]
  puestos: Puesto[]
}

const MESES = [
  "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
  "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
]

export function TrainingDetailModal({
  open,
  onOpenChange,
  training,
}: TrainingDetailModalProps) {
  if (!training) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="md:max-w-3xl max-h-[90vh] overflow-y-auto p-8 border-2 shadow-2xl">
        {/* Header con gradiente */}
        <div className="relative overflow-hidden">
          <div className="relative z-10">
            <div className="flex items-start gap-3 mb-3">
              <div className="p-2 bg-white/20 backdrop-blur-sm rounded-lg">
                <BookOpen className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <DialogTitle className="text-2xl font-bold mb-2 pr-8">
                  {training.NOMBRE}
                </DialogTitle>
                <div className="flex flex-wrap gap-2">
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs backdrop-blur-sm border-2">
                    {training.CATEGORIA_CAPACITACION}
                  </span>
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs backdrop-blur-sm border-2">
                    {training.TIPO_CAPACITACION}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          {/* Grid de información principal */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/20 dark:to-orange-950/20 p-4 rounded-xl border border-amber-200 dark:border-amber-800">
              <div className="flex items-center gap-2 mb-2">
                <Calendar className="w-4 h-4 text-amber-700 dark:text-amber-400" />
                <p className="text-xs font-semibold text-amber-600 dark:text-amber-400">Mes Programado</p>
              </div>
              <p className="text-2xl font-bold text-amber-900 dark:text-amber-300">
                {MESES[training.MES_PROGRAMADO - 1]}
              </p>
              <p className="text-xs text-amber-700 dark:text-amber-400 mt-1">
                Mes {training.MES_PROGRAMADO} del año
              </p>
            </div>

            <div className={`bg-gradient-to-br p-4 rounded-xl border ${
              training.ESTADO === "ACTIVO"
                ? "from-emerald-50 to-green-50 dark:from-emerald-950/20 dark:to-green-950/20 border-emerald-200 dark:border-emerald-800"
                : "from-rose-50 to-red-50 dark:from-rose-950/20 dark:to-red-950/20 border-rose-200 dark:border-rose-800"
            }`}>
              <div className="flex items-center gap-2 mb-2">
                {training.ESTADO === "ACTIVO" ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-700 dark:text-emerald-400" />
                ) : (
                  <XCircle className="w-4 h-4 text-rose-700 dark:text-rose-400" />
                )}
                <p className={`text-xs font-semibold ${
                  training.ESTADO === "ACTIVO"
                    ? "text-emerald-600 dark:text-emerald-400"
                    : "text-rose-600 dark:text-rose-400"
                }`}>
                  Estado
                </p>
              </div>
              <p className={`text-2xl font-bold ${
                training.ESTADO === "ACTIVO"
                  ? "text-emerald-900 dark:text-emerald-300"
                  : "text-rose-900 dark:text-rose-300"
              }`}>
                {training.ESTADO}
              </p>
            </div>

            <div className={`bg-gradient-to-br p-4 rounded-xl border ${
              training.APLICA_DIPLOMA
                ? "from-violet-50 to-purple-50 dark:from-violet-950/20 dark:to-purple-950/20 border-violet-200 dark:border-violet-800"
                : "from-slate-50 to-slate-100 dark:from-slate-900/20 dark:to-slate-800/20 border-slate-200 dark:border-slate-700"
            }`}>
              <div className="flex items-center gap-2 mb-2">
                <Award className={`w-4 h-4 ${
                  training.APLICA_DIPLOMA
                    ? "text-violet-700 dark:text-violet-400"
                    : "text-slate-600 dark:text-slate-400"
                }`} />
                <p className={`text-xs font-semibold ${
                  training.APLICA_DIPLOMA
                    ? "text-violet-600 dark:text-violet-400"
                    : "text-slate-600 dark:text-slate-400"
                }`}>
                  Certificación
                </p>
              </div>
              <p className={`text-lg font-bold ${
                training.APLICA_DIPLOMA
                  ? "text-violet-900 dark:text-violet-300"
                  : "text-slate-700 dark:text-slate-300"
              }`}>
                {training.APLICA_DIPLOMA ? "Con Diploma" : "Sin Diploma"}
              </p>
            </div>

            <div className="bg-gradient-to-br from-cyan-50 to-blue-50 dark:from-cyan-950/20 dark:to-blue-950/20 p-4 rounded-xl border border-cyan-200 dark:border-cyan-800">
              <div className="flex items-center gap-2 mb-2">
                <Target className="w-4 h-4 text-cyan-700 dark:text-cyan-400" />
                <p className="text-xs font-semibold text-cyan-600 dark:text-cyan-400">Tipo</p>
              </div>
              <p className="text-lg font-bold text-cyan-900 dark:text-cyan-300">
                {training.TIPO_CAPACITACION}
              </p>
            </div>
          </div>

          {/* Alcance de la Capacitación */}
          <div className="border-2 rounded-xl overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-200 dark:border-slate-700">
              <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
                <Users className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                Alcance de la Capacitación
              </h3>
            </div>

            <div className="p-5">
              {training.APLICA_TODOS_COLABORADORES ? (
                <div className="text-center py-8">
                  <div className="inline-flex p-4 bg-gradient-to-br from-emerald-100 to-green-100 dark:from-emerald-900/30 dark:to-green-900/30 rounded-full mb-3">
                    <Users className="w-8 h-8 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <p className="text-lg font-bold text-foreground mb-1">
                    Aplica a todos los colaboradores
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Esta capacitación está dirigida a toda la organización
                  </p>
                </div>
              ) : (
                <div className="space-y-5">
                  {/* Departamentos */}
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                        <Building2 className="w-4 h-4 text-blue-700 dark:text-blue-400" />
                      </div>
                      <h4 className="text-sm font-bold text-foreground">
                        Departamentos
                        <span className="ml-2 text-xs font-semibold text-muted-foreground">
                          ({training.DEPARTAMENTO_RELACIONES.length})
                        </span>
                      </h4>
                    </div>
                    {training.DEPARTAMENTO_RELACIONES.length > 0 ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        {training.DEPARTAMENTO_RELACIONES.map((dept) => (
                          <div
                            key={dept.ID_DEPARTAMENTO}
                            className="flex items-center gap-3 p-3 bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg"
                          >
                            <div className="p-2 bg-blue-500 rounded-lg">
                              <Building2 className="w-4 h-4 text-white" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-bold text-sm text-blue-900 dark:text-blue-300 truncate">
                                {dept.NOMBRE}
                              </p>
                              <p className="text-xs text-blue-600 dark:text-blue-400 font-medium">
                                Código: {dept.CODIGO}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground italic p-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-200 dark:border-slate-700">
                        No se especificaron departamentos
                      </p>
                    )}
                  </div>

                  {/* Puestos */}
                  <div className="pt-6 border-t border-slate-200 dark:border-slate-800">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2.5">
                        <div className="p-2 bg-indigo-50 dark:bg-indigo-950/40 rounded-lg">
                          <Briefcase className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                        </div>
                        <h4 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                          Puestos
                          <span className="ml-2 text-xs font-semibold text-muted-foreground">
                            ({training.PUESTO_RELACIONES.length})
                          </span>
                        </h4>
                      </div>
                    </div>

                    {training.PUESTO_RELACIONES.length > 0 ? (
                      <div className="flex flex-wrap gap-2 justify-between">
                        {training.PUESTO_RELACIONES.map((puesto) => (
                          <div
                            key={puesto.ID_PUESTO}
                            className="group flex items-start gap-3 p-3 bg-white dark:bg-transparent border border-slate-200 dark:border-slate-800 rounded-xl hover:border-indigo-200 dark:hover:border-indigo-900 hover:bg-indigo-50/30 darkbg-indigo-950/10 transition-all duration-200 max-w-full sm:max-w-[calc(50%-0.5rem)]"
                          >
                            <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-indigo-500 shadow-[0_0_8px_rgba(99,102,241,0.6)] flex-shrink-0" />
                            
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-slate-700 dark:text-slate-300 leading-snug break-words">
                                {puesto.NOMBRE}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center p-8 bg-slate-50/50 dark:bg-slate-900/50 rounded-xl border border-dashed border-slate-200 dark:border-slate-800">
                        <p className="text-xs text-slate-400 font-medium">No hay puestos específicos asignados</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
