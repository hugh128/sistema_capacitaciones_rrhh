"use client"

import { useState } from "react"
import { Sidebar } from "@/components/sidebar"
import { DataTable } from "@/components/data-table"
import { FormModal } from "@/components/form-modal"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Checkbox } from "@/components/ui/checkbox"
import {
  mockParticipantes,
  mockPersonas,
  mockCapacitaciones,
  mockDepartamentos,
  mockPuestos,
  type Participante,
} from "@/lib/types"
import { useAuth } from "@/contexts/auth-context"
import { Users, CheckCircle, XCircle, Clock, Award, UserPlus, Building2, Briefcase } from "lucide-react"
import { AppHeader } from "@/components/app-header"

export default function ParticipantesPage() {
  const { user } = useAuth()
  const [participantes, setParticipantes] = useState<Participante[]>(mockParticipantes)
  const [modalOpen, setModalOpen] = useState(false)
  const [assignmentModalOpen, setAssignmentModalOpen] = useState(false)
  const [editingParticipante, setEditingParticipante] = useState<Participante | null>(null)
  const [selectedCapacitacion, setSelectedCapacitacion] = useState<string>("")
  const [selectedPersonas, setSelectedPersonas] = useState<string[]>([])
  const [assignmentType, setAssignmentType] = useState<"individual" | "departamento" | "puesto">("individual")

  // Filter participants based on user role
  const filteredParticipantes = user?.roles.some((role) => role.nombre === "Capacitador")
    ? participantes.filter((p) => {
        const capacitacion = mockCapacitaciones.find((c) => c.id === p.capacitacionId)
        return capacitacion?.capacitadorId === user.id
      })
    : participantes

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
          asistió: "default" as const,
          aprobado: "outline" as const,
          reprobado: "destructive" as const,
          pendiente: "secondary" as const,
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
        { value: "asistió", label: "Asistió" },
        { value: "aprobado", label: "Aprobado" },
        { value: "reprobado", label: "Reprobado" },
        { value: "pendiente", label: "Pendiente" },
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
    { key: "notaExamen", label: "Nota Examen (0-100)", type: "number" as const },
    { key: "fechaCompletado", label: "Fecha Completado", type: "date" as const },
  ]

  const handleAdd = () => {
    setEditingParticipante(null)
    setModalOpen(true)
  }

  const handleBulkAssignment = () => {
    setAssignmentModalOpen(true)
    setSelectedPersonas([])
    setSelectedCapacitacion("")
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

  const handleBulkAssignmentSubmit = () => {
    if (!selectedCapacitacion || selectedPersonas.length === 0) return

    const newParticipantes = selectedPersonas.map((personaId) => ({
      id: `${Date.now()}-${personaId}`,
      personaId,
      capacitacionId: selectedCapacitacion,
      estado: "asignado" as const,
      fechaAsignacion: new Date().toISOString().split("T")[0],
      asistencia: false,
      documentosAsociados: [],
    }))

    setParticipantes((prev) => [...prev, ...newParticipantes])
    setAssignmentModalOpen(false)
    setSelectedPersonas([])
    setSelectedCapacitacion("")
  }

  const getPersonasByDepartment = (departamentoId: string) => {
    return mockPersonas.filter((p) => p.departamentoId === departamentoId && p.estado === "activo")
  }

  const getPersonasByPuesto = (puestoId: string) => {
    return mockPersonas.filter((p) => p.puestoId === puestoId && p.estado === "activo")
  }

  const handleAssignmentTypeChange = (type: "individual" | "departamento" | "puesto") => {
    setAssignmentType(type)
    setSelectedPersonas([])
  }

  const handleDepartmentSelection = (departamentoId: string, checked: boolean) => {
    const departmentPersonas = getPersonasByDepartment(departamentoId).map((p) => p.id)
    if (checked) {
      setSelectedPersonas((prev) => [...new Set([...prev, ...departmentPersonas])])
    } else {
      setSelectedPersonas((prev) => prev.filter((id) => !departmentPersonas.includes(id)))
    }
  }

  const handlePuestoSelection = (puestoId: string, checked: boolean) => {
    const puestoPersonas = getPersonasByPuesto(puestoId).map((p) => p.id)
    if (checked) {
      setSelectedPersonas((prev) => [...new Set([...prev, ...puestoPersonas])])
    } else {
      setSelectedPersonas((prev) => prev.filter((id) => !puestoPersonas.includes(id)))
    }
  }

  // Statistics
  const stats = {
    total: filteredParticipantes.length,
    aprobados: filteredParticipantes.filter((p) => p.estado === "aprobado").length,
    asistieron: filteredParticipantes.filter((p) => p.estado === "asistió").length,
    asignados: filteredParticipantes.filter((p) => p.estado === "asignado").length,
    pendientes: filteredParticipantes.filter((p) => p.estado === "pendiente").length,
  }

  const getStatusIcon = (estado: string) => {
    switch (estado) {
      case "aprobado":
        return <Award className="w-4 h-4 text-chart-2" />
      case "asistió":
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

        <main className="flex-1 overflow-auto p-6">
          <div className="max-w-7xl mx-auto space-y-6">
            {/* Statistics Cards */}
            <div className="grid gap-4 md:grid-cols-5">
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
                  <Progress value={stats.total > 0 ? (stats.aprobados / stats.total) * 100 : 0} className="mt-2" />
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Asistieron</CardTitle>
                  <CheckCircle className="h-4 w-4 text-chart-4" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-chart-4">{stats.asistieron}</div>
                  <Progress value={stats.total > 0 ? (stats.asistieron / stats.total) * 100 : 0} className="mt-2" />
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Asignados</CardTitle>
                  <Clock className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.asignados}</div>
                  <Progress value={stats.total > 0 ? (stats.asignados / stats.total) * 100 : 0} className="mt-2" />
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Pendientes</CardTitle>
                  <Clock className="h-4 w-4 text-warning" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-warning">{stats.pendientes}</div>
                  <Progress value={stats.total > 0 ? (stats.pendientes / stats.total) * 100 : 0} className="mt-2" />
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
                  {filteredParticipantes.slice(0, 5).map((participante) => {
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
              data={filteredParticipantes}
              columns={columns}
              onAdd={handleAdd}
              onEdit={handleEdit}
              onDelete={user?.roles.some((role) => role.nombre === "RRHH") ? handleDelete : undefined}
              searchPlaceholder="Buscar participantes..."
              customActions={
                user?.roles.some((role) => ["RRHH", "Capacitador"].includes(role.nombre)) ? (
                  <Button onClick={handleBulkAssignment} variant="outline" className="gap-2 bg-transparent">
                    <UserPlus className="w-4 h-4" />
                    Asignación Masiva
                  </Button>
                ) : undefined
              }
            />
          </div>
        </main>
      </div>

      {/* Individual Participant Modal */}
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

      {/* Bulk Assignment Modal */}
      <FormModal
        open={assignmentModalOpen}
        onOpenChange={setAssignmentModalOpen}
        title="Asignación Masiva de Participantes"
        description="Asigna múltiples participantes a una capacitación"
        customContent={
          <div className="space-y-6">
            {/* Training Selection */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Capacitación</label>
              <select
                value={selectedCapacitacion}
                onChange={(e) => setSelectedCapacitacion(e.target.value)}
                className="w-full p-2 border rounded-md"
              >
                <option value="">Seleccionar capacitación...</option>
                {mockCapacitaciones
                  .filter((c) => user?.roles.some((role) => role.nombre === "RRHH") || c.capacitadorId === user?.id)
                  .map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.nombre}
                    </option>
                  ))}
              </select>
            </div>

            {/* Assignment Type Tabs */}
            <Tabs value={assignmentType} onValueChange={(value) => handleAssignmentTypeChange(value as any)}>
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="individual">Individual</TabsTrigger>
                <TabsTrigger value="departamento">Por Departamento</TabsTrigger>
                <TabsTrigger value="puesto">Por Puesto</TabsTrigger>
              </TabsList>

              <TabsContent value="individual" className="space-y-4">
                <div className="max-h-60 overflow-y-auto space-y-2">
                  {mockPersonas
                    .filter((p) => p.estado === "activo")
                    .map((persona) => (
                      <div key={persona.id} className="flex items-center space-x-2">
                        <Checkbox
                          id={persona.id}
                          checked={selectedPersonas.includes(persona.id)}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setSelectedPersonas((prev) => [...prev, persona.id])
                            } else {
                              setSelectedPersonas((prev) => prev.filter((id) => id !== persona.id))
                            }
                          }}
                        />
                        <label htmlFor={persona.id} className="text-sm">
                          {persona.nombre} {persona.apellido}
                        </label>
                      </div>
                    ))}
                </div>
              </TabsContent>

              <TabsContent value="departamento" className="space-y-4">
                <div className="space-y-4">
                  {mockDepartamentos
                    .filter((d) => d.estado === "activo")
                    .map((departamento) => {
                      const departmentPersonas = getPersonasByDepartment(departamento.id)
                      const allSelected = departmentPersonas.every((p) => selectedPersonas.includes(p.id))

                      return (
                        <div key={departamento.id} className="space-y-2">
                          <div className="flex items-center space-x-2">
                            <Checkbox
                              id={departamento.id}
                              checked={allSelected}
                              onCheckedChange={(checked) =>
                                handleDepartmentSelection(departamento.id, checked as boolean)
                              }
                            />
                            <Building2 className="w-4 h-4" />
                            <label htmlFor={departamento.id} className="font-medium">
                              {departamento.nombre} ({departmentPersonas.length} personas)
                            </label>
                          </div>
                          <div className="ml-6 space-y-1">
                            {departmentPersonas.map((persona) => (
                              <div key={persona.id} className="text-sm text-muted-foreground">
                                • {persona.nombre} {persona.apellido}
                              </div>
                            ))}
                          </div>
                        </div>
                      )
                    })}
                </div>
              </TabsContent>

              <TabsContent value="puesto" className="space-y-4">
                <div className="space-y-4">
                  {mockPuestos
                    .filter((p) => p.estado === "activo")
                    .map((puesto) => {
                      const puestoPersonas = getPersonasByPuesto(puesto.id)
                      const allSelected = puestoPersonas.every((p) => selectedPersonas.includes(p.id))

                      return (
                        <div key={puesto.id} className="space-y-2">
                          <div className="flex items-center space-x-2">
                            <Checkbox
                              id={puesto.id}
                              checked={allSelected}
                              onCheckedChange={(checked) => handlePuestoSelection(puesto.id, checked as boolean)}
                            />
                            <Briefcase className="w-4 h-4" />
                            <label htmlFor={puesto.id} className="font-medium">
                              {puesto.nombre} ({puestoPersonas.length} personas)
                            </label>
                          </div>
                          <div className="ml-6 space-y-1">
                            {puestoPersonas.map((persona) => (
                              <div key={persona.id} className="text-sm text-muted-foreground">
                                • {persona.nombre} {persona.apellido}
                              </div>
                            ))}
                          </div>
                        </div>
                      )
                    })}
                </div>
              </TabsContent>
            </Tabs>

            <div className="flex justify-between items-center pt-4 border-t">
              <p className="text-sm text-muted-foreground">{selectedPersonas.length} participante(s) seleccionado(s)</p>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setAssignmentModalOpen(false)}>
                  Cancelar
                </Button>
                <Button
                  onClick={handleBulkAssignmentSubmit}
                  disabled={!selectedCapacitacion || selectedPersonas.length === 0}
                >
                  Asignar Participantes
                </Button>
              </div>
            </div>
          </div>
        }
      />
    </div>
  )
}
