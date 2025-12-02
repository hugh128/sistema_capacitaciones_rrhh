"use client"

import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Loader2, Download } from "lucide-react"
import { useReportes } from "@/hooks/useReportes"
import toast from "react-hot-toast"

interface DownloadReportDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  reportType: "detalle" | "cumplimiento"
}

export function DownloadReportDialog({
  open,
  onOpenChange,
  reportType,
}: DownloadReportDialogProps) {
  const [fechaInicio, setFechaInicio] = useState("")
  const [fechaFin, setFechaFin] = useState("")
  const { isLoading, descargarReporteDetalleCapacitaciones, descargarReporteCumplimientoColaboradores } = useReportes()

  const handleDownload = async () => {
    let result

    if (reportType === "detalle") {
      const filtros = {
        fechaInicio: fechaInicio || undefined,
        fechaFin: fechaFin || undefined,
      }
      result = await descargarReporteDetalleCapacitaciones(filtros)
    } else {
      result = await descargarReporteCumplimientoColaboradores()
    }

    if (result.success) {
      toast.success("Reporte descargado exitosamente")
      onOpenChange(false)
      setFechaInicio("")
      setFechaFin("")
    } else {
      toast.error(`Error al descargar: ${result.error}`)
    }
  }

  const getDialogContent = () => {
    if (reportType === "detalle") {
      return {
        title: "Descargar Reporte de Detalle de Capacitaciones",
        description: "Genera un reporte en Excel con el detalle de todas las capacitaciones de los colaboradores. Puedes filtrar por rango de fechas.",
      }
    }
    return {
      title: "Descargar Reporte de Cumplimiento de Colaboradores",
      description: "Genera un reporte en Excel con el estado de cumplimiento de cada colaborador en sus planes de capacitación.",
    }
  }

  const content = getDialogContent()

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{content.title}</DialogTitle>
          <DialogDescription>{content.description}</DialogDescription>
        </DialogHeader>

        {reportType === "detalle" && (
          <div className="grid gap-4 py-4">
            <div className="grid gap-2 dark-mode-date-fix">
              <Label htmlFor="fechaInicio">Fecha Inicio (Opcional)</Label>
              <Input
                id="fechaInicio"
                type="date"
                value={fechaInicio}
                onChange={(e) => setFechaInicio(e.target.value)}
                max={fechaFin || undefined}
              />
            </div>
            <div className="grid gap-2 dark-mode-date-fix">
              <Label htmlFor="fechaFin">Fecha Fin (Opcional)</Label>
              <Input
                id="fechaFin"
                type="date"
                value={fechaFin}
                onChange={(e) => setFechaFin(e.target.value)}
                min={fechaInicio || undefined}
              />
            </div>
            <p className="text-sm text-muted-foreground">
              Si no seleccionas fechas, se generará el reporte con todos los datos disponibles.
            </p>
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isLoading} className="cursor-pointer">
            Cancelar
          </Button>
          <Button onClick={handleDownload} disabled={isLoading} className="cursor-pointer">
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Descargando...
              </>
            ) : (
              <>
                <Download className="mr-2 h-4 w-4" />
                Descargar Excel
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
