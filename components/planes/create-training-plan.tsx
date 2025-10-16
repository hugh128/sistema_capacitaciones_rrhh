"use client"

import { useState } from "react"
import { ArrowLeft, Plus, Trash2, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"

interface CreateTrainingPlanProps {
  onBack: () => void
}

type TrainingItem = {
  id: string
  name: string
  description: string
  hasExam: boolean
  hasDiploma: boolean
  minScore: string
  trainer: string
  status: "Borrador" | "Activa"
  applicablePositions: string[]
}

const AVAILABLE_POSITIONS = [
  "Químico Farmacéutico",
  "Analista de Laboratorio",
  "Técnico de Laboratorio",
  "Gerente de Calidad",
  "Supervisor de Producción",
  "Coordinador de RRHH",
  "Asistente Administrativo",
]

export default function CreateTrainingPlan({ onBack }: CreateTrainingPlanProps) {
  const [planName, setPlanName] = useState("")
  const [planType, setPlanType] = useState("Inducción")
  const [planDescription, setPlanDescription] = useState("")
  const [planCode, setPlanCode] = useState("")
  const [applicablePositions, setApplicablePositions] = useState<string[]>([])
  const [trainings, setTrainings] = useState<TrainingItem[]>([])

  const togglePosition = (position: string) => {
    setApplicablePositions((prev) =>
      prev.includes(position) ? prev.filter((p) => p !== position) : [...prev, position],
    )
  }

  const toggleTrainingPosition = (trainingId: string, position: string) => {
    setTrainings(
      trainings.map((t) =>
        t.id === trainingId
          ? {
              ...t,
              applicablePositions: t.applicablePositions.includes(position)
                ? t.applicablePositions.filter((p) => p !== position)
                : [...t.applicablePositions, position],
            }
          : t,
      ),
    )
  }

  const addTraining = () => {
    const newTraining: TrainingItem = {
      id: Date.now().toString(),
      name: "",
      description: "",
      hasExam: false,
      hasDiploma: false,
      minScore: "",
      trainer: "",
      status: "Borrador",
      applicablePositions: [],
    }
    setTrainings([...trainings, newTraining])
  }

  const removeTraining = (id: string) => {
    setTrainings(trainings.filter((t) => t.id !== id))
  }

  const updateTraining = (id: string, field: keyof TrainingItem, value: any) => {
    setTrainings(trainings.map((t) => (t.id === id ? { ...t, [field]: value } : t)))
  }

  const handleSave = (status: "Borrador" | "Activo") => {
    console.log("[v0] Saving plan as:", status, {
      planName,
      planType,
      planDescription,
      planCode,
      applicablePositions,
      trainings,
    })
    onBack()
  }

  return (
    <div className="flex-1 bg-white rounded-lg p-6 overflow-y-auto">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Button onClick={onBack} variant="ghost" size="sm" className="text-[#071C50]">
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-semibold text-[#071C50]">Crear Plan de Capacitación</h1>
          <p className="text-sm text-[#071C50]/60">
            Crea una plantilla con capacitaciones predefinidas que se asignarán automáticamente a los colaboradores
          </p>
        </div>
      </div>

      {/* Form */}
      <div className="space-y-6">
        {/* General Information */}
        <div className="border border-[#DDEAFB] rounded-lg p-6">
          <h2 className="text-lg font-semibold text-[#071C50] mb-4">Información General</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-[#071C50] mb-2">
                Nombre del Plan <span className="text-[#DD2025]">*</span>
              </label>
              <Input
                value={planName}
                onChange={(e) => setPlanName(e.target.value)}
                placeholder="Ej: Inducción General"
                className="border-[#DDEAFB]"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#071C50] mb-2">
                Tipo <span className="text-[#DD2025]">*</span>
              </label>
              <select
                value={planType}
                onChange={(e) => setPlanType(e.target.value)}
                className="w-full px-3 py-2 border border-[#DDEAFB] rounded-md text-sm text-[#071C50] bg-white"
              >
                <option value="Inducción">Inducción</option>
                <option value="Programa">Programa</option>
                <option value="Individual">Individual</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-[#071C50] mb-2">Código (Opcional)</label>
              <Input
                value={planCode}
                onChange={(e) => setPlanCode(e.target.value)}
                placeholder="Ej: IND-001"
                className="border-[#DDEAFB]"
              />
            </div>
          </div>
          <div className="mt-4">
            <label className="block text-sm font-medium text-[#071C50] mb-2">Descripción</label>
            <Textarea
              value={planDescription}
              onChange={(e) => setPlanDescription(e.target.value)}
              placeholder="Describe el objetivo y alcance del plan..."
              rows={4}
              className="border-[#DDEAFB]"
            />
          </div>

          <div className="mt-4">
            <label className="block text-sm font-medium text-[#071C50] mb-2">
              Puestos Aplicables <span className="text-[#DD2025]">*</span>
            </label>
            <div className="flex flex-wrap gap-2 mb-3">
              {applicablePositions.map((position) => (
                <span
                  key={position}
                  className="inline-flex items-center gap-1 px-3 py-1 bg-[#4B93E7] text-white rounded-full text-sm"
                >
                  {position}
                  <button onClick={() => togglePosition(position)} className="hover:bg-white/20 rounded-full p-0.5">
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
            <div className="flex flex-wrap gap-2">
              {AVAILABLE_POSITIONS.filter((p) => !applicablePositions.includes(p)).map((position) => (
                <button
                  key={position}
                  onClick={() => togglePosition(position)}
                  className="px-3 py-1 border border-[#DDEAFB] text-[#071C50] rounded-full text-sm hover:bg-[#F3F8FF] transition-colors"
                >
                  + {position}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Trainings Section */}
        <div className="border border-[#DDEAFB] rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg font-semibold text-[#071C50]">Capacitaciones Predefinidas</h2>
              <p className="text-xs text-[#071C50]/60 mt-1">
                Define las capacitaciones que formarán parte de esta plantilla
              </p>
            </div>
            <Button onClick={addTraining} size="sm" className="bg-[#4B93E7] hover:bg-[#4B93E7]/90 text-white">
              <Plus className="w-4 h-4 mr-2" />
              Agregar Capacitación
            </Button>
          </div>

          {trainings.length === 0 ? (
            <div className="text-center py-8 text-[#071C50]/60">
              <p>No hay capacitaciones agregadas. Haz clic en Agregar Capacitación para comenzar.</p>
              <p className="text-xs mt-2">
                Las capacitaciones que agregues aquí se asignarán automáticamente cuando uses este plan.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {trainings.map((training, index) => (
                <div key={training.id} className="border border-[#DDEAFB] rounded-lg p-4 bg-[#F3F8FF]/30">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-medium text-[#071C50]">Capacitación {index + 1}</h3>
                    <Button
                      onClick={() => removeTraining(training.id)}
                      variant="ghost"
                      size="sm"
                      className="text-[#DD2025] hover:text-[#DD2025] hover:bg-[#DD2025]/10"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-[#071C50] mb-1">Nombre</label>
                      <Input
                        value={training.name}
                        onChange={(e) => updateTraining(training.id, "name", e.target.value)}
                        placeholder="Nombre de la capacitación"
                        className="border-[#DDEAFB] text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-[#071C50] mb-1">Capacitador (Opcional)</label>
                      <Input
                        value={training.trainer}
                        onChange={(e) => updateTraining(training.id, "trainer", e.target.value)}
                        placeholder="Nombre del capacitador"
                        className="border-[#DDEAFB] text-sm"
                      />
                    </div>
                    <div className="col-span-2">
                      <label className="block text-xs font-medium text-[#071C50] mb-1">Descripción</label>
                      <Textarea
                        value={training.description}
                        onChange={(e) => updateTraining(training.id, "description", e.target.value)}
                        placeholder="Descripción de la capacitación"
                        rows={2}
                        className="border-[#DDEAFB] text-sm"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-[#071C50] mb-1">Estado</label>
                      <select
                        value={training.status}
                        onChange={(e) => updateTraining(training.id, "status", e.target.value as "Borrador" | "Activa")}
                        className="w-full px-3 py-2 border border-[#DDEAFB] rounded-md text-sm text-[#071C50] bg-white"
                      >
                        <option value="Borrador">Borrador</option>
                        <option value="Activa">Activa</option>
                      </select>
                    </div>

                    <div className="flex items-center gap-4">
                      <label className="flex items-center gap-2 text-sm text-[#071C50]">
                        <input
                          type="checkbox"
                          checked={training.hasExam}
                          onChange={(e) => updateTraining(training.id, "hasExam", e.target.checked)}
                          className="rounded border-[#DDEAFB]"
                        />
                        Aplica examen
                      </label>
                      <label className="flex items-center gap-2 text-sm text-[#071C50]">
                        <input
                          type="checkbox"
                          checked={training.hasDiploma}
                          onChange={(e) => updateTraining(training.id, "hasDiploma", e.target.checked)}
                          className="rounded border-[#DDEAFB]"
                        />
                        Aplica diploma
                      </label>
                    </div>
                    {training.hasExam && (
                      <div>
                        <label className="block text-xs font-medium text-[#071C50] mb-1">Puntaje mínimo</label>
                        <Input
                          type="number"
                          value={training.minScore}
                          onChange={(e) => updateTraining(training.id, "minScore", e.target.value)}
                          placeholder="70"
                          min="0"
                          max="100"
                          className="border-[#DDEAFB] text-sm"
                        />
                      </div>
                    )}

                    <div className="col-span-2">
                      <label className="block text-xs font-medium text-[#071C50] mb-2">
                        Puestos Aplicables (puede diferir del plan)
                      </label>
                      <div className="flex flex-wrap gap-2 mb-2">
                        {training.applicablePositions.map((position) => (
                          <span
                            key={position}
                            className="inline-flex items-center gap-1 px-2 py-1 bg-[#A855F7] text-white rounded-full text-xs"
                          >
                            {position}
                            <button
                              onClick={() => toggleTrainingPosition(training.id, position)}
                              className="hover:bg-white/20 rounded-full p-0.5"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </span>
                        ))}
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {AVAILABLE_POSITIONS.filter((p) => !training.applicablePositions.includes(p)).map(
                          (position) => (
                            <button
                              key={position}
                              onClick={() => toggleTrainingPosition(training.id, position)}
                              className="px-2 py-1 border border-[#DDEAFB] text-[#071C50] rounded-full text-xs hover:bg-[#F3F8FF] transition-colors"
                            >
                              + {position}
                            </button>
                          ),
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 justify-end">
          <Button onClick={onBack} variant="outline" className="border-[#071C50] text-[#071C50] bg-transparent">
            Cancelar
          </Button>
          <Button
            onClick={() => handleSave("Borrador")}
            variant="outline"
            className="border-[#F7AC25] text-[#F7AC25] hover:bg-[#F7AC25]/10"
          >
            Guardar como Borrador
          </Button>
          <Button onClick={() => handleSave("Activo")} className="bg-[#4BD37B] hover:bg-[#4BD37B]/90 text-white">
            Guardar como Activo
          </Button>
        </div>
      </div>
    </div>
  )
}
