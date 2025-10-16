"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Upload, UserPlus, UserMinus } from "lucide-react"
import type { Training, Participant } from "./trainings-module"
import { useAuth } from "@/contexts/auth-context"

interface TrainingDetailsProps {
  training: Training
  onBack: () => void
}

export default function TrainingDetails({ training, onBack }: TrainingDetailsProps) {
  const { user } = useAuth()
  const [participants, setParticipants] = useState<Participant[]>([
    {
      id: "1",
      name: "Juan Pérez",
      position: "Químico Farmacéutico",
      status: "Aprobado",
      score: 92,
      examFile: "examen_juan_perez.pdf",
    },
    {
      id: "2",
      name: "María González",
      position: "Técnico de Laboratorio",
      status: "Pendiente",
    },
    {
      id: "3",
      name: "Carlos Méndez",
      position: "Químico Farmacéutico",
      status: "Asignado",
    },
    {
      id: "4",
      name: "Ana Torres",
      position: "Supervisor de Producción",
      status: "Reprobado",
      score: 65,
      examFile: "examen_ana_torres.pdf",
    },
  ])

  const [showAddParticipant, setShowAddParticipant] = useState(false)

  const canManageParticipants = user?.role === "RRHH" || user?.role === "Capacitador"

  const handleUploadExam = (participantId: string) => {
    const input = document.createElement("input")
    input.type = "file"
    input.accept = ".pdf"
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0]
      if (file) {
        if (file.size > 10 * 1024 * 1024) {
          alert("El archivo no debe superar los 10MB")
          return
        }
        console.log("[v0] Uploading exam for participant:", participantId, file.name)
        setParticipants(
          participants.map((p) =>
            p.id === participantId
              ? {
                  ...p,
                  examFile: file.name,
                }
              : p,
          ),
        )
        alert(`Examen subido exitosamente: ${file.name}`)
      }
    }
    input.click()
  }

  const handleChangeStatus = (participantId: string, newStatus: Participant["status"]) => {
    setParticipants(participants.map((p) => (p.id === participantId ? { ...p, status: newStatus } : p)))
  }

  const handleUpdateScore = (participantId: string, score: number) => {
    setParticipants(participants.map((p) => (p.id === participantId ? { ...p, score } : p)))
  }

  const handleRemoveParticipant = (participantId: string) => {
    if (confirm("¿Está seguro de quitar este participante?")) {
      setParticipants(participants.filter((p) => p.id !== participantId))
    }
  }

  return (
    <div className="flex-1 bg-white rounded-lg p-6">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Button onClick={onBack} variant="ghost" size="icon" className="text-[#071C50]">
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div className="flex-1">
          <h1 className="text-2xl font-semibold text-[#071C50]">{training.name}</h1>
          <p className="text-sm text-[#7A7B7C]">{training.id}</p>
        </div>
        <span
          className={`px-4 py-2 rounded-full text-sm font-semibold ${
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

      {/* General Information */}
      <div className="bg-[#F3F8FF] rounded-lg p-6 mb-6">
        <h2 className="text-lg font-semibold text-[#071C50] mb-4">Información General</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-[#7A7B7C]">Descripción</p>
            <p className="text-[#071C50]">{training.description}</p>
          </div>
          <div>
            <p className="text-sm text-[#7A7B7C]">Capacitador</p>
            <p className="text-[#071C50]">{training.trainer}</p>
          </div>
          {training.associatedPlan && (
            <div>
              <p className="text-sm text-[#7A7B7C]">Plan Asociado</p>
              <p className="text-[#071C50]">{training.associatedPlan}</p>
            </div>
          )}
          <div>
            <p className="text-sm text-[#7A7B7C]">Fecha de Creación</p>
            <p className="text-[#071C50]">{new Date(training.creationDate).toLocaleDateString("es-ES")}</p>
          </div>
          <div>
            <p className="text-sm text-[#7A7B7C]">Aplica Examen</p>
            <p className="text-[#071C50]">{training.appliesExam ? "Sí" : "No"}</p>
          </div>
          {training.appliesExam && (
            <div>
              <p className="text-sm text-[#7A7B7C]">Puntaje Mínimo</p>
              <p className="text-[#071C50]">{training.minimumScore}%</p>
            </div>
          )}
        </div>
        <div className="mt-4">
          <p className="text-sm text-[#7A7B7C] mb-2">Puestos Aplicables</p>
          <div className="flex flex-wrap gap-2">
            {training.applicablePositions.map((position, idx) => (
              <span key={idx} className="px-3 py-1 bg-[#E7F1FF] text-[#4B93E7] text-sm rounded-full">
                {position}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Participants Section */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-[#071C50]">Participantes ({participants.length})</h2>
          {canManageParticipants && (
            <Button
              onClick={() => setShowAddParticipant(!showAddParticipant)}
              className="bg-[#4B93E7] hover:bg-[#4B93E7]/90 text-white"
            >
              <UserPlus className="w-4 h-4 mr-2" />
              Asignar Participante
            </Button>
          )}
        </div>

        {/* Participants Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#E5EDF9]">
                <th className="text-left py-3 px-4 text-sm font-semibold text-[#071C50]">Nombre</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-[#071C50]">Puesto</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-[#071C50]">Estado</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-[#071C50]">Nota</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-[#071C50]">Examen</th>
                {canManageParticipants && (
                  <th className="text-left py-3 px-4 text-sm font-semibold text-[#071C50]">Acciones</th>
                )}
              </tr>
            </thead>
            <tbody>
              {participants.map((participant) => (
                <tr key={participant.id} className="border-b border-[#E5EDF9] hover:bg-[#F3F8FF]">
                  <td className="py-3 px-4 text-sm text-[#071C50]">{participant.name}</td>
                  <td className="py-3 px-4 text-sm text-[#071C50]">{participant.position}</td>
                  <td className="py-3 px-4">
                    {canManageParticipants ? (
                      <select
                        value={participant.status}
                        onChange={(e) => handleChangeStatus(participant.id, e.target.value as Participant["status"])}
                        className="px-2 py-1 border border-[#DDEAFB] rounded text-sm focus:outline-none focus:border-[#4B93E7]"
                      >
                        <option value="Asignado">Asignado</option>
                        <option value="Pendiente">Pendiente</option>
                        <option value="Aprobado">Aprobado</option>
                        <option value="Reprobado">Reprobado</option>
                      </select>
                    ) : (
                      <span
                        className={`px-2 py-1 rounded text-xs font-semibold ${
                          participant.status === "Aprobado"
                            ? "bg-[#4BD37B] text-white"
                            : participant.status === "Reprobado"
                              ? "bg-[#DD2025] text-white"
                              : participant.status === "Pendiente"
                                ? "bg-[#F7AC25] text-white"
                                : "bg-[#909090] text-white"
                        }`}
                      >
                        {participant.status}
                      </span>
                    )}
                  </td>
                  <td className="py-3 px-4">
                    {canManageParticipants && training.appliesExam ? (
                      <input
                        type="number"
                        min="0"
                        max="100"
                        value={participant.score || ""}
                        onChange={(e) => handleUpdateScore(participant.id, Number.parseInt(e.target.value) || 0)}
                        placeholder="--"
                        className="w-16 px-2 py-1 border border-[#DDEAFB] rounded text-sm focus:outline-none focus:border-[#4B93E7]"
                      />
                    ) : (
                      <span className="text-sm text-[#071C50]">{participant.score || "--"}</span>
                    )}
                  </td>
                  <td className="py-3 px-4">
                    {participant.examFile ? (
                      <a href="#" className="text-sm text-[#4B93E7] hover:underline">
                        {participant.examFile}
                      </a>
                    ) : (
                      <span className="text-sm text-[#909090]">Sin examen</span>
                    )}
                  </td>
                  {canManageParticipants && (
                    <td className="py-3 px-4">
                      <div className="flex gap-2">
                        <Button
                          onClick={() => handleUploadExam(participant.id)}
                          size="sm"
                          variant="outline"
                          className="border-[#4B93E7] text-[#4B93E7] hover:bg-[#E7F1FF]"
                        >
                          <Upload className="w-3 h-3 mr-1" />
                          Subir
                        </Button>
                        <Button
                          onClick={() => handleRemoveParticipant(participant.id)}
                          size="sm"
                          variant="outline"
                          className="border-[#DD2025] text-[#DD2025] hover:bg-red-50"
                        >
                          <UserMinus className="w-3 h-3" />
                        </Button>
                      </div>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {participants.length === 0 && (
          <div className="text-center py-12">
            <p className="text-[#909090]">No hay participantes asignados</p>
          </div>
        )}
      </div>
    </div>
  )
}
