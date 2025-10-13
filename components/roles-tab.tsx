"use client"

import { useState, useEffect } from "react"
import { DataTable } from "@/components/data-table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { mockRoles, type Role } from "@/lib/types"
import { Shield, Users, BookOpen, BarChart3, Settings, Eye, Info } from "lucide-react"
import { RoleFormModal } from "@/components/role-form-modal"
import { RoleDetailModal } from "@/components/role-detail-modal"
import { getPermissions } from "@/lib/permissions"

export function RolesTab() {
  const [roles, setRoles] = useState<Role[]>(mockRoles)
  const [modalOpen, setModalOpen] = useState(false)
  const [editingRole, setEditingRole] = useState<Role | null>(null)
  const [permissions, setPermissions] = useState(getPermissions())
  const [detailModalOpen, setDetailModalOpen] = useState(false)
  const [viewingRole, setViewingRole] = useState<Role | null>(null)

  useEffect(() => {
    setPermissions(getPermissions())
  }, [])

  const getPermissionIcon = (permission: string) => {
    if (permission.includes("manage") || permission === "all") return Settings
    if (permission.includes("view")) return Eye
    if (permission.includes("training")) return BookOpen
    if (permission.includes("user")) return Users
    if (permission.includes("report")) return BarChart3
    return Shield
  }

  const getPermissionLabel = (permissionId: string) => {
    const permission = permissions.find((p) => p.id === permissionId)
    return permission?.nombre || permissionId
  }

  const handleViewDetails = (role: Role) => {
    setViewingRole(role)
    setDetailModalOpen(true)
  }

  const columns = [
    { key: "nombre", label: "Nombre del Rol" },
    {
      key: "descripcion",
      label: "Descripción",
      render: (value: string) => value || "Sin descripción",
    },
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

  const handleAdd = () => {
    setEditingRole(null)
    setModalOpen(true)
  }

  const handleEdit = (role: Role) => {
    setEditingRole(role)
    setModalOpen(true)
  }

  const handleDelete = (role: Role) => {
    if (confirm("¿Estás seguro de que deseas eliminar este rol?")) {
      setRoles((prev) => prev.filter((r) => r.id !== role.id))
    }
  }

  const handleSubmit = (data: any) => {
    if (editingRole) {
      setRoles((prev) => prev.map((r) => (r.id === editingRole.id ? { ...r, ...data } : r)))
    } else {
      const newRole: Role = {
        ...data,
        id: Date.now().toString(),
      }
      setRoles((prev) => [...prev, newRole])
    }
    setModalOpen(false)
  }

  return (
    <div className="space-y-6">
      {/* Role Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {roles.map((role) => {
          const Icon = getPermissionIcon(role.permisos[0] || "")
          return (
            <Card
              key={role.id}
              className="h-full cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => handleViewDetails(role)}
            >
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <Icon className="w-4 h-4 text-primary" />
                    </div>
                    <CardTitle className="text-base sm:text-lg truncate">{role.nombre}</CardTitle>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 flex-shrink-0"
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
                  {role.descripcion || `${role.permisos.length} permisos asignados`}
                </CardDescription>
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
        onView={handleViewDetails}
        searchPlaceholder="Buscar roles..."
      />

      <RoleFormModal open={modalOpen} onOpenChange={setModalOpen} initialData={editingRole} onSubmit={handleSubmit} />

      <RoleDetailModal role={viewingRole} open={detailModalOpen} onOpenChange={setDetailModalOpen} />
    </div>
  )
}
