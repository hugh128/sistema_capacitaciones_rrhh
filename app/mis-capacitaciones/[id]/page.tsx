"use client"

import { useState, useMemo, useEffect, useCallback, useRef } from "react"
import { useAuth } from "@/contexts/auth-context"
import { Sidebar } from "@/components/sidebar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Info, Users, FileText, Award, FileEdit } from "lucide-react"
import Link from "next/link"
import { useParams, useRouter } from "next/navigation"
import type { ColaboradorAsistenciaData, COLABORADORES_SESION, FileState, Serie, SESION_DETALLE } from "@/lib/mis-capacitaciones/capacitaciones-types"
import { TrainingHeader } from "@/components/mis-capacitaciones/training-header"
import { InfoTab } from "@/components/mis-capacitaciones/info-tab"
import { ParticipantsTab } from "@/components/mis-capacitaciones/participants-tab"
import { DocumentsTab } from "@/components/mis-capacitaciones/documents-tab"
import { FinalizationTab } from "@/components/mis-capacitaciones/finalization-tab"
import { ExamTab } from "@/components/mis-capacitaciones/exam-tab"
import { RequirePermission } from "@/components/RequirePermission"
import { useCapacitaciones } from "@/hooks/useCapacitaciones"
import { AppHeader } from "@/components/app-header"
import toast, { Toaster } from "react-hot-toast"

