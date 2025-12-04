"use client"

import { useState, useEffect, useCallback, memo } from "react"
import { Sidebar } from "@/components/sidebar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { useAuth } from "@/contexts/auth-context"
import { 
  FileText, 
  Upload,
  Download,
  CheckCircle, 
  File, 
  Clock, 
  Trash2, 
  Edit, 
  Star, 
  Archive,
  X,
  MoreVertical,
  CircleDashed
} from "lucide-react"
import { AppHeader } from "@/components/app-header"
import { RequirePermission } from "@/components/RequirePermission"
import { useDocumentos } from "@/hooks/useDocumentos"
import { Toaster } from 'react-hot-toast'
import type { PlantillaDocumento } from "@/lib/documentos/types"

type EstadoFiltro = 'TODOS' | 'ACTIVO' | 'BORRADOR' | 'OBSOLETO'

type PlantillaFormData = {
  NOMBRE_DISPLAY: string
  DESCRIPCION: string
  NOTAS: string
}

const PlantillaModal = memo(({ 
  isOpen, 
  editingPlantilla, 
  isMutating,
  onClose, 
  onSubmit 
}: {
  isOpen: boolean
  editingPlantilla: PlantillaDocumento | null
  isMutating: boolean
  onClose: () => void
  onSubmit: (data: PlantillaFormData, file: File | null) => Promise<void>
}) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [formData, setFormData] = useState({
    NOMBRE_DISPLAY: '',
    DESCRIPCION: '',
    NOTAS: ''
  })

  useEffect(() => {
    if (editingPlantilla) {
      setFormData({
        NOMBRE_DISPLAY: editingPlantilla.NOMBRE_DISPLAY,
        DESCRIPCION: editingPlantilla.DESCRIPCION || '',
        NOTAS: ''
      })
    } else {
      setFormData({
        NOMBRE_DISPLAY: '',
        DESCRIPCION: '',
        NOTAS: ''
      })
      setSelectedFile(null)
    }
  }, [editingPlantilla, isOpen])

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const validTypes = [
      'application/pdf', 
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 
      'application/msword'
    ]
    
    if (!validTypes.includes(file.type)) {
      alert('Solo se permiten archivos PDF, DOC o DOCX')
      return
    }

    if (file.size > 10 * 1024 * 1024) {
      alert('El archivo no debe superar los 10 MB')
      return
    }

    setSelectedFile(file)
  }

  const handleSubmit = async () => {
    if (!formData.NOMBRE_DISPLAY.trim()) {
      alert('El nombre es obligatorio')
      return
    }

    if (!editingPlantilla && !selectedFile) {
      alert('Debe seleccionar un archivo')
      return
    }

    await onSubmit(formData, selectedFile)
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-background rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto border shadow-lg">
        <div className="p-6 border-b flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold">
              {editingPlantilla ? 'Editar Plantilla' : 'Cargar Nueva Plantilla'}
            </h2>
            <p className="text-sm text-muted-foreground mt-1">
              {editingPlantilla 
                ? 'Actualiza la información o reemplaza el archivo' 
                : 'Sube un archivo PDF, DOC o DOCX (máx. 10 MB)'}
            </p>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="w-5 h-5" />
          </Button>
        </div>

        <div className="p-6 space-y-4">
          <div>
            <Label className="mb-2">
              Archivo {!editingPlantilla && '*'}
            </Label>
            <div className="border-2 border-dashed rounded-lg p-6 text-center hover:border-primary transition-colors cursor-pointer">
              <input
                type="file"
                accept=".pdf,.doc,.docx"
                onChange={handleFileSelect}
                className="hidden"
                id="file-upload"
              />
              <label htmlFor="file-upload" className="cursor-pointer">
                <Upload className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                {selectedFile ? (
                  <div>
                    <p className="text-sm font-medium">{selectedFile.name}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {(selectedFile.size / 1024).toFixed(2)} KB
                    </p>
                  </div>
                ) : editingPlantilla ? (
                  <div>
                    <p className="text-sm text-foreground">Click para reemplazar el archivo</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      Archivo actual: {editingPlantilla.NOMBRE_ARCHIVO}
                    </p>
                  </div>
                ) : (
                  <div>
                    <p className="text-sm text-muted-foreground">Click para seleccionar archivo</p>
                    <p className="text-xs text-muted-foreground mt-1">PDF, DOC o DOCX hasta 10 MB</p>
                  </div>
                )}
              </label>
            </div>
          </div>

          <div>
            <Label htmlFor="nombre" className="mb-2">
              Nombre de la plantilla *
            </Label>
            <Input
              id="nombre"
              type="text"
              value={formData.NOMBRE_DISPLAY}
              onChange={(e) => setFormData({ ...formData, NOMBRE_DISPLAY: e.target.value })}
              placeholder="Ej: Examen de Seguridad Industrial 2024"
            />
          </div>

          <div>
            <Label htmlFor="descripcion" className="mb-2">
              Descripción
            </Label>
            <Textarea
              id="descripcion"
              value={formData.DESCRIPCION}
              onChange={(e) => setFormData({ ...formData, DESCRIPCION: e.target.value })}
              rows={3}
              placeholder="Describe el contenido o propósito de esta plantilla"
            />
          </div>

          <div>
            <Label htmlFor="notas" className="mb-2">
              Notas {editingPlantilla && '(para control de versiones)'}
            </Label>
            <Textarea
              id="notas"
              value={formData.NOTAS}
              onChange={(e) => setFormData({ ...formData, NOTAS: e.target.value })}
              rows={2}
              placeholder={
                editingPlantilla 
                  ? "Ej: Actualización de preguntas, corrección de errores..." 
                  : "Notas adicionales (opcional)"
              }
            />
          </div>
        </div>

        <div className="p-6 border-t bg-muted/50 flex justify-end gap-3">
          <Button variant="ghost" onClick={onClose} disabled={isMutating} className="border cursor-pointer">
            Cancelar
          </Button>
          <Button onClick={handleSubmit} disabled={isMutating} className="cursor-pointer">
            {isMutating ? 'Procesando...' : editingPlantilla ? 'Actualizar' : 'Cargar Plantilla'}
          </Button>
        </div>
      </div>
    </div>
  )
})

