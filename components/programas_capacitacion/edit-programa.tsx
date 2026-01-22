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
import { ArrowLeft, Plus, Trash2, Users } from "lucide-react"
import type {
  ProgramaCapacitacion,
  ProgramaDetalle,
  ProgramaDetalleBase,
  ProgramaDetalleForm
} from "@/lib/programas_capacitacion/types"
import type { Departamento, Puesto } from "@/lib/types"

interface EditProgramaProps {
  programa: ProgramaCapacitacion
  departamentos: Departamento[]
  puestos: Puesto[]
  onSave: (programa: ProgramaCapacitacion, idPrograma: number) => void
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

export function EditPrograma({ programa, departamentos, puestos, onSave, onCancel }: EditProgramaProps) {
  const [nombre, setNombre] = useState(programa.NOMBRE)
  const [descripcion, setDescripcion] = useState(programa.DESCRIPCION)
  const [tipo, setTipo] = useState(programa.TIPO)
  const [periodo, setPeriodo] = useState(programa.PERIODO)
  const [estado, setEstado] = useState(programa.ESTADO)
  const [detalles, setDetalles] = useState<ProgramaDetalle[]>(programa.PROGRAMA_DETALLES)

  const [showAddTraining, setShowAddTraining] = useState(false)
  const [newTraining, setNewTraining] = useState<ProgramaDetalleForm>(INITIAL_TRAINING_STATE)

  const isTrainingValid = () => {
    if (!newTraining.NOMBRE || !newTraining.MES_PROGRAMADO) {
      return false
    }

    if (!newTraining.APLICA_TODOS_COLABORADORES) {
      if (newTraining.DEPARTAMENTO_RELACIONES.length === 0) {
        return false
      }
      return newTraining.PUESTO_RELACIONES.length > 0
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
    setNewTraining(INITIAL_TRAINING_STATE);
  };

  const handleAddTraining = () => {
    if (!isTrainingValid()) return;

    const newTrainingIsGlobal = newTraining.APLICA_TODOS_COLABORADORES;
    const newDetalleBase: ProgramaDetalleBase = newTraining;
    
    const newDetalle: ProgramaDetalle = {
      ...newDetalleBase, 
      
      ID_DETALLE: Date.now() + Math.random(), 
      PROGRAMA_ID: programa.ID_PROGRAMA,

      DEPARTAMENTO_RELACIONES: newTrainingIsGlobal 
        ? [] 
        : newDetalleBase.DEPARTAMENTO_RELACIONES,
      
      PUESTO_RELACIONES: newTrainingIsGlobal 
        ? [] 
        : newDetalleBase.PUESTO_RELACIONES,
    };

    setDetalles((prev) => [...prev, newDetalle]);
    setNewTraining(INITIAL_TRAINING_STATE);
    setShowAddTraining(false);
  };

  const handleRemoveTraining = (id: number) => {
    setDetalles(detalles.filter((d) => d.ID_DETALLE !== id))
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const detallesParaGuardar = detalles.map((d) => {
      const isGlobal = d.APLICA_TODOS_COLABORADORES;

      return {
        ...d,
        DEPARTAMENTOS_IDS: isGlobal 
          ? [] 
          : d.DEPARTAMENTO_RELACIONES.map((dep) => dep.ID_DEPARTAMENTO),
        
        PUESTOS_IDS: isGlobal 
          ? [] 
          : d.PUESTO_RELACIONES.map((pue) => pue.ID_PUESTO),
      } as ProgramaDetalle;
    });

    const updatedPrograma: ProgramaCapacitacion = {
      ...programa,
      NOMBRE: nombre,
      DESCRIPCION: descripcion,
      TIPO: tipo,
      PERIODO: periodo,
      ESTADO: estado,
      PROGRAMA_DETALLES: detallesParaGuardar,
    };

    onSave(updatedPrograma, programa.ID_PROGRAMA);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col items-start gap-2">
        <Button variant="ghost" onClick={onCancel} className="hover:bg-muted">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Volver
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-foreground">Editar Programa de Capacitación</h1>
          <p className="text-muted-foreground mt-1">Modifica la información del programa y sus capacitaciones</p>
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
                <Label htmlFor="periodo">Periodo (Año) *</Label>
                <Input
                  id="periodo"
                  type="number"
                  value={periodo}
                  onChange={(e) => setPeriodo(Number(e.target.value))}
                  min={2020}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="estado">Estado *</Label>
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
                {detalles.map((detalle) => (
                  <div
                    key={detalle.ID_DETALLE}
                    className="flex items-start gap-3 p-4 border border-border rounded-lg bg-muted/30"
                  >
                    <div className="flex-1 space-y-2">
                      <div className="flex items-start justify-between">
                        <h4 className="font-semibold text-foreground">{detalle.NOMBRE}</h4>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemoveTraining(detalle.ID_DETALLE)}
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
                        <Badge variant="outline">📅 {detalle.MES_PROGRAMADO}</Badge>
                        {detalle.APLICA_DIPLOMA && <Badge variant="outline">🎓 Diploma</Badge>}
                      </div>

                      <div className="text-sm text-muted-foreground">
                        {detalle.APLICA_TODOS_COLABORADORES ? (
                          <>
                            <Badge variant="outline" className="bg-purple-500/10 text-purple-600 border-purple-500/20">
                              <Users className="" />
                            </Badge>
                            <span> Aplica a todos los colaboradores</span>
                          </>
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
                <Label htmlFor="modal-fecha">Mes Programado <span className="text-destructive">*</span></Label>
                <Input
                  id="modal-fecha"
                  type="number"
                  value={newTraining.MES_PROGRAMADO}
                  onChange={(e) => setNewTraining({ ...newTraining, MES_PROGRAMADO: +e.target.value })}
                  min={1} max={12}
                  className="bg-background"
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
                />
                <Label htmlFor="training-diploma" className="cursor-pointer">
                  Aplica Diploma
                </Label>
              </div>

              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="training-todos-dept"
                    checked={newTraining.APLICA_TODOS_COLABORADORES}
                    onCheckedChange={(checked) =>
                      setNewTraining({
                        ...newTraining,
                        APLICA_TODOS_COLABORADORES: checked as boolean,
                        DEPARTAMENTO_RELACIONES: checked ? [] : newTraining.DEPARTAMENTO_RELACIONES,
                        PUESTO_RELACIONES: checked ? [] : newTraining.PUESTO_RELACIONES,
                      })
                    }
                  />
                  <Label htmlFor="training-todos-dept" className="cursor-pointer">
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
                  className="bg-primary text-primary-foreground hover:bg-primary/90"
                >
                  Agregar
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleCancelAddTraining}
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
            className="bg-primary text-primary-foreground hover:bg-primary/90 cursor-pointer"
          >
            Guardar Cambios
          </Button>
          <Button type="button" variant="outline" onClick={onCancel} className="border-border bg-transparent dark:hover:border-foreground/50 dark:hover:text-foreground cursor-pointer">
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