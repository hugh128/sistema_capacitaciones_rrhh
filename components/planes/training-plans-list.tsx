"use client"

import { useState } from "react"
import { Search, Plus, Upload, Eye, BookOpen, Users, Calendar } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import type { TrainingPlan } from "@/app/planes/page"
import { Badge } from "../ui/badge"
import { Label } from "../ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { DataTable } from "../data-table"
import { PlanesDataTable } from "./planes-data-table"

interface TrainingPlansListProps {
  onCreatePlan: () => void
  onViewDetails: (plan: TrainingPlan) => void
}

export default function TrainingPlansList({ onCreatePlan, onViewDetails }: TrainingPlansListProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [typeFilter, setTypeFilter] = useState<string>("all")
  const [statusFilter, setStatusFilter] = useState<string>("all")


  const plans: TrainingPlan[] = [
    {
      id: "1",
      code: "PLAN-IND-001",
      name: "Plan de Inducción Corporativa",
      type: "Inducción",
      status: "Activo",
      createdAt: "2024-01-15",
      description: "Plan de inducción para nuevos colaboradores",
      trainings: [],
      department: "Recursos Humanos",
      trainingCount: 3,
      applicablePositions: ["Químico Farmacéutico", "Analista de Laboratorio", "Técnico de Laboratorio"],
    },
    {
      id: "2",
      code: "PLAN-PROG-001",
      name: "Desarrollo Técnico IT",
      type: "Programa",
      status: "Activo",
      createdAt: "2024-02-20",
      description: "Programa completo de capacitación en seguridad",
      trainings: [],
      department: "Tecnología",
      trainingCount: 1,
      applicablePositions: ["Gerente de Calidad", "Supervisor de Producción"],
    },
    {
      id: "3",
      code: "PLAN-IND-002",
      name: "Capacitación Individual - Liderazgo",
      type: "Individual",
      status: "Borrador",
      createdAt: "2024-03-10",
      description: "Capacitación individual en normas ISO",
      trainings: [],
      department: "Recursos Humanos",
      trainingCount: 1,
      applicablePositions: ["Coordinador de RRHH"],
    },
    {
      id: "4",
      code: "PRG-004",
      name: "Buenas Prácticas de Laboratorio",
      type: "Programa",
      status: "Activo",
      createdAt: "2024-01-05",
      description: "Programa de BPL para personal de laboratorio",
      trainings: [],
      department: "Laboratorio",
      trainingCount: 5,
      applicablePositions: ["Químico Farmacéutico", "Analista de Laboratorio"],
    },
    {
      id: "5",
      code: "IND-005",
      name: "Manejo de Químicos",
      type: "Individual",
      status: "Borrador",
      createdAt: "2023-12-15",
      description: "Capacitación en manejo seguro de sustancias químicas",
      trainings: [],
      department: "Laboratorio",
      trainingCount: 2,
      applicablePositions: ["Técnico de Laboratorio"],
    },
  ]

  const columns = [
    {
      key: "code",
      label: "Código",
      render: (value: string) => value || "Sin código",
    },
    { key: "name", label: "Nombre del Plan" },
    {
      key: "type",
      label: "Tipo",
      render: (value: string) => {
        const colors: Record<string, string> = {
          inducción: "bg-blue-500 text-white",
          programa: "bg-green-500 text-white",
          individual: "bg-purple-500 text-white",
        }
        return <Badge className={colors[value] || ""}>{value}</Badge>
      },
    },
    {
      key: "status",
      label: "Estado",
      render: (value: string) => {
        const variants = {
          borrador: "secondary" as const,
          activo: "default" as const,
          inactivo: "outline" as const,
          completado: "outline" as const,
        }
        return <Badge variant={variants[value as keyof typeof variants]}>{value}</Badge>
      },
    },
    { key: "createdAt", label: "Fecha de Creación" },
  ]

  const featuredPlans = plans.slice(0, 3)

  const filteredPlans = plans.filter((plan) => {
    const matchesSearch =
      plan.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      plan.code.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesType = typeFilter === "all" || plan.type === typeFilter
    const matchesStatus = statusFilter === "all" || plan.status === statusFilter
    return matchesSearch && matchesType && matchesStatus
  })

  const handleImportCSV = () => {
    console.log("[v0] Import CSV/Excel clicked")
    const input = document.createElement("input")
    input.type = "file"
    input.accept = ".csv,.xlsx"
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0]
      if (file) {
        console.log("[v0] Importing CSV/Excel file:", file.name)
        alert(
          `Importando archivo: ${file.name}\n\nEsta funcionalidad procesará el archivo y mostrará una vista previa de los planes a crear.`,
        )
      }
    }
    input.click()
  }

  const handleEdit = (plan: any) => {
  }

  return (
    <div className="flex-1 bg-background rounded-lg p-6"> 
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {featuredPlans.map((plan) => (
          <Card key={plan.id} className="cursor-pointer hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <CardTitle className="text-lg">{plan.name}</CardTitle>
                <Badge variant={plan.status === "Activo" ? "default" : "secondary"}>{plan.status}</Badge>
              </div>
              <CardDescription>{plan.code || "Sin código"}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm">
                  <Badge
                    className={
                      plan.type === "Inducción"
                        ? "bg-blue-500 text-white"
                        : plan.type === "Programa"
                          ? "bg-green-500 text-white"
                          : "bg-purple-500 text-white"
                    }
                  >
                    {plan.type}
                  </Badge>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <BookOpen className="w-4 h-4 text-muted-foreground" />
                  <span>{plan.trainingCount} capacitaciones</span>
                </div>
                {plan.department && (
                  <div className="flex items-center gap-2 text-sm">
                    <Users className="w-4 h-4 text-muted-foreground" />
                    <span>{plan.department}</span>
                  </div>
                )}
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="w-4 h-4 text-muted-foreground" />
                  <span>
                    Creado: {plan.createdAt}
                  </span>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full mt-2 bg-transparent"
                  onClick={() => onViewDetails(plan)}
                >
                  <Eye className="w-4 h-4 mr-2" />
                  Ver Detalles
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      

      {/* Actions Bar */}
      <div className="flex gap-3 mb-6">
        <Button onClick={onCreatePlan} className="cursor-pointer">
          <Plus className="w-4 h-4 mr-2" />
          Crear nueva plan
        </Button>
        <Button onClick={handleImportCSV} variant="outline" className="cursor-pointer dark:hover:bg-accent">
          <Upload className="w-4 h-4 mr-2" />
          Importar CSV/Excel
        </Button>
      </div>

      {/* Filters and Search */}
{/*       <div className="flex gap-4 mb-6">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Buscar por nombre o código..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex items-center gap-2">
          <Label className="text-sm text-muted-foreground whitespace-nowrap"></Label>
          <Select value={typeFilter} onValueChange={(newValue) => setTypeFilter(newValue)}>
            <SelectTrigger className="w-[150px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos los tipos</SelectItem>
              <SelectItem value="Inducción">Inducción</SelectItem>
              <SelectItem value="Programa">Programa</SelectItem>
              <SelectItem value="Individual">Individual</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-center gap-2">
          <Label className="text-sm text-muted-foreground whitespace-nowrap"></Label>
          <Select value={statusFilter} onValueChange={(newValue) => setStatusFilter(newValue)}>
            <SelectTrigger className="w-[160px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos los estados</SelectItem>
              <SelectItem value="Activo">Activo</SelectItem>
              <SelectItem value="Inactivo">Inactivo</SelectItem>
              <SelectItem value="Borrador">Borrador</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div> */}

      <PlanesDataTable
        title="Todos los Planes"
        data={plans}
        onEdit={onViewDetails}
        columns={columns}
        searchPlaceholder="Buscar planes..."
      />

      {/* Table */}
      {/* Usamos border-border */}
      
{/*       <div className="border border-border rounded-lg overflow-hidden">
        <table className="w-full">
          <thead className="bg-secondary">
            <tr>
              <th className="text-left px-4 py-3 text-sm font-semibold text-primary">Código</th>
              <th className="text-left px-4 py-3 text-sm font-semibold text-primary">Nombre</th>
              <th className="text-left px-4 py-3 text-sm font-semibold text-primary">Tipo</th>
              <th className="text-left px-4 py-3 text-sm font-semibold text-primary">Estado</th>
              <th className="text-left px-4 py-3 text-sm font-semibold text-primary">Fecha de creación</th>
              <th className="text-left px-4 py-3 text-sm font-semibold text-primary">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {filteredPlans.map((plan) => (
              <tr key={plan.id} 
                  className="border-t border-border hover:bg-secondary/50 transition-colors">
                <td className="px-4 py-3 text-sm text-primary">{plan.code}</td>
                <td className="px-4 py-3 text-sm text-primary font-medium">{plan.name}</td>
                <td className="px-4 py-3 text-sm text-primary">
                  <span className={`px-2 py-1 rounded text-xs font-medium ${getTypeBadgeColor(plan.type)}`}>
                    {plan.type}
                  </span>
                </td>
                <td className="px-4 py-3 text-sm">
                  <span
                    className={`px-2 py-1 rounded text-xs font-medium ${
                      plan.status === "Activo"
                        ? "bg-green-600 text-white" 
                        : plan.status === "Borrador"
                          ? "bg-gray-500 text-white"
                          : "bg-red-600 text-white"
                    }`}
                  >
                    {plan.status}
                  </span>
                </td>
                <td className="px-4 py-3 text-sm text-primary">{plan.createdAt}</td>
                <td className="px-4 py-3">
                  <Button
                    onClick={() => onViewDetails(plan)}
                    variant="ghost"
                    size="sm"
                    className="text-primary hover:text-primary hover:bg-secondary"
                  >
                    <Eye className="w-4 h-4 mr-1" />
                    Ver detalles
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div> */}

      

      {filteredPlans.length === 0 && (
        <div className="text-center py-12">
          {/* Usamos text-muted-foreground */}
          <p className="text-muted-foreground">No se encontraron planes de capacitación</p>
        </div>
      )}
    </div>
  )
}
