"use client"

import { useState, useCallback, memo } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { 
  Plus, 
  Trash2, 
  MoveUp, 
  MoveDown, 
  Info, 
  Save, 
  FileText,
  GripVertical,
  ListOrdered,
  FileQuestion,
  CheckSquare,
  AlertCircle
} from "lucide-react"
import type { SESION_DETALLE } from "@/lib/mis-capacitaciones/capacitaciones-types"
import type { TipoPregunta, Question, Serie, OpcionMultiple } from "@/lib/mis-capacitaciones/capacitaciones-types"

interface ExamTabProps {
  sesion: SESION_DETALLE
  onSavePlantilla: (plantilla: { series: Serie[] }) => Promise<void>
  plantillaInicial?: { series: Serie[] }
}

const NUMEROS_ROMANOS = ["I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X"]
const OPCIONES_LETRAS = ["A", "B", "C", "D", "E", "F", "G"]

const TIPO_PREGUNTA_CONFIG = {
  OPEN: {
    label: "Pregunta Abierta",
    icon: FileQuestion,
    color: "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300",
    description: "Respuesta corta en líneas"
  },
  MULTIPLE_CHOICE: {
    label: "Opción Múltiple",
    icon: CheckSquare,
    color: "bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300",
    description: "Selección entre opciones"
  },
  ESSAY: {
    label: "Ensayo",
    icon: FileText,
    color: "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300",
    description: "Respuesta extensa"
  }
}

interface OpcionItemProps {
  opcion: OpcionMultiple
  opcionIndex: number
  canDelete: boolean
  isEditable: boolean
  onUpdate: (index: number, text: string) => void
  onDelete: (index: number) => void
}

const OpcionItem = memo(({ opcion, opcionIndex, canDelete, isEditable, onUpdate, onDelete }: OpcionItemProps) => {
  return (
    <div className="flex gap-2 items-center group">
      <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-gray-100 dark:bg-gray-800 font-bold text-sm">
        {opcion.label}
      </div>
      <Input
        placeholder={`Escriba la opción ${opcion.label}`}
        defaultValue={opcion.text}
        onChange={(e) => onUpdate(opcionIndex, e.target.value)}
        disabled={!isEditable}
        className="flex-1"
      />
      {isEditable && canDelete && (
        <Button
          size="sm"
          variant="ghost"
          onClick={() => onDelete(opcionIndex)}
          className="opacity-0 group-hover:opacity-100 transition-opacity text-red-500 hover:text-red-700"
        >
          <Trash2 className="w-4 h-4" />
        </Button>
      )}
    </div>
  )
})

OpcionItem.displayName = 'OpcionItem'

interface PreguntaItemProps {
  pregunta: Question
  preguntaIndex: number
  serieIndex: number
  isEditable: boolean
  onUpdate: (serieIndex: number, preguntaIndex: number, campo: keyof Question, valor: Question[keyof Question]) => void
  onDelete: (serieIndex: number, preguntaIndex: number) => void
  onAgregarOpcion: (serieIndex: number, preguntaIndex: number) => void
  onEliminarOpcion: (serieIndex: number, preguntaIndex: number, opcionIndex: number) => void
  onActualizarOpcion: (serieIndex: number, preguntaIndex: number, opcionIndex: number, texto: string) => void
}

