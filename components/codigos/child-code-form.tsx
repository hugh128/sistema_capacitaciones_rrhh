"use client"

import { memo, useState, useCallback, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { NuevoCodigoHijo } from "@/lib/codigos/types"

interface ChildCodeFormProps {
  onSubmit: (data: NuevoCodigoHijo) => void
  onCancel: () => void
  isEditing?: boolean
  initialData?: NuevoCodigoHijo
}

export const ChildCodeForm = memo(({ 
  onSubmit, 
  onCancel, 
  isEditing = false,
  initialData
}: ChildCodeFormProps) => {

  const [formData, setFormData] = useState<NuevoCodigoHijo>(
    initialData || {
      CODIGO: "",
      NOMBRE_DOCUMENTO: "",
      FECHA_APROBACION: "",
      VERSION: 1,
      ESTATUS: "VIGENTE",
    }
  );

  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
    }
  }, [initialData]);

  const handleInputChange = useCallback((field: keyof NuevoCodigoHijo) => {
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

  const handleSubmit = useCallback(() => {
    onSubmit(formData);
  }, [formData, onSubmit]);

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="codigo">
          Dato Asociado <span className="text-destructive">*</span>
        </Label>
        <Input
          id="codigo"
          value={formData.CODIGO ?? ""}
          onChange={handleInputChange('CODIGO')}
          placeholder="GC-PEO-026"
          autoComplete="off"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="nombre">
          Nombre de Documento Asociado <span className="text-destructive">*</span>
        </Label>
        <Input
          id="nombre"
          value={formData.NOMBRE_DOCUMENTO ?? ""}
          onChange={handleInputChange('NOMBRE_DOCUMENTO')}
          placeholder="Elaboración de Análisis de Riesgos"
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
            type="date"
            value={formData.FECHA_APROBACION ?? ""}
            onChange={handleInputChange('FECHA_APROBACION')}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="version">
            Version <span className="text-destructive">*</span>
          </Label>
          <Input
            id="version"
            type="number"
            value={formData.VERSION ?? 1}
            onChange={handleInputChange('VERSION')}
            placeholder="1"
          />
        </div>
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

      <div className="flex justify-end gap-2 pt-4">
        <Button variant="outline" onClick={onCancel}>
          Cancelar
        </Button>
        <Button onClick={handleSubmit}>
          {isEditing ? "Guardar" : "Agregar"}
        </Button>
      </div>
    </div>
  )
});

ChildCodeForm.displayName = "ChildCodeForm";
