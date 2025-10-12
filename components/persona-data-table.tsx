"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Search, Plus, Edit, Trash2, MoreHorizontal, Eye } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
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
import { Persona } from "@/lib/types"

interface Column<T> {
  key: keyof T | string
  label: string
  render?: 
    | ((value: unknown, row?: T) => React.ReactNode)
    | ((value: string) => React.ReactNode)
    | ((value: boolean) => React.ReactNode)
    | ((value: number) => React.ReactNode)
}

interface DataTableProps<T> {
  title: string
  data: T[]
  columns: Column<T>[] 
  onAdd?: () => void
  onEdit?: (item: T) => void
  onDelete?: (item: T) => void
  onViewDetail?: (item: T) => void 
  searchPlaceholder?: string
}

function getNestedValue<T>(obj: T, path: string): React.ReactNode {
  if (!path.includes('.')) {
    return obj[path as keyof T] as React.ReactNode;
  }
  
  const parts = path.split('.');
  
  let current: unknown = obj;
  
  for (const part of parts) {
    if (current === null || current === undefined || typeof current !== 'object') {
      return undefined;
    }
    current = (current as Record<string, unknown>)[part];
  }
  return current as React.ReactNode;
}

type CallSiteRenderer<T> = (value: unknown, row: T) => React.ReactNode;

export function PersonaDataTable<T extends Persona>({
  title,
  data,
  columns,
  onAdd,
  onEdit,
  onDelete,
  onViewDetail,
  searchPlaceholder = "Buscar...",
}: DataTableProps<T>) {
  const [searchTerm, setSearchTerm] = useState("")
  const [showDialog, setShowDialog] = useState(false)
  const [itemToDelete, setItemToDelete] = useState<T | null>(null)


  const filteredData = data.filter((item) =>
    Object.values(item).some((value) => String(value).toLowerCase().includes(searchTerm.toLowerCase())),
  )

  const handleDeleteClick = (item: T) => {
    setItemToDelete(item)
    setShowDialog(true)
  }

  const handleConfirmDelete = () => {
    if (itemToDelete && onDelete) {
      onDelete(itemToDelete)
    }
    setShowDialog(false)
    setItemToDelete(null)
  }

  const hasActions = onEdit || onDelete || onViewDetail;

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h2 className="text-xl sm:text-2xl font-bold">{title}</h2>
        {onAdd && (
          <Button onClick={onAdd} className="w-full sm:w-auto">
            <Plus className="h-4 w-4 mr-2" />
            Agregar
          </Button>
        )}
      </div>

      <div className="relative w-full sm:max-w-sm">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
        <Input
          placeholder={searchPlaceholder}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      <div className="border rounded-lg overflow-hidden custom-scrollbar">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                {columns.map((column) => (
                  <TableHead key={column.key as string} className="whitespace-nowrap">
                    {column.label}
                  </TableHead>
                ))}
                {hasActions && <TableHead className="w-[120px] whitespace-nowrap">Acciones</TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredData.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={columns.length + 1} className="text-center py-8 text-muted-foreground">
                    No se encontraron registros
                  </TableCell>
                </TableRow>
              ) : (
                filteredData.map((item, index) => (
                  <TableRow key={item.ID_PERSONA || index}>
                    {columns.map((column) => {
                      const value = getNestedValue(item, column.key as string);

                      return (
                        <TableCell key={column.key as string} className="whitespace-nowrap">
                          {column.render
                            ? (column.render as CallSiteRenderer<T>)(value, item) 
                            : (value !== undefined && value !== null ? value : 'N/A')
                          }
                        </TableCell>
                      )
                    })}
                    {hasActions && (
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            {onViewDetail && (
                              <DropdownMenuItem onClick={() => onViewDetail(item)}>
                                <Eye className="h-4 w-4 mr-2" />
                                Ver Detalle
                              </DropdownMenuItem>
                            )}
                            {onEdit && (
                              <DropdownMenuItem onClick={() => onEdit(item)}>
                                <Edit className="h-4 w-4 mr-2" />
                                Editar
                              </DropdownMenuItem>
                            )}
                            {onDelete && (
                              <DropdownMenuItem onClick={() => handleDeleteClick(item)} className="text-destructive">
                                <Trash2 className="h-4 w-4 mr-2" />
                                Inactivar
                              </DropdownMenuItem>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    )}
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      <AlertDialog open={showDialog} onOpenChange={setShowDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar inactivacion</AlertDialogTitle>
            <AlertDialogDescription>
              ¿Estás seguro de que deseas inactivar este registro? Esta acción no se puede deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="cursor-pointer">Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmDelete} className="bg-destructive hover:bg-destructive cursor-pointer">
              Inactivar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

    </div>
  )
}
