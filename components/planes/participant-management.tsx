"use client"

import { useState } from "react"
import { ArrowLeft, Search, UserPlus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import type { Training, Participant } from "./training-plans-module"

interface ParticipantManagementProps {
  training: Training
  onBack: () => void
}

export default function ParticipantManagement({ training, onBack }: ParticipantManagementProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")

  // Mock participants data
  const participants: Participant[] = [
    {
      id: "1",
      name: "Juan Pérez",
      position: "Químico Farmacéutico",
      department: "Laboratorio",
      status: "Aprobado",
    },
    {
      id: "2",
      name: "María González",
      position: "Analista de Calidad",
      department: "Control de Calidad",
      status: "Asignado",
    },
    {
      id: "3",
      name: "Carlos Ramírez",
      position: "Técnico de Laboratorio",
      department: "Laboratorio",
      status: "Pendiente",
    },
    {
      id: "4",
      name: "Ana Martínez",
      position: "Supervisor de Producción",
      department: "Producción",
      status: "Reprobado",
    },
    {
      id: "5",
      name: "Luis Torres",
      position: "Químico Analista",
      department: "Laboratorio",
      status: "Aprobado",
    },
  ]

  const filteredParticipants = participants.filter((participant) => {
    const matchesSearch = participant.name.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = statusFilter === "all" || participant.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const handleAddParticipants = () => {
    console.log("[v0] Add participants clicked")
    // Open modal to select and add participants
  }

  const handleUpdateStatus = (participantId: string, newStatus: string) => {
    console.log("[v0] Updating participant status:", participantId, newStatus)
    // Update participant status
  }

  return (
    <div className="flex-1 bg-white rounded-lg p-6 overflow-y-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Button onClick={onBack} variant="ghost" size="sm" className="text-[#071C50]">
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-semibold text-[#071C50]">Gestión de Participantes</h1>
            <p className="text-sm text-[#071C50]/60">{training.name}</p>
          </div>
        </div>
        <Button onClick={handleAddParticipants} className="bg-[#F7AC25] hover:bg-[#F7AC25]/90 text-white">
          <UserPlus className="w-4 h-4 mr-2" />
          Asignar Participantes
        </Button>
      </div>

      {/* Filters and Search */}
      <div className="flex gap-4 mb-6">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#071C50]/40" />
          <Input
            placeholder="Buscar por nombre..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 border-[#DDEAFB]"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-4 py-2 border border-[#DDEAFB] rounded-md text-sm text-[#071C50] bg-white"
        >
          <option value="all">Todos los estados</option>
          <option value="Asignado">Asignado</option>
          <option value="Aprobado">Aprobado</option>
          <option value="Reprobado">Reprobado</option>
          <option value="Pendiente">Pendiente</option>
        </select>
      </div>

      {/* Participants Table */}
      <div className="border border-[#DDEAFB] rounded-lg overflow-hidden">
        <table className="w-full">
          <thead className="bg-[#F3F8FF]">
            <tr>
              <th className="text-left px-6 py-3 text-sm font-semibold text-[#071C50]">Nombre del Colaborador</th>
              <th className="text-left px-6 py-3 text-sm font-semibold text-[#071C50]">Puesto</th>
              <th className="text-left px-6 py-3 text-sm font-semibold text-[#071C50]">Departamento</th>
              <th className="text-left px-6 py-3 text-sm font-semibold text-[#071C50]">Estado de Capacitación</th>
              <th className="text-left px-6 py-3 text-sm font-semibold text-[#071C50]">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {filteredParticipants.map((participant) => (
              <tr key={participant.id} className="border-t border-[#DDEAFB] hover:bg-[#F3F8FF]/30 transition-colors">
                <td className="px-6 py-4 text-sm font-medium text-[#071C50]">{participant.name}</td>
                <td className="px-6 py-4 text-sm text-[#071C50]">{participant.position}</td>
                <td className="px-6 py-4 text-sm text-[#071C50]">{participant.department}</td>
                <td className="px-6 py-4">
                  <span
                    className={`px-3 py-1 rounded text-xs font-medium ${
                      participant.status === "Aprobado"
                        ? "bg-[#4BD37B]/10 text-[#4BD37B]"
                        : participant.status === "Asignado"
                          ? "bg-[#4B93E7]/10 text-[#4B93E7]"
                          : participant.status === "Reprobado"
                            ? "bg-[#DD2025]/10 text-[#DD2025]"
                            : "bg-[#F7AC25]/10 text-[#F7AC25]"
                    }`}
                  >
                    {participant.status}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <select
                    value={participant.status}
                    onChange={(e) => handleUpdateStatus(participant.id, e.target.value)}
                    className="px-3 py-1 border border-[#DDEAFB] rounded text-xs text-[#071C50] bg-white"
                  >
                    <option value="Asignado">Asignado</option>
                    <option value="Aprobado">Aprobado</option>
                    <option value="Reprobado">Reprobado</option>
                    <option value="Pendiente">Pendiente</option>
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {filteredParticipants.length === 0 && (
        <div className="text-center py-12">
          <p className="text-[#071C50]/60">No se encontraron participantes</p>
        </div>
      )}
    </div>
  )
}
