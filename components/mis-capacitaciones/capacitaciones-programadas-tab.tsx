"use client"

import { useState, useMemo, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Calendar,
  Clock,
  Users,
  Search,
  Eye,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  CheckCircle2,
} from "lucide-react"
import Link from "next/link"
import { CapacitacionSesion, getEstadoColor } from "@/lib/mis-capacitaciones/capacitaciones-types"

interface CapacitacionesProgramadasTabProps {
  capacitaciones: CapacitacionSesion[]
  loading?: boolean
}

function CapacitacionCardSkeleton() {
  return (
    <Card className="border-2">
      <CardContent className="px-6 py-4">
        <div className="flex flex-col sm:flex-row items-start justify-between gap-4">
          <div className="flex-1 space-y-3 w-full">
            <div className="flex items-center gap-3 flex-wrap">
              <Skeleton className="h-7 w-64" />
              <Skeleton className="h-5 w-24" />
              <Skeleton className="h-5 w-20" />
            </div>
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-4 w-full" />
            <div className="flex flex-wrap gap-4 pt-2">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-4 w-40" />
              <Skeleton className="h-4 w-28" />
            </div>
          </div>
          <Skeleton className="h-10 w-32" />
        </div>
      </CardContent>
    </Card>
  )
}

export function CapacitacionesProgramadasTab({ capacitaciones, loading = false }: CapacitacionesProgramadasTabProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(10)

  const searchTermLower = useMemo(() => searchTerm.toLowerCase(), [searchTerm])

  const capacitacionesFiltradas = useMemo(() => {
    if (!Array.isArray(capacitaciones) || capacitaciones.length === 0) {
      return []
    }

    return capacitaciones.filter((cap) => {
      const matchesSearch = !searchTerm || 
        cap.NOMBRE?.toLowerCase().includes(searchTermLower) ||
        cap.CODIGO_DOCUMENTO?.toLowerCase().includes(searchTermLower)
      
      return matchesSearch
    })
  }, [capacitaciones, searchTerm, searchTermLower])

  useEffect(() => {
    setCurrentPage(1)
  }, [searchTerm])

  const paginationData = useMemo(() => {
    const totalItems = capacitacionesFiltradas.length
    const totalPages = Math.max(1, Math.ceil(totalItems / itemsPerPage))
    const startIndex = (currentPage - 1) * itemsPerPage
    const endIndex = startIndex + itemsPerPage
    const currentItems = capacitacionesFiltradas.slice(startIndex, endIndex)
    
    return {
      totalItems,
      totalPages,
      startIndex,
      endIndex,
      currentItems,
      showingFrom: totalItems === 0 ? 0 : startIndex + 1,
      showingTo: Math.min(endIndex, totalItems)
    }
  }, [capacitacionesFiltradas, currentPage, itemsPerPage])

  const goToPage = (page: number) => {
    setCurrentPage(Math.max(1, Math.min(page, paginationData.totalPages)))
  }

  return (
    <Card className="shadow-sm">
      <CardHeader>
        <CardTitle>Capacitaciones Programadas y Rechazadas</CardTitle>
        <CardDescription>
          Capacitaciones que requieren tu atención inmediata
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Barra de búsqueda */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              placeholder="Buscar por nombre o código..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 h-11 text-base"
              disabled={loading}
            />
          </div>
        </div>

        {loading ? (
          <>
            {/* Skeleton barra de información */}
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4 py-2 border-y">
              <Skeleton className="h-5 w-64" />
              <div className="flex items-center gap-2">
                <Skeleton className="h-5 w-32" />
                <Skeleton className="h-9 w-20" />
              </div>
            </div>

            {/* Skeletons de tarjetas */}
            <div className="space-y-4">
              {Array.from({ length: 3 }).map((_, idx) => (
                <CapacitacionCardSkeleton key={idx} />
              ))}
            </div>
          </>
        ) : capacitaciones.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <CheckCircle2 className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p>No hay capacitaciones programadas o rechazadas</p>
            <p className="text-sm mt-2">¡Excelente trabajo! Todo está al día</p>
          </div>
        ) : (
          <>
            {/* Barra de información */}
            {paginationData.totalItems > 0 && (
              <div className="flex flex-col sm:flex-row justify-between items-center gap-4 py-2 border-y">
                <div className="text-sm text-muted-foreground">
                  Mostrando <span className="font-semibold text-foreground">{paginationData.showingFrom}</span> a{" "}
                  <span className="font-semibold text-foreground">{paginationData.showingTo}</span> de{" "}
                  <span className="font-semibold text-foreground">{paginationData.totalItems}</span> capacitaciones
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground whitespace-nowrap">Mostrar:</span>
                  <Select 
                    value={itemsPerPage.toString()} 
                    onValueChange={(value) => {
                      setItemsPerPage(Number(value))
                      setCurrentPage(1)
                    }}
                  >
                    <SelectTrigger className="w-20 h-9">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="5">5</SelectItem>
                      <SelectItem value="10">10</SelectItem>
                      <SelectItem value="20">20</SelectItem>
                      <SelectItem value="50">50</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}

            {/* Lista de capacitaciones */}
            <div className="space-y-4">
              {paginationData.totalItems === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <Search className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p className="text-lg font-medium">No se encontraron capacitaciones</p>
                  <p className="text-sm mt-1">Intenta con otros términos de búsqueda</p>
                </div>
              ) : (
                paginationData.currentItems.map((cap) => (
                  <Card
                    key={cap.ID_SESION}
                    className="hover:shadow-lg transition-all border-2 hover:border-primary/50 dark:hover:border-primary group"
                  >
                    <CardContent className="px-6 py-4">
                      <div className="flex flex-col sm:flex-row items-start justify-between gap-4">
                        <div className="flex-1 space-y-3">
                          <div className="flex items-center gap-3 flex-wrap">
                            <h3 className="font-bold text-lg sm:text-xl group-hover:text-primary transition-colors dark:group-hover:text-foreground">
                              {cap.NOMBRE}
                            </h3>
                            <Badge className={`${getEstadoColor(cap.ESTADO)} text-xs px-3 py-1`}>
                              {cap.ESTADO}
                            </Badge>
                            <Badge variant="outline" className="text-xs px-3 py-1">
                              {cap.TIPO_CAPACITACION}
                            </Badge>
                          </div>
                          {cap.CODIGO_DOCUMENTO && (
                            <p className="text-sm text-muted-foreground font-mono bg-muted px-2 py-1 rounded inline-block">
                              {cap.CODIGO_DOCUMENTO}
                            </p>
                          )}
                          <p className="text-sm text-muted-foreground leading-relaxed">{cap.GRUPO_OBJETIVO}</p>
                          <div className="flex flex-wrap gap-4 text-sm pt-2">
                            <span className="flex items-center gap-2 text-muted-foreground">
                              <Calendar className="h-4 w-4 text-blue-600" />
                              <span className="font-medium">
                                {cap.FECHA_PROGRAMADA
                                  ? new Date(cap.FECHA_PROGRAMADA).toLocaleDateString("es-GT", {
                                      day: "numeric",
                                      month: "long",
                                      year: "numeric",
                                    })
                                  : "Sin fecha"}
                              </span>
                            </span>
                            <span className="flex items-center gap-2 text-muted-foreground">
                              <Clock className="h-4 w-4 text-purple-600" />
                              <span className="font-medium">
                                {cap.HORARIO_FORMATO_12H} · {cap.DURACION_FORMATO}
                              </span>
                            </span>
                            <span className="flex items-center gap-2 text-muted-foreground">
                              <Users className="h-4 w-4 text-green-600" />
                              <span className="font-medium">{cap.TOTAL_COLABORADORES} participantes</span>
                            </span>
                          </div>
                        </div>
                        <Link href={`/mis-capacitaciones/${cap.ID_SESION}`}>
                          <Button size="lg" className="shrink-0 cursor-pointer">
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

            {/* Paginación */}
            {paginationData.totalItems > 0 && paginationData.totalPages > 1 && (
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t">
                <div className="text-sm text-muted-foreground">
                  Página <span className="font-semibold text-foreground">{currentPage}</span> de{" "}
                  <span className="font-semibold text-foreground">{paginationData.totalPages}</span>
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
                    {Array.from({ length: Math.min(5, paginationData.totalPages) }, (_, i) => {
                      let pageNumber: number
                      
                      if (paginationData.totalPages <= 5) {
                        pageNumber = i + 1
                      } else if (currentPage <= 3) {
                        pageNumber = i + 1
                      } else if (currentPage >= paginationData.totalPages - 2) {
                        pageNumber = paginationData.totalPages - 4 + i
                      } else {
                        pageNumber = currentPage - 2 + i
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
                      )
                    })}
                  </div>
                  
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => goToPage(currentPage + 1)}
                    disabled={currentPage === paginationData.totalPages}
                    className="h-9 w-9"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => goToPage(paginationData.totalPages)}
                    disabled={currentPage === paginationData.totalPages}
                    className="h-9 w-9"
                  >
                    <ChevronsRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  )
}
