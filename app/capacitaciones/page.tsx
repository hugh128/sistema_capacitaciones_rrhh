"use client"

import { useMemo, useEffect, useState } from "react"
import { useAuth } from "@/contexts/auth-context"
import { Sidebar } from "@/components/sidebar"
import { AppHeader } from "@/components/app-header"
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { MetricsCards } from "@/components/capacitaciones/metrics-cards"
import { PendingAssignmentsTab } from "@/components/capacitaciones/pending-assignments-tab"
import { PendingReviewsTab } from "@/components/capacitaciones/pending-reviews-tab"
import { AllCapacitacionesTab } from "@/components/capacitaciones/all-capacitaciones-tab"
import { RequirePermission } from "@/components/RequirePermission"
import { useCapacitaciones } from "@/hooks/useCapacitaciones"
import { Toaster } from "react-hot-toast"

export default function GestionCapacitacionesPage() {
  const { user, loading } = useAuth()
  const [isInitialized, setIsInitialized] = useState(false)

  useEffect(() => {
    if (!loading && user) {
      setIsInitialized(true)
    }
  }, [loading, user])

  const {
    capacitaciones,
  } = useCapacitaciones(isInitialized ? user : null);

  const pendientesAsignacion = useMemo(() => {
    return capacitaciones.filter(
      (c) => c.ESTADO === "PENDIENTE_ASIGNACION" || c.ESTADO === "CREADA" || c.ESTADO === "ASIGNADA" || c.ESTADO_SESION === "PENDIENTE_ASIGNACION"
    )
  }, [capacitaciones])

  const pendientesRevision = useMemo(() => {
    return capacitaciones.filter(
      (c) => c.ESTADO === "FINALIZADA_CAPACITADOR"
    )
  }, [capacitaciones])

  const metrics = useMemo(() => {
    const total = capacitaciones.length

    const enProceso = capacitaciones.filter(c => c.ESTADO === "EN_PROCESO").length
    const finalizadasEsteMes = capacitaciones.filter(c => {
      if (c.ESTADO !== "FINALIZADA") return false
      if (!c.FECHA_PROGRAMADA) return false
      const fecha = new Date(c.FECHA_PROGRAMADA)
      const hoy = new Date()
      return fecha.getMonth() === hoy.getMonth() && fecha.getFullYear() === hoy.getFullYear()
    }).length

    const totalParticipantes = capacitaciones.reduce((sum, c) => sum + (c.TOTAL_COLABORADORES ?? 0), 0)
    const asistenciaPromedio = parseFloat((capacitaciones.reduce((sum, c) => sum + (c.TOTAL_ASISTENCIAS ?? 0), 0) / total || 0).toFixed(2))
    const aprobacionPromedio = parseFloat((capacitaciones.reduce((sum, c) => sum + (c.TOTAL_APROBADOS ?? 0), 0) / total || 0).toFixed(2))

    return {
      total,
      pendientesAsignacion: pendientesAsignacion.length,
      enProceso,
      pendientesRevision: pendientesRevision.length,
      finalizadasEsteMes,
      totalParticipantes,
      asistenciaPromedio,
      aprobacionPromedio
    }
  }, [capacitaciones, pendientesAsignacion.length, pendientesRevision.length])

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="w-96">
          <CardHeader>
            <CardTitle>Cargando...</CardTitle>
            <CardDescription>Inicializando sesión</CardDescription>
          </CardHeader>
          <div className="p-6 flex justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </Card>
      </div>
    )
  }

  if (!user || !user.ROLES.some((role) => role.NOMBRE === "RRHH" || role.NOMBRE === 'Auditoria')) {
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

  return (
    <RequirePermission requiredPermissions={["trainings_access"]}>
      <div className="flex h-screen bg-background">
        <Sidebar />
        <div className="flex-1 flex flex-col overflow-hidden">

          <AppHeader title="Gestión de Capacitaciones" subtitle="Panel de control para administrar todas las capacitaciones de la empresa" />

          <main className="flex-1 p-6 space-y-6 max-w-[1600px] mx-auto w-full overflow-auto custom-scrollbar">

            <Toaster />

            <MetricsCards
              total={metrics.total}
              pendientesAsignacion={metrics.pendientesAsignacion}
              enProceso={metrics.enProceso}
              pendientesRevision={metrics.pendientesRevision}
              finalizadasEsteMes={metrics.finalizadasEsteMes}
              totalParticipantes={metrics.totalParticipantes}
              asistenciaPromedio={metrics.asistenciaPromedio}
              aprobacionPromedio={metrics.aprobacionPromedio}
            />

            <Tabs defaultValue="pendientes" className="w-full">
              <TabsList className="flex flex-wrap w-full gap-1 p-1 h-auto">
                <TabsTrigger value="pendientes" className="flex-1 text-sm whitespace-nowrap cursor-pointer">Pendientes de Asignar ({pendientesAsignacion.length})</TabsTrigger>
                <TabsTrigger value="revision" className="flex-1 text-sm whitespace-nowrap cursor-pointer">Pendientes de Revisión ({pendientesRevision.length})</TabsTrigger>
                <TabsTrigger value="todas" className="flex-1 text-sm whitespace-nowrap cursor-pointer">Todas las Capacitaciones ({capacitaciones.length})</TabsTrigger>
              </TabsList>

              <TabsContent value="pendientes">
                <PendingAssignmentsTab
                  capacitaciones={pendientesAsignacion}
                />
              </TabsContent>

              <TabsContent value="revision">
                <PendingReviewsTab capacitaciones={pendientesRevision} />
              </TabsContent>

              <TabsContent value="todas">
                <AllCapacitacionesTab capacitaciones={capacitaciones} />
              </TabsContent>
            </Tabs>
          </main>
        </div>
      </div>
    </RequirePermission>
  )
}
