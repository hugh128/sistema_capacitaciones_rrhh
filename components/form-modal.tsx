"use client" 

import React from "react"
import { useState, useEffect, memo } from "react" // 👈 Importamos 'memo'
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

interface FormField {
  key: string
  label: string
  type: "text" | "textarea" | "select" | "email" | "tel" | "password" | "date" | "number"
  required?: boolean
  options?: { value: string; label: string }[]
  placeholder?: string
}

interface FormModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  description?: string
  fields?: FormField[]
  initialData?: any
  onSubmit?: (data: any) => void
  loading?: boolean
  customContent?: React.ReactNode
}

// ----------------------------------------------------------------------
// COMPONENTE MEMORIZADO: FormFieldRenderer
// ----------------------------------------------------------------------

interface FormFieldRendererProps {
    field: FormField;
    value: any;
    updateField: (key: string, value: string) => void;
}

// Usamos memo para evitar que todos los campos se re-rendericen cuando solo
// cambia el valor de uno solo (ya que 'field' y 'updateField' son estables).
const FormFieldRenderer = memo(({ field, value, updateField }: FormFieldRendererProps) => {
    
    // Función de cambio específica para este campo
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        updateField(field.key, e.target.value);
    }
    
    return (
        <div className="space-y-2">
            <Label htmlFor={field.key}>
                {field.label}
                {field.required && <span className="text-destructive ml-1">*</span>}
            </Label>

            {field.type === "textarea" ? (
                <Textarea
                    id={field.key}
                    placeholder={field.placeholder}
                    value={value ?? ""}
                    onChange={handleChange}
                    required={field.required}
                />
            ) : field.type === "select" ? (
                <Select
                    value={value ?? ""}
                    onValueChange={(selectValue) => updateField(field.key, selectValue)}
                    required={field.required}
                >
                    <SelectTrigger>
                        <SelectValue placeholder={field.placeholder} />
                    </SelectTrigger>
                    <SelectContent>
                        {field.options?.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                                {option.label}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            ) : (
                <Input
                    id={field.key}
                    type={field.type}
                    placeholder={field.placeholder}
                    value={value ?? ""}
                    onChange={handleChange}
                    required={field.required}
                />
            )}
        </div>
    )
})

FormFieldRenderer.displayName = 'FormFieldRenderer'; // Buena práctica para la depuración

export function FormModal({
  open,
  onOpenChange,
  title,
  description,
  fields,
  initialData = {},
  onSubmit,
  loading = false,
  customContent,
}: FormModalProps) {
  
  const [formData, setFormData] = useState<any>({}) 

  // Sincronizamos el estado interno con las props (para edición/reseteo)
  useEffect(() => {
    setFormData(initialData || {});
  }, [initialData]) 

  // Memorizamos la función de actualización para que sea estable y no rompa 'memo'
  const updateField = React.useCallback((key: string, value: string) => {
    setFormData((prev: any) => ({ ...prev, [key]: value }))
  }, [])
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Aseguramos que se envía el ID si estamos editando
    const dataWithId = initialData.id ? { ...formData, id: initialData.id } : formData;
    onSubmit?.(dataWithId);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          {description && <DialogDescription>{description}</DialogDescription>}
        </DialogHeader>

        {customContent ? (
          customContent
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {fields?.map((field) => (
              <FormFieldRenderer 
                    key={field.key}
                    field={field}
                    value={formData[field.key]}
                    updateField={updateField}
                />
            ))}

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="dark:hover:bg-accent">
                Cancelar
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? "Guardando..." : "Guardar"}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  )
}
