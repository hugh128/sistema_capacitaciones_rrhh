"use client"

import type React from "react"

import { useState, useEffect } from "react"
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
import { getPermissions, getPermissionCategories } from "@/lib/permissions"
import { Badge } from "@/components/ui/badge"
import type { Role } from "@/lib/types"

interface RoleFormModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  initialData?: Role | null
  onSubmit: (data: Partial<Role>) => void
  loading?: boolean
}

export function RoleFormModal({ open, onOpenChange, initialData, onSubmit, loading = false }: RoleFormModalProps) {
  const [nombre, setNombre] = useState("")
  const [descripcion, setDescripcion] = useState("")
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([])
  const [permissions, setPermissions] = useState(getPermissions())
  const [categories, setCategories] = useState(getPermissionCategories())

  useEffect(() => {
    if (initialData) {
      setNombre(initialData.nombre)
      setDescripcion(initialData.descripcion || "")
      setSelectedPermissions(initialData.permisos)
    } else {
      setNombre("")
      setDescripcion("")
      setSelectedPermissions([])
    }
    setPermissions(getPermissions())
    setCategories(getPermissionCategories())
  }, [initialData, open])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit({
      nombre,
      descripcion,
      permisos: selectedPermissions,
    })
  }

  const togglePermission = (permissionId: string) => {
    setSelectedPermissions((prev) => {
      if (prev.includes(permissionId)) {
        return prev.filter((p) => p !== permissionId)
      } else {
        return [...prev, permissionId]
      }
    })
  }

  const toggleCategory = (categoryId: string) => {
    const categoryPermissions = permissions.filter((p) => p.categoria === categoryId).map((p) => p.id)
    const allSelected = categoryPermissions.every((p) => selectedPermissions.includes(p))

    if (allSelected) {
      setSelectedPermissions((prev) => prev.filter((p) => !categoryPermissions.includes(p)))
    } else {
      setSelectedPermissions((prev) => {
        const newPermissions = new Set([...prev, ...categoryPermissions])
        return Array.from(newPermissions)
      })
    }
  }

  const isCategorySelected = (categoryId: string) => {
    const categoryPermissions = permissions.filter((p) => p.categoria === categoryId).map((p) => p.id)
    return categoryPermissions.every((p) => selectedPermissions.includes(p))
  }

  const isCategoryPartiallySelected = (categoryId: string) => {
    const categoryPermissions = permissions.filter((p) => p.categoria === categoryId).map((p) => p.id)
    const selectedCount = categoryPermissions.filter((p) => selectedPermissions.includes(p)).length
    return selectedCount > 0 && selectedCount < categoryPermissions.length
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
            <Label>
              Permisos <span className="text-destructive">*</span>
            </Label>
            <div className="flex items-center gap-2 mb-2">
              <Badge variant="secondary">{selectedPermissions.length} seleccionados</Badge>
            </div>

            <ScrollArea className="h-[300px] rounded-md border border-border p-4">
              <div className="space-y-4">
                {categories.map((category) => {
                  const categoryPermissions = permissions.filter((p) => p.categoria === category.id)
                  const isSelected = isCategorySelected(category.id)
                  const isPartial = isCategoryPartiallySelected(category.id)

                  return (
                    <div key={category.id} className="space-y-3">
                      <div className="flex items-center gap-2 pb-2 border-b border-border">
                        <Checkbox
                          id={`category-${category.id}`}
                          checked={isSelected}
                          onCheckedChange={() => toggleCategory(category.id)}
                          className={isPartial ? "data-[state=checked]:bg-primary/50" : ""}
                        />
                        <Label htmlFor={`category-${category.id}`} className="font-semibold cursor-pointer flex-1">
                          {category.nombre}
                        </Label>
                        <Badge variant="outline" className="text-xs">
                          {categoryPermissions.filter((p) => selectedPermissions.includes(p.id)).length}/
                          {categoryPermissions.length}
                        </Badge>
                      </div>

                      <div className="ml-6 space-y-2">
                        {categoryPermissions.map((permission) => (
                          <div key={permission.id} className="flex items-start gap-2">
                            <Checkbox
                              id={permission.id}
                              checked={selectedPermissions.includes(permission.id)}
                              onCheckedChange={() => togglePermission(permission.id)}
                              className="mt-1"
                            />
                            <div className="flex-1">
                              <Label htmlFor={permission.id} className="cursor-pointer font-normal">
                                {permission.nombre}
                              </Label>
                              <p className="text-xs text-muted-foreground">{permission.descripcion}</p>
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
