"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Plus, Trash2 } from "lucide-react"
import type { ProgramaCapacitacionForm, ProgramaDetalleForm } from "@/lib/programas_capacitacion/types"
import type { Departamento } from "@/lib/types"

interface CreateProgramaProps {
  departamentos: Departamento[]
  onSave: (programa: ProgramaCapacitacionForm) => void
  onCancel: () => void
}

export function CreatePrograma({ departamentos, onSave, onCancel }: CreateProgramaProps) {
  const [nombre, setNombre] = useState("")
  const [descripcion, setDescripcion] = useState("")
  const [tipo, setTipo] = useState("PROGRAMA")
  const [periodo, setPeriodo] = useState(new Date().getFullYear())
  const [estado, setEstado] = useState("ACTIVO")
  const [detalles, setDetalles] = useState<ProgramaDetalleForm[]>([])

  const [showAddTraining, setShowAddTraining] = useState(false)
  const [newTraining, setNewTraining] = useState<ProgramaDetalleForm>({
    NOMBRE: "",
    CATEGORIA_CAPACITACION: "GENERAL",
    TIPO_CAPACITACION: "INTERNA",
    APLICA_TODOS_DEPARTAMENTOS: true,
    APLICA_DIPLOMA: false,
    FECHA_PROGRAMADA: "",
    ESTADO: "ACTIVO",
    DEPARTAMENTO_RELACIONES: [],
  })

  useEffect(() => {
    if (showAddTraining) {
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = "unset"
    }

    return () => {
      document.body.style.overflow = "unset"
    }
  }, [showAddTraining])

  const handleAddTraining = () => {
    if (newTraining.NOMBRE && newTraining.FECHA_PROGRAMADA) {
      setDetalles((prev) => [...prev, newTraining])
      setNewTraining({
        NOMBRE: "",
        CATEGORIA_CAPACITACION: "GENERAL",
        TIPO_CAPACITACION: "INTERNA",
        APLICA_TODOS_DEPARTAMENTOS: true,
        APLICA_DIPLOMA: false,
        FECHA_PROGRAMADA: "",
        ESTADO: "ACTIVO",
        DEPARTAMENTO_RELACIONES: [],
      })
      setShowAddTraining(false)
    }
  }

  const handleRemoveTraining = (index: number) => {
    setDetalles(detalles.filter((_, i) => i !== index))
  }

  const handleToggleDepartamento = (dept: Departamento) => {
    const exists = newTraining.DEPARTAMENTO_RELACIONES.some((d) => d.ID_DEPARTAMENTO === dept.ID_DEPARTAMENTO)
    if (exists) {
      setNewTraining({
        ...newTraining,
        DEPARTAMENTO_RELACIONES: newTraining.DEPARTAMENTO_RELACIONES.filter(
          (d) => d.ID_DEPARTAMENTO !== dept.ID_DEPARTAMENTO,
        ),
      })
    } else {
      setNewTraining({
        ...newTraining,
        DEPARTAMENTO_RELACIONES: [...newTraining.DEPARTAMENTO_RELACIONES, dept],
      })
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const payload: ProgramaCapacitacionForm = {
      NOMBRE: nombre,
      DESCRIPCION: descripcion,
      TIPO: tipo,
      PERIODO: periodo,
      ESTADO: estado,
      PROGRAMA_DETALLES: detalles.map((detalle) => ({
        ...detalle,
        DEPARTAMENTOS_IDS: detalle.APLICA_TODOS_DEPARTAMENTOS
          ? []
          : detalle.DEPARTAMENTO_RELACIONES.map((d) => d.ID_DEPARTAMENTO),
      })),
    }

    await onSave(payload)
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col items-start gap-4">
        <Button variant="ghost" onClick={onCancel} className="hover:bg-muted">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Volver
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-foreground">Crear Programa de Capacitación</h1>
          <p className="text-muted-foreground mt-1">Complete la información del programa y agregue capacitaciones</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Program Header */}
        <Card className="border-border">
          <CardHeader className="border-b border-border">
            <CardTitle>Información del Programa</CardTitle>
          </CardHeader>
          <CardContent className="pt-6 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="nombre">Nombre del Programa *</Label>
                <Input
                  id="nombre"
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  placeholder="Ej: Programa de Formación 2025"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="tipo">Tipo *</Label>
                <Select value={tipo} onValueChange={setTipo}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="PROGRAMA">PROGRAMA</SelectItem>
                    <SelectItem value="ANUAL">ANUAL</SelectItem>
                    <SelectItem value="TRIMESTRAL">TRIMESTRAL</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="periodo">Periodo (Año) *</Label>
                <Input
                  id="periodo"
                  type="number"
                  value={periodo}
                  onChange={(e) => setPeriodo(Number(e.target.value))}
                  min={2020}
                  max={2050}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="estado">Estado *</Label>
                <Select value={estado} onValueChange={setEstado}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ACTIVO">ACTIVO</SelectItem>
                    <SelectItem value="INACTIVO">INACTIVO</SelectItem>
                    <SelectItem value="BORRADOR">BORRADOR</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="descripcion">Descripción *</Label>
              <Textarea
                id="descripcion"
                value={descripcion}
                onChange={(e) => setDescripcion(e.target.value)}
                placeholder="Describe el objetivo y alcance del programa"
                rows={3}
                required
              />
            </div>
          </CardContent>
        </Card>

        {/* Training Details */}
        <Card className="border-border">
          <CardHeader className="border-b border-border">
            <div className="flex items-center justify-between">
              <CardTitle>Capacitaciones del Programa</CardTitle>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setShowAddTraining(true)}
                className="border-primary text-primary hover:bg-primary/10"
              >
                <Plus className="w-4 h-4 mr-2" />
                Agregar Capacitación
              </Button>
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            {detalles.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No hay capacitaciones agregadas. Haz clic en Agregar Capacitación para comenzar.
              </div>
            ) : (
              <div className="space-y-3">
                {detalles.map((detalle, index) => (
                  <div key={index} className="flex items-start gap-3 p-4 border border-border rounded-lg bg-muted/30">
                    <div className="flex-1 space-y-2">
                      <div className="flex items-start justify-between">
                        <h4 className="font-semibold text-foreground">{detalle.NOMBRE}</h4>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemoveTraining(index)}
                          className="hover:bg-destructive/10 hover:text-destructive"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">
                          {detalle.CATEGORIA_CAPACITACION}
                        </Badge>
                        <Badge variant="outline" className="bg-blue-500/10 text-blue-600 border-blue-500/20">
                          {detalle.TIPO_CAPACITACION}
                        </Badge>
                        <Badge variant="outline">📅 {detalle.FECHA_PROGRAMADA}</Badge>
                        {detalle.APLICA_DIPLOMA && <Badge variant="outline">🎓 Diploma</Badge>}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {detalle.APLICA_TODOS_DEPARTAMENTOS ? (
                          <span>Aplica a todos los departamentos</span>
                        ) : (
                          <span>Departamentos: {detalle.DEPARTAMENTO_RELACIONES.map((d) => d.NOMBRE).join(", ")}</span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Add Training Form */}
        {showAddTraining && (
          <Card className="border-primary shadow-lg">
            <CardHeader className="border-b border-border bg-primary/5">
              <CardTitle>Nueva Capacitación</CardTitle>
            </CardHeader>
            <CardContent className="pt-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="training-nombre">Nombre de la Capacitación *</Label>
                  <Input
                    id="training-nombre"
                    value={newTraining.NOMBRE}
                    onChange={(e) => setNewTraining({ ...newTraining, NOMBRE: e.target.value })}
                    placeholder="Ej: Capacitación de Seguridad Industrial"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="training-categoria">Categoría *</Label>
                  <Select
                    value={newTraining.CATEGORIA_CAPACITACION}
                    onValueChange={(value: "GENERAL" | "ESPECIFICA" | "CONTINUA") =>
                      setNewTraining({ ...newTraining, CATEGORIA_CAPACITACION: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="GENERAL">GENERAL</SelectItem>
                      <SelectItem value="ESPECIFICA">ESPECÍFICA</SelectItem>
                      <SelectItem value="CONTINUA">CONTINUA</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="training-tipo">Tipo *</Label>
                  <Select
                    value={newTraining.TIPO_CAPACITACION}
                    onValueChange={(value: "INTERNA" | "EXTERNA") =>
                      setNewTraining({ ...newTraining, TIPO_CAPACITACION: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="INTERNA">INTERNA</SelectItem>
                      <SelectItem value="EXTERNA">EXTERNA</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="training-fecha">Fecha Programada *</Label>
                  <Input
                    id="training-fecha"
                    type="date"
                    value={newTraining.FECHA_PROGRAMADA}
                    onChange={(e) => setNewTraining({ ...newTraining, FECHA_PROGRAMADA: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="training-estado">Estado *</Label>
                  <Select
                    value={newTraining.ESTADO}
                    onValueChange={(value) => setNewTraining({ ...newTraining, ESTADO: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ACTIVO">ACTIVO</SelectItem>
                      <SelectItem value="INACTIVO">INACTIVO</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="training-diploma"
                  checked={newTraining.APLICA_DIPLOMA}
                  onCheckedChange={(checked) => setNewTraining({ ...newTraining, APLICA_DIPLOMA: checked as boolean })}
                />
                <Label htmlFor="training-diploma" className="cursor-pointer">
                  Aplica Diploma
                </Label>
              </div>

              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="training-todos-dept"
                    checked={newTraining.APLICA_TODOS_DEPARTAMENTOS}
                    onCheckedChange={(checked) =>
                      setNewTraining({
                        ...newTraining,
                        APLICA_TODOS_DEPARTAMENTOS: checked as boolean,
                        DEPARTAMENTO_RELACIONES: checked ? [] : newTraining.DEPARTAMENTO_RELACIONES,
                      })
                    }
                  />
                  <Label htmlFor="training-todos-dept" className="cursor-pointer">
                    Aplica a todos los departamentos
                  </Label>
                </div>

                {!newTraining.APLICA_TODOS_DEPARTAMENTOS && (
                  <div className="space-y-2 pl-6">
                    <Label>Seleccionar Departamentos *</Label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {departamentos.map((dept) => (
                        <div key={dept.ID_DEPARTAMENTO} className="flex items-center space-x-2">
                          <Checkbox
                            id={`dept-${dept.ID_DEPARTAMENTO}`}
                            checked={newTraining.DEPARTAMENTO_RELACIONES.some(
                              (d) => d.ID_DEPARTAMENTO === dept.ID_DEPARTAMENTO,
                            )}
                            onCheckedChange={() => handleToggleDepartamento(dept)}
                          />
                          <Label htmlFor={`dept-${dept.ID_DEPARTAMENTO}`} className="cursor-pointer font-normal">
                            {dept.NOMBRE}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="flex gap-2 pt-4">
                <Button
                  type="button"
                  onClick={handleAddTraining}
                  disabled={!newTraining.NOMBRE || !newTraining.FECHA_PROGRAMADA}
                  className="bg-primary text-primary-foreground hover:bg-primary/90"
                >
                  Agregar
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowAddTraining(false)}
                  className="border-border"
                >
                  Cancelar
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Form Actions */}
        <div className="flex gap-3">
          <Button
            type="submit"
            disabled={!nombre || !descripcion || detalles.length === 0}
            className="bg-primary text-primary-foreground hover:bg-primary/90"
          >
            Crear Programa
          </Button>
          <Button type="button" variant="outline" onClick={onCancel} className="border-border bg-transparent">
            Cancelar
          </Button>
        </div>
      </form>
    </div>
  )
}
