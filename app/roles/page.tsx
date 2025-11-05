"use client"

import { useState } from "react"
import { Sidebar } from "@/components/sidebar"
import { AppHeader } from "@/components/app-header"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Shield, Key } from "lucide-react"
import { RolesTab } from "@/components/roles-tab"
import { PermissionsTab } from "@/components/permissions-tab"
import { RequirePermission } from "@/components/RequirePermission"

export default function RolesPage() {
  const [activeTab, setActiveTab] = useState("roles")

  return (
    <RequirePermission requiredPermissions={["manage_users"]}>
      <div className="flex h-screen bg-background">
        <Sidebar />

        <div className="flex-1 flex flex-col overflow-hidden">
          <AppHeader title="Gestión de Roles y Permisos" subtitle="Administra roles, permisos y categorías del sistema" />

          <main className="flex-1 overflow-y-auto p-6 custom-scrollbar">
            <div className="max-w-7xl mx-auto">
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid w-full max-w-md grid-cols-2 mb-6">
                  <TabsTrigger value="roles" className="flex items-center gap-2">
                    <Shield className="w-4 h-4" />
                    Roles
                  </TabsTrigger>
                  <TabsTrigger value="permissions" className="flex items-center gap-2">
                    <Key className="w-4 h-4" />
                    Permisos
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="roles" className="mt-0">
                  <RolesTab />
                </TabsContent>

                <TabsContent value="permissions" className="mt-0">
                  <PermissionsTab />
                </TabsContent>
              </Tabs>
            </div>
          </main>
        </div>
      </div>
    </RequirePermission>
  )
}
