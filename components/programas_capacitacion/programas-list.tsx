"use client"

import { useState, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Plus, Search, Eye, Pencil, MoreHorizontal, UserPlus, Loader2 } from "lucide-react"
import type { 
  AsignarProgramaCapacitacionSelectivo, 
  ProgramaCapacitacion,
  ColaboradorDisponiblePrograma 
} from "@/lib/programas_capacitacion/types"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import { UsuarioLogin } from "@/lib/auth"
import { AssignProgramModal } from "./assign-program"

interface ProgramasCapacitacionListProps {
  programas: ProgramaCapacitacion[]
  onCreateNew: () => void
  onEdit: (programa: ProgramaCapacitacion) => void
  onViewDetails: (programa: ProgramaCapacitacion) => void
  onAssign: (asignarPrograma: AsignarProgramaCapacitacionSelectivo) => Promise<void>
  onDelete: (id: number) => void
  usuario: UsuarioLogin | null
  obtenerColaboradores: (idPrograma: number) => Promise<ColaboradorDisponiblePrograma[]>
  loading?: boolean
}

export function ProgramasCapacitacionList({
  programas,
  onCreateNew,
  onEdit,
  onAssign,
  onViewDetails,
  onDelete,
  usuario,
  obtenerColaboradores,
  loading = false,
}: ProgramasCapacitacionListProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [assignModalOpen, setAssignModalOpen] = useState(false)
  const [selectedPrograma, setSelectedPrograma] = useState<ProgramaCapacitacion | null>(null)

  const filteredProgramas = useMemo(() => {
    return programas.filter(
      (programa) =>
        programa.NOMBRE.toLowerCase().includes(searchTerm.toLowerCase()) ||
        programa.DESCRIPCION.toLowerCase().includes(searchTerm.toLowerCase()) ||
        programa.TIPO.toLowerCase().includes(searchTerm.toLowerCase()),
    )
  }, [programas, searchTerm])

  const recentProgramas = useMemo(() => {
    return [...programas]
      .sort((a, b) => new Date(b.FECHA_CREACION).getTime() - new Date(a.FECHA_CREACION).getTime())
      .slice(0, 3)
  }, [programas])

  const handleAssignClick = (programa: ProgramaCapacitacion) => {
    if (!usuario) {
      console.error("Error: Usuario no logueado para asignar programa.")
      return
    }
    setSelectedPrograma(programa)
    setAssignModalOpen(true)
  }

  const handleConfirmAssign = async (payload: AsignarProgramaCapacitacionSelectivo) => {
    await onAssign(payload)
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between flex-col md:flex-row md:items-center space-y-4 md:space-y-0">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Programas de Capacitación</h1>
          <p className="text-muted-foreground mt-1">Gestiona los programas de capacitación de tu organización</p>
        </div>
        <Button onClick={onCreateNew} className="bg-primary text-primary-foreground hover:bg-primary/90 cursor-pointer">
          <Plus className="w-4 h-4 mr-2" />
          Crear Programa
        </Button>
      </div>

      {recentProgramas.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-lg font-semibold text-foreground">Programas Recientes</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {recentProgramas.map((programa) => (
              <Card
                key={programa.ID_PROGRAMA}
                className="border-border hover:shadow-lg transition-shadow cursor-pointer group flex flex-col h-full hover:scale-[1.02] ease-in-out"
                onClick={() => onViewDetails(programa)}
              >
                <CardHeader className="pb-3 flex-grow">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-foreground group-hover:text-primary dark:group-hover:text-gray-500 transition-colors break-words leading-snug line-clamp-2">
                        {programa.NOMBRE}
                      </h3>
                      <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{programa.DESCRIPCION}</p>
                    </div>
                    <Badge
                      variant={programa.ESTADO === "ACTIVO" ? "default" : "secondary"}
                      className={
                        programa.ESTADO === "ACTIVO"
                          ? "bg-green-500/10 text-green-700 dark:text-green-400 border-green-500/20 shrink-0"
                          : "shrink-0"
                      }
                    >
                      {programa.ESTADO}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center gap-4 text-sm">
                    <div className="flex items-center gap-1.5 text-muted-foreground">
                      <span>📅</span>
                      <span>{programa.PERIODO}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-muted-foreground">
                      <span>📚</span>
                      <span>{programa.PROGRAMA_DETALLES.length} capacitaciones</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between pt-2 border-t border-border">
                    <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20 dark:text-foreground dark:border-blue-900">
                      {programa.TIPO}
                    </Badge>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation()
                        onViewDetails(programa)
                      }}
                      className="hover:bg-primary/10 dark:hover:bg-transparent dark:hover:border dark:border-blue-800 hover:text-primary dark:hover:text-blue-100 cursor-pointer"
                    >
                      <Eye className="w-4 h-4 mr-1" />
                      Ver detalles
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      <Card className="border-border">
        <CardHeader className="border-b border-border">
          <div className="flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Buscar programas..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
                disabled={loading}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead>Nombre</TableHead>
                  <TableHead>Descripción</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Periodo</TableHead>
                  <TableHead>Capacitaciones</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead className="text-center">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow className="hover:bg-transparent">
                    <TableCell colSpan={7} className="text-center py-12">
                      <div className="flex flex-col items-center gap-3">
                        <Loader2 className="h-8 w-8 text-primary animate-spin" />
                        <p className="text-muted-foreground font-medium">Cargando programas...</p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : filteredProgramas.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                      <div className="flex flex-col items-center gap-2">
                        <Search className="h-8 w-8 text-muted-foreground/50" />
                        <p className="font-medium">
                          {searchTerm ? 'No se encontraron resultados' : 'No se encontraron programas'}
                        </p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredProgramas.map((programa) => (
                    <TableRow key={programa.ID_PROGRAMA} className="hover:bg-muted/50">
                      <TableCell className="font-medium" title={programa.NOMBRE}>{programa.NOMBRE}</TableCell>
                      <TableCell className="max-w-xs truncate" title={programa.DESCRIPCION}>
                        {programa.DESCRIPCION}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20 dark:text-foreground dark:border-blue-900">
                          {programa.TIPO}
                        </Badge>
                      </TableCell>
                      <TableCell>{programa.PERIODO}</TableCell>
                      <TableCell>
                        <Badge variant="secondary">{programa.PROGRAMA_DETALLES.length} capacitaciones</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={programa.ESTADO === "ACTIVO" ? "default" : "secondary"}
                          className={
                            programa.ESTADO === "ACTIVO"
                              ? "bg-green-500/10 text-green-700 dark:text-green-400 border-green-500/20"
                              : ""
                          }
                        >
                          {programa.ESTADO}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-center">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="secondary" className="h-8 w-8 p-0 cursor-pointer hover:border hover:border-foreground/50">
                              <span className="sr-only">Abrir menú</span>
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem 
                              onClick={() => onViewDetails(programa)}
                              className="cursor-pointer"
                            >
                              <Eye className="w-4 h-4 mr-2 text-blue-700 dark:text-blue-400" />
                              Ver Detalles
                            </DropdownMenuItem>
                            
                            <DropdownMenuItem 
                              onClick={() => onEdit(programa)}
                              className="cursor-pointer text-blue-600 dark:text-blue-400"
                            >
                              <Pencil className="w-4 h-4 mr-2" />
                              Editar
                            </DropdownMenuItem>

                            <DropdownMenuSeparator />

                            <DropdownMenuItem 
                              onClick={() => handleAssignClick(programa)} 
                              className="cursor-pointer text-emerald-600 dark:text-emerald-400"
                            >
                              <UserPlus className="w-4 h-4 mr-2" /> 
                              Asignar Programa
                            </DropdownMenuItem>
                          
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Modal de asignación */}
      {selectedPrograma && usuario && (
        <AssignProgramModal
          open={assignModalOpen}
          onOpenChange={setAssignModalOpen}
          programaId={selectedPrograma.ID_PROGRAMA}
          programaNombre={selectedPrograma.NOMBRE}
          usuario={usuario.USERNAME}
          onConfirm={handleConfirmAssign}
          obtenerColaboradores={obtenerColaboradores}
        />
      )}
    </div>
  )
}
