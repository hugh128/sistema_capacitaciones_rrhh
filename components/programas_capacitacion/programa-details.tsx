"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { ArrowLeft, Plus, Pencil, Calendar, Users, MoreVertical, Eye, BookOpen, Building2, Sparkles, TrendingUp, Target, Award, CheckCircle2, Clock } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import type {
  ProgramaCapacitacion,
  CreateProgramaDetalleDto,
  ProgramaDetalle,
  ProgramaCapacitacionDetalle,
  ColaboradorPrograma
} from "@/lib/programas_capacitacion/types"
import type { Departamento, Puesto } from "@/lib/types"
import toast from "react-hot-toast"
import { TrainingModal } from "./training-modal"
import { TrainingDetailModal } from "./training-detail-modal"
import { Badge } from "../ui/badge"
import { Card } from "../ui/card"
import { Progress } from "../ui/progress"
import { useAuth } from "@/contexts/auth-context"
import { useProgramasCapacitacion } from "@/hooks/useProgramasCapacitacion"

interface ProgramaDetailsProps {
  programa: ProgramaCapacitacion
  departamentos: Departamento[]
  puestos: Puesto[]
  onEdit: (programa: ProgramaCapacitacion) => void
  onBack: () => void
}

const getEstatusSpanVariant = (estatus: string) => {
  switch (estatus.toLowerCase()) {
    case "activo":
      return "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-700"
    case "inactivo":
      return "bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400 border border-rose-300 dark:border-rose-700"
    default:
      return "bg-slate-100 text-slate-600 dark:bg-slate-700/30 dark:text-slate-400 border border-slate-300 dark:border-slate-700"
  }
}

const getCategoriaVariant = (categoria: string) => {
  switch (categoria) {
    case "GENERAL":
      return "bg-cyan-50 text-cyan-700 dark:bg-cyan-900/20 dark:text-cyan-400 border border-cyan-200 dark:border-cyan-800"
    case "ESPECIFICA":
      return "bg-violet-50 text-violet-700 dark:bg-violet-900/20 dark:text-violet-400 border border-violet-200 dark:border-violet-800"
    case "CONTINUA":
      return "bg-amber-50 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400 border border-amber-200 dark:border-amber-800"
    default:
      return "bg-slate-50 text-slate-700 dark:bg-slate-800/20 dark:text-slate-400 border border-slate-200 dark:border-slate-700"
  }
}

const getTipoVariant = (tipo: string) => {
  switch (tipo) {
    case "INTERNA":
      return "bg-indigo-50 text-indigo-700 dark:bg-indigo-900/20 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800"
    case "EXTERNA":
      return "bg-orange-50 text-orange-700 dark:bg-orange-900/20 dark:text-orange-400 border border-orange-200 dark:border-orange-800"
    default:
      return "bg-slate-50 text-slate-700 dark:bg-slate-800/20 dark:text-slate-400 border border-slate-200 dark:border-slate-700"
  }
}

