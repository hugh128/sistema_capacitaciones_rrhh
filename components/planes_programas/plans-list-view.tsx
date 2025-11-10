"use client"

import { useState } from "react"
import { Search, Plus, Eye, BookOpen, Calendar, Building2, UserPlus, Check, Loader2, Info, AlertTriangle } from "lucide-react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import type { AplicarPlan, ColaboradorDisponible, PlanCapacitacion } from "@/lib/planes_programas/types"
import { PlansTable } from "./plans-table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { UsuarioLogin } from "@/lib/auth";

interface PlansListViewProps {
  plans: PlanCapacitacion[]
  onCreatePlan: () => void
  onViewDetails: (plan: PlanCapacitacion) => void
  onAssign: (aplicarPlan: AplicarPlan) => void
  onImport: () => void
  onObtenerColaboradores: (idPlan: number) => Promise<ColaboradorDisponible[]>
  usuario: UsuarioLogin | null
}

type BadgeVariant = "default" | "secondary" | "destructive" | "outline";

export const getEstatusBadgeVariant = (estatus: string): BadgeVariant => {
  switch (estatus) {
    case "activo":
      return "default"; 
    case "borrador":
      return "outline";
    case "inactivo":
      return "destructive";
    default:
      return "secondary";
  }
};

export const getTypeBadgeColor = (type: string) => {
  switch (type) {
    case "induccion":
      return "bg-green-500 text-white dark:bg-green-700 dark:text-white"
      case "programa":
      return "bg-[#4B93E7] text-white dark:bg-[#4B93E7] dark:text-white"
    case "individual":
      return "bg-[#A855F7] text-white dark:bg-[#A855F7] dark:text-white"
    default:
      return "bg-muted text-muted-foreground"
  }
};

