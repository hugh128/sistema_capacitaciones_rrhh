"use client" 

import React from "react"
import { useState, useEffect, memo } from "react"
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

export type FormData = {
  [key: string]: string | number | boolean | Date | null | undefined;
}

export type OnSubmit = (data: FormData) => void;

interface FormField {
  key: string
  label: string
  type: "text" | "textarea" | "select" | "email" | "tel" | "password" | "date" | "number"
  required?: boolean
  options?: { value: string | boolean; label: string }[]
  placeholder?: string
}

interface FormModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  description?: string
  fields?: FormField[]
  initialData?: FormData
  onSubmit?: OnSubmit
  loading?: boolean
  customContent?: React.ReactNode
}

interface FormFieldRendererProps {
  field: FormField;
  value: FormData[string];
  updateField: (key: string, value: string) => void;
}

const FormFieldRenderer = memo(({ field, value, updateField }: FormFieldRendererProps) => {
    
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
          value={String(value ?? "")}
          onChange={handleChange}
          required={field.required}
        />
      ) : field.type === "select" ? (
        <Select
          value={value !== undefined && value !== null ? String(value) : ""}
          onValueChange={(selectValue) => updateField(field.key, selectValue)}
          required={field.required}
        >
          <SelectTrigger>
            <SelectValue placeholder={field.placeholder} />
          </SelectTrigger>
          <SelectContent>
            {field.options?.map((option) => (
              <SelectItem key={String(option.value)} value={String(option.value)}>
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
          value={String(value ?? "")}
          onChange={handleChange}
          required={field.required}
        />
      )}
    </div>
  )
})

FormFieldRenderer.displayName = 'FormFieldRenderer';

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
  
  const [formData, setFormData] = useState<FormData>({}) 

  useEffect(() => {
    setFormData(initialData || {});
  }, [initialData]) 

  const updateField = React.useCallback((key: string, value: string) => {
    const fieldDef = fields?.find(f => f.key === key); 
    let finalValue: FormData[string] = value;

    if (fieldDef?.type === 'select' && fieldDef.options?.some(opt => typeof opt.value === 'boolean')) {
      if (value === 'true') {
        finalValue = true;
      } else if (value === 'false') {
        finalValue = false;
      }
    }

    setFormData((prev) => ({ ...prev, [key]: finalValue }))
  }, [fields])
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    const dataWithId: FormData = initialData.id 
      ? { ...formData, id: initialData.id } 
      : formData;

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
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="dark:hover:bg-accent cursor-pointer">
                Cancelar
              </Button>
              <Button type="submit" disabled={loading} className="cursor-pointer">
                {loading ? "Guardando..." : "Guardar"}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  )
}
