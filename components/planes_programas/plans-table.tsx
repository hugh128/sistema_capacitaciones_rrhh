"use client"

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Eye } from "lucide-react"
import { PlanCapacitacion } from "@/lib/planes_programas/types"
import { getEstatusBadgeVariant } from "./plans-list-view"

interface PlansTableProps {
  title: string
  filteredPlans: PlanCapacitacion[]
  onViewDetails: (plan: PlanCapacitacion) => void
}

export const getTypeBadgeColor = (type: string) => {
  switch (type) {
    case "induccion":
      return "bg-green-100 text-green-700 dark:bg-transparent dark:border-2 dark:text-foreground dark:border-green-800"
      case "programa":
      return "bg-[#4B93E7] text-white dark:bg-[#4B93E7] dark:text-white"
    case "individual":
      return "bg-blue-100 text-blue-700 dark:bg-transparent dark:border-2 dark:text-foreground dark:border-primary"
    default:
      return "bg-muted text-muted-foreground"
  }
};

export function PlansTable({ title, filteredPlans, onViewDetails }: PlansTableProps) {
  return (
    <div className="space-y-4">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h2 className="text-xl sm:text-2xl font-bold">{title}</h2>
      </div>

      {/* Table */}
      <div className="border rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            {/* Encabezado */}
            <TableHeader className="">
              <TableRow>
                {/* <TableHead className="whitespace-nowrap">Código</TableHead> */}
                <TableHead className="whitespace-nowrap">Nombre</TableHead>
                <TableHead className="whitespace-nowrap">Tipo</TableHead>
                <TableHead className="whitespace-nowrap">Estado</TableHead>
                <TableHead className="whitespace-nowrap">Fecha de creación</TableHead>
                <TableHead className="w-[100px] whitespace-nowrap">Acciones</TableHead>
              </TableRow>
            </TableHeader>

            {/* Cuerpo */}
            <TableBody>
              {filteredPlans.length > 0 ? (
                filteredPlans.map((plan) => (
                  <TableRow
                    key={plan.ID_PLAN}
                    className=""
                  >
                    {/* <TableCell className="whitespace-nowrap">{plan.id}</TableCell> */}
                    <TableCell className="whitespace-nowrap">
                      {plan.NOMBRE}
                    </TableCell>
                    <TableCell className="whitespace-nowrap">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getTypeBadgeColor(plan.TIPO.toLowerCase())}`}>
                        {plan.TIPO}
                      </span>
                    </TableCell>
                    <TableCell className="whitespace-nowrap">
                      <Badge
                        variant={getEstatusBadgeVariant(plan.ESTADO.toLowerCase())}
                      >
                        {plan.ESTADO}
                      </Badge>
                    </TableCell>
                    <TableCell className="whitespace-nowrap">
                      {plan.FECHA_CREACION}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        onClick={() => onViewDetails(plan)}
                        variant="ghost"
                        size="sm"
                        className="text-blue-600 dark:text-foreground font-normal cursor-pointer"
                      >
                        <Eye className="w-4 h-4 mr-1" />
                        Ver detalles
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    className="text-center py-8 text-muted-foreground"
                  >
                    No se encontraron planes de capacitación
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  )
}
