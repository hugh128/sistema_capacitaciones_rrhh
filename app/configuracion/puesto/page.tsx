"use client"

import { useEffect, useState } from "react"
import { Sidebar } from "@/components/sidebar"
import { DataTable } from "@/components/data-table"
import { FormModal, type FormData as FormValues } from "@/components/form-modal"
import { type Puesto, Departamento } from "@/lib/types"
import { useAuth } from "@/contexts/auth-context"
import { apiClient } from "@/lib/api-client"
import { PUESTO_COLUMNS, PUESTO_FORM_FIELDS, DEFAULT_NEW_DATA } from "@/data/puesto-config"
import { usePuestos } from "@/hooks/usePuestos"
import { Toaster } from 'react-hot-toast'
import { RequirePermission } from "@/components/RequirePermission"

const getDepartamentosList = async () => {
  try {
    const { data } = await apiClient.get<Departamento[]>('/departamento');
    return data;
  } catch (err) {
    console.error("Error al cargar lista de departamentos para select:", err);
    return [];
  }
}

export default function PuestosPage() {
  const { user } = useAuth()
  const [modalOpen, setModalOpen] = useState(false)
  const [editingPuesto, setEditingPuesto] = useState<Puesto | null>(null)
  const [departamentosList, setDepartamentosList] = useState<Departamento[]>([])

  const {
    puestos,
    deletePuesto,
    savePuesto
  } = usePuestos(user);

  useEffect(() => {
    if (user) {
      getDepartamentosList().then(setDepartamentosList);
    }
  }, [user]);

  const departamentosOptions = departamentosList.map((departamento) => ({
    value: departamento.ID_DEPARTAMENTO.toString(),
    label: departamento.NOMBRE,
  }));
  
  const formFields = PUESTO_FORM_FIELDS.map(field => {
    if (field.key === 'DEPARTAMENTO_ID') {
      return { ...field, options: departamentosOptions };
    }
    return field;
  });

  const handleAdd = () => {
    setEditingPuesto(null)
    setModalOpen(true)
  }

  const handleEdit = (puesto: Puesto) => {
    setEditingPuesto(puesto);
    setModalOpen(true);
  }

  const handleDelete = async (puesto: Puesto) => {
    await deletePuesto(puesto)
  }

  const handleSubmit = async (formData: FormValues) => {
    const success = await savePuesto(formData, editingPuesto)

    if (success) {
      setModalOpen(false);
    }
  }

  return (
    <RequirePermission requiredPermissions={["manage_config"]}>

      <div className="flex h-screen bg-background">
        <Sidebar />

        <div className="flex-1 flex flex-col overflow-hidden">
          <header className="border-b border-border bg-card px-6 py-4">
            <div>
              <h1 className="text-2xl font-bold text-card-foreground">Configuración - Puestos</h1>
              <p className="text-sm text-muted-foreground">Gestiona los puestos de trabajo por departamento</p>
            </div>
          </header>

          <main className="flex-1 overflow-auto p-6">
            <Toaster />

            <div className="max-w-7xl mx-auto">
              <DataTable
                title="Puestos"
                data={puestos}
                columns={PUESTO_COLUMNS}
                onAdd={handleAdd}
                onEdit={handleEdit}
                onDelete={handleDelete}
                searchPlaceholder="Buscar puestos..."
              />
            </div>
          </main>
        </div>

        <FormModal
          open={modalOpen}
          onOpenChange={setModalOpen}
          title={editingPuesto ? "Editar Puesto" : "Nuevo Puesto"}
          description={editingPuesto ? "Modifica los datos del puesto" : "Agrega un nuevo puesto al sistema"}
          fields={formFields}
          initialData={(editingPuesto || DEFAULT_NEW_DATA) as FormValues}
          onSubmit={handleSubmit}
        />
      </div>

    </RequirePermission>
  )
}
