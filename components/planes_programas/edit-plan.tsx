"use client"

import { useState, useMemo, useCallback, useEffect, memo } from "react"
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
import { AddDocumentosModal } from "./add-document-modal"

interface EditPlanProps {
  plan: PlanCapacitacion
  onBack: () => void
  onUpdate: (plan: UpdatePlanPayload, idPlan: number) => void
  departamentosDisponibles: Departamento[]
  documentosList: CodigoPadre[]
  puestosDisponibles: Puesto[]
}

interface UpdatePlanPayload {
  NOMBRE: string
  DESCRIPCION: string
  TIPO: string
  DEPARTAMENTO_ID: number
  APLICA_TODOS_PUESTOS_DEP: boolean
  ESTADO: string
  ID_PUESTOS: number[]
  ID_DOCUMENTOS: number[]
}

const GeneralInfoSection = memo(({
  planName,
  onPlanNameChange,
  planType,
  onPlanTypeChange,
  planStatus,
  onPlanStatusChange,
  planCode,
  planDescription,
  onPlanDescriptionChange,
}: {
  planName: string
  onPlanNameChange: (value: string) => void
  planType: string
  onPlanTypeChange: (value: string) => void
  planStatus: string
  onPlanStatusChange: (value: string) => void
  planCode: number
  planDescription: string
  onPlanDescriptionChange: (value: string) => void
}) => {
  const [localPlanName, setLocalPlanName] = useState(planName)
  const [localPlanDescription, setLocalPlanDescription] = useState(planDescription)

  useEffect(() => setLocalPlanName(planName), [planName])
  useEffect(() => setLocalPlanDescription(planDescription), [planDescription])

  useEffect(() => {
    const timer = setTimeout(() => {
      if (localPlanName !== planName) {
        onPlanNameChange(localPlanName)
      }
    }, 150)
    return () => clearTimeout(timer)
  }, [localPlanName, planName, onPlanNameChange])

  useEffect(() => {
    const timer = setTimeout(() => {
      if (localPlanDescription !== planDescription) {
        onPlanDescriptionChange(localPlanDescription)
      }
    }, 200)
    return () => clearTimeout(timer)
  }, [localPlanDescription, planDescription, onPlanDescriptionChange])

  return (
    <>
      <h2 className="text-lg font-semibold text-card-foreground mb-4">Información General</h2>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="planName" className="mb-2">
            Nombre del Plan <span className="text-destructive">*</span>
          </Label>
          <Input
            id="planName"
            value={localPlanName}
            onChange={(e) => setLocalPlanName(e.target.value)}
            placeholder="Ej: Inducción General"
          />
        </div>
        <div>
          <Label htmlFor="planType" className="mb-2">
            Tipo <span className="text-destructive">*</span>
          </Label>
          <Select value={planType} onValueChange={onPlanTypeChange}>
            <SelectTrigger id="planType" className="w-full">
              <SelectValue placeholder="Selecciona un tipo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="INDUCCION">INDUCCION</SelectItem>
              <SelectItem value="INDIVIDUAL">INDIVIDUAL</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="planStatus" className="mb-2">
            Estado <span className="text-destructive">*</span>
          </Label>
          <Select value={planStatus} onValueChange={onPlanStatusChange}>
            <SelectTrigger id="planStatus" className="w-full">
              <SelectValue placeholder="Selecciona un estado" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ACTIVO">ACTIVO</SelectItem>
              <SelectItem value="BORRADOR">BORRADOR</SelectItem>
              <SelectItem value="INACTIVO">INACTIVO</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="planCode" className="mb-2">Código</Label>
          <Input id="planCode" value={planCode} disabled />
        </div>
      </div>
      <div className="mt-4">
        <Label htmlFor="planDescription" className="mb-2">Descripción</Label>
        <Textarea
          id="planDescription"
          value={localPlanDescription}
          onChange={(e) => setLocalPlanDescription(e.target.value)}
          placeholder="Describe el objetivo y alcance del plan..."
          rows={4}
        />
      </div>
    </>
  )
})

