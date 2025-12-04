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
import { ArrowLeft, CheckCircle2, XCircle, Calendar, Clock, Users, BookOpen, Eye, FileText, Target, TrendingUp, Download } from "lucide-react"
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
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Cargando Detalles...</CardTitle>
            <CardDescription>Obteniendo información de la sesión y capacitadores.</CardDescription>
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
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Capacitación no encontrada</CardTitle>
            <CardDescription>La capacitación solicitada no existe.</CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/capacitaciones">
              <Button className="w-full">Volver a Gestión</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  const getNavigationButtons = () => {
    if (sesion.ESTADO === "PENDIENTE_ASIGNACION" || sesion.ESTADO === "ASIGNADA" || sesion.ESTADO === "CREADA") {
      return (
        <Link href={`/capacitaciones/asignar/${sesion.ID_CAPACITACION}`}>
          <Button className="w-full sm:w-auto">Ir a Asignación</Button>
        </Link>
      )
    } else if (sesion.ESTADO === "FINALIZADA_CAPACITADOR" || sesion.ESTADO === "EN_REVISION") {
      return (
        <Link href={`/capacitaciones/revisar/${sesionId}`}>
          <Button className="w-full sm:w-auto">Ir a Revisión</Button>
        </Link>
      )
    }
    return null
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

          <main className="flex-1 p-4 sm:p-6 space-y-4 sm:space-y-6 max-w-[1600px] mx-auto w-full overflow-auto custom-scrollbar">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div className="flex items-start gap-3 sm:gap-4">
                <Link href="/capacitaciones">
                  <Button variant="outline" size="icon" className="shrink-0 mt-1 cursor-pointer dark:hover:text-foreground dark:hover:border-gray-600">
                    <ArrowLeft className="h-4 w-4" />
                  </Button>
                </Link>
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <h1 className="text-lg sm:text-xl lg:text-2xl font-semibold text-foreground">
                      Detalle de Capacitación
                    </h1>
                    <Badge className={getEstadoCapacitacionColor(sesion.ESTADO)}>
                      {sesion.ESTADO}
                    </Badge>
                  </div>
                  <p className="text-xl sm:text-2xl lg:xl text-foreground/80 break-words">
                    {sesion.CAPACITACION_NOMBRE}
                  </p>
                </div>
              </div>
              <div className="w-full sm:w-auto">{getNavigationButtons()}</div>
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Información General
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
                  <InfoItem 
                    label="Código" 
                    value={sesion.CODIGO_DOCUMENTO || "N/A"} 
                  />
                  <InfoItem 
                    label="Capacitador" 
                    value={sesion.CAPACITADOR_NOMBRE} 
                  />
                  <InfoItem 
                    label="Tipo" 
                    value={sesion.TIPO_CAPACITACION} 
                  />
                  <InfoItem 
                    label="Departamento" 
                    value={sesion.DEPARTAMENTO ?? "N/A"} 
                  />
                  <InfoItem 
                    label="Fecha de Inicio" 
                    value={sesion.FECHA_PROGRAMADA
                      ? new Date(sesion.FECHA_PROGRAMADA).toLocaleDateString("es-GT")
                      : "Sin fecha"}
                    icon={<Calendar className="h-4 w-4" />}
                  />
                  <InfoItem 
                    label="Horario" 
                    value={sesion.HORARIO_FORMATO_12H}
                    icon={<Clock className="h-4 w-4" />}
                  />
                  <InfoItem 
                    label="Duración" 
                    value={sesion.DURACION_FORMATO} 
                  />
                  <InfoItem 
                    label="Nota Mínima" 
                    value={sesion.NOTA_MINIMA !== null && sesion.NOTA_MINIMA !== undefined ? String(sesion.NOTA_MINIMA) : "N/A"} 
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  Objetivo
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
                  {sesion.OBJETIVO}
                </p>
              </CardContent>
            </Card>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
              <StatCard
                icon={<Users className="h-4 w-4 sm:h-5 sm:w-5" />}
                title="Total Participantes"
                value={stats.total}
              />

              <StatCard
                icon={<CheckCircle2 className="h-4 w-4 sm:h-5 sm:w-5" />}
                title="Asistencias"
                value={stats.asistencias}
                subtitle={`${stats.total > 0 ? ((stats.asistencias / stats.total) * 100).toFixed(0) : 0}% del total`}
              />

              {sesion.APLICA_EXAMEN && (
                <StatCard
                  icon={<FileText className="h-4 w-4 sm:h-5 sm:w-5" />}
                  title="Exámenes"
                  value={`${stats.examenes}/${stats.asistencias}`}
                />
              )}

              {sesion.APLICA_DIPLOMA && (
                <StatCard
                  icon={<BookOpen className="h-4 w-4 sm:h-5 sm:w-5" />}
                  title="Diplomas"
                  value={stats.diplomas}
                />
              )}

              <StatCard
                icon={<TrendingUp className="h-4 w-4 sm:h-5 sm:w-5" />}
                title="Aprobados"
                value={stats.aprobados}
                subtitle={`${stats.asistencias > 0 ? ((stats.aprobados / stats.asistencias) * 100).toFixed(0) : 0}% de asistentes`}
              />
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Detalle de Participantes</CardTitle>
                <CardDescription>
                  Lista de colaboradores asignados a esta capacitación
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="hidden md:block border rounded-lg overflow-x-auto">
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
                          <TableCell colSpan={7} className="text-center py-8">
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

                <div className="md:hidden space-y-3">
                  {colaboradoresAsignados.length === 0 ? (
                    <div className="text-center py-8">
                      <BookOpen className="h-8 w-8 mx-auto mb-2 opacity-50" />
                      <p className="text-muted-foreground">No hay participantes asignados</p>
                    </div>
                  ) : (
                    colaboradoresAsignados.map((col) => (
                      <Card key={col.ID_COLABORADOR}>
                        <CardContent className="pt-4 space-y-3">
                          <div>
                            <p className="font-semibold text-sm">{col.NOMBRE_COMPLETO}</p>
                            <p className="text-xs text-muted-foreground">{col.CORREO}</p>
                          </div>
                          
                          <div className="grid grid-cols-2 gap-2 text-xs">
                            <div>
                              <span className="text-muted-foreground">Departamento:</span>
                              <p className="font-medium">{col.DEPARTAMENTO}</p>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Estado:</span>
                              <Badge className={`${getEstadoColaboradorColor(col.ESTADO_COLABORADOR)} text-xs mt-1`}>
                                {col.ESTADO_COLABORADOR}
                              </Badge>
                            </div>
                          </div>

                          <div className="flex items-center justify-between pt-2 border-t">
                            <div className="flex items-center gap-1">
                              <span className="text-xs text-muted-foreground">Asistencia:</span>
                              {col.ASISTIO === true ? (
                                <CheckCircle2 className="h-4 w-4 text-green-600" />
                              ) : col.ASISTIO === false ? (
                                <XCircle className="h-4 w-4 text-red-600" />
                              ) : (
                                <span className="text-muted-foreground text-xs">-</span>
                              )}
                            </div>
                            
                            {sesion.APLICA_EXAMEN && (
                              <div className="flex items-center gap-1">
                                <span className="text-xs text-muted-foreground">Nota:</span>
                                <span className="text-xs font-medium">
                                  {col.NOTA_OBTENIDA !== null ? col.NOTA_OBTENIDA : "-"}
                                </span>
                              </div>
                            )}
                            
                            {sesion.APLICA_EXAMEN && col.URL_EXAMEN && (
                              <div className="flex items-center gap-1">
                                <FileText className="h-4 w-4 text-green-600" />
                              </div>
                            )}
                            
                            {sesion.APLICA_DIPLOMA && col.URL_DIPLOMA && (
                              <div className="flex items-center gap-1">
                                <BookOpen className="h-4 w-4 text-green-600" />
                              </div>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Download className="h-5 w-5" />
                  Listado de Asistencia
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Button
                  variant="default"
                  onClick={handleDownload}
                  disabled={loadingDownload}
                  className="w-full sm:w-auto cursor-pointer"
                >
                  <Eye className="h-4 w-4 mr-2" />
                  {loadingDownload ? "Cargando..." : "Ver Documento"}
                </Button>
              </CardContent>
            </Card>

            {sesion.OBSERVACIONES && (
              <Card>
                <CardHeader>
                  <CardTitle>Observaciones</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
                    {sesion.OBSERVACIONES}
                  </p>
                </CardContent>
              </Card>
            )}
          </main>
        </div>
      </div>
    </RequirePermission>
  )
}

function InfoItem({ label, value, icon }: { label: string; value: string; icon?: React.ReactNode }) {
  return (
    <div className="space-y-1">
      <Label className="text-xs sm:text-sm text-muted-foreground">{label}</Label>
      <p className="font-medium text-sm sm:text-base flex items-center gap-2">
        {icon}
        <span className="break-words">{value}</span>
      </p>
    </div>
  )
}

function StatCard({ 
  icon, 
  title, 
  value, 
  subtitle 
}: { 
  icon: React.ReactNode; 
  title: string; 
  value: number | string; 
  subtitle?: string 
}) {
  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-2 space-y-0">
        <CardTitle className="text-xs sm:text-sm font-medium flex items-center gap-2 text-muted-foreground">
          {icon}
          <span className="line-clamp-2">{title}</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-xl sm:text-2xl font-bold">{value}</div>
        {subtitle && (
          <p className="text-xs text-muted-foreground mt-1">
            {subtitle}
          </p>
        )}
      </CardContent>
    </Card>
  )
}
