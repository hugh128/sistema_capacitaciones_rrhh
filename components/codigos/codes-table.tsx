"use client"

import { useState } from "react"
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

export function CodesTable({ codigos, onView, onEdit, onDelete }: CodesTableProps) {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [parentToDelete, setParentToDelete] = useState<CodigoPadre | null>(null)

  const handleDeleteClick = (parent: CodigoPadre) => {
    setParentToDelete(parent)
    setDeleteDialogOpen(true)
  }

  const handleConfirmDelete = () => {
    if (parentToDelete) {
      onDelete(parentToDelete.ID_DOCUMENTO) 
    }
    setDeleteDialogOpen(false)
    setTimeout(() => setParentToDelete(null), 300)
  }

  const handleCancelDelete = () => {
    setDeleteDialogOpen(false)
    setTimeout(() => setParentToDelete(null), 300)
  }

  return (
    <>
      <div className="border rounded-lg overflow-hidden bg-card">
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
                <TableCell colSpan={7} className="text-center py-12 text-muted-foreground">
                  <div className="flex flex-col items-center gap-2">
                    <p className="text-base">No hay códigos disponibles</p>
                    <p className="text-sm">Agregue un código padre o importe desde Excel</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              codigos.map((parent) => (
                <TableRow key={parent.ID_DOCUMENTO} className="hover:bg-muted/50">
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
                        <DropdownMenuItem onClick={() => onView(parent)}>
                          <Eye className="h-4 w-4 mr-2" />
                          Ver detalles
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => onEdit(parent)}>
                          <Pencil className="h-4 w-4 mr-2" />
                          Editar
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={() => handleDeleteClick(parent)}
                          className="text-destructive focus:text-destructive"
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Eliminar
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
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
}
