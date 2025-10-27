"use client"

import { useState } from "react"
import { ArrowLeft, X, Check } from "lucide-react"
import type { Collaborator } from "@/lib/colaboradores/type"

type StatusSidebarProps = {
  collaborator: Collaborator
  onBack: () => void
}

export default function StatusSidebar({ collaborator, onBack }: StatusSidebarProps) {
  const [showEditScore, setShowEditScore] = useState(false)
  const [score, setScore] = useState(collaborator.completionScore)

  const trainingItems = [
    { label: "Cumplimiento de Capacitación obligatoria", value: `${collaborator.completionScore}%`, status: null },
    { label: "Última Capacitación", value: "ISO", status: null },
    { label: "Próxima Capacitación", value: "Manejo de químicos", status: null },
    { label: "Inducción", value: "", status: "cross" },
    { label: "Seguridad Industrial", value: "", status: "check" },
    { label: "ISO", value: "", status: "check" },
    { label: "Buenas Prácticas de Laboratorio", value: "", status: "check" },
    { label: "Manejo de Químicos", value: "", status: "cross" },
  ]

  return (
    <div className="w-[457px] flex-shrink-0">
      {/* Back Button */}
      <div className="flex items-center gap-2 mb-6">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-xs font-semibold text-foreground hover:text-primary transition-colors"
        >
          <ArrowLeft className="w-6 h-6 opacity-50" />
          <span>Atrás</span>
        </button>
      </div>

      {/* Estado Actual Card */}
      <div className="bg-card rounded-lg p-6 mb-4">
        <h2 className="text-base font-semibold text-foreground mb-4">Estado Actual</h2>

        {/* Puesto */}
        <div className="flex items-center justify-between mb-3">
          <span className="text-base text-muted-foreground">Puesto</span>
          <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900 rounded-[9px] text-xs font-semibold text-blue-700 dark:text-blue-300">
            {collaborator.position}
          </span>
        </div>

        {/* Jefe Inmediato */}
        <div className="flex items-center justify-between mb-3">
          <span className="text-base text-muted-foreground">Jefe Inm.</span>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-primary/30 flex items-center justify-center">
              <div className="w-[22px] h-[22px] rounded-full bg-muted" />
            </div>
            <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900 rounded-[9px] text-xs font-semibold text-blue-700 dark:text-blue-300">
              {collaborator.manager}
            </span>
          </div>
        </div>

        {/* Fecha ingreso */}
        <div className="flex items-center justify-between">
          <span className="text-base text-muted-foreground">Fecha ingreso</span>
          <span className="text-base font-semibold text-muted-foreground">{collaborator.joinDate}</span>
        </div>

        {/* Divider */}
        <div className="w-full h-0.5 bg-border my-4" />

        {/* Score */}
        <div className="bg-card border border-border rounded-lg p-6 flex flex-col items-center">
          <div className="relative w-12 h-12 mb-4">
            <div className="absolute inset-0 rounded-full bg-green-500/20" />
            <div
              className="absolute inset-0 rounded-full border-4 border-green-500"
              style={{ clipPath: `polygon(0 0, 100% 0, 100% ${score}%, 0 ${score}%)` }}
            />
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-base font-semibold text-green-600 dark:text-green-400">{score}</span>
            </div>
          </div>
          <p className="text-base font-semibold text-foreground mb-1">% de cumplimiento:</p>
        </div>
      </div>

      {/* Resumen del Estado de Capacitación */}
      <div className="bg-card border-2 border-border rounded-lg p-6">
        <h2 className="text-base font-semibold text-foreground mb-6">Resumen del Estado de Capacitación</h2>

        <div className="space-y-4">
          {trainingItems.map((item, index) => (
            <div key={index} className="flex items-center justify-between">
              <span className="text-base text-foreground">{item.label}</span>
              {item.value && <span className="text-base text-muted-foreground">{item.value}</span>}
              {item.status === "check" && <Check className="w-4 h-4 text-green-500" strokeWidth={3} />}
              {item.status === "cross" && <X className="w-4 h-4 text-red-500" strokeWidth={3} />}
            </div>
          ))}
        </div>
      </div>

      {/* Edit Score Modal */}
      {showEditScore && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-card rounded-lg p-8 max-w-md w-full mx-4">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-foreground">Editar Cumplimiento</h2>
              <button onClick={() => setShowEditScore(false)}>
                <X className="w-5 h-5 text-foreground" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-foreground mb-2">Porcentaje de Cumplimiento</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={score}
                  onChange={(e) => setScore(Number(e.target.value))}
                  className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:border-primary bg-background text-foreground"
                />
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={score}
                  onChange={(e) => setScore(Number(e.target.value))}
                  className="w-full mt-4"
                />
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => {
                    setShowEditScore(false)
                  }}
                  className="flex-1 px-4 py-2 bg-yellow-500 text-white font-semibold rounded-lg hover:bg-yellow-600"
                >
                  Guardar
                </button>
                <button
                  onClick={() => setShowEditScore(false)}
                  className="flex-1 px-4 py-2 border border-border text-foreground font-semibold rounded-lg hover:bg-muted"
                >
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
