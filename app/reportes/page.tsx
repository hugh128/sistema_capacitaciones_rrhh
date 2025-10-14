"use client"

import { useState } from "react"
import { Sidebar } from "@/components/sidebar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { mockReportes, type Reporte } from "@/lib/types"
import { BarChart3, TrendingUp, Users, BookOpen, Download, Filter, PieChart, FileText, Award } from "lucide-react"
import { AppHeader } from "@/components/app-header"
import { RequirePermission } from "@/components/RequirePermission"

export default function ReportesPage() {
  const [reportes] = useState<Reporte[]>(mockReportes)
  const [filtroTipo, setFiltroTipo] = useState<string>("todos")
  const [filtroPeriodo, setFiltroPeriodo] = useState<string>("2024")

  const reportesFiltrados = reportes.filter((r) => filtroTipo === "todos" || r.tipo === filtroTipo)

  const getReportIcon = (tipo: string) => {
    switch (tipo) {
      case "cumplimiento":
        return <TrendingUp className="w-4 h-4 text-chart-2" />
      case "participacion":
        return <Users className="w-4 h-4 text-chart-4" />
      case "examenes":
        return <Award className="w-4 h-4 text-chart-3" />
      case "efectividad":
        return <BarChart3 className="w-4 h-4 text-primary" />
      default:
        return <FileText className="w-4 h-4 text-muted-foreground" />
    }
  }

  const getReportTypeLabel = (tipo: string) => {
    const labels = {
      cumplimiento: "Cumplimiento",
      participacion: "Participación",
      examenes: "Exámenes",
      efectividad: "Efectividad",
    }
    return labels[tipo as keyof typeof labels] || tipo
  }

  // Mock statistics for dashboard
  const stats = {
    totalCapacitaciones: 24,
    participantesActivos: 89,
    cumplimientoPromedio: 78,
    certificacionesEmitidas: 156,
  }

  return (
    <RequirePermission requiredPermissions={["view_reports"]}>

      <div className="flex h-screen bg-background">
        <Sidebar />

        <div className="flex-1 flex flex-col overflow-hidden">
          <AppHeader title="Reportes y Análisis" subtitle="Visualiza métricas y genera reportes del sistema" />

          <main className="flex-1 overflow-auto p-6 custom-scrollbar">
            <div className="max-w-7xl mx-auto space-y-6">
              {/* Key Metrics */}
              <div className="grid gap-4 md:grid-cols-4">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Capacitaciones</CardTitle>
                    <BookOpen className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{stats.totalCapacitaciones}</div>
                    <p className="text-xs text-muted-foreground">+12% vs mes anterior</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Participantes Activos</CardTitle>
                    <Users className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{stats.participantesActivos}</div>
                    <p className="text-xs text-muted-foreground">+8% vs mes anterior</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Cumplimiento Promedio</CardTitle>
                    <TrendingUp className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{stats.cumplimientoPromedio}%</div>
                    <Progress value={stats.cumplimientoPromedio} className="mt-2" />
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Certificaciones</CardTitle>
                    <Award className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{stats.certificacionesEmitidas}</div>
                    <p className="text-xs text-muted-foreground">+15% vs mes anterior</p>
                  </CardContent>
                </Card>
              </div>

              {/* Filters */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Filter className="w-5 h-5" />
                    Filtros de Reportes
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex gap-4">
                    <div className="flex-1">
                      <label className="text-sm font-medium mb-2 block">Tipo de Reporte</label>
                      <Select value={filtroTipo} onValueChange={setFiltroTipo}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="todos">Todos los tipos</SelectItem>
                          <SelectItem value="cumplimiento">Cumplimiento</SelectItem>
                          <SelectItem value="participacion">Participación</SelectItem>
                          <SelectItem value="examenes">Exámenes</SelectItem>
                          <SelectItem value="efectividad">Efectividad</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="flex-1">
                      <label className="text-sm font-medium mb-2 block">Período</label>
                      <Select value={filtroPeriodo} onValueChange={setFiltroPeriodo}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="2024">2024</SelectItem>
                          <SelectItem value="Q1-2024">Q1 2024</SelectItem>
                          <SelectItem value="Q2-2024">Q2 2024</SelectItem>
                          <SelectItem value="Q3-2024">Q3 2024</SelectItem>
                          <SelectItem value="Q4-2024">Q4 2024</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="flex items-end">
                      <Button>
                        <BarChart3 className="w-4 h-4 mr-2" />
                        Generar Reporte
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
                      <PieChart className="w-5 h-5" />
                      Cumplimiento por Plan
                    </CardTitle>
                    <CardDescription>Porcentaje de cumplimiento vs meta establecida</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {mockReportes
                        .find((r) => r.tipo === "cumplimiento")
                        ?.datos.map((item, index) => (
                          <div key={index} className="space-y-2">
                            <div className="flex justify-between text-sm">
                              <span>{item.plan}</span>
                              <span className="font-medium">
                                {item.cumplimiento}% / {item.meta}%
                              </span>
                            </div>
                            <div className="flex gap-1">
                              <Progress value={item.cumplimiento} className="flex-1" />
                              <div className="w-16 text-xs text-muted-foreground text-right">
                                {item.cumplimiento >= item.meta ? "✓ Meta" : "Pendiente"}
                              </div>
                            </div>
                          </div>
                        ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Participación por Departamento */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Users className="w-5 h-5" />
                      Participación por Departamento
                    </CardTitle>
                    <CardDescription>Número de participantes y capacitaciones por área</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {mockReportes
                        .find((r) => r.tipo === "participacion")
                        ?.datos.map((item, index) => (
                          <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                            <div>
                              <p className="font-medium">{item.departamento}</p>
                              <p className="text-sm text-muted-foreground">{item.capacitaciones} capacitaciones</p>
                            </div>
                            <div className="text-right">
                              <p className="text-2xl font-bold">{item.participantes}</p>
                              <p className="text-xs text-muted-foreground">participantes</p>
                            </div>
                          </div>
                        ))}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Generated Reports */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="w-5 h-5" />
                    Reportes Generados
                  </CardTitle>
                  <CardDescription>Historial de reportes creados en el sistema</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {reportesFiltrados.map((reporte) => (
                      <div key={reporte.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center gap-3">
                          {getReportIcon(reporte.tipo)}
                          <div>
                            <p className="font-medium">{reporte.nombre}</p>
                            <div className="flex items-center gap-2 mt-1">
                              <Badge variant="outline" className="text-xs">
                                {getReportTypeLabel(reporte.tipo)}
                              </Badge>
                              <span className="text-xs text-muted-foreground">Generado el {reporte.fechaGeneracion}</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button variant="ghost" size="sm">
                            <Download className="w-4 h-4 mr-2" />
                            Descargar
                          </Button>
                          <Button variant="outline" size="sm">
                            Ver Detalles
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Quick Actions */}
              <div className="grid gap-4 md:grid-cols-3">
                <Card className="cursor-pointer hover:bg-muted/50 transition-colors">
                  <CardHeader className="text-center">
                    <TrendingUp className="w-8 h-8 mx-auto text-chart-2" />
                    <CardTitle className="text-lg">Reporte de Cumplimiento</CardTitle>
                    <CardDescription>Analiza el cumplimiento de planes y metas</CardDescription>
                  </CardHeader>
                </Card>

                <Card className="cursor-pointer hover:bg-muted/50 transition-colors">
                  <CardHeader className="text-center">
                    <Users className="w-8 h-8 mx-auto text-chart-4" />
                    <CardTitle className="text-lg">Análisis de Participación</CardTitle>
                    <CardDescription>Revisa la participación por departamento</CardDescription>
                  </CardHeader>
                </Card>

                <Card className="cursor-pointer hover:bg-muted/50 transition-colors">
                  <CardHeader className="text-center">
                    <Award className="w-8 h-8 mx-auto text-chart-3" />
                    <CardTitle className="text-lg">Resultados de Exámenes</CardTitle>
                    <CardDescription>Evalúa el desempeño en evaluaciones</CardDescription>
                  </CardHeader>
                </Card>
              </div>
            </div>
          </main>
        </div>
      </div>

    </RequirePermission>
  )
}
