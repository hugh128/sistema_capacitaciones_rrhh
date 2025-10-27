"use client"

import { useState } from "react"
import {
  ChevronRight,
  X,
  FileText,
  Download,
  CheckCircle2,
  XCircle,
  Clock,
} from "lucide-react"
import DocumentCard from "./document-card"
import type { Collaborator } from "@/lib/colaboradores/type"

type ProfileContentProps = {
  collaborator: Collaborator
  onBack: () => void
}

export default function ProfileContent({ collaborator, onBack }: ProfileContentProps) {
  const [activeTab, setActiveTab] = useState("General")
  const [showEditProfile, setShowEditProfile] = useState(false)
  const [showAllDocuments, setShowAllDocuments] = useState(false)
  const [showEditExperience, setShowEditExperience] = useState(false)

  const allDocuments = {
    examenes: [
      { name: "examen_seguridad_industrial.pdf", type: "pdf", date: "2d ago", category: "Examen" },
      { name: "examen_iso_9001.pdf", type: "pdf", date: "1w ago", category: "Examen" },
      { name: "examen_buenas_practicas.pdf", type: "pdf", date: "2w ago", category: "Examen" },
      { name: "evaluacion_quimicos.pdf", type: "pdf", date: "1m ago", category: "Examen" },
    ],
    documentos: [
      { name: "induccion.pdf", type: "pdf", date: "2d ago", category: "Inducción" },
      { name: "CertificadoSusta.pdf", type: "pdf", date: "2d ago", category: "Certificado" },
      { name: "JuanPerez_cv.pdf", type: "pdf", date: "2d ago", category: "CV" },
      { name: "certificado_iso.pdf", type: "pdf", date: "5d ago", category: "Certificado" },
      { name: "diploma_buenas_practicas.pdf", type: "pdf", date: "1w ago", category: "Diploma" },
      { name: "asistencia_enero_2024.pdf", type: "pdf", date: "1w ago", category: "Asistencia" },
      { name: "asistencia_febrero_2024.pdf", type: "pdf", date: "2w ago", category: "Asistencia" },
      { name: "diploma_seguridad.pdf", type: "pdf", date: "3w ago", category: "Diploma" },
    ],
    capacitaciones: [
      {
        name: "ISO 9001 Actualización",
        status: "Completado",
        date: "Jun 2023",
        score: 85,
        document: "certificado_iso_9001.pdf",
      },
      {
        name: "Seguridad Industrial",
        status: "Completado",
        date: "Feb 2023",
        score: 90,
        document: "certificado_seguridad.pdf",
      },
      {
        name: "Buenas Prácticas de Laboratorio",
        status: "Completado",
        date: "Dic 2022",
        score: 88,
        document: "diploma_buenas_practicas.pdf",
      },
      {
        name: "Manejo de Sustancias Químicas",
        status: "En Progreso",
        date: "En curso",
        score: null,
        document: null,
      },
      {
        name: "Primeros Auxilios",
        status: "Pendiente",
        date: "Programado Mar 2024",
        score: null,
        document: null,
      },
    ],
    historico: [
      {
        date: "15 Ene 2024",
        time: "09:30",
        action: "Asistió a capacitación",
        detail: "ISO 9001 Actualización - Sesión 3",
        type: "success",
      },
      {
        date: "12 Ene 2024",
        time: "14:00",
        action: "Completó examen",
        detail: "Seguridad Industrial - Nota: 90",
        type: "success",
      },
      {
        date: "10 Ene 2024",
        time: "10:00",
        action: "Faltó a capacitación",
        detail: "Manejo de Sustancias Químicas - Sesión 2",
        type: "error",
      },
      {
        date: "08 Ene 2024",
        time: "09:00",
        action: "Asistió a capacitación",
        detail: "Manejo de Sustancias Químicas - Sesión 1",
        type: "success",
      },
      {
        date: "05 Ene 2024",
        time: "11:30",
        action: "Subió documento",
        detail: "CV actualizado - JuanPerez_cv.pdf",
        type: "info",
      },
      {
        date: "20 Dic 2023",
        time: "15:00",
        action: "Completó capacitación",
        detail: "Buenas Prácticas de Laboratorio - Nota: 88",
        type: "success",
      },
      {
        date: "18 Dic 2023",
        time: "10:00",
        action: "Asistió a examen",
        detail: "Buenas Prácticas de Laboratorio",
        type: "info",
      },
      {
        date: "15 Dic 2023",
        time: "09:30",
        action: "Asistió a capacitación",
        detail: "Buenas Prácticas de Laboratorio - Sesión Final",
        type: "success",
      },
    ],
  }

  const documents = [
    { name: "induccion.pdf", type: "pdf", date: "2d ago" },
    { name: "examen_seguri.pdf", type: "pdf", date: "2d ago" },
    { name: "CertificadoSusta.pdf", type: "pdf", date: "2d ago" },
    { name: "JuanPerez_cv.pdf", type: "pdf", date: "2d ago" },
    { name: "certificado_iso.pdf", type: "pdf", date: "5d ago" },
    { name: "evaluacion_2023.pdf", type: "pdf", date: "1w ago" },
  ]

  const tabs = ["General", "Capacitaciones", "Exámenes", "Documentos", "Histórico"]

  const handleDownloadAll = (docs: any[]) => {
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
  }

  const handleDocumentClick = (docName: string) => {
    const link = document.createElement("a")
    link.href = `/documents/${docName}`
    link.download = docName
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const renderTabContent = () => {
    switch (activeTab) {
      case "General":
        return (
          <>
            {/* Archivos Colaborador */}
            <div className="mb-12">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-base font-semibold text-foreground">Archivos Colaborador</h2>
              </div>
              <div className="grid grid-cols-4 gap-4">
                {(showAllDocuments ? documents : documents.slice(0, 4)).map((doc, index) => (
                  <DocumentCard key={index} {...doc} onClick={() => handleDocumentClick(doc.name)} />
                ))}
              </div>
              <div className="flex justify-end mt-4">
                <button
                  onClick={() => setShowAllDocuments(!showAllDocuments)}
                  className="text-xs font-semibold text-primary underline hover:text-primary/80"
                >
                  {showAllDocuments ? "Ver Menos" : "Ver todo"}
                </button>
              </div>
            </div>

            {/* Experiencia */}
            <div className="mb-12">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-base font-semibold text-foreground">Experiencia</h2>
                <button
                  onClick={() => setShowEditExperience(true)}
                  className="text-xs font-semibold text-primary underline hover:text-primary/80"
                >
                  Editar
                </button>
              </div>
              <div className="pl-4 border-l-[12px] border-border rounded-lg">
                <h3 className="text-base text-foreground mb-4">Químico Farmacéutico</h3>
                <div className="text-base text-foreground leading-6 space-y-2">
                  <p className="font-semibold">Responsable de:</p>
                  <ol className="list-decimal list-inside space-y-2">
                    <li>
                      Análisis de Calidad: Realización de pruebas fisicoquímicas y microbiológicas para asegurar la
                      calidad y pureza de productos farmacéuticos.
                    </li>
                    <li>
                      Desarrollo y Validación de Métodos: Participación en la investigación, desarrollo y validación de
                      nuevos métodos analíticos para control de calidad.
                    </li>
                    <li>
                      Cumplimiento Normativo: Mantenimiento de registros y documentación técnica en estricto apego a las
                      Buenas Prácticas de Laboratorio (BPL) y normativas de la industria farmacéutica.
                    </li>
                  </ol>
                </div>
              </div>
            </div>

            {/* Últimas Capacitaciones y Certificaciones */}
            <div className="pl-4 border-l-[12px] border-border rounded-lg">
              <div className="text-base text-foreground leading-6 space-y-4">
                <div>
                  <p className="font-semibold mb-2">Últimas Capacitaciones:</p>
                  <ol className="list-decimal list-inside space-y-1">
                    <li>ISO 9001 Actualización - Jun 2023 - Nota: 85.</li>
                    <li>Seguridad Industrial - Feb 2023 - Nota: 90.</li>
                  </ol>
                </div>
                <div>
                  <p className="font-semibold mb-2">Certificaciones Obtenidas:</p>
                  <p>Buenas Prácticas de Laboratorio - Diploma 2022</p>
                </div>
                <div>
                  <p className="font-semibold mb-2">Certificaciones Obtenidas:</p>
                  <p>Manejo de Sustancias Químicas - Pendiente Revisión</p>
                </div>
              </div>
            </div>
          </>
        )
      case "Capacitaciones":
        return (
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-foreground">Todas las Capacitaciones</h2>
              <button
                onClick={() => handleDownloadAll(allDocuments.capacitaciones.filter((c) => c.document))}
                className="flex items-center gap-2 px-4 py-2 bg-yellow-500 text-white font-semibold rounded-lg hover:bg-yellow-600 transition-colors"
              >
                <Download className="w-4 h-4" />
                Descargar Todos
              </button>
            </div>
            <div className="space-y-4">
              {allDocuments.capacitaciones.map((capacitacion, index) => (
                <div
                  key={index}
                  className="bg-card rounded-lg p-6 border border-border hover:border-primary transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-base font-semibold text-foreground">{capacitacion.name}</h3>
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-semibold ${
                            capacitacion.status === "Completado"
                              ? "bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300"
                              : capacitacion.status === "En Progreso"
                                ? "bg-yellow-100 dark:bg-yellow-900 text-yellow-700 dark:text-yellow-300"
                                : "bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300"
                          }`}
                        >
                          {capacitacion.status}
                        </span>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span>{capacitacion.date}</span>
                        {capacitacion.score && (
                          <>
                            <div className="w-px h-4 bg-border" />
                            <span>Nota: {capacitacion.score}</span>
                          </>
                        )}
                      </div>
                    </div>
                    {capacitacion.document && (
                      <button
                        onClick={() => handleDocumentClick(capacitacion.document!)}
                        className="flex items-center gap-2 px-4 py-2 border border-border text-foreground font-semibold rounded-lg hover:bg-muted transition-colors"
                      >
                        <FileText className="w-4 h-4" />
                        Ver Certificado
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )
      case "Exámenes":
        return (
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-foreground">Exámenes Realizados</h2>
              <button
                onClick={() => handleDownloadAll(allDocuments.examenes)}
                className="flex items-center gap-2 px-4 py-2 bg-yellow-500 text-white font-semibold rounded-lg hover:bg-yellow-600 transition-colors"
              >
                <Download className="w-4 h-4" />
                Descargar Todos
              </button>
            </div>
            <div className="grid grid-cols-4 gap-4">
              {allDocuments.examenes.map((doc, index) => (
                <DocumentCard key={index} {...doc} onClick={() => handleDocumentClick(doc.name)} />
              ))}
            </div>
          </div>
        )
      case "Documentos":
        return (
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-foreground">Todos los Documentos</h2>
              <button
                onClick={() => handleDownloadAll(allDocuments.documentos)}
                className="flex items-center gap-2 px-4 py-2 bg-yellow-500 text-white font-semibold rounded-lg hover:bg-yellow-600 transition-colors"
              >
                <Download className="w-4 h-4" />
                Descargar Todos
              </button>
            </div>
            <div className="space-y-6">
              {["Asistencia", "Diploma", "Certificado", "CV", "Inducción"].map((category) => {
                const categoryDocs = allDocuments.documentos.filter((doc) => doc.category === category)
                if (categoryDocs.length === 0) return null

                return (
                  <div key={category}>
                    <h3 className="text-base font-semibold text-foreground mb-3">{category}</h3>
                    <div className="grid grid-cols-4 gap-4">
                      {categoryDocs.map((doc, index) => (
                        <DocumentCard key={index} {...doc} onClick={() => handleDocumentClick(doc.name)} />
                      ))}
                    </div>
                  </div>
                )
              })}
            </div>
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
                {allDocuments.historico.map((item, index) => (
                  <div key={index} className="relative flex gap-4">
                    {/* Timeline dot */}
                    <div
                      className={`relative z-10 w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 ${
                        item.type === "success"
                          ? "bg-green-100 dark:bg-green-900"
                          : item.type === "error"
                            ? "bg-red-100 dark:bg-red-900"
                            : "bg-blue-100 dark:bg-blue-900"
                      }`}
                    >
                      {item.type === "success" && (
                        <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400" />
                      )}
                      {item.type === "error" && <XCircle className="w-5 h-5 text-red-600 dark:text-red-400" />}
                      {item.type === "info" && <Clock className="w-5 h-5 text-blue-600 dark:text-blue-400" />}
                    </div>

                    {/* Content */}
                    <div className="flex-1 bg-card rounded-lg p-4 border border-border">
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="text-base font-semibold text-foreground">{item.action}</h3>
                        <div className="text-xs text-muted-foreground">
                          <div>{item.date}</div>
                          <div>{item.time}</div>
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground">{item.detail}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
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
        <span className="text-foreground font-semibold">{collaborator.name}</span>
      </div>

      {/* Profile Header Card */}
      <div className="bg-card rounded-lg p-8 mb-4">
        <div className="flex items-start gap-6">
          {/* Avatar */}
          <div className="w-16 h-16 rounded-full bg-primary/20 dark:bg-primary/80 flex items-center justify-center flex-shrink-0">
            <span className="text-[22px] font-semibold text-primary dark:text-foreground">{collaborator.initials}</span>
          </div>

          {/* Profile Info */}
          <div className="flex-1">
            <div className="flex items-center gap-4 mb-2">
              <h1 className="text-[22px] font-semibold text-foreground">{collaborator.name}</h1>
              <span
                className={`px-3 py-1 rounded-[9px] text-xs font-semibold ${
                  collaborator.status === "active"
                    ? "bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300"
                    : collaborator.status === "on-leave"
                      ? "bg-yellow-100 dark:bg-yellow-900 text-yellow-700 dark:text-yellow-300"
                      : "bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300"
                }`}
              >
                {collaborator.status === "active"
                  ? "Activo"
                  : collaborator.status === "on-leave"
                    ? "Permiso"
                    : "Inactivo"}
              </span>
            </div>
            <div className="flex items-center gap-6 mb-3">
              <span className="text-base text-muted-foreground">{collaborator.email}</span>
              <div className="w-px h-5 bg-border" />
              <span className="text-base text-muted-foreground">{collaborator.phone}</span>
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

      {/* Edit Profile Modal */}
      {showEditProfile && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-card rounded-lg p-8 max-w-md w-full mx-4">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-foreground">Editar Perfil</h2>
              <button onClick={() => setShowEditProfile(false)}>
                <X className="w-5 h-5 text-foreground" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-foreground mb-2">Nombre</label>
                <input
                  type="text"
                  defaultValue={collaborator.name}
                  className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:border-primary bg-background text-foreground"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-foreground mb-2">Email</label>
                <input
                  type="email"
                  defaultValue={collaborator.email}
                  className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:border-primary bg-background text-foreground"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-foreground mb-2">Teléfono</label>
                <input
                  type="tel"
                  defaultValue={collaborator.phone}
                  className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:border-primary bg-background text-foreground"
                />
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => {
                    setShowEditProfile(false)
                  }}
                  className="flex-1 px-4 py-2 bg-yellow-500 text-white font-semibold rounded-lg hover:bg-yellow-600"
                >
                  Guardar
                </button>
                <button
                  onClick={() => setShowEditProfile(false)}
                  className="flex-1 px-4 py-2 border border-border text-foreground font-semibold rounded-lg hover:bg-muted"
                >
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Experience Modal */}
      {showEditExperience && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-card rounded-lg p-8 max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-foreground">Editar Experiencia</h2>
              <button onClick={() => setShowEditExperience(false)}>
                <X className="w-5 h-5 text-foreground" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-foreground mb-2">Puesto</label>
                <input
                  type="text"
                  defaultValue="Químico Farmacéutico"
                  className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:border-primary bg-background text-foreground"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-foreground mb-2">Responsabilidades</label>
                <textarea
                  rows={8}
                  defaultValue="1. Análisis de Calidad: Realización de pruebas fisicoquímicas y microbiológicas para asegurar la calidad y pureza de productos farmacéuticos.&#10;2. Desarrollo y Validación de Métodos: Participación en la investigación, desarrollo y validación de nuevos métodos analíticos para control de calidad.&#10;3. Cumplimiento Normativo: Mantenimiento de registros y documentación técnica en estricto apego a las Buenas Prácticas de Laboratorio (BPL) y normativas de la industria farmacéutica."
                  className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:border-primary bg-background text-foreground"
                />
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => {
                    setShowEditExperience(false)
                  }}
                  className="flex-1 px-4 py-2 bg-yellow-500 text-white font-semibold rounded-lg hover:bg-yellow-600"
                >
                  Guardar
                </button>
                <button
                  onClick={() => setShowEditExperience(false)}
                  className="flex-1 px-4 py-2 border border-border text-foreground font-semibold rounded-lg hover:bg-muted"
                >
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
