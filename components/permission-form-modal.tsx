"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { Permiso, CategoriaPermiso } from "@/lib/auth"
import type { PermisoPayload } from "@/hooks/useCategorias"
import { toast } from "sonner"

interface PermissionFormModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  initialData?: Permiso | null
  categories: CategoriaPermiso[]
  savePermiso: (data: PermisoPayload, id?: number) => Promise<boolean>
}

export function PermissionFormModal({ open, onOpenChange, initialData, categories, savePermiso }: PermissionFormModalProps) {
  const [clave, setClave] = useState("") 
  const [nombre, setNombre] = useState("")
  const [descripcion, setDescripcion] = useState("")
  const [categoriaId, setCategoriaId] = useState<string>("") 
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (initialData) {
      setClave(initialData.CLAVE)
      setNombre(initialData.NOMBRE)
      setDescripcion(initialData.DESCRIPCION)
      setCategoriaId(String(initialData.CATEGORIA_ID) || "") 
    } else {
      setClave("")
      setNombre("")
      setDescripcion("")
      setCategoriaId(String(categories[0]?.ID_CATEGORIA) || "") 
    }
    setIsSubmitting(false);
  }, [initialData, open, categories])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!categoriaId) {
      toast.error("Debe seleccionar una categoría.");
      return;
    }

    setIsSubmitting(true);
    
    const permisoId = initialData?.ID_PERMISO; 
    
    const payload: PermisoPayload = {
      CLAVE: clave.trim(),
      NOMBRE: nombre.trim(),
      DESCRIPCION: descripcion.trim(),
      CATEGORIA_ID: Number(categoriaId),
    }

    const success = await savePermiso(payload, permisoId)
    
    setIsSubmitting(false);

    if (success) {
      onOpenChange(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{initialData ? "Editar Permiso" : "Nuevo Permiso"}</DialogTitle>
          <DialogDescription>
            {initialData ? "Modifica los datos del permiso" : "Crea un nuevo permiso para el sistema"}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="id">
              ID del Permiso <span className="text-destructive">*</span>
            </Label>
            <Input
              id="clave"
              placeholder="Ej: manage_reports"
              value={clave}
              onChange={(e) => setClave(e.target.value)}
              required
              disabled={!!initialData}
            />
            <p className="text-xs text-muted-foreground">
              Identificador único en formato snake_case. No se puede modificar después de crear.
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="nombre">
              Nombre <span className="text-destructive">*</span>
            </Label>
            <Input
              id="nombre"
              placeholder="Ej: Gestionar Reportes"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="descripcion">
              Descripción <span className="text-destructive">*</span>
            </Label>
            <Textarea
              id="descripcion"
              placeholder="Describe qué permite hacer este permiso"
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
              required
              rows={2}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="categoria">
              Categoría <span className="text-destructive">*</span>
            </Label>
            <Select value={categoriaId} onValueChange={setCategoriaId} required>
              <SelectTrigger>
                <SelectValue placeholder="Selecciona una categoría" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((cat) => (
                  <SelectItem key={cat.ID_CATEGORIA} value={String(cat.ID_CATEGORIA)}>
                    {cat.NOMBRE}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit">Guardar</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
