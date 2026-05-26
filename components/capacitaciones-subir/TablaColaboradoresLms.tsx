"use client"

import { memo, useState, useMemo, useCallback, useRef } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Table, TableBody, TableCell, TableHead,
  TableHeader, TableRow,
} from "@/components/ui/table"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { Combobox } from "@/components/ui/combobox"
import {
  Users, X, Upload, Trash2, CheckCircle2, FileUp,
} from "lucide-react"
import { cn } from "@/lib/utils"
import type { ColaboradorLms, ColaboradorSeleccionado } from "@/lib/capacitaciones/capacitacion-lms.types"

const EXCLUIDOS = new Set(["administrador admin", "sistemas lms"])

const truncar = (texto: string | null | undefined, max = 22): string => {
  if (!texto) return "—"
  return texto.length > max ? texto.slice(0, max) + "…" : texto
}

const formatFileSize = (bytes: number): string => {
  if (bytes < 1024 * 1024) {
    const kb = bytes / 1024
    return `${kb < 1 ? kb.toFixed(2) : kb.toFixed(1)} KB`
  }
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`
}

interface FilaColaboradorProps {
  sel: ColaboradorSeleccionado
  col: ColaboradorLms | undefined
  aplicaExamen: boolean
  onQuitar: (id: number) => void
  onExamen: (id: number, file: File | null) => void
}

const FilaColaborador = memo(function FilaColaborador({
  sel,
  col,
  aplicaExamen,
  onQuitar,
  onExamen,
}: FilaColaboradorProps) {
  const [isDragOver, setIsDragOver] = useState(false)
  const [dragError, setDragError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement | null>(null)

  const validarArchivo = useCallback((file: File): boolean => {
    setDragError(null)
    if (file.type !== "application/pdf") {
      setDragError("Solo PDF")
      setTimeout(() => setDragError(null), 2500)
      return false
    }
    if (file.size > 30 * 1024 * 1024) {
      setDragError("Máx 30 MB")
      setTimeout(() => setDragError(null), 2500)
      return false
    }
    return true
  }, [])

  const handleDragOver = useCallback((e: React.DragEvent) => {
    if (e.dataTransfer.types.includes("Files")) {
      e.preventDefault()
      e.stopPropagation()
      setIsDragOver(true)
    }
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragOver(false)
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragOver(false)

    const file = e.dataTransfer.files[0]
    if (!file) return
    if (validarArchivo(file)) {
      onExamen(sel.idColaborador, file)
    }
  }, [sel.idColaborador, onExamen, validarArchivo])

  return (
    <TableRow
      onDragOver={aplicaExamen ? handleDragOver : undefined}
      onDragLeave={aplicaExamen ? handleDragLeave : undefined}
      onDrop={aplicaExamen ? handleDrop : undefined}
      className={cn(
        "transition-colors duration-150",
        isDragOver && aplicaExamen && [
          "bg-primary/8 dark:bg-primary/15",
          "outline outline-primary/40 outline-offset-[-2px]",
        ]
      )}
    >
      {/* Nombre */}
      <TableCell className="py-2.5 font-medium text-sm min-w-[160px]">
        <div className="flex flex-col">
          <span>{sel.nombre}</span>
          {col?.TIPO_PERSONA === "EXTERNO" && (
            <Badge variant="outline" className="text-xs py-0 mt-0.5 w-fit">
              Externo
            </Badge>
          )}
        </div>
      </TableCell>

      {/* Departamento */}
      <TableCell className="py-2.5 text-sm text-muted-foreground min-w-[120px]">
        {col?.DEPARTAMENTO?.NOMBRE ? (
          <Tooltip>
            <TooltipTrigger asChild>
              <span className="cursor-default">
                {truncar(col.DEPARTAMENTO.NOMBRE)}
              </span>
            </TooltipTrigger>
            {col.DEPARTAMENTO.NOMBRE.length > 22 && (
              <TooltipContent side="top">{col.DEPARTAMENTO.NOMBRE}</TooltipContent>
            )}
          </Tooltip>
        ) : (
          <span className="italic text-xs text-muted-foreground/60">Sin departamento</span>
        )}
      </TableCell>

      {/* Puesto */}
      <TableCell className="py-2.5 text-sm text-muted-foreground min-w-[120px]">
        {col?.PUESTO?.NOMBRE ? (
          <Tooltip>
            <TooltipTrigger asChild>
              <span className="cursor-default">
                {truncar(col.PUESTO.NOMBRE)}
              </span>
            </TooltipTrigger>
            {col.PUESTO.NOMBRE.length > 22 && (
              <TooltipContent side="top">{col.PUESTO.NOMBRE}</TooltipContent>
            )}
          </Tooltip>
        ) : (
          <span className="italic text-xs text-muted-foreground/60">Sin puesto</span>
        )}
      </TableCell>

      {/* Examen individual */}
      {aplicaExamen && (
        <TableCell className="py-2.5 min-w-[120px]">
          {isDragOver ? (
            <div className="flex items-center gap-1.5 text-primary">
              <FileUp className="h-4 w-4 animate-bounce" />
              <span className="text-xs font-medium">Soltar para asignar</span>
            </div>
          ) : dragError ? (
            <span className="text-xs text-destructive font-medium">{dragError}</span>
          ) : sel.examenFile ? (
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="h-3.5 w-3.5 text-green-500 shrink-0" />
              <div className="flex flex-col min-w-0">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <span className="text-xs text-green-700 dark:text-green-400 truncate max-w-[110px] cursor-default">
                      {sel.examenFile.name}
                    </span>
                  </TooltipTrigger>
                  <TooltipContent side="top">
                    <p>{sel.examenFile.name}</p>
                    <p className="text-muted-foreground">{formatFileSize(sel.examenFile.size)}</p>
                  </TooltipContent>
                </Tooltip>
                <span className="text-xs text-muted-foreground">
                  {formatFileSize(sel.examenFile.size)}
                </span>
              </div>
              <button
                type="button"
                onClick={() => onExamen(sel.idColaborador, null)}
                className="text-muted-foreground hover:text-destructive transition-colors shrink-0 ml-0.5"
                title="Quitar examen"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-1.5">
              <label htmlFor={`examen-${sel.idColaborador}`} className="cursor-pointer">
                <Button
                  variant="ghost"
                  size="sm"
                  asChild
                  className={cn(
                    "h-7 px-2 text-xs gap-1",
                    "text-muted-foreground hover:text-foreground",
                    "hover:bg-muted dark:hover:bg-muted",
                  )}
                >
                  <span>
                    <Upload className="h-3 w-3" />
                    Subir PDF
                  </span>
                </Button>
                <input
                  id={`examen-${sel.idColaborador}`}
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0] ?? null
                    if (file && validarArchivo(file)) {
                      onExamen(sel.idColaborador, file)
                    }
                    e.target.value = ""
                  }}
                />
              </label>
{/*               <span className="text-xs text-muted-foreground/50 hidden sm:inline">
                o arrastra aquí
              </span> */}
            </div>
          )}
        </TableCell>
      )}

      {/* Quitar */}
      <TableCell className="py-2.5 w-10">
        <button
          type="button"
          onClick={() => onQuitar(sel.idColaborador)}
          className="text-muted-foreground hover:text-destructive transition-colors"
          title={`Quitar a ${sel.nombre}`}
        >
          <Trash2 className="h-4 w-4 cursor-pointer" />
        </button>
      </TableCell>
    </TableRow>
  )
})

interface Props {
  colaboradores: ColaboradorLms[]
  seleccionados: ColaboradorSeleccionado[]
  setSeleccionados: (v: ColaboradorSeleccionado[]) => void
  aplicaExamen: boolean
}

export const TablaColaboradoresLms = memo(function TablaColaboradoresLms({
  colaboradores,
  seleccionados,
  setSeleccionados,
  aplicaExamen,
}: Props) {
  const [comboValue, setComboValue] = useState("")

  const colaboradoresValidos = useMemo(() =>
    colaboradores.filter((c) => {
      const nombre = `${c.NOMBRE} ${c.APELLIDO}`.toLowerCase().trim()
      return !EXCLUIDOS.has(nombre)
    }),
    [colaboradores]
  )

  const selectedIds = useMemo(
    () => new Set(seleccionados.map((s) => s.idColaborador)),
    [seleccionados]
  )

  const opcionesCombo = useMemo(() =>
    colaboradoresValidos
      .filter((c) => !selectedIds.has(c.ID_PERSONA))
      .map((c) => ({
        value: String(c.ID_PERSONA),
        label: `${c.NOMBRE} ${c.APELLIDO}`,
        sublabel: [
          c.DEPARTAMENTO?.NOMBRE ?? "Sin departamento",
          c.PUESTO?.NOMBRE ?? "Sin puesto",
        ].join(" · "),
      })),
    [colaboradoresValidos, selectedIds]
  )

  const handleAgregar = useCallback((idStr: string) => {
    if (!idStr) return
    const id = Number(idStr)
    const col = colaboradoresValidos.find((c) => c.ID_PERSONA === id)
    if (!col) return
    setSeleccionados([
      ...seleccionados,
      { idColaborador: col.ID_PERSONA, nombre: `${col.NOMBRE} ${col.APELLIDO}`, examenFile: null },
    ])
    setComboValue("")
  }, [colaboradoresValidos, seleccionados, setSeleccionados])

  const handleQuitar = useCallback((id: number) => {
    setSeleccionados(seleccionados.filter((s) => s.idColaborador !== id))
  }, [seleccionados, setSeleccionados])

  const handleExamen = useCallback((id: number, file: File | null) => {
    setSeleccionados(seleccionados.map((s) =>
      s.idColaborador === id ? { ...s, examenFile: file } : s
    ))
  }, [seleccionados, setSeleccionados])

  const examenesCargados = seleccionados.filter((s) => s.examenFile).length

  return (
    <TooltipProvider>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-orange-100 dark:bg-orange-950/40">
                <Users className="h-4 w-4 text-orange-600 dark:text-orange-400" />
              </div>
              <div>
                <CardTitle className="text-base">Participantes</CardTitle>
                <CardDescription className="text-sm">
                  Busca y agrega los colaboradores de esta capacitación
                </CardDescription>
              </div>
            </div>
            {seleccionados.length > 0 && (
              <div className="flex items-center gap-2 flex-wrap">
                <Badge variant="secondary">
                  {seleccionados.length} participante(s)
                </Badge>
                {aplicaExamen && examenesCargados > 0 && (
                  <Badge
                    variant="outline"
                    className="text-green-700 border-green-300 dark:text-green-400 dark:border-green-700"
                  >
                    {examenesCargados} con examen
                  </Badge>
                )}
              </div>
            )}
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Buscador */}
          <div className="space-y-1">
            <Combobox
              options={opcionesCombo}
              value={comboValue}
              onValueChange={handleAgregar}
              placeholder={
                opcionesCombo.length === 0 && seleccionados.length > 0
                  ? "Todos los colaboradores agregados"
                  : "Buscar colaborador para agregar..."
              }
              searchPlaceholder="Escribir nombre, departamento o puesto..."
              emptyText="No se encontraron colaboradores."
              disabled={opcionesCombo.length === 0}
              className="cursor-pointer"
            />
            <p className="text-xs text-muted-foreground pl-1">
              {opcionesCombo.length} colaborador(es) disponible(s) para agregar
            </p>
          </div>

          {/* Tabla o estado vacío */}
          {seleccionados.length === 0 ? (
            <div className="border-2 border-dashed border-border rounded-xl py-12 text-center">
              <Users className="h-10 w-10 mx-auto text-muted-foreground/30 mb-3" />
              <p className="text-sm text-muted-foreground">Aún no hay participantes agregados</p>
              <p className="text-xs text-muted-foreground/60 mt-1">
                Usa el buscador de arriba para agregar colaboradores
              </p>
            </div>
          ) : (
            <div className="rounded-md border border-border overflow-auto">
              <Table className="min-w-full">
                <TableHeader>
                  <TableRow className="bg-muted/50 hover:bg-muted/50">
                    <TableHead className="sticky top-0 z-10 bg-muted/80 backdrop-blur-sm font-semibold text-foreground min-w-[160px]">
                      Colaborador
                    </TableHead>
                    <TableHead className="sticky top-0 z-10 bg-muted/80 backdrop-blur-sm font-semibold text-foreground min-w-[120px]">
                      Departamento
                    </TableHead>
                    <TableHead className="sticky top-0 z-10 bg-muted/80 backdrop-blur-sm font-semibold text-foreground min-w-[120px]">
                      Puesto
                    </TableHead>
                    {aplicaExamen && (
                      <TableHead className="sticky top-0 z-10 bg-muted/80 backdrop-blur-sm font-semibold text-foreground min-w-[120px]">
                        Examen individual
                      </TableHead>
                    )}
                    <TableHead className="sticky top-0 z-10 bg-muted/80 backdrop-blur-sm w-10" />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {seleccionados.map((sel) => (
                    <FilaColaborador
                      key={sel.idColaborador}
                      sel={sel}
                      col={colaboradoresValidos.find((c) => c.ID_PERSONA === sel.idColaborador)}
                      aplicaExamen={aplicaExamen}
                      onQuitar={handleQuitar}
                      onExamen={handleExamen}
                    />
                  ))}
                </TableBody>
              </Table>
            </div>
          )}

          {/* Nota informativa examen */}
          {aplicaExamen && seleccionados.length > 0 && (
            <p className="text-xs text-muted-foreground pl-1">
              <span className="font-medium">Examen individual:</span>{" "}
              Sube un PDF por colaborador o arrástralo directamente sobre su fila.
              Si no subes uno, se usará el listado de asistencia como documento de examen.
            </p>
          )}
        </CardContent>
      </Card>
    </TooltipProvider>
  )
})
