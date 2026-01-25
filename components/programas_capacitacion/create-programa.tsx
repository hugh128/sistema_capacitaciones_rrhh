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
import { ArrowLeft, Loader2, Plus, Trash2, Pencil, Users } from "lucide-react"
import type { ProgramaCapacitacionForm, ProgramaDetalleForm } from "@/lib/programas_capacitacion/types"
import type { Departamento, Puesto } from "@/lib/types"

interface CreateProgramaProps {
  departamentos: Departamento[]
  puestos: Puesto[]
  onSave: (programa: ProgramaCapacitacionForm) => void
  onCancel: () => void
}

interface PuestosFiltradosProps {
  newTraining: ProgramaDetalleForm;
  setNewTraining: React.Dispatch<React.SetStateAction<ProgramaDetalleForm>>;
  puestos: Puesto[];
}

const INITIAL_TRAINING_STATE: ProgramaDetalleForm = {
  NOMBRE: "",
  CATEGORIA_CAPACITACION: "GENERAL",
  TIPO_CAPACITACION: "INTERNA",
  APLICA_TODOS_COLABORADORES: true,
  APLICA_DIPLOMA: false,
  MES_PROGRAMADO: 1,
  ESTADO: "ACTIVO",
  DEPARTAMENTO_RELACIONES: [],
  PUESTO_RELACIONES: [],
};

const getCategoriaVariant = (categoria: string) => {
  switch (categoria) {
    case "GENERAL":
      return "bg-cyan-50 text-cyan-700 dark:bg-cyan-900/20 dark:text-cyan-400 border border-cyan-200 dark:border-cyan-800"
    case "ESPECIFICA":
      return "bg-violet-50 text-violet-700 dark:bg-violet-900/20 dark:text-violet-400 border border-violet-200 dark:border-violet-800"
    case "CONTINUA":
      return "bg-amber-50 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400 border border-amber-200 dark:border-amber-800"
    default:
      return "bg-slate-50 text-slate-700 dark:bg-slate-800/20 dark:text-slate-400 border border-slate-200 dark:border-slate-700"
  }
}

const getTipoVariant = (tipo: string) => {
  switch (tipo) {
    case "INTERNA":
      return "bg-indigo-50 text-indigo-700 dark:bg-indigo-900/20 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800"
    case "EXTERNA":
      return "bg-orange-50 text-orange-700 dark:bg-orange-900/20 dark:text-orange-400 border border-orange-200 dark:border-orange-800"
    default:
      return "bg-slate-50 text-slate-700 dark:bg-slate-800/20 dark:text-slate-400 border border-slate-200 dark:border-slate-700"
  }
}

