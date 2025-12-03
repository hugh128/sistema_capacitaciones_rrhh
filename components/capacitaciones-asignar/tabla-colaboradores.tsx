import { memo, useState, useMemo, useEffect, useCallback } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import type { ColaboradoresSinSesion } from "@/lib/capacitaciones/capacitaciones-types"

interface TablaColaboradoresProps {
  colaboradoresDisponibles: ColaboradoresSinSesion[]
  selectedColaboradores: number[]
  setSelectedColaboradores: (value: number[]) => void
}

export const TablaColaboradores = memo(function TablaColaboradores({
  colaboradoresDisponibles,
  selectedColaboradores,
  setSelectedColaboradores,
}: TablaColaboradoresProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("")

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm)
    }, 300)

    return () => clearTimeout(timer)
  }, [searchTerm])

  const colaboradoresFiltrados = useMemo(() => {
    if (!debouncedSearchTerm.trim()) return colaboradoresDisponibles ?? []
    
    const searchLower = debouncedSearchTerm.toLowerCase()
    return (colaboradoresDisponibles ?? []).filter(
      (col) =>
        col.NOMBRE_COMPLETO.toLowerCase().includes(searchLower) ||
        col.DEPARTAMENTO.toLowerCase().includes(searchLower) ||
        col.PUESTO.toLowerCase().includes(searchLower),
    )
  }, [debouncedSearchTerm, colaboradoresDisponibles])

  const selectedSet = useMemo(() => new Set(selectedColaboradores), [selectedColaboradores])

  const allSelected = colaboradoresFiltrados.length > 0 && 
    colaboradoresFiltrados.every(col => selectedSet.has(col.ID_COLABORADOR))

  const handleToggleColaborador = useCallback((id: number, checked: boolean) => {
    setSelectedColaboradores(
      checked 
        ? [...selectedColaboradores, id]
        : selectedColaboradores.filter((colId) => colId !== id)
    )
  }, [selectedColaboradores, setSelectedColaboradores])

  const handleToggleAll = useCallback((checked: boolean) => {
    if (checked) {
      const nuevosIds = colaboradoresFiltrados
        .map(c => c.ID_COLABORADOR)
        .filter(id => !selectedSet.has(id))
      setSelectedColaboradores([...selectedColaboradores, ...nuevosIds])
    } else {
      const idsARemover = new Set(colaboradoresFiltrados.map(c => c.ID_COLABORADOR))
      setSelectedColaboradores(selectedColaboradores.filter(id => !idsARemover.has(id)))
    }
  }, [colaboradoresFiltrados, selectedColaboradores, selectedSet, setSelectedColaboradores])

  return (
    <Card>
      <CardHeader>
        <CardTitle>Seleccionar Participantes</CardTitle>
        <CardDescription>Selecciona los colaboradores que participarán en esta capacitación</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Input
          placeholder="Buscar colaboradores..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />

        <div className="border rounded-lg max-h-96 overflow-y-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">
                  <Checkbox
                    checked={allSelected}
                    onCheckedChange={handleToggleAll}
                    className="
                      dark:border dark:border-gray-500
                      data-[state=checked]:dark:border-transparent cursor-pointer
                    "
                  />
                </TableHead>
                <TableHead>Nombre</TableHead>
                <TableHead>Departamento</TableHead>
                <TableHead>Puesto</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {colaboradoresFiltrados.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center text-muted-foreground py-8">
                    No se encontraron colaboradores
                  </TableCell>
                </TableRow>
              ) : (
                colaboradoresFiltrados.map((col) => (
                  <TableRow key={col.ID_COLABORADOR}>
                    <TableCell>
                      <Checkbox
                        checked={selectedSet.has(col.ID_COLABORADOR)}
                        onCheckedChange={(checked) => 
                          handleToggleColaborador(col.ID_COLABORADOR, checked as boolean)
                        }
                      className="
                        dark:border dark:border-gray-500
                        data-[state=checked]:dark:border-transparent cursor-pointer
                      "
                      />
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">{col.NOMBRE_COMPLETO}</p>
                        <p className="text-sm text-muted-foreground">{col.CORREO}</p>
                      </div>
                    </TableCell>
                    <TableCell>{col.DEPARTAMENTO}</TableCell>
                    <TableCell>{col.PUESTO}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        <p className="text-sm text-muted-foreground">
          {selectedColaboradores.length} colaborador(es) seleccionado(s)
        </p>
      </CardContent>
    </Card>
  )
})