export default function PlansListView({ plans, onCreatePlan, onViewDetails, onAssign, onImport, onObtenerColaboradores, usuario }: PlansListViewProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [typeFilter, setTypeFilter] = useState<string>("all")
  const [statusFilter, setStatusFilter] = useState<string>("all")

  const [planParaAsignar, setPlanParaAsignar] = useState<PlanCapacitacion | null>(null);
  const [colaboradores, setColaboradores] = useState<ColaboradorDisponible[]>([]);
  const [isLoadingColaboradores, setIsLoadingColaboradores] = useState(false);
  const [errorCargaColaboradores, setErrorCargaColaboradores] = useState<string | null>(null);

  const featuredPlans = plans.slice(0, 6)

  const filteredPlans = plans.filter((plan) => {
    const matchesSearch =
      plan.NOMBRE.toLowerCase().includes(searchQuery.toLowerCase()) ||
      plan.DESCRIPCION.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesType = typeFilter === "all" || plan.TIPO === typeFilter
    const matchesStatus = statusFilter === "all" || plan.ESTADO === statusFilter
    return matchesSearch && matchesType && matchesStatus
  })

  const handleAssignClick = async (plan: PlanCapacitacion) => {
    setPlanParaAsignar(plan);
    setErrorCargaColaboradores(null);
    setColaboradores([]); 
    setIsLoadingColaboradores(true);

    try {
      const colaboradoresDisponibles = await onObtenerColaboradores(plan.ID_PLAN);

      const colaboradoresIniciales = colaboradoresDisponibles
        .filter(c => !c.PLAN_YA_APLICADO)
        .map(c => ({
          ...c,
          seleccionado: false,
        }));

      setColaboradores(colaboradoresIniciales);

    } catch (error) {
      console.error("Error al cargar colaboradores:", error);
      setErrorCargaColaboradores("No se pudo cargar la lista de colaboradores. Intente de nuevo.");
      setColaboradores([]);
      
    } finally {
      setIsLoadingColaboradores(false);
    }
  };

  const handleToggleColaborador = (id: number) => {
    setColaboradores(prev =>
      prev.map(c =>
        c.ID_COLABORADOR === id ? { ...c, seleccionado: !c.seleccionado } : c
      )
    );
  };

  const handleFinalAssign = () => {
    if (!usuario) {
      console.error("Error: Usuario no logueado para asignar programa.");
      return;
    }

    if (!planParaAsignar) return;

    const selectedEmployeeIds = colaboradores
      .filter(c => c.seleccionado)
      .map(c => c.ID_COLABORADOR); 

    const usuarioActual = usuario?.USERNAME

    const payload: AplicarPlan = {
      idPlan: planParaAsignar.ID_PLAN,
      idsColaboradores: selectedEmployeeIds,
      usuario: usuarioActual,
      NOMBRE: planParaAsignar.NOMBRE,
    };

    onAssign(payload);

    setPlanParaAsignar(null);
  };
  
  const handleCloseModal = () => setPlanParaAsignar(null);

  return (
    <div className="h-full flex flex-col">

      <div className="my-6">
        <h1 className="text-3xl font-bold text-foreground">Planes de Capacitación</h1>
        <p className="text-muted-foreground mt-1">Gestiona los planes de capacitación de tu organización</p>
      </div>

      {/* Featured Plans Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {featuredPlans.map((plan) => (
          <Card
            key={plan.ID_PLAN}
            className="hover:shadow-md transition-shadow"
          >
            {/* Card Header */}
            <CardHeader className="flex flex-col justify-between h-full">
              <div className="flex items-start gap-2 w-full">
                <div className="flex-1 min-w-0">
                  <CardTitle className="text-lg font-semibold mb-1 leading-snug break-words">
                    {plan.NOMBRE}
                  </CardTitle>
                  <CardDescription className="text-sm text-muted-foreground break-words">
                    {`ID-${plan.ID_PLAN}`}
                  </CardDescription>
                </div>
                <div className="flex-shrink-0">
                  <Badge variant={getEstatusBadgeVariant(plan.ESTADO.toLowerCase())}>
                    {plan.ESTADO}
                  </Badge>
                </div>
              </div>
              <div className="mt-1">
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${getTypeBadgeColor(plan.TIPO.toLowerCase())}`}>
                  {plan.TIPO}
                </span>
              </div>
            </CardHeader>

            {/* Card Content (Detalles) */}
            <CardContent className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-foreground">
                <BookOpen className="w-4 h-4 text-muted-foreground" />
                <span>
                  <span className="font-semibold">{plan.DOCUMENTOS_PLANES.length || 0}</span> capacitaciones
                </span>
              </div>
              {plan.DEPARTAMENTO && (
                <div className="flex items-center gap-2 text-sm text-foreground">
                  <Building2 className="w-4 h-4 text-muted-foreground" />
                  <span className="text-card-foreground">{`${plan.DEPARTAMENTO.CODIGO} - ${plan.DEPARTAMENTO.NOMBRE}`}</span>
                </div>
              )}
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Calendar className="w-4 h-4 text-muted-foreground" />
                <span>Creado: {plan.FECHA_CREACION}</span>
              </div>
            </CardContent>

            {/* Card Footer (Botón) */}
            <CardFooter className="px-6 py-2">
              <Button
                onClick={() => onViewDetails(plan)}
                variant="outline"
                className="w-full"
              >
                <Eye className="w-4 h-4 mr-2" />
                Ver Detalles
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>

      {/* Actions Bar */}
      <div className="flex gap-3 mb-6">
        <Button onClick={onCreatePlan} className="cursor-pointer">
          <Plus className="w-4 h-4 mr-2" />
          Crear Nuevo Plan
        </Button>
{/*         <Button onClick={onImport} variant="outline" className="cursor-pointer dark:hover:bg-accent">
          <Upload className="w-4 h-4 mr-2" />
          Importar CSV/Excel
        </Button> */}
      </div>

      {/* Filters and Search */}
      <div className="flex flex-wrap gap-4 mb-6">
        {/* Input de búsqueda */}
        <div className="flex-1 relative min-w-[250px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por nombre o código..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Select de tipo */}
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Todos los tipos" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos los tipos</SelectItem>
            <SelectItem value="INDIVIDUAL">INDUCCION</SelectItem>
            <SelectItem value="INDIVUDUAL">INDIVIDUAL</SelectItem>
          </SelectContent>
        </Select>

        {/* Select de estado */}
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Todos los estados" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos los estados</SelectItem>
            <SelectItem value="Activo">Activo</SelectItem>
            <SelectItem value="Inactivo">Inactivo</SelectItem>
            <SelectItem value="Borrador">Borrador</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Plans Table */}
      <PlansTable
        title="Todos los Planes"
        filteredPlans={filteredPlans}
        onViewDetails={onViewDetails}
        onAssignPlan={handleAssignClick}
      />

      {planParaAsignar && (
        <Dialog
          open={!!planParaAsignar} 
          onOpenChange={(open) => !open && handleCloseModal()}
        >
          <DialogContent className="sm:max-w-md md:max-w-lg">
            <DialogHeader>
              <DialogTitle>Asignar Plan: {planParaAsignar.NOMBRE}</DialogTitle>
              <DialogDescription>
                Selecciona los colaboradores que deben completar el plan de capacitación.
              </DialogDescription>
            </DialogHeader>

            <Separator className="" />
            
            <div className="flex items-center space-x-2">
              <UserPlus className="h-4 w-4 text-primary" />
              <h4 className="font-semibold text-sm">Selección de Colaboradores</h4>
            </div>

            <ScrollArea className="h-[320px] w-full border rounded-md p-4">
              <div className="space-y-3">
                {isLoadingColaboradores ? (
                  <div className="flex flex-col items-center justify-center h-full py-16 text-muted-foreground">
                    <Loader2 className="w-6 h-6 animate-spin mb-3" />
                    <span>Cargando colaboradores aplicables...</span>
                  </div>
                ) : errorCargaColaboradores ? (
                  <div className="flex flex-col items-center justify-center h-full py-16 text-destructive">
                    <AlertTriangle className="w-6 h-6 mb-3" />
                    <span className="text-center font-medium">{errorCargaColaboradores}</span>
                    <Button 
                      variant="outline" 
                      onClick={() => handleAssignClick(planParaAsignar!)} 
                      className="mt-4"
                    >
                      Reintentar Carga
                    </Button>
                  </div>
                ) : colaboradores.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full py-16 text-muted-foreground">
                    <Info className="w-6 h-6 mb-3" />
                    <span>No se encontraron colaboradores que apliquen a este plan.</span>
                  </div>
                ) : (
                  colaboradores.map((colaborador) => (
                    <div key={colaborador.ID_COLABORADOR} className="flex items-center justify-between p-2 hover:bg-muted/50 rounded-md transition-colors">
                      <Label htmlFor={`colaborador-${colaborador.ID_COLABORADOR}`} className="flex flex-col flex-grow cursor-pointer">
                        <span className="font-medium">{colaborador.NOMBRE_COMPLETO}</span> 
                        <span className="text-sm text-muted-foreground">{colaborador.PUESTO}</span>
                      </Label>
                      <Checkbox
                        id={`colaborador-${colaborador.ID_COLABORADOR}`}
                        checked={colaborador.seleccionado}
                        onCheckedChange={() => handleToggleColaborador(colaborador.ID_COLABORADOR)} 
                        className="h-5 w-5 ml-4"
                      />
                    </div>
                  ))
                )}
              </div>
            </ScrollArea>

            <DialogFooter>
              <Button variant="outline" onClick={handleCloseModal}>
                Cancelar
              </Button>
              <Button 
                onClick={handleFinalAssign}
                disabled={colaboradores.filter(c => c.seleccionado).length === 0 || !!errorCargaColaboradores}
                className="bg-primary hover:bg-primary/90"
              >
                <Check className="h-4 w-4 mr-2" />
                Asignar a {colaboradores.filter(c => c.seleccionado).length}{" "}
                {colaboradores.filter(c => c.seleccionado).length === 1 ? "Colaborador" : "Colaboradores"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}
