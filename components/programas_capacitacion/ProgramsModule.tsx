"use client"

import { useEffect, useState } from "react"
import { ProgramasCapacitacionList } from "./programas-list"
import { CreatePrograma } from "./create-programa"
import { EditPrograma } from "./edit-programa"
import { ProgramaDetails } from "./programa-details"
import type { 
  ProgramaCapacitacion, 
  ProgramaCapacitacionForm, 
  CreateProgramaDetalleDto, 
  AsignarProgramaCapacitacionSelectivo 
} from "@/lib/programas_capacitacion/types"
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
    asignarProgramaCapacitacionSelectivo,
    obtenerColaboradoresDisponiblesPrograma,
    loading
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
    // Implementar si es necesario
  }

  const handleBack = () => {
    setViewState("list")
    setSelectedPrograma(null)
  }

  const handleNewDetalle = async(programaDetalle: CreateProgramaDetalleDto) => {
    await saveProgramaDetalle(programaDetalle)
  }

  const handleAssignProgram = async (asignarPrograma: AsignarProgramaCapacitacionSelectivo) => {
    await asignarProgramaCapacitacionSelectivo(asignarPrograma)
  }

  return (
    <div className="space-y-6">
      <Toaster />

      {viewState === "list" && (
        <ProgramasCapacitacionList
          programas={programasCapacitacion}
          onCreateNew={handleCreate}
          onEdit={handleEdit}
          onAssign={handleAssignProgram}
          onViewDetails={handleViewDetails}
          onDelete={handleDelete}
          usuario={user}
          obtenerColaboradores={obtenerColaboradoresDisponiblesPrograma}
          loading={loading}
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
    </div>
  )
}
