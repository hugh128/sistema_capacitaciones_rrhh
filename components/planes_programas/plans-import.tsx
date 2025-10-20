"use client"

import type React from "react"

import { useState } from "react"
import { ArrowLeft, Upload, FileSpreadsheet, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import type { TrainingPlan } from "../planes/training-plans-module"

interface PlansImportProps {
  onBack: () => void
  onImport: (plans: TrainingPlan[]) => void
}

export default function PlansImport({ onBack, onImport }: PlansImportProps) {
  const [file, setFile] = useState<File | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile) {
      const fileExtension = selectedFile.name.split(".").pop()?.toLowerCase()
      if (fileExtension === "csv" || fileExtension === "xlsx" || fileExtension === "xls") {
        setFile(selectedFile)
        setError(null)
      } else {
        setError("Por favor selecciona un archivo CSV o Excel válido")
        setFile(null)
      }
    }
  }

  const handleImport = async () => {
    if (!file) return

    setIsProcessing(true)
    setError(null)

    // Simulate file processing
    await new Promise((resolve) => setTimeout(resolve, 2000))

    // Mock imported data
    const mockImportedPlans: TrainingPlan[] = [
      {
        id: Date.now().toString(),
        code: "PLAN-IMP-001",
        name: "Plan Importado de Ejemplo",
        type: "Inducción",
        status: "Activo",
        createdAt: new Date().toISOString().split("T")[0],
        description: "Plan importado desde archivo CSV/Excel",
        selectedDepartment: "Recursos Humanos",
        appliesToAllPositions: true,
        applicablePositions: [],
        trainings: [],
        trainingCount: 0,
      },
    ]

    onImport(mockImportedPlans)
    setIsProcessing(false)
  }

  return (
    <div className="h-full flex flex-col bg-card rounded-lg p-6">
      <div className="flex items-center gap-4 mb-6">
        <Button onClick={onBack} variant="ghost" size="sm">
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-semibold text-card-foreground">Importar Planes de Capacitación</h1>
          <p className="text-sm text-muted-foreground">Importa planes desde archivos CSV o Excel</p>
        </div>
      </div>

      <div className="max-w-2xl space-y-6">
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            El archivo debe contener las siguientes columnas: Código, Nombre, Tipo, Estado, Descripción, Departamento
          </AlertDescription>
        </Alert>

        <div className="border-2 border-dashed border-border rounded-lg p-8 text-center">
          <FileSpreadsheet className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-lg font-medium text-card-foreground mb-2">Selecciona un archivo</h3>
          <p className="text-sm text-muted-foreground mb-4">Archivos CSV o Excel (.xlsx, .xls)</p>

          <input type="file" accept=".csv,.xlsx,.xls" onChange={handleFileChange} className="hidden" id="file-upload" />
          <label htmlFor="file-upload">
            <Button type="button" variant="outline" asChild>
              <span>
                <Upload className="w-4 h-4 mr-2" />
                Seleccionar Archivo
              </span>
            </Button>
          </label>

          {file && (
            <div className="mt-4 p-3 bg-muted rounded-md">
              <p className="text-sm text-foreground">
                <strong>Archivo seleccionado:</strong> {file.name}
              </p>
            </div>
          )}

          {error && (
            <div className="mt-4 p-3 bg-destructive/10 border border-destructive rounded-md">
              <p className="text-sm text-destructive">{error}</p>
            </div>
          )}
        </div>

        <div className="flex gap-3">
          <Button onClick={onBack} variant="outline">
            Cancelar
          </Button>
          <Button onClick={handleImport} disabled={!file || isProcessing} className="bg-accent hover:bg-accent/90">
            {isProcessing ? "Procesando..." : "Importar Planes"}
          </Button>
        </div>
      </div>
    </div>
  )
}
