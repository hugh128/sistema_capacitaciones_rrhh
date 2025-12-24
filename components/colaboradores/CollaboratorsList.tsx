"use client"

import { Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import type { Colaborador } from "@/lib/colaboradores/type"
import { useEffect, useMemo, useRef, useState, useCallback } from "react"
import { useDebounce } from "@/hooks/useDebounde"
import { getProgressColor, getStatusColor } from "@/lib/colaboradores/type"

type CollaboratorsListProps = {
  colaboradores: Colaborador[]
  filterStatus: "all" | "activo" | "inactivo"
  setFilterStatus: (status: "all" | "activo" | "inactivo") => void
  onSelectCollaborator: (colaborador: Colaborador) => void
}

export default function CollaboratorsList({
  colaboradores,
  filterStatus,
  setFilterStatus,
  onSelectCollaborator,
}: CollaboratorsListProps) {
  const [currentPage, setCurrentPage] = useState(1)
  const [rowsPerPage, setRowsPerPage] = useState(10)
  const [localSearchQuery, setLocalSearchQuery] = useState("") 
  
  const debouncedSearchQuery = useDebounce(localSearchQuery, 300)
  const isFirstRender = useRef(true)

  const searchLower = useMemo(() => debouncedSearchQuery.toLowerCase(), [debouncedSearchQuery])

  const filteredCollaborators = useMemo(() => {
    if (!colaboradores || colaboradores.length === 0) return []

    return colaboradores.filter((collab) => {
      const matchesSearch = !searchLower || 
        collab.NOMBRE_COMPLETO.toLowerCase().includes(searchLower) ||
        (collab.PUESTO && collab.PUESTO.toLowerCase().includes(searchLower)) ||
        (collab.DEPARTAMENTO && collab.DEPARTAMENTO.toLowerCase().includes(searchLower))

      const matchesStatus = filterStatus === "all" || 
        collab.ESTADO.toLowerCase() === filterStatus

      return matchesSearch && matchesStatus
    })
  }, [colaboradores, searchLower, filterStatus])

  const totalPages = Math.max(1, Math.ceil(filteredCollaborators.length / rowsPerPage))

  const currentCollaborators = useMemo(() => {
    const start = (currentPage - 1) * rowsPerPage
    const end = start + rowsPerPage
    return filteredCollaborators.slice(start, end)
  }, [filteredCollaborators, currentPage, rowsPerPage])

  const handleNextPage = useCallback(() => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1)
  }, [currentPage, totalPages])

  const handlePrevPage = useCallback(() => {
    if (currentPage > 1) setCurrentPage(currentPage - 1)
  }, [currentPage])

  const handleRowsPerPageChange = useCallback((value: string) => {
    setRowsPerPage(Number(value))
    setCurrentPage(1)
  }, [])

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false
      return
    }
    setCurrentPage(1)
  }, [debouncedSearchQuery, filterStatus])

  return (
    <div className="flex-1 bg-card rounded-lg shadow-sm">
      <div className="border-b border-border p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-semibold text-foreground">Colaboradores</h1>
            <p className="text-sm text-muted-foreground mt-1">
              {filteredCollaborators.length} colaboradores encontrados
            </p>
          </div>
        </div>

        <div className="flex gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Buscar por nombre, email o puesto..."
              value={localSearchQuery}
              onChange={(e) => setLocalSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          <div className="flex gap-2">
            <Button
              onClick={() => setFilterStatus("all")}
              variant={filterStatus === "all" ? "default" : "outline"}
            >
              Todos
            </Button>
            <Button
              onClick={() => setFilterStatus("activo")}
              variant={filterStatus === "activo" ? "default" : "outline"}
              className={filterStatus === "activo" ? "bg-green-500 hover:bg-green-600" : ""}
            >
              Activos
            </Button>
            <Button
              onClick={() => setFilterStatus("inactivo")}
              variant={filterStatus === "inactivo" ? "default" : "outline"}
              className={filterStatus === "inactivo" ? "bg-red-500 hover:bg-red-600" : ""}
            >
              Inactivos
            </Button>
          </div>
        </div>
      </div>

      <div className="overflow-x-auto bg-card">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50 border-b border-border">
              <TableHead className="px-3 py-3 text-xs font-semibold uppercase text-foreground">
                Colaborador
              </TableHead>
              <TableHead className="px-3 py-3 text-xs font-semibold uppercase text-foreground">
                Puesto
              </TableHead>
              <TableHead className="px-3 py-3 text-xs font-semibold uppercase text-foreground">
                Departamento
              </TableHead>
              <TableHead className="px-3 py-3 text-xs font-semibold uppercase text-foreground">
                Jefe Inmediato
              </TableHead>
              <TableHead className="px-3 py-3 text-xs font-semibold uppercase text-foreground">
                Cumplimiento
              </TableHead>
              <TableHead className="px-3 py-3 text-xs font-semibold uppercase text-foreground">
                Estado
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody className="divide-y divide-border">
            {currentCollaborators.map((collaborator) => (
              <TableRow
                key={collaborator.ID_COLABORADOR}
                onClick={() => onSelectCollaborator(collaborator)}
                className="hover:bg-muted/30 cursor-pointer transition-colors"
              >
                <TableCell className="px-3 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-semibold">
                      {collaborator.INICIALES}
                    </div>
                    <div>
                      <div className="font-semibold text-foreground hover:text-primary">
                        {collaborator.NOMBRE_COMPLETO}
                      </div>
                      <div className="text-sm text-muted-foreground">{collaborator.EMAIL}</div>
                    </div>
                  </div>
                </TableCell>
                <TableCell className="px-3 py-4 text-sm text-foreground truncate max-w-[300px]" title={collaborator.PUESTO}>
                  {collaborator.PUESTO}
                </TableCell>
                <TableCell className="px-3 py-4 text-sm text-foreground truncate max-w-[300px]" title={collaborator.DEPARTAMENTO}>
                  {collaborator.DEPARTAMENTO}
                </TableCell>
                <TableCell className="px-3 py-4 text-sm text-foreground">
                  {collaborator.ENCARGADO}
                </TableCell>
                <TableCell className="px-3 py-4">
                  <div className="flex items-center gap-2">
                    <div className="flex-1 bg-muted rounded-full h-2 max-w-[100px]">
                      <div
                        className={`h-2 rounded-full transition-all ${getProgressColor(collaborator.PORCENTAJE_CUMPLIMIENTO)}`}
                        style={{ width: `${collaborator.PORCENTAJE_CUMPLIMIENTO}%` }}
                      />
                    </div>
                    <span className="text-sm font-semibold text-foreground">
                      {collaborator.PORCENTAJE_CUMPLIMIENTO}%
                    </span>
                  </div>
                </TableCell>
                <TableCell className="px-3 py-4">
                  <span
                    className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(
                      collaborator.ESTADO.toLowerCase()
                    )}`}
                  >
                    {collaborator.ESTADO}
                  </span>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {filteredCollaborators.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No se encontraron colaboradores</p>
        </div>
      )}

      {filteredCollaborators.length > 0 && (
        <div className="flex items-center justify-between border-t border-border p-4">
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Filas por página:</span>
            <Select
              value={rowsPerPage.toString()}
              onValueChange={handleRowsPerPageChange}
            >
              <SelectTrigger className="w-[80px] h-8">
                <SelectValue placeholder="10" />
              </SelectTrigger>
              <SelectContent>
                {[10, 20, 50, 100].map((num) => (
                  <SelectItem key={num} value={num.toString()}>
                    {num}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground">
              Página {currentPage} de {totalPages}
            </span>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handlePrevPage}
                disabled={currentPage === 1}
              >
                Anterior
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleNextPage}
                disabled={currentPage === totalPages}
              >
                Siguiente
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
