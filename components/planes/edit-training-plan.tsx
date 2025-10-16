"use client"

import { useState } from "react"
import { ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import type { TrainingPlan } from "./training-plans-module"

interface EditTrainingPlanProps {
  plan: TrainingPlan
  onBack: () => void
}

export default function EditTrainingPlan({ plan, onBack }: EditTrainingPlanProps) {
  const [planName, setPlanName] = useState(plan.name)
  const [planType, setPlanType] = useState(plan.type)
  const [planDescription, setPlanDescription] = useState(plan.description)
  const [planCode, setPlanCode] = useState(plan.code)
  const [planStatus, setPlanStatus] = useState(plan.status)

  const handleSave = () => {
    console.log("[v0] Updating plan:", {
      planName,
      planType,
      planDescription,
      planCode,
      planStatus,
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
          <h1 className="text-2xl font-semibold text-[#071C50]">Editar Plan de Capacitación</h1>
          <p className="text-sm text-[#071C50]/60">Actualiza la información del plan</p>
        </div>
      </div>

      {/* Form */}
      <div className="space-y-6">
        <div className="border border-[#DDEAFB] rounded-lg p-6">
          <h2 className="text-lg font-semibold text-[#071C50] mb-4">Información General</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-[#071C50] mb-2">Nombre del Plan</label>
              <Input value={planName} onChange={(e) => setPlanName(e.target.value)} className="border-[#DDEAFB]" />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#071C50] mb-2">Tipo</label>
              <select
                value={planType}
                onChange={(e) => setPlanType(e.target.value as any)}
                className="w-full px-3 py-2 border border-[#DDEAFB] rounded-md text-sm text-[#071C50] bg-white"
              >
                <option value="Inducción">Inducción</option>
                <option value="Programa">Programa</option>
                <option value="Individual">Individual</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-[#071C50] mb-2">Código</label>
              <Input value={planCode} onChange={(e) => setPlanCode(e.target.value)} className="border-[#DDEAFB]" />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#071C50] mb-2">Estado</label>
              <select
                value={planStatus}
                onChange={(e) => setPlanStatus(e.target.value as any)}
                className="w-full px-3 py-2 border border-[#DDEAFB] rounded-md text-sm text-[#071C50] bg-white"
              >
                <option value="Activo">Activo</option>
                <option value="Inactivo">Inactivo</option>
                <option value="Borrador">Borrador</option>
              </select>
            </div>
          </div>
          <div className="mt-4">
            <label className="block text-sm font-medium text-[#071C50] mb-2">Descripción</label>
            <Textarea
              value={planDescription}
              onChange={(e) => setPlanDescription(e.target.value)}
              rows={4}
              className="border-[#DDEAFB]"
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 justify-end">
          <Button onClick={onBack} variant="outline" className="border-[#071C50] text-[#071C50] bg-transparent">
            Cancelar
          </Button>
          <Button onClick={handleSave} className="bg-[#4BD37B] hover:bg-[#4BD37B]/90 text-white">
            Guardar Cambios
          </Button>
        </div>
      </div>
    </div>
  )
}
