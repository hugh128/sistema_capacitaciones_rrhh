"use client"

import { useState } from "react"
import { Sidebar } from "@/components/sidebar"
import { DataTable } from "@/components/data-table"
import { FormModal } from "@/components/form-modal"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { mockPlanes, mockDepartamentos, type PlanCapacitacion } from "@/lib/types"
import { Calendar, BookOpen, Users, CheckCircle } from "lucide-react"
import { AppHeader } from "@/components/app-header"
import { RequirePermission } from "@/components/RequirePermission"

export default function PlanesPage() {
  const [planes, setPlanes] = useState<PlanCapacitacion[]>(mockPlanes)
  const [modalOpen, setModalOpen] = useState(false)
  const [editingPlan, setEditingPlan] = useState<PlanCapacitacion | null>(null)

  const columns = [
    { key: "nombre", label: "Nombre del Plan" },
    { key: "descripcion", label: "Descripción" },
    {
      key: "departamentoId",
      label: "Departamento",
      render: (value: string) => {
        if (!value || value === "all") return "Todos"
        const departamento = mockDepartamentos.find((d) => d.id === value)
        return departamento?.nombre || "Todos"
      },
    },
    {
      key: "capacitaciones",
      label: "Capacitaciones",
      render: (value: string[]) => `${value.length} capacitaciones`,
    },
    {
      key: "estado",
      label: "Estado",
      render: (value: string) => {
        const variants = {
          activo: "default" as const,
          inactivo: "secondary" as const,
          completado: "outline" as const,
        }
        return <Badge variant={variants[value as keyof typeof variants]}>{value}</Badge>
      },
    },
    { key: "fechaInicio", label: "Fecha Inicio" },
    { key: "fechaFin", label: "Fecha Fin" },
  ]

  const formFields = [
    { key: "nombre", label: "Nombre del Plan", type: "text" as const, required: true },
    { key: "descripcion", label: "Descripción", type: "textarea" as const },
    {
      key: "departamentoId",
      label: "Departamento",
      type: "select" as const,
      options: [
        { value: "all", label: "Todos los departamentos" },
        ...mockDepartamentos.map((d) => ({ value: d.id, label: d.nombre })),
      ],
    },
    { key: "fechaInicio", label: "Fecha Inicio", type: "text" as const, placeholder: "YYYY-MM-DD" },
    { key: "fechaFin", label: "Fecha Fin", type: "text" as const, placeholder: "YYYY-MM-DD" },
    {
      key: "estado",
      label: "Estado",
      type: "select" as const,
      required: true,
      options: [
        { value: "activo", label: "Activo" },
        { value: "inactivo", label: "Inactivo" },
        { value: "completado", label: "Completado" },
      ],
    },
  ]

  const handleAdd = () => {
    setEditingPlan(null)
    setModalOpen(true)
  }

  const handleEdit = (plan: PlanCapacitacion) => {
    setEditingPlan(plan)
    setModalOpen(true)
  }

  const handleDelete = (plan: PlanCapacitacion) => {
    if (confirm("¿Estás seguro de que deseas eliminar este plan?")) {
      setPlanes((prev) => prev.filter((p) => p.id !== plan.id))
    }
  }

  const handleSubmit = (data: any) => {
    const processedData = {
      ...data,
      departamentoId: data.departamentoId === "all" ? undefined : data.departamentoId,
    }

    if (editingPlan) {
      setPlanes((prev) =>
        prev.map((p) =>
          p.id === editingPlan.id ? { ...p, ...processedData, capacitaciones: editingPlan.capacitaciones } : p,
        ),
      )
    } else {
      const newPlan: PlanCapacitacion = {
        ...processedData,
        id: Date.now().toString(),
        capacitaciones: [],
        fechaCreacion: new Date().toISOString().split("T")[0],
      }
      setPlanes((prev) => [...prev, newPlan])
    }
    setModalOpen(false)
  }

  return (
    <RequirePermission requiredPermissions={["manage_trainings", "view_trainings"]}>

      <div className="flex h-screen bg-background">
        <Sidebar />

        <div className="flex-1 flex flex-col overflow-hidden">
          <AppHeader title="Planes de Capacitación" subtitle="Gestiona los planes de capacitación por departamento" />

          <main className="flex-1 overflow-auto p-6">
            <div className="max-w-7xl mx-auto space-y-6">
              {/* Plan Cards */}
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {planes.map((plan) => (
                  <Card key={plan.id}>
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg">{plan.nombre}</CardTitle>
                        <Badge variant={plan.estado === "activo" ? "default" : "secondary"}>{plan.estado}</Badge>
                      </div>
                      <CardDescription>{plan.descripcion}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="flex items-center gap-2 text-sm">
                          <BookOpen className="w-4 h-4 text-muted-foreground" />
                          <span>{plan.capacitaciones.length} capacitaciones</span>
                        </div>

                        {plan.departamentoId && (
                          <div className="flex items-center gap-2 text-sm">
                            <Users className="w-4 h-4 text-muted-foreground" />
                            <span>{mockDepartamentos.find((d) => d.id === plan.departamentoId)?.nombre}</span>
                          </div>
                        )}

                        {plan.fechaInicio && plan.fechaFin && (
                          <div className="flex items-center gap-2 text-sm">
                            <Calendar className="w-4 h-4 text-muted-foreground" />
                            <span>
                              {plan.fechaInicio} - {plan.fechaFin}
                            </span>
                          </div>
                        )}

                        {plan.estado === "completado" && (
                          <div className="flex items-center gap-2 text-sm text-chart-2">
                            <CheckCircle className="w-4 h-4" />
                            <span>Plan completado</span>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Data Table */}
              <DataTable
                title="Todos los Planes"
                data={planes}
                columns={columns}
                onAdd={handleAdd}
                onEdit={handleEdit}
                onDelete={handleDelete}
                searchPlaceholder="Buscar planes..."
              />
            </div>
          </main>
        </div>

        <FormModal
          open={modalOpen}
          onOpenChange={setModalOpen}
          title={editingPlan ? "Editar Plan" : "Nuevo Plan"}
          description={editingPlan ? "Modifica el plan de capacitación" : "Crea un nuevo plan de capacitación"}
          fields={formFields}
          initialData={
            editingPlan
              ? { ...editingPlan, departamentoId: editingPlan.departamentoId || "all" }
              : { departamentoId: "all" }
          }
          onSubmit={handleSubmit}
        />
      </div>

    </RequirePermission>
  )
}