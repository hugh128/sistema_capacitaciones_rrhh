import { memo, useMemo, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Calendar, Clock, Save, TrendingUp, TrendingDown, Loader2 } from "lucide-react"
import type { Capacitador } from "@/lib/capacitaciones/capacitaciones-types"
import { SESION_DETALLE } from "@/lib/mis-capacitaciones/capacitaciones-types"

interface ResumenEdicionSesionProps {
  sesion: SESION_DETALLE
  capacitadorId: string
  capacitadores: Capacitador[]
  fechaProgramada: string
  horaInicio: string
  horaFin: string
  selectedColaboradores: number[]
  colaboradoresOriginales: number[]
  aplicaExamen: boolean
  notaMinima: string
  aplicaDiploma: boolean
  onGuardar: () => Promise<void>
  isLoading?: boolean
}

export const ResumenEdicionSesion = memo(function ResumenEdicionSesion({
  sesion,
  capacitadorId,
  capacitadores,
  fechaProgramada,
  horaInicio,
  horaFin,
  selectedColaboradores,
  colaboradoresOriginales,
  aplicaExamen,
  notaMinima,
  aplicaDiploma,
  onGuardar,
  isLoading = false,
}: ResumenEdicionSesionProps) {
  const [isSaving, setIsSaving] = useState(false)
  
  const capacitadorSeleccionado = capacitadores.find((c) => c.PERSONA_ID === +capacitadorId)

  const handleGuardar = async () => {
    setIsSaving(true)
    try {
      await onGuardar()
    } finally {
      setIsSaving(false)
    }
  }

  const cambiosColaboradores = useMemo(() => {
    const originalesSet = new Set(colaboradoresOriginales)
    const seleccionadosSet = new Set(selectedColaboradores)
    
    const agregados = selectedColaboradores.filter(id => !originalesSet.has(id))
    const quitados = colaboradoresOriginales.filter(id => !seleccionadosSet.has(id))
    
    return {
      agregados: agregados.length,
      quitados: quitados.length,
      huboChangios: agregados.length > 0 || quitados.length > 0
    }
  }, [selectedColaboradores, colaboradoresOriginales])

  const hayCambios = useMemo(() => {
    const capacitadorCambio = capacitadorId !== sesion.CAPACITADOR_ID?.toString()
    
    let fechaCambio = false
    if (sesion.FECHA_PROGRAMADA) {
      const fechaOriginal = new Date(sesion.FECHA_PROGRAMADA).toISOString().split('T')[0]
      fechaCambio = fechaProgramada !== fechaOriginal
    } else {
      fechaCambio = fechaProgramada !== ""
    }
    
    let horaInicioCambio = false
    let horaFinCambio = false
    
    if (sesion.HORA_INICIO) {
      const horaInicioOriginal = new Date(sesion.HORA_INICIO)
      const hours = horaInicioOriginal.getHours()
      const minutes = horaInicioOriginal.getMinutes()
      const horaOriginalStr = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`
      horaInicioCambio = horaInicio !== horaOriginalStr
    }
    
    if (sesion.HORA_FIN) {
      const horaFinOriginal = new Date(sesion.HORA_FIN)
      const hours = horaFinOriginal.getHours()
      const minutes = horaFinOriginal.getMinutes()
      const horaOriginalStr = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`
      horaFinCambio = horaFin !== horaOriginalStr
    }

    return capacitadorCambio || fechaCambio || horaInicioCambio || horaFinCambio || cambiosColaboradores.huboChangios
  }, [capacitadorId, fechaProgramada, horaInicio, horaFin, sesion, cambiosColaboradores])

  return (
    <Card>
      <CardHeader>
        <CardTitle>Resumen de Cambios</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label className="text-muted-foreground">Capacitación</Label>
          <p className="font-medium">{sesion.CAPACITACION_NOMBRE}</p>
          <p className="text-sm text-muted-foreground">{sesion.NOMBRE_SESION}</p>
        </div>

        {capacitadorSeleccionado && (
          <div>
            <Label className="text-muted-foreground">Capacitador</Label>
            <p className="font-medium">
              {capacitadorSeleccionado.NOMBRE} {capacitadorSeleccionado.APELLIDO}
            </p>
            {capacitadorId !== sesion.CAPACITADOR_ID?.toString() && (
              <Badge variant="outline" className="mt-1 bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950 dark:text-amber-300">
                Modificado
              </Badge>
            )}
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
          
          {cambiosColaboradores.huboChangios && (
            <div className="mt-2 space-y-1">
              {cambiosColaboradores.agregados > 0 && (
                <div className="flex items-center gap-2 text-sm">
                  <TrendingUp className="h-4 w-4 text-green-600 dark:text-green-400" />
                  <span className="text-green-600 dark:text-green-400">
                    +{cambiosColaboradores.agregados} nuevo{cambiosColaboradores.agregados !== 1 ? 's' : ''}
                  </span>
                </div>
              )}
              {cambiosColaboradores.quitados > 0 && (
                <div className="flex items-center gap-2 text-sm">
                  <TrendingDown className="h-4 w-4 text-red-600 dark:text-red-400" />
                  <span className="text-red-600 dark:text-red-400">
                    -{cambiosColaboradores.quitados} removido{cambiosColaboradores.quitados !== 1 ? 's' : ''}
                  </span>
                </div>
              )}
            </div>
          )}
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

        {hayCambios && (
          <Badge variant="outline" className="w-full justify-center py-2 bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950 dark:text-blue-300">
            Hay cambios pendientes de guardar
          </Badge>
        )}

        <Button 
          onClick={handleGuardar} 
          className="w-full cursor-pointer"
          size="lg"
          disabled={!hayCambios || isSaving || isLoading}
        >
          {isSaving ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Guardando...
            </>
          ) : (
            <>
              <Save className="h-4 w-4 mr-2" />
              Guardar Cambios
            </>
          )}
        </Button>

        {!hayCambios && !isSaving && (
          <p className="text-xs text-center text-muted-foreground">
            No hay cambios para guardar
          </p>
        )}
      </CardContent>
    </Card>
  )
})
