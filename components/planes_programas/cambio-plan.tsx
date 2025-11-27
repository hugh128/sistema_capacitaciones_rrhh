import { useState, useEffect } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { Loader2, AlertTriangle, CheckCircle2, Info } from "lucide-react"
import type { AnalizarCambioPlanResponse, CambiarPlanResponse, CapacitacionMigrar } from "@/lib/planes_programas/types"

interface CambioPlanModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onCancel?: () => void
  onGuardarSinCambio?: () => void
  verificacionData: CambiarPlanResponse | null
  onConfirm: (capacitacionesSeleccionadas: number[]) => Promise<boolean>
  onAnalizar: () => Promise<AnalizarCambioPlanResponse | null>
  loading?: boolean
}

export function CambioPlanModal({
  open,
  onOpenChange,
  onCancel,
  onGuardarSinCambio,
  verificacionData,
  onConfirm,
  onAnalizar,
}: CambioPlanModalProps) {
  const [step, setStep] = useState<'verificacion' | 'analisis' | 'confirmacion'>('verificacion')
  const [analisisData, setAnalisisData] = useState<AnalizarCambioPlanResponse | null>(null)
  const [capacitacionesSeleccionadas, setCapacitacionesSeleccionadas] = useState<number[]>([])
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [isConfirming, setIsConfirming] = useState(false)

  useEffect(() => {
    if (open) {
      setStep('verificacion')
      setAnalisisData(null)
      setCapacitacionesSeleccionadas([])
    }
  }, [open])

  const handleAnalizar = async () => {
    setIsAnalyzing(true)
    try {
      const resultado = await onAnalizar()
      if (resultado) {
        setAnalisisData(resultado)
        
        const migrables = resultado.CAPACITACIONES_MIGRAR
          .filter((cap: CapacitacionMigrar) => cap.ESTADO_MIGRACION === 'MIGRABLE')
          .map((cap: CapacitacionMigrar) => cap.ID_CAPACITACION)
        
        setCapacitacionesSeleccionadas(migrables)
        setStep('analisis')
      }
    } finally {
      setIsAnalyzing(false)
    }
  }

  const handleConfirmar = async () => {
    setIsConfirming(true)
    try {
      const success = await onConfirm(capacitacionesSeleccionadas)
      if (success) {
        onOpenChange(false)
      }
    } finally {
      setIsConfirming(false)
    }
  }

  const handleCancelar = () => {
    if (onCancel) {
      onCancel()
    } else {
      onOpenChange(false)
    }
  }

  const handleGuardarSinCambio = () => {
    if (onGuardarSinCambio) {
      onGuardarSinCambio()
    }
  }

  const toggleCapacitacion = (idCapacitacion: number) => {
    setCapacitacionesSeleccionadas(prev =>
      prev.includes(idCapacitacion)
        ? prev.filter(id => id !== idCapacitacion)
        : [...prev, idCapacitacion]
    )
  }

  const selectAll = () => {
    if (!analisisData) return
    const migrables = analisisData.CAPACITACIONES_MIGRAR
      .filter((cap: CapacitacionMigrar) => cap.ESTADO_MIGRACION === 'MIGRABLE')
      .map((cap: CapacitacionMigrar) => cap.ID_CAPACITACION)
    setCapacitacionesSeleccionadas(migrables)
  }

  const deselectAll = () => {
    setCapacitacionesSeleccionadas([])
  }

  if (!verificacionData) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent 
        className="sm:max-w-[620px] max-h-[90vh] overflow-y-auto"
        onInteractOutside={(e) => {
          if (isAnalyzing || isConfirming) {
            e.preventDefault()
          }
        }}
        onEscapeKeyDown={(e) => {
          if (isAnalyzing || isConfirming) {
            e.preventDefault()
          }
        }}
      >
        <DialogHeader>
          <DialogTitle className="text-lg sm:text-xl">Cambio de Plan de Capacitación Detectado</DialogTitle>
          <DialogDescription className="text-sm">
            El cambio de departamento o puesto puede requerir actualizar el plan de capacitación
          </DialogDescription>
        </DialogHeader>

        {step === 'verificacion' && (
          <div className="space-y-4 px-1">
            <Alert>
              <Info className="h-4 w-4 flex-shrink-0" />
              <AlertDescription className="ml-2 text-sm">
                {verificacionData.MENSAJE}
              </AlertDescription>
            </Alert>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 bg-muted rounded-lg">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Plan Actual</p>
                <p className="text-base sm:text-lg font-semibold break-words">
                  {verificacionData.PLAN_ACTUAL_NOMBRE || 'Sin plan'}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Plan Nuevo</p>
                <p className="text-base sm:text-lg font-semibold text-primary dark:text-blue-500 break-words">
                  {verificacionData.PLAN_NUEVO_NOMBRE || 'Sin plan disponible'}
                </p>
              </div>
            </div>

            {!verificacionData.REQUIERE_CAMBIO_PLAN ? (
              <Alert>
                <CheckCircle2 className="h-4 w-4 text-green-500 flex-shrink-0" />
                <AlertDescription className="ml-2 text-sm">
                  El colaborador puede mantener su plan actual. No se requiere acción adicional.
                </AlertDescription>
              </Alert>
            ) : !verificacionData.PLAN_NUEVO_ID ? (
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4 flex-shrink-0" />
                <AlertDescription className="ml-2 text-sm">
                  No existe un plan activo para el nuevo departamento/puesto. 
                  Debe crear un plan antes de continuar con el cambio de plan.
                </AlertDescription>
              </Alert>
            ) : (
              <Alert className="bg-blue-50 border-blue-200 dark:bg-blue-950/20 dark:border-blue-900">
                <Info className="h-4 w-4 text-blue-600 flex-shrink-0" />
                <AlertDescription className="ml-2 text-sm text-blue-900 dark:text-blue-100">
                  <strong>Tienes dos opciones:</strong>
                  <ul className="list-disc list-inside mt-2 space-y-1">
                    <li>Actualizar sin cambiar el plan (mantener capacitaciones actuales)</li>
                    <li>Analizar y cambiar al nuevo plan de capacitación</li>
                  </ul>
                </AlertDescription>
              </Alert>
            )}
          </div>
        )}

        {step === 'analisis' && analisisData && (
          <div className="space-y-6">
            <div className="grid grid-cols-3 gap-4 p-4 bg-muted rounded-lg">
              <div className="text-center">
                <p className="text-2xl font-bold text-blue-600">
                  {analisisData.INFORMACION_COLABORADOR.CAPACITACIONES_COMPLETADAS_PLAN_ACTUAL}
                </p>
                <p className="text-xs text-muted-foreground">Completadas en plan actual</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-green-600">
                  {analisisData.CAPACITACIONES_MIGRAR.filter(
                    (cap: CapacitacionMigrar) => cap.ESTADO_MIGRACION === 'MIGRABLE'
                  ).length}
                </p>
                <p className="text-xs text-muted-foreground">Pueden migrar</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-orange-600">
                  {analisisData.CAPACITACIONES_NUEVAS.filter(
                    (cap) => cap.YA_COMPLETADA_PLAN_ANTERIOR === 0
                  ).length}
                </p>
                <p className="text-xs text-muted-foreground">Nuevas a tomar</p>
              </div>
            </div>

            {analisisData.CAPACITACIONES_MIGRAR.length > 0 && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold">Capacitaciones Completadas</h3>
                  <div className="space-x-2 space-y-2 max-w-48">
                    <Button variant="outline" size="sm" onClick={selectAll} className="w-full cursor-pointer dark:border-foreground/40">
                      Seleccionar todas
                    </Button>
                    <Button variant="outline" size="sm" onClick={deselectAll} className="w-full cursor-pointer dark:border-foreground/40">
                      Deseleccionar todas
                    </Button>
                  </div>
                </div>

                <div className="space-y-2 max-h-60 overflow-y-auto border rounded-lg p-3 custom-scrollbar">
                  {analisisData.CAPACITACIONES_MIGRAR.map((cap: CapacitacionMigrar) => {
                    const isMigrable = cap.ESTADO_MIGRACION === 'MIGRABLE'
                    const isSelected = capacitacionesSeleccionadas.includes(cap.ID_CAPACITACION)

                    return (
                      <div
                        key={cap.ID_CAPACITACION}
                        className={`flex items-start space-x-3 p-3 rounded-lg border dark:bg-transparent ${
                          isMigrable
                            ? 'bg-green-50 border-green-200 dark:border-green-300'
                            : 'bg-gray-50 border-gray-200'
                        }`}
                      >
                        {isMigrable && (
                          <Checkbox
                            checked={isSelected}
                            onCheckedChange={() => toggleCapacitacion(cap.ID_CAPACITACION)}
                          />
                        )}
                        <div className="flex-1 space-y-1">
                          <div className="flex items-center justify-between">
                            <p className="font-medium text-sm">{cap.CAPACITACION_NOMBRE}</p>
                            <Badge variant={isMigrable ? "default" : "secondary"}>
                              {isMigrable ? 'Migrable' : cap.ESTADO_MIGRACION}
                            </Badge>
                          </div>
                          <p className="text-xs text-muted-foreground">
                            Código: {cap.CODIGO_DOCUMENTO} | 
                            Completada: {cap.FECHA_COMPLETADA} | 
                            Nota: {cap.NOTA_OBTENIDA}
                          </p>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

            {analisisData.CAPACITACIONES_NUEVAS.length > 0 && (
              <div className="space-y-3">
                <h3 className="text-lg font-semibold">Capacitaciones del Nuevo Plan</h3>
                <div className="space-y-2 max-h-60 overflow-y-auto border rounded-lg p-3 custom-scrollbar">
                  {analisisData.CAPACITACIONES_NUEVAS.map((cap, idx) => (
                    <div
                      key={idx}
                      className={`p-3 rounded-lg border dark:bg-transparent ${
                        cap.YA_COMPLETADA_PLAN_ANTERIOR === 1
                          ? 'bg-blue-50 border-blue-200 dark:border-blue-300'
                          : 'bg-orange-50 border-orange-200 dark:border-orange-300'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <p className="font-medium text-sm">{cap.NOMBRE_DOCUMENTO}</p>
                        <Badge variant={cap.YA_COMPLETADA_PLAN_ANTERIOR === 1 ? "default" : "outline"}>
                          {cap.ESTADO === 'PUEDE_MIGRAR' ? 'Ya completada' : 'Nueva'}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        Código: {cap.DOCUMENTO_CODIGO} | Versión: {cap.VERSION}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        <DialogFooter className="flex-col sm:flex-row gap-2 sm:gap-0">
          {step === 'verificacion' && (
            <>
              <Button 
                variant="outline" 
                onClick={handleCancelar}
                disabled={isAnalyzing}
                className="cursor-pointer dark:hover:bg-accent w-full sm:w-auto"
              >
                Volver al Formulario
              </Button>
              
              {onGuardarSinCambio && verificacionData.REQUIERE_CAMBIO_PLAN && (
                <Button 
                  variant="secondary"
                  onClick={handleGuardarSinCambio}
                  disabled={isAnalyzing}
                  className="cursor-pointer w-full sm:w-auto"
                >
                  Guardar sin Cambiar Plan
                </Button>
              )}
              
              {verificacionData.REQUIERE_CAMBIO_PLAN && verificacionData.PLAN_NUEVO_ID && (
                <Button onClick={handleAnalizar} disabled={isAnalyzing} className="cursor-pointer w-full sm:w-auto">
                  {isAnalyzing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Analizar y Cambiar Plan
                </Button>
              )}
            </>
          )}

          {step === 'analisis' && (
            <>
              <Button 
                variant="outline" 
                onClick={() => setStep('verificacion')}
                disabled={isConfirming}
                className="cursor-pointer dark:hover:bg-accent dark:hover:border-white/20 w-full sm:w-auto"
              >
                Atrás
              </Button>
              <Button onClick={handleConfirmar} disabled={isConfirming} className="cursor-pointer w-full sm:w-auto">
                {isConfirming && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Confirmar Cambio ({capacitacionesSeleccionadas.length} migraciones)
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
