"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Calendar, Users, Eye } from "lucide-react"
import Link from "next/link"
import { CheckCircle2 } from "lucide-react"
import { ApiCapacitacionSesion, getEstadoCapacitacionColor } from "@/lib/capacitaciones/capacitaciones-types"

interface PendingReviewsTabProps {
  capacitaciones: ApiCapacitacionSesion[]
}

export function PendingReviewsTab({ capacitaciones }: PendingReviewsTabProps) {
  if (capacitaciones.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Capacitaciones Pendientes de Revisión</CardTitle>
          <CardDescription>Capacitaciones finalizadas por el capacitador que requieren tu aprobación</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12 text-muted-foreground">
            <CheckCircle2 className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p>No hay capacitaciones pendientes de revisión</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Capacitaciones Pendientes de Revisión</CardTitle>
        <CardDescription>Capacitaciones finalizadas por el capacitador que requieren tu aprobación</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-4">
          {capacitaciones.map((cap) => (
            <Card key={cap.ID_CAPACITACION} className="hover:shadow-md transition-shadow border-l-4 border-l-orange-500">
              <CardContent className="pt-6">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 space-y-3">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-semibold text-lg text-foreground">{cap.CAPACITACION_NOMBRE}</h3>
                      <Badge className={getEstadoCapacitacionColor(cap.ESTADO)}>{cap.ESTADO}</Badge>
                    </div>

                    {cap.CODIGO_DOCUMENTO && (
                      <p className="text-sm text-muted-foreground">
                        <span className="font-medium">Código:</span> {cap.CODIGO_DOCUMENTO}
                      </p>
                    )}

                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-sm">
                      <div className="text-muted-foreground">
                        <span className="font-medium text-foreground">Capacitador:</span> {cap.CAPACITADOR_NOMBRE}
                      </div>
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Calendar className="h-4 w-4" />
                        <span>
                          {cap.FECHA_INICIO ? new Date(cap.FECHA_INICIO).toLocaleDateString("es-GT") : "Sin fecha"}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Users className="h-4 w-4" />
                        <span>{cap.TOTAL_COLABORADORES} participantes</span>
                      </div>
                    </div>
                  </div>

                  <Link href={`/capacitaciones/revisar/${cap.ID_SESION}`}>
                    <Button className="whitespace-nowrap">
                      <Eye className="h-4 w-4 mr-2" />
                      Revisar
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
