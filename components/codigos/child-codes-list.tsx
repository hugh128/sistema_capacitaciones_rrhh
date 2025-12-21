"use client"

import { useState, useMemo, useCallback, memo, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Plus, Pencil, Trash2, ChevronLeft, ChevronRight, Search } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { ChildCodeForm } from "./child-code-form"
import type { CodigoHijo, NuevoCodigoHijo } from "@/lib/codigos/types"
import { Badge } from "../ui/badge"
import { getEstatusBadgeVariant } from "./codes-table"

interface ChildCodesListProps {
  parentID: number
  children: CodigoHijo[]
  onAdd: (child: NuevoCodigoHijo) => void
  onEdit: (childId: number, data: NuevoCodigoHijo) => void
  onDelete: (childId: number) => void
}

const ChildItem = memo(({ 
  child, 
  onEdit, 
  onDelete 
}: { 
  child: CodigoHijo
  onEdit: (child: CodigoHijo) => void
  onDelete: (id: number) => void
}) => {
  const handleEdit = useCallback(() => onEdit(child), [onEdit, child]);
  const handleDelete = useCallback(() => onDelete(child.ID_DOC_ASOCIADO), [onDelete, child.ID_DOC_ASOCIADO]);

  return (
    <div className="p-3 bg-muted/50 rounded-lg">
      <div className="grid grid-cols-[0.9fr_2.4fr_0.5fr_0.5fr] gap-3 items-center">
        <div>
          <p className="text-xs text-muted-foreground">Dato Asociado</p>
          <p className="text-sm font-medium">{child.CODIGO}</p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground">Nombre de Documento</p>
          <p className="text-sm">{child.NOMBRE_DOCUMENTO}</p>
        </div>
        <div>
          <Badge variant={getEstatusBadgeVariant(child.ESTATUS)} className="font-normal whitespace-nowrap">
            {child.ESTATUS}
          </Badge>
        </div>
        <div>
          <Button variant="ghost" size="icon" onClick={handleEdit} className="h-8 w-8">
            <Pencil className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleDelete}
            className="h-8 w-8 text-destructive hover:text-destructive"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
});

ChildItem.displayName = "ChildItem";