const PreguntaItem = memo(({ 
  pregunta, 
  preguntaIndex, 
  serieIndex, 
  isEditable,
  onUpdate,
  onDelete,
  onAgregarOpcion,
  onEliminarOpcion,
  onActualizarOpcion
}: PreguntaItemProps) => {
  const config = TIPO_PREGUNTA_CONFIG[pregunta.type]
  const Icon = config.icon

  return (
    <Card className="border-l-4 border-l-gray-300 dark:border-l-gray-600">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${config.color}`}>
              <Icon className="w-4 h-4" />
            </div>
            <div>
              <div className="font-semibold">Pregunta {preguntaIndex + 1}</div>
              <div className="text-xs text-muted-foreground">{config.description}</div>
            </div>
          </div>
          {isEditable && (
            <Button
              size="sm"
              variant="ghost"
              onClick={() => onDelete(serieIndex, preguntaIndex)}
              className="text-red-500 hover:text-red-700 hover:bg-red-50"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Texto de la Pregunta */}
        <div>
          <Label className="text-sm font-medium">Texto de la pregunta</Label>
          <Textarea
            placeholder="Escriba aquí el enunciado de la pregunta..."
            defaultValue={pregunta.question}
            onChange={(e) => onUpdate(serieIndex, preguntaIndex, "question", e.target.value)}
            disabled={!isEditable}
            className="mt-2"
            rows={2}
          />
        </div>

        {(pregunta.type === "OPEN" || pregunta.type === "ESSAY") && (
          <div>
            <Label className="text-sm font-medium">Líneas para respuesta</Label>
            <p className="text-xs text-muted-foreground mb-2">
              Número de líneas que tendrá la persona para responder
            </p>
            <Input
              type="number"
              min="1"
              max="20"
              defaultValue={pregunta.lines || 3}
              onChange={(e) => onUpdate(serieIndex, preguntaIndex, "lines", parseInt(e.target.value) || 3)}
              disabled={!isEditable}
              className="w-32"
            />
          </div>
        )}

        {pregunta.type === "MULTIPLE_CHOICE" && (
          <div className="space-y-3">
            <Label className="text-sm font-medium">Opciones de respuesta</Label>
            <div className="space-y-2">
              {pregunta.options?.map((opcion, opcionIndex) => (
                <OpcionItem
                  key={`${serieIndex}-${preguntaIndex}-${opcionIndex}`}
                  opcion={opcion}
                  opcionIndex={opcionIndex}
                  canDelete={pregunta.options!.length > 2}
                  isEditable={isEditable}
                  onUpdate={(idx, text) => onActualizarOpcion(serieIndex, preguntaIndex, idx, text)}
                  onDelete={(idx) => onEliminarOpcion(serieIndex, preguntaIndex, idx)}
                />
              ))}
            </div>
            {isEditable && pregunta.options && pregunta.options.length < 7 && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => onAgregarOpcion(serieIndex, preguntaIndex)}
                className="w-full cursor-pointer"
              >
                <Plus className="w-4 h-4 mr-2" />
                Agregar Opción
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
})

PreguntaItem.displayName = 'PreguntaItem'

export function ExamTab({ sesion, onSavePlantilla, plantillaInicial }: ExamTabProps) {
  const [series, setSeries] = useState<Serie[]>(
    plantillaInicial?.series || []
  )
  const [isSaving, setIsSaving] = useState(false)
  const [expandedSeries, setExpandedSeries] = useState<Set<number>>(new Set(series.map((_, i) => i)))

  const isEditable = sesion.ESTADO === "EN_PROCESO" || sesion.ESTADO === "PROGRAMADA"

  const toggleSerie = useCallback((index: number) => {
    setExpandedSeries(prev => {
      const newExpanded = new Set(prev)
      if (newExpanded.has(index)) {
        newExpanded.delete(index)
      } else {
        newExpanded.add(index)
      }
      return newExpanded
    })
  }, [])

  const agregarSerie = useCallback(() => {
    setSeries(prev => {
      const nuevoNumero = prev.length + 1
      const nuevaSerie: Serie = {
        numero: nuevoNumero,
        title: `${NUMEROS_ROMANOS[nuevoNumero - 1] || nuevoNumero} SERIE`,
        instructions: "",
        questions: []
      }
      return [...prev, nuevaSerie]
    })
    setExpandedSeries(prev => new Set([...prev, series.length]))
  }, [series.length])

  const eliminarSerie = useCallback((index: number) => {
    setSeries(prev => {
      const nuevasSeries = prev.filter((_, i) => i !== index)
      return nuevasSeries.map((s, i) => ({
        ...s,
        numero: i + 1,
        title: `${NUMEROS_ROMANOS[i] || i + 1} SERIE`
      }))
    })
    
    setExpandedSeries(prev => {
      const newExpanded = new Set(prev)
      newExpanded.delete(index)
      return newExpanded
    })
  }, [])

  const moverSerie = useCallback((index: number, direccion: "up" | "down") => {
    if (
      (direccion === "up" && index === 0) ||
      (direccion === "down" && index === series.length - 1)
    ) {
      return
    }

    setSeries(prev => {
      const nuevasSeries = [...prev]
      const newIndex = direccion === "up" ? index - 1 : index + 1
      ;[nuevasSeries[index], nuevasSeries[newIndex]] = [nuevasSeries[newIndex], nuevasSeries[index]]

      return nuevasSeries.map((s, i) => ({
        ...s,
        numero: i + 1,
        title: `${NUMEROS_ROMANOS[i] || i + 1} SERIE`
      }))
    })
  }, [series.length])

  const actualizarInstrucciones = useCallback((index: number, instrucciones: string) => {
    setSeries(prev => {
      const nuevasSeries = [...prev]
      nuevasSeries[index] = { ...nuevasSeries[index], instructions: instrucciones }
      return nuevasSeries
    })
  }, [])

  const agregarPregunta = useCallback((serieIndex: number, type: TipoPregunta) => {
    setSeries(prev => {
      const nuevasSeries = [...prev]
      const nuevaPregunta: Question = {
        type,
        question: "",
        ...(type === "OPEN" || type === "ESSAY" ? { lines: 3 } : {}),
        ...(type === "MULTIPLE_CHOICE" ? { options: [
          { label: "A", text: "" },
          { label: "B", text: "" }
        ]} : {})
      }
      nuevasSeries[serieIndex] = {
        ...nuevasSeries[serieIndex],
        questions: [...nuevasSeries[serieIndex].questions, nuevaPregunta]
      }
      return nuevasSeries
    })
  }, [])

  const eliminarPregunta = useCallback((serieIndex: number, preguntaIndex: number) => {
    setSeries(prev => {
      const nuevasSeries = [...prev]
      nuevasSeries[serieIndex] = {
        ...nuevasSeries[serieIndex],
        questions: nuevasSeries[serieIndex].questions.filter((_, i) => i !== preguntaIndex)
      }
      return nuevasSeries
    })
  }, [])

  const actualizarPregunta = useCallback((serieIndex: number, preguntaIndex: number, campo: keyof Question, valor: Question[keyof Question]) => {
    setSeries(prev => {
      const nuevasSeries = [...prev]
      const preguntaActual = nuevasSeries[serieIndex].questions[preguntaIndex]
      nuevasSeries[serieIndex] = {
        ...nuevasSeries[serieIndex],
        questions: nuevasSeries[serieIndex].questions.map((p, i) => 
          i === preguntaIndex ? { ...preguntaActual, [campo]: valor } as Question : p
        )
      }
      return nuevasSeries
    })
  }, [])

  const agregarOpcion = useCallback((serieIndex: number, preguntaIndex: number) => {
    setSeries(prev => {
      const nuevasSeries = [...prev]
      const pregunta = nuevasSeries[serieIndex].questions[preguntaIndex]
      if (pregunta.options && pregunta.options.length < 7) {
        const nuevaLetra = OPCIONES_LETRAS[pregunta.options.length]
        nuevasSeries[serieIndex] = {
          ...nuevasSeries[serieIndex],
          questions: nuevasSeries[serieIndex].questions.map((p, i) => 
            i === preguntaIndex 
              ? { ...p, options: [...(p.options || []), { label: nuevaLetra, text: "" }] }
              : p
          )
        }
      }
      return nuevasSeries
    })
  }, [])

  const eliminarOpcion = useCallback((serieIndex: number, preguntaIndex: number, opcionIndex: number) => {
    setSeries(prev => {
      const nuevasSeries = [...prev]
      const pregunta = nuevasSeries[serieIndex].questions[preguntaIndex]
      if (pregunta.options && pregunta.options.length > 2) {
        const nuevasOpciones = pregunta.options.filter((_, i) => i !== opcionIndex)
        const opcionesRenumeradas = nuevasOpciones.map((op, i) => ({
          ...op,
          label: OPCIONES_LETRAS[i]
        }))
        
        nuevasSeries[serieIndex] = {
          ...nuevasSeries[serieIndex],
          questions: nuevasSeries[serieIndex].questions.map((p, i) => 
            i === preguntaIndex 
              ? { ...p, options: opcionesRenumeradas }
              : p
          )
        }
      }
      return nuevasSeries
    })
  }, [])

  const actualizarOpcion = useCallback((serieIndex: number, preguntaIndex: number, opcionIndex: number, texto: string) => {
    setSeries(prev => {
      const nuevasSeries = [...prev]
      const pregunta = nuevasSeries[serieIndex].questions[preguntaIndex]
      if (pregunta.options) {
        nuevasSeries[serieIndex] = {
          ...nuevasSeries[serieIndex],
          questions: nuevasSeries[serieIndex].questions.map((p, i) => 
            i === preguntaIndex 
              ? { 
                  ...p, 
                  options: p.options?.map((op, idx) => 
                    idx === opcionIndex ? { ...op, text: texto } : op
                  )
                }
              : p
          )
        }
      }
      return nuevasSeries
    })
  }, [])

  const handleGuardar = useCallback(async () => {
    setIsSaving(true)
    try {
      await onSavePlantilla({ series })
    } catch (error) {
      console.error("Error al guardar plantilla:", error)
    } finally {
      setIsSaving(false)
    }
  }, [series, onSavePlantilla])

  const totalPreguntas = series.reduce((acc, serie) => acc + serie.questions.length, 0)

  return (
    <div className="space-y-6">
      <Card className="border-l-4 border-l-green-500">
        <CardHeader>
          <div className="flex items-start justify-between flex-wrap gap-4">
            <div className="space-y-1">
              <CardTitle className="text-2xl flex items-center gap-2">
                <FileText className="w-6 h-6 text-green-600" />
                Plantilla de Examen
              </CardTitle>
              <CardDescription>
                Diseña la estructura del examen para esta capacitación
              </CardDescription>
            </div>
            {isEditable && series.length > 0 && (
              <Button 
                onClick={handleGuardar} 
                disabled={isSaving} 
                size="lg"
                className="cursor-pointer"
              >
                <Save className="w-4 h-4 mr-2" />
                {isSaving ? "Guardando..." : "Guardar Plantilla"}
              </Button>
            )}
          </div>

          {series.length > 0 && (
            <div className="flex gap-4 mt-4">
              <Badge variant="outline" className="text-base">
                <ListOrdered className="w-4 h-4 mr-1" />
                {series.length} {series.length === 1 ? 'Serie' : 'Series'}
              </Badge>
              <Badge variant="outline" className="text-base">
                <FileQuestion className="w-4 h-4 mr-1" />
                {totalPreguntas} {totalPreguntas === 1 ? 'Pregunta' : 'Preguntas'}
              </Badge>
            </div>
          )}
        </CardHeader>
      </Card>

      {/* Guía de uso */}
      <Alert className="border-l-4 border-blue-500">
        <Info className="w-5 h-5 text-blue-600" />
        <AlertDescription>
          <p className="font-semibold mb-2 text-blue-900 dark:text-blue-100">
            Guía Rápida
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
            <div className="flex items-start gap-2">
              <span className="text-blue-600 font-bold">1.</span>
              <span>Organiza el examen en series numeradas</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-blue-600 font-bold">2.</span>
              <span>Define instrucciones y puntaje por serie</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-blue-600 font-bold">3.</span>
              <span>Agrega preguntas de diferentes tipos</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-blue-600 font-bold">4.</span>
              <span>Personaliza líneas para respuestas</span>
            </div>
          </div>
        </AlertDescription>
      </Alert>

      {isEditable && (
        <Button 
          onClick={agregarSerie} 
          variant="outline" 
          className="w-full h-16 text-base cursor-pointer border-2 border-dashed hover:border-solid hover:bg-accent dark:hover:text-foreground"
        >
          <Plus className="w-5 h-5 mr-2" />
          Agregar Nueva Serie
        </Button>
      )}

      {series.length === 0 ? (
        <Card className="border-2 border-dashed">
          <CardContent className="py-16">
            <div className="text-center space-y-3">
              <div className="flex justify-center">
                <div className="p-4 bg-gray-100 dark:bg-gray-800 rounded-full">
                  <FileText className="w-12 h-12 text-gray-400" />
                </div>
              </div>
              <h3 className="text-xl font-semibold text-muted-foreground">
                No hay series creadas
              </h3>
              <p className="text-sm text-muted-foreground max-w-md mx-auto">
                Comienza creando una serie para estructurar tu examen. Cada serie puede contener múltiples preguntas de diferentes tipos.
              </p>
              {isEditable && (
                <Button onClick={agregarSerie} size="lg" className="mt-4 cursor-pointer">
                  <Plus className="w-4 h-4 mr-2" />
                  Crear Primera Serie
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {series.map((serie, serieIndex) => (
            <Card key={serieIndex} className="border-2 overflow-hidden gap-0">
              <div 
                className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 p-4 cursor-pointer hover:from-gray-100 hover:to-gray-200 dark:hover:from-gray-800 dark:hover:to-gray-700 transition-colors"
                onClick={() => toggleSerie(serieIndex)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <GripVertical className="w-5 h-5 text-gray-400" />
                    <div>
                      <h3 className="text-lg font-bold flex items-center gap-2">
                        {serie.title}
                        <Badge variant="default" className="ml-2">
                          {serie.questions.length} {serie.questions.length === 1 ? 'pregunta' : 'preguntas'}
                        </Badge>
                      </h3>
                      {serie.instructions && (
                        <p className="text-sm text-muted-foreground mt-1 line-clamp-1">
                          {serie.instructions}
                        </p>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    {isEditable && (
                      <>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={(e) => {
                            e.stopPropagation()
                            moverSerie(serieIndex, "up")
                          }}
                          disabled={serieIndex === 0}
                          title="Mover arriba"
                        >
                          <MoveUp className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={(e) => {
                            e.stopPropagation()
                            moverSerie(serieIndex, "down")
                          }}
                          disabled={serieIndex === series.length - 1}
                          title="Mover abajo"
                        >
                          <MoveDown className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={(e) => {
                            e.stopPropagation()
                            eliminarSerie(serieIndex)
                          }}
                          className="text-red-500 hover:text-red-700 hover:bg-red-50"
                          title="Eliminar serie"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {expandedSeries.has(serieIndex) && (
                <CardContent className="px-6 py-4 space-y-4">
                  <div>
                    <Label htmlFor={`instrucciones-${serieIndex}`} className="text-base font-semibold flex items-center gap-2">
                      <AlertCircle className="w-4 h-4" />
                      Instrucciones de la Serie
                      <span className="text-red-500">*</span>
                    </Label>
                    <p className="text-xs text-muted-foreground mb-2">
                      Proporciona instrucciones claras y el puntaje para cada pregunta
                    </p>
                    <Textarea
                      id={`instrucciones-${serieIndex}`}
                      placeholder="Ejemplo: Responda en las líneas proporcionadas. Cada pregunta vale 10 puntos. Total: 30 puntos."
                      defaultValue={serie.instructions}
                      onChange={(e) => actualizarInstrucciones(serieIndex, e.target.value)}
                      disabled={!isEditable}
                      className="mt-1 min-h-[80px]"
                      rows={3}
                    />
                  </div>

                  <Separator />

                  {/* Preguntas */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <Label className="text-base font-semibold">Preguntas</Label>
                      {serie.questions.length === 0 && (
                        <Badge variant="outline">Sin preguntas</Badge>
                      )}
                    </div>

                    {serie.questions.map((pregunta, preguntaIndex) => (
                      <PreguntaItem
                        key={`${serieIndex}-${preguntaIndex}`}
                        pregunta={pregunta}
                        preguntaIndex={preguntaIndex}
                        serieIndex={serieIndex}
                        isEditable={isEditable}
                        onUpdate={actualizarPregunta}
                        onDelete={eliminarPregunta}
                        onAgregarOpcion={agregarOpcion}
                        onEliminarOpcion={eliminarOpcion}
                        onActualizarOpcion={actualizarOpcion}
                      />
                    ))}
                  </div>

                  {/* Botones para Agregar Preguntas */}
                  {isEditable && (
                    <div className="pt-4">
                      <Label className="text-sm font-medium mb-3 block">Agregar Pregunta</Label>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        <Button
                          variant="outline"
                          onClick={() => agregarPregunta(serieIndex, "OPEN")}
                          className="h-auto py-4 cursor-pointer hover:bg-blue-50 dark:hover:bg-blue-950"
                        >
                          <div className="flex flex-col items-center gap-2">
                            <FileQuestion className="w-5 h-5 text-blue-600" />
                            <div className="text-center">
                              <div className="font-semibold">Pregunta Abierta</div>
                              <div className="text-xs text-muted-foreground">Respuesta corta</div>
                            </div>
                          </div>
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() => agregarPregunta(serieIndex, "MULTIPLE_CHOICE")}
                          className="h-auto py-4 cursor-pointer hover:bg-purple-50 dark:hover:bg-purple-950"
                        >
                          <div className="flex flex-col items-center gap-2">
                            <CheckSquare className="w-5 h-5 text-purple-600" />
                            <div className="text-center">
                              <div className="font-semibold">Opción Múltiple</div>
                              <div className="text-xs text-muted-foreground">Selección única</div>
                            </div>
                          </div>
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() => agregarPregunta(serieIndex, "ESSAY")}
                          className="h-auto py-4 cursor-pointer hover:bg-green-50 dark:hover:bg-green-950"
                        >
                          <div className="flex flex-col items-center gap-2">
                            <FileText className="w-5 h-5 text-green-600" />
                            <div className="text-center">
                              <div className="font-semibold">Ensayo</div>
                              <div className="text-xs text-muted-foreground">Respuesta extensa</div>
                            </div>
                          </div>
                        </Button>
                      </div>
                    </div>
                  )}
                </CardContent>
              )}
            </Card>
          ))}
        </div>
      )}

      {/* Mensaje cuando no es editable */}
      {!isEditable && series.length > 0 && (
        <Alert className="border-l-4 border-orange-500">
          <AlertCircle className="w-5 h-5 text-orange-600" />
          <AlertDescription className="text-orange-900 dark:text-orange-100">
            <p className="font-semibold">Modo de Solo Lectura</p>
            <p className="text-sm mt-1">
              La plantilla solo puede editarse cuando la sesión está en estado Programada o En Proceso.
            </p>
          </AlertDescription>
        </Alert>
      )}
    </div>
  )
}
