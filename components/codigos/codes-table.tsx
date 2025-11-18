"use client"

import { memo, useState, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Eye, Pencil, Trash2, MoreVertical } from "lucide-react"
import { DeleteConfirmationDialog } from "./delete-confirmation-dialog"
import type { CodigoPadre } from "@/lib/codigos/types"

interface CodesTableProps {
  codigos: CodigoPadre[]
  onView: (parent: CodigoPadre) => void
  onEdit: (parent: CodigoPadre) => void
  onDelete: (id: number) => void
}

type BadgeVariant = "default" | "secondary" | "destructive" | "outline";

export const getEstatusBadgeVariant = (estatus: string): BadgeVariant => {
  switch (estatus) {
    case "VIGENTE":
      return "default"; 
    case "PROCESO":
      return "secondary";
    case "OBSOLETO":
      return "destructive"; 
    case "VENCIDO":
      return "outline";
    default:
      return "secondary";
  }
};

// ✅ OPTIMIZACIÓN 1: Memoizar cada fila individualmente
const TableRowMemoized = memo(({ 
  parent, 
  onView, 
  onEdit, 
  onDeleteClick 
}: { 
  parent: CodigoPadre
  onView: (parent: CodigoPadre) => void
  onEdit: (parent: CodigoPadre) => void
  onDeleteClick: (parent: CodigoPadre) => void
}) => {
  // ✅ Handlers internos para evitar crear funciones en cada render del padre
  const handleView = useCallback(() => onView(parent), [onView, parent])
  const handleEdit = useCallback(() => onEdit(parent), [onEdit, parent])
  const handleDelete = useCallback(() => onDeleteClick(parent), [onDeleteClick, parent])

  return (
    <TableRow className="hover:bg-muted/50">
      <TableCell className="font-mono font-medium">{parent.CODIGO}</TableCell>
      <TableCell className="text-sm">{parent.TIPO_DOCUMENTO}</TableCell>
      <TableCell className="max-w-xs truncate text-sm" title={parent.NOMBRE_DOCUMENTO}>
        {parent.NOMBRE_DOCUMENTO}
      </TableCell>
      <TableCell className="text-sm">{parent.APROBACION}</TableCell>
      <TableCell>
        <Badge variant={getEstatusBadgeVariant(parent.ESTATUS)} className="font-normal">
          {parent.ESTATUS}
        </Badge>
      </TableCell>
      <TableCell className="text-sm text-center">{parent.VERSION}</TableCell>
      <TableCell className="text-center">
        <Badge variant="outline" className="font-mono">
          {parent.DOCUMENTOS_ASOCIADOS.length}
        </Badge>
      </TableCell>
      <TableCell>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <MoreVertical className="h-4 w-4" />
              <span className="sr-only">Abrir menú</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={handleView}>
              <Eye className="h-4 w-4 mr-2" />
              Ver detalles
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleEdit}>
              <Pencil className="h-4 w-4 mr-2" />
              Editar
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={handleDelete}
              className="text-destructive focus:text-destructive"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Eliminar
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </TableCell>
    </TableRow>
  )
}, (prevProps, nextProps) => {
  // ✅ OPTIMIZACIÓN 2: Comparación profunda solo de datos relevantes
  const prev = prevProps.parent
  const next = nextProps.parent
  
  return (
    prev.ID_DOCUMENTO === next.ID_DOCUMENTO &&
    prev.CODIGO === next.CODIGO &&
    prev.TIPO_DOCUMENTO === next.TIPO_DOCUMENTO &&
    prev.NOMBRE_DOCUMENTO === next.NOMBRE_DOCUMENTO &&
    prev.APROBACION === next.APROBACION &&
    prev.ESTATUS === next.ESTATUS &&
    prev.VERSION === next.VERSION &&
    prev.DOCUMENTOS_ASOCIADOS.length === next.DOCUMENTOS_ASOCIADOS.length
  )
});

TableRowMemoized.displayName = "TableRowMemoized";

// ✅ OPTIMIZACIÓN 3: Componente principal sin memo innecesario
export const CodesTable = ({ codigos, onView, onEdit, onDelete }: CodesTableProps) => {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [parentToDelete, setParentToDelete] = useState<CodigoPadre | null>(null)

  // ✅ OPTIMIZACIÓN 4: Callbacks estables
  const handleDeleteClick = useCallback((parent: CodigoPadre) => {
    setParentToDelete(parent)
    setDeleteDialogOpen(true)
  }, [])

  const handleConfirmDelete = useCallback(() => {
    if (parentToDelete) {
      onDelete(parentToDelete.ID_DOCUMENTO) 
    }
    setDeleteDialogOpen(false)
    setTimeout(() => setParentToDelete(null), 300)
  }, [parentToDelete, onDelete])

  const handleCancelDelete = useCallback(() => {
    setDeleteDialogOpen(false)
    setTimeout(() => setParentToDelete(null), 300)
  }, [])

  return (
    <>
      <div className="border rounded-lg overflow-hidden bg-card custom-scrollbar">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead className="font-semibold">Código</TableHead>
              <TableHead className="font-semibold">Tipo</TableHead>
              <TableHead className="font-semibold">Documento</TableHead>
              <TableHead className="font-semibold">Fecha Aprobación</TableHead>
              <TableHead className="font-semibold">Estatus</TableHead>
              <TableHead className="text-center font-semibold">Version</TableHead>
              <TableHead className="text-center font-semibold">Códigos Hijo</TableHead>
              <TableHead className="w-[70px]">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {codigos.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-12 text-muted-foreground">
                  <div className="flex flex-col items-center gap-2">
                    <p className="text-base">No hay códigos disponibles</p>
                    <p className="text-sm">Agregue un código padre o importe desde Excel</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              codigos.map((parent) => (
                <TableRowMemoized
                  key={parent.ID_DOCUMENTO}
                  parent={parent}
                  onView={onView}
                  onEdit={onEdit}
                  onDeleteClick={handleDeleteClick}
                />
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {parentToDelete && (
        <DeleteConfirmationDialog
          open={deleteDialogOpen}
          onOpenChange={handleCancelDelete}
          onConfirm={handleConfirmDelete}
          title="¿Eliminar código padre?"
          description={`¿Está seguro de eliminar el código ${parentToDelete.CODIGO} y todos sus ${parentToDelete.DOCUMENTOS_ASOCIADOS.length} códigos hijo? Esta acción no se puede deshacer.`}
        />
      )}
    </>
  )
};

CodesTable.displayName = "CodesTable";
