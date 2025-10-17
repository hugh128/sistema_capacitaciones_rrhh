"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { NuevoCodigoPadre } from "@/lib/codigos/types"

interface ParentCodeFormProps {
  data: NuevoCodigoPadre
  onChange: (data: NuevoCodigoPadre) => void
  onSubmit: () => void
  onCancel: () => void
  isEditing?: boolean
}

export function ParentCodeForm({ data, onChange, onSubmit, onCancel, isEditing = false }: ParentCodeFormProps) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="codigo">Código <span className="text-destructive">*</span></Label>
          <Input
            id="codigo"
            value={data.CODIGO ?? ""}
            onChange={(e) => onChange({ ...data, CODIGO: e.target.value })}
            placeholder="VAL-PMV-001"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="tipo">Tipo de Documento <span className="text-destructive">*</span></Label>
          <Input
            id="tipo"
            value={data.TIPO_DOCUMENTO ?? ""}
            onChange={(e) => onChange({ ...data, TIPO_DOCUMENTO: e.target.value })}
            placeholder="PMV"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="documento">Documento <span className="text-destructive">*</span></Label>
        <Input
          id="documento"
          value={data.NOMBRE_DOCUMENTO ?? ""}
          onChange={(e) => onChange({ ...data, NOMBRE_DOCUMENTO: e.target.value })}
          placeholder="Plan maestro de validaciones"
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="fecha">Fecha de Aprobación <span className="text-destructive">*</span></Label>
          <Input
            id="fecha"
            type="date"
            value={data.APROBACION ?? ""}
            onChange={(e) => onChange({ ...data, APROBACION: e.target.value })}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="codigo-departamento">Código Departamento <span className="text-destructive">*</span></Label>
          <Input
            id="codigo-departamento"
            value={data.DEPARTAMENTO_CODIGO ?? ""}
            onChange={(e) => onChange({ ...data, DEPARTAMENTO_CODIGO: e.target.value })}
            placeholder="RRHH"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="version">Version <span className="text-destructive">*</span></Label>
          <Input
            id="version"
            type="number"
            value={data.VERSION ?? 1}
            onChange={(e) => onChange({ ...data, VERSION: Number(e.target.value) })}
            placeholder="1"
          />
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
      </div>

      <div className="flex justify-end gap-2 pt-4">
        <Button variant="outline" onClick={onCancel}>
          Cancelar
        </Button>
        <Button onClick={onSubmit}>{isEditing ? "Guardar Cambios" : "Agregar"}</Button>
      </div>
    </div>
  )
}
