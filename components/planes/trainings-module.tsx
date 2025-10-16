"use client"

import { useState } from "react"
import TrainingsList from "./trainings-list"
import CreateTraining from "./create-training"
import TrainingDetails from "./training-details"

export type Training = {
  id: string
  name: string
  description: string
  trainer: string
  status: "Borrador" | "Activa" | "Finalizada"
  associatedPlan?: string
  applicablePositions: string[]
  participantCount: number
  creationDate: string
  appliesExam: boolean
  minimumScore?: number
}

export type Participant = {
  id: string
  name: string
  position: string
  status: "Asignado" | "Pendiente" | "Aprobado" | "Reprobado"
  score?: number
  examFile?: string
}

export default function TrainingsModule() {
  const [currentView, setCurrentView] = useState<"list" | "create" | "edit" | "details">("list")
  const [selectedTraining, setSelectedTraining] = useState<Training | null>(null)
  const [trainings, setTrainings] = useState<Training[]>([
    {
      id: "CAP-001",
      name: "Seguridad Industrial Básica",
      description: "Capacitación sobre normas de seguridad en el laboratorio",
      trainer: "Carlos Méndez",
      status: "Activa",
      associatedPlan: "PLAN-IND-001",
      applicablePositions: ["Químico Farmacéutico", "Técnico de Laboratorio"],
      participantCount: 12,
      creationDate: "2024-01-15",
      appliesExam: true,
      minimumScore: 80,
    },
    {
      id: "CAP-002",
      name: "Buenas Prácticas de Manufactura",
      description: "Introducción a GMP y normativas farmacéuticas",
      trainer: "María González",
      status: "Activa",
      associatedPlan: "PLAN-IND-001",
      applicablePositions: ["Químico Farmacéutico", "Supervisor de Producción"],
      participantCount: 8,
      creationDate: "2024-01-20",
      appliesExam: true,
      minimumScore: 85,
    },
    {
      id: "CAP-003",
      name: "Liderazgo y Gestión de Equipos",
      description: "Desarrollo de habilidades de liderazgo",
      trainer: "Roberto Silva",
      status: "Borrador",
      associatedPlan: "PLAN-IND-002",
      applicablePositions: ["Jefe de Área", "Supervisor"],
      participantCount: 5,
      creationDate: "2024-02-01",
      appliesExam: false,
    },
    {
      id: "CAP-004",
      name: "Manejo de Sustancias Químicas",
      description: "Capacitación independiente sobre manejo seguro de químicos",
      trainer: "Ana Torres",
      status: "Activa",
      applicablePositions: ["Químico Farmacéutico", "Técnico de Laboratorio", "Analista"],
      participantCount: 15,
      creationDate: "2024-02-10",
      appliesExam: true,
      minimumScore: 90,
    },
  ])

  const handleCreateTraining = (training: Omit<Training, "id" | "creationDate" | "participantCount">) => {
    const newTraining: Training = {
      ...training,
      id: `CAP-${String(trainings.length + 1).padStart(3, "0")}`,
      creationDate: new Date().toISOString().split("T")[0],
      participantCount: 0,
    }
    setTrainings([...trainings, newTraining])
    setCurrentView("list")
  }

  const handleUpdateTraining = (updatedTraining: Training) => {
    setTrainings(trainings.map((t) => (t.id === updatedTraining.id ? updatedTraining : t)))
    setCurrentView("list")
  }

  const handleViewDetails = (training: Training) => {
    setSelectedTraining(training)
    setCurrentView("details")
  }

  const handleEditTraining = (training: Training) => {
    setSelectedTraining(training)
    setCurrentView("edit")
  }

  return (
    <div className="flex-1">
      {currentView === "list" && (
        <TrainingsList
          trainings={trainings}
          onCreateNew={() => setCurrentView("create")}
          onViewDetails={handleViewDetails}
          onEdit={handleEditTraining}
        />
      )}
      {(currentView === "create" || currentView === "edit") && (
        <CreateTraining
          training={currentView === "edit" ? selectedTraining : undefined}
          onSave={currentView === "edit" ? handleUpdateTraining : handleCreateTraining}
          onCancel={() => setCurrentView("list")}
        />
      )}
      {currentView === "details" && selectedTraining && (
        <TrainingDetails training={selectedTraining} onBack={() => setCurrentView("list")} />
      )}
    </div>
  )
}
