"use client"

import { useState, useMemo, useEffect } from "react"
import { useAuth } from "@/contexts/auth-context"
import { Sidebar } from "@/components/sidebar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Info, Users, FileText, Award } from "lucide-react"
import Link from "next/link"
import { useParams, useRouter } from "next/navigation"
import type { ColaboradorAsistenciaData, COLABORADORES_SESION, SESION_DETALLE } from "@/lib/mis-capacitaciones/capacitaciones-types"
import { TrainingHeader } from "@/components/mis-capacitaciones/training-header"
import { InfoTab } from "@/components/mis-capacitaciones/info-tab"
import { ParticipantsTab } from "@/lib/mis-capacitaciones/participants-tab"
import { DocumentsTab } from "@/lib/mis-capacitaciones/documents-tab"
import { FinalizationTab } from "@/lib/mis-capacitaciones/finalization-tab"
import { RequirePermission } from "@/components/RequirePermission"
import { useCapacitaciones } from "@/hooks/useCapacitaciones"
import { AppHeader } from "@/components/app-header"
import { Toaster } from "react-hot-toast"

export interface FileState {
    [colaboradorId: number]: File | null;
}

export default function TrainerCapacitacionDetailPage() {
  const { user } = useAuth()
  const params = useParams()
  const router = useRouter()
  const sesionId = Number(params.id)

  const {
    obtenerDetalleSesionCapacitador,
    iniciarSesionCapacitador,
    finalizarSesionCapacitador,
    registrarAsistenciaMasiva,
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

  useEffect(() => {
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

        // Inicializar los estados desde la data que viene del backend
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

        // Si hay una lista de asistencia subida, la mostramos
        if (SESION.URL_LISTA_ASISTENCIA) {
          setDisplayedFileUrl(SESION.URL_LISTA_ASISTENCIA);
        }

      } catch (error) {
        console.error('Error al cargar datos:', error)
      } finally {
        setIsLoading(false);
      }
    }

    fetchData()
  }, [user, sesionId, obtenerDetalleSesionCapacitador, setAsistenciaState, setNotasState])


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

    const examenes = Object.values(examenesParticipantsState).filter((e) => e !== null).length
    const diplomas = Object.values(diplomasParticipantsState).filter((d) => d !== null).length

    const pendientes = colaboradoresAsignados.filter((col) => {
      const asistio = asistenciaState[col.ID_COLABORADOR]
      return asistio === undefined || asistio === null
    }).length

    return { total, asistencias, examenes, diplomas, pendientes }
  }, [colaboradoresAsignados, asistenciaState, examenesParticipantsState, diplomasParticipantsState])

  const canFinalize = useMemo(() => {
    if (!sesion) return false
    if (sesion.ESTADO !== "EN_PROCESO") return false

    const allAttendanceMarked = colaboradoresAsignados.every((c) => asistenciaState[c.ID_COLABORADOR] !== undefined);
    if (!allAttendanceMarked) {
      console.log("No se puede finalizar: La asistencia no está marcada para todos.");
      return false;
    }

    if (!listaAsistenciaFile) {
      console.log("No se puede finalizar: Falta subir el archivo de Lista de Asistencia de la Sesión.");
      return false;
    }

    const attendees = colaboradoresAsignados.filter((c) => asistenciaState[c.ID_COLABORADOR] === true);

    if (sesion.APLICA_EXAMEN) {
      const allGradesEntered = attendees.every((c) => notasState[c.ID_COLABORADOR] !== null && notasState[c.ID_COLABORADOR] !== undefined);
      if (!allGradesEntered) {
        console.log("No se puede finalizar: Faltan notas por ingresar para algunos asistentes.");
        return false;
      }

      const allExamsUploaded = attendees.every((c) => examenesParticipantsState[c.ID_COLABORADOR]);
      if (!allExamsUploaded) {
        console.log("No se puede finalizar: Faltan archivos de Examen por subir.");
        return false;
      }
    }
    
    if (sesion.APLICA_DIPLOMA) {
      const allDiplomasUploaded = attendees.every((c) => diplomasParticipantsState[c.ID_COLABORADOR]);
      if (!allDiplomasUploaded) {
        console.log("No se puede finalizar: Faltan archivos de Diploma por subir.");
        return false;
      }
    }

    console.log("Listo para finalizar: Se cumplen todas las condiciones.");
    return true
      
  }, [
    sesion, 
    colaboradoresAsignados, 
    asistenciaState, 
    notasState,
    examenesParticipantsState,
    diplomasParticipantsState,
    listaAsistenciaFile
  ]);

  const handleToggleAsistencia = (colaboradorId: number, currentValue: boolean | undefined) => {
    const newValue = currentValue === true ? false : true
    setAsistenciaState((prev) => ({ ...prev, [colaboradorId]: newValue }))
  }

  const handleUpdateNota = (colaboradorId: number, nota: number) => {
    setNotasState((prev) => ({ ...prev, [colaboradorId]: nota }))
  }

  const handleSubirDocumento = (tipo: "examen" | "diploma", colaboradorId: number, file: File) => {
    if (tipo === "examen") {
      setExamenesFileState((prev) => ({ ...prev, [colaboradorId]: file }))
    } else {
      setDiplomasFileState((prev) => ({ ...prev, [colaboradorId]: file }))
    }
  }
  
  const handleEliminarDocumento = (tipo: "examen" | "diploma", colaboradorId: number) => {
    if (tipo === "examen") {
      setExamenesFileState((prev) => ({ ...prev, [colaboradorId]: null }))
    } else {
      setDiplomasFileState((prev) => ({ ...prev, [colaboradorId]: null }))
    }
  }

  const handleMarcarAsistenciaMasiva = (asistio: boolean, colaboradorIds: number[]) => {
    const updates: Record<number, boolean> = {}
    colaboradorIds.forEach((id) => {
      updates[id] = asistio
    })
    setAsistenciaState((prev) => ({ ...prev, ...updates }))
  }

  const handleSelectAttendanceFile = (file: File) => {
    setListaAsistenciaFile(file)
    setDisplayedFileUrl(URL.createObjectURL(file))
  }

  const handleDeleteAttendance = () => {
    if (displayedFileUrl) {
      URL.revokeObjectURL(displayedFileUrl)
    }
    setListaAsistenciaFile(null)
    setDisplayedFileUrl(null)
  }

  const handleFinalizar = async () => {
    if (!canFinalize || !user?.PERSONA_ID || !sesionId || !listaAsistenciaFile) {
      console.error("No se puede finalizar la sesión por datos incompletos.");
      return;
    }

    const colaboradoresParaAPI = colaboradoresAsignados
      .filter((col) => asistenciaState[col.ID_COLABORADOR] === true)
      .map((col) => {
        const idColaborador = col.ID_COLABORADOR;

        return {
          idColaborador: idColaborador,
          asistio: asistenciaState[idColaborador] === true, 
          notaObtenida: notasState[idColaborador] ?? null,
          observaciones: observacionesFinales,
          archivoExamen: examenesFileState[idColaborador] || undefined,
          archivoDiploma: diplomasFileState[idColaborador] || undefined,
        } as ColaboradorAsistenciaData;
      });


    try {
      await registrarAsistenciaMasiva(
        sesionId,
        colaboradoresParaAPI
      );
      
      await finalizarSesionCapacitador(
        sesionId,
        user.PERSONA_ID,
        observacionesFinales,
        listaAsistenciaFile
      )
      
      router.push("/mis-capacitaciones")
    } catch (error) {
      console.error("Error al finalizar la sesión:", error)
    }
  }

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

  if (
    !user ||
    !user.ROLES.some(
      (role) => (role.NOMBRE === "Capacitador" || role.NOMBRE === "RRHH")
    )

  ) {
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
    <RequirePermission requiredPermissions={["manage_trainings"]}>
      <div className="flex h-screen bg-background">
        <Sidebar />
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* <AppHeader /> */}

          <AppHeader title="Mis Capacitaciones" subtitle="Gestiona tus capacitaciones asignadas y registra el progreso de los participantes" />

          <main className="flex-1 p-6 space-y-6 max-w-[1600px] mx-auto w-full overflow-auto custom-scrollbar">
            <Toaster />

            <TrainingHeader
              sesion={sesion}
              onChangeEstado={handleChangeEstado}
              usuario={user}
            />

            <Tabs defaultValue="info" className="w-full">
              <TabsList className="grid w-full grid-cols-4 h-auto p-1">
                <TabsTrigger value="info" className="flex items-center gap-2 py-3">
                  <Info className="h-4 w-4" />
                  <span className="hidden sm:inline">Información</span>
                </TabsTrigger>
                <TabsTrigger value="participantes" className="flex items-center gap-2 py-3">
                  <Users className="h-4 w-4" />
                  <span className="hidden sm:inline">Participantes</span>
                </TabsTrigger>
                <TabsTrigger value="documentos" className="flex items-center gap-2 py-3">
                  <FileText className="h-4 w-4" />
                  <span className="hidden sm:inline">Documentos</span>
                </TabsTrigger>
                <TabsTrigger value="finalizacion" className="flex items-center gap-2 py-3">
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
                />
              </TabsContent>

              <TabsContent value="documentos" className="space-y-4 mt-6">
                <DocumentsTab
                  sesion={sesion}
                  colaboradores={colaboradoresAsignados}
                  stats={stats}
                  onSelectAttendanceFile={handleSelectAttendanceFile} 
                  onDeleteAttendance={handleDeleteAttendance}
                  displayedFileUrl={displayedFileUrl || sesion.URL_LISTA_ASISTENCIA || null}
                  isFileUploaded={!!(listaAsistenciaFile || sesion.URL_LISTA_ASISTENCIA)}
                  usuario={user}
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
