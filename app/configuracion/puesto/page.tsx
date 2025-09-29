"use client"

import { useState } from "react"
import { Sidebar } from "@/components/sidebar"
import { DataTable } from "@/components/data-table"
import { FormModal } from "@/components/form-modal"
import { Badge } from "@/components/ui/badge"
import { mockPuestos, mockDepartamentos, type Puesto } from "@/lib/types"
import { useAuth } from "@/contexts/auth-context"
import { CheckCircle, XCircle } from "lucide-react"

export default function PuestosPage() {
  const { user } = useAuth()
  const [puestos, setPuestos] = useState<Puesto[]>(mockPuestos)
  const [modalOpen, setModalOpen] = useState(false)
  const [editingPuesto, setEditingPuesto] = useState<Puesto | null>(null)

  if (!user || !user.roles.some((role) => role.nombre === "RRHH")) {
    return <div>No tienes permisos para acceder a esta página</div>
  }

  const columns = [
    { key: "nombre", label: "Nombre" },
    { key: "descripcion", label: "Descripción" },
    {
      key: "departamentoId",
      label: "Departamento",
      render: (value: string) => {
        const departamento = mockDepartamentos.find((d) => d.id === value)
        return departamento?.nombre || "N/A"
      },
    },
    {
      key: "nivel",
      label: "Nivel",
      render: (value: string) => <Badge variant="outline">{value}</Badge>,
    },
    {
      key: "requiereCapacitacion",
      label: "Requiere Capacitación",
      render: (value: boolean) =>
        value ? (
          <CheckCircle className="h-4 w-4 text-chart-2" />
        ) : (
          <XCircle className="h-4 w-4 text-muted-foreground" />
        ),
    },
    {
      key: "estado",
      label: "Estado",
      render: (value: string) => <Badge variant={value === "activo" ? "default" : "secondary"}>{value}</Badge>,
    },
  ]

  const formFields = [
    { key: "nombre", label: "Nombre", type: "text" as const, required: true },
    { key: "descripcion", label: "Descripción", type: "textarea" as const },
    {
      key: "departamentoId",
      label: "Departamento",
      type: "select" as const,
      required: true,
      options: mockDepartamentos.map((d) => ({ value: d.id, label: d.nombre })),
    },
    {
      key: "nivel",
      label: "Nivel",
      type: "select" as const,
      required: true,
      options: [
        { value: "operativo", label: "Operativo" },
        { value: "supervisorio", label: "Supervisorio" },
        { value: "gerencial", label: "Gerencial" },
        { value: "ejecutivo", label: "Ejecutivo" },
      ],
    },
    {
      key: "requiereCapacitacion",
      label: "Requiere Capacitación",
      type: "select" as const,
      required: true,
      options: [
        { value: "true", label: "Sí" },
        { value: "false", label: "No" },
      ],
    },
    {
      key: "estado",
      label: "Estado",
      type: "select" as const,
      required: true,
      options: [
        { value: "activo", label: "Activo" },
        { value: "inactivo", label: "Inactivo" },
      ],
    },
  ]

  const handleAdd = () => {
    setEditingPuesto(null)
    setModalOpen(true)
  }

  const handleEdit = (puesto: Puesto) => {
    setEditingPuesto(puesto)
    setModalOpen(true)
  }

  const handleDelete = (puesto: Puesto) => {
    setPuestos((prev) => prev.filter((p) => p.id !== puesto.id))
  }

  const handleSubmit = (data: any) => {
    const processedData = {
      ...data,
      requiereCapacitacion: data.requiereCapacitacion === "true",
    }

    if (editingPuesto) {
      setPuestos((prev) => prev.map((p) => (p.id === editingPuesto.id ? { ...p, ...processedData } : p)))
    } else {
      const newPuesto: Puesto = {
        ...processedData,
        id: Date.now().toString(),
        fechaCreacion: new Date().toISOString().split("T")[0],
      }
      setPuestos((prev) => [...prev, newPuesto])
    }
    setModalOpen(false)
  }

  return (
    <div className="flex h-screen bg-background">
      <Sidebar />

      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="border-b border-border bg-card px-6 py-4">
          <div>
            <h1 className="text-2xl font-bold text-card-foreground">Configuración - Puestos</h1>
            <p className="text-sm text-muted-foreground">Gestiona los puestos de trabajo por departamento</p>
          </div>
        </header>

        <main className="flex-1 overflow-auto p-6">
          <div className="max-w-7xl mx-auto">
            <DataTable
              title="Puestos"
              data={puestos}
              columns={columns}
              onAdd={handleAdd}
              onEdit={handleEdit}
              onDelete={handleDelete}
              searchPlaceholder="Buscar puestos..."
            />
          </div>
        </main>
      </div>

      <FormModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        title={editingPuesto ? "Editar Puesto" : "Nuevo Puesto"}
        description={editingPuesto ? "Modifica los datos del puesto" : "Agrega un nuevo puesto al sistema"}
        fields={formFields}
        initialData={
          editingPuesto
            ? {
                ...editingPuesto,
                requiereCapacitacion: editingPuesto.requiereCapacitacion.toString(),
              }
            : {}
        }
        onSubmit={handleSubmit}
      />
    </div>
  )
}
