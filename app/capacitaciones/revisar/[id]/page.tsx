"use client"

import { useState, useMemo, useEffect } from "react"
import { useAuth } from "@/contexts/auth-context"
import { Sidebar } from "@/components/sidebar"
import { AppHeader } from "@/components/app-header"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { ArrowLeft, CheckCircle2, XCircle, AlertCircle, Eye, Calendar, Clock, Edit, MinusCircle, GraduationCap, FileText } from "lucide-react"
import Link from "next/link"
import { useParams, useRouter } from "next/navigation"
import { getEstadoCapacitacionColor, getEstadoColaboradorColor } from "@/lib/capacitaciones/capacitaciones-types"
import { RequirePermission } from "@/components/RequirePermission"
import { useCapacitaciones } from "@/hooks/useCapacitaciones"
import { COLABORADORES_SESION, EstadoColaborador, SESION_DETALLE } from "@/lib/mis-capacitaciones/capacitaciones-types"

export default function RevisarCapacitacionPage() {
  const { user } = useAuth()
  const params = useParams()
  const router = useRouter()
  const sesionId = Number(params.id)

  const {
    obtenerCapacitacionEnRevision,
    descargarListaAsistencia,
    descargarExamen,
    descargarDiploma,
    aprobarAsistencia,
    aprobarSesion,
  } = useCapacitaciones(user);

  const [isLoading, setIsLoading] = useState(true);
  const [sesion, setSesion] = useState<SESION_DETALLE>()
  const [colaboradoresAsignados, setColaboradoresAsignados] = useState<COLABORADORES_SESION[]>([])
  const [asistenciaState, setAsistenciaState] = useState<Record<number, boolean>>({})
  const [notasState, setNotasState] = useState<Record<number, number | null>>({})
  const [loadingDownload, setLoadingDownload] = useState(false);

  const [observacionesRRHH, setObservacionesRRHH] = useState("")
  const [editingColaborador, setEditingColaborador] = useState<COLABORADORES_SESION | null>(null)
  const [editAsistio, setEditAsistio] = useState<boolean | null>(null)
  const [editNota, setEditNota] = useState("")
  const [editObservaciones, setEditObservaciones] = useState("")
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)

  useEffect(() => {
    if (!user || !user.PERSONA_ID) {
      setIsLoading(false);
      return; 
    }

    const fetchData = async () => {
      setIsLoading(true);
      try {
        const { SESION, COLABORADORES } = await obtenerCapacitacionEnRevision(sesionId)
        setSesion(SESION)
        setColaboradoresAsignados(COLABORADORES)

        const initialAsistencia: Record<number, boolean> = {};
        const initialNotas: Record<number, number | null> = {};
        const initialExamenes: Record<number, boolean> = {};
        const initialDiplomas: Record<number, boolean> = {};

        COLABORADORES.forEach((col: COLABORADORES_SESION) => {
          initialAsistencia[col.ID_COLABORADOR] = col.ASISTIO ?? false;
          initialNotas[col.ID_COLABORADOR] = col.NOTA_OBTENIDA ?? null;
          initialExamenes[col.ID_COLABORADOR] = !!col.URL_EXAMEN;
          initialDiplomas[col.ID_COLABORADOR] = !!col.URL_DIPLOMA;
        });

        setAsistenciaState(initialAsistencia);
        setNotasState(initialNotas);
      } catch (error) {
        console.error('Error al cargar datos:', error)
      } finally {
        setIsLoading(false);
      }
    }

    fetchData()
  }, [user, sesionId, obtenerCapacitacionEnRevision, setAsistenciaState, setNotasState])

  const stats = useMemo(() => {
    const total = colaboradoresAsignados.length
    const asistencias = colaboradoresAsignados.filter((c) => c.ASISTIO === true).length
    const examenes = colaboradoresAsignados.filter((c) => c.URL_EXAMEN).length
    const diplomas = colaboradoresAsignados.filter((c) => c.URL_DIPLOMA).length
    const aprobados = colaboradoresAsignados.filter((c) => c.APROBADO === true).length

    return { total, asistencias, examenes, diplomas, aprobados }
  }, [colaboradoresAsignados])

  const validations = useMemo(() => {
    if (!sesion) return { allAttendance: false, allExams: false, allDiplomas: false, hasAttendanceList: false }

    const allAttendance = colaboradoresAsignados.every((c) => c.ASISTIO !== null)
    const allExams = sesion.APLICA_EXAMEN
      ? colaboradoresAsignados.filter((c) => c.ASISTIO).every((c) => c.URL_EXAMEN)
      : true
    const allDiplomas = sesion.APLICA_DIPLOMA
      ? colaboradoresAsignados.filter((c) => c.APROBADO).every((c) => c.URL_DIPLOMA)
      : true
    const hasAttendanceList = !!sesion.URL_LISTA_ASISTENCIA

    return { allAttendance, allExams, allDiplomas, hasAttendanceList }
  }, [sesion, colaboradoresAsignados])

  const canApprove = useMemo(() => {
    return validations.allAttendance && validations.allExams && validations.allDiplomas
  }, [validations])

  const handleDownload = async () => {
    const attendanceInfo = sesion?.URL_LISTA_ASISTENCIA
    try {
      setLoadingDownload(true);

      if (!attendanceInfo) {
        return;
      }

      if (
        attendanceInfo.startsWith("blob:") ||
        attendanceInfo.startsWith("C:") ||
        attendanceInfo.startsWith("/")
      ) {
        window.open(attendanceInfo, "_blank");
        return;
      }

      const signedUrl = await descargarListaAsistencia(sesion.ID_SESION);

      if (signedUrl) {
        window.open(signedUrl, "_blank");
      }
    } catch (error) {
      console.error("Error al descargar la lista:", error);
    } finally {
      setLoadingDownload(false);
    }
  };

  const handleDownloadExamen = async (colaboradorId: number) => {
    try {
      setLoadingDownload(true);
      if (!sesion) return;
      const signedUrl = await descargarExamen(sesion.ID_SESION, colaboradorId);
      if (signedUrl) {
        window.open(signedUrl, "_blank");
      }
    } catch (error) {
      console.error("Error al descargar el examen:", error);
      alert("Error al descargar el examen. Revisa la consola para más detalles.");
    } finally {
      setLoadingDownload(false);
    }
  };

  const handleDownloadDiploma = async (colaboradorId: number) => {
    try {
      setLoadingDownload(true);
      if (!sesion) return;
      const signedUrl = await descargarDiploma(sesion.ID_SESION, colaboradorId);
      if (signedUrl) {
        window.open(signedUrl, "_blank");
      }
    } catch (error) {
      console.error("Error al descargar el diploma:", error);
      alert("Error al descargar el diploma. Revisa la consola para más detalles.");
    } finally {
      setLoadingDownload(false);
    }
  };

  const getEstadoColaboradorDynamic = (colaboradorId: number): EstadoColaborador => {
    const asistio = asistenciaState[colaboradorId];
    const nota = notasState[colaboradorId];

    if (asistio === undefined || asistio === null) {
      return "PENDIENTE";
    }

    if (asistio === false) {
      return "NO_ASISTIO";
    }

    if (!sesion?.APLICA_EXAMEN) {
      return "APROBADO";
    }

    if (nota === null || nota === undefined) {
      return "PENDIENTE";
    }

    const notaMinima = sesion?.NOTA_MINIMA || 60;
    return nota >= notaMinima ? "APROBADO" : "REPROBADO";
  };

  const handleGuardarEdicion = () => {
    if (!editingColaborador) return;

    if (sesion?.APLICA_EXAMEN && editNota) {
      const nota = Number(editNota);
      if (isNaN(nota) || nota < 0 || nota > 100) {
        alert("Ingresa una nota válida entre 0 y 100");
        return;
      }
    }

    setAsistenciaState((prev) => ({
      ...prev,
      [editingColaborador.ID_COLABORADOR]: editAsistio ?? false,
    }));

    setNotasState((prev) => ({
      ...prev,
      [editingColaborador.ID_COLABORADOR]: editNota ? Number(editNota) : null,
    }));

    setColaboradoresAsignados((prev) =>
      prev.map((c) =>
        c.ID_COLABORADOR === editingColaborador.ID_COLABORADOR
          ? {
              ...c,
              ASISTIO: editAsistio,
              NOTA_OBTENIDA: editNota ? Number(editNota) : null,
              OBSERVACIONES: editObservaciones,
              ESTADO: getEstadoColaboradorDynamic(editingColaborador.ID_COLABORADOR),
            }
          : c
      )
    );

    setIsEditDialogOpen(false);
    setEditingColaborador(null);
    setEditNota("");
    setEditObservaciones("");
  };

  const handleAprobar = async () => {
    if (!user) return;

    if (!canApprove) {
      console.log("No se puede aprobar. Hay validaciones pendientes.");
      return;
    }

    const colaboradoresParaAPI = colaboradoresAsignados
      .filter(col => asistenciaState[col.ID_COLABORADOR])
      .map(col => ({
        idColaborador: col.ID_COLABORADOR,
        asistio: asistenciaState[col.ID_COLABORADOR],
        notaObtenida: notasState[col.ID_COLABORADOR] ?? null,
        observaciones: editObservaciones,
      }));

    try {
      const res = await aprobarAsistencia(
        sesionId,
        colaboradoresParaAPI,
        user.USERNAME
      );

      if (res) {
        await aprobarSesion(
          sesionId,
          user.USERNAME,
          observacionesRRHH
        );

        router.push("/capacitaciones");
      }
    } catch (error) {
      console.error("Error al finalizar la sesión:", error);
    }
  };
