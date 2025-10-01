"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Sidebar } from "@/components/sidebar"
import { DataTable } from "@/components/data-table"
import { FormModal } from "@/components/form-modal"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { mockDocumentos, mockCapacitaciones, mockPersonas, mockParticipantes, type Documento } from "@/lib/types"
import { useAuth } from "@/contexts/auth-context"
import { FileText, Upload, Download, Eye, Award, ClipboardList, File, CheckCircle, AlertCircle } from "lucide-react"
import { AppHeader } from "@/components/app-header"

export default function DocumentosPage() {
  const { user } = useAuth()
  const [documentos, setDocumentos] = useState<Documento[]>(mockDocumentos)
  const [modalOpen, setModalOpen] = useState(false)
  const [uploadModalOpen, setUploadModalOpen] = useState(false)
  const [editingDocumento, setEditingDocumento] = useState<Documento | null>(null)
  const [selectedCapacitacion, setSelectedCapacitacion] = useState<string>("")
  const [uploadType, setUploadType] = useState<"asistencia" | "examen" | "diploma" | "evidencia">("asistencia")
  const [uploadFiles, setUploadFiles] = useState<FileList | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Filter documents based on user role
  const filteredDocumentos = user?.roles.some((role) => role.nombre === "Capacitador")
    ? documentos.filter((d) => {
        if (!d.capacitacionId) return false
        const capacitacion = mockCapacitaciones.find((c) => c.id === d.capacitacionId)
        return capacitacion?.capacitadorId === user.id
      })
    : documentos

  const columns = [
    { key: "nombre", label: "Nombre del Documento" },
    {
      key: "tipo",
      label: "Tipo",
      render: (value: string) => {
        const variants = {
          PEO: "default" as const,
          asistencia: "secondary" as const,
          examen: "outline" as const,
          diploma: "default" as const,
          evidencia: "secondary" as const,
        }
        return <Badge variant={variants[value as keyof typeof variants]}>{value}</Badge>
      },
    },
    {
      key: "capacitacionId",
      label: "Capacitación",
      render: (value: string) => {
        if (!value || value === "none") return "N/A"
        const capacitacion = mockCapacitaciones.find((c) => c.id === value)
        return capacitacion?.nombre || "N/A"
      },
    },
    {
      key: "participanteId",
      label: "Participante",
      render: (value: string) => {
        if (!value || value === "none") return "N/A"
        const persona = mockPersonas.find((p) => p.id === value)
        return persona ? `${persona.nombre} ${persona.apellido}` : "N/A"
      },
    },
    { key: "fechaCreacion", label: "Fecha Creación" },
    {
      key: "url",
      label: "Estado",
      render: (value: string) => {
        return value ? (
          <div className="flex items-center gap-2">
            <CheckCircle className="h-4 w-4 text-chart-2" />
            <span className="text-sm text-chart-2">Subido</span>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <AlertCircle className="h-4 w-4 text-warning" />
            <span className="text-sm text-warning">Pendiente</span>
          </div>
        )
      },
    },
    {
      key: "actions",
      label: "Acciones",
      render: (value: string, row: Documento) => (
        <div className="flex gap-2">
          {row.url && (
            <>
              <Button variant="ghost" size="sm" title="Ver documento">
                <Eye className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="sm" title="Descargar">
                <Download className="h-4 w-4" />
              </Button>
            </>
          )}
          {!row.url && user?.roles.some((role) => ["RRHH", "Capacitador"].includes(role.nombre)) && (
            <Button variant="ghost" size="sm" title="Subir archivo" onClick={() => handleUploadDocument(row)}>
              <Upload className="h-4 w-4" />
            </Button>
          )}
        </div>
      ),
    },
  ]

  const formFields = [
    { key: "nombre", label: "Nombre del Documento", type: "text" as const, required: true },
    {
      key: "tipo",
      label: "Tipo de Documento",
      type: "select" as const,
      required: true,
      options: [
        { value: "PEO", label: "PEO" },
        { value: "asistencia", label: "Lista de Asistencia" },
        { value: "examen", label: "Examen" },
        { value: "diploma", label: "Diploma" },
        { value: "evidencia", label: "Evidencia" },
      ],
    },
    {
      key: "capacitacionId",
      label: "Capacitación",
      type: "select" as const,
      options: [
        { value: "none", label: "Ninguna" },
        ...mockCapacitaciones.map((c) => ({ value: c.id, label: c.nombre })),
      ],
    },
    {
      key: "participanteId",
      label: "Participante",
      type: "select" as const,
      options: [
        { value: "none", label: "Ninguno" },
        ...mockPersonas.map((p) => ({ value: p.id, label: `${p.nombre} ${p.apellido}` })),
      ],
    },
    { key: "url", label: "URL del Documento", type: "text" as const },
  ]

  const handleAdd = () => {
    setEditingDocumento(null)
    setModalOpen(true)
  }

  const handleEdit = (documento: Documento) => {
    const editData = {
      ...documento,
      capacitacionId: documento.capacitacionId || "none",
      participanteId: documento.participanteId || "none",
    }
    setEditingDocumento(editData as Documento)
    setModalOpen(true)
  }

  const handleDelete = (documento: Documento) => {
    if (confirm("¿Estás seguro de que deseas eliminar este documento?")) {
      setDocumentos((prev) => prev.filter((d) => d.id !== documento.id))
    }
  }

  const handleSubmit = (data: any) => {
    const cleanedData = {
      ...data,
      capacitacionId: data.capacitacionId === "none" ? undefined : data.capacitacionId,
      participanteId: data.participanteId === "none" ? undefined : data.participanteId,
    }

    if (editingDocumento) {
      setDocumentos((prev) => prev.map((d) => (d.id === editingDocumento.id ? { ...d, ...cleanedData } : d)))
    } else {
      const newDocumento: Documento = {
        ...cleanedData,
        id: Date.now().toString(),
        fechaCreacion: new Date().toISOString().split("T")[0],
      }
      setDocumentos((prev) => [...prev, newDocumento])
    }
    setModalOpen(false)
  }

  const handleUploadDocument = (documento: Documento) => {
    setEditingDocumento(documento)
    setUploadModalOpen(true)
  }

  const handleBulkUpload = () => {
    setUploadModalOpen(true)
    setEditingDocumento(null)
  }

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    setUploadFiles(event.target.files)
  }

  const handleUploadSubmit = () => {
    if (!uploadFiles || uploadFiles.length === 0) return

    if (editingDocumento) {
      // Update existing document with file URL (simulated)
      const fileUrl = `https://storage.example.com/${uploadFiles[0].name}`
      setDocumentos((prev) =>
        prev.map((d) =>
          d.id === editingDocumento.id
            ? { ...d, url: fileUrl, fechaCreacion: new Date().toISOString().split("T")[0] }
            : d,
        ),
      )
    } else {
      // Create new documents for bulk upload
      const newDocuments = Array.from(uploadFiles).map((file, index) => ({
        id: `${Date.now()}-${index}`,
        nombre: file.name,
        tipo: uploadType,
        capacitacionId: selectedCapacitacion || undefined,
        url: `https://storage.example.com/${file.name}`,
        fechaCreacion: new Date().toISOString().split("T")[0],
      }))
      setDocumentos((prev) => [...prev, ...newDocuments])
    }

    setUploadModalOpen(false)
    setUploadFiles(null)
    setSelectedCapacitacion("")
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const generateAttendanceList = (capacitacionId: string) => {
    const capacitacion = mockCapacitaciones.find((c) => c.id === capacitacionId)
    const participantes = mockParticipantes.filter((p) => p.capacitacionId === capacitacionId)

    if (!capacitacion) return

    // Simulate generating attendance list
    const newDocument: Documento = {
      id: Date.now().toString(),
      nombre: `Lista de Asistencia - ${capacitacion.nombre}`,
      tipo: "asistencia",
      capacitacionId: capacitacionId,
      url: `https://storage.example.com/attendance-${capacitacionId}.pdf`,
      fechaCreacion: new Date().toISOString().split("T")[0],
    }

    setDocumentos((prev) => [...prev, newDocument])
  }

  const generateExam = (capacitacionId: string) => {
    const capacitacion = mockCapacitaciones.find((c) => c.id === capacitacionId)

    if (!capacitacion || !capacitacion.aplicaExamen) return

    const newDocument: Documento = {
      id: Date.now().toString(),
      nombre: `Examen - ${capacitacion.nombre}`,
      tipo: "examen",
      capacitacionId: capacitacionId,
      url: `https://storage.example.com/exam-${capacitacionId}.pdf`,
      fechaCreacion: new Date().toISOString().split("T")[0],
    }

    setDocumentos((prev) => [...prev, newDocument])
  }

  const generateDiploma = (capacitacionId: string) => {
    const capacitacion = mockCapacitaciones.find((c) => c.id === capacitacionId)

    if (!capacitacion || !capacitacion.aplicaDiploma) return

    const newDocument: Documento = {
      id: Date.now().toString(),
      nombre: `Diploma - ${capacitacion.nombre}`,
      tipo: "diploma",
      capacitacionId: capacitacionId,
      url: `https://storage.example.com/diploma-${capacitacionId}.pdf`,
      fechaCreacion: new Date().toISOString().split("T")[0],
    }

    setDocumentos((prev) => [...prev, newDocument])
  }

  // Statistics by document type
  const stats = {
    PEO: filteredDocumentos.filter((d) => d.tipo === "PEO").length,
    asistencia: filteredDocumentos.filter((d) => d.tipo === "asistencia").length,
    examen: filteredDocumentos.filter((d) => d.tipo === "examen").length,
    diploma: filteredDocumentos.filter((d) => d.tipo === "diploma").length,
    evidencia: filteredDocumentos.filter((d) => d.tipo === "evidencia").length,
  }

  const getTypeIcon = (tipo: string) => {
    switch (tipo) {
      case "PEO":
        return <FileText className="w-4 h-4 text-primary" />
      case "asistencia":
        return <ClipboardList className="w-4 h-4 text-chart-2" />
      case "examen":
        return <FileText className="w-4 h-4 text-chart-4" />
      case "diploma":
        return <Award className="w-4 h-4 text-chart-3" />
      case "evidencia":
        return <Upload className="w-4 h-4 text-muted-foreground" />
      default:
        return <FileText className="w-4 h-4 text-muted-foreground" />
    }
  }

  // Get trainings assigned to current trainer
  const trainerCapacitaciones = user?.roles.some((role) => role.nombre === "Capacitador")
    ? mockCapacitaciones.filter((c) => c.capacitadorId === user.id)
    : mockCapacitaciones


  return (
    <div className="flex h-screen bg-background">
      <Sidebar />

      <div className="flex-1 flex flex-col overflow-hidden">
        <AppHeader title="Documentos" subtitle="Gestiona todos los documentos del sistema" />

        <main className="flex-1 overflow-auto p-6">
          <div className="max-w-7xl mx-auto space-y-6">
            {/* Document Type Statistics */}
            <div className="grid gap-4 md:grid-cols-5">
              {Object.entries(stats).map(([tipo, count]) => (
                <Card key={tipo}>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium capitalize">{tipo}</CardTitle>
                    {getTypeIcon(tipo)}
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{count}</div>
                    <p className="text-xs text-muted-foreground">documentos</p>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Document Generation Tools - Only for Trainers */}
            {user?.roles.some((role) => role.nombre === "Capacitador") && (
              <Card>
                <CardHeader>
                  <CardTitle>Generar Documentos Base</CardTitle>
                  <CardDescription>Genera documentos automáticamente para tus capacitaciones</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 md:grid-cols-3">
                    {trainerCapacitaciones.map((capacitacion) => (
                      <div key={capacitacion.id} className="border rounded-lg p-4 space-y-3">
                        <div>
                          <h4 className="font-medium">{capacitacion.nombre}</h4>
                          <p className="text-sm text-muted-foreground">{capacitacion.codigo}</p>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => generateAttendanceList(capacitacion.id)}
                            className="gap-2"
                          >
                            <ClipboardList className="w-3 h-3" />
                            Lista Asistencia
                          </Button>
                          {capacitacion.aplicaExamen && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => generateExam(capacitacion.id)}
                              className="gap-2"
                            >
                              <FileText className="w-3 h-3" />
                              Examen
                            </Button>
                          )}
                          {capacitacion.aplicaDiploma && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => generateDiploma(capacitacion.id)}
                              className="gap-2"
                            >
                              <Award className="w-3 h-3" />
                              Diploma
                            </Button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Recent Documents */}
            <Card>
              <CardHeader>
                <CardTitle>Documentos Recientes</CardTitle>
                <CardDescription>Últimos documentos agregados al sistema</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {filteredDocumentos.slice(0, 5).map((documento) => (
                    <div key={documento.id} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        {getTypeIcon(documento.tipo)}
                        <div>
                          <p className="font-medium">{documento.nombre}</p>
                          <p className="text-sm text-muted-foreground">
                            {documento.tipo} • {documento.fechaCreacion}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {documento.url ? (
                          <div className="flex items-center gap-2">
                            <CheckCircle className="h-4 w-4 text-chart-2" />
                            <Button variant="ghost" size="sm">
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="sm">
                              <Download className="h-4 w-4" />
                            </Button>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2">
                            <AlertCircle className="h-4 w-4 text-warning" />
                            <Button variant="ghost" size="sm" onClick={() => handleUploadDocument(documento)}>
                              <Upload className="h-4 w-4" />
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Data Table */}
            <DataTable
              title="Todos los Documentos"
              data={filteredDocumentos}
              columns={columns}
              onAdd={handleAdd}
              onEdit={handleEdit}
              onDelete={user?.roles.some((role) => role.nombre === "RRHH") ? handleDelete : undefined}
              searchPlaceholder="Buscar documentos..."
              customActions={
                user?.roles.some((role) => ["RRHH", "Capacitador"].includes(role.nombre)) ? (
                  <Button onClick={handleBulkUpload} variant="outline" className="gap-2 bg-transparent">
                    <Upload className="w-4 h-4" />
                    Subir Evidencias
                  </Button>
                ) : undefined
              }
            />
          </div>
        </main>
      </div>

      {/* Document Form Modal */}
      <FormModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        title={editingDocumento ? "Editar Documento" : "Nuevo Documento"}
        description={editingDocumento ? "Modifica el documento" : "Agrega un nuevo documento al sistema"}
        fields={formFields}
        initialData={editingDocumento || {}}
        onSubmit={handleSubmit}
      />

      {/* Upload Modal */}
      <FormModal
        open={uploadModalOpen}
        onOpenChange={setUploadModalOpen}
        title={editingDocumento ? "Subir Archivo" : "Subir Evidencias"}
        description={
          editingDocumento ? "Sube el archivo para este documento" : "Sube múltiples archivos como evidencias"
        }
        customContent={
          <div className="space-y-6">
            {!editingDocumento && (
              <>
                {/* Training Selection */}
                <div className="space-y-2">
                  <Label>Capacitación</Label>
                  <select
                    value={selectedCapacitacion}
                    onChange={(e) => setSelectedCapacitacion(e.target.value)}
                    className="w-full p-2 border rounded-md"
                  >
                    <option value="">Seleccionar capacitación...</option>
                    {trainerCapacitaciones.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.nombre}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Upload Type Selection */}
                <div className="space-y-2">
                  <Label>Tipo de Evidencia</Label>
                  <Tabs value={uploadType} onValueChange={(value) => setUploadType(value as any)}>
                    <TabsList className="grid w-full grid-cols-4">
                      <TabsTrigger value="asistencia">Asistencia</TabsTrigger>
                      <TabsTrigger value="examen">Exámenes</TabsTrigger>
                      <TabsTrigger value="diploma">Diplomas</TabsTrigger>
                      <TabsTrigger value="evidencia">Evidencias</TabsTrigger>
                    </TabsList>
                  </Tabs>
                </div>
              </>
            )}

            {/* File Upload */}
            <div className="space-y-2">
              <Label>Archivos</Label>
              <Input
                ref={fileInputRef}
                type="file"
                multiple={!editingDocumento}
                accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                onChange={handleFileUpload}
                className="cursor-pointer"
              />
              <p className="text-xs text-muted-foreground">Formatos soportados: PDF, DOC, DOCX, JPG, PNG</p>
            </div>

            {uploadFiles && uploadFiles.length > 0 && (
              <div className="space-y-2">
                <Label>Archivos Seleccionados:</Label>
                <div className="space-y-1">
                  {Array.from(uploadFiles).map((file, index) => (
                    <div key={index} className="flex items-center gap-2 text-sm">
                      <File className="w-4 h-4" />
                      <span>{file.name}</span>
                      <span className="text-muted-foreground">({(file.size / 1024 / 1024).toFixed(2)} MB)</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex justify-end gap-2 pt-4 border-t">
              <Button variant="outline" onClick={() => setUploadModalOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={handleUploadSubmit} disabled={!uploadFiles || uploadFiles.length === 0}>
                Subir Archivos
              </Button>
            </div>
          </div>
        }
      />
    </div>
  )
}
