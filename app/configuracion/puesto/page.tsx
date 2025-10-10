"use client"

import { useCallback, useEffect, useState } from "react"
import { Sidebar } from "@/components/sidebar"
import { DataTable } from "@/components/data-table"
import { FormModal } from "@/components/form-modal"
import { Badge } from "@/components/ui/badge"
import { mockPuestos, mockDepartamentos, type Puesto } from "@/lib/types"
import { useAuth } from "@/contexts/auth-context"
import { apiClient } from "@/lib/api-client"
import { transformApiToFrontend, transformFrontendToApi, transformApiDepartamentoToSelect } from "@/lib/puesto-transformer"

export default function PuestosPage() {
  const { user } = useAuth()
  const [puestos, setPuestos] = useState<Puesto[]>([])
  const [modalOpen, setModalOpen] = useState(false)
  const [editingPuesto, setEditingPuesto] = useState<Puesto | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)


  const fetchPuestos = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await apiClient.get('/puesto')
      
      const transformedData = response.data.map(transformApiToFrontend)
      setPuestos(transformedData)

    } catch (err) {
      setError('Error al cargar los puestos.')
      console.error('API Error (Puestos):', err)
    } finally {
      setLoading(false)
    }
  }, [])
  
  useEffect(() => {
    if (user) {
      fetchPuestos()
    }
  }, [user, fetchPuestos])

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

  const handleDelete = async (puesto: Puesto) => {
    try {
      await apiClient.delete(`/puesto/${puesto.id}`);
      
      fetchPuestos();
    } catch (err) {
      setError("Error al desactivar el puesto.");
      console.error("Delete Error:", err);
    }
  }

  const handleSubmit = async (data: any) => {
    setError(null);
    try {
      const apiData = transformFrontendToApi(data);
      
      if (editingPuesto) {
        await apiClient.patch(`/puesto/${editingPuesto.id}`, apiData);
      } else {
        await apiClient.post('/puesto', apiData);
      }

      fetchPuestos();
    } catch (err) {
      const msg = editingPuesto ? "actualizar" : "crear";
      setError(`Error al ${msg} el puesto. ${err}`);
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
