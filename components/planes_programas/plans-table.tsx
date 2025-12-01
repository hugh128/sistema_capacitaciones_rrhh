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
import { Eye, MoreHorizontal, UserPlus, Calendar, FileText, BookOpenText } from "lucide-react"
import type { PlanCapacitacion } from "@/lib/planes_programas/types"
import { getEstatusBadgeVariant } from "./plans-list-view"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu"

interface PlansTableProps {
  title: string
  filteredPlans: PlanCapacitacion[]
  onViewDetails: (plan: PlanCapacitacion) => void
  onAssignPlan: (plan: PlanCapacitacion) => void
}

export const getTypeBadgeColor = (type: string) => {
  switch (type) {
    case "induccion":
      return "bg-gradient-to-r from-emerald-500/10 to-teal-500/10 text-emerald-700 border border-emerald-500/20 dark:text-emerald-400 dark:border-emerald-500/30 shadow-sm"
    case "programa":
      return "bg-gradient-to-r from-blue-500/10 to-indigo-500/10 text-blue-700 border border-blue-500/20 dark:text-blue-400 dark:border-blue-500/30 shadow-sm"
    case "individual":
      return "bg-gradient-to-r from-purple-500/10 to-pink-500/10 text-purple-700 border border-purple-500/20 dark:text-purple-400 dark:border-purple-500/30 shadow-sm"
    default:
      return "bg-muted text-muted-foreground border border-border"
  }
};

