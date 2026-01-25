"use client"

import { useState, useMemo, useEffect, useCallback, useRef } from "react"
import { useAuth } from "@/contexts/auth-context"
import { Sidebar } from "@/components/sidebar"
import { AppHeader } from "@/components/app-header"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { AlertTriangle, RefreshCw } from "lucide-react"
import { CapacitacionSesion } from "@/lib/mis-capacitaciones/capacitaciones-types"
import { RequirePermission } from "@/components/RequirePermission"
import { useCapacitaciones } from "@/hooks/useCapacitaciones"
import { Toaster } from "react-hot-toast"
import { CapacitadorMetricsCards } from "@/components/mis-capacitaciones/capacitador-metrics-cards"
import { ProximasCapacitaciones } from "@/components/mis-capacitaciones/proximas-capacitaciones"
import { CapacitacionesProgramadasTab } from "@/components/mis-capacitaciones/capacitaciones-programadas-tab"
import { TodasCapacitacionesTab } from "@/components/mis-capacitaciones/todas-capacitaciones-tab"

export default function MisCapacitacionesPage() {
  const { user } = useAuth()
  const [misCapacitaciones, setMisCapacitaciones] = useState<CapacitacionSesion[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [hasError, setHasError] = useState(false)
  const [errorMessage, setErrorMessage] = useState("")

  const isFetchingRef = useRef(false)
  const hasFetchedRef = useRef(false)

  const { obtenerCapacitacionesPorCapacitador } = useCapacitaciones(user)

  const fetchCapacitaciones = useCallback(async () => {
    if (!user?.PERSONA_ID || isFetchingRef.current) {
      setIsLoading(false)
      return
    }

    isFetchingRef.current = true
    setIsLoading(true)
    setHasError(false)
    setErrorMessage("")

    try {
      const capacitaciones = await obtenerCapacitacionesPorCapacitador(user.PERSONA_ID)
      
      if (Array.isArray(capacitaciones)) {
        setMisCapacitaciones(capacitaciones)
        hasFetchedRef.current = true
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
      isFetchingRef.current = false
    }
  }, [user?.PERSONA_ID, obtenerCapacitacionesPorCapacitador])

  useEffect(() => {
    if (!hasFetchedRef.current) {
      fetchCapacitaciones()
    }
  }, [fetchCapacitaciones])

  const metrics = useMemo(() => {
    if (!Array.isArray(misCapacitaciones) || misCapacitaciones.length === 0) {
      return { total: 0, pendientes: 0, enProceso: 0, finalizadasEsteMes: 0 }
    }

    try {
      const hoy = new Date()
      const mesActual = hoy.getMonth()
      const añoActual = hoy.getFullYear()
      
      let pendientes = 0
      let enProceso = 0
      let finalizadasEsteMes = 0

      for (const c of misCapacitaciones) {
        if (c.ESTADO === "PROGRAMADA") pendientes++
        if (c.ESTADO === "EN_PROCESO") enProceso++
        
        if ((c.ESTADO === "FINALIZADA" || c.ESTADO === "FINALIZADA_CAPACITADOR") && c.FECHA_PROGRAMADA) {
          const fecha = new Date(c.FECHA_PROGRAMADA)
          if (fecha.getMonth() === mesActual && fecha.getFullYear() === añoActual) {
            finalizadasEsteMes++
          }
        }
      }

      return {
        total: misCapacitaciones.length,
        pendientes,
        enProceso,
        finalizadasEsteMes
      }
    } catch (error) {
      console.error('Error al calcular métricas:', error)
      return { total: 0, pendientes: 0, enProceso: 0, finalizadasEsteMes: 0 }
    }
  }, [misCapacitaciones])

  const proximasCapacitaciones = useMemo(() => {
    if (!Array.isArray(misCapacitaciones) || misCapacitaciones.length === 0) {
      return []
    }

    try {
      const hoy = new Date()
      hoy.setHours(0, 0, 0, 0)
      const enSieteDias = new Date(hoy)
      enSieteDias.setDate(hoy.getDate() + 7)

      return misCapacitaciones
        .filter((cap) => {
          if (!cap.FECHA_PROGRAMADA) return false
          const fecha = new Date(cap.FECHA_PROGRAMADA)
          fecha.setHours(0, 0, 0, 0)

          return fecha >= hoy && 
                 fecha <= enSieteDias && 
                 (cap.ESTADO === "ASIGNADA" || cap.ESTADO === "PROGRAMADA")
        })
        .sort((a, b) => {
          const fechaA = new Date(a.FECHA_PROGRAMADA!).getTime()
          const fechaB = new Date(b.FECHA_PROGRAMADA!).getTime()
          return fechaA - fechaB
        })
        .slice(0, 5)
    } catch (error) {
      console.error('Error al calcular próximas capacitaciones:', error)
      return []
    }
  }, [misCapacitaciones])

  const capacitacionesProgramadasYRechazadas = useMemo(() => {
    if (!Array.isArray(misCapacitaciones)) return []
    
    return misCapacitaciones.filter(
      (cap) => cap.ESTADO === "PROGRAMADA" || cap.ESTADO === "RECHAZADA"
    )
  }, [misCapacitaciones])

  const hasAccess = user?.ROLES.some(
    (role) => role.NOMBRE === "Capacitador" || role.NOMBRE === "RRHH"
  )

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

  if (!user || !hasAccess) {
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
                  onClick={() => {
                    hasFetchedRef.current = false
                    fetchCapacitaciones()
                  }}
                  className="w-full cursor-pointer"
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
    <RequirePermission requiredPermissions={["my_trainings_access"]}>
      <div className="flex h-screen bg-background">
        <Sidebar />
        <div className="flex-1 flex flex-col overflow-hidden">

          <AppHeader 
            title="Mis Capacitaciones" 
            subtitle="Gestiona tus capacitaciones asignadas y registra el progreso de los participantes" 
          />

          <main className="flex-1 p-6 space-y-6 max-w-[1600px] mx-auto w-full overflow-auto custom-scrollbar">
            <Toaster />

            {/* Métricas */}
            <CapacitadorMetricsCards
              total={metrics.total}
              pendientes={metrics.pendientes}
              enProceso={metrics.enProceso}
              finalizadasEsteMes={metrics.finalizadasEsteMes}
              loading={false}
            />

            {/* Próximas Capacitaciones */}
            <ProximasCapacitaciones 
              capacitaciones={proximasCapacitaciones}
              loading={false}
            />

            {/* Tabs de capacitaciones */}
            <Tabs defaultValue="programadas" className="w-full">
              <TabsList className="flex flex-wrap w-full gap-1 p-1 h-auto">
                <TabsTrigger value="programadas" className="flex-1 text-sm whitespace-nowrap cursor-pointer data-[state=active]:border-b-blue-800 dark:data-[state=active]:border-b-blue-800 data-[state=active]:bg-white/60 dark:data-[state=active]:bg-transparent">
                  Programadas y Rechazadas ({capacitacionesProgramadasYRechazadas.length})
                </TabsTrigger>
                <TabsTrigger value="todas" className="flex-1 text-sm whitespace-nowrap cursor-pointer data-[state=active]:border-b-blue-800 dark:data-[state=active]:border-b-blue-800 data-[state=active]:bg-white/60 dark:data-[state=active]:bg-transparent">
                  Todas las Capacitaciones ({misCapacitaciones.length})
                </TabsTrigger>
              </TabsList>

              <TabsContent value="programadas">
                <CapacitacionesProgramadasTab 
                  capacitaciones={capacitacionesProgramadasYRechazadas}
                  loading={false}
                />
              </TabsContent>

              <TabsContent value="todas">
                <TodasCapacitacionesTab 
                  capacitaciones={misCapacitaciones}
                  loading={false}
                />
              </TabsContent>
            </Tabs>
          </main>
        </div>
      </div>
    </RequirePermission>
  )
}
