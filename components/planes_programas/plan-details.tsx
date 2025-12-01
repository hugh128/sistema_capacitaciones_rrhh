"use client"

import { useEffect, useState } from "react"
import { ArrowLeft, Edit, Users, BookOpen, Calendar, Building2, Briefcase } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import type { CapacitacionPlan, ColaboradoresPlan, DetallePlan, PlanCapacitacion } from "@/lib/planes_programas/types"
import { usePlanesCapacitacion } from "@/hooks/usePlanesCapacitacion"
import { useAuth } from "@/contexts/auth-context"

interface PlanDetailsProps {
  plan: PlanCapacitacion
  onBack: () => void
  onEdit: (plan: PlanCapacitacion) => void
}

export const getEstatusSpanVariant = (estatus: string) => {
  switch (estatus) {
    case "activo":
      return "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
    case "borrador":
      return "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400"
    default:
      return "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
  }
}

export const getEstatusDocumentoVariant = (estatus: string) => {
  switch (estatus) {
    case "vigente":
      return "bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400"
    case "proceso":
      return "bg-yellow-50 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-400"
    case "vencido":
      return "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400"
    case "obsoleto":
      return "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
    default:
      return "bg-gray-100 text-gray-600 dark:bg-gray-700/30 dark:text-gray-400"
  }
}

