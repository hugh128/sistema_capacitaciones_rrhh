"use client"

import { useState } from "react"
import { Sidebar } from "@/components/sidebar"
import { DataTable } from "@/components/data-table"
import { FormModal } from "@/components/form-modal"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { mockDocumentos, mockCapacitaciones, mockPersonas, type Documento } from "@/lib/types"
import { useAuth } from "@/contexts/auth-context"
import { FileText, Upload, Download, Eye, Award, ClipboardList } from "lucide-react"
import { Button } from "@/components/ui/button"
import { AppHeader } from "@/components/app-header"

export default function DocumentosPage() {
  const { user } = useAuth()
  const [documentos, setDocumentos] = useState<Documento[]>(mockDocumentos)
  const [modalOpen, setModalOpen] = useState(false)
  const [editingDocumento, setEditingDocumento] = useState<Documento | null>(null)

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
        if (!value) return "N/A"
        const capacitacion = mockCapacitaciones.find((c) => c.id === value)
        return capacitacion?.nombre || "N/A"
      },
    },
    {
      key: "participanteId",
      label: "Participante",
      render: (value: string) => {
        if (!value) return "N/A"
        const persona = mockPersonas.find((p) => p.id === value)
        return persona ? `${persona.nombre} ${persona.apellido}` : "N/A"
      },
    },
    { key: "fechaCreacion", label: "Fecha Creación" },
    {
      key: "url",
      label: "Acciones",
      render: (value: string, row: Documento) => (
        <div className="flex gap-2">
          <Button variant="ghost" size="sm">
            <Eye className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm">
            <Download className="h-4 w-4" />
          </Button>
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
      options: [{ value: "", label: "Ninguna" }, ...mockCapacitaciones.map((c) => ({ value: c.id, label: c.nombre }))],
    },
    {
      key: "participanteId",
      label: "Participante",
      type: "select" as const,
      options: [
        { value: "", label: "Ninguno" },
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
    setEditingDocumento(documento)
    setModalOpen(true)
  }

  const handleDelete = (documento: Documento) => {
    setDocumentos((prev) => prev.filter((d) => d.id !== documento.id))
  }

  const handleSubmit = (data: any) => {
    if (editingDocumento) {
      setDocumentos((prev) => prev.map((d) => (d.id === editingDocumento.id ? { ...d, ...data } : d)))
    } else {
      const newDocumento: Documento = {
        ...data,
        id: Date.now().toString(),
        fechaCreacion: new Date().toISOString().split("T")[0],
      }
      setDocumentos((prev) => [...prev, newDocumento])
    }
    setModalOpen(false)
  }

  // Statistics by document type
  const stats = {
    PEO: documentos.filter((d) => d.tipo === "PEO").length,
    asistencia: documentos.filter((d) => d.tipo === "asistencia").length,
    examen: documentos.filter((d) => d.tipo === "examen").length,
    diploma: documentos.filter((d) => d.tipo === "diploma").length,
    evidencia: documentos.filter((d) => d.tipo === "evidencia").length,
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

  return (
    <div className="flex h-screen bg-background">
      <Sidebar />

      <div className="flex-1 flex flex-col overflow-hidden">
        <AppHeader title="Documentos" subtitle="Gestiona todos los documentos del sistema" />

        <main className="flex-1 overflow-auto p-6 custom-scrollbar">
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

            {/* Recent Documents */}
            <Card>
              <CardHeader>
                <CardTitle>Documentos Recientes</CardTitle>
                <CardDescription>Últimos documentos agregados al sistema</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {documentos.slice(0, 5).map((documento) => (
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
                      <div className="flex gap-2">
                        <Button variant="ghost" size="sm">
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Download className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Data Table */}
            <DataTable
              title="Todos los Documentos"
              data={documentos}
              columns={columns}
              onAdd={handleAdd}
              onEdit={handleEdit}
              onDelete={user?.roles.some((role) => role.nombre === "RRHH") ? handleDelete : undefined}
              searchPlaceholder="Buscar documentos..."
            />
          </div>
        </main>
      </div>

      <FormModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        title={editingDocumento ? "Editar Documento" : "Nuevo Documento"}
        description={editingDocumento ? "Modifica el documento" : "Agrega un nuevo documento al sistema"}
        fields={formFields}
        initialData={editingDocumento || {}}
        onSubmit={handleSubmit}
      />
    </div>
  )
}
