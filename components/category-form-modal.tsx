"use client"

import type React from "react"
import { useState, useEffect, useCallback, useMemo, memo } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import type { CategoriaPermiso, Permiso } from "@/lib/auth"
import type { CategoriaPayload } from "@/hooks/useCategorias"
import { Card, CardContent } from "@/components/ui/card"
import toast from "react-hot-toast"
import { PROTECTED_CATEGORIES } from "@/lib/permissions-config"
import { Search, Check, Shield, Layers } from "lucide-react"

interface CategoryFormModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  initialData?: CategoriaPermiso | null
  saveCategoria: (data: CategoriaPayload, id?: number) => Promise<boolean>
  availablePermissions: Permiso[]
  existingCategories: CategoriaPermiso[]
}

export function CategoryFormModal({ 
  open, 
  onOpenChange, 
  initialData, 
  saveCategoria,
  availablePermissions,
  existingCategories
}: CategoryFormModalProps) {
  const [clave, setClave] = useState("") 
  const [nombre, setNombre] = useState("")
  const [descripcion, setDescripcion] = useState("")
  const [selectedPermissionIds, setSelectedPermissionIds] = useState<number[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")

  const isProtected = initialData ? PROTECTED_CATEGORIES.includes(initialData.CLAVE as typeof PROTECTED_CATEGORIES[number]) : false

  useEffect(() => {
    if (initialData) {
      setClave(initialData.CLAVE)
      setNombre(initialData.NOMBRE)
      setDescripcion(initialData.DESCRIPCION)
      setSelectedPermissionIds(initialData.PERMISOS?.map(p => p.ID_PERMISO) || [])
    } else {
      setClave("")
      setNombre("")
      setDescripcion("")
      setSelectedPermissionIds([])
    }
    setIsSubmitting(false)
    setSearchQuery("")
  }, [initialData, open])

  const permisosAsignados = useMemo(() => {
    const map = new Map<number, string>()
    existingCategories.forEach(cat => {
      if (cat.ID_CATEGORIA !== initialData?.ID_CATEGORIA) {
        cat.PERMISOS?.forEach(perm => {
          map.set(perm.ID_PERMISO, cat.NOMBRE)
        })
      }
    })
    return map
  }, [existingCategories, initialData?.ID_CATEGORIA])

  const permisosSeleccionables = useMemo(() => {
    return availablePermissions.filter(perm => {
      const perteneceACategoriaActual = initialData && perm.CATEGORIA_ID === initialData.ID_CATEGORIA
      const noTieneCategoria = !perm.CATEGORIA_ID
      return perteneceACategoriaActual || noTieneCategoria
    })
  }, [availablePermissions, initialData])

  const permisosPorEstado = useMemo(() => {
    const estado: Record<string, Permiso[]> = {
      "Permisos de esta Categoría": [],
      "Permisos Disponibles": []
    }
    
    const query = searchQuery.toLowerCase()
    
    availablePermissions.forEach(perm => {
      if (query && !perm.NOMBRE.toLowerCase().includes(query) && 
          !perm.CLAVE.toLowerCase().includes(query) &&
          !perm.DESCRIPCION.toLowerCase().includes(query)) {
        return
      }

      const perteneceACategoriaActual = initialData && perm.CATEGORIA_ID === initialData.ID_CATEGORIA
      
      if (perteneceACategoriaActual) {
        estado["Permisos de esta Categoría"].push(perm)
      } else if (!perm.CATEGORIA_ID) {
        estado["Permisos Disponibles"].push(perm)
      }
    })
    
    return estado
  }, [availablePermissions, initialData, searchQuery])

  const handleClaveChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setClave(e.target.value.toLowerCase().replace(/\s/g, '_'))
  }, [])

  const handleNombreChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setNombre(e.target.value)
  }, [])

  const handleDescripcionChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setDescripcion(e.target.value)
  }, [])

  const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value)
  }, [])

  const handlePermissionToggle = useCallback((permissionId: number) => {
    setSelectedPermissionIds(prev => {
      if (prev.includes(permissionId)) {
        return prev.filter(id => id !== permissionId)
      } else {
        return [...prev, permissionId]
      }
    })
  }, [])

  const handleSelectAll = useCallback(() => {
    if (selectedPermissionIds.length === permisosSeleccionables.length) {
      setSelectedPermissionIds([])
    } else {
      setSelectedPermissionIds(permisosSeleccionables.map(p => p.ID_PERMISO))
    }
  }, [selectedPermissionIds.length, permisosSeleccionables])

  const handleSubmit = useCallback(async () => {
    if (selectedPermissionIds.length === 0) {
      toast.error("Debes seleccionar al menos un permiso")
      return
    }

    if (!initialData) {
      const claveExists = existingCategories.some(cat => 
        cat.CLAVE.toLowerCase() === clave.toLowerCase().trim()
      )
      if (claveExists) {
        toast.error("Ya existe una categoría con ese identificador")
        return
      }
    }

    setIsSubmitting(true)

    const categoryId = initialData?.ID_CATEGORIA

    const payload: CategoriaPayload = {
      CLAVE: clave.trim().toLowerCase(),
      NOMBRE: nombre.trim(),
      DESCRIPCION: descripcion.trim(),
      PERMISOS_IDS: selectedPermissionIds
    }

    const success = await saveCategoria(payload, categoryId)
    
    setIsSubmitting(false)

    if (success) {
      onOpenChange(false)
    }
  }, [selectedPermissionIds, initialData, existingCategories, clave, nombre, descripcion, saveCategoria, onOpenChange])

  const totalPermisos = permisosPorEstado["Permisos de esta Categoría"].length + permisosPorEstado["Permisos Disponibles"].length

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[95vw] max-w-[900px] h-[90vh] p-0 gap-0 flex flex-col">
        <div className="px-6 pt-6 pb-4 border-b bg-gradient-to-br from-background to-muted/20 shrink-0">
          <div className="flex items-start gap-4">
            <div className="p-3 rounded-xl bg-primary/10 shrink-0">
              <Layers className="w-6 h-6 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <DialogTitle className="text-2xl font-bold mb-1">
                {initialData ? "Editar Categoría" : "Nueva Categoría"}
              </DialogTitle>
              <DialogDescription className="text-sm text-muted-foreground">
                {initialData 
                  ? "Actualiza la información y permisos de la categoría" 
                  : "Crea una categoría para agrupar y organizar permisos"}
              </DialogDescription>
            </div>
          </div>
        </div>

        <ScrollArea className="flex-1 overflow-auto min-h-0">
          <div className="p-6 space-y-6">
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-1 h-5 bg-primary rounded-full" />
                <h3 className="font-semibold text-lg">Información Básica</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="clave" className="text-sm font-medium flex items-center gap-2">
                    Identificador
                    <span className="text-destructive">*</span>
                    {isProtected && (
                      <Badge variant="secondary" className="text-xs">
                        <Shield className="w-3 h-3 mr-1" />
                        Protegido
                      </Badge>
                    )}
                  </Label>
                  <Input
                    id="clave"
                    placeholder="ver_capacitaciones"
                    value={clave}
                    onChange={handleClaveChange}
                    required
                    disabled={!!initialData || isProtected}
                    className="font-mono text-sm"
                  />
                  <p className="text-xs text-muted-foreground">
                    Solo minúsculas y guiones bajos. {!!initialData ? "No modificable después de crear" : "Será el identificador único"}
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="nombre" className="text-sm font-medium">
                    Nombre <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="nombre"
                    placeholder="Capacitaciones"
                    value={nombre}
                    onChange={handleNombreChange}
                    required
                    className="text-sm"
                  />
                  <p className="text-xs text-muted-foreground">
                    Nombre descriptivo y legible
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="descripcion" className="text-sm font-medium">
                  Descripción <span className="text-destructive">*</span>
                </Label>
                <Textarea
                  id="descripcion"
                  placeholder="Agrupa todos los permisos relacionados con la gestión de ventas de productos..."
                  value={descripcion}
                  onChange={handleDescripcionChange}
                  required
                  rows={3}
                  className="text-sm resize-none"
                />
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-1 h-5 bg-primary rounded-full" />
                <h3 className="font-semibold text-lg">Permisos de la Categoría</h3>
              </div>

              <Card className="border-2">
                <CardContent className="p-4">
                  <div className="flex flex-col sm:flex-row gap-3">
                    <div className="relative flex-1">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        placeholder="Buscar permisos por nombre, clave o descripción..."
                        value={searchQuery}
                        onChange={handleSearchChange}
                        className="pl-10 text-sm"
                      />
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-2 px-3 py-2 bg-primary/10 rounded-lg shrink-0">
                        <Check className="w-4 h-4" />
                        <span className="text-sm font-semibold">
                          {selectedPermissionIds.length} / {totalPermisos}
                        </span>
                      </div>
                      
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={handleSelectAll}
                        className="text-sm shrink-0 cursor-pointer"
                      >
                        {selectedPermissionIds.length === permisosSeleccionables.length 
                          ? "Deseleccionar" 
                          : "Seleccionar todo"}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <div className="space-y-3">
                {Object.entries(permisosPorEstado).map(([grupo, perms]) => {
                  if (perms.length === 0) return null
                  
                  return (
                    <div key={grupo} className="space-y-2">
                      <div className="flex items-center gap-2 px-1">
                        <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                          {grupo}
                        </h4>
                        <div className="flex-1 h-px bg-border" />
                        <Badge variant="secondary" className="text-xs">
                          {perms.length}
                        </Badge>
                      </div>
                      
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-2">
                        {perms.map((perm) => {
                          const yaAsignado = permisosAsignados.has(perm.ID_PERMISO)
                          const categoriaAsignada = permisosAsignados.get(perm.ID_PERMISO)
                          const isDisabled = yaAsignado

                          return (
                            <PermissionCard
                              key={perm.ID_PERMISO}
                              perm={perm}
                              isSelected={selectedPermissionIds.includes(perm.ID_PERMISO)}
                              isDisabled={isDisabled}
                              categoriaAsignada={categoriaAsignada}
                              onToggle={handlePermissionToggle}
                            />
                          )
                        })}
                      </div>
                    </div>
                  )
                })}
                
                {totalPermisos === 0 && (
                  <Card className="border-dashed">
                    <CardContent className="py-12">
                      <div className="text-center space-y-2">
                        <Shield className="w-12 h-12 mx-auto text-muted-foreground/50" />
                        <p className="text-sm font-medium text-muted-foreground">
                          {searchQuery ? "No se encontraron permisos" : "No hay permisos disponibles"}
                        </p>
                        {searchQuery && (
                          <p className="text-xs text-muted-foreground">
                            Intenta con otros términos de búsqueda
                          </p>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          </div>
        </ScrollArea>

        <div className="px-6 py-4 border-t bg-background/95 backdrop-blur shrink-0 shadow-lg">
          <div className="flex flex-col-reverse sm:flex-row gap-3 sm:justify-between sm:items-center">
            <p className="text-xs text-muted-foreground">
              {selectedPermissionIds.length === 0 
                ? "Selecciona al menos un permiso para continuar"
                : `${selectedPermissionIds.length} permiso${selectedPermissionIds.length > 1 ? 's' : ''} seleccionado${selectedPermissionIds.length > 1 ? 's' : ''}`
              }
            </p>
            <div className="flex gap-2">
              <Button 
                type="button" 
                variant="destructive" 
                onClick={() => onOpenChange(false)} 
                disabled={isSubmitting}
                className="flex-1 sm:flex-none cursor-pointer"
              >
                Cancelar
              </Button>
              <Button 
                type="button"
                onClick={handleSubmit}
                disabled={isSubmitting || selectedPermissionIds.length === 0}
                className="flex-1 sm:flex-none cursor-pointer"
              >
                {isSubmitting ? "Guardando..." : initialData ? "Actualizar" : "Crear Categoría"}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

const PermissionCard = memo(({ 
  perm, 
  isSelected, 
  isDisabled, 
  categoriaAsignada,
  onToggle 
}: {
  perm: Permiso
  isSelected: boolean
  isDisabled: boolean
  categoriaAsignada?: string
  onToggle: (id: number) => void
}) => {
  const handleToggle = useCallback(() => {
    if (!isDisabled) {
      onToggle(perm.ID_PERMISO)
    }
  }, [isDisabled, onToggle, perm.ID_PERMISO])

  return (
    <Card 
      className={`cursor-pointer transition-all hover:shadow-md border-2 ${
        isSelected 
          ? 'border-primary bg-primary/5 shadow-sm' 
          : isDisabled 
          ? 'opacity-50 cursor-not-allowed bg-muted/30' 
          : 'hover:border-primary/50'
      }`}
      onClick={handleToggle}
    >
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <Checkbox
            id={`perm-${perm.ID_PERMISO}`}
            checked={isSelected}
            onCheckedChange={handleToggle}
            disabled={isDisabled}
            className="mt-0.5 shrink-0"
            onClick={(e) => e.stopPropagation()}
          />
          
          <div className="flex-1 min-w-0 space-y-2">
            <div className="flex items-start justify-between gap-2">
              <h5 className="font-semibold text-sm leading-tight break-words">
                {perm.NOMBRE}
              </h5>
              {isSelected && !isDisabled && (
                <div className="p-1 rounded-full bg-primary shrink-0">
                  <Check className="w-3 h-3 text-primary-foreground" />
                </div>
              )}
            </div>
            
            <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
              {perm.DESCRIPCION}
            </p>
            
            <div className="flex items-center gap-2 flex-wrap">
              <Badge variant="outline" className="text-xs font-mono">
                {perm.CLAVE}
              </Badge>
              
              {perm.CLAVE === "all" && (
                <Badge variant="default" className="text-xs">
                  Especial
                </Badge>
              )}
              
              {isDisabled && categoriaAsignada && (
                <Badge variant="secondary" className="text-xs">
                  Asignado: {categoriaAsignada}
                </Badge>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
})

PermissionCard.displayName = "PermissionCard"
