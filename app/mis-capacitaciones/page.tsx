"use client"

import { useState, useMemo, useEffect, useCallback } from "react"
import { useAuth } from "@/contexts/auth-context"
import { Sidebar } from "@/components/sidebar"
import { AppHeader } from "@/components/app-header"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Calendar,
  Clock,
  Users,
  CheckCircle2,
  AlertCircle,
  BookOpen,
  Search,
  Filter,
  Eye,
  TrendingUp,
  AlertTriangle,
  RefreshCw,
} from "lucide-react"
import Link from "next/link"
import { CapacitacionSesion, getEstadoColor } from "@/lib/mis-capacitaciones/capacitaciones-types"
import { RequirePermission } from "@/components/RequirePermission"
import { useCapacitaciones } from "@/hooks/useCapacitaciones"
import { Toaster } from "react-hot-toast"

export default function MisCapacitacionesPage() {
  const { user } = useAuth()
  const [searchTerm, setSearchTerm] = useState("")
  const [estadoFilter, setEstadoFilter] = useState<string>("TODOS")
  const [tipoFilter, setTipoFilter] = useState<string>("TODOS")
  const [misCapacitaciones, setMisCapacitaciones] = useState<CapacitacionSesion[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [hasError, setHasError] = useState(false)
  const [errorMessage, setErrorMessage] = useState("")

  const {
    obtenerCapacitacionesPorCapacitador,
  } = useCapacitaciones(user)

  const fetchCapacitaciones = useCallback(async () => {
    if (!user || !user.PERSONA_ID) {
      setIsLoading(false)
      return
    }

    setIsLoading(true)
    setHasError(false)
    setErrorMessage("")

    try {
      const capacitaciones = await obtenerCapacitacionesPorCapacitador(user.PERSONA_ID)
      
      if (Array.isArray(capacitaciones)) {
        setMisCapacitaciones(capacitaciones)
      } else {
        setMisCapacitaciones([])
        setHasError(true)
        setErrorMessage("La respuesta del servidor no tiene el formato esperado")
      }

    } catch (error) {
      console.error('Error al cargar las capacitaciones:', error)
      setMisCapacitaciones([])
      setHasError(true)
      
      if (error && typeof error === 'object' && 'code' in error) {
        const axiosError = error as { code?: string; message?: string }
        if (axiosError.code === 'ERR_NETWORK') {
          setErrorMessage("No se pudo conectar con el servidor. Por favor, verifica tu conexión o intenta más tarde.")
        } else {
          setErrorMessage(axiosError.message || "Error desconocido al cargar las capacitaciones")
        }
      } else {
        setErrorMessage("Error inesperado al cargar las capacitaciones")
      }
    } finally {
      setIsLoading(false)
    }
  }, [user, obtenerCapacitacionesPorCapacitador])

  useEffect(() => {
    fetchCapacitaciones()
  }, [fetchCapacitaciones])

  const capacitacionesFiltradas = useMemo(() => {
    if (!Array.isArray(misCapacitaciones) || misCapacitaciones.length === 0) {
      return []
    }

    return misCapacitaciones.filter((cap) => {
      const matchesSearch =
        cap.NOMBRE?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        cap.CODIGO_DOCUMENTO?.toLowerCase().includes(searchTerm.toLowerCase() || '')
      const matchesEstado = estadoFilter === "TODOS" || cap.ESTADO === estadoFilter
      const matchesTipo = tipoFilter === "TODOS" || cap.TIPO_CAPACITACION === tipoFilter
      return matchesSearch && matchesEstado && matchesTipo
    })
  }, [misCapacitaciones, searchTerm, estadoFilter, tipoFilter])

  const metrics = useMemo(() => {
    const defaultMetrics = { total: 0, pendientes: 0, enProceso: 0, finalizadasEsteMes: 0 }
    
    if (!Array.isArray(misCapacitaciones) || misCapacitaciones.length === 0) {
      return defaultMetrics
    }

    try {
      const total = misCapacitaciones.length
      const pendientes = misCapacitaciones.filter((c) => c.ESTADO === "PROGRAMADA").length
      const enProceso = misCapacitaciones.filter((c) => c.ESTADO === "EN_PROCESO").length
      const finalizadasEsteMes = misCapacitaciones.filter((c) => {
        if (c.ESTADO !== "FINALIZADA" && c.ESTADO !== "FINALIZADA_CAPACITADOR") return false
        if (!c.FECHA_INICIO) return false
        const fecha = new Date(c.FECHA_INICIO)
        const hoy = new Date()
        return fecha.getMonth() === hoy.getMonth() && fecha.getFullYear() === hoy.getFullYear()
      }).length

      return { total, pendientes, enProceso, finalizadasEsteMes }
    } catch (error) {
      console.error('Error al calcular métricas:', error)
      return defaultMetrics
    }
  }, [misCapacitaciones])

  const proximasCapacitaciones = useMemo(() => {
    if (!Array.isArray(misCapacitaciones) || misCapacitaciones.length === 0) {
      return []
    }

    try {
      const hoy = new Date()
      hoy.setHours(0, 0, 0, 0)
      const enSieteDias = new Date()
      enSieteDias.setDate(hoy.getDate() + 7)

      return misCapacitaciones
        .filter((cap) => {
          if (!cap.FECHA_PROGRAMADA) return false
          const fecha = new Date(cap.FECHA_PROGRAMADA)
          fecha.setHours(0, 0, 0, 0)

          return fecha >= hoy && fecha <= enSieteDias && (cap.ESTADO === "ASIGNADA" || cap.ESTADO === "EN_PROCESO")
        })
        .sort((a, b) => {
          const fechaA = new Date(a.FECHA_PROGRAMADA!)
          const fechaB = new Date(b.FECHA_PROGRAMADA!)
          return fechaA.getTime() - fechaB.getTime()
        })
        .slice(0, 5)
    } catch (error) {
      console.error('Error al calcular próximas capacitaciones:', error)
      return []
    }
  }, [misCapacitaciones])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="w-96">
          <CardHeader>
            <CardTitle>Cargando Capacitaciones...</CardTitle>
            <CardDescription>Obteniendo información de tus capacitaciones.</CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (
    !user ||
    !user.ROLES.some(
      (role) => role.NOMBRE === "Capacitador" || role.NOMBRE === "RRHH"
    )
  ) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="w-96">
          <CardHeader>
            <CardTitle>Acceso Denegado</CardTitle>
            <CardDescription>No tienes permisos para acceder a esta página.</CardDescription>
          </CardHeader>
        </Card>
      </div>
    )
  }

  if (hasError) {
    return (
      <div className="flex h-screen bg-background">
        <Sidebar />
        <div className="flex-1 flex flex-col overflow-hidden">
          <AppHeader title="Mis Capacitaciones" subtitle="Gestiona tus capacitaciones asignadas y registra el progreso de los participantes" />
          
          <main className="flex-1 p-6 flex items-center justify-center">
            <Card className="w-full max-w-2xl border-destructive">
              <CardHeader className="text-center">
                <div className="mx-auto h-16 w-16 rounded-full bg-destructive/10 flex items-center justify-center mb-4">
                  <AlertTriangle className="h-8 w-8 text-destructive" />
                </div>
                <CardTitle className="text-2xl">Error al Cargar las Capacitaciones</CardTitle>
                <CardDescription className="text-base mt-2">
                  {errorMessage}
                </CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col gap-4">
                <Button 
                  onClick={fetchCapacitaciones}
                  className="w-full"
                  size="lg"
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Reintentar
                </Button>
                <p className="text-sm text-center text-muted-foreground">
                  Si el problema persiste, por favor contacta a <span className="font-extrabold text-lg">sistemas</span>.
                </p>
              </CardContent>
            </Card>
          </main>
        </div>
      </div>
    )
  }

  return (
    <RequirePermission requiredPermissions={["manage_trainings"]}>
      <div className="flex h-screen bg-background">
        <Sidebar />
        <div className="flex-1 flex flex-col overflow-hidden">

          <AppHeader title="Mis Capacitaciones" subtitle="Gestiona tus capacitaciones asignadas y registra el progreso de los participantes" />

          <main className="flex-1 p-6 space-y-6 max-w-[1600px] mx-auto w-full overflow-auto custom-scrollbar">
            <Toaster />

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card className="border-l-4 border-l-blue-500 hover:shadow-md transition-shadow">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Total Asignadas</CardTitle>
                  <div className="h-10 w-10 rounded-full bg-blue-100 dark:bg-blue-900/20 flex items-center justify-center">
                    <BookOpen className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-foreground">{metrics.total}</div>
                  <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                    <TrendingUp className="h-3 w-3" />
                    Capacitaciones totales
                  </p>
                </CardContent>
              </Card>

              <Card className="border-l-4 border-l-yellow-500 hover:shadow-md transition-shadow">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Pendientes</CardTitle>
                  <div className="h-10 w-10 rounded-full bg-yellow-100 dark:bg-yellow-900/20 flex items-center justify-center">
                    <AlertCircle className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-foreground">{metrics.pendientes}</div>
                  <p className="text-xs text-muted-foreground mt-1">Por iniciar</p>
                </CardContent>
              </Card>

              <Card className="border-l-4 border-l-purple-500 hover:shadow-md transition-shadow">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">En Proceso</CardTitle>
                  <div className="h-10 w-10 rounded-full bg-purple-100 dark:bg-purple-900/20 flex items-center justify-center">
                    <Clock className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-foreground">{metrics.enProceso}</div>
                  <p className="text-xs text-muted-foreground mt-1">Activas ahora</p>
                </CardContent>
              </Card>

              <Card className="border-l-4 border-l-green-500 hover:shadow-md transition-shadow">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Este Mes</CardTitle>
                  <div className="h-10 w-10 rounded-full bg-green-100 dark:bg-green-900/20 flex items-center justify-center">
                    <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-foreground">{metrics.finalizadasEsteMes}</div>
                  <p className="text-xs text-muted-foreground mt-1">Completadas</p>
                </CardContent>
              </Card>
            </div>

            {proximasCapacitaciones.length > 0 && (
              <Card className="shadow-sm">
                <CardHeader className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/20 dark:to-purple-950/20">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-lg bg-blue-600 flex items-center justify-center">
                      <Calendar className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <CardTitle className="text-xl">Próximas Capacitaciones</CardTitle>
                      <CardDescription>Programadas para los próximos 7 días</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-6">
                  <div className="space-y-3">
                    {proximasCapacitaciones.map((cap) => (
                      <div
                        key={cap.ID_SESION}
                        className="flex items-center justify-between p-4 border-2 rounded-xl hover:border-primary hover:bg-accent/50 transition-all group"
                      >
                        <div className="flex-1 space-y-2">
                          <div className="flex items-center gap-3 flex-wrap">
                            <h4 className="font-semibold text-lg group-hover:text-primary dark:group-hover:text-foreground transition-colors">
                              {cap.NOMBRE}
                            </h4>
                            <Badge className={getEstadoColor(cap.ESTADO)}>{cap.ESTADO}</Badge>
                            <Badge variant="outline" className="font-medium">
                              {cap.TIPO_CAPACITACION}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-6 text-sm text-muted-foreground flex-wrap">
                            <span className="flex items-center gap-2 font-medium">
                              <Calendar className="h-4 w-4 text-blue-600" />
                              {new Date(cap.FECHA_PROGRAMADA!).toLocaleDateString("es-GT", {
                                weekday: "long",
                                day: "numeric",
                                month: "long",
                              })}
                            </span>
                            <span className="flex items-center gap-2">
                              <Clock className="h-4 w-4 text-purple-600" />
                              {cap.HORARIO_FORMATO_12H}
                            </span>
                            <span className="flex items-center gap-2">
                              <Users className="h-4 w-4 text-green-600" />
                              {cap.TOTAL_COLABORADORES} participantes
                            </span>
                          </div>
                        </div>
                        <Link href={`/mis-capacitaciones/${cap.ID_SESION}`}>
                          <Button size="lg" className="ml-4 cursor-pointer">
                            <Eye className="h-4 w-4 mr-2" />
                            Ver Detalle
                          </Button>
                        </Link>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            <Card className="shadow-sm">
              <CardHeader>
                <CardTitle className="text-xl">Todas las Capacitaciones</CardTitle>
                <CardDescription>Busca y filtra tus capacitaciones asignadas</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex flex-col lg:flex-row gap-3">
                  <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                    <Input
                      placeholder="Buscar por nombre o código..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 h-11 text-base"
                    />
                  </div>
                  <Select value={estadoFilter} onValueChange={setEstadoFilter}>
                    <SelectTrigger className="w-full lg:w-56 h-11">
                      <div className="flex items-center gap-2">
                        <Filter className="h-4 w-4" />
                        <SelectValue placeholder="Estado" />
                      </div>
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="TODOS">Todos los estados</SelectItem>
                      <SelectItem value="PROGRAMADA">Programada</SelectItem>
                      <SelectItem value="EN_PROCESO">En Proceso</SelectItem>
                      <SelectItem value="FINALIZADA_CAPACITADOR">Finalizada</SelectItem>
                      <SelectItem value="EN_REVISION">En Revisión</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={tipoFilter} onValueChange={setTipoFilter}>
                    <SelectTrigger className="w-full lg:w-56 h-11">
                      <SelectValue placeholder="Tipo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="TODOS">Todos los tipos</SelectItem>
                      <SelectItem value="CURSO">Curso</SelectItem>
                      <SelectItem value="TALLER">Taller</SelectItem>
                      <SelectItem value="CHARLA">Charla</SelectItem>
                      <SelectItem value="OTRO">Otro</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-4">
                  {capacitacionesFiltradas.length === 0 ? (
                    <div className="text-center py-16 text-muted-foreground">
                      <div className="h-20 w-20 rounded-full bg-muted mx-auto mb-4 flex items-center justify-center">
                        <BookOpen className="h-10 w-10 opacity-50" />
                      </div>
                      <p className="text-lg font-medium">No se encontraron capacitaciones</p>
                      <p className="text-sm mt-1">
                        {misCapacitaciones.length === 0 
                          ? "Aún no tienes capacitaciones asignadas" 
                          : "Intenta ajustar los filtros de búsqueda"}
                      </p>
                    </div>
                  ) : (
                    capacitacionesFiltradas.map((cap) => (
                      <Card
                        key={cap.ID_SESION}
                        className="hover:shadow-lg transition-all border-2 hover:border-primary/50 dark:hover:border-primary group"
                      >
                        <CardContent className="px-6 py-4">
                          <div className="flex flex-col sm:flex-row items-start justify-between gap-4">
                            <div className="flex-1 space-y-3">
                              <div className="flex items-center gap-3 flex-wrap">
                                <h3 className="font-bold text-lg sm:text-xl group-hover:text-primary transition-colors dark:group-hover:text-foreground">
                                  {cap.NOMBRE}
                                </h3>
                                <Badge className={`${getEstadoColor(cap.ESTADO)} text-xs px-3 py-1`}>{cap.ESTADO}</Badge>
                                <Badge variant="outline" className="text-xs px-3 py-1">
                                  {cap.TIPO_CAPACITACION}
                                </Badge>
                              </div>
                              {cap.CODIGO_DOCUMENTO && (
                                <p className="text-sm text-muted-foreground font-mono bg-muted px-2 py-1 rounded inline-block">
                                  {cap.CODIGO_DOCUMENTO}
                                </p>
                              )}
                              <p className="text-sm text-muted-foreground leading-relaxed">{cap.GRUPO_OBJETIVO}</p>
                              <div className="flex flex-wrap gap-4 text-sm pt-2">
                                <span className="flex items-center gap-2 text-muted-foreground">
                                  <Calendar className="h-4 w-4 text-blue-600" />
                                  <span className="font-medium">
                                    {cap.FECHA_PROGRAMADA
                                      ? new Date(cap.FECHA_PROGRAMADA).toLocaleDateString("es-GT", {
                                          day: "numeric",
                                          month: "long",
                                          year: "numeric",
                                        })
                                      : "Sin fecha"}
                                  </span>
                                </span>
                                <span className="flex items-center gap-2 text-muted-foreground">
                                  <Clock className="h-4 w-4 text-purple-600" />
                                  <span className="font-medium">
                                    {cap.HORARIO_FORMATO_12H} · {cap.DURACION_FORMATO}
                                  </span>
                                </span>
                                <span className="flex items-center gap-2 text-muted-foreground">
                                  <Users className="h-4 w-4 text-green-600" />
                                  <span className="font-medium">{cap.TOTAL_COLABORADORES} participantes</span>
                                </span>
                              </div>
                            </div>
                            <Link href={`/mis-capacitaciones/${cap.ID_SESION}`}>
                              <Button size="lg" className="shrink-0 cursor-pointer">
                                <Eye className="h-4 w-4 mr-2" />
                                Ver Detalle
                              </Button>
                            </Link>
                          </div>
                        </CardContent>
                      </Card>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </main>
        </div>
      </div>
    </RequirePermission>
  )
}
