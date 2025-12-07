"use client"

import { useState } from "react"
import { Sidebar } from "@/components/sidebar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Skeleton } from "@/components/ui/skeleton"
import {
  BarChart3,
  TrendingUp,
  Users,
  BookOpen,
  Download,
  FileText,
  Award,
  Calendar,
  Clock,
  Target,
  RefreshCw,
  FileSpreadsheet,
  GraduationCap,
} from "lucide-react"
import { AppHeader } from "@/components/app-header"
import { RequirePermission } from "@/components/RequirePermission"
import { useReportes } from "@/hooks/useReportes"
import { DownloadReportDialog } from "@/components/reportes/DownloadReportDialog"
import toast, { Toaster } from "react-hot-toast"

export default function ReportesPage() {
  const { dashboard, isLoadingDashboard, error, obtenerDashboard } = useReportes()
  const [dialogOpen, setDialogOpen] = useState(false)
  const [reportType, setReportType] = useState<"detalle" | "cumplimiento">("detalle")

  const handleOpenDialog = (type: "detalle" | "cumplimiento") => {
    setReportType(type)
    setDialogOpen(true)
  }

  const handleRefresh = async () => {
    const result = await obtenerDashboard()
    if (result.success) {
      toast.success("Dashboard actualizado")
    } else {
      toast.error("Error al actualizar el dashboard")
    }
  }

  if (error && !dashboard) {
    return (
      <div className="flex h-screen bg-background">
        <Sidebar />
        <div className="flex-1 flex flex-col overflow-hidden">
          <AppHeader title="Reportes y Análisis" subtitle="Visualiza métricas y genera reportes del sistema" />
          <main className="flex-1 overflow-auto p-6">
            <div className="max-w-7xl mx-auto">
              <Card className="border-destructive">
                <CardContent className="pt-6">
                  <p className="text-destructive">Error al cargar los datos: {error}</p>
                  <Button onClick={handleRefresh} className="mt-4">
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Reintentar
                  </Button>
                </CardContent>
              </Card>
            </div>
          </main>
        </div>
      </div>
    )
  }

  return (
    <RequirePermission requiredPermissions={["reports_access"]}>
      <div className="flex h-screen bg-background">
        <Sidebar />

        <div className="flex-1 flex flex-col overflow-hidden">
          <AppHeader title="Reportes y Análisis" subtitle="Visualiza métricas y genera reportes del sistema" />

          <main className="flex-1 overflow-auto p-6 custom-scrollbar">
            <Toaster />

            <div className="max-w-7xl mx-auto space-y-6">
              {/* Header con botón de actualizar */}
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-2xl font-bold">Dashboard Ejecutivo</h2>
                  <p className="text-muted-foreground">Resumen general del sistema de capacitaciones</p>
                </div>
                <Button onClick={handleRefresh} variant="outline" disabled={isLoadingDashboard} className="cursor-pointer dark:hover:text-foreground dark:border-1 dark:hover:border-amber-800">
                  <RefreshCw className={`w-4 h-4 mr-2 ${isLoadingDashboard ? "animate-spin" : ""}`} />
                  Actualizar
                </Button>
              </div>

              {/* Key Metrics */}
              {isLoadingDashboard ? (
                <div className="grid gap-4 md:grid-cols-4">
                  {[...Array(4)].map((_, i) => (
                    <Card key={i}>
                      <CardHeader className="space-y-0 pb-2">
                        <Skeleton className="h-4 w-32" />
                      </CardHeader>
                      <CardContent>
                        <Skeleton className="h-8 w-16 mb-2" />
                        <Skeleton className="h-3 w-24" />
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="grid gap-4 md:grid-cols-4">
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Colaboradores Activos</CardTitle>
                      <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">
                        {dashboard?.RESUMEN_GENERAL?.Total_Colaboradores_Activos || 0}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {dashboard?.RESUMEN_GENERAL?.Colaboradores_Capacitados || 0} capacitados
                      </p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Planes Activos</CardTitle>
                      <Target className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{dashboard?.RESUMEN_GENERAL?.Planes_Activos || 0}</div>
                      <p className="text-xs text-muted-foreground">
                        {dashboard?.RESUMEN_GENERAL?.Capacitaciones_Vigentes || 0} capacitaciones vigentes
                      </p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Sesiones del Período</CardTitle>
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">
                        {dashboard?.RESUMEN_GENERAL?.Total_Sesiones_Periodo || 0}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {dashboard?.RESUMEN_GENERAL?.Sesiones_Finalizadas || 0} finalizadas
                      </p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Diplomas</CardTitle>
                      <Award className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{dashboard?.RESUMEN_GENERAL?.Diplomas || 0}</div>
                    </CardContent>
                  </Card>
                </div>
              )}

              {/* Estadísticas adicionales */}
              {isLoadingDashboard ? (
                <div className="grid gap-4 md:grid-cols-2">
                  {[...Array(2)].map((_, i) => (
                    <Card key={i}>
                      <CardHeader>
                        <Skeleton className="h-6 w-48" />
                      </CardHeader>
                      <CardContent>
                        <Skeleton className="h-20 w-full" />
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="grid gap-4 md:grid-cols-2">
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                      <div>
                        <CardTitle className="text-sm font-medium">Horas Totales</CardTitle>
                        <CardDescription>Tiempo invertido en capacitaciones</CardDescription>
                      </div>
                      <Clock className="h-8 w-8 text-primary dark:text-blue-500" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-3xl font-bold">
                        {dashboard?.RESUMEN_GENERAL?.Horas_Totales_Capacitacion.toFixed(2) || 0}
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">horas de capacitación</p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                      <div>
                        <CardTitle className="text-sm font-medium">Sesiones Programadas</CardTitle>
                        <CardDescription>Próximas capacitaciones</CardDescription>
                      </div>
                      <BookOpen className="h-8 w-8 text-primary dark:text-blue-500" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-3xl font-bold">
                        {dashboard?.RESUMEN_GENERAL?.Sesiones_Programadas_Futuras || 0}
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">sesiones futuras</p>
                    </CardContent>
                  </Card>
                </div>
              )}

              {/* Reportes Descargables */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileSpreadsheet className="w-5 h-5" />
                    Reportes Descargables
                  </CardTitle>
                  <CardDescription>Genera y descarga reportes detallados en formato Excel</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="border rounded-lg p-4 space-y-3">
                      <div className="flex items-start gap-3">
                        <div className="p-2 rounded-lg bg-primary/10 dark:border dark:text-blue-500 dark:border-blue-500/30">
                          <FileText className="w-6 h-6" />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-semibold">Detalle de Capacitaciones</h4>
                          <p className="text-sm text-muted-foreground mt-1">
                            Reporte completo con todas las capacitaciones de los colaboradores, incluyendo estado,
                            calificaciones y firmas.
                          </p>
                          <ul className="text-xs text-muted-foreground mt-2 space-y-1">
                            <li>• Información detallada por colaborador</li>
                            <li>• Documentos y versiones</li>
                            <li>• Estados y calificaciones</li>
                            <li>• Filtrado por fechas opcional</li>
                          </ul>
                        </div>
                      </div>
                      <Button onClick={() => handleOpenDialog("detalle")} className="w-full cursor-pointer">
                        <Download className="w-4 h-4 mr-2" />
                        Descargar Reporte
                      </Button>
                    </div>

                    <div className="border rounded-lg p-4 space-y-3">
                      <div className="flex items-start gap-3">
                        <div className="p-2 rounded-lg bg-chart-2/10">
                          <TrendingUp className="w-6 h-6 text-chart-2" />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-semibold">Cumplimiento de Colaboradores</h4>
                          <p className="text-sm text-muted-foreground mt-1">
                            Reporte de cumplimiento con el estado de cada colaborador en sus planes de capacitación
                            asignados.
                          </p>
                          <ul className="text-xs text-muted-foreground mt-2 space-y-1">
                            <li>• Estado por plan de capacitación</li>
                            <li>• Porcentaje de cumplimiento</li>
                            <li>• Capacitaciones completadas y pendientes</li>
                            <li>• Información de departamento y puesto</li>
                          </ul>
                        </div>
                      </div>
                      <Button onClick={() => handleOpenDialog("cumplimiento")} className="w-full border border-blue-600 dark:border-blue-700 dark:hover:text-foreground/70 cursor-pointer" variant="secondary">
                        <Download className="w-4 h-4 mr-2" />
                        Descargar Reporte
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Charts and Analysis */}
              <div className="grid gap-6 md:grid-cols-2">
                {/* Cumplimiento por Plan */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Target className="w-5 h-5" />
                      Cumplimiento por Plan
                    </CardTitle>
                    <CardDescription>Porcentaje de cumplimiento de cada plan de capacitación</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {isLoadingDashboard ? (
                      <div className="space-y-4">
                        {[...Array(3)].map((_, i) => (
                          <div key={i} className="space-y-2">
                            <Skeleton className="h-4 w-full" />
                            <Skeleton className="h-2 w-full" />
                          </div>
                        ))}
                      </div>
                    ) : dashboard?.CUMPLIMIENTO_POR_PLAN && dashboard.CUMPLIMIENTO_POR_PLAN.length > 0 ? (
                      <div className="space-y-4">
                        {dashboard.CUMPLIMIENTO_POR_PLAN.map((item, index) => (
                          <div key={index} className="space-y-2">
                            <div className="flex justify-between text-sm">
                              <div>
                                <span className="font-medium">{item.Plan}</span>
                                <Badge variant="outline" className="ml-2 text-xs">
                                  {item.Tipo_Plan}
                                </Badge>
                              </div>
                              <span className="font-medium">{item.Cumplimiento_Promedio_Porcentaje.toFixed(1)}%</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Progress value={item.Cumplimiento_Promedio_Porcentaje} className="flex-1" />
                              <span className="text-xs text-muted-foreground w-20 text-right">
                                {item.Capacitaciones_Completadas}/{item.Capacitaciones_Completadas + item.Capacitaciones_Pendientes}
                              </span>
                            </div>
                            <p className="text-xs text-muted-foreground">
                              {item.Colaboradores_Asignados} colaboradores • {item.Total_Documentos} documentos
                            </p>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground text-center py-4">
                        No hay datos de planes disponibles
                      </p>
                    )}
                  </CardContent>
                </Card>

                {/* Cumplimiento por Programa */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <GraduationCap className="w-5 h-5" />
                      Cumplimiento por Programa
                    </CardTitle>
                    <CardDescription>Avance de los programas de capacitación anuales</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {isLoadingDashboard ? (
                      <div className="space-y-4">
                        {[...Array(3)].map((_, i) => (
                          <div key={i} className="space-y-2">
                            <Skeleton className="h-4 w-full" />
                            <Skeleton className="h-2 w-full" />
                          </div>
                        ))}
                      </div>
                    ) : dashboard?.CUMPLIMIENTO_POR_PROGRAMA && dashboard.CUMPLIMIENTO_POR_PROGRAMA.length > 0 ? (
                      <div className="space-y-4">
                        {dashboard.CUMPLIMIENTO_POR_PROGRAMA.map((item, index) => (
                          <div key={index} className="space-y-2">
                            <div className="flex justify-between text-sm">
                              <div>
                                <span className="font-medium">{item.Programa}</span>
                                <Badge variant="outline" className="ml-2 text-xs">
                                  {item.Periodo}
                                </Badge>
                              </div>
                              <span className="font-medium">{item.Cumplimiento_Promedio_Porcentaje.toFixed(1)}%</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Progress value={item.Cumplimiento_Promedio_Porcentaje} className="flex-1" />
                              <span className="text-xs text-muted-foreground w-20 text-right">
                                {item.Capacitaciones_Completadas}/{item.Total_Capacitaciones * item.Colaboradores_Asignados}
                              </span>
                            </div>
                            <p className="text-xs text-muted-foreground">
                              {item.Colaboradores_Asignados} colaboradores • {item.Total_Capacitaciones} capacitaciones
                            </p>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground text-center py-4">
                        No hay datos de programas disponibles
                      </p>
                    )}
                  </CardContent>
                </Card>

                {/* Top Departamentos */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Users className="w-5 h-5" />
                      Top Departamentos
                    </CardTitle>
                    <CardDescription>Departamentos con mayor actividad en capacitaciones</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {isLoadingDashboard ? (
                      <div className="space-y-3">
                        {[...Array(3)].map((_, i) => (
                          <Skeleton key={i} className="h-20 w-full" />
                        ))}
                      </div>
                    ) : dashboard?.TOP_DEPARTAMENTOS && dashboard.TOP_DEPARTAMENTOS.length > 0 ? (
                      <div className="space-y-3">
                        {dashboard.TOP_DEPARTAMENTOS.map((item, index) => (
                          <div
                            key={index}
                            className="flex items-center justify-between p-3 rounded-lg bg-muted/50 border"
                          >
                            <div>
                              <p className="font-medium">{item.Departamento}</p>
                              <p className="text-sm text-muted-foreground">
                                {item.Total_Capacitaciones} capacitaciones • {item.Total_Sesiones} sesiones
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="text-2xl font-bold text-primary">{item.Colaboradores_Capacitados}</p>
                              <p className="text-xs text-muted-foreground">colaboradores</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground text-center py-4">
                        No hay datos de departamentos disponibles
                      </p>
                    )}
                  </CardContent>
                </Card>

                {/* Top Capacitaciones */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <BarChart3 className="w-5 h-5" />
                      Top Capacitaciones
                    </CardTitle>
                    <CardDescription>Capacitaciones más impartidas en el período</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {isLoadingDashboard ? (
                      <div className="space-y-3">
                        {[...Array(3)].map((_, i) => (
                          <Skeleton key={i} className="h-16 w-full" />
                        ))}
                      </div>
                    ) : dashboard?.TOP_CAPACITACIONES && dashboard.TOP_CAPACITACIONES.length > 0 ? (
                      <div className="space-y-3">
                        {dashboard.TOP_CAPACITACIONES.map((item, index) => (
                          <div key={index} className="flex items-center justify-between p-3 rounded-lg border">
                            <div className="flex-1">
                              <p className="font-medium text-sm">{item.Capacitación}</p>
                              <p className="text-xs text-muted-foreground mt-1">
                                {item.Colaboradores} colaboradores capacitados
                              </p>
                            </div>
                            <div className="text-center ml-4">
                              <Badge variant="secondary" className="text-lg px-3">
                                {item.Sesiones_Impartidas}
                              </Badge>
                              <p className="text-xs text-muted-foreground mt-1">sesiones</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground text-center py-4">
                        No hay datos de capacitaciones disponibles
                      </p>
                    )}
                  </CardContent>
                </Card>
              </div>

            </div>
          </main>
        </div>
      </div>

      <DownloadReportDialog open={dialogOpen} onOpenChange={setDialogOpen} reportType={reportType} />
    </RequirePermission>
  )
}