export function ProgramaDetails({ programa, departamentos, puestos, onEdit, onBack }: ProgramaDetailsProps) {
  const [activeTab, setActiveTab] = useState("info")
  const [showTrainingModal, setShowTrainingModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedTraining, setSelectedTraining] = useState<ProgramaDetalle | null>(null);
  const [editMode, setEditMode] = useState(false);
  const [detalles, setDetalles] = useState<ProgramaDetalle[]>(programa.PROGRAMA_DETALLES || []);
  const [programaDetalle, setProgramaDetalle] = useState<ProgramaCapacitacionDetalle>()
  const [colaboradorPrograma, setColaboradorPrograma] = useState<ColaboradorPrograma[]>([])

  const { user } = useAuth()
  const {
    obtenerDetalleProgramaConColaboradores,
    obtenerProgramaDetalle,
    saveProgramaDetalle,
    updateProgramaDetalle,
  } = useProgramasCapacitacion(user)

  useEffect(() => {
    if (!user || !user.PERSONA_ID) {
      return; 
    }

    const fetchData = async () => {
      try {
        const {
          DETALLE_PROGRAMA,
          COLABORADORES_PROGRAMA
        } = await obtenerDetalleProgramaConColaboradores(programa.ID_PROGRAMA)
        setProgramaDetalle(DETALLE_PROGRAMA)
        setColaboradorPrograma(COLABORADORES_PROGRAMA)

        const data = await obtenerProgramaDetalle(programa.ID_PROGRAMA)
        setDetalles(data);
      } catch (error) {
        console.error('Error al cargar datos:', error)
      }
    }

    fetchData()
  }, [user, obtenerDetalleProgramaConColaboradores, obtenerProgramaDetalle, programa.ID_PROGRAMA])

  const handleAddTraining = () => {
    setEditMode(false);
    setSelectedTraining(null);
    setShowTrainingModal(true);
  };

  const handleEditTraining = (training: ProgramaDetalle) => {
    setEditMode(true);
    setSelectedTraining(training);
    setShowTrainingModal(true);
  };

  const handleViewDetail = (training: ProgramaDetalle) => {
    setSelectedTraining(training);
    setShowDetailModal(true);
  };

  const handleSaveTraining = async (data: CreateProgramaDetalleDto) => {
    try {
      if (editMode && selectedTraining) {
        const detallesActualizados = await updateProgramaDetalle(selectedTraining.ID_DETALLE, data);
        if (detallesActualizados) {
          setDetalles(detallesActualizados);
        }
        toast.success("Capacitación actualizada correctamente");
      } else {
        const detallesActualizados = await saveProgramaDetalle(data);
        if (detallesActualizados) {
          setDetalles(detallesActualizados);
        }
        toast.success("Capacitación agregada correctamente");
      }
      setShowTrainingModal(false);
      
      const {
        DETALLE_PROGRAMA,
        COLABORADORES_PROGRAMA
      } = await obtenerDetalleProgramaConColaboradores(programa.ID_PROGRAMA)
      setProgramaDetalle(DETALLE_PROGRAMA)
      setColaboradorPrograma(COLABORADORES_PROGRAMA)
      
    } catch (error) {
      toast.error(editMode ? "Error al actualizar la capacitación" : "Error al agregar la capacitación");
      console.error(error);
    }
  };

  const calcularProgreso = (colaborador: typeof colaboradorPrograma[0]) => {
    const completadas = colaborador.CAPACITACIONES_ASIGNADAS.filter(c => c.COMPLETADA).length;
    const total = colaborador.CAPACITACIONES_ASIGNADAS.length;
    return total > 0 ? Math.round((completadas / total) * 100) : 0;
  };

  return (
    <div className="flex-1 bg-background rounded-lg overflow-hidden flex flex-col">
      {/* Header */}
      <div className="relative bg-gradient-to-r from-[#000428] to-[#004e92] dark:from-slate-950 dark:to-blue-900 text-white p-8 overflow-hidden">
        
        <div className="absolute -top-24 -right-24 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl hidden dark:block" />

        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-start md:items-center gap-4 w-full md:w-auto flex-wrap">
            <Button
              onClick={onBack}
              variant="ghost"
              size="sm"
              className="text-white hover:bg-white/20 cursor-pointer backdrop-blur-sm"
            >
              <ArrowLeft className="w-4 h-4" />
            </Button>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-2xl md:text-3xl font-bold break-words">
                  {programa.NOMBRE}
                </h1>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getEstatusSpanVariant(programa.ESTADO)}`}>
                  {programa.ESTADO}
                </span>
                <span className="text-white/80 text-sm">
                  Programa #{programa.ID_PROGRAMA}
                </span>
                <span className="text-white/60">•</span>
                <span className="text-white/80 text-sm flex items-center gap-1">
                  <Target className="w-3.5 h-3.5" />
                  {programa.TIPO}
                </span>
                <span className="text-white/60">•</span>
                <span className="text-white/80 text-sm flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5" />
                  {programa.PERIODO}
                </span>
              </div>
            </div>
          </div>

          <Button
            onClick={() => onEdit(programa)}
            className="bg-white text-blue-900 hover:bg-white/90 
              dark:bg-white/10 dark:text-white dark:hover:bg-white/20 dark:border dark:border-white/20 dark:backdrop-blur-sm
              cursor-pointer w-full md:w-auto font-semibold shadow-lg transition-all"
          >
            <Pencil className="w-4 h-4 mr-2" />
            Editar Programa
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex-1 bg-card overflow-hidden">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full flex flex-col">
          <TabsList className="w-full justify-start rounded-none border-b bg-gradient-to-r from-slate-50 to-indigo-50/30 dark:from-slate-900 dark:to-indigo-950/30 p-0 h-auto flex flex-wrap">
            <TabsTrigger
              value="info"
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-b-blue-800 dark:data-[state=active]:border-b-blue-800 data-[state=active]:bg-white/60 dark:data-[state=active]:bg-slate-800/60 px-6 py-4 cursor-pointer font-medium"
            >
              <TrendingUp className="w-4 h-4 mr-2" />
              Información del Programa
            </TabsTrigger>
            <TabsTrigger
              value="colaboradores"
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-b-blue-800 dark:data-[state=active]:border-b-blue-800 data-[state=active]:bg-white/60 dark:data-[state=active]:bg-slate-800/60 px-6 py-4 cursor-pointer font-medium"
            >
              <Users className="w-4 h-4 mr-2" />
              Colaboradores Participantes
              <span className="ml-2 px-2 py-0.5 bg-indigo-100 dark:bg-indigo-900/50 text-blue-800 dark:text-blue-300 rounded-full text-xs font-bold">
                {programaDetalle?.TOTAL_COLABORADORES_ASIGNADOS}
              </span>
            </TabsTrigger>
          </TabsList>

          {/* Tab: Información */}
          <TabsContent value="info" className="flex-1 overflow-y-auto p-6 mt-0">
            <div className="space-y-6 mx-auto max-w-7xl">
              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="relative bg-gradient-to-br from-cyan-500 to-blue-600 dark:from-cyan-800 dark:to-blue-900 p-6 rounded-xl shadow-lg overflow-hidden group hover:shadow-xl transition-all">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 group-hover:scale-110 transition-transform"></div>
                  <div className="relative z-10">
                    <div className="flex items-center justify-between mb-3">
                      <div className="p-3 bg-white/20 backdrop-blur-sm rounded-lg">
                        <BookOpen className="w-6 h-6 text-white" />
                      </div>
                      <Sparkles className="w-5 h-5 text-cyan-200" />
                    </div>
                    <p className="text-cyan-100 text-sm font-medium mb-1">
                      Total Capacitaciones
                    </p>
                    <p className="text-4xl font-bold text-white">
                      {detalles.length}
                    </p>
                  </div>
                </div>

                <div className="relative bg-gradient-to-br from-violet-500 to-purple-600 dark:from-violet-800 dark:to-purple-900 p-6 rounded-xl shadow-lg overflow-hidden group hover:shadow-xl transition-all">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 group-hover:scale-110 transition-transform"></div>
                  <div className="relative z-10">
                    <div className="flex items-center justify-between mb-3">
                      <div className="p-3 bg-white/20 backdrop-blur-sm rounded-lg">
                        <Users className="w-6 h-6 text-white" />
                      </div>
                      <TrendingUp className="w-5 h-5 text-violet-200" />
                    </div>
                    <p className="text-violet-100 text-sm font-medium mb-1">
                      Colaboradores Activos
                    </p>
                    <p className="text-4xl font-bold text-white">
                      {colaboradorPrograma.length}
                    </p>
                  </div>
                </div>

                <div className="relative bg-gradient-to-br from-amber-500 to-orange-600 dark:from-amber-800 dark:to-orange-900 p-6 rounded-xl shadow-lg overflow-hidden group hover:shadow-xl transition-all">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 group-hover:scale-110 transition-transform"></div>
                  <div className="relative z-10">
                    <div className="flex items-center justify-between mb-3">
                      <div className="p-3 bg-white/20 backdrop-blur-sm rounded-lg">
                        <Calendar className="w-6 h-6 text-white" />
                      </div>
                      <Award className="w-5 h-5 text-amber-200" />
                    </div>
                    <p className="text-amber-100 text-sm font-medium mb-1">
                      Fecha de Creación
                    </p>
                    <p className="text-2xl font-bold text-white">
                      {programa.FECHA_CREACION}
                    </p>
                  </div>
                </div>
              </div>

              {/* Información General */}
              <div className="border-2 rounded-xl shadow-lg p-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 bg-gradient-to-br from-blue-900 to-blue-950 rounded-lg">
                    <Building2 className="w-5 h-5 text-white" />
                  </div>
                  <h2 className="text-xl font-bold text-foreground">
                    Información General
                  </h2>
                </div>
                
                <div className="space-y-5">
                  <div className="bg-gradient-to-r from-slate-50 to-indigo-50/30 dark:from-slate-800/50 dark:to-indigo-950/30 p-4 rounded-lg">
                    <p className="text-sm font-semibold text-slate-600 dark:text-slate-400 mb-2">Descripción del Programa</p>
                    <p className="text-sm text-foreground leading-relaxed">
                      {programa.DESCRIPCION || "Sin descripción"}
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-gradient-to-br from-cyan-50 to-blue-50 dark:from-transparent dark:to-transparent p-4 rounded-lg border border-cyan-200 dark:border-cyan-800">
                      <p className="text-sm font-semibold text-cyan-700 dark:text-cyan-400 mb-2 flex items-center gap-2">
                        <Target className="w-4 h-4" />
                        Tipo de Programa
                      </p>
                      <span className="inline-flex items-center px-3 py-1.5 bg-cyan-100 dark:bg-cyan-900/30 text-cyan-800 dark:text-cyan-300 rounded-lg text-sm font-bold border border-cyan-300 dark:border-cyan-700">
                        {programa.TIPO}
                      </span>
                    </div>

                    <div className="bg-gradient-to-br from-violet-50 to-purple-50 dark:from-transparent dark:to-transparent p-4 rounded-lg border border-violet-200 dark:border-violet-800">
                      <p className="text-sm font-semibold text-violet-700 dark:text-violet-400 mb-2 flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        Periodo Vigente
                      </p>
                      <span className="inline-flex items-center px-3 py-1.5 bg-violet-100 dark:bg-violet-900/30 text-violet-800 dark:text-violet-300 rounded-lg text-sm font-bold border border-violet-300 dark:border-violet-700">
                        {programa.PERIODO}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Tabla de Capacitaciones */}
              <div className="bg-card border border-border rounded-lg overflow-hidden">
                <div className="bg-muted/50 px-6 py-4 border-b border-border">
                  <div className="flex items-center justify-between flex-wrap gap-4">
                    <div>
                      <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
                        <BookOpen className="w-5 h-5 text-primary" />
                        Capacitaciones del Programa
                      </h2>
                      <p className="text-sm text-muted-foreground mt-1">
                        Capacitaciones incluidas en este programa
                      </p>
                    </div>
                    <Button
                      onClick={handleAddTraining}
                      size="sm"
                      className="bg-primary text-primary-foreground hover:bg-primary/90 cursor-pointer"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Agregar Capacitación
                    </Button>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full min-w-[800px]">
                    <thead className="bg-muted/30">
                      <tr>
                        <th className="text-center px-4 py-3 text-sm font-semibold text-foreground">
                          No.
                        </th>
                        <th className="text-left px-4 py-3 text-sm font-semibold text-foreground">
                          Nombre
                        </th>
                        <th className="text-left px-4 py-3 text-sm font-semibold text-foreground">
                          Categoría
                        </th>
                        <th className="text-center px-4 py-3 text-sm font-semibold text-foreground">
                          Tipo
                        </th>
                        <th className="text-center px-4 py-3 text-sm font-semibold text-foreground">
                          Mes
                        </th>
                        <th className="text-left px-4 py-3 text-sm font-semibold text-foreground">
                          Alcance
                        </th>
                        <th className="text-left px-4 py-3 text-sm font-semibold text-foreground">
                          Estado
                        </th>
                        <th className="text-center px-4 py-3 text-sm font-semibold text-foreground">
                          Acciones
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {detalles.length === 0 ? (
                        <tr>
                          <td colSpan={8} className="px-4 py-12">
                            <div className="text-center">
                              <BookOpen className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                              <p className="text-muted-foreground font-medium">
                                No hay capacitaciones en este programa
                              </p>
                              <p className="text-sm text-muted-foreground mt-1">
                                Agrega la primera capacitación para comenzar
                              </p>
                            </div>
                          </td>
                        </tr>
                      ) : (
                        detalles.map((detalle, index) => (
                          <tr
                            key={detalle.ID_DETALLE}
                            className={`border-t border-border hover:bg-muted/20 transition-colors ${
                              index % 2 === 0 ? "bg-muted/5" : ""
                            }`}
                          >
                            <td className="px-4 py-4 text-center">
                              <p className="text-sm text-foreground font-medium">
                                {index + 1}
                              </p>
                            </td>
                            <td className="px-4 py-4">
                              <p className="text-sm font-medium text-foreground">
                                {detalle.NOMBRE}
                              </p>
                            </td>
                            <td className="px-4 py-4">
                              <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium border ${getCategoriaVariant(detalle.CATEGORIA_CAPACITACION)}`}>
                                {detalle.CATEGORIA_CAPACITACION}
                              </span>
                            </td>
                            <td className="px-4 py-4 text-center">
                              <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium ${getTipoVariant(detalle.TIPO_CAPACITACION)}`}>
                                {detalle.TIPO_CAPACITACION}
                              </span>
                            </td>
                            <td className="px-4 py-4">
                              <div className="flex items-center gap-2 justify-center">
                                <Calendar className="w-4 h-4 text-muted-foreground" />
                                <span className="text-sm font-medium text-foreground">
                                  {detalle.MES_PROGRAMADO}
                                </span>
                              </div>
                            </td>
                            <td className="px-4 py-4">
                              {detalle.APLICA_TODOS_COLABORADORES ? (
                                <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30">
                                  <Users className="w-3 h-3 mr-1" />
                                  Todos
                                </span>
                              ) : (
                                <div className="flex flex-wrap gap-1">
                                  {detalle.DEPARTAMENTO_RELACIONES.slice(0, 2).map((dept) => (
                                    <span
                                      key={dept.ID_DEPARTAMENTO}
                                      className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400"
                                    >
                                      {dept.CODIGO}
                                    </span>
                                  ))}
                                  {detalle.DEPARTAMENTO_RELACIONES.length > 2 && (
                                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 dark:bg-gray-700/30 text-gray-700 dark:text-gray-400">
                                      +{detalle.DEPARTAMENTO_RELACIONES.length - 2}
                                    </span>
                                  )}
                                </div>
                              )}
                            </td>
                            <td className="px-4 py-4">
                              <span
                                className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium ${getEstatusSpanVariant(
                                  detalle.ESTADO
                                )}`}
                              >
                                {detalle.ESTADO}
                              </span>
                            </td>
                            <td className="px-4 py-4 text-center">
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild className="cursor-pointer">
                                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                    <MoreVertical className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="w-48">
                                  <DropdownMenuItem onClick={() => handleViewDetail(detalle)} className="cursor-pointer">
                                    <Eye className="mr-2 h-4 w-4" />
                                    Ver detalle
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => handleEditTraining(detalle)} className="cursor-pointer">
                                    <Pencil className="mr-2 h-4 w-4" />
                                    Editar
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </TabsContent>

          {/* Tab: Colaboradores */}
          <TabsContent value="colaboradores" className="mt-0 outline-none">
            <div className="space-y-4">
              {/* Header */}
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 px-8 py-6 mb-0">
                <div className="space-y-1">
                  <h2 className="text-2xl font-semibold tracking-tight text-slate-900 dark:text-white flex items-center gap-3">
                    <div className="p-2 bg-blue-800 rounded-lg">
                      <Users className="w-5 h-5 text-white" />
                    </div>
                    Participantes del Programa
                  </h2>
                  <p className="text-slate-500 text-sm">
                    Seguimiento detallado del progreso individual y estatus de cumplimiento.
                  </p>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <span className="text-[10px] font-bold uppercase tracking-[0.1em] text-slate-400">Total asignados</span>
                  <span className="text-3xl font-light text-blue-800">{colaboradorPrograma.length}</span>
                </div>
              </div>

              {/* Listado de Colaboradores */}
              <div className="grid gap-4 p-4">
                {colaboradorPrograma.map((colaborador) => {
                  const progreso = calcularProgreso(colaborador);
                  const completadas = colaborador.CAPACITACIONES_ASIGNADAS.filter(c => c.COMPLETADA).length;
                  const totales = colaborador.CAPACITACIONES_ASIGNADAS.length;

                  return (
                    <Card key={colaborador.ID_COLABORADOR} className="group overflow-hidden border-slate-200 dark:border-slate-800 hover:border-blue-300 dark:hover:border-blue-900 transition-all duration-300 shadow-none hover:shadow-lg hover:shadow-indigo-500/5 p-0">
                      <div className="flex flex-col lg:flex-row">
                        
                        {/* Perfil */}
                        <div className="lg:w-1/3 p-6 lg:border-r border-slate-100 dark:border-slate-800 bg-slate-50/30 dark:bg-transparent">
                          <div className="flex items-start gap-4">
                            <Avatar className="h-14 w-14 ring-4 ring-white dark:ring-slate-900 shadow-md">
                              <AvatarFallback className="bg-slate-900 text-white font-medium">
                                {colaborador.INICIALES}
                              </AvatarFallback>
                            </Avatar>
                            <div className="space-y-1">
                              <h3 className="font-bold text-slate-900 dark:text-white leading-tight">
                                {colaborador.NOMBRE_COMPLETO}
                              </h3>
                              <p className="text-xs text-blue-800 dark:text-blue-800 font-semibold uppercase tracking-wider">{colaborador.PUESTO}</p>
                              <p className="text-xs text-slate-400 flex items-center gap-1">
                                <Building2 className="w-3 h-3" /> {colaborador.DEPARTAMENTO}
                              </p>
                            </div>
                          </div>

                          <div className="mt-8 space-y-3">
                            <div className="flex justify-between items-end">
                              <span className="text-[10px] font-bold uppercase text-slate-400">Avance General</span>
                              <span className="text-sm font-bold text-slate-900 dark:text-slate-400">{progreso}%</span>
                            </div>
                            <Progress value={progreso} className="h-1.5 bg-slate-100" />
                            <p className="text-[11px] text-slate-500 italic">
                              {completadas} de {totales} capacitaciones finalizadas
                            </p>
                          </div>
                        </div>

                        {/* Lado Derecho: Lista de Capacitaciones */}
                        <div className="flex-1 p-6">
                          <div className="flex items-center justify-between mb-4">
                            <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">
                              Capacitaciones Asignadas
                              <span className="ml-2 px-2 py-0.5 bg-indigo-100 dark:bg-transparent dark:border dark:border-blue-600 text-blue-800 dark:text-slate-300 rounded-full text-xs font-bold">
                                {colaborador.CAPACITACIONES_ASIGNADAS.length}
                              </span>
                            </h4>
                          </div>
                          
                          <div className="grid gap-2">
                            {colaborador.CAPACITACIONES_ASIGNADAS.map((cap, idx) => (
                              <div
                                key={idx}
                                className="group/item flex items-center justify-between rounded-xl border border-transparent"
                              >
                                <div className="flex items-center gap-3 min-w-0">
                                  {cap.COMPLETADA ? (
                                    <div className="flex-shrink-0 w-5 h-5 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
                                      <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                                    </div>
                                  ) : (
                                    <div className="flex-shrink-0 w-5 h-5 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                                      <Clock className="w-3 h-3 text-slate-400" />
                                    </div>
                                  )}
                                  <span className={`text-sm font-medium truncate sm:whitespace-normal ${
                                    cap.COMPLETADA ? 'text-slate-500' : 'text-slate-700 dark:text-slate-300'
                                  }`}>
                                    {cap.NOMBRE}
                                  </span>
                                </div>
                                
                                <div className="ml-4">
                                  {cap.COMPLETADA ? (
                                    <Badge className="bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30">Completada</Badge>
                                  ) : (
                                    <Badge className="bg-orange-50 text-red-700 dark:bg-red-900/20 dark:text-red-400 border border-red-200 dark:border-red-950">Pendiente</Badge>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>

                      </div>
                    </Card>
                  );
                })}
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Modals */}
      <TrainingModal
        open={showTrainingModal}
        onOpenChange={setShowTrainingModal}
        programa={programa}
        departamentos={departamentos}
        puestos={puestos}
        onSave={handleSaveTraining}
        editMode={editMode}
        initialData={selectedTraining}
      />

      <TrainingDetailModal
        open={showDetailModal}
        onOpenChange={setShowDetailModal}
        training={selectedTraining}
        departamentos={departamentos}
        puestos={puestos}
      />
    </div>
  )
}
