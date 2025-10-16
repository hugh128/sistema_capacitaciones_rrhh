"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ArrowLeft } from "lucide-react"
import type { Training } from "./trainings-module"

interface CreateTrainingProps {
  training?: Training | null
  onSave: (training: any) => void
  onCancel: () => void
}

export default function CreateTraining({ training, onSave, onCancel }: CreateTrainingProps) {
  const [formData, setFormData] = useState({
    name: training?.name || "",
    description: training?.description || "",
    trainer: training?.trainer || "",
    status: training?.status || "Borrador",
    associatedPlan: training?.associatedPlan || "",
    applicablePositions: training?.applicablePositions || [],
    appliesExam: training?.appliesExam || false,
    minimumScore: training?.minimumScore || 0,
  })

  const [newPosition, setNewPosition] = useState("")

  const availablePositions = [
    "Químico Farmacéutico",
    "Técnico de Laboratorio",
    "Supervisor de Producción",
    "Jefe de Área",
    "Analista",
    "Gerente",
  ]

  const handleAddPosition = (position: string) => {
    if (position && !formData.applicablePositions.includes(position)) {
      setFormData({
        ...formData,
        applicablePositions: [...formData.applicablePositions, position],
      })
    }
    setNewPosition("")
  }

  const handleRemovePosition = (position: string) => {
    setFormData({
      ...formData,
      applicablePositions: formData.applicablePositions.filter((p) => p !== position),
    })
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.name || formData.applicablePositions.length === 0) {
      alert("Por favor complete los campos requeridos: Nombre y Puestos Aplicables")
      return
    }
    onSave(formData)
  }

  return (
    <div className="flex-1 bg-white rounded-lg p-6">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Button onClick={onCancel} variant="ghost" size="icon" className="text-[#071C50]">
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <h1 className="text-2xl font-semibold text-[#071C50]">
          {training ? "Editar Capacitación" : "Crear Nueva Capacitación"}
        </h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-semibold text-[#071C50] mb-2">
              Nombre <span className="text-red-500">*</span>
            </label>
            <Input
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Nombre de la capacitación"
              className="border-[#DDEAFB] focus:border-[#4B93E7]"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-[#071C50] mb-2">Capacitador</label>
            <Input
              value={formData.trainer}
              onChange={(e) => setFormData({ ...formData, trainer: e.target.value })}
              placeholder="Nombre del capacitador"
              className="border-[#DDEAFB] focus:border-[#4B93E7]"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-[#071C50] mb-2">Estado</label>
            <select
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
              className="w-full px-3 py-2 border border-[#DDEAFB] rounded-md focus:outline-none focus:border-[#4B93E7]"
            >
              <option value="Borrador">Borrador</option>
              <option value="Activa">Activa</option>
              <option value="Finalizada">Finalizada</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-[#071C50] mb-2">Plan Asociado</label>
            <Input
              value={formData.associatedPlan}
              onChange={(e) => setFormData({ ...formData, associatedPlan: e.target.value })}
              placeholder="Código del plan (opcional)"
              className="border-[#DDEAFB] focus:border-[#4B93E7]"
            />
          </div>
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-semibold text-[#071C50] mb-2">Descripción</label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            placeholder="Descripción de la capacitación"
            rows={4}
            className="w-full px-3 py-2 border border-[#DDEAFB] rounded-md focus:outline-none focus:border-[#4B93E7]"
          />
        </div>

        {/* Applicable Positions */}
        <div>
          <label className="block text-sm font-semibold text-[#071C50] mb-2">
            Puestos Aplicables <span className="text-red-500">*</span>
          </label>
          <div className="flex gap-2 mb-3">
            <select
              value={newPosition}
              onChange={(e) => setNewPosition(e.target.value)}
              className="flex-1 px-3 py-2 border border-[#DDEAFB] rounded-md focus:outline-none focus:border-[#4B93E7]"
            >
              <option value="">Seleccionar puesto...</option>
              {availablePositions.map((pos) => (
                <option key={pos} value={pos}>
                  {pos}
                </option>
              ))}
            </select>
            <Button type="button" onClick={() => handleAddPosition(newPosition)} className="bg-[#4B93E7]">
              Agregar
            </Button>
          </div>
          <div className="flex flex-wrap gap-2">
            {formData.applicablePositions.map((position) => (
              <span
                key={position}
                className="px-3 py-1 bg-[#E7F1FF] text-[#4B93E7] rounded-full text-sm flex items-center gap-2"
              >
                {position}
                <button
                  type="button"
                  onClick={() => handleRemovePosition(position)}
                  className="text-[#DD2025] hover:text-[#DD2025]/80"
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        </div>

        {/* Exam Settings */}
        <div className="border border-[#E5EDF9] rounded-lg p-4">
          <label className="flex items-center gap-2 mb-4">
            <input
              type="checkbox"
              checked={formData.appliesExam}
              onChange={(e) => setFormData({ ...formData, appliesExam: e.target.checked })}
              className="w-4 h-4 text-[#4B93E7] border-[#DDEAFB] rounded focus:ring-[#4B93E7]"
            />
            <span className="text-sm font-semibold text-[#071C50]">Aplica Examen</span>
          </label>

          {formData.appliesExam && (
            <div>
              <label className="block text-sm font-semibold text-[#071C50] mb-2">Puntaje Mínimo</label>
              <Input
                type="number"
                min="0"
                max="100"
                value={formData.minimumScore}
                onChange={(e) => setFormData({ ...formData, minimumScore: Number.parseInt(e.target.value) || 0 })}
                placeholder="Puntaje mínimo para aprobar"
                className="border-[#DDEAFB] focus:border-[#4B93E7]"
              />
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 justify-end pt-4 border-t border-[#E5EDF9]">
          <Button
            type="button"
            onClick={onCancel}
            variant="outline"
            className="border-[#909090] text-[#909090] bg-transparent"
          >
            Cancelar
          </Button>
          <Button type="submit" className="bg-[#F7AC25] hover:bg-[#F7AC25]/90 text-white">
            {training ? "Actualizar" : "Crear"} Capacitación
          </Button>
        </div>
      </form>
    </div>
  )
}
