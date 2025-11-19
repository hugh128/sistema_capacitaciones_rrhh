"use client"

import { memo, useEffect } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertCircle, CheckCircle2, Users, BookOpen, TrendingUp } from "lucide-react"
import type { Recapacitacion } from "@/lib/codigos/types"

interface VersionChangeDialogProps {
  open: boolean
  oldVersion: number
  newVersion: number
  codigoPadre: string
  isLoading: boolean
  result: Recapacitacion | null
  onConfirm: () => void
  onCancel: () => void
  onClose: () => void
}

export const VersionChangeDialog = memo(function VersionChangeDialog({
  open,
  oldVersion,
  newVersion,
  codigoPadre,
  isLoading,
  result,
  onConfirm,
  onCancel,
  onClose,
}: VersionChangeDialogProps) {

  if (!result) {
    return (
      <Dialog open={open} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>¿Cambiar versión del documento?</DialogTitle>
            <DialogDescription>
              Está a punto de cambiar la versión de <strong>{codigoPadre}</strong>
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="flex items-center justify-center gap-4 p-4 bg-muted rounded-lg">
              <div className="text-center">
                <p className="text-sm text-muted-foreground">Versión Actual</p>
                <p className="text-2xl font-bold">{oldVersion}</p>
              </div>
              <TrendingUp className="h-6 w-6 text-muted-foreground" />
              <div className="text-center">
                <p className="text-sm text-muted-foreground">Nueva Versión</p>
                <p className="text-2xl font-bold text-primary">{newVersion}</p>
              </div>
            </div>

            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                <strong>¿Desea crear recapacitaciones automáticas?</strong>
                <br />
                <span className="text-sm text-muted-foreground">
                  Este cambio de versión puede requerir recapacitación para los colaboradores
                  que tienen este documento asignado en sus planes.
                </span>
              </AlertDescription>
            </Alert>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              onClick={onCancel}
              disabled={isLoading}
            >
              No, solo actualizar versión
            </Button>
            <Button
              onClick={onConfirm}
              disabled={isLoading}
            >
              {isLoading ? "Procesando..." : "Sí, crear recapacitaciones"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    )
  }

  const resumen = result.RESUMEN[0]
  const detalles = result.DETALLE_RECAPACITACION

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-green-600" />
            Recapacitación Procesada
          </DialogTitle>
          <DialogDescription>
            Resultados del cambio de versión del documento
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Resumen */}
          <Alert className="border-green-600 bg-green-50 dark:bg-green-950">
            <CheckCircle2 className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-900 dark:text-green-100">
              {resumen.Mensaje}
            </AlertDescription>
          </Alert>

          {/* Estadísticas */}
          <div className="grid grid-cols-3 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Documento
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-xl font-bold">{resumen.CodigoDocumento}</div>
                <p className="text-xs text-muted-foreground">
                  V{resumen.NuevaVersion}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-1">
                  <Users className="h-3 w-3" />
                  Colaboradores
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{resumen.ColaboradoresAfectados}</div>
                <p className="text-xs text-muted-foreground">Afectados</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-1">
                  <BookOpen className="h-3 w-3" />
                  Capacitaciones
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{resumen.CapacitacionesCreadas}</div>
                <p className="text-xs text-muted-foreground">Creadas</p>
              </CardContent>
            </Card>
          </div>

          {/* Detalle de colaboradores */}
          {detalles.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">
                  Detalle de Recapacitaciones ({detalles.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 max-h-[300px] overflow-y-auto">
                  {detalles.map((detalle) => (
                    <div
                      key={detalle.ID_PERSONA}
                      className="p-3 bg-muted/50 rounded-lg border"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 space-y-1">
                          <div className="flex items-center gap-2">
                            <p className="font-medium">{detalle.NombreColaborador}</p>
                            <Badge variant="outline" className="text-xs">
                              {detalle.Departamento}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {detalle.NombrePlan}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-xs text-muted-foreground">Versión</p>
                          <p className="text-sm font-medium">
                            {detalle.VERSION_ANTERIOR} → {detalle.NuevaVersion}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {detalles.length === 0 && (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                No se encontraron colaboradores que requieran recapacitación para este documento.
              </AlertDescription>
            </Alert>
          )}
        </div>

        <DialogFooter>
          <Button onClick={onClose} className="w-full sm:w-auto">
            Cerrar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
});
