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
import type { CategoriaPermiso } from "@/lib/auth"
import type { CategoriaPayload } from "@/hooks/useCategorias"

interface CategoryFormModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  initialData?: CategoriaPermiso | null
  saveCategoria: (data: CategoriaPayload, id?: number) => Promise<boolean>
}

export function CategoryFormModal({ open, onOpenChange, initialData, saveCategoria }: CategoryFormModalProps) {
  const [clave, setClave] = useState("") 
  const [nombre, setNombre] = useState("")
  const [descripcion, setDescripcion] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (initialData) {
      setClave(initialData.CLAVE)
      setNombre(initialData.NOMBRE)
      setDescripcion(initialData.DESCRIPCION)
    } else {
      setClave("")
      setNombre("")
      setDescripcion("")
    }
    setIsSubmitting(false);
  }, [initialData, open])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true);

    const categoryId = initialData?.ID_CATEGORIA; 

    const payload: CategoriaPayload = {
      CLAVE: clave.trim(),
      NOMBRE: nombre.trim(),
      DESCRIPCION: descripcion.trim(),
    }

    const success = await saveCategoria(payload, categoryId)
    
    setIsSubmitting(false);

    if (success) {
        onOpenChange(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{initialData ? "Editar Categoría" : "Nueva Categoría"}</DialogTitle>
          <DialogDescription>
            {initialData ? "Modifica los datos de la categoría" : "Crea una nueva categoría de permisos"}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="id">
              ID de la Categoría <span className="text-destructive">*</span>
            </Label>
            <Input
              id="clave"
              placeholder="Ej: ventas"
              value={clave}
              onChange={(e) => setClave(e.target.value)}
              required
              disabled={!!initialData}
            />
            <p className="text-xs text-muted-foreground">
              Identificador único en minúsculas. No se puede modificar después de crear.
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="nombre">
              Nombre <span className="text-destructive">*</span>
            </Label>
            <Input
              id="nombre"
              placeholder="Ej: Ventas"
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
              placeholder="Describe el tipo de permisos que agrupa esta categoría"
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
              required
              rows={2}
            />
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
