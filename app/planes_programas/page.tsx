"use client"

import { useState } from "react"
import { Sidebar } from "@/components/sidebar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import PlansModule from "@/components/planes_programas/plans-module"
import { RequirePermission } from "@/components/RequirePermission"
import { AppHeader } from "@/components/app-header"
import { BookOpen, BookCheck } from "lucide-react"
import ProgramsModule from "@/components/programas_capacitacion/ProgramsModule"

export default function ProgramasYPlanesPage() {
  const [activeTab, setActiveTab] = useState("plans")

  return (
    <RequirePermission requiredPermissions={["plans_access"]}>
      <div className="flex h-screen bg-background">
        <Sidebar />

        <div className="flex-1 flex flex-col overflow-hidden">
          <AppHeader 
            title="Programas y Planes de Capacitación" 
            subtitle="Gestiona los programas anuales y planes de capacitación de tu organización" 
          />

          <main className="flex-1 overflow-y-auto custom-scrollbar">
            <div className="p-6">
              <div className="max-w-7xl mx-auto">
                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                  <TabsList className="flex flex-wrap w-full gap-1 p-1 h-auto mb-4">
                    <TabsTrigger value="plans" className="flex-1 text-sm whitespace-nowrap">
                      <BookOpen className="w-4 h-4 mr-2" />
                      Planes
                    </TabsTrigger>
                    <TabsTrigger value="programs" className="flex-1 text-sm whitespace-nowrap">
                      <BookCheck className="w-4 h-4 mr-2" />
                      Programas
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="plans" className="mt-0">
                    <PlansModule />
                  </TabsContent>

                  <TabsContent value="programs" className="mt-0">
                    <ProgramsModule />
                  </TabsContent>
                </Tabs>
              </div>
            </div>
          </main>
        </div>
      </div>
    </RequirePermission>  
  )
}
