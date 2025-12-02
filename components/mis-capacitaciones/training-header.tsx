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
  const fechaSesion = new Date(year, month - 1, day)
  
  //const fechaSesion = new Date(2025, 11, 1);
  const hoy = new Date()
  hoy.setHours(0, 0, 0, 0)
  
  const esAnticipada = fechaSesion > hoy

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
              <Button
                size="lg"
                className="bg-green-600 hover:bg-green-700 cursor-pointer"
              >
                <Play className="h-5 w-5 mr-2" />
                Iniciar Capacitación
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Iniciar Capacitación</AlertDialogTitle>
                <AlertDialogDescription>
                  ¿Estás seguro de que deseas iniciar esta capacitación? El estado cambiará a &quot;En Proceso&quot; y podrás
                  comenzar a registrar asistencias.
                  {esAnticipada && (
                    <span className="block mt-3 font-semibold text-amber-600">
                      ⚠️ Nota: Esta capacitación está programada para el {sesion.FECHA_FORMATO}. Estás iniciándola antes de la fecha programada.
                    </span>
                  )}
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel className="dark:text-foreground dark:hover:border-destructive/50 cursor-pointer">Cancelar</AlertDialogCancel>
                <AlertDialogAction className="cursor-pointer" onClick={() => onChangeEstado(sesion.ID_SESION, usuario.PERSONA_ID, sesion.OBSERVACIONES)}>
                  Sí, Iniciar
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        )}
      </div>
    </div>
  )
}
