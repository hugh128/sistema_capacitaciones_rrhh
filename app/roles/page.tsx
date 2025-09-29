"use client"

import { useState } from "react"
import { Sidebar } from "@/components/sidebar"
import { DataTable } from "@/components/data-table"
import { FormModal } from "@/components/form-modal"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { mockRoles, type Role } from "@/lib/types"
import { useAuth } from "@/contexts/auth-context"
import { Shield, Users, BookOpen, BarChart3, Settings, Eye } from "lucide-react"
import { AppHeader } from "@/components/app-header"

export default function RolesPage() {
  const { user } = useAuth()
  const [roles, setRoles] = useState<Role[]>(mockRoles)
  const [modalOpen, setModalOpen] = useState(false)
  const [editingRole, setEditingRole] = useState<Role | null>(null)

  if (!user || !user.roles.some((role) => role.nombre === "RRHH")) {
    return <div>No tienes permisos para acceder a esta página</div>
  }

  const getPermissionIcon = (permission: string) => {
    if (permission.includes("manage") || permission === "all") return Settings
    if (permission.includes("view")) return Eye
    if (permission.includes("training")) return BookOpen
    if (permission.includes("user")) return Users
    if (permission.includes("report")) return BarChart3
    return Shield
  }

  const getPermissionLabel = (permission: string) => {
    const labels: Record<string, string> = {
      all: "Acceso Total",
      manage_users: "Gestionar Usuarios",
      manage_trainings: "Gestionar Capacitaciones",
      view_reports: "Ver Reportes",
      manage_config: "Gestionar Configuración",
      view_audit: "Ver Auditoría",
      view_trainings: "Ver Capacitaciones",
      edit_attendance: "Editar Asistencia",
      upload_documents: "Subir Documentos",
      view_participants: "Ver Participantes",
      view_team: "Ver Equipo",
      view_records: "Ver Expedientes",
      approve_trainings: "Aprobar Capacitaciones",
    }
    return labels[permission] || permission
  }

  const columns = [
    { key: "nombre", label: "Nombre del Rol" },
    {
      key: "permisos",
      label: "Permisos",
      render: (value: string[]) => (
        <div className="flex gap-1 flex-wrap max-w-md">
          {value.slice(0, 3).map((permission) => (
            <Badge key={permission} variant="outline" className="text-xs">
              {getPermissionLabel(permission)}
            </Badge>
          ))}
          {value.length > 3 && (
            <Badge variant="secondary" className="text-xs">
              +{value.length - 3} más
            </Badge>
          )}
        </div>
      ),
    },
  ]

  const availablePermissions = [
    "all",
    "manage_users",
    "manage_trainings",
    "view_reports",
    "manage_config",
    "view_audit",
    "view_trainings",
    "edit_attendance",
    "upload_documents",
    "view_participants",
    "view_team",
    "view_records",
    "approve_trainings",
  ]

  const formFields = [
    {
      key: "nombre",
      label: "Nombre del Rol",
      type: "select" as const,
      required: true,
      options: [
        { value: "RRHH", label: "RRHH" },
        { value: "Capacitador", label: "Capacitador" },
        { value: "Gerente", label: "Gerente" },
        { value: "Jefe", label: "Jefe" },
      ],
    },
  ]

  const handleAdd = () => {
    setEditingRole(null)
    setModalOpen(true)
  }

  const handleEdit = (role: Role) => {
    setEditingRole(role)
    setModalOpen(true)
  }

  const handleDelete = (role: Role) => {
    setRoles((prev) => prev.filter((r) => r.id !== role.id))
  }

  const handleSubmit = (data: any) => {
    // Default permissions based on role
    const defaultPermissions: Record<string, string[]> = {
      RRHH: ["all", "manage_users", "manage_trainings", "view_reports", "manage_config", "view_audit"],
      Capacitador: ["view_trainings", "edit_attendance", "upload_documents", "view_participants"],
      Gerente: ["view_reports", "view_team", "view_records", "approve_trainings"],
      Jefe: ["view_reports", "view_team", "view_records"],
    }

    const processedData = {
      ...data,
      permisos: defaultPermissions[data.nombre] || [],
    }

    if (editingRole) {
      setRoles((prev) => prev.map((r) => (r.id === editingRole.id ? { ...r, ...processedData } : r)))
    } else {
      const newRole: Role = {
        ...processedData,
        id: Date.now().toString(),
      }
      setRoles((prev) => [...prev, newRole])
    }
    setModalOpen(false)
  }

  return (
    <div className="flex h-screen bg-background">
      <Sidebar />

      <div className="flex-1 flex flex-col min-h-0">
        <AppHeader title="Gestión de Roles" subtitle="Administra los roles y permisos del sistema" />

        <main className="flex-1 overflow-y-auto p-4 sm:p-6 md:ml-0 custom-scrollbar">
          <div className="max-w-7xl mx-auto space-y-6">
            {/* Role Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {roles.map((role) => {
                const Icon = getPermissionIcon(role.permisos[0] || "")
                return (
                  <Card key={role.id} className="h-full">
                    <CardHeader className="pb-3">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                          <Icon className="w-4 h-4 text-primary" />
                        </div>
                        <CardTitle className="text-base sm:text-lg truncate">{role.nombre}</CardTitle>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <CardDescription className="mb-3">{role.permisos.length} permisos asignados</CardDescription>
                      <div className="space-y-2">
                        {role.permisos.slice(0, 4).map((permission) => (
                          <div key={permission} className="flex items-center gap-2 text-sm">
                            <div className="w-1.5 h-1.5 rounded-full bg-primary flex-shrink-0" />
                            <span className="truncate">{getPermissionLabel(permission)}</span>
                          </div>
                        ))}
                        {role.permisos.length > 4 && (
                          <div className="text-xs text-muted-foreground">+{role.permisos.length - 4} permisos más</div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>

            {/* Data Table */}
            <DataTable
              title="Roles del Sistema"
              data={roles}
              columns={columns}
              onAdd={handleAdd}
              onEdit={handleEdit}
              onDelete={handleDelete}
              searchPlaceholder="Buscar roles..."
            />
          </div>
        </main>
      </div>

      <FormModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        title={editingRole ? "Editar Rol" : "Nuevo Rol"}
        description={editingRole ? "Modifica el rol del sistema" : "Agrega un nuevo rol al sistema"}
        fields={formFields}
        initialData={editingRole || {}}
        onSubmit={handleSubmit}
      />
    </div>
  )
}
