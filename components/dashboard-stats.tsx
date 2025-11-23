"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { ActividadProxima, CapacitacionReciente, Estadisticas } from "@/lib/dashboard/type"
import { Users, BookOpen, Calendar, TrendingUp, CheckCircle, Clock, AlertTriangle, AlertCircle } from "lucide-react"

type DashboardProps = {
  estadisticas: Estadisticas | null
  capacitacionesRecientes: CapacitacionReciente[]
  actividadesProximas: ActividadProxima[]
  isLoading: boolean
  hasError: boolean
}

export function DashboardStats({
  estadisticas,
  capacitacionesRecientes,
  actividadesProximas,
  isLoading,
  hasError
}: DashboardProps) {

  if (isLoading) {
    return (
      <div className="space-y-6">
        {/* Main Stats Grid Skeleton */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-4 w-4 rounded-full" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-16 mb-2" />
                <Skeleton className="h-3 w-24" />
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Recent Trainings Skeleton */}
        <div className="grid gap-4 md:grid-cols-2">
          {[...Array(2)].map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-6 w-48" />
              </CardHeader>
              <CardContent className="space-y-4">
                {[...Array(3)].map((_, j) => (
                  <div key={j} className="space-y-2">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-3 w-32" />
                    <Skeleton className="h-1 w-full" />
                  </div>
                ))}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  if (hasError) {
    return (
      <Alert variant="destructive" className="border-destructive/50">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Error al cargar el dashboard</AlertTitle>
        <AlertDescription>
          No se pudieron obtener las estadísticas del dashboard. Por favor, verifica tu conexión e intenta nuevamente.
        </AlertDescription>
      </Alert>
    )
  }

  if (!estadisticas) {
    return (
      <Card className="col-span-4 bg-primary/10 border-primary/20 shadow-lg dark:border-foreground/10">
        <CardHeader className="pb-3">
          <CardTitle className="text-xl font-bold text-primary flex items-center gap-2 dark:text-foreground">
            <Users className="h-5 w-5" /> ¡Bienvenido/a a tu Panel de Control!
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-base">
            Tu Dashboard Personal está listo.
          </p>
          <p className="text-sm text-indigo-600 font-medium mt-2">
            Navega a través del menú lateral para gestionar tus tareas, registrar avances o acceder a informes específicos.
          </p>
        </CardContent>
      </Card>
    )
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
            {capacitacionesRecientes.length > 0 ? (
              capacitacionesRecientes.map((training, index) => (
                <div key={index} className="flex items-center justify-between space-x-4">
                  <div className="flex-1 min-w-0 flex-wrap">
                    <p className="text-sm font-medium">{training.nombre}</p>
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
              ))
            ) : (
              <p className="text-sm text-muted-foreground">No hay capacitaciones recientes.</p>
            )}
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
                    className="flex flex-wrap items-center justify-between p-3 rounded-lg bg-muted/50"
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
