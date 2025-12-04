"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Shield, Info } from "lucide-react"
import type { CategoriaPermiso, Permiso, Rol } from "@/lib/auth"

interface RoleDetailModalProps {
  role: Rol | null
  open: boolean
  permisosDisponibles: Permiso[]
  categoriasDisponigles: CategoriaPermiso[]
  onOpenChange: (open: boolean) => void
}

export function RoleDetailModal({ role, open, permisosDisponibles, categoriasDisponigles, onOpenChange }: RoleDetailModalProps) {
  if (!role) return null

  const permissionsByCategory = role.ROL_PERMISOS.reduce(
    (acc, permissionId) => {
      const permission = permisosDisponibles.find((p) => p.ID_PERMISO === permissionId.ID_PERMISO)
      if (permission) {
        if (!acc[permission.CATEGORIA?.NOMBRE || "Sin nombre"]) {
          acc[permission.CATEGORIA?.NOMBRE || "Sin nombre"] = []
        }
        acc[permission.CATEGORIA?.NOMBRE || "Sin nombre"].push(permission)
      }
      return acc
    },
    {} as Record<string, typeof permisosDisponibles>,
  )

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto custom-scrollbar">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center dark:border dark:border-blue-500/30">
              <Shield className="w-5 h-5 text-primary dark:text-blue-400" />
            </div>
            <div>
              <DialogTitle className="text-xl">{role.NOMBRE}</DialogTitle>
              <p className="text-sm text-muted-foreground mt-1">{role.DESCRIPCION || "Sin descripción"}</p>
              <Badge
                variant={role.ESTADO ? "default" : "destructive"} 
                className="mt-2 text-xs font-semibold"
              >
                {role.ESTADO ? "Activo" : "Inactivo"}
              </Badge>
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
                <p className="text-2xl font-bold">{role.ROL_PERMISOS.length}</p>
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
                const category = categoriasDisponigles.find((c) => c.NOMBRE === categoryId)
                return (
                  <Card key={categoryId}>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base">{category?.NOMBRE || categoryId}</CardTitle>
                      <CardDescription>{category?.DESCRIPCION}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {categoryPermissions.map((permission) => (
                          <div
                            key={permission.ID_PERMISO}
                            className="flex items-start gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors"
                          >
                            <div className="w-2 h-2 rounded-full bg-primary mt-1.5 flex-shrink-0" />
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium">{permission.NOMBRE}</p>
                              <p className="text-xs text-muted-foreground mt-0.5">{permission.DESCRIPCION}</p>
                            </div>
                            <Badge variant="outline" className="text-xs flex-shrink-0">
                              {permission.CLAVE}
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