GeneralInfoSection.displayName = "GeneralInfoSection"

const DepartmentSection = memo(({
  selectedDepartmentId,
  onDepartmentChange,
  departamentos,
  appliesToAllPositions,
  onToggleAllPositions,
  applicablePositions,
  availablePositions,
  onTogglePosition,
}: {
  selectedDepartmentId: string
  onDepartmentChange: (value: string) => void
  departamentos: Departamento[]
  appliesToAllPositions: boolean
  onToggleAllPositions: (checked: boolean) => void
  applicablePositions: Puesto[]
  availablePositions: Puesto[]
  onTogglePosition: (position: Puesto) => void
}) => {
  return (
    <>
      <div className="mt-4">
        <Label htmlFor="department" className="mb-2">
          Departamento Aplicable <span className="text-destructive">*</span>
        </Label>
        <Select value={selectedDepartmentId} onValueChange={onDepartmentChange}>
          <SelectTrigger>
            <SelectValue placeholder="Seleccionar departamento" />
          </SelectTrigger>
          <SelectContent>
            {departamentos.map((dept) => (
              <SelectItem key={dept.ID_DEPARTAMENTO} value={String(dept.ID_DEPARTAMENTO)}>
                {dept.NOMBRE}
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
            onCheckedChange={onToggleAllPositions}
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
              {applicablePositions.map((p) => (
                <span
                  key={p.ID_PUESTO}
                  className="inline-flex items-center gap-1 px-3 py-1 bg-primary text-primary-foreground rounded-full text-sm"
                >
                  {p.NOMBRE}
                  <button
                    onClick={() => onTogglePosition(p)}
                    className="hover:bg-primary-foreground/20 rounded-full p-0.5"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
            <div className="flex flex-wrap gap-2">
              {availablePositions.map((p) => (
                <button
                  key={p.ID_PUESTO}
                  onClick={() => onTogglePosition(p)}
                  className="px-3 py-1 border border-border text-foreground rounded-full text-sm hover:bg-muted transition-colors"
                >
                  + {p.NOMBRE}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </>
  )
})

DepartmentSection.displayName = "DepartmentSection"

const TrainingsTable = memo(({
  trainings,
  onRemove,
}: {
  trainings: CodigoPadre[]
  onRemove: (id: number) => void
}) => {
  return (
    <div className="border border-border rounded-lg bg-card overflow-hidden">
      <div className="bg-muted/50 px-6 py-4 border-b border-border">
        <h2 className="text-lg font-semibold text-card-foreground">Capacitaciones Predefinidas</h2>
        <p className="text-xs text-muted-foreground mt-1">
          Agrega o elimina capacitaciones de este plan
        </p>
      </div>
      <table className="w-full">
        <thead className="bg-muted/30">
          <tr>
            <th className="text-left px-6 py-3 text-sm font-semibold text-foreground">Código</th>
            <th className="text-left px-6 py-3 text-sm font-semibold text-foreground">Tipo</th>
            <th className="text-left px-6 py-3 text-sm font-semibold text-foreground">Nombre</th>
            <th className="text-left px-6 py-3 text-sm font-semibold text-foreground">Estado</th>
            <th className="text-left px-6 py-3 text-sm font-semibold text-foreground">Version</th>
            <th className="text-left px-6 py-3 text-sm font-semibold text-foreground">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {trainings.length === 0 ? (
            <tr>
              <td colSpan={6} className="text-center py-6 text-muted-foreground">
                Aún no hay capacitaciones en este plan. Usa el botón añadir Capacitación Existente para empezar.
              </td>
            </tr>
          ) : (
            trainings.map((t) => (
              <tr key={t.ID_DOCUMENTO} className="border-b border-border hover:bg-muted/30">
                <td className="px-6 py-3 text-sm">{t.CODIGO}</td>
                <td className="px-6 py-3 text-sm">{t.TIPO_DOCUMENTO}</td>
                <td className="px-6 py-3 text-sm">{t.NOMBRE_DOCUMENTO}</td>
                <td className="px-6 py-3 text-sm">{t.ESTATUS}</td>
                <td className="px-6 py-3 text-sm">{t.VERSION}</td>
                <td className="px-6 py-3">
                  <Button
                    type="button"
                    onClick={() => onRemove(t.ID_DOCUMENTO)}
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
  )
})

TrainingsTable.displayName = "TrainingsTable"

export default function EditPlan({
  plan,
  onBack,
  onUpdate,
  departamentosDisponibles,
  documentosList,
  puestosDisponibles,
}: EditPlanProps) {
  const [planName, setPlanName] = useState(plan.NOMBRE)
  const [planType, setPlanType] = useState(plan.TIPO)
  const [planStatus, setPlanStatus] = useState(plan.ESTADO)
  const [planDescription, setPlanDescription] = useState(plan.DESCRIPCION)
  const [selectedDepartmentId, setSelectedDepartmentId] = useState(
    plan.DEPARTAMENTO_ID ? String(plan.DEPARTAMENTO_ID) : ""
  )
  const [appliesToAllPositions, setAppliesToAllPositions] = useState(plan.APLICA_TODOS_PUESTOS_DEP)
  const [applicablePositions, setApplicablePositions] = useState<Puesto[]>(plan.PLANES_PUESTOS || [])
  const [trainings, setTrainings] = useState<CodigoPadre[]>(plan.DOCUMENTOS_PLANES || [])
  const [isSaving, setIsSaving] = useState(false)
  const [showAddTrainingModal, setShowAddTrainingModal] = useState(false)
  const [documentosMarcados, setDocumentosMarcados] = useState<number[]>([])

  const handlePlanNameChange = useCallback((value: string) => setPlanName(value), [])
  const handlePlanDescriptionChange = useCallback((value: string) => setPlanDescription(value), [])
  const handlePlanTypeChange = useCallback((value: string) => setPlanType(value), [])
  const handlePlanStatusChange = useCallback((value: string) => setPlanStatus(value), [])
  const handleDepartmentChange = useCallback((value: string) => setSelectedDepartmentId(value), [])

  const availablePositions = useMemo(
    () =>
      puestosDisponibles
        .filter((p) => p.DEPARTAMENTO_ID === Number(selectedDepartmentId))
        .filter((p) => !applicablePositions.some((ap) => ap.ID_PUESTO === p.ID_PUESTO)),
    [puestosDisponibles, selectedDepartmentId, applicablePositions]
  )

  const togglePosition = useCallback((position: Puesto) => {
    setApplicablePositions((prev) => {
      const exists = prev.some((p) => p.ID_PUESTO === position.ID_PUESTO)
      return exists ? prev.filter((p) => p.ID_PUESTO !== position.ID_PUESTO) : [...prev, position]
    })
  }, [])

  const removeTraining = useCallback((id: number) => {
    setTrainings((prev) => prev.filter((t) => t.ID_DOCUMENTO !== id))
  }, [])

  const toggleDocumentoSeleccion = useCallback((id: number) => {
    setDocumentosMarcados((prev) =>
      prev.includes(id) ? prev.filter((d) => d !== id) : [...prev, id]
    )
  }, [])

  const handleCloseModal = useCallback(() => {
    setShowAddTrainingModal(false)
    setDocumentosMarcados([])
  }, [])

  const handleAddTrainings = useCallback(async () => {
    setIsSaving(true)
    await new Promise((resolve) => setTimeout(resolve, 600))

    const newTrainings = documentosMarcados
      .map((id) => documentosList.find((t) => t.ID_DOCUMENTO === id))
      .filter((t): t is CodigoPadre => t !== undefined)

    setTrainings((prev) => {
      const existingIds = new Set(prev.map((t) => t.ID_DOCUMENTO))
      const uniqueNewTrainings = newTrainings.filter((nt) => !existingIds.has(nt.ID_DOCUMENTO))
      return [...prev, ...uniqueNewTrainings]
    })

    setIsSaving(false)
    setShowAddTrainingModal(false)
    setDocumentosMarcados([])
  }, [documentosMarcados, documentosList])

  const handleSave = useCallback(async () => {
    if (!selectedDepartmentId) return alert("Selecciona un departamento")
    setIsSaving(true)

    const payload: UpdatePlanPayload = {
      NOMBRE: planName,
      DESCRIPCION: planDescription,
      TIPO: planType,
      DEPARTAMENTO_ID: Number(selectedDepartmentId),
      APLICA_TODOS_PUESTOS_DEP: appliesToAllPositions,
      ESTADO: planStatus,
      ID_PUESTOS: appliesToAllPositions ? [] : applicablePositions.map((p) => p.ID_PUESTO),
      ID_DOCUMENTOS: trainings.map((t) => t.ID_DOCUMENTO),
    }

    try {
      await onUpdate(payload, plan.ID_PLAN)
    } catch (error) {
      console.error("Error al actualizar plan:", error)
    } finally {
      setIsSaving(false)
    }
  }, [
    planName,
    planDescription,
    planType,
    selectedDepartmentId,
    appliesToAllPositions,
    planStatus,
    applicablePositions,
    trainings,
    onUpdate,
    plan.ID_PLAN,
  ])

  const trainingIdsSet = useMemo(() => new Set(trainings.map((t) => t.ID_DOCUMENTO)), [trainings])
  const availableTrainings = useMemo(
    () => documentosList.filter((doc) => !trainingIdsSet.has(doc.ID_DOCUMENTO)),
    [documentosList, trainingIdsSet]
  )

  return (
    <div className="flex-1 flex flex-col bg-card rounded-lg overflow-hidden">
      <div className="flex items-center gap-4 p-6 pb-4 border-b border-border">
        <Button onClick={onBack} variant="ghost" size="sm">
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-semibold text-card-foreground">
            Editar Plan de Capacitación
          </h1>
          <p className="text-sm text-muted-foreground">
            Modifica la información del plan y sus capacitaciones
          </p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="p-6 space-y-6">
          <div className="border border-border rounded-lg p-6 bg-card">
            <GeneralInfoSection
              planName={planName}
              onPlanNameChange={handlePlanNameChange}
              planType={planType}
              onPlanTypeChange={handlePlanTypeChange}
              planStatus={planStatus}
              onPlanStatusChange={handlePlanStatusChange}
              planCode={plan.ID_PLAN}
              planDescription={planDescription}
              onPlanDescriptionChange={handlePlanDescriptionChange}
            />

            <DepartmentSection
              selectedDepartmentId={selectedDepartmentId}
              onDepartmentChange={handleDepartmentChange}
              departamentos={departamentosDisponibles}
              appliesToAllPositions={appliesToAllPositions}
              onToggleAllPositions={setAppliesToAllPositions}
              applicablePositions={applicablePositions}
              availablePositions={availablePositions}
              onTogglePosition={togglePosition}
            />
          </div>

          <div>
            <Button
              onClick={() => setShowAddTrainingModal(true)}
              size="sm"
              className="bg-accent hover:bg-accent/90 text-accent-foreground dark:bg-accent/90 dark:hover:bg-accent/80 cursor-pointer"
            >
              <Plus className="w-4 h-4 mr-2" />
              Añadir Capacitación Existente
            </Button>
          </div>

          <TrainingsTable trainings={trainings} onRemove={removeTraining} />

          <div className="flex gap-3 justify-end">
            <Button onClick={onBack} variant="outline" className="dark:text-foreground dark:hover:border-destructive/40 cursor-pointer">
              Cancelar
            </Button>
            <Button onClick={handleSave} disabled={isSaving} className="cursor-pointer">
              {isSaving ? "Guardando..." : "Guardar Cambios"}
            </Button>
          </div>
        </div>
      </div>

      <AddDocumentosModal
        isOpen={showAddTrainingModal}
        onClose={handleCloseModal}
        documentosList={availableTrainings}
        documentosMarcados={documentosMarcados}
        onToggleDocumento={toggleDocumentoSeleccion}
        onSave={handleAddTrainings}
        isSaving={isSaving}
      />
    </div>
  )
}