export function PlansTable({ title, filteredPlans, onViewDetails, onAssignPlan }: PlansTableProps) {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-border/40">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h2 className="text-2xl font-bold ">
              {title}
            </h2>
          </div>
          <p className="text-sm text-muted-foreground flex items-center gap-2">
            <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-primary/10 text-primary text-xs font-semibold dark:text-blue-400 dark:border dark:border-blue-500/30">
              {filteredPlans.length}
            </span>
            {filteredPlans.length === 1 ? "plan encontrado" : "planes encontrados"}
          </p>
        </div>
      </div>

      <div className="border rounded-xl shadow-sm bg-card overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-gradient-to-r from-muted/50 to-muted/30 hover:from-muted/60 hover:to-muted/40 transition-colors border-b border-border/50">
                <TableHead className="whitespace-nowrap font-semibold">
                  <div className="flex items-center gap-2 py-1">
                    <FileText className="w-4 h-4 text-primary/70 dark:text-foreground/70" />
                    <span>Nombre del Plan</span>
                  </div>
                </TableHead>
                <TableHead className="whitespace-nowrap font-semibold">
                  <div className="flex items-center gap-2 py-1">
                    <BookOpenText className="w-4 h-4 text-primary/70 dark:text-foreground/70" />
                    <span>Descripcion</span>
                  </div>
                </TableHead>
                <TableHead className="whitespace-nowrap font-semibold">
                  <span>Tipo</span>
                </TableHead>
                <TableHead className="whitespace-nowrap font-semibold">
                  <span>Estado</span>
                </TableHead>
                <TableHead className="whitespace-nowrap font-semibold">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-primary/70 dark:text-foreground/70" />
                    <span>Fecha Creación</span>
                  </div>
                </TableHead>
                <TableHead className="w-[100px] text-center whitespace-nowrap font-semibold">
                  <span>Acciones</span>
                </TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {filteredPlans.length > 0 ? (
                filteredPlans.map((plan) => (
                  <TableRow
                    key={plan.ID_PLAN}
                    className="group hover:bg-primary/5 hover:shadow-sm transition-all duration-200 border-b border-border/30 last:border-0"
                  >
                    <TableCell className="font-medium py-4">
                      <span className="text-base group-hover:text-primary transition-colors duration-200 font-semibold">
                        {plan.NOMBRE}
                      </span>
                    </TableCell>

                    <TableCell className="max-w-sm truncate">
                      <span className="text-base group-hover:text-primary transition-colors duration-200">
                        {plan.DESCRIPCION}
                      </span>
                    </TableCell>

                    <TableCell className="whitespace-nowrap">
                      <span className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-semibold tracking-wide uppercase ${getTypeBadgeColor(plan.TIPO.toLowerCase())} transition-transform group-hover:scale-105`}>
                        {plan.TIPO}
                      </span>
                    </TableCell>

                    <TableCell className="whitespace-nowrap">
                      <Badge
                        variant={getEstatusBadgeVariant(plan.ESTADO.toLowerCase())}
                        className="font-semibold text-xs px-3 py-1 shadow-sm transition-transform group-hover:scale-105"
                      >
                        {plan.ESTADO}
                      </Badge>
                    </TableCell>

                    <TableCell className="text-muted-foreground whitespace-nowrap">
                      <div className="flex items-center justify-center gap-2 text-center">
                        <div className="w-1.5 h-1.5 rounded-full bg-primary/40" />
                        <span className="text-sm">{plan.FECHA_CREACION}</span>
                      </div>
                    </TableCell>

                    <TableCell className="text-center">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-9 w-9 hover:bg-primary/10 hover:text-primary transition-all duration-200 group-hover:scale-110 cursor-pointer"
                          >
                            <span className="sr-only">Abrir menú</span>
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        
                        <DropdownMenuContent align="end" className="w-64 shadow-lg">
                          <DropdownMenuLabel className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                            Acciones disponibles
                          </DropdownMenuLabel>
                          
                          <DropdownMenuSeparator />
                          
                          <DropdownMenuItem 
                            onClick={() => onViewDetails(plan)}
                            className="cursor-pointer group/item py-3 focus:bg-blue-500/10 focus:text-blue-700 dark:focus:text-blue-400"
                          >
                            <div className="flex items-center gap-3 w-full">
                              <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center group-hover/item:bg-blue-500/20 transition-colors">
                                <Eye className="w-4 h-4 text-blue-600 dark:text-blue-400 group-hover/item:scale-110 transition-transform" />
                              </div>
                              <div className="flex flex-col flex-1">
                                <span className="font-semibold text-sm">Ver Detalles</span>
                                <span className="text-xs text-muted-foreground">
                                  Información completa del plan
                                </span>
                              </div>
                            </div>
                          </DropdownMenuItem>

                          <DropdownMenuSeparator />
                          
                          <DropdownMenuItem 
                            onClick={() => onAssignPlan(plan)}
                            className="cursor-pointer group/item py-3 focus:bg-emerald-500/10 focus:text-emerald-700 dark:focus:text-emerald-400"
                          >
                            <div className="flex items-center gap-3 w-full">
                              <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center group-hover/item:bg-emerald-500/20 transition-colors">
                                <UserPlus className="w-4 h-4 text-emerald-600 dark:text-emerald-400 group-hover/item:scale-110 transition-transform" />
                              </div>
                              <div className="flex flex-col flex-1">
                                <span className="font-semibold text-sm">Asignar Plan</span>
                                <span className="text-xs text-muted-foreground">
                                  Asignar a colaboradores
                                </span>
                              </div>
                            </div>
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={5}
                    className="text-center py-20"
                  >
                    <div className="flex flex-col items-center justify-center space-y-4">
                      <div className="relative">
                        <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-muted to-muted/50 flex items-center justify-center shadow-sm">
                          <FileText className="w-10 h-10 text-muted-foreground/70" />
                        </div>
                        <div className="absolute -top-1 -right-1 w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center">
                          <span className="text-xs font-bold text-primary">0</span>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <p className="font-semibold text-lg text-foreground">
                          No se encontraron planes
                        </p>
                        <p className="text-sm text-muted-foreground max-w-sm">
                          Intenta ajustar los filtros de búsqueda o crea un nuevo plan de capacitación
                        </p>
                      </div>
                    </div>
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
