"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Calendar, Clock, Users, Eye } from "lucide-react"
import Link from "next/link"
import { CapacitacionSesion, getEstadoColor } from "@/lib/mis-capacitaciones/capacitaciones-types"

interface ProximasCapacitacionesProps {
  capacitaciones: CapacitacionSesion[]
  loading?: boolean
}

function ProximaCapacitacionSkeleton() {
  return (
    <div className="flex items-center justify-between p-4 border-2 rounded-xl">
      <div className="flex-1 space-y-2">
        <div className="flex items-center gap-3 flex-wrap">
          <Skeleton className="h-7 w-64" />
          <Skeleton className="h-5 w-24" />
          <Skeleton className="h-5 w-20" />
        </div>
        <div className="flex items-center gap-6 flex-wrap">
          <Skeleton className="h-4 w-40" />
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-4 w-28" />
        </div>
      </div>
      <Skeleton className="h-10 w-32 ml-4" />
    </div>
  )
}

export function ProximasCapacitaciones({ capacitaciones, loading = false }: ProximasCapacitacionesProps) {
  if (loading) {
    return (
      <Card className="shadow-sm">
        <CardHeader className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/20 dark:to-purple-950/20">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-blue-600 flex items-center justify-center">
              <Calendar className="h-5 w-5 text-white" />
            </div>
            <div>
              <CardTitle className="text-xl">Próximas Capacitaciones</CardTitle>
              <CardDescription>Programadas para los próximos 7 días</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="space-y-3">
            {Array.from({ length: 2 }).map((_, idx) => (
              <ProximaCapacitacionSkeleton key={idx} />
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  if (capacitaciones.length === 0) {
    return null
  }

  return (
    <Card className="shadow-sm">
      <CardHeader className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/20 dark:to-purple-950/20">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-lg bg-blue-600 flex items-center justify-center">
            <Calendar className="h-5 w-5 text-white" />
          </div>
          <div>
            <CardTitle className="text-xl">Próximas Capacitaciones</CardTitle>
            <CardDescription>Programadas para los próximos 7 días</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-6">
        <div className="space-y-3">
          {capacitaciones.map((cap) => (
            <div
              key={cap.ID_SESION}
              className="flex items-center justify-between p-4 border-2 rounded-xl hover:border-primary hover:bg-accent/50 transition-all group"
            >
              <div className="flex-1 space-y-2">
                <div className="flex items-center gap-3 flex-wrap">
                  <h4 className="font-semibold text-lg group-hover:text-primary dark:group-hover:text-foreground transition-colors">
                    {cap.NOMBRE}
                  </h4>
                  <Badge className={getEstadoColor(cap.ESTADO)}>{cap.ESTADO}</Badge>
                  <Badge variant="outline" className="font-medium">
                    {cap.TIPO_CAPACITACION}
                  </Badge>
                </div>
                <div className="flex items-center gap-6 text-sm text-muted-foreground flex-wrap">
                  <span className="flex items-center gap-2 font-medium">
                    <Calendar className="h-4 w-4 text-blue-600" />
                    {new Date(cap.FECHA_PROGRAMADA!).toLocaleDateString("es-GT", {
                      weekday: "long",
                      day: "numeric",
                      month: "long",
                    })}
                  </span>
                  <span className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-purple-600" />
                    {cap.HORARIO_FORMATO_12H}
                  </span>
                  <span className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-green-600" />
                    {cap.TOTAL_COLABORADORES} participantes
                  </span>
                </div>
              </div>
              <Link href={`/mis-capacitaciones/${cap.ID_SESION}`}>
                <Button size="lg" className="ml-4 cursor-pointer">
                  <Eye className="h-4 w-4 mr-2" />
                  Ver Detalle
                </Button>
              </Link>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
