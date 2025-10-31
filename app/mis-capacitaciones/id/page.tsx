"use client"

import { useState, useMemo } from "react"
import { useAuth } from "@/contexts/auth-context"
import { Sidebar } from "@/components/sidebar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Info, Users, FileText, Award } from "lucide-react"
import Link from "next/link"
import { useParams, useRouter } from "next/navigation"
import { mockCapacitaciones, getColaboradoresByCapacitacion } from "@/lib/mis-capacitaciones/capacitaciones-mock-data"
import type { EstadoCapacitacion } from "@/lib/mis-capacitaciones/capacitaciones-types"
import { TrainingHeader } from "@/components/mis-capacitaciones/training-header"
import { InfoTab } from "@/components/mis-capacitaciones/info-tab"
import { ParticipantsTab } from "@/lib/mis-capacitaciones/participants-tab"
import { DocumentsTab } from "@/lib/mis-capacitaciones/documents-tab"
import { FinalizationTab } from "@/lib/mis-capacitaciones/finalization-tab"
import { RequirePermission } from "@/components/RequirePermission"

export default function TrainerCapacitacionDetailPage() {
  const { user } = useAuth()
  const params = useParams()
  const router = useRouter()
  const capacitacionId = Number(params.id)

  const capacitacion = useMemo(() => {
    return mockCapacitaciones.find((c) => c.ID_CAPACITACION === capacitacionId)
  }, [capacitacionId])

  const colaboradores = useMemo(() => {
    return getColaboradoresByCapacitacion(capacitacionId)
  }, [capacitacionId])

  const [asistenciaState, setAsistenciaState] = useState<Record<number, boolean>>(() => {
    const initial: Record<number, boolean> = {}
    colaboradores.forEach((col) => {
      if (col.ASISTIO !== null) {
        initial[col.ID_COLABORADOR] = col.ASISTIO
      }
    })
    return initial
  })

  const [notasState, setNotasState] = useState<Record<number, number | null>>(() => {
    const initial: Record<number, number | null> = {}
    colaboradores.forEach((col) => {
      initial[col.ID_COLABORADOR] = col.NOTA_OBTENIDA
    })
    return initial
  })

  const [examenesState, setExamenesState] = useState<Record<number, boolean>>(() => {
    const initial: Record<number, boolean> = {}
    colaboradores.forEach((col) => {
      initial[col.ID_COLABORADOR] = !!col.URL_EXAMEN
    })
    return initial
  })

  const [diplomasState, setDiplomasState] = useState<Record<number, boolean>>(() => {
    const initial: Record<number, boolean> = {}
    colaboradores.forEach((col) => {
      initial[col.ID_COLABORADOR] = !!col.URL_DIPLOMA
    })
    return initial
  })

  const [observacionesFinales, setObservacionesFinales] = useState("")

  const stats = useMemo(() => {
    const total = colaboradores.length
    const asistencias = Object.values(asistenciaState).filter((a) => a === true).length
    const examenes = Object.values(examenesState).filter((e) => e === true).length
    const diplomas = Object.values(diplomasState).filter((d) => d === true).length
    const pendientes = colaboradores.filter((col) => {
      const asistio = asistenciaState[col.ID_COLABORADOR]
      return asistio === undefined || asistio === null
    }).length

    return { total, asistencias, examenes, diplomas, pendientes }
  }, [colaboradores, asistenciaState, examenesState, diplomasState])

  const canFinalize = useMemo(() => {
    if (!capacitacion) return false
    if (capacitacion.ESTADO !== "EN_PROCESO") return false

    const allAttendanceMarked = colaboradores.every((c) => asistenciaState[c.ID_COLABORADOR] !== undefined)
    if (!allAttendanceMarked) return false

    if (capacitacion.APLICA_EXAMEN) {
      const attendees = colaboradores.filter((c) => asistenciaState[c.ID_COLABORADOR] === true)
      const allExamsUploaded = attendees.every((c) => examenesState[c.ID_COLABORADOR])
      if (!allExamsUploaded) return false
    }

    return true
  }, [capacitacion, colaboradores, asistenciaState, examenesState])

  const handleToggleAsistencia = (colaboradorId: number, currentValue: boolean | undefined) => {
    const newValue = currentValue === true ? false : true
    console.log("[v0] Toggling attendance:", { colaboradorId, newValue })
    setAsistenciaState((prev) => ({ ...prev, [colaboradorId]: newValue }))
    alert(`Asistencia actualizada: ${newValue ? "Asistió" : "No asistió"}`)
  }

  const handleUpdateNota = (colaboradorId: number, nota: number) => {
    console.log("[v0] Updating grade:", { colaboradorId, nota })
    setNotasState((prev) => ({ ...prev, [colaboradorId]: nota }))
    alert(`Nota guardada: ${nota}`)
  }

  const handleSubirDocumento = (tipo: "examen" | "diploma", colaboradorId: number) => {
    console.log("[v0] Uploading document:", { tipo, colaboradorId })
    if (tipo === "examen") {
      setExamenesState((prev) => ({ ...prev, [colaboradorId]: true }))
    } else {
      setDiplomasState((prev) => ({ ...prev, [colaboradorId]: true }))
    }
    alert(`${tipo === "examen" ? "Examen" : "Diploma"} subido correctamente`)
  }

  const handleEliminarDocumento = (tipo: "examen" | "diploma", colaboradorId: number) => {
    console.log("[v0] Deleting document:", { tipo, colaboradorId })
    if (tipo === "examen") {
      setExamenesState((prev) => ({ ...prev, [colaboradorId]: false }))
    } else {
      setDiplomasState((prev) => ({ ...prev, [colaboradorId]: false }))
    }
    alert(`${tipo === "examen" ? "Examen" : "Diploma"} eliminado`)
  }

  const handleMarcarAsistenciaMasiva = (asistio: boolean, colaboradorIds: number[]) => {
    console.log("[v0] Bulk attendance update:", { count: colaboradorIds.length, asistio })
    const updates: Record<number, boolean> = {}
    colaboradorIds.forEach((id) => {
      updates[id] = asistio
    })
    setAsistenciaState((prev) => ({ ...prev, ...updates }))
    alert(`Asistencia actualizada para ${colaboradorIds.length} colaboradores`)
  }

  const handleSubirListaAsistencia = () => {
    console.log("[v0] Uploading attendance list")
    alert("Subiendo lista de asistencia general")
  }

  const handleFinalizar = () => {
    if (!canFinalize) {
      alert("No se puede finalizar. Completa todos los requisitos.")
      return
    }
    console.log("[v0] Finalizing capacitacion:", capacitacionId)
    alert("Capacitación finalizada y enviada a RRHH para revisión")
    router.push("/mis-capacitaciones")
  }

  const handleChangeEstado = (nuevoEstado: EstadoCapacitacion) => {
    console.log("[v0] Changing estado to:", nuevoEstado)
    alert(`Estado cambiado a: ${nuevoEstado}`)
  }

  if (
    !user ||
    !user.ROLES.some(
      (role) => (role.NOMBRE === "Capacitador" || role.NOMBRE === "RRHH")
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

  if (!capacitacion) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="w-96">
          <CardHeader>
            <CardTitle>Capacitación no encontrada</CardTitle>
            <CardDescription>La capacitación solicitada no existe.</CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/mis-capacitaciones">
              <Button>Volver a Mis Capacitaciones</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <RequirePermission requiredPermissions={["manage_trainings"]}>
      <div className="flex h-screen bg-background">
        <Sidebar />
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* <AppHeader /> */}
          <main className="flex-1 p-6 space-y-6 max-w-[1600px] mx-auto w-full">
            <TrainingHeader capacitacion={capacitacion} onChangeEstado={handleChangeEstado} />

            <Tabs defaultValue="info" className="w-full">
              <TabsList className="grid w-full grid-cols-4 h-auto p-1">
                <TabsTrigger value="info" className="flex items-center gap-2 py-3">
                  <Info className="h-4 w-4" />
                  <span className="hidden sm:inline">Información</span>
                </TabsTrigger>
                <TabsTrigger value="participantes" className="flex items-center gap-2 py-3">
                  <Users className="h-4 w-4" />
                  <span className="hidden sm:inline">Participantes</span>
                </TabsTrigger>
                <TabsTrigger value="documentos" className="flex items-center gap-2 py-3">
                  <FileText className="h-4 w-4" />
                  <span className="hidden sm:inline">Documentos</span>
                </TabsTrigger>
                <TabsTrigger value="finalizacion" className="flex items-center gap-2 py-3">
                  <Award className="h-4 w-4" />
                  <span className="hidden sm:inline">Finalización</span>
                </TabsTrigger>
              </TabsList>

              <TabsContent value="info" className="space-y-4 mt-6">
                <InfoTab capacitacion={capacitacion} />
              </TabsContent>

              <TabsContent value="participantes" className="space-y-4 mt-6">
                <ParticipantsTab
                  capacitacion={capacitacion}
                  colaboradores={colaboradores}
                  asistenciaState={asistenciaState}
                  notasState={notasState}
                  examenesState={examenesState}
                  diplomasState={diplomasState}
                  onToggleAsistencia={handleToggleAsistencia}
                  onUpdateNota={handleUpdateNota}
                  onSubirDocumento={handleSubirDocumento}
                  onEliminarDocumento={handleEliminarDocumento}
                  onMarcarAsistenciaMasiva={handleMarcarAsistenciaMasiva}
                />
              </TabsContent>

              <TabsContent value="documentos" className="space-y-4 mt-6">
                <DocumentsTab
                  capacitacion={capacitacion}
                  stats={stats}
                  onSubirListaAsistencia={handleSubirListaAsistencia}
                />
              </TabsContent>

              <TabsContent value="finalizacion" className="space-y-4 mt-6">
                <FinalizationTab
                  capacitacion={capacitacion}
                  stats={stats}
                  canFinalize={canFinalize}
                  observacionesFinales={observacionesFinales}
                  onObservacionesChange={setObservacionesFinales}
                  onFinalizar={handleFinalizar}
                />
              </TabsContent>
            </Tabs>
          </main>
        </div>
      </div>
    </RequirePermission>
  )
}
