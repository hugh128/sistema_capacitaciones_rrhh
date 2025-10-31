"use client"

import { useState, useMemo } from "react"
import { useAuth } from "@/contexts/auth-context"
import { Sidebar } from "@/components/sidebar"
import { AppHeader } from "@/components/app-header"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { ArrowLeft, Calendar, Clock, UserPlus } from "lucide-react"
import Link from "next/link"
import { useParams, useRouter } from "next/navigation"
import { mockCapacitaciones } from "@/lib/mis-capacitaciones/capacitaciones-mock-data"
import { mockUsers } from "@/lib/auth"
import { RequirePermission } from "@/components/RequirePermission"

// Mock colaboradores disponibles
const mockColaboradoresDisponibles = [
  {
    id: 101,
    nombre: "Juan Pérez García",
    departamento: "Laboratorio Clínico",
    puesto: "Técnico de Laboratorio",
    correo: "juan.perez@phara.com",
  },
  {
    id: 102,
    nombre: "María Rodríguez López",
    departamento: "Laboratorio Clínico",
    puesto: "Técnico de Laboratorio",
    correo: "maria.rodriguez@phara.com",
  },
  {
    id: 103,
    nombre: "Pedro Martínez Sánchez",
    departamento: "Laboratorio Clínico",
    puesto: "Auxiliar de Laboratorio",
    correo: "pedro.martinez@phara.com",
  },
  {
    id: 104,
    nombre: "Ana Gómez Torres",
    departamento: "Laboratorio Clínico",
    puesto: "Técnico de Laboratorio",
    correo: "ana.gomez@phara.com",
  },
  {
    id: 105,
    nombre: "Luis Hernández Díaz",
    departamento: "Laboratorio Químico",
    puesto: "Técnico Químico",
    correo: "luis.hernandez@phara.com",
  },
  {
    id: 106,
    nombre: "Carmen Flores Ruiz",
    departamento: "Laboratorio Químico",
    puesto: "Técnico Químico",
    correo: "carmen.flores@phara.com",
  },
  {
    id: 107,
    nombre: "Roberto Silva Castro",
    departamento: "Control de Calidad",
    puesto: "Analista de Calidad",
    correo: "roberto.silva@phara.com",
  },
  {
    id: 108,
    nombre: "Laura Morales Vega",
    departamento: "Control de Calidad",
    puesto: "Analista de Calidad",
    correo: "laura.morales@phara.com",
  },
]

