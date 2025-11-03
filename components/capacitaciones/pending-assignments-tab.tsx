"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Calendar, Users } from "lucide-react"
import Link from "next/link"
import { CheckCircle2, UserPlus } from "lucide-react"
import { type Capacitacion, getEstadoCapacitacionColor } from "@/lib/capacitaciones/capacitaciones-types"

interface PendingAssignmentsTabProps {
  capacitaciones: Capacitacion[]
}

export function PendingAssignmentsTab({ capacitaciones }: PendingAssignmentsTabProps) {
  if (capacitaciones.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Capacitaciones Pendientes de Asignación</CardTitle>
          <CardDescription>
            Estas capacitaciones necesitan que se les asigne un capacitador y participantes
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12 text-muted-foreground">
            <CheckCircle2 className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p>No hay capacitaciones pendientes de asignación</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {capacitaciones.map((cap) => (
        <Card key={cap.ID_CAPACITACION} className="hover:shadow-md transition-shadow">
          <CardContent className="pt-6">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 space-y-3">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="font-semibold text-lg text-foreground">{cap.NOMBRE}</h3>
                  <Badge className={getEstadoCapacitacionColor(cap.ESTADO)}>{cap.ESTADO}</Badge>
                  <Badge variant="outline">{cap.TIPO_CAPACITACION}</Badge>
                </div>

                <p className="text-sm text-muted-foreground line-clamp-2">{cap.OBJETIVO}</p>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    <span>
                      {cap.FECHA_PROGRAMADA ? new Date(cap.FECHA_PROGRAMADA).toLocaleDateString("es-GT") : "Sin fecha"}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Users className="h-4 w-4" />
                    <span>{cap.PENDIENTES_ASIGNAR_SESION} participantes</span>
                  </div>
                  <div className="col-span-2 sm:col-span-2 text-muted-foreground">
                    <span className="text-xs">Origen: {cap.NOMBRE_ORIGEN}</span>
                  </div>
                </div>
              </div>

              <Link href={`/capacitaciones/asignar/${cap.ID_CAPACITACION}`}>
                <Button className="whitespace-nowrap">
                  <UserPlus className="h-4 w-4 mr-2" />
                  Asignar
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
