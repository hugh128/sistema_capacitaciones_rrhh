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
import { Eye, EyeOff, Loader2 } from "lucide-react" 
import { Checkbox } from "@/components/ui/checkbox" 


export type FormData = {
  [key: string]: string | number | boolean | Date | null | undefined | (string | number)[]; 
}

export type OnSubmit = (data: FormData) => void;

interface FormField {
  key: string
  label: string
  type: "text" | "textarea" | "select" | "multiselect-checkboxes" | "email" | "tel" | "password" | "date" | "number"
  required?: boolean
  options?: { value: string | boolean; label: string }[]
  placeholder?: string
  autocomplete?: string
  disabled?: boolean;
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
  updateField: (key: string, value: string | (string | number)[]) => void;
  disabled?: boolean;
}

const FormFieldRenderer = memo(({ field, value, updateField, disabled = false }: FormFieldRendererProps) => {
    
  const [showPassword, setShowPassword] = useState(false);
  const togglePasswordVisibility = () => {
      setShowPassword(prev => !prev);
  };
  const passwordInputType = showPassword ? "text" : "password";
  const VisibilityIcon = showPassword ? EyeOff : Eye;
  
  const currentArrayValue = Array.isArray(value) ? value.map(String) : [];

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
          disabled={disabled}
        />
      ) : field.type === "select" ? (
        <Select
          value={value !== undefined && value !== null ? String(value) : ""}
          onValueChange={(selectValue) => updateField(field.key, selectValue)}
          required={field.required}
          disabled={disabled}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder={field.placeholder}/>
          </SelectTrigger>
          <SelectContent>
            {field.options?.map((option) => (
              <SelectItem key={String(option.value)} value={String(option.value)}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      ) : field.type === "multiselect-checkboxes" ? (
        <div className="flex flex-col space-y-2">
            {field.options?.map((option) => {
                const optionValue = String(option.value);
                const isChecked = currentArrayValue.includes(optionValue);

                const handleCheckChange = (checked: boolean) => {
                    let newArrayValue: string[];
                    
                    if (checked) {
                        newArrayValue = [...currentArrayValue, optionValue];
                    } else {
                        newArrayValue = currentArrayValue.filter(v => v !== optionValue);
                    }
                    
                    updateField(field.key, newArrayValue); 
                };

                return (
                    <div key={optionValue} className="flex items-center space-x-2">
                        <Checkbox
                            id={`${field.key}-${optionValue}`}
                            checked={isChecked}
                            onCheckedChange={handleCheckChange}
                            disabled={disabled}
                            className="dark:border dark:border-gray-600 data-[state=checked]:dark:border-transparent cursor-pointer"
                        />
                        <Label 
                          htmlFor={`${field.key}-${optionValue}`} 
                          className={`font-normal ${disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}`}
                        >
                            {option.label}
                        </Label>
                    </div>
                );
            })}
        </div>
      ) : field.type === "password" ? ( 
        <div className="relative">
          <Input
            id={field.key}
            type={passwordInputType}
            placeholder={field.placeholder}
            value={String(value ?? "")}
            onChange={handleChange}
            required={field.required}
            autoComplete={field.autocomplete}
            className="pr-10"
            disabled={disabled}
          />
          <Button
            type="button" 
            variant="ghost"
            size="sm"
            className="absolute right-0 top-0 h-full px-3 py-1 hover:bg-transparent"
            onClick={togglePasswordVisibility}
            tabIndex={-1}
            disabled={disabled}
          >
            <VisibilityIcon className="h-4 w-4 text-muted-foreground" />
          </Button>
        </div>
      ) : ( 
        <Input
          id={field.key}
          type={field.type}
          placeholder={field.placeholder}
          value={String(value ?? "")}
          onChange={handleChange}
          required={field.required}
          autoComplete={field.autocomplete}
          disabled={disabled}
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
    if (open) {
      setFormData(initialData || {});
    }
  }, [open, initialData])

  const updateField = React.useCallback((key: string, value: string | (string | number)[]) => {
    const fieldDef = fields?.find(f => f.key === key); 
    let finalValue: FormData[string] = value;

    if (fieldDef?.type === 'select' && fieldDef.options?.some(opt => typeof opt.value === 'boolean')) {
      if (value === 'true') {
        finalValue = true;
      } else if (value === 'false') {
        finalValue = false;
      }
    } 
    else if (fieldDef?.type === 'multiselect-checkboxes' && Array.isArray(value)) { 
        finalValue = value;
    }
    else if (typeof value === 'string') {
        finalValue = value;
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

  const handleOpenChange = (newOpenState: boolean) => {
      if (loading && newOpenState === false) {
        return;
      }
      
      onOpenChange(newOpenState);
      if (!newOpenState) {
          setFormData(initialData); 
      }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}> 
      <DialogContent 
        className="sm:max-w-[425px] overflow-auto flex flex-col"
        onInteractOutside={(e) => {
          if (loading) {
            e.preventDefault();
          }
        }}
        onEscapeKeyDown={(e) => {
          if (loading) {
            e.preventDefault();
          }
        }}
      >
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          {description && <DialogDescription>{description}</DialogDescription>}
        </DialogHeader>

        {customContent ? (
          customContent
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className={loading ? "pointer-events-none opacity-50 transition-opacity space-y-2" : "transition-opacity space-y-2"}>
              {fields?.map((field) => (
                <FormFieldRenderer 
                  key={field.key}
                  field={field}
                  value={formData[field.key]}
                  updateField={updateField}
                  disabled={loading || field.disabled}
                />
              ))}
            </div>

            <DialogFooter>
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => handleOpenChange(false)} 
                className="dark:hover:bg-accent cursor-pointer"
                disabled={loading}
              >
                Cancelar
              </Button>
              <Button 
                type="submit" 
                disabled={loading} 
                className="cursor-pointer min-w-[100px]"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Guardando...
                  </>
                ) : (
                  "Guardar"
                )}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  )
}
