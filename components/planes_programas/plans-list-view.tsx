"use client"

import { useState } from "react"
import { Search, Plus, Eye, BookOpen, Calendar, Building2, UserPlus, Check, Loader2, Info, AlertTriangle, Filter, X } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
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
  onSynchronize: (idPlan: number, usuario: string) => void
  usuario: UsuarioLogin | null
  loading?: boolean
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
      return "bg-emerald-500/10 text-emerald-700 border border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/30"
    case "programa":
      return "bg-blue-500/10 text-blue-700 border border-blue-500/20 dark:bg-blue-500/10 dark:text-blue-400 dark:border-blue-500/30"
    case "individual":
      return "bg-purple-500/10 text-purple-700 border border-purple-500/20 dark:bg-purple-500/10 dark:text-purple-400 dark:border-purple-500/30"
    default:
      return "bg-muted text-muted-foreground border border-border"
  }
};

export default function PlansListView({ plans, onCreatePlan, onViewDetails, onAssign, onImport, onObtenerColaboradores, onSynchronize, usuario, loading = false }: PlansListViewProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [typeFilter, setTypeFilter] = useState<string>("all")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [showFilters, setShowFilters] = useState(false)

  const [planParaAsignar, setPlanParaAsignar] = useState<PlanCapacitacion | null>(null);
  const [colaboradores, setColaboradores] = useState<ColaboradorDisponible[]>([]);
  const [isLoadingColaboradores, setIsLoadingColaboradores] = useState(false);
  const [errorCargaColaboradores, setErrorCargaColaboradores] = useState<string | null>(null);
  const [searchColaborador, setSearchColaborador] = useState("")

  const featuredPlans = plans.slice(0, 6)

  const filteredPlans = plans.filter((plan) => {
    const matchesSearch =
      plan.NOMBRE.toLowerCase().includes(searchQuery.toLowerCase()) ||
      plan.DESCRIPCION.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesType = typeFilter === "all" || plan.TIPO === typeFilter
    const matchesStatus = statusFilter === "all" || plan.ESTADO === statusFilter
    return matchesSearch && matchesType && matchesStatus
  })

  const filteredColaboradores = colaboradores.filter(c =>
    c.NOMBRE_COMPLETO.toLowerCase().includes(searchColaborador.toLowerCase()) ||
    c.PUESTO.toLowerCase().includes(searchColaborador.toLowerCase())
  )

  const activeFiltersCount = [typeFilter !== "all", statusFilter !== "all"].filter(Boolean).length

  const handleAssignClick = async (plan: PlanCapacitacion) => {
    setPlanParaAsignar(plan);
    setErrorCargaColaboradores(null);
    setColaboradores([]); 
    setSearchColaborador("")
    setIsLoadingColaboradores(true);

    try {
      const colaboradoresDisponibles = await onObtenerColaboradores(plan.ID_PLAN);
      const colaboradoresIniciales = colaboradoresDisponibles
        .filter(c => !c.PLAN_YA_APLICADO)
        .map(c => ({ ...c, seleccionado: false }));
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
      prev.map(c => c.ID_COLABORADOR === id ? { ...c, seleccionado: !c.seleccionado } : c)
    );
  };

  const handleSelectAll = () => {
    const allSelected = filteredColaboradores.every(c => c.seleccionado)
    setColaboradores(prev =>
      prev.map(c => 
        filteredColaboradores.find(fc => fc.ID_COLABORADOR === c.ID_COLABORADOR)
          ? { ...c, seleccionado: !allSelected }
          : c
      )
    );
  };

  const handleFinalAssign = () => {
    if (!usuario || !planParaAsignar) return;
    const selectedEmployeeIds = colaboradores.filter(c => c.seleccionado).map(c => c.ID_COLABORADOR);
    const payload: AplicarPlan = {
      idPlan: planParaAsignar.ID_PLAN,
      idsColaboradores: selectedEmployeeIds,
      usuario: usuario.USERNAME,
      NOMBRE: planParaAsignar.NOMBRE,
    };
    onAssign(payload);
    setPlanParaAsignar(null);
  };
  
  const handleCloseModal = () => {
    setPlanParaAsignar(null);
    setSearchColaborador("");
  };

  const clearFilters = () => {
    setTypeFilter("all")
    setStatusFilter("all")
  }

  const selectedCount = colaboradores.filter(c => c.seleccionado).length;

  return (
    <div className="flex flex-col space-y-6 pb-6">
      <div className="flex justify-between flex-col md:flex-row md:items-center gap-4 pb-6 border-b">
        <div>
          <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
            Planes de Capacitación
          </h1>
          <p className="text-muted-foreground mt-2">
            Gestiona y asigna planes de capacitación para tu equipo
          </p>
        </div>
        <div className="flex gap-3">
          <Button onClick={onCreatePlan} size="lg" className="shadow-sm cursor-pointer">
            <Plus className="w-4 h-4 mr-2" />
            Nuevo Plan
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="border-l-4 border-l-emerald-500">
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total de Planes</p>
                <p className="text-2xl font-bold">{plans.length}</p>
              </div>
              <BookOpen className="w-8 h-8 text-emerald-500 opacity-80" />
            </div>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-blue-500">
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Planes Activos</p>
                <p className="text-2xl font-bold">
                  {plans.filter(p => p.ESTADO.toLowerCase() === "activo").length}
                </p>
              </div>
              <Check className="w-8 h-8 text-blue-500 opacity-80" />
            </div>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-purple-500">
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">En Borrador</p>
                <p className="text-2xl font-bold">
                  {plans.filter(p => p.ESTADO.toLowerCase() === "borrador").length}
                </p>
              </div>
              <Eye className="w-8 h-8 text-purple-500 opacity-80" />
            </div>
          </CardContent>
        </Card>
      </div>

      {featuredPlans.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Planes Destacados</h2>
            <Badge variant="secondary" className="text-xs">
              {featuredPlans.length} planes
            </Badge>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredPlans.map((plan) => (
              <Card
                key={plan.ID_PLAN}
                className="group hover:shadow-lg transition-all duration-200 hover:-translate-y-1 border-2 hover:border-primary/20 flex flex-col py-5"
              >
                <CardHeader className="space-y-3 flex-grow">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0 space-y-2">
                      <CardTitle className="text-lg font-semibold leading-tight break-words group-hover:text-primary transition-colors">
                        {plan.NOMBRE}
                      </CardTitle>
                      <CardDescription className="text-sm">
                        {plan.DESCRIPCION}
                      </CardDescription>
                    </div>
                    <Badge variant={getEstatusBadgeVariant(plan.ESTADO.toLowerCase())} className="shrink-0">
                      {plan.ESTADO}
                    </Badge>
                  </div>
                  <span className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-medium w-fit self-end ${getTypeBadgeColor(plan.TIPO.toLowerCase())}`}>
                    {plan.TIPO}
                  </span>
                </CardHeader>

                <CardContent className="space-y-3">
                  <div className="flex items-center gap-3 text-sm">
                    <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary/10">
                      <BookOpen className="w-4 h-4 text-primary" />
                    </div>
                    <div>
                      <p className="font-semibold">{plan.DOCUMENTOS_PLANES.length || 0}</p>
                      <p className="text-xs text-muted-foreground">Capacitaciones</p>
                    </div>
                  </div>
                  
                  {plan.DEPARTAMENTO && (
                    <div className="flex items-center gap-3 text-sm">
                      <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-blue-500/10">
                        <Building2 className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                      </div>
                      <div className="min-w-0">
                        <p className="font-medium truncate">{plan.DEPARTAMENTO.NOMBRE}</p>
                        <p className="text-xs text-muted-foreground">{plan.DEPARTAMENTO.CODIGO}</p>
                      </div>
                    </div>
                  )}
                  
                  <div className="flex items-center gap-3 text-sm text-muted-foreground">
                    <Calendar className="w-4 h-4 shrink-0" />
                    <span className="text-xs">{plan.FECHA_CREACION}</span>
                  </div>
                </CardContent>

                <div className="border-t px-4 pt-4">
                  <Button
                    onClick={() => onViewDetails(plan)}
                    variant="ghost"
                    className="w-full group-hover:bg-primary group-hover:text-primary-foreground transition-colors cursor-pointer"
                  >
                    <Eye className="w-4 h-4 mr-2" />
                    Ver Detalles
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
            <Input
              placeholder="Buscar planes por nombre o descripción..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 h-11"
            />
            {searchQuery && (
              <Button
                variant="ghost"
                size="sm"
                className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8 p-0"
                onClick={() => setSearchQuery("")}
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>

          <Button
            variant={showFilters ? "default" : "outline"}
            onClick={() => setShowFilters(!showFilters)}
            className="sm:w-auto relative"
          >
            <Filter className="w-4 h-4 mr-2" />
            Filtros
            {activeFiltersCount > 0 && (
              <Badge className="ml-2 h-5 w-5 p-0 flex items-center justify-center" variant="secondary">
                {activeFiltersCount}
              </Badge>
            )}
          </Button>
        </div>

        {showFilters && (
          <Card className="p-4 animate-in slide-in-from-top-2 duration-200">
            <div className="flex flex-wrap gap-4">
              <div className="flex-1 min-w-[200px]">
                <Label className="text-xs font-medium mb-2 block">Tipo de Plan</Label>
                <Select value={typeFilter} onValueChange={setTypeFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Todos los tipos" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos los tipos</SelectItem>
                    <SelectItem value="INDUCCION">Inducción</SelectItem>
                    <SelectItem value="PROGRAMA">Programa</SelectItem>
                    <SelectItem value="INDIVIDUAL">Individual</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex-1 min-w-[200px]">
                <Label className="text-xs font-medium mb-2 block">Estado</Label>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger>
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

              {activeFiltersCount > 0 && (
                <div className="flex items-end">
                  <Button variant="ghost" size="sm" onClick={clearFilters}>
                    <X className="w-4 h-4 mr-2" />
                    Limpiar
                  </Button>
                </div>
              )}
            </div>
          </Card>
        )}
      </div>

      <PlansTable
        title="Todos los Planes"
        filteredPlans={filteredPlans}
        onViewDetails={onViewDetails}
        onAssignPlan={handleAssignClick}
        onSynchronizePlan={onSynchronize}
        usuario={usuario}
        loading={loading}
      />

      {planParaAsignar && (
        <Dialog open={!!planParaAsignar} onOpenChange={(open) => !open && handleCloseModal()}>
          <DialogContent className="sm:max-w-xl flex flex-col">
            <DialogHeader className="space-y-3">
              <DialogTitle className="text-2xl">Asignar Plan de Capacitación</DialogTitle>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Badge variant="default" className="text-xs">
                    {planParaAsignar.TIPO}
                  </Badge>
                  <span className="text-sm font-medium">{planParaAsignar.NOMBRE}</span>
                </div>
                <DialogDescription>
                  Selecciona los colaboradores que participarán en este plan de capacitación
                </DialogDescription>
              </div>
            </DialogHeader>

            <Separator />

            <div className="space-y-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar colaboradores..."
                  value={searchColaborador}
                  onChange={(e) => setSearchColaborador(e.target.value)}
                  className="pl-10"
                  disabled={isLoadingColaboradores}
                />
              </div>

              {!isLoadingColaboradores && !errorCargaColaboradores && colaboradores.length > 0 && (
                <div className="flex flex-col sm:flex-row items-center justify-between p-3 bg-muted/50 rounded-lg gap-4">
                  <div className="flex items-center gap-2">
                    <UserPlus className="h-4 w-4 text-primary" />
                    <span className="text-sm font-medium">
                      {selectedCount} de {filteredColaboradores.length} seleccionados
                    </span>
                  </div>
                  <div className="w-full sm:max-w-[200px]">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleSelectAll}
                      className="cursor-pointer w-full"
                    >
                      {filteredColaboradores.every(c => c.seleccionado) ? "Deseleccionar" : "Seleccionar"} todos
                    </Button>
                  </div>
                </div>
              )}

              <ScrollArea className="h-[350px] rounded-lg border">
                <div className="p-4 space-y-2">
                  {isLoadingColaboradores ? (
                    <div className="flex flex-col items-center justify-center h-[300px] text-muted-foreground">
                      <Loader2 className="w-8 h-8 animate-spin mb-4" />
                      <p className="font-medium">Cargando colaboradores...</p>
                    </div>
                  ) : errorCargaColaboradores ? (
                    <div className="flex flex-col items-center justify-center h-[300px] text-center space-y-4">
                      <div className="w-12 h-12 rounded-full bg-destructive/10 flex items-center justify-center">
                        <AlertTriangle className="w-6 h-6 text-destructive" />
                      </div>
                      <div>
                        <p className="font-semibold mb-2">Error al cargar colaboradores</p>
                        <p className="text-sm text-muted-foreground">{errorCargaColaboradores}</p>
                      </div>
                      <Button onClick={() => handleAssignClick(planParaAsignar)}>
                        Reintentar
                      </Button>
                    </div>
                  ) : filteredColaboradores.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-[300px] text-muted-foreground">
                      <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-4">
                        <Info className="w-6 h-6" />
                      </div>
                      <p className="font-medium">
                        {searchColaborador ? "No se encontraron colaboradores" : "No hay colaboradores disponibles"}
                      </p>
                      <p className="text-sm mt-1">
                        {searchColaborador ? "Intenta con otros términos de búsqueda" : "para este plan"}
                      </p>
                    </div>
                  ) : (
                    filteredColaboradores.map((colab) => {
                      const id = `colaborador-${colab.ID_COLABORADOR}`;

                      return (
                        <div
                          key={colab.ID_COLABORADOR}
                          role="button"
                          className={`
                            flex items-start gap-4 p-4 rounded-xl border transition-all select-none
                            cursor-pointer hover:bg-accent
                            ${colab.seleccionado ? "border-primary bg-primary/5" : "border-border"}
                          `}
                          onClick={() => handleToggleColaborador(colab.ID_COLABORADOR)}
                        >
                          <Checkbox
                            id={id}
                            checked={colab.seleccionado}
                            onCheckedChange={() => handleToggleColaborador(colab.ID_COLABORADOR)}
                            className="h-5 w-5 mt-1"
                          />

                          <Label htmlFor={id} className="flex-1 cursor-pointer space-y-1">
                            <div className="flex-1 space-y-1">
                              <p className="font-semibold leading-tight">{colab.NOMBRE_COMPLETO}</p>
                              <p className="text-sm text-muted-foreground leading-tight">
                                {colab.PUESTO}
                              </p>
                            </div>
                            <p className="text-xs text-muted-foreground/80 leading-tight">
                              {colab.DEPARTAMENTO}
                            </p>
                          </Label>
                        </div>
                      );
                    })
                  )}
                </div>
              </ScrollArea>
            </div>

            <DialogFooter className="gap-2 sm:gap-0">
              <Button variant="outline" onClick={handleCloseModal} className="dark:text-foreground dark:hover:border-foreground/30 cursor-pointer">
                Cancelar
              </Button>
              <Button
                onClick={handleFinalAssign}
                disabled={selectedCount === 0 || !!errorCargaColaboradores}
                className="min-w-[140px] cursor-pointer"
              >
                <Check className="h-4 w-4 mr-2" />
                Asignar ({selectedCount})
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}
