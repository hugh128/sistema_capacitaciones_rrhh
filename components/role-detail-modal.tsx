"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import type { Role } from "@/lib/types"
import { getPermissions, getPermissionCategories } from "@/lib/permissions"
import { Shield, Info } from "lucide-react"

interface RoleDetailModalProps {
  role: Role | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function RoleDetailModal({ role, open, onOpenChange }: RoleDetailModalProps) {
  if (!role) return null

  const permissions = getPermissions()
  const categories = getPermissionCategories()

  // Group permissions by category
  const permissionsByCategory = role.permisos.reduce(
    (acc, permissionId) => {
      const permission = permissions.find((p) => p.id === permissionId)
      if (permission) {
        if (!acc[permission.categoria]) {
          acc[permission.categoria] = []
        }
        acc[permission.categoria].push(permission)
      }
      return acc
    },
    {} as Record<string, typeof permissions>,
  )

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <Shield className="w-5 h-5 text-primary" />
            </div>
            <div>
              <DialogTitle className="text-xl">{role.nombre}</DialogTitle>
              <p className="text-sm text-muted-foreground mt-1">{role.descripcion || "Sin descripción"}</p>
            </div>
          </div>
        </DialogHeader>

        <Separator className="my-4" />

        <div className="space-y-6">
          {/* Summary */}
          <div className="grid grid-cols-2 gap-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">Total de Permisos</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">{role.permisos.length}</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">Categorías</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">{Object.keys(permissionsByCategory).length}</p>
              </CardContent>
            </Card>
          </div>

          {/* Permissions by Category */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold flex items-center gap-2">
              <Info className="w-4 h-4" />
              Permisos Asignados
            </h3>

            {Object.keys(permissionsByCategory).length === 0 ? (
              <Card>
                <CardContent className="py-8 text-center text-muted-foreground">
                  Este rol no tiene permisos asignados
                </CardContent>
              </Card>
            ) : (
              Object.entries(permissionsByCategory).map(([categoryId, categoryPermissions]) => {
                const category = categories.find((c) => c.id === categoryId)
                return (
                  <Card key={categoryId}>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base">{category?.nombre || categoryId}</CardTitle>
                      <CardDescription>{category?.descripcion}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {categoryPermissions.map((permission) => (
                          <div
                            key={permission.id}
                            className="flex items-start gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors"
                          >
                            <div className="w-2 h-2 rounded-full bg-primary mt-1.5 flex-shrink-0" />
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium">{permission.nombre}</p>
                              <p className="text-xs text-muted-foreground mt-0.5">{permission.descripcion}</p>
                            </div>
                            <Badge variant="outline" className="text-xs flex-shrink-0">
                              {permission.id}
                            </Badge>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )
              })
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
