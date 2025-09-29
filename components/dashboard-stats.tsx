"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Users, BookOpen, Calendar, TrendingUp, CheckCircle, Clock, AlertTriangle, Award } from "lucide-react"

export function DashboardStats() {
  const stats = {
    totalCapacitaciones: 24,
    capacitacionesActivas: 8,
    totalParticipantes: 156,
    participantesActivos: 89,
    planesCompletados: 12,
    totalPlanes: 18,
    cumplimientoPromedio: 78,
    proximasCapacitaciones: 5,
  }

  const recentTrainings = [
    { nombre: "Seguridad Industrial", participantes: 25, progreso: 85, estado: "En progreso" },
    { nombre: "Liderazgo Efectivo", participantes: 18, progreso: 100, estado: "Completado" },
    { nombre: "Excel Avanzado", participantes: 32, progreso: 45, estado: "En progreso" },
    { nombre: "Atención al Cliente", participantes: 22, progreso: 20, estado: "Iniciando" },
  ]

  return (
    <div className="space-y-6">
      {/* Main Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Capacitaciones</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalCapacitaciones}</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-chart-2">+{stats.capacitacionesActivas}</span> activas
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Participantes</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalParticipantes}</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-chart-2">+{stats.participantesActivos}</span> activos
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Planes Completados</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.planesCompletados}</div>
            <p className="text-xs text-muted-foreground">de {stats.totalPlanes} planes totales</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Cumplimiento</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.cumplimientoPromedio}%</div>
            <Progress value={stats.cumplimientoPromedio} className="mt-2" />
          </CardContent>
        </Card>
      </div>

      {/* Recent Trainings */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Capacitaciones Recientes
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {recentTrainings.map((training, index) => (
              <div key={index} className="flex items-center justify-between space-x-4">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{training.nombre}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <Users className="h-3 w-3 text-muted-foreground" />
                    <span className="text-xs text-muted-foreground">{training.participantes} participantes</span>
                  </div>
                  <Progress value={training.progreso} className="mt-2 h-1" />
                </div>
                <div className="flex items-center gap-2">
                  {training.estado === "Completado" && <CheckCircle className="h-4 w-4 text-chart-2" />}
                  {training.estado === "En progreso" && <Clock className="h-4 w-4 text-chart-4" />}
                  {training.estado === "Iniciando" && <AlertTriangle className="h-4 w-4 text-chart-5" />}
                  <span className="text-xs font-medium">{training.progreso}%</span>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="h-5 w-5" />
              Próximas Actividades
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                <div>
                  <p className="text-sm font-medium">Evaluación de Seguridad</p>
                  <p className="text-xs text-muted-foreground">Mañana, 10:00 AM</p>
                </div>
                <div className="text-right">
                  <p className="text-xs font-medium">25 participantes</p>
                  <p className="text-xs text-muted-foreground">Sala A-101</p>
                </div>
              </div>

              <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                <div>
                  <p className="text-sm font-medium">Taller de Liderazgo</p>
                  <p className="text-xs text-muted-foreground">Viernes, 2:00 PM</p>
                </div>
                <div className="text-right">
                  <p className="text-xs font-medium">18 participantes</p>
                  <p className="text-xs text-muted-foreground">Virtual</p>
                </div>
              </div>

              <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                <div>
                  <p className="text-sm font-medium">Certificación Excel</p>
                  <p className="text-xs text-muted-foreground">Lunes, 9:00 AM</p>
                </div>
                <div className="text-right">
                  <p className="text-xs font-medium">32 participantes</p>
                  <p className="text-xs text-muted-foreground">Lab. Cómputo</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
