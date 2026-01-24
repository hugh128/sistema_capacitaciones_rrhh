"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Users, CheckCircle2, FileText, Award, AlertCircle, CheckCheck } from "lucide-react"
import type { SESION_DETALLE } from "./capacitaciones-types"

interface FinalizationTabProps {
  sesion: SESION_DETALLE
  stats: {
    total: number
    asistencias: number
    asistenciasRegistradas: number
    examenes: number
    diplomas: number
    pendientes: number
    notasIngresadas: number
    diplomasRequeridos: number
    listaAsistenciaSubida: boolean
  }
  canFinalize: boolean
  observacionesFinales: string
  onObservacionesChange: (value: string) => void
  onFinalizar: () => void
}

export function FinalizationTab({
  sesion,
  stats,
  canFinalize,
  observacionesFinales,
  onObservacionesChange,
  onFinalizar,
}: FinalizationTabProps) {

  const isEditable = sesion.ESTADO === 'EN_PROCESO' || sesion.ESTADO === 'RECHAZADA'

  return (
    <Card className="shadow-sm">
      <CardHeader className="py-2 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/20 dark:to-purple-950/20">
        <CardTitle className="text-xl">Finalizar Capacitación</CardTitle>
        <CardDescription>Revisa el progreso y finaliza la capacitación para enviarla a RRHH</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6 pt-6">
        <div>
          <h3 className="font-bold text-lg mb-4">Resumen de Completitud</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <Card className="border-2 border-blue-200 bg-blue-50 dark:bg-blue-950/20">
              <CardContent className="p-6 text-center">
                <Users className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                <div className="text-4xl font-bold text-blue-600 mb-1">{stats.total}</div>
                <p className="text-sm font-medium text-muted-foreground">Total Participantes</p>
              </CardContent>
            </Card>
            <Card className="border-2 border-green-200 bg-green-50 dark:bg-green-950/20">
              <CardContent className="p-6 text-center">
                <CheckCircle2 className="h-8 w-8 text-green-600 mx-auto mb-2" />
                <div className="text-4xl font-bold text-green-600 mb-1">
                  {stats.asistenciasRegistradas}
                </div>
                <p className="text-sm font-medium text-muted-foreground">Asistencias Registradas</p>
                <p className="text-xs text-muted-foreground mt-1">
                  ({stats.asistencias} asistieron, {stats.asistenciasRegistradas - stats.asistencias} no asistieron)
                </p>
                {stats.asistenciasRegistradas < stats.total && (
                  <p className="text-xs text-destructive mt-1">
                    Faltan {stats.total - stats.asistenciasRegistradas} por marcar
                  </p>
                )}
              </CardContent>
            </Card>
            {sesion.APLICA_EXAMEN && (
              <Card className="border-2 border-purple-200 bg-purple-50 dark:bg-purple-950/20">
                <CardContent className="p-6 text-center">
                  <FileText className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                  <div className="text-4xl font-bold text-purple-600 mb-1">
                    {stats.examenes} <span className="text-2xl text-muted-foreground">/ {stats.asistencias}</span>
                  </div>
                  <p className="text-sm font-medium text-muted-foreground">Exámenes Subidos</p>
                  {stats.examenes < stats.asistencias && (
                    <p className="text-xs text-destructive mt-1">Faltan {stats.asistencias - stats.examenes}</p>
                  )}
                </CardContent>
              </Card>
            )}
            {sesion.APLICA_DIPLOMA && (
              <Card className="border-2 border-yellow-200 bg-yellow-50 dark:bg-yellow-950/20">
                <CardContent className="p-6 text-center">
                  <Award className="h-8 w-8 text-yellow-600 mx-auto mb-2" />
                  <div className="text-4xl font-bold text-yellow-600 mb-1">{stats.diplomas}</div>
                  <p className="text-sm font-medium text-muted-foreground">Diplomas Subidos</p>
                </CardContent>
              </Card>
            )}
            <Card className="border-2 border-orange-200 bg-orange-50 dark:bg-orange-950/20">
              <CardContent className="p-6 text-center">
                <AlertCircle className="h-8 w-8 text-orange-600 mx-auto mb-2" />
                <div className="text-4xl font-bold text-orange-600 mb-1">{stats.pendientes}</div>
                <p className="text-sm font-medium text-muted-foreground">Pendientes</p>
              </CardContent>
            </Card>
          </div>
        </div>

        <Card className="border-2">
          <CardHeader>
            <CardTitle className="text-base">Validaciones Requeridas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                {stats.asistenciasRegistradas === stats.total ? (
                  <CheckCircle2 className="h-6 w-6 text-green-600 shrink-0" />
                ) : (
                  <AlertCircle className="h-6 w-6 text-yellow-600 shrink-0" />
                )}
                <span className="font-medium">
                  Todas las asistencias registradas ({stats.asistenciasRegistradas}/{stats.total})
                </span>
              </div>

              <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                {(sesion.URL_LISTA_ASISTENCIA || stats.listaAsistenciaSubida) ? (
                  <CheckCircle2 className="h-6 w-6 text-green-600 shrink-0" />
                ) : (
                  <AlertCircle className="h-6 w-6 text-yellow-600 shrink-0" />
                )}
                <span className="font-medium">
                  Lista de asistencia subida
                </span>
              </div>

              {sesion.APLICA_EXAMEN && (
                <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                  {stats.examenes === stats.asistencias ? (
                    <CheckCircle2 className="h-6 w-6 text-green-600 shrink-0" />
                  ) : (
                    <AlertCircle className="h-6 w-6 text-yellow-600 shrink-0" />
                  )}
                  <span className="font-medium">
                    Todos los exámenes subidos ({stats.examenes}/{stats.asistencias})
                  </span>
                </div>
              )}

              {sesion.APLICA_EXAMEN && (
                <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                  {stats.notasIngresadas === stats.asistencias ? (
                    <CheckCircle2 className="h-6 w-6 text-green-600 shrink-0" />
                  ) : (
                    <AlertCircle className="h-6 w-6 text-yellow-600 shrink-0" />
                  )}
                  <span className="font-medium">
                    Todas las notas ingresadas ({stats.notasIngresadas}/{stats.asistencias})
                  </span>
                </div>
              )}

              {sesion.APLICA_DIPLOMA && (
                <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                  {stats.diplomas === stats.diplomasRequeridos ? (
                    <CheckCircle2 className="h-6 w-6 text-green-600 shrink-0" />
                  ) : (
                    <AlertCircle className="h-6 w-6 text-yellow-600 shrink-0" />
                  )}
                  <span className="font-medium">
                    Diplomas para aprobados ({stats.diplomas}/{stats.diplomasRequeridos})
                  </span>
                </div>
              )}

              <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                {(sesion.ESTADO === "EN_PROCESO" || sesion.ESTADO === "RECHAZADA") ? (
                  <CheckCircle2 className="h-6 w-6 text-green-600 shrink-0" />
                ) : (
                  <AlertCircle className="h-6 w-6 text-yellow-600 shrink-0" />
                )}
                <span className="font-medium">Sesión en proceso</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <div>
          <Label className="text-base font-semibold">Observaciones Finales</Label>
          <Textarea
            value={observacionesFinales}
            onChange={(e) => onObservacionesChange(e.target.value)}
            placeholder="Agrega observaciones finales sobre la capacitación, logros, desafíos, recomendaciones..."
            rows={5}
            className="mt-2"
            disabled={!isEditable}
          />
        </div>

        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button
              size="lg"
              className="w-full h-14 text-md sm:text-lg cursor-pointer"
              disabled={!canFinalize || !isEditable}
            >
              <CheckCheck className="h-6 w-6" />
              Finalizar y Enviar a RRHH
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Finalizar Capacitación</AlertDialogTitle>
              <AlertDialogDescription>
                ¿Estás seguro de que deseas finalizar esta capacitación? Se enviará a RRHH para revisión y no podrás
                hacer más cambios hasta que RRHH la revise.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel className="cursor-pointer dark:hover:border-foreground/50 dark:hover:text-foreground/90">Cancelar</AlertDialogCancel>
              <AlertDialogAction onClick={onFinalizar} className="cursor-pointer">Sí, Finalizar</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {!canFinalize && (sesion.ESTADO === "EN_PROCESO" || sesion.ESTADO === "RECHAZADA") && (
          <Card className="border-2 border-yellow-200 bg-yellow-50 dark:bg-yellow-900/20">
            <CardContent className="p-4">
              <div className="flex gap-3">
                <AlertCircle className="h-6 w-6 text-yellow-600 shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-yellow-900 dark:text-yellow-200">No se puede finalizar aún</p>
                  <p className="text-sm text-yellow-800 dark:text-yellow-300 mt-1">
                    Completa todos los requisitos antes de finalizar la capacitación.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </CardContent>
    </Card>
  )
}
