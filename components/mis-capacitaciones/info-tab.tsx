"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Calendar, Clock, Users, CheckCircle2, XCircle } from "lucide-react"
import type { SESION_DETALLE } from "@/lib/mis-capacitaciones/capacitaciones-types"

interface InfoTabProps {
  sesion: SESION_DETALLE
}

export function InfoTab({ sesion }: InfoTabProps) {
  return (
  <Card className="shadow-sm">
    <CardHeader className="py-2 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/20 dark:to-purple-950/20">
      <CardTitle className="text-xl">Detalles de la Capacitación</CardTitle>
      <CardDescription>Información completa sobre esta capacitación</CardDescription>
    </CardHeader>
    <CardContent className="space-y-6 pt-2">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="space-y-1">
          <Label className="text-xs text-muted-foreground uppercase tracking-wide">Nombre</Label>
          <p className="font-semibold text-lg">{sesion.CAPACITACION_NOMBRE}</p>
        </div>
        <div className="space-y-1">
          <Label className="text-xs text-muted-foreground uppercase tracking-wide">Tipo</Label>
          <Badge variant="secondary" className="text-sm">
            {sesion.TIPO_CAPACITACION}
          </Badge>
        </div>
        <div className="space-y-1">
          <Label className="text-xs text-muted-foreground uppercase tracking-wide">Modalidad</Label>
          <p className="font-semibold">{sesion.MODALIDAD}</p>
        </div>
        <div className="space-y-1">
          <Label className="text-xs text-muted-foreground uppercase tracking-wide">Fecha Programada</Label>
          <p className="font-semibold flex items-center gap-2">
            <Calendar className="h-4 w-4 text-blue-600" />
            {sesion.FECHA_INICIO
              ? new Date(sesion.FECHA_INICIO).toLocaleDateString("es-GT", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })
              : "Sin fecha"}
          </p>
        </div>
        <div className="space-y-1">
          <Label className="text-xs text-muted-foreground uppercase tracking-wide">Horario</Label>
          <p className="font-semibold flex items-center gap-2">
            <Clock className="h-4 w-4 text-purple-600" />
            {sesion.HORARIO_FORMATO_12H}
          </p>
        </div>
        <div className="space-y-1">
          <Label className="text-xs text-muted-foreground uppercase tracking-wide">Duración</Label>
          <p className="font-semibold">{sesion.DURACION_FORMATO}</p>
        </div>
        <div className="space-y-1">
          <Label className="text-xs text-muted-foreground uppercase tracking-wide">Grupo Objetivo</Label>
          <p className="font-semibold">{sesion.GRUPO_OBJETIVO}</p>
        </div>
        <div className="space-y-1">
          <Label className="text-xs text-muted-foreground uppercase tracking-wide">Total Participantes</Label>
          <p className="font-semibold flex items-center gap-2">
            <Users className="h-4 w-4 text-green-600" />
            {sesion.TOTAL_COLABORADORES}
          </p>
        </div>
      </div>

      <div className="space-y-2 pt-4 border-t">
        <Label className="text-xs text-muted-foreground uppercase tracking-wide">Objetivo</Label>
        <p className="font-medium leading-relaxed">{sesion.OBJETIVO}</p>
      </div>

      <div className="space-y-2">
        <Label className="text-xs text-muted-foreground uppercase tracking-wide">
          Temas
        </Label>

        <div className="flex flex-wrap gap-2">
          {(sesion.TEMAS ?? "").split(",").map((tema, idx) => (
            <Badge
              key={idx}
              variant="secondary"
              className="text-sm px-3 py-1 whitespace-normal"
            >
              {tema.trim()}
            </Badge>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-6 border-t">
        <Card
          className={
            sesion.APLICA_EXAMEN
              ? "border-green-200 bg-green-50 dark:bg-green-950/20"
              : "border-gray-200 bg-gray-50 dark:bg-gray-950/20"
          }
        >
          <CardContent className="p-4 flex items-center gap-3">
            {sesion.APLICA_EXAMEN ? (
              <CheckCircle2 className="h-6 w-6 text-green-600 shrink-0" />
            ) : (
              <XCircle className="h-6 w-6 text-gray-400 shrink-0" />
            )}
            <div>
              <p className="font-semibold">Aplica Examen</p>
              {sesion.APLICA_EXAMEN && sesion.NOTA_MINIMA && (
                <p className="text-sm text-muted-foreground">Nota mínima: {sesion.NOTA_MINIMA}</p>
              )}
            </div>
          </CardContent>
        </Card>
        <Card
          className={
            sesion.APLICA_DIPLOMA
              ? "border-green-200 bg-green-50 dark:bg-green-950/20"
              : "border-gray-200 bg-gray-50 dark:bg-gray-950/20"
          }
        >
          <CardContent className="p-4 flex items-center gap-3">
            {sesion.APLICA_DIPLOMA ? (
              <CheckCircle2 className="h-6 w-6 text-green-600 shrink-0" />
            ) : (
              <XCircle className="h-6 w-6 text-gray-400 shrink-0" />
            )}
            <p className="font-semibold">Aplica Diploma</p>
          </CardContent>
        </Card>
        <Card
          className={
            sesion.ES_SISTEMA_DOCUMENTAL
              ? "border-green-200 bg-green-50 dark:bg-green-950/20"
              : "border-gray-200 bg-gray-50 dark:bg-gray-950/20"
          }
        >
          <CardContent className="p-4 flex items-center gap-3">
            {sesion.ES_SISTEMA_DOCUMENTAL ? (
              <CheckCircle2 className="h-6 w-6 text-green-600 shrink-0" />
            ) : (
              <XCircle className="h-6 w-6 text-gray-400 shrink-0" />
            )}
            <p className="font-semibold">Sistema Documental</p>
          </CardContent>
        </Card>
      </div>

      {sesion.OBSERVACIONES && (
        <div className="space-y-2 pt-4 border-t">
          <Label className="text-xs text-muted-foreground uppercase tracking-wide">Observaciones</Label>
          <p className="font-medium leading-relaxed bg-muted p-4 rounded-lg">{sesion.OBSERVACIONES}</p>
        </div>
      )}
    </CardContent>
  </Card>
  )
}
