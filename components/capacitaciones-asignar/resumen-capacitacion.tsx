import { memo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Calendar, Clock, UserPlus } from "lucide-react"
import type { Capacitador, Capacitacion } from "@/lib/capacitaciones/capacitaciones-types"

interface ResumenCapacitacionProps {
  capacitacion: Capacitacion
  capacitadorId: string
  capacitadores: Capacitador[]
  fechaInicio: string
  horaInicio: string
  horaFin: string
  selectedColaboradores: number[]
  aplicaExamen: boolean
  notaMinima: string
  aplicaDiploma: boolean
  onAsignar: () => void
}

export const ResumenCapacitacion = memo(function ResumenCapacitacion({
  capacitacion,
  capacitadorId,
  capacitadores,
  fechaInicio,
  horaInicio,
  horaFin,
  selectedColaboradores,
  aplicaExamen,
  notaMinima,
  aplicaDiploma,
  onAsignar,
}: ResumenCapacitacionProps) {
  const capacitadorSeleccionado = capacitadores.find((c) => c.PERSONA_ID === +capacitadorId)

  return (
    <Card>
      <CardHeader>
        <CardTitle>Resumen</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label className="text-muted-foreground">Capacitación</Label>
          <p className="font-medium">{capacitacion.NOMBRE}</p>
        </div>

        {capacitadorSeleccionado && (
          <div>
            <Label className="text-muted-foreground">Capacitador</Label>
            <p className="font-medium">
              {capacitadorSeleccionado.NOMBRE} {capacitadorSeleccionado.APELLIDO}
            </p>
          </div>
        )}

        {fechaInicio && (
          <div>
            <Label className="text-muted-foreground">Fecha</Label>
            <p className="font-medium flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              {new Date(fechaInicio + 'T00:00:00').toLocaleDateString("es-GT")}
            </p>
          </div>
        )}

        {horaInicio && horaFin && (
          <div>
            <Label className="text-muted-foreground">Horario</Label>
            <p className="font-medium flex items-center gap-2">
              <Clock className="h-4 w-4" />
              {horaInicio} - {horaFin}
            </p>
          </div>
        )}

        <div>
          <Label className="text-muted-foreground">Participantes</Label>
          <p className="font-medium">{selectedColaboradores.length} seleccionados</p>
        </div>

        {aplicaExamen && (
          <div>
            <Label className="text-muted-foreground">Examen</Label>
            <p className="font-medium">Sí (Nota mínima: {notaMinima || "N/A"})</p>
          </div>
        )}

        {aplicaDiploma && (
          <div>
            <Label className="text-muted-foreground">Diploma</Label>
            <p className="font-medium">Sí</p>
          </div>
        )}

        <Button onClick={onAsignar} className="w-full" size="lg">
          <UserPlus className="h-4 w-4 mr-2" />
          Asignar Capacitación
        </Button>
      </CardContent>
    </Card>
  )
})
