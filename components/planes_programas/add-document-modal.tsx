"use client"

import { useMemo, useState, memo, useEffect } from "react"
import { Search, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { CodigoPadre } from "@/lib/codigos/types"

interface AddDocumentosModalProps {
  isOpen: boolean
  onClose: () => void
  documentosList: CodigoPadre[]
  documentosMarcados: number[]
  onToggleDocumento: (id: number) => void
  onSave: () => void
  isSaving: boolean
}

const DocumentoItem = memo(({ 
  doc, 
  isSelected, 
  onToggle 
}: { 
  doc: CodigoPadre
  isSelected: boolean
  onToggle: (id: number) => void
}) => {
  return (
    <div
      onClick={() => onToggle(doc.ID_DOCUMENTO)}
      className={`border rounded-lg p-4 cursor-pointer transition-all ${
        isSelected
          ? "border-primary bg-primary/10"
          : "border-border hover:border-primary/50 hover:bg-muted/50"
      }`}
    >
      <div className="flex items-start gap-3">
        <input
          type="checkbox"
          checked={isSelected}
          onChange={() => {}}
          className="mt-1 w-4 h-4 text-primary rounded border-border"
        />
        <div className="flex-1">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-foreground">{doc.NOMBRE_DOCUMENTO}</h3>
            <span className={`px-2 py-1 rounded text-xs ${
              doc.ESTATUS === "VIGENTE" 
                ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" 
                : "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400"
            }`}>
              {doc.ESTATUS}
            </span>
          </div>
          <p className="text-sm text-muted-foreground">
            Código: {doc.CODIGO}
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            Tipo: {doc.TIPO_DOCUMENTO}
          </p>
        </div>
      </div>
    </div>
  )
})

DocumentoItem.displayName = "DocumentoItem"

export const AddDocumentosModal = memo(function AddDocumentosModal({
  isOpen,
  onClose,
  documentosList,
  documentosMarcados,
  onToggleDocumento,
  onSave,
  isSaving
}: AddDocumentosModalProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("")

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm)
    }, 200)

    return () => clearTimeout(timer)
  }, [searchTerm])

  const filteredDocumentos = useMemo(() => {
    if (!debouncedSearchTerm.trim()) return documentosList
    
    const lowerCaseSearchTerm = debouncedSearchTerm.toLowerCase()
    return documentosList.filter(doc =>
      doc.NOMBRE_DOCUMENTO.toLowerCase().includes(lowerCaseSearchTerm) ||
      doc.CODIGO.toLowerCase().includes(lowerCaseSearchTerm)
    )
  }, [documentosList, debouncedSearchTerm])

  const selectedSet = useMemo(() => new Set(documentosMarcados), [documentosMarcados])

  useEffect(() => {
    if (!isOpen) {
      setSearchTerm("")
      setDebouncedSearchTerm("")
    }
  }, [isOpen])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-card rounded-lg w-full max-w-3xl max-h-[80vh] flex flex-col border border-border">
        <div className="flex items-center justify-between p-6 border-b border-border">
          <div>
            <h2 className="text-xl font-semibold text-foreground">Añadir Capacitaciones</h2>
            <p className="text-sm text-muted-foreground mt-1">
              Selecciona las capacitaciones que deseas agregar
            </p>
          </div>
          <Button
            type="button"
            onClick={onClose}
            variant="ghost"
            size="sm"
          >
            <X className="w-5 h-5" />
          </Button>
        </div>

        <div className="p-6 pb-0">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Buscar por nombre o código..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10"
              autoFocus
            />
          </div>
          {searchTerm !== debouncedSearchTerm && (
            <p className="text-xs text-muted-foreground mt-2">
              Buscando...
            </p>
          )}
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-3">
          {filteredDocumentos.length === 0 ? (
            <div className="text-center py-6 text-muted-foreground">
              {debouncedSearchTerm 
                ? "No se encontraron capacitaciones que coincidan con la búsqueda."
                : "No hay capacitaciones disponibles."}
            </div>
          ) : (
            filteredDocumentos.map((doc) => (
              <DocumentoItem
                key={doc.ID_DOCUMENTO}
                doc={doc}
                isSelected={selectedSet.has(doc.ID_DOCUMENTO)}
                onToggle={onToggleDocumento}
              />
            ))
          )}
        </div>

        <div className="flex items-center justify-between p-6 border-t border-border">
          <p className="text-sm text-muted-foreground">
            {documentosMarcados.length} capacitación
            {documentosMarcados.length !== 1 ? "es" : ""} seleccionada
            {documentosMarcados.length !== 1 ? "s" : ""}
          </p>
          <div className="flex gap-3">
            <Button
              type="button"
              onClick={onClose}
              variant="outline"
              className="dark:text-foreground dark:hover:border-destructive/50 cursor-pointer"
            >
              Cancelar
            </Button>
            <Button
              type="button"
              onClick={onSave}
              disabled={documentosMarcados.length === 0 || isSaving}
              className="bg-accent hover:bg-accent/90 text-accent-foreground disabled:opacity-50 cursor-pointer"
            >
              {isSaving
                ? "Guardando..."
                : `Añadir (${documentosMarcados.length})`}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
})
