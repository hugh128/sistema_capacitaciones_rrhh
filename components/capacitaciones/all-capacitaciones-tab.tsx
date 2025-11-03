"use client"

import { useState, useMemo } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar, Clock, Users, Search, Filter, Eye, BookOpen } from "lucide-react"
import Link from "next/link"
import { type Capacitacion, getEstadoCapacitacionColor } from "@/lib/capacitaciones/capacitaciones-types"

interface AllCapacitacionesTabProps {
  capacitaciones: Capacitacion[]
}

export function AllCapacitacionesTab({ capacitaciones }: AllCapacitacionesTabProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [estadoFilter, setEstadoFilter] = useState<string>("TODOS")
  const [capacitadorFilter, setCapacitadorFilter] = useState<string>("TODOS")

  const capacitadores = useMemo(() => {
    const unique = new Set(capacitaciones.map((c) => c.CAPACITADOR_NOMBRE))
    return Array.from(unique).filter((c) => c !== "Por asignar")
  }, [capacitaciones])

  const capacitacionesFiltradas = useMemo(() => {
    return capacitaciones.filter((cap) => {
      const matchesSearch =
        cap.NOMBRE.toLowerCase().includes(searchTerm.toLowerCase()) ||
        cap.CODIGO_DOCUMENTO?.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesEstado = estadoFilter === "TODOS" || cap.ESTADO === estadoFilter
      const matchesCapacitador = capacitadorFilter === "TODOS" || cap.CAPACITADOR_NOMBRE === capacitadorFilter
      return matchesSearch && matchesEstado && matchesCapacitador
    })
  }, [searchTerm, estadoFilter, capacitadorFilter, capacitaciones])

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
                <SelectItem value="ASIGNADA">Asignada</SelectItem>
                <SelectItem value="EN_PROCESO">En Proceso</SelectItem>
                <SelectItem value="FINALIZADA_CAPACITADOR">Finalizada Capacitador</SelectItem>
                <SelectItem value="EN_REVISION">En Revisión</SelectItem>
                <SelectItem value="FINALIZADA">Finalizada</SelectItem>
                <SelectItem value="CANCELADA">Cancelada</SelectItem>
              </SelectContent>
            </Select>
            <Select value={capacitadorFilter} onValueChange={setCapacitadorFilter}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Capacitador" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="TODOS">Todos los capacitadores</SelectItem>
                {capacitadores.map((cap) => (
                  <SelectItem key={cap} value={cap}>
                    {cap}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Results */}
          <div className="space-y-3">
            {capacitacionesFiltradas.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <BookOpen className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p>No se encontraron capacitaciones</p>
              </div>
            ) : (
              capacitacionesFiltradas.map((cap) => (
                <Card key={cap.ID_CAPACITACION} className="hover:shadow-md transition-shadow">
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 space-y-3">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="font-semibold text-lg text-foreground">{cap.NOMBRE}</h3>
                          <Badge className={getEstadoCapacitacionColor(cap.ESTADO)}>{cap.ESTADO}</Badge>
                          <Badge variant="outline">{cap.TIPO_CAPACITACION}</Badge>
                        </div>

                        {cap.CODIGO_DOCUMENTO && (
                          <p className="text-sm text-muted-foreground">
                            <span className="font-medium">Código:</span> {cap.CODIGO_DOCUMENTO}
                          </p>
                        )}

                        <p className="text-sm text-muted-foreground line-clamp-2">{cap.OBJETIVO}</p>

                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
                          <div className="text-muted-foreground">
                            <span className="font-medium text-foreground">Capacitador:</span> {cap.CAPACITADOR_NOMBRE}
                          </div>
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <Calendar className="h-4 w-4" />
                            <span>
                              {cap.FECHA_PROGRAMADA
                                ? new Date(cap.FECHA_PROGRAMADA).toLocaleDateString("es-GT")
                                : "Sin fecha"}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <Clock className="h-4 w-4" />
                            <span>{cap.HORARIO_FORMATO}</span>
                          </div>
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <Users className="h-4 w-4" />
                            <span>{cap.TOTAL_COLABORADORES_PENDIENTES} participantes</span>
                          </div>
                        </div>
                      </div>

                      <Link href={`/capacitaciones/${cap.ID_CAPACITACION}`}>
                        <Button variant="outline" className="whitespace-nowrap bg-transparent">
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
        </CardContent>
      </Card>
    </div>
  )
}
