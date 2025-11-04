"use client"

import { useState, useMemo, useEffect } from "react"
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
import { ArrowLeft, Calendar, Clock, UserPlus, AlertCircle } from "lucide-react"
import Link from "next/link"
import { useParams, useRouter } from "next/navigation"
import { RequirePermission } from "@/components/RequirePermission"
import { useCapacitaciones } from "@/hooks/useCapacitaciones"
import type { Capacitador, Capacitacion, AsignarCapacitacion, ColaboradoresSinSesion, AsignarSesion } from "@/lib/capacitaciones/capacitaciones-types"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

export default function AsignarCapacitacionPage() {
  const { user } = useAuth()
  const params = useParams()
  const router = useRouter()
  const capacitacionId = Number(params.id)
  const {
    obtenerDetallesCapacitacion,
    obtenerCapacitadores,
    obtenerColaboradoresSinSesion,
    asignarCapacitacion,
    asignarSesion,
  } = useCapacitaciones(user);

  const [capacitacion, setCapacitacion] = useState<Capacitacion>()
  const [capacitadores, setCapacitadores] = useState<Capacitador[]>([])
  const [colaboradoresDisponibles, setColaboradoresDisponibles] = useState<ColaboradoresSinSesion[]>([])
  const [isLoading, setIsLoading] = useState(true);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);

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

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const detalle = await obtenerDetallesCapacitacion(capacitacionId)
        setCapacitacion(detalle)

        if (detalle) {
          if (detalle.TIPO_CAPACITACION) setTipoCapacitacion(detalle.TIPO_CAPACITACION);
          if (detalle.MODALIDAD) setModalidad(detalle.MODALIDAD);
          if (detalle.APLICA_DIPLOMA !== undefined) setAplicaDiploma(detalle.APLICA_DIPLOMA);
          if (detalle.APLICA_EXAMEN !== undefined) setAplicaExamen(detalle.APLICA_EXAMEN);
          if (detalle.NOTA_MINIMA) setNotaMinima(String(detalle.NOTA_MINIMA)); 
        }

        const lista = await obtenerCapacitadores()
        setCapacitadores(lista)

        const colaboradoresDisponiblesAsignacion = await obtenerColaboradoresSinSesion(capacitacionId)
        setColaboradoresDisponibles(colaboradoresDisponiblesAsignacion)
      } catch (error) {
        console.error('Error al cargar datos:', error)
      } finally {
        setIsLoading(false);
      }
    }

    fetchData()
  }, [capacitacionId, obtenerDetallesCapacitacion, obtenerCapacitadores, obtenerColaboradoresSinSesion])

  // Filter colaboradores
  const colaboradoresFiltrados = useMemo(() => {
    return (colaboradoresDisponibles ?? []).filter(
      (col) =>
        col.NOMBRE_COMPLETO.toLowerCase().includes(searchTerm.toLowerCase()) ||
        col.DEPARTAMENTO.toLowerCase().includes(searchTerm.toLowerCase()) ||
        col.PUESTO.toLowerCase().includes(searchTerm.toLowerCase()),
    )
  }, [searchTerm, colaboradoresDisponibles])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="w-96">
          <CardHeader>
            <CardTitle>Cargando Detalles...</CardTitle>
            <CardDescription>Obteniendo información de la capacitación y capacitadores.</CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </CardContent>
        </Card>
      </div>
    );
  }

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

  const handleAsignar = async () => {
    // Validations
    const errors: string[] = [];

    // 1. Capacitador
    if (!capacitadorId) {
      errors.push("Selecciona un capacitador.");
    }

    // 2. Fecha de Inicio
    if (!fechaInicio) {
      errors.push("Selecciona una fecha de inicio.");
    }

    // 3. Horas y lógica de horario
    if (!horaInicio || !horaFin) {
      errors.push("Debes seleccionar hora de inicio y fin.");
    } else if (horaFin <= horaInicio) {
      errors.push("La hora de fin debe ser posterior a la hora de inicio.");
    }

    // 4. Colaboradores Seleccionados
    if (selectedColaboradores.length === 0) {
      errors.push("Selecciona al menos un colaborador.");
    }

    // 5. Nota Mínima (si aplica examen)
    if (aplicaExamen && (!notaMinima || Number(notaMinima) < 0 || Number(notaMinima) > 100)) {
      errors.push("Ingresa una nota mínima válida entre 0 y 100.");
    }
    
    setValidationErrors(errors);

    if (errors.length > 0) {
      return;
    }

    const payloadCapacitacion: AsignarCapacitacion = {
      idCapacitacion: capacitacionId,
      idsColaboradores: selectedColaboradores,
      tipoCapacitacion: tipoCapacitacion,
      modalidad: modalidad,
      aplicaExamen: aplicaExamen,
      notaMinima: aplicaExamen ? Number(notaMinima) : null,
      aplicaDiploma: aplicaDiploma,
    };
    
    const payloadSesion: AsignarSesion = {
      idCapacitacion: capacitacionId,
      capacitadorId: Number(capacitadorId),
      fechaInicio: fechaInicio,
      horaInicio: horaInicio,
      horaFin: horaFin,
      idsColaboradores: selectedColaboradores,
      grupoObjetivo: grupoObjetivo,
      observaciones: observaciones,
      usuario: user.USERNAME,
      objetivo: objetivo,
    };

    try {
      await asignarCapacitacion(payloadCapacitacion);
      await asignarSesion(payloadSesion);
      router.push("/capacitaciones");
        
    } catch (error) {
      console.error("Error al completar la asignación:", error);
    }
  }

  return (
    <RequirePermission requiredPermissions={["manage_trainings"]}>
      <div className="flex h-screen bg-background">
        <Sidebar />
        <div className="flex-1 flex flex-col overflow-hidden">

          <AppHeader title="Gestión de Capacitaciones" subtitle="Panel de control para administrar todas las capacitaciones de la empresa" />

          <main className="flex-1 p-6 space-y-6 overflow-auto custom-scrollbar">

          {validationErrors.length > 0 && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Se encontraron {validationErrors.length} errores</AlertTitle>
              <AlertDescription>
                <p>Por favor, corrige los siguientes problemas antes de continuar:</p>
                <ul className="list-inside list-disc text-sm mt-2 space-y-1">
                  {validationErrors.map((error, index) => (
                    <li key={index} className="text-destructive-foreground">{error}</li>
                  ))}
                </ul>
              </AlertDescription>
            </Alert>
          )}

            {/* Header */}
            <div className="flex items-center gap-4">
              <Link href="/capacitaciones">
                <Button variant="outline" size="icon">
                  <ArrowLeft className="h-4 w-4" />
                </Button>
              </Link>
              <div>
                <h1 className="text-3xl font-bold text-foreground">Asignar Capacitación</h1>
                <p className="text-xl mt-1">{capacitacion.NOMBRE}</p>
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
                              <SelectItem key={cap.PERSONA_ID} value={cap.PERSONA_ID.toString()}>
                                {cap.NOMBRE} {cap.APELLIDO}
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
                            <SelectItem value="TALLER">TALLER</SelectItem>
                            <SelectItem value="CURSO">CURSO</SelectItem>
                            <SelectItem value="CHARLA">CHARLA</SelectItem>
                            <SelectItem value="OTRO">OTRO</SelectItem>
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
                            <SelectItem value="INTERNA">INTERNA</SelectItem>
                            <SelectItem value="EXTERNA">EXTERNA</SelectItem>
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
                          className="cursor-pointer"
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
                          className="cursor-pointer"
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
                                className="cursor-pointer"
                                checked={selectedColaboradores.length === colaboradoresFiltrados.length}
                                onCheckedChange={(checked) => {
                                  if (checked) {
                                    setSelectedColaboradores(colaboradoresFiltrados.map((c) => c.ID_COLABORADOR))
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
                            <TableRow key={col.ID_COLABORADOR}>
                              <TableCell>
                                <Checkbox
                                  className="cursor-pointer"
                                  checked={selectedColaboradores.includes(col.ID_COLABORADOR)}
                                  onCheckedChange={(checked) => {
                                    if (checked) {
                                      setSelectedColaboradores([...selectedColaboradores, col.ID_COLABORADOR])
                                    } else {
                                      setSelectedColaboradores(selectedColaboradores.filter((id) => id !== col.ID_COLABORADOR))
                                    }
                                  }}
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
                          {capacitadores.find((c) => c.PERSONA_ID === +capacitadorId)?.NOMBRE}{" "}
                          {capacitadores.find((c) => c.PERSONA_ID === +capacitadorId)?.APELLIDO}
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
