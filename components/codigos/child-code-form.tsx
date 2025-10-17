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
  
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="codigo">Dato Asociado <span className="text-destructive">*</span></Label>
        <Input
          id="codigo"
          value={data.CODIGO}
          onChange={(e) => onChange({ ...data, CODIGO: e.target.value })}
          placeholder="GC-PEO-026"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="nombre">Nombre de Documento Asociado <span className="text-destructive">*</span></Label>
        <Input
          id="nombre"
          value={data.NOMBRE_DOCUMENTO}
          onChange={(e) => onChange({ ...data, NOMBRE_DOCUMENTO: e.target.value })}
          placeholder="Elaboración de Análisis de Riesgos"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="fecha">Fecha de Aprobación <span className="text-destructive">*</span></Label>
          <Input
            id="fecha"
            type="date"
            value={data.FECHA_APROBACION ?? ""}
            onChange={(e) => onChange({ ...data, FECHA_APROBACION: e.target.value })}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="version">Version <span className="text-destructive">*</span></Label>
          <Input
            id="version"
            type="number"
            value={data.VERSION ?? ""}
            onChange={(e) => onChange({ ...data, VERSION: Number(e.target.value) })}
            placeholder="1"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="estatus">Estatus <span className="text-destructive">*</span></Label>
          <Select
            value={data.ESTATUS ?? ""}
            onValueChange={(value) => onChange({ ...data, ESTATUS: value })}
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
        <Button onClick={onSubmit}>{isEditing ? "Guardar" : "Agregar"}</Button>
      </div>
    </div>
  )
}
