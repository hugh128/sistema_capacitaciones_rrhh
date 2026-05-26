"use client"

import { useState, useCallback, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { useAuth } from "@/contexts/auth-context"
import { Sidebar } from "@/components/sidebar"
import { AppHeader } from "@/components/app-header"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { ArrowLeft, AlertCircle } from "lucide-react"
import { RequirePermission } from "@/components/RequirePermission"
import { Toaster } from "react-hot-toast"

import { FormularioInfoCapacitacion } from "@/components/capacitaciones-subir/FormularioInfoCapacitacion"
import { TablaColaboradoresLms } from "@/components/capacitaciones-subir/TablaColaboradoresLms"
import { ZonaListadoAsistencia } from "@/components/capacitaciones-subir/ZonaListadoAsistencia"
import { ResumenSubida } from "@/components/capacitaciones-subir/ResumenSubida"

import { useCapacitaciones } from "@/hooks/useCapacitaciones"
import type { ColaboradorSeleccionado } from "@/lib/capacitaciones/capacitacion-lms.types"
import { useProgramasCapacitacion } from "@/hooks/useProgramasCapacitacion"
import { Capacitador } from "@/lib/capacitaciones/capacitaciones-types"
import { usePersonas } from "@/hooks/usePersonas"

export default function SubirCapacitacionPage() {
  const router = useRouter()
  const { user, loading: isAuthLoading } = useAuth()
  const { crearCapacitacionLms, obtenerCapacitadores, isMutating } = useCapacitaciones(user)
  const { programasCapacitacion, loading: loadingProgramas } = useProgramasCapacitacion(user)
  const { personas, loading: loadingPersonas} = usePersonas(user)

  const [isLoading, setIsLoading] = useState(true);
  const [capacitadores, setCapacitadores] = useState<Capacitador[]>([])

  useEffect(() => {
    if (isAuthLoading) {
      return;
    }

    if (!user || !user.PERSONA_ID) {
      setIsLoading(false);
      return; 
    }

    const fetchData = async () => {
      setIsLoading(true);
      try {
        const listadoCapacitadores = await obtenerCapacitadores()
        setCapacitadores(listadoCapacitadores)
      } catch (error) {
        console.error('Error al cargar datos:', error)
      } finally {
        setIsLoading(false);
      }
    }

    fetchData()
  }, [isAuthLoading, user, obtenerCapacitadores])

  // ── Estado del formulario ─────────────────────────────────────────────────
  const [nombre, setNombre] = useState("")
  const [categoriaCapacitacion, setCategoriaCapacitacion] = useState("GENERAL")
  const [tipoCapacitacion, setTipoCapacitacion] = useState("")
  const [modalidad, setModalidad] = useState("")
  const [fechaProgramada, setFechaProgramada] = useState("")
  const [categoriaSesion, setCategoriaSesion] = useState("")
  const [aplicaExamen, setAplicaExamen] = useState(false)
  const [notaMinima, setNotaMinima] = useState("")
  const [programaId, setProgramaId] = useState<number | null>(null)
  const [capacitadorId, setCapacitadorId] = useState<number | null>(null)
  const [seleccionados, setSeleccionados] = useState<ColaboradorSeleccionado[]>([])
  const [listaFile, setListaFile] = useState<File | null>(null)
  const [errores, setErrores] = useState<string[]>([])

  const esRRHH =
    user?.USERNAME.toLowerCase() === "admin" &&
    user.ROLES.some((r) => r.NOMBRE === "RRHH")

  // ── Validación y envío ────────────────────────────────────────────────────
  const handleSubmit = useCallback(async () => {
    const nuevosErrores: string[] = []

    if (!nombre.trim())         nuevosErrores.push("El nombre de la capacitación es obligatorio.")
    if (!categoriaCapacitacion) nuevosErrores.push("Selecciona una categoría de capacitación.")
    if (!tipoCapacitacion)      nuevosErrores.push("Selecciona el tipo de capacitación.")
    if (!modalidad)             nuevosErrores.push("Selecciona la modalidad.")
    if (!fechaProgramada)       nuevosErrores.push("Selecciona la fecha programada.")
    if (!categoriaSesion)       nuevosErrores.push("Selecciona o escribe la categoría de la sesión.")
    if (!programaId)            nuevosErrores.push("Selecciona un programa de capacitación.")
    if (!capacitadorId)         nuevosErrores.push("Selecciona un capacitador.")
    if (seleccionados.length === 0) nuevosErrores.push("Agrega al menos un participante.")
    if (!listaFile)             nuevosErrores.push("El archivo de lista de asistencia es obligatorio.")
    if (aplicaExamen && notaMinima && (Number(notaMinima) < 0 || Number(notaMinima) > 100)) {
      nuevosErrores.push("La nota mínima debe estar entre 0 y 100.")
    }

    setErrores(nuevosErrores)
    if (nuevosErrores.length > 0) return

    const examenFiles = seleccionados
      .filter((s) => s.examenFile)
      .map((s) => ({ idColaborador: s.idColaborador, file: s.examenFile! }))

    await crearCapacitacionLms(
      {
        nombre: nombre.trim(),
        categoriaCapacitacion,
        tipoCapacitacion,
        aplicaExamen,
        notaMinima: notaMinima ? Number(notaMinima) : 70,
        programaId: programaId!,
        capacitadorId: capacitadorId!,
        fechaProgramada,
        modalidad,
        categoriaSesion,
        usuarioCreacion: user!.USERNAME,
        colaboradores: seleccionados.map((s) => ({ idColaborador: s.idColaborador })),
      },
      listaFile!,
      examenFiles
    )

    router.push("/capacitaciones")
  }, [
    nombre, categoriaCapacitacion, tipoCapacitacion, modalidad,
    fechaProgramada, categoriaSesion, aplicaExamen, notaMinima,
    programaId, capacitadorId, seleccionados, listaFile,
    user, crearCapacitacionLms, router,
  ])

  if (isLoading || loadingProgramas || loadingPersonas) {
    return (
      <div className="fixed inset-0 bg-background/5 z-[100] flex items-center justify-center">
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

  // ── Guards ────────────────────────────────────────────────────────────────
  if (!user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="w-96">
          <CardHeader>
            <CardTitle>Cargando...</CardTitle>
            <CardDescription>Verificando sesión</CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!esRRHH) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="w-96">
          <CardHeader>
            <CardTitle>Acceso Denegado</CardTitle>
            <CardDescription>No tienes permisos para acceder a esta página.</CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/capacitaciones">
              <Button className="cursor-pointer">Volver a Capacitaciones</Button>
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

          <main className="flex-1 p-6 space-y-6 overflow-auto custom-scrollbar max-w-[1600px] mx-auto w-full">
            <Toaster />

            {/* Encabezado */}
            <div className="flex items-center gap-4">
              <Link href="/capacitaciones">
                <Button
                  variant="outline"
                  size="icon"
                  className="cursor-pointer dark:hover:text-foreground dark:hover:border-gray-600"
                >
                  <ArrowLeft className="h-4 w-4" />
                </Button>
              </Link>
              <div>
                <h1 className="text-lg sm:text-xl lg:text-2xl font-semibold text-foreground">
                  Subir Capacitación
                </h1>
                <p className="text-sm text-muted-foreground">
                  Registra una nueva capacitación con su listado de asistencia
                </p>
              </div>
            </div>

            {/* Errores */}
            {errores.length > 0 && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Se encontraron {errores.length} error(es)</AlertTitle>
                <AlertDescription>
                  <ul className="list-disc list-inside text-sm mt-1 space-y-1">
                    {errores.map((e, i) => <li key={i}>{e}</li>)}
                  </ul>
                </AlertDescription>
              </Alert>
            )}

            {(loadingProgramas || loadingPersonas || isLoading) ? (
              <div className="flex items-center justify-center py-20">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                <div className="lg:col-span-2 space-y-6">

                  {/* Formulario */}
                  <FormularioInfoCapacitacion
                    programas={programasCapacitacion}
                    capacitadores={capacitadores}
                    nombre={nombre}
                    setNombre={setNombre}
                    categoriaCapacitacion={categoriaCapacitacion}
                    setCategoriaCapacitacion={setCategoriaCapacitacion}
                    tipoCapacitacion={tipoCapacitacion}
                    setTipoCapacitacion={setTipoCapacitacion}
                    modalidad={modalidad}
                    setModalidad={setModalidad}
                    fechaProgramada={fechaProgramada}
                    setFechaProgramada={setFechaProgramada}
                    categoriaSesion={categoriaSesion}
                    setCategoriaSesion={setCategoriaSesion}
                    aplicaExamen={aplicaExamen}
                    setAplicaExamen={setAplicaExamen}
                    notaMinima={notaMinima}
                    setNotaMinima={setNotaMinima}
                    programaId={programaId}
                    setProgramaId={setProgramaId}
                    capacitadorId={capacitadorId}
                    setCapacitadorId={setCapacitadorId}
                  />

                  <TablaColaboradoresLms
                    colaboradores={personas}
                    seleccionados={seleccionados}
                    setSeleccionados={setSeleccionados}
                    aplicaExamen={aplicaExamen}
                  />

                  <ZonaListadoAsistencia
                    file={listaFile}
                    onFileSelect={setListaFile}
                    onFileRemove={() => setListaFile(null)}
                  />
                </div>

                <div>
                  <ResumenSubida
                    nombre={nombre}
                    programaId={programaId}
                    programas={programasCapacitacion}
                    capacitadorId={capacitadorId}
                    capacitadores={capacitadores}
                    fechaProgramada={fechaProgramada}
                    categoriaSesion={categoriaSesion}
                    seleccionados={seleccionados}
                    listaFile={listaFile}
                    aplicaExamen={aplicaExamen}
                    isMutating={isMutating}
                    onSubmit={handleSubmit}
                  />
                </div>
              </div>
            )}
          </main>
        </div>
      </div>
    </RequirePermission>
  )
}