PlantillaModal.displayName = 'PlantillaModal'

const PlantillaActions = memo(({ 
  plantilla, 
  loadingDownload,
  isMutating,
  onActivar,
  onDescargar,
  onEditar,
  onCambiarEstado,
  onEliminar
}: {
  plantilla: PlantillaDocumento
  loadingDownload: boolean
  isMutating: boolean
  onActivar: (id: number) => void
  onDescargar: (id: number) => void
  onEditar: (plantilla: PlantillaDocumento) => void
  onCambiarEstado: (id: number, estado: 'BORRADOR' | 'ACTIVO' | 'OBSOLETO') => void
  onEliminar: (id: number) => void
}) => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="cursor-pointer">
          <MoreVertical className="w-4 h-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuLabel>Acciones</DropdownMenuLabel>
        <DropdownMenuSeparator />
        
        {!plantilla.ACTIVO && plantilla.ESTADO !== 'OBSOLETO' && (
          <DropdownMenuItem 
            onClick={() => onActivar(plantilla.ID_PLANTILLA)}
            disabled={isMutating}
            className="cursor-pointer"
          >
            <Star className="w-4 h-4 mr-2" />
            Activar como predeterminada
          </DropdownMenuItem>
        )}
        
        <DropdownMenuItem 
          onClick={() => onDescargar(plantilla.ID_PLANTILLA)}
          disabled={loadingDownload}
          className="cursor-pointer"
        >
          <Download className="w-4 h-4 mr-2" />
          Descargar
        </DropdownMenuItem>
        
        <DropdownMenuItem 
          onClick={() => onEditar(plantilla)}
          disabled={isMutating}
          className="cursor-pointer"
        >
          <Edit className="w-4 h-4 mr-2" />
          Editar
        </DropdownMenuItem>

        <DropdownMenuSeparator />
        <DropdownMenuLabel className="text-xs text-muted-foreground">Cambiar Estado</DropdownMenuLabel>
        
        {plantilla.ESTADO !== 'ACTIVO' && (
          <DropdownMenuItem 
            onClick={() => onCambiarEstado(plantilla.ID_PLANTILLA, 'ACTIVO')}
            disabled={isMutating}
            className="cursor-pointer"
          >
            <CheckCircle className="w-4 h-4 mr-2 text-blue-500" />
            Marcar como Activa
          </DropdownMenuItem>
        )}
        
        {plantilla.ESTADO !== 'BORRADOR' && (
          <DropdownMenuItem 
            onClick={() => onCambiarEstado(plantilla.ID_PLANTILLA, 'BORRADOR')}
            disabled={isMutating}
            className="cursor-pointer"
          >
            <CircleDashed className="w-4 h-4 mr-2 text-amber-500" />
            Marcar como Borrador
          </DropdownMenuItem>
        )}
        
        {plantilla.ESTADO !== 'OBSOLETO' && (
          <DropdownMenuItem 
            onClick={() => onCambiarEstado(plantilla.ID_PLANTILLA, 'OBSOLETO')}
            disabled={isMutating}
            className="cursor-pointer"
          >
            <Archive className="w-4 h-4 mr-2 text-gray-500" />
            Marcar como Obsoleta
          </DropdownMenuItem>
        )}

        <DropdownMenuSeparator />
        
        <DropdownMenuItem 
          onClick={() => onEliminar(plantilla.ID_PLANTILLA)}
          disabled={isMutating}
          className="text-destructive focus:text-destructive cursor-pointer"
        >
          <Trash2 className="w-4 h-4 mr-2" />
          Eliminar
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
})

