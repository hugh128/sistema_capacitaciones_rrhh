"use client"

import { useEffect, useMemo, useState } from "react"
import { useAuth } from "@/contexts/auth-context"
import { Sidebar } from "@/components/sidebar"
import { AppHeader } from "@/components/app-header"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { ArrowLeft, CheckCircle2, XCircle, Calendar, Clock, Users, BookOpen, Eye } from "lucide-react"
import Link from "next/link"
import { useParams } from "next/navigation"
import { getEstadoCapacitacionColor, getEstadoColaboradorColor } from "@/lib/capacitaciones/capacitaciones-types"
import { RequirePermission } from "@/components/RequirePermission"
import { useCapacitaciones } from "@/hooks/useCapacitaciones"
import { COLABORADORES_SESION, SESION_DETALLE } from "@/lib/mis-capacitaciones/capacitaciones-types"

export default function CapacitacionDetailPage() {
  const { user } = useAuth()
  const params = useParams()
  const sesionId = Number(params.id)

  const {
    obtenerDetalleSesion,
    descargarListaAsistencia,
  } = useCapacitaciones(user)

  const [isLoading, setIsLoading] = useState(true);
  const [sesion, setSesion] = useState<SESION_DETALLE>()
  const [colaboradoresAsignados, setColaboradoresAsignados] = useState<COLABORADORES_SESION[]>([])
  const [loadingDownload, setLoadingDownload] = useState(false);

  useEffect(() => {
    if (!user || !user.PERSONA_ID) {
      setIsLoading(false);
      return; 
    }

    const fetchData = async () => {
      setIsLoading(true);
      try {
        const { SESION, COLABORADORES } = await obtenerDetalleSesion(sesionId)
        setSesion(SESION)
        setColaboradoresAsignados(COLABORADORES)
      } catch (error) {
        console.error('Error al cargar datos:', error)
      } finally {
        setIsLoading(false);
      }
    }

    fetchData()
  }, [user, sesionId, obtenerDetalleSesion])

  // Calculate stats
  const stats = useMemo(() => {
    const total = colaboradoresAsignados.length
    const asistencias = colaboradoresAsignados.filter((c) => c.ASISTIO === true).length
    const examenes = colaboradoresAsignados.filter((c) => c.URL_EXAMEN).length
    const diplomas = colaboradoresAsignados.filter((c) => c.URL_DIPLOMA).length
    const aprobados = colaboradoresAsignados.filter((c) => c.APROBADO === true).length

    return { total, asistencias, examenes, diplomas, aprobados }
  }, [colaboradoresAsignados])

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

  // Helper function to determine if HR can navigate to assignment or review
  const getNavigationButtons = () => {
    if (sesion.ESTADO === "PENDIENTE_ASIGNACION" || sesion.ESTADO === "ASIGNADA") {
      return (
        <Link href={`/capacitaciones/asignar/${sesion.ID_CAPACITACION}`}>
          <Button>Ir a Asignación</Button>
        </Link>
      )
    } else if (sesion.ESTADO === "FINALIZADA_CAPACITADOR" || sesion.ESTADO === "EN_REVISION") {
      return (
        <Link href={`/capacitaciones/revisar/${sesionId}`}>
          <Button>Ir a Revisión</Button>
        </Link>
      )
    }
    return null
  }

  return (
    <RequirePermission requiredPermissions={["manage_trainings"]}>
      <div className="flex h-screen bg-background">
        <Sidebar />
        <div className="flex-1 flex flex-col overflow-hidden">
          <AppHeader title="Gestión de Capacitaciones" subtitle="Panel de control para administrar todas las capacitaciones de la empresa" />

          <main className="flex-1 p-6 space-y-6 overflow-auto custom-scrollbar">
            {/* Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Link href="/capacitaciones">
                  <Button variant="outline" size="icon">
                    <ArrowLeft className="h-4 w-4" />
                  </Button>
                </Link>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h1 className="text-3xl font-bold text-foreground">Detalle de Capacitación</h1>
                    <Badge className={getEstadoCapacitacionColor(sesion.ESTADO)}>{sesion.ESTADO}</Badge>
                  </div>
                  <p className="text-muted-foreground">{sesion.CAPACITACION_NOMBRE}</p>
                </div>
              </div>
              <div>{getNavigationButtons()}</div>
            </div>

            {/* Info Card */}
            <Card>
              <CardHeader>
                <CardTitle>Información General</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <div>
                    <Label className="text-muted-foreground">Código</Label>
                    <p className="font-medium">{sesion.CODIGO_DOCUMENTO || "N/A"}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Capacitador</Label>
                    <p className="font-medium">{sesion.CAPACITADOR_NOMBRE}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Tipo</Label>
                    <p className="font-medium">{sesion.TIPO_CAPACITACION}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Departamento</Label>
                    <p className="font-medium">{sesion.DEPARTAMENTO}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Fecha de Inicio</Label>
                    <p className="font-medium flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      {sesion.FECHA_INICIO
                        ? new Date(sesion.FECHA_INICIO).toLocaleDateString("es-GT")
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
                  <div>
                    <Label className="text-muted-foreground">Nota Mínima</Label>
                    <p className="font-medium">{sesion.NOTA_MINIMA || "N/A"}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Objective */}
            <Card>
              <CardHeader>
                <CardTitle>Objetivo</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">{sesion.OBJETIVO}</p>
              </CardContent>
            </Card>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    Total Participantes
                  </CardTitle>
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
                    {stats.total > 0 ? ((stats.asistencias / stats.total) * 100).toFixed(0) : 0}% del total
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

            {/* Participants Table */}
            <Card>
              <CardHeader>
                <CardTitle>Detalle de Participantes</CardTitle>
                <CardDescription>Lista de colaboradores asignados a esta capacitación</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="border rounded-lg overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Nombre</TableHead>
                        <TableHead>Departamento</TableHead>
                        <TableHead>Estado</TableHead>
                        <TableHead>Asistencia</TableHead>
                        {sesion.APLICA_EXAMEN && <TableHead>Nota</TableHead>}
                        {sesion.APLICA_EXAMEN && <TableHead>Examen</TableHead>}
                        {sesion.APLICA_DIPLOMA && <TableHead>Diploma</TableHead>}
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {colaboradoresAsignados.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={6} className="text-center py-8">
                            <BookOpen className="h-8 w-8 mx-auto mb-2 opacity-50" />
                            <p className="text-muted-foreground">No hay participantes asignados</p>
                          </TableCell>
                        </TableRow>
                      ) : (
                        colaboradoresAsignados.map((col) => (
                          <TableRow key={col.ID_COLABORADOR}>
                            <TableCell>
                              <div>
                                <p className="font-medium">{col.NOMBRE_COMPLETO}</p>
                                <p className="text-sm text-muted-foreground">{col.CORREO}</p>
                              </div>
                            </TableCell>
                            <TableCell>{col.DEPARTAMENTO}</TableCell>
                            <TableCell>
                              <Badge className={getEstadoColaboradorColor(col.ESTADO_COLABORADOR)}>
                                {col.ESTADO_COLABORADOR}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              {col.ASISTIO === true ? (
                                <CheckCircle2 className="h-5 w-5 text-green-600" />
                              ) : col.ASISTIO === false ? (
                                <XCircle className="h-5 w-5 text-red-600" />
                              ) : (
                                <span className="text-muted-foreground">-</span>
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
                            {sesion.APLICA_EXAMEN && (
                              <TableCell>
                                {col.URL_EXAMEN ? (
                                  <CheckCircle2 className="h-5 w-5 text-green-600" />
                                ) : (
                                  <span className="text-muted-foreground">-</span>
                                )}
                              </TableCell>
                            )}
                            {sesion.APLICA_DIPLOMA && (
                              <TableCell>
                                {col.URL_DIPLOMA ? (
                                  <CheckCircle2 className="h-5 w-5 text-green-600" />
                                ) : (
                                  <span className="text-muted-foreground">-</span>
                                )}
                              </TableCell>
                            )}
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>

            {/* Asistencia */}
            <Card>
              <CardHeader>
                <CardTitle>Listado de asistencia</CardTitle>
              </CardHeader>
              <CardContent>
                <Button
                  variant="link"
                  onClick={handleDownload}
                  disabled={loadingDownload}
                  className="h-auto p-0 text-sm cursor-pointer dark:text-blue-800 dark:font-bold"
                >
                  <Eye className="h-3 w-3 mr-1" />
                  Ver documento
                </Button>
              </CardContent>
            </Card>

            {/* Observations */}
            {sesion.OBSERVACIONES && (
              <Card>
                <CardHeader>
                  <CardTitle>Observaciones</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">{sesion.OBSERVACIONES}</p>
                </CardContent>
              </Card>
            )}
          </main>
        </div>
      </div>
    </RequirePermission>
  )
}
