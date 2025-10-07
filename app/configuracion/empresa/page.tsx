"use client"

import { useCallback, useEffect, useState } from "react"
import { apiClient } from "@/lib/api-client"
import { Sidebar } from "@/components/sidebar"
import { DataTable } from "@/components/data-table"
import { FormModal } from "@/components/form-modal"
import { Badge } from "@/components/ui/badge"
import { type Empresa } from "@/lib/types"
import { transformApiToFrontend, transformFrontendToApi } from "@/lib/empresa-transformer"
import { useAuth } from "@/contexts/auth-context"

export default function EmpresasPage() {
  const { user } = useAuth()
  const [empresas, setEmpresas] = useState<Empresa[]>([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [editingEmpresa, setEditingEmpresa] = useState<Empresa | null>(null)
  const [error, setError] = useState<string | null>(null)

  const fetchEmpresas = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await apiClient.get<any[]>('/empresa') 
      
      const transformedData = response.data.map(transformApiToFrontend)
      setEmpresas(transformedData)

    } catch (err) {
      setError("Error al cargar las empresas. ¿Está la API encendida?")
      console.error(err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
      if (user) {
        fetchEmpresas()
      }
  }, [user, fetchEmpresas])

  if (!user || !user.roles.some((role) => role.nombre === "RRHH")) {
    return <div>No tienes permisos para acceder a esta página</div>
  }

  const columns = [
    { key: "nombre", label: "Nombre" },
    { key: "descripcion", label: "Descripción" },
    { key: "telefono", label: "Teléfono" },
    { key: "email", label: "Email" },
    {
      key: "estado",
      label: "Estado",
      render: (value: string) => <Badge variant={value === "activa" ? "default" : "secondary"}>{value}</Badge>,
    },
    { key: "fechaCreacion", label: "Fecha Creación" },
  ]

  const formFields = [
    { key: "nombre", label: "Nombre", type: "text" as const, required: true },
    { key: "nit", label: "NIT", type: "text" as const, required: true },
    { key: "descripcion", label: "Descripción", type: "textarea" as const },
    { key: "direccion", label: "Dirección", type: "text" as const },
    { key: "telefono", label: "Teléfono", type: "tel" as const },
    { key: "email", label: "Email", type: "email" as const },
    {
      key: "estado",
      label: "Estado",
      type: "select" as const,
      required: true,
      options: [
        { value: "activa", label: "Activa" },
        { value: "inactiva", label: "Inactiva" },
      ],
    },
  ]

  const handleAdd = () => {
    setEditingEmpresa(null)
    setModalOpen(true)
  }

  const handleEdit = (empresa: Empresa) => {
    setEditingEmpresa(empresa)
    setModalOpen(true)
  }

  const handleDelete = async (empresa: Empresa) => {
    try {
      await apiClient.delete(`/empresa/${empresa.id}`)

      //fetchEmpresas()

      setEmpresas((prev) => 
         prev.map(e => e.id === empresa.id ? { ...e, estado: 'inactiva' } : e)
      );
      
    } catch (err) {
      setError("Error al eliminar la empresa.")
      console.error(err)
    }
  }

  const handleSubmit = async (formData: any) => {
    setError(null)
    try {
      const apiData = transformFrontendToApi(formData); 
      
      if (editingEmpresa) {
        await apiClient.patch(`/empresa/${editingEmpresa.id}`, apiData) 
      } else {
        await apiClient.post<any>('/empresa', apiData)
      }
      
      fetchEmpresas()
    } catch (err) {
        setError("Error al guardar los datos de la empresa.")
        console.error(err)
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
            <h1 className="text-2xl font-bold text-card-foreground">Configuración - Empresas</h1>
            <p className="text-sm text-muted-foreground">Gestiona las empresas del sistema</p>
          </div>
        </header>

        <main className="flex-1 overflow-auto p-6">
          <div className="max-w-7xl mx-auto">
            <DataTable
              title="Empresas"
              data={empresas}
              columns={columns}
              onAdd={handleAdd}
              onEdit={handleEdit}
              onDelete={handleDelete}
              searchPlaceholder="Buscar empresas..."
            />
          </div>
        </main>
      </div>

      <FormModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        title={editingEmpresa ? "Editar Empresa" : "Nueva Empresa"}
        description={editingEmpresa ? "Modifica los datos de la empresa" : "Agrega una nueva empresa al sistema"}
        fields={formFields}
        initialData={editingEmpresa || {}}
        onSubmit={handleSubmit}
      />
    </div>
  )
}
