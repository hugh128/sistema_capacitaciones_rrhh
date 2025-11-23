"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Plus, Trash2, MoveUp, MoveDown, Info, Save, FileText } from "lucide-react"
import type { SESION_DETALLE } from "./capacitaciones-types"
import type { TipoPregunta, Question, Serie } from "./capacitaciones-types"

interface ExamTabProps {
  sesion: SESION_DETALLE
  onSavePlantilla: (plantilla: { series: Serie[] }) => Promise<void>
  plantillaInicial?: { series: Serie[] }
}

const NUMEROS_ROMANOS = ["I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X"]
const OPCIONES_LETRAS = ["A", "B", "C", "D", "E", "F", "G"]

export function ExamTab({ sesion, onSavePlantilla, plantillaInicial }: ExamTabProps) {
  const [series, setSeries] = useState<Serie[]>(
    plantillaInicial?.series || []
  )
  const [isSaving, setIsSaving] = useState(false)

  const isEditable = sesion.ESTADO === "EN_PROCESO" || sesion.ESTADO === "PROGRAMADA"

  const agregarSerie = () => {
    const nuevoNumero = series.length + 1
    const nuevaSerie: Serie = {
      numero: nuevoNumero,
      title: `${NUMEROS_ROMANOS[nuevoNumero - 1] || nuevoNumero} SERIE`,
      instructions: "",
      questions: []
    }
    setSeries([...series, nuevaSerie])
  }

  const eliminarSerie = (index: number) => {
    const nuevasSeries = series.filter((_, i) => i !== index)
    // Renumerar series
    const seriesRenumeradas = nuevasSeries.map((s, i) => ({
      ...s,
      numero: i + 1,
      titulo: `${NUMEROS_ROMANOS[i] || i + 1} SERIE`
    }))
    setSeries(seriesRenumeradas)
  }

  const moverSerie = (index: number, direccion: "up" | "down") => {
    if (
      (direccion === "up" && index === 0) ||
      (direccion === "down" && index === series.length - 1)
    ) {
      return
    }

    const nuevasSeries = [...series]
    const newIndex = direccion === "up" ? index - 1 : index + 1
    ;[nuevasSeries[index], nuevasSeries[newIndex]] = [nuevasSeries[newIndex], nuevasSeries[index]]

    // Renumerar
    const seriesRenumeradas = nuevasSeries.map((s, i) => ({
      ...s,
      numero: i + 1,
      titulo: `${NUMEROS_ROMANOS[i] || i + 1} SERIE`
    }))
    setSeries(seriesRenumeradas)
  }

  const actualizarInstrucciones = (index: number, instrucciones: string) => {
    const nuevasSeries = [...series]
    nuevasSeries[index].instructions = instrucciones
    setSeries(nuevasSeries)
  }

  const agregarPregunta = (serieIndex: number, type: TipoPregunta) => {
    const nuevasSeries = [...series]
    const nuevaPregunta: Question = {
      type,
      question: "",
      ...(type === "OPEN" || type === "ESSAY" ? { lineas: 3 } : {}),
      ...(type === "MULTIPLE_CHOICE" ? { options: [
        { label: "A", text: "" },
        { label: "B", text: "" }
      ]} : {})
    }
    nuevasSeries[serieIndex].questions.push(nuevaPregunta)
    setSeries(nuevasSeries)
  }

  const eliminarPregunta = (serieIndex: number, preguntaIndex: number) => {
    const nuevasSeries = [...series]
    nuevasSeries[serieIndex].questions.splice(preguntaIndex, 1)
    setSeries(nuevasSeries)
  }

  const actualizarPregunta = (serieIndex: number, preguntaIndex: number, campo: keyof Question, valor: Question[keyof Question]) => {
    const nuevasSeries = [...series]
    const preguntaActual = nuevasSeries[serieIndex].questions[preguntaIndex]
    nuevasSeries[serieIndex].questions[preguntaIndex] = {
      ...preguntaActual,
      [campo]: valor
    } as Question
    setSeries(nuevasSeries)
  }

  const agregarOpcion = (serieIndex: number, preguntaIndex: number) => {
    const nuevasSeries = [...series]
    const pregunta = nuevasSeries[serieIndex].questions[preguntaIndex]
    if (pregunta.options && pregunta.options.length < 6) {
      const nuevaLetra = OPCIONES_LETRAS[pregunta.options.length]
      pregunta.options.push({ label: nuevaLetra, text: "" })
      setSeries(nuevasSeries)
    }
  }

  const eliminarOpcion = (serieIndex: number, preguntaIndex: number, opcionIndex: number) => {
    const nuevasSeries = [...series]
    const pregunta = nuevasSeries[serieIndex].questions[preguntaIndex]
    if (pregunta.options && pregunta.options.length > 2) {
      pregunta.options.splice(opcionIndex, 1)
      // Renumerar letras
      pregunta.options = pregunta.options.map((op, i) => ({
        ...op,
        label: OPCIONES_LETRAS[i]
      }))
      setSeries(nuevasSeries)
    }
  }

  const actualizarOpcion = (serieIndex: number, preguntaIndex: number, opcionIndex: number, texto: string) => {
    const nuevasSeries = [...series]
    const pregunta = nuevasSeries[serieIndex].questions[preguntaIndex]
    if (pregunta.options) {
      pregunta.options[opcionIndex].text = texto
      setSeries(nuevasSeries)
    }
  }

  const handleGuardar = async () => {
    setIsSaving(true)
    try {
      console.log({series})
      await onSavePlantilla({ series })
    } catch (error) {
      console.error("Error al guardar plantilla:", error)
    } finally {
      setIsSaving(false)
    }
  }

  const getTipoPreguntaLabel = (tipo: TipoPregunta) => {
    switch (tipo) {
      case "OPEN": return "Pregunta Abierta"
      case "MULTIPLE_CHOICE": return "Opción Múltiple"
      case "ESSAY": return "Ensayo"
    }
  }

  return (
    <Card className="shadow-sm">
      <CardHeader className="bg-gradient-to-r from-green-50 to-teal-50 dark:from-green-950/20 dark:to-teal-950/20">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-xl">Plantilla de Examen</CardTitle>
            <CardDescription>
              Crea y gestiona la estructura del examen para la capacitación.
            </CardDescription>
          </div>
          {isEditable && (
            <Button onClick={handleGuardar} disabled={isSaving || series.length === 0} className="cursor-pointer">
              <Save className="w-4 h-4 mr-2" />
              {isSaving ? "Guardando..." : "Guardar Plantilla"}
            </Button>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-6 pt-6">
        {/* Información General */}
        <Alert className="border-l-4 border-blue-500 bg-blue-50 dark:bg-blue-950/20">
          <Info className="w-4 h-4 text-blue-600" />
          <AlertDescription>
            <p className="font-semibold mb-2 text-blue-700 dark:text-blue-300">
              Instrucciones para crear el examen:
            </p>
            <ul className="text-sm space-y-1 list-disc list-inside text-gray-700 dark:text-gray-300">
              <li>Organiza el examen en series (I SERIE, II SERIE, etc.)</li>
              <li><strong>Instrucciones:</strong> Brinda instrucciones para cada serie e indica el punteo de cada pregunta</li>
              <li>Puedes agregar preguntas abiertas, de opción múltiple y de ensayo</li>
              <li>Define el número de líneas para respuestas abiertas y ensayos (por defecto 3)</li>
            </ul>
          </AlertDescription>
        </Alert>

        {/* Botón Agregar Serie */}
        {isEditable && (
          <Button onClick={agregarSerie} variant="outline" className="w-full cursor-pointer">
            <Plus className="w-4 h-4 mr-2" />
            Agregar Serie
          </Button>
        )}

        {/* Lista de Series */}
        {series.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <FileText className="w-16 h-16 mx-auto mb-4 opacity-50" />
            <p className="text-lg">No hay series creadas</p>
            <p className="text-sm">Haz clic en Agregar Serie para comenzar</p>
          </div>
        ) : (
          <div className="space-y-6">
            {series.map((serie, serieIndex) => (
              <Card key={serieIndex} className="border-2 gap-4">
                <CardHeader className="bg-gray-50 dark:bg-gray-900/50">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{serie.title}</CardTitle>
                    {isEditable && (
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => moverSerie(serieIndex, "up")}
                          disabled={serieIndex === 0}
                        >
                          <MoveUp className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => moverSerie(serieIndex, "down")}
                          disabled={serieIndex === series.length - 1}
                        >
                          <MoveDown className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => eliminarSerie(serieIndex)}
                        >
                          <Trash2 className="w-4 h-4 text-red-500" />
                        </Button>
                      </div>
                    )}
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  {/* Instrucciones de la Serie */}
                  <div>
                    <Label htmlFor={`instrucciones-${serieIndex}`}>
                      Instrucciones de la serie <span className="text-red-500">*</span>
                    </Label>
                    <Textarea
                      id={`instrucciones-${serieIndex}`}
                      placeholder="Ej: Responda en las líneas proporcionadas. Cada pregunta vale 10 puntos."
                      value={serie.instructions}
                      onChange={(e) => actualizarInstrucciones(serieIndex, e.target.value)}
                      disabled={!isEditable}
                      className="mt-1"
                      rows={2}
                    />
                  </div>

                  {/* Preguntas */}
                  <div className="space-y-4">
                    {serie.questions.map((pregunta, preguntaIndex) => (
                      <Card key={preguntaIndex} className="bg-white dark:bg-gray-950 gap-2">
                        <CardHeader className="">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <span className="font-semibold">Pregunta {preguntaIndex + 1}</span>
                              <span className="text-xs bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 px-2 py-1 rounded">
                                {getTipoPreguntaLabel(pregunta.type)}
                              </span>
                            </div>
                            {isEditable && (
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => eliminarPregunta(serieIndex, preguntaIndex)}
                              >
                                <Trash2 className="w-4 h-4 text-red-500" />
                              </Button>
                            )}
                          </div>
                        </CardHeader>

                        <CardContent className="space-y-3">
                          {/* Texto de la Pregunta */}
                          <div>
                            <Label>Pregunta</Label>
                            <Textarea
                              placeholder="Escriba la pregunta aquí..."
                              value={pregunta.question}
                              onChange={(e) => actualizarPregunta(serieIndex, preguntaIndex, "question", e.target.value)}
                              disabled={!isEditable}
                              className="mt-1"
                              rows={2}
                            />
                          </div>

                          {/* Líneas (para OPEN y ESSAY) */}
                          {(pregunta.type === "OPEN" || pregunta.type === "ESSAY") && (
                            <div>
                              <Label>Número de líneas para respuesta</Label>
                              <Input
                                type="number"
                                min="1"
                                max="20"
                                value={pregunta.lines || 3}
                                onChange={(e) => actualizarPregunta(serieIndex, preguntaIndex, "lines", parseInt(e.target.value) || 3)}
                                disabled={!isEditable}
                                className="mt-1 w-32"
                              />
                            </div>
                          )}

                          {/* Opciones (para MULTIPLE_CHOICE) */}
                          {pregunta.type === "MULTIPLE_CHOICE" && (
                            <div className="space-y-2">
                              <Label>Opciones de respuesta</Label>
                              {pregunta.options?.map((opcion, opcionIndex) => (
                                <div key={opcionIndex} className="flex gap-2 items-center">
                                  <span className="font-semibold w-8">{opcion.label})</span>
                                  <Input
                                    placeholder={`Opción ${opcion.label}`}
                                    value={opcion.text}
                                    onChange={(e) => actualizarOpcion(serieIndex, preguntaIndex, opcionIndex, e.target.value)}
                                    disabled={!isEditable}
                                    className="flex-1"
                                  />
                                  {isEditable && pregunta.options && pregunta.options.length > 2 && (
                                    <Button
                                      size="sm"
                                      variant="ghost"
                                      onClick={() => eliminarOpcion(serieIndex, preguntaIndex, opcionIndex)}
                                    >
                                      <Trash2 className="w-4 h-4 text-red-500" />
                                    </Button>
                                  )}
                                </div>
                              ))}
                              {isEditable && pregunta.options && pregunta.options.length < 6 && (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => agregarOpcion(serieIndex, preguntaIndex)}
                                  className="w-full"
                                >
                                  <Plus className="w-4 h-4 mr-2" />
                                  Agregar Opción
                                </Button>
                              )}
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    ))}
                  </div>

                  {/* Botones para Agregar Preguntas */}
                  {isEditable && (
                    <div className="flex gap-2 flex-wrap">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => agregarPregunta(serieIndex, "OPEN")}
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Pregunta Abierta
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => agregarPregunta(serieIndex, "MULTIPLE_CHOICE")}
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Opción Múltiple
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => agregarPregunta(serieIndex, "ESSAY")}
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Ensayo
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {!isEditable && (
          <Alert className="border-l-4 border-orange-500 bg-orange-50 dark:bg-orange-950/20">
            <Info className="w-4 h-4 text-orange-600" />
            <AlertDescription className="text-orange-700 dark:text-orange-300">
              Solo puedes editar la plantilla cuando la sesión está programada o en proceso.
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  )
}
