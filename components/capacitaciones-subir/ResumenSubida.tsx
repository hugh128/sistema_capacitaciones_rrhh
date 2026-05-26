"use client"

import { memo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import {
  CheckCircle2, Circle, Loader2, Send,
  BookOpen, FolderOpen, UserCheck, Users, ClipboardList,
} from "lucide-react"
import type { ColaboradorSeleccionado, ProgramaCapacitacion, CapacitadorLms } from "@/lib/capacitaciones/capacitacion-lms.types"

interface CheckItem {
  label: string
  ok: boolean
  icon: React.ReactNode
}

interface Props {
  nombre: string
  programaId: number | null
  programas: ProgramaCapacitacion[]
  capacitadorId: number | null
  capacitadores: CapacitadorLms[]
  fechaProgramada: string
  categoriaSesion: string
  seleccionados: ColaboradorSeleccionado[]
  listaFile: File | null
  aplicaExamen: boolean
  isMutating: boolean
  onSubmit: () => void
}

export const ResumenSubida = memo(function ResumenSubida({
  nombre,
  programaId,
  programas,
  capacitadorId,
  capacitadores,
  fechaProgramada,
  categoriaSesion,
  seleccionados,
  listaFile,
  aplicaExamen,
  isMutating,
  onSubmit,
}: Props) {
  const programa = programas.find((p) => p.ID_PROGRAMA === programaId)
  const capacitador = capacitadores.find((c) => c.PERSONA_ID === capacitadorId)

  const examenesCargados = seleccionados.filter((s) => s.examenFile).length

  const checks: CheckItem[] = [
    {
      label: "Nombre de la capacitación",
      ok: nombre.trim().length > 0,
      icon: <BookOpen className="h-3.5 w-3.5" />,
    },
    {
      label: "Programa seleccionado",
      ok: !!programaId,
      icon: <FolderOpen className="h-3.5 w-3.5" />,
    },
    {
      label: "Capacitador seleccionado",
      ok: !!capacitadorId,
      icon: <UserCheck className="h-3.5 w-3.5" />,
    },
    {
      label: "Fecha programada",
      ok: !!fechaProgramada,
      icon: <ClipboardList className="h-3.5 w-3.5" />,
    },
    {
      label: "Al menos 1 participante",
      ok: seleccionados.length > 0,
      icon: <Users className="h-3.5 w-3.5" />,
    },
    {
      label: "Lista de asistencia (PDF)",
      ok: !!listaFile,
      icon: <ClipboardList className="h-3.5 w-3.5" />,
    },
  ]

  const allOk = checks.every((c) => c.ok)

  return (
    <Card className="sticky top-0">
      <CardHeader>
        <CardTitle className="text-base">Resumen</CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Checklist */}
        <div className="space-y-2">
          {checks.map((item) => (
            <div key={item.label} className="flex items-center gap-2 text-sm">
              {item.ok ? (
                <CheckCircle2 className="h-4 w-4 text-green-500 shrink-0" />
              ) : (
                <Circle className="h-4 w-4 text-muted-foreground/40 shrink-0" />
              )}
              <span className={item.ok ? "text-foreground" : "text-muted-foreground"}>
                {item.label}
              </span>
            </div>
          ))}
        </div>

        <Separator />

        {/* Detalles */}
        <div className="space-y-2 text-sm">
          {nombre && (
            <div>
              <p className="text-xs text-muted-foreground">Nombre</p>
              <p className="font-medium break-words">{nombre}</p>
            </div>
          )}

          {programa && (
            <div>
              <p className="text-xs text-muted-foreground">Programa</p>
              <p className="font-medium">{programa.NOMBRE}</p>
            </div>
          )}

          {capacitador && (
            <div>
              <p className="text-xs text-muted-foreground">Capacitador</p>
              <p className="font-medium">{capacitador.NOMBRE} {capacitador.APELLIDO}</p>
            </div>
          )}

          {fechaProgramada && (
            <div>
              <p className="text-xs text-muted-foreground">Fecha</p>
              <p className="font-medium">
                {new Date(fechaProgramada + "T00:00:00").toLocaleDateString("es-GT", {
                  day: "2-digit", month: "long", year: "numeric",
                })}
              </p>
            </div>
          )}

          {categoriaSesion && (
            <div>
              <p className="text-xs text-muted-foreground">Categoría sesión</p>
              <Badge variant="outline" className="mt-0.5">{categoriaSesion}</Badge>
            </div>
          )}

          {seleccionados.length > 0 && (
            <div>
              <p className="text-xs text-muted-foreground">Participantes</p>
              <p className="font-medium">{seleccionados.length} colaborador(es)</p>
              {aplicaExamen && examenesCargados > 0 && (
                <p className="text-xs text-muted-foreground mt-0.5">
                  {examenesCargados} con examen individual ·{" "}
                  {seleccionados.length - examenesCargados} usarán el listado
                </p>
              )}
            </div>
          )}
        </div>

        <Separator />

        <Button
          className="w-full cursor-pointer"
          disabled={!allOk || isMutating}
          onClick={onSubmit}
        >
          {isMutating ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Guardando...
            </>
          ) : (
            <>
              <Send className="h-4 w-4 mr-2" />
              Guardar Capacitación
            </>
          )}
        </Button>

        {!allOk && (
          <p className="text-xs text-muted-foreground text-center">
            Completa los campos marcados para continuar
          </p>
        )}
      </CardContent>
    </Card>
  )
})
