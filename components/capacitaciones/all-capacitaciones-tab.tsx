"use client"

import { useState, useMemo, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar, Clock, Users, Search, Filter, Eye, BookOpen, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react"
import Link from "next/link"
import { ApiCapacitacionSesion, getEstadoCapacitacionColor } from "@/lib/capacitaciones/capacitaciones-types"

interface AllCapacitacionesTabProps {
  capacitaciones: ApiCapacitacionSesion[]
}

export function AllCapacitacionesTab({ capacitaciones }: AllCapacitacionesTabProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("")
  const [estadoFilter, setEstadoFilter] = useState<string>("TODOS")
  const [capacitadorFilter, setCapacitadorFilter] = useState<string>("TODOS")
  
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(10)

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm)
    }, 300)

    return () => clearTimeout(timer)
  }, [searchTerm])

  const capacitadores = useMemo(() => {
    const unique = new Set(capacitaciones.map((c) => c.CAPACITADOR_NOMBRE))
    return Array.from(unique).filter((c) => c !== "Por asignar")
  }, [capacitaciones])

  const capacitacionesFiltradas = useMemo(() => {
    return capacitaciones.filter((cap) => {
      const matchesSearch =
        cap.CAPACITADOR_NOMBRE?.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
        cap.CAPACITACION_NOMBRE.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
        cap.CODIGO_DOCUMENTO?.toLowerCase().includes(debouncedSearchTerm.toLowerCase())
      const matchesEstado = estadoFilter === "TODOS" || (cap.ESTADO_SESION ?? cap.ESTADO) === estadoFilter
      const matchesCapacitador = capacitadorFilter === "TODOS" || cap.CAPACITADOR_NOMBRE === capacitadorFilter
      return matchesSearch && matchesEstado && matchesCapacitador
    })
  }, [debouncedSearchTerm, estadoFilter, capacitadorFilter, capacitaciones])

  const totalPages = Math.ceil(capacitacionesFiltradas.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const capacitacionesPaginadas = capacitacionesFiltradas.slice(startIndex, endIndex)

  useEffect(() => {
    setCurrentPage(1)
  }, [debouncedSearchTerm, estadoFilter, capacitadorFilter, itemsPerPage])

  const getDetailRoute = (capacitacion: ApiCapacitacionSesion): string => {
    if (capacitacion.ESTADO_SESION === "PENDIENTE_ASIGNACION" || capacitacion.ESTADO_SESION === "ASIGNADA" || capacitacion.ESTADO_SESION === "CREADA") {
      return `/capacitaciones/asignar/${capacitacion.ID_CAPACITACION}`
    } else if (capacitacion.ESTADO_SESION === "FINALIZADA_CAPACITADOR" || capacitacion.ESTADO_SESION === "EN_REVISION") {
      return `capacitaciones/revisar/${capacitacion.ID_SESION}`
    }
    return `/capacitaciones/${capacitacion.ID_SESION}`
  }

  const goToPage = (page: number) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)))
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Todas las Capacitaciones</CardTitle>
          <CardDescription>Vista completa con filtros avanzados</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Filters */}
          <div className="flex flex-col md:flex-row gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por nombre o código..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={estadoFilter} onValueChange={setEstadoFilter}>
              <SelectTrigger className="w-full md:w-48">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="TODOS">Todos los estados</SelectItem>
                <SelectItem value="PENDIENTE_ASIGNACION">Pendiente Asignación</SelectItem>
                {/* <SelectItem value="ASIGNADA">Asignada</SelectItem> */}
                <SelectItem value="PROGRAMADA">Programada</SelectItem>
                <SelectItem value="EN_PROCESO">En Proceso</SelectItem>
                <SelectItem value="FINALIZADA_CAPACITADOR">Finalizada Capacitador</SelectItem>
                <SelectItem value="EN_REVISION">En Revisión</SelectItem>
                <SelectItem value="FINALIZADA">Finalizada</SelectItem>
                <SelectItem value="RECHAZADA">Rechazada</SelectItem>
              </SelectContent>
            </Select>
            <Select value={capacitadorFilter} onValueChange={setCapacitadorFilter}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Capacitador" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="TODOS">Todos los capacitadores</SelectItem>
                {capacitadores
                  .filter((cap): cap is string => cap !== null && cap !== undefined)
                  .map((cap) => (
                    <SelectItem key={cap} value={cap}>
                      {cap}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 py-2 border-y">
            <div className="text-sm text-muted-foreground">
              Mostrando <span className="font-medium text-foreground">{startIndex + 1}</span> a{" "}
              <span className="font-medium text-foreground">{Math.min(endIndex, capacitacionesFiltradas.length)}</span> de{" "}
              <span className="font-medium text-foreground">{capacitacionesFiltradas.length}</span> capacitaciones
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

          {/* Results */}
          <div className="space-y-3">
            {capacitacionesPaginadas.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <BookOpen className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p>No se encontraron capacitaciones</p>
              </div>
            ) : (
              capacitacionesPaginadas.map((cap) => (
                <Card 
                  key={cap.CLAVE_UNICA}
                  className="hover:shadow-lg transition-all border-2 border-transparent hover:border-primary/50 dark:hover:border-primary group"
                >
                  <CardContent className="px-6 py-4">
                    <div className="flex flex-col sm:flex-row items-start justify-between gap-4">
                      <div className="flex-1 space-y-3">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="font-semibold text-lg text-foreground">{cap.CAPACITACION_NOMBRE}</h3>
                          <Badge className={getEstadoCapacitacionColor(cap.ESTADO_SESION)}>{cap.ESTADO_SESION}</Badge>
                          <Badge variant="outline">{cap.TIPO_CAPACITACION}</Badge>
                        </div>

                        <div className="flex flex-wrap gap-4">
                          {cap.CODIGO_DOCUMENTO && (
                            <p className="text-sm text-muted-foreground">
                              <span className="font-medium">Código:</span> {cap.CODIGO_DOCUMENTO}
                            </p>
                          )}

                          {cap.NOMBRE_SESION && (
                            <p className="text-sm text-muted-foreground">
                              <span className="font-medium">Sesión:</span> {cap.NOMBRE_SESION}
                            </p>
                          )}
                        </div>

                        {cap.OBJETIVO && (
                          <p className="text-sm text-muted-foreground line-clamp-2">{cap.OBJETIVO}</p>
                        )}

                        <div className="flex flex-wrap gap-4 text-sm pt-2">
                          <div className="text-muted-foreground">
                            <span className="font-medium text-foreground">Capacitador:</span> {cap.CAPACITADOR_NOMBRE ?? "Por asignar"}
                          </div>
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <Calendar className="h-4 w-4 text-blue-600" />
                            <span>
                              {cap.FECHA_PROGRAMADA
                                ? new Date(cap.FECHA_PROGRAMADA).toLocaleDateString("es-GT")
                                : "Sin fecha"}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <Clock className="h-4 w-4 text-purple-600" />
                            <span>{cap.HORARIO_FORMATO_12H ?? "Sin horario"}</span>
                          </div>
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <Users className="h-4 w-4 text-green-600" />
                            <span>{cap.TOTAL_COLABORADORES} participantes</span>
                          </div>
                        </div>
                      </div>

                      <Link href={getDetailRoute(cap)}>
                        <Button variant="default" className="cursor-pointer">
                          <Eye className="h-4 w-4 mr-2" />
                          Ver Detalle
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>

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
    </div>
  )
}
