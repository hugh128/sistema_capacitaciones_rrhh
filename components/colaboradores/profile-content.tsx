"use client"

import { useEffect, useState } from "react"
import { ChevronRight, Loader2 } from "lucide-react"
import type {
  CapacitacionColaborador,
  CapacitacionInduccion,
  Colaborador,
  DETALLE_PLAN_COLABORADOR,
  DocumentoColaborador,
  GrupoCapacitacion,
  HistorialColaborador,
  InduccionDocumental,
  ResumenColaborador,
} from "@/lib/colaboradores/type"
import { useAuth } from "@/contexts/auth-context"
import { useColaboradores } from "@/hooks/useColaboradores"
import GeneralTab from "./tabs/GeneralTab"
import ExpedienteTab from "./tabs/ExpedienteTab"
import CapacitacionesTab from "./tabs/CapacitacionesTab"
import ExamenesTab from "./tabs/ExamenesTab"
import DocumentosTab from "./tabs/DocumentosTab"
import InduccionTab from "./tabs/InduccionTab"
import HistoricoTab from "./tabs/HistoricoTab"

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
  const [isLoading, setIsLoading] = useState(true)
  const [loadingDownload, setLoadingDownload] = useState(false)

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
      setIsLoading(false)
      return
    }

    const fetchData = async () => {
      setIsLoading(true)
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
        setDetallePlanColaborador(detallePlan)
      } catch (error) {
        console.error("Error al cargar las capacitaciones:", error)
      } finally {
        setIsLoading(false)
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

  const tabs = [
    "General",
    "Expediente",
    "Capacitaciones",
    "Exámenes",
    "Documentos",
    "Inducción",
    "Histórico",
  ]

  const handleDownloadAsistencia = async (sesionId: number) => {
    try {
      setLoadingDownload(true)
      const signedUrl = await descargarListaAsistencia(sesionId)
      if (signedUrl) {
        window.open(signedUrl, "_blank")
      }
    } catch (error) {
      console.error("Error al descargar la asistencia:", error)
      alert("Error al descargar la asistencia. Revisa la consola para más detalles.")
    } finally {
      setLoadingDownload(false)
    }
  }

  const handleDownloadExamen = async (colaboradorId: number, sesionId: number) => {
    try {
      setLoadingDownload(true)
      const signedUrl = await descargarExamen(sesionId, colaboradorId)
      if (signedUrl) {
        window.open(signedUrl, "_blank")
      }
    } catch (error) {
      console.error("Error al descargar el examen:", error)
      alert("Error al descargar el examen. Revisa la consola para más detalles.")
    } finally {
      setLoadingDownload(false)
    }
  }

  const handleDownloadDiploma = async (colaboradorId: number, sesionId: number) => {
    try {
      setLoadingDownload(true)
      const signedUrl = await descargarDiploma(sesionId, colaboradorId)
      if (signedUrl) {
        window.open(signedUrl, "_blank")
      }
    } catch (error) {
      console.error("Error al descargar el diploma:", error)
      alert("Error al descargar el diploma. Revisa la consola para más detalles.")
    } finally {
      setLoadingDownload(false)
    }
  }

  const handleDownloadInduccionDocumental = async (data: InduccionDocumental) => {
    try {
      setLoadingDownload(true)
      await descargarInduccionDocumental(data)
    } catch (error) {
      console.error("Error al descargar el documento:", error)
      alert("Error al descargar el documento. Revisa la consola para más detalles.")
    } finally {
      setLoadingDownload(false)
    }
  }

  const handleDownloadPlanInduccion = (idPlan: number) => {
    if (!detallePlanColaborador) return

    const capacitacionesPlan = detallePlanColaborador.DETALLE_CAPACITACIONES.filter(
      (cap) => cap.ID_PLAN === idPlan
    )

    const planColaborador = detallePlanColaborador.PLANES.filter((plan) => plan.ID_PLAN === idPlan)

    const gruposPorDepartamento = capacitacionesPlan.reduce((acc, cap) => {
      if (!acc[cap.departamentoCapacitacion]) {
        acc[cap.departamentoCapacitacion] = []
      }
      acc[cap.departamentoCapacitacion].push({
        documento: cap.documento,
        codigo: cap.codigo,
        version: cap.version,
        fechaEvaluacion: cap.fechaEvaluacion || "",
        lectura: cap.lectura || "",
        capacitacion: cap.capacitacion || "",
        evaluacion: cap.evaluacion || "",
        calificacion: cap.calificacion || "",
        nombreCapacitador: "",
        estatus: cap.estatus,
      })
      return acc
    }, {} as Record<string, CapacitacionInduccion[]>)

    const gruposCapacitacion: GrupoCapacitacion[] = Object.entries(gruposPorDepartamento).map(
      ([departamento, capacitaciones]) => ({
        departamentoCapacitacion: departamento,
        capacitaciones,
      })
    )

    const plan = detallePlanColaborador.PLANES.find((p) => p.ID_PLAN === idPlan)

    const dataInduccion: InduccionDocumental = {
      nombrePlan: planColaborador[0].nombrePlan,
      nombreColaborador: detallePlanColaborador.INFORMACION_COLABORADOR.nombreColaborador,
      departamentoColaborador:
        detallePlanColaborador.INFORMACION_COLABORADOR.departamentoColaborador,
      cargo: detallePlanColaborador.INFORMACION_COLABORADOR.cargo,
      jefeInmediatoNombre: detallePlanColaborador.INFORMACION_COLABORADOR.jefeInmediatoNombre,
      gruposCapacitacion,
      fechaInicioInduccion: plan?.fechaInicioInduccion || "",
      fechaFinInduccion: plan?.fechaFinInduccion || "",
    }

    handleDownloadInduccionDocumental(dataInduccion)
  }

  const LoadingState = ({ message }: { message: string }) => (
    <div className="text-center py-12">
      <div className="flex flex-col items-center gap-3">
        <Loader2 className="h-10 w-10 text-primary animate-spin" />
        <p className="text-muted-foreground font-medium">{message}</p>
      </div>
    </div>
  )

  const renderTabContent = () => {
    if (isLoading) {
      return <LoadingState message="Cargando información..." />
    }

    switch (activeTab) {
      case "General":
        return (
          <GeneralTab collaborator={collaborator} resumenColaborador={resumenColaborador} />
        )
      case "Expediente":
        return (
          <ExpedienteTab
            capacitaciones={capacitaciones}
            colaboradorId={collaborator.ID_COLABORADOR}
            onDownloadAsistencia={handleDownloadAsistencia}
            onDownloadExamen={handleDownloadExamen}
            onDownloadDiploma={handleDownloadDiploma}
            loadingDownload={loadingDownload}
          />
        )
      case "Capacitaciones":
        return (
          <CapacitacionesTab
            capacitaciones={capacitaciones}
            onDownloadAsistencia={handleDownloadAsistencia}
            loadingDownload={loadingDownload}
          />
        )
      case "Exámenes":
        return (
          <ExamenesTab
            documentosColaborador={documentosColaborador}
            onDownloadExamen={handleDownloadExamen}
          />
        )
      case "Documentos":
        return (
          <DocumentosTab
            documentosColaborador={documentosColaborador}
            onDownloadAsistencia={handleDownloadAsistencia}
            onDownloadDiploma={handleDownloadDiploma}
          />
        )
      case "Inducción":
        return (
          <InduccionTab
            detallePlanColaborador={detallePlanColaborador}
            onDownloadPlanInduccion={handleDownloadPlanInduccion}
            loadingDownload={loadingDownload}
          />
        )
      case "Histórico":
        return <HistoricoTab historialColaborador={historialColaborador} />
      default:
        return null
    }
  }

  return (
    <div className="flex-1">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 mb-6 text-xs">
        <button
          onClick={onBack}
          className="text-muted-foreground hover:text-foreground cursor-pointer"
        >
          Colaboradores
        </button>
        <ChevronRight className="w-3 h-3 text-muted-foreground" />
        <span className="text-foreground font-semibold">{collaborator.NOMBRE_COMPLETO}</span>
      </div>

      {/* Profile Header Card */}
      <div className="bg-card rounded-lg p-6 sm:p-8 mb-4">
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
          {/* Avatar */}
          <div className="w-20 h-20 rounded-full bg-primary/20 dark:bg-primary/80 flex items-center justify-center flex-shrink-0">
            <span className="text-2xl font-semibold text-primary dark:text-foreground">
              {collaborator.INICIALES}
            </span>
          </div>

          {/* Profile Info */}
          <div className="flex-1 text-center sm:text-left">
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 mb-3">
              <h1 className="text-2xl font-semibold text-foreground">
                {collaborator.NOMBRE_COMPLETO}
              </h1>
              <span
                className={`
                  px-3 py-1 rounded-full text-xs font-semibold w-fit mx-auto sm:mx-0
                  ${
                    collaborator.ESTADO.toLowerCase() === "activo"
                      ? "bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300"
                      : collaborator.ESTADO.toLowerCase() === "permiso"
                        ? "bg-yellow-100 dark:bg-yellow-900 text-yellow-700 dark:text-yellow-300"
                        : "bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300"
                  }
                `}
              >
                {collaborator.ESTADO.toUpperCase()}
              </span>
            </div>
            <div className="flex flex-col sm:flex-row items-center sm:items-center gap-3 sm:gap-6">
              <span className="text-base text-muted-foreground break-all">
                {collaborator.EMAIL}
              </span>
              <div className="hidden sm:block w-px h-5 bg-border" />
              <span className="text-base text-muted-foreground">Tel: {collaborator.TELEFONO}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Card */}
      <div className="bg-card rounded-lg">
        {/* Tabs */}
        <div className="flex items-center gap-0 px-4 sm:px-8 pt-6 border-b border-border overflow-x-auto no-scrollbar">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`
                relative px-4 py-2 text-sm sm:text-base font-semibold transition-colors
                whitespace-nowrap cursor-pointer
                ${
                  activeTab === tab
                    ? "text-foreground"
                    : "text-muted-foreground hover:text-foreground"
                }
              `}
            >
              {tab}

              {activeTab === tab && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-yellow-500 rounded-t-md transition-all duration-300"></span>
              )}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="p-4 sm:p-6">{renderTabContent()}</div>
      </div>
    </div>
  )
}
