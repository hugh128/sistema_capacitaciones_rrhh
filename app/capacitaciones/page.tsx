"use client"

import { useState } from "react"
import { Sidebar } from "@/components/sidebar"
import { DataTable } from "@/components/data-table"
import { FormModal } from "@/components/form-modal"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { mockCapacitaciones, mockPersonas, type Capacitacion } from "@/lib/types"
import { useAuth } from "@/contexts/auth-context"
import { Calendar, Users, Clock, CheckCircle, AlertCircle } from "lucide-react"
import { AppHeader } from "@/components/app-header"

export default function CapacitacionesPage() {
  const { user } = useAuth()
  const [capacitaciones, setCapacitaciones] = useState<Capacitacion[]>(mockCapacitaciones)
  const [modalOpen, setModalOpen] = useState(false)
  const [editingCapacitacion, setEditingCapacitacion] = useState<Capacitacion | null>(null)

  // Filter based on user role
  const filteredCapacitaciones = user?.roles.some((role) => role.nombre === "Capacitador")
    ? capacitaciones.filter((c) => c.capacitadorId === user.id)
    : capacitaciones

  const columns = [
    { key: "codigo", label: "Código" },
    { key: "nombre", label: "Nombre" },
    {
      key: "tipo",
      label: "Tipo",
      render: (value: string) => <Badge variant="outline">{value}</Badge>,
    },
    {
      key: "capacitadorId",
      label: "Capacitador",
      render: (value: string) => {
        const persona = mockPersonas.find((p) => p.id === value)
        return persona ? `${persona.nombre} ${persona.apellido}` : "N/A"
      },
    },
    { key: "fechaInicio", label: "Fecha Inicio" },
    { key: "fechaFin", label: "Fecha Fin" },
    {
      key: "estado",
      label: "Estado",
      render: (value: string) => {
        const variants = {
          activa: "default" as const,
          finalizada: "outline" as const,
          cancelada: "destructive" as const,
        }
        return <Badge variant={variants[value as keyof typeof variants]}>{value}</Badge>
      },
    },
  ]

  const formFields = [
    { key: "codigo", label: "Código", type: "text" as const, required: true },
    { key: "nombre", label: "Nombre de la Capacitación", type: "text" as const, required: true },
    { key: "descripcion", label: "Descripción", type: "textarea" as const },
    {
      key: "tipo",
      label: "Tipo",
      type: "select" as const,
      required: true,
      options: [
        { value: "inductiva", label: "Inductiva" },
        { value: "continua", label: "Continua" },
        { value: "anual", label: "Anual" },
        { value: "específica", label: "Específica" },
      ],
    },
    { key: "fechaInicio", label: "Fecha de Realización (Inicio)", type: "date" as const },
    { key: "fechaFin", label: "Fecha de Realización (Fin)", type: "date" as const },
    {
      key: "estado",
      label: "Estado",
      type: "select" as const,
      required: true,
      options: [
        { value: "activa", label: "Activa" },
        { value: "finalizada", label: "Finalizada" },
        { value: "cancelada", label: "Cancelada" },
      ],
    },
    {
      key: "capacitadorId",
      label: "Capacitador Asignado",
      type: "select" as const,
      required: true,
      options: mockPersonas
        .filter((p) => p.estado === "activo")
        .map((p) => ({ value: p.id, label: `${p.nombre} ${p.apellido}` })),
    },
    {
      key: "aplicaExamen",
      label: "¿Aplica Examen?",
      type: "select" as const,
      required: true,
      options: [
        { value: "true", label: "Sí" },
        { value: "false", label: "No" },
      ],
    },
    {
      key: "puntajeMinimo",
      label: "Puntaje Mínimo Requerido",
      type: "number" as const,
      placeholder: "Ej: 70",
      conditional: { field: "aplicaExamen", value: "true" },
    },
    {
      key: "aplicaDiploma",
      label: "¿Aplica Diploma?",
      type: "select" as const,
      required: true,
      options: [
        { value: "true", label: "Sí" },
        { value: "false", label: "No" },
      ],
    },
    { key: "peoOpcional", label: "Asociación a POE (Opcional)", type: "text" as const, placeholder: "Ej: POE-SEG-001" },
  ]

  const handleAdd = () => {
    setEditingCapacitacion(null)
    setModalOpen(true)
  }

  const handleEdit = (capacitacion: Capacitacion) => {
    setEditingCapacitacion(capacitacion)
    setModalOpen(true)
  }

  const handleDelete = (capacitacion: Capacitacion) => {
    if (confirm("¿Estás seguro de que deseas eliminar esta capacitación?")) {
      setCapacitaciones((prev) => prev.filter((c) => c.id !== capacitacion.id))
    }
  }

  const handleSubmit = (data: any) => {
    const processedData = {
      ...data,
      aplicaExamen: data.aplicaExamen === "true",
      aplicaDiploma: data.aplicaDiploma === "true",
      puntajeMinimo: data.puntajeMinimo ? Number.parseInt(data.puntajeMinimo) : undefined,
    }

    if (editingCapacitacion) {
      setCapacitaciones((prev) =>
        prev.map((c) =>
          c.id === editingCapacitacion.id
            ? { ...c, ...processedData, planesAsociados: editingCapacitacion.planesAsociados }
            : c,
        ),
      )
    } else {
      const newCapacitacion: Capacitacion = {
        ...processedData,
        id: Date.now().toString(),
        planesAsociados: [],
        fechaCreacion: new Date().toISOString().split("T")[0],
      }
      setCapacitaciones((prev) => [...prev, newCapacitacion])
    }
    setModalOpen(false)
  }

  const getStatusIcon = (estado: string) => {
    switch (estado) {
      case "finalizada":
        return <CheckCircle className="w-4 h-4 text-chart-2" />
      case "activa":
        return <Clock className="w-4 h-4 text-chart-4" />
      case "cancelada":
        return <AlertCircle className="w-4 h-4 text-destructive" />
      default:
        return <Calendar className="w-4 h-4 text-muted-foreground" />
    }
  }

  return (
    <div className="flex h-screen bg-background">
      <Sidebar />

      <div className="flex-1 flex flex-col overflow-hidden">
        <AppHeader
          title={user?.roles.some((role) => role.nombre === "Capacitador") ? "Mis Capacitaciones" : "Capacitaciones"}
          subtitle={
            user?.roles.some((role) => role.nombre === "Capacitador")
              ? "Gestiona tus capacitaciones asignadas"
              : "Administra todas las capacitaciones del sistema"
          }
        />

        <main className="flex-1 overflow-auto p-6">
          <div className="max-w-7xl mx-auto space-y-6">
            {/* Training Cards */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {filteredCapacitaciones.map((capacitacion) => (
                <Card key={capacitacion.id}>
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="text-lg">{capacitacion.nombre}</CardTitle>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="outline" className="text-xs">
                            {capacitacion.codigo}
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            {capacitacion.tipo}
                          </Badge>
                        </div>
                      </div>
                      {getStatusIcon(capacitacion.estado)}
                    </div>
                    <CardDescription>{capacitacion.descripcion}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {capacitacion.fechaInicio && capacitacion.fechaFin && (
                        <div className="flex items-center gap-2 text-sm">
                          <Calendar className="w-4 h-4 text-muted-foreground" />
                          <span>
                            {capacitacion.fechaInicio} - {capacitacion.fechaFin}
                          </span>
                        </div>
                      )}

                      <div className="flex items-center gap-2 text-sm">
                        <Users className="w-4 h-4 text-muted-foreground" />
                        <span>
                          {mockPersonas.find((p) => p.id === capacitacion.capacitadorId)?.nombre || "Sin asignar"}
                        </span>
                      </div>

                      <div className="flex gap-2 mt-3">
                        {capacitacion.aplicaExamen && (
                          <Badge variant="secondary" className="text-xs">
                            Examen {capacitacion.puntajeMinimo && `(${capacitacion.puntajeMinimo}%)`}
                          </Badge>
                        )}
                        {capacitacion.aplicaDiploma && (
                          <Badge variant="secondary" className="text-xs">
                            Diploma
                          </Badge>
                        )}
                        {capacitacion.peoOpcional && (
                          <Badge variant="secondary" className="text-xs">
                            POE
                          </Badge>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Data Table */}
            <DataTable
              title="Todas las Capacitaciones"
              data={filteredCapacitaciones}
              columns={columns}
              onAdd={user?.roles.some((role) => ["RRHH", "Capacitador"].includes(role.nombre)) ? handleAdd : undefined}
              onEdit={handleEdit}
              onDelete={user?.roles.some((role) => role.nombre === "RRHH") ? handleDelete : undefined}
              searchPlaceholder="Buscar capacitaciones..."
            />
          </div>
        </main>
      </div>

      <FormModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        title={editingCapacitacion ? "Editar Capacitación" : "Nueva Capacitación"}
        description={editingCapacitacion ? "Modifica la capacitación" : "Crea una nueva capacitación"}
        fields={formFields}
        initialData={
          editingCapacitacion
            ? {
                ...editingCapacitacion,
                aplicaExamen: editingCapacitacion.aplicaExamen.toString(),
                aplicaDiploma: editingCapacitacion.aplicaDiploma.toString(),
                puntajeMinimo: editingCapacitacion.puntajeMinimo?.toString() || "",
              }
            : {}
        }
        onSubmit={handleSubmit}
      />
    </div>
  )
}
