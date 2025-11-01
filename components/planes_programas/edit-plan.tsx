"use client"

import { useState, useMemo, useCallback, useEffect, memo } from "react"
import { ArrowLeft, Plus, Trash2, X, Search } from "lucide-react"
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
  onUpdate: (plan: UpdatePlanPayload, idPlan: number) => void
  departamentosDisponibles: Departamento[]
  documentosList: CodigoPadre[]
  puestosDisponibles: Puesto[]
}

type TrainingStatus = "BORRADOR" | "ACTIVO" | "INACTIVO" | "VIGENTE"

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
  const [selectedDepartmentId, setSelectedDepartmentId] = useState(plan.DEPARTAMENTO_ID ? String(plan.DEPARTAMENTO_ID) : "")
  const [appliesToAllPositions, setAppliesToAllPositions] = useState(plan.APLICA_TODOS_PUESTOS_DEP)
  const [applicablePositions, setApplicablePositions] = useState<Puesto[]>(plan.PLANES_PUESTOS || [])
  const [trainings, setTrainings] = useState<CodigoPadre[]>(plan.DOCUMENTOS_PLANES || [])
  const [isSaving, setIsSaving] = useState(false)
  const [showAddTrainingModal, setShowAddTrainingModal] = useState(false)
  const [selectedDocumentIds, setSelectedDocumentIds] = useState<string[]>([])
  const [showSuccessMessage, setShowSuccessMessage] = useState(false)

  const [searchTextInput, setSearchTextInput] = useState("")
  const [searchQuery, setSearchQuery] = useState("")

  useEffect(() => {
    const handler = setTimeout(() => setSearchQuery(searchTextInput), 300)
    return () => clearTimeout(handler)
  }, [searchTextInput])

  const handleSearch = useCallback(() => setSearchQuery(searchTextInput), [searchTextInput])

  const trainingIdsSet = useMemo(() => new Set(trainings.map((t) => t.ID_DOCUMENTO)), [trainings])

  const availableTrainings = useMemo(
    () => documentosList.filter((doc) => !trainingIdsSet.has(doc.ID_DOCUMENTO)),
    [documentosList, trainingIdsSet]
  )

  const filteredTrainings = useMemo(() => {
    if (!searchQuery) return availableTrainings
    const q = searchQuery.toLowerCase().trim()
    return availableTrainings.filter(
      (doc) =>
        doc.NOMBRE_DOCUMENTO.toLowerCase().includes(q) ||
        doc.CODIGO.toLowerCase().includes(q)
    )
  }, [availableTrainings, searchQuery])

  const togglePosition = useCallback((position: Puesto) => {
    setApplicablePositions((prev) => {
      const exists = prev.some((p) => p.ID_PUESTO === position.ID_PUESTO)
      return exists ? prev.filter((p) => p.ID_PUESTO !== position.ID_PUESTO) : [...prev, position]
    })
  }, [])

  const removeTraining = useCallback((id: number) => {
    setTrainings((prev) => prev.filter((t) => t.ID_DOCUMENTO !== id))
  }, [])

  const toggleTrainingSelection = useCallback((id: number) => {
    const idStr = String(id)
    setSelectedDocumentIds((prev) =>
      prev.includes(idStr) ? prev.filter((i) => i !== idStr) : [...prev, idStr]
    )
  }, [])

  const handleAddTrainings = useCallback(async () => {
    setIsSaving(true)
    const newTrainings = selectedDocumentIds
      .map((idStr) => documentosList.find((t) => t.ID_DOCUMENTO === Number(idStr)))
      .filter((t): t is CodigoPadre => t !== undefined)

    setTrainings((prev) => {
      const existingIds = new Set(prev.map((t) => t.ID_DOCUMENTO))
      const uniqueNewTrainings = newTrainings.filter((nt) => !existingIds.has(nt.ID_DOCUMENTO))
      return [...prev, ...uniqueNewTrainings]
    })

    setIsSaving(false)
    setShowAddTrainingModal(false)
    setSelectedDocumentIds([])
    setShowSuccessMessage(true)
    setTimeout(() => setShowSuccessMessage(false), 3000)
  }, [selectedDocumentIds, documentosList])

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
      setShowSuccessMessage(true)
      setTimeout(() => setShowSuccessMessage(false), 3000)
    } catch (error) {
      console.error("Error al actualizar plan:", error)
    } finally {
      setIsSaving(false)
    }
  }, [planName, planDescription, planType, selectedDepartmentId, appliesToAllPositions, planStatus, applicablePositions, trainings, onUpdate, plan.ID_PLAN])

  const TrainingCard = memo(({ training, isSelected, onToggle }: { training: CodigoPadre, isSelected: boolean, onToggle: (id: number) => void }) => (
    <div
      onClick={() => onToggle(training.ID_DOCUMENTO)}
      className={`border rounded-lg p-4 cursor-pointer transition-all ${isSelected ? "border-primary bg-primary/10" : "border-border hover:border-primary/50 hover:bg-muted/50"}`}
    >
      <div className="flex items-start gap-3">
        <input type="checkbox" checked={isSelected} onChange={() => {}} className="mt-1 w-4 h-4 text-primary rounded border-border focus:ring-primary"/>
        <div className="flex-1">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-foreground">{training.NOMBRE_DOCUMENTO}</h3>
            <span className={`px-2 py-1 rounded text-xs ${training.ESTATUS === "VIGENTE" ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" : "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400"}`}>
              {training.ESTATUS}
            </span>
          </div>
          <p className="text-sm text-muted-foreground mt-1">{training.CODIGO}</p>
          <p className="text-xs text-muted-foreground mt-2">Tipo: {training.TIPO_DOCUMENTO}</p>
        </div>
      </div>
    </div>
  ))
  TrainingCard.displayName = "TrainingCard"

  return (
    <div className="h-full flex flex-col bg-card rounded-lg p-6 overflow-y-auto">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Button onClick={onBack} variant="ghost" size="sm"><ArrowLeft className="w-4 h-4"/></Button>
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
              <Label htmlFor="planName" className="mb-2">Nombre del Plan <span className="text-destructive">*</span></Label>
              <Input id="planName" value={planName} onChange={(e) => setPlanName(e.target.value)} placeholder="Ej: Inducción General"/>
            </div>
            <div>
              <Label htmlFor="planType" className="mb-2">Tipo <span className="text-destructive">*</span></Label>
              <Select value={planType} onValueChange={(v) => setPlanType(v as "INDUCCION" | "INDIVIDUAL")}>
                <SelectTrigger id="planType" className="w-full"><SelectValue placeholder="Selecciona un tipo"/></SelectTrigger>
                <SelectContent>
                  <SelectItem value="INDUCCION">INDUCCION</SelectItem>
                  <SelectItem value="INDIVIDUAL">INDIVIDUAL</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="planStatus" className="mb-2">Estado <span className="text-destructive">*</span></Label>
              <Select value={planStatus} onValueChange={(v) => setPlanStatus(v as TrainingStatus)}>
                <SelectTrigger id="planStatus" className="w-full"><SelectValue placeholder="Selecciona un estado"/></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Activo">Activo</SelectItem>
                  <SelectItem value="Borrador">Borrador</SelectItem>
                  <SelectItem value="Inactivo">Inactivo</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="planCode" className="mb-2">Código</Label>
              <Input id="planCode" value={plan.ID_PLAN} disabled/>
            </div>
          </div>
          <div className="mt-4">
            <Label htmlFor="planDescription" className="mb-2">Descripción</Label>
            <Textarea id="planDescription" value={planDescription} onChange={(e) => setPlanDescription(e.target.value)} placeholder="Describe el objetivo y alcance del plan..." rows={4}/>
          </div>

          <div className="mt-4">
            <Label htmlFor="department" className="mb-2">Departamento Aplicable <span className="text-destructive">*</span></Label>
            <Select value={selectedDepartmentId} onValueChange={setSelectedDepartmentId}>
              <SelectTrigger><SelectValue placeholder="Seleccionar departamento"/></SelectTrigger>
              <SelectContent>
                {departamentosDisponibles.map((dept) => (
                  <SelectItem key={dept.ID_DEPARTAMENTO} value={String(dept.ID_DEPARTAMENTO)}>{dept.NOMBRE}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="mt-4 space-y-3">
            <div className="flex items-center space-x-2">
              <Checkbox id="allPositions" checked={appliesToAllPositions} onCheckedChange={(c) => setAppliesToAllPositions(c as boolean)} className="mb-2"/>
              <Label htmlFor="allPositions" className="text-sm font-normal cursor-pointer">Aplica a todos los puestos del departamento</Label>
            </div>
            {!appliesToAllPositions && (
              <div>
                <Label className="mb-2 block">Seleccionar Puestos Específicos</Label>
                <div className="flex flex-wrap gap-2 mb-3">
                  {applicablePositions.map((p) => (
                    <span key={p.ID_PUESTO} className="inline-flex items-center gap-1 px-3 py-1 bg-primary text-primary-foreground rounded-full text-sm">
                      {p.NOMBRE}
                      <button onClick={() => togglePosition(p)} className="hover:bg-primary-foreground/20 rounded-full p-0.5"><X className="w-3 h-3"/></button>
                    </span>
                  ))}
                </div>
                <div className="flex flex-wrap gap-2">
                  {puestosDisponibles.filter((p) => p.DEPARTAMENTO_ID === Number(selectedDepartmentId))
                    .filter((p) => !applicablePositions.some(ap => ap.ID_PUESTO === p.ID_PUESTO))
                    .map((p) => (
                      <button key={p.ID_PUESTO} onClick={() => togglePosition(p)} className="px-3 py-1 border border-border text-foreground rounded-full text-sm hover:bg-muted transition-colors">
                        + {p.NOMBRE}
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
            <Button onClick={() => setShowAddTrainingModal(true)} size="sm" className="bg-accent hover:bg-accent/90 text-accent-foreground">
              <Plus className="w-4 h-4 mr-2"/>Añadir Capacitación Existente
            </Button>
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
                <tr><td colSpan={5} className="text-center py-6 text-muted-foreground">Aún no hay capacitaciones en este plan. Usa el botón añadir Capacitación Existente para empezar.</td></tr>
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
                        onClick={() => removeTraining(t.ID_DOCUMENTO)}
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
                  <p className="text-sm text-muted-foreground mt-1">Selecciona las capacitaciones que deseas agregar a este plan</p>
                </div>
                <Button onClick={() => {setShowAddTrainingModal(false); setSelectedDocumentIds([]); setSearchTextInput(""); setSearchQuery("");}} variant="ghost" size="sm"><X className="w-5 h-5"/></Button>
              </div>

              <div className="p-6 border-b border-border flex gap-3 mr-3">
                <Input type="search" placeholder="Buscar por nombre o código..." value={searchTextInput} onChange={(e) => setSearchTextInput(e.target.value)} onKeyDown={(e) => e.key === "Enter" && handleSearch()}/>
              </div>

              <div className="flex-1 overflow-y-auto p-6 space-y-3">
                {filteredTrainings.map((t) => (
                  <TrainingCard key={t.ID_DOCUMENTO} training={t} isSelected={selectedDocumentIds.includes(String(t.ID_DOCUMENTO))} onToggle={toggleTrainingSelection}/>
                ))}
              </div>

              {/* Footer */}
              <div className="flex items-center justify-between p-6 border-t border-border">
                <p className="text-sm text-muted-foreground">{selectedDocumentIds.length} capacitación{selectedDocumentIds.length !== 1 ? "es" : ""} seleccionada{selectedDocumentIds.length !== 1 ? "s" : ""}</p>
                <div className="flex gap-3">
                  <Button onClick={() => {setShowAddTrainingModal(false); setSelectedDocumentIds([]); setSearchTextInput(""); setSearchQuery("");}} variant="outline">Cancelar</Button>
                  <Button onClick={handleAddTrainings} disabled={selectedDocumentIds.length === 0 || isSaving} className="bg-accent hover:bg-accent/90 text-accent-foreground disabled:opacity-50">
                    {isSaving ? "Guardando..." : `Añadir ${selectedDocumentIds.length > 0 ? `(${selectedDocumentIds.length})` : ""}`}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="flex gap-3 justify-end">
          <Button onClick={onBack} variant="outline">Cancelar</Button>
          <Button onClick={handleSave} disabled={isSaving}>{isSaving ? "Guardando..." : "Guardar Cambios"}</Button>
        </div>
      </div>
    </div>
  )
}
