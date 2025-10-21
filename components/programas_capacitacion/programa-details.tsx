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
import type { Departamento } from "@/lib/types"
import { apiClient } from "@/lib/api-client"

interface ProgramaDetailsProps {
  programa: ProgramaCapacitacion
  departamentos: Departamento[]
  onEdit: (programa: ProgramaCapacitacion) => void
  onBack: () => void
  onUpdate: (programaDetalle: CreateProgramaDetalleDto) => void
}

export function ProgramaDetails({ programa, departamentos, onEdit, onBack, onUpdate }: ProgramaDetailsProps) {
  const [showAddModal, setShowAddModal] = useState(false)
  const [detalles, setDetalles] = useState<ProgramaDetalle[]>(programa.PROGRAMA_DETALLES || []);
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

  const handleSaveTraining = async () => {
    const newDetalleForApi = {
      PROGRAMA_ID: programa.ID_PROGRAMA,
      NOMBRE: newTraining.NOMBRE,
      CATEGORIA_CAPACITACION: newTraining.CATEGORIA_CAPACITACION,
      TIPO_CAPACITACION: newTraining.TIPO_CAPACITACION,
      APLICA_TODOS_DEPARTAMENTOS: newTraining.APLICA_TODOS_DEPARTAMENTOS,
      APLICA_DIPLOMA: newTraining.APLICA_DIPLOMA,
      FECHA_PROGRAMADA: newTraining.FECHA_PROGRAMADA,
      ESTADO: newTraining.ESTADO,
      DEPARTAMENTOS_IDS: newTraining.APLICA_TODOS_DEPARTAMENTOS
        ? []
        : newTraining.DEPARTAMENTO_RELACIONES.map((d) => d.ID_DEPARTAMENTO),
    };

    try {
      await onUpdate(newDetalleForApi);
      await getProgramaDetalle();

      setShowAddModal(false)
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
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Tipo</p>
              <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">
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
              className="border-primary text-primary hover:bg-primary/10"
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
                  <TableHead>Tipo</TableHead>
                  <TableHead>Fecha Programada</TableHead>
                  <TableHead>Departamentos</TableHead>
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
                        <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">
                          {detalle.CATEGORIA_CAPACITACION}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="bg-blue-500/10 text-blue-600 border-blue-500/20">
                          {detalle.TIPO_CAPACITACION}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-muted-foreground" />
                          {detalle.FECHA_PROGRAMADA}
                        </div>
                      </TableCell>
                      <TableCell>
                        {detalle.APLICA_TODOS_DEPARTAMENTOS ? (
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
      <Dialog open={showAddModal} onOpenChange={setShowAddModal}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-card border-border">
          <DialogHeader>
            <DialogTitle className="text-foreground">Agregar Nueva Capacitación</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="modal-nombre">Nombre de la Capacitación *</Label>
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
                <Label htmlFor="modal-categoria">Categoría *</Label>
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
                <Label htmlFor="modal-tipo">Tipo *</Label>
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
                <Label htmlFor="modal-fecha">Fecha Programada *</Label>
                <Input
                  id="modal-fecha"
                  type="date"
                  value={newTraining.FECHA_PROGRAMADA}
                  onChange={(e) => setNewTraining({ ...newTraining, FECHA_PROGRAMADA: e.target.value })}
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
                  id="modal-todos-dept"
                  checked={newTraining.APLICA_TODOS_DEPARTAMENTOS}
                  onCheckedChange={(checked) =>
                    setNewTraining({
                      ...newTraining,
                      APLICA_TODOS_DEPARTAMENTOS: checked as boolean,
                      DEPARTAMENTO_RELACIONES: checked ? [] : newTraining.DEPARTAMENTO_RELACIONES,
                    })
                  }
                />
                <Label htmlFor="modal-todos-dept" className="cursor-pointer">
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
              )}
            </div>

            <div className="flex gap-2 pt-4 justify-end">
              <Button
                onClick={handleSaveTraining}
                disabled={!newTraining.NOMBRE || !newTraining.FECHA_PROGRAMADA}
                className="bg-primary text-primary-foreground hover:bg-primary/90"
              >
                Agregar Capacitación
              </Button>
              <Button variant="outline" onClick={() => setShowAddModal(false)} className="border-border">
                Cancelar
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
