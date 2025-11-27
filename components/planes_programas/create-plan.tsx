"use client"

import { useMemo, useState, memo, useCallback, useEffect } from "react"
import { ArrowLeft, Plus, Trash2, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import type { PlanCapacitacion } from "@/lib/planes_programas/types"
import type { Departamento, Puesto } from "@/lib/types"
import type { CodigoPadre } from "@/lib/codigos/types"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { AddDocumentosModal } from "./add-document-modal"

interface CreatePlanProps {
  onBack: () => void
  onSave: (plan: Partial<PlanCapacitacion>) => void
  departamentosDisponibles: Departamento[]
  documentosList: CodigoPadre[]
  puestosDisponibles: Puesto[]
}

type PlanType = "INDUCCION" | "INDIVIDUAL"
type PlanStatus = "ACTIVO" | "BORRADOR" | "INACTIVO"

interface planesCapacitacionPayload {
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
  onPlanCodeChange,
  planDescription,
  onPlanDescriptionChange,
}: {
  planName: string
  onPlanNameChange: (value: string) => void
  planType: PlanType
  onPlanTypeChange: (value: PlanType) => void
  planStatus: PlanStatus
  onPlanStatusChange: (value: PlanStatus) => void
  planCode: string
  onPlanCodeChange: (value: string) => void
  planDescription: string
  onPlanDescriptionChange: (value: string) => void
}) => {
  const [localPlanName, setLocalPlanName] = useState(planName)
  const [localPlanCode, setLocalPlanCode] = useState(planCode)
  const [localPlanDescription, setLocalPlanDescription] = useState(planDescription)

  useEffect(() => setLocalPlanName(planName), [planName])
  useEffect(() => setLocalPlanCode(planCode), [planCode])
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
      if (localPlanCode !== planCode) {
        onPlanCodeChange(localPlanCode)
      }
    }, 150)
    return () => clearTimeout(timer)
  }, [localPlanCode, planCode, onPlanCodeChange])

  useEffect(() => {
    const timer = setTimeout(() => {
      if (localPlanDescription !== planDescription) {
        onPlanDescriptionChange(localPlanDescription)
      }
    }, 200)
    return () => clearTimeout(timer)
  }, [localPlanDescription, planDescription, onPlanDescriptionChange])

  return (
    <div className="border border-border rounded-lg p-4 md:p-6 bg-card">
      <h2 className="text-lg font-semibold text-card-foreground mb-4">
        Información General
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

        <div>
          <Label htmlFor="planName" className="mb-2 block">
            Nombre del Plan <span className="text-destructive">*</span>
          </Label>
          <Input
            id="planName"
            value={localPlanName}
            onChange={(e) => setLocalPlanName(e.target.value)}
            placeholder="Ej: Inducción General"
            className="placeholder:text-sm"
          />
        </div>

        <div>
          <Label htmlFor="planType" className="mb-2 block">
            Tipo <span className="text-destructive">*</span>
          </Label>
          <Select value={planType} onValueChange={onPlanTypeChange}>
            <SelectTrigger id="planType" className="w-full">
              <SelectValue placeholder="Seleccionar tipo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="INDUCCION">INDUCCION</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="planStatus" className="mb-2 block">
            Estado <span className="text-destructive">*</span>
          </Label>
          <Select value={planStatus} onValueChange={onPlanStatusChange}>
            <SelectTrigger id="planStatus" className="w-full">
              <SelectValue placeholder="Seleccionar estado" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ACTIVO">ACTIVO</SelectItem>
              <SelectItem value="BORRADOR">BORRADOR</SelectItem>
              <SelectItem value="INACTIVO">INACTIVO</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="planCode" className="mb-2 block">
            Código (Opcional)
          </Label>
          <Input
            id="planCode"
            value={localPlanCode}
            onChange={(e) => setLocalPlanCode(e.target.value)}
            placeholder="Ej: IND-001"
            className="placeholder:text-sm"
          />
        </div>
      </div>

      {/* Descripción */}
      <div className="mt-4">
        <Label htmlFor="planDescription" className="mb-2 block">
          Descripción
        </Label>
        <Textarea
          id="planDescription"
          value={localPlanDescription}
          onChange={(e) => setLocalPlanDescription(e.target.value)}
          placeholder="Describe el objetivo y alcance del plan..."
          rows={4}
          className="text-base placeholder:text-sm"
        />
      </div>
    </div>

  )
})

