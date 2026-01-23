import { memo, useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { Capacitador } from "@/lib/capacitaciones/capacitaciones-types"

const TextInputOptimizado = memo(function TextInputOptimizado({
  id,
  label,
  value,
  onChange,
  placeholder,
}: {
  id: string
  label: string
  value: string
  onChange: (value: string) => void
  placeholder?: string
}) {
  const [localValue, setLocalValue] = useState(value)

  useEffect(() => {
    setLocalValue(value)
  }, [value])

  useEffect(() => {
    const timer = setTimeout(() => {
      if (localValue !== value) {
        onChange(localValue)
      }
    }, 150)

    return () => clearTimeout(timer)
  }, [localValue, value, onChange])

  return (
    <div className="space-y-2">
      <Label htmlFor={id}>{label}</Label>
      <Input
        id={id}
        value={localValue}
        onChange={(e) => setLocalValue(e.target.value)}
        placeholder={placeholder}
      />
    </div>
  )
})

const TextAreaOptimizado = memo(function TextAreaOptimizado({
  id,
  label,
  value,
  onChange,
  placeholder,
  rows = 3,
}: {
  id: string
  label: string
  value: string
  onChange: (value: string) => void
  placeholder?: string
  rows?: number
}) {
  const [localValue, setLocalValue] = useState(value)

  useEffect(() => {
    setLocalValue(value)
  }, [value])

  useEffect(() => {
    const timer = setTimeout(() => {
      if (localValue !== value) {
        onChange(localValue)
      }
    }, 150)

    return () => clearTimeout(timer)
  }, [localValue, value, onChange])

  return (
    <div className="space-y-2">
      <Label htmlFor={id}>{label}</Label>
      <Textarea
        id={id}
        value={localValue}
        onChange={(e) => setLocalValue(e.target.value)}
        placeholder={placeholder}
        rows={rows}
      />
    </div>
  )
})

interface FormularioCapacitacionProps {
  capacitadorId: string
  setCapacitadorId: (value: string) => void
  fechaProgramada: string
  setFechaProgramada: (value: string) => void
  horaInicio: string
  setHoraInicio: (value: string) => void
  horaFin: string
  setHoraFin: (value: string) => void
  tipoCapacitacion: string
  setTipoCapacitacion: (value: string) => void
  modalidad: string
  setModalidad: (value: string) => void
  grupoObjetivo: string
  setGrupoObjetivo: (value: string) => void
  objetivo: string
  setObjetivo: (value: string) => void
  aplicaExamen: boolean
  setAplicaExamen: (value: boolean) => void
  notaMinima: string
  setNotaMinima: (value: string) => void
  aplicaDiploma: boolean
  setAplicaDiploma: (value: boolean) => void
  observaciones: string
  setObservaciones: (value: string) => void
  capacitadores: Capacitador[]
  categoria: string
  setCategoria: (value: string) => void
}

export const FormularioCapacitacion = memo(function FormularioCapacitacion({
  capacitadorId,
  setCapacitadorId,
  fechaProgramada,
  setFechaProgramada,
  horaInicio,
  setHoraInicio,
  horaFin,
  setHoraFin,
  tipoCapacitacion,
  setTipoCapacitacion,
  modalidad,
  setModalidad,
  grupoObjetivo,
  setGrupoObjetivo,
  objetivo,
  setObjetivo,
  aplicaExamen,
  setAplicaExamen,
  notaMinima,
  setNotaMinima,
  aplicaDiploma,
  setAplicaDiploma,
  observaciones,
  setObservaciones,
  capacitadores,
  categoria,
  setCategoria
}: FormularioCapacitacionProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Información de la Capacitación</CardTitle>
        <CardDescription>Completa los datos para asignar la capacitación</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2 w-full">
            <Label htmlFor="categoria" className="text-blue-950 dark:text-foreground/90">Categoría *</Label>
            <Select value={categoria} onValueChange={setCategoria}>
              <SelectTrigger id="categoria" className="w-full">
                <SelectValue placeholder="Seleccionar categoría" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ACON">ACON</SelectItem>
                <SelectItem value="ASR">ASR</SelectItem>
                <SelectItem value="BOD">BOD</SelectItem>
                <SelectItem value="CC">CC</SelectItem>
                <SelectItem value="CCFQ">CCFQ</SelectItem>
                <SelectItem value="CCMIC">CCMIC</SelectItem>
                <SelectItem value="COM">COM</SelectItem>
                <SelectItem value="DG">DG</SelectItem>
                <SelectItem value="GC">GC</SelectItem>
                <SelectItem value="I&D">I&D</SelectItem>
                <SelectItem value="IMP">IMP</SelectItem>
                <SelectItem value="MANT">MANT</SelectItem>
                <SelectItem value="OP">OP</SelectItem>
                <SelectItem value="PROD">PROD</SelectItem>
                <SelectItem value="PRODLIQ">PRODLIQ</SelectItem>
                <SelectItem value="PRODSEM">PRODSEM</SelectItem>
                <SelectItem value="PRODSOL">PRODSOL</SelectItem>
                <SelectItem value="RRHH">RRHH</SelectItem>
                <SelectItem value="SSO">SSO</SelectItem>
                <SelectItem value="VAL">VAL</SelectItem>
                <SelectItem value="OTROS">OTROS</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2 dark-mode-date-fix">
            <Label htmlFor="fecha">Fecha Programada *</Label>
            <Input id="fecha" type="date" value={fechaProgramada} onChange={(e) => setFechaProgramada(e.target.value)} />
          </div>

          <div className="space-y-2 dark-mode-date-fix">
            <Label htmlFor="horaInicio">Hora de Inicio *</Label>
            <Input id="horaInicio" type="time" value={horaInicio} onChange={(e) => setHoraInicio(e.target.value)} />
          </div>

          <div className="space-y-2 dark-mode-date-fix">
            <Label htmlFor="horaFin">Hora de Fin *</Label>
            <Input id="horaFin" type="time" value={horaFin} onChange={(e) => setHoraFin(e.target.value)} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="tipo">Tipo de Capacitación *</Label>
            <Select value={tipoCapacitacion} onValueChange={setTipoCapacitacion}>
              <SelectTrigger id="tipo" className="w-full">
                <SelectValue placeholder="Seleccionar tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="CURSO">CURSO</SelectItem>
                <SelectItem value="TALLER">TALLER</SelectItem>
                <SelectItem value="CHARLA">CHARLA</SelectItem>
                <SelectItem value="OTRO">OTRO</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="modalidad">Modalidad *</Label>
            <Select value={modalidad} onValueChange={setModalidad}>
              <SelectTrigger id="modalidad" className="w-full">
                <SelectValue placeholder="Seleccionar modalidad" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="INTERNA">INTERNA</SelectItem>
                <SelectItem value="EXTERNA">EXTERNA</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="capacitador">Capacitador *</Label>
          <Select value={capacitadorId} onValueChange={setCapacitadorId}>
            <SelectTrigger id="capacitador" className="w-full">
              <SelectValue placeholder="Seleccionar capacitador" />
            </SelectTrigger>
            <SelectContent>
              {capacitadores.map((cap) => (
                <SelectItem key={cap.PERSONA_ID} value={cap.PERSONA_ID.toString()}>
                  {cap.NOMBRE} {cap.APELLIDO}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <TextInputOptimizado
          id="grupoObjetivo"
          label="Grupo Objetivo"
          value={grupoObjetivo}
          onChange={setGrupoObjetivo}
          placeholder="Ej: Personal de laboratorio nuevo"
        />

        <TextAreaOptimizado
          id="objetivo"
          label="Objetivo"
          value={objetivo}
          onChange={setObjetivo}
          placeholder="Describe el objetivo de la capacitación..."
          rows={3}
        />

        <div className="space-y-3 pt-4 border-t">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="aplicaExamen"
              checked={aplicaExamen}
              onCheckedChange={(checked) => {
                setAplicaExamen(checked as boolean)
                if (!checked) {
                  setNotaMinima('')
                }
              }}
              className="
                dark:border dark:border-gray-500
                data-[state=checked]:dark:border-transparent cursor-pointer
              "
            />
            <Label htmlFor="aplicaExamen" className="cursor-pointer">
              Aplica Examen
            </Label>
          </div>

          {aplicaExamen && (
            <div className="ml-6 space-y-2">
              <Label htmlFor="notaMinima">Nota Mínima (0-100)</Label>
              <Input
                id="notaMinima"
                type="number"
                min="0"
                max="100"
                value={notaMinima}
                onChange={(e) => setNotaMinima(e.target.value)}
                placeholder="70"
                className="w-32"
              />
            </div>
          )}

          <div className="flex items-center space-x-2">
            <Checkbox
              id="aplicaDiploma"
              checked={aplicaDiploma}
              onCheckedChange={(checked) => setAplicaDiploma(checked as boolean)}
              className="
                dark:border dark:border-gray-500
                data-[state=checked]:dark:border-transparent cursor-pointer
              "
            />
            <Label htmlFor="aplicaDiploma" className="cursor-pointer">
              Aplica Diploma
            </Label>
          </div>
        </div>

        <TextAreaOptimizado
          id="observaciones"
          label="Observaciones"
          value={observaciones}
          onChange={setObservaciones}
          placeholder="Observaciones adicionales..."
          rows={3}
        />
      </CardContent>
    </Card>
  )
})
