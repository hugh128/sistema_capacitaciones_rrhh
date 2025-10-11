"use client"

import { useState } from "react"
import { apiClient } from "@/lib/api-client"
import { Sidebar } from "@/components/sidebar"
import { DataTable } from "@/components/data-table"
import { FormModal, type FormData } from "@/components/form-modal"
import { type Empresa } from "@/lib/types"
import { useAuth } from "@/contexts/auth-context"
import { handleApiError } from "@/utils/error-handler"
import toast, { Toaster } from 'react-hot-toast'
import { EMPRESA_COLUMNS, EMPRESA_FORM_FIELDS, DEFAULT_NEW_EMPRESA_DATA } from "@/data/empresa-config"
import { useEmpresas } from "@/hooks/useEmpresas"

export default function EmpresasPage() {
  const { user } = useAuth()
  const { empresas, fetchEmpresas, deleteEmpresa } = useEmpresas(user);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingEmpresa, setEditingEmpresa] = useState<Empresa | null>(null);

  if (!user || !user.roles.some((role) => role.nombre === "RRHH")) {
    return <div>No tienes permisos para acceder a esta página</div>
  }

  const handleAdd = () => {
    setEditingEmpresa(null);
    setModalOpen(true);
  };

  const handleEdit = (empresa: Empresa) => {
    setEditingEmpresa(empresa);
    setModalOpen(true);
  };

  const handleSubmit = async (formData: FormData) => {
    const action = editingEmpresa ? "editada" : "agregada";
    try {
      if (editingEmpresa) {
        await apiClient.patch(`/empresa/${editingEmpresa.ID_EMPRESA}`, formData);
      } else {
        await apiClient.post("/empresa", formData);
      }
      toast.success(`Empresa ${action} con éxito.`);
      setModalOpen(false);
      fetchEmpresas();
    } catch (err) {
      handleApiError(err, `Error al guardar la empresa.`);
    }
  };

  return (
    <div className="flex h-screen bg-background">
      <Sidebar />

      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="border-b border-border bg-card px-6 py-4">
          <div>
            <h1 className="text-2xl font-bold text-card-foreground">Configuración - Empresas</h1>
            <p className="text-sm text-muted-foreground">Gestiona las empresas del sistema</p>
          </div>
        </header>

        <main className="flex-1 overflow-auto p-6">
          <Toaster />
          <div className="max-w-7xl mx-auto">
            <DataTable
              title="Empresas"
              data={empresas}
              columns={EMPRESA_COLUMNS}
              onAdd={handleAdd}
              onEdit={handleEdit}
              onDelete={deleteEmpresa}
              searchPlaceholder="Buscar empresas..."
            />
          </div>
        </main>
      </div>

      <FormModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        title={editingEmpresa ? "Editar Empresa" : "Nueva Empresa"}
        description={editingEmpresa ? "Modifica los datos de la empresa" : "Agrega una nueva empresa al sistema"}
        fields={EMPRESA_FORM_FIELDS}
        initialData={(editingEmpresa || DEFAULT_NEW_EMPRESA_DATA) as FormData}
        onSubmit={handleSubmit}
      />
    </div>
  )
}
