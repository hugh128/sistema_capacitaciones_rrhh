"use client"

import { useEffect, useState } from "react"
import {
  ChevronRight,
  X,
  FileText,
  CheckCircle2,
  XCircle,
  Clock,
  Check,
  BookOpen,
  FolderKanban,
  FilePenLine,
  ChartArea,
  GraduationCap,
  User,
  Briefcase,
  Calendar,
  FileCheck,
  Download,
} from "lucide-react"
import DocumentCard from "./document-card"
import type { CapacitacionColaborador, CapacitacionInduccion, Colaborador, DETALLE_PLAN_COLABORADOR, DocumentoColaborador, GrupoCapacitacion, HistorialColaborador, InduccionDocumental, ResumenColaborador } from "@/lib/colaboradores/type"
import { getCompletionColors } from "@/lib/colaboradores/type"
import { useAuth } from "@/contexts/auth-context"
import { useColaboradores } from "@/hooks/useColaboradores"

type ProfileContentProps = {
  collaborator: Colaborador
  onBack: () => void
}

export default function ProfileContent({ collaborator, onBack }: ProfileContentProps) {
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState("General")
  const [capacitaciones, setCapacitaciones] = useState<CapacitacionColaborador[]>([])
  const [documentosColaborador, setDocumentosColaborador] = useState<DocumentoColaborador[]>([])
  const [historialColaborador, setHistorialColaborador] = useState<HistorialColaborador[]>([])
  const [resumenColaborador, setResumenColaborador] = useState<ResumenColaborador[]>([])
  const [detallePlanColaborador, setDetallePlanColaborador] = useState<DETALLE_PLAN_COLABORADOR>()
  const [isLoading, setIsLoading] = useState(true);
  const [loadingDownload, setLoadingDownload] = useState(false);

  const {
    obtenerCapacitacionesColaborador,
    descargarListaAsistencia,
    obtenerDocumentosColaborador,
    descargarExamen,
    descargarDiploma,
    obtenerHistorialColaborador,
    obtenerResumenColaborador,
    descargarInduccionDocumental,
    obtenerDetallePlanColaborador,
  } = useColaboradores(user)

  useEffect(() => {
    if (!user) {
      setIsLoading(false);
      return; 
    }

    const fetchData = async () => {
      setIsLoading(true);
      try {
        const capacitaciones = await obtenerCapacitacionesColaborador(collaborator.ID_COLABORADOR)
        setCapacitaciones(capacitaciones)

        const documentos = await obtenerDocumentosColaborador(collaborator.ID_COLABORADOR)
        setDocumentosColaborador(documentos)

        const historial = await obtenerHistorialColaborador(collaborator.ID_COLABORADOR)
        setHistorialColaborador(historial)

        const resumen = await obtenerResumenColaborador(collaborator.ID_COLABORADOR)
        setResumenColaborador(resumen)

        const detallePlan = await obtenerDetallePlanColaborador(collaborator.ID_COLABORADOR)
        setDetallePlanColaborador(detallePlan);

      } catch (error) {
        console.error('Error al cargar las capacitaciones:', error)
      } finally {
        setIsLoading(false);
      }
    }

    fetchData()
  }, [
    user,
    obtenerCapacitacionesColaborador,
    collaborator.ID_COLABORADOR,
    obtenerDocumentosColaborador,
    obtenerHistorialColaborador,
    obtenerResumenColaborador,
    obtenerDetallePlanColaborador,
  ])

  const tabs = ["General", "Capacitaciones", "Exámenes", "Documentos", "Inducción", "Histórico"]

/*   const handleDownloadAll = (docs: any[]) => {
    docs.forEach((doc) => {
      const fileName = doc.name || doc.document
      if (fileName) {
        const link = document.createElement("a")
        link.href = `/documents/${fileName}`
        link.download = fileName
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
      }
    })
  } */

  const handleDownloadAsistencia = async (sesionId: number ) => {
    try {
      setLoadingDownload(true);
      const signedUrl = await descargarListaAsistencia(sesionId);
      if (signedUrl) {
        window.open(signedUrl, "_blank");
      }
    } catch (error) {
      console.error("Error al descargar la asistencia:", error);
      alert("Error al descargar la asistencia. Revisa la consola para más detalles.");
    } finally {
      setLoadingDownload(false);
    }
  };

  const handleDownloadExamen = async (colaboradorId: number, sesionId: number) => {
    try {
      setLoadingDownload(true);
      const signedUrl = await descargarExamen(sesionId, colaboradorId);
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

  const handleDownloadDiploma = async (colaboradorId: number, sesionId: number) => {
    try {
      setLoadingDownload(true);
      const signedUrl = await descargarDiploma(sesionId, colaboradorId);
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

  const handleDownloadInduccionDocumental = async (data: InduccionDocumental) => {
    try {
      setLoadingDownload(true);
      await descargarInduccionDocumental(data);
    } catch (error) {
      console.error("Error al descargar el documento:", error);
      alert("Error al descargar el documento. Revisa la consola para más detalles.");
    } finally {
      setLoadingDownload(false);
    }
  };

  const handleDownloadPlanInduccion = (idPlan: number) => {
    if (!detallePlanColaborador) return;

    const capacitacionesPlan = detallePlanColaborador.DETALLE_CAPACITACIONES.filter(
      (cap) => cap.ID_PLAN === idPlan
    );

    const gruposPorDepartamento = capacitacionesPlan.reduce((acc, cap) => {
      if (!acc[cap.departamentoCapacitacion]) {
        acc[cap.departamentoCapacitacion] = [];
      }
      acc[cap.departamentoCapacitacion].push({
        documento: cap.documento,
        codigo: cap.codigo,
        version: cap.version,
        fechaEvaluacion: cap.fechaEvaluacion || '',
        lectura: cap.lectura || '',
        capacitacion: cap.capacitacion || '',
        evaluacion: cap.evaluacion || '',
        calificacion: cap.calificacion || '',
        nombreCapacitador: '',
        estatus: cap.estatus,
      });
      return acc;
    }, {} as Record<string, CapacitacionInduccion[]>);

    const gruposCapacitacion: GrupoCapacitacion[] = Object.entries(gruposPorDepartamento).map(
      ([departamento, capacitaciones]) => ({
        departamentoCapacitacion: departamento,
        capacitaciones,
      })
    );

    const plan = detallePlanColaborador.PLANES.find((p) => p.ID_PLAN === idPlan);

    const dataInduccion: InduccionDocumental = {
      nombreColaborador: detallePlanColaborador.INFORMACION_COLABORADOR.nombreColaborador,
      departamentoColaborador: detallePlanColaborador.INFORMACION_COLABORADOR.departamentoColaborador,
      cargo: detallePlanColaborador.INFORMACION_COLABORADOR.cargo,
      jefeInmediatoNombre: detallePlanColaborador.INFORMACION_COLABORADOR.jefeInmediatoNombre,
      gruposCapacitacion,
      fechaInicioInduccion: plan?.fechaInicioInduccion || '',
      fechaFinInduccion: plan?.fechaFinInduccion || '',
    };

    handleDownloadInduccionDocumental(dataInduccion);
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case "General":     
        const colors = getCompletionColors(collaborator.PORCENTAJE_CUMPLIMIENTO);

        return (
          <div className="space-y-6"> 
            
            <div className="w-full">
              <div className="bg-card rounded-lg p-6 border border-border"> 
                <h2 className="text-xl font-semibold text-foreground mb-4">
                  Estado Actual
                </h2>

                <div className="space-y-3">
                  
                  <div className="flex flex-col sm:flex-row space-x-2">
                    <span className="text-muted-foreground font-medium mb-1 sm:mb-0">Puesto: </span>
                    <span className="px-3 py-1 self-start bg-blue-100 dark:bg-blue-900 rounded-[9px] text-sm font-semibold text-blue-700 dark:text-blue-300">
                      {collaborator.PUESTO}
                    </span>
                  </div>

                  <div className="flex flex-col sm:flex-row sm:space-x-2">
                    <span className="text-muted-foreground font-medium mb-1 sm:mb-0">Jefe Inmediato: </span>
                    <div className="flex items-center gap-2 self-start">
                      <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900 rounded-[9px] text-sm font-semibold text-blue-700 dark:text-blue-300">
                        {collaborator.ENCARGADO}
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row sm:space-x-2"> 
                    <span className="text-muted-foreground font-medium mb-1 sm:mb-0">Fecha ingreso: </span>
                    <span className="text-sm font-semibold text-muted-foreground">
                      {collaborator.FECHA_INGRESO}
                    </span>
                  </div>
                </div>

                <div className="w-full h-0.5 bg-border my-4" />

                <div className="bg-card border border-border rounded-lg p-6 flex flex-col items-center">
                  <div className="relative w-20 h-20 mb-4">
                    <div className={`absolute inset-0 rounded-full ${colors.lightClass}`} />
                    
                    <div
                      className={`absolute inset-0 rounded-full border-4 ${colors.colorClass}`}
                      style={{
                        clipPath: `polygon(0 0, 100% 0, 100% ${collaborator.PORCENTAJE_CUMPLIMIENTO}%, 0 ${collaborator.PORCENTAJE_CUMPLIMIENTO}%)`,
                      }}
                    />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className={`text-base font-semibold ${colors.textClass}`}>
                        {collaborator.PORCENTAJE_CUMPLIMIENTO}
                      </span>
                    </div>
                  </div>
                  <p className="text-base font-semibold text-foreground mb-1">
                    % de cumplimiento
                  </p>
                </div>
              </div>

              {/* --- Resumen del Estado de Capacitación --- */}
              <div className="bg-card border-2 border-border rounded-lg p-6 mt-6"> 
                <h2 className="text-base font-semibold text-foreground mb-6">
                  Resumen del Estado de Capacitación
                </h2>
                <div className="space-y-4">
                  {resumenColaborador.map((item, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <span className="text-base text-foreground">{item.ETIQUETA}</span>
                      {item.VALOR && (
                        <span className="text-base text-muted-foreground">{item.VALOR}</span>
                      )}
                      {item.ESTADO === "check" && (
                        <Check className="w-4 h-4 text-green-500" strokeWidth={3} />
                      )}
                      {item.ESTADO === "cross" && (
                        <X className="w-4 h-4 text-red-500" strokeWidth={3} />
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )
      case "Capacitaciones":
        return (
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-foreground">Todas las Capacitaciones</h2>
{/*               <button
                onClick={() => handleDownloadAll(allDocuments.capacitaciones.filter((c) => c.document))}
                className="flex items-center gap-2 px-4 py-2 bg-yellow-500 text-white font-semibold rounded-lg hover:bg-yellow-600 transition-colors"
              >
                <Download className="w-4 h-4" />
                Descargar Todos
              </button> */}
            </div>
            <div className="space-y-4">
              {capacitaciones.map((capacitacion, index) => (
                <div
                  key={index}
                  className="bg-card rounded-lg p-6 border border-border hover:border-primary transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-base font-semibold text-foreground">{capacitacion.NOMBRE_CAPACITACION}</h3>
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-semibold ${
                            capacitacion.ESTADO === "Completado"
                              ? "bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300"
                              : capacitacion.ESTADO === "En Progreso"
                                ? "bg-yellow-100 dark:bg-yellow-900 text-yellow-700 dark:text-yellow-300"
                                : "bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300"
                          }`}
                        >
                          {capacitacion.ESTADO}
                        </span>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span>{capacitacion.FECHA}</span>
                        {capacitacion.NOTA && (
                          <>
                            <div className="w-px h-4 bg-border" />
                            <span>Nota: {capacitacion.NOTA}</span>
                          </>
                        )}
                      </div>
                    </div>
                    {capacitacion.ASISTENCIA && (
                      <button
                        onClick={() => handleDownloadAsistencia(capacitacion.ID_SESION)}
                        disabled={loadingDownload}
                        className="flex items-center gap-2 px-4 py-2 border border-border text-foreground font-semibold rounded-lg hover:bg-muted transition-colors"
                      >
                        <FileText className="w-4 h-4" />
                        Ver Asistencia
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {capacitaciones.length === 0 && (
              <div className="text-center py-10 text-muted-foreground">
                <div className="h-20 w-20 rounded-full bg-muted mx-auto mb-4 flex items-center justify-center">
                  <BookOpen className="h-10 w-10 opacity-50" />
                </div>
                <p className="text-lg font-medium">No se encontraron capacitaciones</p>
              </div>
            )}
          </div>
        )
      case "Exámenes":
        const examenes = documentosColaborador.filter(doc => doc.TIPO === "EXAMEN");

        return (
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-foreground">Exámenes Realizados</h2>
            </div>
            {examenes.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {examenes.map((doc, index) => (
                  <DocumentCard
                    key={index}
                    name={doc.NOMBRE_DOCUMENTO}
                    type={doc.FILE_TYPE}
                    date={doc.FECHA_CONTEO}
                    onClick={() => 
                      handleDownloadExamen(doc.ID_COLABORADOR, doc.ID_SESION)
                    }
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-10 text-muted-foreground">
                <div className="h-20 w-20 rounded-full bg-muted mx-auto mb-4 flex items-center justify-center">
                  <FilePenLine className="h-10 w-10 opacity-50" />
                </div>
                <p className="text-lg font-medium">No se han encontrado exámenes realizados para este colaborador.</p>
              </div>

            )}
          </div>
        )
      case "Documentos":

        const documentosRelevantes = documentosColaborador.filter(
          doc => doc.TIPO === "ASISTENCIA" || doc.TIPO === "DIPLOMA"
        );

        const categoriasDeseadas = ["Asistencia", "Diploma"];

        return (
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-foreground">Todos los Documentos</h2>
{/*               <button
                onClick={() => handleDownloadAll(allDocuments.documentos)}
                className="flex items-center gap-2 px-4 py-2 bg-yellow-500 text-white font-semibold rounded-lg hover:bg-yellow-600 transition-colors"
              >
                <Download className="w-4 h-4" />
                Descargar Todos
              </button> */}
            </div>
            <div className="space-y-6">
              {categoriasDeseadas.map((category) => {
                const categoryDocs = documentosRelevantes.filter(
                  (doc) => doc.CATEGORIA === category
                )
                
                if (categoryDocs.length === 0) return null

                return (
                  <div key={category}>
                    <h3 className="text-base font-semibold text-foreground mb-3">
                      {category}
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                      {categoryDocs.map((doc, index) => {
                        
                        let downloadHandler;
                        if (doc.TIPO === "ASISTENCIA") {
                          downloadHandler = () => handleDownloadAsistencia(doc.ID_SESION);
                        } else if (doc.TIPO === "DIPLOMA") {
                          downloadHandler = () => 
                            handleDownloadDiploma(doc.ID_COLABORADOR, doc.ID_SESION);
                        }

                        return (
                          <DocumentCard 
                            key={index} 
                            name={doc.NOMBRE_DOCUMENTO}
                            type={doc.FILE_TYPE}
                            date={doc.FECHA_CONTEO}
                            onClick={downloadHandler} 
                          />
                        )
                      })}
                    </div>
                  </div>
                )
              })}
            </div>
            
            {documentosRelevantes.length === 0 && (
              <div className="text-center py-10 text-muted-foreground">
                <div className="h-20 w-20 rounded-full bg-muted mx-auto mb-4 flex items-center justify-center">
                  <FolderKanban className="h-10 w-10 opacity-50" />
                </div>
                <p className="text-lg font-medium">No se han encontrado documentos de Asistencia o Diplomas.</p>
              </div>
            )}
          </div>
        )

      case "Inducción":
        if (!detallePlanColaborador) {
          return (
            <div className="text-center py-10 text-muted-foreground">
              <div className="h-20 w-20 rounded-full bg-muted mx-auto mb-4 flex items-center justify-center">
                <GraduationCap className="h-10 w-10 opacity-50" />
              </div>
              <p className="text-lg font-medium">Cargando información de inducción...</p>
            </div>
          );
        }

        if (detallePlanColaborador.PLANES.length === 0) {
          return (
            <div className="text-center py-10 text-muted-foreground">
              <div className="h-20 w-20 rounded-full bg-muted mx-auto mb-4 flex items-center justify-center">
                <GraduationCap className="h-10 w-10 opacity-50" />
              </div>
              <p className="text-lg font-medium">No hay planes de inducción activos para este colaborador.</p>
            </div>
          );
        }

        return (
          <div className="space-y-6">
            {/* Información del Colaborador */}
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 rounded-lg p-6 border border-blue-200 dark:border-blue-800">
              <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                <User className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                Información del Colaborador
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                    <User className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Colaborador</p>
                    <p className="text-sm font-semibold text-foreground">
                      {detallePlanColaborador.INFORMACION_COLABORADOR.nombreColaborador}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-purple-100 dark:bg-purple-900 flex items-center justify-center">
                    <Briefcase className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Departamento</p>
                    <p className="text-sm font-semibold text-foreground">
                      {detallePlanColaborador.INFORMACION_COLABORADOR.departamentoColaborador}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center">
                    <GraduationCap className="w-5 h-5 text-green-600 dark:text-green-400" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Cargo</p>
                    <p className="text-sm font-semibold text-foreground">
                      {detallePlanColaborador.INFORMACION_COLABORADOR.cargo}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-orange-100 dark:bg-orange-900 flex items-center justify-center">
                    <User className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Jefe Inmediato</p>
                    <p className="text-sm font-semibold text-foreground">
                      {detallePlanColaborador.INFORMACION_COLABORADOR.jefeInmediatoNombre}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Planes de Inducción */}
            <div>
              <h2 className="text-lg font-semibold text-foreground mb-4">Planes de Inducción</h2>
              <div className="space-y-4">
                {detallePlanColaborador.PLANES.map((plan) => {
                  const capacitacionesPlan = detallePlanColaborador.DETALLE_CAPACITACIONES.filter(
                    (cap) => cap.ID_PLAN === plan.ID_PLAN
                  );

                  const capacitacionesPorDepartamento = capacitacionesPlan.reduce((acc, cap) => {
                    if (!acc[cap.departamentoCapacitacion]) {
                      acc[cap.departamentoCapacitacion] = [];
                    }
                    acc[cap.departamentoCapacitacion].push(cap);
                    return acc;
                  }, {} as Record<string, typeof capacitacionesPlan>);

                  const progressColor = plan.planCompletado
                    ? "bg-green-500"
                    : plan.porcentajeCompletado >= 50
                    ? "bg-yellow-500"
                    : "bg-blue-500";

                  return (
                    <div key={plan.ID_PLAN_COLABORADOR} className="bg-card rounded-lg border border-border overflow-hidden">
                      {/* Encabezado del Plan */}
                      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-950 dark:to-indigo-950 p-6">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex-1">
                            <h3 className="text-xl font-semibold text-white mb-2">{plan.nombrePlan}</h3>
                            <p className="text-blue-100 text-sm mb-3">{plan.descripcionPlan}</p>
                            <div className="flex flex-wrap gap-3">
                              <div className="flex items-center gap-2 bg-white/20 px-3 py-1.5 rounded-lg">
                                <Calendar className="w-4 h-4 text-white" />
                                <span className="text-xs text-white font-medium">
                                  Inicio: {new Date(plan.fechaInicioInduccion).toLocaleDateString('es-GT')}
                                </span>
                              </div>
                              {plan.fechaFinInduccion && (
                                <div className="flex items-center gap-2 bg-white/20 px-3 py-1.5 rounded-lg">
                                  <Calendar className="w-4 h-4 text-white" />
                                  <span className="text-xs text-white font-medium">
                                    Fin: {new Date(plan.fechaFinInduccion).toLocaleDateString('es-GT')}
                                  </span>
                                </div>
                              )}
                              <div className="flex items-center gap-2 bg-white/20 px-3 py-1.5 rounded-lg">
                                <FileCheck className="w-4 h-4 text-white" />
                                <span className="text-xs text-white font-medium">
                                  {plan.capacitacionesCompletadas} de {plan.totalCapacitaciones} completadas
                                </span>
                              </div>
                            </div>
                          </div>
                          <button
                            onClick={() => handleDownloadPlanInduccion(plan.ID_PLAN)}
                            disabled={loadingDownload}
                            className="flex items-center gap-2 px-4 py-2 bg-white text-blue-600 font-semibold rounded-lg hover:bg-blue-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                          >
                            <Download className="w-4 h-4" />
                            Descargar Plan
                          </button>
                        </div>

                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-blue-100 font-medium">Progreso del Plan</span>
                            <span className="text-xs text-white font-semibold">{plan.porcentajeCompletado}%</span>
                          </div>
                          <div className="w-full h-2.5 bg-white/20 rounded-full overflow-hidden">
                            <div
                              className={`h-full ${progressColor} transition-all duration-500 rounded-full`}
                              style={{ width: `${plan.porcentajeCompletado}%` }}
                            />
                          </div>
                        </div>
                      </div>

                      <div className="p-6 space-y-6">
                        {Object.entries(capacitacionesPorDepartamento).map(([departamento, capacitaciones]) => (
                          <div key={departamento}>
                            <div className="flex items-center gap-2 mb-3">
                              <div className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                                <span className="text-xs font-bold text-blue-600 dark:text-blue-400">
                                  {capacitaciones[0].codigoDepartamento}
                                </span>
                              </div>
                              <h4 className="text-base font-semibold text-foreground">{departamento}</h4>
                              <span className="text-xs text-muted-foreground">
                                ({capacitaciones.length} {capacitaciones.length === 1 ? 'capacitación' : 'capacitaciones'})
                              </span>
                            </div>

                            <div className="space-y-3">
                              {capacitaciones.map((cap, idx) => (
                                <div
                                  key={idx}
                                  className="bg-muted/30 rounded-lg p-4 border border-border hover:border-primary/50 transition-all"
                                >
                                  <div className="flex items-start justify-between gap-4 mb-3">
                                    <div className="flex-1">
                                      <h5 className="text-sm font-semibold text-foreground mb-1">
                                        {cap.documento}
                                      </h5>
                                      <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                                        <span className="font-mono bg-muted px-2 py-0.5 rounded">
                                          {cap.codigo}
                                        </span>
                                        <span>•</span>
                                        <span>Versión {cap.version}</span>
                                        <span>•</span>
                                        <span>Capacitador: {cap.nombreCapacitador}</span>
                                      </div>
                                    </div>
                                    <span
                                      className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap ${
                                        cap.estatus === "Completa"
                                          ? "bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300"
                                          : cap.estatus === "En Progreso"
                                          ? "bg-yellow-100 dark:bg-yellow-900 text-yellow-700 dark:text-yellow-300"
                                          : "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300"
                                      }`}
                                    >
                                      {cap.estatus}
                                    </span>
                                  </div>

                                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                    <div className="flex items-center gap-2 bg-card p-2 rounded border border-border">
                                      <div className={`w-5 h-5 rounded flex items-center justify-center ${
                                        cap.lectura ? 'bg-green-100 dark:bg-green-900' : 'bg-gray-100 dark:bg-gray-800'
                                      }`}>
                                        {cap.lectura ? (
                                          <Check className="w-3 h-3 text-green-600 dark:text-green-400" strokeWidth={3} />
                                        ) : (
                                          <X className="w-3 h-3 text-gray-400" strokeWidth={2} />
                                        )}
                                      </div>
                                      <span className="text-xs text-muted-foreground">Lectura</span>
                                    </div>

                                    <div className="flex items-center gap-2 bg-card p-2 rounded border border-border">
                                      <div className={`w-5 h-5 rounded flex items-center justify-center ${
                                        cap.capacitacion ? 'bg-green-100 dark:bg-green-900' : 'bg-gray-100 dark:bg-gray-800'
                                      }`}>
                                        {cap.capacitacion ? (
                                          <Check className="w-3 h-3 text-green-600 dark:text-green-400" strokeWidth={3} />
                                        ) : (
                                          <X className="w-3 h-3 text-gray-400" strokeWidth={2} />
                                        )}
                                      </div>
                                      <span className="text-xs text-muted-foreground">Capacitación</span>
                                    </div>

                                    <div className="flex items-center gap-2 bg-card p-2 rounded border border-border">
                                      <div className={`w-5 h-5 rounded flex items-center justify-center ${
                                        cap.evaluacion ? 'bg-green-100 dark:bg-green-900' : 'bg-gray-100 dark:bg-gray-800'
                                      }`}>
                                        {cap.evaluacion ? (
                                          <Check className="w-3 h-3 text-green-600 dark:text-green-400" strokeWidth={3} />
                                        ) : (
                                          <X className="w-3 h-3 text-gray-400" strokeWidth={2} />
                                        )}
                                      </div>
                                      <span className="text-xs text-muted-foreground">Evaluación</span>
                                    </div>

                                    <div className="flex items-center gap-2 bg-card p-2 rounded border border-border">
                                      <div className={`w-5 h-5 rounded flex items-center justify-center ${
                                        cap.calificacion ? 'bg-blue-100 dark:bg-blue-900' : 'bg-gray-100 dark:bg-gray-800'
                                      }`}>
                                        <span className={`text-[10px] font-bold ${
                                          cap.calificacion ? 'text-blue-600 dark:text-blue-400' : 'text-gray-400'
                                        }`}>
                                          {cap.calificacion || '-'}
                                        </span>
                                      </div>
                                      <span className="text-xs text-muted-foreground">Nota</span>
                                    </div>
                                  </div>

                                  {cap.fechaEvaluacion && (
                                    <div className="mt-2 pt-2 border-t border-border">
                                      <span className="text-xs text-muted-foreground">
                                        Fecha de evaluación: {new Date(cap.fechaEvaluacion).toLocaleDateString('es-GT')}
                                      </span>
                                    </div>
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        );

      case "Histórico":
        return (
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-foreground">Historial de Actividades</h2>
            </div>
            <div className="relative">
              {/* Timeline line */}
              <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-border" />

              <div className="space-y-6">
                {historialColaborador.map((item, index) => (
                  <div key={index} className="relative flex gap-4">
                    {/* Timeline dot */}
                    <div
                      className={`relative z-10 w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 ${
                        item.TIPO === "success"
                          ? "bg-green-100 dark:bg-green-900"
                          : item.TIPO === "error"
                            ? "bg-red-100 dark:bg-red-900"
                            : "bg-blue-100 dark:bg-blue-900"
                      }`}
                    >
                      {item.TIPO === "success" && (
                        <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400" />
                      )}
                      {item.TIPO === "error" && <XCircle className="w-5 h-5 text-red-600 dark:text-red-400" />}
                      {item.TIPO === "info" && <Clock className="w-5 h-5 text-blue-600 dark:text-blue-400" />}
                    </div>

                    {/* Content */}
                    <div className="flex-1 bg-card rounded-lg p-4 border border-border">
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="text-base font-semibold text-foreground">{item.ACCION}</h3>
                        <div className="text-xs text-muted-foreground">
                          <div>{item.FECHA}</div>
                          <div>{item.TIEMPO}</div>
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground">{item.DETALLE}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {historialColaborador.length === 0 && (
              <div className="text-center py-10 text-muted-foreground">
                <div className="h-20 w-20 rounded-full bg-muted mx-auto mb-4 flex items-center justify-center">
                  <ChartArea className="h-10 w-10 opacity-50" />
                </div>
                <p className="text-lg font-medium">No se ha encontrado historial de colaborador.</p>
              </div>
            )}

          </div>
        )

      default:
        return null
    }
  }

  return (
    <div className="flex-1">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 mb-6 text-xs">
        <button onClick={onBack} className="text-muted-foreground hover:text-foreground">
          Colaboradores
        </button>
        <ChevronRight className="w-3 h-3 text-muted-foreground" />
        <span className="text-foreground font-semibold">{collaborator.NOMBRE_COMPLETO}</span>
      </div>

      {/* Profile Header Card */}
      <div className="bg-card rounded-lg p-8 mb-4">
        <div className="flex items-start gap-6">
          {/* Avatar */}
          <div className="w-16 h-16 rounded-full bg-primary/20 dark:bg-primary/80 flex items-center justify-center flex-shrink-0">
            <span className="text-[22px] font-semibold text-primary dark:text-foreground">{collaborator.INICIALES}</span>
          </div>

          {/* Profile Info */}
          <div className="flex-1">
            <div className="flex items-center gap-4 mb-2">
              <h1 className="text-[22px] font-semibold text-foreground">{collaborator.NOMBRE_COMPLETO}</h1>
              <span
                className={`px-3 py-1 rounded-[9px] text-xs font-semibold ${
                  collaborator.ESTADO.toLowerCase() === "activo"
                    ? "bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300"
                    : collaborator.ESTADO === "permiso"
                      ? "bg-yellow-100 dark:bg-yellow-900 text-yellow-700 dark:text-yellow-300"
                      : "bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300"
                }`}
              >
                {collaborator.ESTADO}
              </span>
            </div>
            <div className="flex items-center gap-6 mb-3">
              <span className="text-base text-muted-foreground">{collaborator.EMAIL}</span>
              <div className="w-px h-5 bg-border" />
              <span className="text-base text-muted-foreground">Tel: {collaborator.TELEFONO}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Card */}
      <div className="bg-card rounded-lg">
        {/* Tabs */}
        <div className="flex items-center gap-0 px-8 pt-6 border-b-2 border-border">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => {
                setActiveTab(tab)
              }}
              className={`px-4 py-2 text-base font-semibold relative transition-opacity hover:opacity-100 ${
                activeTab === tab ? "text-foreground" : "text-muted-foreground"
              }`}
            >
              {tab}
              {activeTab === tab && (
                <div className="absolute bottom-0 left-0 w-[60px] h-0.5 bg-yellow-500 rounded-t-[7px]" />
              )}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="p-8">{renderTabContent()}</div>
      </div>
    </div>
  )
}