export const ChildCodesList = memo(function ChildCodesList({ 
  children, 
  onAdd, 
  onEdit, 
  onDelete 
}: ChildCodesListProps) {
  const [isAddOpen, setIsAddOpen] = useState(false)
  const [editingChild, setEditingChild] = useState<CodigoHijo | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [searchQuery, setSearchQuery] = useState("")
  const itemsPerPage = 10

  useEffect(() => {
    setCurrentPage(1)
  }, [children.length])

  const { filteredChildren, totalPages, visibleChildren } = useMemo(() => {
    const filtered = children.filter((child) => {
      const query = searchQuery.toLowerCase()
      return (
        child.CODIGO.toLowerCase().includes(query) ||
        child.NOMBRE_DOCUMENTO.toLowerCase().includes(query)
      )
    })

    const total = Math.ceil(filtered.length / itemsPerPage)
    const startIndex = (currentPage - 1) * itemsPerPage
    const visible = filtered.slice(startIndex, startIndex + itemsPerPage)

    return { filteredChildren: filtered, totalPages: total, visibleChildren: visible }
  }, [children, searchQuery, currentPage])

  const handleSearchChange = useCallback((value: string) => {
    setSearchQuery(value)
    setCurrentPage(1)
  }, [])

  const handleOpenAdd = useCallback(() => {
    setIsAddOpen(true)
  }, [])

  const handleCloseAdd = useCallback(() => {
    setIsAddOpen(false)
  }, [])

  const handleAdd = useCallback(async (data: NuevoCodigoHijo) => {
    if (!data.CODIGO || !data.NOMBRE_DOCUMENTO || !data.VERSION || !data.ESTATUS) {
      return;
    }
    await onAdd(data);
    setIsAddOpen(false);
  }, [onAdd])

  const openEditDialog = useCallback((child: CodigoHijo) => {
    setEditingChild(child)
  }, [])

  const handleCloseEdit = useCallback(() => {
    setEditingChild(null)
  }, [])

  const handleEdit = useCallback(async (data: NuevoCodigoHijo) => {
    if (!editingChild || !data.CODIGO || !data.NOMBRE_DOCUMENTO) return;
    await onEdit(editingChild.ID_DOC_ASOCIADO, data);
    setEditingChild(null);
  }, [editingChild, onEdit])

  const handlePrevPage = useCallback(() => {
    setCurrentPage(prev => Math.max(1, prev - 1))
  }, [])

  const handleNextPage = useCallback(() => {
    setCurrentPage(prev => prev + 1)
  }, [])

  const editInitialData = useMemo<NuevoCodigoHijo | undefined>(() => {
    if (!editingChild) return undefined;
    return {
      CODIGO: editingChild.CODIGO,
      NOMBRE_DOCUMENTO: editingChild.NOMBRE_DOCUMENTO,
      FECHA_APROBACION: editingChild.FECHA_APROBACION,
      VERSION: editingChild.VERSION,
      ESTATUS: editingChild.ESTATUS,
    };
  }, [editingChild]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-medium">
          Códigos Hijo ({searchQuery ? `${filteredChildren.length} de ${children.length}` : children.length})
        </h4>
        <Button size="sm" variant="outline" onClick={handleOpenAdd}>
          <Plus className="h-4 w-4 mr-2" />
          Agregar Hijo
        </Button>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Buscar por dato asociado o nombre de documento..."
          value={searchQuery}
          onChange={(e) => handleSearchChange(e.target.value)}
          className="pl-9"
        />
      </div>

      {children.length === 0 ? (
        <div className="text-center py-8 text-sm text-muted-foreground border rounded-lg">
          No hay códigos hijo asociados
        </div>
      ) : filteredChildren.length === 0 ? (
        <div className="text-center py-8 text-sm text-muted-foreground border rounded-lg">
          No se encontraron códigos hijo que coincidan con &quot;{searchQuery}&quot;
        </div>
      ) : (
        <>
          <div className="space-y-2">
            {visibleChildren.map((child) => (
              <ChildItem
                key={`${child.ID_DOC_ASOCIADO}-${child.VERSION}-${child.ESTATUS}`}
                child={child}
                onEdit={openEditDialog}
                onDelete={onDelete}
              />
            ))}
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-between pt-2">
              <div className="text-xs text-muted-foreground">
                Mostrando {(currentPage - 1) * itemsPerPage + 1}-
                {Math.min(currentPage * itemsPerPage, filteredChildren.length)} de {filteredChildren.length}
              </div>
              <div className="flex items-center gap-1">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handlePrevPage}
                  disabled={currentPage === 1}
                  className="h-7 px-2"
                >
                  <ChevronLeft className="h-3 w-3" />
                </Button>
                <div className="text-xs px-2">
                  {currentPage} / {totalPages}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleNextPage}
                  disabled={currentPage === totalPages}
                  className="h-7 px-2"
                >
                  <ChevronRight className="h-3 w-3" />
                </Button>
              </div>
            </div>
          )}
        </>
      )}

      <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Agregar Código Hijo</DialogTitle>
            <DialogDescription>Complete los campos para crear un nuevo código hijo</DialogDescription>
          </DialogHeader>
          <ChildCodeForm
            onSubmit={handleAdd}
            onCancel={handleCloseAdd}
          />
        </DialogContent>
      </Dialog>

      <Dialog open={!!editingChild} onOpenChange={(open) => !open && setEditingChild(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Código Hijo</DialogTitle>
            <DialogDescription>Modifique los campos del código hijo</DialogDescription>
          </DialogHeader>
          <ChildCodeForm
            key={editingChild?.ID_DOC_ASOCIADO}
            initialData={editInitialData}
            onSubmit={handleEdit}
            onCancel={handleCloseEdit}
            isEditing
          />
        </DialogContent>
      </Dialog>
    </div>
  )
}, (prevProps, nextProps) => {
  return (
    prevProps.parentID === nextProps.parentID &&
    prevProps.children.length === nextProps.children.length &&
    prevProps.children.every((child, idx) => {
      const nextChild = nextProps.children[idx];
      return (
        child.ID_DOC_ASOCIADO === nextChild.ID_DOC_ASOCIADO &&
        child.CODIGO === nextChild.CODIGO &&
        child.NOMBRE_DOCUMENTO === nextChild.NOMBRE_DOCUMENTO &&
        child.ESTATUS === nextChild.ESTATUS &&
        child.VERSION === nextChild.VERSION &&
        child.FECHA_APROBACION === nextChild.FECHA_APROBACION
      );
    })
  );
});
