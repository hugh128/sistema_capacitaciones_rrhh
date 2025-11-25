"use client"

import { useState, useMemo, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar, Users, Search, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react"
import Link from "next/link"
import { CheckCircle2, UserPlus } from "lucide-react"
import { ApiCapacitacionSesion, getEstadoCapacitacionColor } from "@/lib/capacitaciones/capacitaciones-types"

interface PendingAssignmentsTabProps {
  capacitaciones: ApiCapacitacionSesion[]
}

export function PendingAssignmentsTab({ capacitaciones }: PendingAssignmentsTabProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(10)

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm)
    }, 300)

    return () => clearTimeout(timer)
  }, [searchTerm])

  const capacitacionesFiltradas = useMemo(() => {
    if (!debouncedSearchTerm.trim()) return capacitaciones

    const searchLower = debouncedSearchTerm.toLowerCase()
    return capacitaciones.filter((cap) =>
      cap.CAPACITACION_NOMBRE.toLowerCase().includes(searchLower) ||
      cap.CODIGO_DOCUMENTO?.toLowerCase().includes(searchLower) ||
      cap.NOMBRE_ORIGEN?.toLowerCase().includes(searchLower) ||
      cap.OBJETIVO?.toLowerCase().includes(searchLower)
    )
  }, [debouncedSearchTerm, capacitaciones])

  const totalPages = Math.ceil(capacitacionesFiltradas.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const capacitacionesPaginadas = capacitacionesFiltradas.slice(startIndex, endIndex)

  useEffect(() => {
    setCurrentPage(1)
  }, [debouncedSearchTerm, itemsPerPage])

  const goToPage = (page: number) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)))
  }

  if (capacitaciones.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Capacitaciones Pendientes de Asignación</CardTitle>
          <CardDescription>
            Estas capacitaciones necesitan que se les asigne un capacitador y participantes
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12 text-muted-foreground">
            <CheckCircle2 className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p>No hay capacitaciones pendientes de asignación</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="shadow-sm">
      <CardHeader>
        <CardTitle>Capacitaciones Pendientes de Asignación</CardTitle>
        <CardDescription>
          Estas capacitaciones necesitan que se les asigne un capacitador y participantes
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Barra de búsqueda */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por nombre, código, origen u objetivo..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
          </div>
        </div>

        {capacitacionesFiltradas.length > 0 && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 py-2 border-y">
            <div className="text-sm text-muted-foreground">
              Mostrando <span className="font-medium text-foreground">{startIndex + 1}</span> a{" "}
              <span className="font-medium text-foreground">{Math.min(endIndex, capacitacionesFiltradas.length)}</span> de{" "}
              <span className="font-medium text-foreground">{capacitacionesFiltradas.length}</span> capacitaciones pendientes
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Mostrar:</span>
              <Select
                value={itemsPerPage.toString()}
                onValueChange={(value) => setItemsPerPage(Number(value))}
              >
                <SelectTrigger className="w-20 h-9">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="5">5</SelectItem>
                  <SelectItem value="10">10</SelectItem>
                  <SelectItem value="20">20</SelectItem>
                  <SelectItem value="50">50</SelectItem>
                  <SelectItem value="100">100</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        )}

        {/* Lista de capacitaciones */}
        <div className="space-y-4">
          {capacitacionesPaginadas.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Search className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>No se encontraron capacitaciones que coincidan con tu búsqueda</p>
              <p className="text-sm mt-2">Intenta con otros términos de búsqueda</p>
            </div>
          ) : (
            capacitacionesPaginadas.map((cap) => (
              <Card
                key={cap.CLAVE_UNICA}
                className="border border-border/40 hover:border-primary/60 dark:hover:border-primary hover:shadow-md transition-all duration-200 group"
              >
                <CardContent className="px-6 py-4">
                  <div className="flex flex-col sm:flex-row items-start justify-between gap-4">
                    <div className="flex-1 space-y-3">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-semibold text-lg text-foreground">{cap.CAPACITACION_NOMBRE}</h3>
                        <Badge className={getEstadoCapacitacionColor(cap.ESTADO_SESION)}>{cap.ESTADO_SESION}</Badge>
                        <Badge variant="outline">{cap.TIPO_CAPACITACION}</Badge>
                      </div>

                      {cap.CODIGO_DOCUMENTO && (
                        <p className="text-sm text-muted-foreground">
                          <span className="font-medium">Código:</span> {cap.CODIGO_DOCUMENTO}
                        </p>
                      )}

                      <p className="text-sm text-muted-foreground line-clamp-2">{cap.OBJETIVO}</p>

                      <div className="flex flex-wrap gap-4 text-sm pt-2">
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Calendar className="h-4 w-4 text-blue-600" />
                          <span>
                            {cap.FECHA_PROGRAMADA ? new Date(cap.FECHA_PROGRAMADA).toLocaleDateString("es-GT") : "Sin fecha"}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Users className="h-4 w-4 text-green-600" />
                          <span>{cap.PENDIENTES_REGISTRAR} participantes</span>
                        </div>
                        <div className="text-muted-foreground">
                          <span className="font-medium text-foreground">Origen:</span> {cap.TIPO_ORIGEN}
                        </div>
                      </div>
                    </div>

                    <Link href={`/capacitaciones/asignar/${cap.ID_CAPACITACION}`}>
                      <Button className="whitespace-nowrap cursor-pointer">
                        <UserPlus className="h-4 w-4 mr-2" />
                        Asignar
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {/* Paginación */}
        {totalPages > 1 && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t">
            <div className="text-sm text-muted-foreground">
              Página <span className="font-medium text-foreground">{currentPage}</span> de{" "}
              <span className="font-medium text-foreground">{totalPages}</span>
            </div>
            
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="icon"
                onClick={() => goToPage(1)}
                disabled={currentPage === 1}
                className="h-9 w-9"
              >
                <ChevronsLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={() => goToPage(currentPage - 1)}
                disabled={currentPage === 1}
                className="h-9 w-9"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              
              {/* Números de página */}
              <div className="flex items-center gap-1">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNumber: number;
                  
                  if (totalPages <= 5) {
                    pageNumber = i + 1;
                  } else if (currentPage <= 3) {
                    pageNumber = i + 1;
                  } else if (currentPage >= totalPages - 2) {
                    pageNumber = totalPages - 4 + i;
                  } else {
                    pageNumber = currentPage - 2 + i;
                  }

                  return (
                    <Button
                      key={pageNumber}
                      variant={currentPage === pageNumber ? "default" : "outline"}
                      size="icon"
                      onClick={() => goToPage(pageNumber)}
                      className="h-9 w-9"
                    >
                      {pageNumber}
                    </Button>
                  );
                })}
              </div>

              <Button
                variant="outline"
                size="icon"
                onClick={() => goToPage(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="h-9 w-9"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={() => goToPage(totalPages)}
                disabled={currentPage === totalPages}
                className="h-9 w-9"
              >
                <ChevronsRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
