"use client"

import { Search, Download } from "lucide-react"
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
import type { Collaborator } from "@/lib/colaboradores/type"
import { useEffect, useMemo, useRef, useState } from "react"

type CollaboratorsListProps = {
  collaborators: Collaborator[]
  searchQuery: string
  setSearchQuery: (query: string) => void
  filterStatus: "all" | "active" | "inactive" | "on-leave"
  setFilterStatus: (status: "all" | "active" | "inactive" | "on-leave") => void
  onSelectCollaborator: (collaborator: Collaborator) => void
}

const getStatusColor = (status: string) => {
  switch (status) {
    case "active":
      return "bg-green-500 text-white"
    case "inactive":
      return "bg-red-500 text-white"
    case "on-leave":
      return "bg-yellow-500 text-white"
    default:
      return "bg-muted text-muted-foreground"
  }
}

const getStatusText = (status: string) => {
  switch (status) {
    case "active":
      return "Activo"
    case "inactive":
      return "Inactivo"
    case "on-leave":
      return "Permiso"
    default:
      return status
  }
}

export default function CollaboratorsList({
  collaborators,
  searchQuery,
  setSearchQuery,
  filterStatus,
  setFilterStatus,
  onSelectCollaborator,
}: CollaboratorsListProps) {
  const [currentPage, setCurrentPage] = useState(1)
  const [rowsPerPage, setRowsPerPage] = useState(10)

  const filteredCollaborators = useMemo(() => {
    return collaborators.filter((collab) => {
      const matchesSearch =
        collab.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        collab.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        collab.position.toLowerCase().includes(searchQuery.toLowerCase())

      const matchesStatus =
        filterStatus === "all" ? true : collab.status === filterStatus

      return matchesSearch && matchesStatus
    })
  }, [collaborators, searchQuery, filterStatus])

  const totalPages = Math.max(1, Math.ceil(filteredCollaborators.length / rowsPerPage))

  const currentCollaborators = useMemo(() => {
    const start = (currentPage - 1) * rowsPerPage
    const end = start + rowsPerPage
    return filteredCollaborators.slice(start, end)
  }, [filteredCollaborators, currentPage, rowsPerPage])

  const handleNextPage = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1)
  }

  const handlePrevPage = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1)
  }

  const handleRowsPerPageChange = (value: string) => {
    setRowsPerPage(Number(value))
    setCurrentPage(1)
  }

  const isFirstRender = useRef(true)

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false
      return
    }
    setCurrentPage(1)
  }, [searchQuery, filterStatus])

  return (
    <div className="flex-1 bg-card rounded-lg shadow-sm">
      {/* Header */}
      <div className="border-b border-border p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-semibold text-foreground">Colaboradores</h1>
            <p className="text-sm text-muted-foreground mt-1">
              {filteredCollaborators.length} colaboradores encontrados
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              onClick={() => alert("Descargando lista de colaboradores...")}
              variant="outline"
            >
              <Download className="w-4 h-4 mr-2" />
              Exportar
            </Button>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="flex gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Buscar por nombre, email o puesto..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
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
              onClick={() => setFilterStatus("active")}
              variant={filterStatus === "active" ? "default" : "outline"}
              className={filterStatus === "active" ? "bg-green-500 hover:bg-green-600" : ""}
            >
              Activos
            </Button>
            <Button
              onClick={() => setFilterStatus("on-leave")}
              variant={filterStatus === "on-leave" ? "default" : "outline"}
              className={filterStatus === "on-leave" ? "bg-yellow-500 hover:bg-yellow-600" : ""}
            >
              Permisos
            </Button>
            <Button
              onClick={() => setFilterStatus("inactive")}
              variant={filterStatus === "inactive" ? "default" : "outline"}
              className={filterStatus === "inactive" ? "bg-red-500 hover:bg-red-600" : ""}
            >
              Inactivos
            </Button>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto bg-card">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50 border-b border-border">
              <TableHead className="px-6 py-3 text-xs font-semibold uppercase text-foreground">
                Colaborador
              </TableHead>
              <TableHead className="px-6 py-3 text-xs font-semibold uppercase text-foreground">
                Puesto
              </TableHead>
              <TableHead className="px-6 py-3 text-xs font-semibold uppercase text-foreground">
                Departamento
              </TableHead>
              <TableHead className="px-6 py-3 text-xs font-semibold uppercase text-foreground">
                Jefe Inmediato
              </TableHead>
              <TableHead className="px-6 py-3 text-xs font-semibold uppercase text-foreground">
                Cumplimiento
              </TableHead>
              <TableHead className="px-6 py-3 text-xs font-semibold uppercase text-foreground">
                Estado
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody className="divide-y divide-border">
            {currentCollaborators.map((collaborator) => (
              <TableRow
                key={collaborator.id}
                onClick={() => onSelectCollaborator(collaborator)}
                className="hover:bg-muted/30 cursor-pointer transition-colors"
              >
                <TableCell className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-semibold">
                      {collaborator.initials}
                    </div>
                    <div>
                      <div className="font-semibold text-foreground hover:text-primary">
                        {collaborator.name}
                      </div>
                      <div className="text-sm text-muted-foreground">{collaborator.email}</div>
                    </div>
                  </div>
                </TableCell>
                <TableCell className="px-6 py-4 text-sm text-foreground">
                  {collaborator.position}
                </TableCell>
                <TableCell className="px-6 py-4 text-sm text-foreground">
                  {collaborator.department}
                </TableCell>
                <TableCell className="px-6 py-4 text-sm text-foreground">
                  {collaborator.manager}
                </TableCell>
                <TableCell className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <div className="flex-1 bg-muted rounded-full h-2 max-w-[100px]">
                      <div
                        className="bg-green-500 h-2 rounded-full transition-all"
                        style={{ width: `${collaborator.completionScore}%` }}
                      />
                    </div>
                    <span className="text-sm font-semibold text-foreground">
                      {collaborator.completionScore}%
                    </span>
                  </div>
                </TableCell>
                <TableCell className="px-6 py-4">
                  <span
                    className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(
                      collaborator.status
                    )}`}
                  >
                    {getStatusText(collaborator.status)}
                  </span>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Empty state */}
      {filteredCollaborators.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No se encontraron colaboradores</p>
        </div>
      )}

      {/* Pagination */}
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
