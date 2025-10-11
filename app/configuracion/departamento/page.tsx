"use client"

import { useCallback, useEffect, useState } from "react"
import { Sidebar } from "@/components/sidebar"
import { DataTable } from "@/components/data-table"
import { FormModal } from "@/components/form-modal"
import { Badge } from "@/components/ui/badge"
import { mockEmpresas, type Departamento } from "@/lib/types"
import { useAuth } from "@/contexts/auth-context"
import { apiClient } from "@/lib/api-client"
import { transformApiToFrontend, transformFrontendToApi } from "@/lib/departamento-transformer"

export default function DepartamentosPage() {
  const { user } = useAuth()
  const [departamentos, setDepartamentos] = useState<Departamento[]>([])
  const [modalOpen, setModalOpen] = useState(false)
  const [editingDepartamento, setEditingDepartamento] = useState<Departamento | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchDepartamentos = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await apiClient.get<any[]>('/departamento')

      const transformedData = response.data.map(transformApiToFrontend)
      setDepartamentos(transformedData)
      console.log(transformedData)
      console.log(departamentos)

    } catch (err) {
      setError('Error al cargar los departamentos.')
      console.error('API Error:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (user) {
      fetchDepartamentos()
    }
  }, [user, fetchDepartamentos])

  if (!user || !user.roles.some((role) => role.nombre === "RRHH")) {
    return <div>No tienes permisos para acceder a esta página</div>
  }

  const columns = [
    { key: "nombre", label: "Nombre" },
    { key: "descripcion", label: "Descripción" },
/*     {
      key: "empresaId",
      label: "Empresa",
      render: (value: string) => {
        const empresa = mockEmpresas.find((e) => e.id === value)
        return empresa?.nombre || "N/A"
      },
    }, */
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

  const handleDelete = async (departamento: Departamento) => {
    try {
      await apiClient.delete(`/departamento/${departamento.id}`)

      fetchDepartamentos()
    } catch (error) {
      setError("Error al eliminar el departamento.")
      console.error(error)
    }

    setDepartamentos((prev) => prev.filter((d) => d.id !== departamento.id))
  }

  const handleSubmit = async (data: any) => {
    setError(null);
    try {
      const apiData = transformFrontendToApi(data);
      
      if (editingDepartamento) {
        await apiClient.patch(`/departamento/${editingDepartamento.id}`, apiData);
      } else {
        await apiClient.post('/departamento', apiData);
      }
      
      fetchDepartamentos();
    } catch (err) {
      const msg = editingDepartamento ? "actualizar" : "crear";
      setError(`Error al ${msg} el departamento.`);
      console.error("Submit Error:", err);
    } finally {
      setModalOpen(false)
    }
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
