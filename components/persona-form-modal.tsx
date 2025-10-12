"use client"

import React, { useState, useEffect, useCallback, useMemo } from "react"
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
import { Checkbox } from "@/components/ui/checkbox"
import { Persona } from "@/lib/types"

export type FormData = {
  [key: string]: string | number | boolean | Date | null | undefined;
}
type OnSubmit = (data: FormData) => void;

interface Option { value: string | boolean; label: string }
interface FormField {
  key: string
  label: string
  type: "text" | "textarea" | "select" | "email" | "tel" | "password" | "date" | "number" | "checkbox"
  required?: boolean
  options?: Option[]
  placeholder?: string
}

interface PersonaFormModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  description?: string
  initialPersonaData: Persona | null
  initialFormData: FormData
  allFields: FormField[]
  onSubmit: OnSubmit
  loading: boolean
}

const INTERNAL_FIELDS_KEYS = ['EMPRESA_ID', 'DEPARTAMENTO_ID', 'PUESTO_ID'];

const DEFAULT_TIPO_PERSONA = 'EXTERNO';

interface FormFieldRendererProps {
  field: FormField;
  value: FormData[string];
  updateField: (key: string, value: string | boolean) => void;
  options?: Option[]; 
}

const FormFieldRenderer = React.memo(({ field, value, updateField, options }: FormFieldRendererProps) => {
    
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    updateField(field.key, e.target.value);
  }

  const handleCheckboxChange = (checked: boolean) => {
    updateField(field.key, checked);
  };
  
  const fieldOptions = options || field.options; 

  if (field.type === 'checkbox') {
    return (
      <div className="flex items-center space-x-2 py-2">
        <Checkbox 
          id={field.key} 
          checked={!!value} 
          onCheckedChange={handleCheckboxChange} 
        />
        <Label htmlFor={field.key} className="text-base cursor-pointer">
          {field.label}
          {field.required && <span className="text-destructive ml-1">*</span>}
        </Label>
      </div>
    );
  }
  
  return (
    <div className="space-y-2 w-full">
      <Label htmlFor={field.key} className="text-sm">
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
      ) : field.type === "select" && fieldOptions ? (
        <Select
          value={value !== undefined && value !== null ? String(value) : ""}
          onValueChange={(selectValue) => updateField(field.key, selectValue)}
          required={field.required}
        >
          <SelectTrigger>
            <SelectValue placeholder={field.placeholder} />
          </SelectTrigger>
          <SelectContent>
            {fieldOptions.map((option) => (
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

export function PersonaFormModal({
  open,
  onOpenChange,
  title,
  description,
  initialPersonaData,
  initialFormData,
  allFields,
  onSubmit,
  loading = false,
}: PersonaFormModalProps) {
  
  const safeInitialData = useMemo(() => {
    return { 
        ...initialFormData,
        TIPO_PERSONA: (initialFormData?.TIPO_PERSONA as string) || DEFAULT_TIPO_PERSONA
    } as FormData;
  }, [initialFormData]);
    
  const [formData, setFormData] = useState<FormData>(safeInitialData)
  
  const [isColaborador, setIsColaborador] = useState(
      (safeInitialData.TIPO_PERSONA as string) === 'INTERNO'
  );

  useEffect(() => {
    const personaTipo = (initialFormData?.TIPO_PERSONA as string) || DEFAULT_TIPO_PERSONA;
    setFormData(initialFormData);
    setIsColaborador(personaTipo === 'INTERNO');
  }, [initialFormData, open]) 

  const handleColaboradorChange = useCallback((_key: string, value: string | boolean) => {
    const checked = typeof value === 'boolean' ? value : false;
    
    setIsColaborador(checked);
    setFormData(prev => ({ 
        ...prev, 
        TIPO_PERSONA: checked ? 'INTERNO' : 'EXTERNO'
    }));
  }, [])


  const updateField = React.useCallback((key: string, value: string | boolean) => {
    const fieldDef = allFields.find(f => f.key === key); 
    let finalValue: FormData[string] = value;

    if (fieldDef?.type === 'select' && typeof value === 'string') {
      if (value === 'true') {
        finalValue = true;
      } else if (value === 'false') {
        finalValue = false;
      }
    }

    setFormData((prev) => ({ ...prev, [key]: finalValue }))
  }, [allFields])
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    let finalData = formData;
    if (!isColaborador) {
        finalData = { ...formData };
        INTERNAL_FIELDS_KEYS.forEach(key => {
            finalData[key] = null; 
        });
    }

    const dataWithId: FormData = initialPersonaData?.ID_PERSONA 
      ? { ...finalData, ID_PERSONA: initialPersonaData.ID_PERSONA } 
      : finalData;
      
    dataWithId.TIPO_PERSONA = isColaborador ? 'INTERNO' : 'EXTERNO';

    onSubmit(dataWithId);
  }
  
  const fieldsToRender = useMemo(() => {
    const filteredFields = allFields.filter(field => 
        (isColaborador || !INTERNAL_FIELDS_KEYS.includes(field.key)) &&
        field.key !== 'TIPO_PERSONA'
    );
    
    return filteredFields;

  }, [isColaborador, allFields]);
  
  const colaboradorValue = isColaborador; 
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto custom-scrollbar">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          {description && <DialogDescription>{description}</DialogDescription>}
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          
          <div className="border-b pb-2">
            <FormFieldRenderer 
              field={{ key: 'isColaborador', label: 'Colaborador Interno', type: 'checkbox' }}
              value={colaboradorValue}
              updateField={handleColaboradorChange} 
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
            {fieldsToRender
                .map((field) => (
                    <FormFieldRenderer 
                      key={field.key}
                      field={field}
                      value={formData[field.key]}
                      updateField={updateField}
                      options={field.options}
                    />
            ))}
          </div>

          <DialogFooter className="mt-6">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="dark:hover:bg-accent cursor-pointer">
              Cancelar
            </Button>
            <Button type="submit" disabled={loading} className="cursor-pointer">
              {loading ? "Guardando..." : "Guardar"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
