"use client"

import { useState, useEffect, useCallback } from "react"
import { useAuth } from "@/contexts/auth-context"
import { Sidebar } from "@/components/sidebar"
import { AppHeader } from "@/components/app-header"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowLeft, AlertCircle } from "lucide-react"
import Link from "next/link"
import { useParams, useRouter } from "next/navigation"
import { RequirePermission } from "@/components/RequirePermission"
import { useCapacitaciones } from "@/hooks/useCapacitaciones"
import type { Capacitador, Capacitacion, AsignarCapacitacion, ColaboradoresSinSesion, AsignarSesion } from "@/lib/capacitaciones/capacitaciones-types"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { FormularioCapacitacion } from "@/components/capacitaciones-asignar/formulario-capacitaciones"
import { TablaColaboradores } from "@/components/capacitaciones-asignar/tabla-colaboradores"
import { ResumenCapacitacion } from "@/components/capacitaciones-asignar/resumen-capacitacion"

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
  const [version, setVersion] = useState<number>(0);

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
          if (detalle.DOCUMENTO_VERSION) setVersion(detalle.DOCUMENTO_VERSION);
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

  const handleAsignar = useCallback(async () => {
    const errors: string[] = [];

    if (!capacitadorId) errors.push("Selecciona un capacitador.");
    if (!fechaInicio) errors.push("Selecciona una fecha de inicio.");
    
    if (!horaInicio || !horaFin) {
      errors.push("Debes seleccionar hora de inicio y fin.");
    } else if (horaFin <= horaInicio) {
      errors.push("La hora de fin debe ser posterior a la hora de inicio.");
    }

    if (selectedColaboradores.length === 0) errors.push("Selecciona al menos un colaborador.");
    
    if (aplicaExamen && (!notaMinima || Number(notaMinima) < 0 || Number(notaMinima) > 100)) {
      errors.push("Ingresa una nota mínima válida entre 0 y 100.");
    }
    
    setValidationErrors(errors);
    if (errors.length > 0) return;

    if (!user) {
      console.error("Usuario no autenticado.");
      setValidationErrors((prev) => [...prev, "Usuario no autenticado."]);
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
      version: Number(version)
    };

    console.log(payloadSesion)

    try {
      await asignarCapacitacion(payloadCapacitacion);
      await asignarSesion(payloadSesion);
      router.push("/capacitaciones");
    } catch (error) {
      console.error("Error al completar la asignación:", error);
    }
  }, [
    capacitadorId, fechaInicio, horaInicio, horaFin, selectedColaboradores,
    aplicaExamen, notaMinima, capacitacionId, tipoCapacitacion, modalidad,
    aplicaDiploma, grupoObjetivo, observaciones, user, objetivo, version,
    asignarCapacitacion, asignarSesion, router
  ])

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

  return (
    <RequirePermission requiredPermissions={["manage_trainings"]}>
      <div className="flex h-screen bg-background">
        <Sidebar />
        <div className="flex-1 flex flex-col overflow-hidden">
          <AppHeader 
            title="Gestión de Capacitaciones" 
            subtitle="Panel de control para administrar todas las capacitaciones de la empresa" 
          />

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

            <div className="flex items-center gap-4">
              <Link href="/capacitaciones">
                <Button variant="outline" size="icon" className="cursor-pointer dark:hover:text-foreground dark:hover:border-gray-600">
                  <ArrowLeft className="h-4 w-4" />
                </Button>
              </Link>
              <div>
                <h1 className="text-3xl font-bold text-foreground">Asignar Capacitación</h1>
                <p className="text-xl mt-1">
                  {capacitacion.NOMBRE}
                  {capacitacion.DOCUMENTO_VERSION && ` - Versión: ${capacitacion.DOCUMENTO_VERSION}`}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-6">
                <FormularioCapacitacion
                  capacitadorId={capacitadorId}
                  setCapacitadorId={setCapacitadorId}
                  fechaInicio={fechaInicio}
                  setFechaInicio={setFechaInicio}
                  horaInicio={horaInicio}
                  setHoraInicio={setHoraInicio}
                  horaFin={horaFin}
                  setHoraFin={setHoraFin}
                  tipoCapacitacion={tipoCapacitacion}
                  setTipoCapacitacion={setTipoCapacitacion}
                  modalidad={modalidad}
                  setModalidad={setModalidad}
                  grupoObjetivo={grupoObjetivo}
                  setGrupoObjetivo={setGrupoObjetivo}
                  objetivo={objetivo}
                  setObjetivo={setObjetivo}
                  aplicaExamen={aplicaExamen}
                  setAplicaExamen={setAplicaExamen}
                  notaMinima={notaMinima}
                  setNotaMinima={setNotaMinima}
                  aplicaDiploma={aplicaDiploma}
                  setAplicaDiploma={setAplicaDiploma}
                  observaciones={observaciones}
                  setObservaciones={setObservaciones}
                  capacitadores={capacitadores}
                />

                <TablaColaboradores
                  colaboradoresDisponibles={colaboradoresDisponibles}
                  selectedColaboradores={selectedColaboradores}
                  setSelectedColaboradores={setSelectedColaboradores}
                />
              </div>

              <div className="space-y-6">
                <ResumenCapacitacion
                  capacitacion={capacitacion}
                  capacitadorId={capacitadorId}
                  capacitadores={capacitadores}
                  fechaInicio={fechaInicio}
                  horaInicio={horaInicio}
                  horaFin={horaFin}
                  selectedColaboradores={selectedColaboradores}
                  aplicaExamen={aplicaExamen}
                  notaMinima={notaMinima}
                  aplicaDiploma={aplicaDiploma}
                  onAsignar={handleAsignar}
                />
              </div>
            </div>
          </main>
        </div>
      </div>
    </RequirePermission>
  )
}
