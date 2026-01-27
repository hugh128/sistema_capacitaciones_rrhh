"use client"

import type React from "react"
import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { CheckCircle2, XCircle, Upload, Award, Info, FileText } from "lucide-react"
import type { COLABORADORES_SESION, EstadoColaborador, SESION_DETALLE } from "@/lib/mis-capacitaciones/capacitaciones-types"
import { UploadFileModal } from "@/components/mis-capacitaciones/upload-file-modal"

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
  onDescargarExamen?: (idSesion: number, idColaborador: number) => Promise<string | undefined>
  onDescargarDiploma?: (idSesion: number, idColaborador: number) => Promise<string | undefined>
}

type UploadModalState = {
  isOpen: boolean
  tipo: "examen" | "diploma" | null
  colaboradorId: number | null
  colaboradorNombre: string
  currentFileName: string | null
  currentFile: File | null
  currentFileUrl: string | null
  onDownloadFile: (() => Promise<void>) | null
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
  onDescargarExamen,
  onDescargarDiploma,
}: ParticipantsTabProps) {
  const [selectedColaboradores, setSelectedColaboradores] = useState<number[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [editingGradeId, setEditingGradeId] = useState<number | null>(null)
  const [gradeValues, setGradeValues] = useState<Record<number, string>>({})
  
  const [uploadModalState, setUploadModalState] = useState<UploadModalState>({
    isOpen: false,
    tipo: null,
    colaboradorId: null,
    colaboradorNombre: "",
    currentFileName: null,
    currentFile: null,
    currentFileUrl: null,
    onDownloadFile: null,
  })

  const isEditable = sesion.ESTADO === "EN_PROCESO" || sesion.ESTADO === "RECHAZADA";

  const handleOpenUploadModal = (
    tipo: "examen" | "diploma",
    colaboradorId: number,
    colaboradorNombre: string
  ) => {
    if (!isEditable) return

    const colaborador = colaboradores.find(c => c.ID_COLABORADOR === colaboradorId)
    let currentFileName: string | null = null
    let currentFile: File | null = null
    let currentFileUrl: string | null = null
    let downloadFunction: (() => Promise<void>) | null = null

    if (tipo === "examen") {
      const hasFile = examenesState[colaboradorId]
      if (hasFile) {
        if (hasFile instanceof File) {
          currentFile = hasFile
        } else if (colaborador?.URL_EXAMEN) {
          currentFileUrl = colaborador.URL_EXAMEN
          currentFileName = colaborador.URL_EXAMEN.split('/').pop() || "Examen existente"
          
          if (onDescargarExamen) {
            downloadFunction = async () => {
              const url = await onDescargarExamen(sesion.ID_SESION, colaboradorId)
              if (url) {
                window.open(url, '_blank')
              }
            }
          }
        } else {
          currentFileName = "Examen existente"
        }
      }
    } else {
      const hasFile = diplomasState[colaboradorId]
      if (hasFile) {
        if (hasFile instanceof File) {
          currentFile = hasFile
        } else if (colaborador?.URL_DIPLOMA) {
          currentFileUrl = colaborador.URL_DIPLOMA
          currentFileName = colaborador.URL_DIPLOMA.split('/').pop() || "Diploma existente"
          
          if (onDescargarDiploma) {
            downloadFunction = async () => {
              const url = await onDescargarDiploma(sesion.ID_SESION, colaboradorId)
              if (url) {
                window.open(url, '_blank')
              }
            }
          }
        } else {
          currentFileName = "Diploma existente"
        }
      }
    }

    setUploadModalState({
      isOpen: true,
      tipo,
      colaboradorId,
      colaboradorNombre,
      currentFileName,
      currentFile,
      currentFileUrl,
      onDownloadFile: downloadFunction,
    })
  }

  const handleCloseUploadModal = () => {
    setUploadModalState({
      isOpen: false,
      tipo: null,
      colaboradorId: null,
      colaboradorNombre: "",
      currentFileName: null,
      currentFile: null,
      currentFileUrl: null,
      onDownloadFile: null,
    })
  }

  const handleUploadFile = (file: File) => {
    if (uploadModalState.tipo && uploadModalState.colaboradorId) {
      onSubirDocumento(uploadModalState.tipo, uploadModalState.colaboradorId, file)
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
    <>
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
                  className="bg-green-600 hover:bg-green-700 cursor-pointer"
                  disabled={!isEditable}
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
                  disabled={!isEditable}
                  className="cursor-pointer"
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
                          dark:border dark:border-gray-600
                          data-[state=checked]:dark:border-transparent
                          cursor-pointer
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
                              dark:border dark:border-gray-600
                              data-[state=checked]:dark:border-transparent
                              cursor-pointer
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
                              className="h-5 w-5 dark:border dark:border-gray-600 data-[state=checked]:dark:border-transparent cursor-pointer"
                              disabled={!isEditable}
                            />
                          </div>
                        </TableCell>
                        {sesion.APLICA_EXAMEN && (
                          <TableCell className="text-center">
                            {asistio === true ? (
                              isEditable ? (
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
                                    className="w-full h-8 px-2 rounded hover:bg-muted flex items-center justify-center cursor-pointer"
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
                              <div className="flex items-center justify-center gap-2">
                                <Button
                                  size="sm"
                                  variant={tieneExamen ? "default" : "ghost"}
                                  onClick={() => handleOpenUploadModal("examen", col.ID_COLABORADOR, col.NOMBRE_COMPLETO)}
                                  className={`cursor-pointer ${tieneExamen ? "bg-green-600 dark:bg-green-800 hover:bg-green-700 dark:hover:bg-green-700" : "border hover:bg-green-50"}`}
                                  disabled={!isEditable}
                                >
                                  {tieneExamen ? (
                                    <>
                                      <FileText className="h-3 w-3 mr-1" />
                                      <span>Ver</span>
                                    </>
                                  ) : (
                                    <>
                                      <Upload className="h-3 w-3 mr-1" />
                                      <span>Subir</span>
                                    </>
                                  )}
                                </Button>
                                {isEditable && tieneExamen && (
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={(e) => {
                                      e.stopPropagation()
                                      onEliminarDocumento("examen", col.ID_COLABORADOR)
                                    }}
                                    className="h-8 w-8 p-0 hover:bg-red-100 hover:text-red-600 border-0 bg-transparent cursor-pointer"
                                  >
                                    <XCircle className="h-4 w-4" />
                                  </Button>
                                )}
                              </div>
                            ) : (
                              <span className="text-muted-foreground">-</span>
                            )}
                          </TableCell>
                        )}
                        {sesion.APLICA_DIPLOMA && (
                          <TableCell className="text-center">
                            {asistio === true ? (
                              <div className="flex items-center justify-center gap-2">
                                <Button
                                  size="sm"
                                  variant={tieneDiploma ? "default" : "ghost"}
                                  onClick={() => handleOpenUploadModal("diploma", col.ID_COLABORADOR, col.NOMBRE_COMPLETO)}
                                  className={`cursor-pointer ${tieneDiploma ? "bg-purple-600 dark:bg-purple-800 hover:bg-purple-700 dark:hover:bg-purple-700" : "border hover:bg-purple-50"}`}
                                  disabled={!isEditable}
                                >
                                  {tieneDiploma ? (
                                    <>
                                      <Award className="h-3 w-3 mr-1" />
                                      <span>Ver</span>
                                    </>
                                  ) : (
                                    <>
                                      <Upload className="h-3 w-3 mr-1" />
                                      <span>Subir</span>
                                    </>
                                  )}
                                </Button>
                                {isEditable && tieneDiploma && (
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={(e) => {
                                      e.stopPropagation()
                                      onEliminarDocumento("diploma", col.ID_COLABORADOR)
                                    }}
                                    className="h-8 w-8 p-0 hover:bg-red-100 hover:text-red-600 border-0 bg-transparent cursor-pointer"
                                  >
                                    <XCircle className="h-4 w-4" />
                                  </Button>
                                )}
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
                    <li>Usa los botones de Subir/Ver para gestionar exámenes y diplomas</li>
                    <li>Puedes arrastrar y soltar archivos PDF en el modal de carga</li>
                    <li>El estado se actualiza automáticamente según asistencia y nota</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </CardContent>
      </Card>

      <UploadFileModal
        isOpen={uploadModalState.isOpen}
        onClose={handleCloseUploadModal}
        onUpload={handleUploadFile}
        title={`Subir ${uploadModalState.tipo === "examen" ? "Examen" : "Diploma"}`}
        description={`Arrastra y suelta o selecciona el archivo PDF ${
          uploadModalState.tipo === "examen" ? "del examen" : "del diploma"
        } para ${uploadModalState.colaboradorNombre}`}
        acceptedFileTypes=".pdf"
        maxSize={30}
        currentFileName={uploadModalState.currentFileName}
        currentFile={uploadModalState.currentFile}
        currentFileUrl={uploadModalState.currentFileUrl}
        onDownloadFile={uploadModalState.onDownloadFile || undefined}
      />
    </>
  )
}
