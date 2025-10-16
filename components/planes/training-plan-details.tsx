"use client"

import { ArrowLeft, Edit, Users, Plus, X, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useState } from "react"
import type { TrainingPlan, Training } from "./training-plans-module"

interface TrainingPlanDetailsProps {
  plan: TrainingPlan
  onBack: () => void
  onEdit: (plan: TrainingPlan) => void
  onManageParticipants: (training: Training) => void
}

export default function TrainingPlanDetails({ plan, onBack, onEdit, onManageParticipants }: TrainingPlanDetailsProps) {
  const [showAddTrainingModal, setShowAddTrainingModal] = useState(false)
  const [selectedTrainings, setSelectedTrainings] = useState<string[]>([])
  const [planTrainings, setPlanTrainings] = useState<Training[]>([
    {
      id: "1",
      name: "Introducción a la Empresa",
      description: "Conocimiento de la historia, misión y valores",
      type: "Teórica",
      startDate: "2024-01-15",
      endDate: "2024-01-16",
      hasExam: true,
      hasDiploma: false,
      minScore: 70,
      trainer: "María González",
      status: "Completado",
    },
    {
      id: "2",
      name: "Seguridad Industrial Básica",
      description: "Normas de seguridad en el laboratorio",
      type: "Práctica",
      startDate: "2024-01-17",
      endDate: "2024-01-18",
      hasExam: true,
      hasDiploma: true,
      minScore: 80,
      trainer: "Carlos Ramírez",
      status: "En progreso",
    },
    {
      id: "3",
      name: "Manejo de Equipos",
      description: "Uso correcto de equipos de laboratorio",
      type: "Práctica",
      startDate: "2024-01-20",
      endDate: "2024-01-22",
      hasExam: false,
      hasDiploma: true,
      trainer: "Ana Martínez",
      status: "Pendiente",
    },
  ])
  const [isSaving, setIsSaving] = useState(false)
  const [showSuccessMessage, setShowSuccessMessage] = useState(false)

  const availableTrainings = [
    {
      id: "4",
      name: "Buenas Prácticas de Laboratorio",
      description: "Normas BPL para trabajo en laboratorio",
      trainer: "Dr. Roberto Silva",
      status: "Activa",
    },
    {
      id: "5",
      name: "Manejo de Sustancias Químicas",
      description: "Protocolos de manejo seguro de químicos",
      trainer: "Dra. Patricia López",
      status: "Activa",
    },
    {
      id: "6",
      name: "ISO 9001 Actualización",
      description: "Última versión de normas ISO 9001",
      trainer: "Ing. Fernando Ruiz",
      status: "Activa",
    },
    {
      id: "7",
      name: "Primeros Auxilios",
      description: "Atención básica de emergencias",
      trainer: "Enf. Laura Mendoza",
      status: "Borrador",
    },
  ]

  const toggleTrainingSelection = (trainingId: string) => {
    setSelectedTrainings((prev) =>
      prev.includes(trainingId) ? prev.filter((id) => id !== trainingId) : [...prev, trainingId],
    )
  }

  const handleAddTrainings = async () => {
    setIsSaving(true)
    console.log("[v0] Adding trainings to plan:", selectedTrainings)

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000))

    // Convert selected trainings to Training objects and add to plan
    const newTrainings: Training[] = selectedTrainings.map((id) => {
      const training = availableTrainings.find((t) => t.id === id)!
      return {
        id: training.id,
        name: training.name,
        description: training.description,
        type: "Teórica",
        startDate: new Date().toISOString().split("T")[0],
        endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
        hasExam: false,
        hasDiploma: false,
        minScore: 0,
        trainer: training.trainer,
        status: "Pendiente",
      }
    })

    setPlanTrainings((prev) => [...prev, ...newTrainings])
    setIsSaving(false)
    setShowAddTrainingModal(false)
    setSelectedTrainings([])

    // Show success message
    setShowSuccessMessage(true)
    setTimeout(() => setShowSuccessMessage(false), 3000)
  }

  return (
    <div className="flex-1 bg-white rounded-lg p-6 overflow-y-auto">
      {showSuccessMessage && (
        <div className="fixed top-4 right-4 bg-[#4BD37B] text-white px-6 py-3 rounded-lg shadow-lg flex items-center gap-2 z-50 animate-in slide-in-from-top">
          <Check className="w-5 h-5" />
          <span className="font-medium">Plan actualizado exitosamente</span>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Button onClick={onBack} variant="ghost" size="sm" className="text-[#071C50]">
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-semibold text-[#071C50]">{plan.name}</h1>
            <p className="text-sm text-[#071C50]/60">
              Plantilla {plan.code} • Al asignar este plan, se incluyen todas las capacitaciones listadas
            </p>
          </div>
        </div>
        <Button onClick={() => onEdit(plan)} className="bg-[#4B93E7] hover:bg-[#4B93E7]/90 text-white">
          <Edit className="w-4 h-4 mr-2" />
          Editar Plantilla
        </Button>
      </div>

      {/* General Information */}
      <div className="border border-[#DDEAFB] rounded-lg p-6 mb-6">
        <h2 className="text-lg font-semibold text-[#071C50] mb-4">Información General</h2>
        <div className="grid grid-cols-3 gap-6">
          <div>
            <p className="text-sm text-[#071C50]/60 mb-1">Tipo</p>
            <span className="px-3 py-1 bg-[#E7F1FF] text-[#071C50] rounded text-sm font-medium">{plan.type}</span>
          </div>
          <div>
            <p className="text-sm text-[#071C50]/60 mb-1">Estado</p>
            <span
              className={`px-3 py-1 rounded text-sm font-medium ${
                plan.status === "Activo"
                  ? "bg-[#4BD37B]/10 text-[#4BD37B]"
                  : plan.status === "Borrador"
                    ? "bg-[#F7AC25]/10 text-[#F7AC25]"
                    : "bg-[#DD2025]/10 text-[#DD2025]"
              }`}
            >
              {plan.status}
            </span>
          </div>
          <div>
            <p className="text-sm text-[#071C50]/60 mb-1">Fecha de creación</p>
            <p className="text-sm text-[#071C50] font-medium">{plan.createdAt}</p>
          </div>
        </div>
        <div className="mt-4">
          <p className="text-sm text-[#071C50]/60 mb-1">Descripción</p>
          <p className="text-sm text-[#071C50]">{plan.description}</p>
        </div>
        <div className="mt-4">
          <p className="text-sm text-[#071C50]/60 mb-2">Puestos Aplicables</p>
          <div className="flex flex-wrap gap-2">
            {plan.applicablePositions.map((position, idx) => (
              <span key={idx} className="px-3 py-1 bg-[#4B93E7] text-white rounded-full text-xs">
                {position}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Trainings Table */}
      <div className="border border-[#DDEAFB] rounded-lg overflow-hidden">
        <div className="bg-[#F3F8FF] px-6 py-4 border-b border-[#DDEAFB] flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-[#071C50]">Capacitaciones Predefinidas en esta Plantilla</h2>
            <p className="text-sm text-[#071C50]/60 mt-1">
              Estas capacitaciones se asignarán automáticamente cuando se aplique este plan a un colaborador
            </p>
          </div>
          <Button
            onClick={() => setShowAddTrainingModal(true)}
            className="bg-[#F7AC25] hover:bg-[#F7AC25]/90 text-white"
          >
            <Plus className="w-4 h-4 mr-2" />
            Añadir Capacitación Existente
          </Button>
        </div>
        <table className="w-full">
          <thead className="bg-[#F3F8FF]/50">
            <tr>
              <th className="text-left px-6 py-3 text-sm font-semibold text-[#071C50]">Nombre</th>
              <th className="text-left px-6 py-3 text-sm font-semibold text-[#071C50]">Tipo</th>
              <th className="text-left px-6 py-3 text-sm font-semibold text-[#071C50]">Capacitador</th>
              <th className="text-left px-6 py-3 text-sm font-semibold text-[#071C50]">Estado</th>
              <th className="text-left px-6 py-3 text-sm font-semibold text-[#071C50]">Fechas</th>
              <th className="text-left px-6 py-3 text-sm font-semibold text-[#071C50]">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {planTrainings.map((training) => (
              <tr key={training.id} className="border-t border-[#DDEAFB] hover:bg-[#F3F8FF]/30 transition-colors">
                <td className="px-6 py-4">
                  <p className="text-sm font-medium text-[#071C50]">{training.name}</p>
                  <p className="text-xs text-[#071C50]/60 mt-1">{training.description}</p>
                </td>
                <td className="px-6 py-4 text-sm text-[#071C50]">{training.type}</td>
                <td className="px-6 py-4 text-sm text-[#071C50]">{training.trainer || "-"}</td>
                <td className="px-6 py-4">
                  <span
                    className={`px-2 py-1 rounded text-xs ${
                      training.status === "Completado"
                        ? "bg-[#4BD37B]/10 text-[#4BD37B]"
                        : training.status === "En progreso"
                          ? "bg-[#F7AC25]/10 text-[#F7AC25]"
                          : "bg-[#071C50]/10 text-[#071C50]"
                    }`}
                  >
                    {training.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm text-[#071C50]">
                  {training.startDate} - {training.endDate}
                </td>
                <td className="px-6 py-4">
                  <div className="flex gap-2">
                    <Button
                      onClick={() => onManageParticipants(training)}
                      variant="ghost"
                      size="sm"
                      className="text-[#4B93E7] hover:text-[#4B93E7] hover:bg-[#E7F1FF]"
                    >
                      <Users className="w-4 h-4" />
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showAddTrainingModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg w-full max-w-3xl max-h-[80vh] flex flex-col">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-[#DDEAFB]">
              <div>
                <h2 className="text-xl font-semibold text-[#071C50]">Añadir Capacitaciones Existentes</h2>
                <p className="text-sm text-[#071C50]/60 mt-1">
                  Selecciona las capacitaciones que deseas agregar a esta plantilla
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

            {/* Modal Content */}
            <div className="flex-1 overflow-y-auto p-6">
              <div className="space-y-3">
                {availableTrainings.map((training) => (
                  <div
                    key={training.id}
                    onClick={() => toggleTrainingSelection(training.id)}
                    className={`border rounded-lg p-4 cursor-pointer transition-all ${
                      selectedTrainings.includes(training.id)
                        ? "border-[#4B93E7] bg-[#E7F1FF]"
                        : "border-[#DDEAFB] hover:border-[#4B93E7]/50 hover:bg-[#F3F8FF]"
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <input
                        type="checkbox"
                        checked={selectedTrainings.includes(training.id)}
                        onChange={() => {}}
                        className="mt-1 w-4 h-4 text-[#4B93E7] rounded border-[#DDEAFB] focus:ring-[#4B93E7]"
                      />
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <h3 className="font-semibold text-[#071C50]">{training.name}</h3>
                          <span
                            className={`px-2 py-1 rounded text-xs ${
                              training.status === "Activa"
                                ? "bg-[#4BD37B]/10 text-[#4BD37B]"
                                : "bg-[#F7AC25]/10 text-[#F7AC25]"
                            }`}
                          >
                            {training.status}
                          </span>
                        </div>
                        <p className="text-sm text-[#071C50]/60 mt-1">{training.description}</p>
                        <p className="text-xs text-[#071C50]/60 mt-2">Capacitador: {training.trainer}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-between p-6 border-t border-[#DDEAFB]">
              <p className="text-sm text-[#071C50]/60">
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
                  className="border-[#DDEAFB] text-[#071C50]"
                >
                  Cancelar
                </Button>
                <Button
                  onClick={handleAddTrainings}
                  disabled={selectedTrainings.length === 0 || isSaving}
                  className="bg-[#F7AC25] hover:bg-[#F7AC25]/90 text-white disabled:opacity-50"
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
    </div>
  )
}
