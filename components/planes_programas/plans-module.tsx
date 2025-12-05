"use client"

import type React from "react"
import { useEffect, useState, useCallback } from "react"
import PlansListView from "./plans-list-view"
import CreatePlan from "./create-plan"
import PlanDetails from "./plan-details"
import EditPlan from "./edit-plan"
import PlansImport from "./plans-import"
import type { AplicarPlan, PlanCapacitacion } from "@/lib/planes_programas/types"
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
    const { data } = await apiClient.get<CodigoPadre[]>('/documento/vigentes');
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
    aplicarPlanCapacitacion,
    obtenerColaboradoresDisponiblesPlan,
    sincronizarCapacitacionesPlan,
  } = usePlanesCapacitacion(user)

  useEffect(() => {
    if (user) {
      getDepartamentosList().then(setDepartamentosList);
      getPuestosList().then(setPuestosList);
      getDocumentosList().then(setDocumentosList);
    }
  }, [user]);

  const handleCreatePlan = useCallback(() => {
    setCurrentView("create")
  }, [])
  
  const handleImport = useCallback(() => {
    setCurrentView("import")
  }, [])

  const handleViewDetails = useCallback((plan: PlanCapacitacion) => {
    setSelectedPlan(plan)
    setCurrentView("details")
  }, [])

  const handleEditPlan = useCallback((plan: PlanCapacitacion) => {
    setSelectedPlan(plan)
    setCurrentView("edit")
  }, [])

  const handleBackToList = useCallback(() => {
    setCurrentView("list")
    setSelectedPlan(null)
  }, [])

  const handleSavePlan = useCallback(async (newPlan: Partial<PlanCapacitacion>) => {
    await savePlanesCapacitacion(newPlan);
    setCurrentView("list");
  }, [savePlanesCapacitacion])

  const handleUpdatePlan = useCallback(async (updatedPlan: Partial<PlanCapacitacion>, idPlan: number) => {
    await savePlanesCapacitacion(updatedPlan, idPlan);
    setCurrentView("list")
  }, [savePlanesCapacitacion])

  const handleImportPlans = useCallback(() => {
    setCurrentView("list")
  }, [])

  const handleAssingPlan = useCallback(async (aplicarPlan: AplicarPlan) => {
    await aplicarPlanCapacitacion(aplicarPlan);
  }, [aplicarPlanCapacitacion])

  const handleSynchronizePlan = useCallback(async (idPlan: number, usuario: string) => {
    await sincronizarCapacitacionesPlan(idPlan, usuario);
  }, [sincronizarCapacitacionesPlan])

  return (
    <div className="space-y-6">
      <Toaster />

      {currentView === "list" && (
        <PlansListView
          plans={planesCapacitacion}
          onCreatePlan={handleCreatePlan}
          onViewDetails={handleViewDetails}
          onImport={handleImport}
          onAssign={handleAssingPlan}
          onObtenerColaboradores={obtenerColaboradoresDisponiblesPlan}
          onSynchronize={handleSynchronizePlan}
          usuario={user}
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
        <PlanDetails
          plan={selectedPlan}
          onBack={handleBackToList}
          onEdit={handleEditPlan}
        />
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
