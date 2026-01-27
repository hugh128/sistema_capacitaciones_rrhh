"use client"

import type React from "react"
import { useCallback, useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Upload, X, FileText, CheckCircle2, Eye } from "lucide-react"
import { cn } from "@/lib/utils"

interface UploadFileModalProps {
  isOpen: boolean
  onClose: () => void
  onUpload: (file: File) => void
  title: string
  description: string
  acceptedFileTypes?: string
  maxSize?: number // en MB
  currentFileName?: string | null
  currentFile?: File | null
  currentFileUrl?: string | null
  onDownloadFile?: () => Promise<void>
}

export function UploadFileModal({
  isOpen,
  onClose,
  onUpload,
  title,
  description,
  acceptedFileTypes = ".pdf",
  maxSize = 10,
  currentFileName = null,
  currentFile = null,
  currentFileUrl = null,
  onDownloadFile,
}: UploadFileModalProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const validateFile = useCallback((file: File): boolean => {
    setError(null)

    if (!file.type.includes("pdf")) {
      setError("Solo se permiten archivos PDF")
      return false
    }

    const fileSizeMB = file.size / (1024 * 1024)
    if (fileSizeMB > maxSize) {
      setError(`El archivo no puede superar ${maxSize}MB`)
      return false
    }

    return true
  }, [maxSize])

  const handleFileSelect = (file: File) => {
    if (validateFile(file)) {
      setSelectedFile(file)
    }
  }

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragging(false)

    const files = Array.from(e.dataTransfer.files)
    if (files.length > 0) {
      if (validateFile(files[0])) {
        setSelectedFile(files[0])
      }
    }
  }, [validateFile])

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragging(false)
  }, [])

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files && files.length > 0) {
      handleFileSelect(files[0])
    }
  }

  const handleUpload = () => {
    if (selectedFile) {
      onUpload(selectedFile)
      handleClose()
    }
  }

  const handleClose = () => {
    setSelectedFile(null)
    setError(null)
    setIsDragging(false)
    onClose()
  }

  const handleRemoveFile = () => {
    setSelectedFile(null)
    setError(null)
  }

  const handleViewFile = async () => {
    if (selectedFile) {
      const url = URL.createObjectURL(selectedFile)
      window.open(url, '_blank')
      setTimeout(() => URL.revokeObjectURL(url), 1000)
    } else if (currentFile) {
      const url = URL.createObjectURL(currentFile)
      window.open(url, '_blank')
      setTimeout(() => URL.revokeObjectURL(url), 1000)
    } else if (currentFileUrl && onDownloadFile) {
      await onDownloadFile()
    }
  }

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return "0 Bytes"
    const k = 1024
    const sizes = ["Bytes", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + " " + sizes[i]
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px] max-w-[95vw]">
        <DialogHeader>
          <DialogTitle className="break-words pr-6">{title}</DialogTitle>
          <DialogDescription className="break-words">{description}</DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {(currentFileName || currentFile || currentFileUrl) && !selectedFile && (
            <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-start gap-2 flex-1 min-w-0 overflow-hidden">
                  <FileText className="h-4 w-4 text-blue-600 flex-shrink-0 mt-0.5" />
                  <div className="flex-1 min-w-0 overflow-hidden">
                    <p className="text-sm font-medium text-blue-800 dark:text-blue-200 mb-1">
                      Archivo actual:
                    </p>
                    <p 
                      className="text-xs text-blue-700 dark:text-blue-300"
                      style={{
                        wordBreak: 'break-word',
                        overflowWrap: 'anywhere',
                        hyphens: 'auto'
                      }}
                    >
                      {currentFile ? currentFile.name : currentFileName}
                    </p>
                    {currentFile && (
                      <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                        {formatFileSize(currentFile.size)}
                      </p>
                    )}
                    {currentFileUrl && !currentFile && (
                      <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                        Archivo guardado en el servidor
                      </p>
                    )}
                  </div>
                </div>
                {(currentFile || currentFileUrl) && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={handleViewFile}
                    className="flex-shrink-0 border cursor-pointer"
                  >
                    <Eye className="h-3 w-3 mr-1" />
                    Ver
                  </Button>
                )}
              </div>
            </div>
          )}

          <div
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            className={cn(
              "border-2 border-dashed rounded-lg p-8 text-center transition-all cursor-pointer",
              isDragging
                ? "border-primary bg-primary/5 scale-105"
                : "border-gray-300 dark:border-gray-700 hover:border-primary hover:bg-primary/5",
              error && "border-red-500 bg-red-50 dark:bg-red-950/20"
            )}
          >
            {!selectedFile ? (
              <>
                <input
                  type="file"
                  id="file-upload"
                  className="hidden"
                  accept={acceptedFileTypes}
                  onChange={handleFileInputChange}
                />
                <label htmlFor="file-upload" className="cursor-pointer">
                  <Upload
                    className={cn(
                      "mx-auto h-12 w-12 mb-4",
                      isDragging ? "text-primary animate-bounce" : "text-gray-400"
                    )}
                  />
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {isDragging ? "Suelta el archivo aquí" : "Arrastra y suelta tu archivo PDF"}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">o</p>
                  <span className="inline-block px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-dark">
                    Seleccionar archivo
                  </span>
                  <p className="text-xs text-gray-400 mt-3">
                    Tamaño máximo: {maxSize}MB
                  </p>
                </label>
              </>
            ) : (
              <div className="flex items-start justify-between bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700 gap-3">
                <div className="flex items-start gap-3 flex-1 min-w-0 overflow-hidden">
                  <div className="flex-shrink-0 mt-0.5">
                    <CheckCircle2 className="h-6 w-6 text-green-500" />
                  </div>
                  <div className="flex-1 min-w-0 overflow-hidden">
                    <p 
                      className="text-sm font-medium text-gray-900 dark:text-gray-100"
                      style={{
                        wordBreak: 'break-word',
                        overflowWrap: 'anywhere',
                        hyphens: 'auto'
                      }}
                    >
                      {selectedFile.name}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      {formatFileSize(selectedFile.size)}
                    </p>
                  </div>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={handleRemoveFile}
                  className="flex-shrink-0"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>

          {error && (
            <div className="bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded-lg p-3">
              <p className="text-sm text-red-800 dark:text-red-200 break-words">{error}</p>
            </div>
          )}
        </div>

        <DialogFooter className="flex-col sm:flex-row gap-2">
          <Button type="button" variant="destructive" onClick={handleClose} className="w-full sm:w-auto cursor-pointer">
            Cancelar
          </Button>
          <Button type="button" onClick={handleUpload} disabled={!selectedFile} className="w-full sm:w-auto cursor-pointer">
            <Upload className="h-4 w-4 mr-2" />
            Subir archivo
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
