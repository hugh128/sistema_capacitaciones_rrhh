import { memo, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Calendar, Clock, UserPlus, Loader2 } from "lucide-react"
import type { Capacitador, Capacitacion } from "@/lib/capacitaciones/capacitaciones-types"

interface ResumenCapacitacionProps {
  capacitacion: Capacitacion
  capacitadorId: string
  capacitadores: Capacitador[]
  fechaProgramada: string
  horaInicio: string
  horaFin: string
  selectedColaboradores: number[]
  aplicaExamen: boolean
  notaMinima: string
  aplicaDiploma: boolean
  onAsignar: () => Promise<void>
  isLoading?: boolean
  categoria: string
  tipoCapacitacion: string
  modalidad: string
  grupoObjetivo: string
  objetivo: string
}

export const ResumenCapacitacion = memo(function ResumenCapacitacion({
  capacitacion,
  capacitadorId,
  capacitadores,
  fechaProgramada,
  horaInicio,
  horaFin,
  selectedColaboradores,
  aplicaExamen,
  notaMinima,
  aplicaDiploma,
  onAsignar,
  isLoading = false,
  categoria,
  tipoCapacitacion,
  modalidad,
  grupoObjetivo,
  objetivo
}: ResumenCapacitacionProps) {
  const [isAssigning, setIsAssigning] = useState(false)
  
  const capacitadorSeleccionado = capacitadores.find((c) => c.PERSONA_ID === +capacitadorId)

  const handleAsignar = async () => {
    setIsAssigning(true)
    try {
      await onAsignar()
    } finally {
      setIsAssigning(false)
    }
  }

  const puedeAsignar =
    capacitadorId &&
    fechaProgramada &&
    horaInicio &&
    horaFin &&
    categoria &&
    tipoCapacitacion &&
    modalidad &&
    (grupoObjetivo.length >= 4) &&
    (objetivo.length >= 4) &&
    selectedColaboradores.length > 0

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

        {fechaProgramada && (
          <div>
            <Label className="text-muted-foreground">Fecha</Label>
            <p className="font-medium flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              {new Date(fechaProgramada + 'T00:00:00').toLocaleDateString("es-GT")}
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

        <Button 
          onClick={handleAsignar} 
          className="w-full cursor-pointer" 
          size="lg"
          disabled={!puedeAsignar || isAssigning || isLoading}
        >
          {isAssigning ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Asignando...
            </>
          ) : (
            <>
              <UserPlus className="h-4 w-4 mr-2" />
              Asignar Capacitación
            </>
          )}
        </Button>

        {!puedeAsignar && !isAssigning && (
          <p className="text-xs text-center text-muted-foreground">
            Completa todos los campos requeridos para asignar
          </p>
        )}
      </CardContent>
    </Card>
  )
})