PlantillaActions.displayName = 'PlantillaActions'

export default function PlantillasExamenPage() {
  const { user } = useAuth()
  const {
    plantillas,
    isLoading,
    isMutating,
    fetchPlantillas,
    uploadPlantilla,
    updatePlantilla,
    activarPlantilla,
    cambiarEstado,
    deletePlantilla,
    descargarPlantilla,
  } = useDocumentos(user)

  const [modalOpen, setModalOpen] = useState(false)
  const [editingPlantilla, setEditingPlantilla] = useState<PlantillaDocumento | null>(null)
  const [filterEstado, setFilterEstado] = useState<EstadoFiltro>('TODOS')
  const [loadingDownload, setLoadingDownload] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [plantillaToDelete, setPlantillaToDelete] = useState<number | null>(null)

  useEffect(() => {
    if (user) {
      fetchPlantillas()
    }
  }, [user, fetchPlantillas])

  const plantillaActiva = plantillas.find(p => p.ACTIVO && p.ESTADO === 'ACTIVO')
  
  const filteredPlantillas = filterEstado === 'TODOS' 
    ? plantillas 
    : plantillas.filter(p => p.ESTADO === filterEstado)

  const stats = {
    total: plantillas.length,
    activo: plantillas.filter(p => p.ESTADO === 'ACTIVO').length,
    borrador: plantillas.filter(p => p.ESTADO === 'BORRADOR').length,
    obsoleto: plantillas.filter(p => p.ESTADO === 'OBSOLETO').length,
  }

  const handleOpenModal = useCallback((plantilla: PlantillaDocumento | null = null) => {
    setEditingPlantilla(plantilla)
    setModalOpen(true)
  }, [])

  const handleCloseModal = useCallback(() => {
    setModalOpen(false)
    setEditingPlantilla(null)
  }, [])

  const handleSubmit = useCallback(async (formData: PlantillaFormData, file: File | null) => {
    let success = false

    if (editingPlantilla) {
      success = await updatePlantilla(
        {
          ID_PLANTILLA: editingPlantilla.ID_PLANTILLA,
          NOMBRE_DISPLAY: formData.NOMBRE_DISPLAY,
          DESCRIPCION: formData.DESCRIPCION,
          NOTAS: formData.NOTAS,
          MODIFICADO_POR: user!.USERNAME
        },
        file || undefined
      )
    } else {
      success = await uploadPlantilla(
        {
          NOMBRE_DISPLAY: formData.NOMBRE_DISPLAY,
          DESCRIPCION: formData.DESCRIPCION,
          NOTAS: formData.NOTAS,
          CREADO_POR: user!.USERNAME
        },
        file!
      )
    }

    if (success) {
      handleCloseModal()
    }
  }, [editingPlantilla, updatePlantilla, uploadPlantilla, user, handleCloseModal])

  const handleActivar = useCallback(async (id: number) => {
    await activarPlantilla(id)
  }, [activarPlantilla])

  const handleCambiarEstado = useCallback(async (id: number, nuevoEstado: 'BORRADOR' | 'ACTIVO' | 'OBSOLETO') => {
    await cambiarEstado(id, nuevoEstado)
  }, [cambiarEstado])

  const handleDeleteClick = useCallback((id: number) => {
    setPlantillaToDelete(id)
    setDeleteDialogOpen(true)
  }, [])

  const handleDeleteConfirm = useCallback(async () => {
    if (plantillaToDelete) {
      await deletePlantilla(plantillaToDelete)
      setDeleteDialogOpen(false)
      setPlantillaToDelete(null)
    }
  }, [plantillaToDelete, deletePlantilla])

  const handleDownloadPlantilla = useCallback(async (idPlantilla: number) => {
    try {
      setLoadingDownload(true)
      const signedUrl = await descargarPlantilla(idPlantilla)
      if (signedUrl) {
        window.open(signedUrl, "_blank")
      }
    } catch (error) {
      console.error("Error al descargar la plantilla:", error)
    } finally {
      setLoadingDownload(false)
    }
  }, [descargarPlantilla])

  const getEstadoBadge = (estado: string, activo: boolean) => {
    if (activo && estado === "ACTIVO") {
      return (
        <span className="
          inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium
          bg-green-100 text-green-800 border border-green-200
          dark:bg-green-900 dark:text-green-300 dark:border-green-700
        ">
          <Star className="w-3 h-3 fill-current" />
          Predeterminada
        </span>
      )
    }

    const baseClasses = `
      px-2 py-1 rounded-full text-xs font-medium border 
      inline-flex items-center
    `

    const badges: Record<string, string> = {
      ACTIVO: `
        ${baseClasses}
        bg-blue-100 text-blue-700 border-blue-200
        dark:bg-blue-900 dark:text-blue-300 dark:border-blue-700
      `,
      BORRADOR: `
        ${baseClasses}
        bg-amber-100 text-amber-700 border-amber-200
        dark:bg-amber-900 dark:text-amber-300 dark:border-amber-700
      `,
      OBSOLETO: `
        ${baseClasses}
        bg-zinc-200 text-zinc-700 border-zinc-300
        dark:bg-zinc-800 dark:text-zinc-300 dark:border-zinc-700
      `
    }

    return <span className={badges[estado]}>{estado}</span>
  }

  const getTipoIcon = (tipo: string) => {
    return tipo === 'PDF' ? (
      <FileText className="w-4 h-4 text-red-500" />
    ) : (
      <File className="w-4 h-4 text-blue-500" />
    )
  }

  return (
    <RequirePermission requiredPermissions={["documents_access"]}>
      <div className="flex h-screen bg-background">
        <Toaster />
        <Sidebar />

        <div className="flex-1 flex flex-col overflow-hidden">
          <AppHeader 
            title="Plantillas de Exámenes" 
            subtitle="Gestiona las plantillas que se utilizarán para generar exámenes" 
          />

          <main className="flex-1 overflow-auto p-6 custom-scrollbar">
            <div className="max-w-7xl mx-auto space-y-6">
              {plantillaActiva && (
                <div
                  className="
                    rounded-xl p-6 border
                    bg-gradient-to-r from-green-50 to-emerald-50
                    dark:bg-gradient-to-r dark:from-green-950 dark:to-emerald-900
                    border-green-200 dark:border-green-700
                    shadow-sm
                  "
                >
                  <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                    <div className="flex items-start gap-4">
                      <div
                        className="
                          p-3 rounded-lg 
                          bg-green-100 dark:bg-green-900 
                          flex items-center justify-center
                        "
                      >
                        <CheckCircle className="w-8 h-8 text-green-600 dark:text-green-300" />
                      </div>
                      <div className="space-y-2">
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                            {plantillaActiva.NOMBRE_DISPLAY}
                          </h3>
                          {getEstadoBadge(plantillaActiva.ESTADO, plantillaActiva.ACTIVO)}
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-300">
                          {plantillaActiva.DESCRIPCION}
                        </p>
                        <div
                          className="
                            flex flex-wrap items-center gap-4 
                            text-xs text-gray-500 dark:text-gray-400
                          "
                        >
                          <span className="flex items-center gap-1">
                            {getTipoIcon(plantillaActiva.TIPO_DOCUMENTO)}
                            {plantillaActiva.TIPO_DOCUMENTO}
                          </span>
                          <span>{plantillaActiva.TAMANIO_FORMATEADO}</span>
                          <span>Versión {plantillaActiva.VERSION}</span>
                          <span>
                            {new Date(plantillaActiva.FECHA_CREACION).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2 self-end md:self-start">
                      <Button
                        variant="ghost"
                        size="icon"
                        disabled={loadingDownload}
                        onClick={() => handleDownloadPlantilla(plantillaActiva.ID_PLANTILLA)}
                        className="hover:bg-green-100 dark:hover:bg-green-800 cursor-pointer"
                      >
                        <Download className="w-5 h-5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleOpenModal(plantillaActiva)}
                        className="hover:bg-green-100 dark:hover:bg-green-800 cursor-po"
                      >
                        <Edit className="w-5 h-5" />
                      </Button>
                    </div>
                  </div>
                </div>
              )}

              <div className="grid gap-4 md:grid-cols-4">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Plantillas</CardTitle>
                    <FileText className="h-4 w-4 text-blue-500" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{stats.total}</div>
                    <p className="text-xs text-muted-foreground">plantillas</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Activas</CardTitle>
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{stats.activo}</div>
                    <p className="text-xs text-muted-foreground">plantillas</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Borradores</CardTitle>
                    <Clock className="h-4 w-4 text-yellow-500" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{stats.borrador}</div>
                    <p className="text-xs text-muted-foreground">plantillas</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Obsoletas</CardTitle>
                    <Archive className="h-4 w-4 text-gray-500" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{stats.obsoleto}</div>
                    <p className="text-xs text-muted-foreground">plantillas</p>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardContent className="p-4">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:flex md:flex-wrap gap-2">
                      <Button
                        variant={filterEstado === "TODOS" ? "default" : "outline"}
                        onClick={() => setFilterEstado("TODOS")}
                        className="cursor-pointer"
                      >
                        Todas
                      </Button>
                      <Button
                        variant={filterEstado === "ACTIVO" ? "default" : "ghost"}
                        onClick={() => setFilterEstado("ACTIVO")}
                        className="cursor-pointer"
                      >
                        Activas
                      </Button>
                      <Button
                        variant={filterEstado === "BORRADOR" ? "default" : "ghost"}
                        onClick={() => setFilterEstado("BORRADOR")}
                        className="cursor-pointer"
                      >
                        Borradores
                      </Button>
                      <Button
                        variant={filterEstado === "OBSOLETO" ? "default" : "ghost"}
                        onClick={() => setFilterEstado("OBSOLETO")}
                        className="cursor-pointer"
                      >
                        Obsoletas
                      </Button>
                    </div>

                    <div className="flex justify-center md:justify-end">
                      <Button
                        onClick={() => handleOpenModal()}
                        disabled={isMutating}
                        className="cursor-pointer flex items-center w-full md:w-auto"
                      >
                        <Upload className="w-4 h-4 mr-2" />
                        Cargar Plantilla
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-0">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-muted/50 border-b">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                            Plantilla
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                            Tipo
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                            Tamaño
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                            Estado
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                            Fecha
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                            Creado Por
                          </th>
                          <th className="px-6 py-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider">
                            Acciones
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y">
                        {isLoading ? (
                          <tr>
                            <td colSpan={7} className="px-6 py-8 text-center text-muted-foreground">
                              Cargando plantillas...
                            </td>
                          </tr>
                        ) : filteredPlantillas.length === 0 ? (
                          <tr>
                            <td colSpan={7} className="px-6 py-8 text-center text-muted-foreground">
                              No hay plantillas para mostrar
                            </td>
                          </tr>
                        ) : (
                          filteredPlantillas.map((plantilla) => (
                            <tr key={plantilla.ID_PLANTILLA} className="hover:bg-muted/50 transition-colors">
                              <td className="px-6 py-4">
                                <div>
                                  <div className="font-medium">{plantilla.NOMBRE_DISPLAY}</div>
                                  {plantilla.DESCRIPCION && (
                                    <div className="text-sm text-muted-foreground mt-1">
                                      {plantilla.DESCRIPCION}
                                    </div>
                                  )}
                                </div>
                              </td>
                              <td className="px-6 py-4">
                                <div className="flex items-center gap-2">
                                  {getTipoIcon(plantilla.TIPO_DOCUMENTO)}
                                  <span className="text-sm">{plantilla.TIPO_DOCUMENTO}</span>
                                </div>
                              </td>
                              <td className="px-6 py-4 text-sm text-muted-foreground">
                                {plantilla.TAMANIO_FORMATEADO}
                              </td>
                              <td className="px-6 py-4">
                                {getEstadoBadge(plantilla.ESTADO, plantilla.ACTIVO)}
                              </td>
                              <td className="px-6 py-4 text-sm text-muted-foreground">
                                {new Date(plantilla.FECHA_CREACION).toLocaleDateString()}
                              </td>
                              <td className="px-6 py-4 text-sm text-muted-foreground">
                                {plantilla.CREADO_POR || 'N/A'}
                              </td>
                              <td className="px-6 py-4">
                                <div className="flex items-center justify-end">
                                  <PlantillaActions
                                    plantilla={plantilla}
                                    loadingDownload={loadingDownload}
                                    isMutating={isMutating}
                                    onActivar={handleActivar}
                                    onDescargar={handleDownloadPlantilla}
                                    onEditar={handleOpenModal}
                                    onCambiarEstado={handleCambiarEstado}
                                    onEliminar={handleDeleteClick}
                                  />
                                </div>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </div>
          </main>
        </div>

        <PlantillaModal
          isOpen={modalOpen}
          editingPlantilla={editingPlantilla}
          isMutating={isMutating}
          onClose={handleCloseModal}
          onSubmit={handleSubmit}
        />

        <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
              <AlertDialogDescription>
                Esta acción no se puede deshacer. La plantilla será eliminada permanentemente del sistema.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel className="border dark:text-foreground cursor-pointer">Cancelar</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDeleteConfirm}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90 cursor-pointer"
              >
                Eliminar
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </RequirePermission>
  )
}
