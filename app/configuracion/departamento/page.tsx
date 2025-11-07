"use client"

import { useEffect, useState } from "react"
import { Sidebar } from "@/components/sidebar"
import { DataTable } from "@/components/data-table"
import { FormModal, type FormData as FormValues } from "@/components/form-modal"
import { useAuth } from "@/contexts/auth-context"
import { apiClient } from "@/lib/api-client"
import { DEPARTAMENTO_COLUMNS, DEPARTAMENTO_FORM_FIELDS } from "@/data/departamento-config"
import { Toaster } from 'react-hot-toast'
import { Departamento, Persona } from "@/lib/types"
import { useDepartamentos } from "@/hooks/useDepartamentos"
import { RequirePermission } from "@/components/RequirePermission"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import { AppHeader } from "@/components/app-header"

const getPersonasList = async () => {
  try {
    const { data } = await apiClient.get<Persona[]>('/persona');
    return data;
  } catch (error) {
    console.error("Error al cargar lista personas ", error);
    return [];
  }
}

export default function DepartamentosPage() {
  const { user } = useAuth()
  const [modalOpen, setModalOpen] = useState(false)
  const [editingDepartamento, setEditingDepartamento] = useState<Departamento | null>(null)
  const [personasList, setPersonasList] = useState<Persona[]>([])

  const { 
    departamentos,
    isMutating,
    deleteDepartamento,
    saveDepartamento
  } = useDepartamentos(user);

  useEffect(() => {
    if (user) {
      getPersonasList().then(setPersonasList);
    }
  }, [user]);

  const personaOptions = personasList.map((persona) => ({
    value: persona.ID_PERSONA.toString(),
    label: `${persona.NOMBRE} ${persona.APELLIDO}`,
  }));
  
  const formFields = DEPARTAMENTO_FORM_FIELDS.map(field => {
    if (field.key === 'ID_ENCARGADO') {
        return { ...field, options: personaOptions };
    }
    return field;
  });

  //const firstEmpresa = empresasList[0];
  const DEFAULT_NEW_DATA = {
    ESTADO: true,
    //empresaId: firstEmpresa ? firstEmpresa.ID_EMPRESA.toString() : '', 
  };

  const handleAdd = () => {
    setEditingDepartamento(null)
    setModalOpen(true)
  }

  const handleEdit = (departamento: Departamento) => {
    setEditingDepartamento(departamento)
    setModalOpen(true)
  }

  const handleDelete = async (departamento: Departamento) => {
    await deleteDepartamento(departamento);
  }

  const handleSubmit = async (formData: FormValues) => {
    const success = await saveDepartamento(formData, editingDepartamento);
    
    if (success) {
      setModalOpen(false);
    }
  }

  return (
    <RequirePermission requiredPermissions={["manage_config"]}>

    <div className="flex h-screen bg-background">
      <Sidebar />

      <div className="flex-1 flex flex-col overflow-hidden">
        <AppHeader title="Configuración - Departamentos" subtitle="Gestiona los departamentos de las empresas" />

        <main className="flex-1 overflow-auto p-6">
          <Toaster />

          <div className="max-w-7xl mx-auto">
            <div className="flex">
              <div className="flex flex-col items-start gap-2">
                <Link href="/configuracion">
                  <Button variant="ghost" className="cursor-pointer">
                    <ArrowLeft className="w-4 h-4" />
                    Configuracion
                  </Button>
                </Link>
              </div>
            </div>

            <DataTable
              title="Departamentos"
              data={departamentos}
              columns={DEPARTAMENTO_COLUMNS}
              onAdd={handleAdd}
              onEdit={handleEdit}
              onDelete={handleDelete}
              searchPlaceholder="Buscar departamentos..."
            />
          </div>
        </main>
      </div>

      <FormModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        title={editingDepartamento ? "Editar Departamento" : "Nuevo Departamento"}
        description={editingDepartamento ? "Modifica los datos del departamento" : "Agrega un nuevo departamento al sistema"}
        fields={formFields}
        initialData={(editingDepartamento || DEFAULT_NEW_DATA) as FormValues}
        onSubmit={handleSubmit}
        loading={isMutating}
      />
    </div>

    </RequirePermission>
  )
}
