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
import type { Capacitacion, EstadoCapacitacion } from "@/lib/mis-capacitaciones/capacitaciones-types"

interface TrainingHeaderProps {
  capacitacion: Capacitacion
  onChangeEstado: (nuevoEstado: EstadoCapacitacion) => void
}

export function TrainingHeader({ capacitacion, onChangeEstado }: TrainingHeaderProps) {
  return (
    <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
      <div className="flex items-start gap-4 flex-1">
        <Link href="/mis-capacitaciones">
          <Button variant="outline" size="icon" className="shrink-0 bg-transparent">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div className="space-y-2">
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-3xl font-bold text-foreground">{capacitacion.NOMBRE}</h1>
            <Badge className={`${getEstadoColor(capacitacion.ESTADO)} text-sm px-3 py-1`}>{capacitacion.ESTADO}</Badge>
          </div>
          {capacitacion.CODIGO_DOCUMENTO && (
            <p className="text-muted-foreground font-mono text-sm bg-muted px-2 py-1 rounded inline-block">
              Código: {capacitacion.CODIGO_DOCUMENTO}
            </p>
          )}
        </div>
      </div>
      <div className="flex gap-2">
        {capacitacion.ESTADO === "ASIGNADA" && (
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button size="lg" className="bg-green-600 hover:bg-green-700">
                <Play className="h-5 w-5 mr-2" />
                Iniciar Capacitación
              </Button>
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
                <AlertDialogAction onClick={() => onChangeEstado("EN_PROCESO")}>Sí, Iniciar</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        )}
      </div>
    </div>
  )
}
