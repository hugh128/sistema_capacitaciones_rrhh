"use client"

import type React from "react"
import { useEffect, useState } from "react"
import PlansListView from "./plans-list-view"
import CreatePlan from "./create-plan"
import PlanDetails from "./plan-details"
import EditPlan from "./edit-plan"
import PlansImport from "./plans-import"
import type { PlanCapacitacion } from "@/lib/planes_programas/types"
import { useAuth } from "@/contexts/auth-context"
import { apiClient } from "@/lib/api-client"
import { Toaster } from "react-hot-toast"
import { usePlanesCapacitacion } from "@/hooks/usePlanesCapacitacion"
import { Departamento, Puesto } from "@/lib/types"
import { CodigoPadre } from "@/lib/codigos/types"

type ViewType = "list" | "create" | "details" | "edit" | "import"

const getDepartamentosList = async () => {
  try {
    const { data } = await apiClient.get<Departamento[]>('/departamento');
    return data;
  } catch (err) {
    console.error("Error al cargar lista de departamentos para select:", err);
    return [];
  }
}

const getPuestosList = async () => {
  try {
    const { data } = await apiClient.get<Puesto[]>('/puesto');
    return data;
  } catch (err) {
    console.error("Error al cargar lista de puestos para select:", err);
    return [];
  }
}

const getDocumentosList = async () => {
  try {
    const { data } = await apiClient.get<CodigoPadre[]>('/documento');
    return data;
  } catch (err) {
    console.error("Error al cargar lista de documentos para select:", err);
    return [];
  }
}

export default function PlansModule() {
  const { user } = useAuth()
  const [currentView, setCurrentView] = useState<ViewType>("list")
  const [selectedPlan, setSelectedPlan] = useState<PlanCapacitacion | null>(null)
  const [departamentosList, setDepartamentosList] = useState<Departamento[]>([])
  const [puestosList, setPuestosList] = useState<Puesto[]>([])
  const [documentosList, setDocumentosList] = useState<CodigoPadre[]>([])

  const {
    planesCapacitacion,
    savePlanesCapacitacion,
  } = usePlanesCapacitacion(user)

  useEffect(() => {
    if (user) {
      getDepartamentosList().then(setDepartamentosList);
      getPuestosList().then(setPuestosList);
      getDocumentosList().then(setDocumentosList);
    }
  }, [user]);


  const handleCreatePlan = () => setCurrentView("create")
  const handleImport = () => setCurrentView("import")

  const handleViewDetails = (plan: PlanCapacitacion) => {
    setSelectedPlan(plan)
    setCurrentView("details")
  }

  const handleEditPlan = (plan: PlanCapacitacion) => {
    setSelectedPlan(plan)
    setCurrentView("edit")
  }

  const handleBackToList = () => {
    setCurrentView("list")
    setSelectedPlan(null)
  }

  const handleSavePlan = async (newPlan: Partial<PlanCapacitacion>) => {
    await savePlanesCapacitacion(newPlan);
    setCurrentView("list");
  };

  const handleUpdatePlan = async (updatedPlan: Partial<PlanCapacitacion>, idPlan: number) => {
    await savePlanesCapacitacion(updatedPlan, idPlan);
    setCurrentView("list")
  }

  const handleImportPlans = () => {
    setCurrentView("list")
  }

  return (
    <div className="h-full px-6">

      <Toaster />

      {currentView === "list" && (
        <PlansListView
          plans={planesCapacitacion}
          onCreatePlan={handleCreatePlan}
          onViewDetails={handleViewDetails}
          onImport={handleImport}
        />
      )}
      {currentView === "create" &&
        <CreatePlan
          onBack={handleBackToList}
          onSave={handleSavePlan}
          departamentosDisponibles={departamentosList}
          documentosList={documentosList}
          puestosDisponibles={puestosList}
        />
      }
      {currentView === "details" && selectedPlan && (
        <PlanDetails plan={selectedPlan} onBack={handleBackToList} onEdit={handleEditPlan} />
      )}
      {currentView === "edit" && selectedPlan && (
        <EditPlan
          plan={selectedPlan}
          onBack={handleBackToList}
          onUpdate={handleUpdatePlan}
          departamentosDisponibles={departamentosList}
          documentosList={documentosList}
          puestosDisponibles={puestosList}
        />
      )}
      {currentView === "import" &&
        <PlansImport onBack={handleBackToList} onImport={handleImportPlans} />
      }
    </div>
  )
}
