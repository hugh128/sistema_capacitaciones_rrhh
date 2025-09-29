"use client"

import { useState } from "react"
import { Sidebar } from "@/components/sidebar"
import { DataTable } from "@/components/data-table"
import { FormModal } from "@/components/form-modal"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { mockParticipantes, mockPersonas, mockCapacitaciones, type Participante } from "@/lib/types"
import { useAuth } from "@/contexts/auth-context"
import { Users, CheckCircle, XCircle, Clock, Award } from "lucide-react"
import { AppHeader } from "@/components/app-header"

export default function ParticipantesPage() {
  const { user } = useAuth()
  const [participantes, setParticipantes] = useState<Participante[]>(mockParticipantes)
  const [modalOpen, setModalOpen] = useState(false)
  const [editingParticipante, setEditingParticipante] = useState<Participante | null>(null)

  const columns = [
    {
      key: "personaId",
      label: "Participante",
      render: (value: string) => {
        const persona = mockPersonas.find((p) => p.id === value)
        return persona ? `${persona.nombre} ${persona.apellido}` : "N/A"
      },
    },
    {
      key: "capacitacionId",
      label: "Capacitación",
      render: (value: string) => {
        const capacitacion = mockCapacitaciones.find((c) => c.id === value)
        return capacitacion?.nombre || "N/A"
      },
    },
    {
      key: "estado",
      label: "Estado",
      render: (value: string) => {
        const variants = {
          asignado: "secondary" as const,
          completado: "default" as const,
          aprobado: "outline" as const,
          reprobado: "destructive" as const,
        }
        return <Badge variant={variants[value as keyof typeof variants]}>{value}</Badge>
      },
    },
    {
      key: "asistencia",
      label: "Asistencia",
      render: (value: boolean) =>
        value ? <CheckCircle className="h-4 w-4 text-chart-2" /> : <XCircle className="h-4 w-4 text-destructive" />,
    },
    {
      key: "notaExamen",
      label: "Nota Examen",
      render: (value: number) => (value ? `${value}/100` : "N/A"),
    },
    { key: "fechaAsignacion", label: "Fecha Asignación" },
    { key: "fechaCompletado", label: "Fecha Completado" },
  ]

  const formFields = [
    {
      key: "personaId",
      label: "Participante",
      type: "select" as const,
      required: true,
      options: mockPersonas.map((p) => ({ value: p.id, label: `${p.nombre} ${p.apellido}` })),
    },
    {
      key: "capacitacionId",
      label: "Capacitación",
      type: "select" as const,
      required: true,
      options: mockCapacitaciones.map((c) => ({ value: c.id, label: c.nombre })),
    },
    {
      key: "estado",
      label: "Estado",
      type: "select" as const,
      required: true,
      options: [
        { value: "asignado", label: "Asignado" },
        { value: "completado", label: "Completado" },
        { value: "aprobado", label: "Aprobado" },
        { value: "reprobado", label: "Reprobado" },
      ],
    },
    {
      key: "asistencia",
      label: "Asistencia",
      type: "select" as const,
      required: true,
      options: [
        { value: "true", label: "Presente" },
        { value: "false", label: "Ausente" },
      ],
    },
    { key: "notaExamen", label: "Nota Examen (0-100)", type: "text" as const },
    { key: "fechaCompletado", label: "Fecha Completado", type: "text" as const, placeholder: "YYYY-MM-DD" },
  ]

  const handleAdd = () => {
    setEditingParticipante(null)
    setModalOpen(true)
  }

  const handleEdit = (participante: Participante) => {
    setEditingParticipante(participante)
    setModalOpen(true)
  }

  const handleDelete = (participante: Participante) => {
    if (confirm("¿Estás seguro de que deseas eliminar este participante?")) {
      setParticipantes((prev) => prev.filter((p) => p.id !== participante.id))
    }
  }

  const handleSubmit = (data: any) => {
    const processedData = {
      ...data,
      asistencia: data.asistencia === "true",
      notaExamen: data.notaExamen ? Number.parseInt(data.notaExamen) : undefined,
    }

    if (editingParticipante) {
      setParticipantes((prev) =>
        prev.map((p) =>
          p.id === editingParticipante.id
            ? { ...p, ...processedData, documentosAsociados: editingParticipante.documentosAsociados }
            : p,
        ),
      )
    } else {
      const newParticipante: Participante = {
        ...processedData,
        id: Date.now().toString(),
        fechaAsignacion: new Date().toISOString().split("T")[0],
        documentosAsociados: [],
      }
      setParticipantes((prev) => [...prev, newParticipante])
    }
    setModalOpen(false)
  }

  // Statistics
  const stats = {
    total: participantes.length,
    aprobados: participantes.filter((p) => p.estado === "aprobado").length,
    completados: participantes.filter((p) => p.estado === "completado").length,
    asignados: participantes.filter((p) => p.estado === "asignado").length,
  }

  const getStatusIcon = (estado: string) => {
    switch (estado) {
      case "aprobado":
        return <Award className="w-4 h-4 text-chart-2" />
      case "completado":
        return <CheckCircle className="w-4 h-4 text-chart-4" />
      case "reprobado":
        return <XCircle className="w-4 h-4 text-destructive" />
      default:
        return <Clock className="w-4 h-4 text-muted-foreground" />
    }
  }

  return (
    <div className="flex h-screen bg-background">
      <Sidebar />

      <div className="flex-1 flex flex-col overflow-hidden">
        <AppHeader title="Participantes" subtitle="Gestiona los participantes de las capacitaciones" />

        <main className="flex-1 overflow-auto p-6 custom-scrollbar">
          <div className="max-w-7xl mx-auto space-y-6">
            {/* Statistics Cards */}
            <div className="grid gap-4 md:grid-cols-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Participantes</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.total}</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Aprobados</CardTitle>
                  <Award className="h-4 w-4 text-chart-2" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-chart-2">{stats.aprobados}</div>
                  <Progress value={(stats.aprobados / stats.total) * 100} className="mt-2" />
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Completados</CardTitle>
                  <CheckCircle className="h-4 w-4 text-chart-4" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-chart-4">{stats.completados}</div>
                  <Progress value={(stats.completados / stats.total) * 100} className="mt-2" />
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">En Proceso</CardTitle>
                  <Clock className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.asignados}</div>
                  <Progress value={(stats.asignados / stats.total) * 100} className="mt-2" />
                </CardContent>
              </Card>
            </div>

            {/* Recent Participants */}
            <Card>
              <CardHeader>
                <CardTitle>Participantes Recientes</CardTitle>
                <CardDescription>Últimos participantes registrados</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {participantes.slice(0, 5).map((participante) => {
                    const persona = mockPersonas.find((p) => p.id === participante.personaId)
                    const capacitacion = mockCapacitaciones.find((c) => c.id === participante.capacitacionId)

                    return (
                      <div key={participante.id} className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          {getStatusIcon(participante.estado)}
                          <div>
                            <p className="font-medium">{persona ? `${persona.nombre} ${persona.apellido}` : "N/A"}</p>
                            <p className="text-sm text-muted-foreground">{capacitacion?.nombre}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <Badge variant={participante.estado === "aprobado" ? "default" : "secondary"}>
                            {participante.estado}
                          </Badge>
                          {participante.notaExamen && (
                            <p className="text-sm text-muted-foreground mt-1">Nota: {participante.notaExamen}/100</p>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Data Table */}
            <DataTable
              title="Todos los Participantes"
              data={participantes}
              columns={columns}
              onAdd={handleAdd}
              onEdit={handleEdit}
              onDelete={user?.roles.some((role) => role.nombre === "RRHH") ? handleDelete : undefined}
              searchPlaceholder="Buscar participantes..."
            />
          </div>
        </main>
      </div>

      <FormModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        title={editingParticipante ? "Editar Participante" : "Nuevo Participante"}
        description={editingParticipante ? "Modifica los datos del participante" : "Asigna un nuevo participante"}
        fields={formFields}
        initialData={
          editingParticipante
            ? {
                ...editingParticipante,
                asistencia: editingParticipante.asistencia.toString(),
                notaExamen: editingParticipante.notaExamen?.toString() || "",
              }
            : {}
        }
        onSubmit={handleSubmit}
      />
    </div>
  )
}