export default function TrainerCapacitacionDetailPage() {
  const { user, loading: isAuthLoading } = useAuth()
  const params = useParams()
  const router = useRouter()
  const sesionId = Number(params.id)
  
  const {
    obtenerDetalleSesionCapacitador,
    iniciarSesionCapacitador,
    finalizarSesionConAsistencias,
    guardarPlantillaExamen,
    obtenerPlantillaExamen,
    descargarExamen,
    descargarDiploma,
  } = useCapacitaciones(user);

  const [isLoading, setIsLoading] = useState(true);
  const [sesion, setSesion] = useState<SESION_DETALLE>()
  const [colaboradoresAsignados, setColaboradoresAsignados] = useState<COLABORADORES_SESION[]>([])
  const [listaAsistenciaFile, setListaAsistenciaFile] = useState<File | null>(null)
  const [displayedFileUrl, setDisplayedFileUrl] = useState<string | null>(null)
  const [asistenciaState, setAsistenciaState] = useState<Record<number, boolean>>({})
  const [notasState, setNotasState] = useState<Record<number, number | null>>({})
  const [examenesFileState, setExamenesFileState] = useState<FileState>({});
  const [diplomasFileState, setDiplomasFileState] = useState<FileState>({});
  const [observacionesFinales, setObservacionesFinales] = useState("")
  const [examenesState, setExamenesState] = useState<Record<number, boolean>>({});
  const [diplomasState, setDiplomasState] = useState<Record<number, boolean>>({});
  const [plantillaExamen, setPlantillaExamen] = useState<{ series: Serie[] } | undefined>()

  const isInitialMount = useRef(true);

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
        const { SESION, COLABORADORES } = await obtenerDetalleSesionCapacitador(sesionId, user?.PERSONA_ID)

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
        setExamenesState(initialExamenes);
        setDiplomasState(initialDiplomas);

        if (isInitialMount.current && SESION.URL_LISTA_ASISTENCIA) {
          setDisplayedFileUrl(SESION.URL_LISTA_ASISTENCIA);
          isInitialMount.current = false;
        }

        const plantilla = await obtenerPlantillaExamen(sesionId)
        if (plantilla) {
          setPlantillaExamen(plantilla)
        }

      } catch (error) {
        console.error('❌ Error al cargar datos:', error)
      } finally {
        setIsLoading(false);
      }
    }

    fetchData()
  }, [isAuthLoading, user, sesionId, obtenerDetalleSesionCapacitador, obtenerPlantillaExamen])

  const examenesParticipantsState = useMemo(() => {
    const state: Record<number, File | null> = {};
    
    colaboradoresAsignados.forEach(col => {
      const id = col.ID_COLABORADOR;
      
      if (examenesFileState[id] !== undefined) {
        state[id] = examenesFileState[id];
      } 
      else if (col.URL_EXAMEN) {
        state[id] = examenesState[id] ? ({ name: 'Examen existente', size: 0 } as unknown as File) : null;
      } else {
          state[id] = null;
      }
    });
    return state;
  }, [colaboradoresAsignados, examenesFileState, examenesState]);

  const diplomasParticipantsState = useMemo(() => {
    const state: Record<number, File | null> = {};
    
    colaboradoresAsignados.forEach(col => {
      const id = col.ID_COLABORADOR;
      if (diplomasFileState[id] !== undefined) {
        state[id] = diplomasFileState[id];
      } else if (col.URL_DIPLOMA) {
        state[id] = diplomasState[id] ? ({ name: 'Diploma existente', size: 0 } as unknown as File) : null;
      } else {
        state[id] = null;
      }
    });
    return state;
  }, [colaboradoresAsignados, diplomasFileState, diplomasState]);

  const stats = useMemo(() => {
    const total = colaboradoresAsignados.length
    
    const asistencias = Object.values(asistenciaState).filter((a) => a === true).length
    
    const asistenciasRegistradas = colaboradoresAsignados.filter((col) => {
      const asistio = asistenciaState[col.ID_COLABORADOR]
      return asistio === true || asistio === false
    }).length

    const examenes = Object.values(examenesParticipantsState).filter((e) => e !== null).length
    const diplomas = Object.values(diplomasParticipantsState).filter((d) => d !== null).length

    const pendientes = colaboradoresAsignados.filter((col) => {
      const asistio = asistenciaState[col.ID_COLABORADOR]
      return asistio === undefined || asistio === null
    }).length

    const notasIngresadas = colaboradoresAsignados.filter((col) => {
      const asistio = asistenciaState[col.ID_COLABORADOR]
      const nota = notasState[col.ID_COLABORADOR]
      return asistio === true && nota !== null && nota !== undefined
    }).length

    const diplomasRequeridos = colaboradoresAsignados.filter((col) => {
      const asistio = asistenciaState[col.ID_COLABORADOR]
      const nota = notasState[col.ID_COLABORADOR]
      const notaMinima = sesion?.NOTA_MINIMA || 60
      
      if (asistio !== true) return false
      if (!sesion?.APLICA_EXAMEN) return true
      if (nota === null || nota === undefined) return false
      
      return nota >= notaMinima
    }).length

    const listaAsistenciaSubida = !!listaAsistenciaFile || !!sesion?.URL_LISTA_ASISTENCIA

    return { 
      total, 
      asistencias, 
      asistenciasRegistradas,
      examenes, 
      diplomas, 
      pendientes,
      notasIngresadas,
      diplomasRequeridos,
      listaAsistenciaSubida
    }
  }, [colaboradoresAsignados, asistenciaState, examenesParticipantsState, diplomasParticipantsState, notasState, sesion, listaAsistenciaFile])

  const canFinalize = useMemo(() => {
    if (!sesion) return false;
    if (!["EN_PROCESO", "RECHAZADA"].includes(sesion.ESTADO)) {
      return false;
    }

    const allAttendanceMarked = colaboradoresAsignados.every((c) => {
      const asistio = asistenciaState[c.ID_COLABORADOR];
      return asistio === true || asistio === false;
    });
    if (!allAttendanceMarked) return false;

    if (!listaAsistenciaFile && !sesion.URL_LISTA_ASISTENCIA) return false;

    const attendees = colaboradoresAsignados.filter((c) => 
      asistenciaState[c.ID_COLABORADOR] === true
    );

    if (sesion.APLICA_EXAMEN) {
      const allGradesEntered = attendees.every((c) => 
        notasState[c.ID_COLABORADOR] !== null && 
        notasState[c.ID_COLABORADOR] !== undefined
      );
      if (!allGradesEntered) return false;

      const allExamsUploaded = attendees.every((c) => 
        examenesParticipantsState[c.ID_COLABORADOR]
      );
      if (!allExamsUploaded) return false;
    }
    
    if (sesion.APLICA_DIPLOMA) {
      const allDiplomasUploaded = attendees.every((c) => 
        diplomasParticipantsState[c.ID_COLABORADOR]
      );
      if (!allDiplomasUploaded) return false;
    }

    return true;
  }, [sesion, colaboradoresAsignados, asistenciaState, notasState, 
      examenesParticipantsState, diplomasParticipantsState, listaAsistenciaFile]);

  const getFinalizationError = useCallback(() => {
    if (!sesion) return null;
    if (!["EN_PROCESO", "RECHAZADA"].includes(sesion.ESTADO)) {
      return "La sesión no está en un estado que permita finalización.";
    }

    const allAttendanceMarked = colaboradoresAsignados.every((c) => {
      const asistio = asistenciaState[c.ID_COLABORADOR];
      return asistio === true || asistio === false;
    });
    if (!allAttendanceMarked) {
      return "La asistencia no está marcada para todos los colaboradores.";
    }

    if (!listaAsistenciaFile && !sesion.URL_LISTA_ASISTENCIA) {
      return "Falta subir el archivo de Lista de Asistencia de la Sesión.";
    }

    const attendees = colaboradoresAsignados.filter((c) => 
      asistenciaState[c.ID_COLABORADOR] === true
    );

    if (sesion.APLICA_EXAMEN) {
      const allGradesEntered = attendees.every((c) => 
        notasState[c.ID_COLABORADOR] !== null && 
        notasState[c.ID_COLABORADOR] !== undefined
      );
      if (!allGradesEntered) {
        return "Faltan notas por ingresar para algunos asistentes.";
      }

      const allExamsUploaded = attendees.every((c) => 
        examenesParticipantsState[c.ID_COLABORADOR]
      );
      if (!allExamsUploaded) {
        return "Faltan archivos de Examen por subir.";
      }
    }
    
    if (sesion.APLICA_DIPLOMA) {
      const allDiplomasUploaded = attendees.every((c) => 
        diplomasParticipantsState[c.ID_COLABORADOR]
      );
      if (!allDiplomasUploaded) {
        return "Faltan archivos de Diploma por subir.";
      }
    }

    return null;
  }, [sesion, colaboradoresAsignados, asistenciaState, notasState, 
      examenesParticipantsState, diplomasParticipantsState, listaAsistenciaFile]);
      
  const handleToggleAsistencia = useCallback((colaboradorId: number, currentValue: boolean | undefined) => {
    const newValue = currentValue === true ? false : true
    setAsistenciaState((prev) => ({ ...prev, [colaboradorId]: newValue }))
  }, [])

  const handleUpdateNota = useCallback((colaboradorId: number, nota: number) => {
    setNotasState((prev) => ({ ...prev, [colaboradorId]: nota }))
  }, [])

  const handleSubirDocumento = useCallback((tipo: "examen" | "diploma", colaboradorId: number, file: File) => {
    if (tipo === "examen") {
      setExamenesFileState((prev) => ({ ...prev, [colaboradorId]: file }))
    } else {
      setDiplomasFileState((prev) => ({ ...prev, [colaboradorId]: file }))
    }
  }, [])
  
  const handleEliminarDocumento = useCallback((tipo: "examen" | "diploma", colaboradorId: number) => {
    if (tipo === "examen") {
      setExamenesFileState((prev) => ({ ...prev, [colaboradorId]: null }))
    } else {
      setDiplomasFileState((prev) => ({ ...prev, [colaboradorId]: null }))
    }
  }, [])

  const handleMarcarAsistenciaMasiva = useCallback((asistio: boolean, colaboradorIds: number[]) => {
    const updates: Record<number, boolean> = {}
    colaboradorIds.forEach((id) => {
      updates[id] = asistio
    })
    setAsistenciaState((prev) => ({ ...prev, ...updates }))
  }, [])

  const handleSelectAttendanceFile = useCallback((file: File) => {
    setListaAsistenciaFile(file)
    setDisplayedFileUrl(URL.createObjectURL(file))
  }, [])

  const handleDeleteAttendance = useCallback(() => {
    if (displayedFileUrl && displayedFileUrl.startsWith('blob:')) {
      URL.revokeObjectURL(displayedFileUrl);
    }
    
    setListaAsistenciaFile(null);
    setDisplayedFileUrl(null);
    
  }, [displayedFileUrl]);

  const handleFinalizar = async () => {
    const error = getFinalizationError();

    if (!sesion) return;

    if (error) {
      toast.error(`No se puede finalizar la sesión: ${error}`);
      return;
    }

    if (!user?.PERSONA_ID || !sesionId) {
      toast.error("No se puede finalizar la sesión por datos incompletos.");
      return;
    }

    if (!listaAsistenciaFile && !sesion.URL_LISTA_ASISTENCIA) {
      toast.error("No hay archivo de lista de asistencia.");
      return;
    }

    const colaboradoresParaAPI = colaboradoresAsignados.map((col) => {
      const idColaborador = col.ID_COLABORADOR;
      const asistio = asistenciaState[idColaborador];
      
      return {
        idColaborador: idColaborador,
        asistio: asistio === true,
        notaObtenida: asistio === true ? (notasState[idColaborador] ?? null) : null,
        observaciones: observacionesFinales,
        archivoExamen: asistio === true ? examenesFileState[idColaborador] : undefined,
        archivoDiploma: asistio === true ? diplomasFileState[idColaborador] : undefined,
      } as ColaboradorAsistenciaData;
    });

    try {
      toast.loading("Finalizando sesión y registrando asistencias...", { id: 'finalizacion' });
      
      await finalizarSesionConAsistencias(
        sesionId,
        user.PERSONA_ID,
        colaboradoresParaAPI,
        listaAsistenciaFile,
        observacionesFinales,
        false
      );
      
      toast.success("Sesión finalizada exitosamente. Será revisada por RRHH.", { id: 'finalizacion' });
      router.push("/mis-capacitaciones");
      
    } catch (error) {
      console.error("Error al finalizar la sesión:", error);
      const errorMessage = error instanceof Error ? error.message : "Error desconocido";
      toast.error(`Error al finalizar la sesión: ${errorMessage}`, { id: 'finalizacion' });
    }
  };

  const handleChangeEstado = async (idSesion: number, idCapacitador: number, observaciones: null | string) => {
    try {
      setIsLoading(true);
      await iniciarSesionCapacitador(idSesion, idCapacitador, observaciones)
      
      setSesion(prevSesion => {
        if (prevSesion) {
          return {
            ...prevSesion,
            ESTADO: "EN_PROCESO",
          } as SESION_DETALLE;
        }
        return prevSesion;
      });
      
      router.refresh() 
    } catch (error) {
      console.error('Error al iniciar la sesión:', error);
    } finally {
      setIsLoading(false);
    }
  }

  const handleSavePlantilla = async (plantilla: { series: Serie[] }) => {
    try {
      if (!user) {
        throw new Error("Usuario no disponible para guardar la plantilla.");
      }
      await guardarPlantillaExamen(sesionId, plantilla, user.USERNAME)
      setPlantillaExamen(plantilla)
    } catch (error) {
      console.error('Error al guardar plantilla:', error)
    }
  }

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

  if (!user || !user.ROLES.some((role) => (role.NOMBRE === "Capacitador" || role.NOMBRE === "RRHH"))) {
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
            <Link href="/mis-capacitaciones">
              <Button>Volver a Mis Capacitaciones</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <RequirePermission requiredPermissions={["my_trainings_access"]}>
      <div className="flex h-screen bg-background">
        <Sidebar />
        <div className="flex-1 flex flex-col overflow-hidden">
          <AppHeader title="Mis Capacitaciones" subtitle="Gestiona tus capacitaciones asignadas y registra el progreso de los participantes" />

          <main className="flex-1 p-6 space-y-6 max-w-[1600px] mx-auto w-full overflow-auto custom-scrollbar">
            <Toaster />

            <TrainingHeader
              sesion={sesion}
              onChangeEstado={handleChangeEstado}
              usuario={user}
            />

            <Tabs defaultValue="info" className="w-full">
              <TabsList className="flex flex-wrap w-full gap-1 p-1 h-auto">
                <TabsTrigger value="info" className="flex items-center gap-2 py-3 cursor-pointer data-[state=active]:border-b-blue-800 dark:data-[state=active]:border-b-blue-800 data-[state=active]:bg-white/60 dark:data-[state=active]:bg-transparent">
                  <Info className="h-4 w-4" />
                  <span className="hidden sm:inline">Información</span>
                </TabsTrigger>
                <TabsTrigger value="participantes" className="flex items-center gap-2 py-3 cursor-pointer data-[state=active]:border-b-blue-800 dark:data-[state=active]:border-b-blue-800 data-[state=active]:bg-white/60 dark:data-[state=active]:bg-transparent">
                  <Users className="h-4 w-4" />
                  <span className="hidden sm:inline">Participantes</span>
                </TabsTrigger>
                <TabsTrigger value="examen" className="flex items-center gap-2 py-3 cursor-pointer data-[state=active]:border-b-blue-800 dark:data-[state=active]:border-b-blue-800 data-[state=active]:bg-white/60 dark:data-[state=active]:bg-transparent">
                  <FileEdit className="h-4 w-4" />
                  <span className="hidden sm:inline">Examen</span>
                </TabsTrigger>
                <TabsTrigger value="documentos" className="flex items-center gap-2 py-3 cursor-pointer data-[state=active]:border-b-blue-800 dark:data-[state=active]:border-b-blue-800 data-[state=active]:bg-white/60 dark:data-[state=active]:bg-transparent">
                  <FileText className="h-4 w-4" />
                  <span className="hidden sm:inline">Documentos</span>
                </TabsTrigger>
                <TabsTrigger value="finalizacion" className="flex items-center gap-2 py-3 cursor-pointer data-[state=active]:border-b-blue-800 dark:data-[state=active]:border-b-blue-800 data-[state=active]:bg-white/60 dark:data-[state=active]:bg-transparent">
                  <Award className="h-4 w-4" />
                  <span className="hidden sm:inline">Finalización</span>
                </TabsTrigger>
              </TabsList>

              <TabsContent value="info" className="space-y-4 mt-6">
                <InfoTab sesion={sesion} />
              </TabsContent>

              <TabsContent value="participantes" className="space-y-4 mt-6">
                <ParticipantsTab
                  sesion={sesion}
                  colaboradores={colaboradoresAsignados}
                  asistenciaState={asistenciaState}
                  notasState={notasState}
                  examenesState={examenesParticipantsState}
                  diplomasState={diplomasParticipantsState}
                  onToggleAsistencia={handleToggleAsistencia}
                  onUpdateNota={handleUpdateNota}
                  onSubirDocumento={handleSubirDocumento}
                  onEliminarDocumento={handleEliminarDocumento}
                  onMarcarAsistenciaMasiva={handleMarcarAsistenciaMasiva}
                  onDescargarExamen={descargarExamen}
                  onDescargarDiploma={descargarDiploma}
                />
              </TabsContent>

              <TabsContent value="examen" className="space-y-4 mt-6">
                {sesion.APLICA_EXAMEN ? (
                  <ExamTab
                    sesion={sesion}
                    onSavePlantilla={handleSavePlantilla}
                    plantillaInicial={plantillaExamen}
                  />
                ) : (
                  <Card>
                    <CardContent className="py-12 text-center">
                      <FileEdit className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-50" />
                      <p className="text-lg font-medium text-muted-foreground">
                        Esta capacitación no requiere examen
                      </p>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

              <TabsContent value="documentos" className="space-y-4 mt-6">
                <DocumentsTab
                  sesion={sesion}
                  colaboradores={colaboradoresAsignados}
                  stats={stats}
                  onSelectAttendanceFile={handleSelectAttendanceFile} 
                  onDeleteAttendance={handleDeleteAttendance}
                  displayedFileUrl={displayedFileUrl}
                  isFileUploaded={!!displayedFileUrl && !displayedFileUrl.startsWith('blob:')}
                  plantillaExamen={plantillaExamen}
                  usuario={user}
                  listaAsistenciaFile={listaAsistenciaFile}
                />
              </TabsContent>

              <TabsContent value="finalizacion" className="space-y-4 mt-6">
                <FinalizationTab
                  sesion={sesion}
                  stats={stats}
                  canFinalize={canFinalize}
                  observacionesFinales={observacionesFinales}
                  onObservacionesChange={setObservacionesFinales}
                  onFinalizar={handleFinalizar}
                />
              </TabsContent>
            </Tabs>
          </main>
        </div>
      </div>
    </RequirePermission>
  )
}
