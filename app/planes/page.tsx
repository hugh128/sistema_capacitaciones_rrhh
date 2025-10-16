"use client"

import { useState } from "react"
import { Sidebar } from "@/components/sidebar"
import { AppHeader } from "@/components/app-header"
import { RequirePermission } from "@/components/RequirePermission"
import TrainingPlansList from "@/components/planes/training-plans-list"
import CreateTrainingPlan from "@/components/planes/create-training-plan"
import TrainingPlanDetails from "@/components/planes/training-plan-details"
import EditTrainingPlan from "@/components/planes/edit-training-plan"
import ParticipantManagement from "@/components/planes/participant-management"

export type TrainingPlan = {
  id: string
  code: string
  name: string
  type: "Inducción" | "Programa" | "Individual"
  status: "Activo" | "Borrador"
  createdAt: string
  endAt?: string
  description: string
  trainings: Training[]
  department?: string
  trainingCount?: number
  applicablePositions: string[]
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
  applicablePositions: string[]
}

export type Participant = {
  id: string
  name: string
  position: string
  department: string
  status: "Asignado" | "Aprobado" | "Reprobado" | "Pendiente"
  avatar?: string
}

export default function PlanesPage() {
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
    <RequirePermission requiredPermissions={["manage_trainings", "view_trainings"]}>

      <div className="flex h-screen bg-background">
        <Sidebar />

        <div className="flex-1 flex flex-col overflow-hidden">
          <AppHeader title="Planes de Capacitación" subtitle="Gestiona los planes de capacitación por departamento" />

          <main className="flex-1 overflow-auto p-6">
            <div className="max-w-7xl mx-auto space-y-6">


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


            </div>
          </main>
        </div>

      </div>

    </RequirePermission>
  )
}
