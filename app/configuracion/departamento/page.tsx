"use client"

import { useEffect, useState } from "react"
import { Sidebar } from "@/components/sidebar"
import { DataTable } from "@/components/data-table"
import { FormModal, type FormData as FormValues } from "@/components/form-modal"
import { useAuth } from "@/contexts/auth-context"
import { apiClient } from "@/lib/api-client"
import { DEPARTAMENTO_COLUMNS, DEPARTAMENTO_FORM_FIELDS } from "@/data/departamento-config"
import { Toaster } from 'react-hot-toast'
import { Departamento, Empresa } from "@/lib/types"
import { useDepartamentos } from "@/hooks/useDepartamentos"

const getEmpresasList = async () => {
  try {
    const { data } = await apiClient.get<Empresa[]>('/empresa'); 
    return data;
  } catch (err) {
    console.error("Error al cargar lista de empresas para select:", err);
    return [];
  }
}

export default function DepartamentosPage() {
  const { user } = useAuth()
  const [modalOpen, setModalOpen] = useState(false)
  const [editingDepartamento, setEditingDepartamento] = useState<Departamento | null>(null)
  const [empresasList, setEmpresasList] = useState<Empresa[]>([]);

  const { 
    departamentos,
    deleteDepartamento,
    saveDepartamento
  } = useDepartamentos(user);

  useEffect(() => {
    if (user) {
      getEmpresasList().then(setEmpresasList);
    }
  }, [user]);


  if (!user || !user.roles.some((role) => role.nombre === "RRHH")) {
    return <div>No tienes permisos para acceder a esta página</div>
  }

  const empresaOptions = empresasList.map((empresa) => ({
    value: empresa.ID_EMPRESA.toString(),
    label: empresa.NOMBRE,
  }));
  
  const formFields = DEPARTAMENTO_FORM_FIELDS.map(field => {
    if (field.key === 'empresaId') {
        return { ...field, options: empresaOptions };
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
    <div className="flex h-screen bg-background">
      <Sidebar />

      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="border-b border-border bg-card px-6 py-4">
          <div>
            <h1 className="text-2xl font-bold text-card-foreground">Configuración - Departamentos</h1>
            <p className="text-sm text-muted-foreground">Gestiona los departamentos de las empresas</p>
          </div>
        </header>

        <main className="flex-1 overflow-auto p-6">
          <Toaster />

          <div className="max-w-7xl mx-auto">
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
      />
    </div>
  )
}
