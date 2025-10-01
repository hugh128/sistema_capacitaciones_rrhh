"use client"

import { useState } from "react"
import { useParams } from "next/navigation"
import { Sidebar } from "@/components/sidebar"
import { AppHeader } from "@/components/app-header"
import { TrainingWorkflow } from "@/components/training-workflow"
import { mockCapacitaciones, type Capacitacion } from "@/lib/types"
import { useAuth } from "@/contexts/auth-context"

export default function TrainingDetailPage() {
  const params = useParams()
  const { user } = useAuth()
  const [capacitaciones, setCapacitaciones] = useState<Capacitacion[]>(mockCapacitaciones)

  const capacitacion = capacitaciones.find((c) => c.id === params.id)

  if (!capacitacion) {
    return (
      <div className="flex h-screen bg-background">
        <Sidebar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-2xl font-bold">Capacitación no encontrada</h2>
            <p className="text-muted-foreground">La capacitación solicitada no existe.</p>
          </div>
        </div>
      </div>
    )
  }

  const handleStatusChange = (newStatus: Capacitacion["estado"]) => {
    setCapacitaciones((prev) => prev.map((c) => (c.id === capacitacion.id ? { ...c, estado: newStatus } : c)))
  }

  return (
    <div className="flex h-screen bg-background">
      <Sidebar />

      <div className="flex-1 flex flex-col overflow-hidden">
        <AppHeader
          title={`Capacitación: ${capacitacion.nombre}`}
          subtitle={`Gestión del flujo de trabajo • ${capacitacion.codigo}`}
        />

        <main className="flex-1 overflow-auto p-6">
          <div className="max-w-7xl mx-auto">
            <TrainingWorkflow capacitacion={capacitacion} onStatusChange={handleStatusChange} />
          </div>
        </main>
      </div>
    </div>
  )
}