export default function PlanDetails({ plan, onBack, onEdit }: PlanDetailsProps) {
  const { user } = useAuth()
  const {
    obtenerDetallePlanColaborador
  } = usePlanesCapacitacion(user)

  const [activeTab, setActiveTab] = useState("info")
  const [detallaPlan, setDetallaPlan] = useState<DetallePlan>();
  const [colaboradoresPlan, setColaboradoresPlan] = useState<ColaboradoresPlan[]>([]);

  useEffect(() => {
    if (!user || !user.PERSONA_ID) {
      return; 
    }

    const fetchData = async () => {
      try {
        const {
          DETALLE_PLAN,
          COLABORADORES_PLAN
        } = await obtenerDetallePlanColaborador(plan.ID_PLAN)
        setDetallaPlan(DETALLE_PLAN)
        setColaboradoresPlan(COLABORADORES_PLAN)

      } catch (error) {
        console.error('Error al cargar datos:', error)
      }
    }

    fetchData()
  }, [user, obtenerDetallePlanColaborador, plan.ID_PLAN])

  const getInitials = (nombre: string) => {
    return nombre
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2)
  }

  const getProgressColor = (progreso: number) => {
    if (progreso === 100) return "bg-green-500"
    if (progreso >= 50) return "bg-yellow-500"
    return "bg-blue-500"
  }

  return (
    <div className="flex-1 bg-card shadow-2xl rounded-lg overflow-hidden flex flex-col">
      <div className="bg-gradient-to-r from-primary to-primary/80 text-primary-foreground p-6 mt-8">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 md:gap-0">
          
          <div className="flex items-start md:items-center gap-4 w-full md:w-auto flex-wrap">
            <Button
              onClick={onBack}
              variant="ghost"
              size="sm"
              className="text-primary-foreground hover:bg-primary-foreground/20 cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
            </Button>

            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-3 mb-2">
                <h1 className="text-2xl md:text-3xl font-bold break-words">
                  {plan.NOMBRE}
                </h1>

                <span
                  className={`px-3 py-1 rounded-full text-xs font-semibold ${getEstatusSpanVariant(
                    plan.ESTADO.toLowerCase()
                  )}`}
                >
                  {plan.ESTADO}
                </span>
              </div>

              <p className="text-primary-foreground/80 text-sm break-words">
                Plantilla #{plan.ID_PLAN} • Tipo: {plan.TIPO}
              </p>
            </div>
          </div>

          <Button
            onClick={() => onEdit(plan)}
            className="bg-primary-foreground text-primary hover:bg-primary-foreground/90 cursor-pointer w-full md:w-auto"
          >
            <Edit className="w-4 h-4 mr-2" />
            Editar Plantilla
          </Button>
        </div>
      </div>

      <div className="flex-1 bg-card overflow-hidden">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full flex flex-col">
          <TabsList className="w-full justify-start rounded-none border-b bg-transparent p-0 h-auto flex flex-wrap">
            <TabsTrigger
              value="info"
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-b-primary dark:data-[state=active]:border-b-primary data-[state=active]:bg-transparent px-6 py-4 cursor-pointer"
            >
              <BookOpen className="w-4 h-4 mr-2" />
              Información
            </TabsTrigger>
            <TabsTrigger
              value="colaboradores"
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-b-primary dark:data-[state=active]:border-b-primary data-[state=active]:bg-transparent px-6 py-4 cursor-pointer"
            >
              <Users className="w-4 h-4 mr-2" />
              Colaboradores Asignados
              <span className="ml-2 px-2 py-0.5 bg-primary/10 text-primary rounded-full text-xs font-semibold">
                {colaboradoresPlan.length}
              </span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="info" className="flex-1 overflow-y-auto p-6 mt-0">
            <div className="space-y-6 mx-auto">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4">
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950/30 dark:to-blue-900/30 
                                p-3 md:p-4 rounded-lg border border-blue-200 dark:border-blue-800">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-500 rounded-lg">
                      <BookOpen className="w-4 h-4 md:w-5 md:h-5 text-white" />
                    </div>
                    <div>
                      <p className="text-xs md:text-sm text-blue-600 dark:text-blue-400 font-medium">
                        Capacitaciones
                      </p>
                      <p className="text-xl md:text-2xl font-bold text-blue-900 dark:text-blue-100">
                        {plan.DOCUMENTOS_PLANES.length}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950/30 dark:to-green-900/30 
                                p-3 md:p-4 rounded-lg border border-green-200 dark:border-green-800">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-green-500 rounded-lg">
                      <Users className="w-4 h-4 md:w-5 md:h-5 text-white" />
                    </div>
                    <div>
                      <p className="text-xs md:text-sm text-green-600 dark:text-green-400 font-medium">
                        Colaboradores
                      </p>
                      <p className="text-xl md:text-2xl font-bold text-green-900 dark:text-green-100">
                        {colaboradoresPlan.length}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950/30 dark:to-purple-900/30 
                                p-3 md:p-4 rounded-lg border border-purple-200 dark:border-purple-800">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-purple-500 rounded-lg">
                      <Calendar className="w-4 h-4 md:w-5 md:h-5 text-white" />
                    </div>
                    <div>
                      <p className="text-xs md:text-sm text-purple-600 dark:text-purple-400 font-medium">
                        Fecha Creación
                      </p>
                      <p className="text-base md:text-lg font-bold text-purple-900 dark:text-purple-100 break-words">
                        {plan.FECHA_CREACION}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-card border border-border rounded-lg p-6">
                <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                  <Building2 className="w-5 h-5 text-primary" />
                  Información General
                </h2>
                
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-muted-foreground mb-2">Descripción</p>
                    <p className="text-sm text-foreground leading-relaxed">
                      {plan.DESCRIPCION || "Sin descripción"}
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t">
                    <div>
                      <p className="text-sm text-muted-foreground mb-2 flex items-center gap-2">
                        <Building2 className="w-4 h-4" />
                        Departamento Aplicable
                      </p>
                      {plan.DEPARTAMENTO && (
                        <span className="inline-flex items-center px-3 py-1.5 bg-primary/10 text-primary dark:text-foreground rounded-lg dark:border-1 dark:border-blue-800 text-sm font-medium">
                          {plan.DEPARTAMENTO.NOMBRE}
                        </span>
                      )}
                    </div>

                    <div>
                      <p className="text-sm text-muted-foreground mb-2 flex items-center gap-2">
                        <Briefcase className="w-4 h-4" />
                        Puestos
                      </p>
                      {plan.APLICA_TODOS_PUESTOS_DEP ? (
                        <span className="inline-flex items-center px-3 py-1.5 bg-accent/70 text-accent-foreground rounded-lg text-sm font-medium">
                          Todos los puestos del departamento
                        </span>
                      ) : (
                        <div className="flex flex-wrap gap-2">
                          {plan.PLANES_PUESTOS.map((puesto) => (
                            <span
                              key={puesto.ID_PUESTO}
                              className="inline-flex items-center px-3 py-1.5 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-lg text-sm font-medium"
                            >
                              {puesto.NOMBRE}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-card border border-border rounded-lg overflow-hidden">
                <div className="bg-muted/50 px-6 py-4 border-b border-border">
                  <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
                    <BookOpen className="w-5 h-5 text-primary" />
                    Capacitaciones Predefinidas
                  </h2>
                  <p className="text-sm text-muted-foreground mt-1">
                    Se asignarán automáticamente al aplicar este plan
                  </p>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full overflow-y-auto min-w-[800px]">
                    <thead className="bg-muted/30">
                      <tr>
                        <th className="text-center px-4 text-sm font-semibold text-foreground">
                          No.
                        </th>
                        <th className="text-left px-4 py-3 text-sm font-semibold text-foreground">
                          Código
                        </th>
                        <th className="text-left px-4 py-3 text-sm font-semibold text-foreground">
                          Tipo
                        </th>
                        <th className="text-left px-4 py-3 text-sm font-semibold text-foreground">
                          Nombre
                        </th>
                        <th className="text-left px-4 py-3 text-sm font-semibold text-foreground">
                          Estado
                        </th>
                        <th className="text-center px-4 py-3 text-sm font-semibold text-foreground">
                          Versión
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {plan.DOCUMENTOS_PLANES.map((documento, index) => (
                        <tr
                          key={documento.ID_DOCUMENTO}
                          className={`border-t border-border hover:bg-muted/20 transition-colors ${
                            index % 2 === 0 ? "bg-muted/5" : ""
                          }`}
                        >
                          <td className="px-4 text-center">
                            <p className="text-sm text-foreground">
                              {index + 1}
                            </p>
                          </td>
                          <td className="px-4 py-4 w-[140px]">
                            <p className="text-sm font-mono font-medium text-foreground">
                              {documento.CODIGO}
                            </p>
                          </td>
                          <td className="px-4 py-4">
                            <p className="text-sm text-muted-foreground">
                              {documento.TIPO_DOCUMENTO}
                            </p>
                          </td>
                          <td className="px-4 py-4">
                            <p className="text-sm font-medium text-foreground">
                              {documento.NOMBRE_DOCUMENTO}
                            </p>
                          </td>
                          <td className="px-4 py-4">
                            <span
                              className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium ${getEstatusDocumentoVariant(
                                documento.ESTATUS.toLowerCase()
                              )}`}
                            >
                              {documento.ESTATUS}
                            </span>
                          </td>
                          <td className="px-4 py-4 text-center">
                            <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary text-xs font-semibold dark:text-blue-400 dark:border dark:border-blue-500/30">
                              {documento.VERSION}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="colaboradores" className="flex-1 overflow-y-auto p-6 mt-0">
            <div className="space-y-4 mx-auto">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-xl font-semibold text-foreground">
                    Colaboradores con este plan activo
                  </h2>
                  <p className="text-sm text-muted-foreground mt-1">
                    Monitorea el progreso de cada colaborador en las capacitaciones del plan
                  </p>
                </div>
              </div>

              <div className="grid gap-4">
                {colaboradoresPlan.map((colaborador) => (
                  <div
                    key={colaborador.id}
                    className="bg-card border border-border rounded-lg p-5 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start gap-4">
                      <Avatar className="h-12 w-12 border-2 border-primary/20">
                        <AvatarImage src={colaborador.avatar || undefined} />
                        <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                          {getInitials(colaborador.nombre)}
                        </AvatarFallback>
                      </Avatar>

                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <h3 className="font-semibold text-foreground text-lg">
                              {colaborador.nombre}
                            </h3>
                            <div className="flex items-center gap-2 mt-1">
                              <span className="text-sm text-muted-foreground flex items-center gap-1">
                                <Briefcase className="w-3.5 h-3.5" />
                                {colaborador.puesto}
                              </span>
                              <span className="text-muted-foreground">•</span>
                              <span className="text-sm text-muted-foreground flex items-center gap-1">
                                <Building2 className="w-3.5 h-3.5" />
                                {colaborador.departamento}
                              </span>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-sm text-muted-foreground">Progreso</p>
                            <p className="text-2xl font-bold text-foreground">
                              {colaborador.progreso}%
                            </p>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground">
                              {colaborador.capacitacionesCompletadas} de{" "}
                              {colaborador.capacitacionesTotales} capacitaciones
                            </span>
                            <span className="text-xs text-muted-foreground flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              Asignado: {colaborador.fechaAsignacion}
                            </span>
                          </div>
                          <div className="w-full bg-muted rounded-full h-2.5 overflow-hidden">
                            <div
                              className={`h-full rounded-full transition-all duration-500 ${getProgressColor(
                                colaborador.progreso
                              )}`}
                              style={{ width: `${colaborador.progreso}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {colaboradoresPlan.length === 0 && (
                <div className="text-center py-12 bg-muted/30 rounded-lg border-2 border-dashed border-border">
                  <Users className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                  <p className="text-muted-foreground font-medium">
                    No hay colaboradores asignados a este plan
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Los colaboradores aparecerán aquí una vez que se les asigne el plan
                  </p>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}