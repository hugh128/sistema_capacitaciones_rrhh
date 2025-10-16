"use client"

import { useState } from "react"
import TrainingPlansList from "./training-plans-list"
import CreateTrainingPlan from "./create-training-plan"
import TrainingPlanDetails from "./training-plan-details"
import EditTrainingPlan from "./edit-training-plan"
import ParticipantManagement from "./participant-management"

export type TrainingPlan = {
  id: string
  code: string
  name: string
  type: "Inducción" | "Programa" | "Individual"
  status: "Activo" | "Borrador"
  createdAt: string
  description: string
  trainings: Training[]
  department?: string
  trainingCount?: number
  applicablePositions: string[] // Added applicable positions
}

export type Training = {
  id: string
  name: string
  description: string
  hasExam: boolean
  hasDiploma: boolean
  minScore?: number
  trainer?: string
  status: "Borrador" | "Activa"
  applicablePositions: string[] // Added applicable positions per training
}

export type Participant = {
  id: string
  name: string
  position: string
  department: string
  status: "Asignado" | "Aprobado" | "Reprobado" | "Pendiente"
  avatar?: string
}

export default function TrainingPlansModule() {
  const [currentView, setCurrentView] = useState<"list" | "create" | "details" | "edit" | "participants">("list")
  const [selectedPlan, setSelectedPlan] = useState<TrainingPlan | null>(null)
  const [selectedTraining, setSelectedTraining] = useState<Training | null>(null)

  const handleCreatePlan = () => {
    setCurrentView("create")
  }

  const handleViewDetails = (plan: TrainingPlan) => {
    setSelectedPlan(plan)
    setCurrentView("details")
  }

  const handleEditPlan = (plan: TrainingPlan) => {
    setSelectedPlan(plan)
    setCurrentView("edit")
  }

  const handleManageParticipants = (training: Training) => {
    setSelectedTraining(training)
    setCurrentView("participants")
  }

  const handleBackToList = () => {
    setCurrentView("list")
    setSelectedPlan(null)
    setSelectedTraining(null)
  }

  const handleBackToDetails = () => {
    setCurrentView("details")
    setSelectedTraining(null)
  }

  return (
    <>
      {currentView === "list" && (
        <TrainingPlansList onCreatePlan={handleCreatePlan} onViewDetails={handleViewDetails} />
      )}
      {currentView === "create" && <CreateTrainingPlan onBack={handleBackToList} />}
      {currentView === "details" && selectedPlan && (
        <TrainingPlanDetails
          plan={selectedPlan}
          onBack={handleBackToList}
          onEdit={handleEditPlan}
          onManageParticipants={handleManageParticipants}
        />
      )}
      {currentView === "edit" && selectedPlan && <EditTrainingPlan plan={selectedPlan} onBack={handleBackToList} />}
      {currentView === "participants" && selectedTraining && (
        <ParticipantManagement training={selectedTraining} onBack={handleBackToDetails} />
      )}
    </>
  )
}
