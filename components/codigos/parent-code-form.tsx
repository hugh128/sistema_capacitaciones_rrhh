"use client"

import { memo, useState, useCallback, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { NuevoCodigoPadre } from "@/lib/codigos/types"

interface ParentCodeFormProps {
  onSubmit: (data: NuevoCodigoPadre) => void
  onCancel: () => void
  isEditing?: boolean
  initialData?: NuevoCodigoPadre
}

export const ParentCodeForm = memo(({ 
  onSubmit, 
  onCancel, 
  isEditing = false,
  initialData
}: ParentCodeFormProps) => {  
  const [formData, setFormData] = useState<NuevoCodigoPadre>(
    initialData || {
      CODIGO: "",
      TIPO_DOCUMENTO: "",
      NOMBRE_DOCUMENTO: "",
      APROBACION: "",
      VERSION: 1,
      ESTATUS: "VIGENTE",
      DEPARTAMENTO_CODIGO: ""
    }
  );

  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
    }
  }, [initialData]);

  const handleInputChange = useCallback((field: keyof NuevoCodigoPadre) => {
    return (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.type === 'number' 
        ? Number(e.target.value) 
        : e.target.value;
      
      setFormData(prev => ({ 
        ...prev, 
        [field]: value 
      }));
    };
  }, []);

  const handleSelectChange = useCallback((value: string) => {
    setFormData(prev => ({ ...prev, ESTATUS: value }));
  }, []);

  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  }, [formData, onSubmit]);

  return (
    <form 
      onSubmit={handleSubmit}
      className="space-y-4"
    >
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="codigo">
            Código <span className="text-destructive">*</span>
          </Label>
          <Input
            id="codigo"
            name="codigo"
            value={formData.CODIGO ?? ""}
            onChange={handleInputChange('CODIGO')}
            placeholder="VAL-PMV-001"
            autoComplete="off"
            autoFocus
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="tipo">
            Tipo de Documento <span className="text-destructive">*</span>
          </Label>
          <Input
            id="tipo"
            name="tipo"
            value={formData.TIPO_DOCUMENTO ?? ""}
            onChange={handleInputChange('TIPO_DOCUMENTO')}
            placeholder="PMV"
            autoComplete="off"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="documento">
          Documento <span className="text-destructive">*</span>
        </Label>
        <Input
          id="documento"
          name="documento"
          value={formData.NOMBRE_DOCUMENTO ?? ""}
          onChange={handleInputChange('NOMBRE_DOCUMENTO')}
          placeholder="Plan maestro de validaciones"
          autoComplete="off"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="fecha">
            Fecha de Aprobación <span className="text-destructive">*</span>
          </Label>
          <Input
            id="fecha"
            name="fecha"
            type="date"
            value={formData.APROBACION ?? ""}
            onChange={handleInputChange('APROBACION')}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="codigo-departamento">
            Código Departamento <span className="text-destructive">*</span>
          </Label>
          <Input
            id="codigo-departamento"
            name="codigo-departamento"
            value={formData.DEPARTAMENTO_CODIGO ?? ""}
            onChange={handleInputChange('DEPARTAMENTO_CODIGO')}
            placeholder="RRHH"
            autoComplete="off"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="version">
            Version <span className="text-destructive">*</span>
          </Label>
          <Input
            id="version"
            name="version"
            type="number"
            value={formData.VERSION ?? 1}
            onChange={handleInputChange('VERSION')}
            placeholder="1"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="estatus">
            Estatus <span className="text-destructive">*</span>
          </Label>
          <Select
            value={formData.ESTATUS ?? "VIGENTE"}
            onValueChange={handleSelectChange}
          >
            <SelectTrigger id="estatus">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="VIGENTE">VIGENTE</SelectItem>
              <SelectItem value="PROCESO">PROCESO</SelectItem>
              <SelectItem value="OBSOLETO">OBSOLETO</SelectItem>
              <SelectItem value="VENCIDO">VENCIDO</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="flex justify-end gap-2 pt-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit">
          {isEditing ? "Guardar Cambios" : "Agregar"}
        </Button>
      </div>
    </form>
  )
});

ParentCodeForm.displayName = "ParentCodeForm";
