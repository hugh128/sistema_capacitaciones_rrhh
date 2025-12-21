"use client"

import type React from "react"
import { useState, useMemo, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Search, Plus, Edit, Trash2, MoreHorizontal, Eye, Loader2 } from "lucide-react"
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
  loading?: boolean
}

function getNestedValue<T>(obj: T, path: string): unknown {
  if (!path.includes('.')) {
    return obj[path as keyof T];
  }
  
  const parts = path.split('.');
  let current: unknown = obj;
  
  for (const part of parts) {
    if (current === null || current === undefined || typeof current !== 'object') {
      return undefined;
    }
    current = (current as Record<string, unknown>)[part];
  }
  return current;
}

function getSearchableText(value: unknown): string {
  if (value === null || value === undefined) return '';
  if (typeof value === 'boolean') return value ? 'activo' : 'inactivo';
  if (typeof value === 'object' && value !== null) {
    if ('NOMBRE' in value) return String((value as Record<string, unknown>).NOMBRE);
    return '';
  }
  return String(value);
}

function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value)

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)

    return () => {
      clearTimeout(handler)
    }
  }, [value, delay])

  return debouncedValue
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
  loading = false,
}: DataTableProps<T>) {
  const [searchTerm, setSearchTerm] = useState("")
  const [showDialog, setShowDialog] = useState(false)
  const [itemToDelete, setItemToDelete] = useState<T | null>(null)

  const debouncedSearchTerm = useDebounce(searchTerm, 300)

  const filteredData = useMemo(() => {
    if (!debouncedSearchTerm.trim()) return data;

    const searchLower = debouncedSearchTerm.toLowerCase().trim();

    return data.filter((item) => {
      return columns.some((column) => {
        const value = getNestedValue(item, column.key as string);
        
        if (column.key === 'TIPO_PERSONA') {
          const tipoTexto = value === 'INTERNO' ? 'colaborador interno' : 'persona externa externo';
          return tipoTexto.includes(searchLower);
        }
        
        if (column.key === 'ESTADO') {
          const estadoTexto = value ? 'activo' : 'inactivo';
          return estadoTexto.includes(searchLower);
        }
        
        const searchableText = getSearchableText(value);
        return searchableText.toLowerCase().includes(searchLower);
      });
    });
  }, [data, debouncedSearchTerm, columns]);

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
          <Button onClick={onAdd} className="w-full sm:w-auto cursor-pointer">
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
          disabled={loading}
        />
      </div>

      <div className="border rounded-xl overflow-hidden shadow-sm bg-card">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50 hover:bg-muted/50">
                {columns.map((column) => (
                  <TableHead key={column.key as string} className="whitespace-nowrap font-semibold">
                    {column.label}
                  </TableHead>
                ))}
                {hasActions && <TableHead className="w-[120px] whitespace-nowrap font-semibold">Acciones</TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                // ESTADO DE CARGA
                <TableRow className="hover:bg-transparent">
                  <TableCell colSpan={columns.length + (hasActions ? 1 : 0)} className="text-center py-12">
                    <div className="flex flex-col items-center gap-3">
                      <Loader2 className="h-8 w-8 text-primary animate-spin" />
                      <p className="text-muted-foreground font-medium">
                        Cargando personas...
                      </p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : filteredData.length === 0 ? (
                <TableRow className="hover:bg-transparent">
                  <TableCell colSpan={columns.length + (hasActions ? 1 : 0)} className="text-center py-12">
                    <div className="flex flex-col items-center gap-2">
                      <Search className="h-8 w-8 text-muted-foreground/50" />
                      <p className="text-muted-foreground font-medium">
                        {debouncedSearchTerm ? 'No se encontraron resultados' : 'No hay registros disponibles'}
                      </p>
                      {debouncedSearchTerm && (
                        <p className="text-sm text-muted-foreground/70">
                          Intenta con otros términos de búsqueda
                        </p>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                // DATOS CARGADOS
                filteredData.map((item, index) => (
                  <TableRow key={item.ID_PERSONA || index} className="hover:bg-muted/30 transition-colors">
                    {columns.map((column) => {
                      const value = getNestedValue(item, column.key as string);
                      const isEmpty = value === undefined || value === null || value === '';

                      return (
                        <TableCell key={column.key as string} className="whitespace-nowrap">
                          {column.render ? (
                            (column.render as CallSiteRenderer<T>)(value, item)
                          ) : isEmpty ? (
                            <span className="text-muted-foreground/70 italic text-sm">Sin información</span>
                          ) : (
                            <span className="text-foreground block truncate max-w-[225px]" title={String(value)}>{String(value)}</span>
                          )}
                        </TableCell>
                      )
                    })}
                    {hasActions && (
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm" className="hover:bg-muted">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-40">
                            {onViewDetail && (
                              <DropdownMenuItem onClick={() => onViewDetail(item)} className="cursor-pointer">
                                <Eye className="h-4 w-4 mr-2" />
                                Ver Detalle
                              </DropdownMenuItem>
                            )}
                            {onEdit && (
                              <DropdownMenuItem onClick={() => onEdit(item)} className="cursor-pointer">
                                <Edit className="h-4 w-4 mr-2" />
                                Editar
                              </DropdownMenuItem>
                            )}
                            {onDelete && (
                              <DropdownMenuItem 
                                onClick={() => handleDeleteClick(item)} 
                                className="text-destructive cursor-pointer focus:text-destructive focus:bg-destructive/10"
                              >
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
            <AlertDialogTitle>Confirmar inactivación</AlertDialogTitle>
            <AlertDialogDescription>
              ¿Estás seguro de que deseas inactivar este registro? Esta acción no se puede deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="dark:text-foreground dark:hover:border-foreground/30 cursor-pointer">Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmDelete} className="bg-destructive hover:bg-destructive cursor-pointer">
              Inactivar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
