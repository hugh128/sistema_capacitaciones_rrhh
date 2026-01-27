"use client"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Upload, Download, Eye, CheckCircle, FileText, Trash2, Info, FileCheck } from "lucide-react"
import type { COLABORADORES_SESION, ExamenCompleto, Serie, SESION_DETALLE } from "@/lib/mis-capacitaciones/capacitaciones-types"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useCapacitaciones } from "@/hooks/useCapacitaciones"
import { UsuarioLogin } from "@/lib/auth"
import { useState, memo, useEffect, useCallback } from "react"
import { useDocumentos } from "@/hooks/useDocumentos"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"

interface ObservacionesModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  observacionesIniciales: string
  onConfirmar: (observaciones: string) => void
  loading: boolean
}

const ObservacionesModal = memo(function ObservacionesModal({ 
  open, 
  onOpenChange, 
  observacionesIniciales,
  onConfirmar,
  loading 
}: ObservacionesModalProps) {
  const [observaciones, setObservaciones] = useState(observacionesIniciales)

  useEffect(() => {
    if (open) {
      setObservaciones(observacionesIniciales)
    }
  }, [open, observacionesIniciales])

  const handleConfirmar = () => {
    onConfirmar(observaciones)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Observaciones de la Plantilla</DialogTitle>
          <DialogDescription>
            Puedes agregar o modificar las observaciones que aparecerán en el documento. 
            Si dejas el campo vacío, se usarán las observaciones de la sesión.
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="observaciones">
              Observaciones
            </Label>
            <Textarea
              id="observaciones"
              placeholder="Escribe las observaciones aquí o déjalo vacío..."
              value={observaciones}
              onChange={(e) => setObservaciones(e.target.value)}
              className="min-h-[100px]"
            />
            <p className="text-sm text-muted-foreground">
              Observaciones actuales de la sesión: {observacionesIniciales || "Sin observaciones"}
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="dark:text-foreground cursor-pointer"
          >
            Cancelar
          </Button>
          <Button
            onClick={handleConfirmar}
            disabled={loading}
            className="cursor-pointer"
          >
            {loading ? "Generando..." : "Generar Plantilla"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
})

interface DocumentsTabProps {
  sesion: SESION_DETALLE
  colaboradores: COLABORADORES_SESION[]
  stats: {
    total: number
    asistencias: number
    examenes: number
    diplomas: number
  }
  onSelectAttendanceFile: (file: File) => void
  onDeleteAttendance: () => void
  displayedFileUrl: string | null
  isFileUploaded: boolean
  plantillaExamen: { series: Serie[] } | undefined;
  usuario: UsuarioLogin
  listaAsistenciaFile: File | null
}

export function DocumentsTab({ 
  sesion,
  colaboradores,
  stats, 
  onSelectAttendanceFile, 
  onDeleteAttendance, 
  displayedFileUrl, 
  isFileUploaded,
  plantillaExamen,
  usuario,
  listaAsistenciaFile,
}: DocumentsTabProps) {
  const [loadingDownload, setLoadingDownload] = useState(false);
  const [showObservacionesModal, setShowObservacionesModal] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [dragError, setDragError] = useState<string | null>(null);
  
  const {
    descargarListaAsistencia,
    descargarPlantillaAsistencia,
    generarExamenPDF,
  } = useCapacitaciones(usuario);

  const {
    descargarPlantillaPredeterminada
  } = useDocumentos(usuario)

  const attendanceInfo = displayedFileUrl
  
  const isEditable = sesion.ESTADO === 'EN_PROCESO' || sesion.ESTADO === 'RECHAZADA'

  const fileInputId = `attendance-upload-${sesion.ID_SESION || 'new'}`;

  const validateFile = useCallback((file: File): boolean => {
    setDragError(null)

    if (!file.type.includes("pdf")) {
      setDragError("Solo se permiten archivos PDF")
      return false
    }

    const fileSizeMB = file.size / (1024 * 1024)
    if (fileSizeMB > 30) {
      setDragError("El archivo no puede superar 30MB")
      return false
    }

    return true
  }, [])

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragging(false)

    if (!isEditable) {
      setDragError("No se pueden subir archivos en el estado actual")
      return
    }

    const files = Array.from(e.dataTransfer.files)
    if (files.length > 0) {
      const file = files[0]
      if (validateFile(file)) {
        onSelectAttendanceFile(file)
      }
    }
  }, [isEditable, validateFile, onSelectAttendanceFile])

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    if (isEditable) {
      setIsDragging(true)
    }
  }, [isEditable])

  const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragging(false)
  }, [])

  const getFileName = (): string => {
    if (listaAsistenciaFile) {
      return listaAsistenciaFile.name;
    }
    
    if (isFileUploaded && displayedFileUrl) {
      if (displayedFileUrl.startsWith('http')) {
        const urlParts = displayedFileUrl.split('/');
        const fileName = urlParts[urlParts.length - 1];
        return decodeURIComponent(fileName.split('?')[0]);
      }
      return displayedFileUrl;
    }
    
    return 'Sin archivo';
  }

  const handleDownload = async () => {
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

  const abrirModalObservaciones = () => {
    setShowObservacionesModal(true);
  };

  const handleDownloadPlantilla = async (observacionesPersonalizadas: string) => {
    try {
      setLoadingDownload(true);

      const modalidad = sesion.MODALIDAD?.toUpperCase();
      const interno = modalidad === 'INTERNA';
      const externo = modalidad === 'EXTERNA';

      const tipo = sesion.TIPO_CAPACITACION?.toUpperCase();
      const taller = tipo === 'TALLER';
      const curso = tipo === 'CURSO';
      const otro = !taller && !curso;

    const observacionesFinales = observacionesPersonalizadas?.trim() || "";

      const datos = {
        sistemaDocumental: sesion.ES_SISTEMA_DOCUMENTAL,
        codigoDocumento: sesion.CODIGO_DOCUMENTO,
        version: sesion.VERSION_SESION?.toString(),
        documentosAsociados: sesion.TEMAS_CODIGOS,
        taller,
        curso,
        otro,
        interno,
        externo,
        grupoObjetivo: sesion.GRUPO_OBJETIVO || "Sin grupo objetivo",
        nombreCapacitacion: sesion.CAPACITACION_NOMBRE,
        objetivoCapacitacion: sesion.OBJETIVO || "Sin objetivo definido",
        nombreFacilitador: sesion.CAPACITADOR_NOMBRE,
        fechaCapacitacion: sesion.FECHA_FORMATO || "Sin fecha",
        horario: sesion.HORARIO_FORMATO_12H,
        horasCapacitacion: sesion.DURACION_FORMATO,
        asistentes: colaboradores?.map((col) => ({
          nombre:
            col.NOMBRE_COMPLETO ||
            `${col.NOMBRE ?? ""} ${col.APELLIDO ?? ""}`.trim() ||
            "Sin nombre",
          area: col.DEPARTAMENTO_CODIGO,
          nota: col.NOTA_OBTENIDA?.toString()
        })) || [],
        observaciones: observacionesFinales,
        sesion: sesion.NOMBRE_SESION || ""
      };

      await descargarPlantillaAsistencia(datos);

    } catch (error) {
      console.error("❌ Error al descargar la plantilla:", error);
    } finally {
      setLoadingDownload(false);
      setShowObservacionesModal(false);
    }
  };

  const handleDownloadExamen = async () => {
    try {
      setLoadingDownload(true)
      
      const signedUrl = await descargarPlantillaPredeterminada()
      if (signedUrl) {
        window.open(signedUrl, "_blank")
      }
    } catch (error) {
      console.error("❌ Error al descargar el examen:", error);
    } finally {
      setLoadingDownload(false);
    }
  };

  const handleGenerarExamenCargado = async () => {
    if (!plantillaExamen) {
      console.error("No hay plantilla de examen cargada.");
      return;
    }
    
    const colaboradoresAProcesar = colaboradores.filter(c => c.NOMBRE_COMPLETO);

    if (colaboradoresAProcesar.length === 0) {
      console.error("No hay colaboradores válidos para generar exámenes.");
      return;
    }
    
    try {
      setLoadingDownload(true);
      
      const listaExamenesData: ExamenCompleto[] = colaboradoresAProcesar.map(colaborador => ({
        collaboratorName: colaborador.NOMBRE_COMPLETO,
        documentCode: sesion.CODIGO_DOCUMENTO || ' ',
        department: colaborador.DEPARTAMENTO, 
        trainingName: sesion.CAPACITACION_NOMBRE,
        internal: sesion.MODALIDAD === 'INTERNA' ? 'X' : '', 
        external: sesion.MODALIDAD === 'EXTERNA' ? 'X' : '', 
        passingScore: sesion.NOTA_MINIMA ? sesion.NOTA_MINIMA.toString() : 'N/A',
        series: plantillaExamen.series, 
        sesion: sesion.NOMBRE_SESION,
      }));

      await generarExamenPDF(listaExamenesData);
        
    } catch (error) {
        console.error("Error al generar el examen:", error);
    } finally {
        setLoadingDownload(false);
    }
  };

  return (
    <>
      <Card className="shadow-sm">
        <CardHeader className="py-2 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/20 dark:to-purple-950/20">
          <CardTitle className="text-xl">Documentos de la Sesión</CardTitle>
          <CardDescription>Gestiona los documentos de los participantes</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">

          {/* --------------------------- 1. Lista de Asistencia --------------------------- */}
          <div>
            <h3 className="text-lg font-semibold mb-3">1. Lista de Asistencia General</h3>
            
            <div 
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              className={cn(
                "border-2 border-dashed rounded-xl p-6 sm:p-8 text-center transition-all duration-300",
                isDragging && isEditable
                  ? "border-primary bg-primary/5 scale-[1.02]"
                  : "border-gray-300 dark:border-gray-600 bg-white dark:bg-transparent hover:border-blue-400",
                !isEditable && "cursor-not-allowed opacity-75"
              )}
            >
              {attendanceInfo ? (
                <div className="space-y-4">
                  
                  {isFileUploaded ? (
                    <CheckCircle className={cn(
                      "w-12 h-12 mx-auto text-green-500 transition-transform",
                      isDragging && "animate-bounce"
                    )} />
                  ) : (
                    <FileText className={cn(
                      "w-12 h-12 mx-auto text-blue-500 transition-transform",
                      isDragging && "animate-bounce"
                    )} />
                  )}

                  <div>
                    <p className="font-medium text-lg">
                      {isDragging 
                        ? "Suelta el archivo aquí" 
                        : isFileUploaded 
                        ? 'Registro de asistencia subido' 
                        : 'Archivo seleccionado localmente'
                      }
                    </p>
                    <p 
                      className="text-sm text-muted-foreground px-4"
                      style={{
                        wordBreak: 'break-word',
                        overflowWrap: 'anywhere',
                        hyphens: 'auto'
                      }}
                    >
                      {getFileName()}
                      {!isFileUploaded && (
                        <span className="text-orange-500 ml-2 font-semibold">(Pendiente de Subida)</span>
                      )}
                    </p>
                  </div>

                  <div className="flex gap-3 justify-center flex-wrap">
                    {displayedFileUrl && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleDownload}
                        disabled={loadingDownload}
                        className="dark:text-foreground dark:hover:border-amber-700 cursor-pointer"
                      >
                        <Eye className="w-4 h-4 mr-2" />
                        {loadingDownload ? "Generando enlace..." : "Ver Documento"}
                      </Button>
                    )}
                    
                    {isEditable && (
                      <>
                        <label htmlFor={fileInputId} className="cursor-pointer">
                          <Button variant="secondary" size="sm" asChild>
                            <span>
                              <Upload className="w-4 h-4 mr-2" />
                              {listaAsistenciaFile ? 'Cambiar Archivo' : (isFileUploaded ? 'Reemplazar' : 'Subir')}
                            </span>
                          </Button>
                          <input
                            id={fileInputId}
                            type="file"
                            accept=".pdf"
                            className="hidden"
                            onChange={(e) => {
                              const file = e.target.files?.[0]
                              if (file) {
                                if (validateFile(file)) {
                                  onSelectAttendanceFile(file)
                                }
                                e.target.value = ''
                              }
                            }}
                          />
                        </label>

                        {(listaAsistenciaFile || (isFileUploaded && sesion?.URL_LISTA_ASISTENCIA)) && (
                          <Button 
                            variant="destructive" 
                            size="sm" 
                            onClick={onDeleteAttendance}
                            className="cursor-pointer"
                            title={
                              listaAsistenciaFile 
                                ? "Cancelar selección y volver al archivo del servidor" 
                                : "Quitar archivo actual (deberás subir uno nuevo)"
                            }
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        )}
                      </>
                    )}
                  </div>

                </div>
              ) : (
                <div className="space-y-4">
                  <FileText className={cn(
                    "w-12 h-12 mx-auto text-muted-foreground transition-transform",
                    isDragging && "animate-bounce text-primary"
                  )} />
                  <div>
                    <p className="font-medium text-lg">
                      {isDragging 
                        ? "Suelta el archivo PDF aquí" 
                        : "Subir registro de asistencia"
                      }
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {isDragging 
                        ? "Solo archivos PDF de hasta 10MB"
                        : "Arrastra y suelta o haz clic para seleccionar. Archivo requerido para la conclusión de la sesión."
                      }
                    </p>
                  </div>
                  {isEditable ? (
                    <label htmlFor={fileInputId} className="cursor-pointer">
                      <Button asChild>
                        <span>
                          <Upload className="w-4 h-4 mr-2" />
                          Subir archivo PDF
                        </span>
                      </Button>
                      <input
                        id={fileInputId}
                        type="file"
                        accept=".pdf"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0]
                          if (file) {
                            if (validateFile(file)) {
                              onSelectAttendanceFile(file)
                            }
                            e.target.value = ''
                          }
                        }}
                      />
                    </label>
                  ) : (
                    <p className="text-sm text-red-500 font-medium">Solo se puede subir documentos si la sesión está en curso.</p>
                  )}
                </div>
              )}
            </div>

            {dragError && (
              <Alert className="mt-4 border-l-4 border-red-500 bg-red-50 dark:bg-red-950/20">
                <Info className="w-4 h-4 text-red-600" />
                <AlertDescription>
                  <p className="font-semibold text-red-700 dark:text-red-300">Error al cargar archivo:</p>
                  <p className="text-sm text-red-600 dark:text-red-400">{dragError}</p>
                </AlertDescription>
              </Alert>
            )}
            
            <Alert className="mt-4 border-l-4 border-blue-500 bg-blue-50 dark:bg-blue-950/20">
              <Info className="w-4 h-4 text-blue-600" />
              <AlertDescription>
                <p className="font-semibold mb-2 text-blue-700 dark:text-blue-300">Formato del Archivo y Proceso:</p>
                <ul className="text-sm space-y-1 list-disc list-inside text-gray-700 dark:text-gray-300">
                  <li>El archivo debe ser un **PDF** de la lista de asistencia firmada.</li>
                  <li>Puedes arrastrar y soltar el archivo o hacer clic para seleccionarlo.</li>
                  <li>Tamaño máximo: 10MB.</li>
                  <li>El documento debe incluir columnas para No., Nombre del Colaborador, Firma y Área.</li>
                </ul>
              </AlertDescription>
            </Alert>
          </div>

          {/* --------------------------- 2. Plantillas --------------------------- */}
          <div className="pt-4 border-t dark:border-gray-700">
            <h3 className="text-lg font-semibold mb-3">2. Plantillas Descargables</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Button
                variant="outline"
                className="w-full justify-start bg-transparent hover:bg-gray-100 dark:hover:bg-gray-700 transition cursor-pointer"
                onClick={abrirModalObservaciones}
                disabled={loadingDownload}
              >
                <Download className="h-4 w-4 mr-2 text-blue-500" />
                {loadingDownload ? "Generando plantilla..." : "Plantilla de Listado (PDF)"}
              </Button>
              
              {sesion.APLICA_EXAMEN && (
                <>
                  <Button
                    variant="outline"
                    className="w-full justify-start bg-transparent hover:bg-gray-100 dark:hover:bg-gray-700 transition cursor-pointer"
                    onClick={handleDownloadExamen}
                    disabled={loadingDownload}
                  >
                    <Download className="h-4 w-4 mr-2 text-purple-500" />
                    {loadingDownload ? "Generando enlace..." : "Plantilla de Examen"}
                  </Button>
                  
                  <Button
                    variant="outline"
                    className="w-full justify-start bg-transparent hover:bg-gray-100 dark:hover:bg-gray-700 transition cursor-pointer"
                    onClick={handleGenerarExamenCargado}
                    disabled={loadingDownload}
                  >
                    <FileCheck className="h-4 w-4 mr-2 text-green-500" />
                    {loadingDownload ? "Generando examen..." : "Generar Examen Cargado (PDF)"}
                  </Button>
                </>
              )}
            </div>
          </div>

          {/* --------------------------- 3. Resumen de Documentos --------------------------- */}
          <div className="pt-4 border-t dark:border-gray-700">
            <h3 className="text-lg font-semibold mb-3">3. Resumen y Estadísticas</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="text-center p-4 bg-blue-50 dark:bg-blue-950/20 rounded-xl shadow-inner">
                <p className="text-sm font-medium text-muted-foreground mb-1">Exámenes Subidos</p>
                <p className="text-4xl font-bold text-blue-600 dark:text-blue-400">
                  {stats.examenes} <span className="text-2xl text-muted-foreground">/ {stats.asistencias}</span>
                </p>
              </div>
              <div className="text-center p-4 bg-purple-50 dark:bg-purple-950/20 rounded-xl shadow-inner">
                <p className="text-sm font-medium text-muted-foreground mb-1">Diplomas Subidos</p>
                <p className="text-4xl font-bold text-purple-600 dark:text-purple-400">
                  {stats.diplomas} <span className="text-2xl text-muted-foreground">/ {stats.asistencias}</span>
                </p>
              </div>
            </div>
          </div>

          {sesion.ESTADO === "RECHAZADA" && sesion.URL_LISTA_ASISTENCIA && !listaAsistenciaFile && (
            <Alert className="mt-4 border-l-4 border-blue-500 bg-blue-50 dark:bg-blue-950/20">
              <Info className="w-4 h-4 text-blue-600" />
              <AlertDescription>
                <p className="font-semibold mb-2 text-blue-700 dark:text-blue-300">
                  Archivo Existente Detectado:
                </p>
                <p className="text-sm text-blue-800 dark:text-blue-300">
                  Esta sesión ya tiene un archivo de lista de asistencia. Puedes finalizarla 
                  con el archivo actual o subir uno nuevo si necesitas hacer correcciones.
                </p>
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      <ObservacionesModal
        open={showObservacionesModal}
        onOpenChange={setShowObservacionesModal}
        observacionesIniciales={sesion.OBSERVACIONES || "Sin observaciones"}
        onConfirmar={handleDownloadPlantilla}
        loading={loadingDownload}
      />
    </>
  )
}
