"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { BookOpen, Clock, CheckCircle2, AlertCircle, Users, TrendingUp } from "lucide-react"

interface MetricsCardsProps {
  total: number
  pendientesAsignacion: number
  enProceso: number
  pendientesRevision: number
  finalizadasEsteMes: number
  totalParticipantes: number
  asistenciaPromedio: number
  aprobacionPromedio: number
  loading?: boolean
}

export function MetricsCards({
  total,
  pendientesAsignacion,
  enProceso,
  pendientesRevision,
  finalizadasEsteMes,
  totalParticipantes,
  asistenciaPromedio,
  aprobacionPromedio,
  loading = false,
}: MetricsCardsProps) {
  const metrics = [
    {
      title: "Total",
      value: total,
      description: "Capacitaciones en el sistema",
      icon: BookOpen,
      color: "text-blue-600 dark:text-blue-400",
      bgColor: "bg-blue-50 dark:bg-blue-900/20",
      borderColorClass: "border-l-blue-500",
    },
    {
      title: "Pendientes de Asignar",
      value: pendientesAsignacion,
      description: "Requieren asignación",
      icon: AlertCircle,
      color: "text-yellow-600 dark:text-yellow-400",
      bgColor: "bg-yellow-50 dark:bg-yellow-900/20",
      borderColorClass: "border-l-yellow-500",
    },
    {
      title: "En Proceso",
      value: enProceso,
      description: "Actualmente activas",
      icon: Clock,
      color: "text-purple-600 dark:text-purple-400",
      bgColor: "bg-purple-50 dark:bg-purple-900/20",
      borderColorClass: "border-l-purple-500",
    },
    {
      title: "Pendientes de Revisión",
      value: pendientesRevision,
      description: "Esperando aprobación",
      icon: AlertCircle,
      color: "text-orange-600 dark:text-orange-400",
      bgColor: "bg-orange-50 dark:bg-purple-900/20",
      borderColorClass: "border-l-orange-500",
    },
    {
      title: "Finalizadas Este Mes",
      value: finalizadasEsteMes,
      description: "Completadas",
      icon: CheckCircle2,
      color: "text-green-600 dark:text-green-400",
      bgColor: "bg-green-50 dark:bg-green-900/20",
      borderColorClass: "border-l-green-500",
    },
    {
      title: "Total Participantes",
      value: totalParticipantes,
      description: "En todas las capacitaciones",
      icon: Users,
      color: "text-indigo-600 dark:text-indigo-300",
      bgColor: "bg-indigo-50 dark:bg-green-900/20",
      borderColorClass: "border-l-indigo-600",
    },
    {
      title: "% Asistencia",
      value: `${asistenciaPromedio}%`,
      description: "Promedio general",
      icon: TrendingUp,
      color: "text-green-600 dark:text-green-400",
      bgColor: "bg-green-50 dark:bg-green-900/20",
      borderColorClass: "border-l-green-500",
    },
    {
      title: "% Aprobación",
      value: `${aprobacionPromedio}%`,
      description: "Promedio general",
      icon: CheckCircle2,
      color: "text-green-600 dark:text-green-400",
      bgColor: "bg-green-50 dark:bg-green-900/20",
      borderColorClass: "border-l-green-600",
    },
  ];

  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 8 }).map((_, idx) => (
          <Card key={idx} className="border-l-4">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-10 w-10 rounded-lg" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-16 mb-2" />
              <Skeleton className="h-3 w-full" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {metrics.map((metric, idx) => {
        const Icon = metric.icon
        return (
          <Card
            key={idx}
            className={`border-l-4 ${metric.borderColorClass} hover:shadow-md transition-shadow`}
          >
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{metric.title}</CardTitle>
              <div className={`${metric.bgColor} p-2 rounded-lg`}>
                <Icon className={`h-4 w-4 ${metric.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metric.value}</div>
              <p className="text-xs text-muted-foreground mt-1">{metric.description}</p>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
