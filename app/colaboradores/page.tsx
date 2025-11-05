"use client"

import { Sidebar } from "@/components/sidebar"
import { RequirePermission } from "@/components/RequirePermission"
import { AppHeader } from "@/components/app-header"
import { useCallback, useState } from "react"
import type { Colaborador } from "@/lib/colaboradores/type"
import CollaboratorsList from "@/components/colaboradores/CollaboratorsList"
import ProfileContent from "@/components/colaboradores/profile-content"
import { useColaboradores } from "@/hooks/useColaboradores"
import { useAuth } from "@/contexts/auth-context"

export default function ColaboradoresPage() {
  const { user } = useAuth()
  const [selectedCollaborator, setSelectedCollaborator] = useState<Colaborador | null>(null)
  const [filterStatus, setFilterStatus] = useState<"all" | "activo" | "inactivo">("all")

  const {
    colaboradores
  } = useColaboradores(user)

  const handleSelectCollaborator = useCallback((colaborador: Colaborador) => {
    setSelectedCollaborator(colaborador)
  }, [])

  const handleBackToList = useCallback(() => {
    setSelectedCollaborator(null)
  }, [])

  return (
    <RequirePermission requiredPermissions={["manage_users"]}>
      <div className="flex h-screen bg-background">
        <Sidebar />

        <div className="flex-1 flex flex-col overflow-hidden">
          <AppHeader title="Colaboradores" subtitle="Gestiona el perfil y estado de todos los colaboradores de tu organización" />

          <main className="flex-1 overflow-auto p-6 custom-scrollbar">
            <div className="max-w-7xl mx-auto">
              {selectedCollaborator ? (
                  <ProfileContent 
                    collaborator={selectedCollaborator} 
                    onBack={handleBackToList} 
                  />
              ) : (
                <CollaboratorsList
                  colaboradores={colaboradores}
                  filterStatus={filterStatus}
                  setFilterStatus={setFilterStatus}
                  onSelectCollaborator={handleSelectCollaborator}
                />
              )}
            </div>
          </main>
        </div>
      </div>
    </RequirePermission>  
  )
}
