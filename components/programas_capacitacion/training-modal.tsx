"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import type {
  ProgramaCapacitacion,
  ProgramaDetalleForm,
  CreateProgramaDetalleDto,
  ProgramaDetalle
} from "@/lib/programas_capacitacion/types"
import type { Departamento, Puesto } from "@/lib/types"

interface TrainingModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  programa: ProgramaCapacitacion
  departamentos: Departamento[]
  puestos: Puesto[]
  onSave: (data: CreateProgramaDetalleDto) => Promise<void>
  editMode?: boolean
  initialData?: ProgramaDetalle | null
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
}

export function TrainingModal({
  open,
  onOpenChange,
  programa,
  departamentos,
  puestos,
  onSave,
  editMode = false,
  initialData = null,
}: TrainingModalProps) {
  const [newTraining, setNewTraining] = useState<ProgramaDetalleForm>(INITIAL_TRAINING_STATE)
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    if (open && editMode && initialData) {
      setNewTraining({
        NOMBRE: initialData.NOMBRE,
        CATEGORIA_CAPACITACION: initialData.CATEGORIA_CAPACITACION,
        TIPO_CAPACITACION: initialData.TIPO_CAPACITACION,
        APLICA_TODOS_COLABORADORES: initialData.APLICA_TODOS_COLABORADORES,
        APLICA_DIPLOMA: initialData.APLICA_DIPLOMA,
        MES_PROGRAMADO: initialData.MES_PROGRAMADO,
        ESTADO: initialData.ESTADO,
        DEPARTAMENTO_RELACIONES: initialData.DEPARTAMENTO_RELACIONES || [],
        PUESTO_RELACIONES: initialData.PUESTO_RELACIONES || [],
      })
    } else if (open && !editMode) {
      setNewTraining(INITIAL_TRAINING_STATE)
    }
  }, [open, editMode, initialData])

  const handleCloseModal = () => {
    onOpenChange(false)
    if (!editMode) {
      setNewTraining(INITIAL_TRAINING_STATE)
    }
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
    setIsSaving(true)
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
    }

    try {
      await onSave(newDetalleForApi)
      handleCloseModal()
    } catch (error) {
      console.error("Error al guardar capacitación:", error)
    } finally {
      setIsSaving(false)
    }
  }

  const selectedDeptIds = newTraining.DEPARTAMENTO_RELACIONES.map((d) => d.ID_DEPARTAMENTO)
  const puestosFiltrados = puestos.filter((puesto) =>
    puesto.DEPARTAMENTO_ID && selectedDeptIds.includes(puesto.DEPARTAMENTO_ID)
  )

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="md:max-w-2xl max-h-[90vh] overflow-y-auto bg-card border-border">
        <DialogHeader>
          <DialogTitle className="text-foreground text-xl">
            {editMode ? "Editar Capacitación" : "Agregar Nueva Capacitación"}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-5 py-4">
          <div className="space-y-2">
            <Label htmlFor="modal-nombre" className="text-sm font-medium">
              Nombre de la Capacitación <span className="text-destructive">*</span>
            </Label>
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
              <Label htmlFor="modal-categoria" className="text-sm font-medium">
                Categoría <span className="text-destructive">*</span>
              </Label>
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
              <Label htmlFor="modal-tipo" className="text-sm font-medium">
                Tipo <span className="text-destructive">*</span>
              </Label>
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
              <Label htmlFor="modal-fecha" className="text-sm font-medium">
                Mes Programado <span className="text-destructive">*</span>
              </Label>
              <Input
                id="modal-fecha"
                type="number"
                value={newTraining.MES_PROGRAMADO}
                onChange={(e) => setNewTraining({ ...newTraining, MES_PROGRAMADO: +e.target.value })}
                min={1}
                max={12}
                className="bg-background"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="modal-estado" className="text-sm font-medium">
                Estado <span className="text-destructive">*</span>
              </Label>
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

          <div className="flex items-center space-x-2 pt-2">
            <Checkbox
              id="modal-diploma"
              checked={newTraining.APLICA_DIPLOMA}
              onCheckedChange={(checked) => setNewTraining({ ...newTraining, APLICA_DIPLOMA: checked as boolean })}
            />
            <Label htmlFor="modal-diploma" className="cursor-pointer font-medium">
              Aplica Diploma
            </Label>
          </div>

          <div className="space-y-4 pt-2 border-t border-border">
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
              <Label htmlFor="modal-todos-colab" className="cursor-pointer font-medium">
                Aplica a todos los colaboradores
              </Label>
            </div>

            {!newTraining.APLICA_TODOS_COLABORADORES && (
              <div className="space-y-4 pl-6">
                <div className="space-y-3">
                  <Label className="text-sm font-medium">
                    Seleccionar Departamentos <span className="text-destructive">*</span>
                  </Label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 p-4 border border-border rounded-lg bg-muted/30">
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

                {selectedDeptIds.length > 0 && (
                  <div className="space-y-3">
                    <Label className="text-sm font-medium">
                      Seleccionar Puestos <span className="text-destructive">*</span>
                    </Label>
                    {puestosFiltrados.length === 0 ? (
                      <div className="p-4 border border-border rounded-lg bg-muted/30 text-sm text-muted-foreground text-center">
                        No se encontraron puestos para los departamentos seleccionados
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 p-4 border border-border rounded-lg bg-muted/30">
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
                    )}
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="flex gap-3 pt-4 justify-end border-t border-border">
            <Button
              variant="outline"
              onClick={handleCloseModal}
              disabled={isSaving}
              className="border-border dark:hover:border-foreground/50 dark:hover:text-foreground cursor-pointer"
            >
              Cancelar
            </Button>
            <Button
              onClick={handleSaveTraining}
              disabled={!isTrainingValid() || isSaving}
              className="bg-primary text-primary-foreground hover:bg-primary/90 cursor-pointer"
            >
              {isSaving ? "Guardando..." : editMode ? "Guardar Cambios" : "Agregar Capacitación"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
