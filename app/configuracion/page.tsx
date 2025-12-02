"use client"

import { Sidebar } from "@/components/sidebar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Building2, Briefcase, UserCog, Settings } from "lucide-react"
import Link from "next/link"
import { AppHeader } from "@/components/app-header"
import { RequirePermission } from "@/components/RequirePermission"
import { Toaster } from "react-hot-toast"

export default function ConfiguracionPage() {
  const configOptions = [
    {
      title: "Empresas",
      description: "Gestiona las empresas del sistema de capacitaciones",
      icon: Building2,
      href: "/configuracion/empresa",
      color: "text-blue-600 dark:text-blue-400",
    },
    {
      title: "Departamentos",
      description: "Administra los departamentos organizacionales",
      icon: Briefcase,
      href: "/configuracion/departamento",
      color: "text-green-600 dark:text-green-400",
    },
    {
      title: "Puestos",
      description: "Define y gestiona los puestos de trabajo",
      icon: UserCog,
      href: "/configuracion/puesto",
      color: "text-purple-600 dark:text-purple-400",
    },
  ]

  return (
    <RequirePermission requiredPermissions={["manage_config"]}>

      <div className="flex h-screen bg-background">
        <Sidebar />

        <div className="flex-1 flex flex-col overflow-hidden">
          <AppHeader title="Configuración" subtitle="Administra los elementos básicos del sistema" />

          <main className="flex-1 overflow-auto p-6 custom-scrollbar">
            <Toaster />

            <div className="max-w-4xl mx-auto">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {configOptions.map((option) => {
                  const Icon = option.icon
                  return (
                    <Card key={option.href} className="hover:shadow-lg transition-shadow duration-200">
                      <CardHeader className="pb-3">
                        <div className="flex items-center gap-3">
                          <div className="p-2 rounded-lg bg-muted">
                            <Icon className={`w-6 h-6 ${option.color}`} />
                          </div>
                          <CardTitle className="text-lg">{option.title}</CardTitle>
                        </div>
                      </CardHeader>
                      <CardContent className="pt-0">
                        <CardDescription className="mb-4 text-sm">{option.description}</CardDescription>
                        <Link href={option.href}>
                          <Button className="w-full bg-transparent dark:hover:bg-accent cursor-pointer" variant="outline">
                            Administrar {option.title}
                          </Button>
                        </Link>
                      </CardContent>
                    </Card>
                  )
                })}
              </div>

              <div className="mt-8 p-6 bg-muted/50 rounded-lg border">
                <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
                  <Settings className="w-5 h-5" />
                  Información del Sistema
                </h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Desde esta sección puedes configurar los elementos fundamentales del sistema de gestión de
                  capacitaciones.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div>
                    <span className="font-medium">Empresas:</span>
                    <p className="text-muted-foreground">Define las organizaciones</p>
                  </div>
                  <div>
                    <span className="font-medium">Departamentos:</span>
                    <p className="text-muted-foreground">Estructura organizacional</p>
                  </div>
                  <div>
                    <span className="font-medium">Puestos:</span>
                    <p className="text-muted-foreground">Roles y responsabilidades</p>
                  </div>
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>

    </RequirePermission>
  )
}
