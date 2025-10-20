"use client"

import { useState } from "react"
import { Sidebar } from "@/components/sidebar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import PlansModule from "@/components/planes_programas/plans-module"
import type { TrainingProgram } from "@/lib/planes_programas/types"
import { RequirePermission } from "@/components/RequirePermission"
import { AppHeader } from "@/components/app-header"
import { BookOpen, BookCheck  } from "lucide-react"

export default function ProgramasYPlanesPage() {
  const [activeTab, setActiveTab] = useState("plans")

  const [programs, setPrograms] = useState<TrainingProgram[]>([
    {
      id: "1",
      code: "PROG-001",
      name: "Programa de Desarrollo Técnico 2025",
      description: "Programa anual de capacitación técnica",
      type: "Programa",
      period: 2025,
      createdAt: "2024-01-10",
      status: "Activo",
      trainings: [
        {
          id: "1-1",
          name: "Ciberseguridad Básica",
          trainer: "Ing. Roberto Méndez",
          category: "ESPECIFICA",
          type: "INTERNA",
          appliesToAllDepartments: false,
          applicableDepartments: ["Tecnología", "Sistemas"],
          scheduledDate: "2025-03-15",
          hasExam: true,
          hasDiploma: true,
          status: "Activo",
        },
      ],
      trainingCount: 1,
    },
  ])

  return (
    <RequirePermission requiredPermissions={["manage_trainings", "view_trainings"]}>
      <div className="flex h-screen bg-background">
        <Sidebar />

        <div className="flex-1 flex flex-col overflow-hidden">
          <AppHeader title="Programas y Planes de Capacitación" subtitle="Gestiona los programas anuales y planes de capacitación de tu organización" />

          <main className="flex-1 overflow-auto p-6 custom-scrollbar">
            <div className="max-w-7xl mx-auto space-y-6">
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid w-full max-w-md grid-cols-2 mb-6">
                  <TabsTrigger value="plans">
                    <BookOpen className="w-4 h-4" />
                    Planes</TabsTrigger>
                  <TabsTrigger value="programs">
                    <BookCheck className="w-4 h-4" />
                    Programas</TabsTrigger>
                </TabsList>

                <TabsContent value="plans" className="flex-1 overflow-auto mt-0">
                  <PlansModule />
                </TabsContent>

                <TabsContent value="programs" className="flex-1 overflow-auto mt-0">
                  {/* <ProgramsModule programs={programs} setPrograms={setPrograms} /> */}
                </TabsContent>
              </Tabs>
            </div>
          </main>
        </div>
      </div>
    </RequirePermission>  
  )
}