export function CreatePrograma({ departamentos, puestos, onSave, onCancel }: CreateProgramaProps) {
  const [nombre, setNombre] = useState("")
  const [descripcion, setDescripcion] = useState("")
  const [tipo, setTipo] = useState("ANUAL")
  const [periodo, setPeriodo] = useState(new Date().getFullYear())
  const [estado, setEstado] = useState("ACTIVO")
  const [detalles, setDetalles] = useState<ProgramaDetalleForm[]>([])

  const [showAddTraining, setShowAddTraining] = useState(false)
  const [editingTrainingIndex, setEditingTrainingIndex] = useState<number | null>(null)
  const [newTraining, setNewTraining] = useState<ProgramaDetalleForm>(INITIAL_TRAINING_STATE)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const isTrainingValid = () => {
    if (!newTraining.NOMBRE || !newTraining.MES_PROGRAMADO) {
      return false
    }

    if (!newTraining.APLICA_TODOS_COLABORADORES) {
      return (
        newTraining.DEPARTAMENTO_RELACIONES.length > 0 &&
        newTraining.PUESTO_RELACIONES.length > 0
      )
    }

    return true
  }

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

  const handleCancelAddTraining = () => {
    setShowAddTraining(false);
    setEditingTrainingIndex(null);
    setNewTraining(INITIAL_TRAINING_STATE);
  };

  const handleEditTraining = (index: number) => {
    const detalle = detalles[index];
    setEditingTrainingIndex(index);
    setNewTraining({
      NOMBRE: detalle.NOMBRE,
      CATEGORIA_CAPACITACION: detalle.CATEGORIA_CAPACITACION,
      TIPO_CAPACITACION: detalle.TIPO_CAPACITACION,
      APLICA_TODOS_COLABORADORES: detalle.APLICA_TODOS_COLABORADORES,
      APLICA_DIPLOMA: detalle.APLICA_DIPLOMA,
      MES_PROGRAMADO: detalle.MES_PROGRAMADO,
      ESTADO: detalle.ESTADO,
      DEPARTAMENTO_RELACIONES: detalle.DEPARTAMENTO_RELACIONES || [],
      PUESTO_RELACIONES: detalle.PUESTO_RELACIONES || [],
    });
    setShowAddTraining(true);
  };

  const handleAddTraining = () => {
    if (!isTrainingValid()) return;

    const newTrainingIsGlobal = newTraining.APLICA_TODOS_COLABORADORES;
    const trainingData: ProgramaDetalleForm = {
      ...newTraining,
      DEPARTAMENTO_RELACIONES: newTrainingIsGlobal ? [] : newTraining.DEPARTAMENTO_RELACIONES,
      PUESTO_RELACIONES: newTrainingIsGlobal ? [] : newTraining.PUESTO_RELACIONES,
    };

    if (editingTrainingIndex !== null) {
      setDetalles((prev) => 
        prev.map((d, i) => (i === editingTrainingIndex ? trainingData : d))
      );
    } else {
      setDetalles((prev) => [...prev, trainingData]);
    }

    setNewTraining(INITIAL_TRAINING_STATE);
    setEditingTrainingIndex(null);
    setShowAddTraining(false);
  };

  const handleRemoveTraining = (index: number) => {
    setDetalles(detalles.filter((_, i) => i !== index))
  }

  const handleToggleDepartamento = (dept: Departamento) => {
    setNewTraining((prev) => {
      const newTrainingState: ProgramaDetalleForm = {
        ...prev,
        APLICA_TODOS_COLABORADORES: false,
      };

      const exists = newTrainingState.DEPARTAMENTO_RELACIONES.some(
        (d) => d.ID_DEPARTAMENTO === dept.ID_DEPARTAMENTO
      );

      if (exists) {
        const newDeptRelations = newTrainingState.DEPARTAMENTO_RELACIONES.filter(
          (d) => d.ID_DEPARTAMENTO !== dept.ID_DEPARTAMENTO
        );
        
        return {
          ...newTrainingState,
          DEPARTAMENTO_RELACIONES: newDeptRelations,
          PUESTO_RELACIONES: newTrainingState.PUESTO_RELACIONES.filter(puesto => 
            puesto.DEPARTAMENTO_ID && newDeptRelations.some(d => d.ID_DEPARTAMENTO === puesto.DEPARTAMENTO_ID)
          )
        };
      }
      
      return {
        ...newTrainingState,
        DEPARTAMENTO_RELACIONES: [...newTrainingState.DEPARTAMENTO_RELACIONES, dept],
      };
    });
  };

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
        DEPARTAMENTOS_IDS: detalle.APLICA_TODOS_COLABORADORES
          ? []
          : detalle.DEPARTAMENTO_RELACIONES.map((d) => d.ID_DEPARTAMENTO),
        PUESTOS_IDS: detalle.APLICA_TODOS_COLABORADORES
          ? []
          : detalle.PUESTO_RELACIONES.map((p) => p.ID_PUESTO),
      })),
    }

    setIsSubmitting(true)
    try {
      await onSave(payload)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col items-start gap-2">
        <Button variant="ghost" onClick={onCancel} className="hover:bg-muted cursor-pointer">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Volver
        </Button>
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Crear Programa de Capacitación</h1>
          <p className="text-muted-foreground mt-1">Complete la información del programa y agregue capacitaciones</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Program Header */}
        <Card className="border-border">
          <CardHeader className="border-b border-border">
            <CardTitle>Información del Programa</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="nombre">Nombre del Programa <span className="text-destructive">*</span></Label>
                <Input
                  id="nombre"
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  placeholder={`Ej: Programa Formación ${new Date().getFullYear()}`}
                  className="placeholder:text-xs"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="tipo">Tipo <span className="text-destructive">*</span></Label>
                <Select value={tipo} onValueChange={setTipo}>
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ANUAL">ANUAL</SelectItem>
                    <SelectItem value="PROGRAMA">PROGRAMA</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="periodo">Periodo (Año) <span className="text-destructive">*</span></Label>
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
                <Label htmlFor="estado">Estado <span className="text-destructive">*</span></Label>
                <Select value={estado} onValueChange={setEstado}>
                  <SelectTrigger className="w-full">
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
              <Label htmlFor="descripcion">Descripción <span className="text-destructive">*</span></Label>
              <Textarea
                id="descripcion"
                value={descripcion}
                onChange={(e) => setDescripcion(e.target.value)}
                placeholder="Describe el objetivo y alcance del programa"
                rows={3}
                className="placeholder:text-xs"
                required
              />
            </div>
          </CardContent>
        </Card>

        {/* Training Details */}
        <Card className="border-border">
          <CardHeader className="border-border">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Capacitaciones del Programa</CardTitle>
                <p className="text-sm text-muted-foreground mt-1">
                  Total: {detalles.length} {detalles.length === 1 ? 'capacitación' : 'capacitaciones'}
                </p>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => {
                  setEditingTrainingIndex(null);
                  setShowAddTraining(true);
                }}
                className="border-primary text-primary hover:bg-primary/10 dark:bg-blue-500/10 dark:text-blue-400 dark:border-blue-500/20 cursor-pointer"
              >
                <Plus className="w-4 h-4 mr-2" />
                Agregar Capacitación
              </Button>
            </div>
          </CardHeader>
          <CardContent className="">
            {detalles.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No hay capacitaciones agregadas. Haz clic en Agregar Capacitación para comenzar.
              </div>
            ) : (
              <div className="space-y-3">
                {detalles.map((detalle, index) => (
                  <div key={index} className="flex items-start gap-3 p-4 border border-emerald-200 dark:border-emerald-900/40 rounded-lg bg-emerald-50/20 dark:bg-emerald-950/10">
                    <div className="flex-1 space-y-2">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-semibold text-foreground">{detalle.NOMBRE}</h4>
                            <Badge variant="outline" className="text-xs bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800">
                              Nueva
                            </Badge>
                          </div>
                        </div>
                        <div className="flex gap-1 shrink-0">
                          <Button
                            type="button"
                            variant="default"
                            size="sm"
                            onClick={() => handleEditTraining(index)}
                            className="hover:bg-blue-500/10 hover:text-blue-600 dark:hover:text-blue-400 cursor-pointer"
                            title="Editar capacitación"
                          >
                            <Pencil className="w-4 h-4" />
                          </Button>
                          <Button
                            type="button"
                            variant="destructive"
                            size="sm"
                            onClick={() => handleRemoveTraining(index)}
                            className="hover:bg-destructive/10 hover:text-destructive cursor-pointer"
                            title="Eliminar capacitación"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium border ${getCategoriaVariant(detalle.CATEGORIA_CAPACITACION)}`}>
                          {detalle.CATEGORIA_CAPACITACION}
                        </span>
                        <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium ${getTipoVariant(detalle.TIPO_CAPACITACION)}`}>
                          {detalle.TIPO_CAPACITACION}
                        </span>
                        <Badge variant="outline">📅 Mes {detalle.MES_PROGRAMADO}</Badge>
                        {detalle.APLICA_DIPLOMA && <Badge variant="outline">🎓 Diploma</Badge>}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {detalle.APLICA_TODOS_COLABORADORES ? (
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="bg-purple-500/10 text-purple-600 border-purple-500/20 dark:text-purple-300">
                              <Users className="w-3 h-3 mr-1" />
                              Todos los colaboradores
                            </Badge>
                          </div>
                        ) : (
                          <>
                            <div>Departamentos: {detalle.DEPARTAMENTO_RELACIONES.map((d) => d.NOMBRE).join(", ")}</div>
                            {detalle.PUESTO_RELACIONES.length > 0 && (
                              <div>Puestos: {detalle.PUESTO_RELACIONES.map((p) => p.NOMBRE).join(", ")}</div>
                            )}
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Add/Edit Training Form */}
        {showAddTraining && (
          <Card className="border-primary shadow-lg">
            <CardHeader className="border-b border-border bg-primary/5">
              <CardTitle>
                {editingTrainingIndex !== null ? 'Editar Capacitación' : 'Nueva Capacitación'}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
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
                    <SelectTrigger className="w-full">
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
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="INTERNA">INTERNA</SelectItem>
                      <SelectItem value="EXTERNA">EXTERNA</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="training-mes">Mes Programado *</Label>
                  <Input
                    id="training-mes"
                    type="number"
                    value={newTraining.MES_PROGRAMADO}
                    min={1} max={12}
                    onChange={(e) => setNewTraining({ ...newTraining, MES_PROGRAMADO: +e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="training-estado">Estado *</Label>
                  <Select
                    value={newTraining.ESTADO}
                    onValueChange={(value) => setNewTraining({ ...newTraining, ESTADO: value })}
                  >
                    <SelectTrigger className="w-full">
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
                  className="dark:border dark:border-gray-500 data-[state=checked]:dark:border-transparent"
                />
                <Label htmlFor="training-diploma" className="cursor-pointer">
                  Aplica Diploma
                </Label>
              </div>

              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="training-todos-colab"
                    checked={newTraining.APLICA_TODOS_COLABORADORES}
                    className="dark:border dark:border-gray-500 data-[state=checked]:dark:border-transparent"
                    onCheckedChange={(checked) =>
                      setNewTraining({
                        ...newTraining,
                        APLICA_TODOS_COLABORADORES: checked as boolean,
                        DEPARTAMENTO_RELACIONES: checked ? [] : newTraining.DEPARTAMENTO_RELACIONES,
                        PUESTO_RELACIONES: checked ? [] : newTraining.PUESTO_RELACIONES,
                      })
                    }
                  />
                  <Label htmlFor="training-todos-colab" className="cursor-pointer">
                    Aplica a todos los colaboradores
                  </Label>
                </div>

                  {!newTraining.APLICA_TODOS_COLABORADORES && (
                    <>
                      <div className="space-y-2 pl-6">
                        <Label>Seleccionar Departamentos *</Label>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                          {departamentos.map((dept) => (
                            <div key={dept.ID_DEPARTAMENTO} className="flex items-center space-x-2">
                              <Checkbox
                                id={`dept-${dept.ID_DEPARTAMENTO}`}
                                className="dark:border dark:border-gray-500 data-[state=checked]:dark:border-transparent"
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
                      
                      <PuestosFiltrados
                        newTraining={newTraining}
                        setNewTraining={setNewTraining}
                        puestos={puestos}
                      />
                    </>
                  )}
              </div>

              <div className="flex gap-2 pt-4">
                <Button
                  type="button"
                  onClick={handleAddTraining}
                  disabled={!isTrainingValid()}
                  className="bg-primary text-primary-foreground hover:bg-primary/90 cursor-pointer"
                >
                  {editingTrainingIndex !== null ? 'Guardar Cambios' : 'Agregar'}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleCancelAddTraining}
                  className="border-border dark:text-foreground dark:hover:border-foreground/30 cursor-pointer"
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
            disabled={!nombre || !descripcion || detalles.length === 0 || isSubmitting}
            className="bg-primary text-primary-foreground hover:bg-primary/90 cursor-pointer"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Creando...
              </>
            ) : (
              'Crear Programa'
            )}
          </Button>
          <Button type="button" variant="outline" onClick={onCancel} className="border-border bg-transparent dark:text-foreground dark:border-1 dark:hover:border-foreground/30 cursor-pointer">
            Cancelar
          </Button>
        </div>
      </form>
    </div>
  )
}

const PuestosFiltrados = ({ newTraining, setNewTraining, puestos }: PuestosFiltradosProps) => {
  const handleTogglePuesto = (puesto: Puesto) => {
    setNewTraining((prev) => {
      const isSelected = prev.PUESTO_RELACIONES.some((p) => p.ID_PUESTO === puesto.ID_PUESTO);
      
      const newPuestoRelaciones = isSelected
        ? prev.PUESTO_RELACIONES.filter((p) => p.ID_PUESTO !== puesto.ID_PUESTO)
        : [...prev.PUESTO_RELACIONES, puesto];

      return {
        ...prev,
        PUESTO_RELACIONES: newPuestoRelaciones,
      };
    });
  };

  const selectedDeptIds = newTraining.DEPARTAMENTO_RELACIONES.map((d) => d.ID_DEPARTAMENTO);
  
  const puestosFiltrados = puestos.filter((puesto) => 
    puesto.DEPARTAMENTO_ID && selectedDeptIds.includes(puesto.DEPARTAMENTO_ID)
  );

  if (selectedDeptIds.length === 0) {
    return null;
  }
  
  if (puestosFiltrados.length === 0) {
    return (
      <div className="space-y-2 pl-6 pt-2 text-sm text-muted-foreground border-t border-border mt-3">
        No se encontraron puestos relacionados con los departamentos seleccionados.
      </div>
    );
  }

  return (
    <div className="space-y-2 pl-6 pt-4 border-t border-border mt-4">
      <Label>Seleccionar Puestos *</Label>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
        {puestosFiltrados.map((puesto) => (
          <div key={puesto.ID_PUESTO} className="flex items-center space-x-2">
            <Checkbox
              id={`puesto-${puesto.ID_PUESTO}`}
              className="dark:border dark:border-gray-500 data-[state=checked]:dark:border-transparent"
              checked={newTraining.PUESTO_RELACIONES.some(
                (p) => p.ID_PUESTO === puesto.ID_PUESTO,
              )}
              onCheckedChange={() => handleTogglePuesto(puesto)}
            />
            <Label htmlFor={`puesto-${puesto.ID_PUESTO}`} className="cursor-pointer font-normal">
              {puesto.NOMBRE}
            </Label>
          </div>
        ))}
      </div>
    </div>
  );
};
