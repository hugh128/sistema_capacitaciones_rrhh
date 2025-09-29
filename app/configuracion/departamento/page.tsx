"use client"

import { useState } from "react"
import { Sidebar } from "@/components/sidebar"
import { DataTable } from "@/components/data-table"
import { FormModal } from "@/components/form-modal"
import { Badge } from "@/components/ui/badge"
import { mockDepartamentos, mockEmpresas, type Departamento } from "@/lib/types"
import { useAuth } from "@/contexts/auth-context"

export default function DepartamentosPage() {
  const { user } = useAuth()
  const [departamentos, setDepartamentos] = useState<Departamento[]>(mockDepartamentos)
  const [modalOpen, setModalOpen] = useState(false)
  const [editingDepartamento, setEditingDepartamento] = useState<Departamento | null>(null)

  if (!user || !user.roles.some((role) => role.nombre === "RRHH")) {
    return <div>No tienes permisos para acceder a esta página</div>
  }

  const columns = [
    { key: "nombre", label: "Nombre" },
    { key: "descripcion", label: "Descripción" },
    {
      key: "empresaId",
      label: "Empresa",
      render: (value: string) => {
        const empresa = mockEmpresas.find((e) => e.id === value)
        return empresa?.nombre || "N/A"
      },
    },
    {
      key: "estado",
      label: "Estado",
      render: (value: string) => <Badge variant={value === "activo" ? "default" : "secondary"}>{value}</Badge>,
    },
    { key: "fechaCreacion", label: "Fecha Creación" },
  ]

  const formFields = [
    { key: "nombre", label: "Nombre", type: "text" as const, required: true },
    { key: "descripcion", label: "Descripción", type: "textarea" as const },
    {
      key: "empresaId",
      label: "Empresa",
      type: "select" as const,
      required: true,
      options: mockEmpresas.map((e) => ({ value: e.id, label: e.nombre })),
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
    setEditingDepartamento(null)
    setModalOpen(true)
  }

  const handleEdit = (departamento: Departamento) => {
    setEditingDepartamento(departamento)
    setModalOpen(true)
  }

  const handleDelete = (departamento: Departamento) => {
    setDepartamentos((prev) => prev.filter((d) => d.id !== departamento.id))
  }

  const handleSubmit = (data: any) => {
    if (editingDepartamento) {
      setDepartamentos((prev) => prev.map((d) => (d.id === editingDepartamento.id ? { ...d, ...data } : d)))
    } else {
      const newDepartamento: Departamento = {
        ...data,
        id: Date.now().toString(),
        fechaCreacion: new Date().toISOString().split("T")[0],
      }
      setDepartamentos((prev) => [...prev, newDepartamento])
    }
    setModalOpen(false)
  }

  return (
    <div className="flex h-screen bg-background">
      <Sidebar />

      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="border-b border-border bg-card px-6 py-4">
          <div>
            <h1 className="text-2xl font-bold text-card-foreground">Configuración - Departamentos</h1>
            <p className="text-sm text-muted-foreground">Gestiona los departamentos de las empresas</p>
          </div>
        </header>

        <main className="flex-1 overflow-auto p-6">
          <div className="max-w-7xl mx-auto">
            <DataTable
              title="Departamentos"
              data={departamentos}
              columns={columns}
              onAdd={handleAdd}
              onEdit={handleEdit}
              onDelete={handleDelete}
              searchPlaceholder="Buscar departamentos..."
            />
          </div>
        </main>
      </div>

      <FormModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        title={editingDepartamento ? "Editar Departamento" : "Nuevo Departamento"}
        description={
          editingDepartamento ? "Modifica los datos del departamento" : "Agrega un nuevo departamento al sistema"
        }
        fields={formFields}
        initialData={editingDepartamento || {}}
        onSubmit={handleSubmit}
      />
    </div>
  )
}
