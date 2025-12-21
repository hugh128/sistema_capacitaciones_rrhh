"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Search, Plus, Edit, Trash2, MoreHorizontal, Key as KeyIcon, Loader2 } from "lucide-react"
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

interface Column {
  key: string
  label: string
  render?: (value: any, row: any) => React.ReactNode
}

interface DataTableProps {
  title: string
  data: any[]
  columns: Column[]
  onAdd?: () => void
  onEdit?: (item: any) => void
  onDelete?: (item: any) => void
  onPasswordChange?: (item: any) => void
  searchPlaceholder?: string
  loading?: boolean
}

function getNestedValue(obj: any, path: string): any {
  if (!path.includes(".")) return obj[path]
  const parts = path.split(".")
  let current = obj
  for (const part of parts) {
    if (current == null) return undefined
    current = current[part]
  }
  return current
}

export function UsuarioDataTable({
  title,
  data,
  columns,
  onAdd,
  onEdit,
  onDelete,
  onPasswordChange,
  searchPlaceholder = "Buscar...",
  loading = false,
}: DataTableProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [showDialog, setShowDialog] = useState(false)
  const [itemToDelete, setItemToDelete] = useState<any>(null)

  const filteredData = data.filter((item) => {
    return columns.some((column) => {
      const value = getNestedValue(item, column.key)
      if (value == null) return false

      const term = searchTerm.toLowerCase()

      if (Array.isArray(value)) {
        return value
          .map((v) => JSON.stringify(v).toLowerCase())
          .some((v) => v.includes(term))
      }

      if (typeof value === "object") {
        return JSON.stringify(value).toLowerCase().includes(term)
      }

      return String(value).toLowerCase().includes(term)
    })
  })

  const handleDeleteClick = (item: any) => {
    setItemToDelete(item)
    setShowDialog(true)
  }

  const handleConfirmDelete = () => {
    if (itemToDelete && onDelete) onDelete(itemToDelete)
    setShowDialog(false)
    setItemToDelete(null)
  }

  const hasActions = onEdit || onDelete || onPasswordChange

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
                  <TableHead key={column.key} className="whitespace-nowrap font-semibold">
                    {column.label}
                  </TableHead>
                ))}
                {hasActions && (
                  <TableHead className="w-[120px] whitespace-nowrap font-semibold">Acciones</TableHead>
                )}
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
                        Cargando usuarios...
                      </p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : filteredData.length === 0 ? (
                // NO HAY DATOS
                <TableRow className="hover:bg-transparent">
                  <TableCell colSpan={columns.length + (hasActions ? 1 : 0)} className="text-center py-12">
                    <div className="flex flex-col items-center gap-2">
                      <Search className="h-8 w-8 text-muted-foreground/50" />
                      <p className="text-muted-foreground font-medium">
                        {searchTerm ? 'No se encontraron resultados' : 'No hay registros disponibles'}
                      </p>
                      {searchTerm && (
                        <p className="text-sm text-muted-foreground/70">
                          Intenta con otros términos de búsqueda
                        </p>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                // DATOS CARGADOS
                filteredData.map((item, index) => {
                  const isAdmin = item.USERNAME === 'admin';

                  return (
                    <TableRow 
                      key={item.id || index} 
                      className={`transition-colors ${isAdmin ? "bg-muted/10" : "hover:bg-muted/30"}`}
                    >
                      {columns.map((column) => {
                        const value = getNestedValue(item, column.key);
                        return (
                          <TableCell key={column.key} className="whitespace-nowrap">
                            {column.render ? (
                              column.render(value, item)
                            ) : (
                              <span className={isAdmin ? "font-medium" : ""}>
                                {value ?? "N/A"}
                              </span>
                            )}
                          </TableCell>
                        );
                      })}

                      {hasActions && (
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm" className="hover:bg-muted cursor-pointer">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-52">
                              
                              {onEdit && (
                                <DropdownMenuItem 
                                  onClick={() => !isAdmin && onEdit(item)} 
                                  disabled={isAdmin}
                                  className={`cursor-pointer ${isAdmin ? "opacity-50" : ""}`}
                                >
                                  <Edit className="h-4 w-4 mr-2" />
                                  <div className="flex flex-col">
                                    <span>Editar</span>
                                    {isAdmin && <span className="text-[10px] text-muted-foreground">Sistema Protegido</span>}
                                  </div>
                                </DropdownMenuItem>
                              )}

                              {onPasswordChange && (
                                <DropdownMenuItem 
                                  onClick={() => onPasswordChange(item)} 
                                  className="cursor-pointer"
                                >
                                  <KeyIcon className="h-4 w-4 mr-2" />
                                  Cambiar Contraseña
                                </DropdownMenuItem>
                              )}

                              {onDelete && (
                                <DropdownMenuItem
                                  onClick={() => !isAdmin && handleDeleteClick(item)}
                                  disabled={isAdmin}
                                  className={`cursor-pointer ${
                                    isAdmin 
                                      ? "opacity-50" 
                                      : "text-destructive focus:text-destructive focus:bg-destructive/10"
                                  }`}
                                >
                                  <Trash2 className="h-4 w-4 mr-2" />
                                  <div className="flex flex-col">
                                    <span>Inactivar</span>
                                    {isAdmin && <span className="text-[10px] text-muted-foreground">No se puede eliminar</span>}
                                  </div>
                                </DropdownMenuItem>
                              )}

                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      )}
                    </TableRow>
                  );
                })
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
            <AlertDialogCancel className="dark:text-foreground dark:hover:border-foreground/30 cursor-pointer">
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              className="bg-destructive hover:bg-destructive cursor-pointer"
            >
              Inactivar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