export default function AsignarCapacitacionPage() {
  const { user } = useAuth()
  const params = useParams()
  const router = useRouter()
  const capacitacionId = Number(params.id)

  const capacitacion = useMemo(() => {
    return mockCapacitaciones.find((c) => c.ID_CAPACITACION === capacitacionId)
  }, [capacitacionId])

  // Form state
  const [capacitadorId, setCapacitadorId] = useState("")
  const [fechaInicio, setFechaInicio] = useState("")
  const [horaInicio, setHoraInicio] = useState("")
  const [horaFin, setHoraFin] = useState("")
  const [tipoCapacitacion, setTipoCapacitacion] = useState("")
  const [modalidad, setModalidad] = useState("")
  const [grupoObjetivo, setGrupoObjetivo] = useState("")
  const [objetivo, setObjetivo] = useState("")
  const [aplicaExamen, setAplicaExamen] = useState(false)
  const [notaMinima, setNotaMinima] = useState("")
  const [aplicaDiploma, setAplicaDiploma] = useState(false)
  const [observaciones, setObservaciones] = useState("")
  const [selectedColaboradores, setSelectedColaboradores] = useState<number[]>([])
  const [searchTerm, setSearchTerm] = useState("")

  // Filter colaboradores
  const colaboradoresFiltrados = useMemo(() => {
    return mockColaboradoresDisponibles.filter(
      (col) =>
        col.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
        col.departamento.toLowerCase().includes(searchTerm.toLowerCase()) ||
        col.puesto.toLowerCase().includes(searchTerm.toLowerCase()),
    )
  }, [searchTerm])

  // Get capacitadores (trainers)
  const capacitadores = mockUsers.filter((u) => u.roles.some((r) => r.nombre === "Capacitador"))

  if (!user || !user.ROLES.some((role) => role.NOMBRE === "RRHH")) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="w-96">
          <CardHeader>
            <CardTitle>Acceso Denegado</CardTitle>
            <CardDescription>No tienes permisos para acceder a esta página.</CardDescription>
          </CardHeader>
        </Card>
      </div>
    )
  }

  if (!capacitacion) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="w-96">
          <CardHeader>
            <CardTitle>Capacitación no encontrada</CardTitle>
            <CardDescription>La capacitación solicitada no existe.</CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/capacitaciones">
              <Button>Volver a Gestión</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  const handleAsignar = () => {
    // Validations
    if (!capacitadorId) {
      alert("Selecciona un capacitador")
      return
    }
    if (!fechaInicio) {
      alert("Selecciona una fecha de inicio")
      return
    }
    if (!horaInicio || !horaFin) {
      alert("Selecciona hora de inicio y fin")
      return
    }
    if (horaFin <= horaInicio) {
      alert("La hora de fin debe ser mayor a la hora de inicio")
      return
    }
    if (selectedColaboradores.length === 0) {
      alert("Selecciona al menos un colaborador")
      return
    }
    if (aplicaExamen && (!notaMinima || Number(notaMinima) < 0 || Number(notaMinima) > 100)) {
      alert("Ingresa una nota mínima válida entre 0 y 100")
      return
    }

    alert(`Capacitación asignada exitosamente a ${selectedColaboradores.length} colaboradores`)
    router.push("/capacitaciones")
    // In real app, this would be an API call
  }

  return (
    <RequirePermission requiredPermissions={["manage_trainings"]}>
      <div className="flex h-screen bg-background">
        <Sidebar />
        <div className="flex-1 flex flex-col overflow-hidden">

          <AppHeader title="Gestión de Capacitaciones" subtitle="Panel de control para administrar todas las capacitaciones de la empresa" />

          <main className="flex-1 p-6 space-y-6 overflow-auto custom-scrollbar">
            {/* Header */}
            <div className="flex items-center gap-4">
              <Link href="/capacitaciones">
                <Button variant="outline" size="icon">
                  <ArrowLeft className="h-4 w-4" />
                </Button>
              </Link>
              <div>
                <h1 className="text-3xl font-bold text-foreground">Asignar Capacitación</h1>
                <p className="text-muted-foreground mt-1">{capacitacion.NOMBRE}</p>
              </div>
            </div>

            {/* Form */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left Column - Form */}
              <div className="lg:col-span-2 space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Información de la Capacitación</CardTitle>
                    <CardDescription>Completa los datos para asignar la capacitación</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="capacitador">Capacitador *</Label>
                        <Select value={capacitadorId} onValueChange={setCapacitadorId}>
                          <SelectTrigger id="capacitador">
                            <SelectValue placeholder="Seleccionar capacitador" />
                          </SelectTrigger>
                          <SelectContent>
                            {capacitadores.map((cap) => (
                              <SelectItem key={cap.id} value={cap.id}>
                                {cap.nombre} {cap.apellido}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label htmlFor="fecha">Fecha de Inicio *</Label>
                        <Input
                          id="fecha"
                          type="date"
                          value={fechaInicio}
                          onChange={(e) => setFechaInicio(e.target.value)}
                        />
                      </div>

                      <div>
                        <Label htmlFor="horaInicio">Hora de Inicio *</Label>
                        <Input
                          id="horaInicio"
                          type="time"
                          value={horaInicio}
                          onChange={(e) => setHoraInicio(e.target.value)}
                        />
                      </div>

                      <div>
                        <Label htmlFor="horaFin">Hora de Fin *</Label>
                        <Input id="horaFin" type="time" value={horaFin} onChange={(e) => setHoraFin(e.target.value)} />
                      </div>

                      <div>
                        <Label htmlFor="tipo">Tipo de Capacitación *</Label>
                        <Select value={tipoCapacitacion} onValueChange={setTipoCapacitacion}>
                          <SelectTrigger id="tipo">
                            <SelectValue placeholder="Seleccionar tipo" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="TALLER">Taller</SelectItem>
                            <SelectItem value="CURSO">Curso</SelectItem>
                            <SelectItem value="CHARLA">Charla</SelectItem>
                            <SelectItem value="OTRO">Otro</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label htmlFor="modalidad">Modalidad *</Label>
                        <Select value={modalidad} onValueChange={setModalidad}>
                          <SelectTrigger id="modalidad">
                            <SelectValue placeholder="Seleccionar modalidad" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="INTERNA">Interna</SelectItem>
                            <SelectItem value="EXTERNA">Externa</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="grupoObjetivo">Grupo Objetivo</Label>
                      <Input
                        id="grupoObjetivo"
                        value={grupoObjetivo}
                        onChange={(e) => setGrupoObjetivo(e.target.value)}
                        placeholder="Ej: Personal de laboratorio nuevo"
                      />
                    </div>

                    <div>
                      <Label htmlFor="objetivo">Objetivo</Label>
                      <Textarea
                        id="objetivo"
                        value={objetivo}
                        onChange={(e) => setObjetivo(e.target.value)}
                        placeholder="Describe el objetivo de la capacitación..."
                        rows={3}
                      />
                    </div>

                    <div className="space-y-3 pt-4 border-t">
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="aplicaExamen"
                          checked={aplicaExamen}
                          onCheckedChange={(checked) => setAplicaExamen(checked as boolean)}
                        />
                        <Label htmlFor="aplicaExamen" className="cursor-pointer">
                          Aplica Examen
                        </Label>
                      </div>

                      {aplicaExamen && (
                        <div className="ml-6">
                          <Label htmlFor="notaMinima">Nota Mínima (0-100)</Label>
                          <Input
                            id="notaMinima"
                            type="number"
                            min="0"
                            max="100"
                            value={notaMinima}
                            onChange={(e) => setNotaMinima(e.target.value)}
                            placeholder="70"
                            className="w-32"
                          />
                        </div>
                      )}

                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="aplicaDiploma"
                          checked={aplicaDiploma}
                          onCheckedChange={(checked) => setAplicaDiploma(checked as boolean)}
                        />
                        <Label htmlFor="aplicaDiploma" className="cursor-pointer">
                          Aplica Diploma
                        </Label>
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="observaciones">Observaciones</Label>
                      <Textarea
                        id="observaciones"
                        value={observaciones}
                        onChange={(e) => setObservaciones(e.target.value)}
                        placeholder="Observaciones adicionales..."
                        rows={3}
                      />
                    </div>
                  </CardContent>
                </Card>

                {/* Colaboradores Selection */}
                <Card>
                  <CardHeader>
                    <CardTitle>Seleccionar Participantes</CardTitle>
                    <CardDescription>Selecciona los colaboradores que participarán en esta capacitación</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Input
                        placeholder="Buscar colaboradores..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                      />
                    </div>

                    <div className="border rounded-lg max-h-96 overflow-y-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead className="w-12">
                              <Checkbox
                                checked={selectedColaboradores.length === colaboradoresFiltrados.length}
                                onCheckedChange={(checked) => {
                                  if (checked) {
                                    setSelectedColaboradores(colaboradoresFiltrados.map((c) => c.id))
                                  } else {
                                    setSelectedColaboradores([])
                                  }
                                }}
                              />
                            </TableHead>
                            <TableHead>Nombre</TableHead>
                            <TableHead>Departamento</TableHead>
                            <TableHead>Puesto</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {colaboradoresFiltrados.map((col) => (
                            <TableRow key={col.id}>
                              <TableCell>
                                <Checkbox
                                  checked={selectedColaboradores.includes(col.id)}
                                  onCheckedChange={(checked) => {
                                    if (checked) {
                                      setSelectedColaboradores([...selectedColaboradores, col.id])
                                    } else {
                                      setSelectedColaboradores(selectedColaboradores.filter((id) => id !== col.id))
                                    }
                                  }}
                                />
                              </TableCell>
                              <TableCell>
                                <div>
                                  <p className="font-medium">{col.nombre}</p>
                                  <p className="text-sm text-muted-foreground">{col.correo}</p>
                                </div>
                              </TableCell>
                              <TableCell>{col.departamento}</TableCell>
                              <TableCell>{col.puesto}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>

                    <p className="text-sm text-muted-foreground">
                      {selectedColaboradores.length} colaborador(es) seleccionado(s)
                    </p>
                  </CardContent>
                </Card>
              </div>

              {/* Right Column - Summary */}
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Resumen</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label className="text-muted-foreground">Capacitación</Label>
                      <p className="font-medium">{capacitacion.NOMBRE}</p>
                    </div>

                    {capacitadorId && (
                      <div>
                        <Label className="text-muted-foreground">Capacitador</Label>
                        <p className="font-medium">
                          {capacitadores.find((c) => c.id === capacitadorId)?.nombre}{" "}
                          {capacitadores.find((c) => c.id === capacitadorId)?.apellido}
                        </p>
                      </div>
                    )}

                    {fechaInicio && (
                      <div>
                        <Label className="text-muted-foreground">Fecha</Label>
                        <p className="font-medium flex items-center gap-2">
                          <Calendar className="h-4 w-4" />
                          {new Date(fechaInicio).toLocaleDateString("es-GT")}
                        </p>
                      </div>
                    )}

                    {horaInicio && horaFin && (
                      <div>
                        <Label className="text-muted-foreground">Horario</Label>
                        <p className="font-medium flex items-center gap-2">
                          <Clock className="h-4 w-4" />
                          {horaInicio} - {horaFin}
                        </p>
                      </div>
                    )}

                    <div>
                      <Label className="text-muted-foreground">Participantes</Label>
                      <p className="font-medium">{selectedColaboradores.length} seleccionados</p>
                    </div>

                    {aplicaExamen && (
                      <div>
                        <Label className="text-muted-foreground">Examen</Label>
                        <p className="font-medium">Sí (Nota mínima: {notaMinima || "N/A"})</p>
                      </div>
                    )}

                    {aplicaDiploma && (
                      <div>
                        <Label className="text-muted-foreground">Diploma</Label>
                        <p className="font-medium">Sí</p>
                      </div>
                    )}

                    <Button onClick={handleAsignar} className="w-full" size="lg">
                      <UserPlus className="h-4 w-4 mr-2" />
                      Asignar Capacitación
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </div>
          </main>
        </div>
      </div>
    </RequirePermission>
  )
}
