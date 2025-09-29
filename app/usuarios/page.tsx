"use client"

import { useState } from "react"
import { Sidebar } from "@/components/sidebar"
import { DataTable } from "@/components/data-table"
import { FormModal } from "@/components/form-modal"
import { Badge } from "@/components/ui/badge"
import { mockUsuarios, mockPersonas, mockRoles, type Usuario } from "@/lib/types"
import { useAuth } from "@/contexts/auth-context"
import { AppHeader } from "@/components/app-header"

export default function UsuariosPage() {
  const { user } = useAuth()
  const [usuarios, setUsuarios] = useState<Usuario[]>(mockUsuarios)
  const [modalOpen, setModalOpen] = useState(false)
  const [editingUsuario, setEditingUsuario] = useState<Usuario | null>(null)

  if (!user || !user.roles.some((role) => role.nombre === "RRHH")) {
    return <div>No tienes permisos para acceder a esta página</div>
  }

  const columns = [
    {
      key: "personaId",
      label: "Persona",
      render: (value: string) => {
        const persona = mockPersonas.find((p) => p.id === value)
        return persona ? `${persona.nombre} ${persona.apellido}` : "N/A"
      },
    },
    { key: "email", label: "Email" },
    {
      key: "roles",
      label: "Roles",
      render: (value: any[]) => (
        <div className="flex gap-1 flex-wrap">
          {value.map((role) => (
            <Badge key={role.id} variant="outline" className="text-xs">
              {role.nombre}
            </Badge>
          ))}
        </div>
      ),
    },
    {
      key: "estado",
      label: "Estado",
      render: (value: string) => <Badge variant={value === "activo" ? "default" : "secondary"}>{value}</Badge>,
    },
    {
      key: "ultimoAcceso",
      label: "Último Acceso",
      render: (value: string) => {
        if (!value) return "Nunca"
        return new Date(value).toLocaleDateString()
      },
    },
    { key: "fechaCreacion", label: "Fecha Creación" },
  ]

  const formFields = [
    {
      key: "personaId",
      label: "Persona",
      type: "select" as const,
      required: true,
      options: mockPersonas.map((p) => ({ value: p.id, label: `${p.nombre} ${p.apellido}` })),
    },
    {
      key: "email", label: "Email", type: "email" as const, required: true
    },
    {
      key: "password", label: "Password", type: "password" as const, required: true
    },
    {
      key: "roles",
      label: "Roles",
      type: "select" as const,
      required: true,
      options: mockRoles.map((r) => ({ value: r.id, label: r.nombre })),
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
    setEditingUsuario(null)
    setModalOpen(true)
  }

  const handleEdit = (usuario: Usuario) => {
    console.log("Click en editar usuario")
    setEditingUsuario(usuario)
    setModalOpen(true)
  }

  const handleDelete = (usuario: Usuario) => {
    if (confirm("¿Estás seguro de que deseas eliminar este usuario?")) {
      setUsuarios((prev) => prev.filter((u) => u.id !== usuario.id))
    }
  }

  const handleSubmit = (data: any) => {
    const selectedRole = mockRoles.find((r) => r.id === data.roles)
    const processedData = {
      ...data,
      roles: selectedRole ? [selectedRole] : [],
    }

    if (editingUsuario) {
      setUsuarios((prev) => prev.map((u) => (u.id === editingUsuario.id ? { ...u, ...processedData } : u)))
    } else {
      const newUsuario: Usuario = {
        ...processedData,
        id: Date.now().toString(),
        fechaCreacion: new Date().toISOString().split("T")[0],
      }
      setUsuarios((prev) => [...prev, newUsuario])
    }
    setModalOpen(false)
  }

  return (
    <div className="flex h-screen bg-background">
      <Sidebar />

      <div className="flex-1 flex flex-col overflow-hidden">
        <AppHeader title="Gestión de Usuarios" subtitle="Administra los usuarios del sistema y sus permisos" />

        <main className="flex-1 overflow-auto p-6 custom-scrollbar">
          <div className="max-w-7xl mx-auto">
            <DataTable
              title="Usuarios"
              data={usuarios}
              columns={columns}
              onAdd={handleAdd}
              onEdit={handleEdit}
              onDelete={handleDelete}
              searchPlaceholder="Buscar usuarios..."
            />
          </div>
        </main>
      </div>

      <FormModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        title={editingUsuario ? "Editar Usuario" : "Nuevo Usuario"}
        description={editingUsuario ? "Modifica los datos del usuario" : "Agrega un nuevo usuario al sistema"}
        fields={formFields}
        initialData={
          editingUsuario
            ? {
                ...editingUsuario,
                roles: editingUsuario.roles[0]?.id || "",
              }
            : {}
        }
        onSubmit={handleSubmit}
      />
    </div>
  )
}
