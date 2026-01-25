"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { BookOpen, Clock, CheckCircle2, AlertCircle, TrendingUp } from "lucide-react"

interface CapacitadorMetricsCardsProps {
  total: number
  pendientes: number
  enProceso: number
  finalizadasEsteMes: number
  loading?: boolean
}

export function CapacitadorMetricsCards({
  total,
  pendientes,
  enProceso,
  finalizadasEsteMes,
  loading = false,
}: CapacitadorMetricsCardsProps) {
  const metrics = [
    {
      title: "Total Asignadas",
      value: total,
      description: "Capacitaciones totales",
      icon: BookOpen,
      color: "text-blue-600 dark:text-blue-400",
      bgColor: "bg-blue-100 dark:bg-blue-900/20",
      borderColor: "border-l-blue-500",
    },
    {
      title: "Pendientes",
      value: pendientes,
      description: "Por iniciar",
      icon: AlertCircle,
      color: "text-yellow-600 dark:text-yellow-400",
      bgColor: "bg-yellow-100 dark:bg-yellow-900/20",
      borderColor: "border-l-yellow-500",
    },
    {
      title: "En Proceso",
      value: enProceso,
      description: "Activas ahora",
      icon: Clock,
      color: "text-purple-600 dark:text-purple-400",
      bgColor: "bg-purple-100 dark:bg-purple-900/20",
      borderColor: "border-l-purple-500",
    },
    {
      title: "Este Mes",
      value: finalizadasEsteMes,
      description: "Completadas",
      icon: CheckCircle2,
      color: "text-green-600 dark:text-green-400",
      bgColor: "bg-green-100 dark:bg-green-900/20",
      borderColor: "border-l-green-500",
    },
  ]

  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, idx) => (
          <Card key={idx} className="border-l-4">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-10 w-10 rounded-full" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-16 mb-2" />
              <Skeleton className="h-3 w-full" />
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {metrics.map((metric, idx) => {
        const Icon = metric.icon
        return (
          <Card
            key={idx}
            className={`border-l-4 ${metric.borderColor} hover:shadow-md transition-shadow`}
          >
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {metric.title}
              </CardTitle>
              <div className={`h-10 w-10 rounded-full ${metric.bgColor} flex items-center justify-center`}>
                <Icon className={`h-5 w-5 ${metric.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-foreground">{metric.value}</div>
              <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                {idx === 0 && <TrendingUp className="h-3 w-3" />}
                {metric.description}
              </p>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
