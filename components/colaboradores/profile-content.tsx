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
} from "lucide-react"
import DocumentCard from "./document-card"
import type { CapacitacionColaborador, Colaborador, DocumentoColaborador, HistorialColaborador, ResumenColaborador } from "@/lib/colaboradores/type"
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
  ])

  const tabs = ["General", "Capacitaciones", "Exámenes", "Documentos", "Histórico"]

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
                <div className="absolute bottom-0 left-0 w-[51px] h-0.5 bg-yellow-500 rounded-t-[7px]" />
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
