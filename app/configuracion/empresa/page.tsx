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
import { RequirePermission } from "@/components/RequirePermission"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import { AppHeader } from "@/components/app-header"

export default function EmpresasPage() {
  const { user } = useAuth()
  const { empresas, fetchEmpresas, deleteEmpresa } = useEmpresas(user);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingEmpresa, setEditingEmpresa] = useState<Empresa | null>(null);

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
    <RequirePermission requiredPermissions={["settings_access"]}>

      <div className="flex h-screen bg-background">
        <Sidebar />

        <div className="flex-1 flex flex-col overflow-hidden">

          <AppHeader title="Configuración - Empresas" subtitle="Gestiona las empresas del sistema" />

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

    </RequirePermission>
  )
}
