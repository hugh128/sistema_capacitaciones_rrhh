"use client"

import { useState, useEffect } from "react"
import { DataTable } from "@/components/data-table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Shield, Users, BookOpen, BarChart3, Settings, Eye, Info } from "lucide-react"
import { RoleFormModal } from "@/components/role-form-modal"
import { RoleDetailModal } from "@/components/role-detail-modal"
import { useRoles } from "@/hooks/useRoles"
import { useAuth } from "@/contexts/auth-context"
import type { CategoriaPermiso, Permiso, Rol, RolPayload } from "@/lib/auth"
import { apiClient } from "@/lib/api-client"
import { Toaster } from "react-hot-toast"

const getPermisosList = async () => {
  try {
    const { data } = await apiClient.get<Permiso[]>('/permiso');
    return data;
  } catch (err) {
    console.error("Error al cargar lista de permisos: ", err);
    return [];
  }
}

const getCategoriasList = async () => {
  try {
    const { data } = await apiClient.get<CategoriaPermiso[]>('/categoria-permiso');
    return data;
  } catch (err) {
    console.error("Error al cargar lista de categorias: ", err);
    return [];
  }
}

export function RolesTab() {
  const { user } = useAuth()
  const [modalOpen, setModalOpen] = useState(false)
  const [editingRole, setEditingRole] = useState<Rol | null>(null)
  const [detailModalOpen, setDetailModalOpen] = useState(false)
  const [viewingRole, setViewingRole] = useState<Rol | null>(null)
  const [permisosList, setPermisosList] = useState<Permiso[]>([])
  const [categoriasList, setCategoriasList] = useState<CategoriaPermiso[]>([])

  const {
    roles,
    saveRole,
    deleteRole
  } = useRoles(user);

  useEffect(() => {
    if (user) {
      getPermisosList().then(setPermisosList);
      getCategoriasList().then(setCategoriasList);
    }
  }, [user])

  const getPermissionById = (permissionId: number): Permiso | undefined => {
    return permisosList.find((p) => p.ID_PERMISO === permissionId)
  }

  const getPermissionIcon = (permissionId: number) => {
    const permission = getPermissionById(permissionId)
    const clave = permission?.CLAVE.toLowerCase() || ""
  
    if (clave.includes("manage") || permission?.CLAVE === "all") return Settings
    if (clave.includes("view")) return Eye
    if (clave.includes("training")) return BookOpen
    if (clave.includes("user")) return Users
    if (clave.includes("report")) return BarChart3

    return Shield
  }

  const getPermissionLabel = (permissionId: number) => {
    const permission = getPermissionById(permissionId)
    return permission?.NOMBRE || permissionId
  }

  const handleViewDetails = (role: Rol) => {
    setViewingRole(role)
    setDetailModalOpen(true)
  }

  const columns = [
    { key: "NOMBRE", label: "Nombre del Rol" },
    {
      key: "DESCRIPCION",
      label: "Descripción",
      render: (value: string) => value || "Sin descripción",
    },
    {
      key: "ROL_PERMISOS",
      label: "Permisos",
      render: (value: Rol['ROL_PERMISOS']) => (
        <div className="flex gap-1 flex-wrap max-w-md">
          {value.slice(0, 3).map((permission) => (
            <Badge key={permission.ID_PERMISO} variant="outline" className="text-xs">
              {getPermissionLabel(permission.ID_PERMISO)}
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
    {
      key: "ESTADO",
      label: "Estado",
      render: (value: boolean) => <Badge variant={value ? "default" : "destructive"}>{value ? "Activo" : "Inactivo"}</Badge>,
    },
  ]

  const handleAdd = () => {
    setEditingRole(null)
    setModalOpen(true)
  }

  const handleEdit = (role: Rol) => {
    setEditingRole(role)
    setModalOpen(true)
  }

  const handleDelete = async (role: Rol) => {
    if (confirm(`¿Estás seguro de que deseas eliminar el rol "${role.NOMBRE}"?`)) {
      try {
        await deleteRole(role.ID_ROL);
      } catch (error) {
        console.error("Fallo al eliminar rol: ", error); 
      }
    }
  }

  const handleSubmit = async (data: RolPayload) => {
    try {
      const idToEdit = editingRole ? editingRole.ID_ROL : undefined;
      await saveRole(data, idToEdit);
      setModalOpen(false);
    } catch (error) {
      console.error("Fallo al guardar rol: ", error);
    }
  }

  return (
    <div className="space-y-6">

      <Toaster />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {roles.map((role) => {
          const Icon = getPermissionIcon(role.ROL_PERMISOS[0].ID_PERMISO || 0)
          return (
            <Card
              key={role.ID_ROL}
              className="h-full cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => handleViewDetails(role)}
            >
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0 dark:border dark:border-blue-500/30">
                      <Icon className="w-4 h-4 text-primary dark:text-blue-400" />
                    </div>
                    <CardTitle className="text-base sm:text-lg truncate">{role.NOMBRE}</CardTitle>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 flex-shrink-0 cursor-pointer"
                    onClick={(e) => {
                      e.stopPropagation()
                      handleViewDetails(role)
                    }}
                  >
                    <Info className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <CardDescription className="mb-3 line-clamp-2">
                  {role.DESCRIPCION || `${role.ROL_PERMISOS.length} permisos asignados`}
                </CardDescription>
                <div className="space-y-2">
                  {role.ROL_PERMISOS.slice(0, 4).map((permission) => (
                    <div key={permission.ID_PERMISO} className="flex items-center gap-2 text-sm">
                      <div className="w-1.5 h-1.5 rounded-full bg-primary flex-shrink-0" />
                      <span className="truncate">{getPermissionLabel(permission.ID_PERMISO)}</span>
                    </div>
                  ))}
                  {role.ROL_PERMISOS.length > 4 && (
                    <div className="text-xs text-muted-foreground">+{role.ROL_PERMISOS.length - 4} permisos más</div>
                  )}
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      <DataTable
        title="Roles del Sistema"
        data={roles}
        columns={columns}
        onAdd={handleAdd}
        onEdit={handleEdit}
        onDelete={handleDelete}
        searchPlaceholder="Buscar roles..."
      />

      <RoleFormModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        initialData={editingRole}
        onSubmit={handleSubmit}
        permisosDisponibles={permisosList}
        categoriasDisponibles={categoriasList}
      />

      <RoleDetailModal
        role={viewingRole}
        open={detailModalOpen}
        permisosDisponibles={permisosList}
        categoriasDisponigles={categoriasList}
        onOpenChange={setDetailModalOpen}
      />

    </div>
  )
}
