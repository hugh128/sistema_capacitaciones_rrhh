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
import type {
  Capacitador, 
  ColaboradoresSinSesion,
  EditarSesion 
} from "@/lib/capacitaciones/capacitaciones-types"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { FormularioCapacitacion } from "@/components/capacitaciones-asignar/formulario-capacitaciones"
import { TablaColaboradoresEditar } from "@/components/capacitaciones-editar/tabla-colaboradores-editar"
import { ResumenEdicionSesion } from "@/components/capacitaciones-editar/resumen-edicion-sesion"
import { COLABORADORES_SESION, SESION_DETALLE } from "@/lib/mis-capacitaciones/capacitaciones-types"
import toast, { Toaster } from "react-hot-toast"

export default function EditarSesionPage() {
  const { user, loading: isAuthLoading } = useAuth()
  const params = useParams()
  const router = useRouter()
  const sesionId = Number(params.id)
  
  const {
    obtenerDetalleSesion,
    obtenerCapacitadores,
    obtenerColaboradoresSinSesion,
    editarSesion,
  } = useCapacitaciones(user);

  const [sesionOriginal, setSesionOriginal] = useState<SESION_DETALLE | null>(null)
  const [colaboradoresOriginales, setColaboradoresOriginales] = useState<COLABORADORES_SESION[]>([])
  const [capacitadores, setCapacitadores] = useState<Capacitador[]>([])
  const [colaboradoresDisponibles, setColaboradoresDisponibles] = useState<ColaboradoresSinSesion[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [validationErrors, setValidationErrors] = useState<string[]>([])

  const [capacitadorId, setCapacitadorId] = useState("")
  const [fechaProgramada, setFechaProgramada] = useState("")
  const [horaInicio, setHoraInicio] = useState("")
  const [horaFin, setHoraFin] = useState("")
  const [nombreSesion, setNombreSesion] = useState("")
  const [tipoCapacitacion, setTipoCapacitacion] = useState("")
  const [modalidad, setModalidad] = useState("")
  const [grupoObjetivo, setGrupoObjetivo] = useState("")
  const [objetivo, setObjetivo] = useState("")
  const [aplicaExamen, setAplicaExamen] = useState(false)
  const [notaMinima, setNotaMinima] = useState("")
  const [aplicaDiploma, setAplicaDiploma] = useState(false)
  const [observaciones, setObservaciones] = useState("")
  const [selectedColaboradores, setSelectedColaboradores] = useState<number[]>([])
  const [categoria, setCategoria] = useState("")

  useEffect(() => {
    if (isAuthLoading) {
      return;
    }

    if (!user || !user.PERSONA_ID) {
      setIsLoading(false);
      return; 
    }

    const fetchData = async () => {
      setIsLoading(true)
      try {
        const detalleSesion = await obtenerDetalleSesion(sesionId)
        
        if (!detalleSesion || !detalleSesion.SESION) {
          console.error("Respuesta inválida del servidor")
          router.push("/capacitaciones")
          return
        }

        const { SESION, COLABORADORES } = detalleSesion

        if (SESION.ESTADO !== 'PROGRAMADA' && SESION.ESTADO !== 'CREADA') {
          router.push("/capacitaciones")
          return
        }

        setSesionOriginal(SESION)
        setColaboradoresOriginales(COLABORADORES || [])

        setCapacitadorId(SESION.CAPACITADOR_ID?.toString() || "")
        
        if (SESION.FECHA_PROGRAMADA) {
          const fecha = new Date(SESION.FECHA_PROGRAMADA)
          setFechaProgramada(fecha.toISOString().split('T')[0])
        }
        
        if (SESION.HORA_INICIO) {
          const horaInicioDate = new Date(SESION.HORA_INICIO)
          const hours = horaInicioDate.getHours()
          const minutes = horaInicioDate.getMinutes()
          setHoraInicio(`${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`)
        }
        
        if (SESION.HORA_FIN) {
          const horaFinDate = new Date(SESION.HORA_FIN)
          const hours = horaFinDate.getHours()
          const minutes = horaFinDate.getMinutes()
          setHoraFin(`${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`)
        }

        setNombreSesion(SESION.NOMBRE_SESION || "")
        setTipoCapacitacion(SESION.TIPO_CAPACITACION || "")
        setModalidad(SESION.MODALIDAD || "")
        setGrupoObjetivo(SESION.GRUPO_OBJETIVO || "")
        setObjetivo(SESION.OBJETIVO || "")
        setAplicaExamen(SESION.APLICA_EXAMEN || false)
        setNotaMinima(SESION.NOTA_MINIMA?.toString() || "")
        setAplicaDiploma(SESION.APLICA_DIPLOMA || false)
        setCategoria(SESION.CATEGORIA || "")
        setObservaciones(SESION.OBSERVACIONES_SESION || "")
        
        const idsColaboradoresActuales = (COLABORADORES || []).map((c: COLABORADORES_SESION) => c.ID_COLABORADOR)
        setSelectedColaboradores(idsColaboradoresActuales)

        const listaCapacitadores = await obtenerCapacitadores()
        setCapacitadores(listaCapacitadores)

        const colaboradoresDisponiblesAsignacion = await obtenerColaboradoresSinSesion(
          SESION.ID_CAPACITACION
        )
        setColaboradoresDisponibles(colaboradoresDisponiblesAsignacion)

      } catch (error) {
        console.error('Error al cargar datos:', error)
        router.push("/capacitaciones")
      } finally {
        setIsLoading(false)
      }
    }

    if (sesionId && user) {
      fetchData()
    }
  }, [isAuthLoading, user, sesionId, obtenerDetalleSesion, obtenerCapacitadores, obtenerColaboradoresSinSesion, router])

  const handleEditar = useCallback(async () => {
    const errors: string[] = []

    if (!capacitadorId) {
      errors.push("Selecciona un capacitador.")
      toast.error("Selecciona un capacitador.")
    }

    if (!fechaProgramada) {
      errors.push("Selecciona una fecha para programar la sesión.")
      toast.error("Selecciona una fecha para programar la sesión.")
    }
    
    if (!horaInicio || !horaFin) {
      errors.push("Debes seleccionar hora de inicio y fin.")
      toast.error("Debes seleccionar hora de inicio y fin.")
    } else if (horaFin <= horaInicio) {
      errors.push("La hora de fin debe ser posterior a la hora de inicio.")
      toast.error("La hora de fin debe ser posterior a la hora de inicio.")
    }

    if (selectedColaboradores.length === 0) {
      errors.push("Debe haber al menos un colaborador asignado.")
      toast.error("Debe haber al menos un colaborador asignado.")
    }
    
    if (aplicaExamen && (!notaMinima || Number(notaMinima) < 0 || Number(notaMinima) > 100)) {
      errors.push("Ingresa una nota mínima válida entre 0 y 100.")
      toast.error("Ingresa una nota mínima válida entre 0 y 100.")
    }
    
    setValidationErrors(errors)
    if (errors.length > 0) return

    if (!user) {
      console.error("Usuario no autenticado.")
      setValidationErrors((prev) => [...prev, "Usuario no autenticado."])
      return
    }

    const colaboradoresOriginalesIds = colaboradoresOriginales.map(c => c.ID_COLABORADOR)
    
    const idsColaboradoresAgregar = selectedColaboradores.filter(
      id => !colaboradoresOriginalesIds.includes(id)
    )
    
    const idsColaboradoresQuitar = colaboradoresOriginalesIds.filter(
      id => !selectedColaboradores.includes(id)
    )

    const payloadEditarSesion: EditarSesion = {
      idSesion: sesionId,
      capacitadorId: Number(capacitadorId),
      fechaProgramada: fechaProgramada,
      horaInicio: horaInicio,
      horaFin: horaFin,
      nombreSesion: nombreSesion,
      tipoCapacitacion: tipoCapacitacion,
      modalidad: modalidad,
      grupoObjetivo: grupoObjetivo,
      objetivo: objetivo || "",
      aplicaExamen: aplicaExamen,
      notaMinima: aplicaExamen ? Number(notaMinima) : null,
      aplicaDiploma: aplicaDiploma,
      observaciones: observaciones,
      idsColaboradoresAgregar: idsColaboradoresAgregar,
      idsColaboradoresQuitar: idsColaboradoresQuitar,
      usuario: user.USERNAME,
      categoria: categoria,
    }

    try {
      await editarSesion(payloadEditarSesion)
      router.push(`/capacitaciones/${sesionId}`)
    } catch (error) {
      console.error("Error al editar la sesión:", error)
    }
  }, [
    capacitadorId, fechaProgramada, horaInicio, horaFin, nombreSesion, selectedColaboradores,
    aplicaExamen, notaMinima, sesionId, tipoCapacitacion, modalidad, aplicaDiploma,
    grupoObjetivo, objetivo, observaciones, user, colaboradoresOriginales, router, categoria, editarSesion,
  ])

  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-background/5 z-[100] flex items-center justify-center">
        <Card className="w-96">
          <CardHeader>
            <CardTitle>Cargando Sesión...</CardTitle>
            <CardDescription>Obteniendo información de la sesión.</CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </CardContent>
        </Card>
      </div>
    )
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

  if (!sesionOriginal) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="w-96">
          <CardHeader>
            <CardTitle>Sesión no encontrada</CardTitle>
            <CardDescription>La sesión solicitada no existe.</CardDescription>
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
    <RequirePermission requiredPermissions={["trainings_access"]}>
      <div className="flex h-screen bg-background">
        <Sidebar />
        <div className="flex-1 flex flex-col overflow-hidden">
          <AppHeader 
            title="Gestión de Capacitaciones" 
            subtitle="Panel de control para administrar todas las capacitaciones de la empresa" 
          />

          <main className="flex-1 p-6 space-y-6 overflow-auto custom-scrollbar">
            <Toaster />

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
                <h1 className="text-3xl font-bold text-foreground">Editar Sesión</h1>
                <p className="text-xl mt-1">
                  {sesionOriginal.CAPACITACION_NOMBRE}
                  {sesionOriginal.VERSION && ` - Versión: ${sesionOriginal.VERSION}`}
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  {sesionOriginal.NOMBRE_SESION} • Estado: {sesionOriginal.ESTADO}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-6">
                <FormularioCapacitacion
                  capacitadorId={capacitadorId}
                  setCapacitadorId={setCapacitadorId}
                  fechaProgramada={fechaProgramada}
                  setFechaProgramada={setFechaProgramada}
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
                  categoria={categoria}
                  setCategoria={setCategoria}
                />

                <TablaColaboradoresEditar
                  colaboradoresActuales={colaboradoresOriginales}
                  colaboradoresDisponibles={colaboradoresDisponibles}
                  selectedColaboradores={selectedColaboradores}
                  setSelectedColaboradores={setSelectedColaboradores}
                />
              </div>

              <div className="space-y-6">
                <ResumenEdicionSesion
                  sesion={sesionOriginal}
                  capacitadorId={capacitadorId}
                  capacitadores={capacitadores}
                  fechaProgramada={fechaProgramada}
                  horaInicio={horaInicio}
                  horaFin={horaFin}
                  selectedColaboradores={selectedColaboradores}
                  colaboradoresOriginales={colaboradoresOriginales.map(c => c.ID_COLABORADOR)}
                  aplicaExamen={aplicaExamen}
                  notaMinima={notaMinima}
                  aplicaDiploma={aplicaDiploma}
                  categoria={categoria}
                  tipoCapacitacion={tipoCapacitacion}
                  modalidad={modalidad}
                  grupoObjetivo={grupoObjetivo}
                  objetivo={objetivo}
                  observaciones={observaciones}
                  onGuardar={handleEditar}
                />
              </div>
            </div>
          </main>
        </div>
      </div>
    </RequirePermission>
  )
}
