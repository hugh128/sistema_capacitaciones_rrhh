"use client"

import { memo, useState, useCallback } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Upload, FileText, X, CheckCircle2, Info, ClipboardList } from "lucide-react"
import { cn } from "@/lib/utils"

const formatFileSize = (bytes: number): string => {
  if (bytes < 1024 * 1024) {
    const kb = bytes / 1024
    return `${kb < 1 ? kb.toFixed(2) : kb.toFixed(1)} KB`
  }
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`
}

interface Props {
  file: File | null
  onFileSelect: (file: File) => void
  onFileRemove: () => void
}

export const ZonaListadoAsistencia = memo(function ZonaListadoAsistencia({
  file,
  onFileSelect,
  onFileRemove,
}: Props) {
  const [isDragging, setIsDragging] = useState(false)
  const [dragError, setDragError] = useState<string | null>(null)

  const validate = useCallback((f: File): boolean => {
    setDragError(null)
    if (f.type !== "application/pdf") {
      setDragError("Solo se permiten archivos PDF.")
      return false
    }
    if (f.size > 30 * 1024 * 1024) {
      setDragError("El archivo no puede superar 30 MB.")
      return false
    }
    return true
  }, [])

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault()
      setIsDragging(false)
      const dropped = e.dataTransfer.files[0]
      if (dropped && validate(dropped)) onFileSelect(dropped)
    },
    [validate, onFileSelect]
  )

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragging(false)
  }, [])

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-950/40">
            <ClipboardList className="h-4 w-4 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <CardTitle className="text-base">Lista de Asistencia</CardTitle>
            <CardDescription className="text-sm">
              PDF firmado con asistencia de los participantes (obligatorio)
            </CardDescription>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          className={cn(
            "border-2 border-dashed rounded-xl p-6 text-center transition-all duration-300",
            isDragging
              ? "border-primary bg-primary/5 scale-[1.01]"
              : "border-border hover:border-primary/50 dark:hover:border-primary/50",
          )}
        >
          {file ? (
            <div className="space-y-3">
              <CheckCircle2 className={cn(
                "w-10 h-10 mx-auto text-green-500 transition-transform",
                isDragging && "animate-bounce"
              )} />
              <div>
                <p className="font-medium text-sm text-foreground">
                  {isDragging ? "Suelta para reemplazar" : "Archivo seleccionado"}
                </p>
                <p
                  className="text-xs text-muted-foreground mt-1 px-2 break-all"
                  style={{ wordBreak: "break-word" }}
                >
                  {file.name}
                  <span className="ml-2 text-muted-foreground/70">
                    ({formatFileSize(file.size)})
                  </span>
                </p>
              </div>
              <div className="flex items-center justify-center gap-2">
                <label htmlFor="lista-asistencia-input" className="cursor-pointer">
                  <Button
                    variant="secondary"
                    size="sm"
                    asChild
                    className="hover:bg-muted dark:hover:bg-muted"
                  >
                    <span>
                      <Upload className="h-3.5 w-3.5 mr-1.5" />
                      Reemplazar
                    </span>
                  </Button>
                  <input
                    id="lista-asistencia-input"
                    type="file"
                    accept=".pdf"
                    className="hidden"
                    onChange={(e) => {
                      const f = e.target.files?.[0]
                      if (f && validate(f)) onFileSelect(f)
                      e.target.value = ""
                    }}
                  />
                </label>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onFileRemove}
                  className="text-destructive hover:text-destructive hover:bg-destructive/10"
                >
                  <X className="h-3.5 w-3.5 mr-1.5" />
                  Quitar
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <FileText className={cn(
                "w-10 h-10 mx-auto text-muted-foreground transition-transform",
                isDragging && "animate-bounce text-primary"
              )} />
              <div>
                <p className="font-medium text-sm text-foreground">
                  {isDragging ? "Suelta el archivo PDF aquí" : "Arrastra el PDF aquí"}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  o haz clic para seleccionar · máximo 30 MB
                </p>
              </div>
              <label htmlFor="lista-asistencia-input" className="cursor-pointer inline-block">
                <Button
                  variant="outline"
                  size="sm"
                  asChild
                  className={cn(
                    "border-border hover:border-primary/50",
                    "text-foreground hover:text-foreground",
                    "hover:bg-muted dark:hover:bg-muted",
                  )}
                >
                  <span>
                    <Upload className="h-3.5 w-3.5 mr-1.5" />
                    Seleccionar PDF
                  </span>
                </Button>
                <input
                  id="lista-asistencia-input"
                  type="file"
                  accept=".pdf"
                  className="hidden"
                  onChange={(e) => {
                    const f = e.target.files?.[0]
                    if (f && validate(f)) onFileSelect(f)
                    e.target.value = ""
                  }}
                />
              </label>
            </div>
          )}
        </div>

        {dragError && (
          <Alert variant="destructive" className="py-2">
            <Info className="h-4 w-4" />
            <AlertDescription className="text-sm">{dragError}</AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  )
})
