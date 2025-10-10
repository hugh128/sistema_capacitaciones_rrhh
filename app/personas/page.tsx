"use client"

import { useCallback, useEffect, useState } from "react"
import { Sidebar } from "@/components/sidebar"
import { DataTable } from "@/components/data-table"
import { FormModal } from "@/components/form-modal"
import { Badge } from "@/components/ui/badge"
import { mockPersonas, mockPuestos, mockDepartamentos, type Persona } from "@/lib/types"
import { useAuth } from "@/contexts/auth-context"
import { apiClient } from "@/lib/api-client"
import { AppHeader } from "@/components/app-header"
import { transformApiToFrontend, transformFrontendToApi } from "@/lib/persona-transformer"

export default function PersonasPage() {
  const { user } = useAuth()
  const [personas, setPersonas] = useState<Persona[]>([])
  const [modalOpen, setModalOpen] = useState(false)
  const [editingPersona, setEditingPersona] = useState<Persona | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)


  const fetchPersonas = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await apiClient.get('/persona')

      const transformedData = response.data.map(transformApiToFrontend)
      setPersonas(transformedData)

    } catch (err) {
      setError('Error al cargar las personas.')
      console.error('API Error (Personas):', err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (user) {
      fetchPersonas()
    }
  }, [user, fetchPersonas])

  if (!user || !user.roles.some((role) => role.nombre === "RRHH")) {
    return <div>No tienes permisos para acceder a esta página</div>
  }

  const columns = [
    { key: "nombre", label: "Nombre" },
    { key: "apellido", label: "Apellido" },
    { key: "correo", label: "Correo" },
    { key: "telefono", label: "Teléfono" },
    { key: "dpi", label: "DPI" },
    {
      key: "puestoId",
      label: "Puesto",
      render: (value: string) => {
        const puesto = mockPuestos.find((p) => p.id === value)
        return puesto?.nombre || "N/A"
      },
    },
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
    { key: "apellido", label: "Apellido", type: "text" as const, required: true },
    { key: "correo", label: "Correo", type: "email" as const, required: true },
    { key: "telefono", label: "Teléfono", type: "tel" as const },
    { key: "dpi", label: "DPI", type: "text" as const },
    { key: "fechaNacimiento", label: "Fecha de Nacimiento", type: "text" as const, placeholder: "YYYY-MM-DD" },
    { key: "fechaIngreso", label: "Fecha de Ingreso", type: "text" as const, placeholder: "YYYY-MM-DD" },

    {
        key: "tipoPersona",
        label: "Tipo Persona",
        type: "select" as const,
        required: true,
        options: [
            { value: "INTERNO", label: "Interno" },
            { value: "EXTERNO", label: "Externo" },
        ],
        placeholder: "Tipo de colaborador"
    },
    {
      key: "departamentoId",
      label: "Departamento",
      type: "select" as const,
      options: mockDepartamentos.map((d) => ({ value: d.id, label: d.nombre })),
      placeholder: "Selecciona un departamento"
    },
    {
      key: "puestoId",
      label: "Puesto",
      type: "select" as const,
      options: mockPuestos.map((p) => ({ value: p.id, label: p.nombre })),
      placeholder: "Selecciona un puesto"

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
      placeholder: "Selecciona un estado"
    },
  ]

  const handleAdd = () => {
    setEditingPersona(null)
    setModalOpen(true)
  }

  const handleEdit = (persona: Persona) => {
    setEditingPersona(persona)
    setModalOpen(true)
  }

  const handleDelete = async (persona: Persona) => {
    try {
      await apiClient.delete(`/persona/${persona.id}`);
      
      fetchPersonas();

    } catch (err) {
      setError("Error al dar de baja a la persona.");
      console.error("Delete Error:", err);
    }

  }

  const handleSubmit = async (data: Persona) => {
    setError(null);
    try {
      const apiData = transformFrontendToApi(data);
      
      if (editingPersona) {
        await apiClient.patch(`/persona/${editingPersona.id}`, apiData);
      } else {
        await apiClient.post('/persona', apiData);
      }
      
      fetchPersonas();
      
    } catch (err) {
      const msg = editingPersona ? "actualizar" : "crear";
      setError(`Error al ${msg} a la persona.`);
      console.error("Submit Error:", err);
    } finally {      
      setModalOpen(false);
    }
  }

  return (
    <div className="flex h-screen bg-background">
      <Sidebar />

      <div className="flex-1 flex flex-col overflow-hidden">
        <AppHeader title="Gestión de Personas" subtitle="Administra la información personal de los colaboradores" />

        <main className="flex-1 overflow-auto p-6 custom-scrollbar">
          <div className="max-w-7xl mx-auto">
            <DataTable
              title="Personas"
              data={personas}
              columns={columns}
              onAdd={handleAdd}
              onEdit={handleEdit}
              onDelete={handleDelete}
              searchPlaceholder="Buscar personas..."
            />
          </div>
        </main>
      </div>

      <FormModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        title={editingPersona ? "Editar Persona" : "Nueva Persona"}
        description={editingPersona ? "Modifica los datos de la persona" : "Agrega una nueva persona al sistema"}
        fields={formFields}
        initialData={editingPersona || {}}
        onSubmit={handleSubmit}
      />
    </div>
  )
}
