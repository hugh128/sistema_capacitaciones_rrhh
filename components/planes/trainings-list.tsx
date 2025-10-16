"use client"

import { useState } from "react"
import { Search, Plus, Upload, BookOpen, Users, Calendar } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import type { Training } from "./trainings-module"
import { useAuth } from "@/contexts/auth-context"

interface TrainingsListProps {
  trainings: Training[]
  onCreateNew: () => void
  onViewDetails: (training: Training) => void
  onEdit: (training: Training) => void
}

export default function TrainingsList({ trainings, onCreateNew, onViewDetails, onEdit }: TrainingsListProps) {
  const { user } = useAuth()
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [trainerFilter, setTrainerFilter] = useState<string>("all")
  const [planFilter, setPlanFilter] = useState<string>("all")
  const [showPendingOnly, setShowPendingOnly] = useState(false)

  // Filter trainings based on user role
  const filteredTrainings = trainings.filter((training) => {
    // If user is Capacitador, only show their trainings
/*     if (user?.role === "Capacitador" && training.trainer !== user.name) {
      return false
    } */

    // Apply search filter
    if (searchTerm && !training.name.toLowerCase().includes(searchTerm.toLowerCase())) {
      return false
    }

    // Apply status filter
    if (statusFilter !== "all" && training.status !== statusFilter) {
      return false
    }

    // Apply trainer filter
    if (trainerFilter !== "all" && training.trainer !== trainerFilter) {
      return false
    }

    // Apply plan filter
    if (planFilter !== "all") {
      if (planFilter === "independent" && training.associatedPlan) {
        return false
      }
      if (planFilter !== "independent" && training.associatedPlan !== planFilter) {
        return false
      }
    }

    // Apply pending only filter
    if (showPendingOnly && training.status !== "Borrador") {
      return false
    }

    return true
  })

  const handleImportCSV = () => {
    const input = document.createElement("input")
    input.type = "file"
    input.accept = ".csv,.xlsx"
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0]
      if (file) {
        console.log("[v0] Importing CSV/Excel file:", file.name)
        alert(
          `Importando archivo: ${file.name}\n\nEsta funcionalidad procesará el archivo y mostrará una vista previa.`,
        )
      }
    }
    input.click()
  }

  const uniqueTrainers = Array.from(new Set(trainings.map((t) => t.trainer)))
  const uniquePlans = Array.from(new Set(trainings.map((t) => t.associatedPlan).filter(Boolean)))

  const canCreateTraining = 'RRHH' === "RRHH"

  return (
    <div className="flex-1 bg-white rounded-lg p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-[#071C50] mb-2">Capacitaciones</h1>
          <p className="text-sm text-[#071C50]/60">
            Todas las capacitaciones del sistema. Algunas pertenecen a planes (plantillas) y otras son independientes.
          </p>
        </div>
        <div className="flex gap-3">
          {canCreateTraining && (
            <>
              <Button
                onClick={handleImportCSV}
                variant="outline"
                className="border-[#4B93E7] text-[#4B93E7] hover:bg-[#E7F1FF] bg-transparent"
              >
                <Upload className="w-4 h-4 mr-2" />
                Importar CSV/Excel
              </Button>
              <Button onClick={onCreateNew} className="bg-[#F7AC25] hover:bg-[#F7AC25]/90 text-white">
                <Plus className="w-4 h-4 mr-2" />
                Crear Nueva Capacitación
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#909090]" />
          <Input
            placeholder="Buscar por nombre..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 border-[#DDEAFB] focus:border-[#4B93E7]"
          />
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-2 border border-[#DDEAFB] rounded-md text-sm focus:outline-none focus:border-[#4B93E7]"
        >
          <option value="all">Todos los estados</option>
          <option value="Borrador">Borrador</option>
          <option value="Activa">Activa</option>
          <option value="Finalizada">Finalizada</option>
        </select>

        <select
          value={trainerFilter}
          onChange={(e) => setTrainerFilter(e.target.value)}
          className="px-3 py-2 border border-[#DDEAFB] rounded-md text-sm focus:outline-none focus:border-[#4B93E7]"
        >
          <option value="all">Todos los capacitadores</option>
          {uniqueTrainers.map((trainer) => (
            <option key={trainer} value={trainer}>
              {trainer}
            </option>
          ))}
        </select>

        <select
          value={planFilter}
          onChange={(e) => setPlanFilter(e.target.value)}
          className="px-3 py-2 border border-[#DDEAFB] rounded-md text-sm focus:outline-none focus:border-[#4B93E7]"
        >
          <option value="all">Todos los planes</option>
          <option value="independent">Independientes</option>
          {uniquePlans.map((plan) => (
            <option key={plan} value={plan}>
              {plan}
            </option>
          ))}
        </select>

        <label className="flex items-center gap-2 px-3 py-2 border border-[#DDEAFB] rounded-md cursor-pointer hover:bg-[#F3F8FF]">
          <input
            type="checkbox"
            checked={showPendingOnly}
            onChange={(e) => setShowPendingOnly(e.target.checked)}
            className="w-4 h-4 text-[#4B93E7] border-[#DDEAFB] rounded focus:ring-[#4B93E7]"
          />
          <span className="text-sm text-[#071C50]">Solo pendientes</span>
        </label>
      </div>

      {/* Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTrainings.map((training) => (
          <div
            key={training.id}
            className="bg-white border border-[#E5EDF9] rounded-lg p-6 hover:shadow-lg transition-shadow cursor-pointer"
            onClick={() => onViewDetails(training)}
          >
            {/* Header with status badge */}
            <div className="flex items-start justify-between mb-4">
              <h3 className="text-lg font-semibold text-[#071C50] flex-1">{training.name}</h3>
              <span
                className={`px-3 py-1 rounded-full text-xs font-semibold ${
                  training.status === "Activa"
                    ? "bg-[#4BD37B] text-white"
                    : training.status === "Borrador"
                      ? "bg-[#909090] text-white"
                      : "bg-[#4B93E7] text-white"
                }`}
              >
                {training.status}
              </span>
            </div>

            {/* Training code */}
            <p className="text-sm text-[#7A7B7C] mb-4">{training.id}</p>

            {/* Description */}
            <p className="text-sm text-[#464648] mb-4 line-clamp-2">{training.description}</p>

            {/* Details */}
            <div className="space-y-2 mb-4">
              <div className="flex items-center gap-2 text-sm text-[#071C50]">
                <Users className="w-4 h-4 text-[#4B93E7]" />
                <span>Capacitador: {training.trainer}</span>
              </div>

              {training.associatedPlan ? (
                <div className="flex items-center gap-2 text-sm text-[#071C50]">
                  <BookOpen className="w-4 h-4 text-[#4B93E7]" />
                  <span>
                    Parte del plan: <strong>{training.associatedPlan}</strong>
                  </span>
                </div>
              ) : (
                <div className="flex items-center gap-2 text-sm text-[#909090]">
                  <BookOpen className="w-4 h-4 text-[#909090]" />
                  <span className="italic">Capacitación independiente</span>
                </div>
              )}

              <div className="flex items-center gap-2 text-sm text-[#071C50]">
                <Users className="w-4 h-4 text-[#4B93E7]" />
                <span>{training.participantCount} participantes</span>
              </div>

              <div className="flex items-center gap-2 text-sm text-[#071C50]">
                <Calendar className="w-4 h-4 text-[#4B93E7]" />
                <span>{new Date(training.creationDate).toLocaleDateString("es-ES")}</span>
              </div>
            </div>

            {/* Applicable positions */}
            <div className="flex flex-wrap gap-2 mb-4">
              {training.applicablePositions.slice(0, 2).map((position, idx) => (
                <span key={idx} className="px-2 py-1 bg-[#E7F1FF] text-[#4B93E7] text-xs rounded-full">
                  {position}
                </span>
              ))}
              {training.applicablePositions.length > 2 && (
                <span className="px-2 py-1 bg-[#E7F1FF] text-[#4B93E7] text-xs rounded-full">
                  +{training.applicablePositions.length - 2}
                </span>
              )}
            </div>

            {/* View details button */}
            <Button
              onClick={(e) => {
                e.stopPropagation()
                onViewDetails(training)
              }}
              variant="outline"
              className="w-full border-[#4B93E7] text-[#4B93E7] hover:bg-[#E7F1FF]"
            >
              Ver Detalles
            </Button>
          </div>
        ))}
      </div>

      {filteredTrainings.length === 0 && (
        <div className="text-center py-12">
          <p className="text-[#909090] text-lg">No se encontraron capacitaciones</p>
        </div>
      )}
    </div>
  )
}
