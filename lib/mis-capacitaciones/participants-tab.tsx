"use client"

import type React from "react"
import { useRef, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { CheckCircle2, XCircle, Upload, Award, Info, X } from "lucide-react"
import type { COLABORADORES_SESION, EstadoColaborador, SESION_DETALLE } from "./capacitaciones-types"

interface ParticipantsTabProps {
  sesion: SESION_DETALLE
  colaboradores: COLABORADORES_SESION[]
  asistenciaState: Record<number, boolean>
  notasState: Record<number, number | null>
  examenesState: Record<number, File | null>
  diplomasState: Record<number, File | null>
  onToggleAsistencia: (colaboradorId: number, currentValue: boolean | undefined) => void
  onUpdateNota: (colaboradorId: number, nota: number) => void
  onSubirDocumento: (tipo: "examen" | "diploma", colaboradorId: number, file: File) => void
  onEliminarDocumento: (tipo: "examen" | "diploma", colaboradorId: number) => void
  onMarcarAsistenciaMasiva: (asistio: boolean, colaboradorIds: number[]) => void
}

export function ParticipantsTab({
  sesion,
  colaboradores,
  asistenciaState,
  notasState,
  examenesState,
  diplomasState,
  onToggleAsistencia,
  onUpdateNota,
  onSubirDocumento,
  onEliminarDocumento,
  onMarcarAsistenciaMasiva,
}: ParticipantsTabProps) {
  const [selectedColaboradores, setSelectedColaboradores] = useState<number[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [editingGradeId, setEditingGradeId] = useState<number | null>(null)
  const [gradeValues, setGradeValues] = useState<Record<number, string>>({})

  const fileInputRefs = useRef<Record<string, HTMLInputElement | null>>({})

  const isEditable = sesion.ESTADO === "EN_PROCESO";

  const handleOpenFileDialog = (tipo: "examen" | "diploma", colaboradorId: number) => {
    const key = `${tipo}-${colaboradorId}`
    fileInputRefs.current[key]?.click()
  }

  const handleFileChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    tipo: "examen" | "diploma",
    colaboradorId: number
  ) => {
    const file = e.target.files?.[0]
    if (file) {
      onSubirDocumento(tipo, colaboradorId, file)
      e.target.value = "" 
    }
  }

  const getEstadoColaboradorDynamic = (colaboradorId: number): EstadoColaborador => {
    const asistio = asistenciaState[colaboradorId]
    const nota = notasState[colaboradorId]

    if (asistio === undefined || asistio === null) {
      return "PENDIENTE"
    }

    if (asistio === false) {
      return "NO_ASISTIO"
    }

    if (!sesion?.APLICA_EXAMEN) {
      return "APROBADO"
    }

    if (nota === null || nota === undefined) {
      return "PENDIENTE"
    }

    const notaMinima = sesion?.NOTA_MINIMA || 60
    if (nota >= notaMinima) {
      return "APROBADO"
    } else {
      return "REPROBADO"
    }
  }

  const getEstadoColaboradorColor = (estado: EstadoColaborador) => {
    switch (estado) {
      case "APROBADO":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
      case "REPROBADO":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
      case "NO_ASISTIO":
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200"
      case "PENDIENTE":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200"
    }
  }

  const colaboradoresFiltrados = colaboradores.filter(
    (col) =>
      col.NOMBRE_COMPLETO.toLowerCase().includes(searchTerm.toLowerCase()) ||
      col.CORREO.toLowerCase().includes(searchTerm.toLowerCase()) ||
      col.DEPARTAMENTO.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const handleGradeChange = (colaboradorId: number, value: string) => {
    setGradeValues((prev) => ({ ...prev, [colaboradorId]: value }))
  }

  const handleGradeBlur = (colaboradorId: number) => {
    const value = gradeValues[colaboradorId]
    if (!value) {
      setEditingGradeId(null)
      return
    }
    const nota = Number(value)
    if (isNaN(nota) || nota < 0 || nota > 100) {
      alert("Ingresa una nota válida entre 0 y 100")
      return
    }
    onUpdateNota(colaboradorId, nota)
    setEditingGradeId(null)
  }

  const handleGradeKeyDown = (e: React.KeyboardEvent, colaboradorId: number) => {
    if (e.key === "Enter") {
      handleGradeBlur(colaboradorId)
    } else if (e.key === "Escape") {
      setEditingGradeId(null)
    }
  }

  return (
    <Card className="shadow-sm">
      <CardHeader className="py-2 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/20 dark:to-purple-950/20">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
          <div>
            <CardTitle className="text-xl">Participantes</CardTitle>
            <CardDescription>Gestiona la asistencia y evaluación de los participantes</CardDescription>
          </div>
          {selectedColaboradores.length > 0 && (
            <div className="flex gap-2 flex-wrap">
              <Button
                variant="default"
                size="sm"
                onClick={() => {
                  if (!isEditable) return;
                  onMarcarAsistenciaMasiva(true, selectedColaboradores)
                  setSelectedColaboradores([])
                }}
                className="bg-green-600 hover:bg-green-700"
              >
                <CheckCircle2 className="h-4 w-4 mr-2" />
                Asistieron ({selectedColaboradores.length})
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={() => {
                  onMarcarAsistenciaMasiva(false, selectedColaboradores)
                  setSelectedColaboradores([])
                }}
              >
                <XCircle className="h-4 w-4 mr-2" />
                No Asistieron ({selectedColaboradores.length})
              </Button>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4 pt-2">
        <div className="flex items-center gap-2">
          <Input
            placeholder="Buscar por nombre, correo o departamento..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1 h-11"
          />
        </div>

        <div className="border rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead className="w-12">
                    <Checkbox
                      className="
                        dark:border dark:border-gray-500
                        data-[state=checked]:dark:border-transparent
                      "
                      checked={
                        selectedColaboradores.length === colaboradoresFiltrados.length &&
                        colaboradoresFiltrados.length > 0
                      }
                      onCheckedChange={(checked) => {
                        if (!isEditable) return;
                        if (checked) {
                          setSelectedColaboradores(colaboradoresFiltrados.map((c) => c.ID_COLABORADOR))
                        } else {
                          setSelectedColaboradores([])
                        }
                      }}
                    />
                  </TableHead>
                  <TableHead className="min-w-[200px]">Nombre</TableHead>
                  <TableHead className="min-w-[150px]">Departamento</TableHead>
                  <TableHead className="min-w-[150px]">Puesto</TableHead>
                  <TableHead className="min-w-[120px]">Estado</TableHead>
                  <TableHead className="w-24 text-center">Asistió</TableHead>
                  {sesion.APLICA_EXAMEN && <TableHead className="w-28 text-center">Nota</TableHead>}
                  {sesion.APLICA_EXAMEN && <TableHead className="w-32 text-center">Examen</TableHead>}
                  {sesion.APLICA_DIPLOMA && <TableHead className="w-32 text-center">Diploma</TableHead>}
                </TableRow>
              </TableHeader>
              <TableBody>
                {colaboradoresFiltrados.map((col) => {
                  const estadoDinamico = getEstadoColaboradorDynamic(col.ID_COLABORADOR)
                  const asistio = asistenciaState[col.ID_COLABORADOR]
                  const nota = notasState[col.ID_COLABORADOR]
                  const tieneExamen = examenesState[col.ID_COLABORADOR]
                  const tieneDiploma = diplomasState[col.ID_COLABORADOR]

                  return (
                    <TableRow key={col.ID_COLABORADOR} className="hover:bg-muted/50">
                      <TableCell>
                        <Checkbox
                          className="
                            dark:border dark:border-gray-500
                            data-[state=checked]:dark:border-transparent
                          "
                          checked={selectedColaboradores.includes(col.ID_COLABORADOR)}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setSelectedColaboradores([...selectedColaboradores, col.ID_COLABORADOR])
                            } else {
                              setSelectedColaboradores(selectedColaboradores.filter((id) => id !== col.ID_COLABORADOR))
                            }
                          }}
                        />
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-semibold">{col.NOMBRE_COMPLETO}</p>
                          <p className="text-xs text-muted-foreground">{col.CORREO}</p>
                        </div>
                      </TableCell>
                      <TableCell className="font-medium">{col.DEPARTAMENTO}</TableCell>
                      <TableCell>{col.PUESTO}</TableCell>
                      <TableCell>
                        <Badge className={getEstadoColaboradorColor(estadoDinamico)}>{estadoDinamico}</Badge>
                      </TableCell>
                      <TableCell className="text-center">
                        <div className="flex justify-center">
                          <Checkbox
                            checked={asistio === true}
                            onCheckedChange={() => isEditable && onToggleAsistencia(col.ID_COLABORADOR, asistio)}
                            className="h-5 w-5 dark:border dark:border-gray-500 data-[state=checked]:dark:border-transparent"
                          />
                        </div>
                      </TableCell>
                      {sesion.APLICA_EXAMEN && (
                        <TableCell className="text-center">
                          {asistio === true ? (
                            sesion.ESTADO === "EN_PROCESO" ? (
                              editingGradeId === col.ID_COLABORADOR ? (
                                <Input
                                  type="number"
                                  min="0"
                                  max="100"
                                  value={gradeValues[col.ID_COLABORADOR] ?? nota ?? ""}
                                  onChange={(e) => handleGradeChange(col.ID_COLABORADOR, e.target.value)}
                                  onBlur={() => handleGradeBlur(col.ID_COLABORADOR)}
                                  onKeyDown={(e) => handleGradeKeyDown(e, col.ID_COLABORADOR)}
                                  className="w-20 h-8 text-center"
                                  autoFocus
                                  placeholder="0-100"
                                />
                              ) : (
                                <button
                                  onClick={() => {
                                    setEditingGradeId(col.ID_COLABORADOR)
                                    setGradeValues((prev) => ({
                                      ...prev,
                                      [col.ID_COLABORADOR]: nota?.toString() ?? "",
                                    }))
                                  }}
                                  className="w-full h-8 px-2 rounded hover:bg-muted flex items-center justify-center"
                                >
                                  {nota !== null && nota !== undefined ? (
                                    <span
                                      className={`font-bold ${
                                        estadoDinamico === "APROBADO"
                                          ? "text-green-600"
                                          : estadoDinamico === "REPROBADO"
                                          ? "text-red-600"
                                          : ""
                                      }`}
                                    >
                                      {nota}
                                    </span>
                                  ) : (
                                    <span className="text-muted-foreground text-sm">Agregar</span>
                                  )}
                                </button>
                              )
                            ) : (
                              <span
                                className={`font-bold ${
                                  estadoDinamico === "APROBADO"
                                    ? "text-green-600"
                                    : estadoDinamico === "REPROBADO"
                                    ? "text-red-600"
                                    : "text-muted-foreground"
                                }`}
                              >
                                {nota !== null && nota !== undefined ? nota : "-"}
                              </span>
                            )
                          ) : (
                            <span className="text-muted-foreground">-</span>
                          )}
                        </TableCell>
                      )}
                      {sesion.APLICA_EXAMEN && (
                        <TableCell className="text-center">
                          {asistio === true ? (
                            <div className="flex items-center justify-center gap-1 relative"> 
                              <input
                                type="file"
                                accept=".pdf"
                                ref={(el) => { 
                                  fileInputRefs.current[`examen-${col.ID_COLABORADOR}`] = el
                                }}
                                onChange={(e) => handleFileChange(e, "examen", col.ID_COLABORADOR)}
                                className="hidden"
                              />
                              <Button
                                size="sm"
                                variant={tieneExamen ? "default" : "outline"}
                                onClick={() => handleOpenFileDialog("examen", col.ID_COLABORADOR)}
                                className={tieneExamen ? "bg-green-600 hover:bg-green-700 relative" : ""}
                                disabled={!isEditable}
                              >
                                <Upload className="h-3 w-3 mr-1" />
                                {tieneExamen ? "OK" : "Subir"}
                                {isEditable && tieneExamen && (
                                  <span
                                    role="button"
                                    onClick={(e) => {
                                      e.stopPropagation()
                                      onEliminarDocumento("examen", col.ID_COLABORADOR)
                                    }}
                                    className="absolute -top-1 -right-1 bg-red-500 hover:bg-red-600 rounded-full p-0.5 cursor-pointer"
                                  >
                                    <X className="h-3 w-3 text-white" />
                                  </span>
                                )}
                              </Button>
                            </div>
                          ) : (
                            <span className="text-muted-foreground">-</span>
                          )}
                        </TableCell>
                      )}
                      {sesion.APLICA_DIPLOMA && (
                        <TableCell className="text-center">
                          {estadoDinamico === "APROBADO" ? (
                            <div className="flex items-center justify-center gap-1 relative">
                              <input
                                type="file"
                                accept=".pdf"
                                ref={(el) => {
                                  fileInputRefs.current[`diploma-${col.ID_COLABORADOR}`] = el
                                }}
                                onChange={(e) => handleFileChange(e, "diploma", col.ID_COLABORADOR)}
                                className="hidden"
                              />
                              <Button
                                size="sm"
                                variant={tieneDiploma ? "default" : "outline"}
                                onClick={() => handleOpenFileDialog("diploma", col.ID_COLABORADOR)}
                                className={tieneDiploma ? "bg-purple-600 hover:bg-purple-700 relative" : ""}
                                disabled={!isEditable}
                              >
                                <Award className="h-3 w-3 mr-1" />
                                {tieneDiploma ? "OK" : "Subir"}
                                {isEditable && tieneDiploma && (
                                  <span
                                    role="button"
                                    onClick={(e) => {
                                      e.stopPropagation()
                                      onEliminarDocumento("diploma", col.ID_COLABORADOR)
                                    }}
                                    className="absolute -top-1 -right-1 bg-red-500 hover:bg-red-600 rounded-full p-0.5 cursor-pointer"
                                  >
                                    <X className="h-3 w-3 text-white" />
                                  </span>
                                )}
                              </Button>
                            </div>
                          ) : (
                            <span className="text-muted-foreground">-</span>
                          )}
                        </TableCell>
                      )}
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </div>
        </div>

        <Card className="border-blue-200 bg-blue-50 dark:bg-blue-950/20">
          <CardContent className="p-4">
            <div className="flex gap-3">
              <Info className="h-5 w-5 text-blue-600 shrink-0 mt-0.5" />
              <div className="text-sm space-y-1">
                <p className="font-semibold text-blue-900 dark:text-blue-200">Instrucciones:</p>
                <ul className="list-disc list-inside space-y-1 text-blue-800 dark:text-blue-300">
                  <li>Marca la casilla Asistió para registrar asistencia</li>
                  <li>Haz clic en la nota para editarla directamente (solo si asistió)</li>
                  <li>Usa los botones Subir para cargar exámenes y diplomas</li>
                  <li>Haz clic en la X roja para eliminar un documento subido</li>
                  <li>El estado se actualiza automáticamente según asistencia y nota</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </CardContent>
    </Card>
  )
}