/*   const handleDevolver = () => {
    if (!observacionesRRHH.trim()) {
      alert("Agrega observaciones para devolver al capacitador")
      return
    }
    alert("Capacitación devuelta al capacitador con observaciones")
    router.push("/capacitaciones")
    // In real app, this would be an API call
  } */

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="w-96">
          <CardHeader>
            <CardTitle>Cargando Detalles...</CardTitle>
            <CardDescription>Obteniendo información de la sesion y capacitadores.</CardDescription>
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

  if (!sesion) {
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

          <AppHeader title="Gestión de Capacitaciones" subtitle="Panel de control para administrar todas las capacitaciones de la empresa" />

          <main className="flex-1 p-6 space-y-6 overflow-auto custom-scrollbar">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Link href="/capacitaciones">
                  <Button variant="outline" size="icon" className="cursor-pointer dark:hover:text-foreground dark:hover:border-gray-600">
                    <ArrowLeft className="h-4 w-4" />
                  </Button>
                </Link>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h1 className="text-3xl font-bold text-foreground">Revisar Capacitación</h1>
                    <Badge className={getEstadoCapacitacionColor(sesion.ESTADO)}>{sesion.ESTADO}</Badge>
                  </div>
                  <p className="text-xl">{sesion.CAPACITACION_NOMBRE}</p>
                </div>
              </div>
            </div>

            {/* Info Card */}
            <Card>
              <CardHeader>
                <CardTitle>Información General</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div>
                    <Label className="text-muted-foreground">Capacitador</Label>
                    <p className="font-medium">{sesion.CAPACITADOR_NOMBRE}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Fecha</Label>
                    <p className="font-medium flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      {sesion.FECHA_PROGRAMADA
                        ? new Date(sesion.FECHA_PROGRAMADA).toLocaleDateString("es-GT")
                        : "Sin fecha"}
                    </p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Horario</Label>
                    <p className="font-medium flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      {sesion.HORARIO_FORMATO_12H}
                    </p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Duración</Label>
                    <p className="font-medium">{sesion.DURACION_FORMATO}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Total Participantes</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.total}</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Asistencias</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.asistencias}</div>
                  <p className="text-xs text-muted-foreground">
                    {((stats.asistencias / stats.total) * 100).toFixed(0)}% del total
                  </p>
                </CardContent>
              </Card>

              {sesion.APLICA_EXAMEN && (
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Exámenes</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {stats.examenes} / {stats.asistencias}
                    </div>
                  </CardContent>
                </Card>
              )}

              {sesion.APLICA_DIPLOMA && (
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Diplomas</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{stats.diplomas}</div>
                  </CardContent>
                </Card>
              )}

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Aprobados</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.aprobados}</div>
                  <p className="text-xs text-muted-foreground">
                    {stats.asistencias > 0 ? ((stats.aprobados / stats.asistencias) * 100).toFixed(0) : 0}% de asistentes
                  </p>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Checklist de Validación</CardTitle>
                <CardDescription>Verifica que todos los requisitos estén completos</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center gap-3 p-3 border rounded-lg">
                    {validations.allAttendance ? (
                      <CheckCircle2 className="h-6 w-6 text-green-600 flex-shrink-0" />
                    ) : (
                      <XCircle className="h-6 w-6 text-red-600 flex-shrink-0" />
                    )}
                    <div>
                      <p className="font-medium">Todas las asistencias registradas</p>
                      <p className="text-sm text-muted-foreground">
                        {stats.asistencias} de {stats.total} colaboradores con asistencia marcada
                      </p>
                    </div>
                  </div>

                  {sesion.APLICA_EXAMEN && (
                    <div className="flex items-center gap-3 p-3 border rounded-lg">
                      {validations.allExams ? (
                        <CheckCircle2 className="h-6 w-6 text-green-600 flex-shrink-0" />
                      ) : (
                        <XCircle className="h-6 w-6 text-red-600 flex-shrink-0" />
                      )}
                      <div>
                        <p className="font-medium">Todos los exámenes subidos</p>
                        <p className="text-sm text-muted-foreground">
                          {stats.examenes} de {stats.asistencias} exámenes completados
                        </p>
                      </div>
                    </div>
                  )}

                  {sesion.APLICA_DIPLOMA && (
                    <div className="flex items-center gap-3 p-3 border rounded-lg">
                      {validations.allDiplomas ? (
                        <CheckCircle2 className="h-6 w-6 text-green-600 flex-shrink-0" />
                      ) : (
                        <XCircle className="h-6 w-6 text-red-600 flex-shrink-0" />
                      )}
                      <div>
                        <p className="font-medium">Todos los diplomas subidos</p>
                        <p className="text-sm text-muted-foreground">
                          {stats.diplomas} diplomas para colaboradores aprobados
                        </p>
                      </div>
                    </div>
                  )}

                  <div className="flex items-center gap-3 p-3 border rounded-lg">
                    {validations.hasAttendanceList ? (
                      <CheckCircle2 className="h-6 w-6 text-green-600 flex-shrink-0" />
                    ) : (
                      <AlertCircle className="h-6 w-6 text-yellow-600 flex-shrink-0" />
                    )}
                    <div>
                      <p className="font-medium">Lista de asistencia subida</p>
                      {validations.hasAttendanceList && (
                        <Button
                          variant="link"
                          onClick={handleDownload}
                          disabled={loadingDownload}
                          className="h-auto p-0 text-sm cursor-pointer dark:text-blue-800 dark:font-bold"
                        >
                          <Eye className="h-3 w-3 mr-1" />
                          Ver documento
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Participants Table */}
            <Card>
              <CardHeader>
                <CardTitle>Detalle de Participantes</CardTitle>
                <CardDescription>Revisa y edita la información de los participantes</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="border rounded-lg">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Nombre</TableHead>
                        <TableHead>Departamento</TableHead>
                        <TableHead>Estado</TableHead>
                        <TableHead>Asistencia</TableHead>
                        {sesion.APLICA_EXAMEN && <TableHead>Nota</TableHead>}
                        <TableHead>Documentos</TableHead>
                        <TableHead>Acciones</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {colaboradoresAsignados.map((col) => (
                        <TableRow key={col.ID_COLABORADOR}>
                          <TableCell>
                            <div>
                              <p className="font-medium">{col.NOMBRE_COMPLETO}</p>
                              <p className="text-sm text-muted-foreground">{col.CORREO}</p>
                            </div>
                          </TableCell>
                          <TableCell>{col.DEPARTAMENTO}</TableCell>
                          <TableCell>
                            <Badge className={getEstadoColaboradorColor(getEstadoColaboradorDynamic(col.ID_COLABORADOR))}>
                              {getEstadoColaboradorDynamic(col.ID_COLABORADOR)}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {col.ASISTIO === true ? (
                              <CheckCircle2 className="h-5 w-5 text-green-600" />
                            ) : col.ASISTIO === false ? (
                              <XCircle className="h-5 w-5 text-red-600" />
                            ) : (
                              <AlertCircle className="h-5 w-5 text-gray-400" />
                            )}
                          </TableCell>
                          {sesion.APLICA_EXAMEN && (
                            <TableCell>
                              {col.NOTA_OBTENIDA !== null ? (
                                <span className="font-medium">{col.NOTA_OBTENIDA}</span>
                              ) : (
                                <span className="text-muted-foreground">-</span>
                              )}
                            </TableCell>
                          )}
                          <TableCell>
                            <div className="flex gap-1 text-sm">
                              {sesion.APLICA_EXAMEN && (
                                <div className="flex items-center gap-1">
                                  {col.URL_EXAMEN ? (
                                    <Button
                                      size="icon"
                                      variant="outline"
                                      title="Descargar Examen"
                                      onClick={() => handleDownloadExamen(col.ID_COLABORADOR)}
                                      disabled={loadingDownload}
                                      className="h-9 w-9 text-blue-600 hover:text-blue-700"
                                    >
                                      <FileText className="h-4 w-4" />
                                    </Button>
                                  ) : (
                                    <span
                                      className="flex items-center text-muted-foreground text-xs gap-1"
                                      title="Examen pendiente"
                                    >
                                      <Clock className="h-3 w-3 text-amber-500" /> Examen pendiente
                                    </span>
                                  )}
                                </div>
                              )}

                              {sesion.APLICA_DIPLOMA && col.APROBADO && (
                                <div className="flex items-center gap-1">
                                  {col.URL_DIPLOMA ? (
                                    <Button
                                      size="icon"
                                      variant="outline"
                                      title="Descargar Diploma"
                                      onClick={() => handleDownloadDiploma(col.ID_COLABORADOR)}
                                      disabled={loadingDownload}
                                      className="h-9 w-9 text-emerald-600 hover:text-emerald-700"
                                    >
                                      <GraduationCap className="h-4 w-4" />
                                    </Button>
                                  ) : (
                                    <span
                                      className="flex items-center text-muted-foreground text-xs gap-1"
                                      title="Diploma pendiente"
                                    >
                                      <Clock className="h-3 w-3 text-amber-500" /> Diploma pendiente
                                    </span>
                                  )}
                                </div>
                              )}

                              {sesion.APLICA_DIPLOMA && col.ASISTIO && !col.APROBADO && (
                                <span
                                  className="flex items-center text-muted-foreground text-xs gap-1"
                                  title="No aplica diploma por no haber aprobado o no cumplir requisitos"
                                >
                                  <MinusCircle className="h-3 w-3 text-red-500" /> No aplica diploma
                                </span>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <Dialog
                              open={isEditDialogOpen && editingColaborador?.ID_COLABORADOR === col.ID_COLABORADOR}
                              onOpenChange={setIsEditDialogOpen}
                            >
                              <DialogTrigger asChild>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => {
                                    setEditingColaborador(col)
                                    setEditAsistio(col.ASISTIO)
                                    setEditNota(col.NOTA_OBTENIDA?.toString() || "")
                                    setEditObservaciones(col.OBSERVACIONES || "")
                                    setIsEditDialogOpen(true)
                                  }}
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                              </DialogTrigger>

                                {editingColaborador?.ID_COLABORADOR === col.ID_COLABORADOR && (
                                  <DialogContent className="max-w-md">
                                    <DialogHeader>
                                      <DialogTitle>Editar Participante</DialogTitle>
                                      <DialogDescription>{col.NOMBRE_COMPLETO}</DialogDescription>
                                    </DialogHeader>
                                    <div className="space-y-4">
                                      <div>
                                        <Label>Asistencia</Label>
                                        <div className="flex gap-2 mt-2">
                                          <Button
                                            variant={editAsistio === true ? "default" : "outline"}
                                            className="flex-1"
                                            onClick={() => setEditAsistio(true)}
                                          >
                                            <CheckCircle2 className="h-4 w-4 mr-2" />
                                            Asistió
                                          </Button>
                                          <Button
                                            variant={editAsistio === false ? "destructive" : "outline"}
                                            className="flex-1"
                                            onClick={() => {
                                              setEditAsistio(false)
                                              setEditNota("")
                                            }}
                                          >
                                            <XCircle className="h-4 w-4 mr-2" />
                                            No asistió
                                          </Button>
                                        </div>
                                      </div>

                                      {sesion.APLICA_EXAMEN && (
                                        <div>
                                          <Label>Nota Obtenida (0-100)</Label>
                                          <Input
                                            type="number"
                                            min="0"
                                            max="100"
                                            value={editNota}
                                            onChange={(e) => setEditNota(e.target.value)}
                                            placeholder="Ingresa la nota"
                                            className="mt-2"
                                          />
                                          {sesion.NOTA_MINIMA && (
                                            <p className="text-xs text-muted-foreground mt-1">
                                              Nota mínima para aprobar: {sesion.NOTA_MINIMA}
                                            </p>
                                          )}
                                        </div>
                                      )}

{/*                                       <div>
                                        <Label>Observaciones</Label>
                                        <Textarea
                                          value={editObservaciones}
                                          onChange={(e) => setEditObservaciones(e.target.value)}
                                          placeholder="Observaciones sobre el participante..."
                                          rows={3}
                                          className="mt-2"
                                        />
                                      </div> */}
                                    </div>
                                    <DialogFooter>
                                      <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}> {/* Cierra el Dialog */}
                                        Cancelar
                                      </Button>
                                      <Button onClick={handleGuardarEdicion}>Guardar Cambios</Button>
                                    </DialogFooter>
                                  </DialogContent>
                                )}
                            </Dialog>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>

            {sesion.OBSERVACIONES && (
              <Card>
                <CardHeader>
                  <CardTitle>Observaciones del Capacitador</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">{sesion.OBSERVACIONES}</p>
                </CardContent>
              </Card>
            )}

            {/* RRHH Review */}
            <Card>
              <CardHeader>
                <CardTitle>Revisión de RRHH</CardTitle>
                {/* <CardDescription>Agrega observaciones y aprueba o devuelve la capacitación</CardDescription> */}
                <CardDescription>Agrega observaciones y aprueba la capacitación</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="observacionesRRHH">Observaciones de RRHH</Label>
                  <Textarea
                    id="observacionesRRHH"
                    value={observacionesRRHH}
                    onChange={(e) => setObservacionesRRHH(e.target.value)}
                    placeholder="Agrega observaciones sobre la revisión..."
                    rows={4}
                    className="mt-2"
                  />
                </div>

                <div className="flex gap-3">
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button size="lg" className="flex-1" disabled={!canApprove}>
                        <CheckCircle2 className="h-5 w-5 mr-2" />
                        Aprobar y Finalizar
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Aprobar Capacitación</AlertDialogTitle>
                        <AlertDialogDescription>
                          ¿Estás seguro de que deseas aprobar esta capacitación? El estado cambiará a Finalizada y no se
                          podrán hacer más cambios.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction onClick={handleAprobar}>Aprobar</AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>

{/*                   <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button size="lg" variant="outline" className="flex-1 bg-transparent">
                        <XCircle className="h-5 w-5 mr-2" />
                        Devolver al Capacitador
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Devolver al Capacitador</AlertDialogTitle>
                        <AlertDialogDescription>
                          La capacitación será devuelta al capacitador con tus observaciones para que realice las
                          correcciones necesarias.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDevolver}>Devolver</AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog> */}
                </div>

                {!canApprove && (
                  <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
                    <div className="flex gap-2">
                      <AlertCircle className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="font-medium text-yellow-900 dark:text-yellow-200">No se puede aprobar aún</p>
                        <p className="text-sm text-yellow-800 dark:text-yellow-300 mt-1">
                          Hay validaciones pendientes. Revisa el checklist o devuelve al capacitador para correcciones.
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </main>
        </div>
      </div>
    </RequirePermission>
  )
}
