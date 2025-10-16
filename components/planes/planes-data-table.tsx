"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Search, Plus, Edit, Trash2, MoreHorizontal, Eye } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

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
  searchPlaceholder?: string
}

export function PlanesDataTable({
  title,
  data,
  columns,
  onAdd,
  onEdit,
  onDelete,
  searchPlaceholder = "Buscar...",
}: DataTableProps) {
  const [searchTerm, setSearchTerm] = useState("")

  const filteredData = data.filter((item) =>
    Object.values(item).some((value) => String(value).toLowerCase().includes(searchTerm.toLowerCase())),
  )

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h2 className="text-xl sm:text-2xl font-bold">{title}</h2>
        {onAdd && (
          <Button onClick={onAdd} className="w-full sm:w-auto">
            <Plus className="h-4 w-4 mr-2" />
            Agregar
          </Button>
        )}
      </div>

      {/* Search */}
      <div className="relative w-full sm:max-w-sm">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
        <Input
          placeholder={searchPlaceholder}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Table */}
      <div className="border rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                {columns.map((column) => (
                  <TableHead key={column.key} className="whitespace-nowrap">
                    {column.label}
                  </TableHead>
                ))}
                {(onEdit || onDelete) && <TableHead className="w-[100px] whitespace-nowrap">Acciones</TableHead>}
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
                  <TableRow key={item.id || index}>
                    {columns.map((column) => (
                      <TableCell key={column.key} className="whitespace-nowrap">
                        {column.render ? column.render(item[column.key], item) : item[column.key]}
                      </TableCell>
                    ))}
                    {(onEdit || onDelete) && (
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            {onEdit && (
                              <DropdownMenuItem onClick={() => onEdit(item)}>
                                <Eye className="w-4 h-4 mr-2" />
                                  Ver Detalles
                              </DropdownMenuItem>
                            )}
                            {onDelete && (
                              <DropdownMenuItem onClick={() => onDelete(item)} className="text-destructive">
                                <Trash2 className="h-4 w-4 mr-2" />
                                Eliminar
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
    </div>
  )
}
