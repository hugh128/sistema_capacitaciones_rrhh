"use client"

import { useEffect, useState } from "react"
import { ProgramasCapacitacionList } from "./programas-list"
import { CreatePrograma } from "./create-programa"
import { EditPrograma } from "./edit-programa"
import { ProgramaDetails } from "./programa-details"
import type { ProgramaCapacitacion, ProgramaCapacitacionForm, CreateProgramaDetalleDto } from "@/lib/programas_capacitacion/types"
import type { Departamento, Puesto } from "@/lib/types"
import { Toaster } from "react-hot-toast"
import { apiClient } from "@/lib/api-client"
import { useProgramasCapacitacion } from "@/hooks/useProgramasCapacitacion"
import { useAuth } from "@/contexts/auth-context"

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

type ViewState = "list" | "create" | "edit" | "details"

export default function ProgramsModule() {
  const { user } = useAuth()
  const [departamentosList, setDepartamentosList] = useState<Departamento[]>([])
  const [puestosList, setPuestosList] = useState<Puesto[]>([])
  const [viewState, setViewState] = useState<ViewState>("list")
  const [selectedPrograma, setSelectedPrograma] = useState<ProgramaCapacitacion | null>(null)

  const {
    programasCapacitacion,
    saveProgramaCapacitacion,
    saveProgramaDetalle,
  } = useProgramasCapacitacion(user)

  useEffect(() => {
    if (user) {
      getDepartamentosList().then(setDepartamentosList);
      getPuestosList().then(setPuestosList)
    }
  }, [user]);

  const handleCreate = () => {
    setViewState("create")
  }

  const handleSaveNew = async(newPrograma: ProgramaCapacitacionForm) => {
    await saveProgramaCapacitacion(newPrograma)
    setViewState("list")
  }

  const handleEdit = (programa: ProgramaCapacitacion) => {
    setSelectedPrograma(programa)
    setViewState("edit")
  }

  const handleSaveEdit = async (updatedPrograma: ProgramaCapacitacion, idPrograma: number) => {
    await saveProgramaCapacitacion(updatedPrograma, idPrograma)
    setViewState("list")
    setSelectedPrograma(null)
  }

  const handleViewDetails = (programa: ProgramaCapacitacion) => {
    setSelectedPrograma(programa)
    setViewState("details")
  }

  const handleDelete = (id: number) => {
/*     setProgramas(programas.filter((p) => p.ID_PROGRAMA !== id)) */
  }

  const handleBack = () => {
    setViewState("list")
    setSelectedPrograma(null)
  }

  const handleNewDetalle = async(programaDetalle: CreateProgramaDetalleDto) => {
    await saveProgramaDetalle(programaDetalle)
  }

  const handleAssingProgram = async () => {
    console.log("Programa de capacitacion asignado")
  }

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <div className="flex-1 flex flex-col overflow-hidden">

        <Toaster />

        <main className="flex-1 overflow-auto p-6">
          {viewState === "list" && (
            <ProgramasCapacitacionList
              programas={programasCapacitacion}
              onCreateNew={handleCreate}
              onEdit={handleEdit}
              onAssign={handleAssingProgram}
              onViewDetails={handleViewDetails}
              onDelete={handleDelete}
            />
          )}

          {viewState === "create" && (
            <CreatePrograma
              departamentos={departamentosList}
              puestos={puestosList}
              onSave={handleSaveNew}
              onCancel={handleBack}
            />
          )}

          {viewState === "edit" && selectedPrograma && (
            <EditPrograma
              programa={selectedPrograma}
              departamentos={departamentosList}
              puestos={puestosList}
              onSave={handleSaveEdit}
              onCancel={handleBack}
            />
          )}

          {viewState === "details" && selectedPrograma && (
            <ProgramaDetails
              programa={selectedPrograma}
              departamentos={departamentosList}
              puestos={puestosList}
              onEdit={handleEdit}
              onBack={handleBack}
              onUpdate={handleNewDetalle}
            />
          )}
        </main>
      </div>
    </div>
  )
}
