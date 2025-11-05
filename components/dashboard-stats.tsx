"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { ActividadProxima, CapacitacionReciente, Estadisticas } from "@/lib/dashboard/type"
import { Users, BookOpen, Calendar, TrendingUp, CheckCircle, Clock, AlertTriangle, Award, ChartBar } from "lucide-react"

type DashboardProps = {
  estadisticas: Estadisticas | null
  capacitacionesRecientes: CapacitacionReciente[]
  actividadesProximas: ActividadProxima[]
}

export function DashboardStats({
  estadisticas,
  capacitacionesRecientes,
  actividadesProximas
}: DashboardProps) {

  if (!estadisticas) {
    return (
      <Card className="col-span-4 bg-primary/10 border-primary/20 shadow-lg">
        <CardHeader className="pb-3">
          <CardTitle className="text-xl font-bold text-primary flex items-center gap-2">
            <Users className="h-5 w-5" /> ¡Bienvenido/a a tu Panel de Control!
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-base text-gray-700">
            Tu Dashboard Personal está listo.
          </p>
          <p className="text-sm text-indigo-600 font-medium mt-2">
            Navega a través del menú lateral para gestionar tus tareas, registrar avances o acceder a informes específicos.
          </p>
        </CardContent>
      </Card>
    );
  }

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
            <div className="text-2xl font-bold">{estadisticas.totalCapacitaciones}</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-chart-2">+{estadisticas.capacitacionesActivas}</span> activas
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Participantes</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{estadisticas.totalParticipantes}</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-chart-2">+{estadisticas.participantesActivos}</span> activos
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Planes Completados</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{estadisticas.planesCompletados}</div>
            <p className="text-xs text-muted-foreground">de {estadisticas.totalPlanes} planes totales</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Cumplimiento</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{estadisticas.cumplimientoPromedio}%</div>
            <Progress value={estadisticas.cumplimientoPromedio} className="mt-2" />
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
            {capacitacionesRecientes.map((training, index) => (
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
              <Calendar className="h-5 w-5" />
              Próximas Actividades
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              {actividadesProximas.length > 0 ? (
                actividadesProximas.map((actividad) => (
                  <div 
                    key={actividad.ID_SESION} 
                    className={`flex items-center justify-between p-3 rounded-lg bg-muted/50`}
                  >
                    <div>
                      <p className="text-sm font-medium">{actividad.nombre}</p>
                      <p className="text-xs text-muted-foreground">
                        {actividad.fechaHora} ({actividad.duracionTexto})
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs font-medium">{actividad.participantes} participantes</p>
                      <p className="text-xs text-muted-foreground">{actividad.ubicacion}</p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground">No hay actividades próximas programadas.</p>
              )}
            </div>
          </CardContent>
        </Card>

      </div>
    </div>
  )
}
