"use client"

import { useAuth } from "@/contexts/auth-context"
import { DashboardStats } from "@/components/dashboard-stats"
import { Sidebar } from "@/components/sidebar"
import { Button } from "@/components/ui/button"
import { AppHeader } from "@/components/app-header"
import Link from "next/link"

export default function DashboardPage() {
  const { user } = useAuth()

  if (!user) {
    return null
  }

  return (
    <div className="flex h-screen bg-background">
      <Sidebar />

      <div className="flex-1 flex flex-col min-h-0">
        <AppHeader title="Dashboard" subtitle={`Bienvenido, ${user.NOMBRE} ${user.APELLIDO}`} />

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 custom-scrollbar">
          <div className="max-w-7xl mx-auto">
            {/* Welcome Section */}
            <div className="mb-8">
              <div className="bg-gradient-to-r from-primary/10 to-accent/10 rounded-lg p-4 sm:p-6 border">
                <h2 className="text-lg sm:text-xl font-semibold mb-2">Sistema de Gestión de Capacitaciones</h2>
                <p className="text-sm sm:text-base text-muted-foreground mb-4">
                  Administra y da seguimiento a todas las capacitaciones de tu organización
                </p>
                <div className="flex flex-wrap gap-2">
                  {user.ROLES[0]?.NOMBRE === "RRHH" && (
                    <>
                      <Link href="/reportes">
                        <Button variant="default" size="sm" className="cursor-pointer">
                          Ver Reportes
                        </Button>
                      </Link>

                      <Link href="/configuracion">
                        <Button variant="outline" size="sm" className="dark:hover:bg-accent cursor-pointer">
                          Configurar Sistema
                        </Button>
                      </Link>
                    </>
                  )}
                  {user.ROLES[0]?.NOMBRE === "Capacitador" && (
                    <>
                      <Button variant="default" size="sm">
                        Mis Capacitaciones
                      </Button>
                      <Button variant="outline" size="sm">
                        Subir Documentos
                      </Button>
                    </>
                  )}
                  {["Gerente", "Jefe"].includes(user.ROLES[0]?.NOMBRE) && (
                    <>
                      <Button variant="default" size="sm">
                        Ver Mi Equipo
                      </Button>
                      <Button variant="outline" size="sm">
                        Generar Reporte
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Dashboard Stats */}
            <DashboardStats />
          </div>
        </main>
      </div>
    </div>
  )
}
