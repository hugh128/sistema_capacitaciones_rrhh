"use client"

import { useState, useEffect, useMemo, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Search, AlertCircle, CheckCircle2, XCircle, Loader2 } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import type { 
  AsignarProgramaCapacitacionSelectivo, 
  ColaboradorDisponiblePrograma 
} from "@/lib/programas_capacitacion/types"

interface AssignProgramModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  programaId: number
  programaNombre: string
  usuario: string
  onConfirm: (payload: AsignarProgramaCapacitacionSelectivo) => Promise<void>
  obtenerColaboradores: (idPrograma: number) => Promise<ColaboradorDisponiblePrograma[]>
}

export function AssignProgramModal({
  open,
  onOpenChange,
  programaId,
  programaNombre,
  usuario,
  onConfirm,
  obtenerColaboradores,
}: AssignProgramModalProps) {
  const [colaboradores, setColaboradores] = useState<ColaboradorDisponiblePrograma[]>([])
  const [loading, setLoading] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [selections, setSelections] = useState<Map<number, Set<number>>>(new Map())

  const loadColaboradores = useCallback(async () => {
    setLoading(true)
    try {
      const data = await obtenerColaboradores(programaId)
      setColaboradores(data)
      const initialSelections = new Map<number, Set<number>>()
      data.forEach(colab => {
        const capacitacionesDisponibles = colab.capacitaciones
          .filter(cap => cap.puedeAsignarse)
          .map(cap => cap.idDetalle)
        if (capacitacionesDisponibles.length > 0) {
          initialSelections.set(colab.idColaborador, new Set(capacitacionesDisponibles))
        }
      })
      setSelections(initialSelections)
    } catch (error) {
      console.error("Error loading colaboradores:", error)
    } finally {
      setLoading(false)
    }
  }, [programaId, obtenerColaboradores])

  useEffect(() => {
    if (open) {
      loadColaboradores()
    } else {
      setColaboradores([])
      setSearchTerm("")
      setSelections(new Map())
    }
  }, [open, loadColaboradores])

  const filteredColaboradores = useMemo(() => {
    return colaboradores.filter(colab =>
      colab.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      colab.departamento.toLowerCase().includes(searchTerm.toLowerCase()) ||
      colab.puesto.toLowerCase().includes(searchTerm.toLowerCase())
    )
  }, [colaboradores, searchTerm])

  const toggleColaborador = (idColaborador: number, capacitacionesIds: number[]) => {
    const newSelections = new Map(selections)
    if (newSelections.has(idColaborador)) {
      newSelections.delete(idColaborador)
    } else {
      newSelections.set(idColaborador, new Set(capacitacionesIds))
    }
    setSelections(newSelections)
  }

  const toggleCapacitacion = (idColaborador: number, idDetalle: number) => {
    const newSelections = new Map(selections)
    const colabCapacitaciones = newSelections.get(idColaborador) || new Set()
    
    if (colabCapacitaciones.has(idDetalle)) {
      colabCapacitaciones.delete(idDetalle)
      if (colabCapacitaciones.size === 0) {
        newSelections.delete(idColaborador)
      } else {
        newSelections.set(idColaborador, colabCapacitaciones)
      }
    } else {
      colabCapacitaciones.add(idDetalle)
      newSelections.set(idColaborador, colabCapacitaciones)
    }
    
    setSelections(newSelections)
  }

  const selectAll = () => {
    const newSelections = new Map<number, Set<number>>()
    filteredColaboradores.forEach(colab => {
      const capacitacionesDisponibles = colab.capacitaciones
        .filter(cap => cap.puedeAsignarse)
        .map(cap => cap.idDetalle)
      if (capacitacionesDisponibles.length > 0) {
        newSelections.set(colab.idColaborador, new Set(capacitacionesDisponibles))
      }
    })
    setSelections(newSelections)
  }

  const deselectAll = () => {
    setSelections(new Map())
  }

  const isColaboradorFullySelected = (idColaborador: number, capacitacionesDisponibles: number[]) => {
    const selected = selections.get(idColaborador)
    if (!selected || selected.size === 0) return false
    return capacitacionesDisponibles.every(id => selected.has(id))
  }

  const isCapacitacionSelected = (idColaborador: number, idDetalle: number) => {
    return selections.get(idColaborador)?.has(idDetalle) || false
  }

  const areAllSelected = useMemo(() => {
    const checkColaboradorFullySelected = (idColaborador: number, capacitacionesDisponibles: number[]) => {
      const selected = selections.get(idColaborador)
      if (!selected || selected.size === 0) return false
      return capacitacionesDisponibles.every(id => selected.has(id))
    }

    if (filteredColaboradores.length === 0) return false
    return filteredColaboradores.every(colab => {
      const capacitacionesDisponibles = colab.capacitaciones
        .filter(cap => cap.puedeAsignarse)
        .map(cap => cap.idDetalle)
      if (capacitacionesDisponibles.length === 0) return true
      return checkColaboradorFullySelected(colab.idColaborador, capacitacionesDisponibles)
    })
  }, [filteredColaboradores, selections])

  const totalSeleccionados = selections.size
  const totalCapacitaciones = Array.from(selections.values()).reduce(
    (sum, set) => sum + set.size, 
    0
  )

  const handleConfirm = async () => {
    if (totalSeleccionados === 0) return

    const payload: AsignarProgramaCapacitacionSelectivo = {
      idPrograma: programaId,
      asignaciones: Array.from(selections.entries()).map(([idColaborador, detalles]) => ({
        idColaborador,
        detalles: Array.from(detalles)
      })),
      usuario
    }

    setSubmitting(true)
    try {
      await onConfirm(payload)
      onOpenChange(false)
    } catch (error) {
      console.error("Error confirming assignment:", error)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-5xl h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="text-xl">Asignar Programa</DialogTitle>
          <DialogDescription className="text-base">
            <span className="font-semibold text-foreground text-xl block truncate">{programaNombre}</span>
            Selecciona los colaboradores y las capacitaciones específicas que deseas asignar
          </DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className="flex flex-1 items-center justify-center">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : (
          <>
            <div className="space-y-4 flex-1 overflow-hidden flex flex-col min-h-0">
              <div className="px-6 py-4 border-b bg-muted/30 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="relative w-full sm:max-w-sm">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="Buscar colaboradores..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>

                <div className="flex items-center gap-3 justify-center sm:justify-end">
                  <div className="flex items-center gap-2 hover:scale-[1.02]">
                    <Checkbox
                      id="select-all"
                      checked={areAllSelected}
                      onCheckedChange={(checked) => checked ? selectAll() : deselectAll()}
                      className="dark:border dark:border-gray-500 data-[state=checked]:dark:border-transparent cursor-pointer"
                    />
                    <label htmlFor="select-all" className="text-sm font-medium cursor-pointer select-none">
                      Seleccionar todo
                    </label>
                  </div>
                  
                  <Button
                    size="sm"
                    onClick={deselectAll}
                    disabled={totalSeleccionados === 0}
                    className="cursor-pointer bg-transparent border-1 border-red-400 text-red-900 hover:bg-red-100 hover:text-red-500 dark:hover:bg-transparent"
                  >
                    Limpiar
                  </Button>
                </div>
              </div>

              {totalSeleccionados > 0 && (
                <Alert className="flex-shrink-0 mx-6 w-auto">
                  <CheckCircle2 className="h-4 w-4" />
                  <AlertDescription>
                    <strong>{totalSeleccionados}</strong> colaborador(es) seleccionado(s) con{" "}
                    <strong>{totalCapacitaciones}</strong> capacitación(es) total(es)
                  </AlertDescription>
                </Alert>
              )}

              <div className="flex-1 min-h-0 overflow-auto rounded-lg border bg-background mx-6 mb-4">
                <Table className="border-separate border-spacing-y-0 table-fixed w-full">
                  <TableHeader className="sticky top-0 z-10 bg-muted/90 backdrop-blur supports-[backdrop-filter]:bg-muted/60">
                    <TableRow>
                      <TableHead className="w-[50px] text-center" />
                      <TableHead className="w-[200px] md:w-[250px]">Colaborador</TableHead>
                      <TableHead className="w-auto">Capacitaciones</TableHead>
                      <TableHead className="w-[120px] text-center">Estado</TableHead>
                    </TableRow>
                  </TableHeader>

                  <TableBody>
                    {filteredColaboradores.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={4} className="py-12 text-center text-muted-foreground">
                          No se encontraron colaboradores disponibles
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredColaboradores.map((colab) => {
                        const capacitacionesDisponibles = colab.capacitaciones.filter(cap => cap.puedeAsignarse)
                        const hasCapacitaciones = capacitacionesDisponibles.length > 0

                        return (
                          <TableRow key={colab.idColaborador} className="hover:bg-muted/40 border-b">
                            <TableCell className="align-top pt-4 text-center">
                              <Checkbox
                                checked={isColaboradorFullySelected(colab.idColaborador, capacitacionesDisponibles.map(c => c.idDetalle))}
                                disabled={!hasCapacitaciones}
                                onCheckedChange={() => toggleColaborador(colab.idColaborador, capacitacionesDisponibles.map(cap => cap.idDetalle))}
                                className="dark:border dark:border-gray-500 data-[state=checked]:dark:border-transparent cursor-pointer"
                              />
                            </TableCell>

                            {/* Colaboradores */}
                            <TableCell className="align-top pt-4 overflow-hidden">
                              <div className="font-semibold leading-tight text-sm break-words whitespace-normal">
                                {colab.nombre}
                              </div>
                              <div className="mt-1.5 space-y-1">
                                <div className="text-xs text-muted-foreground break-words whitespace-normal leading-relaxed">
                                  <span className="font-medium text-[11px] uppercase opacity-70 block text-primary dark:text-blue-400">Departamento:</span>
                                  {colab.departamento}
                                </div>
                                <div className="text-xs text-muted-foreground break-words whitespace-normal leading-relaxed">
                                  <span className="font-medium text-[11px] uppercase opacity-70 block text-primary dark:text-blue-400">Puesto:</span>
                                  {colab.puesto}
                                </div>
                              </div>
                            </TableCell>

                            {/* Capacitaciones */}
                            <TableCell className="align-top pt-4">
                              {!hasCapacitaciones ? (
                                <Badge variant="secondary" className="gap-1 text-xs">
                                  <XCircle className="w-3 h-3" /> Sin disponibles
                                </Badge>
                              ) : (
                                <div className="flex flex-wrap gap-2">
                                  {capacitacionesDisponibles.map((cap) => {
                                    const selected = isCapacitacionSelected(colab.idColaborador, cap.idDetalle)
                                    return (
                                      <Badge
                                        key={cap.idDetalle}
                                        variant={selected ? "default" : "outline"}
                                        className={`
                                          cursor-pointer px-2 py-0.5 rounded-md transition-discrete ease-in-out 
                                          max-w-full h-auto inline-flex items-center hover:scale-[1.02]
                                          ${selected ? "bg-primary" : "hover:bg-primary/10"}
                                        `}
                                        onClick={() => toggleCapacitacion(colab.idColaborador, cap.idDetalle)}
                                      >
                                        <span className="break-words whitespace-normal text-left py-0.5">
                                          {cap.nombre}
                                          <span className="ml-1 opacity-60 text-[10px] font-light">
                                            • {cap.categoria}
                                          </span>
                                        </span>
                                      </Badge>
                                    )
                                  })}
                                </div>
                              )}
                            </TableCell>

                            <TableCell className="align-top pt-4 text-center">
                              {colab.yaTieneProgramaActivo ? (
                                <Badge variant="secondary" className="text-[11px] px-1">
                                  <AlertCircle className="w-3 h-3 mr-1" /> Activo
                                </Badge>
                              ) : (
                                <Badge variant="outline" className="text-[11px] bg-green-500/10 text-green-700 border-green-500/20">
                                  <CheckCircle2 className="w-3 h-3 mr-1" /> Disponible
                                </Badge>
                              )}
                            </TableCell>
                          </TableRow>
                        )
                      })
                    )}
                  </TableBody>
                </Table>
              </div>
            </div>

            <DialogFooter className="px-6 py-4 border-t bg-background flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
              <Button variant="outline" onClick={() => onOpenChange(false)} disabled={submitting} className="cursor-pointer dark:hover:text-foreground dark:hover:border-foreground/50">
                Cancelar
              </Button>
              <Button onClick={handleConfirm} disabled={totalSeleccionados === 0 || submitting} className="min-w-[180px] cursor-pointer">
                {submitting ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Asignando...</> : `Confirmar (${totalSeleccionados})`}
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}
