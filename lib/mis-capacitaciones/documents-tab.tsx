"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Upload, Download, Eye } from "lucide-react"
import type { Capacitacion } from "./capacitaciones-types"

interface DocumentsTabProps {
  capacitacion: Capacitacion
  stats: {
    total: number
    asistencias: number
    examenes: number
    diplomas: number
  }
  onSubirListaAsistencia: () => void
}

export function DocumentsTab({ capacitacion, stats, onSubirListaAsistencia }: DocumentsTabProps) {
  return (
    <Card className="shadow-sm">
      <CardHeader className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/20 dark:to-purple-950/20">
        <CardTitle className="text-xl">Documentos de la Capacitación</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6 pt-6">
        <Card className="border-2">
          <CardHeader>
            <CardTitle className="text-base">Lista de Asistencia General</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2">
              <Button variant="outline" className="flex-1 bg-transparent" onClick={onSubirListaAsistencia}>
                <Upload className="h-4 w-4 mr-2" />
                {capacitacion.URL_LISTA_ASISTENCIA ? "Reemplazar Lista" : "Subir Lista de Asistencia"}
              </Button>
              {capacitacion.URL_LISTA_ASISTENCIA && (
                <Button variant="outline">
                  <Eye className="h-4 w-4 mr-2" />
                  Ver
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="border-2">
          <CardHeader>
            <CardTitle className="text-base">Plantillas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <Button variant="outline">
                <Download className="h-4 w-4 mr-2" />
                Plantilla de Lista
              </Button>
              {capacitacion.APLICA_EXAMEN && (
                <Button variant="outline">
                  <Download className="h-4 w-4 mr-2" />
                  Plantilla de Examen
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="border-2">
          <CardHeader>
            <CardTitle className="text-base">Resumen de Documentos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
              <div className="text-center p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
                <p className="text-sm font-medium text-muted-foreground mb-1">Exámenes Subidos</p>
                <p className="text-4xl font-bold text-blue-600">
                  {stats.examenes} <span className="text-2xl text-muted-foreground">/ {stats.asistencias}</span>
                </p>
              </div>
              <div className="text-center p-4 bg-purple-50 dark:bg-purple-950/20 rounded-lg">
                <p className="text-sm font-medium text-muted-foreground mb-1">Diplomas Subidos</p>
                <p className="text-4xl font-bold text-purple-600">
                  {stats.diplomas} <span className="text-2xl text-muted-foreground">/ {stats.asistencias}</span>
                </p>
              </div>
            </div>
            <Button variant="outline" className="w-full bg-transparent">
              <Download className="h-4 w-4 mr-2" />
              Descargar Todos los Documentos (ZIP)
            </Button>
          </CardContent>
        </Card>
      </CardContent>
    </Card>
  )
}
