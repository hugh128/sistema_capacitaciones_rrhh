"use client"

import { useState } from "react"
import { Sidebar } from "@/components/sidebar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import PlansModule from "@/components/planes_programas/plans-module"
import { RequirePermission } from "@/components/RequirePermission"
import { AppHeader } from "@/components/app-header"
import { BookOpen, BookCheck  } from "lucide-react"
import ProgramsModule from "@/components/programas_capacitacion/ProgramsModule"

export default function ProgramasYPlanesPage() {
  const [activeTab, setActiveTab] = useState("plans")

  return (
    <RequirePermission requiredPermissions={["manage_trainings", "view_trainings"]}>
      <div className="flex h-screen bg-background">
        <Sidebar />

        <div className="flex-1 flex flex-col overflow-hidden">
          <AppHeader title="Programas y Planes de Capacitación" subtitle="Gestiona los programas anuales y planes de capacitación de tu organización" />

          <main className="flex-1 overflow-auto p-6 custom-scrollbar">
            <div className="max-w-7xl mx-auto space-y-6">
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid w-full max-w-md grid-cols-2">
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
                  <ProgramsModule />
                </TabsContent>
              </Tabs>
            </div>
          </main>
        </div>
      </div>
    </RequirePermission>  
  )
}
