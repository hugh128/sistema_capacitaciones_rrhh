"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { NuevoCodigoHijo } from "@/lib/codigos/types"

interface ChildCodeFormProps {
  data: NuevoCodigoHijo
  onChange: (data: NuevoCodigoHijo) => void
  onSubmit: () => void
  onCancel: () => void
  isEditing?: boolean
}

export function ChildCodeForm({ data, onChange, onSubmit, onCancel, isEditing = false }: ChildCodeFormProps) {

  const handleStatusChange = (value: "true" | "false") => {
    const isVigente = value === "true";
    onChange({ ...data, ESTATUS: isVigente });
  };
  
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="codigo">Dato Asociado *</Label>
        <Input
          id="codigo"
          value={data.CODIGO}
          onChange={(e) => onChange({ ...data, CODIGO: e.target.value })}
          placeholder="GC-PEO-026"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="nombre">Nombre de Documento Asociado *</Label>
        <Input
          id="nombre"
          value={data.NOMBRE_DOCUMENTO}
          onChange={(e) => onChange({ ...data, NOMBRE_DOCUMENTO: e.target.value })}
          placeholder="Elaboración de Análisis de Riesgos"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="estatus">Estatus *</Label>
        <Select
          value={data.ESTATUS ? "true" : "false"}
          onValueChange={handleStatusChange}
        >
          <SelectTrigger id="estatus">
            <SelectValue placeholder="Seleccione estatus" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="true">Vigente</SelectItem>
            <SelectItem value="false">Inactivo</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex justify-end gap-2 pt-4">
        <Button variant="outline" onClick={onCancel}>
          Cancelar
        </Button>
        <Button onClick={onSubmit}>{isEditing ? "Guardar" : "Agregar"}</Button>
      </div>
    </div>
  )
}