GeneralInfoSection.displayName = "GeneralInfoSection"

const DepartmentSection = memo(({
  selectedDepartment,
  onDepartmentChange,
  departamentos,
  appliesToAllPositions,
  onToggleAllPositions,
  applicablePositions,
  availablePositions,
  onTogglePosition,
}: {
  selectedDepartment: string
  onDepartmentChange: (value: string) => void
  departamentos: Departamento[]
  appliesToAllPositions: boolean
  onToggleAllPositions: (checked: boolean) => void
  applicablePositions: Puesto[]
  availablePositions: Puesto[]
  onTogglePosition: (position: Puesto) => void
}) => {
  return (
    <div className="border border-border rounded-lg p-6 bg-card">
      <div>
        <Label htmlFor="department" className="mb-2">
          Departamento Aplicable <span className="text-destructive">*</span>
        </Label>
        <Select value={selectedDepartment} onValueChange={onDepartmentChange}>
          <SelectTrigger id="department" className="w-full">
            <SelectValue placeholder="Seleccionar departamento" />
          </SelectTrigger>
          <SelectContent>
            {departamentos.map((dept) => (
              <SelectItem
                key={dept.ID_DEPARTAMENTO}
                value={dept.ID_DEPARTAMENTO.toString()}
              >
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
            className="dark:border dark:border-gray-500 data-[state=checked]:dark:border-transparent cursor-pointer"
          />
          <Label htmlFor="allPositions" className="text-sm font-normal cursor-pointer">
            Aplica a todos los puestos del departamento
          </Label>
        </div>
        {!appliesToAllPositions && (
          <div>
            <Label className="mb-2 block">Seleccionar Puestos Específicos</Label>

            <div className="flex flex-wrap gap-2 mb-3">
              {applicablePositions.map((position) => (
                <span
                  key={position.ID_PUESTO}
                  className="inline-flex items-center gap-1 px-3 py-1 bg-primary text-primary-foreground rounded-full text-sm"
                >
                  {position.NOMBRE}
                  <button
                    type="button"
                    onClick={() => onTogglePosition(position)}
                    className="hover:bg-primary-foreground/20 rounded-full p-0.5"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>

            <div className="flex flex-wrap gap-2">
              {availablePositions.map((position) => (
                <button
                  type="button"
                  key={position.ID_PUESTO}
                  onClick={() => onTogglePosition(position)}
                  className="px-3 py-1 border border-border text-foreground rounded-full text-sm hover:bg-muted transition-colors"
                >
                  + {position.NOMBRE}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
})

DepartmentSection.displayName = "DepartmentSection"

const DocumentosTable = memo(({ 
  documentos, 
  onRemove 
}: { 
  documentos: CodigoPadre[]
  onRemove: (id: number) => void
}) => {
  return (
    <div className="border border-border rounded-lg bg-card">
      <div className="bg-muted/50 px-6 py-4 border-b border-border">
        <h2 className="text-lg font-semibold text-foreground">Capacitaciones Predefinidas en esta Plantilla</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Estas capacitaciones se asignarán automáticamente cuando se aplique este plan a un colaborador
        </p>
      </div>
      <div className="overflow-x-auto">
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
            {documentos.length === 0 ? (
              <tr>
                <td colSpan={6} className="text-center py-6 text-muted-foreground">
                  Aún no hay capacitaciones en este plan. Usa el botón añadir Capacitación Existente para empezar.
                </td>
              </tr>
            ) : (
              documentos.map((doc) => (
                <tr key={doc.ID_DOCUMENTO} className="border-b border-border hover:bg-muted/30">
                  <td className="px-6 py-3 text-sm">{doc.CODIGO}</td>
                  <td className="px-6 py-3 text-sm">{doc.TIPO_DOCUMENTO}</td>
                  <td className="px-6 py-3 text-sm">{doc.NOMBRE_DOCUMENTO}</td>
                  <td className="px-6 py-3 text-sm">{doc.ESTATUS}</td>
                  <td className="px-6 py-3 text-sm">{doc.VERSION}</td>
                  <td className="px-6 py-3">
                    <Button
                      type="button"
                      onClick={() => onRemove(doc.ID_DOCUMENTO)}
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
    </div>
  )
})

DocumentosTable.displayName = "DocumentosTable"

export default function CreatePlan({ 
  onBack,
  onSave,
  departamentosDisponibles,
  documentosList,
  puestosDisponibles
}: CreatePlanProps) {
  const [planName, setPlanName] = useState("")
  const [planType, setPlanType] = useState<PlanType>("INDUCCION")
  const [planStatus, setPlanStatus] = useState<PlanStatus>("ACTIVO")
  const [planDescription, setPlanDescription] = useState("")
  const [planCode, setPlanCode] = useState("")

  const [selectedDepartment, setSelectedDepartment] = useState("")
  const [appliesToAllPositions, setAppliesToAllPositions] = useState(true)
  const [applicablePositions, setApplicablePositions] = useState<Puesto[]>([])

  const [documentosSeleccionados, setDocumentosSeleccionados] = useState<CodigoPadre[]>([])
  const [showAddDocumentoModal, setShowAddDocumentoModal] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [documentosMarcados, setDocumentosMarcados] = useState<number[]>([])
  const [showMissingFieldsAlert, setShowMissingFieldsAlert] = useState(false)

  const handlePlanNameChange = useCallback((value: string) => setPlanName(value), [])
  const handlePlanCodeChange = useCallback((value: string) => setPlanCode(value), [])
  const handlePlanDescriptionChange = useCallback((value: string) => setPlanDescription(value), [])
  const handlePlanTypeChange = useCallback((value: PlanType) => setPlanType(value), [])
  const handlePlanStatusChange = useCallback((value: PlanStatus) => setPlanStatus(value), [])
  const handleDepartmentChange = useCallback((value: string) => setSelectedDepartment(value), [])

  const puestosFiltrados = useMemo(() => 
    puestosDisponibles.filter((p) => p.DEPARTAMENTO_ID === Number(selectedDepartment)),
    [puestosDisponibles, selectedDepartment]
  )

  const puestosDisponiblesFiltrados = useMemo(() =>
    puestosFiltrados.filter((p) => !applicablePositions.some((sel) => sel.ID_PUESTO === p.ID_PUESTO)),
    [puestosFiltrados, applicablePositions]
  )

  const togglePosition = useCallback((position: Puesto) => {
    setApplicablePositions((prev) =>
      prev.some(p => p.ID_PUESTO === position.ID_PUESTO)
        ? prev.filter((p) => p.ID_PUESTO !== position.ID_PUESTO)
        : [...prev, position],
    )
  }, [])

  const removeDocumento = useCallback((id: number) => {
    setDocumentosSeleccionados((prev) => prev.filter((d) => d.ID_DOCUMENTO !== id))
  }, [])

  const toggleDocumentoSeleccion = useCallback((id: number) => {
    setDocumentosMarcados((prev) =>
      prev.includes(id) ? prev.filter((d) => d !== id) : [...prev, id],
    )
  }, [])

  const handleCloseModal = useCallback(() => {
    setShowAddDocumentoModal(false)
    setDocumentosMarcados([])
  }, [])

  const handleAddDocumentos = useCallback(async () => {
    setIsSaving(true)
    await new Promise((resolve) => setTimeout(resolve, 600))

    const nuevos = documentosList.filter((d) =>
      documentosMarcados.includes(d.ID_DOCUMENTO),
    )

    setDocumentosSeleccionados((prev) => [
      ...prev,
      ...nuevos.filter(
        (nd) => !prev.some((pd) => pd.ID_DOCUMENTO === nd.ID_DOCUMENTO),
      ),
    ])

    setIsSaving(false)
    setShowAddDocumentoModal(false)
    setDocumentosMarcados([])
  }, [documentosList, documentosMarcados])

  const handleSave = useCallback(() => {
    if (!planName || !selectedDepartment || !planType || !planStatus) {
      setShowMissingFieldsAlert(true)
      return
    }

    const newPlan: planesCapacitacionPayload = {
      NOMBRE: planName,
      DESCRIPCION: planDescription,
      TIPO: planType,
      DEPARTAMENTO_ID: Number(selectedDepartment),
      APLICA_TODOS_PUESTOS_DEP: appliesToAllPositions,
      ESTADO: planStatus,
      ID_PUESTOS: appliesToAllPositions
        ? []
        : applicablePositions.map((p) => Number(p.ID_PUESTO)),
      ID_DOCUMENTOS: documentosSeleccionados.map(
        (doc) => Number(doc.ID_DOCUMENTO)
      ),
    }

    onSave(newPlan)
  }, [planName, selectedDepartment, planType, planStatus, planDescription, appliesToAllPositions, applicablePositions, documentosSeleccionados, onSave])

  return (
    <div className="space-y-6 bg-card rounded-lg py-4 px-6">
      <div className="flex flex-col items-start gap-2">
        <Button onClick={onBack} variant="ghost" size="sm" className="cursor-pointer">
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <div>
          <h1 className="text-2xl sm:text-3xl font-semibold text-card-foreground">Crear Plan de Capacitación</h1>
          <p className="text-sm text-muted-foreground">
            Crea un plan con capacitaciones predefinidas para inducción o capacitación individual
          </p>
        </div>
      </div>

      <div className="space-y-6">
        <GeneralInfoSection
          planName={planName}
          onPlanNameChange={handlePlanNameChange}
          planType={planType}
          onPlanTypeChange={handlePlanTypeChange}
          planStatus={planStatus}
          onPlanStatusChange={handlePlanStatusChange}
          planCode={planCode}
          onPlanCodeChange={handlePlanCodeChange}
          planDescription={planDescription}
          onPlanDescriptionChange={handlePlanDescriptionChange}
        />

        <DepartmentSection
          selectedDepartment={selectedDepartment}
          onDepartmentChange={handleDepartmentChange}
          departamentos={departamentosDisponibles}
          appliesToAllPositions={appliesToAllPositions}
          onToggleAllPositions={setAppliesToAllPositions}
          applicablePositions={applicablePositions}
          availablePositions={puestosDisponiblesFiltrados}
          onTogglePosition={togglePosition}
        />

        <div>
          <Button
            type="button"
            onClick={() => setShowAddDocumentoModal(true)}
            className="bg-accent hover:bg-accent/90 text-accent-foreground dark:bg-accent/80 dark:hover:bg-accent/90 cursor-pointer"
          >
            <Plus className="w-4 h-4 mr-2" />
            Añadir Capacitación
          </Button>
        </div>

        <DocumentosTable
          documentos={documentosSeleccionados}
          onRemove={removeDocumento}
        />

        <div className="flex gap-3 justify-end">
          <Button onClick={onBack} variant="outline" type="button" className="dark:text-foreground dark:hover:border-destructive/40 cursor-pointer">
            Cancelar
          </Button>
          <Button onClick={handleSave} type="button" className="cursor-pointer">
            Guardar
          </Button>
        </div>
      </div>

      <AlertDialog open={showMissingFieldsAlert} onOpenChange={setShowMissingFieldsAlert}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>No se puede crear el plan</AlertDialogTitle>
            <AlertDialogDescription>
              Para continuar, completa todos los campos marcados con{" "}
              <span className="text-destructive font-semibold">*</span>.  
              Estos son necesarios para guardar el plan correctamente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction onClick={() => setShowMissingFieldsAlert(false)}>
              Entendido
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AddDocumentosModal
        isOpen={showAddDocumentoModal}
        onClose={handleCloseModal}
        documentosList={documentosList}
        documentosMarcados={documentosMarcados}
        onToggleDocumento={toggleDocumentoSeleccion}
        onSave={handleAddDocumentos}
        isSaving={isSaving}
      />
    </div>
  )
}