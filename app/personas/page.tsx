"use client"

import { useEffect, useState } from "react"
import { Sidebar } from "@/components/sidebar"
import { type FormData as FormValues } from "@/components/form-modal"
import { PersonaFormModal } from "@/components/persona-form-modal"
import { type Persona, Departamento, Empresa, Puesto } from "@/lib/types"
import { useAuth } from "@/contexts/auth-context"
import { apiClient } from "@/lib/api-client"
import { AppHeader } from "@/components/app-header"
import { usePersonas } from "@/hooks/usePersonas"
import { Toaster } from 'react-hot-toast'
import { PERSONA_FORM_FIELDS, PERSONA_COLUMNS, DEFAULT_NEW_DATA } from "@/data/persona-config"
import { PersonaDataTable } from "@/components/persona-data-table"
import { PersonaDetailModal } from "@/components/persona-detail-modal"

const getDepartamentosList = async () => {
  try {
    const { data } = await apiClient.get<Departamento[]>('/departamento');
    return data;
  } catch (err) {
    console.error("Error al cargar lista de departamentos para select:", err);
    return [];
  }
}

const getEmpresasList = async () => {
  try {
    const { data } = await apiClient.get<Empresa[]>('/empresa');
    return data;
  } catch (err) {
    console.error("Error al cargar lista de empresas para select:", err);
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

interface Option {
  value: string;
  label: string;
}

const mapToOptions = <T extends { NOMBRE: string }>(
  list: T[], 
  idKey: keyof T
): Option[] => {
  return list.map(item => ({
    label: item.NOMBRE, 
    value: (item[idKey] as { toString: () => string }).toString(), 
  }));
};

export default function PersonasPage() {
  const { user } = useAuth()
  const [modalOpen, setModalOpen] = useState(false)
  const [detailModalOpen, setDetailModalOpen] = useState(false)
  const [viewingPersona, setViewingPersona] = useState<Persona | null>(null)
  const [editingPersona, setEditingPersona] = useState<Persona | null>(null)
  const [empresasList, setEmpresasList] = useState<Empresa[]>([])
  const [departamentosList, setDepartamentosList] = useState<Departamento[]>([])
  const [puestosList, setPuestosList] = useState<Puesto[]>([])

  const {
    personas,
    deletePersona,
    savePersona
  } = usePersonas(user)

  useEffect(() => {
    if (user) {
      getEmpresasList().then(setEmpresasList);
      getDepartamentosList().then(setDepartamentosList);
      getPuestosList().then(setPuestosList);
    }
  }, [user]);

  if (!user || !user.roles.some((role) => role.nombre === "RRHH")) {
    return <div>No tienes permisos para acceder a esta página</div>
  }

  const empresasOptions = mapToOptions(empresasList, 'ID_EMPRESA');
  const departamentosOptions = mapToOptions(departamentosList, 'ID_DEPARTAMENTO');
  const puestosOptions = mapToOptions(puestosList, 'ID_PUESTO');
  
  const optionMap = {
    'EMPRESA_ID': empresasOptions,
    'DEPARTAMENTO_ID': departamentosOptions,
    'PUESTO_ID': puestosOptions,
  };

  const formFields = PERSONA_FORM_FIELDS.map(field => {
    const keyToLookup = field.key as keyof typeof optionMap; 

    const optionsToInject = optionMap[keyToLookup];
    
    if (optionsToInject) {
      return { ...field, options: optionsToInject };
    }
    
    return field;
  });

  const handleAdd = () => {
    setEditingPersona(null)
    setModalOpen(true)
  }

  const handleEdit = (persona: Persona) => {
    setEditingPersona(persona)
    setModalOpen(true)
  }

  const handleViewDetail = (persona: Persona) => {
    setViewingPersona(persona);
    setDetailModalOpen(true);
  }

  const handleDelete = async (persona: Persona) => {
    await deletePersona(persona)
  }

  const handleSubmit = async (formData: FormValues) => {
    const success = await savePersona(formData, editingPersona)

    if (success) {
      setModalOpen(false);
    }
  }

  return (
    <div className="flex h-screen bg-background">
      <Sidebar />

      <div className="flex-1 flex flex-col overflow-hidden">
        <AppHeader title="Gestión de Personas" subtitle="Administra la información personal de los colaboradores" />

        <main className="flex-1 overflow-auto p-6 custom-scrollbar">
          <Toaster />

          <div className="max-w-7xl mx-auto">
            <PersonaDataTable
              title="Personas"
              data={personas}
              columns={PERSONA_COLUMNS}
              onAdd={handleAdd}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onViewDetail={handleViewDetail}
              searchPlaceholder="Buscar personas..."
            />
          </div>
        </main>
      </div>

      <PersonaFormModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        title={editingPersona ? "Editar Persona" : "Nueva Persona"}
        description={editingPersona ? "Modifica los datos de la persona" : "Agrega una nueva persona al sistema"}
        allFields={formFields} 
        initialFormData={(editingPersona || DEFAULT_NEW_DATA || {}) as FormValues}
        onSubmit={handleSubmit}
        initialPersonaData={editingPersona}
        loading={false} 
      />
      <PersonaDetailModal
        open={detailModalOpen}
        onOpenChange={setDetailModalOpen}
        persona={viewingPersona}
      />
    </div>
  )
}
