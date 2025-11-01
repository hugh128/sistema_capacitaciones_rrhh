"use client"

import { useMemo, useState } from "react"
import { ArrowLeft, Plus, Search, Trash2, X } from "lucide-react"
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
import { Departamento, Puesto } from "@/lib/types"
import { CodigoPadre } from "@/lib/codigos/types"

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
  const [showSuccessMessage, setShowSuccessMessage] = useState(false)
  const [documentosMarcados, setDocumentosMarcados] = useState<number[]>([])
  const [searchTerm, setSearchTerm] = useState("")

  const filteredDocumentos = useMemo(() => {
    if (!searchTerm) {
      return documentosList
    }
    const lowerCaseSearchTerm = searchTerm.toLowerCase()
    
    return documentosList.filter(doc =>
      doc.NOMBRE_DOCUMENTO.toLowerCase().includes(lowerCaseSearchTerm) ||
      doc.CODIGO.toLowerCase().includes(lowerCaseSearchTerm)
    )
  }, [documentosList, searchTerm])
  
  const togglePosition = (position: Puesto) => {
    setApplicablePositions((prev) =>
      prev.includes(position)
        ? prev.filter((p) => p !== position)
        : [...prev, position],
    )
  }

  const removeDocumento = (id: number) => {
    setDocumentosSeleccionados((prev) => prev.filter((d) => d.ID_DOCUMENTO !== id))
  }

  const handleSave = (event: React.FormEvent) => {
    event.preventDefault()
    
    if (!planName || !selectedDepartment || !planType || !planStatus) {
      alert("Por favor, complete todos los campos obligatorios (*).")
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
  }

  const toggleDocumentoSeleccion = (id: number) => {
    setDocumentosMarcados((prev) =>
      prev.includes(id) ? prev.filter((d) => d !== id) : [...prev, id],
    )
  }

  const handleAddDocumentos = async () => {
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
    setSearchTerm("")
    setShowSuccessMessage(true)
    setTimeout(() => setShowSuccessMessage(false), 3000)
  }

  return (
    <div className="flex-1 bg-card rounded-lg p-6 overflow-y-auto">
      <div className="flex items-center gap-4 mb-6">
        <Button onClick={onBack} variant="ghost" size="sm">
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-semibold text-card-foreground">Crear Plan de Capacitación</h1>
          <p className="text-sm text-muted-foreground">
            Crea un plan con capacitaciones predefinidas para inducción o capacitación individual
          </p>
        </div>
      </div>

      <form onSubmit={handleSave}> 
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
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="planType" className="mb-2">
                    Tipo <span className="text-destructive">*</span>
                  </Label>
                  <Select
                    value={planType}
                    onValueChange={(value: PlanType) => setPlanType(value)}
                  >
                    <SelectTrigger id="planType" className="w-full">
                      <SelectValue placeholder="Seleccionar tipo" />
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
                  <Select
                    value={planStatus}
                    onValueChange={(value: PlanStatus) => setPlanStatus(value)}
                  >
                    <SelectTrigger id="planStatus" className="w-full">
                      <SelectValue placeholder="Seleccionar estado" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Activo">Activo</SelectItem>
                      <SelectItem value="Borrador">Borrador</SelectItem>
                      <SelectItem value="Inactivo">Inactivo</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="planCode" className="mb-2">Código (Opcional)</Label>
                  <Input
                    id="planCode"
                    value={planCode}
                    onChange={(e) => setPlanCode(e.target.value)}
                    placeholder="Ej: IND-001"
                  />
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
                className="text-base"
              />
            </div>

            <div className="mt-4">
              <Label htmlFor="department" className="mb-2">
                Departamento Aplicable <span className="text-destructive">*</span>
              </Label>
              <Select
                value={selectedDepartment}
                onValueChange={(value) => setSelectedDepartment(value)}
              >
                <SelectTrigger id="department" className="w-full">
                  <SelectValue placeholder="Seleccionar departamento" />
                </SelectTrigger>
                <SelectContent>
                  {departamentosDisponibles.map((dept) => (
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
                      {applicablePositions.map((position) => (
                        <span
                          key={position.ID_PUESTO}
                          className="inline-flex items-center gap-1 px-3 py-1 bg-primary text-primary-foreground rounded-full text-sm"
                        >
                          {position.NOMBRE}
                          <button
                            type="button"
                            onClick={() => togglePosition(position)}
                            className="hover:bg-primary-foreground/20 rounded-full p-0.5"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </span>
                      ))}
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {puestosDisponibles
                      .filter((p) => p.DEPARTAMENTO_ID === Number(selectedDepartment))
                      .filter((p) => !applicablePositions.some((sel) => sel.ID_PUESTO === p.ID_PUESTO))
                      .map((position) => (
                        <button
                          type="button"
                          key={position.ID_PUESTO}
                          onClick={() => togglePosition(position)}
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

          <div className="">
            <Button
              type="button"
              onClick={() => setShowAddDocumentoModal(true)}
              className="bg-accent hover:bg-accent/90 text-accent-foreground"
            >
              <Plus className="w-4 h-4 mr-2" />
              Añadir Capacitación Existente
            </Button>
          </div>

          <div className="border border-border rounded-lg overflow-hidden bg-card">
            <div className="bg-muted/50 px-6 py-4 border-b border-border flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-foreground">Capacitaciones Predefinidas en esta Plantilla</h2>
                <p className="text-sm text-muted-foreground mt-1">
                  Estas capacitaciones se asignarán automáticamente cuando se aplique este plan a un colaborador
                </p>
              </div>
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
                {documentosSeleccionados.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center py-6 text-muted-foreground">
                      Aún no hay capacitaciones en este plan. Usa el botón añadir Capacitación Existente para empezar.
                    </td>
                  </tr>
                ) : (
                  documentosSeleccionados.map((doc) => (
                    <tr key={doc.ID_DOCUMENTO} className="border-b border-border hover:bg-muted/30">
                      <td className="px-6 py-3 text-sm">{doc.CODIGO}</td>
                      <td className="px-6 py-3 text-sm">{doc.TIPO_DOCUMENTO}</td>
                      <td className="px-6 py-3 text-sm">{doc.NOMBRE_DOCUMENTO}</td>
                      <td className="px-6 py-3 text-sm">{doc.ESTATUS}</td>
                      <td className="px-6 py-3 text-sm">{doc.VERSION}</td>
                      <td className="px-6 py-3">
                        <Button
                          type="button"
                          onClick={() => removeDocumento(doc.ID_DOCUMENTO)}
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

          {/* Action Buttons */}
          <div className="flex gap-3 justify-end">
            <Button onClick={onBack} variant="outline" type="button">
              Cancelar
            </Button>
            <Button type="submit">
              Guardar
            </Button>
          </div>
        </div>
      </form>

      {showAddDocumentoModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-card rounded-lg w-full max-w-3xl max-h-[80vh] flex flex-col border border-border">
              <div className="flex items-center justify-between p-6 border-b border-border">
                <div>
                  <h2 className="text-xl font-semibold text-foreground">Añadir Capacitaciones</h2>
                  <p className="text-sm text-muted-foreground mt-1">
                    Selecciona las capacitaciones que deseas agregar
                  </p>
                </div>
                <Button
                  type="button"
                  onClick={() => {
                    setShowAddDocumentoModal(false)
                    setDocumentosMarcados([])
                    setSearchTerm("")
                  }}
                  variant="ghost"
                  size="sm"
                >
                  <X className="w-5 h-5" />
                </Button>
              </div>

              <div className="p-6 pb-0">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    type="text"
                    placeholder="Buscar por nombre o código..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10"
                  />
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-6 space-y-3">
                {filteredDocumentos.length === 0 ? (
                  <div className="text-center py-6 text-muted-foreground">
                    No se encontraron capacitaciones que coincidan con la búsqueda.
                  </div>
                ) : (
                  filteredDocumentos.map((doc) => (
                    <div
                      key={doc.ID_DOCUMENTO}
                      onClick={() => toggleDocumentoSeleccion(doc.ID_DOCUMENTO)}
                      className={`border rounded-lg p-4 cursor-pointer transition-all ${
                        documentosMarcados.includes(doc.ID_DOCUMENTO)
                          ? "border-primary bg-primary/10"
                          : "border-border hover:border-primary/50 hover:bg-muted/50"
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <input
                          type="checkbox"
                          checked={documentosMarcados.includes(doc.ID_DOCUMENTO)}
                          onChange={() => {}}
                          className="mt-1 w-4 h-4 text-primary rounded border-border"
                        />
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <h3 className="font-semibold text-foreground">{doc.NOMBRE_DOCUMENTO}</h3>
                            <span className={`px-2 py-1 rounded text-xs ${doc.ESTATUS === "VIGENTE" ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" : "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400"}`}>
                              {doc.ESTATUS}
                            </span>
                          </div>


                          <p className="text-sm text-muted-foreground">
                            Código: {doc.CODIGO}
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">
                            Tipo: {doc.TIPO_DOCUMENTO}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>

              <div className="flex items-center justify-between p-6 border-t border-border">
                <p className="text-sm text-muted-foreground">
                  {documentosMarcados.length} capacitación
                  {documentosMarcados.length !== 1 ? "es" : ""} seleccionada
                  {documentosMarcados.length !== 1 ? "s" : ""}
                </p>
                <div className="flex gap-3">
                  <Button
                    type="button"
                    onClick={() => {
                      setShowAddDocumentoModal(false)
                      setDocumentosMarcados([])
                      setSearchTerm("")
                    }}
                    variant="outline"
                  >
                    Cancelar
                  </Button>
                  <Button
                    type="button"
                    onClick={handleAddDocumentos}
                    disabled={documentosMarcados.length === 0 || isSaving}
                    className="bg-accent hover:bg-accent/90 text-accent-foreground disabled:opacity-50"
                  >
                    {isSaving
                      ? "Guardando..."
                      : `Añadir (${documentosMarcados.length})`}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
    </div>
  )
}
