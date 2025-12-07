import { memo, useState, useMemo, useEffect, useCallback } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import type { ColaboradoresSinSesion } from "@/lib/capacitaciones/capacitaciones-types"

interface ColaboradorActual {
  ID_COLABORADOR: number
  NOMBRE_COMPLETO: string
  CORREO: string
  DEPARTAMENTO: string
  PUESTO: string
}

interface TablaColaboradoresEditarProps {
  colaboradoresActuales: ColaboradorActual[]
  colaboradoresDisponibles: ColaboradoresSinSesion[]
  selectedColaboradores: number[]
  setSelectedColaboradores: (value: number[]) => void
}

export const TablaColaboradoresEditar = memo(function TablaColaboradoresEditar({
  colaboradoresActuales,
  colaboradoresDisponibles,
  selectedColaboradores,
  setSelectedColaboradores,
}: TablaColaboradoresEditarProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("")

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm)
    }, 300)

    return () => clearTimeout(timer)
  }, [searchTerm])

  const todosColaboradores = useMemo(() => {
    const actualesFormateados = colaboradoresActuales.map(col => ({
      ID_COLABORADOR: col.ID_COLABORADOR,
      NOMBRE_COMPLETO: col.NOMBRE_COMPLETO,
      CORREO: col.CORREO,
      DEPARTAMENTO: col.DEPARTAMENTO,
      PUESTO: col.PUESTO,
      ES_ACTUAL: true,
    }))

    const idsActuales = new Set(colaboradoresActuales.map(c => c.ID_COLABORADOR))
    const disponiblesNuevos = colaboradoresDisponibles
      .filter(col => !idsActuales.has(col.ID_COLABORADOR))
      .map(col => ({
        ID_COLABORADOR: col.ID_COLABORADOR,
        NOMBRE_COMPLETO: col.NOMBRE_COMPLETO,
        CORREO: col.CORREO,
        DEPARTAMENTO: col.DEPARTAMENTO,
        PUESTO: col.PUESTO,
        ES_ACTUAL: false,
      }))

    return [...actualesFormateados, ...disponiblesNuevos]
  }, [colaboradoresActuales, colaboradoresDisponibles])

  const colaboradoresFiltrados = useMemo(() => {
    if (!debouncedSearchTerm.trim()) return todosColaboradores
    
    const searchLower = debouncedSearchTerm.toLowerCase()
    return todosColaboradores.filter(
      (col) =>
        col.NOMBRE_COMPLETO.toLowerCase().includes(searchLower) ||
        col.DEPARTAMENTO.toLowerCase().includes(searchLower) ||
        col.PUESTO.toLowerCase().includes(searchLower),
    )
  }, [debouncedSearchTerm, todosColaboradores])

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

  const colaboradoresOriginalesIds = useMemo(
    () => new Set(colaboradoresActuales.map(c => c.ID_COLABORADOR)),
    [colaboradoresActuales]
  )

  const cambios = useMemo(() => {
    const agregados = selectedColaboradores.filter(id => !colaboradoresOriginalesIds.has(id))
    const quitados = Array.from(colaboradoresOriginalesIds).filter(id => !selectedSet.has(id))
    return { agregados: agregados.length, quitados: quitados.length }
  }, [selectedColaboradores, colaboradoresOriginalesIds, selectedSet])

  return (
    <Card>
      <CardHeader>
        <CardTitle>Gestionar Participantes</CardTitle>
        <CardDescription>
          Agrega o remueve colaboradores de esta sesión
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Input
          placeholder="Buscar colaboradores..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />

        {(cambios.agregados > 0 || cambios.quitados > 0) && (
          <div className="flex gap-2 text-sm">
            {cambios.agregados > 0 && (
              <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 dark:bg-green-950 dark:text-green-300 dark:border-green-800">
                +{cambios.agregados} agregado{cambios.agregados !== 1 ? 's' : ''}
              </Badge>
            )}
            {cambios.quitados > 0 && (
              <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200 dark:bg-red-950 dark:text-red-300 dark:border-red-800">
                -{cambios.quitados} removido{cambios.quitados !== 1 ? 's' : ''}
              </Badge>
            )}
          </div>
        )}

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
                <TableHead>Estado</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {colaboradoresFiltrados.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                    No se encontraron colaboradores
                  </TableCell>
                </TableRow>
              ) : (
                colaboradoresFiltrados.map((col) => {
                  const isSelected = selectedSet.has(col.ID_COLABORADOR)
                  const wasOriginal = colaboradoresOriginalesIds.has(col.ID_COLABORADOR)
                  
                  let badge = null
                  if (isSelected && !wasOriginal) {
                    badge = <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 dark:bg-green-950 dark:text-green-300">Nuevo</Badge>
                  } else if (!isSelected && wasOriginal) {
                    badge = <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200 dark:bg-red-950 dark:text-red-300">Se removerá</Badge>
                  } else if (isSelected && wasOriginal) {
                    badge = <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950 dark:text-blue-300">Actual</Badge>
                  }

                  return (
                    <TableRow key={col.ID_COLABORADOR}>
                      <TableCell>
                        <Checkbox
                          checked={isSelected}
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
                      <TableCell>{badge}</TableCell>
                    </TableRow>
                  )
                })
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
