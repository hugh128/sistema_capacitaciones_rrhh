"use client"

import { Sidebar } from "@/components/sidebar"
import { RequirePermission } from "@/components/RequirePermission"
import { AppHeader } from "@/components/app-header"
import { useCallback, useState } from "react"
import type { Collaborator } from "@/lib/colaboradores/type"
import CollaboratorsList from "@/components/colaboradores/CollaboratorsList"
import ProfileContent from "@/components/colaboradores/profile-content"
import StatusSidebar from "@/components/colaboradores/status-sidebar"

const collaborators: Collaborator[] = [
  {
    id: "1",
    name: "Juan Pérez",
    email: "juanperez@gmail.com",
    phone: "+502 6768-6525",
    position: "Químico Farmacéutico",
    department: "Calidad",
    status: "active",
    initials: "JP",
    joinDate: "10 Jul 2021",
    completionScore: 80,
    manager: "Alex Gómez",
  },
  {
    id: "2",
    name: "María González",
    email: "maria.gonzalez@pharalab.com",
    phone: "+502 5544-3322",
    position: "Analista de Laboratorio",
    department: "Análisis",
    status: "active",
    initials: "MG",
    joinDate: "15 Mar 2022",
    completionScore: 95,
    manager: "Carlos Ruiz",
  },
  {
    id: "3",
    name: "Carlos Mendoza",
    email: "carlos.mendoza@pharalab.com",
    phone: "+502 7788-9900",
    position: "Supervisor de Producción",
    department: "Producción",
    status: "active",
    initials: "CM",
    joinDate: "22 Jan 2020",
    completionScore: 88,
    manager: "Ana López",
  },
  {
    id: "4",
    name: "Ana Rodríguez",
    email: "ana.rodriguez@pharalab.com",
    phone: "+502 3344-5566",
    position: "Técnico de Control de Calidad",
    department: "Calidad",
    status: "active",
    initials: "AR",
    joinDate: "05 Sep 2021",
    completionScore: 92,
    manager: "Alex Gómez",
  },
  {
    id: "5",
    name: "Luis Hernández",
    email: "luis.hernandez@pharalab.com",
    phone: "+502 9988-7766",
    position: "Especialista en Microbiología",
    department: "Microbiología",
    status: "on-leave",
    initials: "LH",
    joinDate: "18 Nov 2019",
    completionScore: 75,
    manager: "Patricia Díaz",
  },
  {
    id: "6",
    name: "Patricia Morales",
    email: "patricia.morales@pharalab.com",
    phone: "+502 1122-3344",
    position: "Coordinadora de Capacitación",
    department: "Recursos Humanos",
    status: "active",
    initials: "PM",
    joinDate: "30 Apr 2022",
    completionScore: 100,
    manager: "Roberto Silva",
  },
  {
    id: "7",
    name: "Roberto Castillo",
    email: "roberto.castillo@pharalab.com",
    phone: "+502 6655-4433",
    position: "Ingeniero de Validación",
    department: "Validación",
    status: "active",
    initials: "RC",
    joinDate: "12 Aug 2020",
    completionScore: 85,
    manager: "María Torres",
  },
  {
    id: "8",
    name: "Sofia Ramírez",
    email: "sofia.ramirez@pharalab.com",
    phone: "+502 2233-4455",
    position: "Asistente de Laboratorio",
    department: "Análisis",
    status: "inactive",
    initials: "SR",
    joinDate: "07 Feb 2023",
    completionScore: 60,
    manager: "Carlos Ruiz",
  },
]


export default function ColaboradoresPage() {
  const [selectedCollaborator, setSelectedCollaborator] = useState<Collaborator | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [filterStatus, setFilterStatus] = useState<"all" | "active" | "inactive" | "on-leave">("all")

  const filteredCollaborators = collaborators.filter((collab) => {
    const matchesSearch =
      collab.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      collab.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      collab.position.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = filterStatus === "all" || collab.status === filterStatus
    return matchesSearch && matchesStatus
  })

  const handleSelectCollaborator = useCallback((collaborator: Collaborator) => {
    setSelectedCollaborator(collaborator)
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
            {selectedCollaborator ? (
              <div className="flex gap-4">
                <ProfileContent 
                  collaborator={selectedCollaborator} 
                  onBack={handleBackToList} 
                />
                <StatusSidebar 
                  collaborator={selectedCollaborator} 
                  onBack={handleBackToList} 
                />
              </div>
            ) : (
              <CollaboratorsList
                collaborators={filteredCollaborators}
                searchQuery={searchQuery}
                setSearchQuery={setSearchQuery}
                filterStatus={filterStatus}
                setFilterStatus={setFilterStatus}
                onSelectCollaborator={handleSelectCollaborator}
              />
            )}
          </main>
        </div>
      </div>
    </RequirePermission>  
  )
}
