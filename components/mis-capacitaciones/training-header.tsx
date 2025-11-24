"use client"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
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
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
  TooltipProvider
} from "@/components/ui/tooltip"

import { ArrowLeft, Play } from "lucide-react"
import Link from "next/link"
import { getEstadoColor } from "@/lib/mis-capacitaciones/capacitaciones-types"
import type { SESION_DETALLE } from "@/lib/mis-capacitaciones/capacitaciones-types"
import { UsuarioLogin } from "@/lib/auth"

interface TrainingHeaderProps {
  sesion: SESION_DETALLE
  onChangeEstado: (idSesion: number, idCapacitador: number, observaciones: null | string) => Promise<void>
  usuario: UsuarioLogin
}

export function TrainingHeader({ sesion, onChangeEstado, usuario }: TrainingHeaderProps) {
  const [day, month, year] = (sesion.FECHA_FORMATO ?? "").split("/").map(Number)

  //const fechaSesion = new Date(2025, 10, 25);
  const fechaSesion = new Date(year, month - 1, day)

  const hoy = new Date()
  hoy.setHours(0, 0, 0, 0)

  const puedeIniciar = hoy >= fechaSesion

  return (
    <div className="flex flex-col sm:flex-row flex-wrap justify-between space-y-4">
      <div className="flex items-start gap-4 flex-1">
        <Link href="/mis-capacitaciones">
          <Button variant="outline" size="icon" className="shrink-0 bg-transparent">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div className="">
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="text-2xl md:text-3xl font-bold text-foreground">{sesion.CAPACITACION_NOMBRE}</h1>
            <Badge className={`${getEstadoColor(sesion.ESTADO)} text-sm px-3 py-1`}>{sesion.ESTADO}</Badge>
          </div>
          {sesion.CODIGO_DOCUMENTO && (
            <p className="text-muted-foreground font-mono text-sm bg-muted px-2 py-1 rounded inline-block">
              Código: {sesion.CODIGO_DOCUMENTO}
            </p>
          )}
        </div>
      </div>
      <div className="flex gap-2 ml-12">
        {(sesion.ESTADO === "ASIGNADA" || sesion.ESTADO === "PROGRAMADA") && (
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild disabled={puedeIniciar}>
                    <div>
                      <Button
                        size="lg"
                        disabled={!puedeIniciar}
                        className={`
                          ${!puedeIniciar
                            ? "opacity-50 cursor-not-allowed bg-green-600"
                            : "bg-green-600 hover:bg-green-700 cursor-pointer"
                          }
                        `}
                      >
                        <Play className="h-5 w-5 mr-2" />
                        Iniciar Capacitación
                      </Button>
                    </div>
                  </TooltipTrigger>

                  {!puedeIniciar && (
                    <TooltipContent side="top">
                      La capacitación solo puede iniciarse en la fecha programada.
                    </TooltipContent>
                  )}
                </Tooltip>
              </TooltipProvider>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Iniciar Capacitación</AlertDialogTitle>
                <AlertDialogDescription>
                  ¿Estás seguro de que deseas iniciar esta capacitación? El estado cambiará a En Proceso y podrás
                  comenzar a registrar asistencias.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                <AlertDialogAction onClick={() => onChangeEstado(sesion.ID_SESION, usuario.PERSONA_ID, sesion.OBSERVACIONES)}>Sí, Iniciar</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        )}
      </div>
    </div>
  )
}
