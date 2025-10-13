"use client"

import type React from "react"
import { useState, useEffect, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import type { Permiso, CategoriaPermiso, Rol, RolPayload } from "@/lib/auth"

interface RoleFormModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  initialData?: Rol | null
  onSubmit: (data: RolPayload) => void
  loading?: boolean
  permisosDisponibles: Permiso[]
  categoriasDisponibles: CategoriaPermiso[]
}

export function RoleFormModal({
  open,
  onOpenChange,
  initialData,
  onSubmit,
  loading = false,
  permisosDisponibles,
  categoriasDisponibles,
}: RoleFormModalProps) {
  const [nombre, setNombre] = useState("")
  const [descripcion, setDescripcion] = useState("")
  const [estado, setEstado] = useState(true)
  const [selectedPermissions, setSelectedPermissions] = useState<number[]>([])

  const permissionsByCategoryId = useMemo(() => {
    return permisosDisponibles.reduce((acc, permiso) => {
      const categoryId = permiso.CATEGORIA_ID ?? 0
      if (!acc[categoryId]) {
        acc[categoryId] = []
      }
      acc[categoryId].push(permiso)
      return acc
    }, {} as Record<number, Permiso[]>)
  }, [permisosDisponibles])

  const orderedCategories = useMemo(() => {
    return categoriasDisponibles.sort((a, b) => a.ID_CATEGORIA - b.ID_CATEGORIA)
  }, [categoriasDisponibles])

  useEffect(() => {
    if (initialData) {
      setNombre(initialData.NOMBRE)
      setDescripcion(initialData.DESCRIPCION || "")
      setEstado(initialData.ESTADO)
      setSelectedPermissions(initialData.ROL_PERMISOS.map((p) => p.ID_PERMISO))
    } else {
      setNombre("")
      setDescripcion("")
      setEstado(true)
      setSelectedPermissions([])
    }
  }, [initialData, open])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    const payload: RolPayload = {
      NOMBRE: nombre,
      DESCRIPCION: descripcion,
      ESTADO: estado,
      ID_PERMISOS: selectedPermissions,
    }

    onSubmit(payload)
  }

  const togglePermission = (permissionId: number) => {
    setSelectedPermissions((prev) => {
      if (prev.includes(permissionId)) {
        return prev.filter((p) => p !== permissionId)
      } else {
        return [...prev, permissionId]
      }
    })
  }

  const toggleCategory = (categoryId: number) => {
    const categoryPermissions = permissionsByCategoryId[categoryId] || []
    const permissionIds = categoryPermissions.map((p) => p.ID_PERMISO)
    const allSelected = permissionIds.every((id) => selectedPermissions.includes(id))

    if (allSelected) {
      setSelectedPermissions((prev) => prev.filter((id) => !permissionIds.includes(id)))
    } else {
      setSelectedPermissions((prev) => {
        const newPermissions = new Set([...prev, ...permissionIds])
        return Array.from(newPermissions)
      })
    }
  }

  const isCategorySelected = (categoryId: number) => {
    const categoryPermissions = permissionsByCategoryId[categoryId] || []
    const permissionIds = categoryPermissions.map((p) => p.ID_PERMISO)
    if (permissionIds.length === 0) return false
    return permissionIds.every((id) => selectedPermissions.includes(id))
  }

  const isCategoryPartiallySelected = (categoryId: number) => {
    const categoryPermissions = permissionsByCategoryId[categoryId] || []
    const permissionIds = categoryPermissions.map((p) => p.ID_PERMISO)
    if (permissionIds.length === 0) return false
    const selectedCount = permissionIds.filter((id) => selectedPermissions.includes(id)).length
    return selectedCount > 0 && selectedCount < permissionIds.length
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>{initialData ? "Editar Rol" : "Nuevo Rol"}</DialogTitle>
          <DialogDescription>
            {initialData ? "Modifica el rol y sus permisos" : "Crea un nuevo rol y asigna permisos"}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="nombre">
              Nombre del Rol <span className="text-destructive">*</span>
            </Label>
            <Input
              id="nombre"
              placeholder="Ej: Supervisor, Analista, etc."
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="descripcion">Descripción</Label>
            <Textarea
              id="descripcion"
              placeholder="Describe las responsabilidades de este rol"
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
              rows={2}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="estado">Estado</Label>
            <div className="flex items-center space-x-2 p-3">
              <Checkbox
                id="estado"
                checked={estado}
                onCheckedChange={(checked) => setEstado(!!checked)} 
              />
              <Label htmlFor="estado" className="flex-1 cursor-pointer font-normal">
                {estado ? "Activo" : "Inactivo"}
              </Label>
            </div>
          </div>

          <div className="space-y-2">
            <Label>
              Permisos <span className="text-destructive">*</span>
            </Label>
            <div className="flex items-center gap-2 mb-2">
              <Badge variant="secondary">{selectedPermissions.length} seleccionados</Badge>
            </div>

            <ScrollArea className="h-[300px] rounded-md border border-border p-4">
              <div className="space-y-4">
                {orderedCategories.map((category) => {
                  const categoryPermissions = permissionsByCategoryId[category.ID_CATEGORIA] || []
                  const isSelected = isCategorySelected(category.ID_CATEGORIA)
                  const isPartial = isCategoryPartiallySelected(category.ID_CATEGORIA)

                  return (
                    <div key={category.ID_CATEGORIA} className="space-y-3">
                      <div className="flex items-center gap-2 pb-2 border-b border-border">
                        <Checkbox
                          id={`category-${category.ID_CATEGORIA}`}
                          checked={isSelected}
                          onCheckedChange={() => toggleCategory(category.ID_CATEGORIA)}
                          className={isPartial ? "data-[state=checked]:bg-primary/50" : ""}
                        />
                        <Label
                          htmlFor={`category-${category.ID_CATEGORIA}`}
                          className="font-semibold cursor-pointer flex-1"
                        >
                          {category.NOMBRE}
                        </Label>
                        <Badge variant="outline" className="text-xs">
                          {categoryPermissions.filter((p) => selectedPermissions.includes(p.ID_PERMISO)).length}/
                          {categoryPermissions.length}
                        </Badge>
                      </div>

                      <div className="ml-6 space-y-2">
                        {categoryPermissions.map((permission) => (
                          <div key={permission.ID_PERMISO} className="flex items-start gap-2">
                            <Checkbox
                              id={`permission-${permission.ID_PERMISO}`}
                              checked={selectedPermissions.includes(permission.ID_PERMISO)}
                              onCheckedChange={() => togglePermission(permission.ID_PERMISO)}
                              className="mt-1"
                            />
                            <div className="flex-1">
                              <Label htmlFor={`permission-${permission.ID_PERMISO}`} className="cursor-pointer font-normal">
                                {permission.NOMBRE}
                              </Label>
                              <p className="text-xs text-muted-foreground">{permission.DESCRIPCION}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )
                })}
              </div>
            </ScrollArea>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={loading || !nombre || selectedPermissions.length === 0}>
              {loading ? "Guardando..." : "Guardar"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
