"use client"

import { useState } from "react"
import { ArrowLeft, Plus, Trash2, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import type { PlanCapacitacion } from "@/lib/planes_programas/types"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Departamento, Puesto } from "@/lib/types"
import { CodigoPadre } from "@/lib/codigos/types"

interface EditPlanProps {
  plan: PlanCapacitacion
  onBack: () => void
  onSave: (plan: PlanCapacitacion) => void
  departamentosDisponibles: Departamento[]
  documentosList: CodigoPadre[]
  puestosDisponibles: Puesto[]
}

type TrainingStatus = "BORRADOR" | "ACTIVO" | "INACTIVO" | "VIGENTE";

type planesCapacitacionPayload = Partial<PlanCapacitacion>

export default function EditPlan({ plan, onBack, onSave, departamentosDisponibles, documentosList, puestosDisponibles }: EditPlanProps) {
  const [planName, setPlanName] = useState(plan.NOMBRE)
  const [planType, setPlanType] = useState(plan.TIPO)
  const [planStatus, setPlanStatus] = useState(plan.ESTADO)
  const [planDescription, setPlanDescription] = useState(plan.DESCRIPCION)

  const [selectedDepartmentId, setSelectedDepartmentId] = useState(plan.DEPARTAMENTO_ID ? String(plan.DEPARTAMENTO_ID) : "")
  const [appliesToAllPositions, setAppliesToAllPositions] = useState(plan.APLICA_TODOS_PUESTOS_DEP)

  const [applicablePositions, setApplicablePositions] = useState<Puesto[]>(plan.PLANES_PUESTOS || [])

  const [trainings, setTrainings] = useState<CodigoPadre[]>(plan.DOCUMENTOS_PLANES || [])
  const [isSaving, setIsSaving] = useState(false)

  const [showAddTrainingModal, setShowAddTrainingModal] = useState(false)
  const [selectedDocumentIds, setSelectedDocumentIds] = useState<string[]>([])
  const [showSuccessMessage, setShowSuccessMessage] = useState(false)

  const planCode = plan.ID_PLAN.toString()

  const togglePosition = (position: Puesto) => {
    setApplicablePositions((prev) => {
      const isSelected = prev.some(p => p.ID_PUESTO === position.ID_PUESTO);
      if (isSelected) {
        return prev.filter((p) => p.ID_PUESTO !== position.ID_PUESTO);
      } else {
        return [...prev, position];
      }
    });
  };

  const removeTraining = (id: number) => {
    setTrainings(trainings.filter((t) => t.ID_DOCUMENTO !== id))
  }

  const toggleTrainingSelection = (documentId: number) => {
    const idString = String(documentId);
    setSelectedDocumentIds((prev) =>
      prev.includes(idString) ? prev.filter((id) => id !== idString) : [...prev, idString],
    )
  }

  const handleAddTrainings = async () => {
    setIsSaving(true)
    await new Promise((resolve) => setTimeout(resolve, 500))

    const newTrainings: CodigoPadre[] = selectedDocumentIds
      .map((idString) => {
        return documentosList.find((t) => t.ID_DOCUMENTO === Number(idString));
      })
      .filter((doc): doc is CodigoPadre => doc !== undefined);

    setTrainings((prev) => {
      const existingIds = new Set(prev.map(t => t.ID_DOCUMENTO));
      const uniqueNewTrainings = newTrainings.filter(nt => !existingIds.has(nt.ID_DOCUMENTO));
      return [...prev, ...uniqueNewTrainings];
    })

    setIsSaving(false)
    setShowAddTrainingModal(false)
    setSelectedDocumentIds([])

    setShowSuccessMessage(true)
    setTimeout(() => setShowSuccessMessage(false), 3000)
  }

  const handleSave = async () => {
    setIsSaving(true)
    await new Promise((resolve) => setTimeout(resolve, 1000))

    const updatedPlan: PlanCapacitacion = {
      ...plan,
      NOMBRE: planName,
      TIPO: planType,
      ESTADO: planStatus,
      DESCRIPCION: planDescription,
      DEPARTAMENTO_ID: Number(selectedDepartmentId),
      APLICA_TODOS_PUESTOS_DEP: appliesToAllPositions,
      
      PLANES_PUESTOS: applicablePositions,
      DOCUMENTOS_PLANES: trainings,
      
      DEPARTAMENTO: departamentosDisponibles.find(d => d.ID_DEPARTAMENTO === Number(selectedDepartmentId)) || plan.DEPARTAMENTO, 
    }

    onSave(updatedPlan)
    setIsSaving(false)
  }

  return (
    <div className="h-full flex flex-col bg-card rounded-lg p-6 overflow-y-auto">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Button onClick={onBack} variant="ghost" size="sm">
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-semibold text-card-foreground">Editar Plan de Capacitación</h1>
          <p className="text-sm text-muted-foreground">Modifica la información del plan y sus capacitaciones</p>
        </div>
      </div>

      <div className="space-y-6">
        <div className="border border-border rounded-lg p-6 bg-card">
          <h2 className="text-lg font-semibold text-card-foreground mb-4">Información General</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="planName" className="mb-2">
                Nombre del Plan <span className="text-destructive">*</span>
              </Label>
              <Input
                id="planName"
                value={planName}
                onChange={(e) => setPlanName(e.target.value)}
                placeholder="Ej: Inducción General"
              />
            </div>
            <div>
              <Label htmlFor="planType" className="mb-2">
                Tipo <span className="text-destructive">*</span>
              </Label>
              <Select
                value={planType}
                onValueChange={(value) => setPlanType(value as "Induccion" | "Individual")}
              >
                <SelectTrigger id="planType" className="w-full">
                  <SelectValue placeholder="Selecciona un tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Induccion">Induccion</SelectItem>
                  <SelectItem value="Individual">Individual</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="planStatus" className="mb-2">
                Estado <span className="text-destructive">*</span>
              </Label>
              <Select
                value={planStatus}
                onValueChange={(value) => setPlanStatus(value as TrainingStatus)}
              >
                <SelectTrigger id="planStatus" className="w-full">
                  <SelectValue placeholder="Selecciona un estado" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Activo">Activo</SelectItem>
                  <SelectItem value="Borrador">Borrador</SelectItem>
                  <SelectItem value="Inactivo">Inactivo</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="planCode" className="mb-2">Código</Label>
              <Input id="planCode" value={planCode} onChange={(e) => setPlanCode(e.target.value)} />
            </div>
          </div>
          <div className="mt-4">
            <Label htmlFor="planDescription" className="mb-2">Descripción</Label>
            <Textarea
              id="planDescription"
              value={planDescription}
              onChange={(e) => setPlanDescription(e.target.value)}
              placeholder="Describe el objetivo y alcance del plan..."
              rows={4}
            />
          </div>

          <div className="mt-4">
            <Label htmlFor="department" className="mb-2">
              Departamento Aplicable <span className="text-destructive">*</span>
            </Label>
            <Select
              value={selectedDepartment}
              onValueChange={setSelectedDepartment}
            >
              <SelectTrigger id="department" className="w-full">
                <SelectValue placeholder="Seleccionar departamento" />
              </SelectTrigger>
              <SelectContent>
                {AVAILABLE_DEPARTMENTS.map((dept) => (
                  <SelectItem key={dept} value={dept}>
                    {dept}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="mt-4 space-y-3">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="allPositions"
                checked={appliesToAllPositions}
                onCheckedChange={(checked) => setAppliesToAllPositions(checked as boolean)}
                className="mb-2"
              />
              <Label htmlFor="allPositions" className="text-sm font-normal cursor-pointer">
                Aplica a todos los puestos del departamento
              </Label>
            </div>

            {!appliesToAllPositions && (
              <div>
                <Label className="mb-2 block">Seleccionar Puestos Específicos</Label>
                <div className="flex flex-wrap gap-2 mb-3">
                  {applicablePositions.map((puesto) => (
                    <span
                      key={puesto.ID_PUESTO}
                      className="inline-flex items-center gap-1 px-3 py-1 bg-primary text-primary-foreground rounded-full text-sm"
                    >
                      {puesto.NOMBRE}
                      <button
                        onClick={() => togglePosition(puesto)} 
                        className="hover:bg-primary-foreground/20 rounded-full p-0.5"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>

                <div className="flex flex-wrap gap-2">
                  {puestosDisponibles
                    .filter((puesto) => !applicablePositions.some(ap => ap.ID_PUESTO === puesto.ID_PUESTO))
                    .map((puesto) => (
                      <button
                        key={puesto.ID_PUESTO}
                        onClick={() => togglePosition(puesto)} 
                        className="px-3 py-1 border border-border text-foreground rounded-full text-sm hover:bg-muted transition-colors"
                      >
                        + {puesto.NOMBRE}
                      </button>
                    ))}
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="border border-border rounded-lg p-6 bg-card">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg font-semibold text-card-foreground">Capacitaciones Predefinidas</h2>
              <p className="text-xs text-muted-foreground mt-1">Agrega o elimina capacitaciones de este plan</p>
            </div>
            <Button 
                onClick={() => setShowAddTrainingModal(true)}
                size="sm" 
                className="bg-accent hover:bg-accent/90 text-accent-foreground"
            >
              <Plus className="w-4 h-4 mr-2" />
              Añadir Capacitación Existente
            </Button>
          </div>
          
          <table className="w-full">
            <thead className="bg-muted/30">
              <tr>
                <th className="text-left px-6 py-3 text-sm font-semibold text-foreground">Nombre</th>
                <th className="text-left px-6 py-3 text-sm font-semibold text-foreground">Capacitador</th>
                <th className="text-left px-6 py-3 text-sm font-semibold text-foreground">Estado</th>
                <th className="text-left px-6 py-3 text-sm font-semibold text-foreground">Examen/Diploma</th>
                <th className="text-left px-6 py-3 text-sm font-semibold text-foreground">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {trainings.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-6 text-muted-foreground">
                    Aún no hay capacitaciones en este plan. Usa el botón añadir Capacitación Existente para empezar.
                  </td>
                </tr>
              ) : (
                trainings.map((training) => (
                  <tr key={training.ID_DOCUMENTO} className="border-b border-border hover:bg-muted/30"> 
                    <td className="px-6 py-3 text-sm font-medium text-foreground">
                      {training.NOMBRE_DOCUMENTO}
                      <p className="text-xs text-muted-foreground truncate max-w-xs">{training.CODIGO}</p>
                    </td>
                    <td className="px-6 py-3 text-sm text-foreground">{training.TIPO_DOCUMENTO}</td> 
                    <td className="px-6 py-3">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium ${
                          training.ESTATUS === "VIGENTE"
                            ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                            : "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400"
                        }`}
                      >
                        {training.ESTATUS}
                      </span>
                    </td>
                    <td className="px-6 py-3 text-sm text-foreground">— / —</td> 
                    <td className="px-6 py-3">
                      <Button
                        onClick={() => removeTraining(training.ID_DOCUMENTO)}
                        variant="ghost"
                        size="sm"
                        className="text-destructive hover:bg-destructive/10"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {showAddTrainingModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-card rounded-lg w-full max-w-3xl max-h-[80vh] flex flex-col border border-border">
              <div className="flex items-center justify-between p-6 border-b border-border">
                <div>
                  <h2 className="text-xl font-semibold text-foreground">Añadir Capacitaciones Existentes</h2>
                  <p className="text-sm text-muted-foreground mt-1">
                    Selecciona las capacitaciones que deseas agregar a este plan
                  </p>
                </div>
                <Button
                  onClick={() => {
                    setShowAddTrainingModal(false)
                    setSelectedTrainings([])
                  }}
                  variant="ghost"
                  size="sm"
                >
                  <X className="w-5 h-5" />
                </Button>
              </div>

              <div className="flex-1 overflow-y-auto p-6">
                <div className="space-y-3">
                  {documentosList
                    .filter(doc => !trainings.some(t => t.ID_DOCUMENTO === doc.ID_DOCUMENTO))
                    .map((training) => (
                      <div
                        key={training.ID_DOCUMENTO}
                        onClick={() => toggleTrainingSelection(training.ID_DOCUMENTO)}
                        className={`border rounded-lg p-4 cursor-pointer transition-all ${
                          selectedDocumentIds.includes(String(training.ID_DOCUMENTO))
                            ? "border-primary bg-primary/10"
                            : "border-border hover:border-primary/50 hover:bg-muted/50"
                        }`}
                      >
                      <div className="flex items-start gap-3">
                        <input
                          type="checkbox"
                          checked={selectedDocumentIds.includes(String(training.ID_DOCUMENTO))}
                          onChange={() => {}}
                          className="mt-1 w-4 h-4 text-primary rounded border-border focus:ring-primary"
                        />
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <h3 className="font-semibold text-foreground">{training.NOMBRE_DOCUMENTO}</h3> {/* 🚨 Usar NOMBRE_DOCUMENTO */}
                            <span
                              className={`px-2 py-1 rounded text-xs ${
                                training.ESTATUS === "VIGENTE" // 🚨 Usar ESTATUS de la API
                                  ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                                  : "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400"
                              }`}
                            >
                              {training.ESTATUS}
                            </span>
                          </div>
                          <p className="text-sm text-muted-foreground mt-1">{training.CODIGO}</p> {/* 🚨 Usar CODIGO */}
                          <p className="text-xs text-muted-foreground mt-2">Tipo: {training.TIPO_DOCUMENTO}</p> {/* 🚨 Usar TIPO_DOCUMENTO */}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-between p-6 border-t border-border">
                <p className="text-sm text-muted-foreground">
                  {selectedTrainings.length} capacitación{selectedTrainings.length !== 1 ? "es" : ""} seleccionada
                  {selectedTrainings.length !== 1 ? "s" : ""}
                </p>
                <div className="flex gap-3">
                  <Button
                    onClick={() => {
                      setShowAddTrainingModal(false)
                      setSelectedTrainings([])
                    }}
                    variant="outline"
                  >
                    Cancelar
                  </Button>
                  <Button
                    onClick={handleAddTrainings}
                    disabled={selectedTrainings.length === 0 || isSaving}
                    className="bg-accent hover:bg-accent/90 text-accent-foreground disabled:opacity-50"
                  >
                    {isSaving
                      ? "Guardando..."
                      : `Añadir ${selectedTrainings.length > 0 ? `(${selectedTrainings.length})` : ""}`}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="flex gap-3 justify-end">
          <Button onClick={onBack} variant="outline">
            Cancelar
          </Button>
          <Button
            onClick={handleSave}
            disabled={isSaving}
            className=""
          >
            {isSaving ? "Guardando..." : "Guardar Cambios"}
          </Button>
        </div>
      </div>
    </div>
  )
}
