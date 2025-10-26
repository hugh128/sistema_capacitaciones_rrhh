"use client"

import { useCallback, useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { ArrowLeft, Plus, Pencil, Calendar, Users } from "lucide-react"
import type {
  ProgramaCapacitacion,
  ProgramaDetalleForm,
  CreateProgramaDetalleDto,
  ProgramaDetalle
} from "@/lib/programas_capacitacion/types"
import type { Departamento, Puesto } from "@/lib/types"
import { apiClient } from "@/lib/api-client"

interface ProgramaDetailsProps {
  programa: ProgramaCapacitacion
  departamentos: Departamento[]
  puestos: Puesto[]
  onEdit: (programa: ProgramaCapacitacion) => void
  onBack: () => void
  onUpdate: (programaDetalle: CreateProgramaDetalleDto) => void
}

interface PuestosFiltradosProps {
  newTraining: ProgramaDetalleForm;
  setNewTraining: React.Dispatch<React.SetStateAction<ProgramaDetalleForm>>;
  puestos: Puesto[];
  handleTogglePuesto: (puesto: Puesto) => void;
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

export function ProgramaDetails({ programa, departamentos, puestos, onEdit, onBack, onUpdate }: ProgramaDetailsProps) {
  const [showAddModal, setShowAddModal] = useState(false)
  const [detalles, setDetalles] = useState<ProgramaDetalle[]>(programa.PROGRAMA_DETALLES || []);
  const [newTraining, setNewTraining] = useState<ProgramaDetalleForm>(INITIAL_TRAINING_STATE)

  const getProgramaDetalle = useCallback(async () => {
    try {
      const { data } = await apiClient.get<ProgramaDetalle[]>(`/programa-detalle/${programa.ID_PROGRAMA}`);
      setDetalles(data);
    } catch (err) {
      console.log("Error al cargar el detalle del plan:", err);
    }
  }, [programa.ID_PROGRAMA]);

  useEffect(() => {
    getProgramaDetalle();
  }, [getProgramaDetalle]);

  const handleCloseModal = (open: boolean) => {
    setShowAddModal(open);
    if (!open) { 
      setNewTraining(INITIAL_TRAINING_STATE);
    }
  };

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

  const handleTogglePuesto = (puesto: Puesto) => {
    const exists = newTraining.PUESTO_RELACIONES.some((p) => p.ID_PUESTO === puesto.ID_PUESTO)
    if (exists) {
      setNewTraining({
        ...newTraining,
        PUESTO_RELACIONES: newTraining.PUESTO_RELACIONES.filter(
          (p) => p.ID_PUESTO !== puesto.ID_PUESTO,
        ),
      })
    } else {
      setNewTraining({
        ...newTraining,
        PUESTO_RELACIONES: [...newTraining.PUESTO_RELACIONES, puesto],
      })
    } 
  }

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

  const handleSaveTraining = async () => {
    const newDetalleForApi: CreateProgramaDetalleDto = {
      PROGRAMA_ID: programa.ID_PROGRAMA,
      NOMBRE: newTraining.NOMBRE,
      CATEGORIA_CAPACITACION: newTraining.CATEGORIA_CAPACITACION,
      TIPO_CAPACITACION: newTraining.TIPO_CAPACITACION,
      APLICA_TODOS_COLABORADORES: newTraining.APLICA_TODOS_COLABORADORES,
      APLICA_DIPLOMA: newTraining.APLICA_DIPLOMA,
      MES_PROGRAMADO: newTraining.MES_PROGRAMADO, 
      ESTADO: newTraining.ESTADO,
      
      DEPARTAMENTOS_IDS: newTraining.APLICA_TODOS_COLABORADORES
        ? []
        : newTraining.DEPARTAMENTO_RELACIONES.map((d) => d.ID_DEPARTAMENTO),
      
      PUESTOS_IDS: newTraining.APLICA_TODOS_COLABORADORES 
        ? [] 
        : newTraining.PUESTO_RELACIONES.map((p) => p.ID_PUESTO),
    };

    try {
      await onUpdate(newDetalleForApi);
      await getProgramaDetalle();

      setShowAddModal(false)
      setNewTraining(INITIAL_TRAINING_STATE)
    } catch (error) {
      console.error("Error al agregar capacitación:", error);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex flex-col items-start gap-2">
          <Button variant="ghost" onClick={onBack} className="hover:bg-muted">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Volver
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-foreground">{programa.NOMBRE}</h1>
            <p className="text-muted-foreground mt-1">Detalles del programa de capacitación</p>
          </div>
        </div>
        <Button onClick={() => onEdit(programa)} className="bg-primary text-primary-foreground hover:bg-primary/90 self-end">
          <Pencil className="w-4 h-4 mr-2" />
          Editar Programa
        </Button>
      </div>

      {/* Program Info */}
      <Card className="border-border">
        <CardHeader className="border-b border-border">
          <CardTitle>Información General</CardTitle>
        </CardHeader>
        <CardContent className="pt-2">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Tipo</p>
              <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20 dark:border-blue-700 dark:text-foreground">
                {programa.TIPO}
              </Badge>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-1">Periodo</p>
              <p className="font-semibold text-foreground">{programa.PERIODO}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-1">Fecha de Creación</p>
              <p className="font-semibold text-foreground">{programa.FECHA_CREACION}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-1">Estado</p>
              <Badge
                variant={programa.ESTADO === "ACTIVO" ? "default" : "secondary"}
                className={
                  programa.ESTADO === "ACTIVO"
                    ? "bg-green-500/10 text-green-700 dark:text-green-400 border-green-500/20"
                    : ""
                }
              >
                {programa.ESTADO}
              </Badge>
            </div>
          </div>
          <div className="mt-6">
            <p className="text-sm text-muted-foreground mb-2">Descripción</p>
            <p className="text-foreground">{programa.DESCRIPCION}</p>
          </div>
        </CardContent>
      </Card>

      {/* Training Details */}
      <Card className="border-border">
        <CardHeader className="border-b border-border">
          <div className="flex items-center justify-between">
            <CardTitle>Capacitaciones del Programa ({detalles.length})</CardTitle>
            <Button
              onClick={() => setShowAddModal(true)}
              variant="outline"
              size="sm"
              className="border-primary text-primary hover:bg-primary/10 dark:border-blue-700 dark:text-foreground"
            >
              <Plus className="w-4 h-4 mr-2" />
              Agregar Capacitación
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead>Nombre</TableHead>
                  <TableHead>Categoría</TableHead>
                  <TableHead className="text-center">Tipo</TableHead>
                  <TableHead className="text-center">Mes programado</TableHead>
                  <TableHead>Departamentos</TableHead>
                  <TableHead>Puestos</TableHead>
                  <TableHead>Diploma</TableHead>
                  <TableHead>Estado</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {detalles.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                      No hay capacitaciones en este programa
                    </TableCell>
                  </TableRow>
                ) : (
                  detalles.map((detalle) => (
                    <TableRow key={detalle.ID_DETALLE} className="hover:bg-muted/50">
                      <TableCell className="font-medium">{detalle.NOMBRE}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20 dark:border-blue-700 dark:text-foreground">
                          {detalle.CATEGORIA_CAPACITACION}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge variant="outline" className="bg-blue-500/10 text-blue-600 border-blue-500/20">
                          {detalle.TIPO_CAPACITACION}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2 justify-center">
                          <Calendar className="w-4 h-4 text-muted-foreground" />
                          {detalle.MES_PROGRAMADO}
                        </div>
                      </TableCell>
                      <TableCell>
                        {detalle.APLICA_TODOS_COLABORADORES ? (
                          <Badge variant="outline" className="bg-purple-500/10 text-purple-600 border-purple-500/20">
                            <Users className="w-3 h-3 mr-1" />
                            Todos
                          </Badge>
                        ) : (
                          <div className="flex flex-wrap gap-1">
                            {detalle.DEPARTAMENTO_RELACIONES.map((dept) => (
                              <Badge key={dept.ID_DEPARTAMENTO} variant="secondary" className="text-xs">
                                {dept.CODIGO}
                              </Badge>
                            ))}
                          </div>
                        )}
                      </TableCell>

                      <TableCell>
                        {detalle.APLICA_TODOS_COLABORADORES ? (
                          <Badge variant="outline" className="bg-purple-500/10 text-purple-600 border-purple-500/20">
                            <Users className="w-3 h-3 mr-1" />
                            Todos
                          </Badge>
                        ) : (
                          <div className="flex flex-wrap gap-1 max-w-2xs">
                            {detalle.PUESTO_RELACIONES.map((puesto) => (
                              <Badge key={puesto.ID_PUESTO} variant="secondary" className="text-xs bg-cyan-100 text-cyan-800 dark:bg-cyan-900 dark:text-cyan-100">
                                {puesto.NOMBRE}
                              </Badge>
                            ))}
                          </div>
                        )}
                      </TableCell>

                      <TableCell>
                        {detalle.APLICA_DIPLOMA ? (
                          <Badge variant="outline">🎓 Sí</Badge>
                        ) : (
                          <span className="text-muted-foreground text-sm">No</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={detalle.ESTADO === "ACTIVO" ? "default" : "secondary"}
                          className={
                            detalle.ESTADO === "ACTIVO"
                              ? "bg-green-500/10 text-green-700 dark:text-green-400 border-green-500/20"
                              : ""
                          }
                        >
                          {detalle.ESTADO}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Add Training Modal */}
      <Dialog
        open={showAddModal}
        onOpenChange={handleCloseModal}
      >
        <DialogContent className="md:max-w-2xl max-h-[90vh] overflow-y-auto bg-card border-border">
          <DialogHeader>
            <DialogTitle className="text-foreground">Agregar Nueva Capacitación</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="modal-nombre">Nombre de la Capacitación <span className="text-destructive">*</span></Label>
              <Input
                id="modal-nombre"
                value={newTraining.NOMBRE}
                onChange={(e) => setNewTraining({ ...newTraining, NOMBRE: e.target.value })}
                placeholder="Ej: Capacitación de Seguridad Industrial"
                className="bg-background"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="modal-categoria">Categoría <span className="text-destructive">*</span></Label>
                <Select
                  value={newTraining.CATEGORIA_CAPACITACION}
                  onValueChange={(value: "GENERAL" | "ESPECIFICA" | "CONTINUA") =>
                    setNewTraining({ ...newTraining, CATEGORIA_CAPACITACION: value })
                  }
                >
                  <SelectTrigger className="bg-background w-full">
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
                <Label htmlFor="modal-tipo">Tipo <span className="text-destructive">*</span></Label>
                <Select
                  value={newTraining.TIPO_CAPACITACION}
                  onValueChange={(value: "INTERNA" | "EXTERNA") =>
                    setNewTraining({ ...newTraining, TIPO_CAPACITACION: value })
                  }
                >
                  <SelectTrigger className="bg-background w-full">
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
                <Label htmlFor="modal-estado">Estado *</Label>
                <Select
                  value={newTraining.ESTADO}
                  onValueChange={(value) => setNewTraining({ ...newTraining, ESTADO: value })}
                >
                  <SelectTrigger className="bg-background w-full">
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
                id="modal-diploma"
                checked={newTraining.APLICA_DIPLOMA}
                onCheckedChange={(checked) => setNewTraining({ ...newTraining, APLICA_DIPLOMA: checked as boolean })}
              />
              <Label htmlFor="modal-diploma" className="cursor-pointer">
                Aplica Diploma
              </Label>
            </div>

            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="modal-todos-colab"
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
                <Label htmlFor="modal-todos-colab" className="cursor-pointer">
                  Aplica a todos los colaboradores
                </Label>
              </div>

              {!newTraining.APLICA_TODOS_COLABORADORES && (
                <>
                  <div className="space-y-2 pl-6">
                    <Label>Seleccionar Departamentos <span className="text-destructive">*</span></Label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {departamentos.map((dept) => (
                        <div key={dept.ID_DEPARTAMENTO} className="flex items-center space-x-2">
                          <Checkbox
                            id={`modal-dept-${dept.ID_DEPARTAMENTO}`}
                            checked={newTraining.DEPARTAMENTO_RELACIONES.some(
                              (d) => d.ID_DEPARTAMENTO === dept.ID_DEPARTAMENTO,
                            )}
                            onCheckedChange={() => handleToggleDepartamento(dept)}
                          />
                          <Label htmlFor={`modal-dept-${dept.ID_DEPARTAMENTO}`} className="cursor-pointer font-normal">
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
                    handleTogglePuesto={handleTogglePuesto}
                  />
                </>
              )}
            </div>

            <div className="flex gap-2 pt-4 justify-end">
              <Button
                onClick={handleSaveTraining}
                disabled={!isTrainingValid()}
                className="bg-primary text-primary-foreground hover:bg-primary/90"
              >
                Agregar Capacitación
              </Button>
              <Button
                variant="outline"
                onClick={() => handleCloseModal(false)}
                className="border-border"
              >
                Cancelar
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

const PuestosFiltrados = ({ newTraining, puestos, handleTogglePuesto }: PuestosFiltradosProps) => {
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
      <Label>Seleccionar Puestos <span className="text-destructive">*</span></Label>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
        {puestosFiltrados.map((puesto) => (
          <div key={puesto.ID_PUESTO} className="flex items-center space-x-2">
            <Checkbox
              id={`modal-puesto-${puesto.ID_PUESTO}`}
              checked={newTraining.PUESTO_RELACIONES.some(
                (p) => p.ID_PUESTO === puesto.ID_PUESTO,
              )}
              onCheckedChange={() => handleTogglePuesto(puesto)}
            />
            <Label htmlFor={`modal-puesto-${puesto.ID_PUESTO}`} className="cursor-pointer font-normal">
              {puesto.NOMBRE}
            </Label>
          </div>
        ))}
      </div>
    </div>
  );
};
