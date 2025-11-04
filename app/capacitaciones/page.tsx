"use client"

import { useMemo } from "react"
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
  const { user } = useAuth()
  const {
    capacitaciones,
  } = useCapacitaciones(user);

  // Separar por estado
  const pendientesAsignacion = useMemo(() => {
    return capacitaciones.filter(
      (c) => c.ESTADO === "PENDIENTE_ASIGNACION"
    )
  }, [capacitaciones])

  const pendientesRevision = useMemo(() => {
    return capacitaciones.filter(
      (c) => c.ESTADO === "FINALIZADA_CAPACITADOR"
    )
  }, [capacitaciones])

  // Calculate metrics
  const metrics = useMemo(() => {
    const total = capacitaciones.length

    const enProceso = capacitaciones.filter(c => c.ESTADO === "EN_PROCESO").length
    const finalizadasEsteMes = capacitaciones.filter(c => {
      if (c.ESTADO !== "FINALIZADA") return false
      if (!c.FECHA_INICIO) return false
      const fecha = new Date(c.FECHA_INICIO)
      const hoy = new Date()
      return fecha.getMonth() === hoy.getMonth() && fecha.getFullYear() === hoy.getFullYear()
    }).length

    const totalParticipantes = capacitaciones.reduce((sum, c) => sum + (c.TOTAL_COLABORADORES ?? 0), 0)
    const asistenciaPromedio = capacitaciones.reduce((sum, c) => sum + (c.TOTAL_ASISTENCIAS ?? 0), 0) / total || 0
    const aprobacionPromedio = capacitaciones.reduce((sum, c) => sum + (c.TOTAL_APROBADOS ?? 0), 0) / total || 0

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

  if (!user || !user.ROLES.some((role) => role.NOMBRE === "RRHH")) {
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
    <RequirePermission requiredPermissions={["manage_trainings"]}>
      <div className="flex h-screen bg-background">
        <Sidebar />
        <div className="flex-1 flex flex-col overflow-hidden">

          <AppHeader title="Gestión de Capacitaciones" subtitle="Panel de control para administrar todas las capacitaciones de la empresa" />

          <main className="flex-1 p-6 space-y-6 overflow-auto custom-scrollbar">

            <Toaster />

            {/* Metrics Cards */}
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

            {/* Main Tabs */}
            <Tabs defaultValue="pendientes" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="pendientes">Pendientes de Asignar ({pendientesAsignacion.length})</TabsTrigger>
                <TabsTrigger value="revision">Pendientes de Revisión ({pendientesRevision.length})</TabsTrigger>
                <TabsTrigger value="todas">Todas las Capacitaciones</TabsTrigger>
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
